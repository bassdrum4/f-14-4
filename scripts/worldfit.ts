// World-fit utility — run: bun scripts/worldfit.ts
//
// 1. Loads the Kauai Mapbox DEM region the sim uses.
// 2. Finds an airfield site (low, flat, on the island body) and 4 carrier
//    anchorages (deep water, >= 2.2 km land-free clearance, spread out, open
//    sea lanes both along the deck axis and the approach).
// 3. Repeats the carrier search on the procedural archipelago and prints the
//    constants to paste into src/sim/world.ts.
//
// Read-only: fetches tiles, prints numbers, writes nothing.

import { loadHeightfield, tileGrid, type MapboxRegion } from "../src/sim/mapbox";
import { terrainHeight } from "../src/sim/world";

const token = process.env.VITE_MAPBOX_TOKEN;
if (!token) {
  console.error("VITE_MAPBOX_TOKEN missing");
  process.exit(1);
}

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

type Sample = (x: number, z: number) => number;
const f = (n: number, d = 0) => n.toFixed(d);

// ---------------------------------------------------------------------------

const t0 = Date.now();
const grid = tileGrid(KAUAI, KAUAI.zoom);
const satGrid = tileGrid(KAUAI, KAUAI.satelliteZoom);
console.log(
  `DEM grid z${grid.z}: ${grid.nx}x${grid.ny} tiles  cell ${f(grid.cellSize, 1)}m  span ${f(grid.worldW / 1000, 1)}km`,
);
console.log(
  `SAT grid z${satGrid.z}: ${satGrid.nx}x${satGrid.ny} tiles  cell ${f(satGrid.cellSize, 1)}m  span ${f(satGrid.worldW / 1000, 1)}km`,
);
console.log(
  `region bounds: x ${f(grid.worldX0)}..${f(grid.worldX0 + grid.worldW)}  z ${f(grid.worldZ0)}..${f(grid.worldZ0 + grid.worldH)}`,
);
const hf = await loadHeightfield(KAUAI, token);
console.log(`DEM loaded in ${Date.now() - t0}ms`);

// Mapbox terrain-RGB returns exactly 0 over the ocean, so map sea level to a
// seabed depth exactly like the in-game sampler will.
const kauaiSample: Sample = (x, z) => {
  const h = hf.sample(x, z);
  return h < 0.5 ? -40 : h;
};

/** Highest elevation on rings up to rMax — must stay well below sea level. */
function clearance(sample: Sample, x: number, z: number, rMax: number, dirs = 20): number {
  let worst = sample(x, z);
  for (const r of [800, 1400, 2000, rMax]) {
    for (let i = 0; i < dirs; i++) {
      const a = (i / dirs) * Math.PI * 2;
      worst = Math.max(worst, sample(x + Math.cos(a) * r, z + Math.sin(a) * r));
    }
  }
  return worst;
}

/** Heading whose sea lane (bow to stern, +/- 0.9 km) stays lowest on average. */
function bestHeading(sample: Sample, x: number, z: number): { deg: number; worst: number } {
  let bestDeg = 0;
  let bestWorst = Infinity;
  for (let deg = 0; deg < 360; deg += 5) {
    const th = (deg * Math.PI) / 180;
    const fx = Math.sin(th);
    const fz = -Math.cos(th);
    const rx = Math.cos(th);
    const rz = Math.sin(th);
    let worst = -Infinity;
    for (let t = -2000; t <= 9000; t += 550) {
      for (const lat of [-900, 0, 900]) {
        worst = Math.max(worst, sample(x + fx * t + rx * lat, z + fz * t + rz * lat));
      }
    }
    if (worst < bestWorst) {
      bestWorst = worst;
      bestDeg = deg;
    }
  }
  return { deg: bestDeg, worst: bestWorst };
}

interface Site {
  x: number;
  z: number;
  h: number;
  worst: number;
}

function carrierSites(
  sample: Sample,
  extent: number,
  clearanceR: number,
  count: number,
  minSep: number,
  fixed: Site[],
  bound: number,
): Site[] {
  const cands: Site[] = [];
  for (let x = -extent; x <= extent; x += 250) {
    for (let z = -extent; z <= extent; z += 250) {
      if (Math.abs(x) > bound || Math.abs(z) > bound) continue;
      const h = sample(x, z);
      if (h > -12) continue;
      const worst = clearance(sample, x, z, clearanceR);
      if (worst > -2) continue;
      cands.push({ x, z, h, worst });
    }
  }
  console.log(`  (${cands.length} feasible anchorage samples)`);
  const chosen: Site[] = [];
  const anchors = [...fixed];
  while (chosen.length < count) {
    let best: Site | null = null;
    let bestD = -1;
    for (const c of cands) {
      let d = Infinity;
      for (const a of anchors) d = Math.min(d, Math.hypot(c.x - a.x, c.z - a.z));
      if (d < minSep) continue;
      if (d > bestD) {
        bestD = d;
        best = c;
      }
    }
    if (!best) break;
    chosen.push(best);
    anchors.push(best);
    cands.splice(cands.indexOf(best), 1);
  }
  return chosen;
}

interface FieldSite {
  x: number;
  z: number;
  elev: number;
  rough: number;
  land: number;
}

function airfieldSites(sample: Sample): FieldSite[] {
  const out: FieldSite[] = [];
  for (let x = -8000; x <= 8000; x += 250) {
    for (let z = -8000; z <= 8000; z += 250) {
      const e = sample(x, z);
      if (e < 12 || e > 300) continue;
      let mn = Infinity;
      let mx = -Infinity;
      for (let dx = -1300; dx <= 1300; dx += 325) {
        for (let dz = -400; dz <= 400; dz += 200) {
          const h = sample(x + dx, z + dz);
          mn = Math.min(mn, h);
          mx = Math.max(mx, h);
        }
      }
      if (mn < 4) continue;
      const rough = mx - mn;
      if (rough > 110) continue;
      let land = 0;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        if (sample(x + Math.cos(a) * 4000, z + Math.sin(a) * 4000) > 5) land++;
      }
      if (land < 13) continue;
      out.push({ x, z, elev: e, rough, land });
    }
  }
  out.sort(
    (a, b) => a.rough + Math.abs(a.elev - 55) * 0.4 - (b.rough + Math.abs(b.elev - 55) * 0.4),
  );
  return out;
}

// ---------------------------------------------------------------------------

console.log("\n== Kauai airfield candidates (low, flat, island body) ==");
const fields = airfieldSites(kauaiSample);
for (const s of fields.slice(0, 8)) {
  console.log(`  x=${s.x} z=${s.z} elev=${f(s.elev)} rough=${f(s.rough)} land=${s.land}/24`);
}

console.log("\n== Kauai carrier anchorages (want 4) ==");
const kcar = carrierSites(kauaiSample, 17000, 2200, 4, 5500, [], 10500);
for (const c of kcar) {
  const hd = bestHeading(kauaiSample, c.x, c.z);
  console.log(
    `  x=${c.x} z=${c.z} depth=${f(c.h)} clearance=${f(c.worst)} (max ring height) heading=${hd.deg}deg lane=${f(hd.worst)}`,
  );
}
const inRegion = kcar.every(
  (c) =>
    c.x > grid.worldX0 && c.x < grid.worldX0 + grid.worldW && c.z > grid.worldZ0 && c.z < grid.worldZ0 + grid.worldH,
);
console.log(`  inside DEM bounds: ${inRegion}`);

console.log("\n== Procedural carriers (existing + 3 new) ==");
const existing: Site = { x: 6200, z: -1400, h: terrainHeight(6200, -1400), worst: clearance(terrainHeight, 6200, -1400, 2200) };
console.log(`  existing x=6200 z=-1400 depth=${f(existing.h)} clearance=${f(existing.worst)}`);
const pcar = carrierSites(terrainHeight, 9500, 2200, 3, 5500, [existing], 10500);
for (const c of pcar) {
  const hd = bestHeading(terrainHeight, c.x, c.z);
  console.log(
    `  NEW x=${c.x} z=${c.z} depth=${f(c.h)} clearance=${f(c.worst)} heading=${hd.deg}deg lane=${f(hd.worst)}`,
  );
}

console.log("\nworldfit done");
