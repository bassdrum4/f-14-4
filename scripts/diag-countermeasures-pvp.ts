import { strict as assert } from 'node:assert';
import { Scene, Vector3 } from 'three';
import { Dogfight } from '../src/sim/dogfight';
import { ExplosionField } from '../src/render/effects';
import { spawnAircraft } from '../src/sim/flight';
import { missileWarning } from '../src/sim/countermeasures';
import { Sim } from '../src/sim/engine';
import { defaultSettings } from '../src/settings';
import { RemoteWeapons } from '../src/render/remoteWeapons';
import { RemoteFleet, FLAG_ACTIVE } from '../src/render/remoteJets';
import { buildAircraft } from '../src/render/geometry';
import { animateJet } from '../src/render/rig';
import type { BattleShot } from '../src/net/versus';

const DT = 1 / 120;
function fight() { const scene = new Scene(); return new Dogfight(scene, new ExplosionField(scene, 'low')); }
function player() {
  const p = spawnAircraft('carrier');
  p.pos.set(0, 2000, 0); p.vel.set(0, 0, -200); p.quat.identity();
  p.onGround = false; p.airborne = true; p.catPhase = 'idle';
  return p;
}
{
  const pos = new Vector3(0, 2000, -2500), vel = new Vector3(0, 0, 320), at = new Vector3(0, 2000, 0);
  assert.equal(missileWarning(pos, vel, at, new Vector3()).sec, 2500 / 320);
  assert.equal(missileWarning(pos, vel, at, new Vector3(0, 0, -200)).sec, 2500 / 520);
  assert.equal(missileWarning(pos, vel, at, new Vector3(0, 0, 400)).sec, 0);
  console.log('PASS warning uses relative closing velocity and detects opening range');
}
{
  const df = fight(), p = player(); df.setAircraft(p); df.requestFlares(p);
  for (let i = 0; i < 550; i++) df.step(DT, p, false);
  df.requestFlares(p);
  assert((df as any).flares.every((f: any) => f.mesh.scale.x === 1));
  df.beginVersus(p); df.requestFlares(p); const left = df.hud(p).flares;
  df.beginVersus(p, false); assert.equal(df.hud(p).flares, left, 'death must not refill countermeasures');
  df.dispose(); console.log('PASS recycled flare scale and respawn cartridge budget');
}
function engagement(flaring: boolean, staleLife = false, ownFlares = false) {
  const attack = fight(), defense = fight(), a = player(), b = player();
  a.vel.set(0, 0, -200); b.vel.set(0, 0, 0); b.pos.z = -1500;
  attack.beginVersus(a); defense.beginVersus(b);
  attack.setOpponents([{ id: 'b', life: staleLife ? 2 : 1, pos: b.pos, vel: b.vel }]);
  attack.requestMissile(a); let hits = 0, sent = 0, captured = false;
  for (let i = 0; i < 1200; i++) {
    if (flaring) {
      defense.requestFlares(b);
      for (const shot of defense.takeWeaponLaunches()) { assert.equal(shot.weapon, 'flare'); sent++; attack.receiveRemoteFlare('b', 1, shot); }
    }
    if (ownFlares) attack.requestFlares(a);
    defense.step(DT, b, false); attack.step(DT, a, false);
    captured ||= (attack as any).missiles.some((m: any) => m.decoy !== null);
    hits += attack.takePlayerHits().length;
  }
  attack.dispose(); defense.dispose(); return { hits, sent, captured };
}
assert(engagement(false).hits > 0, 'unprotected PvP missile must still hit');
const protectedFlight = engagement(true);
assert(protectedFlight.sent > 0 && protectedFlight.captured && protectedFlight.hits === 0, 'remote flares must capture the damaging seeker');
assert(engagement(true, true).hits > 0, 'old-life flares cannot protect a new life');
assert(engagement(false, false, true).hits > 0, 'a shooter cannot decoy its own missile with local flares');
console.log('PASS transmitted cartridges protect PvP targets; stale and shooter flares do not');
{
  const df = fight(), p = player(); df.beginVersus(p);
  const sim: any = Object.create(Sim.prototype);
  sim.settings = { ...defaultSettings(), missionMode: 'versus' };
  sim.netState = { status: 'online' }; sim.battleSeenShots = new Map(); sim.df = df;
  sim.battle = { match: 17, pilots: [{ id: 'b', life: 1, ready: true, hp: 100, shield: false }] };
  sim.remoteWeapons = { add: () => { throw new Error('flare routed to projectile pool'); } };
  const shot: BattleShot = { weapon: 'flare', match: 17, life: 1, seq: 3, pos: [0, 2000, 0], vel: [0, -14, 0] };
  sim.receiveBattleShot('b', shot); assert.equal(df.flareCount(), 1);
  sim.receiveBattleShot('b', shot); assert.equal(df.flareCount(), 1, 'replayed shot ignored');
  sim.receiveBattleShot('unknown', { ...shot, seq: 4 });
  sim.receiveBattleShot('b', { ...shot, seq: 4, life: 0 });
  sim.receiveBattleShot('b', { ...shot, seq: 4, match: 16 });
  assert.equal(df.flareCount(), 1, 'sender, match and life must agree');
  df.dispose(); console.log('PASS engine receives flare events once and rejects stale/unknown senders');
}
{
  const df = fight(), p = player(); df.beginVersus(p);
  const scene = new Scene(), visuals = new RemoteWeapons(scene, new ExplosionField(scene, 'low'));
  const snapshot = { match: 17, life: 1, seq: 8, missiles: [{ id: 1, age: .4, target: 'a', pos: [0, 2000, -700] as [number,number,number], vel: [0, 0, 320] as [number,number,number] }] };
  visuals.reconcile('b', snapshot);
  const contacts = [{ id: 'a', pos: p.pos, vel: p.vel }];
  visuals.step(DT, contacts, 'a');
  assert(visuals.warning && visuals.warning.sec > 0);
  // A defender's local flare roll must never clear an authoritative warning.
  for (let i = 0; i < 60; i++) {
    df.requestFlares(p); df.step(DT, p, false); visuals.step(DT, contacts, 'a');
  }
  assert(visuals.incoming);
  visuals.reconcile('b', { ...snapshot, seq: 9, missiles: [{ ...snapshot.missiles[0], target: null }] });
  visuals.step(DT, contacts, 'a');
  assert.equal(visuals.incoming, false); assert.equal(visuals.warning, null);
  visuals.reconcile('b', { ...snapshot, seq: 10 });
  visuals.step(DT, contacts, 'a'); assert(visuals.incoming, 'shooter relock restores the warning');
  visuals.reconcile('b', { ...snapshot, seq: 11, missiles: [] });
  visuals.step(DT, contacts, 'a'); assert.equal(visuals.incoming, false);
  assert.equal((visuals as any).projectiles.length, 0, 'shooter retirement removes the remote round');
  df.dispose(); visuals.dispose(); console.log('PASS warning and missile follow shooter capture, relock and retirement');
}
{
  const attack = fight(), defense = fight(), a = player(), b = player();
  b.pos.z = -1500; b.vel.set(0, 0, 0);
  attack.beginVersus(a); defense.beginVersus(b);
  attack.setOpponents([{ id: 'b', life: 1, pos: b.pos, vel: b.vel }]);
  attack.requestMissile(a);
  const scene = new Scene(), visual = new RemoteWeapons(scene, new ExplosionField(scene, 'low'));
  const sim: any = Object.create(Sim.prototype);
  sim.settings = { ...defaultSettings(), missionMode: 'versus' };
  sim.netState = { status: 'online' }; sim.battleSeenMissiles = new Map(); sim.remoteWeapons = visual;
  sim.battle = { match: 17, pilots: [{ id: 'a', life: 1, ready: true, hp: 100, shield: false }] };
  let captured = false;
  for (let i = 0; i < 900; i++) {
    defense.requestFlares(b);
    for (const shot of defense.takeWeaponLaunches()) attack.receiveRemoteFlare('b', 1, shot);
    defense.step(DT, b, false); attack.step(DT, a, false);
    const missiles = attack.battleMissiles();
    sim.receiveBattleMissiles('a', { match: 17, life: 1, seq: i + 1, missiles });
    visual.step(DT, [{ id: 'b', pos: b.pos, vel: b.vel }], 'b');
    const targeting = missiles.some(m => m.target === 'b');
    assert.equal(visual.incoming, targeting, 'observer agrees with damaging seeker on every update');
    captured ||= (attack as any).missiles.some((m: any) => m.decoy !== null);
  }
  assert(captured);
  sim.receiveBattleMissiles('a', { match: 17, life: 1, seq: 1, missiles: [{ id: 1, age: 0, pos: [0,2000,-700], vel: [0,0,320], target: 'b' }] });
  assert.equal((visual as any).projectiles.length, 0, 'a delayed snapshot cannot resurrect retired rounds');
  attack.dispose(); defense.dispose(); visual.dispose();
  console.log('PASS real damaging seeker and observer agree; delayed snapshots cannot resurrect missiles');
}

{
  const doc = globalThis.document;
  (globalThis as any).document = { createElement: () => ({ width: 0, height: 0, getContext: () => null }) };
  const fleet = new RemoteFleet(new Scene()); fleet.spawn('b', 'seahawk', 'BRAVO');
  fleet.push('b', { x: 0, y: 2000, z: 0, qx: 0, qy: 0, qz: 0, qw: 1, vx: 0, vy: 0, vz: 0, speed: 0, sweepT: 0, flags: FLAG_ACTIVE }, 1000);
  fleet.update(1000); fleet.update(1100);
  const mesh = (fleet as any).remotes.get('b').mesh;
  assert(mesh.rotor.rotation.y !== 0 && mesh.tailRotor.rotation.x !== 0);
  fleet.dispose(); (globalThis as any).document = doc;
  const local = buildAircraft('seahawk'), st = spawnAircraft('carrier', 0, 'seahawk'); st.time = 2;
  animateJet(local, st, 1, 1 / 30); const before = local.rotor!.rotation.y;
  animateJet(local, st, 1, 1 / 144); assert.equal(local.rotor!.rotation.y, before);
  console.log('PASS remote rotors spin and local rotation is independent of frame rate');
}
