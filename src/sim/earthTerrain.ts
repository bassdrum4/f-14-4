// The baked real-Earth heightfield: one 60 km box of Hawaii, sampled from
// public elevation tiles at bake time (see scripts/bake-terrain.ts).
//
// Why a baked grid and not live tiles: the published build is a single
// self-contained HTML file, terrain is queried synchronously by the flight
// model every frame, and the multiplayer world is identified by a seed alone.
// A fixed grid keeps all three true, and it costs one bilinear lookup per query
// instead of the procedural sampler's ~15 noise evaluations.

import { EARTH_TERRAIN } from "./terrain/niihau";
import BASE64 from "./terrain/niihau";

/** What the beta cruise is flying, for the menu and the HUD caption. */
export const EARTH_TERRAIN_INFO = {
  label: EARTH_TERRAIN.label,
  source: EARTH_TERRAIN.source,
  metersPerSample: EARTH_TERRAIN.metersPerSample,
  sizeKm: (EARTH_TERRAIN.extentMeters * 2) / 1000,
  minHeight: EARTH_TERRAIN.minHeight,
  maxHeight: EARTH_TERRAIN.maxHeight,
};

let grid: Int16Array | null = null;

/** Decode the base64 int16 grid once, on the first terrain query. */
function heights(): Int16Array {
  if (grid) return grid;
  const binary = atob(BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const view = new DataView(bytes.buffer);
  const { grid: n } = EARTH_TERRAIN;
  const out = new Int16Array(n * n);
  for (let i = 0; i < out.length; i++) out[i] = view.getInt16(i * 2, true);
  grid = out;
  return out;
}

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/**
 * Elevation in metres at a world XZ point, bilinear between grid samples.
 *
 * Row 0 is the northern edge (world z = -extent); column 0 is the western edge,
 * so the grid reads as a plain north-up image of the box. Points outside the
 * box clamp to the edge, which is open ocean everywhere here.
 */
export function earthHeightAt(x: number, z: number): number {
  const g = heights();
  const { grid: n, metersPerSample: mps, extentMeters: ext } = EARTH_TERRAIN;
  const fx = (x + ext) / mps - 0.5;
  const fz = (z + ext) / mps - 0.5;
  const x0 = clamp(Math.floor(fx), 0, n - 1);
  const z0 = clamp(Math.floor(fz), 0, n - 1);
  const x1 = Math.min(x0 + 1, n - 1);
  const z1 = Math.min(z0 + 1, n - 1);
  const tx = clamp(fx - x0, 0, 1);
  const tz = clamp(fz - z0, 0, 1);
  const h00 = g[z0 * n + x0];
  const h10 = g[z0 * n + x1];
  const h01 = g[z1 * n + x0];
  const h11 = g[z1 * n + x1];
  return (h00 * (1 - tx) + h10 * tx) * (1 - tz) + (h01 * (1 - tx) + h11 * tx) * tz;
}
