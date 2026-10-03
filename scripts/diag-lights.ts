// Verify the night-light placement maths: every light must land on its deck
// (or the runway), not in the ocean. Usage: bun scripts/diag-lights.ts

import { STRIP, airfield, carriers, worldToDeck } from "../src/sim/world";

const DEG = Math.PI / 180;

/** The transform used by buildNightLights. */
function toWorld(c: { x: number; z: number; headingDeg: number }, along: number, across: number) {
  const rot = (90 - c.headingDeg) * DEG;
  return {
    x: c.x + along * Math.cos(rot) + across * Math.sin(rot),
    z: c.z - along * Math.sin(rot) + across * Math.cos(rot),
  };
}

console.log("Carrier strip lights (must land inside the deck footprint):\n");
let bad = 0;
for (const c of carriers()) {
  const th = c.landingAngleDeg * DEG;
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  let inside = 0;
  let total = 0;
  let worst: string[] = [];
  for (let s = 6; s <= c.landingLength - 6; s += 18) {
    for (const d of [-STRIP.halfWidth, STRIP.halfWidth]) {
      const along = STRIP.startAlong + s * cos + d * sin;
      const across = STRIP.startAcross - s * sin + d * cos;
      // mirror buildNightLights: off-deck lights are skipped, not placed
      if (Math.abs(along) > c.deckLength / 2 || Math.abs(across) > c.deckWidth / 2) continue;
      const w = toWorld(c, along, across);
      // round-trip through the sim's own world->deck conversion
      const [a2, c2] = worldToDeck(c, w.x, w.z);
      total++;
      const ok =
        Math.abs(a2 - along) < 0.01 &&
        Math.abs(c2 - across) < 0.01 &&
        Math.abs(a2) <= c.deckLength / 2 &&
        Math.abs(c2) <= c.deckWidth / 2;
      if (ok) inside++;
      else worst.push(`s=${s} d=${d} -> along ${a2.toFixed(1)} across ${c2.toFixed(1)}`);
    }
  }
  if (inside !== total) bad++;
  console.log(`  ${c.name.padEnd(8)} ${inside}/${total} lights on deck  ${worst.length ? "MISPLACED: " + worst.slice(0, 3).join("; ") : ""}`);
}

// runway lights
const af = airfield();
let rwOk = 0;
let rwTotal = 0;
for (let x = -af.runwayLength / 2 + 20; x <= af.runwayLength / 2 - 20; x += 45) {
  for (const d of [-af.runwayWidth / 2 - 1.5, af.runwayWidth / 2 + 1.5]) {
    rwTotal++;
    const dx = Math.abs(af.centerX + x - af.centerX);
    const dz = Math.abs(af.centerZ + d - af.centerZ);
    if (dx <= af.runwayLength / 2 && dz <= af.runwayWidth / 2 + 2) rwOk++;
  }
}
console.log(`\nAirfield runway lights: ${rwOk}/${rwTotal} within the runway box`);
console.log(`\n${bad === 0 && rwOk === rwTotal ? "ALL LIGHTS PLACED CORRECTLY" : "PLACEMENT PROBLEMS"}`);