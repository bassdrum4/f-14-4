// Moving carrier geometry/physics, catapult launches and immutable seabed.
import { strict as assert } from 'node:assert';
import { Scene, Vector3, Quaternion } from 'three';
import { ARCHIPELAGO, carriers, setWorldSeed, DEFAULT_SEED, terrainHeight, groundAt, setFleetTime, fleetPoseAt, fleetVelocityAt, FLEET_SPEED, worldToDeck, deckAxes } from '../src/sim/world';
import { buildEscort, STRIKE_GROUP } from '../src/render/strikeGroup';
import { spawnAircraft, stepAircraft, carryDeckPose } from '../src/sim/flight';
import { AIRCRAFT_LIST } from '../src/sim/aircraft';
import { Dogfight } from '../src/sim/dogfight';
import { CV_CLOSE_SPEED } from '../src/sim/combat/tuning';
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
const v = fleetVelocityAt(0, 100);
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
assert(moved > CV_CLOSE_SPEED * 15 && moved <= CV_CLOSE_SPEED * 30, `the enemy closes slowly (${moved.toFixed(0)} m in 30 s)`);
assert.equal(df.cv.def.headingDeg, origin.headingDeg, 'the enemy steams a straight line — no rudder');
assert(df.bandits.length > 0, 'moving hostile carrier still launches its wave');
for (const bandit of df.bandits) if (bandit.catT >= 0) {
  const delta = Math.hypot(bandit.pos.x - df.cv.def.x, bandit.pos.z - df.cv.def.z);
  assert(delta < 250, 'launching plane stays attached to the moving ship');
}
const bandit = df.bandits[0]; bandit.catT = .3; bandit.catAcross = 20;
df.cv.def.x += 80; df.cv.def.headingDeg += 15; df.setCatPose(bandit, df.cv.def.deckY);
const local = worldToDeck(df.cv.def, bandit.pos.x, bandit.pos.z);
assert(Math.abs(local[1] - 20) < 1e-6, 'catapult stroke follows the carrier while it turns');
df.dispose(); setFleetTime(0);
console.log('PASS enemy steams straight and slowly, launches planes, and keeps catapult strokes attached');

// Exercise the real engine boundary as well as the underlying flight model.
for (const craft of AIRCRAFT_LIST) {
  setFleetTime(0);
  const sim: any = Object.create(Sim.prototype), scene = new Scene();
  Object.assign(sim, {
    state: spawnAircraft('carrier', 0, craft.id), settings: { ...defaultSettings(), aircraft: craft.id },
    phase: 'flying', netState: { status: 'idle' }, poseOut: {}, acc: 0, crashSeq: null, dfArmed: false,
    prevPos: new Vector3(), prevQuat: new Quaternion(), fleetClock: 0,
    input: { sample: () => idle }, renderer: { updateFleet() {}, setStrikeGroup() {}, setWind() {}, takeThunder: () => 0 },
    df: new Dogfight(scene, new ExplosionField(scene, 'low')),
    updateJetPose() {}, updateAudio() {}, updateHud() {},
  });
  const parked = sim.state.pos.clone();
  const initial = worldToDeck(carriers()[0], sim.state.pos.x, sim.state.pos.z);
  for (let i = 1; i <= 3600; i++) { sim.moveFleet(i / 60); sim.stepSim(1 / 60); }
  assert.equal(sim.state.result, null);
  const pose = sim.buildPose();
  if (craft.surfaceVessel) {
    // A destroyer floats in the water rather than on the deck: the carrier
    // steams past her and she holds her own station, with no deck velocity
    // riding her pose.
    assert(Math.hypot(sim.state.pos.x - parked.x, sim.state.pos.z - parked.z) < .5, craft.id + ': surface hull holds its own station');
    assert(Math.abs(pose.vx - sim.state.vel.x) < 1e-8 && Math.abs(pose.vz - sim.state.vel.z) < 1e-8, craft.id + ': no deck velocity on a floating hull');
  } else {
    const local = worldToDeck(carriers()[0], sim.state.pos.x, sim.state.pos.z);
    assert(Math.hypot(local[0] - initial[0], local[1] - initial[1]) < 2, craft.id + ': engine integration preserves parked deck position');
    const v = fleetVelocityAt(0, 60);
    assert(Math.abs(pose.vx - sim.state.vel.x - v.x) < 1e-8 && Math.abs(pose.vz - sim.state.vel.z - v.z) < 1e-8);
  }
  sim.df.dispose(); console.log('PASS ' + craft.id + ': engine movement and transmitted deck velocity');
}

// The campaign's strike group rides the same straight leg: every escort keeps
// station on open water, clear of the carrier's hull, and builds headless.
{
  setFleetTime(0);
  const c = carriers()[0], { fwd, right } = deckAxes(c.headingDeg);
  for (const spec of STRIKE_GROUP) {
    const x = c.x + fwd[0] * spec.along + right[0] * spec.across;
    const z = c.z + fwd[1] * spec.along + right[1] * spec.across;
    const range = Math.hypot(x - c.x, z - c.z);
    assert.equal(groundAt(x, z).kind, 'water', spec.name + ': station is open water');
    assert(range > 600 && range < 2600, spec.name + ': station keeps clear of the deck');
    assert(buildEscort(spec).children.length > 5, spec.name + ': escort has a hull and a deckhouse');
  }
  console.log('PASS the strike group keeps station on open water around the carrier');
}
setFleetTime(0);
