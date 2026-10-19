// F-14 Tomcat flight model.
//
// Body frame (three.js convention): forward = -Z, up = +Y, right = +X.
// omega components: x = pitch rate (+ = nose up), y = yaw rate (+ = nose left),
// z = roll rate (+ = roll left). Moments follow the same axes.
//
// Fixed timestep integration. No Math.random inside the sim — buffet and
// other pseudo-random effects are derived from sim time, so runs are
// deterministic for identical inputs.

import { DEFAULT_BINDINGS, keyLabel, type Action } from "../settings";
import { Quaternion, Vector3 } from "three";
import { atmosphere } from "./atmosphere";
import { DEFAULT_AIRCRAFT, specFor, type AircraftId, type AircraftSpec } from "./aircraft";
import { clamp } from "./noise";
import { shipSpawn, stepSurfaceVessel } from "./surface";
import {
  CAT_START_ALONG,
  STRIP,
  airfield,
  carrierAt,
  carriers,
  deckAxes,
  deckSurfaceY,
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

// --- pitch: the stick points the nose, the elevator holds it there ---
// The elevator used to command a fixed alpha for each stick position, which is
// a permanent load factor: at any speed above the one that alpha trims to, a
// held stick pulled the jet into a climb that never ended (pull a little at
// cruise and it climbed and climbed until the stall broke it back down). Now the
// stick walks a commanded ATTITUDE (a rate command, integrated) and the
// elevator drives the nose to it. Centre the stick and that attitude is frozen,
// so the jet keeps the attitude it was pointed at instead of rotating on its
// own, and a stick nobody is holding can never loop it. Holding the attitude is
// also what restores speed stability: the alpha (attitude minus flight path)
// shrinks as the path rises, so the phugoid settles instead of wandering.
// This is NOT an autolevel: the wings are not levelled, no altitude is held and
// it does not fight the pilot — but static stability still drops the nose when
// the wing gives up at the stall.
const PITCH_RATE_MAX = 0.8; // rad/s: as fast as a full stick walks the nose
/**
 * Cap on the body pitch rate the elevator is asked for. It used to be the same
 * constant as the stick's attitude walk rate (0.8 rad/s), which quietly capped
 * how hard the wing could ever pull: the elevator could not command more rate
 * than the stick could walk, so alpha topped out around 11 deg and the Tomcat's
 * lift ceiling was never reached. The two are separate numbers now — the stick
 * still walks the reference at 0.8 rad/s, but the elevator answers with fighter
 * authority. /docs: scripts/diag-turnrate.ts pins the resulting turn rates.
 */
const PITCH_CMD_MAX = 1.5; // rad/s
const PITCH_ATT_GAIN = 7; // commanded rate per rad of attitude error, 1/s
const PITCH_RATE_GAIN = 1.1; // full elevator at this rate error, 1/(rad/s)
const PITCH_REF_LIMIT = 1.1; // rad (~63 deg): the reference cannot wind up
/** Elevator authority floor, as the dynamic pressure of a 95 m/s (~185 kt) flow.
 *  Control power scales with q, so without this the flare went mushy exactly
 *  where the pilot needs it most. Above that speed the aero does the work. */
const ELEV_Q_FLOOR = 0.5 * 1.225 * 95 * 95;
/** Trim rides the same command as a slow nose bias (rad/s at full trim). It
 *  bleeds back to centre when the pilot is not trimming, so a trim left wound
 *  up cannot leave the jet climbing by itself. */
const TRIM_RATE_BIAS = 0.07;
const TRIM_BLEED_TAU = 6; // s
// Pitch-rate damper (stability augmentation). It tightens the short period.
// Keep it modest: it adds to Cm_q, and a large Cm_q caps the alpha a sustained
// pull can hold (the damping grows with the very turn rate the elevator is
// trying to build), which flattens the turn. /docs: scripts/diag-turnrate.ts
// pins this.
//
// There is deliberately NO vertical-speed feedback here. An earlier build had
// a term proportional to absolute climb rate, meant to damp the phugoid; in
// practice it was a controller with no setpoint — every climb pushed the nose
// down and every descent pushed it up — so releasing the stick left the jet
// drifting to whatever attitude cancelled the term instead of settling.
// Static stability, the airframe's own rate damping and the elevator's rate
// loop are all that act on the nose, and none of them has an opinion about
// altitude: release the stick and the nose simply stops moving.
const SAS_Q = 10; // extra pitch-rate damping, per unit (w * c / 2V)
// Dihedral effect per rad sideslip. It must stay a FRACTION of aileron
// authority (clAil ≈ 0.055): the earlier 0.08 made a one-second rudder blip
// roll the jet harder than full aileron, which read as "the plane leans by
// itself" and left a long spiral after every rudder touch.
const CL_BETA = 0.018;
// Yaw damper: a swept wing's roll-yaw coupling gives a lightly damped dutch
// roll, which in the cockpit reads as the nose swinging side to side.
const YD_RATE = 2.0; // yaw-rate feedback
const YD_BETA = 2.2; // sideslip feedback (drives rudder to kill beta)
const CN_R = 2.5; // yaw damping per unit (w * b / 2V)
const CN_BETA = -0.12; // weathercock stability per rad (sign: beta>0 -> nose right)
const SWEEP_ROLL_LOSS = 0.35;
// Pedals. A keyboard pilot steers with the rudder: hold A/D and the nose (and
// the flight path) should come round; release and it should fly straight on the
// new heading. A bare rudder moment does neither — it leaves a sideslip that
// the weathercock and the yaw damper unwind, so the nose snaps back the moment
// the key comes up. So the pedal asks for a COORDINATED turn: a yaw rate that
// the flight path follows. The rate is capped by a lateral-acceleration budget,
// so a held pedal is an honest turn, not a skid, and it fades with speed.
const RUD_YAW_RATE = 0.35; // rad/s (~20 deg/s) at full pedal, low speed
const RUD_TURN_G = 1.6; // g: lateral-acceleration budget for the coordination

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

// --- the trap ---
/** How hard a jet may arrive before the gear gives way (m/s of sink, negative
 *  = descending). 15 m/s is ~2950 fpm. The 4 deg glideslope asks for about
 *  4.5 m/s at on-speed, so this is over three times the sink a flown approach
 *  produces — a sloppy, over-controlled, slightly slow arrival lands, and only
 *  an arrival the strut genuinely cannot take does not. Anything at or inside
 *  this lands; anything past it does not. */
export const HARD_SINK = -15;
/** Forward speed at which arriving stops being survivable (m/s), independent of
 *  sink. A jet that reaches the deck at 120 m/s (233 kt) is doing nearly twice
 *  a trap, and no amount of gentle descent makes that a landing: the tyres and
 *  the hook both have a limit, and this is it. */
export const IMPACT_SPEED = 120;
/** Gear contact during a mild bounce can still catch a wire. */
const TRAP_MAX_CLIMB = 3;

// --- approach guidance (the boat's own MEZ/IFLOLS, simulated) ---
/** The glideslope the landing area expects: 4 degrees, carrier approach reference. */
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
  /** The speed the approach is flown at (knots) in this configuration, at the
   *  jet's altitude. The answer to "what speed do I land this at?" */
  onSpeedKt: number;
  /** The angle of attack that goes with it (degrees) — the indexer's on-speed. */
  onSpeedAoaDeg: number;
}

/**
 * The landing configuration's on-speed: the level-flight speed the wing holds at
 * the approach alpha (80% of the stall) with gear and flaps down. It is what the
 * ball is flown at and what the touch-down sink comes from (4 deg of glide at
 * this speed is about 4.5 m/s of descent). Airframe-dependent, in knots.
 */
export function approachSpeed(
  spec: AircraftSpec,
  altM: number,
): { onSpeedKt: number; onSpeedAoaDeg: number } {
  const aoa = spec.alphaStall * 0.8;
  const cl = CL0 + spec.flapLift + spec.clAlpha * aoa;
  const rho = atmosphere(altM).rho;
  const v = Math.sqrt((spec.mass * GRAVITY) / (0.5 * rho * spec.sWing * cl));
  return { onSpeedKt: v * 1.94384, onSpeedAoaDeg: (aoa * 180) / Math.PI };
}

/**
 * Wing lift coefficient at an angle of attack (rad), with the stall falloff.
 * Shared by the flight model and by the turn spec below, so the ceiling the AI
 * flies to is literally the same curve the player's wing is on.
 */
export function liftCoeff(spec: AircraftSpec, alpha: number, flapLift = 0): number {
  const aAbs = Math.abs(alpha);
  if (aAbs <= spec.alphaStall) return CL0 + flapLift + spec.clAlpha * alpha;
  const peak = CL0 + flapLift + spec.clAlpha * spec.alphaStall;
  const fall = Math.max(0.35, 1 - 2.2 * (aAbs - spec.alphaStall));
  return Math.sign(alpha) * peak * fall;
}

/**
 * The most load factor the wing can pull at this speed and altitude: the lift
 * ceiling below corner speed, the airframe's structural limit above it. This is
 * the F-14's turn spec in one function. The player's wing and the Aggressor AI
 * both answer to it, so a bandit turns exactly as hard as the jet the pilot is
 * flying — the bandits' only remaining handicap is top speed.
 */
export function maxLoadFactor(spec: AircraftSpec, speed: number, altM: number): number {
  const q = 0.5 * atmosphere(altM).rho * speed * speed;
  const clMax = liftCoeff(spec, spec.alphaStall);
  const nLift = (q * spec.sWing * clMax) / (spec.mass * GRAVITY);
  return Math.max(1, Math.min(nLift, spec.gLimit));
}

/**
 * Max instantaneous turn rate (rad/s) at this speed and altitude for the
 * airframe. Zero below the speed where a level turn cannot yet pull 1 g over.
 */
export function maxTurnRate(spec: AircraftSpec, speed: number, altM: number): number {
  const v = Math.max(speed, 1);
  const n = maxLoadFactor(spec, v, altM);
  return (GRAVITY * Math.sqrt(Math.max(0, n * n - 1))) / v;
}

/**
 * Drag coefficient at a lift coefficient. Shared by the flight model and by the
 * energy limit below, so there is one drag curve in the project: induced drag
 * grows with CL^2, the speed brake and the gear add flat parasite drag, and a
 * stalled wing pays for its separation. The speed brake geometry is the pilot's
 * throttle for the glideslope — it has to hold a 700 kt dive at approach power —
 * which is why it more than doubles parasite drag when open.
 */
export function dragCoeff(
  spec: AircraftSpec,
  cl: number,
  mach: number,
  sweepN: number,
  gearT = 0,
  flapT = 0,
  sbT = 0,
  separation = 0,
): number {
  let cd = spec.cd0 - 0.004 * sweepN + spec.kInduced * (1 - 0.12 * sweepN) * cl * cl;
  cd += 0.018 * gearT + 0.045 * flapT + 0.24 * sbT + 0.5 * separation;
  if (mach > 0.88) {
    const t = clamp((mach - 0.88) / 0.17, 0, 1);
    cd += 0.045 * t * t * (3 - 2 * t);
  }
  return cd;
}

/**
 * The most load factor the airframe can hold in a level turn WITHOUT spending
 * energy: the point where the turn's drag is exactly covered by the thrust on
 * tap at this altitude (military power plus burner, which is what a fighter
 * fight is flown on). Below corner speed the wing's lift ceiling is the binding
 * number — there is nothing left to spend — and above it this one is, because
 * induced drag grows with the square of the load factor while thrust does not
 * grow at all.
 *
 * maxLoadFactor() is what the airframe can pull for a moment; this is what it
 * can hold. The Aggressor AI answers to this one, so a bandit cannot sit on a
 * rate the player's own jet would have to bleed speed to match.
 */
export function sustainedLoadFactor(spec: AircraftSpec, speed: number, altM: number): number {
  const atm = atmosphere(altM);
  const v = Math.max(speed, 1);
  const qS = 0.5 * atm.rho * v * v * spec.sWing;
  if (qS < 1) return 1;
  const mach = v / atm.soundSpeed;
  const sweepN = spec.sweepMax > spec.sweepMin ? clamp((mach - 0.3) / 0.7, 0, 1) : 0;
  const sigma = atm.rho / 1.225;
  // Optimization: Math.sqrt(sigma * Math.sqrt(sigma)) is bit-identical to
  // Math.pow(sigma, 0.75) but ~4.2x faster in JS engines.
  const sigma075 = Math.sqrt(sigma * Math.sqrt(sigma));
  const thrust =
    spec.thrustDry * sigma075 + spec.abThrust * Math.pow(sigma, 0.6);
  // Drag is cd0 + k * CL^2, so the load factor the thrust pays for comes
  // straight out of the square root of the leftover after parasite drag.
  const cl2 = (thrust / qS - dragCoeff(spec, 0, mach, sweepN)) /
    (spec.kInduced * (1 - 0.12 * sweepN));
  const nEnergy =
    cl2 <= 0 ? 1 : (Math.sqrt(cl2) * qS) / (spec.mass * GRAVITY);
  return Math.max(1, Math.min(nEnergy, maxLoadFactor(spec, v, altM)));
}

/** Turn rate (rad/s) the airframe can hold without bleeding speed. */
export function sustainedTurnRate(spec: AircraftSpec, speed: number, altM: number): number {
  const v = Math.max(speed, 1);
  const n = sustainedLoadFactor(spec, v, altM);
  return (GRAVITY * Math.sqrt(Math.max(0, n * n - 1))) / v;
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
  kind: "wire" | "bolter" | "crash" | "landing";
  wire?: number;
  title: string;
  detail: string;
}

export interface Banner {
  text: string;
  until: number; // sim time
}

export interface SubsystemDamage {
  engineL: number; // 0..1 (1 = healthy, < 1 = reduced thrust & yaw bias)
  engineR: number; // 0..1
  hydraulics: number; // 0..1 (< 1 = sluggish pitch/roll response)
  avionics: number; // 0..1 (< 1 = HUD/radar glitching)
  fuelLeak: boolean; // drains fuel over time
  fuelPct: number; // 0..100
}

export interface LsoSample {
  rangeM: number;
  devM: number;
  lineupM: number;
  aoaErr: number;
}

export interface LsoGrade {
  grade: "OK" | "(OK)" | "---" | "C" | "B";
  wire?: number;
  points: number;
  summary: string;
  samples: LsoSample[];
}

export interface AircraftState {
  // the airframe being flown (mass, aero, thrust, ordnance)
  spec: AircraftSpec;

  // integration state
  pos: Vector3;
  vel: Vector3;
  quat: Quaternion;
  omega: Vector3; // body rates (x pitch, y yaw, z roll)
  turretYaw?: number;
  turretPitch?: number;

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
  /** Commanded pitch attitude (rad). The stick walks it, the elevator holds
   *  the nose on it; it only moves when the pilot asks. See PITCH_RATE_MAX. */
  pitchRef: number;
  /** Commanded roll attitude (rad, + = left bank). Rotary wing only: the cyclic
   *  walks it and the rotor disc tilts with it, which is how a helicopter
   *  translates. Fixed-wing types leave it at zero. */
  rollRef: number;
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
  deckRoll?: number; // carrier index while rolling toward the wires
  runwayLanded?: boolean;
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

  // weather & subsystem immersion
  windX?: number;
  windZ?: number;
  turbulence?: number;
  subsystems?: SubsystemDamage;
  lsoSamples?: LsoSample[];
  lsoGrade?: LsoGrade | null;
  lsoCall?: string | null;

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

/**
 * Where a finished sortie ended, as the launch point for the next one. Read off
 * the surface under the jet, not off the mission it started with: land on
 * another boat and that deck becomes home. Returns null when the sortie did not
 * end on a deck or the runway (a mid-air death, say), which leaves the caller's
 * launch point alone.
 */
export function recoveryLaunchPoint(
  st: AircraftState,
  currentCarrier: number,
): { kind: MissionKind; carrier: number } | null {
  if (st.result?.kind === "crash") return null;
  if (st.groundKind === "runway") return { kind: "airfield", carrier: currentCarrier };
  if (st.groundKind !== "deck") return null;
  const boat = carrierAt(st.pos.x, st.pos.z) ?? nearestCarrier(st.pos.x, st.pos.z);
  const idx = carriers().indexOf(boat);
  return { kind: "carrier", carrier: idx >= 0 ? idx : currentCarrier };
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
  if (st.spec.rotorcraft || st.onGround || st.result) return null;
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
  const speed = approachSpeed(st.spec, st.pos.y);
  return {
    rangeM,
    deviationM: st.pos.y - pathY,
    lineupM: d,
    carrier: c,
    onSpeedKt: speed.onSpeedKt,
    onSpeedAoaDeg: speed.onSpeedAoaDeg,
  };
}

export function spawnAircraft(
  mission: MissionKind,
  carrierIndex = 0,
  aircraft: AircraftId = DEFAULT_AIRCRAFT,
  bindings: Record<Action, string> = DEFAULT_BINDINGS,
): AircraftState {
  const spec = specFor(aircraft);
  const fleet = carriers();
  const idx = Math.max(0, Math.min(carrierIndex, fleet.length - 1));
  const af = airfield();
  let pos: Vector3;
  let quat: Quaternion;
  let catPhase: CatPhase = "idle";
  const ride = rideHeight(spec);
  const rotor = spec.rotorcraft === true;

  // Spawn at the static ride height so the jet starts settled on its gear
  // instead of dropping onto it.
  if (spec.surfaceVessel) {
    pos = shipSpawn(idx);
    quat = headingQuat(fleet[idx].headingDeg);
  } else if (mission === "carrier") {
    const cat = catTrack(fleet[idx]);
    pos = cat.start.clone();
    pos.y = fleet[idx].deckY + ride;
    quat = headingQuat(fleet[idx].headingDeg);
    // A helicopter does not need the catapult: it lifts off the spot.
    catPhase = rotor ? "idle" : "ready";
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
    turretYaw: spec.surfaceVessel ? 0 : undefined,
    turretPitch: spec.surfaceVessel ? .2 : undefined,
    throttle: 0,
    rpm: 0.05,
    abOn: false,
    abLevel: 0,
    gearDown: !spec.surfaceVessel,
    gearT: spec.surfaceVessel ? 0 : 1,
    flapsDown: !rotor && !spec.surfaceVessel,
    flapT: rotor || spec.surfaceVessel ? 0 : 1,
    speedbrake: false,
    sbT: 0,
    brakeOn: false,
    trim: 0.5,
    pitchRef: 0,
    rollRef: 0,
    sweepT: 0,
    sweep: spec.sweepMin,
    speed: 0,
    mach: 0,
    alpha: 0,
    gLoad: 1,
    vspeed: 0,
    headingDeg: spec.surfaceVessel || mission === "carrier" ? fleet[idx].headingDeg : af.headingDeg,
    stalled: false,
    onGround: !spec.surfaceVessel,
    groundKind: spec.surfaceVessel ? "water" : mission === "carrier" ? "deck" : "runway",
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
    subsystems: {
      engineL: 1,
      engineR: 1,
      hydraulics: 1,
      avionics: 1,
      fuelLeak: false,
      fuelPct: 100,
    },
    lsoSamples: [],
    lsoGrade: null,
    lsoCall: null,
    banner: spec.surfaceVessel
      ? { text: `DESTROYER BETA — ${keyLabel(bindings.throttleUp)}/${keyLabel(bindings.throttleDown)} ENGINES · ${keyLabel(bindings.yawLeft)}/${keyLabel(bindings.yawRight)} HELM · ARROWS AIM · ${keyLabel(bindings.bomb)} GUN SIGHT`, until: 30 }
      : rotor
      ? {
          text:
            mission === "carrier"
              ? `CARRIER ${fleet[idx].name} — COLLECTIVE UP (${keyLabel(bindings.throttleUp)}) TO LIFT OFF`
              : `COLLECTIVE UP (${keyLabel(bindings.throttleUp)}) TO LIFT — ${keyLabel(bindings.pitchUp)} FLIES FORWARD`,
          until: 30,
        }
      : mission === "carrier"
        ? { text: `CARRIER ${fleet[idx].name} — THROTTLE (${keyLabel(bindings.throttleUp)}) TO FULL — HOLD ${keyLabel(bindings.cat)} — CLIMB (${keyLabel(bindings.pitchUp)})`, until: 30 }
        : { text: `THROTTLE UP (${keyLabel(bindings.throttleUp)}) — ROTATE (${keyLabel(bindings.pitchUp)}) AT 150 KT`, until: 30 },
    prevPos: pos.clone(),
    prevQuat: quat.clone(),
  };
}

/** Carry a deck-relative pose through ship translation, yaw and swell. */
export function carryDeckPose(pos: Vector3, quat: Quaternion, before: CarrierDef, after: CarrierDef, vel?: Vector3): void {
  const [along, across] = worldToDeck(before, pos.x, pos.z);
  const wasY = deckSurfaceY(before, pos.x, pos.z);
  const { fwd, right } = deckAxes(after.headingDeg);
  pos.x = after.x + fwd[0] * along + right[0] * across;
  pos.z = after.z + fwd[1] * along + right[1] * across;
  // Ride the swell: a deck that heaves lifts what is parked on it, so the jet
  // keeps its deck-relative height through a rolling ship.
  pos.y += deckSurfaceY(after, pos.x, pos.z) - wasY;
  const yaw = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -(after.headingDeg - before.headingDeg) * Math.PI / 180);
  quat.premultiply(yaw);
  vel?.applyQuaternion(yaw);
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
  if (st.spec.surfaceVessel) { if (!st.result) stepSurfaceVessel(st, inp, dt); return; }
  st.time += dt;
  st.flightTime += dt;

  // --- systems ---
  if (inp.throttleUp) st.throttle = clamp(st.throttle + dt * 0.5, 0, 1);
  if (inp.throttleDown) st.throttle = clamp(st.throttle - dt * 0.5, 0, 1);
  // Trim walks the nose at a slow rate while held (see TRIM_RATE_BIAS) and
  // bleeds back to centre when it is not, so a forgotten trim cannot leave the
  // jet climbing on its own.
  if (inp.trimUp) st.trim = clamp(st.trim + dt * 0.35, 0, 1);
  else if (inp.trimDown) st.trim = clamp(st.trim - dt * 0.35, 0, 1);
  else st.trim += (0.5 - st.trim) * (1 - Math.exp(-dt / TRIM_BLEED_TAU));
  st.brakeOn = inp.brake || st.catPhase === "ready" || st.catPhase === "charging";

  const rpmTau = st.throttle > st.rpm ? 1.2 : 1.8;
  st.rpm += (st.throttle - st.rpm) * (1 - Math.exp(-dt / rpmTau));
  // No burner on the bomber: the AB toggle simply does nothing there.
  const abTarget = st.abOn && st.throttle > 0.9 && st.spec.abThrust > 0 ? 1 : 0;
  st.abLevel += (abTarget - st.abLevel) * (1 - Math.exp(-dt / 0.5));

  st.gearT = clamp(st.gearT + (st.gearDown ? dt / 1.8 : -dt / 1.8), 0, 1);
  st.flapT = clamp(st.flapT + (st.flapsDown ? dt / 2.2 : -dt / 2.2), 0, 1);
  st.sbT = clamp(st.sbT + (st.speedbrake ? dt / 0.9 : -dt / 0.9), 0, 1);

  // --- rotary wing: a different machine, a different model (stepRotorcraft) ---
  if (st.spec.rotorcraft) {
    stepRotorcraft(st, inp, dt);
    return;
  }

  // --- catapult sequence ---
  if (st.catPhase === "ready" && inp.catHold && (st.throttle < .9 || st.rpm < .85)) {
    st.banner = { text: "CATAPULT WAITING — FULL THROTTLE & ENGINE POWER REQUIRED", until: st.time + 2 };
  }
  if (st.catPhase === "ready" && inp.catHold && st.throttle >= .9 && st.rpm >= .85) {
    st.catPhase = "charging";
    st.catProgress = 0;
  }
  if (st.catCooldown > 0) st.catCooldown -= dt;
  if (st.catPhase === "charging") {
    st.catProgress = clamp(st.catProgress + dt / 0.9, 0, 1);
    if (!inp.catHold || st.throttle < .9 || st.rpm < .85) {
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
    // The launch rotates the jet: the commanded attitude rides with it, so the
    // bridle-off attitude is the one the jet holds as it leaves the deck.
    st.pitchRef = 0.105 * rise;
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
  const vBody = VBODY.copy(st.vel);
  if (!st.onGround && (st.windX || st.windZ)) {
    vBody.x -= st.windX ?? 0;
    vBody.z -= st.windZ ?? 0;
  }
  vBody.applyQuaternion(qInv);
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
  // Pitch attitude: what the pitch command holds the nose on (see PITCH_RATE_MAX).
  const pitchAtt = Math.asin(clamp(BFWD.y, -1, 1));

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
    const qS = qbar * spec.sWing;

    // Lift with the stall falloff, then the structural ceiling: the wing can
    // never deliver more than the airframe's limit load factor, however hard the
    // stick is pulled. This is the same ceiling maxLoadFactor() publishes, so
    // the pilot's wing and the Aggressor AI stop pulling at exactly the same g.
    const clLimit = (spec.gLimit * spec.mass * GRAVITY) / Math.max(qS, 1e-3);
    const CL = clamp(liftCoeff(spec, alpha, flapLift), -clLimit, clLimit);
    const sep = Math.max(0, aAbs - spec.alphaStall);

    // drag — dragCoeff() is shared with the turn spec below, so the ceiling the
    // AI flies to comes off the same curve the pilot's wing is on.
    const CD = dragCoeff(spec, CL, st.mach, sweepN, st.gearT, st.flapT, st.sbT, sep);
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

    // Elevator + pitch damper authority gets a floor at low speed (the flare),
    // while static stability stays physical: it is the wing's answer, not the
    // pilot's, and it is what drops the nose at the stall.
    const qScCtrl = Math.max(qSc, ELEV_Q_FLOOR * spec.sWing * cM);
    const qHat = (st.omega.x * cM) / (2 * Math.max(V, 30));
    const hydAuth = st.subsystems ? 0.45 + 0.55 * st.subsystems.hydraulics : 1;
    // 1. the stick (and the trim wheel) walks the commanded attitude
    st.pitchRef +=
      inp.pitch * PITCH_RATE_MAX * hydAuth * (st.gearT > .8 && st.flapT > .8 && V < 135 ? .32 : 1) * clamp(110 / Math.max(V, 110), 0.42, 1) * dt;
    st.pitchRef += (st.trim - 0.5) * TRIM_RATE_BIAS * dt;
    const path = Math.asin(clamp(st.vel.y / Math.max(V, 1), -1, 1));
    // The reference may never sit past the stall, or chasing it would hold the
    // nose up in a deep stall. The limit rides the flight path, so a stall that
    // drops the nose drags the reference down with it.
    // ...and never past the airframe's structural limit. The alpha that would
    // pull gLimit shrinks as dynamic pressure rises, so this is what keeps a
    // fast Tomcat from commanding a 12 g attitude it was never built to hold —
    // exactly the ceiling maxLoadFactor() reports, so the AI cannot out-pull
    // the player by construction.
    const alphaGLimit = (clLimit - CL0 - flapLift) / spec.clAlpha;
    // The clamp names an angle of attack, but the reference is an ATTITUDE, and
    // the elevator cannot hold an attitude for free: the standing deflection a
    // pull needs is asked for as a little more pitch rate than the nose is
    // carrying, and the attitude error is what asks for it. So the wing flies a
    // few degrees UNDER the ceiling this clamp names — at 230 m/s a full pull
    // settled at 12 deg alpha and 5.2 g against the 18 deg / 7.5 g this line
    // publishes. The structural branch therefore carries that standing error, so
    // the alpha the wing actually reaches is the one whose lift is gLimit:
    //   qCmd = omega + elevatorHold / PITCH_RATE_GAIN,  so  attErr = qCmd / PITCH_ATT_GAIN
    // with elevatorHold the deflection that balances the wing's own nose-down
    // moment and its rate damping at the target alpha.
    // Overshooting is harmless: the wing's own CL clamp caps the lift at gLimit
    // whatever the pilot asks for, and the alpha limiter below still bites.
    // The stall branch is deliberately left alone — alphaStall * 1.25 is a
    // buffer for the nose drop, not a g ceiling, and asking the wing for alpha
    // past the lift peak buys less lift, not more.
    const qHatHold = Math.abs(qHat);
    const elevHold =
      (Math.abs(CM_ALPHA) * Math.min(alpha, spec.alphaStall) +
        (spec.cmQ + SAS_Q) * qHatHold) / spec.cmElev;
    const droop = clamp(
      (Math.abs(st.omega.x) + Math.max(0, elevHold) / PITCH_RATE_GAIN) / PITCH_ATT_GAIN,
      0,
      spec.alphaStall,
    );
    const alphaUp = Math.min(spec.alphaStall * 1.25, alphaGLimit + droop);
    st.pitchRef = clamp(
      st.pitchRef,
      Math.max(-PITCH_REF_LIMIT, path - spec.alphaStall * 1.4),
      Math.min(PITCH_REF_LIMIT, path + alphaUp),
    );
    // 2. the elevator drives the nose to it: attitude error asks for a rate,
    //    the airframe's own rate damping (below) holds the short period.
    let qCmd = clamp(
      PITCH_ATT_GAIN * (st.pitchRef - pitchAtt),
      -PITCH_CMD_MAX,
      PITCH_CMD_MAX,
    );
    // AoA limiter: past the buffer the tail can no longer keep pulling, which is
    // what still lets a stall drop the nose even with the stick held back.
    if (qCmd > 0) {
      qCmd *= clamp((spec.alphaStall * 1.25 - alpha) / (spec.alphaStall * 0.45), 0, 1);
    }
    const elev = clamp(PITCH_RATE_GAIN * (qCmd - st.omega.x), -1, 1) * (st.stalled ? 0.7 : 1);
    M.x +=
      qSc * CM_ALPHA * alpha +
      qScCtrl * (spec.cmElev * elev - (spec.cmQ + SAS_Q) * qHat);
    M.z +=
      qSb *
      (CL_BETA * beta -
        spec.clAil * rollAuth * hydAuth * inp.roll -
        spec.clP * ((st.omega.z * bM) / (2 * Math.max(V, 30))));
    // --- pedals: a coordinated turn, not a bare sideslip ---
    // The pedal commands a yaw RATE; the deflection that holds it is
    // feed-forward from the same constants the airframe uses, so the nose comes
    // round at the asked-for rate instead of wallowing into a slip.
    const rudRateMax = Math.min(RUD_YAW_RATE, (RUD_TURN_G * GRAVITY) / Math.max(V, 60));
    const rudRate = clamp(inp.yaw, -1, 1) * rudRateMax; // + = nose right
    const rudFF = clamp((rudRate * CN_R * bM) / (spec.cnRud * 2 * Math.max(V, 30)), -1, 1);
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
        spec.cnRud * (rudFF + yawDamper) -
        CN_R * ((st.omega.y * bM) / (2 * Math.max(V, 30))));
    // Turn coordination: while the pedal is held the flight path curves with
    // the nose (the centripetal force along the wing, bounded by the g budget
    // above), so sideslip never builds and there is nothing left for the
    // weathercock to snap back on release.
    if (Math.abs(rudRate) > 1e-4) F.x += spec.mass * V * rudRate;

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

  // --- thrust & subsystem asymmetries ---
  const sub = st.subsystems;
  if (sub && sub.fuelLeak && !st.onGround) {
    sub.fuelPct = Math.max(0, sub.fuelPct - dt * 0.45);
  }
  const engScale = sub ? (sub.fuelPct <= 0 ? 0 : 0.5 * (sub.engineL + sub.engineR)) : 1;
  const engDiff = sub && sub.fuelPct > 0 ? sub.engineL - sub.engineR : 0; // + = left stronger -> yaw right (-M.y)
  const sigma = atm.sigma;
  let thrust = spec.idleThrust + (spec.thrustDry - spec.idleThrust) * st.rpm;
  // Optimization: Math.sqrt(sigma * Math.sqrt(sigma)) is bit-identical to
  // Math.pow(sigma, 0.75) but ~4.2x faster in JS engines.
  thrust *= Math.sqrt(sigma * Math.sqrt(sigma)) * engScale;
  if (st.abLevel > 0.01) thrust += spec.abThrust * st.abLevel * Math.pow(sigma, 0.6) * engScale;
  if (st.crashFall) thrust = 0; // the engines are gone
  F.z -= thrust; // body forward is -Z
  // One engine weaker than the other yaws and rolls the jet: a real asymmetric
  // thrust case needs rudder and aileron to hold a heading, which is exactly
  // what a battle-damaged Tomcat is like.
  if (Math.abs(engDiff) > 0.01 && !st.onGround && !st.crashFall) {
    M.y -= engDiff * thrust * 0.22;
    M.z -= engDiff * thrust * 0.14;
  }
  if (st.turbulence && st.turbulence > 0 && !st.onGround && !st.crashFall) {
    const tb = st.turbulence;
    M.x += spec.iPitch * tb * 0.16 * Math.sin(st.time * 4.3);
    M.z += spec.iRoll * tb * 0.35 * Math.cos(st.time * 5.7);
  }

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
  holdOnDeck(st);

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

  // --- LSO approach telemetry & Paddles callouts ---
  updateLsoApproach(st);
}

function updateLsoApproach(st: AircraftState): void {
  if (st.spec.rotorcraft) return;
  if (st.result?.kind === "wire" && !st.lsoGrade) {
    st.lsoGrade = evaluateLsoGrade(st.lsoSamples ?? [], st.wire ?? 3);
    st.lsoCall = `TRAPPED WIRE ${st.wire ?? 3} — GRADE ${st.lsoGrade.grade}`;
    return;
  }
  if (st.onGround || st.result) {
    st.lsoCall = null;
    return;
  }
  const g = glideStateFor(st);
  if (!g || g.rangeM > 2200) {
    st.lsoCall = null;
    if (st.lsoSamples && st.lsoSamples.length > 0 && (!g || g.rangeM > 2800)) st.lsoSamples.length = 0;
    return;
  }
  const samples = st.lsoSamples ?? (st.lsoSamples = []);
  const aoaErr = st.alpha * (180 / Math.PI) - g.onSpeedAoaDeg;
  if (samples.length === 0 || samples[samples.length - 1].rangeM - g.rangeM >= 45) {
    samples.push({ rangeM: g.rangeM, devM: g.deviationM, lineupM: g.lineupM, aoaErr });
    if (samples.length > 48) samples.shift();
  }
  if (!st.gearDown || st.gearT < 0.8) {
    st.lsoCall = "PADDLES: CHECK GEAR DOWN!";
  } else if (g.deviationM < -14 && g.rangeM < 900) {
    st.lsoCall = "PADDLES: POWER! POWER! LOW IN THE GROOVE";
  } else if (g.deviationM < -7) {
    st.lsoCall = "PADDLES: LITTLE LOW — ADD POWER";
  } else if (g.deviationM > 14) {
    st.lsoCall = "PADDLES: YOU'RE HIGH — EASY ON THE NOSE";
  } else if (Math.abs(g.lineupM) > 14) {
    st.lsoCall = g.lineupM > 0 ? "PADDLES: COME LEFT FOR LINEUP" : "PADDLES: RIGHT FOR LINEUP";
  } else if (Math.abs(aoaErr) > 2.2) {
    st.lsoCall = aoaErr > 0 ? "PADDLES: SLOW — ADD POWER" : "PADDLES: FAST — WORK IT ON SPEED";
  } else {
    st.lsoCall = "PADDLES: ROGER BALL — KEEP IT COMING";
  }
}

export function evaluateLsoGrade(samples: LsoSample[], wire: number): LsoGrade {
  if (samples.length === 0) {
    return {
      grade: wire === 3 ? "OK" : "(OK)",
      wire,
      points: wire === 3 ? 4 : 3,
      summary: `Caught #${wire} wire.`,
      samples: [],
    };
  }
  let avgDev = 0;
  let avgLine = 0;
  for (const s of samples) {
    avgDev += Math.abs(s.devM);
    avgLine += Math.abs(s.lineupM);
  }
  avgDev /= samples.length;
  avgLine /= samples.length;
  if (avgDev < 6 && avgLine < 6 && (wire === 2 || wire === 3)) {
    return {
      grade: "OK",
      wire,
      points: 4,
      summary: `OK ${wire}-WIRE — Textbook rails pass in the groove (±${avgDev.toFixed(1)}m slope, ±${avgLine.toFixed(1)}m lineup).`,
      samples: [...samples],
    };
  }
  if (avgDev < 13 && avgLine < 12) {
    return {
      grade: "(OK)",
      wire,
      points: 3,
      summary: `FAIR (OK) ${wire}-WIRE — Reasonable corrections (±${avgDev.toFixed(1)}m slope, ±${avgLine.toFixed(1)}m lineup).`,
      samples: [...samples],
    };
  }
  return {
    grade: "---",
    wire,
    points: 2,
    summary: `NO GRADE ${wire}-WIRE — Safe aboard, rough groove (±${avgDev.toFixed(1)}m slope, ±${avgLine.toFixed(1)}m lineup).`,
    samples: [...samples],
  };
}

// ---------------------------------------------------------------------------
// Rotary wing
//
// A helicopter is not a wing with a throttle. The collective (the throttle
// axis) sets the rotor's total thrust along the mast; the cyclic (pitch/roll)
// walks a COMMANDED pitch/roll attitude that an attitude-hold loop flies to;
// and the pedals command a yaw rate from the tail rotor. Because the rotor
// thrust points along the body's up axis, tilting the airframe is what makes
// the machine accelerate horizontally — the same physics that makes a real
// helicopter need a nose-down attitude to go forward. Hovering is the level
// equilibrium where rotor thrust equals weight.
//
// The model is deliberately an attitude-command controller rather than a torque
// model: a helicopter is statically unstable about pitch and roll, and asking a
// keyboard pilot to constantly correct a divergent airframe is not fun. Tapping
// the cyclic sets an attitude the machine holds, so "tap forward twice and
// cruise" is the whole flight technique.
// ---------------------------------------------------------------------------

/** Maximum commanded nose-up/nose-down attitude, rad (about 23 deg). */
const HELI_MAX_TILT = 0.4;
/** Maximum commanded bank, rad (about 50 deg) — a steep, and still usable,
 *  helicopter turn. The old 40 deg stop was reached in under two seconds, after
 *  which the roll input read as dead. */
const HELI_MAX_BANK = 0.87;
/** How fast the cyclic walks the commanded attitude, rad/s. */
const HELI_CYCLIC_RATE = 0.9;
/** Attitude error to commanded body rate, 1/s. */
const HELI_ATT_GAIN = 3.0;
const HELI_PITCH_RATE_MAX = 0.95; // rad/s
const HELI_ROLL_RATE_MAX = 1.6; // rad/s
const HELI_YAW_RATE = 0.95; // rad/s from full pedal
const HELI_RATE_TAU = 0.26; // s: rate-loop time constant
/**
 * Parasite drag area, m^2. On a real helicopter it is the disc, not the
 * airframe, that ends the speed run — retreating-blade stall and power limits —
 * so this stands in for both: it sizes full forward cyclic to settle near the
 * type's never-exceed speed. At the old 3.1 m^2 the machine wound up past
 * 190 m/s, and since a fixed bank turns at g·tan(bank)/V, that runaway speed is
 * what made a held turn fade away to nothing.
 */
const HELI_DRAG_AREA = 12;
/** Speed above which the fin and tail rotor do anything, m/s. */
const HELI_TRACK_VMIN = 8;
/** Airspeed floor for the coordinated-turn rate, m/s (a hover has no turn). */
const HELI_COORD_VFLOOR = 16;
/** Slip angle to yaw rate, 1/s: how hard the nose chases the flight path. A
 *  first-order loop, so it settles with a residual slip of about turn/gain. */
const HELI_TRACK_GAIN = 3.0;
/** Cap on the turn coordination the model flies for the pilot at full speed,
 *  rad/s. A fin's authority scales with dynamic pressure, so the cap is scaled
 *  down with speed below HELI_TRACK_VREF — that is what stops a slow sideways
 *  slide from being snapped straight the moment it is noticed. */
const HELI_TRACK_YAW_MAX = 0.8;
/** Speed at which the fin has full authority for the coordination, m/s. */
const HELI_TRACK_VREF = 30;

/** Dedicated scratch: applyGroundContact() owns UPF, so the rotor's up axis
 *  needs its own vectors. */
const HUP = new Vector3();
const HRT = new Vector3();

function stepRotorcraft(st: AircraftState, inp: FlightInput, dt: number): void {
  const sub = st.subsystems;
  if (sub?.fuelLeak) sub.fuelPct = Math.max(0, sub.fuelPct - dt * 0.45);
  const enginePower = sub ? (sub.fuelPct <= 0 ? 0 : (sub.engineL + sub.engineR) * 0.5) : 1;
  const hydraulicAuthority = sub ? 0.45 + 0.55 * sub.hydraulics : 1;
  const spec = st.spec;
  const atm = atmosphere(st.pos.y);

  // --- attitude command (cyclic) ---
  HUP.set(0, 1, 0).applyQuaternion(st.quat);
  BFWD.set(0, 0, -1).applyQuaternion(st.quat);
  HRT.set(1, 0, 0).applyQuaternion(st.quat);
  const pitchAtt = Math.asin(clamp(BFWD.y, -1, 1));
  const rollAtt = Math.asin(clamp(HRT.y, -1, 1));
  // The fore/aft cyclic reads REVERSED from the fixed-wing stick: up arrow
  // tilts the disc forward (accelerate), down arrow tilts it back (slow, then
  // reverse). A helicopter pilot asking for "up" wants to go that way, and the
  // winged convention — up arrow drops the tail, so the nose rises — would fly
  // the machine backwards instead.
  const fore = -inp.pitch;
  // On the ground the cyclic is lazy and self-centres, so the machine does not
  // lean on its stops while parked; in the air it holds whatever is commanded.
  const auth = (st.onGround ? 0.35 : 1) * hydraulicAuthority;
  st.pitchRef = clamp(
    st.pitchRef + fore * HELI_CYCLIC_RATE * auth * dt,
    -HELI_MAX_TILT,
    HELI_MAX_TILT,
  );
  st.rollRef = clamp(
    st.rollRef - inp.roll * HELI_CYCLIC_RATE * auth * dt,
    -HELI_MAX_BANK,
    HELI_MAX_BANK,
  );
  if (st.onGround) {
    st.pitchRef += (0 - st.pitchRef) * (1 - Math.exp(-dt / 1.2));
    st.rollRef += (0 - st.rollRef) * (1 - Math.exp(-dt / 1.2));
  }
  const qCmd = clamp(HELI_ATT_GAIN * (st.pitchRef - pitchAtt), -HELI_PITCH_RATE_MAX, HELI_PITCH_RATE_MAX);
  const pCmd = clamp(HELI_ATT_GAIN * (st.rollRef - rollAtt), -HELI_ROLL_RATE_MAX, HELI_ROLL_RATE_MAX);
  let yCmd = -inp.yaw * HELI_YAW_RATE * hydraulicAuthority; // omega.y + = nose left

  // --- turn coordination: the nose goes where the bank takes it ---
  // Banking tilts the disc and the flight path curves with it; the fin and the
  // tail rotor are what bring the NOSE round to follow. Without that the machine
  // slides down its own fuselage — the path turns while the heading never does,
  // so a held bank stopped looking like a turn a couple of seconds in and the
  // compass froze wherever it was. A real pilot trims this out with the pedals,
  // and the pedals stay theirs: this only flies the part they would have had to
  // hold, and only once there is airflow over the fin to make it mean anything.
  // The test is on the TOTAL horizontal speed, not on the speed along the nose:
  // a machine held in a bank early on is sliding almost entirely sideways, so
  // gating on the forward component sat this out through exactly the first
  // seconds of the turn. Backing up (velocity behind the nose) is left to the
  // pedals — there is no fin-driven answer to that one either.
  const vHoriz = Math.hypot(st.vel.x, st.vel.z);
  const vFwd = st.vel.x * BFWD.x + st.vel.z * BFWD.z;
  if (vHoriz > HELI_TRACK_VMIN && vFwd > 0) {
    const vRight = st.vel.x * HRT.x + st.vel.z * HRT.z;
    // + = drifting right of the nose; the nose-to-path angle is the whole
    // story sideways, and floors at 1 m/s so a pure slide reads as 90 deg.
    const slip = Math.atan2(vRight, Math.max(vFwd, 1));
    // A fixed bank turns the path at g·tan(bank)/V; ask the nose for the same
    // rate up front, then take out whatever slip is left over.
    const turn = (GRAVITY * Math.tan(rollAtt)) / Math.max(vHoriz, HELI_COORD_VFLOOR);
    const cap = HELI_TRACK_YAW_MAX * clamp(vHoriz / HELI_TRACK_VREF, 0.15, 1);
    yCmd += clamp(turn - slip * HELI_TRACK_GAIN, -cap, cap);
  }
  const k = 1 - Math.exp(-dt / HELI_RATE_TAU);
  st.omega.x += (qCmd - st.omega.x) * k;
  st.omega.z += (pCmd - st.omega.z) * k;
  st.omega.y += (yCmd - st.omega.y) * k;

  // --- collective: the lever, not a jet throttle ---
  // A helicopter's primary control is the collective, and the governor holds
  // rotor RPM for it: there is no 2-second spool to sit through. Flying the
  // model off the jet's throttle ramp made every height change lag the key by
  // seconds, which is unflyable in a hover. `rpm` doubles as the collective
  // fraction the rotor model reads (and the HUD's throttle bar shows).
  const collRate = 1.1; // fraction per second of collective travel
  if (inp.throttleUp) st.rpm = clamp(st.rpm + collRate * dt, 0, 1);
  if (inp.throttleDown) st.rpm = clamp(st.rpm - collRate * dt, 0, 1);
  st.throttle = st.rpm;
  // Skids, not retractable gear: the lever does nothing and the machine is
  // always ready to set down.
  st.gearDown = true;
  st.gearT = 1;
  st.flapsDown = false;
  st.flapT = 0;

  // --- rotor thrust (collective) ---
  const coll = st.rpm;
  let thrust = (spec.idleThrust + (spec.thrustDry - spec.idleThrust) * coll) * atm.sigma * enginePower;
  if (st.crashFall) thrust = 0;

  // --- forces (world): rotor along body up, gravity, parasite drag ---
  const acc = FF.set(HUP.x * thrust, HUP.y * thrust - spec.mass * GRAVITY, HUP.z * thrust);
  const V = st.vel.length();
  if (V > 0.4) {
    const D = 0.5 * atm.rho * HELI_DRAG_AREA * V * V;
    acc.addScaledVector(st.vel, -D / V);
  }

  // --- ground contact, integration, ground reaction (shared with every type) ---
  const ground = applyGroundContact(st, dt, inp, acc, spec);
  st.vel.addScaledVector(acc, dt / spec.mass);
  st.pos.addScaledVector(st.vel, dt);
  holdOnDeck(st);

  st.quat
    .multiply(DQ.set(st.omega.x * dt * 0.5, st.omega.y * dt * 0.5, st.omega.z * dt * 0.5, 1).normalize())
    .normalize();

  if (ground.contacts > 0) {
    if (ground.torqueBody) {
      st.omega.x += (ground.torqueBody.x / spec.iPitch) * dt;
      st.omega.y += (ground.torqueBody.y / spec.iYaw) * dt;
      st.omega.z += (ground.torqueBody.z / spec.iRoll) * dt;
    }
    // The tyres bite: settle the attitude instead of letting the rate loop
    // fight the springs.
    st.omega.multiplyScalar(Math.exp(-dt * 2.5));
  }

  // --- derived state ---
  st.speed = st.vel.length();
  st.mach = st.speed / atm.soundSpeed;
  st.vspeed = st.vel.y;
  BFWD.set(0, 0, -1).applyQuaternion(st.quat);
  st.headingDeg = ((Math.atan2(BFWD.x, -BFWD.z) * 180) / Math.PI + 360) % 360;
  st.alpha = 0;
  st.stalled = false;
  st.sweepT = 0;
  st.sweep = spec.sweepMin;
  st.gLoad = st.onGround
    ? 1
    : (thrust * HUP.y) / Math.max(spec.mass * GRAVITY, 1);
  st.onGround = ground.contacts > 0;
  st.groundKind = ground.kind;
  if (st.onGround) st.airborne = false;
  else if (st.pos.y > groundRef(st) + 2.5 && st.flightTime > 1) st.airborne = true;
}

function groundRef(st: AircraftState): number {
  return groundAt(st.pos.x, st.pos.z).y;
}

/**
 * The boat is a floor, not a cliff. A jet that arrived with its gear down and
 * is rolling out does not get to drive over the side and drown: the deck edge
 * is a rail. Only the outward part of the velocity is taken off, so the jet
 * still rolls along the edge the way friction would leave it, instead of
 * stopping dead the moment it is reached.
 */
const ON_DECK_MARGIN = 0.05; // metres inside the hull edge the roll is stopped at

function holdOnDeck(st: AircraftState): void {
  if (st.deckRoll === undefined) return;
  const c = carriers()[st.deckRoll];
  if (!c) return;
  const [along, across] = worldToDeck(c, st.pos.x, st.pos.z);
  // The limit is pulled in by a hair: clamping to the exact edge puts the jet
  // back on a boundary that carrierAt() then reads as *off* the boat on the
  // next round-trip through the float, which is the whole bug in miniature.
  const hl = c.deckLength / 2 - ON_DECK_MARGIN;
  const hw = c.deckWidth / 2 - ON_DECK_MARGIN;
  const clampedA = clamp(along, -hl, hl);
  const clampedC = clamp(across, -hw, hw);
  if (clampedA === along && clampedC === across) return;

  const { fwd, right } = deckAxes(c.headingDeg);
  // Velocity in deck axes, so the outward component can be dropped one at a
  // time and the other one is left alone.
  const vA = st.vel.x * fwd[0] + st.vel.z * fwd[1];
  const vC = st.vel.x * right[0] + st.vel.z * right[1];
  const stopA = clampedA !== along && Math.sign(vA) === Math.sign(along);
  const stopC = clampedC !== across && Math.sign(vC) === Math.sign(across);
  const nA = stopA ? 0 : vA;
  const nC = stopC ? 0 : vC;
  st.vel.x = fwd[0] * nA + right[0] * nC;
  st.vel.z = fwd[1] * nA + right[1] * nC;

  st.pos.x = c.x + fwd[0] * clampedA + right[0] * clampedC;
  st.pos.z = c.z + fwd[1] * clampedA + right[1] * clampedC;
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
  // The aircraft's OWN descent at the moment of first contact, not the contact
  // point's: the point velocity carries the flare's rotation, and the wire and
  // the gear both answer to how hard the aeroplane arrives, not to how fast a
  // tyre is moving through a nose-up rotation. It is also the number the HUD's
  // vertical speed shows, so the pilot's readout matches the check.
  const touchdownVy = st.vel.y;
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

  }

  // --- crash conditions (first-contact only; st.onGround is last step's value) ---
  const firstTouch = contacts > 0 && !st.onGround && st.airborne;
  if (!st.result && firstTouch) {
    // Vertical and horizontal are judged separately, and both use <= / > with
    // no gap between them: there used to be an arrival at exactly the old
    // limit that neither branch claimed, so the jet neither trapped nor died.
    const overloaded = touchdownVy <= HARD_SINK || st.speed > IMPACT_SPEED;
    if (hitWater) {
      fail(
        st,
        "DITCHED",
        st.spec.rotorcraft
          ? "The rotor disc came down on water. Helicopters do not float."
          : `${st.spec.name} is not a seaplane. Impact with the sea.`,
      );
    } else if (st.gearT < .8) {
      // Gear not extended: there is nothing to land on. This replaces a
      // "maxWheelPen" test that measured ~0.9 m on every healthy deck landing
      // against a 0.75 m limit, so the moment the belly grazed — a slightly
      // nose-down touchdown at a fifth of the allowed sink — it killed the jet.
      fail(st, "BELLY IMPACT", "Structure hit the ground. Gear was not down.");
    } else if (hitTerrain) {
      fail(st, "TERRAIN IMPACT", "Only the runway and the carrier deck are survivable surfaces.");
    } else if (overloaded) {
      fail(
        st,
        "HARD IMPACT",
        st.speed > IMPACT_SPEED
          ? `Arrived at ${Math.round(st.speed * 1.94384)} kt — too fast for the gear to take.`
          : `Touchdown at ${Math.round(-touchdownVy * 196.85)} fpm — the ${
              st.spec.rotorcraft ? "skids" : "gear"
            } gave way.`,
      );
    }
    // With the gear down and both speeds inside their limits, a scrape of the
    // belly or the tail is drag and a bad smell, not a fireball: the jet lands.
  }

  // Short touchdowns stay live: roll into the catch area instead of ending
  // the sortie before the hook can reach it. The corridor includes the gear
  // footprint, so a modest lineup error does not turn a wheel touch into death.
  // A helicopter has no tailhook: the deck is a place to land, not to be
  // arrested, so the wire logic is skipped for rotary wing.
  if (!spec.rotorcraft && !st.result && hitDeck && st.catCooldown <= 0 && st.gearT > .8 &&
      ((st.airborne && touchdownVy < TRAP_MAX_CLIMB && touchdownVy > HARD_SINK && st.speed > 5) ||
       (st.deckRoll !== undefined && !st.arresting))) {
    const c = st.deckRoll === undefined
      ? (carrierAt(st.pos.x, st.pos.z) ?? nearestCarrier(st.pos.x, st.pos.z))
      : carriers()[st.deckRoll];
    const idx = carriers().indexOf(c);
    const { s, d } = stripCoords(c, st.pos.x, st.pos.z);
    const inArea = Math.abs(d) <= STRIP_HALF_WIDTH + 6 && s >= -12 && s <= CATCH_S_MAX;
    // Wherever it touched, a gear-down arrival on the boat is a landing roll:
    // the jet is captured and rolled out instead of being left to slide off
    // the side and drown (touching down off the centreline used to end with
    // "The Tomcat is not a seaplane" while sitting on a flight deck).
    st.deckRoll = idx;
    st.airborne = false;
    if (inArea && s >= CATCH_S_MIN) {
      st.arresting = true;
      st.wire = clamp(Math.round((s - WIRE_FIRST_S) / c.wireSpacing) + 1, 1, c.wireCount);
    } else if (!inArea) {
      st.banner = { text: "BOLTER — FULL POWER, GO AROUND", until: st.time + 5 };
    }
  }
  if (st.deckRoll !== undefined && !st.arresting && !hitDeck && st.vel.y > 1) {
    st.deckRoll = undefined;
    st.airborne = true;
  }
  if (!spec.rotorcraft && !st.result && hitRunway && st.airborne && st.gearT > .8 && touchdownVy > HARD_SINK) {
    st.banner = { text: "TOUCHDOWN — IDLE THROTTLE, HOLD B TO BRAKE", until: st.time + 8 };
    st.airborne = false;
    st.runwayLanded = true;
  }
  if (st.runwayLanded && !st.result && hitRunway && st.speed < 12) {
    st.result = { kind: "landing", title: "RUNWAY LANDING", detail: "Landing confirmed. Aircraft recovered, rearmed and repaired." };
    st.runwayLanded = false;
  }
  // Same ending for a roll that runs out on the deck without catching a wire.
  // Without this the jet simply stopped on the roof and the sortie never
  // resolved: no trap, no crash, no way to fly again short of quitting.
  if (!st.result && !st.arresting && st.deckRoll !== undefined && !st.airborne && st.speed < 3) {
    st.result = {
      kind: "landing",
      title: "DECK LANDING",
      detail: "Stopped on deck without a wire. Aircraft recovered, rearmed and repaired.",
    };
    st.deckRoll = undefined;
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
