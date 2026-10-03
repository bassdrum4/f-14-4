// End-to-end check of the real-terrain world against live Mapbox data:
// loads the actual DEM, installs the in-game sampler, then runs the real
// flight model at every carrier and the airfield. Read-only.
//
// Usage: bun scripts/kauai-e2e.ts

import { spawnAircraft, stepAircraft } from "../src/sim/flight";
import {
  KAUAI,
  carriers,
  groundAt,
  makeKauaiSampler,
  setWorld,
  terrainHeight,
} from "../src/sim/world";
import { KAUAI_REGION, loadHeightfield } from "../src/sim/mapbox";

const token = process.env.VITE_MAPBOX_TOKEN;
if (!token) {
  console.error("VITE_MAPBOX_TOKEN missing");
  process.exit(1);
}

const t0 = Date.now();
const hf = await loadHeightfield(KAUAI_REGION, token);
console.log(`DEM ${hf.width}x${hf.height} (${(hf.cellSize).toFixed(1)}m/px) in ${Date.now() - t0}ms`);
setWorld(KAUAI, makeKauaiSampler(hf));

const af = KAUAI.airfield;
console.log(
  `airfield h=${terrainHeight(af.centerX, af.centerZ).toFixed(1)}m (flatten target ${af.elevation})`,
);

let land = 0;
let n = 0;
let maxH = -1e9;
for (let x = -12000; x <= 12000; x += 500) {
  for (let z = -12000; z <= 12000; z += 500) {
    const h = terrainHeight(x, z);
    n++;
    if (h > 0) land++;
    maxH = Math.max(maxH, h);
  }
}
console.log(`world: land ${((100 * land) / n).toFixed(1)}%, max elevation ${maxH.toFixed(0)}m`);

const idle = {
  pitch: 0, roll: 0, yaw: 0,
  throttleUp: false, throttleDown: false,
  trimUp: false, trimDown: false,
  brake: false, catHold: false,
};

for (let i = 0; i < carriers().length; i++) {
  const c = carriers()[i];
  const st = spawnAircraft("carrier", i);
  for (let k = 0; k < 600; k++) stepAircraft(st, idle, 1 / 120);
  const g = groundAt(c.x, c.z);
  console.log(
    `${c.name}: under-ship=${g.kind} (y ${g.y.toFixed(0)})  seabed=${terrainHeight(c.x, c.z).toFixed(0)}m  ` +
      `settled onGround=${st.onGround} drift=${st.speed.toFixed(2)}m/s  result=${st.result?.title ?? "none"}`,
  );
}

const st = spawnAircraft("airfield");
for (let k = 0; k < 600; k++) stepAircraft(st, idle, 1 / 120);
console.log(
  `airfield spawn: kind=${st.groundKind} alt=${(st.pos.y - af.elevation).toFixed(2)}m  ` +
    `onGround=${st.onGround}  result=${st.result?.title ?? "none"}`,
);

console.log("kauai e2e done");
