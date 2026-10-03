// Diagnostic: what the FIRST-PERSON camera actually sees. Measures airframe
// pitch-rate noise and attitude jitter, and checks the takeoff sequence.
// Usage: bun scripts/diag-firstperson.ts

import { Vector3 } from "three";
import {
  spawnAircraft,
  stepAircraft,
  type AircraftState,
  type FlightInput,
} from "../src/sim/flight";
import { groundAt } from "../src/sim/world";

const DT = 1 / 120;

function idle(): FlightInput {
  return {
    pitch: 0, roll: 0, yaw: 0,
    throttleUp: false, throttleDown: false,
    trimUp: false, trimDown: false,
    brake: false, catHold: false,
  };
}

function pitchDeg(st: AircraftState): number {
  const fwd = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  return Math.asin(Math.max(-1, Math.min(1, fwd.y))) * (180 / Math.PI);
}

function airborne(altM: number, speed: number, cfg: { gear?: boolean; flaps?: boolean } = {}): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.y = altM;
  st.gearDown = !!cfg.gear;
  st.gearT = cfg.gear ? 1 : 0;
  st.flapsDown = !!cfg.flaps;
  st.flapT = cfg.flaps ? 1 : 0;
  const fwd = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  st.vel.copy(fwd).multiplyScalar(speed);
  return st;
}

/** Simulate a pilot making small corrections, as in real first-person flying. */
function noisyPilot(seed: number): (i: number) => number {
  return (i: number) => {
    const t = i * DT;
    // slow drift + occasional small corrections
    return 0.22 * Math.sin(t * 0.7 + seed) + 0.12 * Math.sin(t * 2.3 + seed * 2);
  };
}

function report(label: string, st: AircraftState, seconds: number, getPitch: (i: number) => number): void {
  const steps = Math.round(seconds / DT);
  let sum = 0;
  let sumAbs = 0;
  let maxRate = 0;
  let reversals = 0;
  let lastSign = 0;
  let prev = pitchDeg(st);
  let minP = Infinity;
  let maxP = -Infinity;
  for (let i = 0; i < steps; i++) {
    const inp = idle();
    inp.pitch = getPitch(i);
    stepAircraft(st, inp, DT);
    const p = pitchDeg(st);
    const rate = Math.abs(st.omega.x) * 57.3;
    sum += rate;
    sumAbs += rate;
    maxRate = Math.max(maxRate, rate);
    minP = Math.min(minP, p);
    maxP = Math.max(maxP, p);
    const d = p - prev;
    const s = Math.sign(d);
    if (s !== 0 && lastSign !== 0 && s !== lastSign && Math.abs(d) > 1e-3) reversals++;
    if (s !== 0) lastSign = s;
    prev = p;
  }
  console.log(
    `[${label}] pitch ${minP.toFixed(1)}..${maxP.toFixed(1)} | mean |wx| ${(sum / steps).toFixed(1)} deg/s, max ${maxRate.toFixed(1)} deg/s | pitch direction reversals ${reversals} in ${seconds}s`,
  );
}

// --- small-correction flying, the common case ---
report("gentle corrections 250kt", airborne(3000, 129), 60, noisyPilot(0));
report("gentle corrections 180kt", airborne(1500, 93), 60, noisyPilot(1.7));
report("gentle corrections 140kt app", airborne(600, 72, { gear: true, flaps: true }), 60, noisyPilot(3.1));

// --- hands off after a disturbance ---
{
  const st = airborne(3000, 129);
  const tap = idle();
  tap.pitch = 1;
  for (let i = 0; i < Math.round(0.4 / DT); i++) stepAircraft(st, tap, DT);
  report("hands-off after tap", st, 90, () => 0);
}

// --- takeoff sequence with a realistic rotation ---
{
  const st = spawnAircraft("airfield", 0);
  const inp = idle();
  inp.throttleUp = true;
  let rotated = false;
  const rows: string[] = [];
  for (let i = 0; i < Math.round(70 / DT); i++) {
    const kt = st.speed * 1.94384;
    if (!rotated && kt > 150) rotated = true;
    inp.pitch = rotated ? (st.onGround ? 0.55 : 0.2) : 0;
    stepAircraft(st, inp, DT);
    if (i % Math.round(4 / DT) === 0) {
      const g = groundAt(st.pos.x, st.pos.z);
      rows.push(
        `${(i * DT).toFixed(0).padStart(3)}s kt=${kt.toFixed(0).padStart(3)} alt=${st.pos.y.toFixed(0).padStart(5)} ground=${g.y.toFixed(0).padStart(5)}(${g.kind}) pitch=${pitchDeg(st).toFixed(1).padStart(5)} onGround=${st.onGround ? "Y" : "n"} result=${st.result ? st.result.title : "-"}`,
      );
    }
  }
  console.log(`\n[takeoff]`);
  console.log("   " + rows.join("\n   "));
}