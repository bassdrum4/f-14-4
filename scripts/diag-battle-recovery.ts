// Exercise the real engine/referee boundary without constructing WebGL or audio.
import { strict as assert } from 'node:assert';
import { Scene, Vector3, Quaternion } from 'three';
import { Sim } from '../src/sim/engine';
import { spawnAircraft, stepAircraft, type SimResult } from '../src/sim/flight';
import { BattleReferee, type BattleAction } from '../src/net/versus';
import { Dogfight } from '../src/sim/dogfight';
import { ExplosionField } from '../src/render/effects';
import { defaultSettings } from '../src/settings';
import { AIRCRAFT_LIST, type AircraftId } from '../src/sim/aircraft';

function setup(result: SimResult | null, host = true, aircraft: AircraftId = 'tomcat') {
  const sim: Record<string, any> = Object.create(Sim.prototype);
  const now = performance.now() / 1000;
  const ref = new BattleReferee();
  ref.reset(17); ref.reconcile([{ id: 'a', name: 'ALPHA' }, { id: 'b', name: 'BRAVO' }]);
  ref.action('a', { kind: 'ready', match: 17, seq: 1, life: 0 }, now - 10, 0);
  ref.action('b', { kind: 'ready', match: 17, seq: 1, life: 0 }, now - 10, 0);
  ref.action('b', { kind: 'hit', weapon: 'missile', match: 17, seq: 2, life: 1, victim: 'a', victimLife: 1 }, now - 1, 100);
  sim.settings = { ...defaultSettings(), missionMode: 'versus', aircraft };
  sim.netState = { status: 'online', self: 'a', host, pilots: [{ id: 'b', name: 'BRAVO', aircraft: 'tomcat', host: !host, linked: true }] };
  sim.battleReferee = ref; sim.battle = ref.snapshot(now);
  sim.battleLife = 1; sim.battleDeadLife = -1; sim.battleSeq = 2;
  sim.battleTickAt = now; sim.battleReadyAt = 0;
  sim.battleRecoveryLife = -1; sim.battleRecoveryAt = 0;
  sim.phase = 'flying'; sim.crashSeq = null; sim.acc = 0;
  sim.state = spawnAircraft('carrier', 2, aircraft); sim.state.result = result;
  sim.state.time = 42; sim.state.flightTime = 38;
  sim.spawnCarrier = 0;
  sim.prevPos = new Vector3(); sim.prevQuat = new Quaternion();
  sim.remoteFleet = { combatTargets: () => [] };
  sim.remoteWeapons = { clear: () => {} };
  sim.rig = { resetFollow: () => {} };
  const scene = new Scene();
  sim.df = new Dogfight(scene, new ExplosionField(scene, 'low'));
  sim.df.beginVersus(sim.state);
  sim.df.setBattleHull(10);
  // Simulate expended stores through the same state used by the weapon logic.
  (sim.df as any).bombsLeft = 0; (sim.df as any).missilesLeft = 0;
  (sim.df as any).flaresLeft = 0;
  sim.updateJetPose = sim.updateAudio = sim.updateHud = () => {};
  const actions: BattleAction[] = [];
  sim.net = { callsign: 'ALPHA', publishBattle: () => {}, sendBattleAction: (action: BattleAction) => {
    actions.push(action);
    if (host) sim.receiveBattleAction('a', action);
  } };
  return { sim, ref, actions };
}

for (const result of [
  { kind: 'wire', wire: 3, title: 'CAUGHT WIRE 3', detail: 'Recovered' },
  { kind: 'landing', title: 'DECK LANDING', detail: 'Recovered' },
  { kind: 'landing', title: 'RUNWAY LANDING', detail: 'Recovered' },
] as SimResult[]) {
  const { sim, ref, actions } = setup(result);
  if (result.title === 'RUNWAY LANDING') {
    sim.state = { ...spawnAircraft('airfield'), result, time: 42, flightTime: 38 };
  }
  sim.stepSim(0);
  sim.syncBattle();
  const pilot = ref.snapshot(performance.now() / 1000).pilots.find(p => p.id === 'a')!;
  assert(!actions.some(a => a.kind === 'death'), `${result.title}: recovery must not report death`);
  assert.equal(pilot.deaths, 0); assert.equal(pilot.life, 1); assert.equal(pilot.hp, 100);
  assert.equal(pilot.shield, false, 'recovery does not grant another spawn shield');
  assert.equal(sim.state.result, null, 'the recovered aircraft remains flyable');
  assert.equal(sim.phase, 'flying');
  assert.equal(sim.state.time, 42); assert.equal(sim.state.flightTime, 38);
  assert.equal(sim.df.hud(sim.state).missiles, 2); assert.equal(sim.df.hud(sim.state).bombs, 6);
  if (result.title !== 'RUNWAY LANDING') {
    assert.equal(sim.state.catPhase, 'ready'); assert.equal(sim.state.catCarrier, 2);
    stepAircraft(sim.state, { pitch: 0, roll: 0, yaw: 0, throttleUp: false, throttleDown: false, trimUp: false, trimDown: false, brake: false, catHold: true }, 1 / 120);
    assert.equal(sim.state.catPhase, 'charging', 'a recovered carrier pilot can relaunch');
  } else assert.equal(sim.state.groundKind, 'runway');
  sim.df.dispose();
  console.log(`PASS ${result.title}: rearm, repair and relaunch without death or new life`);
}

for (const aircraft of AIRCRAFT_LIST) {
  const { sim } = setup({ kind: 'landing', title: 'DECK LANDING', detail: 'Recovered' }, true, aircraft.id);
  sim.stepSim(0); sim.syncBattle();
  const stores = sim.df.hud(sim.state);
  assert.equal(sim.state.spec.id, aircraft.id);
  assert.equal(stores.bombs, aircraft.bombs);
  assert.equal(stores.missiles, aircraft.missiles);
  assert.equal(stores.flares, aircraft.flares);
  assert.equal(sim.state.catPhase, aircraft.rotorcraft ? 'idle' : 'ready');
  if (aircraft.rotorcraft) assert(sim.state.banner.text.includes('COLLECTIVE UP'), 'rotary-wing recovery keeps its own lift-off controls');
  sim.df.dispose(); console.log(`PASS ${aircraft.id}: recovery preserves airframe and refills all stores`);
}

{
  const { sim, ref, actions } = setup({ kind: 'crash', title: 'DITCHED', detail: 'Impact' });
  sim.stepSim(0); sim.syncBattle(); sim.syncBattle();
  assert.equal(actions.filter(a => a.kind === 'death').length, 1);
  assert.equal(ref.snapshot(performance.now() / 1000).pilots[0].deaths, 1);
  sim.df.dispose(); console.log('PASS real crashes still report exactly one death');
}

{
  const { sim, actions } = setup({ kind: 'wire', title: 'CAUGHT WIRE 3', detail: 'Recovered' }, false);
  sim.stepSim(0); sim.syncBattle();
  assert(actions.some(a => a.kind === 'recover'), 'a wingman requests host-owned repair');
  sim.battleRecoveryAt = 0; sim.syncBattle();
  assert.equal(actions.filter(a => a.kind === 'recover').length, 2, 'repair retries if a pose arrives late');
  const repaired = { ...sim.battle, pilots: sim.battle.pilots.map((p: any) => p.id === 'a' ? { ...p, hp: 100 } : p) };
  sim.applyBattle(repaired); sim.battleRecoveryAt = 0; sim.syncBattle();
  assert.equal(actions.filter(a => a.kind === 'recover').length, 2, 'repair stops once acknowledged');
  sim.df.dispose(); console.log('PASS wingman repair waits for host acknowledgement');
}

{
  const { sim, ref } = setup(null);
  sim.state.pos.y += 1000; sim.state.onGround = false; sim.state.airborne = true;
  sim.receiveBattleAction('a', { kind: 'recover', match: 17, seq: 3, life: 1 });
  assert.equal(ref.snapshot(performance.now() / 1000).pilots[0].hp, 10, 'an airborne claim cannot repair the hull');
  sim.df.dispose(); console.log('PASS host rejects airborne recovery claims');
}
