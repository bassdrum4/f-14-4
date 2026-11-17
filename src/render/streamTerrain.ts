// Streamed terrain meshes around the aircraft.
//
// The baked home box is one mesh built at startup. Outside it, ground is drawn
// from the runtime DEM tiles: one chunk per tile, built when its heights arrive
// and dropped when the pilot has flown away. A tile is ~9 km across, so the
// drawn ring is about 36 km — roughly where the scene fog closes, which is why
// the ring does not need to reach further.
//
// Chunks never cover the baked box: a cell whose centre lies inside it is left
// out of the geometry, so the two meshes meet at the 30 km boundary instead of
// fighting over the same ground.

import * as THREE from "three";
import { EXTENT } from "../sim/world";
import {
  DEM_ZOOM,
  TILE_PX,
  decodedHeights,
  ensureTile,
  imageryTileUrl,
  isHomeDatum,
  tileAt,
  tileRect,
} from "../sim/terrainStream";

/** Tiles drawn in every direction from the aircraft's tile. */
const RADIUS = 4;
/** Quads per chunk edge (~285 m cells). */
const SEGMENTS = 32;
/** How often the ring is re-evaluated, in milliseconds. */
const REFRESH_MS = 250;
/** Meshes built per refresh, so a burst of arriving tiles cannot stall a frame. */
const BUILDS_PER_REFRESH = 2;
/** Metres the streamed ground sits below the baked box at the shared edge. */
const SEAM_SINK_M = 1.2;
/**
 * Cells at or below this height are left to the sea.
 *
 * The elevation service carries no bathymetry: open ocean comes back as
 * exactly 0 m. Drawn as terrain, that is a flat sheet coplanar with the sim's
 * sea — it z-fights with it and shows the photo's water colour under a hard
 * chunk edge instead of the sea. Dropping everything under the waterline means
 * the ring only ever draws land, and the sea stays the sim's own.
 */
const SEA_LEVEL_M = 0.35;
/** Seconds of travel the ring is biased toward, so tiles are waiting ahead. */
const LOOKAHEAD_S = 20;

const PX = TILE_PX + 1;

const keyOf = (tx: number, ty: number): string => `${DEM_ZOOM}/${tx}/${ty}`;

export class StreamedTerrain {
  readonly group = new THREE.Group();
  private meshes = new Map<string, THREE.Mesh>();
  private lastRefresh = 0;
  private lastFocus = new THREE.Vector3();
  private velocity = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.group.name = "streamed-terrain";
    scene.add(this.group);
  }

  /** Call every frame; cheap unless the refresh interval has elapsed. */
  update(focus: THREE.Vector3): void {
    const now = performance.now();
    if (now - this.lastRefresh < REFRESH_MS) return;
    const dt = (now - this.lastRefresh) / 1000;
    this.lastRefresh = now;

    // Smoothed track, used only to bias which tiles are asked for first.
    if (dt > 0 && dt < 2) {
      this.velocity
        .subVectors(focus, this.lastFocus)
        .multiplyScalar(1 / dt)
        .clampLength(0, 400)
        .lerp(this.velocity, 0.35);
    }
    this.lastFocus.copy(focus);
    const ahead = this.lastFocus.clone().addScaledVector(this.velocity, LOOKAHEAD_S);

    const { tx, ty } = tileAt(focus.x, focus.z);
    const aheadTile = tileAt(ahead.x, ahead.z);

    // Corridor first: the ground the aircraft is about to reach.
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const cx = aheadTile.tx + dx;
        const cy = aheadTile.ty + dy;
        if (this.insideBox(cx, cy)) continue;
        ensureTile(cx, cy);
      }
    }

    let built = 0;
    for (let dy = -RADIUS; dy <= RADIUS; dy++) {
      for (let dx = -RADIUS; dx <= RADIUS; dx++) {
        if (dx * dx + dy * dy > RADIUS * RADIUS + RADIUS) continue;
        const cx = tx + dx;
        const cy = ty + dy;
        // The baked box is already drawn at full detail: never fetch or build
        // a tile that lies entirely inside it.
        if (this.insideBox(cx, cy)) continue;
        const key = keyOf(cx, cy);
        if (this.meshes.has(key)) continue;
        ensureTile(cx, cy);
        if (built >= BUILDS_PER_REFRESH) continue;
        if (this.build(cx, cy)) built++;
      }
    }

    this.prune(tx, ty);
  }

  /** True when the tile lies entirely inside the baked home box. */
  private insideBox(tx: number, ty: number): boolean {
    // Anchored on another region there is no baked box drawn at all, so every
    // tile in the ring is needed.
    if (!isHomeDatum()) return false;
    const r = tileRect(tx, ty);
    return (
      r.west > -EXTENT + 1 &&
      r.west + r.widthM < EXTENT - 1 &&
      r.north > -EXTENT + 1 &&
      r.north + r.heightM < EXTENT - 1
    );
  }

  private build(tx: number, ty: number): boolean {
    const heights = decodedHeights(tx, ty);
    if (!heights) return false;

    const rect = tileRect(tx, ty);
    const home = isHomeDatum();
    const cellW = rect.widthM / SEGMENTS;
    const cellH = rect.heightM / SEGMENTS;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const vertex = new Map<number, number>();
    const stride = SEGMENTS + 1;

    // Node heights first: a cell is only worth drawing if it rises above the
    // sea, and that decision has to be made before any vertex is emitted.
    const nodeH = new Float32Array(stride * stride);
    for (let iz = 0; iz < stride; iz++) {
      for (let ix = 0; ix < stride; ix++) {
        const px = Math.min(PX - 1, Math.round((ix / SEGMENTS) * TILE_PX));
        const pz = Math.min(PX - 1, Math.round((iz / SEGMENTS) * TILE_PX));
        nodeH[iz * stride + ix] = heights[pz * PX + px];
      }
    }

    const at = (ix: number, iz: number): number => {
      const slot = iz * stride + ix;
      const seen = vertex.get(slot);
      if (seen !== undefined) return seen;
      const id = positions.length / 3;
      positions.push(-rect.widthM / 2 + ix * cellW, nodeH[slot], -rect.heightM / 2 + iz * cellH);
      uvs.push(ix / SEGMENTS, 1 - iz / SEGMENTS);
      vertex.set(slot, id);
      return id;
    };

    for (let iz = 0; iz < SEGMENTS; iz++) {
      for (let ix = 0; ix < SEGMENTS; ix++) {
        const h00 = nodeH[iz * stride + ix];
        const h10 = nodeH[iz * stride + ix + 1];
        const h01 = nodeH[(iz + 1) * stride + ix];
        const h11 = nodeH[(iz + 1) * stride + ix + 1];
        // Open water: the sea plane is already there, and a coplanar sheet of
        // it here would only z-fight.
        if (Math.max(h00, h10, h01, h11) <= SEA_LEVEL_M) continue;
        // Cell centre: the box edge falls mid-cell, and that cell is kept.
        if (home) {
          const cx = rect.west + (ix + 0.5) * cellW;
          const cz = rect.north + (iz + 0.5) * cellH;
          if (Math.abs(cx) < EXTENT && Math.abs(cz) < EXTENT) continue;
        }
        const a = at(ix, iz);
        const b = at(ix + 1, iz);
        const c = at(ix, iz + 1);
        const d = at(ix + 1, iz + 1);
        indices.push(a, c, b, b, c, d);
      }
    }
    // Nothing to draw: either entirely inside the baked box, or entirely sea.
    if (indices.length === 0) return true;

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    geom.computeBoundingSphere();

    // The photo arrives later than the heights; the surface starts bare and
    // gains its texture when the JPEG lands.
    const mat = new THREE.MeshStandardMaterial({ color: 0x5c6046, roughness: 1, metalness: 0 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(rect.west + rect.widthM / 2, home ? -SEAM_SINK_M : 0, rect.north + rect.heightM / 2);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    this.group.add(mesh);
    this.meshes.set(keyOf(tx, ty), mesh);

    const url = imageryTileUrl(tx, ty);
    new THREE.TextureLoader()
      .setCrossOrigin("anonymous")
      .load(
        url,
        (tex) => {
          // The mesh may have been pruned while the photo was in flight.
          if (this.meshes.get(keyOf(tx, ty)) !== mesh) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          mat.map = tex;
          mat.color.setRGB(1, 1, 1);
          mat.needsUpdate = true;
        },
        undefined,
        () => {
          /* imagery is optional: the surface keeps its bare colour */
        },
      );
    return true;
  }

  /** Drop chunks that have fallen outside the ring. */
  private prune(cx: number, cy: number): void {
    const limit = (RADIUS + 1) * (RADIUS + 1);
    for (const [key, mesh] of this.meshes) {
      const [, sx, sy] = key.split("/");
      const dx = Number(sx) - cx;
      const dy = Number(sy) - cy;
      if (dx * dx + dy * dy <= limit) continue;
      this.drop(mesh);
      this.meshes.delete(key);
    }
  }

  private drop(mesh: THREE.Mesh): void {
    this.group.remove(mesh);
    mesh.geometry.dispose();
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.map?.dispose();
    mat.dispose();
  }

  dispose(): void {
    for (const mesh of this.meshes.values()) this.drop(mesh);
    this.meshes.clear();
    this.group.removeFromParent();
  }
}
