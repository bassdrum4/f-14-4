// The launch point: landing somewhere sticks.
//
// A sortie that ends on a deck (or the shore runway) writes that spot down as
// the next launch point, so FLY AGAIN, RESTART FLIGHT and the pilot's next
// session lift off from the deck they actually recovered on — not from
// whichever carrier the mission started on. The spot rides in the gamestate
// (localStorage + the cloud profile), so it survives a reload and a callsign
// pull on another machine.
//
// Usage: bun scripts/diag-launch.ts  (or: bun run test:launch)

// minimal localStorage shim, same as diag-settings
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

import { Vector3, Quaternion, Euler } from "three";
import {
  GLIDE_AIM_S,
  GLIDE_DEG,
  approachSpeed,
  glideStateFor,
  recoveryLaunchPoint,
  spawnAircraft,
  stepAircraft,
  type AircraftState,
  type FlightInput,
} from "../src/sim/flight";
import { STRIP, airfield, carriers, deckAxes, worldToDeck, type CarrierDef } from "../src/sim/world";
import { defaultSettings, loadSettings, saveSettings, withLaunchPoint, type Settings } from "../src/settings";
import { Sim } from "../src/sim/engine";
import { applyGamestate, profileOf } from "../src/accounts";
import type { GamestateProfile } from "../src/gamestate";

const DT = 1 / 120;
const RAD = 180 / Math.PI;
const RTD = Math.PI / 180;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

function idle(): FlightInput {
  return {
    pitch: 0, roll: 0, yaw: 0,
    throttleUp: false, throttleDown: false,
    trimUp: false, trimDown: false,
    brake: false, catHold: false,
  };
}

/** s (down the angled strip) and d (off its centreline) for a world point. */
function stripCoords(c: CarrierDef, x: number, z: number): { s: number; d: number } {
  const [along, across] = worldToDeck(c, x, z);
  const th = c.landingAngleDeg * RTD;
  const relA = along - STRIP.startAlong;
  const relC = across - STRIP.startAcross;
  return {
    s: relA * Math.cos(th) - relC * Math.sin(th),
    d: relA * Math.sin(th) + relC * Math.cos(th),
  };
}

/** The strip frame in world coordinates: the point at (s, d) on the boat. */
function stripPoint(c: CarrierDef, s: number, d: number): Vector3 {
  const th = c.landingAngleDeg * RTD;
  const relA = s * Math.cos(th) + d * Math.sin(th);
  const relC = -s * Math.sin(th) + d * Math.cos(th);
  const { fwd, right } = deckAxes(c.headingDeg);
  const along = STRIP.startAlong + relA;
  const across = STRIP.startAcross + relC;
  return new Vector3(
    c.x + fwd[0] * along + right[0] * across,
    c.deckY,
    c.z + fwd[1] * along + right[1] * across,
  );
}

function pitchDeg(st: AircraftState): number {
  return Math.asin(clamp(new Vector3(0, 0, -1).applyQuaternion(st.quat).y, -1, 1)) * RAD;
}
function bankDeg(st: AircraftState): number {
  return Math.asin(clamp(-new Vector3(1, 0, 0).applyQuaternion(st.quat).y, -1, 1)) * RAD;
}

console.log("launch point — settings + gamestate");
{
  const KEY = "f14sim.settings.v1";
  store.clear();
  const fresh = loadSettings();
  check("a fresh pilot launches from the first boat", fresh.launchCarrier === 0, String(fresh.launchCarrier));
  check("a fresh pilot launches by catapult", fresh.launchKind === "carrier", fresh.launchKind);
  check("the defaults are explicit", defaultSettings().launchKind === "carrier" && defaultSettings().launchCarrier === 0);

  // A stored landing point comes back.
  saveSettings({ ...fresh, launchKind: "airfield", launchCarrier: 3 });
  const reloaded = loadSettings();
  check("a stored launch point survives a reload", reloaded.launchKind === "airfield" && reloaded.launchCarrier === 3,
    `${reloaded.launchKind}/${reloaded.launchCarrier}`);

  // Junk is refused rather than trusted.
  store.set(KEY, JSON.stringify({ launchKind: "spaceship", launchCarrier: -7 }));
  const junk = loadSettings();
  check("an unknown launch kind falls back", junk.launchKind === "carrier", junk.launchKind);
  check("a negative boat index is clamped", junk.launchCarrier === 0, String(junk.launchCarrier));

  // The cloud profile carries it both ways.
  const profile = profileOf({ ...defaultSettings(), launchKind: "carrier", launchCarrier: 2 });
  check("the profile ships the launch point", profile.launchKind === "carrier" && profile.launchCarrier === 2,
    `${profile.launchKind}/${profile.launchCarrier}`);
  const brought = applyGamestate(defaultSettings(), profile);
  check("a fetched profile brings it home", brought.launchKind === "carrier" && brought.launchCarrier === 2,
    `${brought.launchKind}/${brought.launchCarrier}`);
  // A profile written before the field existed must not erase the local one.
  const older = { ...profile, launchKind: undefined, launchCarrier: undefined } as unknown as GamestateProfile;
  const kept = applyGamestate({ ...defaultSettings(), launchCarrier: 4 }, older);
  check("an older profile keeps the local launch point", kept.launchCarrier === 4, String(kept.launchCarrier));
  const bad = applyGamestate({ ...defaultSettings(), launchCarrier: 1 }, { ...profile, launchCarrier: -2 } as GamestateProfile);
  check("a fetched boat index is clamped", bad.launchCarrier === 0, String(bad.launchCarrier));

  // The sim's write: a settled pilot rewrites nothing, a moved one does.
  const settled = defaultSettings();
  check("launching from the boat already on file writes nothing", withLaunchPoint(settled, "carrier", 0) === null);
  const movedKind = withLaunchPoint(settled, "airfield", 0);
  check("a runway sortie changes the launch kind", movedKind?.launchKind === "airfield", JSON.stringify(movedKind?.launchKind));
  const movedBoat = withLaunchPoint(settled, "carrier", 2);
  check("a landing on boat 3 changes the boat", movedBoat?.launchCarrier === 2, String(movedBoat?.launchCarrier));
  check("a nonsense boat index is read as the first boat",
    withLaunchPoint({ ...settled, launchCarrier: 3 }, "carrier", -5)?.launchCarrier === 0);
  check("a clamped no-op still writes nothing", withLaunchPoint(settled, "carrier", -5) === null);
}

console.log("launch point — which surface the sortie ended on");
{
  const fleet = carriers();
  check("the fleet has more than one boat", fleet.length > 1, String(fleet.length));

  // Parked on the third boat: the deck under the jet names the launch point,
  // whatever boat the sortie originally launched from.
  const onThird = spawnAircraft("carrier", 2);
  const third = recoveryLaunchPoint(onThird, 0);
  check("a jet on boat 3 reports boat 3", third?.kind === "carrier" && third.carrier === 2, JSON.stringify(third));

  // Landed away from home (the dogfight case): the deck it sits on wins.
  const moved = spawnAircraft("carrier", 0);
  const other = fleet[2];
  moved.pos.set(other.x, other.deckY + 1.2, other.z);
  moved.groundKind = "deck";
  moved.airborne = false;
  const movedPoint = recoveryLaunchPoint(moved, 0);
  check("a landing on another boat moves home to it", movedPoint?.carrier === 2, JSON.stringify(movedPoint));

  // The shore runway is its own launch point.
  const onRunway = spawnAircraft("airfield", 0);
  const runwayPoint = recoveryLaunchPoint(onRunway, 1);
  check("the runway reports an airfield launch", runwayPoint?.kind === "airfield", JSON.stringify(runwayPoint));

  // A death is not a landing: the deck on file stands.
  const dead = spawnAircraft("carrier", 1);
  dead.crashFall = true;
  dead.result = { kind: "crash", title: "SHOT DOWN", detail: "" };
  check("a shot-down jet changes nothing", recoveryLaunchPoint(dead, 1) === null);
}

console.log("launch point — a real trap reads the deck it caught on");
{
  const boat = 2;
  const c = carriers()[boat];
  const aim = stripPoint(c, GLIDE_AIM_S, 0);
  const start = stripPoint(c, GLIDE_AIM_S - 2600, 0);
  const dir = aim.clone().sub(start).setY(0).normalize();
  // Launched from boat 1, flown onto boat 3: the trap must name boat 3.
  const st = spawnAircraft("carrier", 0);
  st.pos.copy(start);
  st.pos.y = c.deckY + 2600 * Math.tan(GLIDE_DEG * RTD);
  const heading = (Math.atan2(dir.x, -dir.z) * RAD + 360) % 360;
  const att = (-GLIDE_DEG + 12) * RTD;
  st.quat.copy(new Quaternion().setFromEuler(new Euler(att, -heading * RTD, 0, "YXZ")));
  const onSpeed = approachSpeed(st.spec, st.pos.y).onSpeedKt / 1.94384;
  st.vel.copy(dir).multiplyScalar(onSpeed).setY(-onSpeed * Math.sin(GLIDE_DEG * RTD));
  st.omega.set(0, 0, 0);
  st.gearDown = true; st.gearT = 1;
  st.flapsDown = true; st.flapT = 1;
  st.throttle = 0.55; st.rpm = 0.55;
  st.trim = 0.5; st.banner = null; st.catPhase = "idle";
  st.airborne = true; st.onGround = false; st.pitchRef = att;

  for (let i = 0; i < Math.round(120 / DT) && !st.result; i++) {
    const inp = idle();
    const V = Math.max(st.speed, 20);
    const guide = glideStateFor(st);
    const devM = guide ? guide.deviationM : 0;
    const vsTarget = -(V * Math.tan(GLIDE_DEG * RTD) + clamp(devM, -80, 80) * 0.06);
    const fpaTarget = Math.asin(clamp(vsTarget / V, -0.4, 0.4));
    const clNeeded = (st.spec.mass * 9.81) / (0.5 * 1.225 * V * V * st.spec.sWing);
    const aoaNeeded = clamp((clNeeded - 0.1 - st.spec.flapLift * st.flapT) / st.spec.clAlpha, -0.1, st.spec.alphaStall);
    inp.pitch = clamp(6 * (fpaTarget + aoaNeeded - pitchDeg(st) * RTD) - 1.2 * st.omega.x, -1, 1);
    const { d } = stripCoords(c, st.pos.x, st.pos.z);
    inp.roll = clamp((clamp(-d * 0.02 * RAD, -20, 20) - bankDeg(st)) * 0.09 - 0.45 * st.omega.z, -1, 1);
    inp.throttleUp = V < onSpeed;
    inp.throttleDown = V > onSpeed + 3;
    stepAircraft(st, inp, DT);
  }

  console.log(`      result ${st.result?.kind ?? "none"} ${st.result?.title ?? ""} on deck ${st.deckRoll ?? "-"}`);
  check("the scripted approach ends in a trap on boat 3", st.result?.kind === "wire", `${st.result?.kind ?? "none"}`);
  check("the jet is sitting on that boat's deck", st.groundKind === "deck", st.groundKind);
  const point = recoveryLaunchPoint(st, 0);
  check(
    "the trap names the deck it caught on, not the boat it launched from",
    point?.kind === "carrier" && point.carrier === boat,
    JSON.stringify(point),
  );
}

console.log("launch point — a real runway landing");
{
  const af = airfield();
  const st = spawnAircraft("airfield", 0);
  st.airborne = true;
  st.onGround = false;
  st.speed = 40;
  st.vel.set(0, -0.4, 0);
  st.throttle = 0; st.rpm = 0.05;
  st.gearDown = true; st.gearT = 1;
  st.quat.copy(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -af.headingDeg * RTD));
  for (let i = 0; i < Math.round(90 / DT) && !st.result; i++) {
    const inp = idle();
    inp.brake = true;
    stepAircraft(st, inp, DT);
  }
  console.log(`      result ${st.result?.kind ?? "none"} ${st.result?.title ?? ""} at ${st.speed.toFixed(1)} m/s`);
  check("rolling to a stop on the runway is a landing", st.result?.kind === "landing", `${st.result?.kind ?? "none"}`);
  const point = recoveryLaunchPoint(st, 0);
  check("the runway landing makes the runway the next launch", point?.kind === "airfield", JSON.stringify(point));
}

console.log("launch point — the engine writes it down (real stepSim, no WebGL)");
{
  // Same trick as diag-battle-recovery: a real Sim prototype with only the
  // state this path touches. The pilot launches from boat 1, ends the sortie
  // parked on boat 3, and the engine must both move home and tell the UI.
  const sim = Object.create(Sim.prototype) as Record<string, any>;
  const seen: Settings[] = [];
  sim.settings = { ...defaultSettings(), missionMode: "cruise" };
  sim.settingsListeners = new Set();
  sim.phaseListeners = new Set();
  (sim.settingsListeners as Set<(s: Settings) => void>).add((s) => seen.push(s));
  sim.netState = { status: "idle" };
  sim.phase = "flying";
  sim.crashSeq = null;
  sim.acc = 0;
  sim.pod = false;
  sim.spawnCarrier = 0;
  sim.inputPitch = 0; sim.inputRoll = 0; sim.inputYaw = 0;
  sim.input = { sample: () => ({ pitch: 0, roll: 0, yaw: 0, fire: false }) };
  sim.df = { step: () => {}, refill: () => {} };
  sim.rig = { resetFollow: () => {} };
  sim.updateJetPose = sim.updateAudio = sim.updateHud = () => {};
  sim.state = spawnAircraft("carrier", 2);
  sim.state.time = 60;
  sim.state.flightTime = 60;
  sim.state.result = { kind: "landing", title: "DECK LANDING", detail: "Recovered" };
  sim.prevPos = new Vector3();
  sim.prevQuat = new Quaternion();

  sim.stepSim(1 / 120);

  check("the engine moves home to the boat it landed on", sim.settings.launchCarrier === 2,
    String(sim.settings.launchCarrier));
  check("...and says the launch kind is a carrier", sim.settings.launchKind === "carrier", sim.settings.launchKind);
  check("...and tells the UI (which stores it) exactly once", seen.length === 1 && seen[0].launchCarrier === 2,
    `listeners fired ${seen.length}×`);
  check("the parked sortie keeps that boat for its relaunch", sim.spawnCarrier === 2 && sim.mission === "carrier",
    `${sim.spawnCarrier}/${sim.mission}`);
}

if (failures > 0) {
  console.error(`\n${failures} launch-point check(s) failed`);
  process.exit(1);
}
console.log("\nlaunch point: all checks pass");
