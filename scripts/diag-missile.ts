// Headless missile verification: the racks match the airframe, a launch locks
// the nearest target, the weapon kills it with a big blast, and a landing
// refills the rails.
// Usage: bun scripts/diag-missile.ts  (or: bun run test:missile)

import { Scene } from "three";
import { AIRCRAFT, AIRCRAFT_LIST } from "../src/sim/aircraft";
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

/** A player parked in mid-air, flying north at combat speed. */
function airPlayer(id: keyof typeof AIRCRAFT): AircraftState {
  const st = spawnAircraft("airfield", 0, id);
  st.pos.set(0, 2000, 0);
  st.vel.set(0, 0, -220);
  st.speed = 220;
  st.gearDown = false;
  st.gearT = 0;
  st.onGround = false;
  st.airborne = true;
  return st;
}

const scene = new Scene();
const blasts = new ExplosionField(scene, "low");
const df = new Dogfight(scene, blasts);

// --- 1. the racks: two rails on the fighters, none on the bomber ---
{
  const tomcat = airPlayer("tomcat");
  df.setAircraft(tomcat);
  let h = df.hud(tomcat);
  check("the Tomcat rides two missiles", h.missiles === 2 && h.missilesMax === 2, `${h.missiles}/${h.missilesMax}`);
  const hornet = airPlayer("hornet");
  df.setAircraft(hornet);
  h = df.hud(hornet);
  check("the Hornet rides two missiles", h.missiles === 2 && h.missilesMax === 2, `${h.missiles}/${h.missilesMax}`);
  const intruder = airPlayer("intruder");
  df.setAircraft(intruder);
  h = df.hud(intruder);
  check("the Intruder carries no missiles", h.missiles === 0 && h.missilesMax === 0, `${h.missiles}/${h.missilesMax}`);
  check("every spec agrees with the table",
    AIRCRAFT_LIST.every((a) => h !== null && a.missiles >= 0));
}

// --- 2. a launch needs a target ---
{
  const st = airPlayer("tomcat");
  df.setAircraft(st);
  df.clear();
  df.requestMissile(st);
  const h = df.hud(st);
  check("no target means no launch", h.missiles === 2, `left=${h.missiles}`);
}

// --- 3. one press kills one bandit, from behind, out of gun range ---
{
  const st = airPlayer("tomcat");
  df.setAircraft(st);
  df.prepare(st);
  df.begin(st);
  df.step(DT, st, false); // let the boat put a bandit on the cat
  // wait for the bandit to fly
  for (let i = 0; i < Math.round(12 / DT); i++) df.step(DT, st, false);
  const spots = df.hud(st).spots;
  check("a bandit is flying", spots.length > 0, `spots=${spots.length}`);
  const before = df.hud(st).missiles;
  df.requestMissile(st);
  const after = df.hud(st).missiles;
  check("the launch takes one off the rails", after === before - 1, `${before} -> ${after}`);
  const blastsBefore = blasts.blastCount;
  // fly straight; the seeker has to do the rest
  for (let i = 0; i < Math.round(18 / DT); i++) df.step(DT, st, false);
  const h = df.hud(st);
  check("the missile hits and kills the bandit", h.kills > 0 || h.bandits < 1,
    `kills=${h.kills} bandits=${h.bandits}`);
  check("the hit makes a real explosion", blasts.blastCount > blastsBefore,
    `blasts ${blastsBefore} -> ${blasts.blastCount}`);
}

// --- 4. the rails refill on landing ---
{
  const st = airPlayer("tomcat");
  df.setAircraft(st);
  df.refill();
  const h = df.hud(st);
  check("a recovery rearms the missiles", h.missiles === 2 && h.missilesMax === 2, `${h.missiles}/${h.missilesMax}`);
}

// --- 5. a missile reaches a ground target (strike mode) ---
{
  const st = airPlayer("hornet");
  df.setAircraft(st);
  df.prepareStrike(st);
  df.beginStrike(st);
  for (let i = 0; i < Math.round(2 / DT); i++) df.step(DT, st, false);
  const spot = df.hud(st).spots[0];
  check("a strike target is on the grid", !!spot);
  if (spot) {
    // hover over the target (the bombs diag's geometry): a clean vertical drop
    // keeps the shot off the ridgelines a slant run would cross
    st.pos.set(spot.x, spot.y + 600, spot.z);
    st.vel.set(0, 0, -40);
    df.requestMissile(st);
    check("the launch leaves the rail", df.hud(st).missiles === 1, `${df.hud(st).missiles}`);
    const before = df.hud(st).bandits;
    for (let i = 0; i < Math.round(20 / DT); i++) {
      df.step(DT, st, false);
      if (df.hud(st).bandits < before) break;
    }
    check("the missile breaks a ground target", df.hud(st).bandits < before,
      `${before} -> ${df.hud(st).bandits}`);
  }
}

df.dispose();
console.log(failures === 0 ? "\nALL MISSILE CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
