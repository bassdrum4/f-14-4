// Every shape the combat sim passes around: the public snapshot types the net
// layer shares, and the internal records the sim keeps per airframe and store.

import type { FlareTarget } from "../countermeasures";
import type { BattleWeapon } from "../../net/versus";
import * as THREE from "three";
import type { TomcatMesh } from "../../render/geometry";
import type { ConvoyRoute, EnemyRole, TargetRole } from "../operations";
import type { TargetKind } from "../../render/targets";
import type { BlastKind } from "../../render/effects";
import type { CarrierDef } from "../world";

export interface Missile {
  naval?: { kind: "air" | "surface" | "carrier" | "point" | "pilot"; id: number | string; point: THREE.Vector3; cruiseHeight: number; life?: number; surfaceVessel?: boolean };
  targetPilot?: string;
  id: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  motor: number; // s of burn left
  arm: number; // s until the seeker is live
  trailT: number; // s until the next plume puff
  mesh: THREE.Object3D;
  /** Fired by a bandit at the player (hostile rounds hunt the jet, not bandits). */
  hostile: boolean;
  /** s of flight left before the round runs out of energy. */
  life: number;
  /** The flare this seeker has been decoyed onto, if any. */
  decoy: Flare | null;
  /** Deterministic per-round noise seed for the capture roll. */
  seed: number;
}

/** One burning countermeasure cartridge: ballistic, short-lived, decoyable. */
export interface Flare extends FlareTarget {
  vel: THREE.Vector3;
  life: number; // s of burn left
  trailT: number; // s to the next smoke puff
  mesh: THREE.Object3D;
}

export interface Bandit {
  role?: EnemyRole;
  ammo?: number;
  bombs?: number;
  retreat?: boolean;
  sortieTime?: number;
  id: number;
  hp: number;
  pos: THREE.Vector3;
  quat: THREE.Quaternion; // forward = -Z
  bank: number; // smoothed roll for looks, rad
  speed: number; // m/s
  fireCd: number; // s until next shot / burst decision
  /** Air-to-air rounds left on this bandit's rails, and the reload between them. */
  missiles: number;
  missileCd: number;
  burst: number; // rounds left in the current burst
  evadeT: number; // s of jink remaining
  /** s until the bandit may break again: after a break it extends and
   *  re-engages like a real pilot instead of jinking forever. */
  evadeCd: number;
  launchWave?: number; // difficulty stays with this aircraft after waves advance
  reactionT?: number; // sustained threat time before an evasive response
  smokeT?: number;
  phase: number; // per-bandit jink phase
  mesh: TomcatMesh;
  /** >= 0 while the bandit is still rolling on the catapult; -1 in the air. */
  catT: number;
  catStart: THREE.Vector3;
  catDir: THREE.Vector3;
  catAcross?: number;
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

export interface Tracer {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  hostile: boolean;
  mesh: THREE.Mesh;
}

export interface Flash {
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
  combatId?: number;
}

/** Nothing to report: returned instead of a fresh array on an idle frame. */

/** The hostile boat: a live CarrierDef whose x/z/heading the sim drives. */
export interface EnemyCarrier {
  def: CarrierDef;
  mesh: THREE.Group;
  hp: number;
  status: CarrierStatus;
  speed: number; // m/s
  sinkT: number; // s since the fatal hit
}

export interface Bomb {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  arm: number; // s until the fuze is live
  age: number; // s since release — the laser's guidance window runs on this
  mesh: THREE.Object3D;
  /** Laser-guided: steers onto `target` (the designation) while it falls. */
  guided: boolean;
  target: THREE.Vector3 | null;
  trailT: number; // s until the next trail puff
}
export interface EnemyBomb { id: number; pos: THREE.Vector3; vel: THREE.Vector3; age: number; mesh: THREE.Mesh }

/** Which mission machinery is running. */
export type Scenario = "dogfight" | "strike";

/**
 * A strike target: a structure on land or a ship at sea. Static things sit on
 * the terrain; ships steam slowly along their heading so a level pass needs a
 * little lead, like the enemy carrier does.
 */
export interface StrikeTarget {
  role?: TargetRole;
  disabled?: boolean;
  arrived?: boolean;
  route?: ConvoyRoute | null;
  progress?: number;
  ammo?: number;
  tracking?: number;
  cooldown?: number;
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
  /** Countermeasure cartridges left (types with none always read 0/0). */
  flares: number;
  flaresMax: number;
  /** The nearest hostile round in the air, for the RWR call-out. */
  incoming: { km: number; brgDeg: number; sec: number } | null;
  nearestKm: number;
  nearestBrgDeg: number;
  /** Map markers: where it is, and which way it is pointed. */
  markers: Array<{ x: number; z: number; headingDeg: number }>;
  /** A bandit has rounds in the air right now (within the hold window). */
  threat: boolean;
  /** The player's trigger is down (the muzzle flash is lit). */
  firing: boolean;
  /** 1 -> 0 hit-marker flash: our rounds connected with a bandit. */
  hitT: number;
  confirmation: { text: string; kind: "hit" | "destroyed"; remaining: number } | null;
  /** 1 -> 0 damage flash: we are taking hits. */
  damageT: number;
  /** Per-bandit 3D position + gun lead point, for the HUD designators. */
  spots: Array<{ x: number; y: number; z: number; lx: number; ly: number; lz: number; km: number; health?: number; label?: string }>;
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
    /** Which way the boat is steaming, for the map. */
    headingDeg: number;
  } | null;
}

export interface CombatOpponent { id: string; life: number; pos: THREE.Vector3; vel: THREE.Vector3; hitPos?: THREE.Vector3; quat?: THREE.Quaternion; surfaceVessel?: boolean }
export interface PlayerHit { id: string; life: number; weapon: BattleWeapon }

/** One pilot's aircraft as the room reports it for the fleet-defense check. */
export interface FleetDefender { id: string; pos: THREE.Vector3; vel: THREE.Vector3; onGround?: boolean; aircraft?: import("../aircraft").AircraftId }
