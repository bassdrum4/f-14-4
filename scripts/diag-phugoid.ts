// Diagnostic: long-period pitch (phugoid / porpoising) behavior at realistic
// speeds, including the approach configuration. Usage: bun scripts/diag-phugoid.ts

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

/** Airborne at a given altitude/speed with an optional configuration. */
function airborne(altM: number, speed: number, cfg: { gear?: boolean; flaps?: boolean; trim?: number }): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.y = altM;
  st.gearDown = !!cfg.gear;
  st.gearT = cfg.gear ? 1 : 0;
  st.flapsDown = !!cfg.flaps;
  st.flapT = cfg.flaps ? 1 : 0;
  st.trim = cfg.trim ?? 0.5;
  const fwd = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  st.vel.copy(fwd).multiplyScalar(speed);
  return st;
}

/** Hold altitude roughly with a simple autothrottle-free level hold? No: pure hands-off. */
function run(label: string, st: AircraftState, seconds: number, inp = idle(), everySec = 2): void {
  const steps = Math.round(seconds / DT);
  const rows: string[] = [];
  let min = Infinity;
  let max = -Infinity;
  let reversals = 0;
  let lastSign = 0;
  let prev = pitchDeg(st);
  let maxVs = 0;
  for (let i = 0; i < steps; i++) {
    stepAircraft(st, inp, DT);
    const p = pitchDeg(st);
    if (i > steps * 0.1) {
      min = Math.min(min, p);
      max = Math.max(max, p);
      maxVs = Math.max(maxVs, Math.abs(st.vspeed));
      const d = p - prev;
      const sign = Math.sign(d);
      if (sign !== 0 && lastSign !== 0 && sign !== lastSign && Math.abs(d) > 1e-3) reversals++;
      if (sign !== 0) lastSign = sign;
    }
    prev = p;
    if (i % Math.round(everySec / DT) === 0) {
      rows.push(
        `${(i * DT).toFixed(0).padStart(3)}s pitch=${p.toFixed(2).padStart(7)} alpha=${(st.alpha * 57.2958).toFixed(2).padStart(6)} v=${(st.speed * 1.94384).toFixed(0).padStart(3)}kt alt=${st.pos.y.toFixed(0).padStart(5)} vs=${(st.vspeed * 196.85).toFixed(0).padStart(6)}fpm`,
      );
    }
  }
  console.log(`\n[${label}] pitch ${min.toFixed(2)}..${max.toFixed(2)} (span ${(max - min).toFixed(2)}), reversals ${reversals}, peak |vs| ${(maxVs * 196.85).toFixed(0)} fpm`);
  console.log("   " + rows.join("\n   "));
}

// --- PH1: 250 kt cruise, gear up, disturbed by a pitch tap then released ---
{
  const st = airborne(3000, 129, {});
  const tap = idle();
  tap.pitch = 1;
  run("PH1 tap", st, 0.4, tap, 100);
  run("PH1 hands-off 120s", st, 120);
}

// --- PH2: approach config 140 kt gear+flaps, small pitch tap, hands-off ---
{
  const st = airborne(500, 72, { gear: true, flaps: true });
  const tap = idle();
  tap.pitch = 1;
  run("PH2 tap", st, 0.25, tap, 100);
  run("PH2 hands-off 60s", st, 60);
}

// --- PH3: 200 kt gear down (downwind), hands-off ---
run("PH3 hands-off 90s", airborne(800, 103, { gear: true }), 90);

// --- PH4: 350 kt cruise, big nose-up tap, hands-off ---
{
  const st = airborne(4000, 180, {});
  const tap = idle();
  tap.pitch = 1;
  run("PH4 tap", st, 1.0, tap, 100);
  run("PH4 hands-off 120s", st, 120);
}