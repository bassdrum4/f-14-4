// Lateral-directional handling diagnosis for the Tomcat flight model:
//   1. yaw/beta impulse  — raw dutch-roll damping of the bare airframe
//   2. sustained banked turn under a bank/altitude-hold pilot — is the bank
//      holdable, or does it oscillate (the "death wobble" report)?
//   3. max-performance turn at high alpha — how hard does stall buffet shake
//      the roll axis?
// Usage: bun scripts/diag-turn.ts

import { Vector3 } from "three";
import { spawnAircraft, stepAircraft, type AircraftState, type FlightInput } from "../src/sim/flight";

const DT = 1 / 120;
const RAD = 57.2958;

function idle(): FlightInput {
  return {
    pitch: 0, roll: 0, yaw: 0,
    throttleUp: false, throttleDown: false,
    trimUp: false, trimDown: false,
    brake: false, catHold: false, fire: false,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

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

/** + = right wing down (right bank), degrees. */
function bankDeg(st: AircraftState): number {
  const right = new Vector3(1, 0, 0).applyQuaternion(st.quat);
  return -Math.asin(clamp(right.y, -1, 1)) * RAD;
}

function pitchDeg(st: AircraftState): number {
  const fwd = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  return Math.asin(clamp(fwd.y, -1, 1)) * RAD;
}

function betaDeg(st: AircraftState): number {
  const v = st.vel.clone().applyQuaternion(st.quat.clone().invert());
  return Math.atan2(v.x, Math.max(-v.z, 0.5)) * RAD;
}

/** The keyboard path: axis ramps toward its target at 3.6/s, then expo. */
class Axis {
  v = 0;
  move(target: number, dt: number, rate = 3.6): number {
    const step = rate * dt;
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

/** Crude pilot: bank/altitude/speed hold. */
class Pilot {
  roll = new Axis();
  pitch = new Axis();
  reversals = 0;
  private lastRollSign = 0;

  step(st: AircraftState, cmd: { bank: number; alt: number; speed: number }, dt: number): FlightInput {
    // two-loop bank hold: desired roll rate from bank error, aileron from rate error
    const bankErr = cmd.bank - bankDeg(st);
    const rollRight = -st.omega.z; // rad/s, + = rolling right
    const rateCmd = clamp(bankErr * 0.10, -1.4, 1.4);
    const rollTarget = clamp((rateCmd - rollRight) * 1.2, -1, 1);
    const roll = this.roll.move(rollTarget, dt);
    if (Math.sign(this.roll.raw) !== this.lastRollSign && Math.abs(this.roll.raw) > 0.05) {
      if (this.lastRollSign !== 0) this.reversals++;
      this.lastRollSign = Math.sign(this.roll.raw);
    }

    const vsCmd = clamp((cmd.alt - st.pos.y) * 0.1, -25, 25);
    const pitchTarget = clamp((vsCmd - st.vspeed) * 0.08, -1, 1);
    const pitch = this.pitch.move(pitchTarget, dt);

    const speedErr = cmd.speed - st.speed;
    return {
      ...idle(),
      roll,
      pitch,
      throttleUp: speedErr > 1,
      throttleDown: speedErr < -1,
    };
  }
}

function settle(st: AircraftState, pilot: Pilot, cmd: { bank: number; alt: number; speed: number }, secs: number): void {
  for (let i = 0; i < secs / DT; i++) stepAircraft(st, pilot.step(st, cmd, DT), DT);
}

// ---------------------------------------------------------------------------
// 1. Dutch roll: side-slip impulse, controls free.
// ---------------------------------------------------------------------------

function dutchRoll(): { freqHz: number; decayPer10s: number; bankP2P: number } {
  const st = airborne(220, 3000);
  st.vel.set(25, 0, -220); // ~6.5 deg of sideslip
  const log: Array<{ t: number; beta: number; bank: number }> = [];
  for (let i = 0; i < 30 / DT; i++) {
    stepAircraft(st, idle(), DT);
    if (i % 10 === 0) log.push({ t: st.time, beta: betaDeg(st), bank: bankDeg(st) });
  }
  // count beta zero crossings and compare envelope peaks between early/late windows
  let crossings = 0;
  let prev = log[0].beta;
  let firstPeak = 0, firstPeakT = 0, lastPeak = 0, lastPeakT = 0;
  for (const p of log) {
    if (Math.sign(p.beta) !== Math.sign(prev) && Math.abs(p.beta) > 0.02) crossings++;
    if (Math.abs(p.beta) > Math.abs(firstPeak) && p.t < 5) {
      firstPeak = p.beta; firstPeakT = p.t;
    }
    if (p.t > 20 && Math.abs(p.beta) > Math.abs(lastPeak)) {
      lastPeak = p.beta; lastPeakT = p.t;
    }
    prev = p.beta;
  }
  const freqHz = firstPeakT > 0 ? crossings / 2 / (log[log.length - 1].t - 0) : 0;
  const halfPeriod = freqHz > 0 ? 1 / (2 * freqHz) : 0;
  void halfPeriod;
  const decayPer10s = Math.abs(firstPeak) > 1e-6 ? lastPeak / firstPeak : 0;
  const banks = log.map((p) => p.bank);
  const bankP2P = Math.max(...banks) - Math.min(...banks);
  console.log(`  beta impulse: freq ~${freqHz.toFixed(2)} Hz, envelope ${firstPeak.toFixed(2)} -> ${lastPeak.toFixed(2)} deg over ${(lastPeakT - firstPeakT).toFixed(1)}s (ratio ${decayPer10s.toFixed(2)})`);
  console.log(`  bank excursion: ${bankP2P.toFixed(1)} deg peak-to-peak`);
  return { freqHz, decayPer10s, bankP2P };
}

// ---------------------------------------------------------------------------
// 2. Sustained 60 deg bank under the pilot model — bank wander + aileron work.
// ---------------------------------------------------------------------------

function sustainedTurn(): { bankMin: number; bankMax: number; betaRms: number; reversals: number } {
  const st = airborne(200, 3000);
  const pilot = new Pilot();
  const cmd = { bank: 0, alt: 3000, speed: 200 };
  settle(st, pilot, cmd, 12);
  console.log(`  settled: ${st.speed.toFixed(0)} m/s, vs ${st.vspeed.toFixed(2)}, alt ${st.pos.y.toFixed(0)}`);
  cmd.bank = 60;
  const rows: Array<{ t: number; bank: number; beta: number; roll: number; pitch: number; alt: number }> = [];
  const prevReversals = pilot.reversals;
  for (let i = 0; i < 60 / DT; i++) {
    const inp = pilot.step(st, cmd, DT);
    stepAircraft(st, inp, DT);
    if (i % 120 === 0) {
      rows.push({ t: st.time, bank: bankDeg(st), beta: betaDeg(st), roll: pilot.roll.raw, pitch: pilot.pitch.raw, alt: st.pos.y });
    }
  }
  const late = rows.filter((r) => r.t > 30);
  const banks = late.map((r) => r.bank);
  const bankMin = Math.min(...banks);
  const bankMax = Math.max(...banks);
  const betaRms = Math.sqrt(late.reduce((a, r) => a + r.beta * r.beta, 0) / late.length);
  console.log("  t     bank   beta   rollIn  pitchIn   alt");
  for (const r of rows) {
    console.log(
      `  ${r.t.toFixed(0).padStart(3)}  ${r.bank.toFixed(1).padStart(6)}  ${r.beta.toFixed(1).padStart(5)}  ${r.roll.toFixed(2).padStart(6)}  ${r.pitch.toFixed(2).padStart(6)}  ${r.alt.toFixed(0)}`,
    );
  }
  console.log(`  last 30s: bank ${bankMin.toFixed(1)}..${bankMax.toFixed(1)} (${(bankMax - bankMin).toFixed(1)} wide), beta RMS ${betaRms.toFixed(2)} deg, aileron reversals ${pilot.reversals - prevReversals}`);
  return { bankMin, bankMax, betaRms, reversals: pilot.reversals - prevReversals };
}

// ---------------------------------------------------------------------------
// 3. High-alpha turn: buffet strength on the roll axis.
// ---------------------------------------------------------------------------

function buffetTurn(): { rollP2P: number } {
  const st = airborne(200, 3000);
  const pilot = new Pilot();
  settle(st, pilot, { bank: 0, alt: 3000, speed: 200 }, 12);
  // roll to 75 deg bank then pull hard enough to sit just past the stall break
  for (let i = 0; i < 4 / DT; i++) {
    stepAircraft(st, { ...idle(), roll: shrink(clamp((75 - bankDeg(st)) * 0.10, -1, 1)) }, DT);
  }
  const roll = new Axis();
  let stalledFrames = 0;
  let maxRollRate = 0;
  let minRollRate = 0;
  const rollRates: number[] = [];
  for (let i = 0; i < 8 / DT; i++) {
    // alpha hold ~0.27 rad (just past the 0.26 break) via the pitch axis
    const pitchTarget = clamp((0.27 - st.alpha) * 12, -1, 1);
    const pitch = roll.move(pitchTarget, DT);
    stepAircraft(st, { ...idle(), pitch }, DT);
    if (i > 2 / DT) {
      if (st.stalled) stalledFrames++;
      rollRates.push(st.omega.z * RAD);
      maxRollRate = Math.max(maxRollRate, st.omega.z * RAD);
      minRollRate = Math.min(minRollRate, st.omega.z * RAD);
    }
  }
  const p2p = maxRollRate - minRollRate;
  const mean = rollRates.reduce((a, b) => a + b, 0) / rollRates.length;
  const dev = Math.sqrt(rollRates.reduce((a, b) => a + (b - mean) * (b - mean), 0) / rollRates.length);
  console.log(`  alpha ${(st.alpha * RAD).toFixed(1)} deg, stalled ${st.stalled}, buffet frames ${stalledFrames}/${rollRates.length}`);
  console.log(`  roll rate: ${minRollRate.toFixed(1)}..${maxRollRate.toFixed(1)} deg/s (p2p ${p2p.toFixed(1)}, rms ${dev.toFixed(1)})`);
  return { rollP2P: p2p };
}

console.log("== lateral handling diagnostic ==");
console.log("\n1) dutch roll (controls free):");
const dr = dutchRoll();
console.log("\n2) 60 deg banked turn:");
const turn = sustainedTurn();
console.log("\n3) high-alpha turn (buffet):");
const buffet = buffetTurn();
console.log("\nsummary:");
console.log(`  dutch roll freq ${dr.freqHz.toFixed(2)} Hz, 10s envelope ratio ${dr.decayPer10s.toFixed(2)} (1.0 = undamped)`);
console.log(`  bank hold spread ${(turn.bankMax - turn.bankMin).toFixed(1)} deg, aileron reversals ${turn.reversals}`);
console.log(`  buffet roll-rate peak-to-peak ${buffet.rollP2P.toFixed(1)} deg/s`);
