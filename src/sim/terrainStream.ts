// Runtime terrain streaming: real elevation beyond the baked home box.
//
// The home box is baked into the bundle because the flight model asks for
// heights synchronously, thousands of times a second. Outside it the same data
// arrives at runtime: 256-pixel DEM tiles fetched on demand, decoded and cached,
// so a pilot can leave the box and keep finding real ground.
//
// Source: Esri "WorldElevation3D/Terrain3D" — free, no key, and the only free
// elevation service found that sends CORS headers (the Mapzen terrarium bucket
// used by the bake does not, so a page cannot read its pixels). Tiles are
// LERC-compressed float32 metres, decoded with Esri's Apache-2.0 `lerc` wasm.
//
// Positions are absolute metres in the sim's flat XZ frame, mapped to lat/lon by
// a local equirectangular projection around the home site. That is accurate over
// a few hundred kilometres and degrades beyond it; a true round-the-world flight
// needs a floating origin, which is the next stage.

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

const M_PER_DEG_LAT = 110574;

// The mapping's anchor. Home is Niihau, where the baked box and the fleet live.
// A sortie that starts elsewhere re-anchors it on that region, so the aircraft
// begins at the world origin instead of tens of thousands of kilometres out,
// where float32 metres would quantise to several metres and the view would
// shimmer. It is a per-sortie origin, not a floating one: fly a few thousand
// kilometres from the anchor and the same limit comes back.
let datumLat: number = EARTH_TERRAIN.centerLat;
let datumLon: number = EARTH_TERRAIN.centerLon;
let mPerDegLon = 111320 * Math.cos((datumLat * Math.PI) / 180);

/** Anchor the world frame on a place. See the note above. */
export function setTerrainDatum(lat: number, lon: number): void {
  datumLat = lat;
  datumLon = lon;
  mPerDegLon = 111320 * Math.cos((lat * Math.PI) / 180);
}

/** Back to the baked home box, where the fleet and the runway are. */
export function resetTerrainDatum(): void {
  setTerrainDatum(EARTH_TERRAIN.centerLat, EARTH_TERRAIN.centerLon);
}

/** True when the frame is anchored on the home box. */
export function isHomeDatum(): boolean {
  return datumLat === EARTH_TERRAIN.centerLat && datumLon === EARTH_TERRAIN.centerLon;
}

export function worldToLatLon(x: number, z: number): { lat: number; lon: number } {
  return { lat: datumLat - z / M_PER_DEG_LAT, lon: datumLon + x / mPerDegLon };
}

export function latLonToWorld(lat: number, lon: number): { x: number; z: number } {
  return { x: (lon - datumLon) * mPerDegLon, z: (datumLat - lat) * M_PER_DEG_LAT };
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

/** Insertion order is recency order: the head is the coldest tile. */
const tiles = new Map<string, DemTile>();
const inflight = new Map<string, AbortController>();
const queued = new Set<string>();
/** Failed tiles, with a backoff clock, so a flaky link is retried not abandoned. */
const retry = new Map<string, { attempts: number; nextAt: number }>();

let decoderReady: Promise<void> | null = null;
let queue: Array<{ key: string; tx: number; ty: number }> = [];
let active = 0;

const MAX_ACTIVE = 6;
/** Plenty for the drawn ring (81 tiles) plus the corridor ahead and history. */
const MAX_TILES = 640;
const MAX_ATTEMPTS = 4;
const FETCH_TIMEOUT_MS = 15000;
const EMPTY_TILE_BYTES = 64;

const keyOf = (tx: number, ty: number): string => `${DEM_ZOOM}/${tx}/${ty}`;

function ensureDecoder(): Promise<void> {
  if (!decoderReady) {
    decoderReady = (async () => {
      // Loaded lazily and from a bundler-only module: node/bun diagnostics
      // import this file without ever needing the wasm.
      const wasm = (await import("./lercWasm")).default;
      await load({ locateFile: () => wasm });
    })().catch((err: unknown) => {
      // A failed decode setup must not poison every later tile: clear it so the
      // next request tries again.
      decoderReady = null;
      throw err;
    });
  }
  return decoderReady;
}

/** Mark a tile as most recently used, so eviction takes the coldest first. */
function touch(key: string): void {
  const tile = tiles.get(key);
  if (!tile) return;
  tiles.delete(key);
  tiles.set(key, tile);
}

function store(key: string, heights: Float32Array): void {
  tiles.delete(key);
  tiles.set(key, { heights });
  retry.delete(key);
  while (tiles.size > MAX_TILES) {
    const oldest = tiles.keys().next().value;
    if (oldest === undefined) break;
    tiles.delete(oldest);
  }
}

async function fetchTile(tx: number, ty: number): Promise<void> {
  const key = keyOf(tx, ty);
  if (tiles.has(key) || inflight.has(key)) return;

  const controller = new AbortController();
  inflight.set(key, controller);
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    await ensureDecoder();
    const res = await fetch(TILE_URL(tx, ty), { signal: controller.signal });
    if (!res.ok) throw new Error(`dem ${key} -> ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength <= EMPTY_TILE_BYTES) {
      // The service returns a stub for open ocean.
      store(key, new Float32Array(PX * PX));
      return;
    }
    const out = decode(buf);
    const src = out.pixels?.[0] as Float32Array | undefined;
    if (!src || out.width < 2 || out.height < 2 || src.length < out.width * out.height) {
      throw new Error(`dem ${key} decoded empty`);
    }
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
    // A NaN in the source would propagate into the mesh and the flight model.
    for (let i = 0; i < heights.length; i++) if (!Number.isFinite(heights[i])) heights[i] = 0;
    store(key, heights);
  } catch {
    const previous = retry.get(key)?.attempts ?? 0;
    const attempts = previous + 1;
    // 1 s, 2 s, 4 s: a lost packet costs a moment, not the tile.
    retry.set(key, { attempts, nextAt: performance.now() + 1000 * 2 ** previous });
  } finally {
    clearTimeout(timer);
    inflight.delete(key);
    queued.delete(key);
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

/**
 * Ask for a tile now. Cheap and idempotent: the renderer calls this for every
 * tile in its ring on every refresh, and only the missing ones do anything.
 */
export function ensureTile(tx: number, ty: number): void {
  const key = keyOf(tx, ty);
  if (tiles.has(key)) {
    touch(key);
    return;
  }
  if (inflight.has(key) || queued.has(key)) return;
  const failed = retry.get(key);
  if (failed && (failed.attempts >= MAX_ATTEMPTS || performance.now() < failed.nextAt)) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  queued.add(key);
  queue.push({ key, tx, ty });
  pump();
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
  const key = keyOf(tx, ty);
  const tile = tiles.get(key);
  if (!tile) return null;
  const r = tileRect(tx, ty);
  const fx = ((x - r.west) / r.widthM) * TILE_PX;
  const fz = ((z - r.north) / r.heightM) * TILE_PX;
  if (!(fx >= 0 && fz >= 0 && fx <= TILE_PX && fz <= TILE_PX)) return null;
  const x0 = Math.min(PX - 1, Math.floor(fx));
  const z0 = Math.min(PX - 1, Math.floor(fz));
  const x1 = Math.min(PX - 1, x0 + 1);
  const z1 = Math.min(PX - 1, z0 + 1);
  const tx0 = Math.min(1, Math.max(0, fx - x0));
  const tz0 = Math.min(1, Math.max(0, fz - z0));
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

/** Drop queued work and in-flight requests, e.g. when the world switches back. */
export function clearStream(): void {
  queue = [];
  queued.clear();
  for (const controller of inflight.values()) controller.abort();
  inflight.clear();
  active = 0;
}
