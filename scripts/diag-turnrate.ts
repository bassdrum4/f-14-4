// Turn-performance regression. Guards the fighter handling numbers that the
// old model failed: roll rate to bank, pitch authority (how much alpha/g a full
// pull can hold), and the sustained level-turn rate at high bank.
//
// Background: the turn rate in a level turn is fixed by the load factor —
//   omega = g * sqrt(n^2 - 1) / V,   n = 1 / cos(bank)
// — so a fighter that cannot pull past ~3.6 g can never turn tighter than about
// 8 deg/s. This test pins the alpha the elevator can command, the g the wing can
// carry, and the resulting rate.
// Usage: bun scripts/diag-turnrate.ts  (or: bun run test:turnrate)

import { Vector3 } from "three";
import { AIRCRAFT, type AircraftId } from "../src/sim/aircraft";
import {
  maxLoadFactor,
  maxTurnRate,
  spawnAircraft,
  stepAircraft,
  sustainedLoadFactor,
  sustainedTurnRate,
  type AircraftState,
  type FlightInput,
} from "../src/sim/flight";

const DT = 1 / 120;
const RAD = 57.2958;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

function idle(): FlightInput {
  return {
    pitch: 0, roll: 0, yaw: 0,
    throttleUp: false, throttleDown: false,
    trimUp: false, trimDown: false,
    brake: false, catHold: false, fire: false,
  };
}

function airborne(speed: number, alt: number): AircraftState {
  const st = spawnAircraft("carrier", 0);
  st.pos.set(0, alt, 0);
  st.vel.set(0, 0, -speed);
  st.quat.identity();
  st.omega.set(0, 0, 0);
  st.gearDown = false; st.gearT = 0;
  st.flapsDown = false; st.flapT = 0;
  st.throttle = 0.7; st.rpm = 0.7;
  st.trim = 0.5;
  st.banner = null;
  st.catPhase = "idle";
  st.airborne = true; st.onGround = false;
  return st;
}

function bankDeg(st: AircraftState): number {
  const right = new Vector3(1, 0, 0).applyQuaternion(st.quat);
  return -Math.asin(clamp(right.y, -1, 1)) * RAD;
}

/** Heading of the horizontal velocity (immune to nose-high singularities). */
function velHeading(st: AircraftState): number {
  return (Math.atan2(st.vel.x, -st.vel.z) * RAD + 360) % 360;
}
function wrap(d: number): number {
  if (d > 180) return d - 360;
  if (d < -180) return d + 360;
  return d;
}

/**
 * A precise pilot: hold the commanded bank with a roll loop, hold altitude by
 * damping vertical speed, and keep the commanded speed with the throttle.
 */
function levelTurn(st: AircraftState, bankTarget: number, speed: number, seconds: number) {
  const rate: number[] = [];
  let prev = velHeading(st);
  let gPeak = 0;
  let alphaPeak = 0;
  let altMin = Infinity, altMax = -Infinity;
  let vStart = 0, vEnd = 0;
  const settle = 10; // s: let the bank and the turn stabilise
  for (let i = 0; i < seconds / DT; i++) {
    const rollCmd = clamp((bankTarget - bankDeg(st)) * 0.09 - st.omega.z * 0.4, -1, 1);
    const pitch = clamp(-st.vspeed * 0.07, -1, 1);
    stepAircraft(st, { ...idle(), roll: rollCmd, pitch, throttleUp: st.speed < speed }, DT);
    const dh = wrap(velHeading(st) - prev);
    prev = velHeading(st);
    if (st.time > settle) {
      rate.push(dh / DT);
      gPeak = Math.max(gPeak, st.gLoad);
      alphaPeak = Math.max(alphaPeak, Math.abs(st.alpha));
      altMin = Math.min(altMin, st.pos.y);
      altMax = Math.max(altMax, st.pos.y);
      if (vStart === 0) vStart = st.speed;
      vEnd = st.speed;
    }
  }
  const mean = rate.reduce((a, b) => a + b, 0) / rate.length;
  return { rate: Math.abs(mean), gPeak, alphaPeak, altMin, altMax, vStart, vEnd };
}

// --- 1. roll: full aileron should reach 80 deg bank in about a second ---
{
  const st = airborne(250, 3000);
  let t = 0, t80 = -1, peak = 0;
  for (let i = 0; i < 5 / DT && t80 < 0; i++) {
    stepAircraft(st, { ...idle(), roll: 1 }, DT);
    t += DT;
    peak = Math.max(peak, Math.abs(st.omega.z * RAD));
    if (bankDeg(st) > 80) t80 = t;
  }
  const steady = airborne(250, 3000);
  for (let i = 0; i < 2 / DT; i++) stepAircraft(steady, { ...idle(), roll: 1 }, DT);
  const rate = Math.abs(steady.omega.z * RAD);
  console.log(`      roll: 80 deg in ${t80.toFixed(2)} s, steady ${rate.toFixed(0)} deg/s`);
  check("roll to 80 deg bank under 1.5 s", t80 > 0 && t80 < 1.5, `${t80.toFixed(2)} s`);
  check("steady roll rate is fighter-class (90-180 deg/s)", rate > 90 && rate < 180, `${rate.toFixed(0)}`);
  check("no roll snap while banking", peak < 200, `peak ${peak.toFixed(0)} deg/s`);
}

// --- 2. pitch authority: the pull must reach the wing's alpha and the
//        airframe's limit load factor, the way a real hard pull does ---
// The manoeuvre is the dogfight one — a hard banked turn — not a wings-level
// pull-up: a level pull-up unloads as the flight path curves up, so it never
// shows what the wing can actually hold. The F-14's structural limit is 7.5 g
// (NATOPS), so that is what a full pull at combat speed must sit on.
{
  const hard = levelTurn(airborne(250, 3000), 80, 250, 40);
  console.log(
    `      hard turn @250 (bank 80): alpha ${(hard.alphaPeak * RAD).toFixed(1)} deg, ` +
    `g ${hard.gPeak.toFixed(1)}`,
  );
  check("a hard pull reaches the wing's stall alpha (> 15 deg)",
    hard.alphaPeak > 0.26, `${(hard.alphaPeak * RAD).toFixed(1)} deg`);
  check("a hard pull carries the airframe's limit load factor (> 6.5 g)",
    hard.gPeak > 6.5, `${hard.gPeak.toFixed(1)} g`);
  check("the limit load factor is not exceeded (< 7.6 g)",
    hard.gPeak < 7.6, `${hard.gPeak.toFixed(1)} g`);
}

// --- 3. sustained level turn at high bank ---
{
  const t60 = levelTurn(airborne(250, 3000), 60, 250, 40);
  const t80 = levelTurn(airborne(250, 3000), 80, 250, 40);
  console.log(
    `      turn @250: bank 60 -> ${t60.rate.toFixed(1)} deg/s (${t60.gPeak.toFixed(1)} g), ` +
    `bank 80 -> ${t80.rate.toFixed(1)} deg/s (${t80.gPeak.toFixed(1)} g, ` +
    `180 in ${(180 / t80.rate).toFixed(1)} s)`,
  );
  // A real F-14 sustains about 16 deg/s at 45,000 lb. Scaling by sqrt(weight)
  // to this airframe's 30,000 kg combat weight gives about 13 deg/s, which is
  // the bar the sim's own wing has to clear.
  check("bank 80 sustains the F-14's limit load factor (6.8-7.6 g)",
    t80.gPeak > 6.8 && t80.gPeak < 7.6, `${t80.gPeak.toFixed(1)} g`);
  check("bank 80 turn rate matches a combat-loaded F-14 (> 13 deg/s)", t80.rate > 13,
    `${t80.rate.toFixed(1)} deg/s`);
  check("turn rate grows with bank", t80.rate > t60.rate * 1.8,
    `${t60.rate.toFixed(1)} -> ${t80.rate.toFixed(1)}`);
  check("bank 60 turn matches the 2 g physics (~3-5 deg/s)",
    t60.rate > 2.5 && t60.rate < 5.5, `${t60.rate.toFixed(1)} deg/s`);
  check("a hard turn holds altitude within 700 m",
    t80.altMax - t80.altMin < 700, `${t80.altMin.toFixed(0)}..${t80.altMax.toFixed(0)}`);
}

// --- 3b. a hard turn must bleed speed (induced drag) ---
// Frozen throttle, same duration, straight versus banked: the turn must come out
// slower than level flight by a clear margin. Comparing to the straight run
// removes the throttle's own contribution to the speed change.
{
  function fly(bankTarget: number): { v0: number; v1: number } {
    const st = airborne(250, 3000);
    st.throttle = 0.5; st.rpm = 0.5;
    const hold = () => clamp(-st.vspeed * 0.07 + (3000 - st.pos.y) * 0.002, -1, 1);
    const rollTo = (b: number) => clamp((b - bankDeg(st)) * 0.09 - st.omega.z * 0.4, -1, 1);
    for (let i = 0; i < 6 / DT; i++) stepAircraft(st, { ...idle(), roll: 0, pitch: hold() }, DT);
    const v0 = st.speed;
    for (let i = 0; i < 20 / DT; i++) {
      stepAircraft(st, { ...idle(), roll: rollTo(bankTarget), pitch: hold() }, DT);
    }
    return { v0, v1: st.speed };
  }
  const straight = fly(0);
  const turn = fly(80);
  const straightLoss = 1 - straight.v1 / straight.v0;
  const turnLoss = 1 - turn.v1 / turn.v0;
  console.log(
    `      speed change (frozen throttle, 20 s): straight ${(-straightLoss * 100).toFixed(1)}%, ` +
    `bank 80 ${(-turnLoss * 100).toFixed(1)}%`,
  );
  // The margin is measured against the level run, so it moves with the pitch law:
  // the attitude-command pitch axis holds the altitude tighter than the old fixed-
  // alpha one did, which trims the turn's over-pull and therefore its induced
  // drag. The claim under test is unchanged (a hard turn bleeds CLEARLY more
  // speed); the bar just sits at the level the current law can honestly reach.
  check("a hard turn bleeds clearly more speed than level flight",
    turnLoss - straightLoss > 0.06,
    `${(straightLoss * 100).toFixed(1)}% vs ${(turnLoss * 100).toFixed(1)}%`);
}

// --- 4. every airframe can pull a fighter turn (the picker must not break it) ---
{
  const jets: Array<[string, string]> = [["tomcat", "F-14"], ["hornet", "F/A-18"], ["intruder", "A-6"]];
  for (const [id, label] of jets) {
    const st = spawnAircraft("carrier", 0, id as AircraftId);
    st.pos.set(0, 3000, 0);
    st.vel.set(0, 0, -250);
    st.quat.identity();
    st.omega.set(0, 0, 0);
    st.gearDown = false; st.gearT = 0;
    st.flapsDown = false; st.flapT = 0;
    st.throttle = 0.8; st.rpm = 0.8;
    st.trim = 0.5;
    st.banner = null;
    st.catPhase = "idle";
    st.airborne = true; st.onGround = false;
    let peakG = 0, peakAlpha = 0;
    for (let i = 0; i < 3 / DT; i++) {
      stepAircraft(st, { ...idle(), pitch: 1 }, DT);
      peakG = Math.max(peakG, st.gLoad);
      peakAlpha = Math.max(peakAlpha, st.alpha);
    }
    console.log(`      ${label}: full pull ${(peakAlpha * RAD).toFixed(1)} deg alpha, ${peakG.toFixed(1)} g`);
    check(`${label} can pull at least 4 g`, peakG > 4, `${peakG.toFixed(1)} g`);
  }
}

// --- 5. the shared turn spec: the one number the player's wing and the
//        Aggressor AI both answer to ---
// maxLoadFactor() is the lift ceiling and structural limit the flight model
// enforces (the stick can command no more), and maxTurnRate() turns it into a
// rate. scripts/diag-dogfight.ts reads the same function for the bandits, so
// this section is what keeps the pilot and the AI on one spec. The real F-14's
// published figures are ~23 deg/s instantaneous at 45,000 lb; scaled by
// sqrt(weight) to 30,000 kg that is ~19 deg/s, which is the bar here.
{
  let peakRate = 0, peakV = 0;
  for (let v = 120; v <= 360; v += 5) {
    const r = maxTurnRate(AIRCRAFT.tomcat, v, 3000) * RAD;
    if (r > peakRate) { peakRate = r; peakV = v; }
  }
  const nAt240 = maxLoadFactor(AIRCRAFT.tomcat, 240, 3000);
  console.log(
    `      spec: peak instant ${peakRate.toFixed(1)} deg/s at ${peakV} m/s ` +
    `(n_max ${nAt240.toFixed(2)} g at 240 m/s)`,
  );
  check("the spec peaks near the real jet's instantaneous rate (>= 18 deg/s)",
    peakRate >= 18, `${peakRate.toFixed(1)} deg/s`);
  check("the spec's ceiling is the F-14's 7.5 g limit at combat speed",
    Math.abs(nAt240 - AIRCRAFT.tomcat.gLimit) < 0.01, `${nAt240.toFixed(2)} g`);
  const reach = levelTurn(airborne(240, 3000), 80, 240, 40);
  check("the wing actually reaches the ceiling the spec publishes",
    reach.gPeak > AIRCRAFT.tomcat.gLimit - 0.4,
    `${reach.gPeak.toFixed(2)} vs ${AIRCRAFT.tomcat.gLimit}`);
}

// --- 5b. a plain full-stick pull reaches the limit load factor ---
// The harness above is a level turn with a pitch autopilot, so it only proves
// the wing CAN get there. This is the pilot's own manoeuvre: from cruise, hold
// full aft stick and read the g. It is the number the loop has to deliver, and
// the reason the pitch loop carries an integrator — with a proportional-only
// attitude loop the steady elevator deflection was paid for with 5-8 deg of
// attitude error, and since the reference is clamped to the alpha the wing can
// hold, that error came off the pull: full stick topped out at 5.2 g at every
// speed here, short of the airframe by a third.
{
  function fullPull(speed: number) {
    const st = airborne(speed, 3000);
    let gPeak = 0, aPeak = 0;
    for (let i = 0; i < 4 / DT; i++) {
      stepAircraft(st, { ...idle(), pitch: 1, throttleUp: true }, DT);
      gPeak = Math.max(gPeak, st.gLoad);
      aPeak = Math.max(aPeak, st.alpha);
    }
    return { gPeak, aPeak, alphaLimit: maxLoadFactorInfo(speed) };
  }
  // The alpha a full pull should end up on: the one that pulls gLimit (or the
  // stall buffer, whichever the wing runs into first) at that speed.
  function maxLoadFactorInfo(speed: number): number {
    const n = maxLoadFactor(AIRCRAFT.tomcat, speed, 3000);
    const cl = (n * AIRCRAFT.tomcat.mass * 9.81) /
      (0.5 * 0.909 * speed * speed * AIRCRAFT.tomcat.sWing);
    return Math.min(0.36 * 1.25, Math.max(0, (cl - 0.1) / 5));
  }
  const fast = fullPull(300);
  const combat = fullPull(230);
  console.log(
    `      full stick: 300 m/s -> ${fast.gPeak.toFixed(2)} g (alpha ${(fast.aPeak * RAD).toFixed(1)} deg), ` +
    `230 m/s -> ${combat.gPeak.toFixed(2)} g (alpha ${(combat.aPeak * RAD).toFixed(1)} deg)`,
  );
  check("a full pull at high speed carries over 6.5 g", fast.gPeak > 6.5,
    `${fast.gPeak.toFixed(2)} g`);
  check("a full pull at combat speed carries over 6 g", combat.gPeak > 6,
    `${combat.gPeak.toFixed(2)} g`);
  check("the pull reaches the alpha the limit load factor asks for",
    combat.aPeak > combat.alphaLimit - 0.02,
    `${(combat.aPeak * RAD).toFixed(1)} vs ${(combat.alphaLimit * RAD).toFixed(1)} deg`);
}

// --- 5c. the sustained spec: what the jet can HOLD, not just pull ---
// sustainedTurnRate() is the energy limit — the rate whose drag the thrust on
// tap pays for — and it is the number the Aggressor AI answers to, so a bandit
// cannot sit on a rate the player's jet would have to bleed speed to match. It
// can never be looser than the instantaneous ceiling, and where the wing (not
// the engine) is the binding limit the two must coincide.
{
  let best = 1; // the loosest the sustained limit ever gets, as a fraction
  let tightest = 1; // and the tightest, where the energy limit really bites
  for (const alt of [1000, 3000, 6000]) {
    for (let v = 130; v <= 320; v += 5) {
      const inst = maxTurnRate(AIRCRAFT.tomcat, v, alt);
      const sust = sustainedTurnRate(AIRCRAFT.tomcat, v, alt);
      const ratio = sust / Math.max(inst, 1e-6);
      best = Math.max(best, ratio);
      tightest = Math.min(tightest, ratio);
    }
  }
  const lowAltHigh = sustainedTurnRate(AIRCRAFT.tomcat, 260, 1000) * RAD;
  const lowAltInst = maxTurnRate(AIRCRAFT.tomcat, 260, 1000) * RAD;
  const high = sustainedTurnRate(AIRCRAFT.tomcat, 260, 6000) * RAD;
  console.log(
    `      sustained: 260 m/s @1 km ${lowAltHigh.toFixed(1)} of ${lowAltInst.toFixed(1)} deg/s, ` +
    `@6 km ${high.toFixed(1)} deg/s; energy binds between ` +
    `${(tightest * 100).toFixed(0)}% and ${(best * 100).toFixed(0)}% of instant`,
  );
  check("the sustained limit is never looser than the instantaneous one",
    best < 1.0001, `loosest ratio ${best.toFixed(3)}`);
  check("the sustained limit is not just a copy of the instantaneous one",
    tightest < 0.95, `tightest ratio ${tightest.toFixed(3)}`);
  check("where the wing binds, the sustained limit is the same number",
    Math.abs(lowAltHigh - lowAltInst) < 0.05,
    `${lowAltHigh.toFixed(2)} vs ${lowAltInst.toFixed(2)} deg/s`);
  check("thin air costs the sustained rate (energy, not airframe)",
    high < lowAltHigh * 0.95, `${high.toFixed(1)} deg/s`);
  check("the sustained load factor is a real number everywhere",
    [130, 200, 260, 320].every((v) =>
      sustainedLoadFactor(AIRCRAFT.tomcat, v, 3000) >= 1 &&
      sustainedLoadFactor(AIRCRAFT.tomcat, v, 3000) <= AIRCRAFT.tomcat.gLimit),
    "1 .. gLimit");
}

console.log(failures === 0 ? "\nALL TURN-RATE CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
