// Mapbox terrain pipeline: real-world elevation (terrain-RGB DEM tiles) and
// satellite imagery fetched and decoded in the browser with a public access
// token. Pure data + fetch — no THREE and no DOM except the imagery canvas.
//
// World conventions (shared with sim/world.ts): +X = east, +Z = south,
// metre-accurate scale around the region centre (Mercator stretched by
// 1/cos(lat) to keep local distances and speeds honest).

import { decodePng } from "./png";

export interface MapboxRegion {
  id: string;
  label: string;
  attribution: string;
  centerLon: number;
  centerLat: number;
  zoom: number; // terrain-RGB zoom
  satelliteZoom: number; // imagery zoom
  radiusMeters: number; // square coverage half-size around the centre
}

/**
 * The region the sim flies when real terrain is on: south Kauai, Hawaii.
 * Fitted against live DEM data (see scripts/worldfit.ts) so the airfield sits
 * on the Koloa coastal plain and every carrier anchorage is open water with
 * at least 2.2 km of land-free clearance and clear sea lanes.
 */
export const KAUAI_REGION: MapboxRegion = {
  id: "kauai",
  label: "Kauai, Hawaii",
  attribution: "Terrain & imagery © Mapbox © OpenStreetMap",
  centerLon: -159.47,
  centerLat: 21.92,
  zoom: 12,
  satelliteZoom: 13,
  radiusMeters: 15000,
};

const WORLD_CIRCUM = 40075016.686; // 2πR, Mercator world width
const R_EARTH = WORLD_CIRCUM / (2 * Math.PI);
const TILE_PX = 256;

export function lonToMercX(lonDeg: number): number {
  return (lonDeg * WORLD_CIRCUM) / 360;
}

export function latToMercY(latDeg: number): number {
  const phi = (latDeg * Math.PI) / 180;
  return R_EARTH * Math.log(Math.tan(Math.PI / 4 + phi / 2));
}

export interface TileGrid {
  z: number;
  tx0: number;
  ty0: number;
  nx: number;
  ny: number;
  widthPx: number;
  heightPx: number;
  /** True metres per pixel (Mercator corrected for latitude). */
  cellSize: number;
  /** World metres of the grid's west edge. */
  worldX0: number;
  /** World metres of the grid's north edge. */
  worldZ0: number;
  worldW: number;
  worldH: number;
}

/** Tile range covering the region's square, plus world-space mapping. */
export function tileGrid(region: MapboxRegion, z: number): TileGrid {
  const k = Math.cos((region.centerLat * Math.PI) / 180);
  const cx = lonToMercX(region.centerLon);
  const cy = latToMercY(region.centerLat);
  const n = 2 ** z;
  const tileSpan = WORLD_CIRCUM / n; // Mercator metres per tile
  const halfMerc = region.radiusMeters / k;

  // Slippy tiles: X grows eastwards from lon -180, Y grows southwards.
  const txWest = (0.5 + (cx - halfMerc) / WORLD_CIRCUM) * n;
  const txEast = (0.5 + (cx + halfMerc) / WORLD_CIRCUM) * n;
  const tyNorth = (0.5 - (cy + halfMerc) / WORLD_CIRCUM) * n;
  const tySouth = (0.5 - (cy - halfMerc) / WORLD_CIRCUM) * n;
  const tx0 = Math.max(0, Math.floor(txWest));
  const tx1 = Math.max(tx0, Math.min(n - 1, Math.ceil(txEast) - 1));
  const ty0 = Math.max(0, Math.floor(tyNorth));
  const ty1 = Math.max(ty0, Math.min(n - 1, Math.ceil(tySouth) - 1));
  const nx = tx1 - tx0 + 1;
  const ny = ty1 - ty0 + 1;
  const widthPx = nx * TILE_PX;
  const heightPx = ny * TILE_PX;
  const cellSize = (tileSpan / TILE_PX) * k;
  const worldX0 = ((tx0 / n - 0.5) * WORLD_CIRCUM - cx) * k;
  const worldZ0 = (cy - WORLD_CIRCUM * (0.5 - ty0 / n)) * k;
  return {
    z, tx0, ty0, nx, ny, widthPx, heightPx, cellSize, worldX0, worldZ0,
    worldW: widthPx * cellSize,
    worldH: heightPx * cellSize,
  };
}

export function terrainTileUrl(_region: MapboxRegion, z: number, x: number, y: number, token: string): string {
  return `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${token}`;
}

export function satelliteTileUrl(_region: MapboxRegion, z: number, x: number, y: number, token: string): string {
  return `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.jpg?access_token=${token}`;
}

export interface Heightfield {
  width: number;
  height: number;
  cellSize: number;
  worldX0: number;
  worldZ0: number;
  heights: Float32Array;
  /** Bilinear elevation sample in world metres (clamped at the edges). */
  sample(x: number, z: number): number;
}

/** Fetch + decode every terrain-RGB tile and stitch one heightfield. */
export async function loadHeightfield(region: MapboxRegion, token: string, z = region.zoom): Promise<Heightfield> {
  const grid = tileGrid(region, z);
  const heights = new Float32Array(grid.widthPx * grid.heightPx);

  const jobs: Promise<void>[] = [];
  for (let ty = 0; ty < grid.ny; ty++) {
    for (let tx = 0; tx < grid.nx; tx++) {
      jobs.push(
        (async () => {
          const tileX = grid.tx0 + tx;
          const tileY = grid.ty0 + ty;
          const res = await fetch(terrainTileUrl(region, z, tileX, tileY, token));
          if (!res.ok) throw new Error(`terrain tile ${z}/${tileX}/${tileY}: HTTP ${res.status}`);
          const png = await decodePng(new Uint8Array(await res.arrayBuffer()));
          if (png.width !== TILE_PX || png.height !== TILE_PX) {
            throw new Error(`terrain tile ${z}/${tileX}/${tileY}: unexpected ${png.width}x${png.height}`);
          }
          for (let py = 0; py < TILE_PX; py++) {
            const row = (ty * TILE_PX + py) * grid.widthPx + tx * TILE_PX;
            for (let px = 0; px < TILE_PX; px++) {
              const si = (py * TILE_PX + px) * 4;
              heights[row + px] =
                -10000 + (png.data[si] * 65536 + png.data[si + 1] * 256 + png.data[si + 2]) * 0.1;
            }
          }
        })(),
      );
    }
  }
  await Promise.all(jobs);

  const { cellSize, worldX0, worldZ0 } = grid;
  const width = grid.widthPx;
  const height = grid.heightPx;
  const sample = (x: number, zc: number): number => {
    const fi = Math.max(0, Math.min(width - 1, (x - worldX0) / cellSize - 0.5));
    const fj = Math.max(0, Math.min(height - 1, (zc - worldZ0) / cellSize - 0.5));
    const i0 = Math.floor(fi);
    const j0 = Math.floor(fj);
    const i1 = Math.min(i0 + 1, width - 1);
    const j1 = Math.min(j0 + 1, height - 1);
    const ti = fi - i0;
    const tj = fj - j0;
    const top = heights[j0 * width + i0] * (1 - ti) + heights[j0 * width + i1] * ti;
    const bot = heights[j1 * width + i0] * (1 - ti) + heights[j1 * width + i1] * ti;
    return top * (1 - tj) + bot * tj;
  };

  return { width, height, cellSize, worldX0, worldZ0, heights, sample };
}

export interface SatelliteImage {
  canvas: HTMLCanvasElement;
  worldX0: number;
  worldZ0: number;
  worldW: number;
  worldH: number;
}

/** Stitch satellite imagery into one canvas (browser only). */
export async function loadSatellite(region: MapboxRegion, token: string, z = region.satelliteZoom): Promise<SatelliteImage> {
  if (typeof document === "undefined") throw new Error("satellite loader needs a DOM");
  const grid = tileGrid(region, z);
  const canvas = document.createElement("canvas");
  canvas.width = grid.widthPx;
  canvas.height = grid.heightPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  const jobs: Promise<void>[] = [];
  for (let ty = 0; ty < grid.ny; ty++) {
    for (let tx = 0; tx < grid.nx; tx++) {
      jobs.push(
        (async () => {
          const tileX = grid.tx0 + tx;
          const tileY = grid.ty0 + ty;
          const res = await fetch(satelliteTileUrl(region, z, tileX, tileY, token));
          if (!res.ok) throw new Error(`satellite tile ${z}/${tileX}/${tileY}: HTTP ${res.status}`);
          const bmp = await createImageBitmap(await res.blob());
          ctx.drawImage(bmp, tx * TILE_PX, ty * TILE_PX);
          bmp.close();
        })(),
      );
    }
  }
  await Promise.all(jobs);
  return { canvas, worldX0: grid.worldX0, worldZ0: grid.worldZ0, worldW: grid.worldW, worldH: grid.worldH };
}
