// Carrier recovery end-to-end: a scripted pilot flies the 4 deg glideslope onto
// the deck at the on-speed and we check the wire actually catches. The whole
// approach is flown through the same FlightInput the player's keys produce, so
// this exercises the real handling, the trap window and the arrest.
// Usage: bun scripts/diag-landing.ts
import { Vector3, Quaternion, Euler, Mesh, Color, BoxGeometry, MeshStandardMaterial } from "three";
import {
  HARD_SINK,
  IMPACT_SPEED,
  spawnAircraft,
  stepAircraft,
  glideStateFor,
  approachSpeed,
  GLIDE_AIM_S,
  GLIDE_DEG,
  type AircraftState,
  type FlightInput,
} from "../src/sim/flight";
import { airfield, carriers, carrierAt, deckAxes, STRIP, worldToDeck, type CarrierDef } from "../src/sim/world";
import { buildCarrier, WIRE_LIFT, WIRE_SHOE, WIRE_THICKNESS } from "../src/render/scene";

/** s (down the angled strip) and d (off its centreline) for a world point. */
function stripCoords(c: CarrierDef, x: number, z: number): { s: number; d: number } {
  const [along, across] = worldToDeck(c, x, z);
  const th = c.landingAngleDeg * RTD;
  const relA = along - STRIP.startAlong;
  const relC = across - STRIP.startAcross;
  return {
    s: relA * Math.cos(th) - relC * Math.sin(th),
    d: relA * Math.sin(th) + relC * Math.cos(th),
  };
}

const DT = 1 / 120;
const RAD = 180 / Math.PI;
const RTD = Math.PI / 180;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

function idle(): FlightInput {
  return {
    pitch: 0, roll: 0, yaw: 0,
    throttleUp: false, throttleDown: false,
    trimUp: false, trimDown: false,
    brake: false, catHold: false,
  };
}

/** The strip frame in world coordinates: the point at (s, d) on the boat. */
function stripPoint(c: CarrierDef, s: number, d: number): Vector3 {
  const th = c.landingAngleDeg * RTD;
  const relA = s * Math.cos(th) + d * Math.sin(th);
  const relC = -s * Math.sin(th) + d * Math.cos(th);
  const { fwd, right } = deckAxes(c.headingDeg);
  const along = STRIP.startAlong + relA;
  const across = STRIP.startAcross + relC;
  return new Vector3(
    c.x + fwd[0] * along + right[0] * across,
    c.deckY,
    c.z + fwd[1] * along + right[1] * across,
  );
}

function pitchDeg(st: AircraftState): number {
  return Math.asin(clamp(new Vector3(0, 0, -1).applyQuaternion(st.quat).y, -1, 1)) * RAD;
}
function bankDeg(st: AircraftState): number {
  return Math.asin(clamp(-new Vector3(1, 0, 0).applyQuaternion(st.quat).y, -1, 1)) * RAD;
}

/** Roll out 3 km astern on the centreline, on the 4 deg path, on-speed. */
function onApproach(): { st: AircraftState; c: CarrierDef } {
  const c: CarrierDef = carriers()[0];
  const aim = stripPoint(c, GLIDE_AIM_S, 0);
  const start = stripPoint(c, GLIDE_AIM_S - 3000, 0);
  const dir = aim.clone().sub(start).setY(0).normalize(); // inbound along the strip
  const speed = approachSpeed(spawnAircraft("carrier", 0).spec, start.y).onSpeedKt / 1.94384;

  const st = spawnAircraft("carrier", 0);
  st.pos.copy(start);
  st.pos.y = c.deckY + 3000 * Math.tan(GLIDE_DEG * RTD);
  const heading = (Math.atan2(dir.x, -dir.z) * RAD + 360) % 360;
  const att = (-GLIDE_DEG + 12) * RTD; // approach attitude: on the slope, on-speed
  st.quat.copy(new Quaternion().setFromEuler(new Euler(att, -heading * RTD, 0, "YXZ")));
  st.vel.copy(dir).multiplyScalar(speed).setY(-speed * Math.sin(GLIDE_DEG * RTD));
  st.omega.set(0, 0, 0);
  st.gearDown = true; st.gearT = 1;
  st.flapsDown = true; st.flapT = 1;
  st.throttle = 0.55; st.rpm = 0.55;
  st.trim = 0.5;
  st.banner = null;
  st.catPhase = "idle";
  st.airborne = true; st.onGround = false;
  st.pitchRef = att;
  return { st, c };
}

/**
 * The pilot: a glideslope controller on the pitch axis (the vertical speed the
 * 4 deg path asks for, corrected by the deviation), a lineup controller on the
 * roll axis, and the throttle doing the speed. Flies the ball exactly as the
 * HUD presents it.
 */
function flyApproach(seconds: number, speedTrimKt = 0, label = ""): {
  st: AircraftState;
  minRangeKm: number;
  lastDev: number;
  onSpeedKt: number;
} {
  const { st, c } = onApproach();
  const base = approachSpeed(st.spec, st.pos.y);
  const onSpeed = (base.onSpeedKt + speedTrimKt) / 1.94384;
  let minRangeKm = Infinity;
  let lastDev = 0;
  let sawBall = false;
  for (let i = 0; i < Math.round(seconds / DT) && !st.result; i++) {
    const inp = idle();
    const V = Math.max(st.speed, 20);
    // --- vertical: where the 4 deg path is, and what sink holds it
    const guide = glideStateFor(st);
    let devM = 0;
    let rangeM = Infinity;
    if (guide) {
      devM = guide.deviationM;
      rangeM = guide.rangeM;
      minRangeKm = Math.min(minRangeKm, rangeM / 1000);
      sawBall = true;
    }
    lastDev = devM;
    const vsTarget = -(V * Math.tan(GLIDE_DEG * RTD) + clamp(devM, -80, 80) * 0.06);
    const fpaTarget = Math.asin(clamp(vsTarget / V, -0.4, 0.4));
    // The alpha that holds 1g at this speed, so the attitude tracks the slope.
    const clNeeded = (st.spec.mass * 9.81) / (0.5 * 1.225 * V * V * st.spec.sWing);
    const aoaNeeded = clamp(
      (clNeeded - 0.1 - st.spec.flapLift * st.flapT) / st.spec.clAlpha,
      -0.1,
      st.spec.alphaStall,
    );
    const attTarget = fpaTarget + aoaNeeded;
    inp.pitch = clamp(6 * (attTarget - pitchDeg(st) * RTD) - 1.2 * st.omega.x, -1, 1);
    // --- lateral: hold the angled centreline
    const { d } = stripCoords(c, st.pos.x, st.pos.z);
    const headingErr = 0;
    const bankTarget = clamp((-d * 0.02 - headingErr) * RAD, -20, 20);
    inp.roll = clamp((bankTarget - bankDeg(st)) * 0.09 - 0.45 * st.omega.z, -1, 1);
    // --- speed: the throttle flies the on-speed
    inp.throttleUp = V < onSpeed;
    inp.throttleDown = V > onSpeed + 3;
    stepAircraft(st, inp, DT);
  }
  if (st.result?.kind === "wire") {
    console.log(`      ${label} trapped wire ${st.result.wire} after seeing the ball from ${minRangeKm.toFixed(2)} km`);
  }
  void sawBall;
  return { st, minRangeKm, lastDev, onSpeedKt: base.onSpeedKt };
}

// --- 1. on-speed, on the ball: the wire must catch --------------------------
{
  const r = flyApproach(90, 0, "on-speed:");
  console.log(
    `      on-speed ${r.onSpeedKt.toFixed(0)} kt, closest ${r.minRangeKm.toFixed(2)} km, ` +
      `result ${r.st.result?.kind ?? "none"} ${r.st.result?.title ?? ""}`,
  );
  check("a scripted on-speed approach reaches the boat", r.minRangeKm < 0.2, `${r.minRangeKm.toFixed(2)} km`);
  check(
    "the wires catch it",
    r.st.result?.kind === "wire",
    `${r.st.result?.kind ?? "none"} — ${r.st.result?.title ?? ""}`,
  );
}

// --- 2. fast and high: the bolter path must still end on the deck ----------
{
  const r = flyApproach(90, 25, "fast:");
  console.log(`      result ${r.st.result?.kind ?? "none"} (was aiming to catch a wire too)`);
  check(
    "a 25 kt fast approach still ends in a trap, not a crash",
    r.st.result?.kind === "wire",
    `${r.st.result?.kind ?? "none"} — ${r.st.result?.title ?? ""}`,
  );
}

// --- 3. a little slow: still recoverable (below the stall speed it is not, and
// that is honest: the Tomcat's gear-down stall is about 123 kt, so a 20 kt slow
// approach is asking the wing for lift it does not have) ---------------------
{
  const r = flyApproach(90, -10, "slow:");
  console.log(`      result ${r.st.result?.kind ?? "none"} ${r.st.result?.title ?? ""}`);
  check(
    "a 10 kt slow approach still ends on the deck (a trap or a bolter)",
    r.st.result?.kind === "wire" || r.st.result?.kind === "bolter",
    `${r.st.result?.kind ?? "none"} — ${r.st.result?.title ?? ""}`,
  );
}
// Short deck arrival: give the hook time to roll into the catch area.
{
  const { st, c } = onApproach();
  st.pos.copy(stripPoint(c, 8, 0)); st.pos.y += 2.4;
  st.vel.setLength(70); st.vel.y = -4; st.speed = 70; st.throttle = .2; st.rpm = .2;
  st.catCooldown = 0;
  let sawRoll = false;
  for (let i=0; i<120*15 && !st.result; i++) { stepAircraft(st,idle(),DT); sawRoll ||= st.deckRoll !== undefined; }
  check("an early deck touchdown rolls forward instead of ending the sortie", sawRoll);
  check("an early deck touchdown catches a wire", st.result?.kind === "wire", st.result?.title);
}
// --- 0. the arresting wires themselves: on the deck, and UP ----------------
// The sim has always known where the wires are; this checks the ship the
// player actually looks at. The pendants used to be painted the same colour
// as the landing strip beneath them (0x2b2b2b over #2a2f34), so from the
// approach you saw four white lines and no cable at all.
{
  const c = carriers()[0];
  const g = buildCarrier(c);
  const deckTop = c.deckY;
  const cables: Mesh[] = [];
  const shoes: Mesh[] = [];
  g.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    if (/^wire-\d+$/.test(m.name)) cables.push(m);
    else if (/^wire-shoe-\d+-[ps]$/.test(m.name)) shoes.push(m);
  });

  check(
    "the deck carries one arresting wire per declared wire",
    cables.length === c.wireCount,
    `${cables.length} meshes for ${c.wireCount} wires`,
  );
  check(
    "each wire is propped off the deck by a shoe at each end",
    shoes.length === c.wireCount * 2,
    `${shoes.length} shoes for ${c.wireCount} wires`,
  );

  // Positions: each wire must sit where the sim looks for it, and clear of
  // the deck it is supposed to be lifted above.
  let aligned = 0;
  let raised = 0;
  let contrast = 0;
  const strip = new Color("#2a2f34");
  for (let i = 0; i < c.wireCount; i++) {
    const want = STRIP.wireFirstS + i * c.wireSpacing;
    const m = cables[i];
    if (!m) continue;
    const wp = m.getWorldPosition(new Vector3());
    const { s, d } = stripCoords(c, wp.x, wp.z);
    if (Math.abs(s - want) < 0.05 && Math.abs(d) < 0.6) aligned++;
    if (wp.y - deckTop >= WIRE_LIFT * 0.75) raised++;
    const col = (m.material as MeshStandardMaterial).color;
    const delta = Math.max(
      Math.abs(col.r - strip.r),
      Math.abs(col.g - strip.g),
      Math.abs(col.b - strip.b),
    );
    if (delta > 0.15) contrast++;
  }
  check(
    "every wire sits at the strip station the trap logic uses",
    aligned === c.wireCount,
    `${aligned}/${c.wireCount} aligned`,
  );
  check(
    "every wire is lifted clear of the deck, not painted on it",
    raised === c.wireCount,
    `${raised}/${c.wireCount} raised`,
  );
  const thickest = Math.max(0, ...cables.map((m) => (m.geometry as BoxGeometry).parameters.width ?? 0));
  check(
    "the pendants are thick enough to be seen from the approach",
    thickest === WIRE_THICKNESS && thickest >= 0.5,
    `${thickest.toFixed(2)} m across (exported ${WIRE_THICKNESS})`,
  );
  check(
    "the wire material contrasts with the landing strip it lies over",
    contrast === c.wireCount,
    `${contrast}/${c.wireCount} visible against #2a2f34`,
  );

  // Shoes rest on the deck: bottom flush with it, top at the wire's height.
  let seated = 0;
  for (const shoe of shoes) {
    const p = (shoe.geometry as BoxGeometry).parameters;
    const wp = shoe.getWorldPosition(new Vector3());
    const bottom = wp.y - p.height / 2;
    if (Math.abs(bottom - deckTop) < 0.01 && Math.abs(p.height - WIRE_LIFT) < 1e-6) seated++;
    void WIRE_SHOE;
  }
  check(
    "the shoes stand on the deck rather than floating or sinking",
    seated === shoes.length,
    `${seated}/${shoes.length} seated`,
  );
}

// --- 0b. a trap reports a wire the ship actually has, and stops on the deck --
{
  const c = carriers()[0];
  const r = flyApproach(90, 0, "wire-number:");
  const w = r.st.result?.kind === "wire" ? r.st.result.wire : undefined;
  check(
    "the trap names a wire that exists on this boat",
    w !== undefined && Number.isInteger(w) && w >= 1 && w <= c.wireCount,
    `wire ${w ?? "none"} of ${c.wireCount}`,
  );
  check(
    "the arrested jet stops on the deck instead of rolling off it",
    r.st.result?.kind === "wire" && r.st.pos.y >= c.deckY - 1,
    `y=${r.st.pos.y.toFixed(1)} deck=${c.deckY} kind=${r.st.result?.kind ?? "none"}`,
  );
}

// --- 0c. how much arriving the gear is expected to take --------------------
// Dropping onto the deck used to end the sortie more often than not: the
// "gear gave way" test compared a 0.75 m wheel-compression limit against
// ~0.9 m measured on every healthy landing, so the moment the belly grazed on
// a slightly nose-down touchdown it killed the jet at a fifth of the sink the
// strut was rated for. Tolerance is a number, so it is checked as one: gentle
// and moderately hard arrivals land, genuinely impossible ones do not.
{
  /** Drop the jet onto the boat at an exact sink and speed, at strip station `s`. */
  function deckArrival(o: { sink: number; speed: number; pitch?: number; d?: number; s?: number; gearT?: number }) {
    const st = spawnAircraft("carrier", 0);
    const c = carriers()[0];
    const s0 = o.s ?? 120;
    const d = o.d ?? 0;
    const th = c.landingAngleDeg * RTD;
    const at = (ss: number) => {
      const relA = ss * Math.cos(th) + d * Math.sin(th);
      const relC = -ss * Math.sin(th) + d * Math.cos(th);
      const { fwd, right } = deckAxes(c.headingDeg);
      return new Vector3(
        c.x + fwd[0] * (STRIP.startAlong + relA) + right[0] * (STRIP.startAcross + relC),
        c.deckY,
        c.z + fwd[1] * (STRIP.startAlong + relA) + right[1] * (STRIP.startAcross + relC),
      );
    };
    const target = at(s0);
    const dir = at(s0 - 60).clone().sub(target).setY(0).normalize().negate();
    const heading = (Math.atan2(dir.x, -dir.z) / RTD + 360) % 360;
    st.pos.copy(target);
    st.pos.y = c.deckY + 1.2;
    st.quat.copy(new Quaternion().setFromEuler(new Euler((o.pitch ?? 10) * RTD, -heading * RTD, 0, "YXZ")));
    st.vel.copy(dir).multiplyScalar(o.speed).setY(o.sink);
    st.speed = o.speed;
    st.omega.set(0, 0, 0);
    const gearT = o.gearT ?? 1;
    st.gearDown = gearT > 0.5;
    st.gearT = gearT;
    st.flapsDown = true;
    st.flapT = 1;
    st.throttle = 0.25;
    st.rpm = 0.25;
    st.trim = 0.5;
    st.airborne = true;
    st.onGround = false;
    st.catPhase = "idle";
    st.catCooldown = 0;
    for (let i = 0; i < 120 * 90 && !st.result; i++) {
      const inp = idle();
      inp.brake = st.onGround; // a pilot standing on the brakes
      stepAircraft(st, inp, DT);
    }
    return st;
  }

  // Inside the tolerance: lands. -12 m/s is ~2360 fpm, which the old -11 limit
  // rejected, and a nose-down attitude that used to trip the belly test.
  for (const [label, opts] of [
    ["a 12 m/s arrival on the deck lands", { sink: -12, speed: 55 }],
    ["a nose-down deck touchdown lands", { sink: -5, speed: 55, pitch: -5 }],
    ["a slow arrival lands", { sink: -6, speed: 30 }],
  ] as Array<[string, { sink: number; speed: number; pitch?: number }]>) {
    const st = deckArrival(opts);
    check(label, st.result?.kind !== "crash", `${st.result?.kind} / ${st.result?.title ?? ""}`);
  }

  // Past the tolerance: still fatal. This is the half that must not move.
  {
    const st = deckArrival({ sink: HARD_SINK - 4, speed: 55 });
    check(
      "an arrival well past the gear's rating still breaks the aircraft",
      st.result?.kind === "crash" && st.result.title === "HARD IMPACT",
      `${st.result?.kind} / ${st.result?.title ?? ""}`,
    );
  }
  {
    const st = deckArrival({ sink: -5, speed: IMPACT_SPEED + 15 });
    check(
      "arriving too fast for the tyres is fatal however gently",
      st.result?.kind === "crash" && st.result.title === "HARD IMPACT",
      `${st.result?.kind} / ${st.result?.title ?? ""}`,
    );
  }
  {
    const st = deckArrival({ sink: -5, speed: 55, gearT: 0 });
    check(
      "arriving with the gear up is still fatal",
      st.result?.kind === "crash",
      `${st.result?.kind} / ${st.result?.title ?? ""}`,
    );
  }

  // Touching down where no wire will have you: it has to be a landing, not a
  // drowning. This used to slide off the hull and report "The Tomcat is not a
  // seaplane" while sitting on a flight deck.
  {
    const c = carriers()[0];
    const st = deckArrival({ sink: -5, speed: 55, d: 45 });
    const stillAfloat = carrierAt(st.pos.x, st.pos.z) !== null;
    check(
      "touching down off the landing area stops on the boat, not in the sea",
      st.result?.kind === "landing" && st.result.title === "DECK LANDING",
      `${st.result?.kind} / ${st.result?.title ?? ""}`,
    );
    // Resting on the roof, not under it: the centre of gravity sits a ride
    // height above the deck, so "on the deck" is a band, not an equality.
    const parked = st.pos.y >= c.deckY && st.pos.y < c.deckY + 6 && !st.airborne;
    check(
      "the jet finishes the roll parked on the deck",
      stillAfloat && parked,
      `y=${st.pos.y.toFixed(1)} deck=${c.deckY} airborne=${st.airborne}`,
    );
  }
}

for (const aircraft of ["tomcat", "hornet", "intruder"] as const) {
  const af = airfield(), st = spawnAircraft("airfield",0,aircraft);
  st.pos.set(af.centerX-af.runwayLength/2+240,af.elevation+2.5,af.centerZ);
  st.vel.set(65,-3,0);st.speed=65;st.onGround=false;st.airborne=true;st.catPhase="idle";
  st.throttle=0;st.rpm=.1;st.gearT=1;st.flapT=1;st.flapsDown=true;
  const inp=idle();inp.brake=true;
  for(let i=0;i<120*35&&!st.result;i++)stepAircraft(st,inp,DT);
  check(`${aircraft} runway touchdown and braking earns landing confirmation`,st.result?.kind==="landing",st.result?.title);
}

console.log(failures === 0 ? "\nALL LANDING CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
