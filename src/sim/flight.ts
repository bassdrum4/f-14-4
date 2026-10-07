// F-14 Tomcat flight model.
//
// Body frame (three.js convention): forward = -Z, up = +Y, right = +X.
// omega components: x = pitch rate (+ = nose up), y = yaw rate (+ = nose left),
// z = roll rate (+ = roll left). Moments follow the same axes.
//
// Fixed timestep integration. No Math.random inside the sim — buffet and
// other pseudo-random effects are derived from sim time, so runs are
// deterministic for identical inputs.

import { Quaternion, Vector3 } from "three";
import { atmosphere } from "./atmosphere";
import { DEFAULT_AIRCRAFT, specFor, type AircraftId, type AircraftSpec } from "./aircraft";
import { clamp } from "./noise";
import {
  CAT_START_ALONG,
  STRIP,
  airfield,
  carrierAt,
  carriers,
  deckAxes,
  groundAt,
  nearestCarrier,
  worldToDeck,
  type CarrierDef,
  type SurfaceKind,
} from "./world";

// ---------------------------------------------------------------------------
// Shared flight-model coefficients.
//
// The aircraft-specific numbers (mass, wing, inertia, thrust, stall, control
// power, ordnance) live in ./aircraft.ts; stepAircraft reads them off
// AircraftState.spec. Only the coefficients that are common to every airframe
// stay here.
// ---------------------------------------------------------------------------

const GRAVITY = 9.81;

const CL0 = 0.1;

// Moment coefficients (per unit control input / normalized rates)
const CM_ALPHA = -0.45; // static stability, per rad
const TRIM_CM = 0.16; // full trim authority (Cm0 offset)
// Stability-augmentation pitch damper (rate + vertical-speed feedback). The
// rate term tightens the short period; the vertical-speed term supplies the
// phugoid damping the bare airframe lacks. Keep the rate term modest: it adds
// to Cm_q, and a large Cm_q caps the alpha a sustained pull can hold (the
// damping grows with the very turn rate the elevator is trying to build), which
// flattens the turn. /docs: scripts/diag-turnrate.ts pins this.
const SAS_CM = 0.075; // vertical-speed feedback authority
const SAS_Q = 10; // extra pitch-rate damping, per unit (w * c / 2V)
const CL_BETA = 0.08; // dihedral effect per rad sideslip
// Yaw damper: a swept wing's roll-yaw coupling gives a lightly damped dutch
// roll, which in the cockpit reads as the nose swinging side to side.
const YD_RATE = 1.6; // yaw-rate feedback
const YD_BETA = 2.2; // sideslip feedback (drives rudder to kill beta)
const CN_R = 2.0; // yaw damping per unit (w * b / 2V)
const CN_BETA = -0.12; // weathercock stability per rad (sign: beta>0 -> nose right)
const SWEEP_ROLL_LOSS = 0.35;

// Gear contact geometry (body coords, meters)
const WHEEL_BOTTOM_Y = -2.03; // all tyre bottoms share one body-frame height
const NOSE_R = 0.3;
const MAIN_R = 0.33;
const NOSE_GEAR = { x: 0, y: WHEEL_BOTTOM_Y + NOSE_R, z: -6.0 };
const MAIN_GEAR = { x: 2.3, y: WHEEL_BOTTOM_Y + MAIN_R, z: 0.5 };
const BELLY_Y = -1.05;

const SPRING_K = 6.0e5; // N/m per wheel (soft enough for stable explicit integration)
const SPRING_C = 2.6e5; // N per m/s
const N_MAX = 1.8e6; // peak wheel load

// Static load share: the mains sit just aft of the CG, so the nose gear holds
// ~1/13 of the weight and each main ~6/13. Matching each wheel's stiffness to
// its share keeps the TOTAL ground stiffness the same while letting every tyre
// compress equally — the jet sits level instead of sinking into its mains.
const K_NOSE = SPRING_K * (3 / 13);
const K_MAIN = SPRING_K * (18 / 13);
const C_NOSE = SPRING_C * (3 / 13);
const C_MAIN = SPRING_C * (18 / 13);

// Parked CG height: tyre bottoms at their static compression, so a mission
// starts with the gear already settled (no spawn drop). The compression scales
// with the aircraft's weight, so a heavier bomber rides a touch lower.
function staticPen(spec: AircraftSpec): number {
  return (spec.mass * GRAVITY) / (K_NOSE + 2 * K_MAIN);
}
function rideHeight(spec: AircraftSpec): number {
  return -WHEEL_BOTTOM_Y - staticPen(spec);
}
const FRICTION_ROLL = 0.08;
const FRICTION_BRAKE = 0.7;

// --- step scratch ---
// stepAircraft and its ground-contact pass run at 120 Hz and used to allocate
// a dozen vectors and quaternions per step. Everything below is reused; the
// math is unchanged.
const QINV = new Quaternion();
const QINV2 = new Quaternion();
const VBODY = new Vector3();
const FF = new Vector3();
const MM = new Vector3();
const VHAT = new Vector3();
const LIFTDIR = new Vector3();
const BFWD = new Vector3();
const DQ = new Quaternion();
const HOR = new Vector3();
const OMEGAW = new Vector3();
const OMEGAC = new Vector3();
const TORQUE = new Vector3();
const LOCAL = new Vector3();
const WORLD = new Vector3();
const RPOINT = new Vector3();
const VPOINT = new Vector3();
const VH = new Vector3();
const VHCG = new Vector3();
const FW = new Vector3();
const DIRV = new Vector3();
const ARMH = new Vector3();
const FRICV = new Vector3();
const UPF = new Vector3();

/** Contact points: static geometry, built once instead of per step. */
const CONTACT_POINTS: Array<{
  x: number;
  y: number;
  z: number;
  wheel: boolean;
  r: number;
  k: number;
  c: number;
}> = [
  { ...NOSE_GEAR, wheel: true, r: NOSE_R, k: K_NOSE, c: C_NOSE },
  { ...MAIN_GEAR, wheel: true, r: MAIN_R, k: K_MAIN, c: C_MAIN },
  { x: -MAIN_GEAR.x, y: MAIN_GEAR.y, z: MAIN_GEAR.z, wheel: true, r: MAIN_R, k: K_MAIN, c: C_MAIN },
  { x: 0, y: BELLY_Y, z: -5, wheel: false, r: 0, k: SPRING_K, c: SPRING_C },
  { x: 0, y: BELLY_Y, z: 0.5, wheel: false, r: 0, k: SPRING_K, c: SPRING_C },
  { x: 0, y: -0.2, z: 6.5, wheel: false, r: 0, k: SPRING_K, c: SPRING_C }, // tail strike
];

export const CAT_ACCEL = 27.6; // m/s^2 (~2.8 g)
export const CAT_V_END = 72; // m/s (~140 kt)
/** Time from cat release to end of stroke; the hostile carrier's launches use
 *  the same track, so the two stay in step. */
export const CAT_TIME = CAT_V_END / CAT_ACCEL;

const ARREST_DECEL = 27; // m/s^2 (~2.75 g)

// --- approach guidance (the boat's own MEZ/IFLOLS, simulated) ---
/** The glideslope the landing area expects: 4 degrees, real CVN practice. */
export const GLIDE_DEG = 4;
/** Distance down the angled strip where the glideslope meets the deck. */
export const GLIDE_AIM_S = 105;
/** Ball-call window: the pilot must be on-speed and on-slope inside this. */
export const GLIDE_START_KM = 3.2;

/**
 * The carrier-approach snapshot: what the HUD's ball/ILS symbology needs to
 * fly a 4° glideslope onto the angled deck. Measured from the jet to the
 * nearest friendly boat; meaningless (all NaN) when there is nothing to land
 * on within GLIDE_START_KM.
 */
export interface GlideState {
  /** Slant range to the glide-path origin, metres. */
  rangeM: number;
  /** + above the 4° path, − below, metres. */
  deviationM: number;
  /** Lateral offset from the angled centreline, metres (+ = right). */
  lineupM: number;
  /** Deck of the boat being flown onto. */
  carrier: CarrierDef;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FlightInput {
  pitch: number; // +1 = nose up
  roll: number; // +1 = roll right
  yaw: number; // +1 = nose right
  throttleUp: boolean;
  throttleDown: boolean;
  trimUp: boolean;
  trimDown: boolean;
  brake: boolean;
  catHold: boolean;
  /** Guns held (used by the combat layer, ignored by the bare flight model). */
  fire?: boolean;
}

export type CatPhase = "idle" | "ready" | "charging" | "firing";

export interface SimResult {
  kind: "wire" | "bolter" | "crash";
  wire?: number;
  title: string;
  detail: string;
}

export interface Banner {
  text: string;
  until: number; // sim time
}

export interface AircraftState {
  // the airframe being flown (mass, aero, thrust, ordnance)
  spec: AircraftSpec;

  // integration state
  pos: Vector3;
  vel: Vector3;
  quat: Quaternion;
  omega: Vector3; // body rates (x pitch, y yaw, z roll)

  // engine + systems
  throttle: number; // 0..1
  rpm: number; // engine spool 0..1
  abOn: boolean;
  abLevel: number; // 0..1
  gearDown: boolean;
  gearT: number; // 0..1
  flapsDown: boolean;
  flapT: number; // 0..1
  speedbrake: boolean;
  sbT: number; // 0..1
  brakeOn: boolean;
  trim: number; // 0..1 (0.5 = neutral)
  sweepT: number; // 0..1 (0 = 20deg, 1 = 68deg)
  sweep: number; // smoothed degrees

  // derived (HUD)
  speed: number; // m/s
  mach: number;
  alpha: number; // rad
  gLoad: number;
  vspeed: number; // m/s
  headingDeg: number;
  stalled: boolean;
  onGround: boolean;
  groundKind: SurfaceKind;
  wheelPen: number; // visual: deepest tyre compression into the surface

  // carrier ops
  catPhase: CatPhase;
  catProgress: number; // 0..1 during charging/firing
  arresting: boolean;
  catCooldown: number; // seconds until wires are live after a cat shot
  catCarrier: number; // carrier index the current cat shot launches from
  wire?: number;

  // events
  airborne: boolean; // fully in the air (set after leaving ground)
  /** Fatal hit taken: the airframe is unrecoverable and tumbling down. The
   *  engine runs the crash replay while this is true, then shows the screen. */
  crashFall: boolean;
  flightTime: number;
  time: number;
  result: SimResult | null;
  banner: Banner | null;

  // interpolation snapshots (written by the frame loop)
  prevPos: Vector3;
  prevQuat: Quaternion;
}

// ---------------------------------------------------------------------------
// Spawn
// ---------------------------------------------------------------------------

export type MissionKind = "carrier" | "airfield";

/**
 * A recovery surface: a friendly deck or the runway. True once the jet is down
 * on one of them without a crash or a bolter result — the state the sim calls
 * a recovery, and refuels/re-arms on.
 */
export function isRecoverySurface(st: AircraftState): boolean {
  return (
    !st.airborne &&
    !st.result &&
    (st.groundKind === "deck" || st.groundKind === "runway")
  );
}

function headingQuat(headingDeg: number): Quaternion {
  const th = (headingDeg * Math.PI) / 180;
  return new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -th);
}

/** Catapult pose scratch (the stroke runs at 120 Hz; nothing allocates). */
const CAT_ROT = new Quaternion();
const AXIS_X = new Vector3(1, 0, 0);

/** Smoothstep 0..1. */
function smooth01(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * Compute the approach state onto the nearest friendly carrier. The glideslope
 * is the 4° line from a point GLIDE_AIM_S down the angled strip; the return is
 * null outside the ball-call window, when the jet is parked, or after a result.
 */
export function glideStateFor(st: AircraftState): GlideState | null {
  if (st.onGround || st.result) return null;
  const c = carrierAt(st.pos.x, st.pos.z) ?? nearestCarrier(st.pos.x, st.pos.z);
  const { s, d } = stripCoords(c, st.pos.x, st.pos.z);
  // Behind the origin (s past the aim point) there is no slope left to read.
  if (s > GLIDE_AIM_S) return null;
  // The glide-path origin sits GLIDE_AIM_S down the angled strip at deck
  // height — at the wires, not at the ship centre — so the slope reads against
  // the strip the jet will actually touch.
  const th = (c.landingAngleDeg * Math.PI) / 180;
  const { fwd, right } = deckAxes(c.headingDeg);
  const oAlong = STRIP_START_ALONG + GLIDE_AIM_S * Math.cos(th);
  const oAcross = STRIP_START_ACROSS - GLIDE_AIM_S * Math.sin(th);
  const ox = c.x + oAlong * fwd[0] + oAcross * right[0];
  const oz = c.z + oAlong * fwd[1] + oAcross * right[1];
  const groundRange = Math.hypot(st.pos.x - ox, st.pos.z - oz);
  const rangeM = Math.hypot(groundRange, st.pos.y - c.deckY);
  if (rangeM > GLIDE_START_KM * 1000) return null;
  const pathY = c.deckY + groundRange * Math.tan((GLIDE_DEG * Math.PI) / 180);
  // d is measured perpendicular to the angled centreline (the strip frame the
  // deck paint and the wires use), so it *is* the lineup error; + = starboard.
  return {
    rangeM,
    deviationM: st.pos.y - pathY,
    lineupM: d,
    carrier: c,
  };
}

export function spawnAircraft(
  mission: MissionKind,
  carrierIndex = 0,
  aircraft: AircraftId = DEFAULT_AIRCRAFT,
): AircraftState {
  const spec = specFor(aircraft);
  const fleet = carriers();
  const idx = Math.max(0, Math.min(carrierIndex, fleet.length - 1));
  const af = airfield();
  let pos: Vector3;
  let quat: Quaternion;
  let catPhase: CatPhase = "idle";
  const ride = rideHeight(spec);

  // Spawn at the static ride height so the jet starts settled on its gear
  // instead of dropping onto it.
  if (mission === "carrier") {
    const cat = catTrack(fleet[idx]);
    pos = cat.start.clone();
    pos.y = fleet[idx].deckY + ride;
    quat = headingQuat(fleet[idx].headingDeg);
    catPhase = "ready";
  } else {
    // West end of the runway, facing east
    const x = af.centerX - af.runwayLength / 2 + 120;
    const z = af.centerZ;
    pos = new Vector3(x, af.elevation + ride, z);
    quat = headingQuat(af.headingDeg);
  }

  return {
    spec,
    pos,
    vel: new Vector3(0, 0, 0),
    quat,
    omega: new Vector3(0, 0, 0),
    throttle: 0,
    rpm: 0.05,
    abOn: false,
    abLevel: 0,
    gearDown: true,
    gearT: 1,
    flapsDown: true,
    flapT: 1,
    speedbrake: false,
    sbT: 0,
    brakeOn: false,
    trim: 0.5,
    sweepT: 0,
    sweep: spec.sweepMin,
    speed: 0,
    mach: 0,
    alpha: 0,
    gLoad: 1,
    vspeed: 0,
    headingDeg: mission === "carrier" ? fleet[idx].headingDeg : af.headingDeg,
    stalled: false,
    onGround: true,
    groundKind: mission === "carrier" ? "deck" : "runway",
    wheelPen: staticPen(spec),
    catPhase,
    catProgress: 0,
    arresting: false,
    catCooldown: 0,
    catCarrier: idx,
    airborne: false,
    crashFall: false,
    flightTime: 0,
    time: 0,
    result: null,
    banner:
      mission === "carrier"
        ? { text: `CARRIER ${fleet[idx].name} — HOLD SPACE FOR CATAPULT`, until: 30 }
        : { text: "THROTTLE UP (W) — ROTATE AT 150 KT", until: 30 },
    prevPos: pos.clone(),
    prevQuat: quat.clone(),
  };
}

/** Catapult track in world coordinates for a given carrier. */
export function catTrack(c: CarrierDef): { start: Vector3; dir: Vector3 } {
  const { fwd, right } = deckAxes(c.headingDeg);
  const start = new Vector3(
    c.x + fwd[0] * CAT_START_ALONG + right[0] * c.catapultOffsetX,
    0,
    c.z + fwd[1] * CAT_START_ALONG + right[1] * c.catapultOffsetX,
  );
  return { start, dir: new Vector3(fwd[0], 0, fwd[1]) };
}

// ---------------------------------------------------------------------------
// Landing strip geometry (angled deck)
// ---------------------------------------------------------------------------

// Strip frame comes from world.ts so the renderer can draw the deck markings
// and wires at exactly the coordinates the sim evaluates.
const STRIP_START_ALONG = STRIP.startAlong;
const STRIP_START_ACROSS = STRIP.startAcross;
const STRIP_HALF_WIDTH = STRIP.halfWidth;
const WIRE_FIRST_S = STRIP.wireFirstS;
const CATCH_S_MIN = STRIP.catchSMin;
const CATCH_S_MAX = STRIP.catchSMax;

function stripCoords(c: CarrierDef, x: number, z: number): { s: number; d: number } {
  const [along, across] = worldToDeck(c, x, z);
  const th = (c.landingAngleDeg * Math.PI) / 180;
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  const relA = along - STRIP_START_ALONG;
  const relC = across - STRIP_START_ACROSS;
  // strip direction in deck coords: (cos, -sin) — drifts toward port
  const s = relA * cos - relC * sin;
  const d = relA * sin + relC * cos;
  return { s, d };
}

// ---------------------------------------------------------------------------
// Step
// ---------------------------------------------------------------------------

export function stepAircraft(st: AircraftState, inp: FlightInput, dt: number): void {
  // A terminal result freezes the jet — unless it is mid-crash-replay, when
  // the airframe keeps integrating so the engine's camera can watch it fall.
  if (st.result && !st.crashFall) return;
  st.time += dt;
  st.flightTime += dt;

  // --- systems ---
  if (inp.throttleUp) st.throttle = clamp(st.throttle + dt * 0.5, 0, 1);
  if (inp.throttleDown) st.throttle = clamp(st.throttle - dt * 0.5, 0, 1);
  if (inp.trimUp) st.trim = clamp(st.trim + dt * 0.35, 0, 1);
  if (inp.trimDown) st.trim = clamp(st.trim - dt * 0.35, 0, 1);
  st.brakeOn = inp.brake || st.catPhase === "ready" || st.catPhase === "charging";

  const rpmTau = st.throttle > st.rpm ? 1.2 : 1.8;
  st.rpm += (st.throttle - st.rpm) * (1 - Math.exp(-dt / rpmTau));
  // No burner on the bomber: the AB toggle simply does nothing there.
  const abTarget = st.abOn && st.throttle > 0.9 && st.spec.abThrust > 0 ? 1 : 0;
  st.abLevel += (abTarget - st.abLevel) * (1 - Math.exp(-dt / 0.5));

  st.gearT = clamp(st.gearT + (st.gearDown ? dt / 1.8 : -dt / 1.8), 0, 1);
  st.flapT = clamp(st.flapT + (st.flapsDown ? dt / 2.2 : -dt / 2.2), 0, 1);
  st.sbT = clamp(st.sbT + (st.speedbrake ? dt / 0.9 : -dt / 0.9), 0, 1);

  // --- catapult sequence ---
  if (st.catPhase === "ready" && inp.catHold) {
    st.catPhase = "charging";
    st.catProgress = 0;
  }
  if (st.catCooldown > 0) st.catCooldown -= dt;
  if (st.catPhase === "charging") {
    st.catProgress = clamp(st.catProgress + dt / 0.9, 0, 1);
    if (!inp.catHold) {
      st.catPhase = "ready";
      st.catProgress = 0;
    } else if (st.catProgress >= 1) {
      st.catPhase = "firing";
      st.catProgress = 0;
      st.banner = { text: "CAT SHOT — PULL UP", until: st.time + 3 };
    }
    return; // parked while charging
  }
  if (st.catPhase === "firing") {
    st.catProgress = clamp(st.catProgress + dt / (CAT_V_END / CAT_ACCEL), 0, 1);
    const t = st.catProgress * (CAT_V_END / CAT_ACCEL);
    const fleet = carriers();
    const c = fleet[Math.min(st.catCarrier, fleet.length - 1)];
    const cat = catTrack(c);
    const dist = 0.5 * CAT_ACCEL * t * t;
    const speed = CAT_ACCEL * t;
    st.pos.copy(cat.start).addScaledVector(cat.dir, dist);
    // The stroke has to be pose-continuous: the camera rides this pose, so a
    // snap here is a visible jump the instant the jet starts moving. The lift
    // off the deck and the 6 deg launch rotate are both ramped in over the
    // first third of the stroke instead of being set on the first step.
    const rise = smooth01(st.catProgress / 0.35);
    st.pos.y = c.deckY + 2.4 - (2.4 - rideHeight(st.spec)) * (1 - rise);
    st.quat.copy(headingQuat(c.headingDeg)).multiply(
      CAT_ROT.setFromAxisAngle(AXIS_X, 0.105 * rise),
    );
    st.vel.copy(cat.dir).multiplyScalar(speed);
    st.speed = speed;
    st.mach = speed / 340;
    st.vspeed = 0;
    st.omega.set(0, 0, 0);
    if (st.catProgress >= 1) {
      st.catPhase = "idle";
      st.airborne = true;
      st.catCooldown = 4; // bridle drops; wires inert for 4 s
    }
    return;
  }

  // --- atmosphere / body-frame airspeed ---
  const atm = atmosphere(st.pos.y);
  const qInv = QINV.copy(st.quat).invert();
  const vBody = VBODY.copy(st.vel).applyQuaternion(qInv);
  const V = vBody.length();
  const u = -vBody.z; // forward speed
  const alpha = V > 1 ? Math.atan2(-vBody.y, Math.max(u, 0.5)) : 0;
  const beta = V > 1 ? clamp(Math.atan2(vBody.x, Math.max(u, 0.5)), -0.5, 0.5) : 0;

  st.speed = V;
  st.mach = V / atm.soundSpeed;
  st.alpha = alpha;
  st.vspeed = st.vel.y;
  BFWD.set(0, 0, -1).applyQuaternion(st.quat);
  st.headingDeg = ((Math.atan2(BFWD.x, -BFWD.z) * 180) / Math.PI + 360) % 360;

  // wing sweep (auto, mach-linked). Fixed-wing types hold their sweep.
  const spec = st.spec;
  st.sweepT = spec.sweepMax > spec.sweepMin ? clamp((st.mach - 0.3) / 0.7, 0, 1) : 0;
  const sweepTarget = spec.sweepMin + (spec.sweepMax - spec.sweepMin) * st.sweepT;
  st.sweep += (sweepTarget - st.sweep) * (1 - Math.exp(-dt / 0.7));

  // --- aerodynamics ---
  const qbar = 0.5 * atm.rho * V * V;
  const F = FF.set(0, 0, 0);
  const M = MM.set(0, 0, 0);
  let liftAccel = 0;

  if (V > 1 && !st.crashFall) {
    const aAbs = Math.abs(alpha);
    const flapLift = spec.flapLift * st.flapT;
    const sweepN = st.sweepT;

    // lift with stall falloff
    let CL: number;
    if (aAbs <= spec.alphaStall) {
      CL = CL0 + flapLift + spec.clAlpha * alpha;
    } else {
      const peak = CL0 + flapLift + spec.clAlpha * spec.alphaStall;
      const fall = Math.max(0.35, 1 - 2.2 * (aAbs - spec.alphaStall));
      CL = Math.sign(alpha) * peak * fall;
    }
    const sep = Math.max(0, aAbs - spec.alphaStall);

    // drag
    let CD = spec.cd0 - 0.004 * sweepN + spec.kInduced * (1 - 0.12 * sweepN) * CL * CL;
    // The speed brake is the pilot's throttle for the glideslope: it has to be
    // able to hold a 700 kt dive at approach power and drag the jet below
    // on-speed without touching the stick, so it more than doubles parasite
    // drag when open.
    CD += 0.018 * st.gearT + 0.045 * st.flapT + 0.24 * st.sbT + 0.5 * sep;
    if (st.mach > 0.88) {
      const t = clamp((st.mach - 0.88) / 0.17, 0, 1);
      CD += 0.045 * t * t * (3 - 2 * t);
    }
    const qS = qbar * spec.sWing;
    const L = qS * CL;
    const D = qS * CD;

    // directions in body frame
    const vhat = VHAT.copy(vBody).divideScalar(V);
    const liftDir = LIFTDIR.set(0, 1, 0).addScaledVector(vhat, -vhat.y);
    if (liftDir.lengthSq() > 1e-6) liftDir.normalize();
    else liftDir.set(0, 0, -Math.sign(u) || -1);

    F.addScaledVector(liftDir, L);
    F.addScaledVector(vhat, -D);
    F.x += -0.8 * beta * qS; // side force opposing slip

    // moments
    const cM = spec.chord;
    const bM = spec.span;
    const qSc = qbar * spec.sWing * cM;
    const qSb = qbar * spec.sWing * bM;
    const rollAuth = 1 - SWEEP_ROLL_LOSS * sweepN;

    const cm0 = (st.trim - 0.5) * TRIM_CM;
    const elev = inp.pitch * (st.stalled ? 0.7 : 1);
    // Stability-augmentation pitch damper: bleeds off vertical drift so a
    // nose-up command settles into a climb instead of pitching up until the
    // wing stalls, then diving — the long-period "porpoising" that reads as
    // the nose rocking back and forth. The pilot's own input is left alone
    // near full deflection so the jet still responds when asked.
    const sas = SAS_CM * clamp(st.vspeed / 22, -1, 1) * (1 - 0.6 * Math.abs(inp.pitch));
    M.x += qSc * (cm0 + CM_ALPHA * alpha + spec.cmElev * elev - (spec.cmQ + SAS_Q) * ((st.omega.x * cM) / (2 * Math.max(V, 30))) - sas);
    M.z +=
      qSb *
      (CL_BETA * beta -
        spec.clAil * rollAuth * inp.roll -
        spec.clP * ((st.omega.z * bM) / (2 * Math.max(V, 30))));
    // Yaw damper: drives the rudder to kill sideslip and yaw rate, which
    // tames the swept wing's lightly damped dutch roll. Positive = nose right.
    const yawDamper = clamp(
      YD_RATE * ((st.omega.y * bM) / (2 * Math.max(V, 30))) + YD_BETA * beta,
      -1,
      1,
    );
    // M.y is positive nose-left, while the pilot's yaw axis is positive
    // nose-right, hence the sign on the rudder term.
    M.y +=
      qSb *
      (CN_BETA * beta -
        spec.cnRud * (inp.yaw + yawDamper) -
        CN_R * ((st.omega.y * bM) / (2 * Math.max(V, 30))));

    // stall buffet (deterministic)
    st.stalled = alpha > spec.alphaStall * 0.92 || alpha < -spec.alphaStall * 0.92;
    if (st.stalled && V > 30) {
      const t = st.time;
      M.x += qSc * 0.012 * Math.sin(t * 21.3) * Math.sin(t * 4.7);
      M.z += qSb * 0.006 * Math.sin(t * 17.7) * Math.sin(t * 2.9);
    } else {
      st.stalled = false;
    }

    liftAccel = L / spec.mass;
  } else if (st.crashFall) {
    // A tumbling wreck presents no coherent wing: no lift, no control moments,
    // just a flailing airframe that sheds speed and falls. Modelling it as a
    // flat-plate drag also kills the flat-spin equilibrium the bare aero model
    // settles into, where residual lift balances gravity and the wreck hovers.
    const qS = qbar * spec.sWing;
    F.addScaledVector(VHAT.copy(vBody).divideScalar(V), -qS * 1.1);
    st.stalled = false;
  } else {
    st.stalled = false;
  }

  // --- thrust ---
  const sigma = atm.sigma;
  let thrust = spec.idleThrust + (spec.thrustDry - spec.idleThrust) * st.rpm;
  thrust *= Math.pow(sigma, 0.75);
  if (st.abLevel > 0.01) thrust += spec.abThrust * st.abLevel * Math.pow(sigma, 0.6);
  if (st.crashFall) thrust = 0; // the engines are gone
  F.z -= thrust; // body forward is -Z

  // --- gravity ---
  const accWorld = F.applyQuaternion(st.quat);
  // A broken airframe is dragging itself out of the sky: the fall reads as a
  // spiral dive, not a slow float, so the crash replay stays a few seconds.
  accWorld.y -= spec.mass * GRAVITY * (st.crashFall ? 2.6 : 1);

  // --- ground contact ---
  const ground = applyGroundContact(st, dt, inp, accWorld, spec);

  // --- integrate ---
  st.vel.addScaledVector(accWorld, dt / spec.mass);
  st.pos.addScaledVector(st.vel, dt);

  // A tumbling wreck answers to no control surface: aerodynamic restoring
  // moments nearly vanish, so the tumble from the fatal hit keeps going.
  if (st.crashFall) M.multiplyScalar(0.18);
  const wx = M.x / spec.iPitch;
  const wy = M.y / spec.iYaw;
  const wz = M.z / spec.iRoll;
  st.omega.x = clamp(st.omega.x + wx * dt, -1.6, 1.6);
  st.omega.y = clamp(st.omega.y + wy * dt, -1.0, 1.0);
  st.omega.z = clamp(st.omega.z + wz * dt, -3.2, 3.2);

  // nosewheel steering at low speed
  if (st.onGround && st.speed < 50) {
    st.omega.y += -inp.yaw * 1.4 * dt * (1 - st.speed / 50);
  }

  st.quat
    .multiply(DQ.set(st.omega.x * dt * 0.5, st.omega.y * dt * 0.5, st.omega.z * dt * 0.5, 1).normalize())
    .normalize();

  // ground reaction torques + landing-gear strut angular damping
  if (ground.contacts > 0) {
    if (ground.torqueBody) {
      st.omega.x += (ground.torqueBody.x / spec.iPitch) * dt;
      st.omega.y += (ground.torqueBody.y / spec.iYaw) * dt;
      st.omega.z += (ground.torqueBody.z / spec.iRoll) * dt;
    }
    st.omega.multiplyScalar(Math.exp(-dt * 3));
  }

  // arresting wire decel
  if (st.arresting) {
    const horizontal = HOR.set(st.vel.x, 0, st.vel.z);
    const speed = horizontal.length();
    if (speed > 0.01) {
      const dir = horizontal.divideScalar(speed);
      const next = Math.max(0, speed - ARREST_DECEL * dt);
      st.vel.set(dir.x * next, st.vel.y * 0.9, dir.z * next);
      if (next < 0.5) {
        st.vel.set(0, 0, 0);
        st.result = {
          kind: "wire",
          wire: st.wire ?? 3,
          title: `CAUGHT WIRE ${st.wire ?? 3}`,
          detail: "Trap confirmed. Nicely done, pilot — rearmed and repaired on deck.",
        };
      }
    }
  }

  st.onGround = ground.contacts > 0;
  st.groundKind = ground.kind;
  if (st.onGround) {
    st.airborne = false;
  } else if (!st.onGround && st.pos.y > groundRef(st) + 2.5 && st.flightTime > 1) {
    st.airborne = true;
  }

  st.gLoad = st.onGround ? 1 : liftAccel / GRAVITY;
}

function groundRef(st: AircraftState): number {
  return groundAt(st.pos.x, st.pos.z).y;
}

// ---------------------------------------------------------------------------
// Ground contact + landing evaluation
// ---------------------------------------------------------------------------

interface GroundOutcome {
  contacts: number;
  kind: SurfaceKind;
  torqueBody: Vector3 | null;
}

function applyGroundContact(
  st: AircraftState,
  dt: number,
  _inp: FlightInput,
  accWorld: Vector3,
  spec: AircraftSpec,
): GroundOutcome {
  void _inp;
  const omegaWorld = OMEGAW.copy(st.omega).applyQuaternion(st.quat);
  let contacts = 0;
  let kind: SurfaceKind = st.groundKind;
  let bellyHit = false;
  let touchdownVy = 0; // most-negative contact descent this frame
  let maxWheelPen = 0; // deepest tyre compression (renderer lifts the gear)
  const torque = TORQUE.set(0, 0, 0);
  let hitDeck = false;
  let hitRunway = false;
  let hitTerrain = false;
  let hitWater = false;

  for (const p of CONTACT_POINTS) {
    // wheel contact = bottom of the tyre; wheels tuck up as gear retracts
    const restY = p.wheel ? p.y + (BELLY_Y + 0.05 - p.y) * (1 - st.gearT) - p.r : p.y;
    const local = LOCAL.set(p.x, restY, p.z);
    const world = WORLD.copy(local).applyQuaternion(st.quat).add(st.pos);
    const g = groundAt(world.x, world.z);
    const pen = g.y - world.y;
    if (pen <= 0) continue;

    contacts++;
    kind = g.kind;
    if (p.wheel) maxWheelPen = Math.max(maxWheelPen, pen);
    if (g.kind === "deck") hitDeck = true;
    else if (g.kind === "runway") hitRunway = true;
    else if (g.kind === "terrain") hitTerrain = true;
    else hitWater = true;

    // velocity at the contact point (world)
    const rWorld = RPOINT.copy(world).sub(st.pos);
    const vPoint = VPOINT.copy(st.vel).add(OMEGAC.copy(omegaWorld).cross(rWorld));

    if (!p.wheel && pen > 0.25) bellyHit = true; // structure deep in the dirt

    // spring + damper along world up
    const N = Math.min(N_MAX, Math.max(0, p.k * Math.min(pen, 0.5) - p.c * vPoint.y));
    if (N > 0) {
      const Fw = FW.set(0, N, 0);
      // friction against horizontal motion
      const vh = VH.set(vPoint.x, 0, vPoint.z);
      const hs = vh.length();
      let fFric = 0;
      if (hs > 0.001 && p.wheel) {
        // Wheels resist the AIRFRAME's motion (brake/rolling resistance),
        // not the local point velocity — otherwise pitch bounce rectifies
        // into forward creep.
        const vhCg = VHCG.set(st.vel.x, 0, st.vel.z);
        const hsCg = vhCg.length();
        if (hsCg > 0.001) {
          const mu = st.brakeOn ? FRICTION_BRAKE : FRICTION_ROLL;
          const maxF = (spec.mass / 4) * (hsCg / dt) * 0.9;
          fFric = Math.min(mu * N, maxF);
          Fw.addScaledVector(DIRV.copy(vhCg).divideScalar(hsCg), -fFric);
        }
      } else if (hs > 0.05) {
        // belly / structure drags hard
        fFric = Math.min(0.9 * N, (spec.mass / 4) * (hs / dt) * 0.9);
        Fw.addScaledVector(DIRV.copy(vh).divideScalar(hs), -fFric);
      }
      accWorld.add(Fw);
      // spring force acts at the contact patch (full arm);
      // friction is reacted through the strut near CG height, so its
      // torque arm is horizontal only — otherwise braking dives the nose.
      torque.add(OMEGAC.copy(rWorld).cross(UPF.set(0, N, 0)));
      if (fFric > 0) {
        const armH = ARMH.set(rWorld.x, 0, rWorld.z);
        const fricV = FRICV.copy(vh).divideScalar(hs).multiplyScalar(-fFric);
        torque.add(armH.cross(fricV));
      }
    }

    touchdownVy = Math.min(touchdownVy, vPoint.y);
  }

  // --- crash conditions (first-contact only; st.onGround is last step's value) ---
  const firstTouch = contacts > 0 && !st.onGround && st.airborne;
  if (!st.result) {
    if (hitWater && firstTouch) {
      fail(st, "DITCHED", "The Tomcat is not a seaplane. Impact with the sea.");
    } else if (bellyHit && firstTouch) {
      // Scraping the tail during a pavement roll is drag, not death —
      // but arriving nose-high from the air is fatal.
      fail(st, "BELLY IMPACT", "Structure hit the ground. Gear was not down (or down hard).");
    } else if (hitTerrain && firstTouch) {
      fail(st, "TERRAIN IMPACT", "Only the runway and the carrier deck are survivable surfaces.");
    } else if (firstTouch && touchdownVy < -6) {
      fail(st, "HARD IMPACT", `Touchdown at ${Math.round(-touchdownVy * 196.85)} fpm — the gear gave way.`);
    }
  }

  // --- landing evaluation on the carrier (a real touchdown only) ---
  if (
    !st.result &&
    hitDeck &&
    st.airborne &&
    st.catCooldown <= 0 &&
    touchdownVy < -0.8 &&
    touchdownVy > -6 &&
    st.speed > 20 &&
    st.gearT > 0.6
  ) {
    const c = carrierAt(st.pos.x, st.pos.z) ?? nearestCarrier(st.pos.x, st.pos.z);
    const { s, d } = stripCoords(c, st.pos.x, st.pos.z);
    if (Math.abs(d) <= STRIP_HALF_WIDTH && s >= CATCH_S_MIN && s <= CATCH_S_MAX) {
      const wire = clamp(Math.round((s - WIRE_FIRST_S) / c.wireSpacing) + 1, 1, c.wireCount);
      st.arresting = true;
      st.wire = wire;
      st.airborne = false;
    } else if (Math.abs(d) <= STRIP_HALF_WIDTH) {
      st.result = {
        kind: "bolter",
        title: "BOLTER",
        detail: "Touched the deck but missed the wires. Go around.",
      };
      st.airborne = false;
    } else {
      fail(st, "DECK STRIKE", "Missed the landing area entirely. That will cost you a jet.");
    }
  }

  // runway touchdown (informational only)
  if (!st.result && hitRunway && st.airborne && touchdownVy > -6) {
    st.banner = {
      text: `TOUCHDOWN — ${Math.round(-touchdownVy * 196.85)} FPM`,
      until: st.time + 3,
    };
    st.airborne = false;
  }

  st.wheelPen = maxWheelPen;

  // Contact forces above are evaluated in world space; rotate the reaction
  // torque into the body frame (omega and the inertias are body-frame).
  return {
    contacts,
    kind,
    torqueBody: torque.lengthSq() > 0 ? torque.applyQuaternion(QINV2.copy(st.quat).invert()) : null,
  };
}

function fail(st: AircraftState, title: string, detail: string): void {
  st.result = { kind: "crash", title, detail };
  // The crash replay takes it from here: the jet stops answering the stick and
  // spirals down. A mid-air death starts the fall at once; an impact death
  // (terrain, ditching, a hard landing) is already at the surface, where the
  // engine detonates it immediately.
  st.crashFall = true;
  st.vel.multiplyScalar(0.85);
  if (!st.onGround) {
    st.vel.y = Math.min(st.vel.y, -25) - 18; // nose into the ground
    st.omega.set(1.15, 0.3, 0.85); // tumble
  } else {
    st.vel.multiplyScalar(0.25);
    st.omega.multiplyScalar(0.3);
  }
}
