// Streamed terrain meshes around the aircraft.
//
// The baked home box is one mesh built at startup. Outside it, ground is drawn
// from the runtime DEM tiles instead: one mesh per tile, built when its heights
// arrive and dropped when the pilot has flown away. A tile is ~9 km across, so
// the drawn ring is about 36 km — roughly where the scene fog closes, which is
// why the ring does not need to reach further.

import * as THREE from "three";
import { EXTENT } from "../sim/world";
import {
  DEM_ZOOM,
  TILE_PX,
  decodedHeights,
  ensureTile,
  imageryTileUrl,
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
/** Metres the streamed ground sits below the baked box, to avoid z-fighting. */
const SEAM_SINK_M = 1.2;

const PX = TILE_PX + 1;

const keyOf = (tx: number, ty: number): string => `${DEM_ZOOM}/${tx}/${ty}`;

export class StreamedTerrain {
  readonly group = new THREE.Group();
  private meshes = new Map<string, THREE.Mesh>();
  private lastRefresh = 0;

  constructor(scene: THREE.Scene) {
    this.group.name = "streamed-terrain";
    scene.add(this.group);
  }

  /** Call every frame; cheap unless the refresh interval has elapsed. */
  update(focus: THREE.Vector3): void {
    const now = performance.now();
    if (now - this.lastRefresh < REFRESH_MS) return;
    this.lastRefresh = now;

    const { tx, ty } = tileAt(focus.x, focus.z);

    let built = 0;
    for (let dy = -RADIUS; dy <= RADIUS; dy++) {
      for (let dx = -RADIUS; dx <= RADIUS; dx++) {
        if (dx * dx + dy * dy > RADIUS * RADIUS + RADIUS) continue;
        const cx = tx + dx;
        const cy = ty + dy;
        // The baked box is already drawn at full detail: never fetch or build
        // a tile that lies entirely inside it.
        if (this.outsideBox(cx, cy).skip) continue;
        const key = keyOf(cx, cy);
        if (this.meshes.has(key)) continue;
        ensureTile(cx, cy);
        if (built >= BUILDS_PER_REFRESH) continue;
        if (this.build(cx, cy)) built++;
      }
    }

    this.prune(tx, ty);
  }

  /** True when the tile is well clear of the baked home box. */
  private outsideBox(tx: number, ty: number): { skip: boolean } {
    const r = tileRect(tx, ty);
    const fullyInside =
      r.west > -EXTENT && r.west + r.widthM < EXTENT && r.north > -EXTENT && r.north + r.heightM < EXTENT;
    return { skip: fullyInside };
  }

  private build(tx: number, ty: number): boolean {
    if (this.outsideBox(tx, ty).skip) return false;
    const heights = decodedHeights(tx, ty);
    if (!heights) return false;

    const rect = tileRect(tx, ty);
    const geom = new THREE.PlaneGeometry(rect.widthM, rect.heightM, SEGMENTS, SEGMENTS);
    geom.rotateX(-Math.PI / 2);
    const pos = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const px = (pos.getX(i) / rect.widthM + 0.5) * TILE_PX;
      const pz = (pos.getZ(i) / rect.heightM + 0.5) * TILE_PX;
      const ix = Math.max(0, Math.min(PX - 1, Math.round(px)));
      const iz = Math.max(0, Math.min(PX - 1, Math.round(pz)));
      pos.setY(i, heights[iz * PX + ix]);
    }
    geom.computeVertexNormals();

    // The photo arrives later than the heights; the surface starts bare and
    // gains its texture when the JPEG lands.
    const mat = new THREE.MeshStandardMaterial({ color: 0x5c6046, roughness: 1, metalness: 0 });
    const mesh = new THREE.Mesh(geom, mat);
    // Tiles that straddle the home box overlap the baked mesh, and the two
    // sources disagree by a few metres. Sinking the streamed copy a touch means
    // the baked ground wins the depth test at the seam instead of flickering.
    mesh.position.set(rect.west + rect.widthM / 2, -SEAM_SINK_M, rect.north + rect.heightM / 2);
    mesh.receiveShadow = false;
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
      this.group.remove(mesh);
      mesh.geometry.dispose();
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.map?.dispose();
      mat.dispose();
      this.meshes.delete(key);
    }
  }

  dispose(): void {
    for (const mesh of this.meshes.values()) {
      mesh.geometry.dispose();
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.map?.dispose();
      mat.dispose();
    }
    this.meshes.clear();
    this.group.removeFromParent();
  }
}
