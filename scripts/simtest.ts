// Headless sim tests: run the flight model and assert key behaviors.
// Usage: bun scripts/simtest.ts

import { Quaternion, Vector3 } from "three";
import {
  CAT_ACCEL,
  CAT_V_END,
  catTrack,
  isRecoverySurface,
  spawnAircraft,
  stepAircraft,
} from "../src/sim/flight";
import { atmosphere } from "../src/sim/atmosphere";
import {
  ARCHIPELAGO,
  DEFAULT_SEED,
  EXTENT,
  STRIP,
  activeWorldSeed,
  deckAxes,
  groundAt,
  isOnDeck,
  resetWorld,
  sanitizeSeed,
  setWorldSeed,
  terrainHeight,
  worldSeedForRoom,
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
    // The whole launch stroke has to stay over the deck, or the shuttle would
    // run off the side of the ship (CAT_V_END^2 / 2a metres of track).
    const stroke = (CAT_V_END * CAT_V_END) / (2 * CAT_ACCEL);
    const exit = cat.start.clone().addScaledVector(cat.dir, stroke);
    check(`${c.name}: cat stroke ends on deck`,
      isOnDeck(c, exit.x, exit.z),
      `${stroke.toFixed(0)} m stroke`);

    // --- the landing corridor has to be over the deck for its whole length ---
    // This is what "big enough to land" means: a corridor that runs off the port
    // edge is a touchdown the sim cannot see, because groundAt() only reports a
    // deck where isOnDeck() says so.
    const th = (c.landingAngleDeg * Math.PI) / 180;
    const corners: Array<[number, number]> = [];
    for (const s of [STRIP.catchSMin, STRIP.catchSMax]) {
      for (const d of [-STRIP.halfWidth, STRIP.halfWidth]) {
        const along = STRIP.startAlong + s * Math.cos(th) + d * Math.sin(th);
        const across = STRIP.startAcross - s * Math.sin(th) + d * Math.cos(th);
        const { fwd, right } = deckAxes(c.headingDeg);
        corners.push([
          c.x + fwd[0] * along + right[0] * across,
          c.z + fwd[1] * along + right[1] * across,
        ]);
      }
    }
    check(`${c.name}: the whole landing corridor is on the deck`,
      corners.every(([x, z]) => isOnDeck(c, x, z)),
      `deck ${c.deckLength}x${c.deckWidth} m`);
    check(`${c.name}: the deck is big enough to land on`,
      c.deckLength >= 400 && c.deckWidth >= 100,
      `${c.deckLength}x${c.deckWidth} m`);
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
    // Raise power and wait for the engine before tensioning the catapult
    for (let i = 0; i < 540; i++) stepAircraft(st, { ...inp, throttleUp: true }, DT);
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

// --- a landing on a friendly surface is a recovery, not a result ---
{
  // The sim refuels and re-arms on the airborne -> deck/runway transition, so
  // a real runway touchdown has to land in that state rather than a crash or a
  // frozen result. Fly a short final onto the airfield plateau.
  const af = ARCHIPELAGO.airfield;
  const st = spawnAircraft("airfield");
  st.pos.set(af.centerX - af.runwayLength / 2 + 400, af.elevation + 3, af.centerZ);
  st.vel.set(70, -2, 0);
  st.airborne = true;
  st.onGround = false;
  st.banner = null;
  let recovered = false;
  for (let i = 0; i < Math.round(6 / DT); i++) {
    const wasAirborne = st.airborne;
    stepAircraft(st, idle(), DT);
    if (wasAirborne && isRecoverySurface(st)) recovered = true;
  }
  check("a runway touchdown reads as a recovery", recovered,
    `onGround=${st.onGround} kind=${st.groundKind} result=${st.result?.title ?? "none"}`);
  check("and it is not a frozen result", st.result === null, st.result?.title ?? "");
}

// --- brakes stop the aircraft ---
{
  const st = spawnAircraft("airfield");
  st.vel.set(60, 0, 0); // ~117 kt down the runway
  st.quat.setFromAxisAngle(new Quaternion(0, 1, 0), -Math.PI / 2);
  for (let i = 0; i < 1800; i++) stepAircraft(st, { ...idle(), brake: true }, DT);
  check("brakes stop the jet", st.speed < 2, `v=${st.speed.toFixed(1)}`);
}

// --- seeded world generation: the seed is the whole world ---
{
  check("a seed is sanitised to a stable integer",
    sanitizeSeed(-1) === 2147483646 && sanitizeSeed(12.7) === 12, `${sanitizeSeed(-1)} ${sanitizeSeed(12.7)}`);
  check("a fresh install flies the default seed", activeWorldSeed() === DEFAULT_SEED, `${activeWorldSeed()}`);

  // What the room actually synchronises is this: one number in, the identical
  // terrain out. Sample a spread of points, regenerate, and compare exactly.
  const probes = [0, 3000, 9000, 21000, -15000, -27000];
  const sampleAll = (): number[] => {
    const out: number[] = [];
    for (const x of probes) for (const z of probes) out.push(terrainHeight(x, z));
    for (const c of ARCHIPELAGO.carriers) out.push(terrainHeight(c.x, c.z));
    return out;
  };

  setWorldSeed(4242);
  const first = sampleAll();
  setWorldSeed(DEFAULT_SEED);
  setWorldSeed(4242);
  const second = sampleAll();
  check("a seed rebuilds byte-identical terrain",
    first.every((h, i) => Math.abs(h - second[i]) < 1e-9),
    "the same seed generated different heights");

  setWorldSeed(90210);
  const other = sampleAll();
  check("a different seed builds a different chain",
    other.some((h, i) => Math.abs(h - first[i]) > 1),
    "two different seeds produced the same terrain");

  // Any seed the player can type has to land on something flyable: a chain with
  // real land on it, and relief that is neither flat nor absurd.
  let worstLand = 1;
  let loPeak = Infinity;
  let hiPeak = -Infinity;
  for (const seed of [0, 1, 99, 1337, 4242, 8080, 31337, 65535, 90210, 123456789, 2000000000, 2147483646]) {
    setWorldSeed(seed);
    let land = 0;
    let peak = -Infinity;
    const n = 24;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const h = terrainHeight(-EXTENT + ((i + 0.5) * 2 * EXTENT) / n, -EXTENT + ((j + 0.5) * 2 * EXTENT) / n);
        if (h > 0) land++;
        if (h > peak) peak = h;
      }
    }
    worstLand = Math.min(worstLand, land / (n * n));
    loPeak = Math.min(loPeak, peak);
    hiPeak = Math.max(hiPeak, peak);
  }
  check("every seed puts islands in the world",
    worstLand > 0.03, `thinnest chain covers ${(worstLand * 100).toFixed(1)}% of a coarse grid`);
  check("every seed has real relief, and none is absurd",
    loPeak > 200 && hiPeak < 4000, `peaks ${loPeak.toFixed(0)}m .. ${hiPeak.toFixed(0)}m`);
}

// --- every seed is flyable: runway flat, anchorages deep, approaches clear ---
{
  // Two of these come from real room codes, because that is how a player picks
  // a world now: whatever the code hashes to must still be a flyable chain.
  const seeds = [DEFAULT_SEED, 4242, 90210, 7, 2147483646, worldSeedForRoom("F14ALPHA"), worldSeedForRoom("TOMCAT")];
  for (const seed of seeds) {
    setWorldSeed(seed);
    const af = ARCHIPELAGO.airfield;
    const hField = terrainHeight(af.centerX, af.centerZ);
    check(`seed ${seed}: airfield flattened to its elevation`,
      Math.abs(hField - af.elevation) < 1, `${hField.toFixed(1)}`);

    let anchorages = true;
    let detail = "";
    for (const c of ARCHIPELAGO.carriers) {
      const h = terrainHeight(c.x, c.z);
      if (h > -39) { anchorages = false; detail += `${c.name} ${h.toFixed(0)}m `; }
      if (groundAt(c.x, c.z).kind !== "deck") { anchorages = false; detail += `${c.name} not deck `; }
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        if (terrainHeight(c.x + Math.cos(a) * 1200, c.z + Math.sin(a) * 1200) > -10) {
          anchorages = false;
          detail += `${c.name} land at 1.2km `;
          break;
        }
      }
    }
    check(`seed ${seed}: every anchorage is deep water with 1.2 km clearance`, anchorages, detail);

    // The island chain lives inside the mesh, so past its corner there is
    // nothing but water whatever the seed threw in.
    const far = terrainHeight(EXTENT + 600, EXTENT + 600);
    const far2 = terrainHeight(-(EXTENT + 600), -(EXTENT + 600));
    check(`seed ${seed}: beyond the mesh is open water`, far < 0 && far2 < 0, `${far.toFixed(0)} ${far2.toFixed(0)}`);
  }

  setWorldSeed(90210);
  const st = spawnAircraft("carrier", 1);
  check("a seeded world still spawns settled on carrier 2", st.onGround && st.groundKind === "deck", `${st.groundKind}`);

  resetWorld();
  check("resetWorld returns to the default seed", activeWorldSeed() === DEFAULT_SEED, `${activeWorldSeed()}`);
  const hBack = terrainHeight(0, 0);
  check("and to the default seed's terrain", hBack > 50, `${hBack.toFixed(0)}`);
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
