// Carrier recovery end-to-end: a scripted pilot flies the 4 deg glideslope onto
// the deck at the on-speed and we check the wire actually catches. The whole
// approach is flown through the same FlightInput the player's keys produce, so
// this exercises the real handling, the trap window and the arrest.
// Usage: bun scripts/diag-landing.ts
import { Vector3, Quaternion, Euler } from "three";
import {
  spawnAircraft,
  stepAircraft,
  glideStateFor,
  approachSpeed,
  GLIDE_AIM_S,
  GLIDE_DEG,
  type AircraftState,
  type FlightInput,
} from "../src/sim/flight";
import { airfield, carriers, deckAxes, STRIP, worldToDeck, type CarrierDef } from "../src/sim/world";

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
