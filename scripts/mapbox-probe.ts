// Mapbox connectivity probe — run: bun scripts/mapbox-probe.ts
// Fetches + decodes terrain-RGB tiles around Kauai and checks the satellite
// endpoint headers. Prints tile stats only; never prints the token.

import { loadHeightfield, satelliteTileUrl, terrainTileUrl, tileGrid, type MapboxRegion } from "../src/sim/mapbox";

const token = process.env.VITE_MAPBOX_TOKEN;
if (!token) {
  console.error("VITE_MAPBOX_TOKEN is not set (add it via the Keys/Environment UI)");
  process.exit(1);
}

const region: MapboxRegion = {
  id: "kauai",
  label: "Kauai, Hawaii",
  attribution: "© Mapbox © OpenStreetMap",
  centerLon: -159.5,
  centerLat: 21.95,
  zoom: 12,
  satelliteZoom: 12,
  radiusMeters: 4000,
};

const g = tileGrid(region, region.zoom);
console.log(
  `grid z${g.z}: tiles ${g.nx}x${g.ny} @ (${g.tx0},${g.ty0})  ${g.widthPx}x${g.heightPx}px  cell ${g.cellSize.toFixed(2)}m`,
);

const t0 = Date.now();
const hf = await loadHeightfield(region, token);
console.log(`decoded ${hf.width}x${hf.height} heightfield in ${Date.now() - t0}ms`);

const probes: Array<[string, number, number]> = [
  ["center", 0, 0],
  ["north (+4km)", 0, -4000],
  ["south (+4km)", 0, 4000],
  ["west", -4000, 0],
  ["east", 4000, 0],
];
for (const [name, x, z] of probes) {
  console.log(`  ${name.padEnd(14)} h=${hf.sample(x, z).toFixed(0)}m`);
}

// Satellite endpoint: status, content type, CORS header, size.
const satZ = region.satelliteZoom;
const sg = tileGrid(region, satZ);
const satRes = await fetch(satelliteTileUrl(region, satZ, sg.tx0, sg.ty0, token));
const satBytes = (await satRes.arrayBuffer()).byteLength;
console.log(
  `satellite tile z${satZ}/${sg.tx0}/${sg.ty0}: ${satRes.status} ${satRes.headers.get("content-type")} ` +
    `cors=${satRes.headers.get("access-control-allow-origin")} ${satBytes}B`,
);

// Terrain endpoint headers (for reference).
const tRes = await fetch(terrainTileUrl(region, g.z, g.tx0, g.ty0, token));
await tRes.arrayBuffer();
console.log(
  `terrain tile z${g.z}/${g.tx0}/${g.ty0}: ${tRes.status} ${tRes.headers.get("content-type")} ` +
    `cors=${tRes.headers.get("access-control-allow-origin")}`,
);

console.log("probe done");
