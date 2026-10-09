import { RemoteWeapons } from "../render/remoteWeapons";
import { BattleReferee, type BattleAction, type BattleSnapshot } from "../net/versus";
import { specFor } from "./aircraft";
// Sim orchestrator: state machine, fixed-timestep sim, render loop, HUD feed.

import * as THREE from "three";
import { WorldRenderer } from "../render/renderer";
import { animateJet } from "../render/rig";
import { CameraRig, type CameraMode } from "../render/cameras";
import { AudioEngine } from "../audio/engineSound";
import { InputManager } from "../input/input";
import {
  isRecoverySurface,
  glideStateFor,
  spawnAircraft,
  stepAircraft,
  type AircraftState,
  type FlightInput,
  type MissionKind,
} from "../sim/flight";
import {
  DEFAULT_SEED,
  EXTENT,
  activeWorldDef,
  airfield,
  carriers,
  groundAt,
  nearestCarrier,
  setWorldSeed as regenerateTerrain,
  terrainHeight,
  worldSeedForRoom,
} from "../sim/world";
import type { TerrainPaint } from "../render/scene";
import { CYCLE_MINUTES_PER_DAY, type MissionMode, type Settings } from "../settings";
import { HOME_SITE, dayPhase, sunPosition, sunVector, type DayPhase } from "../sim/sun";
import { Dogfight, type CarrierStatus, type GunCue } from "../sim/dogfight";
import { ExplosionField } from "../render/effects";
import { pickDesignation, screenRay } from "../sim/targeting";
import {
  FLAG_AB,
  FLAG_ACTIVE,
  FLAG_FLAPS,
  FLAG_GEAR,
  FLAG_ON_GROUND,
  FLAG_SPEEDBRAKE,
  FLAG_STALLED,
  RemoteFleet,
  type RemotePose,
} from "../render/remoteJets";
import {
  Multiplayer,
  sanitizeChat,
  type ChatMsg,
  type NetState,
  type NetStatus,
  type PeerFactory,
} from "../net/multiplayer";

export type Phase = "menu" | "flying" | "paused" | "result";

export interface HudSnapshot {
  speedKt: number;
  altFt: number;
  mach: number;
  headingDeg: number;
  aoaDeg: number;
  vsFpm: number;
  gLoad: number;
  throttlePct: number;
  rpmPct: number;
  ab: number;
  /** The afterburner switch is armed (burner lights at full throttle). */
  abOn: boolean;
  gear: boolean;
  flaps: boolean;
  speedbrake: boolean;
  trim: number;
  sweepDeg: number;
  /** True only for airframes with variable-geometry wings (the Tomcat). */
  sweepable: boolean;
  stalled: boolean;
  onGround: boolean;
  catPhase: string;
  catProgress: number;
  pitchDeg: number;
  rollDeg: number;
  cameraMode: CameraMode;
  wire?: number;
  /** Carrier-approach guidance (the boat's simulated IFLOLS), null when the
   *  jet is parked, out of the ball-call window, or past the glide origin. */
  glide: {
    rangeM: number;
    deviationM: number;
    lineupM: number;
    onSpeedKt: number;
    onSpeedAoaDeg: number;
  } | null;
  resultTitle?: string;
  resultDetail?: string;
  resultKind?: "wire" | "bolter" | "crash" | "landing";
  banner?: string;
  flightTime: number;
  distCarrierKm: number;
  bearingCarrierDeg: number;
  carrierName: string;
  distFieldKm: number;
  bearingFieldDeg: number;
  worldLabel: string;
  /** The terrain seed in play, so wingmen can confirm they see the same world. */
  worldSeed: number;
  radarAltFt: number;
  // minimap + daylight
  playerX: number;
  playerZ: number;
  playerHeadingDeg: number;
  carrierMarkers: Array<{ name: string; x: number; z: number; near: boolean }>;
  fieldX: number;
  fieldZ: number;
  worldExtent: number;
  localHour: number;
  dayPhase: DayPhase;
  // dogfight / strike mode
  dfActive: boolean;
  /** True in strike mode: contacts are targets, not bandits. */
  dfStrike: boolean;
  dfHull: number;
  dfKills: number;
  dfWave: number;
  /** Bandits flying, or strike targets still standing. */
  dfBandits: number;
  dfNearestKm: number;
  dfNearestBrgDeg: number;
  enemyMarkers: Array<{ x: number; z: number }>;
  dfThreat: boolean;
  /** The player's trigger is down (muzzle flash + bright bullet ladder). */
  gunFiring: boolean;
  dfHitT: number;
  dfDamageT: number;
  dfSpots: Array<{ x: number; y: number; z: number; lx: number; ly: number; lz: number; km: number }>;
  /** The airframe the player is flying, for the HUD label. */
  aircraftName: string;
  dfBombs: number;
  dfBombsMax: number;
  dfBombsAway: number;
  /** Missiles on the rails (0/0 for airframes without them). */
  dfMissiles: number;
  dfMissilesMax: number;
  dfCarrier: HostileCarrierHud | null;
  /** Guided bombs still tracking the laser. */
  dfBombsTracking: number;
  /** Every weapon in the air, for the pod's weapon symbology. */
  dfBombTracks: Array<{ x: number; y: number; z: number; km: number }>;
  /** The laser spot, while one is designated. */
  dfDesignated: { x: number; y: number; z: number; km: number } | null;
  /** The rack the last store left, marked briefly so a release is visible. */
  dfReleased: { x: number; y: number; z: number; age: number } | null;
  /** Where the last weapon went off, marked for a few seconds after the flash. */
  dfLanded: { x: number; y: number; z: number; age: number; kind: "ground" | "air" | "water" } | null;
  /** True while the target pod camera is up (a click designates). */
  pod: boolean;
  /** Multiplayer: live wingmen, nearest first. */
  remotes: RemoteContact[];
  /** Multiplayer session, condensed for the HUD and the lobby. */
  netStatus: NetStatus;
  netRoom: string;
  netHost: boolean;
  netPilots: number;
  battle?: BattleSnapshot;
  battleSelf?: string;
}

/** A wingman as the HUD sees it. */
export interface RemoteContact {
  id: string;
  name: string;
  x: number;
  z: number;
  km: number;
  brgDeg: number;
}

/** The enemy boat, as the HUD sees it. */
export interface HostileCarrierHud {
  name: string;
  x: number;
  y: number;
  z: number;
  distKm: number;
  brgDeg: number;
  hp: number;
  status: CarrierStatus;
  inbound: number;
}

const FIXED_DT = 1 / 120;

/** No control input at all — what a dead stick reads as. */
const IDLE_INPUT: FlightInput = {
  pitch: 0, roll: 0, yaw: 0, throttleUp: false, throttleDown: false,
  trimUp: false, trimDown: false, brake: false, catHold: false,
};
/** Crash-replay scratch: parking smoke columns above the wreck. */
const TMPV = new THREE.Vector3();

/** Built once: constructing an Intl formatter per frame is wasteful. */
const HST_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: "Pacific/Honolulu",
  hour: "numeric",
  minute: "numeric",
  hour12: false,
});

/** Local clock hour in Hawaii right now. */
function hawaiiHour(): number {
  const parts = HST_CLOCK.formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return (h % 24) + m / 60;
}

/** Day of the year, 1..366, so the solar declination tracks the seasons. */
function dayOfYearNow(): number {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  return Math.floor((now.getTime() - start) / 86_400_000);
}

function defaultHud(): HudSnapshot {
  return {
    speedKt: 0, altFt: 0, mach: 0, headingDeg: 0, aoaDeg: 0, vsFpm: 0, gLoad: 1,
    throttlePct: 0, rpmPct: 0, ab: 0, abOn: false, gear: true, flaps: false, speedbrake: false,
    trim: 0.5, sweepDeg: 20, sweepable: false, stalled: false, onGround: true, catPhase: "ready",
    catProgress: 0, pitchDeg: 0, rollDeg: 0,    cameraMode: "chase", flightTime: 0,
    glide: null,
    distCarrierKm: 0, bearingCarrierDeg: 0, carrierName: "—", distFieldKm: 0,
    bearingFieldDeg: 0, worldLabel: "Procedural islands", worldSeed: DEFAULT_SEED,
    radarAltFt: 0,
    playerX: 0, playerZ: 0, playerHeadingDeg: 0, carrierMarkers: [],
    fieldX: 0, fieldZ: 0, worldExtent: 12000,
    localHour: 12, dayPhase: "day",
    dfActive: false, dfStrike: false, dfHull: 100, dfKills: 0, dfWave: 1, dfBandits: 0,
    dfNearestKm: 0, dfNearestBrgDeg: 0, enemyMarkers: [],
    dfThreat: false, gunFiring: false, dfHitT: 0, dfDamageT: 0, dfSpots: [],
    aircraftName: "F-14A TOMCAT",
    dfBombs: 6, dfBombsMax: 6, dfBombsAway: 0, dfCarrier: null,
    dfMissiles: 2, dfMissilesMax: 2,
    dfBombsTracking: 0, dfBombTracks: [], dfDesignated: null,
    dfReleased: null, dfLanded: null, pod: false,
    remotes: [], netStatus: "idle", netRoom: "", netHost: false, netPilots: 0,
  };
}

/** An idle net session, so the HUD has something to read before anyone joins. */
function idleNetState(): NetState {
  return {
    status: "idle", room: "", self: "", host: false, pilots: [],
    hz: 0, sent: 0, recv: 0,
  };
}

export class Sim {
  phase: Phase = "menu";
  private renderer: WorldRenderer;
  private rig = new CameraRig();
  private audio = new AudioEngine();
  private input: InputManager;
  private settings: Settings;
  private state: AircraftState;
  private mission: MissionKind = "carrier";
  private acc = 0;
  private last = 0;
  private raf = 0;
  private prevPos = new THREE.Vector3();
  private prevQuat = new THREE.Quaternion();
  // Per-frame scratch: the render loop must not allocate.
  private poseQ = new THREE.Quaternion();
  private camP = new THREE.Vector3();
  private camQ = new THREE.Quaternion();
  private hudFwd = new THREE.Vector3();
  private hudRight = new THREE.Vector3();
  private hud: HudSnapshot = defaultHud();
  private hudListeners = new Set<(h: HudSnapshot) => void>();
  private phaseListeners = new Set<(p: Phase) => void>();
  private lastHudNotify = 0;
  /** The terrain seed in play. Regenerating from it rebuilds the whole world. */
  private worldSeed = DEFAULT_SEED;
  private spawnCarrier = 0;
  private nextCarrier = 0;
  private onResize = () => this.renderer.resize();
  private inputPitch = 0;
  private inputRoll = 0;
  private inputYaw = 0;
  /** Daylight cycle: hours within the local day, 0..24. */
  private dayHours: number;
  private dayPhase: DayPhase = "day";
  private sunVec = new THREE.Vector3(0, 1, 0);
  private df: Dogfight;
  /** Dogfight armed on the deck/runway: the fight starts once airborne. */
  private dfArmed = false;
  private dfArmText = "HOSTILE CARRIER INBOUND — LAUNCH TO INTERCEPT";
  /** Ordnance effects: fireballs, water columns, debris. */
  private explosions: ExplosionField;
  /** Target pod camera is up: the mouse aims, a click designates. */
  private pod = false;
  /**
   * The crash replay, from the fatal hit to the screen: while `falling`, the
   * dead jet tumbles under the action camera; after impact the camera holds on
   * the fireball for a beat before the results take over. Null when alive.
   */
  private crashSeq: { falling: boolean; t: number; smokeT: number } | null = null;
  /** One-shot: the next menu should open on the multiplayer screen (a dead
   *  pilot returning to their room's lobby). */
  private pendingRoom = false;
  /** The jet broke apart at the fatal hit: the mesh stays hidden for the rest
   *  of the replay and only reappears on the next flight. */
  private breakupHide = false;
  private pickOrigin = new THREE.Vector3();
  private pickDir = new THREE.Vector3();
  /** Multiplayer: wingmen meshes, the P2P session, and its latest state. */
  private remoteFleet: RemoteFleet;
  private remoteWeapons: RemoteWeapons;
  private net: Multiplayer;
  private netState: NetState = idleNetState();
  private battleReferee = new BattleReferee();
  private battle: BattleSnapshot = { match: 0, pilots: [] };
  private battleSeq = 0;
  private battleLife = -1;
  private battleDeadLife = -1;
  private battleTickAt = 0;
  private battleReadyAt = 0;
  private netListeners = new Set<(s: NetState) => void>();
  /** The room radio: newest last, capped so a long session cannot grow it. */
  private chatLog: ChatMsg[] = [];
  private chatListeners = new Set<() => void>();
  /** Settings the room asks for (the host's mission profile), for the UI to
   *  apply and persist — the sim does not own where settings live. */
  private settingsListeners = new Set<(s: Settings) => void>();

  /** Reused each frame: packing a pose should not allocate. */
  private poseOut: RemotePose = {
    x: 0, y: 0, z: 0,
    qx: 0, qy: 0, qz: 0, qw: 1,
    vx: 0, vy: 0, vz: 0,
    speed: 0, sweepT: 0, flags: 0,
  };

  constructor(canvas: HTMLCanvasElement, settings: Settings, peerFactory?: PeerFactory) {
    this.settings = settings;
    // The world is a pure function of a seed and is generated synchronously, so
    // the first frame already flies real terrain. Solo flight flies the default
    // world; the room code picks a different one once a pilot opens a room.
    this.worldSeed = DEFAULT_SEED;
    regenerateTerrain(this.worldSeed);
    this.dayHours = this.resolveDayHours(settings);
    this.renderer = new WorldRenderer(
      canvas,
      settings.quality,
      { height: terrainHeight },
      settings.aircraft,
    );
    this.renderer.applyQuality(settings.quality);
    this.input = new InputManager(settings);
    // honour the persisted volume from the first frame — applySettings only
    // runs when the user touches a setting, so the constructor must seed it.
    this.audio.setVolume(settings.volume);
    this.explosions = new ExplosionField(this.renderer.scene, settings.quality);
    this.df = new Dogfight(this.renderer.scene, this.explosions);
    // Multiplayer: wingman meshes live in the same scene; the P2P session
    // stays idle (and costs nothing) until the pilot opens or joins a room.
    this.remoteFleet = new RemoteFleet(this.renderer.scene);
    this.remoteWeapons = new RemoteWeapons(this.renderer.scene, this.explosions);
    this.net = new Multiplayer({
      onState: (s) => {
        this.netState = s;
        this.syncWorldToRoom(s);
        for (const fn of this.netListeners) fn(s);
      },
      onPilot: (id, name, aircraft) => this.remoteFleet.spawn(id, aircraft, name),
      onPilotLeave: (id) => this.remoteFleet.remove(id),
      onPose: (id, pose) => this.remoteFleet.push(id, pose, performance.now()),
      onLaunch: (mission, carrier) => this.followLaunch(mission, carrier),
      // The room's fight, from whoever is hosting it. Our guns are still ours;
      // only the aircraft are theirs.
      onEnemies: (snap) => { if (this.settings.missionMode !== "versus") this.df.applyRemoteSnapshot(snap, performance.now()); },
      onMode: (mode) => this.applyRoomMode(mode),
      onHit: (id, dmg) => this.df.applyRemoteHit(id, dmg, this.state),
      onCarrierHit: (dmg) => this.df.applyRemoteCarrierHit(dmg, this.state),
      onChat: (msg) => this.addChat(msg),
      onBattleAction: (sender, action) => this.receiveBattleAction(sender, action),
      onBattleState: (snapshot) => this.applyBattle(snapshot),
      onBattleShot: (sender, shot) => {
        const pilot = this.battle.pilots.find(p => p.id === sender);
        if (this.battleActive && shot.match === this.battle.match && pilot?.life === shot.life && !pilot.shield) this.remoteWeapons.add(sender, shot);
      },
    }, peerFactory);
    this.input.attach(canvas);
    window.addEventListener("resize", this.onResize);
    this.state = spawnAircraft("carrier", 0, settings.aircraft);
    this.updateJetPose(1);
    this.updateHud();
    this.raf = requestAnimationFrame(this.loop);
  }

  applySettings(s: Settings): void {
    const qualityChanged = s.quality !== this.settings.quality;
    const daylightChanged =
      s.daylight !== this.settings.daylight || s.timeOfDay !== this.settings.timeOfDay;
    const modeChanged = s.missionMode !== this.settings.missionMode;
    const aircraftChanged = s.aircraft !== this.settings.aircraft;
    this.settings = s;
    this.input.applySettings(s);
    this.audio.setVolume(s.volume);
    if (qualityChanged) {
      this.renderer.applyQuality(s.quality);
      this.explosions.setQuality(s.quality);
    }
    if (daylightChanged) this.dayHours = this.resolveDayHours(s);
    // Changing airframe: rebuild the mesh and re-park the jet on the new type.
    if (aircraftChanged) {
      this.renderer.setAircraft(s.aircraft);
      this.state = spawnAircraft(this.mission, this.spawnCarrier, s.aircraft);
      this.prevPos.copy(this.state.pos);
      this.prevQuat.copy(this.state.quat);
      this.df.setAircraft(this.state);
      this.net.setAircraft(s.aircraft);
      this.updateJetPose(1);
    }
    // Toggling a mission mode mid-flight starts or clears it; toggling it on
    // the ground arms the launch instead, so nothing starts while parked.
    if (modeChanged) {
      // A mission profile is the room's profile: tell everyone the moment the
      // host (the only pilot with these chips) changes it.
      this.net.setMode(s.missionMode);
      const flying = this.phase === "flying" || this.phase === "paused";
      const combat = s.missionMode === "dogfight" || s.missionMode === "strike";
      const strike = s.missionMode === "strike";
      if (s.missionMode === "versus" && flying) {
        this.dfArmed = false;
        this.df.beginVersus(this.state);
      } else if (combat && flying && !this.state.onGround) {
        this.dfArmed = false;
        if (strike) this.df.beginStrike(this.state);
        else this.df.begin(this.state);
      } else if (combat && flying) {
        this.dfArmed = true;
        this.dfArmText = strike
          ? "STRIKE TARGETS ON THE GRID — LAUNCH TO ENGAGE"
          : "HOSTILE CARRIER INBOUND — LAUNCH TO INTERCEPT";
        this.state.banner = { text: this.dfArmText, until: Infinity };
        // the carrier / target grid is already out there while we hold on deck
        if (strike) this.df.prepareStrike(this.state);
        else this.df.prepare(this.state);
      } else {
        this.dfArmed = false;
        this.df.clear();
      }
    }
  }

  /**
   * Where the sun starts for the chosen daylight mode. "live" reads the real
   * clock in Hawaii, "fixed" pins the chosen hour, and "cycle" keeps whatever
   * time it has already advanced to.
   */
  private resolveDayHours(s: Settings): number {
    if (s.daylight === "live") return hawaiiHour();
    if (s.daylight === "fixed") return s.timeOfDay;
    return this.dayHours ?? s.timeOfDay;
  }

  /** Advance the clock. "live" tracks the wall clock; "cycle" runs fast. */
  private advanceDaylight(dt: number): void {
    if (this.settings.daylight === "live") {
      this.dayHours = hawaiiHour();
    } else if (this.settings.daylight === "cycle") {
      this.dayHours = (this.dayHours + (dt / 60) * (24 / CYCLE_MINUTES_PER_DAY)) % 24;
    } else {
      this.dayHours = this.settings.timeOfDay;
    }
  }

  /** The local hour the HUD should show. */
  get localHour(): number {
    return this.dayHours;
  }

  startMission(mission: MissionKind): void {
    if (mission === "carrier") {
      // rotate through the fleet so every boat gets used
      this.spawnCarrier = this.nextCarrier;
      this.nextCarrier = (this.nextCarrier + 1) % carriers().length;
    }
    this.beginMission(mission, this.spawnCarrier);
  }

  /**
   * Launch a sortie from the multiplayer lobby. The choice is broadcast before
   * it happens here: the mesh has no referee, so the pilot who takes off is the
   * one who tells the room which mission and which boat to use. Wingmen still
   * in the lobby follow along; anyone already airborne keeps their own sortie.
   */
  startRoomMission(mission: MissionKind): void {
    if (!this.netState.host) return;
    if (this.settings.missionMode === "versus") {
      if (!this.netState.pilots.some(p => p.linked)) { this.pushBanner("HEAD-TO-HEAD — WAIT FOR ANOTHER PILOT"); return; }
      this.battleReferee.reset(Date.now());
      this.battle = { match: this.battleReferee.match, pilots: [] };
      this.battleTickAt = 0;
    }
    if (mission === "carrier") {
      this.spawnCarrier = this.nextCarrier;
      this.nextCarrier = (this.nextCarrier + 1) % carriers().length;
    }
    this.net.launch(mission, this.spawnCarrier);
    this.beginMission(mission, this.spawnCarrier);
  }

  joinBattle(): void {
    if (this.netState.status === "online" && this.settings.missionMode === "versus" && this.battle.match) this.beginMission("carrier", this.spawnCarrier);
  }

  /** A wingman took off: join the same strip, on the same boat. */
  private followLaunch(mission: MissionKind, carrier: number): void {
    // Only a pilot still in the menu comes along — one already flying (or
    // reading the pause menu) is left to finish the sortie they are on.
    if (this.phase !== "menu") return;
    const boats = carriers().length;
    this.spawnCarrier = ((carrier % boats) + boats) % boats;
    this.beginMission(mission, this.spawnCarrier);
  }

  private beginMission(mission: MissionKind, carrierIndex: number): void {
    this.mission = mission;
    this.endPod();
    this.crashSeq = null;
    this.pendingRoom = false;
    this.breakupHide = false;
    this.state = spawnAircraft(mission, carrierIndex, this.settings.aircraft);
    this.battleLife = -1;
    this.battleDeadLife = -1;
    this.battleReadyAt = 0;
    // size the racks and hull for this airframe before the fight is armed
    this.df.setAircraft(this.state);
    // Mission modes: the bandits / targets are out there from the start, but
    // the fight itself only begins when the jet leaves the deck/runway — the
    // launch is part of it.
    const combat = this.settings.missionMode === "dogfight" || this.settings.missionMode === "strike";
    if (this.settings.missionMode === "versus" && this.netState.status === "online") {
      this.dfArmed = false;
      this.spawnBattleAircraft();
    } else if (combat) {
      const strike = this.settings.missionMode === "strike";
      // the hostile carrier / target grid is there before wheels-up
      if (strike) this.df.prepareStrike(this.state);
      else this.df.prepare(this.state);
      this.dfArmed = true;
      const what = strike ? "STRIKE TARGETS ON THE GRID" : "HOSTILE CARRIER INBOUND";
      this.dfArmText = mission === "carrier"
        ? `${what} — HOLD SPACE TO LAUNCH`
        : `${what} — TAKE OFF TO ${strike ? "ENGAGE" : "INTERCEPT"}`;
      this.state.banner = { text: this.dfArmText, until: Infinity };
    } else {
      this.dfArmed = false;
      this.df.clear();
    }
    this.prevPos.copy(this.state.pos);
    this.prevQuat.copy(this.state.quat);
    // snap the camera to the new jet instead of gliding in from the old scene
    this.rig.resetFollow();
    this.setPhase("flying");
    this.acc = 0;
    this.last = performance.now() / 1000;
    this.input.clearEdges();
    this.audio.start();
    this.audio.resume();
    this.updateHud();
  }

  resume(): void {
    if (this.phase === "paused") {
      this.setPhase("flying");
      this.last = performance.now() / 1000;
      this.input.clearEdges();
    }
    this.audio.resume();
  }

  pause(): void {
    if (this.phase === "flying") this.setPhase("paused");
  }

  restart(): void {
    // retry the same mission from the same carrier
    this.beginMission(this.mission, this.spawnCarrier);
  }

  /**
   * A dead (or trapped) pilot in a live room goes back to the room's lobby
   * instead of into a fresh solo flight: the session stays linked, the lobby
   * opens on the multiplayer screen, and the next room launch — the host's, or
   * their own if they host — lifts them off with everyone else. Solo death
   * keeps the plain restart.
   */
  returnToRoom(): void {
    if (this.netState.status !== "online" && this.netState.status !== "connecting") {
      this.restart();
      return;
    }
    this.pendingRoom = true;
    this.quitToMenu();
  }

  /** The menu reads this to open on the multiplayer screen after a death. */
  get pendingRoomReentry(): boolean {
    return this.pendingRoom;
  }

  /** Clear the one-shot reentry flag once the lobby has opened on it. */
  consumeRoomReentry(): void {
    this.pendingRoom = false;
  }

  quitToMenu(): void {
    this.dfArmed = false;
    this.endPod();
    this.crashSeq = null;
    this.breakupHide = false;
    this.df.clear();
    this.state = spawnAircraft(this.mission, this.spawnCarrier, this.settings.aircraft);
    this.rig.resetFollow();
    this.updateJetPose(1);
    this.audio.update(0.05, 0, 0, false, true);
    this.setPhase("menu");
  }

  cycleCamera(): void {
    this.rig.cycle();
  }

  setCameraMode(m: CameraMode): void {
    this.rig.mode = m;
  }

  private setPhase(p: Phase): void {
    this.phase = p;
    for (const fn of this.phaseListeners) fn(p);
  }

  subscribePhase(fn: (p: Phase) => void): () => void {
    this.phaseListeners.add(fn);
    fn(this.phase);
    return () => {
      this.phaseListeners.delete(fn);
    };
  }

  get snapshot(): HudSnapshot {
    return this.hud;
  }

  private projV = new THREE.Vector3();
  private projDir = new THREE.Vector3();
  private projQ = new THREE.Quaternion();

  /**
   * Project a world point into CSS pixels of the view, for the HUD's target
   * designators. Returns false when the point sits behind the camera.
   */
  projectPoint(x: number, y: number, z: number, out: { x: number; y: number }): boolean {
    const cam = this.renderer.camera;
    this.projV.set(x, y, z).sub(cam.position);
    this.projDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
    if (this.projV.dot(this.projDir) <= 0) return false;
    this.projV.set(x, y, z).project(cam);
    const el = this.renderer.renderer.domElement;
    out.x = (this.projV.x * 0.5 + 0.5) * el.clientWidth;
    out.y = (0.5 - this.projV.y * 0.5) * el.clientHeight;
    return true;
  }

  /**
   * Project a world point into CSS pixels of the view, always yielding a usable
   * position. Unlike projectPoint(), a point that is off screen — or behind the
   * camera, which is where a bomb sits in the seconds after it leaves the rack,
   * because the pod's sensor head is forward of the stores — is parked on the
   * frame edge instead. `front`/`inside` say whether it is really in view.
   */
  projectOffscreen(
    x: number,
    y: number,
    z: number,
    out: { x: number; y: number },
    insetPx = 0,
  ): { front: boolean; inside: boolean } {
    const cam = this.renderer.camera;
    const el = this.renderer.renderer.domElement;
    const w = Math.max(el.clientWidth, 1);
    const h = Math.max(el.clientHeight, 1);
    this.projQ.copy(cam.quaternion).invert();
    // camera space: +X right, +Y up, -Z forward
    this.projV.set(x, y, z).sub(cam.position).applyQuaternion(this.projQ);
    if (this.projV.z < 0) {
      this.projV.set(x, y, z).project(cam);
      const px = (this.projV.x * 0.5 + 0.5) * w;
      const py = (0.5 - this.projV.y * 0.5) * h;
      const inside = px >= 0 && px <= w && py >= 0 && py <= h;
      out.x = THREE.MathUtils.clamp(px, insetPx, w - insetPx);
      out.y = THREE.MathUtils.clamp(py, insetPx, h - insetPx);
      return { front: true, inside };
    }
    // Behind the sensor: keep the bearing, park the marker on the frame edge.
    const d = Math.hypot(this.projV.x, this.projV.y);
    const ux = d > 1e-4 ? this.projV.x / d : 0;
    const uy = d > 1e-4 ? -this.projV.y / d : -1;
    const hx = Math.max(w / 2 - insetPx, 0);
    const hy = Math.max(h / 2 - insetPx, 0);
    const s = Math.min(hx / Math.max(Math.abs(ux), 1e-4), hy / Math.max(Math.abs(uy), 1e-4));
    out.x = w / 2 + ux * s;
    out.y = h / 2 + uy * s;
    return { front: false, inside: false };
  }

  /**
   * The predicted path of the player's next gun burst, in world space: the gun
   * crosshair is drawn where the rounds will actually be, so it can turn red
   * when the burst would land on a bandit or the opposing carrier.
   */
  gunCue(): GunCue {
    return this.df.gunSolution(this.state);
  }

  /**
   * The sampled bullet path behind the gun cue (muzzle → solution), for the
   * HUD's gun ladder. Reused buffer: read it, do not keep it.
   */
  gunPath(): { points: THREE.Vector3[]; n: number } {
    return this.df.gunPath();
  }

  subscribeHud(fn: (h: HudSnapshot) => void): () => void {
    this.hudListeners.add(fn);
    fn(this.hud);
    return () => {
      this.hudListeners.delete(fn);
    };
  }

  // -------------------------------------------------------------------------
  // Multiplayer
  // -------------------------------------------------------------------------

  subscribeNet(fn: (s: NetState) => void): () => void {
    this.netListeners.add(fn);
    fn(this.netState);
    return () => {
      this.netListeners.delete(fn);
    };
  }

  /**
   * Settings the room asks for (today: the host's mission profile). The UI owns
   * settings, so the sim asks for a change and the UI applies and stores it —
   * that way a wingman's mission picker shows the room's fight, not their own.
   */
  subscribeSettings(fn: (s: Settings) => void): () => void {
    this.settingsListeners.add(fn);
    return () => {
      this.settingsListeners.delete(fn);
    };
  }

  /** The host picked a mission profile: follow it, and remember it. */
  private applyRoomMode(mode: MissionMode): void {
    if (this.settings.missionMode === mode) return;
    const next: Settings = { ...this.settings, missionMode: mode };
    this.applySettings(next);
    for (const fn of this.settingsListeners) fn(next);
  }

  get netSnapshot(): NetState {
    return this.netState;
  }

  /**
   * Open a room. Any wingmen already on screen are dropped first, so a stale
   * mesh from the previous session cannot bleed into this one.
   */
  openRoom(callsign: string, room: string): void {
    this.remoteFleet.clear();
    this.chatLog = [];
    // Open/join set the room code, and the room code is the world: the terrain
    // follows automatically through syncWorldToRoom().
    this.battle = { match: 0, pilots: [] };
    this.net.open(room, callsign, this.settings.aircraft);
    this.net.setMode(this.settings.missionMode);
  }

  joinRoom(callsign: string, room: string): void {
    this.remoteFleet.clear();
    this.chatLog = [];
    this.battle = { match: 0, pilots: [] };
    this.net.join(room, callsign, this.settings.aircraft);
  }

  leaveRoom(): void {
    this.remoteFleet.clear();
    this.chatLog = [];
    this.net.leave();
    this.battle = { match: 0, pilots: [] };
    this.df.setOpponents([]);
  }

  /** Rename ourselves mid-session; the roster updates in place. */
  setCallsign(callsign: string): void {
    this.net.setName(callsign);
  }

  // --- room radio ----------------------------------------------------------

  /** The chat log, newest last. Stable reference between messages. */
  get chat(): readonly ChatMsg[] {
    return this.chatLog;
  }

  subscribeChat(fn: () => void): () => void {
    this.chatListeners.add(fn);
    return () => {
      this.chatListeners.delete(fn);
    };
  }

  /**
   * Transmit on the room radio. The line is sanitised once here, appended to
   * our own log immediately (the wire would loop it back otherwise never —
   * the mesh is full, so senders are not their own audience) and fanned out.
   */
  sendChat(text: string): void {
    const msg = sanitizeChat(text);
    if (!msg || !this.net.online) return;
    this.net.sendChat(msg);
    this.addChat({ from: this.net.callsign, text: msg });
  }

  private addChat(msg: ChatMsg): void {
    this.chatLog.push(msg);
    if (this.chatLog.length > 60) this.chatLog.splice(0, this.chatLog.length - 60);
    for (const fn of this.chatListeners) fn();
  }

  /**
   * Swap the world. Generation is local, deterministic and synchronous — the
   * seed stands for the whole island chain — so nothing about the terrain ever
   * needs to be sent anywhere.
   */
  private applySeed(seed: number): boolean {
    if (seed === this.worldSeed) return false;
    this.worldSeed = seed;
    regenerateTerrain(seed);
    this.renderer.applyWorld(this.paint());
    this.afterWorldChange();
    return true;
  }

  /**
   * The room code is the world: every pilot who types the same code builds the
   * same islands on their own machine, so terrain is never shared and no seed is
   * ever handed out. Solo flight (no room) flies the default world.
   */
  private syncWorldToRoom(s: NetState): void {
    this.applySeed(s.status === "idle" ? DEFAULT_SEED : worldSeedForRoom(s.room));
  }

  private paint(): TerrainPaint {
    return { height: terrainHeight };
  }
  private afterWorldChange(): void {
    this.state = spawnAircraft(this.mission, this.spawnCarrier, this.settings.aircraft);
    this.prevPos.copy(this.state.pos);
    this.prevQuat.copy(this.state.quat);
    this.updateJetPose(1);
    this.updateHud();
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.net.dispose();
    this.remoteFleet.dispose();
    this.remoteWeapons.dispose();
    this.df.dispose();
    this.explosions.dispose();
    window.removeEventListener("resize", this.onResize);
    this.input.detach();
    this.audio.dispose();
    this.renderer.dispose();
  }

  // -------------------------------------------------------------------------

  private loop = (nowMs: number): void => {
    this.raf = requestAnimationFrame(this.loop);
    const now = nowMs / 1000;
    const frameDt = Math.min(0.05, Math.max(0.0001, now - this.last));
    // Advance the clock every frame (including the menu), otherwise the
    // clamp below pins dt at 0.05 forever and the menu's orbit camera and
    // fast daylight cycle run ~3x fast at 60 fps.
    this.last = now;

    if (this.phase === "flying") {
      if (!this.crashSeq) this.handleEdges(); // a dead stick answers nothing
      if (this.phase === "flying") this.stepSim(frameDt);
    } else if (this.phase === "paused") {
      if (this.input.take("pause")) this.resume();
    } else if (this.phase === "result") {
      this.input.take("pause"); // swallow esc while result shows
      this.updateJetPose(1);
      this.updateAudio();
    }

    // Ordnance effects run on frame time, not sim steps, so a fireball keeps
    // evolving while the wreck replay plays out — but freezes on pause.
    if (this.phase === "flying" || this.phase === "result") this.explosions.step(frameDt);

    this.advanceDaylight(frameDt);
    // Multiplayer: interpolate the wingmen and hand our own pose to the net
    // layer, which sends it at its own fixed rate rather than per frame.
    this.remoteFleet.setCombatPilots(this.battleActive ? this.battle.pilots.filter(p => p.ready && p.hp > 0).map(p => p.id) : null);
    this.remoteFleet.update(nowMs);
    this.net.publish(this.buildPose());
    this.syncFight();
    if (this.battleActive) {
      const contacts = this.remoteFleet.combatTargets().filter(p => this.battle.pilots.some(row => row.id === p.id && row.hp > 0 && !row.shield));
      const self = this.battle.pilots.find(p => p.id === this.netState.self);
      if (self && self.hp > 0 && !self.shield) contacts.push({ id: this.netState.self, pos: this.state.pos, vel: this.state.vel });
      this.remoteWeapons.step(frameDt, contacts, this.netState.self);
    } else this.remoteWeapons.clear();
    this.updateCamera(frameDt);
    this.updateSun();
    this.renderer.render();
  };

  /**
   * Keep this sim and the room in step about the enemies. One pilot (the room
   * host) runs the hostile carrier and its bandits and streams them, so every
   * pilot in the room shoots at the same aeroplanes; a wingman mirrors what it
   * is told and reports the damage it did. Called once per frame.
   */
  private syncFight(): void {
    const online = this.netState.status === "online";
    const versus = online && this.settings.missionMode === "versus";
    const mirror = online && !this.netState.host && !versus;
    this.df.setMirror(mirror, this.state);
    if (!online) { this.df.setOpponents([]); return; }
    if (versus) { this.net.publishEnemies(null); this.syncBattle(); return; }
    if (mirror) {
      const hits = this.df.takeHits();
      for (const h of hits) this.net.hitBandit(h.id, h.dmg);
      const cv = this.df.takeCarrierHit();
      if (cv > 0) this.net.hitCarrier(cv);
    } else {
      this.net.publishEnemies(this.df.enemySnapshot());
    }
  }

  private get battleActive(): boolean {
    return this.netState.status === "online" && this.settings.missionMode === "versus";
  }

  private spawnBattleAircraft(): void {
    this.endPod();
    const ids = [this.netState.self, ...this.netState.pilots.map(p => p.id)].sort();
    const slot = Math.max(0, ids.indexOf(this.netState.self));
    const angle = slot * Math.PI * 2 / Math.max(2, ids.length) + (Math.max(0, this.battleLife) % 4) * .3;
    const center = carriers()[this.spawnCarrier % carriers().length];
    this.state = spawnAircraft("carrier", this.spawnCarrier, this.settings.aircraft);
    const st = this.state;
    st.pos.set(center.x + Math.cos(angle) * 3000, 1600 + slot * 60, center.z + Math.sin(angle) * 3000);
    const direction = new THREE.Vector3(center.x - st.pos.x, 0, center.z - st.pos.z).normalize();
    const heading = Math.atan2(direction.x, -direction.z);
    st.quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -heading);
    st.vel.copy(direction).multiplyScalar(210); st.speed = 210;
    st.gearDown = false; st.gearT = 0; st.flapsDown = false; st.flapT = 0;
    st.onGround = false; st.airborne = true; st.catPhase = "idle"; st.catCooldown = 5;
    st.throttle = .72; st.rpm = .72; st.banner = { text: "HEAD-TO-HEAD — FIVE-SECOND SPAWN SHIELD", until: 5 };
    this.df.beginVersus(st);
    this.remoteWeapons.clear();
    this.prevPos.copy(st.pos); this.prevQuat.copy(st.quat);
    this.rig.resetFollow(); this.breakupHide = false;
  }

  private receiveBattleAction(sender: string, action: BattleAction): void {
    if (!this.battleActive || !this.netState.host) return;
    this.battleReferee.reconcile([{ id: this.netState.self, name: this.net.callsign }, ...this.netState.pilots]);
    const contacts = this.remoteFleet.combatTargets();
    const from = sender === this.netState.self ? this.state.pos : contacts.find(p => p.id === sender)?.pos;
    const to = action.victim === this.netState.self ? this.state.pos : contacts.find(p => p.id === action.victim)?.pos;
    const range = from && to ? from.distanceTo(to) : Infinity;
    const aircraft = sender === this.netState.self ? this.settings.aircraft : this.netState.pilots.find(p => p.id === sender)?.aircraft;
    if (this.battleReferee.action(sender, action, performance.now() / 1000, range, specFor(aircraft ?? "tomcat").gunDamage)) {
      const snapshot = this.battleReferee.snapshot(performance.now() / 1000);
      this.applyBattle(snapshot);
      this.net.publishBattle(snapshot);
    }
  }

  private applyBattle(snapshot: BattleSnapshot): void {
    if (!this.battleActive || !Number.isFinite(snapshot.match)) return;
    if (snapshot.pilots.some(p => !p || typeof p.id !== "string" || typeof p.name !== "string" || !Number.isFinite(p.hp) || p.hp < 0 || p.hp > 100 || !Number.isInteger(p.life) || p.life < 0 || !Number.isFinite(p.kills) || !Number.isFinite(p.deaths) || !Number.isFinite(p.respawnIn) || typeof p.ready !== "boolean" || typeof p.shield !== "boolean")) return;
    if (snapshot.match !== this.battle.match) { this.battleLife = -1; this.battleDeadLife = -1; }
    this.battle = snapshot;
    const self = snapshot.pilots.find(p => p.id === this.netState.self);
    if (this.phase === "menu" || !self?.ready) return;
    if (self.hp > 0 && self.life !== this.battleLife) {
      this.battleLife = self.life;
      this.spawnBattleAircraft();
    }
    this.df.setBattleHull(self.hp);
    if (self.hp === 0 && !this.state.result) {
      this.explosions.spawn(this.state.pos.clone(), "air", 1.5);
      this.state.result = { kind: "crash", title: "SHOT DOWN", detail: "Respawning in three seconds." };
    }
    this.updateHud();
  }

  private syncBattle(): void {
    const now = performance.now() / 1000;
    if (this.netState.host && now - this.battleTickAt >= .1) {
      if (this.battleReferee.match !== this.battle.match) this.battleReferee.restore(this.battle, now);
      this.battleReferee.reconcile([{ id: this.netState.self, name: this.net.callsign }, ...this.netState.pilots]);
      const snapshot = this.battleReferee.snapshot(now);
      this.applyBattle(snapshot); this.net.publishBattle(snapshot); this.battleTickAt = now;
    }
    const self = this.battle.pilots.find(p => p.id === this.netState.self);
    if (this.phase !== "menu" && this.battle.match && !self?.ready && now - this.battleReadyAt > .5) {
      this.net.sendBattleAction({ kind: "ready", match: this.battle.match, seq: ++this.battleSeq, life: 0 });
      this.battleReadyAt = now;
    }
    this.df.setOpponents(!self?.ready || self.hp <= 0 || self.shield ? [] : this.remoteFleet.combatTargets().flatMap(p => {
      const target = this.battle.pilots.find(row => row.id === p.id);
      return target?.ready && target.hp > 0 && !target.shield ? [{ ...p, life: target.life }] : [];
    }));
    for (const shot of this.df.takeWeaponLaunches()) if (self?.ready && self.hp > 0 && !self.shield) this.net.sendBattleShot({ ...shot, match: this.battle.match, life: self.life, seq: ++this.battleSeq });
    for (const hit of this.df.takePlayerHits()) this.net.sendBattleAction({ kind: "hit", match: this.battle.match, seq: ++this.battleSeq, life: self?.life ?? 0, victim: hit.id, victimLife: hit.life, weapon: hit.weapon });
    if (self?.ready && this.state.result && this.battleDeadLife !== self.life) {
      this.battleDeadLife = self.life;
      this.net.sendBattleAction({ kind: "death", match: this.battle.match, seq: ++this.battleSeq, life: self.life });
    }
    // A disconnected host never leaves an invulnerable, frozen battle running.
    if (!this.netState.host && !this.netState.pilots.some(p => p.host && p.linked)) this.df.setOpponents([]);
  }

  /**
   * The local aircraft as the net layer sends it: position, orientation,
   * velocity, airspeed, wing sweep and the handful of flags the far end needs
   * to put the gear and flaps in the right place.
   */
  private buildPose(): RemotePose {
    const st = this.state;
    const p = this.poseOut;
    p.x = st.pos.x; p.y = st.pos.y; p.z = st.pos.z;
    p.qx = st.quat.x; p.qy = st.quat.y; p.qz = st.quat.z; p.qw = st.quat.w;
    p.vx = st.vel.x; p.vy = st.vel.y; p.vz = st.vel.z;
    p.speed = st.speed;
    p.sweepT = st.sweepT;
    let flags = 0;
    if (st.onGround) flags |= FLAG_ON_GROUND;
    if (st.gearDown) flags |= FLAG_GEAR;
    if (st.flapsDown) flags |= FLAG_FLAPS;
    if (st.speedbrake) flags |= FLAG_SPEEDBRAKE;
    if (st.stalled) flags |= FLAG_STALLED;
    if (st.abLevel > 0.05) flags |= FLAG_AB;
    if ((this.phase === "flying" || this.phase === "paused") && !st.result) flags |= FLAG_ACTIVE;
    p.flags = flags;
    return p;
  }

  /**
   * Start the crash replay: the jet is beyond saving, so the camera pulls out
   * to a third-person orbit, the airframe BLOWS APART into tumbling pieces,
   * and the fireball is left to fall. The big ground detonation still waits
   * for whatever the wreck hits.
   */
  private beginCrashReplay(): void {
    this.crashSeq = { falling: true, t: 0, smokeT: 0 };
    this.state.crashFall = true;
    // the jet visibly comes apart: pieces and fire instead of a rigid airframe
    this.explosions.spawnBreakup(this.state.pos);
    this.explosions.spawn(this.state.pos, "air", 0.7);
    // the intact jet is gone — only the debris cloud falls from here
    this.breakupHide = true;
    this.renderer.jetGroup.visible = false;
  }

  /**
   * Advance the crash replay: tumble at double time (a dead jet falls fast and
   * nobody wants to wait through a glide), trail smoke, then detonate on the
   * surface and hold on the fireball before the results take over.
   */
  private stepCrashReplay(frameDt: number): void {
    const st = this.state;
    const seq = this.crashSeq!;
    if (seq.falling) {
      this.acc = Math.min(this.acc + frameDt * 2, 0.5);
      let steps = 0;
      while (this.acc >= FIXED_DT && steps < 16) {
        this.prevPos.copy(st.pos);
        this.prevQuat.copy(st.quat);
        stepAircraft(st, IDLE_INPUT, FIXED_DT);
        this.acc -= FIXED_DT;
        steps++;
        if (st.pos.y <= this.groundRef(st) + 1.2) break;
      }
      // fire and smoke from the dying airframe, so the fall reads from afar
      seq.smokeT -= frameDt;
      if (seq.smokeT <= 0) {
        this.explosions.trail(st.pos, 2.4, 1.4);
        seq.smokeT = 0.06;
      }
      const g = groundAt(st.pos.x, st.pos.z);
      if (st.pos.y <= g.y + 1.2 || st.onGround) {
        seq.falling = false;
        seq.t = 0;
        st.crashFall = false;
        st.vel.set(0, 0, 0);
        st.omega.set(0, 0, 0);
        const kind: "water" | "ground" = g.kind === "water" ? "water" : "ground";
        // whatever it hit, it goes up big: water throws a column, the rest a
        // fireball, and the wreck stays where it stopped under the smoke.
        this.explosions.spawn(st.pos, kind, kind === "water" ? 2.1 : 1.9);
        this.explosions.trail(TMPV.set(st.pos.x, st.pos.y + 9, st.pos.z), 4.2, 7);
        this.explosions.trail(TMPV.set(st.pos.x, st.pos.y + 22, st.pos.z), 6, 6);
      }
    } else {
      seq.t += frameDt;
      // Dying in a live room drops the pilot straight back into the fight on
      // the deck nearest their wingman; only a pilot with nobody to join falls
      // back to the room's lobby.
      if (seq.t > 1.9 && !this.respawnNearWingman()) this.setPhase("result");
    }
  }

  /**
   * Put a dead pilot back in the fight, immediately, on the carrier nearest the
   * closest live wingman — "get back in formation" without a trip to the lobby
   * while the room flies on. Returns false when there is nobody to join, which
   * is when the room's lobby is the right answer instead.
   */
  private respawnNearWingman(): boolean {
    if (this.netState.status !== "online") return false;
    const contacts = this.remoteFleet.contacts(this.state.pos.x, this.state.pos.y, this.state.pos.z);
    if (contacts.length === 0) return false;
    const wing = contacts[0]; // nearest live wingman first
    const def = nearestCarrier(wing.x, wing.z);
    const idx = carriers().indexOf(def);
    if (idx < 0) return false;
    // Take off from there for the rest of the session too, so a restart from
    // the pause menu does not throw the pilot back across the map.
    this.spawnCarrier = idx;
    this.beginMission("carrier", idx);
    this.pushBanner(`RESPAWN — ${wing.name.toUpperCase()}'S CARRIER · ${def.name.toUpperCase()}`);
    return true;
  }

  private handleEdges(): void {
    if (this.input.take("pause")) {
      this.pause();
      return;
    }
    if (this.input.take("camera")) {
      if (this.pod) this.endPod();
      else this.rig.cycle();
    }
    // The bomb key opens the target pod; in the pod a click on the world
    // designates the spot and releases a laser-guided weapon at it.
    if (this.input.take("bomb")) {
      if (this.pod) this.endPod();
      else this.beginPod();
    }
    if (this.pod) this.handlePodClick();
    // A missile launch is an edge, like gear or flaps: one press, one shot.
    if (this.input.take("missile")) this.df.requestMissile(this.state);
    if (this.input.take("gear")) {
      if (this.state.onGround && this.state.speed < 1) {
        this.pushBanner("GEAR LOCKED — cannot retract while parked");
      } else {
        this.state.gearDown = !this.state.gearDown;
      }
    }
    if (this.input.take("flaps")) this.state.flapsDown = !this.state.flapsDown;
    if (this.input.take("speedbrake")) this.state.speedbrake = !this.state.speedbrake;
    // The burner switch gets a banner like every other toggle: pressing it at
    // low throttle used to do nothing visible at all, which read as a dead key.
    if (this.input.take("ab")) {
      this.state.abOn = !this.state.abOn;
      if (this.state.spec.abThrust <= 0) {
        this.pushBanner("NO AFTERBURNER ON THIS AIRFRAME");
      } else if (!this.state.abOn) {
        this.pushBanner("AFTERBURNER OFF");
      } else if (this.state.throttle > 0.9) {
        this.pushBanner("AFTERBURNER");
      } else {
        this.pushBanner("AFTERBURNER ARMED — THROTTLE TO MAX");
      }
    }
    this.input.take("cat"); // sim uses catHold from sampled input
  }

  /** Open the target pod camera (bombs are designated from here). */
  private beginPod(): void {
    if (this.state.onGround) {
      this.pushBanner("TARGET POD — AIRBORNE ONLY");
      return;
    }
    // a click queued before the pod opened (a menu button, say) must not
    // immediately designate a target
    this.input.clearClicks();
    // Aiming the pod is a drag, so the drag's release is the shot: the player
    // slews onto the target and lets go, rather than having to aim and then
    // hold still for a second, separate click.
    this.input.clicksAfterDrag = true;
    this.rig.enterPod(this.state.quat);
    this.pod = true;
    const el = this.renderer.renderer.domElement;
    el.style.cursor = "crosshair";
    this.pushBanner(
      this.df.designated
        ? "TARGET POD — SLEW ONTO A TARGET, RELEASE TO RE-ENGAGE · [R] TO LEAVE"
        : "TARGET POD — SLEW THE SENSOR ONTO A TARGET, RELEASE TO LAUNCH",
    );
  }

  private endPod(): void {
    if (!this.pod) return;
    this.pod = false;
    this.input.clicksAfterDrag = false;
    this.rig.exitPod();
    this.renderer.renderer.domElement.style.cursor = "";
    this.input.clearClicks();
  }

  /**
   * A click in the pod view: pick the surface under the cursor, paint the laser
   * there, and send one weapon after it. Every later release goes to the same
   * spot until the player clicks again.
   */
  private handlePodClick(): void {
    const click = this.input.takeClick();
    if (!click) return;
    const el = this.renderer.renderer.domElement;
    const rect = el.getBoundingClientRect();
    const ndcX = ((click.x - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const ndcY = -(((click.y - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
    screenRay(this.renderer.camera, ndcX, ndcY, this.pickOrigin, this.pickDir);
    const deck = this.df.enemyDeck();
    const hit = pickDesignation(this.pickOrigin, this.pickDir, deck ? [deck] : []);
    if (!hit) {
      this.pushBanner("NO TARGET UNDER THE CURSOR");
      return;
    }
    this.df.setDesignation(hit.pos);
    if (this.state.result) return;
    if (this.df.hud(this.state).bombs <= 0) {
      this.pushBanner("TARGET DESIGNATED — BOMBS EXPENDED");
      return;
    }
    if (!this.df.requestBombRelease(this.state)) return;
    // The weapon sits behind the sensor head the moment it leaves the rack, so
    // the banner says it is gone and the pod overlay tracks it down from there.
    this.pushBanner(`LGB AWAY — TARGET ${(hit.range / 1000).toFixed(1)} KM (${hit.surface.toUpperCase()})`);
  }

  private stepSim(frameDt: number): void {
    if (this.crashSeq) {
      // The replay owns the jet now: the fight keeps moving around it, but
      // nothing the pilot touches matters any more.
      this.acc = 0;
      this.inputPitch = 0;
      this.inputRoll = 0;
      this.inputYaw = 0;
      this.df.step(FIXED_DT, this.state, false, false);
      this.stepCrashReplay(frameDt);
      this.updateJetPose(1);
      this.updateAudio();
      this.updateHud();
      return;
    }
    this.acc = Math.min(this.acc + frameDt, 0.25);
    let steps = 0;
    let wasAirborne = this.state.airborne;
    while (this.acc >= FIXED_DT && steps < 8) {
      const inp = this.input.sample(FIXED_DT);
      this.inputPitch = inp.pitch;
      this.inputRoll = inp.roll;
      this.inputYaw = inp.yaw;
      this.prevPos.copy(this.state.pos);
      this.prevQuat.copy(this.state.quat);
      if (!this.battleActive || !this.state.result) stepAircraft(this.state, inp, FIXED_DT);
      if (this.dfArmed) {
        if (!this.state.onGround) {
          // wheels off the deck/runway: the fight begins
          this.dfArmed = false;
          if (this.settings.missionMode === "strike") this.df.beginStrike(this.state);
          else this.df.begin(this.state);
        } else if (!this.state.banner || this.state.time >= this.state.banner.until) {
          // keep the launch briefing up through taxi/cat tension chatter
          this.state.banner = { text: this.dfArmText, until: Infinity };
        }
      }
      // Releases come from target-pod clicks (queued in the Dogfight), not
      // from holding the key: the pod is the aiming station.
      this.df.step(FIXED_DT, this.state, inp.fire === true, false);
      // A wheels-down on a friendly deck or runway is a recovery, not the end:
      // the racks and the hull come back full so the pilot can go again.
      if (wasAirborne && isRecoverySurface(this.state)) this.refillOnRecovery();
      wasAirborne = this.state.airborne;
      this.acc -= FIXED_DT;
      steps++;
    }
    if (this.state.result) this.endPod();
    // A fatal crash starts the replay instead of cutting straight to the
    // screen; a trap or a bolter still ends the flight the normal way.
    if (this.state.result?.kind === "crash" && !this.crashSeq && !this.battleActive) this.beginCrashReplay();
    if (this.state.result && this.phase === "flying" && !this.crashSeq && !this.battleActive) {
      this.setPhase("result");
    }
    const alpha = steps > 0 ? THREE.MathUtils.clamp(this.acc / FIXED_DT, 0, 1) : 1;
    this.updateJetPose(alpha);
    this.updateAudio();
    this.updateHud();
  }

  /** Refuel and re-arm on a landing, and say so. */
  private refillOnRecovery(): void {
    this.df.refill();
    const h = this.df.hud(this.state);
    const msl = h.missilesMax > 0 ? ` · ${h.missiles}/${h.missilesMax} MSL` : "";
    this.state.banner = {
      text: `REARMED & REPAIRED — ${h.bombs}/${h.bombsMax} BOMBS${msl} · HULL ${h.hull}%`,
      until: this.state.time + 4,
    };
  }

  private updateJetPose(alpha: number): void {
    const st = this.state;
    const g = this.renderer.jetGroup;
    // position: extrapolate along velocity for sub-step smoothness
    g.position.lerpVectors(this.prevPos, st.pos, alpha);
    g.quaternion.copy(this.poseQ.copy(this.prevQuat).slerp(st.quat, alpha));
    // control surfaces follow current inputs
    g.userData.elevator = -this.inputPitch * 0.6;
    g.userData.aileron = this.inputRoll * 0.5;
    g.userData.rudder = this.inputYaw * 0.5;
    animateJet(this.renderer.jet, st, alpha, 1 / 60);
  }

  private updateCamera(dt: number): void {
    const st = this.state;
    const alpha = THREE.MathUtils.clamp(this.acc / FIXED_DT, 0, 1);
    const p = this.camP.lerpVectors(this.prevPos, st.pos, alpha);
    const q = this.camQ.copy(this.prevQuat).slerp(st.quat, alpha);
    const mouse = this.input.takeMouse();
    this.rig.mouse(mouse.dx, mouse.dy);
    // menu attract + crash replay get the slow orbit; in flight the third
    // camera is locked behind the jet
    const cinematic =
      this.phase === "menu" ||
      this.crashSeq !== null ||
      (this.phase === "result" && st.result?.kind === "crash");
    this.rig.update(this.renderer.camera, p, q, st.speed, dt, cinematic);
    // hide the airframe in the cockpit (you are inside it) and in the target
    // pod (the sensor sees past it)
    const inside = this.rig.mode === "cockpit" || this.rig.mode === "pod";
    this.renderer.jetGroup.visible =
      !this.breakupHide && !(this.battleActive && this.state.result) && (!inside || this.phase === "menu" || this.crashSeq !== null);
    // menu attract mode: slow orbit
    if (this.phase === "menu") {
      this.rig.mode = "action";
    }
    // the crash replay is always third person: the pilot watches their own jet
    if (this.crashSeq) this.rig.mode = "action";
  }

  private updateAudio(): void {
    const st = this.state;
    this.audio.update(st.rpm, st.abLevel, st.speed, st.stalled && !st.onGround, this.phase !== "flying");
  }

  /**
   * Position the sun from the clock and hand the renderer everything it needs
   * to light, fog and tint the world. The islands are fictional, so the solar
   * path is tied to the home station's latitude and timezone to keep the
   * daylight cycle reading correctly.
   */
  private updateSun(): void {
    const p = this.state.pos;
    const sun = sunPosition(this.dayHours, HOME_SITE.lat, HOME_SITE.lon, {
      dayOfYear: dayOfYearNow(),
      tzOffsetHours: HOME_SITE.tzOffsetHours,
    });
    this.dayPhase = dayPhase(sun.elevationDeg);
    const v = sunVector(sun);
    this.sunVec.set(v.x, v.y, v.z);
    this.renderer.applyDaylight(sun, this.sunVec, p);
  }

  private pushBanner(text: string): void {
    this.state.banner = { text, until: this.state.time + 3 };
  }

  private updateHud(): void {
    const st = this.state;
    const fwd = this.hudFwd.set(0, 0, -1).applyQuaternion(st.quat);
    const right = this.hudRight.set(1, 0, 0).applyQuaternion(st.quat);
    const pitchDeg = Math.asin(THREE.MathUtils.clamp(fwd.y, -1, 1)) * (180 / Math.PI);
    const bankFromHorizon = Math.asin(THREE.MathUtils.clamp(right.y, -1, 1)) * (180 / Math.PI);
    const radarAltM = st.pos.y - this.groundRef(st);
    const af = airfield();
    const fleet = carriers();
    const nearest = nearestCarrier(st.pos.x, st.pos.z);
    const dxC = nearest.x - st.pos.x;
    const dzC = nearest.z - st.pos.z;
    const dxF = af.centerX - st.pos.x;
    const dzF = af.centerZ - st.pos.z;
    const brgC = (Math.atan2(dxC, -dzC) * 180) / Math.PI;
    const brgF = (Math.atan2(dxF, -dzF) * 180) / Math.PI;
    this.hud = {
      speedKt: st.speed * 1.94384,
      altFt: st.pos.y * 3.28084,
      mach: st.mach,
      headingDeg: st.headingDeg,
      aoaDeg: st.alpha * 57.2958,
      vsFpm: st.vspeed * 196.85,
      gLoad: st.gLoad,
      throttlePct: Math.round(st.throttle * 100),
      rpmPct: Math.round(st.rpm * 100),
      ab: st.abLevel,
      abOn: st.abOn,
      gear: st.gearDown && st.gearT > 0.95,
      flaps: st.flapsDown && st.flapT > 0.95,
      speedbrake: st.speedbrake && st.sbT > 0.95,
      trim: st.trim,
      sweepDeg: Math.round(st.sweep),
      sweepable: st.spec.sweepMax > st.spec.sweepMin,
      stalled: st.stalled,
      onGround: st.onGround,
      catPhase: st.catPhase,
      catProgress: st.catProgress,
      pitchDeg,
      rollDeg: bankFromHorizon,
      cameraMode: this.rig.mode,
      wire: st.wire,
      glide: (() => {
        const g = glideStateFor(st);
        return g
          ? {
              rangeM: g.rangeM,
              deviationM: g.deviationM,
              lineupM: g.lineupM,
              onSpeedKt: g.onSpeedKt,
              onSpeedAoaDeg: g.onSpeedAoaDeg,
            }
          : null;
      })(),
      resultTitle: st.result?.title,
      resultDetail: st.result?.detail,
      resultKind: st.result?.kind,
      banner: st.banner && st.time < st.banner.until ? st.banner.text : undefined,
      radarAltFt: radarAltM * 3.28084,
      flightTime: st.flightTime,
      distCarrierKm: Math.hypot(dxC, dzC) / 1000,
      bearingCarrierDeg: (brgC + 360) % 360,
      carrierName: nearest.name,
      distFieldKm: Math.hypot(dxF, dzF) / 1000,
      bearingFieldDeg: (brgF + 360) % 360,
      worldLabel: activeWorldDef().label,
      worldSeed: this.worldSeed,
      playerX: st.pos.x,
      playerZ: st.pos.z,
      playerHeadingDeg: st.headingDeg,
      carrierMarkers: fleet.map((c) => ({
        name: c.name,
        x: c.x,
        z: c.z,
        near: c.name === nearest.name,
      })),
      fieldX: af.centerX,
      fieldZ: af.centerZ,
      worldExtent: EXTENT,
      localHour: this.dayHours,
      dayPhase: this.dayPhase,
      aircraftName: st.spec.name,
      pod: this.pod,
      remotes: this.remoteFleet.contacts(st.pos.x, st.pos.y, st.pos.z),
      netStatus: this.netState.status,
      netRoom: this.netState.room,
      netHost: this.netState.host,
      netPilots: this.netState.pilots.length,
      battle: this.battleActive ? this.battle : undefined,
      battleSelf: this.netState.self,
      ...this.dfHud(),
    };
    // React re-renders at most ~20 Hz; the pitch-ladder canvas redraws
    // every frame from the latest snapshot regardless.
    const nowMs = performance.now();
    if (nowMs - this.lastHudNotify > 50) {
      this.lastHudNotify = nowMs;
      for (const fn of this.hudListeners) fn(this.hud);
    }
  }

  private groundRef(st: AircraftState): number {
    return groundAt(st.pos.x, st.pos.z).y;
  }

  /** Dogfight HUD fields (defaults when the mode is off). */
  private dfHud(): Pick<
    HudSnapshot,
    | "dfActive"
    | "dfStrike"
    | "dfHull"
    | "dfKills"
    | "dfWave"
    | "dfBandits"
    | "dfNearestKm"
    | "dfNearestBrgDeg"
    | "enemyMarkers"
    | "dfThreat"
    | "gunFiring"
    | "dfHitT"
    | "dfDamageT"
    | "dfSpots"
    | "dfBombs"
    | "dfBombsMax"
    | "dfBombsAway"
    | "dfMissiles"
    | "dfMissilesMax"
    | "dfCarrier"
    | "dfBombsTracking"
    | "dfBombTracks"
    | "dfDesignated"
    | "dfReleased"
    | "dfLanded"
  > {
    const h = this.df.hud(this.state);
    const st = this.state;
    return {
      dfActive: h.active,
      dfStrike: h.strike,
      dfHull: h.hull,
      dfKills: h.kills,
      dfWave: h.wave,
      dfBandits: h.bandits,
      dfNearestKm: h.nearestKm,
      dfNearestBrgDeg: (h.nearestBrgDeg + 360) % 360,
      enemyMarkers: h.markers,
      dfThreat: h.threat || (this.battleActive && this.remoteWeapons.incoming),
      gunFiring: h.firing,
      dfHitT: h.hitT,
      dfDamageT: h.damageT,
      dfSpots: h.spots,
      dfBombs: h.bombs,
      dfBombsMax: h.bombsMax,
      dfBombsAway: h.bombsAway,
      dfMissiles: h.missiles,
      dfMissilesMax: h.missilesMax,
      dfCarrier: h.carrier,
      dfBombsTracking: h.bombsTracking,
      dfBombTracks: this.df.bombPositions().map((p) => ({
        x: p.x,
        y: p.y,
        z: p.z,
        km: Math.hypot(p.x - st.pos.x, p.y - st.pos.y, p.z - st.pos.z) / 1000,
      })),
      dfDesignated: h.designated,
      dfReleased: h.released,
      dfLanded: h.landed,
    };
  }
}
