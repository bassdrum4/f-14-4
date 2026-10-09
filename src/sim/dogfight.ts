import type { BattleWeapon, WeaponLaunch } from "../net/versus";
import { advanceBomb, canBombReach, BOMB_ARM_TIME as BOMB_ARM, BOMB_DETONATION_RADIUS as LGB_DET } from "./bombTrajectory";
// Combat layer for the mission modes. Two scenarios share one machinery:
//
//   dogfight — a hostile carrier steams in and launches AI bandits off its
//              catapults; the player fights them with guns and bombs.
//   strike   — no aircraft at all: waves of targets on land (hangars, fuel
//              farms, warehouses) and at sea (ships) that the player bombs and
//              strafes. Same wave rhythm, same ordnance, same HUD symbology.
//
// The player's guns and free-fall / laser-guided bombs are common to both.
//
// Bandits are kinematic steered point masses, not the full flight model —
// cheap, stable, and plenty good enough to fight. They break when the player
// lines up on them (not only when chased), weave to stay hard to hit, shoulder
// away from each other and slide past the player on a merge, and hold fire
// when terrain blocks the shot. A wave is no longer dropped out of thin air:
// the boat on the horizon motors in, and each bandit takes a cat shot off its
// deck before it comes hunting, so contacts arrive from a ship you can watch —
// and bomb.
//
// The player's ordnance: guns (fast tracers, hitscan) and bombs. Bombs fall
// under gravity and quadratic drag; the release key opens a target pod, the
// player clicks a spot, and every weapon released from then on is laser-guided
// onto it. Impacts throw a real fireball on land or a deck and a water column
// in the sea (see render/effects.ts), and anything that hits anything explodes —
// including aircraft, which no longer fly through each other or the player.
// Everything is deterministic: variation comes from sim time and bandit index,
// never Math.random, so a given engagement replays the same way the flight model
// does.
//
// The player keeps the real F-14 physics; only the hostiles are simplified.

import * as THREE from "three";
import { buildTomcat, type TomcatMesh } from "../render/geometry";
import { buildCarrier } from "../render/scene";
import {
  TARGET_HP,
  TARGET_RADIUS,
  buildTargetMesh,
  wreckTarget,
  type TargetKind,
} from "../render/targets";
import type { BlastKind, ExplosionField } from "../render/effects";
import { isSharedMaterial } from "../render/lights";
import { MAX_BOMBS, MAX_MISSILES } from "./aircraft";
import { atmosphere } from "./atmosphere";
import { CAT_ACCEL, CAT_TIME, CAT_V_END, type AircraftState } from "./flight";
import {
  CAT_START_ALONG,
  carriers,
  deckAxes,
  groundAt,
  isOnDeck,
  makeCarrier,
  type CarrierDef,
} from "./world";

// --- tuning ---
const HULL_MAX = 100; // fallback until the player's spec is known
// Bandit tuning. Deliberately a shade softer than the original pass: the horde
// was winning exchanges rather than losing them, which is the wrong way round
// for the bandit. They still turn hard, still break when lined up on, and still
// hurt — a careless pilot will lose the jet — but they miss more, shoot from
// closer, and need more hits to end the fight.
const BANDIT_HP = 30; // was 34: one good burst now finishes one
const BANDIT_DAMAGE = 7; // was 9 — about 14 hits to put the player in the water
// Speed envelope: bandits fly the same F-14 the player flies — same turn
// authority, same jink — with ONE deliberate handicap: a lower top speed.
// The afterburner still lights (same plume, still the fastest they can go),
// but even lit they are slower than the original numbers were. They win the
// turn, the player wins the chase.
const BANDIT_MAX_DRY = 240; // m/s (~465 kt) — slower than the original 270 cap
const BANDIT_MAX_AB = 265; // m/s (~515 kt) — burner lit, still under the old cap
const BANDIT_AB_TIME = 8; // s of continuous burner before a cooldown
const MUZZLE_V = 1050; // m/s
const TRACER_LIFE = 2.0; // s
const HIT_RADIUS = 9; // m, airframe sphere
const PLAYER_SPREAD = 0.005; // rad
const BANDIT_SPREAD = 0.021; // rad — was 0.016: a wider cone means more misses
// Maneuverability: the bandits fly the SAME F-14 the player flies. The
// player's full-elevator pull measures a ~410 m turn radius at any speed
// (headless probe at 200/240/270/315 m/s — turn rate grows in step with speed),
// so the AI's kinematic turn cap uses the same radius: identical cornering at
// equal speed. The floor keeps the steering controller usable right off the
// cat (a real Tomcat's radius shrinks well below 410 m below corner speed),
// and at combat speeds the radius rule dominates. The lower top speed above
// is the ONLY handicap.
const BANDIT_TURN_RADIUS = 410; // m — the player F-14's full-pull radius
const BANDIT_TURN_FLOOR = 0.42; // rad/s — low-speed controller floor
// Target speeds inside the envelope — lower than the original tune (215-235
// cruise, 270 break) in every state, but fast enough that a merge still happens
// and a hovering or slow player is still closed on.
const BANDIT_SPEED = { pursue: 205, close: 190, evade: 255, min: 140 };
const CEILING = 6000; // m — bandits stay in the fight box (islands reach ~3 km)
/** Keep the fight with the player: the chain is 60 km across, so the box is a
 *  radius around the player rather than one centred on the world origin. */
export const DOGFIGHT_ARENA = 16000;
const ARENA = DOGFIGHT_ARENA;
const EVADE_DIST = 600; // break when the player is inside this on the six
const ENGAGE_DIST = 1200; // open fire inside this (was 1300: closer, less time on target)
const AIM_CONE = 0.14; // rad — roughly on the nose before firing
const NOSE_CONE_COS = 0.92; // player inside ~23 deg of the bandit = being lined up on
const NOSE_BREAK_DIST = 850; // m — inside this, a lined-up bandit breaks hard
const KEEP_APART = 240; // m — bandits shoulder away from each other
const MERGE_DIST = 420; // m — slide past the player rather than through them
const PANIC_DIST = 150; // m — inside this, break away hard from the player
const THREAT_HOLD = 0.45; // s — rounds-inbound warning after a round goes out
const HIT_FLASH = 0.25; // s — hit-marker flash after player rounds connect
const DAMAGE_FLASH = 0.55; // s — red pulse when the player takes hits
const MAX_TRACERS = 80;
const MAX_FLASHES = 6;
// Rounds are projectiles, not laser bolts: they drop and slow in flight. The
// drag area is small on purpose — a 20 mm round is dense and slick, and an
// over-dragged bullet visibly decelerated and curved, which read as the guns
// "not shooting straight". The gun cue (see gunSolution) accounts for the drop
// and the drag that remain, so the crosshair is where the rounds actually go.
// --- gun aim assist ---
// Correct toward a bandit's lead point within five degrees of the bore.
// The fired rounds and HUD solution use the same correction, capped at five
// degrees and limited to 1.5 km so distant contacts do not attract the gun.
const ASSIST_CONE = 5 * Math.PI / 180;
const ASSIST_MAX = 5 * Math.PI / 180;
const ASSIST_RANGE = 1500; // m: no assist beyond this

const BULLET_MASS = 0.1; // kg (20 mm class)
const BULLET_CDA = 0.000025; // drag coefficient x frontal area, m^2
const CARRIER_GUN_DAMAGE = 1; // per round on a 100 hp hull — strafing takes ~10 s
const WAVE_RESPAWN = 6; // s between waves
const WAVE_MAX = 5;

// --- the hostile carrier (the bandits' home deck) ---
const CV_NAME = "AGGRESSOR";
const CV_HP = 100;
const CV_START_DIST = 7200; // m — where the boat shows up on the horizon
const CV_LAUNCH_RANGE = 7800; // m — inside this, it can launch (it starts in range)
const CV_LAUNCH_HOLD = 40; // s — but never sit on a wave longer than this
// A carrier at flank speed (~39 kt): fast enough to visibly close the range and
// slow enough that a level bombing run from altitude can still lead and hit it.
const CV_CLOSE_SPEED = 20; // m/s
const CV_STANDOFF = 2800; // m — hold this far off the player
const CV_TURN_DEG = 1.6; // deg/s rudder (a 300 m hull does not pivot)
const CV_FRIENDLY_CLEAR = 2200; // m — never steam into a friendly anchorage
const CV_FIRST_LAUNCH = 2.2; // s after a wave is called that the first jet rolls
const CV_LAUNCH_GAP = 3.4; // s between aircraft off the two cats
const CV_CAT_LATERAL = 20; // |CarrierDef.catapultOffsetX| — one cat each side
const CV_CLIMB_TIME = 3.5; // s of nose-up after a shot before it starts hunting

// --- bombs ---
const BOMB_MAG = 6; // default racks, overridden by the player's airframe
const BOMB_HP = 34; // one hit takes a third of the carrier's hull
const BOMB_RELEASE_CD = 0.5; // s between releases while the key is held
const BOMB_AIR_RADIUS = 13; // m — a near miss on an airframe breaks it up
const GRAVITY = 9.81;

// --- laser-guided bombs ---
const LGB_TRAIL = 0.09; // s between trail puffs behind a guided bomb
const LGB_TRAIL_TTL = 2.4; // s each puff hangs, i.e. how long the wake reads
// Every store smokes from the moment it leaves the rack, guided or not: without
// it a falling bomb is a dark speck lost against the terrain, and the pilot
// cannot tell whether the release happened at all.
const BOMB_TRAIL = 0.16; // s between trail puffs behind a free-fall bomb
const BOMB_TRAIL_TTL = 3.2; // s each puff hangs
/** How long the last impact keeps its place marked on the HUD. */
const IMPACT_MARKER_TTL = 9;
/** How long the rack the last store left is marked on the HUD. */
const RELEASE_MARKER_TTL = 4;
/** A lingering smoke column where a weapon went off, so the hit reads. */
const IMPACT_SMOKE_TTL = 7;

// --- collisions (airframes do not pass through each other) ---
const RAM_CARRIER_HP = 45; // damage a jet does to a hull it flies into
const MID_AIR_DAMAGE = 55; // and what it does to the player's own hull
const PLAYER_HIT_R = 28; // m — bandit inside this is a mid-air
const BANDIT_HIT_R = 26; // m — two bandits inside this break up together
/** Rack stations in body coords (right, up, aft): three pairs under the wings. */
const BOMB_STATIONS: Array<[number, number, number]> = [
  [-2.6, -1.5, 0.5],
  [2.6, -1.5, 0.5],
  [-4.1, -1.25, 0.7],
  [4.1, -1.25, 0.7],
  [-2.6, -1.5, 1.6],
  [2.6, -1.5, 1.6],
];

// --- missiles ---
// Air-intercept missiles for the types that carry them (the Tomcat and the
// Hornet ride two each; the Intruder is a clean bomb truck). A launch locks the
// nearest live enemy — bandit, strike target or the hostile boat — and the
// weapon steers onto it, so off-boresight snaps read like a real seeker rather
// than a bullet.
const MISSILE_CD = 1.1; // s between launches (rails cycle)
const MISSILE_MOTOR = 2.6; // s of rocket burn
const MISSILE_ACCEL = 230; // m/s^2 while the motor burns
const MISSILE_V_MAX = 640; // m/s hard cap
const MISSILE_TURN = 2.1; // rad/s seek authority — kills a jinking bandit
const MISSILE_ARM = 0.35; // s before the seeker goes live (clears the jet)
const MISSILE_DET = 26; // m proximity fuze on the locked target
const MISSILE_AIR_R = 30; // m airburst radius on any airframe
const MISSILE_HP = 90; // damage: one hit breaks any aircraft outright
// A wingman reports its own weapon results, so its claims are capped at the
// biggest single hit the fight can actually produce (with headroom for tuning):
// anything above this is a bug or a cheat, not a hit.
const MAX_CLAIMED_HIT = MISSILE_HP * 2;
const MAX_CLAIMED_CV_HIT = RAM_CARRIER_HP * 2;
const MISSILE_CV_DMG = 38; // damage to the hostile carrier's hull
const MISSILE_MASS = 230; // kg
const MISSILE_CD0 = 0.3; // drag coefficient (coast phase)
const MISSILE_AREA = 0.045; // m^2 frontal area
const MISSILE_TRAIL_HOT = 0.045; // s between motor plume puffs
const MISSILE_TRAIL_COLD = 0.12; // s between coast puffs
/** Under-wing rail stations: outboard of the bomb racks, just behind CG. */
const MISSILE_STATIONS: Array<[number, number, number]> = [
  [-4.6, -1.1, -0.4],
  [4.6, -1.1, -0.4],
];

interface Missile {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  motor: number; // s of burn left
  arm: number; // s until the seeker is live
  trailT: number; // s until the next plume puff
  mesh: THREE.Object3D;
}

interface Bandit {
  id: number;
  hp: number;
  pos: THREE.Vector3;
  quat: THREE.Quaternion; // forward = -Z
  bank: number; // smoothed roll for looks, rad
  speed: number; // m/s
  fireCd: number; // s until next shot / burst decision
  burst: number; // rounds left in the current burst
  evadeT: number; // s of jink remaining
  /** s until the bandit may break again: after a break it extends and
   *  re-engages like a real pilot instead of jinking forever. */
  evadeCd: number;
  phase: number; // per-bandit jink phase
  mesh: TomcatMesh;
  /** >= 0 while the bandit is still rolling on the catapult; -1 in the air. */
  catT: number;
  catStart: THREE.Vector3;
  catDir: THREE.Vector3;
  /** seconds of nose-up climb left after a cat shot */
  climbT: number;
  /** wing sweep, 0 = spread for the deck, 1 = swept for the merge */
  sweepT: number;
  /** Afterburner state: lit during the merge and evades, with a cooldown so
   *  it blinks instead of burning forever. */
  abOn: boolean;
  abT: number; // s of burner left in this light
  abCool: number; // s until the burner may light again
  /** Wingman mirroring: this bandit is flown by the room host, not by us. It
   *  still shoots (a mirrored fight bites) but its pose comes off the wire. */
  remote: boolean;
  /** Newest streamed pose, the velocity two packets imply, and the orientation
   *  they arrived with — the mesh is eased onto these between packets. */
  netPos: THREE.Vector3;
  netQuat: THREE.Quaternion;
  netVel: THREE.Vector3;
}

interface Tracer {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  hostile: boolean;
  mesh: THREE.Mesh;
}

interface Flash {
  pos: THREE.Vector3;
  life: number; // 1 -> 0
  mesh: THREE.Mesh;
}

export type CarrierStatus = "closing" | "on station" | "sinking" | "sunk";

/** One bandit as it travels between pilots. */
export interface EnemyPose {
  id: number;
  x: number;
  y: number;
  z: number;
  qx: number;
  qy: number;
  qz: number;
  qw: number;
  hp: number;
  /** Still rolling on the hostile deck: no shooting and no mid-airs yet. */
  onDeck: boolean;
}

/** The hostile boat as it travels between pilots. */
export interface EnemyCarrierState {
  x: number;
  z: number;
  headingDeg: number;
  hp: number;
  status: CarrierStatus;
}

/**
 * The room's fight, as the host streams it: the boat, every bandit and the wave
 * they flew from. The host owns the enemies and everyone else mirrors their
 * positions, so two pilots always shoot at the same aeroplanes. Damage flows the
 * other way (see EnemyHit), which is the least lag this can be done with: a
 * wingman sees the fight live and only a kill needs the host.
 */
export interface EnemySnapshot {
  carrier: EnemyCarrierState | null;
  bandits: EnemyPose[];
  wave: number;
}

/** A burst of a wingman's rounds that landed on an enemy the host owns. */
export interface EnemyHit {
  id: number;
  dmg: number;
}

/** Nothing to report: returned instead of a fresh array on an idle frame. */
const NO_HITS: EnemyHit[] = [];

/** The hostile boat: a live CarrierDef whose x/z/heading the sim drives. */
interface EnemyCarrier {
  def: CarrierDef;
  mesh: THREE.Group;
  hp: number;
  status: CarrierStatus;
  speed: number; // m/s
  sinkT: number; // s since the fatal hit
}

interface Bomb {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  arm: number; // s until the fuze is live
  mesh: THREE.Object3D;
  /** Laser-guided: steers onto `target` (the designation) while it falls. */
  guided: boolean;
  target: THREE.Vector3 | null;
  trailT: number; // s until the next trail puff
}

/** Which mission machinery is running. */
export type Scenario = "dogfight" | "strike";

/**
 * A strike target: a structure on land or a ship at sea. Static things sit on
 * the terrain; ships steam slowly along their heading so a level pass needs a
 * little lead, like the enemy carrier does.
 */
interface StrikeTarget {
  id: number;
  kind: TargetKind;
  sea: boolean;
  hp: number;
  pos: THREE.Vector3;
  headingDeg: number;
  speed: number; // m/s (0 for land targets)
  radius: number; // hit sphere, m
  mesh: THREE.Group;
  dead: boolean;
  wreckT: number; // s since it was destroyed
  smokeT: number; // s until the next wreck smoke puff
}

/**
 * The predicted path of the player's next burst, in world space: where the
 * rounds have got to when they hit something (or when their flight runs out),
 * and what they hit. This is the same integration the tracers fly, so the gun
 * crosshair and the rounds agree — put the reticle on the target and pull.
 */
export interface GunCue {
  x: number;
  y: number;
  z: number;
  /** Slant range from the muzzle to the solution point, metres. */
  range: number;
  /** Flight time to the solution point, seconds. */
  t: number;
  /** What the burst would hit at the solution point, if anything. */
  hit: "bandit" | "ship" | "target" | "ground" | null;
  /** True while the burst is still effective (inside its flight time). */
  live: boolean;
}

export interface DogfightHud {
  active: boolean;
  /** Strike scenario: contacts are targets, not bandits. */
  strike: boolean;
  hull: number;
  kills: number;
  wave: number;
  /** Bandits flying, or strike targets still standing. */
  bandits: number;
  /** Missiles on the rails (types with none always read 0/0). */
  missiles: number;
  missilesMax: number;
  nearestKm: number;
  nearestBrgDeg: number;
  markers: Array<{ x: number; z: number }>;
  /** A bandit has rounds in the air right now (within the hold window). */
  threat: boolean;
  /** The player's trigger is down (the muzzle flash is lit). */
  firing: boolean;
  /** 1 -> 0 hit-marker flash: our rounds connected with a bandit. */
  hitT: number;
  /** 1 -> 0 damage flash: we are taking hits. */
  damageT: number;
  /** Per-bandit 3D position + gun lead point, for the HUD designators. */
  spots: Array<{ x: number; y: number; z: number; lx: number; ly: number; lz: number; km: number }>;
  /** Bombs still on the racks. */
  bombs: number;
  bombsMax: number;
  /** Bombs in the air right now. */
  bombsAway: number;
  /** Guided bombs still falling, tracking the laser. */
  bombsTracking: number;
  /** The laser spot, while one is designated. */
  designated: { x: number; y: number; z: number; km: number } | null;
  /** Where the last weapon came off the rack, marked briefly (null when stale). */
  released: { x: number; y: number; z: number; age: number } | null;
  /** Where the last weapon detonated, marked for a few seconds (null when stale). */
  landed: { x: number; y: number; z: number; age: number; kind: BlastKind } | null;
  /** The hostile carrier, while it exists. */
  carrier: {
    name: string;
    x: number;
    y: number;
    z: number;
    distKm: number;
    brgDeg: number;
    hp: number;
    status: CarrierStatus;
    /** Aircraft still to launch: queued plus rolling on the cats. */
    inbound: number;
  } | null;
}

// --- scratch vectors (step runs at 120 Hz; nothing allocates per call) ---
const FWD = new THREE.Vector3();
const TO_P = new THREE.Vector3();
const PFWD = new THREE.Vector3();
const DESIRED = new THREE.Vector3();
const SEP = new THREE.Vector3();
const LAT = new THREE.Vector3();
const AIM = new THREE.Vector3();
const AHEAD = new THREE.Vector3();
const AXIS = new THREE.Vector3();
const TMP = new THREE.Vector3();
const REF = new THREE.Vector3();
const CVPT = new THREE.Vector3(); // the hostile deck as a lock point
const DIR = new THREE.Vector3();
const TR_Z = new THREE.Vector3(0, 0, 1);
/** Stores are modelled nose-first down -Z; this is the axis that follows the
 *  velocity vector. */
const NOSE_Z = new THREE.Vector3(0, 0, -1);
const MAT4 = new THREE.Matrix4();
const ROLL_Q = new THREE.Quaternion();
const HQ = new THREE.Quaternion();
const PITCH_Q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.105);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const SYNC = new THREE.Vector3(); // the mirrored pose target

/**
 * Mirroring: how far past the newest packet a wingman's enemies are flown, and
 * how fast a correction is eased in. Packets arrive at ~7.5 Hz, so running a
 * little ahead of the last one keeps motion smooth — and costs less lag than
 * sitting a whole packet interval behind it.
 */
const MIRROR_LEAD = 0.07; // s
const MIRROR_EASE = 0.09; // s
const ORIGIN = new THREE.Vector3();
// Dedicated scratch for the gun cue: it is evaluated from the render loop, so
// it must not share vectors with the fixed-step sim.
const GUN_PREV = new THREE.Vector3();
const GUN_P = new THREE.Vector3();
const GUN_V = new THREE.Vector3();
const GUN_FWD = new THREE.Vector3();
const GUN_MUZ = new THREE.Vector3();
const GUN_T = new THREE.Vector3();
const GUN_B = new THREE.Vector3(); // bandit lead position inside the cue march
/** Beyond this the crosshair is drawn faded: the burst is out of reach. */
const GUN_RANGE = 2000;
/** The gun cue integrates at the sim step so it matches the tracers exactly. */
const GUN_DT = 1 / 120;

/** Deterministic hash in 0..1 — the sim's stand-in for Math.random. */
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export interface CombatOpponent { id: string; life: number; pos: THREE.Vector3; vel: THREE.Vector3 }
export interface PlayerHit { id: string; life: number; weapon: BattleWeapon }

export class Dogfight {
  active = false;
  /** Mission machinery in play: bandits, or bombable targets. */
  private scenario: Scenario = "dogfight";
  private hull = HULL_MAX;
  private kills = 0;
  private wave = 0;
  private nextId = 0;
  private bandits: Bandit[] = [];
  /** Strike scenario: everything on the ground and at sea that dies to bombs. */
  private strikeTargets: StrikeTarget[] = [];
  private tracers: Tracer[] = [];
  private flashPool: Flash[] = [];
  private gunCd = 0;
  /** Muzzle flash at the nose: "am I actually shooting?" answered visually. */
  private muzzle: THREE.Mesh;
  private muzzleT = 0;
  /** The trigger is down right now (HUD + gun-path symbology). */
  private gunLive = false;
  /** Sampled bullet-path points for the HUD's gun ladder (fixed capacity). */
  private pathBuf: THREE.Vector3[] = [];
  private pathCount = 0;
  private pathOut: { points: THREE.Vector3[]; n: number } = { points: [], n: 0 };
  private waveTimer = 0;
  private threatT = 0;
  private hitT = 0;
  private damageT = 0;
  private root = new THREE.Group();
  private tracerPool: THREE.Mesh[] = [];
  private matPlayer: THREE.MeshBasicMaterial;
  private matBandit: THREE.MeshBasicMaterial;
  // hostile carrier + its launch queue
  private cv: EnemyCarrier | null = null;
  private launchQueued = 0;
  private launchTimer = 0;
  private launchSide = -1;
  private waveClock = 0;
  private fightOver = false;
  // bombs
  private bombs: Bomb[] = [];
  private bombPool: THREE.Object3D[] = [];
  private bombsLeft = BOMB_MAG;
  private bombsMax = BOMB_MAG; // set from the flown airframe's spec
  private hullMax = HULL_MAX; // ditto
  // missiles
  private missiles: Missile[] = [];
  private missilePool: THREE.Object3D[] = [];
  private missilesLeft = 0;
  private missilesMax = 0; // set from the flown airframe's spec
  private missileCd = 0;
  private station = 0;
  private bombCd = 0;
  /** Releases asked for by the target pod, waiting on the release cooldown. */
  private releaseQueue = 0;
  // laser designation: a live aim point (bombs in flight follow it) + the ring
  // marker on the ground under it. There is deliberately no beam from the jet to
  // the spot: the line read as a stray laser sweeping the canopy the moment a
  // weapon left the rack, and the ring already says where the pod is looking.
  private designation: THREE.Vector3 | null = null;
  private designator: THREE.Mesh;
  /** Where/how the last weapon actually detonated (diagnostics/tests). */
  readonly lastImpact = new THREE.Vector3();
  lastImpactKind: BlastKind | null = null;
  /** Seconds since the last detonation, and since the last release. */
  private impactAge = Infinity;
  private releaseAge = Infinity;
  private releaseMarker = new THREE.Vector3();
  // -------------------------------------------------------------------------
  // Multiplayer: one pilot runs the fight, the room flies in it
  /** A wingman's client: the enemies are the host's, not ours. */
  private mirror = false;
  private versus = false;
  private opponents: CombatOpponent[] = [];
  private playerHits: PlayerHit[] = [];
  private weaponLaunches: WeaponLaunch[] = [];
  /** Host: the fight as it goes on the wire. Reused — never kept. */
  private snapOut: EnemySnapshot = { carrier: null, bandits: [], wave: 1 };
  /** Mirror: the damage our weapons did, waiting on the host to be told. */
  private hitsOut: EnemyHit[] = [];
  private carrierHitOut = 0;
  /** Mirror: bandits we took down locally, so a packet that still lists them (it
   *  was in the air when they died) cannot pop them back into the sky. */
  private takenDown = new Map<number, number>();
  /** Mirror: when the last packet landed, and the gap it implies. */
  private snapAt = 0;
  private snapDt = 0.14;

  constructor(scene: THREE.Scene, private blasts: ExplosionField) {
    // tracers: short additive slugs, colour-coded by side
    const geom = new THREE.BoxGeometry(0.16, 0.16, 4.6);
    this.matPlayer = new THREE.MeshBasicMaterial({
      color: 0xffe28a, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.matBandit = new THREE.MeshBasicMaterial({
      color: 0xff5040, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 0; i < MAX_TRACERS; i++) {
      const m = new THREE.Mesh(geom, this.matPlayer);
      m.visible = false;
      m.frustumCulled = false;
      this.root.add(m);
      this.tracerPool.push(m);
    }
    // kill flashes: expanding additive spheres
    const flashGeom = new THREE.SphereGeometry(1, 12, 8);
    for (let i = 0; i < MAX_FLASHES; i++) {
      const m = new THREE.Mesh(
        flashGeom,
        new THREE.MeshBasicMaterial({
          color: 0xffa040, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }),
      );
      m.visible = false;
      this.root.add(m);
      this.flashPool.push({ pos: new THREE.Vector3(), life: 0, mesh: m });
    }
    // Muzzle flash: a bright additive core at the gun ports while the trigger
    // is down. A chase camera cannot see a gun's report, and "no visible
    // effect" reads as "the trigger does nothing".
    this.muzzle = new THREE.Mesh(
      new THREE.SphereGeometry(1, 8, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffd27a, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    this.muzzle.visible = false;
    this.muzzle.frustumCulled = false;
    this.root.add(this.muzzle);
    for (let i = 0; i < 24; i++) this.pathBuf.push(new THREE.Vector3());
    this.pathOut.points = this.pathBuf;
    // bombs: pooled meshes parked off-scene until a release needs one. They are
    // painted light grey on purpose: a dark store is invisible from the chase
    // camera against green terrain or blue water, which is exactly the complaint
    // this answers. The seeker band leaves no doubt which end is which.
    const bombMat = new THREE.MeshStandardMaterial({ color: 0xb9bec3, roughness: 0.55, metalness: 0.4 });
    const seekerMat = new THREE.MeshStandardMaterial({
      color: 0x2b3036, roughness: 0.4, metalness: 0.6,
      emissive: 0x2a1408, emissiveIntensity: 1,
    });
    const missileBodyMat = new THREE.MeshStandardMaterial({ color: 0xe8e6df, roughness: 0.45, metalness: 0.35 });
    const missileBandMat = new THREE.MeshStandardMaterial({
      color: 0xb32020, roughness: 0.5, metalness: 0.3,
      emissive: 0x3a0808, emissiveIntensity: 0.7,
    });
    const bodyGeom = new THREE.CylinderGeometry(0.3, 0.3, 2.4, 10);
    bodyGeom.rotateX(Math.PI / 2);
    const noseGeom = new THREE.ConeGeometry(0.3, 0.9, 10);
    noseGeom.rotateX(-Math.PI / 2);
    const finGeom = new THREE.BoxGeometry(0.07, 1.15, 0.85);
    // the bomb is built nose-first down -Z, the direction it flies
    const bandGeom = new THREE.CylinderGeometry(0.315, 0.315, 0.45, 10);
    bandGeom.rotateX(Math.PI / 2);
    for (let i = 0; i < MAX_BOMBS; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(bodyGeom, bombMat);
      body.position.z = 0.4;
      const nose = new THREE.Mesh(noseGeom, bombMat);
      nose.position.z = -1.15;
      const band = new THREE.Mesh(bandGeom, seekerMat);
      band.position.z = -0.75;
      const finA = new THREE.Mesh(finGeom, bombMat);
      finA.position.z = 1.4;
      const finB = new THREE.Mesh(finGeom, bombMat);
      finB.position.z = 1.4;
      finB.rotation.z = Math.PI / 2;
      g.add(body, nose, band, finA, finB);
      g.visible = false;
      g.frustumCulled = false;
      this.root.add(g);
      this.bombPool.push(g);
    }
    // missiles: same idea, different silhouette — white body, red warhead band
    // and four large fins, so a launch reads as a missile and not another bomb.
    const mslBodyGeom = new THREE.CylinderGeometry(0.19, 0.19, 3.2, 10);
    mslBodyGeom.rotateX(Math.PI / 2);
    const mslNoseGeom = new THREE.ConeGeometry(0.19, 0.85, 10);
    mslNoseGeom.rotateX(-Math.PI / 2);
    const mslBandGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 10);
    mslBandGeom.rotateX(Math.PI / 2);
    const mslFinGeom = new THREE.BoxGeometry(0.06, 0.95, 0.72);
    for (let i = 0; i < MAX_MISSILES; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(mslBodyGeom, missileBodyMat);
      body.position.z = 0.15;
      const nose = new THREE.Mesh(mslNoseGeom, missileBandMat);
      nose.position.z = -1.7;
      const band = new THREE.Mesh(mslBandGeom, missileBandMat);
      band.position.z = -1.15;
      for (let f = 0; f < 4; f++) {
        const fin = new THREE.Mesh(mslFinGeom, missileBodyMat);
        fin.position.z = 1.6;
        fin.rotation.z = (f * Math.PI) / 2;
        g.add(fin);
      }
      g.add(body, nose, band);
      g.visible = false;
      g.frustumCulled = false;
      this.root.add(g);
      this.missilePool.push(g);
    }
    // laser spot marker: a ring on the ground under the designation
    this.designator = new THREE.Mesh(
      new THREE.RingGeometry(7, 10, 26),
      new THREE.MeshBasicMaterial({
        color: 0xff4d3c, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
        depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
      }),
    );
    this.designator.rotation.x = -Math.PI / 2;
    this.designator.visible = false;
    this.designator.frustumCulled = false;
    this.root.add(this.designator);
    scene.add(this.root);
  }

  /**
   * Put the hostile boat on the water before the fight starts. Dogfight mode
   * calls this while the jet is still on the deck, so the carrier is already
   * motoring in when the player looks out of the canopy — and it does not pop
   * into existence the moment the wheels leave the deck. No aircraft launch
   * until begin() is called.
   */
  /**
   * Adopt the player's airframe: rack capacity, hull strength and gun
   * ballistics all come off its spec. Refills the racks whenever the fight is
   * not currently running.
   */
  setAircraft(player: AircraftState): void {
    const spec = player.spec;
    this.bombsMax = spec.bombs;
    this.missilesMax = spec.missiles;
    this.hullMax = spec.hull;
    if (!this.active) this.bombsLeft = this.bombsMax;
    if (!this.active) this.missilesLeft = this.missilesMax;
  }

  prepare(player: AircraftState): void {
    this.setAircraft(player);
    this.clear();
    // A wingman never owns the boat: the host's arrives on the wire.
    if (!this.mirror) this.spawnEnemyCarrier(player);
  }

  /**
   * A recovery: the racks and the hull come back full. The sim calls this when
   * the jet touches down again on a friendly deck or runway, so a landing is a
   * chance to re-arm rather than the end of the fight.
   */
  refill(): void {
    this.bombsLeft = this.bombsMax;
    this.missilesLeft = this.missilesMax;
    this.hull = this.hullMax;
  }

  /** Start (or restart) the fight around the player, reusing the boat if one is
   *  already inbound from prepare(). */
  begin(player: AircraftState): void {
    this.setAircraft(player);
    if (this.cv) this.clearFight();
    else {
      this.clear();
      if (!this.mirror) this.spawnEnemyCarrier(player);
    }
    this.active = true;
    this.hull = this.hullMax;
    this.bombsLeft = this.bombsMax;
    this.missilesLeft = this.missilesMax;
    this.kills = 0;
    this.wave = 1;
    this.launchQueued = Math.min(1 + this.wave, WAVE_MAX);
    this.launchTimer = CV_FIRST_LAUNCH;
    this.waveClock = 0;
    this.launchSide = -1;
    this.fightOver = false;
    this.banner(player, `HOSTILE CARRIER ${CV_NAME} INBOUND — ${Math.round(CV_START_DIST / 1000)} KM — [R] OPENS THE TARGET POD`);
  }

  /**
   * Put the first strike wave on the map before the wheels leave the deck, the
   * way prepare() puts the hostile carrier on the water: the pilot can see the
   * target area from the catapult and plan the run in.
   */
  prepareStrike(player: AircraftState): void {
    this.setAircraft(player);
    this.clear();
    this.scenario = "strike";
    this.wave = 1;
    this.kills = 0;
    this.spawnStrikeWave(player);
  }

  /**
   * Start the strike: waves of land and sea targets, no aircraft anywhere.
   * A wave raised by prepareStrike() is kept — the targets the pilot watched
   * from the catapult are the ones waiting on the first run.
   */
  beginStrike(player: AircraftState): void {
    this.setAircraft(player);
    if (this.scenario !== "strike" || this.strikeTargets.length === 0) {
      this.clear();
      this.scenario = "strike";
      this.wave = 1;
      this.kills = 0;
      this.spawnStrikeWave(player);
    }
    this.active = true;
    this.hull = this.hullMax;
    this.bombsLeft = this.bombsMax;
    this.missilesLeft = this.missilesMax;
    this.waveClock = 0;
    this.waveTimer = 0;
    this.fightOver = false;
    const n = this.strikeTargets.reduce((a, t) => a + (t.dead ? 0 : 1), 0);
    this.banner(
      player,
      `STRIKE — WAVE ${this.wave} · ${n} TARGETS ON THE GRID — [R] OPENS THE TARGET POD`,
    );
  }

  /**
   * Start (or restart) a head-to-head sortie. `refillStores` is false on a
   * respawn: dying costs the hull, not the ordnance, so only a landing puts
   * the missiles and bombs back on the racks.
   */
  beginVersus(player: AircraftState, refillStores = true): void {
    const bombs = this.bombsLeft;
    const missiles = this.missilesLeft;
    this.setAircraft(player);
    this.clear();
    this.versus = true;
    this.active = true;
    this.hull = 100;
    if (!refillStores) {
      this.bombsLeft = Math.min(bombs, this.bombsMax);
      this.missilesLeft = Math.min(missiles, this.missilesMax);
    }
  }
  setOpponents(opponents: CombatOpponent[]): void { this.opponents = opponents; }
  takeWeaponLaunches(): WeaponLaunch[] { const shots = this.weaponLaunches; this.weaponLaunches = []; return shots; }
  takePlayerHits(): PlayerHit[] { const hits = this.playerHits; this.playerHits = []; return hits; }
  setBattleHull(hp: number): void {
    if (hp < this.hull) this.damageT = DAMAGE_FLASH;
    this.hull = hp;
  }
  private hitOpponent(opponent: CombatOpponent, weapon: BattleWeapon): void {
    this.playerHits.push({ id: opponent.id, life: opponent.life, weapon });
    this.hitT = HIT_FLASH;
  }

  /**
   * Point the laser at a world spot (from the target pod's click). Bombs
   * already in the air follow a live designation, so re-clicking re-targets
   * them; null clears the aim point.
   */
  setDesignation(p: THREE.Vector3 | null): void {
    if (!p) {
      this.designation = null;
      return;
    }
    if (this.designation) this.designation.copy(p);
    else this.designation = p.clone();
    for (const b of this.bombs) {
      if (b.guided && b.target) b.target.copy(p);
    }
  }

  get designated(): THREE.Vector3 | null {
    return this.designation;
  }

  /**
   * Queue one weapon release (a target-pod click). The release cooldown still
   * applies, but a double click is not swallowed: the second weapon goes when
   * the rack is ready.
   */
  requestBombRelease(player?: AircraftState): boolean {
    if (player && !this.bombReachable(player)) {
      this.banner(player, "BOMB CANNOT REACH TARGET — CLOSE IN OR CLIMB");
      return false;
    }
    this.releaseQueue++;
    return true;
  }

  private bombReachable(player: AircraftState): boolean {
    if (!this.designation) return true;
    const [x, y, z] = BOMB_STATIONS[this.station % BOMB_STATIONS.length];
    const pos = player.pos.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(player.quat));
    const vel = player.vel.clone().add(new THREE.Vector3(0, -2.5, 0).applyQuaternion(player.quat));
    return canBombReach(pos, vel, this.designation, this.enemyDeck());
  }

  /** The hostile boat's hull, for the targeting pick (null once it is gone). */
  enemyDeck(): CarrierDef | null {
    return this.cv ? this.cv.def : null;
  }

  // -------------------------------------------------------------------------
  // Multiplayer: the room's fight
  // -------------------------------------------------------------------------

  /**
   * Hand the fight to the room, or take it back. A wingman mirrors the host's
   * enemies instead of running its own; the host runs them and streams them.
   * Switching authority drops the other pilot's bandits, so the two sims never
   * mix into one sky.
   */
  setMirror(on: boolean, player: AircraftState): void {
    if (this.mirror === on) return;
    this.mirror = on;
    this.clearBandits();
    this.takenDown.clear();
    this.hitsOut = [];
    this.carrierHitOut = 0;
    if (on) {
      // Our own boat is the host's business now; theirs arrives on the next
      // packet. Our wave queue goes with it.
      this.releaseCarrier();
      this.launchQueued = 0;
    } else if (!this.cv && this.scenario === "dogfight" && !this.versus) {
      // Promoted to lead mid-flight: the boat is ours again, and stepWaves will
      // spot the next wave on it.
      this.spawnEnemyCarrier(player);
    }
  }

  /** True while the room's host owns the enemies (this client only mirrors). */
  get mirroring(): boolean {
    return this.mirror;
  }

  /**
   * The fight for the wire, as the host sees it. The object is reused: the net
   * layer packs it on the spot, so it must not be stored.
   */
  enemySnapshot(): EnemySnapshot {
    const s = this.snapOut;
    const cv = this.cv;
    if (cv) {
      const c = s.carrier ?? (s.carrier = { x: 0, z: 0, headingDeg: 0, hp: 0, status: "closing" });
      c.x = cv.def.x;
      c.z = cv.def.z;
      c.headingDeg = cv.def.headingDeg;
      c.hp = cv.hp;
      c.status = cv.status;
    } else {
      s.carrier = null;
    }
    s.wave = this.wave;
    const n = this.bandits.length;
    s.bandits.length = n;
    for (let i = 0; i < n; i++) {
      const b = this.bandits[i];
      const p = s.bandits[i];
      const e: EnemyPose = p ?? {
        id: 0, x: 0, y: 0, z: 0, qx: 0, qy: 0, qz: 0, qw: 1, hp: 0, onDeck: false,
      };
      e.id = b.id;
      e.x = b.pos.x;
      e.y = b.pos.y;
      e.z = b.pos.z;
      e.qx = b.quat.x;
      e.qy = b.quat.y;
      e.qz = b.quat.z;
      e.qw = b.quat.w;
      e.hp = b.hp;
      e.onDeck = b.catT >= 0;
      s.bandits[i] = e;
    }
    return s;
  }

  /**
   * A packet from the host: put the room's enemies where the host says they are.
   * Bandits are matched by id, so one that joins or dies on the host simply
   * appears or disappears here.
   */
  applyRemoteSnapshot(snap: EnemySnapshot, nowMs: number): void {
    if (!this.mirror) return;
    this.snapDt = this.snapAt > 0
      ? THREE.MathUtils.clamp((nowMs - this.snapAt) / 1000, 0.05, 0.6)
      : 0.14;
    this.snapAt = nowMs;
    this.wave = snap.wave;
    this.applyRemoteCarrier(snap.carrier);
    const seen = new Set<number>();
    for (const p of snap.bandits) {
      seen.add(p.id);
      const down = this.takenDown.get(p.id);
      if (down !== undefined) {
        if (nowMs - down < 4000) continue;
        this.takenDown.delete(p.id);
      }
      const b = this.findBandit(p.id) ?? this.spawnMirrorBandit(p);
      b.hp = p.hp;
      b.catT = p.onDeck ? 0 : -1;
      // The velocity two packets imply lets the mesh run a little ahead of the
      // stream; on a brand new bandit it is zero, which is exactly right.
      b.netVel.set(
        (p.x - b.netPos.x) / this.snapDt,
        (p.y - b.netPos.y) / this.snapDt,
        (p.z - b.netPos.z) / this.snapDt,
      );
      b.speed = b.netVel.length();
      b.netPos.set(p.x, p.y, p.z);
      b.netQuat.set(p.qx, p.qy, p.qz, p.qw);
    }
    for (let i = this.bandits.length - 1; i >= 0; i--) {
      const b = this.bandits[i];
      if (!seen.has(b.id)) this.removeBandit(b);
    }
  }

  /** Host side: a wingman's rounds landed on a bandit of ours. */
  applyRemoteHit(id: number, dmg: number, player: AircraftState): void {
    const b = this.findBandit(id);
    if (!b) return;
    this.hitT = HIT_FLASH;
    this.damageBandit(b, dmg, player);
  }

  /** Host side: a wingman's weapon landed on the hostile boat. */
  applyRemoteCarrierHit(dmg: number, player: AircraftState): void {
    const cv = this.cv;
    if (!cv) return;
    CVPT.set(cv.def.x, cv.def.deckY, cv.def.z);
    this.damageCarrier(CVPT.clone(), player, dmg);
  }

  /** Mirror: the hits our weapons just landed, for the host (clears them). */
  takeHits(): EnemyHit[] {
    if (this.hitsOut.length === 0) return NO_HITS;
    const out = this.hitsOut;
    this.hitsOut = [];
    return out;
  }

  /** Mirror: the damage our weapons just did to the boat (clears it). */
  takeCarrierHit(): number {
    const d = this.carrierHitOut;
    this.carrierHitOut = 0;
    return d;
  }

  /** Drop the hostile boat (mirroring hands it over to the host). */
  private releaseCarrier(): void {
    if (!this.cv) return;
    this.cv.mesh.removeFromParent();
    disposeSubtree(this.cv.mesh);
    this.cv = null;
    this.fightOver = false;
  }

  /** Wire a mirrored boat into place, or move the one we already have. */
  private applyRemoteCarrier(c: EnemyCarrierState | null): void {
    if (!c) {
      this.releaseCarrier();
      return;
    }
    if (!this.cv) {
      const def = makeCarrier(CV_NAME, c.x, c.z, c.headingDeg);
      const mesh = buildCarrier(def);
      this.root.add(mesh);
      this.cv = { def, mesh, hp: c.hp, status: c.status, speed: 0, sinkT: 0 };
    }
    const cv = this.cv;
    cv.def.x = c.x;
    cv.def.z = c.z;
    cv.def.headingDeg = c.headingDeg;
    cv.hp = c.hp;
    if (cv.status !== c.status) {
      // The host's boat is going down: run our own sinking from here, so the
      // waterline animation is ours rather than a number in a packet.
      if (c.status === "sinking") cv.sinkT = 0;
      cv.status = c.status;
    }
    if (c.status !== "sinking" && c.status !== "sunk") {
      cv.mesh.position.set(c.x, 0, c.z);
      cv.mesh.rotation.y = ((90 - c.headingDeg) * Math.PI) / 180;
    }
  }

  /** The bandit with this id. Packs are tiny, so a scan costs nothing. */
  private findBandit(id: number): Bandit | null {
    for (const b of this.bandits) if (b.id === id) return b;
    return null;
  }

  /**
   * Build a bandit the host owns: same airframe, same tracer colour, no local
   * steering. Used when a packet names an aircraft we have no mesh for yet.
   */
  private spawnMirrorBandit(p: EnemyPose): Bandit {
    const mesh = buildTomcat("bandit");
    mesh.gear.visible = p.onDeck;
    mesh.afterburner.visible = false;
    mesh.wings[0].rotation.y = 0;
    mesh.wings[1].rotation.y = 0;
    const pos = new THREE.Vector3(p.x, p.y, p.z);
    const quat = new THREE.Quaternion(p.qx, p.qy, p.qz, p.qw);
    mesh.group.position.copy(pos);
    mesh.group.quaternion.copy(quat);
    this.root.add(mesh.group);
    const b: Bandit = {
      id: p.id,
      hp: p.hp,
      pos,
      quat,
      bank: 0,
      speed: 200,
      fireCd: 1.5 + hash(p.id) * 2,
      burst: 0,
      evadeT: 0,
      evadeCd: 0,
      phase: hash(p.id * 11.3) * Math.PI * 2,
      mesh,
      catT: p.onDeck ? 0 : -1,
      catStart: pos.clone(),
      catDir: new THREE.Vector3(0, 0, -1),
      climbT: 0,
      sweepT: 1,
      abOn: false,
      abT: 0,
      abCool: 2,
      remote: true,
      netPos: pos.clone(),
      netQuat: quat.clone(),
      netVel: new THREE.Vector3(),
    };
    this.bandits.push(b);
    return b;
  }

  /**
   * Fly a mirrored bandit: ease onto the newest packet, led by the velocity the
   * last two packets imply. Nothing here steers — the host is flying it.
   */
  private stepMirrorBandit(b: Bandit, dt: number): void {
    SYNC.set(
      b.netPos.x + b.netVel.x * MIRROR_LEAD,
      b.netPos.y + b.netVel.y * MIRROR_LEAD,
      b.netPos.z + b.netVel.z * MIRROR_LEAD,
    );
    const k = 1 - Math.exp(-dt / MIRROR_EASE);
    b.pos.lerp(SYNC, k);
    b.quat.slerp(b.netQuat, k);
    b.sweepT = Math.min(1, b.sweepT + dt / 6);
    b.mesh.wings[0].rotation.y = -1.0 * b.sweepT;
    b.mesh.wings[1].rotation.y = 1.0 * b.sweepT;
    b.mesh.gear.visible = b.catT >= 0;
    b.mesh.group.position.copy(b.pos);
    b.mesh.group.quaternion.copy(b.quat);
  }

  /**
   * A round or a warhead landed on a bandit. On a mirror client the damage is
   * applied here and predicted (the hit has to read instantly) and is also sent
   * to the host, who owns the aircraft and settles the kill.
   */
  private damageBandit(b: Bandit, dmg: number, player: AircraftState): void {
    // Last line of defence for damage that arrives over the wire: a non-finite
    // or negative number would make the bandit impossible to kill.
    if (!Number.isFinite(dmg) || dmg <= 0) return;
    b.hp -= Math.min(dmg, MAX_CLAIMED_HIT);
    if (this.mirror) this.hitsOut.push({ id: b.id, dmg });
    if (b.hp <= 0) {
      if (this.mirror) this.takenDown.set(b.id, performance.now());
      this.killBandit(b, player);
    }
  }

  /** Stop fighting and clear everything (menu / cruise mode). */
  clear(): void {
    this.clearFight();
    if (this.cv) {
      this.cv.mesh.removeFromParent();
      disposeSubtree(this.cv.mesh);
      this.cv = null;
    }
  }

  /** Drop bandits, ordnance, flashes and timers — but leave the boat afloat. */
  private clearFight(): void {
    this.active = false;
    this.scenario = "dogfight";
    this.versus = false;
    this.opponents = [];
    this.playerHits = [];
    this.weaponLaunches = [];
    this.gunLive = false;
    this.muzzleT = 0;
    this.threatT = 0;
    this.hitT = 0;
    this.damageT = 0;
    this.launchQueued = 0;
    this.launchTimer = 0;
    this.waveClock = 0;
    this.waveTimer = 0;
    this.fightOver = false;
    this.clearBandits();
    this.clearTargets();
    for (const t of this.tracers) {
      t.mesh.visible = false;
      this.tracerPool.push(t.mesh);
    }
    this.tracers = [];
    for (const f of this.flashPool) {
      f.life = 0;
      f.mesh.visible = false;
    }
    for (const b of this.bombs) {
      b.mesh.visible = false;
      this.bombPool.push(b.mesh);
    }
    this.bombs = [];
    this.bombsLeft = this.bombsMax;
    this.station = 0;
    this.bombCd = 0;
    this.releaseQueue = 0;
    for (const m of this.missiles) {
      m.mesh.visible = false;
      this.missilePool.push(m.mesh);
    }
    this.missiles = [];
    this.missilesLeft = this.missilesMax;
    this.missileCd = 0;
    this.impactAge = Infinity;
    this.releaseAge = Infinity;
    this.setDesignation(null);
    this.designator.visible = false;
  }

  dispose(): void {
    this.root.removeFromParent();
    this.root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | undefined;
      mat?.dispose();
    });
    this.bandits = [];
    this.strikeTargets = [];
    this.tracers = [];
    this.flashPool = [];
    this.tracerPool = [];
    this.bombs = [];
    this.bombPool = [];
    this.missiles = [];
    this.missilePool = [];
    this.cv = null;
    this.designation = null;
    this.designator.geometry.dispose();
    (this.designator.material as THREE.Material).dispose();
  }

  /**
   * Advance the fight one fixed sim step.
   * @param fireHeld true while the player holds the gun trigger
   * @param bombHeld true while the player holds the bomb release
   * @returns true if the player was shot down this step
   */
  step(dt: number, player: AircraftState, fireHeld: boolean, bombHeld = false): boolean {
    // The release and impact markers decay with the sim so they freeze on
    // pause, and they run even with no fight on (a cruise-leg bomb still has to
    // have its hit marked, and the mark has to expire).
    if (this.releaseAge !== Infinity) this.releaseAge += dt;
    if (this.impactAge !== Infinity) this.impactAge += dt;
    // The muzzle flash rides the nose for a moment after each round leaves, so
    // it tracks the jet instead of blinking at an old position.
    if (this.muzzleT > 0) {
      this.muzzleT = Math.max(0, this.muzzleT - dt);
      FWD.set(0, 0, -1).applyQuaternion(player.quat);
      this.muzzle.position.copy(player.pos).addScaledVector(FWD, 8);
      this.muzzle.scale.setScalar(1.3 + 0.7 * Math.abs(Math.sin(player.time * 97)));
      this.muzzle.visible = this.muzzleT > 0;
    } else {
      this.muzzle.visible = false;
    }
    // Bombs are ordnance for both modes: an aircraft on a cruise leg can still
    // pickle them off, and a live one keeps falling after the player is out.
    this.stepBombs(dt, player, bombHeld && !player.result);
    // Missiles likewise: one in the air keeps hunting after the shooter is gone.
    this.stepMissiles(dt, player);
    this.stepDesignator(player);
    if (player.result) return false;
    // The guns are live in every scenario — plinking at the sea on a cruise
    // leg is half the fun — so the trigger is read before the mode branches.
    this.playerGuns(dt, player, fireHeld);
    // A mirror flies the room's aircraft whether or not our own fight is armed:
    // a wingman watching the host's battle should see it even before their own
    // wheels leave the deck. Their guns only open up once we are in it.
    if (this.mirror) {
      for (const b of this.bandits) {
        this.stepMirrorBandit(b, dt);
        if (this.active && b.catT < 0) this.banditGuns(b, dt, player);
      }
    }
    // The boat motors in whether or not the shooting has started: with the
    // fight prepared, it closes while the player is still on the deck.
    if (!this.active) {
      if (this.cv) this.stepCarrier(dt, player);
      this.stepTracers(dt, player);
      this.stepFlashes(dt);
      return false;
    }
    // HUD flash timers decay with the sim so they freeze on pause.
    this.threatT = Math.max(0, this.threatT - dt);
    this.hitT = Math.max(0, this.hitT - dt);
    this.damageT = Math.max(0, this.damageT - dt);
    if (this.versus) {
      this.stepTracers(dt, player);
      this.stepFlashes(dt);
      return false;
    }
    if (this.scenario === "strike") {
      this.stepTargets(dt);
      this.stepTracers(dt, player);
      this.stepFlashes(dt);
      this.stepStrikeWaves(dt, player);
      return false;
    }
    this.stepCarrier(dt, player);
    // A mirror owns no launches and no waves: those aircraft are the host's, and
    // they were already flown by the packets above. Its guns, though, are still
    // ours — so a wingman is shot at, and shoots back, with nothing in the middle
    // of it. That is the least lag a shared fight can have.
    if (!this.mirror) {
      this.stepLaunches(dt, player);
      // Walk the bandits backwards: one that flies into the ground is removed on
      // the spot, and splicing the current index is only safe that way.
      for (let i = this.bandits.length - 1; i >= 0; i--) {
        const b = this.bandits[i];
        if (!this.stepBandit(b, dt, player)) continue;
        this.banditGuns(b, dt, player);
      }
    }
    this.stepCollisions(player);
    this.stepTracers(dt, player);
    this.stepFlashes(dt);
    if (!this.mirror) this.stepWaves(dt, player);
    return false;
  }

  /** HUD snapshot of the fight, measured from the player. */
  hud(player: AircraftState): DogfightHud {
    if (this.scenario === "strike") return this.strikeHud(player);
    let nearest: Bandit | null = null;
    let nearestD = Infinity;
    for (const b of this.bandits) {
      const d = b.pos.distanceTo(player.pos);
      if (d < nearestD) {
        nearestD = d;
        nearest = b;
      }
    }
    const dx = (nearest?.pos.x ?? 0) - player.pos.x;
    const dz = (nearest?.pos.z ?? 0) - player.pos.z;
    // Lead points: where the player's rounds and a bandit meet, for the HUD's
    // gun cue. Rounds leave at MUZZLE_V plus the shooter's own speed.
    const gunSpeed = Math.max(MUZZLE_V + player.vel.length(), 1);
    const spots = this.bandits.map((b) => {
      const dist = b.pos.distanceTo(player.pos);
      const vel = DIR.set(0, 0, -1).applyQuaternion(b.quat).multiplyScalar(b.speed).sub(player.vel);
      let tof = Math.min(dist / gunSpeed, 2);
      let lx = b.pos.x + vel.x * tof;
      let ly = b.pos.y + vel.y * tof;
      let lz = b.pos.z + vel.z * tof;
      // refine once against the lead point's own distance
      tof = Math.min(Math.hypot(lx - player.pos.x, ly - player.pos.y, lz - player.pos.z) / gunSpeed, 2);
      lx = b.pos.x + vel.x * tof;
      ly = b.pos.y + vel.y * tof;
      lz = b.pos.z + vel.z * tof;
      return { x: b.pos.x, y: b.pos.y, z: b.pos.z, lx, ly, lz, km: dist / 1000 };
    });
    for (const opponent of this.opponents) {
      const dist = opponent.pos.distanceTo(player.pos);
      const lead = opponent.pos.clone().addScaledVector(DIR.copy(opponent.vel).sub(player.vel), Math.min(dist / MUZZLE_V, 2));
      spots.push({ x: opponent.pos.x, y: opponent.pos.y, z: opponent.pos.z, lx: lead.x, ly: lead.y, lz: lead.z, km: dist / 1000 });
    }
    const cv = this.cv;
    let carrier: DogfightHud["carrier"] = null;
    if (cv) {
      const cdx = cv.def.x - player.pos.x;
      const cdz = cv.def.z - player.pos.z;
      carrier = {
        name: cv.def.name,
        x: cv.def.x,
        y: cv.def.deckY,
        z: cv.def.z,
        distKm: Math.hypot(cdx, cdz) / 1000,
        brgDeg: (Math.atan2(cdx, -cdz) * 180) / Math.PI,
        hp: Math.max(0, Math.round(cv.hp)),
        status: cv.status,
        inbound: this.launchQueued + this.bandits.filter((b) => b.catT >= 0).length,
      };
    }
    return {
      active: this.active,
      strike: false,
      hull: Math.max(0, Math.round(this.hull)),
      kills: this.kills,
      wave: this.wave,
      bandits: this.versus ? this.opponents.length : this.bandits.length,
      nearestKm: nearest ? nearestD / 1000 : 0,
      nearestBrgDeg: nearest ? (Math.atan2(dx, -dz) * 180) / Math.PI : 0,
      markers: this.versus ? this.opponents.map(b => ({ x: b.pos.x, z: b.pos.z })) : this.bandits.map((b) => ({ x: b.pos.x, z: b.pos.z })),
      threat: this.threatT > 0,
      firing: this.gunLive,
      hitT: this.hitT / HIT_FLASH,
      damageT: this.damageT / DAMAGE_FLASH,
      spots,
      bombs: this.bombsLeft,
      bombsMax: this.bombsMax,
      bombsAway: this.bombs.length,
      bombsTracking: this.bombs.filter((b) => b.guided).length,
      missiles: this.missilesLeft,
      missilesMax: this.missilesMax,
      designated: this.designation
        ? (() => {
            const d = this.designation!;
            return {
              x: d.x,
              y: d.y,
              z: d.z,
              km: Math.hypot(d.x - player.pos.x, d.y - player.pos.y, d.z - player.pos.z) / 1000,
            };
          })()
        : null,
      released: this.releaseAge < RELEASE_MARKER_TTL
        ? { x: this.releaseMarker.x, y: this.releaseMarker.y, z: this.releaseMarker.z, age: this.releaseAge }
        : null,
      landed: this.impactAge < IMPACT_MARKER_TTL
        ? { x: this.lastImpact.x, y: this.lastImpact.y, z: this.lastImpact.z, age: this.impactAge, kind: this.lastImpactKind ?? "ground" }
        : null,
      carrier,
    };
  }

  /** HUD snapshot for the strike scenario: targets instead of bandits. */
  private strikeHud(player: AircraftState): DogfightHud {
    let nearestD = Infinity;
    let ndx = 0;
    let ndz = 0;
    let alive = 0;
    const spots: DogfightHud["spots"] = [];
    const markers: Array<{ x: number; z: number }> = [];
    for (const t of this.strikeTargets) {
      if (t.dead) continue;
      alive++;
      const d = t.pos.distanceTo(player.pos);
      if (d < nearestD) {
        nearestD = d;
        ndx = t.pos.x - player.pos.x;
        ndz = t.pos.z - player.pos.z;
      }
      const ty = t.pos.y + 6;
      spots.push({ x: t.pos.x, y: ty, z: t.pos.z, lx: t.pos.x, ly: ty, lz: t.pos.z, km: d / 1000 });
      markers.push({ x: t.pos.x, z: t.pos.z });
    }
    return {
      active: this.active,
      strike: true,
      hull: Math.max(0, Math.round(this.hull)),
      kills: this.kills,
      wave: this.wave,
      bandits: alive,
      nearestKm: alive ? nearestD / 1000 : 0,
      nearestBrgDeg: alive ? (Math.atan2(ndx, -ndz) * 180) / Math.PI : 0,
      markers,
      threat: false,
      firing: this.gunLive,
      hitT: this.hitT / HIT_FLASH,
      damageT: 0,
      spots,
      bombs: this.bombsLeft,
      bombsMax: this.bombsMax,
      bombsAway: this.bombs.length,
      bombsTracking: this.bombs.filter((b) => b.guided).length,
      missiles: this.missilesLeft,
      missilesMax: this.missilesMax,
      designated: this.designation
        ? (() => {
            const d = this.designation!;
            return {
              x: d.x,
              y: d.y,
              z: d.z,
              km: Math.hypot(d.x - player.pos.x, d.y - player.pos.y, d.z - player.pos.z) / 1000,
            };
          })()
        : null,
      released: this.releaseAge < RELEASE_MARKER_TTL
        ? { x: this.releaseMarker.x, y: this.releaseMarker.y, z: this.releaseMarker.z, age: this.releaseAge }
        : null,
      landed: this.impactAge < IMPACT_MARKER_TTL
        ? { x: this.lastImpact.x, y: this.lastImpact.y, z: this.lastImpact.z, age: this.impactAge, kind: this.lastImpactKind ?? "ground" }
        : null,
      carrier: null,
    };
  }

  /** Rounds currently in flight — diagnostics and headless checks. */
  tracerCount(): number {
    return this.tracers.length;
  }

  /**
   * Live weapon positions, for the target pod's weapon symbology and for
   * headless checks. Allocates; not for per-frame hot loops.
   */
  bombPositions(): THREE.Vector3[] {
    return this.bombs.map((b) => b.pos.clone());
  }

  private cueOut: GunCue = { x: 0, y: 0, z: 0, range: 0, t: 0, hit: null, live: false };

  /**
   * March the player's rounds from this frame's muzzle state and report where
   * they end up. Evaluated once per rendered frame by the HUD, so the returned
   * object is reused — read it, do not keep it. Uses the same assisted bore
   * the fired rounds get, so the pipper shows where the bullets actually go.
   */
  gunSolution(player: AircraftState): GunCue {
    const cue = this.cueOut;
    const fwd = GUN_FWD.set(0, 0, -1).applyQuaternion(player.quat);
    GUN_MUZ.copy(player.pos).addScaledVector(fwd, 8);
    GUN_P.copy(GUN_MUZ);
    // Rounds leave at muzzle speed along the (assisted) bore, plus the jet's
    // own velocity — identical to what fireGuns will actually spawn.
    const assisted = this.assistBore(player, GUN_MUZ, fwd);
    GUN_V.copy(assisted).multiplyScalar(MUZZLE_V).add(player.vel);
    // A lit pipper must mean the same contact radius as the actual projectile.
    const airR = HIT_RADIUS;
    const cv = this.cv;
    const shipLive = cv !== null && cv.status !== "sinking" && cv.status !== "sunk";
    const steps = Math.round(TRACER_LIFE / GUN_DT);
    let hit: GunCue["hit"] = null;
    let t = 0;
    this.pathCount = 0;
    for (let i = 0; i < steps; i++) {
      const atm = atmosphere(GUN_P.y);
      const sp = GUN_V.length();
      if (sp > 1) {
        const k = (0.5 * atm.rho * BULLET_CDA * sp) / BULLET_MASS;
        GUN_V.multiplyScalar(Math.max(0, 1 - k * GUN_DT));
      }
      GUN_V.y -= GRAVITY * GUN_DT;
      GUN_PREV.copy(GUN_P);
      GUN_P.addScaledVector(GUN_V, GUN_DT);
      t += GUN_DT;
      // sample the trajectory for the HUD's bullet ladder (every ~0.1 s)
      if (i % 12 === 0 && this.pathCount < this.pathBuf.length) {
        this.pathBuf[this.pathCount++].copy(GUN_P);
      }
      for (const b of this.bandits) {
        if (b.catT >= 0) continue;
        // The bandit keeps flying while the round is in the air, so test the
        // path against where the bandit WILL be at this step's flight time —
        // straight-line along its current velocity (jinks excluded). Testing the
        // stale position made the pipper go dark in every merge even when a
        // burst would connect.
        const vel = DIR.set(0, 0, -1).applyQuaternion(b.quat).multiplyScalar(b.speed);
        GUN_B.copy(b.pos).addScaledVector(vel, t);
        if (segSphere(GUN_PREV, GUN_P, GUN_B, airR)) {
          hit = "bandit";
          break;
        }
      }
      for (const opponent of this.opponents) {
        GUN_B.copy(opponent.pos).addScaledVector(opponent.vel, t);
        if (segSphere(GUN_PREV, GUN_P, GUN_B, airR)) { hit = "bandit"; break; }
      }
      if (hit) break;
      for (const t of this.strikeTargets) {
        if (t.dead) continue;
        GUN_T.copy(t.pos);
        GUN_T.y += 8;
        if (segSphere(GUN_PREV, GUN_P, GUN_T, t.radius + 2)) {
          hit = "target";
          break;
        }
      }
      if (hit) break;
      if (shipLive && GUN_P.y <= cv!.def.deckY + 6 && isOnDeck(cv!.def, GUN_P.x, GUN_P.z)) {
        hit = "ship";
        break;
      }
      if (GUN_P.y <= groundAt(GUN_P.x, GUN_P.z).y) {
        // back the solution up to the actual surface crossing inside this step,
        // so the pipper sits ON the water/deck instead of one integration step
        // below it (the round arrives at ~800 m/s of descent: a whole step is
        // several metres of overshoot)
        const gy = groundAt(GUN_P.x, GUN_P.z).y;
        const f = Math.min(1, Math.max(0, (GUN_PREV.y - gy) / (GUN_PREV.y - GUN_P.y)));
        GUN_P.lerpVectors(GUN_PREV, GUN_P, f);
        hit = "ground";
        break;
      }
    }
    cue.x = GUN_P.x;
    cue.y = GUN_P.y;
    cue.z = GUN_P.z;
    cue.t = t;
    cue.hit = hit;
    cue.range = GUN_P.distanceTo(GUN_MUZ);
    cue.live = hit !== null || cue.range <= GUN_RANGE;
    return cue;
  }

  /**
   * The sampled bullet path behind the gun cue, muzzle to solution point: the
   * HUD draws it as a ladder of dots so "where will my rounds go" is answered
   * before the trigger is squeezed. Reused buffer — read it, do not keep it.
   */
  gunPath(): { points: THREE.Vector3[]; n: number } {
    this.pathOut.n = this.pathCount;
    return this.pathOut;
  }

  /**
   * The gun's bore with the tiny aim assist applied. Assists only when the
   * nearest live bandit sits inside a narrow cone of where the nose points,
   * and then only bends the shot up to ASSIST_MAX toward the bandit's LEAD
   * point — the spot a burst should actually be aimed at.
   */
  private assistBore(
    _player: AircraftState,
    muzzle: THREE.Vector3,
    bore: THREE.Vector3,
  ): THREE.Vector3 {
    let best: THREE.Vector3 | null = null;
    let bestAngle = ASSIST_CONE;
    for (const b of this.bandits) {
      if (b.catT >= 0) continue;
      TMP.copy(b.pos).sub(muzzle);
      const dist = TMP.length();
      if (dist > ASSIST_RANGE) continue;
      // lead the target like a burst should be led
      const vel = DIR.set(0, 0, -1).applyQuaternion(b.quat).multiplyScalar(b.speed);
      const tof = Math.min(dist / MUZZLE_V, 1.2);
      TMP.addScaledVector(vel.sub(_player.vel), tof);
      TMP.y += .5 * GRAVITY * tof * tof;
      // TMP is already relative to the muzzle; subtracting it again made
      // assist depend on the aircraft's world position and altitude.
      TMP.normalize();
      const ang = bore.angleTo(TMP);
      if (ang < bestAngle) {
        bestAngle = ang;
        best = TMP.clone();
      }
    }
    for (const opponent of this.opponents) {
      TMP.copy(opponent.pos).sub(muzzle);
      const distance = TMP.length();
      if (distance > ASSIST_RANGE) continue;
      const tof = Math.min(distance / MUZZLE_V, 1.2);
      TMP.addScaledVector(DIR.copy(opponent.vel).sub(_player.vel), tof);
      TMP.y += .5 * GRAVITY * tof * tof;
      TMP.normalize();
      const angle = bore.angleTo(TMP);
      if (angle < bestAngle) { bestAngle = angle; best = TMP.clone(); }
    }
    if (!best) return bore;
    // pull a fraction of the remaining angle toward the lead point
    const pull = Math.min(bestAngle, ASSIST_MAX);
    AXIS.crossVectors(bore, best);
    if (AXIS.lengthSq() < 1e-10) return bore;
    AXIS.normalize();
    return bore.clone().applyAxisAngle(AXIS, pull);
  }

  /**
   * Live bandit positions + velocities, for radar/aim-assist features and
   * headless tests. Allocates; not for per-frame hot loops.
   */
  targets(): Array<{ id: number; pos: THREE.Vector3; vel: THREE.Vector3 }> {
    const out: Array<{ id: number; pos: THREE.Vector3; vel: THREE.Vector3 }> = [];
    for (const b of this.bandits) {
      const vel = new THREE.Vector3(0, 0, -1).applyQuaternion(b.quat).multiplyScalar(b.speed);
      // id: stable per bandit, so callers that track motion (accel estimators)
      // do not confuse two bandits that swap nearest within a step.
      out.push({ id: b.id, pos: b.pos.clone(), vel });
    }
    return out;
  }

  // -------------------------------------------------------------------------
  // Hostile carrier

  /**
   * Put the hostile boat on the horizon, ahead of the player's nose when there
   * is open water there, and let it steam in from there.
   */
  private spawnEnemyCarrier(player: AircraftState): void {
    const hdg = this.playerHeading(player);
    const base = hdg + (hash(this.wave * 23.7 + 4.1) * 2 - 1) * 0.8;
    // Fan out around the first bearing until the whole approach is water —
    // a carrier must not spawn on a hillside, and must not have to cross one.
    // The fan widens to the full circle, so an island dead ahead cannot leave
    // the boat beached.
    let ang = base;
    for (let i = 0; i < 17; i++) {
      if (i > 0) ang = base + (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * 0.42;
      const x = player.pos.x + Math.sin(ang) * CV_START_DIST;
      const z = player.pos.z - Math.cos(ang) * CV_START_DIST;
      const mx = (x + player.pos.x) / 2;
      const mz = (z + player.pos.z) / 2;
      // the chain is 60 km across: keep the fan inside it, and outside that
      // the heightfield is open ocean anyway
      if (Math.abs(x) > 40000 || Math.abs(z) > 40000) continue;
      if (groundAt(x, z).kind !== "water" || groundAt(mx, mz).kind !== "water") continue;
      break;
    }
    const x = player.pos.x + Math.sin(ang) * CV_START_DIST;
    const z = player.pos.z - Math.cos(ang) * CV_START_DIST;
    // The bow points back at the player: it is coming for us.
    const headingDeg = (((ang + Math.PI) * 180) / Math.PI + 360) % 360;
    const def = makeCarrier(CV_NAME, x, z, headingDeg);
    const mesh = buildCarrier(def);
    this.root.add(mesh);
    this.cv = { def, mesh, hp: CV_HP, status: "closing", speed: 0, sinkT: 0 };
  }

  /** Steam the hostile boat toward the player and hold it at stand-off range. */
  private stepCarrier(dt: number, player: AircraftState): void {
    const cv = this.cv;
    if (!cv) return;
    if (cv.status === "sinking" || cv.status === "sunk") {
      cv.sinkT += dt;
      cv.mesh.position.y = -Math.min(cv.sinkT * 0.55, 17);
      cv.mesh.rotation.z = Math.min(cv.sinkT * 0.008, 0.22);
      if (cv.status === "sinking" && cv.sinkT > 60) cv.status = "sunk";
      return;
    }
    // A wingman's boat is steered by the host's packets, not by our own AI.
    if (this.mirror) return;
    const def = cv.def;
    const toX = player.pos.x - def.x;
    const toZ = player.pos.z - def.z;
    const dist = Math.hypot(toX, toZ);

    // --- rudder: bring the bow onto the player, slowly ---
    const wantHdg = ((Math.atan2(toX, -toZ) * 180) / Math.PI + 360) % 360;
    const delta = ((((wantHdg - def.headingDeg) % 360) + 540) % 360) - 180;
    const maxTurn = CV_TURN_DEG * dt;
    def.headingDeg =
      (def.headingDeg + THREE.MathUtils.clamp(delta, -maxTurn, maxTurn) + 360) % 360;

    // --- throttle: close the range, then hold station short of it ---
    let target = 0;
    if (dist > CV_STANDOFF + 600) target = CV_CLOSE_SPEED;
    else if (dist > CV_STANDOFF) target = (CV_CLOSE_SPEED * (dist - CV_STANDOFF)) / 600;
    // Never run down a friendly anchorage: the fleet is not a target.
    for (const c of carriers()) {
      if (Math.hypot(c.x - def.x, c.z - def.z) < CV_FRIENDLY_CLEAR) target = 0;
    }
    cv.speed += (target - cv.speed) * (1 - Math.exp(-dt / 4));

    // --- advance, but only over open water ---
    if (cv.speed > 0.1) {
      const { fwd } = deckAxes(def.headingDeg);
      const ahead = 900;
      if (groundAt(def.x + fwd[0] * ahead, def.z + fwd[1] * ahead).kind === "water") {
        def.x += fwd[0] * cv.speed * dt;
        def.z += fwd[1] * cv.speed * dt;
      } else {
        def.headingDeg = (def.headingDeg + 30) % 360; // shoal ahead: sheer off
      }
    }
    cv.status = cv.speed > 12 ? "closing" : "on station";
    cv.mesh.position.set(def.x, 0, def.z);
    cv.mesh.rotation.y = ((90 - def.headingDeg) * Math.PI) / 180;
  }

  /** Launch aircraft while a wave is queued and the boat is in range. */
  private stepLaunches(dt: number, player: AircraftState): void {
    const cv = this.cv;
    if (!cv || this.launchQueued <= 0) return;
    if (cv.status === "sinking" || cv.status === "sunk") return;
    const dist = Math.hypot(player.pos.x - cv.def.x, player.pos.z - cv.def.z);
    // Hold the deck until the boat is in range, unless the player is running
    // away hard — then launch anyway and let the bandits catch up.
    if (dist > CV_LAUNCH_RANGE && this.waveClock < CV_LAUNCH_HOLD) return;
    this.launchTimer -= dt;
    if (this.launchTimer > 0) return;
    this.launchTimer = CV_LAUNCH_GAP;
    this.launchQueued--;
    this.launchOne(player, cv);
  }

  /** Roll one bandit: down a catapult, off the bow, then it is the AI's job. */
  private launchOne(player: AircraftState, cv: EnemyCarrier): void {
    const def = cv.def;
    this.launchSide = -this.launchSide;
    const { fwd, right } = deckAxes(def.headingDeg);
    const across = this.launchSide * CV_CAT_LATERAL;
    const start = new THREE.Vector3(
      def.x + fwd[0] * CAT_START_ALONG + right[0] * across,
      def.deckY + 2.4,
      def.z + fwd[1] * CAT_START_ALONG + right[1] * across,
    );
    const id = this.nextId++;
    const mesh = buildTomcat("bandit");
    mesh.gear.visible = true; // gear down on the cat, up once it is flying
    mesh.afterburner.visible = true; // deck launches are full-burner shots
    mesh.wings[0].rotation.y = 0; // spread for the deck
    mesh.wings[1].rotation.y = 0;
    mesh.group.position.copy(start);
    this.root.add(mesh.group);
    const b: Bandit = {
      id,
      hp: BANDIT_HP,
      pos: start.clone(),
      quat: new THREE.Quaternion(),
      bank: 0,
      speed: 0,
      fireCd: 2 + hash(id) * 2,
      burst: 0,
      evadeT: 0,
      evadeCd: 0,
      phase: hash(id * 11.3) * Math.PI * 2,
      mesh,
      catT: 0,
      catStart: start,
      catDir: new THREE.Vector3(fwd[0], 0, fwd[1]),
      climbT: 0,
      sweepT: 0,
      abOn: false,
      abT: 0,
      abCool: 2,
      // Ours: this one is steered here, not by a packet.
      remote: false,
      netPos: start.clone(),
      netQuat: new THREE.Quaternion(),
      netVel: new THREE.Vector3(),
    };
    this.setCatPose(b, def.deckY);
    this.bandits.push(b);
    if (this.bandits.length === 1) this.banner(player, `CAT LAUNCH — BANDITS OFF ${CV_NAME}`);
  }

  /** Deck pose: on the cat at `t` seconds after release (heading + 6 deg nose up). */
  private setCatPose(b: Bandit, deckY: number): void {
    const t = b.catT;
    const dist = Math.min(0.5 * CAT_ACCEL * t * t, 0.5 * CAT_ACCEL * CAT_TIME * CAT_TIME);
    b.pos.copy(b.catStart).addScaledVector(b.catDir, dist);
    b.pos.y = deckY + 2.4;
    const headingDeg = this.cv ? this.cv.def.headingDeg : 0;
    HQ.setFromAxisAngle(WORLD_UP, (-headingDeg * Math.PI) / 180);
    b.quat.copy(HQ).multiply(PITCH_Q);
    b.speed = CAT_ACCEL * t;
    b.mesh.group.position.copy(b.pos);
    b.mesh.group.quaternion.copy(b.quat);
  }

  /** One bandit's catapult stroke; hand off to the AI at end of stroke. */
  private stepLaunch(b: Bandit, dt: number): void {
    b.catT += dt;
    const deckY = this.cv ? this.cv.def.deckY : 19;
    if (CAT_ACCEL * b.catT < CAT_V_END) {
      this.setCatPose(b, deckY);
      return;
    }
    // off the bow: pin the pose at end of stroke, then go flying
    b.catT = CAT_TIME;
    this.setCatPose(b, deckY);
    b.catT = -1;
    b.speed = CAT_V_END;
    b.climbT = CV_CLIMB_TIME;
    b.mesh.gear.visible = false;
    b.mesh.afterburner.visible = false;
    // the deck shot is full burner: light it as it comes off the bow
    b.abOn = true;
    b.abT = 4;
    b.abCool = 0;
  }

  // -------------------------------------------------------------------------
  // Bombs

  /** Arm, release and fly the player's bombs, one sim step at a time. */
  private stepBombs(dt: number, player: AircraftState, held: boolean): void {
    this.bombCd = Math.max(0, this.bombCd - dt);
    if ((held || this.releaseQueue > 0) && this.bombCd <= 0 && this.bombsLeft > 0 && !player.onGround) {
      if (!this.bombReachable(player)) {
        this.releaseQueue = 0;
        this.banner(player, "BOMB CANNOT REACH TARGET — CLOSE IN OR CLIMB");
      } else {
        this.releaseBomb(player);
      }
      this.bombCd = BOMB_RELEASE_CD;
      if (!held) this.releaseQueue = Math.max(0, this.releaseQueue - 1);
      if (this.bombsLeft === 0) this.banner(player, "BOMBS EXPENDED");
    }
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const b = this.bombs[i];
      advanceBomb(b.pos, b.vel, b.guided ? b.target : null, dt);
      b.mesh.position.copy(b.pos);
      b.mesh.quaternion.setFromUnitVectors(NOSE_Z, DIR.copy(b.vel).normalize());

      // --- wake: every store trails smoke all the way down ---
      b.trailT -= dt;
      if (b.trailT <= 0) {
        if (b.guided) this.blasts.trail(b.pos, 1.6, LGB_TRAIL_TTL);
        else this.blasts.trail(b.pos, 1.15, BOMB_TRAIL_TTL);
        b.trailT = b.guided ? LGB_TRAIL : BOMB_TRAIL;
      }

      b.arm -= dt;
      if (b.arm > 0) continue;
      // A guided weapon that reaches its spot detonates there, even on a limb
      // where the surface is a moving deck.
      if (b.guided && b.target && b.pos.distanceToSquared(b.target) < LGB_DET * LGB_DET) {
        const onWater = groundAt(b.target.x, b.target.z).kind === "water";
        this.impactBomb(i, b.target, onWater ? "water" : "ground", player);
        continue;
      }
      // A bomb that catches an aircraft breaks it up — everything is a target.
      let hitAir = false;
      for (const bandit of this.bandits) {
        if (bandit.catT >= 0) continue;
        if (bandit.pos.distanceTo(b.pos) < BOMB_AIR_RADIUS) {
          this.hitT = HIT_FLASH;
          this.blasts.spawn(bandit.pos.clone(), "air", 1);
          this.damageBandit(bandit, BOMB_HP * 2, player);
          hitAir = true;
          break;
        }
      }
      if (hitAir) {
        this.impactBomb(i, b.pos, "air", player);
        continue;
      }
      // A strike target is solid: a bomb that reaches a ship or a structure
      // detonates on it rather than falling through to the surface below.
      let hitTarget = false;
      for (const t of this.strikeTargets) {
        if (t.dead) continue;
        TMP.copy(t.pos);
        TMP.y += 8;
        if (TMP.distanceToSquared(b.pos) < (t.radius + 3) * (t.radius + 3)) {
          this.impactBomb(i, b.pos, "ground", player);
          hitTarget = true;
          break;
        }
      }
      if (hitTarget) continue;
      // the hostile deck is not part of the world layout, so it is checked first
      const cv = this.cv;
      if (
        cv &&
        cv.status !== "sinking" &&
        cv.status !== "sunk" &&
        b.pos.y <= cv.def.deckY + 2 &&
        isOnDeck(cv.def, b.pos.x, b.pos.z)
      ) {
        this.damageCarrier(b.pos, player, BOMB_HP);
        this.impactBomb(i, b.pos, "ground", player);
        continue;
      }
      const g = groundAt(b.pos.x, b.pos.z);
      if (b.pos.y <= g.y) {
        this.impactBomb(i, b.pos, g.kind === "water" ? "water" : "ground", player);
      }
    }
  }

  /**
   * Detonate a weapon: a fireball on land, a deck or in the air, a water column
   * in the sea. Retires the bomb and remembers the spot for diagnostics.
   */
  private impactBomb(i: number, at: THREE.Vector3, kind: BlastKind, player: AircraftState): void {
    const g = groundAt(at.x, at.z);
    const y = Math.max(at.y, g.y + (kind === "air" ? 0 : 1.5));
    this.lastImpact.set(at.x, y, at.z);
    this.lastImpactKind = kind;
    this.impactAge = 0;
    this.blastTargets(at, player);
    this.blasts.spawn(TMP.set(at.x, y, at.z), kind, kind === "water" ? 1.15 : 1);
    // A column that outlives the fireball: "did it hit?" has to stay answerable
    // for a few seconds after the flash, from any camera.
    this.blasts.trail(TMP.set(at.x, y + 6, at.z), 3.4, IMPACT_SMOKE_TTL);
    this.blasts.trail(TMP.set(at.x, y + 16, at.z), 5, IMPACT_SMOKE_TTL * 0.8);
    this.flash(TMP);
    this.retireBomb(i);
  }

  /** Pickle one off the next rack station: it inherits the jet's velocity. */
  private releaseBomb(player: AircraftState): void {
    const mesh = this.bombPool.pop();
    if (!mesh) return;
    const [sx, sy, sz] = BOMB_STATIONS[this.station % BOMB_STATIONS.length];
    this.station++;
    const pos = player.pos.clone().add(new THREE.Vector3(sx, sy, sz).applyQuaternion(player.quat));
    // the rack kicks it down and clear of the airframe; after that it is ballistic
    const vel = player.vel
      .clone()
      .add(new THREE.Vector3(0, -2.5, 0).applyQuaternion(player.quat));
    mesh.visible = true;
    mesh.position.copy(pos);
    // A release has to read from the chase camera: a bright kick off the rack,
    // a short-lived flash and a smoke marker that stays on the rack position for
    // a moment, so the drop is unmistakable even before the bomb is in view.
    this.blasts.spawnSpark(pos, false);
    this.blasts.trail(pos, 1.5, 2.2);
    this.flash(pos);
    this.pushReleaseMarker(pos);
    const guided = this.designation !== null;
    this.bombs.push({
      pos,
      vel,
      arm: BOMB_ARM,
      mesh,
      guided,
      target: guided ? this.designation!.clone() : null,
      trailT: 0,
    });
    this.bombsLeft--;
  }

  /**
   * Remember where the last release happened, so the HUD can mark the rack
   * position for a moment — the pilot sees the pickle even if the store itself
   * is hidden under the wing.
   */
  private pushReleaseMarker(at: THREE.Vector3): void {
    this.releaseMarker.copy(at);
    this.releaseAge = 0;
  }

  private retireBomb(i: number): void {
    const b = this.bombs[i];
    b.mesh.visible = false;
    this.bombPool.push(b.mesh);
    this.bombs.splice(i, 1);
  }

  // -------------------------------------------------------------------------
  // Missiles

  /**
   * Ask for one missile launch (the missile key). The shot is taken on the
   * next sim step if a live target exists and the jet is airborne; the racks
   * are per-airframe (the Tomcat and Hornet ride two, the Intruder none).
   */
  requestMissile(player: AircraftState): void {
    if (this.missileCd > 0 || this.missilesLeft <= 0 || this.missilePool.length === 0) return;
    if (player.onGround || player.result) {
      if (!player.onGround) return;
      this.banner(player, "MISSILES — AIRBORNE ONLY");
      return;
    }
    const target = this.nearestMissileTarget(player.pos);
    if (!target) {
      this.banner(player, "NO MISSILE TARGET ON THE GRID");
      return;
    }
    this.fireMissile(player);
  }

  /** The nearest thing a seeker can lock: bandit, strike target or the boat. */
  private nearestMissileTarget(from: THREE.Vector3): THREE.Vector3 | null {
    let best: THREE.Vector3 | null = null;
    let bestD = Infinity;
    for (const b of this.bandits) {
      if (b.catT >= 0) continue;
      const d = b.pos.distanceToSquared(from);
      if (d < bestD) {
        bestD = d;
        best = b.pos;
      }
    }
    for (const opponent of this.opponents) {
      const d = opponent.pos.distanceToSquared(from);
      if (d < bestD) { bestD = d; best = opponent.pos; }
    }
    for (const t of this.strikeTargets) {
      if (t.dead) continue;
      const d = t.pos.distanceToSquared(from);
      if (d < bestD) {
        bestD = d;
        best = t.pos;
      }
    }
    const cv = this.cv;
    if (cv && cv.status !== "sinking" && cv.status !== "sunk") {
      CVPT.set(cv.def.x, cv.def.deckY + 6, cv.def.z);
      const d = CVPT.distanceToSquared(from);
      if (d < bestD) {
        bestD = d;
        best = CVPT;
      }
    }
    return best;
  }

  /** Drop one off the next rail: it inherits the jet's velocity vector. */
  private fireMissile(player: AircraftState): void {
    const mesh = this.missilePool.pop();
    if (!mesh) return;
    const [sx, sy, sz] = MISSILE_STATIONS[this.missiles.length % MISSILE_STATIONS.length];
    const pos = player.pos.clone().add(new THREE.Vector3(sx, sy, sz).applyQuaternion(player.quat));
    // A rail launch: down and outboard first, then the motor lights and the
    // seeker pulls it around.
    const vel = player.vel
      .clone()
      .add(new THREE.Vector3(sx > 0 ? 5 : -5, -3.5, 0).applyQuaternion(player.quat));
    mesh.visible = true;
    mesh.position.copy(pos);
    mesh.quaternion.setFromUnitVectors(NOSE_Z, DIR.copy(vel).normalize());
    // the launch has to read: rail flash, a puff of motor smoke, a bright core
    this.blasts.spawnSpark(pos, false);
    this.blasts.trail(pos, 1.3, 1.6);
    this.flash(pos);
    this.pushReleaseMarker(pos);
    this.missiles.push({
      pos,
      vel,
      motor: MISSILE_MOTOR,
      arm: MISSILE_ARM,
      trailT: 0,
      mesh,
    });
    if (this.versus) this.weaponLaunches.push({ weapon: "missile", pos: pos.toArray(), vel: vel.toArray() });
    this.missilesLeft--;
    this.missileCd = MISSILE_CD;
    this.banner(
      player,
      this.missilesLeft > 0 ? "FOX 2 — MISSILE AWAY" : "FOX 2 — LAST MISSILE AWAY",
    );
  }

  /** Fly the seeker heads, one sim step at a time. */
  private stepMissiles(dt: number, player: AircraftState): void {
    this.missileCd = Math.max(0, this.missileCd - dt);
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      // --- motor: thrust, then an unpowered coast with drag and sag ---
      if (m.motor > 0) {
        m.motor -= dt;
        const speed = m.vel.length();
        if (speed > 1) {
          DIR.copy(m.vel).divideScalar(speed);
          m.vel.addScaledVector(DIR, MISSILE_ACCEL * dt);
          if (m.vel.length() > MISSILE_V_MAX) m.vel.setLength(MISSILE_V_MAX);
        }
      } else {
        const atm = atmosphere(m.pos.y);
        const sp = m.vel.length();
        if (sp > 1) {
          const k = (0.5 * atm.rho * MISSILE_CD0 * MISSILE_AREA * sp) / MISSILE_MASS;
          m.vel.multiplyScalar(Math.max(0, 1 - k * dt));
        }
        m.vel.y -= GRAVITY * 0.6 * dt; // a lifting body, not a brick
      }
      m.pos.addScaledVector(m.vel, dt);

      // --- seeker: nearest live enemy, re-locked every step ---
      m.arm -= dt;
      if (m.arm <= 0) {
        const target = this.nearestMissileTarget(m.pos);
        if (target) {
          const speed = m.vel.length();
          if (speed > 1) {
            DIR.copy(m.vel).divideScalar(speed);
            TMP.copy(target).sub(m.pos);
            const toT = TMP.length();
            if (toT < MISSILE_DET) {
              this.impactMissile(i, m.pos, "air", player);
              continue;
            }
            TMP.divideScalar(toT);
            const ang = DIR.angleTo(TMP);
            if (ang > 1e-4) {
              AXIS.crossVectors(DIR, TMP);
              if (AXIS.lengthSq() < 1e-8) AXIS.set(0, 1, 0);
              AXIS.normalize();
              DIR.applyAxisAngle(AXIS, Math.min(ang, MISSILE_TURN * dt));
              m.vel.copy(DIR).multiplyScalar(speed);
            }
          }
        }
      }

      // --- plume: hard white smoke while the motor burns, wisps after ---
      m.trailT -= dt;
      if (m.trailT <= 0) {
        this.blasts.trail(m.pos, m.motor > 0 ? 1.9 : 0.9, m.motor > 0 ? 1.6 : 1.1);
        m.trailT = m.motor > 0 ? MISSILE_TRAIL_HOT : MISSILE_TRAIL_COLD;
      }

      m.mesh.position.copy(m.pos);
      m.mesh.quaternion.setFromUnitVectors(NOSE_Z, DIR.copy(m.vel).normalize());

      // --- detonations: any airframe, the boat's deck, or the surface ---
      let hit: BlastKind | null = null;
      for (const b of this.bandits) {
        if (b.catT >= 0) continue;
        if (b.pos.distanceTo(m.pos) < MISSILE_AIR_R) {
          this.hitT = HIT_FLASH;
          this.damageBandit(b, MISSILE_HP, player);
          hit = "air";
          break;
        }
      }
      if (!hit && this.opponents.some(o => o.pos.distanceTo(m.pos) < MISSILE_AIR_R)) hit = "air";
      if (!hit) {
        for (const t of this.strikeTargets) {
          if (t.dead) continue;
          TMP.copy(t.pos);
          TMP.y += 8;
          if (TMP.distanceTo(m.pos) < t.radius + MISSILE_DET) {
            hit = "ground";
            break;
          }
        }
      }
      if (!hit) {
        const cv = this.cv;
        if (
          cv &&
          cv.status !== "sinking" &&
          cv.status !== "sunk" &&
          m.pos.y <= cv.def.deckY + 4 &&
          isOnDeck(cv.def, m.pos.x, m.pos.z)
        ) {
          hit = "ground";
        }
      }
      if (!hit) {
        const g = groundAt(m.pos.x, m.pos.z);
        if (m.pos.y <= g.y) hit = g.kind === "water" ? "water" : "ground";
      }
      if (hit) this.impactMissile(i, m.pos, hit, player);
    }
  }

  /**
   * A missile warhead goes off: three times the flash of a bomb, with splash
   * damage around the burst so a near miss still counts. The warhead is a
   * class above a 500 lb bomb: anything within 30 m of the burst is destroyed,
   * and the blast reaches 60 m.
   */
  private impactMissile(i: number, at: THREE.Vector3, kind: BlastKind, player: AircraftState): void {
    const g = groundAt(at.x, at.z);
    const y = Math.max(at.y, g.y + (kind === "air" ? 0 : 1.5));
    this.lastImpact.set(at.x, y, at.z);
    this.lastImpactKind = kind;
    this.impactAge = 0;
    for (const t of this.strikeTargets) {
      if (t.dead) continue;
      const d = Math.hypot(at.x - t.pos.x, at.y - (t.pos.y + 6), at.z - t.pos.z);
      if (d > 60) continue;
      this.damageTarget(t, d < 30 ? MISSILE_HP : MISSILE_HP * 0.55, player);
    }
    this.blasts.spawn(TMP.set(at.x, y, at.z), kind, kind === "water" ? 2.6 : 2.3);
    // a column that outlives the fireball, so the kill reads from any camera
    this.blasts.trail(TMP.set(at.x, y + 10, at.z), 4.6, IMPACT_SMOKE_TTL);
    this.blasts.trail(TMP.set(at.x, y + 24, at.z), 6.5, IMPACT_SMOKE_TTL * 0.8);
    for (const opponent of this.opponents) {
      if (opponent.pos.distanceTo(at) < MISSILE_AIR_R) this.hitOpponent(opponent, "missile");
    }

    // splash damage on anything airborne near the burst
    for (const b of this.bandits) {
      if (b.catT >= 0) continue;
      if (b.pos.distanceTo(at) < MISSILE_AIR_R * 1.5 && b.hp > 0) {
        this.damageBandit(b, MISSILE_HP * 0.5, player);
      }
    }
    const cv = this.cv;
    if (
      cv &&
      cv.status !== "sinking" &&
      cv.status !== "sunk" &&
      isOnDeck(cv.def, at.x, at.z)
    ) {
      this.damageCarrier(TMP, player, MISSILE_CV_DMG);
    }
    this.flash(TMP);
    const m = this.missiles[i];
    m.mesh.visible = false;
    this.missilePool.push(m.mesh);
    this.missiles.splice(i, 1);
  }

  /** Damage the hostile boat (bomb on the deck, or gun rounds in a strafe). */
  private damageCarrier(at: THREE.Vector3, player: AircraftState, dmg: number): void {
    const cv = this.cv;
    if (!cv || cv.status === "sinking" || cv.status === "sunk") return;
    // Same wire-damage guard as the bandits: no NaN, no negative hulls, and no
    // claim bigger than the biggest hit the fight can produce.
    if (!Number.isFinite(dmg) || dmg <= 0) return;
    dmg = Math.min(dmg, MAX_CLAIMED_CV_HIT);
    // A wingman's hit goes to the host as well: the host owns the hull, and the
    // snapshot it sends back settles the damage a packet later.
    if (this.mirror) this.carrierHitOut += dmg;
    cv.hp = Math.max(0, Math.min(CV_HP, cv.hp - dmg));
    this.hitT = HIT_FLASH;
    this.flash(at);
    if (cv.hp <= 0) {
      cv.status = "sinking";
      cv.sinkT = 0;
      cv.speed = 0;
      this.launchQueued = 0;
      this.kills++; // the boat counts as a kill
      this.banner(player, `DIRECT HIT — ${CV_NAME} IS SINKING — NO MORE LAUNCHES`);
    } else {
      this.banner(player, `DIRECT HIT — ${CV_NAME} HULL ${cv.hp}%`);
    }
  }

  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Strike scenario: land and sea targets in waves

  /**
   * Blast damage to strike targets around an impact. A weapon that lands on or
   * next to a structure tears it apart; further out it still hurts. This is
   * what makes a near miss on a hangar count without turning every bomb into
   * an area weapon.
   */
  private blastTargets(at: THREE.Vector3, player: AircraftState): void {
    for (const t of this.strikeTargets) {
      if (t.dead) continue;
      const d = Math.hypot(at.x - t.pos.x, at.y - (t.pos.y + 6), at.z - t.pos.z);
      if (d > 45) continue;
      this.damageTarget(t, BOMB_HP * (d < 15 ? 1.4 : d < 28 ? 1 : 0.6), player);
    }
  }

  /** Damage a strike target; a dead one is wrecked in place and keeps smoking. */
  private damageTarget(t: StrikeTarget, dmg: number, player: AircraftState): void {
    if (t.dead) return;
    t.hp -= dmg;
    this.hitT = HIT_FLASH;
    if (t.hp > 0) return;
    t.dead = true;
    t.wreckT = 0;
    t.smokeT = 0.6;
    this.kills++;
    wreckTarget(t.mesh);
    TMP.set(t.pos.x, t.pos.y + 7, t.pos.z);
    this.blasts.spawn(TMP, "ground", 1.35);
    this.flash(TMP);
    const left = this.strikeTargets.reduce((n, x) => n + (x.dead ? 0 : 1), 0);
    this.banner(
      player,
      left > 0 ? `TARGET CLEARED — ${left} LEFT` : "ALL TARGETS DOWN — STAND BY FOR THE NEXT WAVE",
    );
  }

  /** One wave: a target site on land plus a group of ships at sea. */
  private spawnStrikeWave(player: AircraftState): number {
    const landN = Math.min(3 + Math.floor(this.wave / 2), 5);
    const seaN = Math.min(1 + Math.floor((this.wave + 1) / 2), 3);
    let n = 0;
    const site = this.findLandSite(player);
    if (site) {
      const kinds: TargetKind[] = ["hangar", "tank", "warehouse", "tank", "hangar"];
      for (let i = 0; i < landN; i++) {
        const ang = (i / landN) * Math.PI * 2 + hash(this.wave * 7.7 + i) * 0.9;
        const r = 55 + hash(this.wave * 3.1 + i * 2.3) * 55;
        const x = site.x + Math.cos(ang) * r;
        const z = site.z + Math.sin(ang) * r;
        const g = groundAt(x, z);
        if (g.kind === "water") continue;
        this.spawnTarget(kinds[i % kinds.length], x, g.y, z, 0, false);
        n++;
      }
    }
    const sea = this.findSeaSite(player);
    if (sea) {
      const brg = (Math.atan2(sea.x - player.pos.x, -(sea.z - player.pos.z)) * 180) / Math.PI;
      for (let i = 0; i < seaN; i++) {
        const across = (i - (seaN - 1) / 2) * 460;
        const ang = ((brg + 90) * Math.PI) / 180;
        const x = sea.x + Math.cos(ang) * across;
        const z = sea.z + Math.sin(ang) * across;
        const kind: TargetKind = i % 2 ? "patrol" : "ship";
        // steam back toward the player's area, so the group closes slowly and
        // a second pass finds it nearer than the first
        this.spawnTarget(kind, x, 0, z, brg + 180 + (hash(this.wave * 5.9 + i) * 30 - 15), true);
        n++;
      }
    }
    return n;
  }

  private spawnTarget(
    kind: TargetKind,
    x: number,
    y: number,
    z: number,
    headingDeg: number,
    sea: boolean,
  ): void {
    const mesh = buildTargetMesh(kind);
    mesh.position.set(x, y, z);
    // same heading convention as the fleet: +X is the bow
    mesh.rotation.y = ((90 - headingDeg) * Math.PI) / 180;
    this.root.add(mesh);
    this.strikeTargets.push({
      id: this.nextId++,
      kind,
      sea,
      hp: TARGET_HP[kind],
      pos: new THREE.Vector3(x, y, z),
      headingDeg,
      // A slow convoy, not speedboats: a level bombing run has to be able to
      // lead and hit a ship, so they steam at ~12 kt with the patrol slightly
      // quicker.
      speed: sea ? (kind === "patrol" ? 9 : 6) : 0,
      radius: TARGET_RADIUS[kind],
      mesh,
      dead: false,
      wreckT: 0,
      smokeT: 0,
    });
  }

  /** Flat-ish land 5-12 km from the player, well inside the chain. */
  private findLandSite(player: AircraftState): THREE.Vector3 | null {
    for (let i = 0; i < 28; i++) {
      const ang = hash(this.wave * 31.7 + i * 7.13) * Math.PI * 2;
      const dist = 5000 + hash(this.wave * 17.9 + i * 3.7) * 7000;
      const x = player.pos.x + Math.sin(ang) * dist;
      const z = player.pos.z - Math.cos(ang) * dist;
      if (Math.abs(x) > 27000 || Math.abs(z) > 27000) continue;
      const g = groundAt(x, z);
      if (g.kind !== "terrain" || g.y < 30) continue;
      // reject slopes: the site has to be flat enough to build on
      let flat = true;
      for (let j = 0; j < 4; j++) {
        const a = (j / 4) * Math.PI * 2 + 0.4;
        const h = groundAt(x + Math.cos(a) * 160, z + Math.sin(a) * 160).y;
        if (Math.abs(h - g.y) > 28) {
          flat = false;
          break;
        }
      }
      if (!flat) continue;
      return new THREE.Vector3(x, g.y, z);
    }
    return null;
  }

  /** Open water 5-12 km from the player, with room for a group to steam. */
  private findSeaSite(player: AircraftState): THREE.Vector3 | null {
    for (let i = 0; i < 28; i++) {
      const ang = hash(this.wave * 13.3 + i * 5.19) * Math.PI * 2;
      const dist = 5000 + hash(this.wave * 23.7 + i * 9.7) * 7000;
      const x = player.pos.x + Math.sin(ang) * dist;
      const z = player.pos.z - Math.cos(ang) * dist;
      if (Math.abs(x) > 28000 || Math.abs(z) > 28000) continue;
      if (groundAt(x, z).kind !== "water") continue;
      let open = true;
      for (let j = 0; j < 4; j++) {
        const a = (j / 4) * Math.PI * 2;
        if (groundAt(x + Math.cos(a) * 700, z + Math.sin(a) * 700).kind !== "water") {
          open = false;
          break;
        }
      }
      if (!open) continue;
      return new THREE.Vector3(x, 0, z);
    }
    return null;
  }

  /** Ships steam on; wrecks smoke for half a minute. Land targets stand still. */
  private stepTargets(dt: number): void {
    for (const t of this.strikeTargets) {
      if (t.dead) {
        t.wreckT += dt;
        if (t.wreckT < 20) {
          t.smokeT -= dt;
          if (t.smokeT <= 0) {
            this.blasts.trail(TMP.set(t.pos.x, t.pos.y + 6, t.pos.z), 2.2, 3.4);
            t.smokeT = 0.5;
          }
        }
        continue;
      }
      if (t.speed <= 0) continue;
      const h = (t.headingDeg * Math.PI) / 180;
      t.pos.x += Math.sin(h) * t.speed * dt;
      t.pos.z += -Math.cos(h) * t.speed * dt;
      // never steam onto a coast: sheer off instead
      if (groundAt(t.pos.x + Math.sin(h) * 600, t.pos.z - Math.cos(h) * 600).kind !== "water") {
        t.headingDeg = (t.headingDeg + 25) % 360;
      }
      t.mesh.position.set(t.pos.x, t.pos.y, t.pos.z);
    }
  }

  /**
   * Strike wave bookkeeping: while anything stands, the wave runs; once the
   * grid is clear the next one is on the way after a short pause. There is no
   * boat to sink here — the pressure comes from each wave growing.
   */
  private stepStrikeWaves(dt: number, player: AircraftState): void {
    const alive = this.strikeTargets.reduce((n, t) => n + (t.dead ? 0 : 1), 0);
    if (alive > 0) {
      this.waveClock += dt;
      return;
    }
    if (this.waveTimer <= 0) {
      this.waveTimer = WAVE_RESPAWN;
      this.banner(
        player,
        `WAVE ${this.wave} CLEARED — ${this.kills} TARGET${this.kills === 1 ? "" : "S"} TAGGED`,
      );
      return;
    }
    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.wave++;
      const n = this.spawnStrikeWave(player);
      this.banner(player, `WAVE ${this.wave} — ${n} NEW TARGETS ON THE GRID`);
    }
  }

  // -------------------------------------------------------------------------

  private clearBandits(): void {
    for (const b of this.bandits) {
      b.mesh.group.removeFromParent();
      disposeSubtree(b.mesh.group);
    }
    this.bandits = [];
  }

  private clearTargets(): void {
    for (const t of this.strikeTargets) {
      t.mesh.removeFromParent();
      disposeSubtree(t.mesh);
    }
    this.strikeTargets = [];
  }

  private playerHeading(player: AircraftState): number {
    FWD.set(0, 0, -1).applyQuaternion(player.quat);
    return Math.atan2(FWD.x, -FWD.z);
  }

  /** Point the bandit's forward (-Z) at `dir` with the given bank. */
  private aimQuat(b: Bandit, dir: THREE.Vector3, bank: number): void {
    MAT4.lookAt(ORIGIN, dir, WORLD_UP);
    b.quat.setFromRotationMatrix(MAT4);
    ROLL_Q.setFromAxisAngle(Z_AXIS, bank);
    b.quat.multiply(ROLL_Q);
  }

  /**
   * One bandit's step. Returns false when the bandit is gone (it flew into the
   * ground and broke up), so the caller can skip its guns.
   */
  private stepBandit(b: Bandit, dt: number, player: AircraftState): boolean {
    if (b.catT >= 0) {
      this.stepLaunch(b, dt);
      return true;
    }
    // away from the deck: gear up, wings sweeping back, nose held up
    b.sweepT = Math.min(1, b.sweepT + dt / 5);
    b.mesh.wings[0].rotation.y = -1.0 * b.sweepT;
    b.mesh.wings[1].rotation.y = 1.0 * b.sweepT;
    if (b.climbT > 0) b.climbT -= dt;

    FWD.set(0, 0, -1).applyQuaternion(b.quat);
    TO_P.copy(player.pos).sub(b.pos);
    const dist = TO_P.length();

    // --- pick a mode: engage, or break when threatened ---
    // Being on the bandit's six is the classic chase; being lined up in the
    // player's own gun cone counts too, so the pack reacts instead of boring in.
    const onSix = FWD.dot(TO_P) < -0.35 * dist; // player behind and close
    PFWD.set(0, 0, -1).applyQuaternion(player.quat);
    const nosed =
      player.speed > 45 &&
      dist < NOSE_BREAK_DIST &&
      PFWD.dot(TO_P) < -NOSE_CONE_COS * dist;
    if (b.evadeT > 0) {
      b.evadeT -= dt;
      if (b.evadeT <= 0) b.evadeCd = 9 + hash(b.id + player.time * 1.3) * 5;
    } else if (b.evadeCd > 0) {
      b.evadeCd -= dt;
    } else if ((onSix && dist < EVADE_DIST) || nosed) {
      b.evadeT = 1.8 + hash(b.id + player.time) * 1.2;
    }

    // --- afterburner: lit for the merge, the evade and the chase; it cycles
    // so the plume blinks like a pilot riding the burner in bursts ---
    const wantsAb = b.evadeT > 0 || (dist > 1200 && b.climbT <= 0) || b.climbT > 0;
    if (b.abOn) {
      b.abT -= dt;
      if (b.abT <= 0 || !wantsAb) {
        b.abOn = false;
        b.abCool = 3 + hash(b.id + player.time * 0.7) * 3;
      }
    } else if (b.abCool > 0) {
      b.abCool -= dt;
    } else if (wantsAb) {
      b.abOn = true;
      b.abT = BANDIT_AB_TIME;
    }
    b.mesh.afterburner.visible = b.abOn;

    if (b.evadeT > 0) {
      // jink: weave around the current heading with a climb bias
      TMP.set(1, 0, 0).applyQuaternion(b.quat); // right wing
      DESIRED.copy(FWD)
        .addScaledVector(TMP, Math.sin(player.time * 1.9 + b.phase) * 0.7)
        .addScaledVector(WORLD_UP, Math.cos(player.time * 1.4 + b.phase) * 0.35 + 0.2);
      DESIRED.normalize();
      b.speed += (BANDIT_SPEED.evade - b.speed) * (1 - Math.exp(-dt / 1.2));
    } else {
      // lead pursuit: aim ahead of the player so guns line up naturally
      AIM.copy(player.pos).addScaledVector(player.vel, Math.min(dist / MUZZLE_V, 1.2) * 0.8);
      DESIRED.copy(AIM).sub(b.pos).normalize();
      b.speed += ((dist > 3000 ? BANDIT_SPEED.pursue : BANDIT_SPEED.close) - b.speed) *
        (1 - Math.exp(-dt / 1.5));
    }
    // The burner sets the real ceiling: dry flight tops at the player's own
    // military thrust numbers, the burner stretches to the AB envelope.
    const vmax = b.abOn ? BANDIT_MAX_AB : BANDIT_MAX_DRY;
    if (b.speed > vmax) b.speed = vmax;
    // straight off the bow: climb to a fighting altitude before it hunts
    if (b.climbT > 0) {
      DESIRED.y += 0.55;
      DESIRED.normalize();
    }

    // --- merge discipline: slide past the player, never through them ---
    // The merge turn starts early (any closing geometry) and a hard push-out
    // takes over inside PANIC_DIST, so bandits shoulder away instead of flying
    // straight through the airframe the player is sitting in.
    if (dist > 1 && dist < MERGE_DIST) {
      const closing = FWD.dot(TO_P) / dist; // +1 = nose-on the player
      if (closing > 0.25) {
        const side = hash(b.id * 9.1 + 0.37) > 0.5 ? 1 : -1;
        LAT.set(TO_P.z, 0, -TO_P.x).normalize();
        DESIRED.addScaledVector(LAT, side * (1 - dist / MERGE_DIST) * 1.25).normalize();
      }
      if (dist < PANIC_DIST) {
        // too close to be clever: get out of the player's skin
        TMP.copy(b.pos).sub(player.pos).setY(0).normalize();
        DESIRED.addScaledVector(TMP, (1 - dist / PANIC_DIST) * 1.4).normalize();
        DESIRED.y += 0.25;
        DESIRED.normalize();
      }
    }

    // --- shoulder away from wingmen so the pack doesn't stack into one jet ---
    for (const o of this.bandits) {
      if (o === b) continue;
      SEP.copy(b.pos).sub(o.pos);
      const d2 = SEP.lengthSq();
      if (d2 > 1e-6 && d2 < KEEP_APART * KEEP_APART) {
        const d = Math.sqrt(d2);
        DESIRED.addScaledVector(SEP.divideScalar(d), (1 - d / KEEP_APART) * 0.9);
      }
    }
    DESIRED.normalize();

    // --- safety: never hunt the terrain, never leave the box ---
    AHEAD.copy(b.pos).addScaledVector(DESIRED, 1200);
    const floor = groundAt(AHEAD.x, AHEAD.z).y + 260;
    const needClimb = (floor - b.pos.y) / 1200;
    if (needClimb > DESIRED.y) {
      DESIRED.y = needClimb;
      DESIRED.normalize();
    }
    if (b.pos.y < floor) DESIRED.y = Math.max(DESIRED.y, 0.5);
    if (b.pos.y > CEILING) DESIRED.y = Math.min(DESIRED.y, -0.1);
    // Arena check is relative to the player, so the fight follows the player
    // anywhere in the 60 km chain instead of being pinned over the origin.
    if (Math.hypot(b.pos.x - player.pos.x, b.pos.z - player.pos.z) > ARENA) {
      DESIRED.addScaledVector(TMP.copy(player.pos).sub(b.pos).setY(0).normalize(), 0.8).normalize();
    }

    // --- steer: rotate forward toward desired at a capped rate, bank into it
    const angle = FWD.angleTo(DESIRED);
    let turnSign = 0;
    if (angle > 1e-4) {
      AXIS.crossVectors(FWD, DESIRED);
      if (AXIS.lengthSq() < 1e-8) AXIS.copy(WORLD_UP);
      else AXIS.normalize();
      turnSign = Math.sign(AXIS.y);
      const turnCap = Math.max(
        Math.max(b.speed, BANDIT_SPEED.min) / BANDIT_TURN_RADIUS,
        BANDIT_TURN_FLOOR,
      );
      FWD.applyAxisAngle(AXIS, Math.min(angle, turnCap * dt));
    }
    const bankTarget = angle > 0.05 ? turnSign * Math.min(angle * 1.6, 1.15) : 0;
    b.bank += (bankTarget - b.bank) * (1 - Math.exp(-dt * 2.5));
    this.aimQuat(b, FWD, b.bank);

    // --- integrate + publish to the mesh ---
    b.pos.addScaledVector(FWD, Math.max(b.speed, BANDIT_SPEED.min) * dt);
    b.mesh.group.position.copy(b.pos);
    b.mesh.group.quaternion.copy(b.quat);

    // --- terrain: a bandit that hits the ground or the sea breaks up ---
    const g = groundAt(b.pos.x, b.pos.z);
    if (b.pos.y <= g.y + 2) {
      this.crashBandit(b, player, g.kind === "water" ? "water" : "ground");
      return false;
    }
    return true;
  }

  private banditGuns(b: Bandit, dt: number, player: AircraftState): void {
    if (b.catT >= 0) return; // still on the cat: no shooting from the deck
    b.fireCd -= dt;
    if (b.fireCd > 0) return;
    FWD.set(0, 0, -1).applyQuaternion(b.quat);
    TO_P.copy(player.pos).sub(b.pos);
    const dist = TO_P.length();
    const offBore = FWD.angleTo(TO_P);
    if (dist > ENGAGE_DIST || offBore > AIM_CONE || dist < 60) return;
    if (terrainBlocks(b.pos, player.pos)) return; // no shooting through hills

    if (b.burst <= 0) {
      b.burst = 5 + Math.floor(hash(b.id * 17.7 + player.time) * 3);
      b.fireCd = 1.9 + hash(b.id * 3.1 + player.time * 0.7) * 1.6;
      return;
    }
    b.burst--;
    b.fireCd = 0.09; // ~11 rps inside the burst
    // lead the player, then scatter
    AIM.copy(player.pos).addScaledVector(player.vel, dist / MUZZLE_V);
    TMP.copy(AIM).sub(b.pos).normalize();
    this.scatter(TMP, BANDIT_SPREAD, player.time * 13.7 + b.id * 3.3);
    this.spawnTracer(b.pos, TMP, true, null);
    this.threatT = THREAT_HOLD;
  }

  private playerGuns(dt: number, player: AircraftState, fireHeld: boolean): void {
    if (!fireHeld) {
      this.gunCd = 0;
      this.gunLive = false;
      return;
    }
    this.gunLive = true;
    const rate = Math.max(1, player.spec.gunRps);
    this.gunCd -= dt;
    while (this.gunCd <= 0) {
      this.gunCd += 1 / rate;
      FWD.set(0, 0, -1).applyQuaternion(player.quat);
      // The cue's dedicated muzzle scratch, not TMP: assistBore recomputes the
      // lead direction into TMP, so passing TMP as the muzzle zeroed it and
      // every round spawned from the world origin, 1500 m from the fight.
      GUN_MUZ.copy(player.pos).addScaledVector(FWD, 8);
      // the same slight aim assist the crosshair solution uses, so the pipper
      // and the rounds agree exactly
      const assisted = this.assistBore(player, GUN_MUZ, FWD);
      this.scatter(assisted, PLAYER_SPREAD, player.time * 31.7 + this.gunCd * 97);
      // Our own rounds carry the jet's full velocity vector, so a burst fired in
      // a hard turn goes where the gun cue says rather than drifting off the bore.
      // (The bandits keep firing relative to their own frame; they are steered
      // point masses and their gunnery is tuned separately.)
      this.spawnTracer(GUN_MUZ, assisted, false, player.vel);
      // muzzle flash at the ports: the burst has to read from any camera
      // (no smoke puff here — it read as haze drifting over the nose)
      this.muzzleT = 0.055;
      this.muzzle.position.copy(TMP);
    }
  }

  private spawnTracer(
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    hostile: boolean,
    inherit: THREE.Vector3 | null,
  ): void {
    if (this.tracers.length >= MAX_TRACERS || this.tracerPool.length === 0) return;
    const mesh = this.tracerPool.pop()!;
    mesh.material = hostile ? this.matBandit : this.matPlayer;
    // Our own rounds are drawn fat and long on purpose: a slim 20 mm slug is
    // nearly invisible against terrain at combat range, and "can't tell if I'm
    // shooting" is a visibility problem, not a ballistics one.
    mesh.scale.setScalar(hostile ? 1 : 1.7);
    mesh.visible = true;
    mesh.position.copy(origin);
    const vel = dir.clone().multiplyScalar(MUZZLE_V);
    if (inherit) vel.add(inherit);
    if (!hostile && this.versus) this.weaponLaunches.push({ weapon: "gun", pos: origin.toArray(), vel: vel.toArray() });
    this.tracers.push({
      pos: origin.clone(),
      vel,
      life: TRACER_LIFE,
      hostile,
      mesh,
    });
  }

  private stepTracers(dt: number, player: AircraftState): void {
    const cv = this.cv;
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      // Rounds are projectiles: quadratic drag first, then gravity, so a long
      // burst needs lead and a touch of lob instead of flying dead straight.
      const atm = atmosphere(t.pos.y);
      const sp = t.vel.length();
      if (sp > 1) {
        const k = (0.5 * atm.rho * BULLET_CDA * sp) / BULLET_MASS; // 1/s
        t.vel.multiplyScalar(Math.max(0, 1 - k * dt));
      }
      t.vel.y -= GRAVITY * dt;
      const prev = GUN_PREV.copy(t.pos);
      t.pos.addScaledVector(t.vel, dt);
      t.mesh.position.copy(t.pos);
      t.mesh.quaternion.setFromUnitVectors(TR_Z, DIR.copy(t.vel).normalize());

      let dead = t.life <= 0;
      if (!dead) {
        if (t.hostile) {
          if (segSphere(prev, t.pos, player.pos, HIT_RADIUS)) {
            this.damagePlayer(player, BANDIT_DAMAGE);
            dead = true;
          }
        } else {
          for (const b of this.bandits) {
            if (b.catT >= 0) continue; // still on the cat, not a valid target
            if (segSphere(prev, t.pos, b.pos, HIT_RADIUS)) {
              this.hitT = HIT_FLASH;
              dead = true;
              this.damageBandit(b, player.spec.gunDamage, player);
              break;
            }
          }
          if (!dead) for (const opponent of this.opponents) {
            if (segSphere(prev, t.pos, opponent.pos, HIT_RADIUS)) {
              this.hitOpponent(opponent, "gun");
              dead = true;
              break;
            }
          }
          // Strafing works on strike targets too: a gun pass on an unarmoured
          // structure or a ship's deckhouse does real (if modest) damage.
          if (!dead) {
            for (const tg of this.strikeTargets) {
              if (tg.dead) continue;
              REF.copy(tg.pos);
              REF.y += 8;
              if (segSphere(prev, t.pos, REF, tg.radius)) {
                this.damageTarget(tg, tg.sea ? 2 : player.spec.gunDamage * 0.5, player);
                dead = true;
                break;
              }
            }
          }
          // Everything is shootable, the enemy deck included: strafe it down.
          if (
            !dead && cv && cv.status !== "sinking" && cv.status !== "sunk" &&
            t.pos.y <= cv.def.deckY + 6 && isOnDeck(cv.def, t.pos.x, t.pos.z)
          ) {
            this.damageCarrier(t.pos, player, CARRIER_GUN_DAMAGE);
            dead = true;
          }
        }
      }
      // Rounds stop at the ground (or the sea) instead of flying through hills,
      // and they kick up dirt or a little spray where they land.
      if (!dead) {
        const g = groundAt(t.pos.x, t.pos.z);
        if (t.pos.y <= g.y) {
          this.blasts.spawnSpark(t.pos.setY(Math.max(g.y + 0.4, t.pos.y)), g.kind === "water");
          dead = true;
        }
      }
      if (dead) {
        t.mesh.visible = false;
        this.tracerPool.push(t.mesh);
        this.tracers.splice(i, 1);
      }
    }
  }

  private killBandit(b: Bandit, player: AircraftState): void {
    this.removeBandit(b);
    this.kills++;
    // it broke up in the air: fireball, debris and a bright core
    this.blasts.spawn(b.pos.clone(), "air", 1);
    this.flash(b.pos);
    const left = this.bandits.length;
    this.banner(
      player,
      left > 0 ? `BANDIT DOWN — ${left} LEFT` : "BANDIT DOWN — RANGE CLEAR",
    );
  }

  /** A bandit that flew into the ground, the sea or a hill. */
  private crashBandit(b: Bandit, player: AircraftState, kind: BlastKind): void {
    const at = b.pos.clone();
    this.removeBandit(b);
    this.kills++;
    this.lastImpact.set(at.x, at.y, at.z);
    this.lastImpactKind = kind;
    this.blasts.spawn(at, kind === "water" ? "water" : "ground", 1.1);
    this.banner(
      player,
      kind === "water" ? "BANDIT DOWN — FLEW INTO THE SEA" : "BANDIT DOWN — FLEW INTO THE TERRAIN",
    );
  }

  /** Pull a bandit out of the fight and release its geometry. */
  private removeBandit(b: Bandit): void {
    const idx = this.bandits.indexOf(b);
    if (idx >= 0) this.bandits.splice(idx, 1);
    // pulling the wreck from the scene and releasing its geometry keeps a long
    // fight from accumulating hidden jets
    b.mesh.group.removeFromParent();
    disposeSubtree(b.mesh.group);
  }

  /**
   * Airframes are solid. A bandit inside the player's footprint takes both of
   * them out of the fight; wingmen that touch each other break up together; and
   * a jet that flies into the enemy carrier's deck does the ship real damage
   * before it goes in.
   */
  private stepCollisions(player: AircraftState): void {
    for (let i = this.bandits.length - 1; i >= 0; i--) {
      const b = this.bandits[i];
      if (b.catT >= 0) continue; // rolling on the cat is not a mid-air
      if (b.pos.distanceTo(player.pos) > PLAYER_HIT_R) continue;
      const at = b.pos.clone();
      if (this.mirror) this.takenDown.set(b.id, performance.now());
      this.removeBandit(b);
      this.kills++;
      this.blasts.spawn(at, "air", 1.3);
      this.damagePlayer(player, MID_AIR_DAMAGE);
      if (!player.result) this.banner(player, "MID-AIR COLLISION — CHECK YOUR HULL");
    }
    for (let i = this.bandits.length - 1; i > 0; i--) {
      const a = this.bandits[i];
      for (let j = i - 1; j >= 0; j--) {
        const o = this.bandits[j];
        if (a.pos.distanceTo(o.pos) > BANDIT_HIT_R) continue;
        this.blasts.spawn(a.pos.clone().lerp(o.pos, 0.5), "air", 1.1);
        this.kills++;
        this.removeBandit(a);
        this.removeBandit(o);
        this.banner(player, "BANDITS COLLIDED");
        break;
      }
    }
    // the hostile boat is not in groundAt(), so its deck is checked by hand
    const cv = this.cv;
    if (!cv || cv.status === "sinking" || cv.status === "sunk") return;
    if (!isOnDeck(cv.def, player.pos.x, player.pos.z)) return;
    if (player.pos.y > cv.def.deckY + 2.5) return; // a fly-by, not a hit
    this.damageCarrier(player.pos.clone(), player, RAM_CARRIER_HP);
    player.result = {
      kind: "crash",
      title: `COLLIDED WITH ${cv.def.name}`,
      detail: "You flew into the opposing carrier. The hull is holed; so is yours.",
    };
  }

  /**
   * Keep the laser marker on the designation. Driven by sim time, so the pulse
   * freezes on pause.
   */
  private stepDesignator(player: AircraftState): void {
    const d = this.designation;
    const on = d !== null && !player.result;
    this.designator.visible = on;
    if (!d || !on) return;
    this.designator.position.set(d.x, d.y + 3, d.z);
    this.designator.scale.setScalar(1 + 0.12 * Math.sin(player.time * 7));
  }

  private damagePlayer(player: AircraftState, dmg: number): void {
    const before = this.hull;
    this.hull -= dmg;
    this.damageT = DAMAGE_FLASH;
    if (before > 60 && this.hull <= 60) this.banner(player, "TAKING HITS — HULL 60%");
    if (before > 30 && this.hull <= 30) this.banner(player, "HULL CRITICAL — DISENGAGE");
    if (this.hull <= 0 && !player.result) {
      player.result = {
        kind: "crash",
        title: "OUT OF THE FIGHT",
        detail: `Downed by an aggressor over the islands. ${this.kills} tagged.`,
      };
    }
  }

  /**
   * Wave bookkeeping. A wave is alive while it still has aircraft queued on the
   * deck or flying; once it is gone the boat needs a few seconds to spot the
   * next one, and a sunk boat launches nothing at all.
   */
  private stepWaves(dt: number, player: AircraftState): void {
    if (this.bandits.length > 0 || this.launchQueued > 0) {
      this.waveClock += dt;
      return;
    }
    if (this.fightOver) return;
    if (this.cv && (this.cv.status === "sinking" || this.cv.status === "sunk")) {
      this.fightOver = true;
      this.banner(player, `OPFOR CARRIER OUT OF ACTION — NO MORE LAUNCHES`);
      return;
    }
    if (this.waveTimer <= 0) {
      this.waveTimer = WAVE_RESPAWN;
      if (this.wave > 0) this.banner(player, `WAVE ${this.wave} CLEARED — ${this.kills} TAGGED`);
      return;
    }
    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.wave++;
      const count = Math.min(1 + this.wave, WAVE_MAX);
      this.launchQueued = count;
      this.launchTimer = CV_FIRST_LAUNCH;
      this.waveClock = 0;
      this.banner(player, `WAVE ${this.wave} — ${count} BANDIT${count > 1 ? "S" : ""} SPOTTED ON ${CV_NAME}`);
    }
  }

  private flash(at: THREE.Vector3): void {
    const f = this.flashPool.find((x) => x.life <= 0);
    if (!f) return;
    f.pos.copy(at);
    f.life = 1;
    f.mesh.visible = true;
  }

  private stepFlashes(dt: number): void {
    for (const f of this.flashPool) {
      if (f.life <= 0) continue;
      f.life -= dt * 1.8;
      if (f.life <= 0) {
        f.mesh.visible = false;
        continue;
      }
      const s = 3 + (1 - f.life) * 26;
      f.mesh.position.copy(f.pos);
      f.mesh.scale.setScalar(s);
      (f.mesh.material as THREE.MeshBasicMaterial).opacity = f.life * 0.9;
    }
  }

  /** Rotate `dir` by a deterministic cone of `spread` radians. */
  private scatter(dir: THREE.Vector3, spread: number, seed: number): void {
    const a = hash(seed) * Math.PI * 2;
    const r = spread * (hash(seed + 0.5) * 2 - 1);
    REF.set(Math.cos(a), Math.sin(a), 0);
    if (Math.abs(dir.z) > 0.95) REF.set(1, 0, 0);
    AXIS.crossVectors(dir, REF).normalize();
    dir.applyAxisAngle(AXIS, r);
  }

  private banner(player: AircraftState, text: string): void {
    player.banner = { text, until: player.time + 3 };
  }
}

/**
 * Release every geometry/material under `node` (a wreck or a retired ship).
 * Fleet-wide materials — nav lights, ship lamps — are left alone: they are
 * shared with every other aircraft and ship in the sky.
 */
function disposeSubtree(node: THREE.Object3D): void {
  node.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
    const mat = mesh.material as THREE.Material | undefined;
    if (mat && !isSharedMaterial(mat)) mat.dispose();
  });
}

/**
 * True when terrain rises above the straight line between two points. Three
 * samples along the line are enough to catch ridges without slowing every
 * burst decision down. Exported for the headless dogfight checks.
 */
export function terrainBlocks(a: THREE.Vector3, b: THREE.Vector3): boolean {
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const z = a.z + (b.z - a.z) * t;
    if (groundAt(x, z).y > y) return true;
  }
  return false;
}

/** True when the segment a->b passes within `r` of point p. */
function segSphere(a: THREE.Vector3, b: THREE.Vector3, p: THREE.Vector3, r: number): boolean {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
  const apx = p.x - a.x, apy = p.y - a.y, apz = p.z - a.z;
  const ab2 = abx * abx + aby * aby + abz * abz;
  const t = ab2 > 1e-9 ? Math.max(0, Math.min(1, (apx * abx + apy * aby + apz * abz) / ab2)) : 0;
  const dx = apx - abx * t, dy = apy - aby * t, dz = apz - abz * t;
  return dx * dx + dy * dy + dz * dz <= r * r;
}
