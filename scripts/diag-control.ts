// Diagnostic: how violently does the airframe respond to realistic keyboard
// taps, and does it settle? Usage: bun scripts/diag-control.ts

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

function angles(st: AircraftState): { pitch: number; roll: number; hdg: number } {
  const fwd = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  const right = new Vector3(1, 0, 0).applyQuaternion(st.quat);
  return {
    pitch: Math.asin(Math.max(-1, Math.min(1, fwd.y))) * (180 / Math.PI),
    roll: Math.asin(Math.max(-1, Math.min(1, right.y))) * (180 / Math.PI),
    hdg: (Math.atan2(fwd.x, -fwd.z) * 180) / Math.PI,
  };
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

/** Keyboard-realistic: axis ramps 3.6/s toward target, expo applied. */
function axis(heldSeconds: number): number {
  const a = Math.min(1, 3.6 * heldSeconds);
  return 0.35 * a + 0.65 * a * a * a;
}

function tap(label: string, holdSec: number, kind: "pitch" | "roll" | "yaw", speed = 205): void {
  const st = airborne(2000, speed);
  const inp = idle();
  const v = axis(holdSec);
  inp[kind] = v;
  const steps = Math.round(holdSec / DT);
  let maxRate = 0;
  for (let i = 0; i < steps; i++) {
    stepAircraft(st, inp, DT);
    maxRate = Math.max(maxRate, Math.abs(st.omega.x), Math.abs(st.omega.z), Math.abs(st.omega.y));
  }
  const atRelease = angles(st);
  // now release and watch for 8 s
  const free = idle();
  let minP = Infinity, maxP = -Infinity, minR = Infinity, maxR = -Infinity;
  let reversals = 0;
  let prevP = atRelease.pitch;
  let lastSign = 0;
  const rows: string[] = [];
  for (let i = 0; i < 8 / DT; i++) {
    stepAircraft(st, free, DT);
    const a = angles(st);
    minP = Math.min(minP, a.pitch); maxP = Math.max(maxP, a.pitch);
    minR = Math.min(minR, a.roll); maxR = Math.max(maxR, a.roll);
    const d = a.pitch - prevP;
    const sign = Math.sign(d);
    if (sign !== 0 && lastSign !== 0 && sign !== lastSign && Math.abs(d) > 1e-3) reversals++;
    if (sign !== 0) lastSign = sign;
    prevP = a.pitch;
    if (i % 60 === 0) {
      rows.push(`    ${(i * DT).toFixed(1)}s pitch=${a.pitch.toFixed(2)} roll=${a.roll.toFixed(2)} hdg=${a.hdg.toFixed(1)}`);
    }
  }
  console.log(
    `\n[${label}] axis ${v.toFixed(2)} held ${holdSec}s -> at release pitch=${atRelease.pitch.toFixed(2)} roll=${atRelease.roll.toFixed(2)} hdg=${atRelease.hdg.toFixed(1)} | peak rate ${maxRate.toFixed(2)} rad/s (${(maxRate * 57.3).toFixed(0)} deg/s)`,
  );
  console.log(`   after release: pitch ${minP.toFixed(2)}..${maxP.toFixed(2)}, roll ${minR.toFixed(2)}..${maxR.toFixed(2)}, pitch reversals ${reversals}`);
  console.log(rows.join("\n"));
}

tap("P1 pitch tap 0.3s", 0.3, "pitch");
tap("P2 pitch hold 1.0s", 1.0, "pitch");
tap("R1 roll tap 0.3s", 0.3, "roll");
tap("R2 roll hold 1.0s", 1.0, "roll");
tap("Y1 yaw tap 0.3s", 0.3, "yaw");
tap("Y2 yaw hold 1.0s", 1.0, "yaw");
tap("S1 pitch tap 0.3s at 120kt", 0.3, "pitch", 62);
tap("S2 roll tap 0.3s at 120kt", 0.3, "roll", 62);