// Bake a real 60 km heightfield and its satellite imagery into the app, from
// free, keyless sources.
//
// Heights: Mapzen / Tilezen "terrarium" terrain tiles, an AWS Open Data dataset
// (bucket `elevation-tiles-prod`, us-east-1, no account, no key). Each tile is a
// 256x256 PNG in Web Mercator whose colour channels carry metres:
//
//     elevation = (R * 256 + G + B / 256) - 32768
//
// Imagery: Sentinel-2 cloudless (EOX IT Services), CC BY 4.0 — free to
// redistribute with attribution. Only tiles that actually contain land are
// stored: the sea is drawn by the sim's own ocean, so shipping thousands of
// empty water tiles would be dead weight.
//
// The output is a TypeScript module holding an Int16Array grid and the land
// tiles as base64. That is deliberate: the published build is one self-contained
// HTML file (vite-plugin-singlefile), so separate assets would not survive it.
// JPEGs are not decoded here at all — the browser stitches them on a canvas, so
// this script needs no image library.
//
// Usage:
//   bun scripts/bake-terrain.ts                       # bake the configured box
//   bun scripts/bake-terrain.ts --lat 22.03 --lon -159.47
//   bun scripts/bake-terrain.ts --probe               # heights at the fixed
//                                                     # world points, no bake
//   bun scripts/bake-terrain.ts --no-imagery
//
// Tiles are cached in .cache/terrain-tiles and .cache/imagery so a re-bake is
// offline.

import { inflateSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ZOOM = 12;
const TILE = 256;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = `${ROOT}/.cache/terrain-tiles`;
const IMAGERY_CACHE = `${ROOT}/.cache/imagery`;
const OUT = `${ROOT}/src/sim/terrain/niihau.ts`;

// Sentinel-2 is 10 m native; z13 is ~17 m at this latitude, so it is not
// thrown away by undersampling.
const IMAGERY_ZOOM = 13;
const imageryUrl = (z: number, y: number, x: number): string =>
  `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/${z}/${y}/${x}.jpg`;

// Must match src/sim/world.ts: world XZ extent and the fixed fleet layout.
const EXTENT = 30000;
const AIRFIELD = { x: -1800, z: 2400, elevation: 140 };
const CARRIERS: Array<[number, number]> = [
  [10000, 2000], [20000, 9000], [-27000, 8000], [-8000, -16000],
  [6000, 12000], [26000, 14000], [15000, -24000], [-17000, 8000],
];

// The box the sim flies. Centred so the fixed airfield plateau (-1800, 2400)
// lands on real land with a sensible height, and every carrier anchorage lands
// in open water.
const DEFAULT_SITE = { lat: 21.91, lon: -160.09 };
const SIZE_M = 60000;
const GRID = 512;

const args = process.argv.slice(2);
const arg = (name: string, fallback: number): number => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? Number(args[i + 1]) : fallback;
};
const PROBE = args.includes("--probe");
const WITH_IMAGERY = !args.includes("--no-imagery");
const SITE = { lat: arg("lat", DEFAULT_SITE.lat), lon: arg("lon", DEFAULT_SITE.lon) };

// ---------------------------------------------------------------------------
// Web Mercator plumbing
// ---------------------------------------------------------------------------

const mercX = (lon: number, z = ZOOM): number => ((lon + 180) / 360) * (1 << z) * TILE;

function mercY(lat: number, z = ZOOM): number {
  const r = (lat * Math.PI) / 180;
  const m = Math.log(Math.tan(r) + 1 / Math.cos(r));
  return (1 - m / Math.PI) / 2 * (1 << z) * TILE;
}

/** Ground metres per degree, good enough over a 60 km box. */
const M_PER_DEG_LAT = 110574;
const mPerDegLon = (lat: number) => 111320 * Math.cos((lat * Math.PI) / 180);

/** World XZ (metres, +x east, +z south) -> lat/lon. */
function worldToLatLon(x: number, z: number): { lat: number; lon: number } {
  return {
    lat: SITE.lat - z / M_PER_DEG_LAT,
    lon: SITE.lon + x / mPerDegLon(SITE.lat),
  };
}

// ---------------------------------------------------------------------------
// Minimal PNG reader (8-bit, non-interlaced, no dependencies)
// ---------------------------------------------------------------------------

interface Bitmap { w: number; h: number; channels: number; data: Buffer }

function decodePng(buf: Buffer): Bitmap {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let off = 8, w = 0, h = 0, depth = 0, colour = 0, interlace = 0;
  const idat: Buffer[] = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      depth = data[8];
      colour = data[9];
      interlace = data[12];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  if (depth !== 8 || interlace !== 0) throw new Error(`unsupported PNG (depth ${depth}, interlace ${interlace})`);
  const channels = colour === 2 ? 3 : colour === 6 ? 4 : 0;
  if (!channels) throw new Error(`unsupported PNG colour type ${colour}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(stride * h);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const row = raw.subarray(p, p + stride);
    p += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let v = row[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`bad PNG filter ${filter}`);
      cur[x] = v & 0xff;
    }
  }
  return { w, h, channels, data: out };
}

// ---------------------------------------------------------------------------
// Tile fetching
// ---------------------------------------------------------------------------

async function cached(url: string, path: string): Promise<Buffer> {
  if (existsSync(path)) return readFileSync(path);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buf);
  return buf;
}

const fetchTile = (x: number, y: number) =>
  cached(
    `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${ZOOM}/${x}/${y}.png`,
    `${CACHE}/${ZOOM}/${x}/${y}.png`,
  );

const fetchImagery = (x: number, y: number) =>
  cached(imageryUrl(IMAGERY_ZOOM, y, x), `${IMAGERY_CACHE}/${IMAGERY_ZOOM}/${x}/${y}.jpg`);

/** The height tiles covering the box, stitched into one bitmap. */
async function mosaic(): Promise<{ data: Buffer; channels: number; x0: number; y0: number; w: number; h: number }> {
  const north = worldToLatLon(EXTENT, -EXTENT);
  const south = worldToLatLon(-EXTENT, EXTENT);
  const west = worldToLatLon(-EXTENT, 0);
  const east = worldToLatLon(EXTENT, 0);
  const x0 = Math.floor(mercX(west.lon) / TILE);
  const x1 = Math.floor(mercX(east.lon) / TILE);
  const y0 = Math.floor(mercY(north.lat) / TILE);
  const y1 = Math.floor(mercY(south.lat) / TILE);
  const cols = x1 - x0 + 1, rows = y1 - y0 + 1;
  const w = cols * TILE, h = rows * TILE;
  const data = Buffer.alloc(w * h * 3);
  process.stderr.write(`heights: ${cols}x${rows}=${cols * rows} tiles at z${ZOOM} …\n`);
  let done = 0;
  for (let ty = y0; ty <= y1; ty++) {
    const rowBufs = await Promise.all(
      Array.from({ length: cols }, (_, i) => fetchTile(x0 + i, ty)),
    );
    rowBufs.forEach((buf, i) => {
      const bmp = decodePng(buf);
      if (bmp.w !== TILE || bmp.h !== TILE) throw new Error("unexpected tile size");
      const dx = i * TILE;
      const dy = (ty - y0) * TILE;
      for (let y = 0; y < TILE; y++) {
        const src = y * TILE * bmp.channels;
        const dst = ((dy + y) * w + dx) * 3;
        for (let x = 0; x < TILE; x++) {
          const s = src + x * bmp.channels;
          data[dst + x * 3] = bmp.data[s];
          data[dst + x * 3 + 1] = bmp.data[s + 1];
          data[dst + x * 3 + 2] = bmp.data[s + 2];
        }
      }
      done++;
    });
    process.stderr.write(`  ${done}/${cols * rows}\n`);
  }
  return { data, channels: 3, x0, y0, w, h };
}

/** Elevation in metres at a world XZ point, bilinear over the height mosaic. */
function makeProbe(m: Awaited<ReturnType<typeof mosaic>>): (x: number, z: number) => number {
  const px = (x: number, z: number) => {
    const { lat, lon } = worldToLatLon(x, z);
    return { gx: mercX(lon) - m.x0 * TILE, gy: mercY(lat) - m.y0 * TILE };
  };
  const at = (ix: number, iy: number): number => {
    const cx = Math.min(m.w - 1, Math.max(0, ix));
    const cy = Math.min(m.h - 1, Math.max(0, iy));
    const o = (cy * m.w + cx) * 3;
    return m.data[o] * 256 + m.data[o + 1] + m.data[o + 2] / 256 - 32768;
  };
  return (x, z) => {
    const { gx, gy } = px(x, z);
    // Half-pixel offset: pixel centres sit at +0.5.
    const fx = gx - 0.5, fy = gy - 0.5;
    const ix = Math.floor(fx), iy = Math.floor(fy);
    const tx = fx - ix, ty = fy - iy;
    const a = at(ix, iy), b = at(ix + 1, iy), c = at(ix, iy + 1), d = at(ix + 1, iy + 1);
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
}

// ---------------------------------------------------------------------------
// Imagery
// ---------------------------------------------------------------------------

interface ImageryTile { x: number; y: number; jpg: string }

/**
 * The land tiles of the box, positioned in a mosaic whose pixel (0,0) is the
 * box's north-west corner. Water-only tiles are dropped: the sim draws its own
 * sea on top, so they would only bloat the bundle.
 */
async function bakeImagery(grid: Int16Array, step: number): Promise<{
  widthPx: number; heightPx: number; tiles: ImageryTile[]; bytes: number;
}> {
  const west = worldToLatLon(-EXTENT, 0).lon;
  const east = worldToLatLon(EXTENT, 0).lon;
  const north = worldToLatLon(0, -EXTENT).lat;
  const south = worldToLatLon(0, EXTENT).lat;
  const pxW = mercX(west, IMAGERY_ZOOM);
  const pxE = mercX(east, IMAGERY_ZOOM);
  const pxN = mercY(north, IMAGERY_ZOOM);
  const pxS = mercY(south, IMAGERY_ZOOM);
  const leftPx = Math.floor(pxW), topPx = Math.floor(pxN);
  const widthPx = Math.round(pxE - leftPx), heightPx = Math.round(pxS - topPx);
  const tx0 = Math.floor(leftPx / TILE), tx1 = Math.floor((pxE - 1) / TILE);
  const ty0 = Math.floor(topPx / TILE), ty1 = Math.floor((pxS - 1) / TILE);

  // Which tiles hold land, straight from the baked heights.
  const land = new Set<string>();
  for (let iz = 0; iz < GRID; iz++) {
    for (let ix = 0; ix < GRID; ix++) {
      if (grid[iz * GRID + ix] < 0) continue;
      const x = -EXTENT + (ix + 0.5) * step;
      const z = -EXTENT + (iz + 0.5) * step;
      const { lat, lon } = worldToLatLon(x, z);
      land.add(`${Math.floor(mercX(lon, IMAGERY_ZOOM) / TILE)},${Math.floor(mercY(lat, IMAGERY_ZOOM) / TILE)}`);
    }
  }

  const tiles: ImageryTile[] = [];
  let bytes = 0;
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      if (!land.has(`${tx},${ty}`)) continue;
      const buf = await fetchImagery(tx, ty);
      bytes += buf.length;
      tiles.push({ x: tx * TILE - leftPx, y: ty * TILE - topPx, jpg: buf.toString("base64") });
    }
  }
  process.stderr.write(
    `imagery: ${tiles.length} land tiles of ${(tx1 - tx0 + 1) * (ty1 - ty0 + 1)} at z${IMAGERY_ZOOM}, ` +
      `${widthPx}x${heightPx} px, ${(bytes / 1024).toFixed(0)} KiB\n`,
  );
  return { widthPx, heightPx, tiles, bytes };
}

// ---------------------------------------------------------------------------
// Bake
// ---------------------------------------------------------------------------

function report(sample: (x: number, z: number) => number): void {
  const airfield = sample(AIRFIELD.x, AIRFIELD.z);
  const carriers = CARRIERS.map(([x, z]) => sample(x, z));
  const dry = carriers.filter((h) => h >= 0).length;
  process.stderr.write(
    `  airfield  (${AIRFIELD.x},${AIRFIELD.z})  h=${airfield.toFixed(0)} m  (target ${AIRFIELD.elevation} m, must be land)\n`,
  );
  process.stderr.write(`  carriers  h=${carriers.map((h) => h.toFixed(0)).join(", ")}\n`);
  process.stderr.write(`  carrier anchorages on land: ${dry}/8 (must be 0)\n`);

  let min = Infinity, max = -Infinity, land = 0, points = 0;
  for (let z = -EXTENT; z <= EXTENT; z += 250) {
    for (let x = -EXTENT; x <= EXTENT; x += 250) {
      const h = sample(x, z);
      if (h < min) min = h;
      if (h > max) max = h;
      if (h >= 0) land++;
      points++;
    }
  }
  process.stderr.write(`  box: min ${min.toFixed(0)} m, max ${max.toFixed(0)} m, land ${((100 * land) / points).toFixed(1)}%\n`);
}

function encodeBase64(grid: Int16Array): string {
  return Buffer.from(grid.buffer, grid.byteOffset, grid.byteLength).toString("base64");
}

/** Chunked so the committed file stays readable in a diff and an editor. */
function chunked(b64: string, width = 180): string {
  const parts: string[] = [];
  for (let i = 0; i < b64.length; i += width) parts.push(JSON.stringify(b64.slice(i, i + width)));
  return parts.join(",\n  ");
}

async function main(): Promise<void> {
  const m = await mosaic();
  const sample = makeProbe(m);

  if (PROBE) {
    process.stderr.write(`probe ${SITE.lat}, ${SITE.lon}\n`);
    report(sample);
    return;
  }

  const grid = new Int16Array(GRID * GRID);
  const step = SIZE_M / GRID;
  let min = Infinity, max = -Infinity;
  for (let iz = 0; iz < GRID; iz++) {
    // Row-major, north (-EXTENT) first, so the grid is a plain image.
    const z = -EXTENT + (iz + 0.5) * step;
    for (let ix = 0; ix < GRID; ix++) {
      const x = -EXTENT + (ix + 0.5) * step;
      // 2x2 average inside the cell: keeps ridges from aliasing into spikes.
      const h =
        (sample(x - step * 0.25, z - step * 0.25) +
          sample(x + step * 0.25, z - step * 0.25) +
          sample(x - step * 0.25, z + step * 0.25) +
          sample(x + step * 0.25, z + step * 0.25)) / 4;
      const v = Math.max(-32000, Math.min(32000, Math.round(h)));
      grid[iz * GRID + ix] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  process.stderr.write(`heights: ${GRID}x${GRID} @ ${step.toFixed(1)} m/sample\n`);
  report(sample);

  const airfield = sample(AIRFIELD.x, AIRFIELD.z);
  const carriers = CARRIERS.map(([x, z]) => sample(x, z));
  if (carriers.some((h) => h >= 0)) {
    process.stderr.write("REFUSING: a carrier anchorage is on land. Shift --lat/--lon.\n");
    process.exit(1);
  }

  const imagery = WITH_IMAGERY
    ? await bakeImagery(grid, step)
    : { widthPx: 0, heightPx: 0, tiles: [] as ImageryTile[], bytes: 0 };

  const imageryBlock = imagery.tiles.length === 0
    ? "export const EARTH_IMAGERY = null;"
    : `export const EARTH_IMAGERY = {
  zoom: ${IMAGERY_ZOOM},
  widthPx: ${imagery.widthPx},
  heightPx: ${imagery.heightPx},
  source: "Sentinel-2 cloudless (EOX IT Services), CC BY 4.0",
  // Pixel offset of each 256px tile inside the mosaic; (0,0) is the box's
  // north-west corner. Water-only tiles are omitted by design.
  tiles: [
${imagery.tiles.map((t) => `    { x: ${t.x}, y: ${t.y}, jpg: ${JSON.stringify(t.jpg)} },`).join("\n")}
  ],
} as const;`;

  const src = `// GENERATED by scripts/bake-terrain.ts — do not edit by hand.
//
// Real elevation and satellite imagery for the free-flight "real terrain" beta:
// ${SITE.lat.toFixed(4)} N, ${Math.abs(SITE.lon).toFixed(4)} W, a ${SIZE_M / 1000} km square.
//
// Heights: Mapzen / Tilezen terrarium tiles (AWS Open Data, no key), decoded
// from \`elevation = (R * 256 + G + B / 256) - 32768\`, resampled to a
// ${GRID}x${GRID} grid at ${step.toFixed(1)} m per sample, stored as base64 int16 metres.
//
// Imagery: Sentinel-2 cloudless, CC BY 4.0. Land tiles only, as raw JPEG bytes;
// the browser stitches them into one canvas texture at runtime.
//
// Attribution for both lives in docs/REAL-TERRAIN.md.
//
// Heights are north-up: index 0 is world z = -${EXTENT}, +x is east.

export const EARTH_TERRAIN = {
  label: "Niihau, Hawaii",
  centerLat: ${SITE.lat},
  centerLon: ${SITE.lon},
  extentMeters: ${EXTENT},
  grid: ${GRID},
  metersPerSample: ${step.toFixed(4)},
  minHeight: ${min},
  maxHeight: ${max},
  airfieldGround: ${airfield.toFixed(1)},
  source: "Mapzen/Tilezen terrain tiles (AWS Open Data) — SRTM, 3DEP and others",
} as const;

const BASE64 = [
  ${chunked(encodeBase64(grid))},
].join("");

export default BASE64;

${imageryBlock}
`;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, src);
  process.stderr.write(`wrote ${OUT} (${(Buffer.byteLength(src) / 1024).toFixed(0)} KiB)\n`);
}

main().catch((err) => {
  process.stderr.write(`bake failed: ${(err as Error).message}\n`);
  process.exit(1);
});
