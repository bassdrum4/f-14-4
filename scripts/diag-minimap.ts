// Verify the minimap projection: north up, east right, everything on screen.
// Usage: bun scripts/diag-minimap.ts

import { ARCHIPELAGO, DEFAULT_SEED, carriers, setWorldSeed } from "../src/sim/world";

const SIZE = 176;
const PAD = 10;

/** Mirror of the projection inside the Minimap component. */
function project(
  px: number, pz: number, x: number, z: number, range: number,
): { x: number; y: number } {
  const scale = (SIZE / 2 - PAD) / range;
  return { x: SIZE / 2 + (x - px) * scale, y: SIZE / 2 + (z - pz) * scale };
}

function rangeFor(px: number, pz: number, xs: Array<{ x: number; z: number }>): number {
  let maxR = 4000;
  for (const p of xs) maxR = Math.max(maxR, Math.hypot(p.x - px, p.z - pz));
  return maxR * 1.15;
}

let fails = 0;
function check(name: string, cond: boolean, extra = "") {
  if (cond) console.log(`  ok  ${name}`);
  else { fails++; console.error(`FAIL  ${name} ${extra}`); }
}

// The minimap is drawn from the fleet layout (carriers + airfield), which is
// deliberately independent of the terrain seed, so a pass over a few seeds is
// enough to cover the projection.
const fleetBefore = carriers().map((c) => `${c.name}@${c.x},${c.z}`).join("|");

for (const seed of [DEFAULT_SEED, 90210, 3]) {
  setWorldSeed(seed);
  console.log(`\nseed ${seed}`);
  const af = ARCHIPELAGO.airfield;
  const pois = [
    ...ARCHIPELAGO.carriers.map((c) => ({ x: c.x, z: c.z, n: c.name })),
    { x: af.centerX, z: af.centerZ, n: "FIELD" },
  ];

  // from several player positions, everything must land inside the canvas
  const players = [
    { x: 0, z: 0 },
    { x: af.centerX, z: af.centerZ },
    { x: ARCHIPELAGO.carriers[0].x, z: ARCHIPELAGO.carriers[0].z },
    { x: -ARCHIPELAGO.carriers[0].x, z: -ARCHIPELAGO.carriers[0].z },
  ];
  let allInside = true;
  let northUp = true;
  let eastRight = true;

  for (const p of players) {
    const range = rangeFor(p.x, p.z, pois);
    for (const poi of pois) {
      const q = project(p.x, p.z, poi.x, poi.z, range);
      if (q.x < 0 || q.x > SIZE || q.y < 0 || q.y > SIZE) {
        allInside = false;
      }
    }
    // a point due north of the player must be above centre (smaller y)
    const north = project(p.x, p.z, p.x, p.z - 1000, range);
    if (!(north.y < SIZE / 2)) northUp = false;
    // a point due east must be right of centre (larger x)
    const east = project(p.x, p.z, p.x + 1000, p.z, range);
    if (!(east.x > SIZE / 2)) eastRight = false;
  }

  check("all points of interest stay on the canvas", allInside);
  check("north (-Z) projects upward", northUp);
  check("east (+X) projects rightward", eastRight);

  // player marker must sit dead centre
  const c = project(123, -456, 123, -456, 9000);
  check("player sits at the canvas centre", Math.abs(c.x - SIZE / 2) < 1e-9 && Math.abs(c.y - SIZE / 2) < 1e-9);
}

check("the fleet layout does not move with the terrain seed",
  carriers().map((c) => `${c.name}@${c.x},${c.z}`).join("|") === fleetBefore);

console.log(fails === 0 ? "\nALL MINIMAP CHECKS PASSED" : `\n${fails} FAILURES`);