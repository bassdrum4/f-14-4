// Task Force Archon (Option 2): the three-stage theatre campaign.
//
// What has to hold:
//
//   * the campaign opens on the island bastion and cannot be won by clearing
//     the map — including the fleet-defence stage, which is the last one,
//   * stage 1 ends on the fortress primaries and hands over to the convoy: the
//     bastion's wrecks go with it, and the transports spawn in their place,
//   * stage 2 ends on stopped transports and hands over to fleet defence,
//     which stands up the opposing carrier and its launch queue,
//   * stage 3 ends on repelling every launch,
//   * losing the flagship fails the campaign outright at any stage,
//   * a sortie that is recovered and re-flown keeps the stage and everything
//     already wrecked — that is what makes it a campaign rather than a retry,
//   * the whole thing stays valid for the wire.
//
// Usage: bun scripts/diag-campaign.ts  (or: bun run test:campaign)

import { strict as assert } from "node:assert";
import { Scene } from "three";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { spawnAircraft } from "../src/sim/flight";
import { Operation, operationTitle, phaseObjective } from "../src/sim/operations";
import { validSharedCombat } from "../src/sim/combatSnapshot";
import { carriers, setWorldSeed, DEFAULT_SEED } from "../src/sim/world";
import { Sim } from "../src/sim/engine";
import { defaultSettings } from "../src/settings";

let failures = 0;
function test(name: string, run: () => void) {
  try {
    run();
    console.log("PASS " + name);
  } catch (e) {
    failures++;
    console.error("FAIL " + name, e);
  }
}

setWorldSeed(DEFAULT_SEED);

function campaignSortie(id = 501, seed = 3) {
  const scene = new Scene();
  const df: any = new Dogfight(scene, new ExplosionField(scene, "low"));
  const player = spawnAircraft("carrier", 0);
  player.pos.y = 3000;
  player.onGround = false;
  player.airborne = true;
  player.speed = 180;
  player.catPhase = "idle";
  df.setDefenders("pilot", []);
  df.configureOperations(true, seed, id, { x: carriers()[0].x, z: carriers()[0].z, heading: 0, carrier: 0 });
  df.prepareCampaign(player);
  df.beginCampaign(player);
  return { df, player, d: df as any };
}

/** Knock out every fortress primary, then let the operation step. */
function clearBastion(df: any, player: any, d: any): void {
  for (const t of d.strikeTargets) if (t.role === "bunker" || t.role === "hangar" || t.role === "fuel") d.damageTarget(t, 400, player);
  df.step(1 / 60, player, false);
}

test("the campaign opens on stage 1: the island bastion, not a convoy", () => {
  const { df, d } = campaignSortie();
  assert.equal(df.operationState!.kind, "campaign");
  assert.equal(df.operationState!.campaignStage, 1);
  assert.equal(df.operationState!.phase, "bastion");
  assert(d.strikeTargets.some((t: any) => t.role === "bunker"), "the fortress is on the grid");
  assert(!d.strikeTargets.some((t: any) => t.role === "cargo"), "and no convoy has been laid on yet");
  assert.equal(operationTitle(df.operationState!), "TASK FORCE ARCHON · STAGE 1/3");
  // The brief names the whole war; in flight the objective tracks the stage.
  const brief = Operation.create("campaign", 1, 1, 0);
  assert(phaseObjective(brief.state).includes("Stage 1: Neutralize Island Bastion IADS"));
  assert(phaseObjective(df.operationState!).includes("FORTRESS OBJECTIVES"), phaseObjective(df.operationState!));
  df.dispose();
});

test("stage 1 hands over to stage 2 with the convoy on the water", () => {
  const { df, player, d } = campaignSortie(502);
  clearBastion(df, player, d);
  assert.equal(df.operationState!.campaignStage, 2);
  assert.equal(df.operationState!.phase, "convoy");
  assert(!d.strikeTargets.some((t: any) => t.role === "bunker"), "the wrecked fortress is cleared away");
  assert.equal(d.strikeTargets.filter((t: any) => t.role === "cargo").length, 3, "three transports are under way");
  assert(operationTitle(df.operationState!).includes("STAGE 2/3"));
  // and the transports are a real convoy, not scenery
  for (const t of d.strikeTargets.filter((t: any) => t.role === "cargo")) assert(t.route && t.route.length > 0);
  df.dispose();
});

test("stage 2 hands over to stage 3, which stands up the opposing carrier", () => {
  const { df, player, d } = campaignSortie(503);
  clearBastion(df, player, d);
  const cargo = d.strikeTargets.filter((t: any) => t.role === "cargo");
  d.damageTarget(cargo[0], 400, player);
  d.damageTarget(cargo[1], 400, player);
  df.step(1 / 60, player, false);
  assert.equal(df.operationState!.campaignStage, 3);
  assert.equal(df.operationState!.phase, "scout");
  assert.equal(df.scenario, "dogfight", "the last stage is an air fight");
  assert(d.cv, "the opposing carrier is on the water");
  assert.equal(d.roleQueue[0], "scout");
  assert(!d.strikeTargets.some((t: any) => t.role === "cargo"), "the convoy is gone");
  df.dispose();
});

test("stage 3 runs the fleet-defence sequence to a win", () => {
  const { df, player, d } = campaignSortie(504);
  clearBastion(df, player, d);
  const cargo = d.strikeTargets.filter((t: any) => t.role === "cargo");
  d.damageTarget(cargo[0], 400, player);
  d.damageTarget(cargo[1], 400, player);
  df.step(1 / 60, player, false);
  assert.equal(df.operationState!.phase, "scout");
  // The scout launches; stopping it buys the long preparation window.
  for (let i = 0; i < 400 && !d.bandits.some((b: any) => b.role === "scout"); i++) df.step(.1, player, false);
  assert(d.bandits.some((b: any) => b.role === "scout"), "the opposing carrier gets its scout up");
  d.bandits.length = 0;
  df.step(1, player, false);
  assert.equal(df.operationState!.phase, "forming", "the scout is resolved into the stand-up");
  assert(df.operationState!.scoutStopped, "an unopposed scout is stopped, buying the full window");
  df.step(30, player, false);
  assert.equal(df.operationState!.phase, "forming", "45 seconds of preparation after a stopped scout");
  df.step(20, player, false);
  assert.equal(df.operationState!.phase, "strike", "then the bomber strike goes in");
  // Clear the strike off the map (queue and all): the phase only advances once
  // the launch queue is empty as well as the sky.
  d.bandits.length = 0;
  d.roleQueue = [];
  df.step(1, player, false);
  assert.equal(df.operationState!.phase, "counterattack");
  df.step(60, player, false);
  assert.equal(df.operationState!.phase, "final");
  d.bandits.length = 0;
  d.roleQueue = [];
  d.enemyBombs.length = 0;
  df.step(1, player, false);
  assert.equal(df.operationState!.status, "success", "the war ends when the last strike is repelled");
  df.dispose();
});

test("losing the flagship fails the campaign at any stage", () => {
  const early = Operation.create("campaign", 901, 1, 0);
  early.start();
  assert.equal(early.state.campaignStage, 1);
  early.damageFleet(120);
  assert.equal(early.state.status, "failure");
  const late = Operation.create("campaign", 902, 1, 0);
  late.start();
  late.state.campaignStage = 3;
  late.state.phase = "final";
  late.damageFleet(120);
  assert.equal(late.state.status, "failure");
});

test("a re-flown sortie keeps its stage and everything already wrecked", () => {
  const { df, player, d } = campaignSortie(505);
  clearBastion(df, player, d);
  const stage = df.operationState!.campaignStage;
  const targets = d.strikeTargets.map((t: any) => t.id);
  const hull = df.operationState!.fleetHull;
  // Land, rearm and launch again: the engine's recovery path calls beginCampaign
  // without rebuilding the operation, which is the whole point of a campaign.
  df.beginCampaign(player);
  assert.equal(df.operationState!.campaignStage, stage, "the stage survives the deck cycle");
  assert.deepEqual(d.strikeTargets.map((t: any) => t.id), targets, "and so does the theatre");
  assert.equal(df.operationState!.fleetHull, hull);
  df.dispose();
});

test("the campaign's shared frame validates on the wire at every stage", () => {
  const { df, player, d } = campaignSortie(506);
  assert(validSharedCombat(df.sharedSnapshot()));
  clearBastion(df, player, d);
  let frame = df.sharedSnapshot();
  assert(validSharedCombat(frame));
  assert.equal(frame.operation!.kind, "campaign");
  assert(frame.targets.every(t => ["cargo", "escort", "radar", "practice"].includes(t.role)), "a stage-2 frame carries the convoy and its escort");
  const cargo = d.strikeTargets.filter((t: any) => t.role === "cargo");
  d.damageTarget(cargo[0], 400, player);
  d.damageTarget(cargo[1], 400, player);
  df.step(1 / 60, player, false);
  frame = df.sharedSnapshot();
  assert(validSharedCombat(frame), JSON.stringify(frame.operation));
  assert.equal(frame.operation!.phase, "scout");
  assert.equal(frame.operation!.campaignStage, 3, "the stage rides the frame");
  df.dispose();
});

test("a wingman mirrors the campaign's stage rather than starting its own", () => {
  const host = campaignSortie(507);
  const wing = campaignSortie(507);
  clearBastion(host.df, host.player, host.d);
  wing.df.setMirror(true, wing.player);
  wing.df.applySharedSnapshot(host.df.sharedSnapshot(), 1000);
  assert.equal(wing.df.operationState!.campaignStage, 2, "the stage came off the wire");
  assert.equal(wing.df.operationState!.phase, "convoy");
  assert.equal(wing.d.strikeTargets.length, host.d.strikeTargets.length);
  host.df.dispose();
  wing.df.dispose();
});

test("the campaign cannot be won by clearing every enemy in the air", () => {
  const { df, player, d } = campaignSortie(508);
  // Spend a long time in stage 1 with everything hostile in the sky removed:
  // the bastion still has to be bombed, so the operation must stay open.
  for (let i = 0; i < 600; i++) {
    d.bandits.length = 0;
    df.step(.1, player, false, false, true);
  }
  assert.equal(df.operationState!.status, "active");
  assert.equal(df.operationState!.campaignStage, 1);
  df.dispose();
});

/**
 * The engine's launch path, with the rendering and audio it does not need: a
 * campaign is re-launched from the menu or the deck, not from inside a sortie.
 */
function engineFor(mode: "campaign" | "strike") {
  const df: any = new Dogfight(new Scene(), new ExplosionField(new Scene(), "low"));
  const player = spawnAircraft("carrier", 0);
  const sim: any = Object.create(Sim.prototype);
  Object.assign(sim, {
    settings: { ...defaultSettings(), missionMode: mode, missionStyle: "operation" },
    df, state: player, mission: "carrier", spawnCarrier: 0, phase: "menu",
    operationId: 1000, operationSeed: 7, operationOrigin: undefined,
    netState: { status: "idle" }, pings: [], lastDesignation: null, allPilotsDown: 0,
    combatSentAt: -Infinity, operationDebrief: false, recoveryPending: false,
    launchRemembered: false, crashSeq: null, pendingRoom: false, settingsRequest: false,
    breakupHide: false, battleLife: -1, battleDeadLife: -1, battleReadyAt: 0, battleRecoveryLife: -1,
    prevPos: player.pos.clone(), prevQuat: player.quat.clone(),
    rig: { resetFollow() {} },
    input: { take: () => false, clearEdges() {}, applySettings() {} },
    audio: { setVolume() {}, resume() {}, dispose() {}, combatFeedback() {}, start() {} },
    renderer: { setAircraft() {}, setAdaptiveResolution() {}, applyQuality() {} },
    net: { setAircraft() {}, setMode() {}, setMissionStyle() {}, setWeather() {}, dispose() {} },
    remoteFleet: { clear() {}, setLinkDelay() {}, dispose() {} },
    battle: { match: 0, pilots: [] }, chatLog: [],
    updateHud() {}, updateJetPose() {}, endPod() {}, updateAudio() {}, newState: () => player,
    setPhase(p: string) { sim.phase = p; },
  });
  return { sim, df, player, d: df as any };
}

test("re-launching a campaign sortie keeps its stage, its wrecks and its operation", () => {
  const { sim, df, player, d } = engineFor("campaign");
  sim.applySettings(sim.settings);
  sim.startMission("carrier");
  // Fly stage 1 out and let the operation hand over to the convoy.
  player.onGround = false; player.airborne = true; player.catPhase = "idle"; player.pos.y = 3000; player.speed = 200;
  df.beginCampaign(player);
  for (const t of d.strikeTargets) if (t.role === "bunker" || t.role === "hangar" || t.role === "fuel") d.damageTarget(t, 400, player);
  df.step(1 / 60, player, false);
  const stage = df.operationState!.campaignStage;
  const id = df.operationState!.id;
  assert.equal(stage, 2, "stage 1 handed over to the convoy");
  // Land, rearm and launch again: the same war, not a fresh one.
  sim.startMission("carrier");
  assert.equal(df.operationState!.campaignStage, stage, "the launch kept the stage");
  assert.equal(df.operationState!.id, id, "and the operation it belongs to");
  assert.equal(sim.operationId, id, "the sim is flying that operation, not a new one");
  assert.equal(df.operationState!.status, "active", "and it is still the live war");
  df.dispose();
  void df;
});

test("a non-campaign sortie, and a dead campaign, still start a fresh operation", () => {
  // Strike is re-tasked from scratch on every launch: the convoy goes back out.
  const strike = engineFor("strike");
  strike.sim.applySettings(strike.sim.settings);
  strike.sim.startMission("carrier");
  const firstId = strike.df.operationState!.id;
  strike.sim.startMission("carrier");
  assert.notEqual(strike.df.operationState!.id, firstId, "a strike relaunch is a new operation");
  strike.df.dispose();
  // A campaign the flagship has already lost is over: the next launch is stage 1.
  const lost = engineFor("campaign");
  lost.sim.applySettings(lost.sim.settings);
  lost.sim.startMission("carrier");
  lost.df.operation!.state.campaignStage = 3;
  lost.df.operation!.start();
  lost.df.operation!.damageFleet(120);
  assert.equal(lost.df.operationState!.status, "failure");
  lost.sim.startMission("carrier");
  assert.equal(lost.df.operationState!.campaignStage, 1, "a lost campaign restarts at stage 1");
  assert.equal(lost.df.operationState!.status, "briefing");
  lost.df.dispose();
});

if (failures) process.exit(1);
