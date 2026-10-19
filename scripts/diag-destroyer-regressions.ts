// Cross-system destroyer regressions: moving targets, mixed PvP and servicing.
import assert from "node:assert/strict";
import { Quaternion, Scene, Vector3 } from "three";
import { Dogfight } from "../src/sim/dogfight";
import { spawnAircraft } from "../src/sim/flight";
import { Sim } from "../src/sim/engine";
import { ExplosionField } from "../src/render/effects";
import { launchNavalMissile, navalLock, navalTarget } from "../src/sim/combat/naval";
import { DEFAULT_SEED, carriers, setWorldSeed } from "../src/sim/world";
import { shipSpawn } from "../src/sim/surface";
import { BattleReferee, battleCarrierPair } from "../src/net/versus";
import { defaultSettings } from "../src/settings";

let failures = 0;
function test(name: string, run: () => void) {
  try { setWorldSeed(DEFAULT_SEED); run(); console.log("PASS", name); }
  catch (error) { failures++; console.error("FAIL", name, error); }
}
function setup() {
  const scene = new Scene(), df = new Dogfight(scene, new ExplosionField(scene, "low"));
  const player = spawnAircraft("carrier", 0, "destroyer");
  df.setAircraft(player); df.refill();
  return { df, player };
}
function aim(player: ReturnType<typeof spawnAircraft>, at: Vector3) {
  const delta = at.clone().sub(player.pos);
  player.turretYaw = Math.atan2(delta.x, -delta.z) - player.headingDeg * Math.PI / 180;
  player.turretPitch = Math.atan2(delta.y, Math.hypot(delta.x, delta.z));
}

test("a director click on the hostile deck tracks the moving carrier", () => {
  const { df, player } = setup(); df.prepare(player);
  const cv = df.cv!;
  const click = new Vector3(cv.def.x, cv.def.deckY, cv.def.z);
  assert(launchNavalMissile(df, player, click));
  const m = df.missiles[0]; assert.equal(m.naval?.kind, "carrier");
  cv.def.x += 150; cv.def.z += 120;
  navalTarget(df, m);
  assert.equal(m.naval!.point.x, cv.def.x); assert.equal(m.naval!.point.z, cv.def.z);
  const hp = cv.hp;
  for (let i = 0; i < 120 * 48 && cv.hp === hp; i++) {
    df.stepCarrier(1 / 120, player); df.stepMissiles(1 / 120, player);
  }
  assert(cv.hp < hp, "the guided round damages the carrier while it moves");
  df.dispose();
});

test("a naval seeker and its network target stop tracking a respawned pilot", () => {
  const { df, player } = setup(); df.versus = true;
  const pos = player.pos.clone().add(new Vector3(1500, 700, 0)); aim(player, pos);
  df.setOpponents([{ id: "enemy", life: 1, pos, vel: new Vector3() }]);
  assert(launchNavalMissile(df, player));
  assert.equal(df.battleMissiles()[0].target, "enemy");
  df.setOpponents([{ id: "enemy", life: 2, pos: pos.clone().addScalar(200), vel: new Vector3() }]);
  assert.equal(navalTarget(df, df.missiles[0]), null);
  assert.equal(df.battleMissiles()[0].target, null);
  df.dispose();
});

test("a PvP destroyer contact gets a surface cruise leg and a moving terminal aim", () => {
  const { df, player } = setup(); df.versus = true;
  const pos = player.pos.clone().add(new Vector3(4000, 0, 0)); aim(player, pos);
  df.setOpponents([{ id: "ship", life: 1, pos, vel: new Vector3(0, 0, 5), quat: new Quaternion(), surfaceVessel: true }]);
  const lock = navalLock(df, player); assert(lock && lock.cruiseHeight >= 200);
  assert(launchNavalMissile(df, player));
  const missile = df.missiles[0];
  assert(navalTarget(df, missile)!.y >= 200);
  pos.z += 100; missile.pos.copy(pos).x -= 100;
  const terminal = navalTarget(df, missile)!;
  assert.equal(terminal.z, pos.z); assert(terminal.y < 50);
  df.dispose();
});

test("a VLS strike hits a moving PvP destroyer and reports the correct victim life", () => {
  const { df, player } = setup(); df.versus = true;
  const pos = player.pos.clone().add(new Vector3(2000, 0, 0)), vel = new Vector3(0, 0, 5);
  df.setOpponents([{ id: "ship", life: 3, pos, vel, quat: new Quaternion(), surfaceVessel: true }]);
  aim(player, pos); assert(launchNavalMissile(df, player));
  for (let i = 0; i < 120 * 26 && !df.playerHits.length; i++) {
    pos.addScaledVector(vel, 1 / 120); df.stepMissiles(1 / 120, player);
  }
  assert(df.playerHits.some(h => h.id === "ship" && h.life === 3 && h.weapon === "missile"));
  df.dispose();
});

test("the gun cue uses the same oriented ship hull as damaging rounds", () => {
  const { df, player: ship } = setup();
  const pos = ship.pos.clone(), player = spawnAircraft("airfield", 0, "tomcat");
  player.pos.copy(pos).add(new Vector3(55, 20, 500)); player.quat.identity();
  player.turretYaw = 0; player.turretPitch = 0;
  df.versus = true;
  df.setOpponents([{ id: "ship", life: 1, pos, vel: new Vector3(), surfaceVessel: true,
    quat: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2) }]);
  assert.equal(df.gunSolution(player).hit, "bandit");
  df.playerGuns(1 / 120, player, true);
  for (let i = 0; i < 240 && !df.playerHits.length; i++) df.stepTracers(1 / 120, player);
  assert(df.playerHits.some(h => h.id === "ship")); df.dispose();
});

function serviceSim(host = true) {
  const { df, player } = setup();
  const sim: any = Object.create(Sim.prototype), now = performance.now() / 1000;
  const ref = new BattleReferee(); ref.reset(17);
  ref.reconcile([{ id: "a", name: "ALPHA" }, { id: "b", name: "BRAVO" }]);
  for (const id of ["a", "b"]) ref.action(id, { kind: "ready", match: 17, seq: 1, life: 0 }, now - 10, 0);
  ref.action("b", { kind: "hit", weapon: "missile", match: 17, seq: 2, life: 1, victim: "a", victimLife: 1 }, now - 1, 100);
  Object.assign(sim, { state: player, df, settings: { ...defaultSettings(), aircraft: "destroyer", missionMode: "versus" },
    netState: { status: "online", self: "a", host, pilots: [{ id: "b", name: "BRAVO", aircraft: "tomcat" }] },
    battle: ref.snapshot(now), battleReferee: ref, shipRearmHold: 0, battleLife: 1, phase: "flying",
    remoteWeapons: {}, net: { callsign: "ALPHA", publishBattle() {} }, remoteFleet: { combatTargets: () => [] } });
  sim.updateHud = () => {};
  df.beginVersus(player); df.missilesLeft = 2; df.setBattleHull(10);
  return { sim, ref, df, player, pair: battleCarrierPair(17, carriers().length) };
}

test("versus service rejects enemy bases locally and at the host; own base repairs without a new life", () => {
  const { sim, ref, df, player, pair } = serviceSim();
  const recover = { kind: "recover", match: 17, seq: 3, life: 1 };
  player.pos.copy(shipSpawn(pair[1]));
  sim.stepShipRearm(true, 3.1); assert.equal(df.missilesLeft, 2);
  sim.receiveBattleAction("a", recover); assert.equal(ref.snapshot(performance.now() / 1000).pilots[0].hp, 10);
  player.pos.copy(shipSpawn(pair[0]));
  sim.stepShipRearm(false, .1); sim.stepShipRearm(true, 3.1);
  assert.equal(df.missilesLeft, 32); assert.equal(df.hull, 10, "hull waits for host acknowledgement");
  sim.receiveBattleAction("a", { ...recover, seq: 4 });
  const pilot = ref.snapshot(performance.now() / 1000).pilots[0];
  assert.equal(pilot.hp, 100); assert.equal(pilot.life, 1); assert.equal(pilot.deaths, 0); assert(!pilot.shield);
  df.missilesLeft = 2; sim.stepShipRearm(true, 4); assert.equal(df.missilesLeft, 2, "release required between service cycles");
  df.dispose();
});

test("the host validates a remote destroyer's assigned base, speed and altitude", () => {
  const { sim, ref, df, pair } = serviceSim();
  const pos = shipSpawn(pair[0]), vel = new Vector3();
  sim.netState.pilots[0].aircraft = "destroyer";
  sim.remoteFleet.combatTargets = () => [{ id: "b", pos, vel }];
  ref.action("a", { kind: "hit", weapon: "missile", match: 17, seq: 2, life: 1, victim: "b", victimLife: 1 }, performance.now() / 1000, 100);
  const hp = () => ref.snapshot(performance.now() / 1000).pilots.find(p => p.id === "b")!.hp;
  sim.receiveBattleAction("b", { kind: "recover", match: 17, seq: 3, life: 1 }); assert.equal(hp(), 10);
  pos.copy(shipSpawn(pair[1])); vel.x = 3;
  sim.receiveBattleAction("b", { kind: "recover", match: 17, seq: 4, life: 1 }); assert.equal(hp(), 10);
  vel.x = 0; pos.y = 100;
  sim.receiveBattleAction("b", { kind: "recover", match: 17, seq: 5, life: 1 }); assert.equal(hp(), 10);
  pos.y = 1;
  sim.receiveBattleAction("b", { kind: "recover", match: 17, seq: 6, life: 1 }); assert.equal(hp(), 100);
  df.dispose();
});

test("naval campaign service preserves objectives, stage and statistics and resets an interrupted hold", () => {
  const { df, player } = setup();
  df.configureOperations(true, 1, 99, { x: player.pos.x, z: player.pos.z, heading: player.headingDeg, carrier: 0 });
  df.prepareCampaign(player); df.beginCampaign(player);
  df.damageTarget(df.strikeTargets.find(t => t.role === "bunker")!, 400, player);
  const mission = df.sharedSnapshot(), stats = df.missionStats;
  const sim: any = Object.create(Sim.prototype);
  Object.assign(sim, { state: player, df, settings: { ...defaultSettings(), aircraft: "destroyer" },
    netState: { status: "offline", pilots: [] }, shipRearmHold: 0 });
  df.missilesLeft = 2; df.hull = 50;
  sim.stepShipRearm(true, 2); sim.stepShipRearm(false, .1); sim.stepShipRearm(true, 2);
  assert.equal(df.missilesLeft, 2); sim.stepShipRearm(true, 1.1);
  assert.equal(df.missilesLeft, 32); assert.equal(df.hull, 300);
  const serviced = df.sharedSnapshot();
  assert.deepEqual(serviced.operation, mission.operation); assert.deepEqual(serviced.targets, mission.targets);
  assert.deepEqual(df.missionStats, stats); df.dispose();
});

test("a destroyer wingman reports VLS target damage to an aircraft host without owning the objective", () => {
  const host = setup(), wing = setup();
  const aircraft = spawnAircraft("carrier", 0, "tomcat");
  host.df.configureOperations(true, 1, 99, { x: wing.player.pos.x, z: wing.player.pos.z, heading: 0, carrier: 0 });
  host.df.prepareStrike(aircraft); host.df.beginStrike(aircraft);
  wing.df.configureOperations(true, 1, 99);
  wing.df.setMirror(true, wing.player); wing.df.applySharedSnapshot(host.df.sharedSnapshot(), 1000);
  const target = wing.df.strikeTargets.find(t => t.role === "cargo")!;
  assert(launchNavalMissile(wing.df, wing.player, target.pos));
  for (let i = 0; i < 120 * 48 && wing.df.missiles.length; i++) wing.df.stepMissiles(1 / 120, wing.player);
  assert(!target.dead && !target.disabled, "the host owns objective state");
  const hits = wing.df.takeHits(); assert(hits.some(h => h.id === target.id && h.combatId === 99));
  for (const h of hits) host.df.applyRemoteHit(h.id, h.dmg, aircraft, h.combatId);
  assert(host.df.strikeTargets.find(t => t.id === target.id)!.disabled);
  wing.df.applySharedSnapshot(host.df.sharedSnapshot(), 1200);
  assert(wing.df.strikeTargets.find(t => t.id === target.id)!.disabled);
  host.df.dispose(); wing.df.dispose();
});

if (failures) process.exitCode = 1;
