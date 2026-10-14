import { strict as assert } from "node:assert";
import { Scene, Vector3 } from "three";
import { Dogfight } from "../src/sim/dogfight";
import { Operation, convoyRoute, safeConvoyRoute } from "../src/sim/operations";
import { validSharedCombat } from "../src/sim/combatSnapshot";
import { ExplosionField } from "../src/render/effects";
import { spawnAircraft } from "../src/sim/flight";
import { carriers, setWorldSeed, DEFAULT_SEED } from "../src/sim/world";
import { Sim } from "../src/sim/engine";
import { defaultSettings } from "../src/settings";
import { emptyPose } from "../src/net/multiplayer";
import { RemoteFleet, FLAG_ACTIVE } from "../src/render/remoteJets";

let failures = 0;
function test(name: string, run: () => void) { try { run(); console.log("PASS " + name); } catch (e) { failures++; console.error("FAIL " + name, e); } }
const metrics = { stopped: 0, arrived: 0, scouts: 0, attackers: 0, queued: 0 };
function combat(kind: "convoy" | "fleet", id = 101, seed = 1) {
  const scene = new Scene(), df = new Dogfight(scene, new ExplosionField(scene, "low"));
  const player = spawnAircraft("carrier", 0); player.pos.y = 3000; player.onGround = false; player.airborne = true; player.speed = 200; player.catPhase = "idle";
  df.configureOperations(true, seed, id);
  if (kind === "convoy") { df.prepareStrike(player); df.beginStrike(player); }
  else { df.prepare(player); df.begin(player); }
  return { df, player, internal: df as any };
}
test("convoy success/failure latch independently of optional targets and later crashes", () => {
  const op = Operation.create("convoy", 1, 1, 0); op.start(); op.advance(1, { ...metrics, stopped: 2 });
  assert.equal(op.state.status, "success"); op.finish(false, "crashed during optional landing"); assert.equal(op.state.status, "success");
  const failed = Operation.create("convoy", 2, 1, 0); failed.start(); failed.advance(1, { ...metrics, arrived: 2 }); assert.equal(failed.state.status, "failure");
});
test("scout interception buys 45 seconds and two finite fleet attacks resolve", () => {
  const intercepted = Operation.create("fleet", 3, 1, 0); intercepted.start(); intercepted.advance(1, metrics);
  assert.equal(intercepted.state.phase, "forming"); assert(intercepted.state.scoutStopped);
  intercepted.advance(15, metrics); assert.equal(intercepted.state.phase, "forming"); intercepted.advance(45, metrics); assert.equal(intercepted.state.phase, "strike");
  intercepted.advance(1, metrics); assert.equal(intercepted.state.phase, "counterattack"); intercepted.advance(60, metrics); assert.equal(intercepted.state.phase, "final"); intercepted.advance(1, metrics); assert.equal(intercepted.state.status, "success");
  const reported = Operation.create("fleet", 4, 1, 0); reported.start(); reported.reportScout(); reported.advance(1, metrics); reported.advance(15, metrics); assert.equal(reported.state.phase, "strike");
});
test("carrier damage fails and deck suppression waits for airborne attackers", () => {
  const op = Operation.create("fleet", 5, 1, 0); op.start(); op.state.phase = "strike";
  op.damageDeck(68); op.advance(1, { ...metrics, attackers: 1 }); assert.equal(op.state.status, "active");
  op.advance(1, metrics); assert.equal(op.state.status, "success");
  const lost = Operation.create("fleet", 6, 1, 0); lost.start(); lost.damageFleet(120); assert.equal(lost.state.status, "failure");
});
test("convoy routes validate full formation corridors across different worlds", () => {
  for (const seed of [DEFAULT_SEED, 71, 1123, 9931, 53456, 81231, 990022]) {
    setWorldSeed(seed);
    for (let variant = 1; variant <= 4; variant++) { const c = carriers()[0], route = convoyRoute(c.x, c.z, variant); assert(route, `missing route ${seed}/${variant}`); assert(safeConvoyRoute(route!)); }
  }
  setWorldSeed(DEFAULT_SEED);
});
test("prepared targets wait for takeoff; hits slow and disable cargo without killing escorts", () => {
  const { df, player, internal: d } = combat("convoy");
  const t = d.strikeTargets.find((t: any) => t.role === "cargo"), x = t.pos.x;
  df.operation!.state.status = "briefing"; d.stepTargets(10); assert.equal(t.pos.x, x); df.operation!.start();
  d.damageTarget(t, 12, player); assert.equal(t.speed, 3); assert(!t.disabled);
  d.damageTarget(t, 20, player); assert(t.disabled); assert.equal(t.speed, 0);
  const second = d.strikeTargets.filter((t: any) => t.role === "cargo")[1]; d.blastTargets(second.pos.clone().add(new Vector3(0, 6, 0)), player);
  df.step(1 / 120, player, false); assert.equal(df.operationState?.status, "success");
  assert(d.strikeTargets.some((t: any) => t.role === "escort" && !t.dead));
  const id = df.operationState!.id; df.refill(); df.recordRecovery(3); assert.equal(df.operationState!.id, id); assert.equal(df.missionStats.recoveryBonus, 150);
  df.dispose();
});
test("convoy arrivals fail finitely without spawning a new wave", () => {
  const { df, player, internal: d } = combat("convoy");
  for (const t of d.strikeTargets) if (t.role === "cargo") t.progress = t.route.length - .01;
  df.step(1 / 60, player, false); assert.equal(df.operationState?.status, "failure");
  const count = d.strikeTargets.length; for (let i = 0; i < 300; i++) df.step(.1, player, false); assert.equal(d.strikeTargets.length, count); df.dispose();
});
test("target sync and co-op hits preserve authoritative identity and reject stale epochs", () => {
  const host = combat("convoy", 201), wing = combat("convoy", 201);
  wing.df.setMirror(true, wing.player);
  const frame = host.df.sharedSnapshot(); assert(validSharedCombat(frame)); wing.df.applySharedSnapshot(frame, 1000);
  assert.equal(wing.internal.strikeTargets.length, 5);
  const target = wing.internal.strikeTargets.find((t: any) => t.role === "cargo"); wing.internal.damageTarget(target, 40, wing.player);
  const [hit] = wing.df.takeHits(); assert.equal(hit.combatId, 201);
  host.df.applyRemoteHit(hit.id, hit.dmg, host.player, 199); assert(!host.internal.strikeTargets.find((t: any) => t.id === hit.id).disabled);
  host.df.applyRemoteHit(hit.id, hit.dmg, host.player, hit.combatId); host.df.step(.01, host.player, false);
  const updated = host.df.sharedSnapshot(); wing.df.applySharedSnapshot(updated, 1200);
  assert(wing.internal.strikeTargets.find((t: any) => t.id === hit.id).disabled);
  wing.df.applySharedSnapshot(frame, 1300); assert(wing.internal.strikeTargets.find((t: any) => t.id === hit.id).disabled);
  const polluted = JSON.parse(JSON.stringify(updated)); polluted.targets[0].speed = NaN; assert(!validSharedCombat(polluted));
  host.df.dispose(); wing.df.dispose();
});
test("escort warnings precede finite AA bursts and radar destruction delays them", () => {
  const { df, player, internal: d } = combat("convoy"); const escort = d.strikeTargets.find((t: any) => t.role === "escort");
  player.pos.copy(escort.pos).add(new Vector3(0, 500, 300)); player.vel.set(0, 0, 0);
  d.stepEscortDefense(2, player); assert(df.operationHud(player)?.warning); assert.equal(df.tracerCount(), 0);
  d.stepEscortDefense(1.1, player); assert.equal(df.tracerCount(), 6); assert.equal(escort.ammo, 42);
  const radar = d.strikeTargets.find((t: any) => t.role === "radar"); d.damageTarget(radar, 60, player);
  escort.cooldown = 0; escort.tracking = 0; d.stepEscortDefense(4, player); assert.equal(df.tracerCount(), 6);
  df.dispose();
});
test("fleet roles launch from the carrier and migrate with ammo and scheduled launches", () => {
  const host = combat("fleet", 301); host.df.step(2, host.player, false);
  assert.equal(host.internal.bandits[0].role, "scout"); assert.equal(host.internal.bandits[0].missiles, 0);
  host.internal.clearBandits(); host.df.step(.01, host.player, false); host.df.step(60, host.player, false);
  host.df.step(2, host.player, false); assert.equal(host.internal.bandits[0].role, "bomber");
  host.internal.bandits[0].ammo = 13;
  const wing = combat("fleet", 301); wing.df.setMirror(true, wing.player); wing.df.applySharedSnapshot(host.df.sharedSnapshot(), 1000);
  const queue = wing.internal.roleQueue.join(), phaseTime = wing.df.operationState!.phaseTime;
  wing.df.setMirror(false, wing.player); assert.equal(wing.internal.bandits[0].role, "bomber"); assert.equal(wing.internal.bandits[0].ammo, 13);
  assert.equal(wing.internal.roleQueue.join(), queue); assert.equal(wing.df.operationState!.phaseTime, phaseTime);
  host.df.dispose(); wing.df.dispose();
});
test("bombers spend one attack pass and withdraw; all four unopposed passes disable fleet", () => {
  const { df, player, internal: d } = combat("fleet"); const fleet = carriers()[0];
  d.roleQueue = []; d.clearBandits(); df.operation!.state.phase = "strike";
  for (let i = 0; i < 4; i++) {
    d.launchOne(player, d.cv, "bomber"); const b = d.bandits[d.bandits.length - 1]; b.catT = -1; b.speed = 185; b.pos.set(fleet.x + 700, 1500, fleet.z);
    d.stepRoleAircraft(b, .01, player); assert.equal(b.bombs, 0); assert(b.retreat);
    assert(d.enemyBombs.length > 0); const bomb = d.enemyBombs[d.enemyBombs.length - 1]; bomb.age = 1; bomb.pos.set(fleet.x, fleet.deckY + 3, fleet.z); bomb.vel.set(0, -10, 0); d.stepEnemyBombs(.1, player); const hull = df.operationState!.fleetHull;
    d.stepRoleAircraft(b, .01, player); assert.equal(df.operationState!.fleetHull, hull);
  }
  assert.equal(df.operationState!.status, "failure"); df.dispose();
});
test("terminal operation state and missiles remain bounded in a long combat run", () => {
  const { df, player } = combat("fleet");
  for (let i = 0; i < 18000; i++) df.step(.05, player, false, false, true);
  assert(["success", "failure"].includes(df.operationState!.status), JSON.stringify(df.operationState));
  assert(validSharedCombat(df.sharedSnapshot())); df.dispose();
});
test("the first airborne wingman starts the shared clock while the host remains parked", () => {
  const { df, player, internal: d } = combat("fleet"); df.operation!.state.status = "briefing"; d.roleQueue = [];
  const sim = Object.create(Sim.prototype) as any;
  Object.assign(sim, { df, state: player, settings: { ...defaultSettings(), missionMode: "dogfight" }, dfArmed: true,
    netState: { status: "online", host: true }, remoteFleet: { combatTargets: () => [{ onGround: true }] }, updateHud() {} });
  sim.startOperationWithWingman(); assert.equal(df.operationState!.status, "briefing");
  sim.remoteFleet.combatTargets = () => [{ onGround: false }]; sim.startOperationWithWingman();
  assert.equal(df.operationState!.status, "active"); assert(!sim.dfArmed); assert.deepEqual(d.roleQueue, ["scout"]); df.dispose();
});
test("retry preserves layout and defended carrier even after recovering on another boat", () => {
  const { df, player, internal: d } = combat("convoy", 601);
  const origin = { x: player.pos.x, z: player.pos.z, heading: player.headingDeg, carrier: 0 };
  df.configureOperations(true, 1, 601, origin); df.prepareStrike(player);
  const points = d.strikeTargets.map((t: any) => t.pos.toArray());
  const elsewhere = spawnAircraft("carrier", 2);
  df.configureOperations(true, 1, 602, origin); df.prepareStrike(elsewhere);
  assert.deepEqual(d.strikeTargets.map((t: any) => t.pos.toArray()), points);
  df.prepare(elsewhere); assert.equal(df.operationState!.fleetCarrier, 0); df.dispose();
});
test("losing every pilot fails even after returning to the lobby; landing and surviving wingmen do not", () => {
  const { df, player } = combat("convoy"); const sim = Object.create(Sim.prototype) as any;
  Object.assign(sim, { df, state: player, phase: "result", allPilotsDown: 0, netState: { status: "online" }, remoteFleet: { activePilotCount: () => 0 } });
  player.result = { kind: "wire", title: "Recovered", detail: "" }; sim.checkOperationPilots(10); assert.equal(df.operationState!.status, "active");
  sim.phase = "menu"; player.result = null; sim.remoteFleet.activePilotCount = () => 1;
  sim.checkOperationPilots(10); assert.equal(df.operationState!.status, "active");
  sim.remoteFleet.activePilotCount = () => 0; sim.checkOperationPilots(3.1); assert.equal(df.operationState!.status, "failure"); df.dispose();
});
test("endless Strike retains bounded wreck history and sync remains valid beyond wave three", () => {
  const scene = new Scene(), df = new Dogfight(scene, new ExplosionField(scene, "low")), player = spawnAircraft("carrier", 0), d = df as any;
  df.configureOperations(false, 1, 701); df.prepareStrike(player); df.beginStrike(player);
  for (let wave = 0; wave < 7; wave++) {
    for (const t of d.strikeTargets) if (!t.dead) d.damageTarget(t, 68, player);
    df.step(.01, player, false); df.step(30, player, false);
    assert(d.strikeTargets.length <= 16); assert(validSharedCombat(df.sharedSnapshot()));
  }
  assert(d.wave >= 8); df.dispose();
});
test("one laser designation follows a moving cargo ship and an actual bomb disables it", () => {
  const { df, player, internal: d } = combat("convoy");
  const cargo = d.strikeTargets.find((t: any) => t.role === "cargo");
  d.strikeTargets.find((t: any) => t.role === "escort").ammo = 0;
  player.pos.copy(cargo.pos).add(new Vector3(0, 900, 0)); player.vel.set(0, 0, 0); player.speed = 0;
  df.setDesignation(cargo.pos.clone().add(new Vector3(0, 6, 0)));
  assert(df.requestBombRelease(player));
  for (let i = 0; i < 2400 && !cargo.disabled; i++) { player.time += 1 / 120; df.step(1 / 120, player, false); }
  assert(cargo.progress > 20); assert(cargo.disabled, `cargo hp ${cargo.hp}`);
  assert.equal(df.missionStats.storesUsed, 1); df.dispose();
});
test("unopposed fleet attacks release all four bombs and disable the carrier without terrain losses", () => {
  for (const world of [DEFAULT_SEED, 71, 1123]) {
    setWorldSeed(world);
    const { df, player, internal: d } = combat("fleet");
    let releases = 0, terrainLosses = 0;
    const createBomb = d.createEnemyBomb.bind(d), crash = d.crashBandit.bind(d);
    d.createEnemyBomb = (...args: any[]) => { releases++; return createBomb(...args); };
    d.crashBandit = (...args: any[]) => { if (args[0].role === "bomber") terrainLosses++; return crash(...args); };
    try {
      for (let i = 0; i < 120 * 850 && df.operationState!.status === "active"; i++) {
        player.time += 1 / 120; df.step(1 / 120, player, false, false, true);
      }
      assert.equal(terrainLosses, 0, `world ${world}: bombers must clear terrain`);
      assert.equal(releases, 4, `world ${world}: both attacks must make their passes`);
      assert.equal(df.operationState!.status, "failure", `world ${world}: ignoring every attack cannot win`);
      assert.equal(df.operationState!.fleetHull, 0);
    } finally { df.dispose(); setWorldSeed(DEFAULT_SEED); }
  }
});
test("a recovered wingman remains alive for the shared operation while the host is down", () => {
  const { df, player } = combat("convoy"), wing: any = Object.create(Sim.prototype);
  Object.assign(wing, { df, state: spawnAircraft("carrier", 0), phase: "result", fleetClock: 0,
    settings: { ...defaultSettings(), missionMode: "strike" }, netState: { status: "online" }, poseOut: emptyPose() });
  wing.state.result = { kind: "wire", title: "Recovered", detail: "" };
  const pose = { ...wing.buildPose() };
  assert(pose.flags & FLAG_ACTIVE, "a successful recovery is a surviving pilot, including in the result screen");
  const remote: any = Object.create(RemoteFleet.prototype);
  remote.remotes = new Map([["wing", { buf: [{ p: pose }], lastAt: performance.now() }]]);
  const host: any = Object.create(Sim.prototype);
  Object.assign(host, { df, state: player, phase: "result", allPilotsDown: 0, netState: { status: "online" }, remoteFleet: remote });
  player.result = { kind: "crash", title: "Downed", detail: "" }; host.checkOperationPilots(4);
  assert.equal(df.operationState!.status, "active");
  wing.state.result = { kind: "crash", title: "Downed", detail: "" };
  assert.equal(wing.buildPose().flags & FLAG_ACTIVE, 0);
  wing.phase = "menu"; wing.state.result = null; assert.equal(wing.buildPose().flags & FLAG_ACTIVE, 0);
  remote.remotes.get("wing").lastAt = performance.now() - 13000;
  host.checkOperationPilots(4); assert.equal(df.operationState!.status, "failure", "stale poses cannot keep a lost team alive forever");
  df.dispose();
});
test("host takeover resumes aircraft at the latest authoritative pose rather than the display interpolation", () => {
  const host = combat("fleet", 901), wing = combat("fleet", 901);
  host.df.step(2, host.player, false);
  wing.df.setMirror(true, wing.player); wing.df.applySharedSnapshot(host.df.sharedSnapshot(), 1000);
  host.internal.bandits[0].pos.add(new Vector3(700, 200, -300));
  const frame = host.df.sharedSnapshot(); wing.df.applySharedSnapshot(frame, 1200);
  assert.notDeepEqual(wing.internal.bandits[0].pos.toArray(), [frame.bandits[0].x, frame.bandits[0].y, frame.bandits[0].z]);
  wing.df.setMirror(false, wing.player);
  assert.deepEqual(wing.internal.bandits[0].pos.toArray(), [frame.bandits[0].x, frame.bandits[0].y, frame.bandits[0].z]);
  assert.deepEqual(wing.internal.bandits[0].quat.toArray(), [frame.bandits[0].qx, frame.bandits[0].qy, frame.bandits[0].qz, frame.bandits[0].qw]);
  host.df.dispose(); wing.df.dispose();
});
if (failures) process.exit(1);
