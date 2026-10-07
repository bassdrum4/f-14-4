// Lateral-directional handling regression test. Guards the roll axis against
// the "death wobble": roll must stop when the key comes up, sideslip must not
// throw the wing, and a keyboard-style bank hold must settle instead of
// limit-cycling. Also checks stall buffet is a shake, not a roll command.
// Usage: bun scripts/diag-turn.ts   (or: bun run test:turn)

import { Vector3 } from "three";
import { spawnAircraft, stepAircraft, type AircraftState, type FlightInput } from "../src/sim/flight";

const DT = 1 / 120;
const RAD = 57.2958;

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function idle(): FlightInput {
  return {
    pitch: 0, roll: 0, yaw: 0,
    throttleUp: false, throttleDown: false,
    trimUp: false, trimDown: false,
    brake: false, catHold: false, fire: false,
  };
}

/** Airborne cruise state, heading -Z (north), gear/flaps up. */
function airborne(speed: number, alt: number): AircraftState {
  const st = spawnAircraft("carrier", 0);
  st.pos.set(0, alt, 0);
  st.vel.set(0, 0, -speed);
  st.quat.identity();
  st.omega.set(0, 0, 0);
  st.gearDown = false; st.gearT = 0;
  st.flapsDown = false; st.flapT = 0;
  st.speedbrake = false; st.sbT = 0;
  st.throttle = 0.3; st.rpm = 0.3;
  st.trim = 0.5;
  st.banner = null;
  st.catPhase = "idle";
  st.airborne = true; st.onGround = false;
  return st;
}

function bankDeg(st: AircraftState): number {
  const right = new Vector3(1, 0, 0).applyQuaternion(st.quat);
  return -Math.asin(clamp(right.y, -1, 1)) * RAD; // + = right bank
}

/** The keyboard path: press ramps at 3.6/s, release recentres at 2x, then expo. */
class Axis {
  v = 0;
  move(target: number, dt: number): number {
    const step = (target === 0 ? 7.2 : 3.6) * dt;
    if (this.v < target) this.v = Math.min(this.v + step, target);
    else if (this.v > target) this.v = Math.max(this.v - step, target);
    return shrink(this.v);
  }
  get raw(): number {
    return this.v;
  }
}

function shrink(v: number): number {
  const s = Math.sign(v);
  const a = Math.abs(v);
  return s * (0.35 * a + 0.65 * a * a * a);
}

/**
 * Human-like pilot. rollMode "rate": proportional bank hold driving a rate
 * command (a precise pilot). "bang": deadband on/off keying (most players).
 */
class Pilot {
  roll = new Axis();
  pitch = new Axis();
  reversals = 0;
  private lastSign = 0;

  step(
    st: AircraftState,
    cmd: { bank: number; alt: number; speed: number; alpha?: number },
    dt: number,
    rollMode: "rate" | "bang" = "rate",
  ): FlightInput {
    let rollTarget = 0;
    if (rollMode === "rate") {
      const bankErr = cmd.bank - bankDeg(st);
      const rateCmd = clamp(bankErr * 0.1, -1.4, 1.4);
      rollTarget = clamp((rateCmd - -st.omega.z) * 1.2, -1, 1);
    } else {
      const err = cmd.bank - bankDeg(st);
      const keyed = this.roll.raw !== 0 && Math.abs(this.roll.raw) < 0.99
        ? Math.abs(err) > 2 // hysteresis while keyed
        : Math.abs(err) > 6;
      rollTarget = keyed ? clamp(err * 0.2, -1, 1) : 0;
    }
    const roll = this.roll.move(rollTarget, dt);
    if (Math.sign(this.roll.raw) !== this.lastSign && Math.abs(this.roll.raw) > 0.05) {
      if (this.lastSign !== 0) this.reversals++;
      this.lastSign = Math.sign(this.roll.raw);
    }

    let pitchTarget: number;
    if (cmd.alpha !== undefined) {
      pitchTarget = clamp((cmd.alpha - st.alpha) * 12, -1, 1);
    } else {
      const vsCmd = clamp((cmd.alt - st.pos.y) * 0.1, -25, 25);
      pitchTarget = clamp((vsCmd - st.vspeed) * 0.08, -1, 1);
    }
    const pitch = this.pitch.move(pitchTarget, dt);

    const speedErr = cmd.speed - st.speed;
    return { ...idle(), roll, pitch, throttleUp: speedErr > 1, throttleDown: speedErr < -1 };
  }
}

// --- 1. sideslip impulse must not throw the wing -----------------------------
{
  const st = airborne(220, 3000);
  st.vel.set(25, 0, -220); // ~6.5 deg of sideslip
  let peakRollRate = 0;
  let peakBank = 0;
  for (let i = 0; i < 12 / DT; i++) {
    stepAircraft(st, idle(), DT);
    peakRollRate = Math.max(peakRollRate, Math.abs(st.omega.z * RAD));
    const b = bankDeg(st);
    if (Math.abs(b) > Math.abs(peakBank)) peakBank = b;
  }
  // The wing answers sideslip, but it must be a roll, not a snap: the old
  // 0.09 damping put 42 deg of bank on a 6.5 deg slip and kept drifting.
  check("6.5 deg slip: bank stays under 25 deg", Math.abs(peakBank) < 25, `peak bank ${peakBank.toFixed(1)}`);
  check("6.5 deg slip: no roll snap (>200 deg/s)", peakRollRate < 200, `peak roll rate ${peakRollRate.toFixed(0)} deg/s`);
}

// --- 2. sustained 60 deg turn holds steady -----------------------------------
{
  const st = airborne(200, 3000);
  const pilot = new Pilot();
  const cmd = { bank: 0, alt: 3000, speed: 200 };
  for (let i = 0; i < 12 / DT; i++) stepAircraft(st, pilot.step(st, cmd, DT), DT);
  cmd.bank = 60;
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < 60 / DT; i++) {
    stepAircraft(st, pilot.step(st, cmd, DT), DT);
    if (st.time > 30) {
      const b = bankDeg(st);
      min = Math.min(min, b);
      max = Math.max(max, b);
    }
  }
  check("steady turn: bank holds within 2 deg", max - min < 2, `spread ${(max - min).toFixed(1)} over ${min.toFixed(1)}..${max.toFixed(1)}`);
}

// --- 3. roll reversal inside a pull settles --------------------------------
{
  const st = airborne(230, 4000);
  const pilot = new Pilot();
  const cmd: { bank: number; alt: number; speed: number; alpha?: number } = { bank: 0, alt: 4000, speed: 230 };
  for (let i = 0; i < 12 / DT; i++) stepAircraft(st, pilot.step(st, cmd, DT), DT);
  cmd.bank = 60;
  cmd.alpha = 0.18;
  for (let i = 0; i < 6 / DT; i++) stepAircraft(st, pilot.step(st, cmd, DT), DT);
  const axis = new Axis();
  let releaseBank = 0;
  for (let i = 0; i < 1.5 / DT; i++) {
    const inp = pilot.step(st, cmd, DT);
    inp.roll = -Math.abs(axis.move(-1, DT));
    stepAircraft(st, inp, DT);
    releaseBank = bankDeg(st);
  }
  // let go of the stick and hold the attitude; the roll must stop promptly
  let after2s = releaseBank;
  let maxLateRate = 0;
  for (let i = 0; i < 8 / DT; i++) {
    const inp = pilot.step(st, { bank: 0, alt: 4000, speed: 230, alpha: 0.18 }, DT);
    inp.roll = 0;
    stepAircraft(st, inp, DT);
    if (i === 240) after2s = bankDeg(st);
    if (i > 2 / DT) maxLateRate = Math.max(maxLateRate, Math.abs(st.omega.z * RAD));
  }
  const overshoot = Math.abs(after2s - releaseBank);
  check("roll reversal: coast on release under 15 deg", overshoot < 15, `${releaseBank.toFixed(1)} -> ${after2s.toFixed(1)} deg`);
  check("roll reversal: settles afterwards (<20 deg/s)", maxLateRate < 20, `late roll rate ${maxLateRate.toFixed(0)} deg/s`);
}

// --- 4. keyboard bank hold settles ------------------------------------------
{
  const st = airborne(200, 3000);
  const pilot = new Pilot();
  for (let i = 0; i < 12 / DT; i++) stepAircraft(st, pilot.step(st, { bank: 0, alt: 3000, speed: 200 }, DT), DT);
  const cmd = { bank: 45, alt: 3000, speed: 200 };
  let min = Infinity, max = -Infinity;
  const before = pilot.reversals;
  for (let i = 0; i < 30 / DT; i++) {
    stepAircraft(st, pilot.step(st, cmd, DT, "bang"), DT);
    if (st.time > 16) { // skip the acquisition transient
      min = Math.min(min, bankDeg(st));
      max = Math.max(max, bankDeg(st));
    }
  }
  check("keyboard bank hold: settles near 45 deg", max - min < 15 && min > 30, `bank ${min.toFixed(1)}..${max.toFixed(1)}`);
  check("keyboard bank hold: few reversals", pilot.reversals - before < 12, `${pilot.reversals - before} reversals`);
}

// --- 5. departure buffet is a shake, not a roll command ---------------------
{
  const st = airborne(60, 3000);
  st.throttle = 0.5; st.rpm = 0.5;
  let stalled = 0;
  let maxAlpha = 0;
  const rates: number[] = [];
  for (let i = 0; i < 15 / DT; i++) {
    stepAircraft(st, { ...idle(), pitch: 1 }, DT);
    maxAlpha = Math.max(maxAlpha, st.alpha);
    if (st.stalled) stalled++;
    rates.push(st.omega.z * RAD);
  }
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const rms = Math.sqrt(rates.reduce((a, b) => a + (b - mean) * (b - mean), 0) / rates.length);
  check("full aft stick departs (alpha past stall)", maxAlpha > 0.26 && stalled > 0, `max alpha ${(maxAlpha * RAD).toFixed(1)} deg, ${stalled} frames stalled`);
  check("buffet shake stays bounded (<60 deg/s rms)", rms < 60, `roll rms ${rms.toFixed(1)} deg/s`);
}

console.log(failures === 0 ? "\nALL TURN HANDLING CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
