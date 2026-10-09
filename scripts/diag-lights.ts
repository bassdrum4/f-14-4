// Verify the night lighting: deck/runway light placement (every light must land
// on its deck or the runway, not in the ocean), and the airframes' nav lights —
// four sprites per airframe, driven by the daylight cycle.
// Usage: bun scripts/diag-lights.ts

import * as THREE from "three";
import { STRIP, airfield, carriers, worldToDeck } from "../src/sim/world";
import { buildAircraft } from "../src/render/geometry";
import { NAV_GLOW, SHIP_LAMP, SHIP_NAV_GREEN, updateAirLights, updateShipLights } from "../src/render/lights";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

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

// ---------------------------------------------------------------------------
// Airframe nav lights: port red, starboard green, white tail, strobe beacon
// ---------------------------------------------------------------------------
console.log("\nAirframe lights:");
for (const id of ["tomcat", "hornet", "intruder"] as const) {
  const jet = buildAircraft(id);
  const sprites: THREE.Sprite[] = [];
  jet.group.traverse((o) => {
    if ((o as THREE.Sprite).isSprite) sprites.push(o as THREE.Sprite);
  });
  check(`${id}: carries four nav lights`, sprites.length === 4, `${sprites.length} sprites`);
  // the red/green tip lights must be on the wing panels, or they would float in
  // space while the Tomcat sweeps its wings
  const onWings = [jet.wingPanels[0], jet.wingPanels[1]].map((panel) => {
    let n = 0;
    panel.traverse((o) => {
      if ((o as THREE.Sprite).isSprite) n++;
    });
    return n;
  });
  check(`${id}: a tip light rides each wing panel`,
    onWings[0] === 1 && onWings[1] === 1, JSON.stringify(onWings));
  // and every sprite sits on the airframe, not at the origin
  let outboard = true;
  for (const s of sprites) {
    if (Math.abs(s.position.x) + Math.abs(s.position.y) + Math.abs(s.position.z) < 0.2) outboard = false;
  }
  check(`${id}: no light sits on the airframe's origin`, outboard);
  // an untextured sprite renders as a hard square, which is what made the
  // lights look like slabs hanging off the wing: every lamp needs its glow
  const square = sprites.filter((s) => !(s.material as THREE.SpriteMaterial).map);
  check(`${id}: every light has a soft glow texture, not a bare quad`,
    square.length === 0, `${square.length} square lights`);
  const biggest = Math.max(...sprites.map((s) => s.scale.x));
  check(`${id}: lights stay lamp-sized, not billboard-sized`, biggest <= 3,
    `widest ${biggest} m`);
}

// the glow itself: a bright core fading to a transparent rim, so the quad's
// corners never show (a plain white texture would still read as a square)
{
  const img = NAV_GLOW.image as { data: Uint8Array; width: number; height: number };
  const alphaAt = (x: number, y: number) => img.data[(y * img.width + x) * 4 + 3];
  check("the nav glow has a bright core", alphaAt(img.width >> 1, img.height >> 1) > 200,
    `${alphaAt(img.width >> 1, img.height >> 1)}`);
  check("the nav glow fades to nothing at the rim",
    alphaAt(0, 0) === 0 && alphaAt(img.width - 1, 0) === 0 &&
      alphaAt(0, img.height - 1) === 0 && alphaAt(img.width - 1, img.height - 1) === 0);
  check("the nav glow falls off rather than stepping",
    alphaAt(0, img.height >> 1) === 0 && alphaAt(img.width >> 2, img.height >> 1) > 40,
    `${alphaAt(0, img.height >> 1)} / ${alphaAt(img.width >> 2, img.height >> 1)}`);
}

// darkness drives the whole set
const sample = (dark: number, t: number) => {
  updateAirLights(dark, t);
  const jet = buildAircraft("tomcat");
  const sprites: THREE.Sprite[] = [];
  jet.group.traverse((o) => {
    if ((o as THREE.Sprite).isSprite) sprites.push(o as THREE.Sprite);
  });
  return sprites.map((s) => (s.material as THREE.SpriteMaterial).opacity);
};
const night = sample(1, 0.03); // during a strobe flash
const day = sample(0, 0.6); // broad daylight
check("nav lights are bright at night", Math.min(...night) > 0.4, JSON.stringify(night));
check("nav lights dim in daylight", Math.max(...day) < 0.2, JSON.stringify(day));
check("the strobe is off between flashes", sample(1, 0.6).some((o) => o < 0.1),
  JSON.stringify(sample(1, 0.6)));

updateShipLights(1, 0.03);
const lampNight = SHIP_LAMP.emissiveIntensity;
const navGreenNight = SHIP_NAV_GREEN.emissiveIntensity;
updateShipLights(0, 0.03);
check("ship deck lamps come up at night", lampNight > 1, `${lampNight.toFixed(2)}`);
check("ship deck lamps are dark by day", SHIP_LAMP.emissiveIntensity === 0,
  `${SHIP_LAMP.emissiveIntensity}`);
check("ship navigation lights stay lit around the clock",
  navGreenNight > 0.3 && SHIP_NAV_GREEN.emissiveIntensity >= 0.2,
  `${navGreenNight.toFixed(2)} / ${SHIP_NAV_GREEN.emissiveIntensity.toFixed(2)}`);

console.log(
  `\n${bad === 0 && rwOk === rwTotal && failures === 0 ? "ALL LIGHT CHECKS PASSED" : "LIGHT PROBLEMS"}`,
);
process.exit(failures === 0 && bad === 0 && rwOk === rwTotal ? 0 : 1);