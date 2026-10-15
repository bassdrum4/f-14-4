// Crash-replay regression: a fatal crash must actually play out and hand over
// to the result screen.
//
// The frame loop used to skip stepSim whenever crashSeq was set, but stepSim is
// the thing that OWNS the replay (its crashSeq branch advances the wreck, then
// calls setPhase("result")). Skipping it froze the wreck in the air with the
// menu never coming up — the only way out of the sortie was to quit it.
//
// This drives the real frame dispatch (advanceFrame) headlessly, so the bug
// lives on the same code path the game uses. It needs no WebGL, audio or DOM.
// Usage: bun scripts/diag-crash.ts

import { Quaternion, Vector3 } from "three";
import { Sim } from "../src/sim/engine";
import { spawnAircraft, type AircraftState } from "../src/sim/flight";
import { defaultSettings } from "../src/settings";
import { groundAt } from "../src/sim/world";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const FIXED = 1 / 120;
const FRAME = 1 / 60;

/** A crashed, airborne solo sortie with only the pieces stepSim touches. */
function crashSetup(): { sim: Record<string, any>; state: AircraftState } {
  const sim = Object.create(Sim.prototype) as Record<string, any>;
  sim.settings = { ...defaultSettings(), missionMode: "cruise" };
  sim.phaseListeners = new Set();
  sim.netState = { status: "idle" };
  sim.phase = "flying";
  sim.crashSeq = null;
  sim.acc = 0;
  sim.pod = false;
  sim.dfArmed = false;
  sim.recoveryPending = false;
  sim.launchRemembered = false;
  sim.mission = "carrier";
  sim.spawnCarrier = 0;
  sim.worldSeed = 4242;
  sim.weatherMode = "clear";
  sim.inputPitch = 0; sim.inputRoll = 0; sim.inputYaw = 0;
  sim.input = {
    sample: () => ({ pitch: 0, roll: 0, yaw: 0, fire: false }),
    take: () => false,
    takeMouse: () => ({ dx: 0, dy: 0 }),
  };
  sim.df = { step: () => {}, operationState: null };
  sim.explosions = { spawnBreakup: () => {}, spawn: () => {}, trail: () => {}, step: () => {} };
  sim.renderer = { setWind: () => {}, jetGroup: { visible: true } };
  sim.prevPos = new Vector3();
  sim.prevQuat = new Quaternion();
  sim.updateJetPose = sim.updateAudio = sim.updateHud = () => {};

  const st = spawnAircraft("carrier", 0);
  // Fly it into a crash: airborne, terminal, and already breaking up (what
  // flight.ts leaves behind after the fatal contact).
  st.pos.set(0, 400, 0);
  st.vel.set(0, 0, -120);
  st.quat.identity();
  st.onGround = false;
  st.airborne = true;
  st.catPhase = "idle";
  st.result = { kind: "crash", title: "SHOT DOWN", detail: "Downed by an aggressor." };
  st.crashFall = true;
  sim.state = st;
  return { sim, state: st };
}

// --- 1. the replay runs and the result screen arrives ------------------------
{
  const { sim, state } = crashSetup();
  let everFalling = false;
  let frames = 0;
  for (let i = 0; i < 3600 && sim.phase === "flying"; i++) {
    sim.advanceFrame(FRAME);
    frames++;
    if (sim.crashSeq) everFalling = true;
  }
  check("the crash replay started", everFalling, "crashSeq never set");
  check(
    "the sortie reaches the result screen instead of hanging",
    sim.phase === "result",
    `still ${sim.phase} after ${frames} frames`,
  );
  check(
    "the wreck came down, it did not hang in the air",
    state.pos.y < 400 - 50,
    `y ${state.pos.y.toFixed(0)}`,
  );
  check("the replay released the falling flag on impact", state.crashFall === false);
  const g = groundAt(state.pos.x, state.pos.z);
  check(
    "the wreck stopped on the surface",
    Math.abs(state.pos.y - g.y) < 8,
    `y ${state.pos.y.toFixed(1)} ground ${g.y.toFixed(1)}`,
  );
}

// --- 2. the stick is dead once the crash has begun --------------------------
// stepSim zeroes the axes during the replay, so nothing the pilot presses can
// fly the wreck out of the fireball.
{
  const { sim } = crashSetup();
  sim.advanceFrame(FRAME); // starts the replay
  check("the replay is running", sim.crashSeq !== null);
  sim.inputPitch = 1; sim.inputRoll = 1; sim.inputYaw = 1;
  sim.advanceFrame(FRAME);
  check(
    "control inputs are released while the wreck replays",
    sim.inputPitch === 0 && sim.inputRoll === 0 && sim.inputYaw === 0,
    `${sim.inputPitch}/${sim.inputRoll}/${sim.inputYaw}`,
  );
}

// --- 3. the result screen keeps hands off the frame dispatch ----------------
{
  const { sim } = crashSetup();
  sim.phase = "result";
  sim.crashSeq = { falling: false, t: 3, smokeT: 0 };
  sim.advanceFrame(FRAME);
  check("the result phase does not fall back into the sim", sim.phase === "result", sim.phase);
}

void FIXED;

console.log(failures === 0 ? "\nALL CRASH-REPLAY CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
