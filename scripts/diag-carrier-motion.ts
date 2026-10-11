// Moving carrier geometry/physics, catapult launches and immutable seabed.
import { strict as assert } from 'node:assert';
import { Scene, Vector3, Quaternion } from 'three';
import { ARCHIPELAGO, carriers, setWorldSeed, DEFAULT_SEED, terrainHeight, setFleetTime, fleetPoseAt, fleetVelocityAt, FLEET_SPEED, worldToDeck, deckAxes } from '../src/sim/world';
import { spawnAircraft, stepAircraft, carryDeckPose } from '../src/sim/flight';
import { AIRCRAFT_LIST } from '../src/sim/aircraft';
import { Dogfight } from '../src/sim/dogfight';
import { ExplosionField } from '../src/render/effects';
import { Sim } from '../src/sim/engine';
import { defaultSettings } from '../src/settings';
import { headingUpPoint } from '../src/ui/mapProjection';

const idle = { pitch: 0, roll: 0, yaw: 0, throttleUp: false, throttleDown: false, trimUp: false, trimDown: false, brake: true, catHold: false };
setWorldSeed(DEFAULT_SEED);
const terrainBefore = ARCHIPELAGO.carriers.map(c => terrainHeight(c.x + 900, c.z));
for (let t = 0; t <= 600; t += 5) {
  setFleetTime(t);
  carriers().forEach((c, i) => {
    const home = ARCHIPELAGO.carriers[i];
    assert(Math.hypot(c.x - home.x, c.z - home.z) < 280, 'patrol stays within its safe anchorage');
    const next = fleetPoseAt(i, t + .01);
    assert(Math.hypot(next.x - c.x, next.z - c.z) / .01 <= FLEET_SPEED + .001, 'friendly carrier stays at or below five knots');
    const { fwd, right } = deckAxes(c.headingDeg);
    for (const a of [-c.deckLength / 2, c.deckLength / 2]) for (const b of [-c.deckWidth / 2, c.deckWidth / 2]) {
      assert(terrainHeight(c.x + fwd[0] * a + right[0] * b, c.z + fwd[1] * a + right[1] * b) < -10, 'whole hull remains in deep water');
    }
    assert.equal(terrainHeight(home.x + 900, home.z), terrainBefore[i], 'moving ships never move the seabed');
  });
}
console.log('PASS safe, slow fleet patrols with unchanged terrain');

for (const craft of AIRCRAFT_LIST) {
  setFleetTime(0); const st = spawnAircraft('carrier', 0, craft.id);
  const initial = worldToDeck(carriers()[0], st.pos.x, st.pos.z);
  for (let i = 1; i <= 7200; i++) {
    const before = { ...carriers()[0] }; setFleetTime(i / 60);
    carryDeckPose(st.pos, st.quat, before, carriers()[0], st.vel);
    stepAircraft(st, idle, 1 / 60);
    assert.equal(st.result, null, craft.id + ': a parked aircraft is not crashed by deck movement');
  }
  const local = worldToDeck(carriers()[0], st.pos.x, st.pos.z);
  assert(Math.hypot(local[0] - initial[0], local[1] - initial[1]) < 2, craft.id + ': brakes hold the aircraft in its moving deck frame');
  console.log('PASS ' + craft.id + ': two minutes parked on a moving, turning deck');
}

setFleetTime(0);
const jet = spawnAircraft('carrier');
jet.throttle = jet.rpm = 1;
for (let i = 1; i < 700 && jet.catPhase !== 'idle'; i++) {
  const before = { ...carriers()[0] }; setFleetTime(i / 120);
  carryDeckPose(jet.pos, jet.quat, before, carriers()[0], jet.vel);
  stepAircraft(jet, { ...idle, brake: false, catHold: true }, 1 / 120);
}
assert.equal(jet.catPhase, 'idle'); assert(jet.airborne && !jet.result);
console.log('PASS friendly catapult launches off a moving deck');

for (const h of [0, 30, 90, 180, 270, 359]) {
  const { fwd, right } = deckAxes(h);
  const ahead = headingUpPoint(fwd[0] * 1000, fwd[1] * 1000, h);
  const beside = headingUpPoint(right[0] * 1000, right[1] * 1000, h);
  assert(Math.abs(ahead.x) < 1e-8 && Math.abs(ahead.y + 1000) < 1e-8);
  assert(Math.abs(beside.x - 1000) < 1e-8 && Math.abs(beside.y) < 1e-8);
}
console.log('PASS heading-up map positions at cardinal and oblique headings');

const before = { ...carriers()[0] }, point = new Vector3(before.x + 40, 22, before.z + 60), q = new Quaternion();
const v = fleetVelocityAt(0, 100, fleetPoseAt(0, 100).x, fleetPoseAt(0, 100).z);
const a = fleetPoseAt(0, 100), b = fleetPoseAt(0, 100.001);
assert(Math.abs(v.x - (b.x - a.x) / .001) < .001 && Math.abs(v.z - (b.z - a.z) / .001) < .001);
setFleetTime(50); const offset = worldToDeck(before, point.x, point.z); carryDeckPose(point, q, before, carriers()[0]);
const carried = worldToDeck(carriers()[0], point.x, point.z);
assert(Math.hypot(offset[0] - carried[0], offset[1] - carried[1]) < 1e-8);
console.log('PASS deck transform and patrol velocity agree with movement');

setFleetTime(0);
const scene = new Scene(), df: any = new Dogfight(scene, new ExplosionField(scene, 'low'));
const player = spawnAircraft('carrier'); df.begin(player);
const origin = { ...df.cv.def };
for (let i = 0; i < 1800; i++) { player.time += 1 / 60; df.step(1 / 60, player, false); }
const moved = Math.hypot(df.cv.def.x - origin.x, df.cv.def.z - origin.z);
assert(moved > 100 && moved < 190); assert(df.bandits.length > 0, 'moving hostile carrier still launches its wave');
for (const bandit of df.bandits) if (bandit.catT >= 0) {
  const delta = Math.hypot(bandit.pos.x - df.cv.def.x, bandit.pos.z - df.cv.def.z);
  assert(delta < 250, 'launching plane stays attached to the moving ship');
}
const bandit = df.bandits[0]; bandit.catT = .3; bandit.catAcross = 20;
df.cv.def.x += 80; df.cv.def.headingDeg += 15; df.setCatPose(bandit, df.cv.def.deckY);
const local = worldToDeck(df.cv.def, bandit.pos.x, bandit.pos.z);
assert(Math.abs(local[1] - 20) < 1e-6, 'catapult stroke follows the carrier while it turns');
df.dispose(); setFleetTime(0);
console.log('PASS enemy closes slowly, launches planes, and keeps catapult strokes attached');

// Exercise the real engine boundary as well as the underlying flight model.
for (const craft of AIRCRAFT_LIST) {
  setFleetTime(0);
  const sim: any = Object.create(Sim.prototype), scene = new Scene();
  Object.assign(sim, {
    state: spawnAircraft('carrier', 0, craft.id), settings: { ...defaultSettings(), aircraft: craft.id },
    phase: 'flying', netState: { status: 'idle' }, poseOut: {}, acc: 0, crashSeq: null, dfArmed: false,
    prevPos: new Vector3(), prevQuat: new Quaternion(), fleetClock: 0,
    input: { sample: () => idle }, renderer: { updateFleet() {} },
    df: new Dogfight(scene, new ExplosionField(scene, 'low')),
    updateJetPose() {}, updateAudio() {}, updateHud() {},
  });
  const initial = worldToDeck(carriers()[0], sim.state.pos.x, sim.state.pos.z);
  for (let i = 1; i <= 3600; i++) { sim.moveFleet(i / 60); sim.stepSim(1 / 60); }
  assert.equal(sim.state.result, null);
  const local = worldToDeck(carriers()[0], sim.state.pos.x, sim.state.pos.z);
  assert(Math.hypot(local[0] - initial[0], local[1] - initial[1]) < 2, craft.id + ': engine integration preserves parked deck position');
  const pose = sim.buildPose(), v = fleetVelocityAt(0, 60, sim.state.pos.x, sim.state.pos.z);
  assert(Math.abs(pose.vx - sim.state.vel.x - v.x) < 1e-8 && Math.abs(pose.vz - sim.state.vel.z - v.z) < 1e-8);
  sim.df.dispose(); console.log('PASS ' + craft.id + ': engine movement and transmitted deck velocity');
}
setFleetTime(0);
