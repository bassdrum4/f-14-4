import assert from "node:assert/strict";
import { Box3, PerspectiveCamera, Quaternion, Scene, Vector3 } from "three";
import { spawnAircraft, stepAircraft, type FlightInput } from "../src/sim/flight";
import { AIRCRAFT, isAircraftId } from "../src/sim/aircraft";
import { DEFAULT_SEED, carriers, groundAt, setWorldSeed } from "../src/sim/world";
import { hitsVessel, navigableWater, shipGunQuaternion, shipSpawn, SHIP_MAX_SPEED } from "../src/sim/surface";
import { Dogfight } from "../src/sim/dogfight";
import { launchNavalMissile } from "../src/sim/combat/naval";
import { ExplosionField } from "../src/render/effects";
import { buildAircraft } from "../src/render/geometry";
import { CameraRig } from "../src/render/cameras";
import { Sim } from "../src/sim/engine";
import { defaultSettings } from "../src/settings";

const idle: FlightInput = { pitch: 0, roll: 0, yaw: 0, throttleUp: false, throttleDown: false, trimUp: false, trimDown: false, brake: false, catHold: false };
const dt = 1 / 120;
let failures = 0;
function test(name: string, fn: () => void) {
  try { fn(); console.log("PASS", name); } catch (e) { failures++; console.error("FAIL", name, e); }
}
function setup() {
  setWorldSeed(DEFAULT_SEED);
  const scene = new Scene(), df = new Dogfight(scene, new ExplosionField(scene, "low"));
  const player = spawnAircraft("carrier", 0, "destroyer");
  df.setAircraft(player); df.refill();
  return { df, player };
}

test("selector identity and full safe hull spawns on every carrier, varied worlds and room slots", () => {
  assert(isAircraftId("destroyer")); assert(AIRCRAFT.destroyer.beta);
  for (const seed of [DEFAULT_SEED, 71, 1123, 9931, 53456, 81231]) {
    setWorldSeed(seed);
    for (let c = 0; c < carriers().length; c++) for (const slot of [0, 1, 3]) {
      const p = shipSpawn(c, slot);
      assert(navigableWater(p.x, p.z, carriers()[c].headingDeg));
      assert(carriers().every(v => Math.hypot(v.x - p.x, v.z - p.z) > 400));
    }
  }
  setWorldSeed(DEFAULT_SEED);
});
test("surface integration stays afloat, caps speed, brakes and trains gun independently", () => {
  const { player, df } = setup();
  for (let i = 0; i < 120 * 60; i++) stepAircraft(player, { ...idle, throttleUp: true }, dt);
  assert(player.speed <= SHIP_MAX_SPEED); assert(player.pos.y > .5 && player.pos.y < 1.5);
  assert(!player.airborne && !player.onGround && !player.result && !player.stalled);
  assert.equal(groundAt(player.pos.x, player.pos.z).kind, "water");
  const heading = player.headingDeg;
  for (let i = 0; i < 120; i++) stepAircraft(player, { ...idle, roll: 1, pitch: 1 }, dt);
  assert.equal(player.headingDeg, heading); assert(player.turretYaw! > .6); assert(player.turretPitch! > .6);
  for (let i = 0; i < 120 * 20; i++) stepAircraft(player, { ...idle, brake: true, yaw: 1 }, dt);
  assert(player.speed < .1); assert.notEqual(player.headingDeg, heading);
  assert.equal(player.catPhase, "idle"); assert.equal(player.gearT, 0); df.dispose();
});
test("gun bore and muzzle follow director, and hostile rounds hit the full oriented hull", () => {
  const { df, player } = setup(); player.turretYaw = Math.PI / 2; player.turretPitch = .5;
  df.playerGuns(dt, player, true);
  const shot = df.tracers[0]; assert(shot); assert(shot.pos.y > player.pos.y + 20);
  const fwd = new Vector3(0, 0, -1).applyQuaternion(shipGunQuaternion(player, new Quaternion()));
  assert(shot.vel.clone().normalize().angleTo(fwd) < .03);
  const from = new Vector3(50, 7, 55).applyQuaternion(player.quat).add(player.pos);
  const to = new Vector3(-50, 7, 55).applyQuaternion(player.quat).add(player.pos);
  assert(hitsVessel(from, to, player));
  const hull = df.hull; df.spawnTracer(from, to.clone().sub(from).normalize(), true, null);
  for (let i = 0; i < 20; i++) df.stepTracers(dt, player);
  assert(df.hull < hull); df.dispose();
});
test("vertical launch clears deck, consumes one store, respects cooldown and hits an aircraft", () => {
  const { df, player } = setup(); df.versus = true;
  const target = player.pos.clone().add(new Vector3(1200, 700, 0));
  const delta = target.clone().sub(player.pos); player.turretYaw = Math.atan2(delta.x, -delta.z) - player.headingDeg * Math.PI / 180; player.turretPitch = .4;
  df.setOpponents([{ id: "enemy", life: 1, pos: target, vel: new Vector3(-150, 0, 130) }]);
  assert(launchNavalMissile(df, player)); assert.equal(df.missilesLeft, 31);
  assert(df.missiles[0].vel.y > 90); assert(!launchNavalMissile(df, player));
  for (let i = 0; i < 120 * 15 && !df.playerHits.length; i++) { target.addScaledVector(df.opponents[0].vel, dt); df.stepMissiles(dt, player); }
  assert(df.playerHits.some(h => h.id === "enemy"));
  assert(df.battleMissiles().every(m => m.age >= 0 && m.age <= 26)); df.dispose();
});
test("surface VLS destroys convoy targets, maintains identity and cannot fire when empty/dead", () => {
  const { df, player } = setup();
  df.spawnTarget("ship", player.pos.x + 2000, 0, player.pos.z, 0, true);
  const target = df.strikeTargets[0]; assert(launchNavalMissile(df, player, target.pos));
  assert.equal(df.missiles[0].naval?.id, target.id);
  for (let i = 0; i < 120 * 30 && !target.dead; i++) df.stepMissiles(dt, player);
  assert(target.dead, `missile missed surface target: ${df.lastImpact.toArray()}`);
  df.missilesLeft = 0; assert(!launchNavalMissile(df, player, target.pos));
  df.refill(); player.result = { kind: "crash", title: "test", detail: "test" }; assert(!launchNavalMissile(df, player, target.pos)); df.dispose();
});
test("coastal strike reaches real bastion objectives from the sea and completes the operation", () => {
  const { df, player } = setup();
  df.configureOperations(true, 1, 99, { x: player.pos.x, z: player.pos.z, heading: player.headingDeg, carrier: 0 }, "bastion");
  df.prepareStrike(player); df.beginStrike(player);
  const targets = df.strikeTargets.filter(t => ["bunker", "hangar", "fuel"].includes(t.role ?? ""));
  assert.equal(targets.length, 3);
  for (const t of targets) {
    df.missileCd = 0; assert(launchNavalMissile(df, player, t.pos));
    for (let i = 0; i < 120 * 48 && !t.dead; i++) df.stepMissiles(dt, player);
    assert(t.dead, `coastal ${t.role} missed: impact ${df.lastImpact.toArray()} target ${t.pos.toArray()}`);
  }
  df.stepOperation(dt, player); assert.equal(df.operationState?.status, "success"); df.dispose();
});
test("ship model/camera have matching scale; rearm preserves mission and requires held service", () => {
  const { df, player } = setup(), model = buildAircraft("destroyer"), camera = new PerspectiveCamera();
  assert(new Box3().setFromObject(model.group).getSize(new Vector3()).z > 140);
  const rig = new CameraRig(); rig.updateShip(camera, player.pos, player.quat, shipGunQuaternion(player, new Quaternion()), dt);
  assert(camera.position.distanceTo(player.pos) > 180);
  const sim = Object.create(Sim.prototype) as any;
  Object.assign(sim, { state: player, df, settings: { ...defaultSettings(), aircraft: "destroyer" }, netState: { status: "offline", pilots: [] }, shipRearmHold: 0 });
  df.missilesLeft = 2; df.hull = 50;
  sim.stepShipRearm(true, 2); assert.equal(df.missilesLeft, 2);
  sim.stepShipRearm(true, 1.1); assert.equal(df.missilesLeft, 32); assert.equal(df.hull, 300);
  df.missilesLeft = 2; sim.stepShipRearm(true, 4); assert.equal(df.missilesLeft, 2);
  df.dispose();
});
if (failures) process.exitCode = 1;
