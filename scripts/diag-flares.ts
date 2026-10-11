// Headless countermeasure verification.
//  * every airframe's flare load comes off its spec and reaches the cockpit,
//  * one press ejects a salvo, the battery empties exactly, the cooldown holds,
//  * cartridges burn out and are recycled, and cannot be used on the deck,
//  * a bandit-style round hits the jet when nothing decoys it,
//  * the same shot with flares in the air is decoyed onto a cartridge: the
//    round dies on the flare and the hull is untouched,
//  * the HUD calls the threat out (range, bearing, seconds to impact).
// Usage: bun scripts/diag-flares.ts  (or: bun run test:flares)

import { Scene, Vector3 } from "three";
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
/** The salvo size and cartridge burn time the model ships with. */
const SALVO = 4;
const BURN_S = 4.5;

/** A player in level flight at 2,000 m, nose north (-Z). */
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

// --- 1. the loads: every airframe carries countermeasures ------------------
{
  check("no airframe flies without flares", AIRCRAFT_LIST.every((a) => a.flares > 0),
    AIRCRAFT_LIST.map((a) => `${a.id}:${a.flares}`).join(" "));
  check("the Crusader carries the smallest load (16)", AIRCRAFT.crusader.flares === 16,
    String(AIRCRAFT.crusader.flares));
  check("the helicopters and the fleet fighters carry 30",
    AIRCRAFT.seahawk.flares === 30 && AIRCRAFT.tomcat.flares === 30 && AIRCRAFT.intruder.flares === 30);
  const st = airPlayer("crusader");
  df.clear();
  df.setAircraft(st);
  const h = df.hud(st);
  check("the cockpit sees the airframe's load", h.flares === 16 && h.flaresMax === 16,
    `${h.flares}/${h.flaresMax}`);
  check("an airframe with no flares reports none", AIRCRAFT_LIST.some((a) => a.flares === 0) === false);
}

// --- 2. a press is a salvo; the battery empties exactly; the cooldown holds --
{
  const st = airPlayer("crusader"); // 16 = four salvoes of four
  df.clear();
  df.setAircraft(st);
  df.requestFlares(st);
  check("a press ejects one salvo", df.flareCount() === SALVO, `${df.flareCount()}`);
  check("and the count drops by the salvo", df.hud(st).flares === 16 - SALVO);
  df.requestFlares(st);
  check("the next press inside the cooldown does nothing", df.flareCount() === SALVO);
  // Mash the key for long enough to empty the battery (cooldown is 0.7 s).
  for (let i = 0; i < Math.round(10 / DT); i++) {
    df.requestFlares(st);
    df.step(DT, st, false);
  }
  check("mashing the key empties the battery and stops at zero", df.hud(st).flares === 0,
    `${df.hud(st).flares}`);
  check("the last press says so", (st.banner?.text ?? "").includes("NO FLARES LEFT"), st.banner?.text);
  check("the press never overshoots below zero", df.hud(st).flares >= 0);
}

// --- 3. cartridges burn out and go back in the pool -----------------------
{
  const st = airPlayer("tomcat");
  df.clear();
  df.setAircraft(st);
  df.requestFlares(st);
  for (let i = 0; i < Math.round((BURN_S + 1.5) / DT); i++) df.step(DT, st, false);
  check("a cartridge burns out and is cleared", df.flareCount() === 0, `${df.flareCount()}`);
  const left = df.hud(st).flares;
  df.requestFlares(st);
  check("the pool is reused after burnout", df.flareCount() === SALVO, `${df.flareCount()}`);
  check("and the battery keeps counting down", df.hud(st).flares === left - SALVO);
}

// --- 4. no countermeasures on the deck ------------------------------------
{
  const st = spawnAircraft("carrier", 0, "tomcat");
  df.clear();
  df.setAircraft(st);
  check("the jet starts on the deck", st.onGround === true);
  df.requestFlares(st);
  check("flares cannot be released on deck", df.flareCount() === 0, `${df.flareCount()}`);
  check("and the cockpit is told why", (st.banner?.text ?? "").includes("AIRBORNE ONLY"), st.banner?.text);
}

// --- 5. a hostile round hurts when nothing decoys it ----------------------
/** Launch one round on a head-on collision course from `km` ahead. */
function headOnRound(km: number): void {
  const from = new Vector3(0, 2000, -km * 1000);
  const vel = new Vector3(0, 0, 320);
  if (!df.fireHostileRoundForTest(from, vel, 7)) throw new Error("could not put a round in the air");
}

{
  const st = airPlayer("tomcat");
  df.clear();
  df.setAircraft(st);
  // The hull is not reset by clear() — begin() refills it — so measure the
  // damage from where this scenario starts instead of assuming a fresh 100.
  const hull0 = df.hud(st).hull;
  headOnRound(2.5);
  const seen = df.hud(st);
  check("the HUD calls the round out", seen.incoming !== null, JSON.stringify(seen.incoming));
  check("with a range, a bearing and a time to impact",
    !!seen.incoming && seen.incoming.km > 0 && seen.incoming.km <= 9 && seen.incoming.sec >= 0,
    JSON.stringify(seen.incoming));
  let hit = false;
  for (let i = 0; i < Math.round(20 / DT) && !hit; i++) {
    df.step(DT, st, false);
    if (df.hud(st).hull < hull0) hit = true;
  }
  const hull1 = df.hud(st).hull;
  check("an undecoyed round hits the jet", hit, `hull ${hull1}`);
  // The warhead's damage against the player (MISSILE_PLAYER_DMG in dogfight.ts).
  check("the damage is the warhead's", hull0 - hull1 === 34, `${hull0} -> ${hull1}`);
  check("and the round is spent", df.hostileRounds().length === 0);
}

// --- 6. the same shot, answered with flares -------------------------------
{
  const st = airPlayer("tomcat");
  df.clear();
  df.setAircraft(st);
  const hull0 = df.hud(st).hull;
  // A pilot who sees the launch: cartridges out, and keep them coming.
  headOnRound(2.5);
  let decoyed = false;
  let died = false;
  for (let i = 0; i < Math.round(20 / DT); i++) {
    df.requestFlares(st); // no-op while the cooldown runs — exactly one press
    df.step(DT, st, false);
    if (df.hostileRounds().some((r) => r.decoyed)) decoyed = true;
    if (df.hostileRounds().length === 0) {
      died = true;
      break;
    }
  }
  check("a flare decoys the round", decoyed);
  check("the decoyed round is destroyed", died);
  check("the jet is never hit", df.hud(st).hull === hull0, `hull ${df.hud(st).hull}`);
  check("the HUD stops calling it out once it is decoyed",
    decoyed && df.hud(st).incoming === null);
  check("and it cost cartridges", df.hud(st).flares < 30, `${df.hud(st).flares}`);
}

// --- 7. the amount is a real budget, not a decoration ---------------------
{
  const st = airPlayer("crusader");
  df.clear();
  df.setAircraft(st);
  let presses = 0;
  for (let i = 0; i < Math.round(6 / DT); i++) {
    const before = df.hud(st).flares;
    df.requestFlares(st);
    if (df.hud(st).flares < before) presses++;
    df.step(DT, st, false);
  }
  check("a 16-cartridge load is four salvoes", presses === 4, `${presses} presses`);
}

// --- 8. the threat is real: an aggressor shoots at the player -------------
{
  const st = airPlayer("tomcat");
  st.pos.set(0, 2000, 0);
  st.gearDown = true;
  st.gearT = 1;
  df.clear();
  df.prepare(st);
  df.begin(st);
  // Missile-equipped Aggressors enter from wave 3; early waves are guns-only.
  (df as unknown as { wave: number }).wave = 3;
  let launched = false;
  let warnedFrames = 0;
  let firedRounds = 0;
  let seenRounds = 0;
  for (let i = 0; i < Math.round(60 / DT); i++) {
    df.step(DT, st, false);
    const rounds = df.hostileRounds().length;
    if (rounds > seenRounds) firedRounds += rounds - seenRounds;
    seenRounds = rounds;
    if (df.hud(st).incoming) {
      warnedFrames++;
      launched = true;
    }
  }
  check("an aggressor launches a round at the player", launched, `${firedRounds} rounds`);
  check("and the RWR calls it out while it flies", warnedFrames > 60, `${warnedFrames} frames`);
  df.clear();
}

console.log(failures === 0 ? "\nALL COUNTERMEASURE CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
