// Diagnostic: lateral-directional stability (dutch roll) hands-off.
// Usage: bun scripts/diag-lateral.ts

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

function rollDeg(st: AircraftState): number {
  const right = new Vector3(1, 0, 0).applyQuaternion(st.quat);
  return Math.asin(Math.max(-1, Math.min(1, right.y))) * (180 / Math.PI);
}

function betaDeg(st: AircraftState): number {
  const vBody = st.vel.clone().applyQuaternion(st.quat.clone().invert());
  const u = -vBody.z;
  return Math.atan2(vBody.x, Math.max(u, 0.5)) * (180 / Math.PI);
}

function headingDeg(st: AircraftState): number {
  const fwd = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  return (Math.atan2(fwd.x, -fwd.z) * 180) / Math.PI;
}

function airborne(altM: number, speed: number): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.y = altM;
  st.gearDown = false;
  st.gearT = 0;
  st.flapsDown = false;
  st.flapT = 0;
  const fwd = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  st.vel.copy(fwd).multiplyScalar(speed);
  return st;
}

function run(label: string, st: AircraftState, seconds: number, inp = idle(), every = 120): void {
  const steps = Math.round(seconds / DT);
  const rows: string[] = [];
  let reversals = 0;
  let lastSign = 0;
  let prev = rollDeg(st);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < steps; i++) {
    stepAircraft(st, inp, DT);
    const r = rollDeg(st);
    if (i > steps * 0.1) {
      min = Math.min(min, r);
      max = Math.max(max, r);
      const d = r - prev;
      const sign = Math.sign(d);
      if (sign !== 0 && lastSign !== 0 && sign !== lastSign && Math.abs(d) > 1e-4) reversals++;
      if (sign !== 0) lastSign = sign;
    }
    prev = r;
    if (i % every === 0) {
      rows.push(
        `${(i * DT).toFixed(1)}s roll=${r.toFixed(2)} beta=${betaDeg(st).toFixed(2)} hdg=${headingDeg(st).toFixed(1)} wy=${st.omega.y.toFixed(4)} wz=${st.omega.z.toFixed(4)}`,
      );
    }
  }
  console.log(`\n[${label}] roll span ${(max - min).toFixed(2)} deg, reversals ${reversals}`);
  console.log("   " + rows.join("\n   "));
}

// --- L1: clean cruise, hands off (is it stable at all?) ---
run("L1 cruise hands-off", airborne(2000, 205), 30, idle(), 60);

// --- L2: aileron pulse 0.5s then release ---
{
  const st = airborne(2000, 205);
  const pulse = idle();
  pulse.roll = 1;
  run("L2 aileron pulse 0.5s", st, 0.5, pulse, 60);
  run("L2 release", st, 30, idle(), 60);
}

// --- L3: rudder pulse 0.5s then release (dutch roll excitation) ---
{
  const st = airborne(2000, 205);
  const pulse = idle();
  pulse.yaw = 1;
  run("L3 rudder pulse 0.5s", st, 0.5, pulse, 60);
  run("L3 release", st, 30, idle(), 60);
}

// --- L4: sideslip kick then release ---
{
  const st = airborne(2000, 205);
  st.vel.add(new Vector3(18, 0, 0));
  run("L4 sideslip kick", st, 30, idle(), 60);
}