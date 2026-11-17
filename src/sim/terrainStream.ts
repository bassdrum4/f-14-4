// Runtime terrain streaming: real elevation beyond the baked home box.
//
// The home box (Niihau, 60 km) is baked into the bundle because its heights are
// queried synchronously by the flight model. This module extends that idea to
// the rest of the world: 256-pixel DEM tiles fetched as needed and cached, so a
// pilot can fly out of the box and keep finding real ground.
//
// Source: Esri "WorldElevation3D/Terrain3D" image service — free, no key, and
// the only free elevation service found that sends CORS headers (the Mapzen
// terraform bucket does not, so the browser cannot read its pixels). Tiles are
// LERC-compressed float32 metres, decoded with Esri's Apache-2.0 `lerc` wasm.
//
// Positions are still absolute metres in the sim's flat XZ frame, mapped to
// lat/lon by a local equirectangular projection around the home site. That is
// accurate over a few hundred kilometres and degrades beyond it; a true global
// flight needs a floating origin, which is the next stage.

import { decode, load } from "lerc";
import { EARTH_TERRAIN } from "./terrain/niihau";

export const DEM_ZOOM = 12;
/** Esri returns 256+1 pixels per tile: the extra row/column is the shared edge. */
export const TILE_PX = 256;
const PX = TILE_PX + 1;

const TILE_URL = (x: number, y: number): string =>
  `https://server.arcgisonline.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer/tile/${DEM_ZOOM}/${y}/${x}?blankTile=false`;

/** Same tile grid for the photo, which does send CORS. */
export const imageryTileUrl = (x: number, y: number): string =>
  `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/${DEM_ZOOM}/${y}/${x}.jpg`;

const lat0 = EARTH_TERRAIN.centerLat;
const lon0 = EARTH_TERRAIN.centerLon;
const M_PER_DEG_LAT = 110574;
const M_PER_DEG_LON = 111320 * Math.cos((lat0 * Math.PI) / 180);

export function worldToLatLon(x: number, z: number): { lat: number; lon: number } {
  return { lat: lat0 - z / M_PER_DEG_LAT, lon: lon0 + x / M_PER_DEG_LON };
}

export function latLonToWorld(lat: number, lon: number): { x: number; z: number } {
  return { x: (lon - lon0) * M_PER_DEG_LON, z: (lat0 - lat) * M_PER_DEG_LAT };
}

const mercY = (lat: number): number => {
  const r = (lat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2;
};

const invMercY = (v: number): number => (Math.atan(Math.sinh(Math.PI * (1 - 2 * v))) * 180) / Math.PI;

export interface TileRect {
  tx: number;
  ty: number;
  west: number; // world metres
  north: number;
  widthM: number;
  heightM: number;
}

/** World-space rectangle covered by a DEM tile. */
export function tileRect(tx: number, ty: number): TileRect {
  const n = 1 << DEM_ZOOM;
  const west = latLonToWorld(0, (tx / n) * 360 - 180).x;
  const east = latLonToWorld(0, ((tx + 1) / n) * 360 - 180).x;
  const north = latLonToWorld(invMercY(ty / n), 0).z;
  const south = latLonToWorld(invMercY((ty + 1) / n), 0).z;
  return { tx, ty, west, north, widthM: east - west, heightM: south - north };
}

export function tileAt(x: number, z: number): { tx: number; ty: number } {
  const { lat, lon } = worldToLatLon(x, z);
  const n = 1 << DEM_ZOOM;
  return {
    tx: Math.floor(((lon + 180) / 360) * n),
    ty: Math.floor(mercY(lat) * n),
  };
}

interface DemTile {
  /** (256+1)^2 float32 metres, row-major from the north-west corner. */
  heights: Float32Array;
}

const tiles = new Map<string, DemTile>();
const inflight = new Set<string>();
const failed = new Set<string>();
let decoderReady: Promise<void> | null = null;
let queue: Array<{ key: string; tx: number; ty: number }> = [];
let active = 0;
const MAX_ACTIVE = 6;
const MAX_TILES = 512;

const keyOf = (tx: number, ty: number): string => `${DEM_ZOOM}/${tx}/${ty}`;

function ensureDecoder(): Promise<void> {
  if (!decoderReady) {
    decoderReady = (async () => {
      // Loaded lazily and by a bundler-only module: node/bun diagnostics import
      // this file without ever needing the wasm.
      const wasm = (await import("./lercWasm")).default;
      await load({ locateFile: () => wasm });
    })();
  }
  return decoderReady;
}

async function fetchTile(tx: number, ty: number): Promise<void> {
  const key = keyOf(tx, ty);
  if (tiles.has(key) || inflight.has(key) || failed.has(key)) return;
  inflight.add(key);
  try {
    await ensureDecoder();
    const res = await fetch(TILE_URL(tx, ty));
    if (!res.ok) throw new Error(`dem ${key} -> ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength <= 64) {
      // An empty tile: open ocean, which the service returns as a stub.
      tiles.set(key, { heights: new Float32Array(PX * PX) });
      return;
    }
    const out = decode(buf);
    const src = out.pixels[0] as Float32Array;
    const heights = new Float32Array(PX * PX);
    if (out.width === PX && out.height === PX) {
      heights.set(src);
    } else {
      // Any other shape (older service version): nearest-sample into our grid.
      for (let y = 0; y < PX; y++) {
        const sy = Math.min(out.height - 1, Math.round((y / TILE_PX) * (out.height - 1)));
        for (let x = 0; x < PX; x++) {
          const sx = Math.min(out.width - 1, Math.round((x / TILE_PX) * (out.width - 1)));
          heights[y * PX + x] = src[sy * out.width + sx];
        }
      }
    }
    tiles.set(key, { heights });
    if (tiles.size > MAX_TILES) {
      const oldest = tiles.keys().next().value;
      if (oldest !== undefined) tiles.delete(oldest);
    }
  } catch {
    failed.add(key);
  } finally {
    inflight.delete(key);
  }
}

function pump(): void {
  while (active < MAX_ACTIVE && queue.length > 0) {
    const next = queue.shift()!;
    active++;
    void fetchTile(next.tx, next.ty).finally(() => {
      active--;
      pump();
    });
  }
}

/** Ask for a tile now; it lands in the cache when the fetch finishes. */
export function ensureTile(tx: number, ty: number): void {
  const key = keyOf(tx, ty);
  if (tiles.has(key) || inflight.has(key) || failed.has(key)) return;
  if (queue.some((q) => q.key === key)) return;
  queue.push({ key, tx, ty });
  pump();
}

/** Drop queued work, e.g. when the world switches back to the procedural chain. */
export function clearStreamQueue(): void {
  queue = [];
}

export function isTileReady(tx: number, ty: number): boolean {
  return tiles.has(keyOf(tx, ty));
}

/**
 * Real elevation at a world point, or null when that tile has not arrived yet.
 * Null is deliberate: the caller decides what an unknown patch should be, and
 * the flight model treats it as open water until the tile lands.
 */
export function streamHeightAt(x: number, z: number): number | null {
  const { tx, ty } = tileAt(x, z);
  const tile = tiles.get(keyOf(tx, ty));
  if (!tile) return null;
  const r = tileRect(tx, ty);
  const fx = ((x - r.west) / r.widthM) * TILE_PX;
  const fz = ((z - r.north) / r.heightM) * TILE_PX;
  const x0 = Math.max(0, Math.min(PX - 1, Math.floor(fx)));
  const z0 = Math.max(0, Math.min(PX - 1, Math.floor(fz)));
  const x1 = Math.min(PX - 1, x0 + 1);
  const z1 = Math.min(PX - 1, z0 + 1);
  const tx0 = Math.max(0, Math.min(1, fx - x0));
  const tz0 = Math.max(0, Math.min(1, fz - z0));
  const h = tile.heights;
  const a = h[z0 * PX + x0];
  const b = h[z0 * PX + x1];
  const c = h[z1 * PX + x0];
  const d = h[z1 * PX + x1];
  return (a * (1 - tx0) + b * tx0) * (1 - tz0) + (c * (1 - tx0) + d * tx0) * tz0;
}

/** Raw decoded tile, for the renderer that builds a mesh from it. */
export function decodedHeights(tx: number, ty: number): Float32Array | null {
  return tiles.get(keyOf(tx, ty))?.heights ?? null;
}

/**
 * Keep the tiles around a point queued. `radius` is in tiles; the renderer uses
 * the same number so what it draws is what the flight model can feel.
 */
export function prefetchAround(x: number, z: number, radius: number): void {
  const { tx, ty } = tileAt(x, z);
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > radius * radius + radius) continue;
      ensureTile(tx + dx, ty + dy);
    }
  }
}
