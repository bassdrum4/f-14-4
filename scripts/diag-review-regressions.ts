// Regression coverage for mission, spectator, weather, damage and HUD integration.
import { Scene } from 'three';
import { BattleReferee } from '../src/net/versus';
import { Sim, applyWeatherPresetTo } from '../src/sim/engine';
import { Dogfight } from '../src/sim/dogfight';
import { ExplosionField } from '../src/render/effects';
import { spawnAircraft, stepAircraft } from '../src/sim/flight';
import * as operations from '../src/sim/operations';
import { strict as assert } from 'node:assert';
import { Operation } from '../src/sim/operations';
import { WEATHER } from '../src/sim/weather';
import { defaultSettings } from '../src/settings';
import { DEFAULT_SEED, setWorldSeed } from '../src/sim/world';
setWorldSeed(DEFAULT_SEED);
let failures = 0;
function test(name: string, run: () => void) {
    try {
        run();
        console.log("PASS " + name);
    }
    catch (error) {
        failures++;
        console.error("FAIL " + name, error);
    }
}
function flight(id: any = 'tomcat') { const s = spawnAircraft('carrier', 0, id); s.onGround = false; s.airborne = true; s.catPhase = 'idle'; s.pos.y = 3000; s.vel.set(0, 0, -180); s.speed = 180; return s; }
function combat() { const scene = new Scene(); return new Dogfight(scene, new ExplosionField(scene, 'low')) as any; }
function engine(mode: any = 'campaign') {
    const sim: any = Object.create(Sim.prototype), player = flight(), df = combat();
    Object.assign(sim, { settings: { ...defaultSettings(), missionMode: mode }, df, state: player, mission: 'carrier', spawnCarrier: 0, phase: 'menu', operationId: 1000, operationSeed: 7, worldSeed: DEFAULT_SEED, fleetClock: 10, weather: WEATHER.clear, weatherMode: 'clear', netState: { status: 'idle', pilots: [], self: 'me' }, pings: [], settingsListeners: new Set(), prevPos: player.pos.clone(), prevQuat: player.quat.clone(), rig: { resetFollow() { } }, input: { take: () => false, clearEdges() { }, applySettings() { } }, audio: { setVolume() { }, start() { }, resume() { } }, renderer: { setAircraft() { }, setAdaptiveResolution() { }, applyQuality() { }, setWeather() { }, setWind() { } }, net: { setAircraft() { }, setMode() { }, setMissionStyle() { }, setWeather() { }, launch() { } }, remoteFleet: { clear() { }, liveIds() { return []; }, combatTargets() { return []; } }, battle: { match: 0, pilots: [] }, updateHud() { }, updateJetPose() { }, updateAudio() { }, endPod() { }, newState: () => player, setPhase(p: string) { sim.phase = p; } });
    return sim;
}
// Mission lifecycle
test('campaign next and retry reset attempts while relaunch preserves progress', () => {
    const s = engine();
    s.startMission('carrier');
    s.df.beginCampaign(s.state);
    s.df.operation.state.phase = 'convoy';
    s.df.operation.state.campaignStage = 2;
    const before = { id: s.operationId, seed: s.df.operationState.seed, stage: s.df.operationState.campaignStage };
    s.netState = { status: 'online', host: true, pilots: [] };
    s.nextOperation();
    assert.notEqual(s.operationId, before.id);
    assert.equal(s.df.operationState.seed, 8);
    assert.equal(s.df.operationState.campaignStage, 1);
    const retryId = s.operationId;
    s.restart();
    assert.notEqual(s.operationId, retryId);
    assert.equal(s.df.operationState.seed, 8);
    s.df.operation.state.campaignStage = 2;
    const sortieId = s.operationId;
    s.startRoomMission('carrier');
    assert.equal(s.operationId, sortieId);
    assert.equal(s.df.operationState.campaignStage, 2);
});
test('campaigns always use an authored operation', () => {
    const d = combat(), p = flight();
    d.configureOperations(false, 7, 1001);
    d.prepareCampaign(p);
    d.beginCampaign(p);
    d.operation.state.phase = 'final';
    d.operation.state.campaignStage = 3;
    d.operation.advance(1, { stopped: 0, arrived: 0, scouts: 0, attackers: 0, queued: 0 });
    assert.equal(d.authored, true);
    assert.equal(d.operationState.status, 'success');
});
test('promoted hosts retain the shared strike variant', () => {
    const p = flight(), host = combat(), guest = combat();
    host.configureOperations(true, 7, 1002, undefined, 'bastion');
    host.prepareStrike(p);
    host.beginStrike(p);
    guest.configureOperations(true, 7, 1002, undefined, 'convoy');
    guest.setMirror(true, p);
    guest.applySharedSnapshot(host.sharedSnapshot(), 100);
    const during = { kind: guest.operationState.kind, variant: guest.strikeVariant };
    guest.setMirror(false, p);
    guest.configureOperations(true, 7, 1003);
    guest.prepareStrike(p);
    assert.equal(during.variant, 'bastion');
    assert.equal(guest.operationState.kind, 'bastion');
});
// Weather synchronization
test('guests cannot override weather but accept host updates', () => {
    const s = engine('cruise');
    s.netState = { status: 'online', host: false, pilots: [] };
    s.applySettings({ ...s.settings, weather: 'storm' });
    assert.equal(s.weatherMode, 'clear');
    assert.equal(s.settings.weather, 'clear');
    s.applyRoomWeather('storm');
    assert.equal(s.weatherMode, 'storm');
});
test('gusts follow theatre time across respawns', () => {
    const s = engine('cruise');
    s.weather = WEATHER.storm;
    const a = flight(), b = flight();
    a.time = 3.25;
    b.time = 0;
    applyWeatherPresetTo(a, WEATHER.storm, 7, 12);
    applyWeatherPresetTo(b, WEATHER.storm, 7, 12);
    assert.equal(a.windX, b.windX);
    assert.equal(a.windZ, b.windZ);
    s.applyWeather(a);
    s.applyWeather(b);
    assert.equal(a.windX, b.windX);
    assert.equal(a.windZ, b.windZ);
});
// Damage and recovery
test('helicopters respond to engine and hydraulic damage', () => {
    const good = flight('seahawk'), bad = flight('seahawk');
    good.vel.set(0, 0, 0);
    bad.vel.set(0, 0, 0);
    good.rpm = good.throttle = bad.rpm = bad.throttle = .7;
    Object.assign(bad.subsystems!, { engineL: 0, engineR: 0, hydraulics: 0, fuelPct: 0, fuelLeak: true });
    for (let i = 0; i < 120; i++) {
        stepAircraft(good, { pitch: .2, roll: .1, yaw: 0 } as any, 1 / 120);
        stepAircraft(bad, { pitch: .2, roll: .1, yaw: 0 } as any, 1 / 120);
    }
    assert(good.pos.distanceTo(bad.pos) > 1);
    assert(good.quat.angleTo(bad.quat) > .001);
    assert(bad.vel.y < good.vel.y);
});
test('landing service repairs subsystems and fuel', () => {
    const s = engine();
    Object.assign(s.state.subsystems, { engineL: .45, engineR: .65, hydraulics: .45, fuelPct: 10, fuelLeak: true });
    s.df.hull = 30;
    s.refillOnRecovery();
    assert.equal(s.df.hud(s.state).hull, 100);
    assert.deepEqual(s.state.subsystems, { engineL: 1, engineR: 1, hydraulics: 1, avionics: 1, fuelLeak: false, fuelPct: 100 });
});
test('PvP hull loss damages subsystems once', () => {
    const s = engine('versus');
    s.netState = { status: 'online', host: false, self: 'me', pilots: [] };
    s.phase = 'flying';
    s.battle = { match: 42, pilots: [] };
    s.battleLife = 1;
    s.remoteWeapons = { prune() { } };
    s.applyBattle({ match: 42, pilots: [{ id: 'me', name: 'ME', hp: 10, life: 1, kills: 0, deaths: 0, respawnIn: 0, ready: true, shield: false }] });
    assert.equal(s.df.hud(s.state).hull, 10);
    assert.notDeepEqual(s.state.subsystems, { engineL: 1, engineR: 1, hydraulics: 1, avionics: 1, fuelLeak: false, fuelPct: 100 });
    const sub = { ...s.state.subsystems };
    s.df.setBattleHull(10, s.state);
    assert.deepEqual(s.state.subsystems, sub);
});
// Spectator player lifecycle
test('spectators never send combat ready actions', () => {
    const s = engine('versus');
    s.netState = { status: 'online', host: false, self: 'watcher', spectator: true, pilots: [{ id: 'host', host: true, linked: true }] };
    s.phase = 'flying';
    s.battle = { match: 42, pilots: [] };
    s.battleReadyAt = -Infinity;
    s.battleSeq = 0;
    const actions: any[] = [];
    s.net.sendBattleAction = (a: any) => actions.push(a);
    s.net.sendBattleMissiles = () => { };
    s.syncBattle();
    assert.equal(actions.length, 0);
});
// HUD and camera
test('spectator LSO view selects a deck platform', () => {
    const s = engine();
    let platform: any = 'not-called';
    s.renderer.jetGroup = { visible: false };
    s.renderer.camera = {};
    s.input.takeMouse = () => ({ dx: 0, dy: 0 });
    s.rig = { mouse() { }, update(...args: any[]) { platform = args[6]; } };
    s.spectateList = s.spectateTargets();
    s.spectateIndex = 0;
    s.updateSpectateCamera(1 / 60);
    assert(platform);
    assert(Number.isFinite(platform.x));
});
test('campaign countdown agrees with phase transitions', () => {
    const d = combat(), p = flight();
    d.operation = Operation.create('campaign', 123, 7, 0);
    d.operation.start();
    d.operation.state.phase = 'forming';
    d.operation.state.scoutStopped = true;
    d.operation.state.phaseTime = 44;
    const eta = d.operationHud(p).eta;
    d.operation.advance(1, { stopped: 0, arrived: 0, scouts: 0, attackers: 0, queued: 0 });
    assert.equal(eta, 1);
    assert.equal(d.operationState.phase, 'strike');
});
test('H3 objective progress matches the mission and stage', () => {
    const op = Operation.create('bastion', 1, 7, 0);
    op.start();
    op.state.stopped = 2;
    assert.equal(operations.operationProgress(op.state), '2/3 DESTROYED');
    op.state.kind = 'campaign';
    op.state.campaignStage = 2;
    assert.equal(operations.operationProgress(op.state), '2/2 STOPPED');
    op.state.campaignStage = 3;
    op.state.fleetHull = 85;
    assert.equal(operations.operationProgress(op.state), 'FRIENDLY CARRIER 85%');
});
test('helicopter fuel leaks deplete tanks and empty tanks cut thrust', () => {
    const good = flight('seahawk'), empty = flight('seahawk'), leaking = flight('seahawk');
    for (const state of [good, empty, leaking]) {
        state.vel.set(0, 0, 0);
        state.rpm = state.throttle = .8;
    }
    empty.subsystems!.fuelPct = 0;
    leaking.subsystems!.fuelLeak = true;
    const input = { pitch: 0, roll: 0, yaw: 0 } as any;
    for (let i = 0; i < 120; i++)
        for (const state of [good, empty, leaking])
            stepAircraft(state, input, 1 / 120);
    assert(good.vel.y > empty.vel.y + 5);
    assert(Math.abs(leaking.subsystems!.fuelPct - 99.55) < 1e-8);
});
test('PvP rearming does not damage the repaired aircraft', () => {
    const s = engine('versus');
    s.netState = { status: 'online', self: 'me', pilots: [] };
    s.battle = { match: 42, pilots: [{ id: 'me', ready: true, hp: 10 }] };
    s.df.hull = 10;
    s.state.subsystems.engineL = .45;
    s.state.subsystems.fuelLeak = true;
    s.rearmBattleAircraft();
    assert.deepEqual(s.state.subsystems, { engineL: 1, engineR: 1, hydraulics: 1, avionics: 1, fuelLeak: false, fuelPct: 100 });
    assert.equal(s.df.hull, 10);
});
test('a spectator host referees combat without registering watchers as fighters', () => {
    const s = engine('versus');
    s.netState = { status: 'online', host: true, self: 'watcher', spectator: true, pilots: [{ id: 'pilot', name: 'Pilot' }, { id: 'other-watcher', name: 'Watcher', spectator: true }] };
    s.battleReferee = new BattleReferee();
    s.battleReferee.reset(42);
    s.battle = { match: 42, pilots: [] };
    s.battleTickAt = -Infinity;
    s.remoteWeapons = { prune() { } };
    s.net.publishBattle = () => { };
    s.syncBattle();
    assert.deepEqual(s.battle.pilots.map((p: any) => p.id), ['pilot']);
});
if (failures)
    process.exit(1);
