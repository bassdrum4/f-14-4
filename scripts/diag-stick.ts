// Diagnostic: pitch stick sweep — does each stick position settle to a
// sensible, monotonic climb/descent with no oscillation?
// Usage: bun scripts/diag-stick.ts

import { Vector3 } from "three";
import {
  spawnAircraft,
  stepAircraft,
  type AircraftState, type FlightInput } from "../src/sim/flight";

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

function sweep(label: string, make: () => AircraftState, holdSec: number): void {
  console.log(`\n[${label}] holding a stick position for ${holdSec}s, reading the settled state`);
  for (const stick of [-0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]) {
    const st = make();
    const inp = idle();
    inp.pitch = stick;
    // let it settle
    for (let i = 0; i < Math.round(holdSec / DT); i++) stepAircraft(st, inp, DT);
    // measure the last 5 s for residual oscillation
    let minP = Infinity, maxP = -Infinity;
    for (let i = 0; i < Math.round(5 / DT); i++) {
      stepAircraft(st, inp, DT);
      const p = pitchDeg(st);
      minP = Math.min(minP, p); maxP = Math.max(maxP, p);
    }
    console.log(
      `   stick ${stick.toFixed(2).padStart(5)} -> pitch ${pitchDeg(st).toFixed(1).padStart(5)} alpha ${(st.alpha * 57.2958).toFixed(1).padStart(5)} vs ${(st.vspeed * 196.85).toFixed(0).padStart(6)}fpm v ${(st.speed * 1.94384).toFixed(0).padStart(3)}kt  residual wobble ${(maxP - minP).toFixed(2)} deg${st.stalled ? "  STALLED" : ""}`,
    );
  }
}

sweep("250 kt cruise", () => airborne(3000, 129), 20);
sweep("140 kt approach (gear+flaps)", () => airborne(600, 72, { gear: true, flaps: true }), 20);
sweep("450 kt fast", () => airborne(6000, 232), 20);