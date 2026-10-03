// Temporary diagnostic — ASCII map of the Kauai DEM region + spot probes.
import { loadHeightfield, tileGrid, type MapboxRegion } from "../src/sim/mapbox";

const token = process.env.VITE_MAPBOX_TOKEN;
if (!token) process.exit(1);

const KAUAI: MapboxRegion = {
  id: "kauai",
  label: "Kauai, Hawaii",
  attribution: "© Mapbox © OpenStreetMap",
  centerLon: -159.47,
  centerLat: 21.92,
  zoom: 12,
  satelliteZoom: 13,
  radiusMeters: 15000,
};

const grid = tileGrid(KAUAI, KAUAI.zoom);
console.log("grid", grid.nx, "x", grid.ny, "tiles; worldX0", grid.worldX0.toFixed(0), "worldZ0", grid.worldZ0.toFixed(0));
const hf = await loadHeightfield(KAUAI, token);
console.log("hf", hf.width, "x", hf.height, "cell", hf.cellSize.toFixed(1));

// Legend: # >300m  = >100m  - >5m  . >-2m  ~ >-30m (shallow)  ' ' deep water
for (let z = -20000; z <= 20000; z += 1000) {
  let line = "";
  for (let x = -20000; x <= 20000; x += 1000) {
    const h = hf.sample(x, z);
    line += h > 300 ? "#" : h > 100 ? "=" : h > 5 ? "-" : h > -2 ? "." : h > -30 ? "~" : " ";
  }
  console.log(String(z).padStart(6), line);
}
console.log("        x: -20k .. +20k (west -> east; z rows: north -> south)");

const probes: Array<[number, number, string]> = [
  [0, 0, "region centre"],
  [1033, 8072, "3km offshore of Poipu"],
  [0, 8000, "offshore south"],
  [0, 10000, "further offshore south"],
  [0, 12000, "far offshore south"],
  [0, -8000, "inland north"],
  [13532, -6192, "Lihue airport (expect ~45m)"],
  [5000, 9000, "SE water"],
  [-5000, 9000, "SW water"],
];
for (const [x, z, label] of probes) {
  console.log(`  (${x}, ${z}) ${label}: h=${hf.sample(x, z).toFixed(1)}m`);
}
