// Headless sim tests: run the flight model and assert key behaviors.
// Usage: bun scripts/simtest.ts

import { Quaternion, Vector3 } from "three";
import { catTrack, spawnAircraft, stepAircraft } from "../src/sim/flight";
import { atmosphere } from "../src/sim/atmosphere";
import {
  ARCHIPELAGO,
  KAUAI,
  STRIP,
  deckAxes,
  groundAt,
  isOnDeck,
  makeKauaiSampler,
  resetWorld,
  setWorld,
  terrainHeight,
  worldToDeck,
  type CarrierDef,
} from "../src/sim/world";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) {
    console.log(`  ok  ${name}`);
  } else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const DT = 1 / 120;
const KT = 1.94384;

function idle() {
  return {
    pitch: 0, roll: 0, yaw: 0,
    throttleUp: false, throttleDown: false,
    trimUp: false, trimDown: false,
    brake: false, catHold: false,
  };
}

// --- atmosphere sanity ---
{
  const s = atmosphere(0);
  check("sea level density ~1.225", Math.abs(s.rho - 1.225) < 0.01, `${s.rho}`);
  const s10k = atmosphere(10000);
  check("10km density < 0.5", s10k.rho < 0.5, `${s10k.rho}`);
  const a = atmosphere(0).soundSpeed;
  check("sea level sound speed ~340", a > 335 && a < 345, `${a}`);
}

// --- terrain / carriers (procedural archipelago) ---
{
  const af = ARCHIPELAGO.airfield;
  const hAirfield = terrainHeight(af.centerX, af.centerZ);
  check("airfield plateau flat at 140m", Math.abs(hAirfield - 140) < 1, `${hAirfield}`);
  const hCenter = terrainHeight(0, 0);
  check("island interior has land", hCenter > 50, `${hCenter}`);

  for (const c of ARCHIPELAGO.carriers) {
    const h = terrainHeight(c.x, c.z);
    check(`${c.name}: anchorage is ocean`, h < -30, `${h.toFixed(0)}m`);
    let worst = -Infinity;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      worst = Math.max(worst, terrainHeight(c.x + Math.cos(a) * 1200, c.z + Math.sin(a) * 1200));
    }
    check(`${c.name}: 1.2km land-free clearance`, worst < -10, `ring max ${worst.toFixed(0)}m`);
    check(`${c.name}: deck point is deck`, isOnDeck(c, c.x, c.z), "");
    const g = groundAt(c.x, c.z);
    check(`${c.name}: ground = deck at 19m`, g.kind === "deck" && g.y === 19, `${g.kind} ${g.y}`);
    const cat = catTrack(c);
    check(`${c.name}: catapult starts on deck`, isOnDeck(c, cat.start.x, cat.start.z), "");
  }

  let minSep = Infinity;
  for (let i = 0; i < ARCHIPELAGO.carriers.length; i++) {
    for (let j = i + 1; j < ARCHIPELAGO.carriers.length; j++) {
      const a = ARCHIPELAGO.carriers[i];
      const b = ARCHIPELAGO.carriers[j];
      minSep = Math.min(minSep, Math.hypot(a.x - b.x, a.z - b.z));
    }
  }
  check("carriers are well separated", minSep > 5000, `${(minSep / 1000).toFixed(1)}km apart`);
}

// --- idle parked aircraft doesn't roll away ---
{
  const st = spawnAircraft("airfield");
  for (let i = 0; i < 600; i++) stepAircraft(st, idle(), DT);
  check("parked jet stays put (5s)", st.speed < 2.0, `v=${st.speed.toFixed(2)}`);
  check("parked jet on ground", st.onGround && st.groundKind === "runway", `${st.groundKind}`);
  check("parked jet not crashed", st.result === null);
  // Regression: ground reaction torque must be applied in the body frame —
  // a world-frame torque used to roll the parked jet over through the deck.
  const fwd = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  const right = new Vector3(1, 0, 0).applyQuaternion(st.quat);
  const pitch = Math.asin(fwd.y) * 57.2958;
  const bank = Math.asin(right.y) * 57.2958;
  check(
    "parked jet sits level",
    Math.abs(pitch) < 0.5 && Math.abs(bank) < 0.5,
    `pitch=${pitch.toFixed(2)} roll=${bank.toFixed(2)}`,
  );
  check("tyres compressed but not sunk", st.wheelPen > 0.05 && st.wheelPen < 0.3, `${st.wheelPen.toFixed(3)}`);
}

// --- takeoff roll ---
{
  const st = spawnAircraft("airfield");
  const inp = { ...idle(), throttleUp: true };
  let t = 0;
  let rotated = false;
  while (t < 60 && !rotated) {
    stepAircraft(st, st.speed > 72 ? { ...inp, pitch: 0.9 } : inp, DT);
    t += DT;
    if (st.speed > 72 && (!st.onGround || st.vspeed > 1.0)) rotated = true;
  }
  check("rotates within 60s", rotated, `v=${(st.speed * KT).toFixed(0)}kt t=${t.toFixed(1)}s`);
  if (rotated) {
    // hold a moderate climb pitch, like a pilot would off the deck
    for (let i = 0; i < 1500; i++) {
      stepAircraft(st, { ...idle(), pitch: 0.45 }, DT);
    }
    check("climbs after rotation", st.vspeed > 4 && st.pos.y > 250, `vs=${st.vspeed.toFixed(1)} alt=${st.pos.y.toFixed(0)}m`);
    check("airborne", st.airborne || !st.onGround);
  }
}

// --- catapult launch from every carrier ---
{
  for (let idx = 0; idx < ARCHIPELAGO.carriers.length; idx++) {
    const c = ARCHIPELAGO.carriers[idx];
    const st = spawnAircraft("carrier", idx);
    const inp = { ...idle(), catHold: true };
    // hold cat ~1s: throttle maxes and catapult charges
    for (let i = 0; i < 240; i++) stepAircraft(st, { ...inp, throttleUp: true }, DT);
    check(`${c.name}: cat fires after charge`, st.catPhase === "firing" || st.catPhase === "idle", st.catPhase);
    let t = 0;
    while (st.catPhase === "firing" && t < 5) {
      stepAircraft(st, { ...idle(), pitch: 0.5 }, DT);
      t += DT;
    }
    check(
      `${c.name}: cat shot completes`,
      st.catPhase === "idle" && st.airborne,
      `${st.catPhase} v=${(st.speed * KT).toFixed(0)}kt`,
    );
    check(`${c.name}: cat exit speed ~140kt`, Math.abs(st.speed * KT - 140) < 15, `${(st.speed * KT).toFixed(0)}kt`);
    if (idx === 0) {
      for (let i = 0; i < 1800; i++) stepAircraft(st, { ...idle(), pitch: 0.45 }, DT);
      check("climbs after cat shot", st.vspeed > 2 && st.pos.y > 60, `vs=${st.vspeed.toFixed(1)} alt=${st.pos.y.toFixed(0)}m`);
    }
  }
}

// --- trim to level flight (bisection on trim, verify vs near zero) ---
{
  const cruise = (trim: number) => {
    const s = spawnAircraft("carrier", 0);
    s.pos.set(0, 1500, 0);
    s.vel.set(0, 0, -220);
    s.gearDown = false; s.gearT = 0;
    s.flapsDown = false; s.flapT = 0;
    s.throttle = 0.78; s.rpm = 0.78;
    s.trim = trim;
    s.banner = null;
    return s;
  };
  let lo = 0.2, hi = 0.8;
  for (let k = 0; k < 9; k++) {
    const mid = (lo + hi) / 2;
    const s = cruise(mid);
    for (let i = 0; i < 3000; i++) stepAircraft(s, idle(), DT);
    if (s.vspeed > 0) hi = mid;
    else lo = mid;
  }
  const trim = (lo + hi) / 2;
  const st = cruise(trim);
  for (let i = 0; i < 3600; i++) stepAircraft(st, idle(), DT); // 30 s
  check(
    "trim holds level flight",
    Math.abs(st.vspeed) < 2.5,
    `trim=${trim.toFixed(3)} vs=${st.vspeed.toFixed(2)}`,
  );
}

// --- stall behavior ---
{
  const st = spawnAircraft("airfield");
  st.pos.set(0, 2500, 0);
  st.vel.set(0, 0, -60); // slow, 117 kt
  st.gearDown = false; st.gearT = 0;
  st.flapsDown = false; st.flapT = 0;
  st.throttle = 0.4; st.rpm = 0.4;
  st.banner = null;
  // Hold full aft stick. The jet departs (alpha well past the 15 deg stall)
  // and then tumbles and recovers, so track the peak angle of attack over the
  // run rather than sampling whatever attitude it happens to end on.
  let maxAlpha = st.alpha;
  let everStalled = false;
  for (let i = 0; i < 1800; i++) {
    stepAircraft(st, { ...idle(), pitch: 1 }, DT);
    maxAlpha = Math.max(maxAlpha, st.alpha);
    if (st.stalled) everStalled = true;
  }
  check("stalls at high AoA", everStalled && maxAlpha > 0.26, `maxAoa=${(maxAlpha * 57.3).toFixed(1)}`);
  check("still flying (no crash from stall alone)", st.result === null, st.result?.title ?? "");
}

// --- landing on the wires: deterministic short-final, every carrier ---
{
  // Deterministic final-100 m passes: spawn just above deck-contact height
  // (21.03 m) at 150 kt with a real 3 m/s descent, centered on each carrier's
  // angled strip. Exercises touchdown + wire-arrest per boat.
  const setups = [21.7, 22.7, 23.7];
  for (const c of ARCHIPELAGO.carriers) {
    const { fwd, right } = deckAxes(c.headingDeg);
    const th = (c.landingAngleDeg * Math.PI) / 180;
    const cosT = Math.cos(th), sinT = Math.sin(th);
    let caught = false;
    const details: string[] = [];
    for (const alt0 of setups) {
      const st = spawnAircraft("carrier", 0);
      const s0 = 30, d0 = 0; // start just past the ramp
      const relA = s0 * cosT + d0 * sinT;
      const relC = -s0 * sinT + d0 * cosT;
      st.pos.set(c.x + fwd[0] * relA + right[0] * relC, alt0, c.z + fwd[1] * relA + right[1] * relC);
      const dirX = fwd[0] * cosT - right[0] * sinT;
      const dirZ = fwd[1] * cosT - right[1] * sinT;
      const norm = Math.hypot(dirX, dirZ);
      const V = 77;
      st.vel.set((dirX / norm) * V, -3, (dirZ / norm) * V);
      const hdg = Math.atan2(st.vel.x, -st.vel.z);
      st.quat.setFromAxisAngle(new Vector3(0, 1, 0), -hdg);
      st.quat.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.07));
      st.gearDown = true; st.gearT = 1;
      st.flapsDown = true; st.flapT = 1;
      st.trim = 0.5;
      st.throttle = 0.8; st.rpm = 0.8;
      st.airborne = true;
      st.onGround = false;
      st.banner = null;
      st.catPhase = "idle";

      let got = false;
      let t = 0;
      while (t < 5 && !got && st.result === null) {
        stepAircraft(st, { ...idle(), pitch: 0.05 }, DT);
        t += DT;
        if (st.arresting) got = true;
      }
      const [sTd] = stripSD(c, st.pos.x, st.pos.z);
      details.push(`alt0=${alt0}: ${st.result?.title ?? "landed"} s=${sTd.toFixed(0)}`);
      if (got || st.result?.kind === "wire") caught = true;
    }
    check(`${c.name}: catches a wire on a proper approach`, caught, details.join(" | "));
  }
}

// --- brakes stop the aircraft ---
{
  const st = spawnAircraft("airfield");
  st.vel.set(60, 0, 0); // ~117 kt down the runway
  st.quat.setFromAxisAngle(new Quaternion(0, 1, 0), -Math.PI / 2);
  for (let i = 0; i < 1800; i++) stepAircraft(st, { ...idle(), brake: true }, DT);
  check("brakes stop the jet", st.speed < 2, `v=${st.speed.toFixed(1)}`);
}

// --- real-terrain world plumbing (offline synthetic heightfield) ---
{
  const fake = { sample: () => 220 };
  setWorld(KAUAI, makeKauaiSampler(fake));
  const af = KAUAI.airfield;
  const hField = terrainHeight(af.centerX, af.centerZ);
  check("kauai: airfield flattened to its elevation", Math.abs(hField - af.elevation) < 1, `${hField.toFixed(1)}`);
  for (const c of KAUAI.carriers) {
    const h = terrainHeight(c.x, c.z);
    check(`kauai: ${c.name} anchorage is deep water`, h <= -39, `${h.toFixed(0)}m`);
    check(`kauai: ${c.name} deck resolves`, groundAt(c.x, c.z).kind === "deck", groundAt(c.x, c.z).kind);
  }
  const hOut = terrainHeight(20000, -20000);
  check("kauai: beyond the mesh is open ocean", hOut <= -39, `${hOut}`);
  const st = spawnAircraft("carrier", 1);
  check("kauai: spawns settled on carrier 2", st.onGround && st.groundKind === "deck", `${st.groundKind}`);
  resetWorld();
  const hBack = terrainHeight(0, 0);
  check("procedural world restored after reset", hBack > 50, `${hBack.toFixed(0)}`);
}

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

/** Strip coordinates (s along, d lateral) for a world point on a carrier. */
function stripSD(c: CarrierDef, x: number, z: number): [number, number] {
  const [along, across] = worldToDeck(c, x, z);
  const th = (c.landingAngleDeg * Math.PI) / 180;
  const relA = along - STRIP.startAlong;
  const relC = across - STRIP.startAcross;
  const s = relA * Math.cos(th) - relC * Math.sin(th);
  const d = relA * Math.sin(th) + relC * Math.cos(th);
  return [s, d];
}
