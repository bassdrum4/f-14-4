// Headless strike verification: the mission mode with no aircraft at all.
// Targets are on the map before wheels-up (land structures and ships), the
// fight arms on takeoff, guns and bombs both destroy targets, ships steam,
// waves follow waves, and clear() leaves nothing behind.
// Usage: bun scripts/diag-strike.ts  (or: bun run test:strike)

import { Matrix4, Scene, Vector3 } from "three";
import { spawnAircraft, type AircraftState } from "../src/sim/flight";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const DT = 1 / 120;
const MAT4 = new Matrix4();
const UP = new Vector3(0, 1, 0);
const ORIGIN = new Vector3();
const DIR = new Vector3();

/** A clean player state parked in mid-air. */
function airPlayer(): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.set(0, 1500, 0);
  st.vel.set(0, 0, -200);
  st.speed = 200;
  st.gearDown = false;
  st.gearT = 0;
  st.onGround = false;
  return st;
}

/** Point the player's nose at a world point and fly at it. */
function face(st: AircraftState, target: Vector3): void {
  DIR.copy(target).sub(st.pos).normalize();
  MAT4.lookAt(ORIGIN, DIR, UP);
  st.quat.setFromRotationMatrix(MAT4);
  st.vel.copy(DIR).multiplyScalar(200);
  st.speed = 200;
}

/** Run the sim forward `seconds` at the fixed step. */
function run(df: Dogfight, st: AircraftState, seconds: number, fire = false): void {
  for (let i = 0; i < Math.round(seconds / DT); i++) {
    df.step(DT, st, fire);
  }
}

const scene = new Scene();
const blasts = new ExplosionField(scene, "low");
const df = new Dogfight(scene, blasts);
const player = airPlayer();

// --- 1. prepared before wheels-up: targets are already on the map ---
{
  const parked = spawnAircraft("carrier", 0);
  const s0 = new Scene();
  const d0 = new Dogfight(s0, new ExplosionField(s0, "low"));
  d0.prepareStrike(parked);
  const h = d0.hud(parked);
  check("prepareStrike raises targets before wheels-up", h.bandits > 0, `targets=${h.bandits}`);
  check("prepareStrike starts no fight", !h.active, `active=${h.active}`);
  check("the HUD knows this is strike, not dogfight", h.strike === true);
  const land = h.spots.filter((s) => s.y > 20).length;
  const sea = h.spots.filter((s) => s.y <= 20).length;
  check("the wave has targets on land and at sea", land > 0 && sea > 0, `land=${land} sea=${sea}`);
  // and nothing is armed for takeoff: no bombs spent, no kills
  check("the racks are full on the deck", h.bombs === h.bombsMax, `${h.bombs}/${h.bombsMax}`);
  d0.dispose();
}

// --- 2. beginStrike arms the mission and keeps the prepared wave ---
{
  df.prepareStrike(player);
  const before = df.hud(player).bandits;
  df.beginStrike(player);
  const h = df.hud(player);
  check("beginStrike activates the mission", h.active);
  check("beginStrike keeps the prepared wave", h.bandits === before && h.wave === 1,
    `targets=${h.bandits} wave=${h.wave}`);
  check("wave 1 shows a mission banner", (player.banner?.text ?? "").startsWith("STRIKE"), player.banner?.text ?? "");
}

// --- 3. the gun crosshair lights on a target ---
{
  const spot = df.hud(player).spots[0];
  // inside gun range first: the cue integrates ~2 s of round flight
  player.pos.set(spot.x + 900, spot.y + 150, spot.z);
  face(player, new Vector3(spot.x, spot.y + 8, spot.z));
  const cue = df.gunSolution(player);
  check("the crosshair turns on a strike target", cue.hit === "target", `${cue.hit} @ ${cue.range.toFixed(0)} m`);
}

// --- 4. a gun pass destroys a target ---
{
  const before = df.hud(player).bandits;
  const spot = df.hud(player).spots[0];
  // sit off the target's beam and rake it
  player.pos.set(spot.x + 700, spot.y + 120, spot.z);
  face(player, new Vector3(spot.x, spot.y + 8, spot.z));
  run(df, player, 2.5, true);
  const h = df.hud(player);
  check("strafing destroys a target", h.bandits < before || h.kills > 0,
    `before=${before} after=${h.bandits} kills=${h.kills}`);
}

// --- 5. ships steam (a level pass needs lead) ---
{
  const h0 = df.hud(player);
  let seaSpot = h0.spots.find((s) => s.y <= 20);
  if (!seaSpot) {
    // the gun pass may have taken the sea group down; note it and move on
    check("a ship is still afloat to watch steam", false, "no sea targets left");
  } else {
    const x0 = seaSpot.x;
    const z0 = seaSpot.z;
    run(df, player, 10);
    const h1 = df.hud(player);
    const moved = h1.spots
      .filter((s) => s.y <= 20)
      .some((s) => Math.hypot(s.x - x0, s.z - z0) > 40);
    check("ships steam across the water", moved);
  }
}

// --- 6. bombs destroy targets from altitude ---
{
  const before = df.hud(player).kills;
  let guard = 0;
  while (df.hud(player).bandits > 0 && guard++ < 8) {
    const spot = df.hud(player).spots[0];
    // hover over the target and pickle; the laser stays on it and walks the
    // weapon in — which is exactly how a pod operator kills a steaming ship
    const at = new Vector3(spot.x, spot.y, spot.z);
    player.pos.set(spot.x, spot.y + 600, spot.z);
    player.vel.set(0, 0, 0);
    player.speed = 0;
    df.refill();
    df.setDesignation(at);
    df.requestBombRelease();
    df.requestBombRelease();
    for (let i = 0; i < Math.round(16 / DT); i++) {
      // keep the spot on the target as it moves
      let best: { x: number; y: number; z: number } | null = null;
      let bestD = Infinity;
      for (const s of df.hud(player).spots) {
        const d = Math.hypot(s.x - at.x, s.y - at.y, s.z - at.z);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      }
      // do not let the designation jump to another target across the map
      if (best && bestD < 200) at.set(best.x, best.y, best.z);
      df.setDesignation(at);
      df.step(DT, player, false);
      if (df.hud(player).bandits === 0) break;
    }
    df.setDesignation(null);
  }
  const h = df.hud(player);
  check("bombing clears the wave", h.bandits === 0, `left=${h.bandits}`);
  check("every destroyed target is scored", h.kills > before, `kills=${h.kills}`);
  check("the last impact is recorded", df.lastImpactKind !== null, String(df.lastImpactKind));
}

// --- 7. the next wave comes ---
{
  run(df, player, 8);
  const h = df.hud(player);
  check("wave 2 arrives after the pause", h.wave === 2 && h.bandits > 0,
    `wave=${h.wave} targets=${h.bandits}`);
  const land = h.spots.filter((s) => s.y > 20).length;
  const sea = h.spots.filter((s) => s.y <= 20).length;
  check("wave 2 is still land and sea", land > 0 && sea > 0, `land=${land} sea=${sea}`);
}

// --- 8. clear() leaves nothing behind ---
df.clear();
{
  const h = df.hud(player);
  check("clear empties the strike", h.bandits === 0 && !h.active && h.markers.length === 0);
  check("clear drops back to the dogfight HUD", h.strike === false);
}
df.dispose();

console.log(failures === 0 ? "\nALL STRIKE CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
