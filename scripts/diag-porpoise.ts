// Diagnostic: sustained keyboard pitch/roll holds and long hands-off runs.
// Looks for limit cycles (nose bobbing) rather than just response magnitudes.
// Usage: bun scripts/diag-porpoise.ts

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

function rollDeg(st: AircraftState): number {
  const right = new Vector3(1, 0, 0).applyQuaternion(st.quat);
  return Math.asin(Math.max(-1, Math.min(1, right.y))) * (180 / Math.PI);
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

function trace(label: string, st: AircraftState, seconds: number, inp: FlightInput, everySec = 2): void {
  const steps = Math.round(seconds / DT);
  const rows: string[] = [];
  let reversals = 0;
  let lastSign = 0;
  let prev = pitchDeg(st);
  let minP = Infinity, maxP = -Infinity;
  for (let i = 0; i < steps; i++) {
    stepAircraft(st, inp, DT);
    const p = pitchDeg(st);
    if (i > 20) {
      minP = Math.min(minP, p);
      maxP = Math.max(maxP, p);
      const d = p - prev;
      const s = Math.sign(d);
      if (s !== 0 && lastSign !== 0 && s !== lastSign && Math.abs(d) > 1e-3) reversals++;
      if (s !== 0) lastSign = s;
    }
    prev = p;
    if (i % Math.round(everySec / DT) === 0) {
      rows.push(
        `${(i * DT).toFixed(0).padStart(3)}s pitch=${p.toFixed(1).padStart(6)} roll=${rollDeg(st).toFixed(1).padStart(6)} alpha=${(st.alpha * 57.2958).toFixed(1).padStart(5)} v=${(st.speed * 1.94384).toFixed(0).padStart(3)}kt alt=${st.pos.y.toFixed(0).padStart(5)} stalled=${st.stalled ? "Y" : "n"}`,
      );
    }
  }
  console.log(`\n[${label}] pitch ${minP.toFixed(1)}..${maxP.toFixed(1)}, reversals ${reversals}`);
  console.log("   " + rows.join("\n   "));
}

// --- A: hold 25% nose-up at 250 kt for 60 s (player holding the key) ---
{
  const st = airborne(3000, 129);
  const inp = idle();
  inp.pitch = 0.25;
  trace("A hold 25% pitch, 250kt, 60s", st, 60, inp);
}

// --- B: hold 25% nose-up at 140 kt approach config ---
{
  const st = airborne(800, 72, { gear: true, flaps: true });
  const inp = idle();
  inp.pitch = 0.25;
  trace("B hold 25% pitch, 140kt gear/flaps, 60s", st, 60, inp);
}

// --- C: 300 s hands-off cruise (does the phugoid grow?) ---
{
  const st = airborne(3000, 129);
  const inp = idle();
  inp.throttleUp = true;
  for (let i = 0; i < Math.round(4 / DT); i++) stepAircraft(st, inp, DT);
  trace("C hands-off 300s after 4s throttle", st, 300, idle(), 10);
}

// --- D: hold 50% roll at 250 kt, 20 s (does it oscillate or just bank?) ---
{
  const st = airborne(3000, 129);
  const inp = idle();
  inp.roll = 0.5;
  trace("D hold 50% roll, 250kt, 20s", st, 20, inp, 1);
}