// Trace the simtest stall case: full aft stick at 117 kt.
// Usage: bun scripts/diag-stall.ts

import {
  spawnAircraft,
  stepAircraft,
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

const st = spawnAircraft("airfield");
st.pos.set(0, 2500, 0);
st.vel.set(0, 0, -60);
st.gearDown = false;
st.gearT = 0;
st.flapsDown = false;
st.flapT = 0;
st.throttle = 0.4;
st.rpm = 0.4;
st.banner = null;

const inp = { ...idle(), pitch: 1 };
let maxAlpha = 0;
let stalledAny = false;
let stalledSteps = 0;

console.log("  t     alpha   pitch     vs      v    stalled");
for (let i = 0; i < 1800; i++) {
  stepAircraft(st, inp, DT);
  maxAlpha = Math.max(maxAlpha, st.alpha);
  if (st.stalled) {
    stalledAny = true;
    stalledSteps++;
  }
  if (i % 60 === 0) {
    const fwd = { x: 0, y: 0, z: -1 };
    const q = st.quat;
    // rotate (0,0,-1) by quat
    const ix = q.w * fwd.x + q.y * fwd.z - q.z * fwd.y;
    const iy = q.w * fwd.y + q.z * fwd.x - q.x * fwd.z;
    const iz = q.w * fwd.z + q.x * fwd.y - q.y * fwd.x;
    const iw = -q.x * fwd.x - q.y * fwd.y - q.z * fwd.z;
    const fy = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
    const pitch = Math.asin(Math.max(-1, Math.min(1, fy))) * (180 / Math.PI);
    console.log(
      `${(i * DT).toFixed(1).padStart(5)}s ${(st.alpha * 57.3).toFixed(1).padStart(6)} ${pitch.toFixed(1).padStart(7)} ${(st.vspeed * 196.85).toFixed(0).padStart(7)} ${(st.speed * 1.94384).toFixed(0).padStart(5)} ${st.stalled ? "  STALL" : "      -"}`,
    );
  }
}

console.log(
  `\nmax alpha ${(maxAlpha * 57.3).toFixed(1)} deg | stalled at any point: ${stalledAny} (${stalledSteps} steps) | final alpha ${(st.alpha * 57.3).toFixed(1)} deg`,
);