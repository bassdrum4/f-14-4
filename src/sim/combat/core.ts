// The Dogfight state machine. Every battle flavour (endless air combat, strike
// waves, authored operations, head-to-head) is this one class: the fields below
// are its state, and the behaviour lives in the sibling modules of this folder.
//
// The fields are deliberately not `private`: the subsystems take the instance as
// an explicit first argument. Nothing outside src/sim/combat may touch them.

import type { FlareTarget } from "../countermeasures";
import type { BattleMissile, BattleWeapon, WeaponLaunch } from "../../net/versus";
import * as THREE from "three";
import { Operation } from "../operations";
import type { EnemyRole, OperationHud, OperationState } from "../operations";
import type { EnemyFire, SharedCombat } from "../combatSnapshot";
import type { TargetKind } from "../../render/targets";
import type { BlastKind, ExplosionField } from "../../render/effects";
import { MAX_BOMBS, MAX_MISSILES } from "../aircraft";
import type { AircraftState } from "../flight";
import type { CarrierDef } from "../world";
import {
  createEnemyBomb,
  nearestDefender,
  operationHud,
  receiveEnemyFire,
  retireEnemyBomb,
  setDefenders,
  spawnConvoy,
  stepEnemyBombs,
  stepEscortDefense,
  stepOperation,
  stepOperationLaunches,
  stepRoleAircraft,
  takeEnemyFire,
} from "./missionFlow";
import {
  blastTargets,
  clearTargets,
  damageCarrier,
  damageTarget,
  findLandSite,
  findSeaSite,
  spawnStrikeWave,
  spawnTarget,
  stepStrikeWaves,
  stepTargets,
} from "./targets";
import {
  applyRemoteCarrier,
  enemyDeck,
  launchOne,
  releaseCarrier,
  setCatPose,
  spawnEnemyCarrier,
  stepCarrier,
  stepLaunch,
  stepLaunches,
} from "./carrier";
import {
  aimQuat,
  banditGuns,
  clearBandits,
  crashBandit,
  damageBandit,
  findBandit,
  killBandit,
  playerHeading,
  removeBandit,
  spawnMirrorBandit,
  stepBandit,
  stepCollisions,
  stepDamageSmoke,
  stepMirrorBandit,
  stepWaves,
  targets,
} from "./bandits";
import {
  assistBore,
  flash,
  gunPath,
  gunSolution,
  playerGuns,
  scatter,
  spawnTracer,
  stepFlashes,
  stepTracers,
  tracerCount,
} from "./gunnery";
import {
  bombPositions,
  bombReachable,
  followDesignation,
  impactBomb,
  pushReleaseMarker,
  releaseBomb,
  requestBombRelease,
  retireBomb,
  setDesignation,
  stepBombs,
  stepDesignator,
} from "./ordnance";
import {
  banditMissiles,
  fireHostileMissile,
  fireHostileRoundForTest,
  fireMissile,
  hostileRounds,
  impactMissile,
  nearestMissileTarget,
  putHostileRound,
  requestMissile,
  retireMissile,
  steerSeeker,
  stepMissiles,
  tryFlareCapture,
} from "./missiles";
import {
  deployFlares,
  flareCount,
  flareTargets,
  putFlare,
  receiveRemoteFlare,
  requestFlares,
  stepFlares,
} from "./countermeasures";
import {
  applyRemoteCarrierHit,
  applyRemoteHit,
  applyRemoteSnapshot,
  applySharedSnapshot,
  enemySnapshot,
  setMirror,
  sharedSnapshot,
  takeCarrierHit,
  takeHits,
} from "./sync";
import { hud, incomingMissile, strikeHud } from "./hud";
import type {
  Bandit,
  Bomb,
  CombatOpponent,
  DogfightHud,
  EnemyBomb,
  EnemyCarrier,
  EnemyCarrierState,
  EnemyHit,
  EnemyPose,
  EnemySnapshot,
  Flare,
  Flash,
  FleetDefender,
  GunCue,
  Missile,
  PlayerHit,
  Scenario,
  StrikeTarget,
  Tracer,
} from "./types";
import {
  BOMB_MAG,
  CV_FIRST_LAUNCH,
  CV_NAME,
  CV_START_DIST,
  DAMAGE_FLASH,
  HIT_FLASH,
  HULL_MAX,
  MAX_FLARES,
  MAX_FLASHES,
  MAX_TRACERS,
  MISSILE_LIFE,
  WAVE_MAX,
} from "./tuning";
import { FWD, disposeSubtree } from "./scratch";

export class Dogfight {
/** Explosions this fight throws: impacts, wrecks and missile bursts. */
  blasts!: ExplosionField;

  active = false;

  /** Mission machinery in play: bandits, or bombable targets. */
  scenario: Scenario = "dogfight";

  authored = false;

  operationSeed = 1;

  operationOrigin: { x: number; z: number; heading: number; carrier?: number } | undefined;

  combatId = 1;

  combatRevision = 0;

  receivedRevision = -1;

  operation: Operation | null = null;

  roleQueue: EnemyRole[] = [];

  recoveryBonus = 0;

  recoveryWire = 0;

  storesUsed = 0;

  defenseWarning = false;

  defenders: FleetDefender[] = [];

  localPilot = "";

  enemyFire: EnemyFire[] = [];

  fireSerial = 0;

  receivedFire = 0;

  enemyBombs: EnemyBomb[] = [];

  fleetSmokeTimer = 0;

  hull = HULL_MAX;

  kills = 0;

  wave = 0;

  nextId = 0;

  bandits: Bandit[] = [];

  /** Strike scenario: everything on the ground and at sea that dies to bombs. */
  strikeTargets: StrikeTarget[] = [];

  tracers: Tracer[] = [];

  flashPool: Flash[] = [];

  gunCd = 0;

  /** Muzzle flash at the nose: "am I actually shooting?" answered visually. */
  muzzle: THREE.Mesh;

  muzzleT = 0;

  /** The trigger is down right now (HUD + gun-path symbology). */
  gunLive = false;

  /** Sampled bullet-path points for the HUD's gun ladder (fixed capacity). */
  pathBuf: THREE.Vector3[] = [];

  pathCount = 0;

  pathOut: { points: THREE.Vector3[]; n: number } = { points: [], n: 0 };

  waveTimer = 0;

  threatT = 0;

  hitT = 0;

  confirmation: DogfightHud["confirmation"] = null;

  feedbackSoundCd = 0;

  onCombatFeedback?: (kind: "hit" | "destroyed") => void;

  damageT = 0;

  root = new THREE.Group();

  tracerPool: THREE.Mesh[] = [];

  matPlayer: THREE.MeshBasicMaterial;

  matBandit: THREE.MeshBasicMaterial;

  // hostile carrier + its launch queue
  cv: EnemyCarrier | null = null;

  launchQueued = 0;

  launchTimer = 0;

  launchSide = -1;

  waveClock = 0;

  fightOver = false;

  // bombs
  bombs: Bomb[] = [];

  bombPool: THREE.Object3D[] = [];

  bombsLeft = BOMB_MAG;

  bombsMax = BOMB_MAG; // set from the flown airframe's spec

  hullMax = HULL_MAX; // ditto

  // missiles
  missiles: Missile[] = [];

  missilePool: THREE.Object3D[] = [];

  missilesLeft = 0;

  missilesMax = 0; // set from the flown airframe's spec

  missileCd = 0;

  // flares / countermeasures
  flares: Flare[] = [];

  flarePool: THREE.Object3D[] = [];

  flaresLeft = 0;

  flaresMax = 0; // set from the flown airframe's spec

  flareCd = 0;

  station = 0;

  bombCd = 0;

  /** Releases asked for by the target pod, waiting on the release cooldown. */
  releaseQueue = 0;

  // laser designation: a live aim point (bombs in flight follow it) + the ring
  // marker on the ground under it. There is deliberately no beam from the jet to
  // the spot: the line read as a stray laser sweeping the canopy the moment a
  // weapon left the rack, and the ring already says where the pod is looking.
  designation: THREE.Vector3 | null = null;

  designationAttachment: { id: number | "carrier"; along: number; across: number; height: number } | null = null;

  designator: THREE.Mesh;

  /** Where/how the last weapon actually detonated (diagnostics/tests). */
  readonly lastImpact = new THREE.Vector3();

  lastImpactKind: BlastKind | null = null;

  /** Seconds since the last detonation, and since the last release. */
  impactAge = Infinity;

  releaseAge = Infinity;

  releaseMarker = new THREE.Vector3();

  // -------------------------------------------------------------------------
  // Multiplayer: one pilot runs the fight, the room flies in it
  /** A wingman's client: the enemies are the host's, not ours. */
  mirror = false;

  versus = false;

  opponents: CombatOpponent[] = [];

  playerHits: PlayerHit[] = [];

  weaponLaunches: WeaponLaunch[] = [];

  missileSerial = 0;

  /** Host: the fight as it goes on the wire. Reused — never kept. */
  snapOut: EnemySnapshot = { carrier: null, bandits: [], wave: 1 };

  /** Mirror: the damage our weapons did, waiting on the host to be told. */
  hitsOut: EnemyHit[] = [];

  carrierHitOut = 0;

  /** Mirror: bandits we took down locally, so a packet that still lists them (it
   *  was in the air when they died) cannot pop them back into the sky. */
  takenDown = new Map<number, number>();

  /** Mirror: when the last packet landed, and the gap it implies. */
  snapAt = 0;

  snapDt = 0.14;

  constructor(scene: THREE.Scene, blasts: ExplosionField) {
    this.blasts = blasts;
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
    // flares: a small brilliantly hot cartridge with an additive glow. A decoy
    // has to read as a burning flare from the cockpit, so it is a light source
    // first and a shape second (basic material, tone-mapping off).
    const flareBody = new THREE.CylinderGeometry(0.16, 0.16, 0.5, 8);
    flareBody.rotateX(Math.PI / 2);
    const flareMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false });
    const flareGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff9d3c, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    const flareGlow = new THREE.SphereGeometry(0.85, 8, 6);
    for (let i = 0; i < MAX_FLARES; i++) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(flareBody, flareMat));
      g.add(new THREE.Mesh(flareGlow, flareGlowMat));
      g.visible = false;
      g.frustumCulled = false;
      this.root.add(g);
      this.flarePool.push(g);
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
    this.flaresMax = spec.flares;
    this.hullMax = spec.hull;
    if (!this.active) this.bombsLeft = this.bombsMax;
    if (!this.active) this.missilesLeft = this.missilesMax;
    if (!this.active) this.flaresLeft = this.flaresMax;
  }

  configureOperations(authored: boolean, seed: number, id: number, origin?: { x: number; z: number; heading: number; carrier?: number }): void {
    this.authored = authored; this.operationSeed = seed; if (origin) this.operationOrigin = { ...origin };
    if (this.combatId !== id) { this.combatId = id; this.combatRevision = 0; this.receivedRevision = -1; this.fireSerial = this.receivedFire = 0; this.enemyFire = []; this.hitsOut = []; this.carrierHitOut = 0; }
  }

  get operationState(): OperationState | null { return this.operation?.state ?? null; }

  get hasSharedCombat(): boolean { return this.operation !== null || this.scenario === "strike"; }

  get operationEpoch(): number { return this.combatId; }

  get missionStats(): { storesUsed: number; recoveryBonus: number; recoveryWire: number; kills: number } {
    return { storesUsed: this.storesUsed, recoveryBonus: this.recoveryBonus, recoveryWire: this.recoveryWire, kills: this.kills };
  }

  recordRecovery(wire = 0): void { this.recoveryBonus = Math.max(this.recoveryBonus, wire > 0 ? 150 : 100); if (wire > 0) this.recoveryWire = wire; }

  failOperation(reason: string): void { this.operation?.finish(false, reason); }

  prepare(player: AircraftState): void {
    this.setAircraft(player);
    this.clear();
    // A wingman never owns the boat: the host's arrives on the wire.
    if (!this.mirror) this.spawnEnemyCarrier(player);
    if (this.authored && !this.mirror) this.operation = Operation.create("fleet", this.combatId, this.operationSeed, this.operationOrigin?.carrier ?? player.catCarrier);
  }


  /**
   * A recovery: the racks and the hull come back full. The sim calls this when
   * the jet touches down again on a friendly deck or runway, so a landing is a
   * chance to re-arm rather than the end of the fight.
   */
  refill(): void {
    this.bombsLeft = this.bombsMax;
    this.missilesLeft = this.missilesMax;
    this.flaresLeft = this.flaresMax;
    this.hull = this.hullMax;
  }


  /** Start (or restart) the fight around the player, reusing the boat if one is
   *  already inbound from prepare(). */
  begin(player: AircraftState): void {
    this.setAircraft(player);
    if (this.authored) {
      if ((!this.operation || this.operation.state.kind !== "fleet") && !this.mirror) this.prepare(player);
      this.active = true; this.refill();
      if (!this.mirror && this.operation?.state.status === "briefing") {
        this.operation.start(); this.wave = 1; this.roleQueue = ["scout"]; this.launchTimer = 1;
        this.banner(player, "FLEET DEFENSE — INTERCEPT SCOUT · THEN PROTECT THE CARRIER FROM BOMBERS");
      }
      return;
    }
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
    if (!this.mirror) {
      if (this.authored) { this.operation = Operation.create("convoy", this.combatId, this.operationSeed, this.operationOrigin?.carrier ?? player.catCarrier); this.spawnConvoy(player); }
      else this.spawnStrikeWave(player);
    }
  }


  /**
   * Start the strike: waves of land and sea targets, no aircraft anywhere.
   * A wave raised by prepareStrike() is kept — the targets the pilot watched
   * from the catapult are the ones waiting on the first run.
   */
  beginStrike(player: AircraftState): void {
    this.setAircraft(player);
    if (this.authored) {
      if ((!this.operation || this.operation.state.kind !== "convoy") && !this.mirror) this.prepareStrike(player);
      this.active = true; this.refill(); if (!this.mirror) this.operation?.start();
      this.banner(player, "STOP THE CONVOY — DISABLE 2 TRANSPORTS · ESCORT & RADAR OPTIONAL");
      return;
    }
    if (!this.mirror && (this.scenario !== "strike" || this.strikeTargets.length === 0)) {
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
    const flares = this.flaresLeft;
    this.setAircraft(player);
    this.clear();
    this.versus = true;
    this.active = true;
    this.hull = 100;
    if (!refillStores) {
      this.bombsLeft = Math.min(bombs, this.bombsMax);
      this.missilesLeft = Math.min(missiles, this.missilesMax);
      this.flaresLeft = Math.min(flares, this.flaresMax);
    }
  }

  setOpponents(opponents: CombatOpponent[]): void { this.opponents = opponents; }

  takeWeaponLaunches(): WeaponLaunch[] { const shots = this.weaponLaunches; this.weaponLaunches = []; return shots; }

  battleMissiles(): BattleMissile[] {
    if (!this.versus) return [];
    return this.missiles.filter(m => !m.hostile).map(m => {
      const target = m.decoy ? null : this.nearestMissileTarget(m.pos);
      return { id: m.id, pos: m.pos.toArray(), vel: m.vel.toArray(), age: MISSILE_LIFE - m.life,
        target: this.opponents.find(o => o.pos === target)?.id ?? null };
    });
  }

  takePlayerHits(): PlayerHit[] { const hits = this.playerHits; this.playerHits = []; return hits; }

  setBattleHull(hp: number): void {
    if (hp < this.hull) this.damageT = DAMAGE_FLASH;
    this.hull = hp;
  }

  hitOpponent(opponent: CombatOpponent, weapon: BattleWeapon): void {
    this.playerHits.push({ id: opponent.id, life: opponent.life, weapon });
    this.hitT = HIT_FLASH;
  }

  get designated(): THREE.Vector3 | null {
    return this.designation;
  }


  /** True while the room's host owns the enemies (this client only mirrors). */
  get mirroring(): boolean {
    return this.mirror;
  }


  /** Keep destruction readable even when another burst connects immediately. */
  confirmDamage(text: string, kind: "hit" | "destroyed"): void {
    this.hitT = HIT_FLASH;
    if (kind === "destroyed" || this.confirmation?.kind !== "destroyed") {
      this.confirmation = { text, kind, remaining: kind === "destroyed" ? 2.2 : 0.85 };
    }
    if (kind === "destroyed" || this.feedbackSoundCd <= 0) {
      this.onCombatFeedback?.(kind);
      this.feedbackSoundCd = kind === "destroyed" ? 0.4 : 0.16;
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
  clearFight(): void {
    this.active = false;
    while (this.enemyBombs.length) this.retireEnemyBomb(this.enemyBombs.length - 1);
    this.operation = null; this.roleQueue = []; this.recoveryBonus = 0; this.recoveryWire = 0; this.storesUsed = 0; this.defenseWarning = false; this.enemyFire = []; this.hitsOut = []; this.carrierHitOut = 0;
    this.scenario = "dogfight";
    this.versus = false;
    this.opponents = [];
    this.playerHits = [];
    this.weaponLaunches = [];
    this.gunLive = false;
    this.muzzleT = 0;
    this.threatT = 0;
    this.hitT = 0;
    this.confirmation = null;
    this.feedbackSoundCd = 0;
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
    for (const f of this.flares) {
      f.mesh.visible = false;
      this.flarePool.push(f.mesh);
    }
    this.flares = [];
    this.flaresLeft = this.flaresMax;
    this.flareCd = 0;
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
    this.flares = [];
    this.flarePool = [];
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
  step(dt: number, player: AircraftState, fireHeld: boolean, bombHeld = false, worldOnly = false): boolean {
    this.followDesignation();
    // The release and impact markers decay with the sim so they freeze on
    // pause, and they run even with no fight on (a cruise-leg bomb still has to
    // have its hit marked, and the mark has to expire).
    if (this.releaseAge !== Infinity) this.releaseAge += dt;
    if (this.impactAge !== Infinity) this.impactAge += dt;
    this.feedbackSoundCd = Math.max(0, this.feedbackSoundCd - dt);
    if (this.confirmation) {
      this.confirmation.remaining -= dt;
      if (this.confirmation.remaining <= 0) this.confirmation = null;
    }
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
    this.stepEnemyBombs(dt, player);
    // Flares burn in every mode: a cruise-leg cartridge still has to fall away
    // and go out, and the countermeasure cooldown has to run.
    this.stepFlares(dt);
    this.stepDesignator(player);
    if (player.result && !worldOnly) return false;
    // The guns are live in every scenario — plinking at the sea on a cruise
    // leg is half the fun — so the trigger is read before the mode branches.
    if (!worldOnly) this.playerGuns(dt, player, fireHeld);
    // A mirror flies the room's aircraft whether or not our own fight is armed:
    // a wingman watching the host's battle should see it even before their own
    // wheels leave the deck. Their guns only open up once we are in it.
    if (this.mirror) {
      for (const b of this.bandits) {
        this.stepMirrorBandit(b, dt);
        if (this.active && b.catT < 0) this.banditGuns(b, dt, player);
        this.banditMissiles(b, dt, player);
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
      if (!this.mirror) {
        if (this.operation) this.stepOperation(dt, player);
        else this.stepStrikeWaves(dt, player);
      }
      this.stepEscortDefense(dt, player);
      return this.hull <= 0;
    }
    this.stepCarrier(dt, player);
    // A mirror owns no launches and no waves: those aircraft are the host's, and
    // they were already flown by the packets above. Its guns, though, are still
    // ours — so a wingman is shot at, and shoots back, with nothing in the middle
    // of it. That is the least lag a shared fight can have.
    if (!this.mirror) {
      if (this.operation) this.stepOperationLaunches(dt, player);
      else this.stepLaunches(dt, player);
      // Walk the bandits backwards: one that flies into the ground is removed on
      // the spot, and splicing the current index is only safe that way.
      for (let i = this.bandits.length - 1; i >= 0; i--) {
        const b = this.bandits[i];
        if (this.operation && (b.role !== "escort" || b.retreat || b.hp <= 9 || (b.ammo ?? 0) + b.missiles <= 0 || (b.sortieTime ?? 0) > 240)) {
          this.stepRoleAircraft(b, dt, player); continue;
        }
        if (this.operation) b.sortieTime = (b.sortieTime ?? 0) + dt;
        const defender = this.operation ? this.nearestDefender(player, b.pos) : player;
        if (!this.stepBandit(b, dt, defender)) continue;
        this.banditGuns(b, dt, defender);
        this.banditMissiles(b, dt, defender);
      }
    }
    this.stepCollisions(player);
    this.stepTracers(dt, player);
    this.stepFlashes(dt);
    if (!this.mirror) {
      if (this.operation) this.stepOperation(dt, player);
      else this.stepWaves(dt, player);
    }
    return false;
  }

  cueOut: GunCue = { x: 0, y: 0, z: 0, range: 0, t: 0, hit: null, live: false };

  damagePlayer(player: AircraftState, dmg: number): void {
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

  banner(player: AircraftState, text: string): void {
    player.banner = { text, until: player.time + 3 };
  }

  // -------------------------------------------------------------------------
  // Surface: one-line delegates into the subsystem modules, so every existing
  // caller keeps a single entry point. The logic is in the modules.

    operationHud(player: AircraftState): OperationHud | undefined {
      return operationHud(this, player);
    }

    sharedSnapshot(): SharedCombat {
      return sharedSnapshot(this);
    }

    applySharedSnapshot(frame: SharedCombat, nowMs: number): void {
      applySharedSnapshot(this, frame, nowMs);
    }

    spawnConvoy(player: AircraftState): void {
      spawnConvoy(this, player);
    }

    stepOperation(dt: number, player: AircraftState): void {
      stepOperation(this, dt, player);
    }

    stepOperationLaunches(dt: number, player: AircraftState): void {
      stepOperationLaunches(this, dt, player);
    }

    stepRoleAircraft(b: Bandit, dt: number, player: AircraftState): void {
      stepRoleAircraft(this, b, dt, player);
    }

    stepEscortDefense(dt: number, player: AircraftState): void {
      stepEscortDefense(this, dt, player);
    }

    setDefenders(self: string, defenders: FleetDefender[]): void {
      setDefenders(this, self, defenders);
    }

    createEnemyBomb(id: number, pos: THREE.Vector3, vel: THREE.Vector3): EnemyBomb {
      return createEnemyBomb(this, id, pos, vel);
    }

    retireEnemyBomb(index: number): void {
      retireEnemyBomb(this, index);
    }

    stepEnemyBombs(dt: number, player: AircraftState): void {
      stepEnemyBombs(this, dt, player);
    }

    nearestDefender(player: AircraftState, from: THREE.Vector3): AircraftState {
      return nearestDefender(this, player, from);
    }

    takeEnemyFire(): EnemyFire[] {
      return takeEnemyFire(this);
    }

    receiveEnemyFire(shot: EnemyFire): void {
      receiveEnemyFire(this, shot);
    }

    setDesignation(p: THREE.Vector3 | null): void {
      setDesignation(this, p);
    }

    followDesignation(): void {
      followDesignation(this);
    }

    requestBombRelease(player?: AircraftState): boolean {
      return requestBombRelease(this, player);
    }

    bombReachable(player: AircraftState): boolean {
      return bombReachable(this, player);
    }

    enemyDeck(): CarrierDef | null {
      return enemyDeck(this);
    }

    setMirror(on: boolean, player: AircraftState): void {
      setMirror(this, on, player);
    }

    enemySnapshot(): EnemySnapshot {
      return enemySnapshot(this);
    }

    applyRemoteSnapshot(snap: EnemySnapshot, nowMs: number): void {
      applyRemoteSnapshot(this, snap, nowMs);
    }

    applyRemoteHit(id: number, dmg: number, player: AircraftState, combatId?: number): void {
      applyRemoteHit(this, id, dmg, player, combatId);
    }

    applyRemoteCarrierHit(dmg: number, player: AircraftState): void {
      applyRemoteCarrierHit(this, dmg, player);
    }

    takeHits(): EnemyHit[] {
      return takeHits(this);
    }

    takeCarrierHit(): number {
      return takeCarrierHit(this);
    }

    releaseCarrier(): void {
      releaseCarrier(this);
    }

    applyRemoteCarrier(c: EnemyCarrierState | null): void {
      applyRemoteCarrier(this, c);
    }

    findBandit(id: number): Bandit | null {
      return findBandit(this, id);
    }

    spawnMirrorBandit(p: EnemyPose): Bandit {
      return spawnMirrorBandit(this, p);
    }

    stepMirrorBandit(b: Bandit, dt: number): void {
      stepMirrorBandit(this, b, dt);
    }

    stepDamageSmoke(b: Bandit, dt: number): void {
      stepDamageSmoke(this, b, dt);
    }

    damageBandit(b: Bandit, dmg: number, player: AircraftState): void {
      damageBandit(this, b, dmg, player);
    }

    incomingMissile(player: AircraftState): DogfightHud["incoming"] {
      return incomingMissile(this, player);
    }

    hud(player: AircraftState): DogfightHud {
      return hud(this, player);
    }

    strikeHud(player: AircraftState): DogfightHud {
      return strikeHud(this, player);
    }

    tracerCount(): number {
      return tracerCount(this);
    }

    bombPositions(): THREE.Vector3[] {
      return bombPositions(this);
    }

    gunSolution(player: AircraftState): GunCue {
      return gunSolution(this, player);
    }

    gunPath(): { points: THREE.Vector3[]; n: number } {
      return gunPath(this);
    }

    assistBore(_player: AircraftState, muzzle: THREE.Vector3, bore: THREE.Vector3,): THREE.Vector3 {
      return assistBore(this, _player, muzzle, bore);
    }

    targets(): Array<{ id: number; pos: THREE.Vector3; vel: THREE.Vector3 }> {
      return targets(this);
    }

    spawnEnemyCarrier(player: AircraftState): void {
      spawnEnemyCarrier(this, player);
    }

    stepCarrier(dt: number, player: AircraftState): void {
      stepCarrier(this, dt, player);
    }

    stepLaunches(dt: number, player: AircraftState): void {
      stepLaunches(this, dt, player);
    }

    launchOne(player: AircraftState, cv: EnemyCarrier, role: EnemyRole = "fighter"): void {
      launchOne(this, player, cv, role);
    }

    setCatPose(b: Bandit, deckY: number): void {
      setCatPose(this, b, deckY);
    }

    stepLaunch(b: Bandit, dt: number): void {
      stepLaunch(this, b, dt);
    }

    stepBombs(dt: number, player: AircraftState, held: boolean): void {
      stepBombs(this, dt, player, held);
    }

    impactBomb(i: number, at: THREE.Vector3, kind: BlastKind, player: AircraftState): void {
      impactBomb(this, i, at, kind, player);
    }

    releaseBomb(player: AircraftState): void {
      releaseBomb(this, player);
    }

    pushReleaseMarker(at: THREE.Vector3): void {
      pushReleaseMarker(this, at);
    }

    retireBomb(i: number): void {
      retireBomb(this, i);
    }

    requestFlares(player: AircraftState): void {
      requestFlares(this, player);
    }

    deployFlares(player: AircraftState, n: number): void {
      deployFlares(this, player, n);
    }

    receiveRemoteFlare(owner: string, life: number, shot: WeaponLaunch): boolean {
      return receiveRemoteFlare(this, owner, life, shot);
    }

    flareTargets(): readonly FlareTarget[] {
      return flareTargets(this);
    }

    putFlare(pos: THREE.Vector3, vel: THREE.Vector3, owner: string | null, ownerLife: number): boolean {
      return putFlare(this, pos, vel, owner, ownerLife);
    }

    stepFlares(dt: number): void {
      stepFlares(this, dt);
    }

    captureFlare(m: Missile, dt: number): Flare | null {
      return tryFlareCapture(this, m, dt);
    }

    retireMissile(i: number, m: Missile): void {
      retireMissile(this, i, m);
    }

    banditMissiles(b: Bandit, dt: number, player: AircraftState): void {
      banditMissiles(this, b, dt, player);
    }

    fireHostileMissile(b: Bandit, player: AircraftState): boolean {
      return fireHostileMissile(this, b, player);
    }

    putHostileRound(pos: THREE.Vector3, vel: THREE.Vector3, seed: number): boolean {
      return putHostileRound(this, pos, vel, seed);
    }

    flareCount(): number {
      return flareCount(this);
    }

    hostileRounds(): Array<{ x: number; y: number; z: number; decoyed: boolean }> {
      return hostileRounds(this);
    }

    fireHostileRoundForTest(pos: THREE.Vector3, vel: THREE.Vector3, seed = 1): boolean {
      return fireHostileRoundForTest(this, pos, vel, seed);
    }

    steerSeeker(m: Missile, target: THREE.Vector3, dt: number): number {
      return steerSeeker(this, m, target, dt);
    }

    requestMissile(player: AircraftState): void {
      requestMissile(this, player);
    }

    nearestMissileTarget(from: THREE.Vector3): THREE.Vector3 | null {
      return nearestMissileTarget(this, from);
    }

    fireMissile(player: AircraftState): void {
      fireMissile(this, player);
    }

    stepMissiles(dt: number, player: AircraftState): void {
      stepMissiles(this, dt, player);
    }

    impactMissile(i: number, at: THREE.Vector3, kind: BlastKind, player: AircraftState): void {
      impactMissile(this, i, at, kind, player);
    }

    damageCarrier(at: THREE.Vector3, player: AircraftState, dmg: number): void {
      damageCarrier(this, at, player, dmg);
    }

    blastTargets(at: THREE.Vector3, player: AircraftState): void {
      blastTargets(this, at, player);
    }

    damageTarget(t: StrikeTarget, dmg: number, player: AircraftState): void {
      damageTarget(this, t, dmg, player);
    }

    spawnStrikeWave(player: AircraftState): number {
      return spawnStrikeWave(this, player);
    }

    spawnTarget(kind: TargetKind, x: number, y: number, z: number, headingDeg: number, sea: boolean,): void {
      spawnTarget(this, kind, x, y, z, headingDeg, sea);
    }

    findLandSite(player: AircraftState): THREE.Vector3 | null {
      return findLandSite(this, player);
    }

    findSeaSite(player: AircraftState): THREE.Vector3 | null {
      return findSeaSite(this, player);
    }

    stepTargets(dt: number): void {
      stepTargets(this, dt);
    }

    stepStrikeWaves(dt: number, player: AircraftState): void {
      stepStrikeWaves(this, dt, player);
    }

    clearBandits(): void {
      clearBandits(this);
    }

    clearTargets(): void {
      clearTargets(this);
    }

    playerHeading(player: AircraftState): number {
      return playerHeading(this, player);
    }

    aimQuat(b: Bandit, dir: THREE.Vector3, bank: number): void {
      aimQuat(this, b, dir, bank);
    }

    stepBandit(b: Bandit, dt: number, player: AircraftState): boolean {
      return stepBandit(this, b, dt, player);
    }

    banditGuns(b: Bandit, dt: number, player: AircraftState): void {
      banditGuns(this, b, dt, player);
    }

    playerGuns(dt: number, player: AircraftState, fireHeld: boolean): void {
      playerGuns(this, dt, player, fireHeld);
    }

    spawnTracer(origin: THREE.Vector3, dir: THREE.Vector3, hostile: boolean, inherit: THREE.Vector3 | null,): void {
      spawnTracer(this, origin, dir, hostile, inherit);
    }

    stepTracers(dt: number, player: AircraftState): void {
      stepTracers(this, dt, player);
    }

    killBandit(b: Bandit, player: AircraftState): void {
      killBandit(this, b, player);
    }

    crashBandit(b: Bandit, player: AircraftState, kind: BlastKind): void {
      crashBandit(this, b, player, kind);
    }

    removeBandit(b: Bandit): void {
      removeBandit(this, b);
    }

    stepCollisions(player: AircraftState): void {
      stepCollisions(this, player);
    }

    stepDesignator(player: AircraftState): void {
      stepDesignator(this, player);
    }

    stepWaves(dt: number, player: AircraftState): void {
      stepWaves(this, dt, player);
    }

    flash(at: THREE.Vector3): void {
      flash(this, at);
    }

    stepFlashes(dt: number): void {
      stepFlashes(this, dt);
    }

    scatter(dir: THREE.Vector3, spread: number, seed: number): void {
      scatter(this, dir, spread, seed);
    }
}
