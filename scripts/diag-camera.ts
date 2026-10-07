// Headless camera checks for the chase/action views. The key behavior: the
// camera follows heading and pitch fully but only ROLL_FOLLOW of the bank, so
// a bank reads as the jet rolling about its own nose-tail axis while the
// horizon barely tilts — not the whole world pivoting about the line of sight
// to the camera. Also checks framing through banks/turns/climbs, the rigid
// action boom, chase smoothing, and mouse look.
// Usage: bun scripts/diag-camera.ts   (or: bun run test:camera)

import { Euler, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { CameraRig, ROLL_FOLLOW } from "../src/render/cameras";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const RAD = 180 / Math.PI;

/** Heading, then pitch, then bank about the nose axis (forward = -Z). */
function attitude(bankDeg: number, pitchDeg = 0, yawDeg = 0): Quaternion {
  const q = new Quaternion().setFromEuler(new Euler(pitchDeg / RAD, yawDeg / RAD, 0, "YXZ"));
  return q.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, -1), bankDeg / RAD));
}

const camera = new PerspectiveCamera(62, 1.6, 0.1, 12000);
camera.updateProjectionMatrix();
const rig = new CameraRig();

/**
 * Horizon tilt the ROLL_FOLLOW blend actually produces: blending the airframe
 * up with world up and re-normalising compresses at steep banks (18.4 deg at
 * 90, not the linear 22.5), so the expectation is computed the same way.
 */
function blendTilt(bankDeg: number): number {
  const b = bankDeg / RAD;
  return Math.atan2(ROLL_FOLLOW * Math.sin(b), (1 - ROLL_FOLLOW) + ROLL_FOLLOW * Math.cos(b)) * RAD;
}

interface Shot {
  /** Horizon tilt as seen in the frame (deg). */
  horizonTilt: number;
  /** Apparent roll of the jet's own up vector in the frame (deg). */
  jetTilt: number;
  /** Jet position in normalized device coordinates. */
  ndc: Vector3;
  /** Camera position relative to the jet. */
  camRel: Vector3;
}

/** Settle the rig in a mode, then measure one frame at the given attitude. */
function shoot(
  mode: "chase" | "action",
  bankDeg: number,
  pitchDeg = 0,
  yawDeg = 0,
  warm = 0,
): Shot {
  rig.mode = mode;
  const pos = new Vector3(0, 2200, 0);
  const q = attitude(bankDeg, pitchDeg, yawDeg);
  for (let i = 0; i < warm; i++) rig.update(camera, pos, q, 220, 1 / 60);
  rig.update(camera, pos, q, 220, 1 / 60);
  camera.updateMatrixWorld(true);
  const inv = camera.quaternion.clone().invert();
  const wu = new Vector3(0, 1, 0).applyQuaternion(inv);
  const ju = new Vector3(0, 1, 0).applyQuaternion(q).applyQuaternion(inv);
  return {
    horizonTilt: Math.atan2(wu.x, wu.y) * RAD,
    jetTilt: Math.atan2(ju.x, ju.y) * RAD,
    ndc: pos.clone().project(camera),
    camRel: camera.position.clone().sub(pos),
  };
}

// --- 1. roll follow: horizon stays nearly level, the jet does the rolling ---
for (const bank of [0, 30, 60, 90, -60]) {
  const s = shoot("action", bank);
  const wantHorizon = Math.abs(blendTilt(bank));
  const wantJet = Math.abs(bank - blendTilt(bank));
  check(
    `${bank} deg bank: horizon tilts only ~${wantHorizon.toFixed(0)} deg`,
    Math.abs(Math.abs(s.horizonTilt) - wantHorizon) < 5,
    `horizon ${s.horizonTilt.toFixed(1)} deg`,
  );
  check(
    `${bank} deg bank: jet visibly rolls (~${wantJet.toFixed(0)} deg)`,
    Math.abs(Math.abs(s.jetTilt) - wantJet) < 5,
    `jet ${s.jetTilt.toFixed(1)} deg`,
  );
  check(
    `${bank} deg bank: jet stays framed`,
    Math.abs(s.ndc.x) < 0.4 && Math.abs(s.ndc.y) < 0.9,
    `ndc ${s.ndc.x.toFixed(2)}, ${s.ndc.y.toFixed(2)}`,
  );
  if (bank !== 0) {
    check(
      `${bank} deg bank: jet and horizon rotate opposite ways`,
      s.horizonTilt * s.jetTilt < 0,
      `horizon ${s.horizonTilt.toFixed(1)}, jet ${s.jetTilt.toFixed(1)}`,
    );
  }
}

const chaseShot = shoot("chase", 60, 0, 0, 400);
check(
  "chase cam shares the same 0.25 roll follow",
  Math.abs(Math.abs(chaseShot.horizonTilt) - Math.abs(blendTilt(60))) < 5,
  `horizon ${chaseShot.horizonTilt.toFixed(1)} deg`,
);

// --- 2. action is a rigid boom; chase keeps its smoothing lag ---
{
  rig.mode = "action";
  const posA = new Vector3(0, 2200, 0);
  const qA = attitude(40);
  rig.update(camera, posA, qA, 220, 1 / 60);
  const relA = camera.position.clone().sub(posA);
  const posB = posA.clone().add(new Vector3(120, 40, 0));
  rig.update(camera, posB, qA, 220, 1 / 60);
  const relB = camera.position.clone().sub(posB);
  check(
    "action cam is rigid (no position lag)",
    relA.distanceTo(relB) < 1e-6,
    relA.distanceTo(relB).toExponential(1),
  );

  rig.mode = "chase";
  for (let i = 0; i < 400; i++) rig.update(camera, posA, qA, 220, 1 / 60);
  const c1 = camera.position.clone();
  rig.update(camera, posB, qA, 220, 1 / 60);
  const step = camera.position.clone().sub(c1);
  check(
    "chase cam lags a jump (smoothing alive)",
    step.length() > 1 && step.length() < 60,
    `moved ${step.length().toFixed(1)} m of 126`,
  );
}

// --- 3. heading and pitch are followed fully ---
{
  const turn = shoot("action", 45, 0, 120);
  const fwd = new Vector3(0, 0, -1).applyQuaternion(attitude(45, 0, 120));
  const behind = turn.camRel.dot(fwd);
  check("camera stays behind the jet in a 120 deg turn", behind < -5, `along-nose ${behind.toFixed(1)} m`);
  check(
    "jet framed in the turn",
    Math.abs(turn.ndc.x) < 0.4 && Math.abs(turn.ndc.y) < 0.9,
    `ndc ${turn.ndc.x.toFixed(2)}, ${turn.ndc.y.toFixed(2)}`,
  );

  const climb = shoot("action", 0, 30, 0);
  check("camera sits below the jet in a 30 deg climb", climb.camRel.y < 0, `dy ${climb.camRel.y.toFixed(1)} m`);
  check("jet framed in the climb", Math.abs(climb.ndc.x) < 0.35, `ndc x ${climb.ndc.x.toFixed(2)}`);
}

// --- 4. mouse look orbits the chase camera without losing the jet ---
{
  rig.mode = "chase";
  const pos = new Vector3(0, 2200, 0);
  const q = attitude(0);
  for (let i = 0; i < 400; i++) rig.update(camera, pos, q, 220, 1 / 60);
  rig.mouse(160, 70);
  for (let i = 0; i < 200; i++) rig.update(camera, pos, q, 220, 1 / 60);
  camera.updateMatrixWorld(true);
  const ndc = pos.clone().project(camera);
  check(
    "mouse look keeps the jet framed",
    Math.abs(ndc.x) < 0.5 && Math.abs(ndc.y) < 0.9,
    `ndc ${ndc.x.toFixed(2)}, ${ndc.y.toFixed(2)}`,
  );
}

if (failures > 0) {
  console.error(`\n${failures} camera check(s) FAILED`);
  process.exit(1);
}
console.log("\ncamera roll-axis behaviour verified");
