import { strict as assert } from "node:assert";
import { Scene, Vector3, Quaternion } from "three";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { Sim } from "../src/sim/engine";
import { Multiplayer } from "../src/net/multiplayer";
import { defaultSettings } from "../src/settings";

// Exercise the real transition and combat lifecycle without a WebGL/audio device.
function simulation(mode: "strike" | "dogfight", host?: boolean): any {
  const scene = new Scene();
  const sim: any = Object.create(Sim.prototype);
  Object.assign(sim, {
    df: new Dogfight(scene, new ExplosionField(scene, "low")),
    settings: { ...defaultSettings(), missionMode: mode },
    netState: { status: host === undefined ? "idle" : "online", host, pilots: [] },
    mission: "carrier", spawnCarrier: 0, operationSeed: 1, operationId: 100,
    phase: "menu", phaseListeners: new Set(), settingsListeners: new Set(),
    prevPos: new Vector3(), prevQuat: new Quaternion(),
    rig: { resetFollow() {} }, input: { clearEdges() {} },
    audio: { start() {}, resume() {} }, updateHud() {},
  });
  sim.beginMission("carrier", 0);
  return sim;
}
for (const mode of ["strike", "dogfight"] as const) {
  for (const status of ["success", "failure"] as const) {
    const sim = simulation(mode);
    sim.df.operation.start(); sim.df.operation.finish(status === "success", "test resolved mission");
    sim.finishOperation();
    sim.nextOperation();
    assert.equal(sim.phase, "flying");
    assert.equal(sim.operationDebrief, false);
    assert.equal(sim.df.operationState.seed, 2);
    assert.equal(sim.df.operationState.status, "briefing");
    assert(sim.df.operationState.id > 100);
    sim.df.dispose();
    console.log(`PASS solo ${mode}/${status} advances to a fresh operation`);
  }
}

// Complete objectives through combat, leaving wrecks/retreating aircraft to
// exercise the cleanup that the button actually encounters after a sortie.
for (const mode of ["strike", "dogfight"] as const) {
  const sim = simulation(mode);
  const df: any = sim.df;
  if (mode === "strike") {
    df.beginStrike(sim.state);
    for (const t of df.strikeTargets.filter((t: any) => t.role === "cargo").slice(0, 2)) df.damageTarget(t, 100, sim.state);
  } else {
    df.begin(sim.state);
    df.step(2, sim.state, false);
    df.operation.state.phase = "strike";
    df.damageCarrier(new Vector3(df.cv.def.x, df.cv.def.deckY, df.cv.def.z), sim.state, 100);
  }
  df.step(.01, sim.state, false);
  assert.equal(df.operationState.status, "success");
  sim.nextOperation();
  assert.equal(df.operationState.seed, 2);
  assert.equal(df.operationState.status, "briefing");
  const origin = { ...sim.operationOrigin };
  const id = sim.operationId;
  sim.restart();
  assert.equal(df.operationState.seed, 2, "retry must preserve the operation seed");
  assert.deepEqual(sim.operationOrigin, origin);
  assert(sim.operationId > id, "retry needs a fresh combat epoch");
  sim.df.dispose();
  console.log(`PASS ${mode} completion cleans up and next/retry preserve their distinct semantics`);
}

for (const mode of ["strike", "dogfight"] as const) {
  const host = simulation(mode, true), wing = simulation(mode, false);
  const net: any = new Multiplayer();
  Object.assign(net, { host: true, status: "online", mode, missionStyle: "operation" });
  host.net = net;
  let launches = 0;
  net.conns.set("wing", { open: true, send(wire: string) {
    const msg = JSON.parse(wire);
    if (msg.t === "launch") { launches++; wing.followLaunch(msg.mission, msg.carrier, msg.profile); }
  } });
  host.df.operation.start(); host.df.operation.finish(true, "resolved host operation");
  wing.df.applySharedSnapshot(host.df.sharedSnapshot(), 1000);
  host.finishOperation(); wing.finishOperation();
  host.nextOperation();
  assert.equal(launches, 1);
  assert.equal(host.phase, "flying"); assert.equal(wing.phase, "flying");
  assert.equal(host.operationDebrief, false); assert.equal(wing.operationDebrief, false);
  assert.equal(wing.operationId, host.operationId);
  assert.equal(wing.operationSeed, 2);
  assert.equal(net.roomLaunch.profile.seed, 2, "late joiners must get the new operation");
  wing.df.applySharedSnapshot(host.df.sharedSnapshot(), 1100);
  assert.equal(wing.df.operationState.seed, 2);
  assert.equal(wing.df.operationState.status, "briefing");
  wing.nextOperation();
  assert.equal(wing.operationSeed, 2, "wingmen cannot independently advance the room");
  assert.equal(launches, 1);
  host.df.dispose(); wing.df.dispose();
  console.log(`PASS multiplayer ${mode}: host advances paused wingman and late-join profile together`);
}
