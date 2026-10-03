// Diagnostic: control authority check — can the jet still rotate, flare,
// roll, and land? Usage: bun scripts/diag-authority.ts

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

/** True bank angle (0 = level, +/-180 = inverted). */
function bankDeg(st: AircraftState): number {
  const right = new Vector3(1, 0, 0).applyQuaternion(st.quat);
  const up = new Vector3(0, 1, 0).applyQuaternion(st.quat);
  return (Math.atan2(right.y, up.y) * 180) / Math.PI;
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

function rollCheck(label: string, st: AircraftState): void {
  const inp = idle();
  inp.roll = 1;
  let t90 = Infinity;
  let t180 = Infinity;
  let t = 0;
  let peakRate = 0;
  for (let i = 0; i < Math.round(25 / DT); i++) {
    stepAircraft(st, inp, DT);
    t += DT;
    peakRate = Math.max(peakRate, Math.abs(st.omega.z) * 57.3);
    const b = Math.abs(bankDeg(st));
    if (b > 90 && t90 === Infinity) t90 = t;
    if (b > 178 && t180 === Infinity) t180 = t;
  }
  console.log(
    `[${label}] 90 deg in ${t90 === Infinity ? "n/a" : t90.toFixed(2) + "s"}, 180 deg in ${t180 === Infinity ? "n/a" : t180.toFixed(2) + "s"}, peak roll rate ${peakRate.toFixed(0)} deg/s`,
  );
}

/** Realistic takeoff: full throttle, rotate at ~150 kt, then hold 8 deg nose up. */
function takeoff(): void {
  const st = spawnAircraft("airfield", 0);
  const inp = idle();
  inp.throttleUp = true;
  let rotateSpeed = 0;
  let liftedAt = 0;
  for (let i = 0; i < Math.round(90 / DT); i++) {
    const kt = st.speed * 1.94384;
    // rotate at 150 kt; after liftoff, hold a gentle climb attitude
    if (kt > 150) {
      const target = st.onGround ? 1 : 0.22;
      inp.pitch = target;
      if (rotateSpeed === 0) rotateSpeed = kt;
    }
    stepAircraft(st, inp, DT);
    if (liftedAt === 0 && !st.onGround) liftedAt = st.pos.y - 140;
  }
  console.log(
    `[takeoff] rotate at ${rotateSpeed.toFixed(0)}kt, lifted ${liftedAt.toFixed(0)}m over runway, after 90s: alt ${st.pos.y.toFixed(0)}m pitch ${pitchDeg(st).toFixed(1)} alpha ${(st.alpha * 57.2958).toFixed(1)} v ${(st.speed * 1.94384).toFixed(0)}kt stalled=${st.stalled} onGround=${st.onGround}`,
  );
}

/** Flare: approach config, gear down, arrest the sink. */
function flare(): void {
  const st = airborne(300, 68, { gear: true, flaps: true });
  st.vel.y = -4.5;
  const inp = idle();
  inp.pitch = 1; // full aft stick — best case flare authority
  const rows: string[] = [];
  for (let i = 0; i < Math.round(8 / DT); i++) {
    stepAircraft(st, inp, DT);
    if (i % Math.round(0.5 / DT) === 0) {
      rows.push(
        `  ${(i * DT).toFixed(1)}s vs=${(st.vspeed * 196.85).toFixed(0).padStart(6)}fpm pitch=${pitchDeg(st).toFixed(1).padStart(5)} alpha=${(st.alpha * 57.2958).toFixed(1).padStart(5)} v=${(st.speed * 1.94384).toFixed(0).padStart(3)}kt alt=${st.pos.y.toFixed(0)}`,
      );
    }
  }
  console.log(`[flare full aft stick]`);
  console.log(rows.join("\n"));
}

rollCheck("roll 250kt", airborne(3000, 129));
rollCheck("roll 350kt", airborne(4000, 180));
rollCheck("roll 140kt approach", airborne(800, 72, { gear: true, flaps: true }));
takeoff();
flare();