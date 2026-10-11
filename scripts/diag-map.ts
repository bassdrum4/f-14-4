// Map glyphs use the world's true bearings; the heading-up projection subtracts
// the player's heading from both positions and marker bearings. Cardinal and
// oblique projection checks also live in diag-carrier-motion.ts.
//
// Usage: bun scripts/diag-map.ts
import { Vector3, Quaternion } from "three";
import { headingOfQuat, headingOfVel, carriers, airfield, makeCarrier } from "../src/sim/world";
import { buildCarrier } from "../src/render/scene";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}
const deg = (v: number) => (Math.PI * v) / 180;
const near = (a: number, b: number, eps = 0.01) => Math.abs(((a - b + 540) % 360) - 180) < eps * 360;

/** A body whose nose points along `heading` (0 = north, 90 = east). */
function facing(heading: number): Quaternion {
  // Rotating (0,0,-1) about +Y by -heading points it at `heading`.
  return new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -deg(heading));
}

// --- 1. quaternion -> heading ------------------------------------------------
console.log("--- headingOfQuat ---");
for (const h of [0, 45, 90, 135, 180, 270, 359]) {
  const q = facing(h);
  const got = headingOfQuat(q);
  check(
    `a nose at ${h}\u00b0 reads as ${h}\u00b0`,
    near(got, h, 0.002),
    `got ${got.toFixed(3)}`,
  );
}
{
  // The pitch and roll of the aeroplane must not leak into its heading: an
  // inverted jet still has a course on the map.
  const q = new Quaternion()
    .setFromAxisAngle(new Vector3(0, 1, 0), -deg(90))
    .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI)) // rolled inverted
    .multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), deg(30))); // nose high
  const got = headingOfQuat(q);
  check("bank and pitch do not corrupt the heading", near(got, 90, 0.002), `got ${got.toFixed(3)}`);
}

// --- 2. velocity -> heading --------------------------------------------------
console.log("--- headingOfVel ---");
check("a northbound velocity reads 0", near(headingOfVel({ x: 0, z: -100 }), 0, 0.002));
check("an eastbound velocity reads 90", near(headingOfVel({ x: 100, z: 0 }), 90, 0.002));
check("a southbound velocity reads 180", near(headingOfVel({ x: 0, z: 100 }), 180, 0.002));
check("a parked marker does not invent a heading", headingOfVel({ x: 0.5, z: -0.5 }) === 0);

// --- 3. the map glyph points where the ship points ---------------------------
// The glyphs are drawn pointing "up" (0,-1) and then rotated by the heading,
// so canvas rotate(h) sends them along (sin h, -cos h). The 3D ship's bow is
// its local +X. If those two disagree the map lies by a fixed angle.
console.log("--- glyph vs 3D bow ---");
for (const h of [0, 30, 90, 179, 265]) {
  const canvasDir = new Vector3(Math.sin(deg(h)), 0, -Math.cos(deg(h)));
  const c = makeCarrier("TEST", 0, 0, h);
  const ship = buildCarrier(c);
  const bow = new Vector3(1, 0, 0).applyQuaternion(ship.quaternion);
  const dot = bow.dot(canvasDir);
  check(
    `a hull drawn at heading ${h}\u00b0 lies along the real bow`,
    dot > 0.9999,
    `bow=(${bow.x.toFixed(3)},${bow.z.toFixed(3)}) want=(${canvasDir.x.toFixed(3)},${canvasDir.z.toFixed(3)}) dot=${dot.toFixed(5)}`,
  );
}

// --- 4. everything the map needs is actually on the defs ---------------------
console.log("--- marker data ---");
{
  const cs = carriers();
  check("the fleet has carriers to point at", cs.length > 0, `${cs.length}`);
  check(
    "every carrier carries a usable heading and length for its hull glyph",
    cs.every((c) => Number.isFinite(c.headingDeg) && c.headingDeg >= 0 && c.headingDeg < 360 && c.deckLength > 0),
    cs.map((c) => `${c.name}:${c.headingDeg}deg/${c.deckLength}m`).join(" "),
  );
  const af = airfield();
  check(
    "the airfield carries a runway heading and length for its bar",
    Number.isFinite(af.headingDeg) && af.headingDeg >= 0 && af.headingDeg < 360 && af.runwayLength > 0,
    `${af.headingDeg}deg / ${af.runwayLength}m`,
  );
  const cv = makeCarrier("OPFOR", 0, 0, 123);
  check("the hostile carrier reports a heading to the HUD", cv.headingDeg === 123, `${cv.headingDeg}`);
}

// --- 5. the landing strip's own angle survives the trip to the deck ---------
// The angled deck is the other fixed bearing drawn on the boat; the painted
// strip, the wire meshes and the trap logic all have to agree on it.
console.log("--- strip bearing ---");
{
  const c = carriers()[0];
  const g = buildCarrier(c);
  const wires: Vector3[] = [];
  g.traverse((o) => {
    const m = o as { isMesh?: boolean; geometry?: { type?: string; parameters?: { width?: number; depth?: number } } };
    if (!m.isMesh) return;
    if (!/^wire-\d+$/.test((m as unknown as { name: string }).name)) return;
    wires.push((o as unknown as { getWorldPosition(t: Vector3): Vector3 }).getWorldPosition(new Vector3()));
  });
  check("the four wires are in the group the map's boat is built from", wires.length === 4, `${wires.length}`);
  if (wires.length >= 2) {
    // Consecutive wires are one wireSpacing apart *down* the strip, so the
    // line between them is the direction a jet rolls out after the catch. On
    // an angled deck that bearing is the ship's heading canted to port by the
    // landing angle — the whole point of the deck. Get the sign of that cant
    // wrong and every wire on the boat is in the wrong place.
    const alongStrip = wires[1].clone().sub(wires[0]);
    const rollBearing = ((Math.atan2(alongStrip.x, -alongStrip.z) * 180) / Math.PI + 360) % 360;
    const want = c.headingDeg - c.landingAngleDeg;
    check(
      "the wires are laid down a strip canted to port by the landing angle",
      near(rollBearing, want, 0.02),
      `got ${rollBearing.toFixed(2)} want ${want.toFixed(2)}`,
    );
    const separation = wires[1].distanceTo(wires[0]);
    check(
      "consecutive wires are one wire spacing apart",
      Math.abs(separation - c.wireSpacing) < 0.05,
      `got ${separation.toFixed(3)} want ${c.wireSpacing}`,
    );
  }
}

console.log(failures === 0 ? "\nALL MAP CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
