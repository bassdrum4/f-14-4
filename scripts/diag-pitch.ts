// Diagnostic: measure the hands-off pitch oscillation in level cruise.
// Usage: bun scripts/diag-pitch.ts

import { Vector3 } from "three";
import {
  spawnAircraft,
  stepAircraft,
  type AircraftState,
  type FlightInput,
} from "../src/sim/flight";

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

/** Spawn airborne, flying along the nose, and step hands-off. */
function airborne(altM: number, speed: number, trim = 0.5): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.y = altM;
  st.gearDown = false;
  st.gearT = 0;
  st.flapsDown = false;
  st.flapT = 0;
  st.trim = trim;
  const fwd = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  st.vel.copy(fwd).multiplyScalar(speed);
  return st;
}

function run(label: string, st: AircraftState, seconds: number, inp = idle()): void {
  const steps = Math.round(seconds / DT);
  const rows: string[] = [];
  let prevPitch = pitchDeg(st);
  let reversals = 0;
  let lastSign = 0;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < steps; i++) {
    stepAircraft(st, inp, DT);
    const p = pitchDeg(st);
    if (i > steps * 0.15) {
      min = Math.min(min, p);
      max = Math.max(max, p);
      const d = p - prevPitch;
      const sign = Math.sign(d);
      if (sign !== 0 && lastSign !== 0 && sign !== lastSign && Math.abs(d) > 1e-4) reversals++;
      if (sign !== 0) lastSign = sign;
    }
    prevPitch = p;
    if (i % 120 === 0) {
      rows.push(
        `${(i * DT).toFixed(0)}s p=${p.toFixed(2)} a=${(st.alpha * 57.2958).toFixed(2)} v=${(st.speed * 1.94384).toFixed(0)}kt alt=${st.pos.y.toFixed(0)} wx=${st.omega.x.toFixed(4)}`,
      );
    }
  }
  const span = max - min;
  console.log(`\n[${label}] pitch span ${span.toFixed(2)} deg over ${seconds}s, direction reversals ${reversals}`);
  console.log("   " + rows.join("\n   "));
}

// --- H1: hands-off cruise, gear/flaps up, neutral trim ---
run("H1 cruise 2000m 400kt hands-off", airborne(2000, 205), 60);

// --- H2: hands-off cruise with trim set for level flight ---
run("H2 cruise 2000m 400kt trim 0.54", airborne(2000, 205, 0.54), 60);

// --- H3: disturb then release: 3 deg nose-up pulse for 1 s ---
{
  const st = airborne(2000, 205, 0.54);
  const pulse = idle();
  pulse.pitch = 0.35;
  run("H3 pulse 1s", st, 1, pulse);
  run("H3 release", st, 30);
}

// --- H4: slow-ish approach speed, gear down ---
{
  const st = airborne(600, 90, 0.5);
  st.gearDown = true;
  st.gearT = 1;
  st.flapsDown = true;
  st.flapT = 1;
  run("H4 approach 600m 175kt hands-off", st, 45);
}