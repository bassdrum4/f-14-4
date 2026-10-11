// Regression: the pitch axis must hold an attitude, not run away.
//
// The old elevator law commanded a fixed alpha per stick position, so any stick
// above the trim alpha was a permanent load factor: pull a little at cruise and
// the jet climbed and climbed for a minute or more (until the stall broke it
// down), and letting go never stopped it. These checks pin the replacement
// behaviour: the stick points the nose, centring it freezes the attitude, and
// nothing the pilot is not holding can loop the jet.
// Usage: bun scripts/diag-climb.ts  (or: bun run test:climb)
import { Vector3 } from "three";
import {
  spawnAircraft,
  stepAircraft,
  type AircraftState,
  type FlightInput,
} from "../src/sim/flight";

const DT = 1 / 120;
const RAD = 180 / Math.PI;
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
    brake: false, catHold: false,
  };
}
function pitchDeg(st: AircraftState): number {
  return Math.asin(clamp(new Vector3(0, 0, -1).applyQuaternion(st.quat).y, -1, 1)) * RAD;
}
function airborne(speed: number, alt: number): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.set(-1800, alt, 2400);
  st.quat.identity();
  st.vel.set(0, 0, -speed);
  st.gearDown = false; st.gearT = 0; st.flapsDown = false; st.flapT = 0;
  st.throttle = 0.6; st.rpm = 0.6; st.trim = 0.5;
  st.banner = null; st.catPhase = "idle";
  st.airborne = true; st.onGround = false;
  st.pitchRef = 0;
  return st;
}

/** Fly `secs`, calling `plan` for the stick each step; returns the samples. */
function fly(
  st: AircraftState,
  secs: number,
  plan: (t: number, st: AircraftState) => FlightInput,
): void {
  for (let i = 0; i < Math.round(secs / DT); i++) stepAircraft(st, plan(st.time, st), DT);
}

// --- 1. hands off at cruise: the attitude holds, it does not dive or loop ----
{
  const st = airborne(180, 3000);
  fly(st, 40, () => idle());
  const att = pitchDeg(st);
  console.log(`      hands-off 40 s at 350 kt: pitch ${att.toFixed(1)} deg, alt ${st.pos.y.toFixed(0)} m`);
  check("hands off, the nose holds the attitude it had (within 5 deg)", Math.abs(att) < 5, `${att.toFixed(1)} deg`);
  check("hands off, no dive: still above 2000 m after 40 s", st.pos.y > 2000, `${st.pos.y.toFixed(0)} m`);
}

// --- 2. pull then release: the rotation stops where the pilot left it --------
{
  const st = airborne(180, 3000);
  fly(st, 6, () => ({ ...idle(), pitch: 0.3 }));
  const released = pitchDeg(st);
  fly(st, 2, () => idle());
  const settled = pitchDeg(st);
  fly(st, 8, () => idle());
  const later = pitchDeg(st);
  console.log(
    `      release at ${released.toFixed(1)} deg -> ${settled.toFixed(1)} -> ${later.toFixed(1)} deg over 8 s`,
  );
  check("the nose stops moving within 2 deg after release", Math.abs(settled - later) < 2,
    `${settled.toFixed(1)} -> ${later.toFixed(1)}`);
  check("the jet keeps the attitude it was pointed at (> 3 deg nose up)", later > 3, `${later.toFixed(1)} deg`);
  check("no runaway rotation", Math.abs(st.omega.x) < 0.05, `${st.omega.x.toFixed(3)} rad/s`);
}

// --- 3. a held stick cannot be a permanent pull-up after release ------------
{
  const st = airborne(180, 3000);
  fly(st, 5, () => ({ ...idle(), pitch: 0.12 }));
  fly(st, 30, () => idle());
  console.log(`      after a 5 s 12% pull: pitch ${pitchDeg(st).toFixed(1)} deg, alpha ${(st.alpha * RAD).toFixed(1)} deg`);
  check("the attitude survives the release (a climb, not a loop)", pitchDeg(st) > -5 && pitchDeg(st) < 45,
    `${pitchDeg(st).toFixed(1)} deg`);
  check("the wing is still flying (not stalled for the rest of the flight)", !st.stalled,
    `alpha ${(st.alpha * RAD).toFixed(1)} deg`);
}

// --- 4. the cat shot flies away instead of mushing into the sea -------------
{
  const st = spawnAircraft("carrier", 0);
  const hold = { ...idle(), catHold: true, throttleUp: true };
  for (let i = 0; i < Math.round(8 / DT) && st.catPhase !== "firing"; i++) stepAircraft(st, hold, DT);
  st.time = 0;
  fly(st, 30, () => idle());
  console.log(`      30 s after a cat shot: alt ${st.pos.y.toFixed(0)} m, ${(st.speed * 1.94384).toFixed(0)} kt`);
  check("a cat shot climbs out with the stick centred", st.pos.y > 100 && !st.result,
    `alt ${st.pos.y.toFixed(0)} m${st.result ? " — " + st.result.title : ""}`);
}

console.log(failures === 0 ? "\nALL PITCH-LAW CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
