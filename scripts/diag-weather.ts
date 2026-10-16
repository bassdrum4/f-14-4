// Heavy-metal immersion (Option 3): weather, the sea it puts under the fleet,
// airframe damage and the LSO's pass.
//
// What has to hold:
//
//   * each preset is a real state of the theatre — wind, gusts, turbulence, sea
//     state, visibility — and clear weather stays calm,
//   * the wind is the same squall for everyone: a pure function of the preset,
//     the world seed and the clock, gusting on its own cycle,
//   * the wind is felt: it shifts the air-relative speed away from ground speed,
//   * a rolling, heaving deck carries a parked aircraft with it and does not
//     crash it,
//   * battle damage degrades the airframe asymmetrically — one engine down yaws
//     the jet, hydraulic loss softens the controls — and a fuel leak runs the
//     tanks down,
//   * Paddles calls the pass, and the pass gets graded,
//   * the audio immersion layers are safe to drive before the mixer exists.
//
// Usage: bun scripts/diag-weather.ts  (or: bun run test:weather)

import { strict as assert } from "node:assert";
import { Vector3 } from "three";
import { spawnAircraft, stepAircraft, carryDeckPose, evaluateLsoGrade, type LsoSample } from "../src/sim/flight";
import { WEATHER, seaStateFor, weatherPreset, windFor } from "../src/sim/weather";
import { carriers, deckSurfaceY, groundAt, setFleetTime, setSeaState, worldToDeck, setWorldSeed, DEFAULT_SEED } from "../src/sim/world";
import { AudioEngine } from "../src/audio/engineSound";
import { applyWeatherPresetTo } from "../src/sim/engine";

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
setFleetTime(0);
setSeaState(null);

const idle = { pitch: 0, roll: 0, yaw: 0, throttleUp: false, throttleDown: false, trimUp: false, trimDown: false, brake: true, catHold: false };

test("every weather mode is a whole theatre state, and clear stays calm", () => {
  for (const mode of ["clear", "overcast", "storm"] as const) {
    const p = weatherPreset(mode);
    assert.equal(p.mode, mode);
    assert(p.brief.length > 20, "a pilot can be briefed on it");
  }
  assert.equal(seaStateFor(WEATHER.clear), null, "a calm sea needs no swell");
  const storm = seaStateFor(WEATHER.storm)!;
  assert(storm.heave > 1 && storm.pitchDeg > 0.5 && storm.rollDeg > 1, "a storm moves the deck");
  assert(WEATHER.storm.rain > 0.9 && WEATHER.storm.lightning > 0, "and it rains, and it thunders");
  assert(WEATHER.storm.windSpeed > WEATHER.overcast.windSpeed && WEATHER.overcast.windSpeed > WEATHER.clear.windSpeed);
  assert(WEATHER.overcast.cloudCover > WEATHER.clear.cloudCover);
  assert(WEATHER.storm.sunScale < WEATHER.overcast.sunScale);
});

test("the squall blows the same way for everyone, and gusts on its own cycle", () => {
  const storm = WEATHER.storm;
  const a = windFor(storm, 4242, 0);
  const b = windFor(storm, 4242, 0);
  assert.deepEqual(a, b, "same preset, same seed, same wind");
  let different = 0;
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const w = windFor(storm, seed, 0);
    if (Math.abs(Math.atan2(w.x, -w.z) - Math.atan2(a.x, -a.z)) > 1e-6) different++;
  }
  assert(different > 0, "a different world means a different wind direction");
  // the gust cycle stays inside the preset's envelope
  let min = Infinity, max = -Infinity;
  for (let t = 0; t < 200; t += 0.5) {
    const s = Math.hypot(windFor(storm, 1, t).x, windFor(storm, 1, t).z);
    min = Math.min(min, s);
    max = Math.max(max, s);
  }
  assert(min >= storm.windSpeed - storm.gust - 0.01, `gusts never fall below the lull (${min.toFixed(1)})`);
  assert(max <= storm.windSpeed + storm.gust + 0.01, `gusts never exceed the squall (${max.toFixed(1)})`);
  assert(max - min > storm.gust, "and the wind really does build and ease");
  assert(Math.abs(Math.hypot(windFor(WEATHER.clear, 1, 0).x, windFor(WEATHER.clear, 1, 0).z) - WEATHER.clear.windSpeed) < 1e-12);
});

test("the weather is felt: wind shifts airspeed away from ground speed", () => {
  const st = spawnAircraft("airfield", 0);
  st.onGround = false;
  st.airborne = true;
  st.catPhase = "idle";
  st.throttle = 0.8;
  st.rpm = 0.8;
  st.pos.set(0, 3000, 0);
  st.quat.setFromAxisAngle(new Vector3(0, 1, 0), 0);
  st.vel.set(0, 0, -200); // flying north at 200 m/s
  st.speed = 200;
  // A tailwind (blowing north, the way we are pointed) means less air over the
  // wing than the ground track suggests.
  st.windX = 0; st.windZ = -30;
  stepAircraft(st, idle, 1 / 120);
  assert(st.speed < Math.hypot(st.vel.x, st.vel.z), `tailwind reduces airspeed (${st.speed.toFixed(1)} vs ${Math.hypot(st.vel.x, st.vel.z).toFixed(1)})`);
  // A headwind does the opposite.
  const st2 = spawnAircraft("airfield", 0);
  Object.assign(st2, { onGround: false, airborne: true, catPhase: "idle", throttle: 0.8, rpm: 0.8 });
  st2.pos.copy(st.pos); st2.quat.copy(st.quat); st2.vel.copy(st.vel); st2.speed = 200;
  st2.windX = 0; st2.windZ = 30;
  stepAircraft(st2, idle, 1 / 120);
  assert(st2.speed > st.speed, "a headwind gives more airspeed for the same ground track");
});

test("turbulence shakes the airframe and the preset says how much", () => {
  const st = spawnAircraft("airfield", 0);
  Object.assign(st, { onGround: false, airborne: true, catPhase: "idle", throttle: 0.7, rpm: 0.7, turbulence: 1 });
  st.pos.set(0, 4000, 0);
  st.vel.set(0, 0, -220);
  st.speed = 220;
  const before = st.omega.clone();
  for (let i = 0; i < 12; i++) stepAircraft(st, idle, 1 / 120);
  assert(st.omega.distanceTo(before) > 0, "the airframe is being worked by the air");
  assert(WEATHER.clear.turbulence < WEATHER.storm.turbulence);
});

test("a storm's swell rolls the deck, and the physics rides the same wave", () => {
  setSeaState(seaStateFor(WEATHER.storm));
  const heights: number[] = [];
  for (let t = 0; t <= 20; t += 0.5) {
    setFleetTime(t);
    const c = carriers()[0];
    assert(c.heave !== undefined && c.pitchDeg !== undefined && c.rollDeg !== undefined);
    heights.push(deckSurfaceY(c, c.x, c.z));
  }
  assert(Math.max(...heights) - Math.min(...heights) > 2, "the deck heaves");
  const c = carriers()[0];
  assert(Math.abs(c.pitchDeg ?? 0) < 3 && Math.abs(c.rollDeg ?? 0) < 5, "but never enough to throw a parked jet off");
  const along = deckSurfaceY(c, c.x + Math.sin(c.headingDeg * Math.PI / 180) * 200, c.z - Math.cos(c.headingDeg * Math.PI / 180) * 200);
  assert(Math.abs(along - deckSurfaceY(c, c.x, c.z)) > 0.2, "and it pitches, so the bow rides higher than the centre");
  // groundAt is the physics' view of the same deck
  assert.equal(groundAt(c.x, c.z).y, deckSurfaceY(c, c.x, c.z));
  setSeaState(null);
  setFleetTime(0);
  assert.equal(carriers()[0].heave, 0, "and a calm sea is flat again");
});

test("an aircraft parked in a storm rides the deck without being wrecked by it", () => {
  setSeaState(seaStateFor(WEATHER.storm));
  setFleetTime(0);
  const st = spawnAircraft("carrier", 0);
  const start = worldToDeck(carriers()[0], st.pos.x, st.pos.z);
  for (let i = 1; i <= 7200; i++) {
    const before = { ...carriers()[0] };
    setFleetTime(i / 60);
    carryDeckPose(st.pos, st.quat, before, carriers()[0], st.vel);
    stepAircraft(st, idle, 1 / 60);
    assert.equal(st.result, null, "no crash on a rolling deck");
  }
  const local = worldToDeck(carriers()[0], st.pos.x, st.pos.z);
  assert(Math.hypot(local[0] - start[0], local[1] - start[1]) < 3, "and the brakes hold the jet in its deck frame");
  setSeaState(null);
  setFleetTime(0);
});

test("engine and hydraulic damage degrade the airframe asymmetrically", () => {
  const make = () => {
    const st = spawnAircraft("airfield", 0);
    Object.assign(st, { onGround: false, airborne: true, catPhase: "idle", throttle: 0.9, rpm: 0.9, flapT: 0, gearT: 0 });
    st.pos.set(0, 5000, 0);
    st.quat.identity();
    st.vel.set(0, 0, -240);
    st.speed = 240;
    return st;
  };
  const healthy = make();
  const lopsided = make();
  lopsided.subsystems!.engineR = 0.45;
  for (let i = 0; i < 600; i++) {
    stepAircraft(healthy, idle, 1 / 120);
    stepAircraft(lopsided, idle, 1 / 120);
  }
  // One engine weakened: the stronger side rolls and yaws the jet, so it needs
  // trim to hold a heading instead of flying itself.
  assert(lopsided.omega.length() > healthy.omega.length() + 0.005, `asymmetric thrust works the jet (${lopsided.omega.toArray().map(v => v.toFixed(4))} vs ${healthy.omega.toArray().map(v => v.toFixed(4))})`);
  assert(Math.abs(lopsided.headingDeg - healthy.headingDeg) > 0.1, `and it will not hold a heading on its own (${(lopsided.headingDeg - healthy.headingDeg).toFixed(3)} deg)`);
  assert(lopsided.speed < healthy.speed, "and it loses thrust");

  // Hydraulic loss: the same stick input buys less pitch.
  const sharp = make(), soft = make();
  soft.subsystems!.hydraulics = 0.5;
  for (let i = 0; i < 120; i++) {
    stepAircraft(sharp, { ...idle, brake: false, pitch: 1 }, 1 / 120);
    stepAircraft(soft, { ...idle, brake: false, pitch: 1 }, 1 / 120);
  }
  assert(Math.abs(soft.pitchRef - 0) < Math.abs(sharp.pitchRef - 0), "hydraulic loss softens the controls");
});

test("a punctured fuel tank runs itself dry and takes the engines with it", () => {
  const st = spawnAircraft("airfield", 0);
  Object.assign(st, { onGround: false, airborne: true, catPhase: "idle", throttle: 1, rpm: 1 });
  st.pos.set(0, 6000, 0);
  st.vel.set(0, 0, -250);
  st.speed = 250;
  const sub = st.subsystems!;
  sub.fuelLeak = true;
  sub.fuelPct = 1.0;
  const speed = () => st.speed;
  for (let i = 0; i < 60; i++) stepAircraft(st, idle, 1 / 120);
  assert(sub.fuelPct < 1, "the tank is draining");
  const afterOneSecond = speed();
  for (let i = 0; i < 120 * 4; i++) stepAircraft(st, { ...idle, brake: false, throttleUp: true }, 1 / 120);
  assert(sub.fuelPct === 0, "and it empties");
  assert(speed() < afterOneSecond + 20, "with the engines starved, the jet is not accelerating away");
});

test("Paddles calls the approach and the pass is graded", () => {
  const st = spawnAircraft("carrier", 0);
  const c = carriers()[0];
  const heading = (c.headingDeg * Math.PI) / 180;
  const fwd = [Math.sin(heading), -Math.cos(heading)];
  // On the ball, 1 km astern on the extended centreline, gear down.
  st.onGround = false;
  st.airborne = true;
  st.catPhase = "idle";
  st.gearDown = true;
  st.gearT = 1;
  st.pos.set(c.x - fwd[0] * 1000, c.deckY + 100, c.z - fwd[1] * 1000);
  st.quat.setFromAxisAngle(new Vector3(0, 1, 0), -(c.headingDeg * Math.PI) / 180);
  st.vel.set(0, -5, 0).applyQuaternion(st.quat).add(new Vector3(fwd[0], 0, fwd[1]).multiplyScalar(70));
  st.speed = 70;
  st.throttle = 0.55;
  st.rpm = 0.55;
  for (let i = 0; i < 240; i++) stepAircraft(st, idle, 1 / 120);
  assert((st.lsoSamples?.length ?? 0) > 0, "the pass is being sampled");
  assert(st.lsoCall, "and Paddles has something to say");
  assert(st.lsoCall!.startsWith("PADDLES"), st.lsoCall!);
  // gear up draws the call every pilot dreads
  st.gearDown = false;
  st.gearT = 0;
  stepAircraft(st, idle, 1 / 120);
  assert(st.lsoCall === "PADDLES: CHECK GEAR DOWN!", st.lsoCall!);

  // grades: rails pass, fair pass, ugly pass
  const rails: LsoSample[] = Array.from({ length: 13 }, (_, i) => ({ rangeM: 2000 - i * 150, devM: 2, lineupM: 1, aoaErr: 0.4 }));
  const rough: LsoSample[] = Array.from({ length: 13 }, (_, i) => ({ rangeM: 2000 - i * 150, devM: -30, lineupM: 24, aoaErr: 5 }));
  assert.equal(evaluateLsoGrade(rails, 3).grade, "OK");
  assert.equal(evaluateLsoGrade(rough, 3).grade, "---");
  assert.equal(evaluateLsoGrade([], 2).grade, "(OK)");
  assert(evaluateLsoGrade(rails, 3).summary.includes("OK"), "and the card says why");
});

test("the immersion audio layers are safe to drive before the mixer exists", () => {
  const audio = new AudioEngine();
  audio.update(0.7, 0.2, 200, false, false, WEATHER.storm.turbulence, 6.5);
  audio.flyby(300, -180);
  audio.thunder(4);
  audio.setVolume(0.4);
  audio.update(0, 0, 0, false, true);
});

test("a weather preset can be handed to an airframe in one call", () => {
  const st = spawnAircraft("carrier", 0);
  applyWeatherPresetTo(st, WEATHER.storm, 4242);
  assert(st.windX !== 0 || st.windZ !== 0, "the storm's wind is on the jet");
  assert.equal(st.turbulence, WEATHER.storm.turbulence);
  applyWeatherPresetTo(st, WEATHER.clear, 4242);
  assert(Math.abs(st.windX ?? 0) < 10 && Math.abs(st.windZ ?? 0) < 10, "and a calm day is nearly still");
  assert.equal(st.turbulence, WEATHER.clear.turbulence);
});

if (failures) process.exit(1);
