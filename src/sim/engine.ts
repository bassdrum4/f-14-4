import { RemoteWeapons } from "../render/remoteWeapons";
import { BattleReferee, battleCarrierPair, type BattleAction, type BattleSnapshot, type BattleShot, type BattleMissiles } from "../net/versus";
import { specFor, type AircraftId } from "./aircraft";
import { atmosphere } from "./atmosphere";
import { shipGunQuaternion, shipSpawn } from "./surface";
import { launchNavalMissile } from "./combat/naval";
// Sim orchestrator: state machine, fixed-timestep sim, render loop, HUD feed.

import * as THREE from "three";
import { WorldRenderer } from "../render/renderer";
import { animateJet } from "../render/rig";
import { CameraRig, type CameraMode } from "../render/cameras";
import { AudioEngine } from "../audio/engineSound";
import { InputManager } from "../input/input";
import {
  isRecoverySurface,
  carryDeckPose,
  recoveryLaunchPoint,
  glideStateFor,
  spawnAircraft,
  stepAircraft,
  type AircraftState,
  type FlightInput,
  type LsoGrade,
  type MissionKind,
  type SubsystemDamage,
} from "../sim/flight";
import {
  DEFAULT_SEED,
  EXTENT,
  activeWorldDef,
  airfield,
  carriers,
  carrierAt,
  deckAxes,
  setFleetTime,
  setSeaState,
  fleetVelocityAt,
  headingOfQuat,
  groundAt,
  nearestCarrier,
  setWorldSeed as regenerateTerrain,
  terrainHeight,
  worldSeedForRoom,
  type CarrierDef,
} from "../sim/world";
import type { TerrainPaint } from "../render/scene";
import { CYCLE_MINUTES_PER_DAY, keyLabel, withLaunchPoint, type LaunchKind, type MissionMode, type Settings, type WeatherMode } from "../settings";
import { seaStateFor, weatherPreset, windFor, type WeatherPreset } from "./weather";
import { HOME_SITE, dayPhase, sunPosition, sunVector, type DayPhase } from "../sim/sun";
import { Dogfight, type CarrierStatus, type GunCue } from "../sim/dogfight";
import { ExplosionField } from "../render/effects";
import { advanceTutorialStep, tutorialHud, type TutorialHud } from "../tutorial";
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
  type OperationLaunch,
  type PingKind,
  type TacticalPing,
} from "../net/multiplayer";
import type { MissionStyle, OperationHud } from "./operations";

export type Phase = "menu" | "flying" | "paused" | "result";

/** Clamp a stored boat index into the fleet (a profile can outlive a world). */
function clampCarrier(idx: number): number {
  const boats = carriers().length;
  if (!Number.isFinite(idx) || boats <= 0) return 0;
  return Math.max(0, Math.min(Math.floor(idx), boats - 1));
}

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
  rotorcraft: boolean;
  surfaceVessel?: boolean;
  turretBearingDeg?: number;
  turretElevationDeg?: number;
  shipControls?: string;
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
  carrierMarkers: Array<{ name: string; x: number; z: number; near: boolean; headingDeg: number; lengthM: number }>;
  fieldX: number;
  fieldZ: number;
  /** Runway heading + length, so the map can draw the field as it lies. */
  fieldHeadingDeg: number;
  fieldLengthM: number;
  worldExtent: number;
  localHour: number;
  dayPhase: DayPhase;
  // dogfight / strike mode
  dfActive: boolean;
  operation?: OperationHud;
  /** True in strike mode: contacts are targets, not bandits. */
  dfStrike: boolean;
  dfHull: number;
  dfKills: number;
  dfWave: number;
  /** Bandits flying, or strike targets still standing. */
  dfBandits: number;
  dfNearestKm: number;
  dfNearestBrgDeg: number;
  enemyMarkers: Array<{ x: number; z: number; headingDeg: number }>;
  dfThreat: boolean;
  /** The player's trigger is down (muzzle flash + bright bullet ladder). */
  gunFiring: boolean;
  dfHitT: number;
  dfConfirmation: { text: string; kind: "hit" | "destroyed"; remaining: number } | null;
  dfDamageT: number;
  dfSpots: Array<{ x: number; y: number; z: number; lx: number; ly: number; lz: number; km: number; health?: number; label?: string }>;
  /** The airframe the player is flying, for the HUD label. */
  aircraftName: string;
  dfBombs: number;
  dfBombsMax: number;
  dfBombsAway: number;
  /** Missiles on the rails (0/0 for airframes without them). */
  dfMissiles: number;
  dfMissilesMax: number;
  /** Countermeasure cartridges on the jet (0/0 for types without them). */
  dfFlares: number;
  dfFlaresMax: number;
  /** The nearest hostile round in the air, for the RWR call-out. */
  dfIncoming: { km: number; brgDeg: number; sec: number } | null;
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
  /** The big tactical map is up. */
  bigMap: boolean;
  /** The theatre's weather and the wind it is blowing right now. */
  weather: WeatherMode;
  weatherLabel: string;
  /** True when the local session is watching the room instead of flying it. */
  spectating: boolean;
  /** What the spectator camera is on: label, kind and position in the list. */
  spectateTarget: string;
  spectateKind: string;
  spectateIndex: number;
  spectateCount: number;
  /** Inbound tactical pings from the room (spectator/AWACS tasking). */
  pings: TacticalPingHud[];
  /** Airframe subsystems: battle damage the pilot has to fly around. */
  subsystems?: SubsystemDamage;
  /** The first-flight coach card. Null outside the tutorial sortie. */
  tutorial?: TutorialHud | null;
  /** Paddles' last call on the approach, if one is being flown. */
  lsoCall?: string | null;
  /** The LSO's grade for the last pass (wire or bolter). */
  lsoGrade?: LsoGrade | null;
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

/**
 * Something a spectator camera can watch: a pilot in the room, a hostile
 * aircraft the room is streaming, a carrier, or a deck's LSO platform.
 */
export interface SpectateTarget {
  id: string;
  /** PILOT / BANDIT / CARRIER / LSO — what the camera is riding. */
  kind: string;
  label: string;
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  vel: THREE.Vector3;
  speed: number;
  /** The airframe, when the target is an aircraft (drives the HUD's legend). */
  aircraft?: AircraftId;
  /** Remote pose flags (gear, flaps, speedbrake), when known. */
  flags?: number;
  /** Friendly fleet index, for the deck and LSO views. */
  carrier?: number;
  /** True for the opposing boat, which the LSO watches from its own deck. */
  hostile?: boolean;
}

/** A room ping as the HUD draws it: where it is, and from whom. */
export interface TacticalPingHud {
  id: number;
  kind: PingKind;
  from: string;
  label: string;
  x: number;
  y: number;
  z: number;
  km: number;
  brgDeg: number;
  /** Seconds since it was placed, so the HUD can fade it out. */
  age: number;
}

/** A wingman as the HUD sees it. */
export interface RemoteContact {
  id: string;
  name: string;
  x: number;
  z: number;
  km: number;
  brgDeg: number;
  /** Which way they are pointed, for the tactical map's chevrons. */
  headingDeg: number;
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
  /** Which way the boat is steaming, for the tactical map. */
  headingDeg: number;
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

/**
 * Dress an airframe for a weather preset: the steady wind, its gust cycle and
 * the turbulence the pilot will feel. Exported so the weather's effect on the
 * flight model can be exercised headlessly, with no renderer and no room.
 */
export function applyWeatherPresetTo(st: AircraftState, preset: WeatherPreset, seed: number, theatreTime = st.time): void {
  const w = windFor(preset, seed, theatreTime);
  st.windX = w.x;
  st.windZ = w.z;
  st.turbulence = preset.turbulence;
}

/**
 * Where the Landing Signal Officer stands: on the port deck edge, abaft the
 * ramp, looking up the approach. It is the station the spectator LSO view and
 * the camera's "on the ball" framing both use.
 */
function lsoStation(c: CarrierDef): THREE.Vector3 {
  const { fwd, right } = deckAxes(c.headingDeg);
  const along = -c.deckLength / 2 + 34;
  const across = -c.deckWidth / 2 - 12;
  return new THREE.Vector3(
    c.x + fwd[0] * along + right[0] * across,
    c.deckY + (c.heave ?? 0) + 11,
    c.z + fwd[1] * along + right[1] * across,
  );
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
    trim: 0.5, sweepDeg: 20, sweepable: false, rotorcraft: false, stalled: false, onGround: true, catPhase: "ready",
    catProgress: 0, pitchDeg: 0, rollDeg: 0,    cameraMode: "chase", flightTime: 0,
    glide: null,
    distCarrierKm: 0, bearingCarrierDeg: 0, carrierName: "—", distFieldKm: 0,
    bearingFieldDeg: 0, worldLabel: "Procedural islands", worldSeed: DEFAULT_SEED,
    radarAltFt: 0,
    playerX: 0, playerZ: 0, playerHeadingDeg: 0, carrierMarkers: [],
    fieldX: 0, fieldZ: 0, fieldHeadingDeg: 0, fieldLengthM: 0, worldExtent: 12000,
    localHour: 12, dayPhase: "day",
    dfActive: false, dfStrike: false, dfHull: 100, dfKills: 0, dfWave: 1, dfBandits: 0,
    dfNearestKm: 0, dfNearestBrgDeg: 0, enemyMarkers: [],
    dfThreat: false, gunFiring: false, dfHitT: 0, dfConfirmation: null, dfDamageT: 0, dfSpots: [],
    aircraftName: "F-14A TOMCAT",
    dfBombs: 6, dfBombsMax: 6, dfBombsAway: 0, dfCarrier: null,
    dfMissiles: 2, dfMissilesMax: 2,
    dfFlares: 30, dfFlaresMax: 30, dfIncoming: null,
    dfBombsTracking: 0, dfBombTracks: [], dfDesignated: null,
    dfReleased: null, dfLanded: null, pod: false, bigMap: false,
    weather: "clear", weatherLabel: "CLEAR",
    spectating: false, spectateTarget: "", spectateKind: "", spectateIndex: 0, spectateCount: 0,
    pings: [], lsoCall: null, lsoGrade: null,
    tutorial: null,
    remotes: [], netStatus: "idle", netRoom: "", netHost: false, netPilots: 0,
  };
}

/** How long a room ping stays on the glass before it fades away. */
const PING_TTL = 45;

/** An idle net session, so the HUD has something to read before anyone joins. */
function idleNetState(): NetState {
  return {
    status: "idle", room: "", self: "", host: false, pilots: [],
    hz: 0, sent: 0, recv: 0,
  };
}

export class Sim {
  private operationId = 1;
  private operationSeed = 1;
  private operationOrigin: OperationLaunch["origin"];
  private combatSentAt = -Infinity;
  private allPilotsDown = 0;
  operationDebrief = false;
  phase: Phase = "menu";
  private renderer: WorldRenderer;
  private rig = new CameraRig();
  private audio = new AudioEngine();
  private input: InputManager;
  private settings: Settings;
  private state: AircraftState;
  private mission: MissionKind = "carrier";
  /** First-flight tutorial: the pending launch, the active sortie and its step. */
  private tutorialPending = false;
  private tutorialActive = false;
  private tutorialStep = 0;
  /** Edge detectors for the audio pass (phase changes, warnings, touchdown). */
  private lastCatPhase = "";
  private lastGear = true;
  private lastFlaps = false;
  private lastResultKind: string | null = null;
  private lastWarningAt = 0;
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
  private fleetClock = 0;
  /** The terrain seed in play. Regenerating from it rebuilds the whole world. */
  private worldSeed = DEFAULT_SEED;
  private spawnCarrier = 0;
  /** One-shot per sortie: has the landing that ended it been written down? */
  private launchRemembered = false;
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
  /** Tactical map: the minimap, blown up to fill the view. */
  private bigMap = false;
  /**
   * The crash replay, from the fatal hit to the screen: while `falling`, the
   * dead jet tumbles under the action camera; after impact the camera holds on
   * the fireball for a beat before the results take over. Null when alive.
   */
  private crashSeq: { falling: boolean; t: number; smokeT: number } | null = null;
  /** One-shot: the pilot asked for settings from the air (the settings key). */
  private settingsRequest = false;
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
  private motionEpoch = 0;

  get networkDiagnostics() {
    return { links: this.net.networkDiagnostics, aircraft: this.remoteFleet.diagnostics() };
  }
  private remoteWeapons: RemoteWeapons;
  private net: Multiplayer;
  private netState: NetState = idleNetState();
  private battleReferee = new BattleReferee();
  private battle: BattleSnapshot = { match: 0, pilots: [] };
  private battleSeq = 0;
  private battleSeenShots = new Map<string, number>();
  private battleSeenMissiles = new Map<string, number>();
  private battleMissilesAt = 0;
  private battleMissilesKey = "";
  private battleLife = -1;
  private battleDeadLife = -1;
  private battleTickAt = 0;
  private battleReadyAt = 0;
  private battleRecoveryLife = -1;
  private battleRecoveryAt = 0;
  private combatRoster: BattleSnapshot | null = null;
  private netListeners = new Set<(s: NetState) => void>();
  /**
   * The theatre's weather. One preset drives the flight model (wind, gusts,
   * turbulence), the fleet (swell, deck pitch and roll) and the renderer (cloud,
   * rain, lightning, visibility), so what the pilot feels is what they see.
   */
  private weather: WeatherPreset = weatherPreset("clear");
  /** The weather preset the world is currently dressed for. */
  private weatherMode: WeatherMode = "clear";
  /** Tactical pings heard from the room, with their range from the viewer. */
  private pings: Array<TacticalPing & { km: number; brgDeg: number }> = [];
  /** Spectator session: which entry of the target list the camera is watching. */
  private spectateIndex = 0;
  private spectateId = "";
  /** The spot the pilot last designated, so a ping can call it out. */
  private lastDesignation: THREE.Vector3 | null = null;
  /** The room's last launch, so leaving spectator mode can rejoin the fight. */
  private lastRoomLaunch: { mission: MissionKind; carrier: number; profile?: OperationLaunch } | null = null;
  /** Everything the spectator camera may watch, rebuilt once per frame. */
  private spectateList: SpectateTarget[] = [];
  /**
   * The watched aircraft, worn as a stand-in airframe so the HUD builder (and
   * the radar picture) can be reused verbatim in a spectator session.
   */
  private spectateViewer: AircraftState | null = null;
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
    this.settings = settings.missionMode === "campaign" ? { ...settings, missionStyle: "operation" } : settings;
    this.weather = weatherPreset(settings.weather);
    this.weatherMode = this.weather.mode;
    // The launch point is part of the gamestate: start parked on the boat (or
    // runway) the last sortie used, not on whatever the fleet had next.
    this.mission = settings.launchKind;
    this.spawnCarrier = clampCarrier(settings.launchCarrier);
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
    this.renderer.setAdaptiveResolution(settings.adaptiveResolution);
    this.input = new InputManager(settings);
    // honour the persisted volume from the first frame — applySettings only
    // runs when the user touches a setting, so the constructor must seed it.
    this.audio.setVolume(settings.volume);
    this.explosions = new ExplosionField(this.renderer.scene, settings.quality);
    this.explosions.onBlast = (kind, scale, at) => {
      if (this.phase === "flying" || this.phase === "result") {
        this.audio.explosion(kind, scale, at.distanceTo(this.state.pos));
      }
    };
    this.applyWeatherWorld();
    this.df = new Dogfight(this.renderer.scene, this.explosions);
    this.df.onCombatFeedback = kind => {
      if (this.phase === "flying") this.audio.combatFeedback(kind);
    };
    this.df.onShot = (hostile, at) => {
      if (this.phase === "flying") this.audio.gunfire(hostile, at.distanceTo(this.state.pos));
    };
    this.df.onMissileLaunch = (hostile, at) => {
      if (this.phase === "flying") this.audio.missileLaunch(hostile, at.distanceTo(this.state.pos));
    };
    this.df.onFlare = () => {
      if (this.phase === "flying") this.audio.flarePop();
    };
    // Multiplayer: wingman meshes live in the same scene; the P2P session
    // stays idle (and costs nothing) until the pilot opens or joins a room.
    this.remoteFleet = new RemoteFleet(this.renderer.scene);
    this.remoteWeapons = new RemoteWeapons(this.renderer.scene, this.explosions);
    this.net = new Multiplayer({
      onState: (s) => {
        this.netState = s;
        if (s.status === "idle" && this.state) this.moveFleet(0);
        this.syncWorldToRoom(s);
        for (const fn of this.netListeners) fn(s);
      },
      onFleetClock: seconds => this.moveFleet(seconds),
      onPilot: (id, name, aircraft) => this.remoteFleet.spawn(id, aircraft, name),
      onPilotLeave: (id) => this.remoteFleet.remove(id),
      onPose: (id, pose) => this.remoteFleet.push(id, pose, performance.now()),
      onLaunch: (mission, carrier, profile) => this.followLaunch(mission, carrier, profile),
      onMissionStyle: style => this.applyRoomStyle(style),
      onCombat: frame => {
        this.df.setMirror(!this.netState.host, this.state);
        this.df.applySharedSnapshot(frame, performance.now());
        const kind = this.df.operationState?.kind;
        if ((kind === "bastion" || kind === "convoy") && this.settings.strikeVariant !== kind) {
          this.settings = { ...this.settings, strikeVariant: kind };
          for (const fn of this.settingsListeners) fn(this.settings);
        }
      },
      onEnemyFire: shot => this.df.receiveEnemyFire(shot),
      // The room's fight, from whoever is hosting it. Our guns are still ours;
      // only the aircraft are theirs.
      onEnemies: (snap) => { if (this.settings.missionMode !== "versus") this.df.applyRemoteSnapshot(snap, performance.now()); },
      onMode: (mode) => this.applyRoomMode(mode),
      onWeather: (weather) => this.applyRoomWeather(weather),
      onHit: (id, dmg, epoch) => this.df.applyRemoteHit(id, dmg, this.state, epoch),
      onCarrierHit: (dmg, epoch) => { if (epoch === undefined || epoch === this.df.operationEpoch) this.df.applyRemoteCarrierHit(dmg, this.state); },
      onChat: (msg) => this.addChat(msg),
      onLinkDelay: (id, ms) => this.remoteFleet.setLinkDelay(id, ms),
      onPing: (ping) => this.receivePing(ping),
      onBattleAction: (sender, action) => this.receiveBattleAction(sender, action),
      onBattleState: (snapshot) => this.applyBattle(snapshot),
      onBattleShot: (sender, shot) => this.receiveBattleShot(sender, shot),
      onBattleMissiles: (sender, snapshot) => this.receiveBattleMissiles(sender, snapshot),
    }, peerFactory);
    this.input.attach(canvas);
    window.addEventListener("resize", this.onResize);
    this.state = this.newState(this.mission, this.spawnCarrier);
    this.spectateViewer = this.newState("carrier", 0);
    this.launchRemembered = true; // this park is already on file
    this.updateJetPose(1);
    this.updateHud();
    this.raf = requestAnimationFrame(this.loop);
  }

  /** A freshly spawned airframe, already dressed for the theatre's weather. */
  private newState(mission: MissionKind, carrier: number): AircraftState {
    this.motionEpoch = (this.motionEpoch+1) >>> 0;
    const st = spawnAircraft(mission, carrier, this.settings.aircraft, this.settings.bindings);
    if (st.spec.surfaceVessel && this.netState?.status === "online") {
      const ids = [this.netState.self, ...this.netState.pilots.filter(p => !p.spectator).map(p => p.id)].sort();
      st.pos.copy(shipSpawn(carrier, Math.max(0, ids.indexOf(this.netState.self))));
      st.prevPos.copy(st.pos);
    }
    this.applyWeather(st);
    return st;
  }

  /**
   * Put the theatre's air into an airframe: the steady wind, its gust cycle and
   * the turbulence the pilot will feel. Called every frame, so the gust builds
   * and eases like the real thing instead of stepping once at launch.
   */
  private applyWeather(st: AircraftState): void {
    applyWeatherPresetTo(st, this.weather ?? weatherPreset(this.weatherMode), this.worldSeed, this.fleetClock);
  }

  /**
   * Dress the world for the active weather: the sea the fleet rides and the sky,
   * rain and lightning the renderer draws. The fleet is re-posed on the new sea
   * state immediately, so a mid-flight change is not a visual bait-and-switch.
   */
  private applyWeatherWorld(): void {
    setSeaState(seaStateFor(this.weather));
    this.renderer.setWeather(this.weather);
  }

  /** Adopt a weather setting: air, sea, sky and the airframe already flying. */
  private adoptWeather(mode: WeatherMode | undefined): void {
    const preset = weatherPreset(mode);
    const changed = preset.mode !== this.weatherMode;
    this.weather = preset;
    this.weatherMode = preset.mode;
    this.applyWeatherWorld();
    if (this.state) {
      this.applyWeather(this.state);
      if (changed) this.pushBanner(`WEATHER — ${preset.brief}`);
    }
  }

  /**
   * A room ping: a wingman (or a spectator running the tactical picture) has
   * called out a spot. Kept locally with its range from us, because the HUD
   * redraws the marker every frame and must not wait for another packet.
   */
  private receivePing(ping: TacticalPing): void {
    this.pings.push({ ...ping, km: 0, brgDeg: 0 });
    if (this.pings.length > 12) this.pings.shift();
    this.refreshPingRanges();
    this.addChat({ from: ping.from, text: `PING ${ping.kind.toUpperCase()} — ${ping.label}` });
  }

  /** Recompute every ping's range/bearing from wherever the viewer is now. */
  private refreshPingRanges(): void {
    const from = this.viewerPos();
    for (const p of this.pings) {
      const dx = p.x - from.x;
      const dz = p.z - from.z;
      p.km = Math.hypot(dx, dz) / 1000;
      p.brgDeg = (Math.atan2(dx, -dz) * 180 / Math.PI + 360) % 360;
    }
  }

  /** Where the viewer is: the aircraft, or the spectated target. */
  private viewerPos(): THREE.Vector3 {
    const target = this.spectating ? this.spectateList[this.spectateIndex] : null;
    return target ? target.pos : this.state.pos;
  }

  applySettings(s: Settings, roomWeather = false): void {
    if (s.missionMode === "campaign") s = { ...s, missionStyle: "operation" };
    if (!roomWeather && this.netState.status === "online" && !this.netState.host) s = { ...s, weather: this.settings.weather };
    const qualityChanged = s.quality !== this.settings.quality;
    const resolutionChanged = s.adaptiveResolution !== this.settings.adaptiveResolution;
    const daylightChanged =
      s.daylight !== this.settings.daylight || s.timeOfDay !== this.settings.timeOfDay;
    const modeChanged = s.missionMode !== this.settings.missionMode || s.missionStyle !== this.settings.missionStyle;
    const variantChanged = (s.strikeVariant ?? "convoy") !== (this.settings.strikeVariant ?? "convoy");
    const weatherChanged = (s.weather ?? "clear") !== (this.settings.weather ?? "clear");
    const aircraftChanged = s.aircraft !== this.settings.aircraft;
    const launchChanged = s.launchKind !== this.settings.launchKind || s.launchCarrier !== this.settings.launchCarrier;
    const restoreLaunch = launchChanged && this.phase === "menu" && this.netState.status !== "online";
    this.settings = s;
    this.input.applySettings(s);
    this.audio.setVolume(s.volume);
    if (qualityChanged) {
      this.renderer.applyQuality(s.quality);
      this.explosions.setQuality(s.quality);
    }
    if (resolutionChanged) this.renderer.setAdaptiveResolution(s.adaptiveResolution);
    if (daylightChanged) this.dayHours = this.resolveDayHours(s);
    // Weather drives the air, the sea and the sky together, so it is adopted in
    // one step rather than at three separate points in the frame. The host owns
    // it for the room: wind is a flight-model input, not a display option.
    if (weatherChanged) {
      this.adoptWeather(s.weather);
      this.net.setWeather(this.weatherMode);
    }
    // Changing airframe: rebuild the mesh and re-park the jet on the new type.
    if (restoreLaunch) {
      this.mission = s.launchKind;
      this.spawnCarrier = clampCarrier(s.launchCarrier);
    }
    if (aircraftChanged || restoreLaunch) {
      if (aircraftChanged) this.renderer.setAircraft(s.aircraft);
      this.state = this.newState(this.mission, this.spawnCarrier);
      this.prevPos.copy(this.state.pos);
      this.prevQuat.copy(this.state.quat);
      this.df.setAircraft(this.state);
      this.net.setAircraft(s.aircraft);
      this.updateJetPose(1);
    }
    // Toggling a mission mode mid-flight starts or clears it; toggling it on
    // the ground arms the launch instead, so nothing starts while parked.
    if (modeChanged || variantChanged) {
      // A mission profile is the room's profile: tell everyone the moment the
      // host (the only pilot with these chips) changes it. Swapping the strike
      // variant (convoy <-> fortified island) re-tasks the same sortie in place.
      this.net.setMode(s.missionMode);
      this.net.setMissionStyle(s.missionStyle ?? "operation");
      this.df.strikeVariant = s.strikeVariant === "bastion" ? "bastion" : "convoy";
      this.df.configureOperations(s.missionStyle !== "endless", this.operationSeed, this.operationId, this.operationOrigin, this.df.strikeVariant);
      const flying = this.phase === "flying" || this.phase === "paused";
      const campaign = s.missionMode === "campaign";
      const combat = s.missionMode === "dogfight" || s.missionMode === "strike" || campaign;
      const strike = s.missionMode === "strike";
      if (s.missionMode === "versus" && flying) {
        this.dfArmed = false;
        this.df.beginVersus(this.state);
      } else if (combat && flying && !this.state.onGround) {
        this.dfArmed = false;
        if (strike) this.df.beginStrike(this.state);
        else if (campaign) this.df.beginCampaign(this.state);
        else this.df.begin(this.state);
      } else if (combat && flying) {
        this.dfArmed = true;
        this.dfArmText = campaign
          ? "TASK FORCE ARCHON BRIEFED — LAUNCH TO BEGIN STAGE 1"
          : strike
          ? "STRIKE TARGETS ON THE GRID — LAUNCH TO ENGAGE"
          : "HOSTILE CARRIER INBOUND — LAUNCH TO INTERCEPT";
        this.state.banner = { text: this.dfArmText, until: Infinity };
        // the carrier / target grid is already out there while we hold on deck
        if (strike) this.df.prepareStrike(this.state);
        else if (campaign) this.df.prepareCampaign(this.state);
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

  /**
   * Claim the attempt the next sortie flies under, and report whether it is a
   * continuation of the one already under way.
   *
   * A campaign is one war across its stages, so re-launching it — after a trap,
   * a recovery or a rearm — has to keep the attempt it is already flying.
   * Minting a new id here rebuilds the theatre, and the pilot finds themselves
   * back on stage 1 with the island intact: the campaign turns into a retry
   * loop. Every other sortie, and any campaign that has already ended, is a
   * fresh attempt under a new id (see beginMission).
   */
  private mintAttempt(fresh = false): boolean {
    const s = this.df.operationState;
    const continuing = !fresh && this.settings.missionMode === "campaign" && s?.kind === "campaign"
      && (s.status === "briefing" || s.status === "active");
    if (continuing) { this.operationId = s.id; return true; }
    this.operationId = Math.max(Date.now(), this.operationId + 1);
    return false;
  }

  startMission(mission: MissionKind): void {
    this.tutorialPending = false;
    // Always the pilot's own boat: the launch point follows where they last
    // flew from (see rememberRecovery), so a sortie picks up where it left off
    // instead of hopping to the next ship in the fleet.
    if (!this.mintAttempt()) this.operationOrigin = undefined;
    this.beginMission(mission, this.spawnCarrier);
  }

  /**
   * The first-flight tutorial: a normal deck launch with one passive practice
   * drone circling ahead and a coach card on the glass. Deliberately not a new
   * mission mode — it is a sortie shape, always available from the menu and
   * never started for a pilot who has already flown unless they ask for it.
   */
  startTutorial(): void {
    this.tutorialPending = true;
    this.operationOrigin = undefined;
    this.operationId = Math.max(Date.now(), this.operationId + 1);
    this.operationDebrief = false;
    if (this.settings.aircraft === "destroyer" || this.settings.aircraft === "seahawk") {
      // The lesson is a cat shot in a fixed-wing jet; a surface or rotary pick
      // in the setup screen should not turn it into a different tutorial.
      this.settings = { ...this.settings, aircraft: "tomcat" };
      this.renderer.setAircraft("tomcat");
      for (const fn of this.settingsListeners) fn(this.settings);
    }
    this.beginMission("carrier", this.spawnCarrier);
  }

  /**
   * Launch a sortie from the multiplayer lobby. The choice is broadcast before
   * it happens here: the mesh has no referee, so the pilot who takes off is the
   * one who tells the room which mission and which boat to use. Wingmen still
   * in the lobby follow along; anyone already airborne keeps their own sortie.
   */
  startRoomMission(mission: MissionKind, fresh = false): void {
    this.tutorialPending = false;
    if (!this.netState.host) return;
    if (this.settings.missionMode === "versus") {
      if (!this.netState.pilots.some(p => p.linked && !p.spectator)) { this.pushBanner("HEAD-TO-HEAD — WAIT FOR ANOTHER PILOT"); return; }
      this.battleReferee.reset(Date.now());
      this.battle = { match: this.battleReferee.match, pilots: [] };
      this.battleTickAt = 0;
    }
    this.mintAttempt(fresh);
    if (!this.operationOrigin) { const spawn = spawnAircraft(mission, this.spawnCarrier, this.settings.aircraft, this.settings.bindings); this.operationOrigin = { x: spawn.pos.x, z: spawn.pos.z, heading: spawn.headingDeg, carrier: this.spawnCarrier }; }
    this.net.launch(mission, this.spawnCarrier, { id: this.operationId, seed: this.operationSeed, style: this.settings.missionStyle ?? "operation", origin: this.operationOrigin });
    this.beginMission(mission, this.spawnCarrier);
  }

  joinBattle(): void {
    if (this.netState.status === "online" && this.settings.missionMode === "versus" && this.battle.match) this.beginMission("carrier", this.spawnCarrier);
  }

  /** A wingman took off: join the same strip, on the same boat. */
  private followLaunch(mission: MissionKind, carrier: number, profile?: OperationLaunch, rejoin = false): void {
    this.lastRoomLaunch = { mission, carrier, profile };
    // A spectator never launches a jet: the room's sortie becomes something to
    // watch, and it can be joined at any point in the flight.
    if (this.spectating) {
      if (profile) { this.operationId = profile.id; this.operationSeed = profile.seed; this.operationOrigin = profile.origin; this.applyRoomStyle(profile.style); }
      if (this.phase !== "flying") this.beginSpectating();
      return;
    }
    // Only a pilot still in the menu comes along — one already flying (or
    // reading the pause menu) is left to finish the sortie they are on.
    if (!rejoin && this.phase !== "menu" && (!profile || profile.id === this.operationId)) return;
    if (profile) { this.operationId = profile.id; this.operationSeed = profile.seed; this.operationOrigin = profile.origin; this.applyRoomStyle(profile.style); }
    const boats = carriers().length;
    this.spawnCarrier = ((Math.floor(carrier) % boats) + boats) % boats;
    this.beginMission(mission, this.spawnCarrier);
  }

  private beginMission(mission: MissionKind, carrierIndex: number): void {
    this.shipRearmHold = 0;
    this.operationDebrief = false; this.allPilotsDown = 0; this.combatSentAt = -Infinity;
    const tutorial = this.tutorialPending;
    this.tutorialPending = false;
    this.tutorialActive = tutorial;
    if (tutorial) this.tutorialStep = 0;
    this.mission = mission;
    this.recoveryPending = false;
    this.spawnCarrier = clampCarrier(carrierIndex);
    this.launchRemembered = false;
    this.endPod();
    this.crashSeq = null;
    this.pendingRoom = false;
    this.settingsRequest = false;
    this.breakupHide = false;
    this.state = this.newState(mission, carrierIndex);
    this.pings = [];
    this.lastDesignation = null;
    this.battleLife = -1;
    this.battleDeadLife = -1;
    this.battleReadyAt = 0;
    this.battleRecoveryLife = -1;
    // size the racks and hull for this airframe before the fight is armed
    this.df.setAircraft(this.state);
    if (!this.operationOrigin) this.operationOrigin = { x: this.state.pos.x, z: this.state.pos.z, heading: this.state.headingDeg, carrier: this.spawnCarrier };
    this.df.strikeVariant = this.settings.strikeVariant === "bastion" ? "bastion" : "convoy";
    this.df.configureOperations(this.settings.missionStyle !== "endless", this.operationSeed, this.operationId, this.operationOrigin, this.df.strikeVariant);
    this.df.setMirror(this.netState.status === "online" && !this.netState.host && this.settings.missionMode !== "versus", this.state);
    // Mission modes: the bandits / targets are out there from the start, but
    // the fight itself only begins when the jet leaves the deck/runway — the
    // launch is part of it. A campaign sortie past its first is a re-launch of
    // the *same* war: the deck keeps the stage it has already reached.
    const campaign = this.settings.missionMode === "campaign";
    const combat = this.settings.missionMode === "dogfight" || this.settings.missionMode === "strike" || campaign;
    const resumeCampaign = campaign && this.df.operationState?.kind === "campaign" && this.df.operationState.id === this.operationId;
    if (tutorial) {
      // One passive drone, already circling ahead while the pilot runs up the
      // engines. No operation, no waves and no hostile boat to fight.
      this.dfArmed = false;
      this.df.prepareTutorial(this.state);
      this.state.banner = null;
    } else if (this.settings.missionMode === "versus" && this.netState.status === "online") {
      this.dfArmed = false;
      this.spawnBattleAircraft();
    } else if (combat) {
      const strike = this.settings.missionMode === "strike";
      // the hostile carrier / target grid is there before wheels-up
      if (resumeCampaign) { /* the theatre is already set: keep every stage */ }
      else if (strike) this.df.prepareStrike(this.state);
      else if (campaign) this.df.prepareCampaign(this.state);
      else this.df.prepare(this.state);
      this.dfArmed = true;
      const what = campaign
        ? `TASK FORCE ARCHON — STAGE ${this.df.operationState?.campaignStage ?? 1}/3`
        : strike
        ? "STRIKE TARGETS ON THE GRID"
        : "HOSTILE CARRIER INBOUND";
      this.dfArmText = this.state.spec.surfaceVessel
        ? "DESTROYER BETA — AIR DEFENSE / SURFACE STRIKE · ARROWS TRAIN GUN · R DIRECTOR · E VLS"
        : this.state.spec.rotorcraft
        ? `${what} — COLLECTIVE UP (${keyLabel(this.settings.bindings.throttleUp)}) TO LIFT OFF`
        : mission === "carrier"
        ? `${what} — FULL THROTTLE (${keyLabel(this.settings.bindings.throttleUp)}) — HOLD ${keyLabel(this.settings.bindings.cat)} — CLIMB (${keyLabel(this.settings.bindings.pitchUp)})`
        : `${what} — TAKE OFF TO ${campaign ? "CONTINUE THE CAMPAIGN" : strike ? "ENGAGE" : "INTERCEPT"}`;
      this.state.banner = { text: this.dfArmText, until: Infinity };
    } else {
      this.dfArmed = false;
      this.df.clear();
      if (this.state.spec.surfaceVessel) this.df.refill();
    }
    this.prevPos.copy(this.state.pos);
    this.prevQuat.copy(this.state.quat);
    // snap the camera to the new jet instead of gliding in from the old scene
    this.rig.resetFollow();
    this.setPhase("flying");
    // The first sortie — tutorial included — marks this pilot as having flown.
    // The first-flight offer is only for a genuinely new pilot; the tutorial
    // itself stays on the Sortie Setup screen from then on.
    if (this.settings.hasFlown !== true) {
      const next = { ...this.settings, hasFlown: true };
      this.settings = next;
      for (const fn of this.settingsListeners) fn(next);
    }
    // A keyboard-activated launch button must not keep intercepting flight keys.
    if (typeof document !== "undefined") (document.activeElement as HTMLElement | null)?.blur?.();
    this.acc = 0;
    this.last = performance.now() / 1000;
    this.input.clearEdges();
    this.lastCatPhase = this.state.catPhase;
    this.lastGear = this.state.gearDown;
    this.lastFlaps = this.state.flapsDown;
    this.lastResultKind = null;
    this.lastWarningAt = 0;
    this.audio.start();
    this.audio.resume();
    // Where this sortie began is now where the next one will begin: park the
    // choice in the settings the UI owns, so it is saved with the gamestate and
    // survives a reload (a fresh pilot's first launch writes nothing new).
    this.rememberLaunch();
    this.updateHud();
  }

  // -------------------------------------------------------------------------
  // Spectator mode: watch the room without flying in it
  // -------------------------------------------------------------------------

  /** True when this session is watching the room rather than flying in it. */
  get spectating(): boolean {
    return this.netState.status === "online" && this.netState.spectator === true;
  }

  /**
   * Everything the camera can watch, in a stable order: the room's pilots,
   * then the hostile aircraft the room has streamed, then the opposing boat,
   * then our own carriers and their LSO platforms. Cheap enough to rebuild once
   * per frame, and only ever built while spectating.
   */
  private spectateTargets(): SpectateTarget[] {
    const out: SpectateTarget[] = [];
    for (const id of this.remoteFleet.liveIds()) {
      const p = this.remoteFleet.pilotState(id);
      if (!p) continue;
      out.push({
        id: `pilot:${id}`, kind: "PILOT", label: p.name.toUpperCase(),
        pos: p.pos, quat: p.quat, vel: p.vel, speed: p.speed,
        aircraft: p.aircraft, flags: p.flags,
      });
    }
    const snap = this.df.enemySnapshot();
    snap.bandits.forEach((b, i) => {
      out.push({
        id: `bandit:${b.id}`, kind: "BANDIT",
        label: `BANDIT ${i + 1}${b.onDeck ? " ON DECK" : ""}`,
        pos: new THREE.Vector3(b.x, b.y, b.z),
        quat: new THREE.Quaternion(b.qx, b.qy, b.qz, b.qw),
        vel: new THREE.Vector3(), speed: 0,
      });
    });
    const foe = this.df.enemyDeck();
    if (foe) {
      out.push({
        id: `foe:${foe.name}`, kind: "CARRIER", label: `${foe.name} (OPFOR)`,
        pos: new THREE.Vector3(foe.x, foe.deckY, foe.z),
        quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -(foe.headingDeg * Math.PI) / 180),
        vel: new THREE.Vector3(), speed: 0, hostile: true,
      });
    }
    carriers().forEach((c, i) => {
      const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -(c.headingDeg * Math.PI) / 180);
      out.push({
        id: `carrier:${i}`, kind: "CARRIER", label: c.name,
        pos: new THREE.Vector3(c.x, c.deckY + (c.heave ?? 0), c.z),
        quat: yaw, vel: new THREE.Vector3(), speed: 0, carrier: i,
      });
      out.push({
        id: `lso:${i}`, kind: "LSO", label: `LSO ${c.name}`,
        pos: lsoStation(c), quat: new THREE.Quaternion(), vel: new THREE.Vector3(), speed: 0, carrier: i,
      });
    });
    return out;
  }

  /**
   * Step in and out of the fight without leaving the room. Taking a seat back
   * in the cockpit rejoins the sortie the room is already flying.
   */
  setSpectating(on: boolean): void {
    if (this.netState.status !== "online" || (this.netState.host && on)) return;
    if (on === this.spectating) return;
    if (this.net.setSpectator(on) === false) { this.pushBanner("JOINING AFTER LAUNCH IS DISABLED"); return; }
    if (on) {
      if (this.phase === "flying" || this.phase === "paused") this.beginSpectating();
      else this.pushBanner("SPECTATOR — YOU WILL WATCH THE ROOM'S NEXT LAUNCH");
      return;
    }
    this.spectateList = [];
    this.spectateId = "";
    this.renderer.jetGroup.visible = true;
    const launch = this.lastRoomLaunch;
    if (launch) this.followLaunch(launch.mission, launch.carrier, launch.profile, true);
    else this.quitToMenu();
  }

  /** Cycle the watched target. A spectator's view source, like camera cycling. */
  nextSpectateTarget(): void {
    if (!this.spectating) return;
    const list = this.spectateList.length ? this.spectateList : (this.spectateList = this.spectateTargets());
    if (list.length === 0) return;
    this.spectateIndex = (this.spectateIndex + 1) % list.length;
    this.spectateId = list[this.spectateIndex].id;
    const t = list[this.spectateIndex];
    this.pushBanner(`WATCHING ${t.kind} — ${t.label}`);
  }

  /** Follow a room's launch with a camera instead of an aircraft. */
  private beginSpectating(): void {
    this.endPod();
    this.crashSeq = null;
    this.breakupHide = false;
    this.pendingRoom = false;
    this.dfArmed = false;
    this.renderer.jetGroup.visible = false;
    this.rig.mode = "chase";
    this.spectateId = "";
    this.spectateIndex = 0;
    this.spectateList = this.spectateTargets();
    this.setPhase("flying");
    this.last = performance.now() / 1000;
    this.acc = 0;
    this.input.clearEdges();
    this.audio.start();
    this.audio.resume();
    this.pushBanner("SPECTATOR — [N] NEXT VIEW · [C] CAMERA · [P] PING THE ROOM");
    this.updateHud();
  }

  /**
   * Per-frame spectator upkeep: rebuild the watch list, keep the camera on a
   * target that still exists, and let the free camera fly itself around.
   */
  private updateSpectate(frameDt: number): void {
    if (!this.spectating) {
      if (this.spectateList.length) this.spectateList = [];
      return;
    }
    const list = (this.spectateList = this.spectateTargets());
    if (list.length === 0) return;
    // Hold the same aircraft even if the roster re-sorts underneath us.
    const held = this.spectateId ? list.findIndex(t => t.id === this.spectateId) : -1;
    this.spectateIndex = held >= 0 ? held : this.spectateIndex % list.length;
    this.spectateId = list[this.spectateIndex].id;
    this.mirrorSpectateViewer(list[this.spectateIndex]);
    const freeCam = this.rig.mode === "free";
    if (freeCam) {
      // Free camera: fly it with the stick, boost with the trigger.
      const inp = this.input.sample(frameDt);
      this.rig.stepFree(inp.pitch, inp.roll, (inp.throttleUp ? 1 : 0) - (inp.throttleDown ? 1 : 0), frameDt, inp.fire);
    }
    this.refreshPingRanges();
  }

  /**
   * Wear the watched target as an airframe, so every readout the HUD computes —
   * airspeed, altitude, vertical speed, radar altitude and the radar picture —
   * is the watched aircraft's rather than our parked one's.
   */
  private mirrorSpectateViewer(t: SpectateTarget): void {
    const v = this.spectateViewer;
    if (!v || !t) return;
    if (t.aircraft && v.spec.id !== t.aircraft) v.spec = specFor(t.aircraft);
    v.pos.copy(t.pos);
    v.quat.copy(t.quat);
    v.vel.copy(t.vel);
    v.speed = t.speed;
    v.headingDeg = headingOfQuat(t.quat);
    v.onGround = false;
    v.airborne = true;
    v.stalled = false;
    v.alpha = 0;
    v.gLoad = 1;
    v.result = null;
    v.banner = null;
    if (t.flags !== undefined) {
      v.gearDown = (t.flags & FLAG_GEAR) !== 0;
      v.flapsDown = (t.flags & FLAG_FLAPS) !== 0;
      v.speedbrake = (t.flags & FLAG_SPEEDBRAKE) !== 0;
      v.abLevel = (t.flags & FLAG_AB) !== 0 ? 0.7 : 0;
    }
  }

  /** Send a tactical ping to the room (spectators task the flight this way). */
  ping(kind: PingKind = "threat", label?: string): TacticalPing | null {
    if (this.netState.status !== "online") return null;
    const target = this.spectating ? this.spectateList[this.spectateIndex] : null;
    const spot = this.lastDesignation ?? target?.pos ?? this.state.pos;
    const text = label ?? (this.lastDesignation
      ? `${kind.toUpperCase()} ${Math.round(spot.x / 100) / 10},${Math.round(spot.z / 100) / 10} KM GRID`
      : target ? `${target.kind} ${target.label}` : `${kind.toUpperCase()}`);
    const ping = this.net.sendPing(kind, spot.x, spot.y, spot.z, text);
    if (ping) this.receivePing(ping);
    return ping;
  }

  resume(): void {
    this.operationDebrief = false;
    // Back in the air: the in-flight settings request is spent, so the next
    // Escape opens the plain pause screen.
    this.settingsRequest = false;
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

  /** Continue the existing mission after a successful solo recovery. */
  continueRecovery(): void {
    if (this.battleActive || (this.state.result?.kind !== "wire" && this.state.result?.kind !== "landing")) return;
    this.completeBattleRecovery();
    this.setPhase("flying");
    this.acc = 0;
    this.last = performance.now() / 1000;
    this.input.clearEdges();
    this.audio.resume();
    this.updateHud();
  }

  restart(): void {
    if (this.tutorialActive) { this.startTutorial(); return; }
    // retry the same mission from the same carrier
    if (this.netState.status === "online") {
      if (this.netState.host) this.startRoomMission(this.mission, true);
      else this.pushBanner("THE HOST CHOOSES RETRY OR NEXT OPERATION");
      return;
    }
    this.operationId = Math.max(Date.now(), this.operationId + 1); this.beginMission(this.mission, this.spawnCarrier);
  }

  nextOperation(): void {
    if (this.netState.status === "online" && !this.netState.host) return;
    this.operationSeed++; this.operationOrigin = undefined; this.restart();
  }
  finishOperation(): void {
    if (!this.df.operationState) return;
    this.operationDebrief = true; this.setPhase("paused"); this.updateHud();
  }
  recoverOperation(): void { this.operationDebrief = false; this.resume(); }

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

  /** The pause screen reads this to open straight on the settings tab. */
  get settingsRequested(): boolean {
    return this.settingsRequest;
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
    this.settingsRequest = false;
    this.tutorialPending = false;
    this.tutorialActive = false;
    this.dfArmed = false;
    this.endPod();
    this.crashSeq = null;
    this.breakupHide = false;
    if (!(this.netState.status === "online" && this.df.operationState)) this.df.clear();
    this.state = this.newState(this.mission, this.spawnCarrier);
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
  private applyRoomStyle(style: MissionStyle): void {
    if ((this.settings.missionStyle ?? "operation") === style) return;
    const next: Settings = { ...this.settings, missionStyle: style };
    this.applySettings(next); for (const fn of this.settingsListeners) fn(next);
  }

  /** The host's weather is the room's weather: adopt it and persist it. */
  private applyRoomWeather(weather: WeatherMode): void {
    if ((this.settings.weather ?? "clear") === weather) return;
    const next: Settings = { ...this.settings, weather };
    this.applySettings(next, true); for (const fn of this.settingsListeners) fn(this.settings);
  }

  get netSnapshot(): NetState {
    return this.netState;
  }

  /**
   * Open a room. Any wingmen already on screen are dropped first, so a stale
   * mesh from the previous session cannot bleed into this one.
   */
  openRoom(callsign: string, room: string): void {
    this.operationOrigin = undefined;
    this.remoteFleet.clear();
    this.chatLog = [];
    // Open/join set the room code, and the room code is the world: the terrain
    // follows automatically through syncWorldToRoom().
    this.battle = { match: 0, pilots: [] };
    this.net.open(room, callsign, this.settings.aircraft);
    this.net.setWeather(this.settings.weather ?? "clear");
    this.net.setMode(this.settings.missionMode);
    this.net.setMissionStyle(this.settings.missionStyle ?? "operation");
  }

  joinRoom(callsign: string, room: string, spectator = false): void {
    this.operationOrigin = undefined;
    this.remoteFleet.clear();
    this.chatLog = [];
    this.battle = { match: 0, pilots: [] };
    if (spectator) this.net.spectate(room, callsign, this.settings.aircraft);
    else this.net.join(room, callsign, this.settings.aircraft);
  }

  /** Join an existing room with a camera instead of an aircraft. */
  joinAsSpectator(callsign: string, room: string): void {
    this.joinRoom(callsign, room, true);
  }

  leaveRoom(): void {
    const wasSpectating = this.spectating;
    this.remoteFleet.clear();
    this.chatLog = [];
    this.net.leave();
    this.battle = { match: 0, pilots: [] };
    this.df.setOpponents([]);
    this.spectateList = [];
    this.spectateId = "";
    this.pings = [];
    // A spectator has no sortie of their own to come back to: leaving the room
    // puts the camera away and returns to the board.
    if (wasSpectating) this.quitToMenu();
  }

  setAllowLateJoin(allow: boolean): void { this.net.setAllowLateJoin(allow); }

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
    this.fleetClock = 0;
    setFleetTime(0);
    this.state = this.newState(this.mission, this.spawnCarrier);
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
    this.renderer.updateFrameBudget(nowMs);
    const now = nowMs / 1000;
    const elapsed = Math.max(0, now - this.last);
    const frameDt = Math.min(0.05, Math.max(0.0001, elapsed));
    // Advance the clock every frame (including the menu), otherwise the
    // clamp below pins dt at 0.05 forever and the menu's orbit camera and
    // fast daylight cycle run ~3x fast at 60 fps.
    this.last = now;
    const online = this.netState.status === "online";
    if (online || this.phase === "flying") this.moveFleet(this.fleetClock + (online ? elapsed : frameDt));
    if (online && this.netState.host) this.net.publishFleetClock(this.fleetClock);

    this.advanceFrame(frameDt);

    // Ordnance effects run on frame time, not sim steps, so a fireball keeps
    // evolving while the wreck replay plays out — but freezes on pause.
    if (this.phase === "flying" || this.phase === "result") this.explosions.step(frameDt);

    // The host advances the shared operation while opening menus or recovering.
    // Solo pause freezes combat; a landing decision keeps the convoy moving.
    if (this.df.operationState && (this.phase !== "flying" || this.crashSeq) && (this.netState.status === "online" || this.phase === "result") && !this.df.mirroring) {
      this.state.time += frameDt; this.df.step(frameDt, this.state, false, false, true); this.updateHud();
    }
    this.checkOperationPilots(frameDt);

    this.advanceDaylight(frameDt);
    // The room's tactical picture: who can be watched, where the pings are.
    this.advancePings(frameDt);
    // Multiplayer: interpolate the wingmen and hand our own pose to the net
    // layer, which sends it at its own fixed rate rather than per frame.
    const roster = this.battleActive ? this.battle : null;
    if (roster !== this.combatRoster) {
      this.combatRoster = roster;
      this.remoteFleet.setCombatPilots(roster ? roster.pilots.filter(p => p.ready && p.hp > 0).map(p => p.id) : null);
    }
    this.remoteFleet.update(nowMs);
    this.updateSpectate(frameDt);
    this.startOperationWithWingman();
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
   * The per-frame phase dispatch, split out of the render loop so a headless
   * harness can drive it. stepSim owns the crash replay — its own crashSeq
   * branch advances the wreck and hands over to the result screen — so it has
   * to run in every flying frame. Gating it on !crashSeq once froze the replay:
   * the wreck never fell, the result menu never came up, and the only way out
   * was to quit. handleEdges is what stays gated; a dead stick answers nothing.
   */
  private advanceFrame(frameDt: number): void {
    if (this.phase === "flying") {
      if (!this.crashSeq) this.handleEdges();
      if (this.phase === "flying") {
        if (this.spectating) this.stepSpectateRoom(frameDt);
        else this.stepSim(frameDt);
      }
    } else if (this.phase === "paused") {
      if (this.input.take("pause")) this.resume();
    } else if (this.phase === "result") {
      this.input.take("pause"); // swallow esc while result shows
      if (!this.spectating) this.updateJetPose(1);
      this.updateAudio();
    }
  }

  /**
   * A spectator's frame: no airframe of our own, so the room's fight is mirrored
   * (the host owns it) while the camera rides whatever the room is doing. The
   * HUD is rebuilt from the watched aircraft so the pilot can read the fight.
   */
  private stepSpectateRoom(frameDt: number): void {
    const w = windFor(this.weather, this.worldSeed, this.fleetClock);
    this.renderer.setWind(w.x, w.z);
    this.df.step(frameDt, this.state, false, false);
    this.updateAudio();
    this.updateHud();
  }

  /** Retire pings that have gone stale, and keep their ranges current. */
  private advancePings(frameDt: number): void {
    if (this.pings.length === 0) return;
    const now = performance.now();
    this.pings = this.pings.filter(p => (now - p.at) / 1000 < PING_TTL);
    this.refreshPingRanges();
    void frameDt;
  }

  /** Keep parked/rolling aircraft fixed in their ship frame as the deck moves. */
  private moveFleet(seconds: number): void {
    const st = this.state;
    const onCat = st.catPhase === "ready" || st.catPhase === "charging" || st.catPhase === "firing";
    const ship = onCat ? carriers()[st.catCarrier] : st.onGround && st.groundKind === "deck" ? carrierAt(st.pos.x, st.pos.z) : null;
    const before = ship ? { ...ship } : null;
    this.fleetClock = seconds;
    setFleetTime(seconds);
    if (ship && before) {
      carryDeckPose(st.pos, st.quat, before, ship, st.vel);
      carryDeckPose(this.prevPos, this.prevQuat, before, ship);
      st.headingDeg = headingOfQuat(st.quat);
    }
    this.renderer.updateFleet();
    if (this.phase !== "flying") { this.updateJetPose(1); this.updateHud(); }
  }

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
    this.df.setDefenders(this.netState.self, online ? this.remoteFleet.combatTargets() : []);
    this.df.setMirror(mirror, this.state);
    if (!online) { this.df.setOpponents([]); return; }
    if (versus) { this.net.publishEnemies(null); this.syncBattle(); return; }
    if (mirror) {
      const hits = this.df.takeHits();
      for (const h of hits) this.net.hitBandit(h.id, h.dmg, h.combatId);
      const cv = this.df.takeCarrierHit();
      if (cv > 0) this.net.hitCarrier(cv, this.df.hasSharedCombat ? this.df.operationEpoch : undefined);
    } else {
      if (this.df.hasSharedCombat) {
        this.net.publishEnemies(null);
        const now = performance.now();
        if (now - this.combatSentAt >= 200) { this.combatSentAt = now; this.net.publishCombat(this.df.sharedSnapshot()); }
        this.net.sendEnemyFire(this.df.takeEnemyFire());
      } else this.net.publishEnemies(this.df.enemySnapshot());
    }
  }

  private checkOperationPilots(dt: number): void {
    if (this.df.operationState?.status !== "active" || this.df.mirroring) return;
    const selfAlive = this.phase !== "menu" && this.state.result?.kind !== "crash";
    const others = this.netState.status === "online" ? this.remoteFleet.activePilotCount() : 0;
    this.allPilotsDown = selfAlive || others > 0 ? 0 : this.allPilotsDown + dt;
    if (this.allPilotsDown > 3) this.df.failOperation("All active pilots were lost before the objective was secured.");
  }

  private startOperationWithWingman(): void {
    if (this.netState.status !== "online" || !this.netState.host || this.df.operationState?.status !== "briefing") return;
    if (!this.remoteFleet.combatTargets().some(p => p.onGround === false)) return;
    this.dfArmed = false;
    if (this.settings.missionMode === "strike") this.df.beginStrike(this.state);
    else if (this.settings.missionMode === "campaign") this.df.beginCampaign(this.state);
    else this.df.begin(this.state);
    this.updateHud();
  }

  private get battleActive(): boolean {
    return this.netState.status === "online" && this.settings.missionMode === "versus";
  }

  private spawnBattleAircraft(respawn = false): void {
    this.motionEpoch = (this.motionEpoch+1) >>> 0;
    this.endPod();
    this.battleRecoveryLife = -1;
    const ids = [this.netState.self, ...this.netState.pilots.filter(p => !p.spectator).map(p => p.id)].sort();
    const slot = Math.max(0, ids.indexOf(this.netState.self));
    // The pair rides the match id; the host retains each pilot's side in the
    // scoreboard so joins and departures never change an assigned station.
    const fleet = carriers();
    const pair = battleCarrierPair(Math.floor(this.battle.match) || 0, fleet.length);
    const side = this.battleSide(this.netState.self) ?? slot % pair.length;
    const carrierIndex = pair[side] % fleet.length;
    const center = fleet[carrierIndex];
    const ring = ids.filter(id => this.battleSide(id) === side);
    const ringSlot = Math.max(0, ring.indexOf(this.netState.self));
    const angle = ringSlot * Math.PI * 2 / Math.max(1, ring.length) + (Math.max(0, this.battleLife) % 4) * .3;
    this.state = this.newState("carrier", carrierIndex);
    const st = this.state;
    st.pos.set(center.x + Math.cos(angle) * 3000, 1600 + slot * 60, center.z + Math.sin(angle) * 3000);
    // Nose on the contested middle rather than on your own boat: both sides
    // start flying at each other instead of turning away from their own deck.
    const midX = (fleet[pair[0]].x + fleet[pair[1]].x) / 2;
    const midZ = (fleet[pair[0]].z + fleet[pair[1]].z) / 2;
    const direction = new THREE.Vector3(midX - st.pos.x, 0, midZ - st.pos.z).normalize();
    const heading = Math.atan2(direction.x, -direction.z);
    st.quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -heading);
    st.vel.copy(direction).multiplyScalar(210); st.speed = 210;
    st.gearDown = false; st.gearT = 0; st.flapsDown = false; st.flapT = 0;
    st.onGround = false; st.airborne = true; st.catPhase = "idle"; st.catCooldown = 5;
    st.throttle = .72; st.rpm = .72; st.banner = { text: "HEAD-TO-HEAD — FIVE-SECOND SPAWN SHIELD", until: 5 };
    if (st.spec.rotorcraft) {
      st.vel.set(0, 0, 0); st.speed = 0;
      st.gearDown = true; st.gearT = 1;
      const spec = st.spec;
      st.throttle = st.rpm = THREE.MathUtils.clamp(
        (spec.mass * 9.81 / atmosphere(st.pos.y).sigma - spec.idleThrust) / (spec.thrustDry - spec.idleThrust), 0, 1,
      );
      st.banner.text = "HEAD-TO-HEAD — HOVER READY · FIVE-SECOND SPAWN SHIELD";
    }
    if (st.spec.surfaceVessel) {
      st.pos.copy(shipSpawn(carrierIndex, slot)); st.prevPos.copy(st.pos);
      st.vel.set(0, 0, 0); st.speed = 0; st.throttle = st.rpm = 0;
      st.airborne = false; st.groundKind = "water";
      st.headingDeg = center.headingDeg;
      st.quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -st.headingDeg * Math.PI / 180);
      st.banner.text = "DESTROYER BETA — FIVE-SECOND SPAWN SHIELD · R DIRECTOR · E VLS";
    }
    // A respawn keeps the racks you have left; a fresh launch arms them.
    this.df.beginVersus(st, !respawn);
    this.remoteWeapons.clear();
    this.prevPos.copy(st.pos); this.prevQuat.copy(st.quat);
    this.rig.resetFollow(); this.breakupHide = false;
  }

  private receiveBattleShot(sender: string, shot: BattleShot): void {
    const pilot = this.battle.pilots.find(p => p.id === sender);
    if (!this.battleActive || shot.match !== this.battle.match || !pilot?.ready || pilot.hp <= 0 || pilot.life !== shot.life || pilot.shield) return;
    const key = `${shot.match}/${sender}/${shot.life}`;
    if (shot.seq <= (this.battleSeenShots.get(key) ?? -1)) return;
    this.battleSeenShots.set(key, shot.seq);
    if (this.battleSeenShots.size > 64) this.battleSeenShots.delete(this.battleSeenShots.keys().next().value!);
    if (shot.weapon === "flare") this.df.receiveRemoteFlare(sender, shot.life, shot);
    else this.remoteWeapons.add(sender, shot);
  }

  private receiveBattleMissiles(sender: string, snapshot: BattleMissiles): void {
    const pilot = this.battle.pilots.find(p => p.id === sender);
    if (!this.battleActive || snapshot.match !== this.battle.match || !pilot?.ready || pilot.hp <= 0 || pilot.life !== snapshot.life) return;
    const key = `${snapshot.match}/${sender}/${snapshot.life}`;
    if (snapshot.seq <= (this.battleSeenMissiles.get(key) ?? -1)) return;
    this.battleSeenMissiles.set(key, snapshot.seq);
    if (this.battleSeenMissiles.size > 64) this.battleSeenMissiles.delete(this.battleSeenMissiles.keys().next().value!);
    this.remoteWeapons.reconcile(sender, snapshot);
  }

  private receiveBattleAction(sender: string, action: BattleAction): void {
    if (!this.battleActive || !this.netState.host) return;
    this.battleReferee.reconcile([...(this.spectating ? [] : [{ id: this.netState.self, name: this.net.callsign }]), ...this.netState.pilots.filter(p => !p.spectator)]);
    const contacts = this.remoteFleet.combatTargets();
    const from = sender === this.netState.self ? this.state.pos : contacts.find(p => p.id === sender)?.pos;
    const to = action.victim === this.netState.self ? this.state.pos : contacts.find(p => p.id === action.victim)?.pos;
    const range = from && to ? from.distanceTo(to) : Infinity;
    const aircraft = sender === this.netState.self ? this.settings.aircraft : this.netState.pilots.find(p => p.id === sender)?.aircraft;
    if (action.kind === "recover") {
      const velocity = sender === this.netState.self ? this.state.vel : contacts.find(p => p.id === sender)?.vel;
      if (!from || !velocity) return;
      const surface = groundAt(from.x, from.z);
      // A repair claim must agree with the host's view of the aircraft: near
      // a friendly deck/runway and slow enough to have completed a recovery.
      if (specFor(aircraft ?? "tomcat").surfaceVessel) {
        if (!this.canServiceShip(from, velocity.length(), sender)) return;
      } else if ((surface.kind !== "deck" && surface.kind !== "runway") || Math.abs(from.y - surface.y) > 6 || velocity.length() > 20) return;
    }
    if (this.battleReferee.action(sender, action, performance.now() / 1000, range, specFor(aircraft ?? "tomcat").gunDamage)) {
      const snapshot = this.battleReferee.snapshot(performance.now() / 1000);
      this.applyBattle(snapshot);
      this.net.publishBattle(snapshot);
    }
  }

  private applyBattle(snapshot: BattleSnapshot): void {
    if (!this.battleActive || !Number.isFinite(snapshot.match)) return;
    if (snapshot.pilots.some(p => !p || typeof p.id !== "string" || typeof p.name !== "string" || !Number.isFinite(p.hp) || p.hp < 0 || p.hp > 100 || !Number.isInteger(p.life) || p.life < 0 || !Number.isFinite(p.kills) || !Number.isFinite(p.deaths) || !Number.isFinite(p.respawnIn) || typeof p.ready !== "boolean" || typeof p.shield !== "boolean")) return;
    if (snapshot.pilots.some(p => p.side !== undefined && p.side !== 0 && p.side !== 1)) return;
    if (snapshot.match !== this.battle.match) { this.battleLife = -1; this.battleDeadLife = -1; }
    this.battle = snapshot;
    this.remoteWeapons.prune?.(snapshot.match, snapshot.pilots);
    const self = snapshot.pilots.find(p => p.id === this.netState.self);
    if (this.spectating || this.phase === "menu" || !self?.ready) return;
    if (self.hp > 0 && self.life !== this.battleLife) {
      // Dying costs the hull, not the ordnance: only landing re-arms.
      const respawn = this.battleLife >= 0;
      this.battleLife = self.life;
      this.spawnBattleAircraft(respawn);
    }
    this.df.setBattleHull(self.hp, this.state);
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
      this.battleReferee.reconcile([...(this.spectating ? [] : [{ id: this.netState.self, name: this.net.callsign }]), ...this.netState.pilots.filter(p => !p.spectator)]);
      const snapshot = this.battleReferee.snapshot(now);
      this.applyBattle(snapshot); this.net.publishBattle(snapshot); this.battleTickAt = now;
    }
    if (this.spectating) { this.df.setOpponents([]); return; }
    const self = this.battle.pilots.find(p => p.id === this.netState.self);
    if (this.phase !== "menu" && this.battle.match && !self?.ready && now - this.battleReadyAt > .5) {
      this.net.sendBattleAction({ kind: "ready", match: this.battle.match, seq: ++this.battleSeq, life: 0 });
      this.battleReadyAt = now;
    }
    this.df.setOpponents(!self?.ready || self.hp <= 0 || self.shield ? [] : this.remoteFleet.combatTargets(true).flatMap(p => {
      const target = this.battle.pilots.find(row => row.id === p.id);
      return target?.ready && target.hp > 0 && !target.shield ? [{ ...p, life: target.life }] : [];
    }));
    for (const shot of this.df.takeWeaponLaunches()) if (self?.ready && self.hp > 0 && !self.shield) this.net.sendBattleShot({ ...shot, match: this.battle.match, life: self.life, seq: ++this.battleSeq });
    if (self?.ready && self.hp > 0) {
      const missiles = this.df.battleMissiles();
      if (this.phase !== "flying") for (const m of missiles) m.vel = [0, 0, 0];
      const key = `${this.battle.match}/${self.life}/` + missiles.map(m => `${m.id}:${m.target}`).join(",");
      // Launches, capture/relock and retirement send immediately. Flight sends
      // at 20 Hz only while missiles exist; empty rooms add no heartbeat load.
      if (key !== this.battleMissilesKey || (missiles.length > 0 && now - this.battleMissilesAt >= .05)) {
        this.net.sendBattleMissiles({ match: this.battle.match, life: self.life, seq: ++this.battleSeq, missiles });
        this.battleMissilesKey = key; this.battleMissilesAt = now;
      }
    }
    for (const hit of this.df.takePlayerHits()) this.net.sendBattleAction({ kind: "hit", match: this.battle.match, seq: ++this.battleSeq, life: self?.life ?? 0, victim: hit.id, victimLife: hit.life, weapon: hit.weapon });
    if (self?.ready && self.hp > 0 && this.battleRecoveryLife === self.life) {
      if (self.hp === 100) this.battleRecoveryLife = -1;
      else if (now >= this.battleRecoveryAt) {
        // The pose is published before syncBattle. Retry if an earlier pose
        // reached the host first; stop as soon as its scoreboard confirms repair.
        this.battleRecoveryAt = now + .5;
        this.net.sendBattleAction({ kind: "recover", match: this.battle.match, seq: ++this.battleSeq, life: self.life });
      }
    }
    if (self?.ready && this.state.result?.kind === "crash" && this.battleDeadLife !== self.life) {
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
    const deck = st.catPhase === "firing" ? carriers()[st.catCarrier] : st.onGround && st.groundKind === "deck" ? carrierAt(st.pos.x, st.pos.z) : null;
    if (deck) {
      const v = fleetVelocityAt(carriers().indexOf(deck), this.fleetClock ?? 0, st.pos.x, st.pos.z);
      p.vx += v.x; p.vz += v.z;
    }
    p.speed = st.speed;
    p.sweepT = st.sweepT;
    p.gearT = st.gearT; p.flapT = st.flapT; p.abLevel = st.abLevel;
    p.epoch = this.motionEpoch; p.held = this.phase !== "flying" || !!st.result;
    let flags = 0;
    if (st.onGround) flags |= FLAG_ON_GROUND;
    if (st.gearDown) flags |= FLAG_GEAR;
    if (st.flapsDown) flags |= FLAG_FLAPS;
    if (st.speedbrake) flags |= FLAG_SPEEDBRAKE;
    if (st.stalled) flags |= FLAG_STALLED;
    if (st.abLevel > 0.05) flags |= FLAG_AB;
    const recovered = this.df.operationState && (st.result?.kind === "wire" || st.result?.kind === "landing");
    if (((this.phase === "flying" || this.phase === "paused") && !st.result) ||
      (recovered && this.phase !== "menu")) flags |= FLAG_ACTIVE;
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
    // Options without leaving the cockpit: pause on the spot and open the
    // settings screen (the pause menu reads the one-shot flag).
    if (this.input.take("settings")) {
      this.settingsRequest = true;
      this.pause();
      return;
    }
    // The tactical map is a view toggle, like the camera: one press, one state.
    if (this.input.take("map")) this.bigMap = !this.bigMap;
    if (this.input.take("camera")) {
      if (this.pod) this.endPod();
      // A spectator's camera also cycles onto the LSO platform and a free camera.
      else this.rig.cycle(this.spectating);
    }
    // Spectator tools: cycle what the camera is watching, and call a spot out to
    // the room (the AWACS/tasking role a spectator plays in a campaign).
    if (this.input.take("spectate")) this.nextSpectateTarget();
    if (this.input.take("ping")) this.ping("threat");
    // The bomb key opens the target pod; in the pod a click on the world
    // designates the spot and releases a laser-guided weapon at it.
    if (this.input.take("bomb")) {
      if (this.pod) this.endPod();
      else this.beginPod();
    }
    if (this.pod) this.handlePodClick();
    // A missile launch is an edge, like gear or flaps: one press, one shot.
    if (this.input.take("missile")) this.df.requestMissile(this.state);
    if (this.input.take("flares")) this.df.requestFlares(this.state);
    // A destroyer has no aircraft fittings. Consume those edges without
    // allowing a gear/flap toggle to leak into its network pose.
    if (this.state.spec.surfaceVessel) {
      for (const action of ["gear", "flaps", "speedbrake", "ab", "cat"] as const) this.input.take(action);
      return;
    }
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
    this.rig.enterPod(this.state.spec.surfaceVessel ? shipGunQuaternion(this.state, this.camQ) : this.state.quat);
    this.pod = true;
    const el = this.renderer.renderer.domElement;
    el.style.cursor = "crosshair";
    if (this.state.spec.surfaceVessel) { this.pushBanner("GUN DIRECTOR — ARROWS / DRAG TO AIM · Q GUN · E VLS LOCK · CLICK SURFACE TO STRIKE"); return; }
    this.pushBanner(
      this.df.designated
        ? "TARGET POD — SLEW ONTO A TARGET, CLICK TO RE-ENGAGE · [R] TO LEAVE"
        : "TARGET POD — SLEW THE SENSOR ONTO A TARGET, THEN CLICK IT TO LAUNCH",
    );
  }

  private endPod(): void {
    if (!this.pod) return;
    this.pod = false;
    this.rig.exitPod();
    this.renderer.renderer.domElement.style.cursor = "";
    this.input.clearClicks();
  }

  /**
   * A click in the pod view: pick the surface under the cursor, paint the laser
   * there, and send one weapon after it. Slew with any drag you like — only the
   * click is a shot — and every later click moves the same laser to the new
   * spot, pulling weapons already in the air with it.
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
    if (this.state.spec.surfaceVessel) { launchNavalMissile(this.df, this.state, hit.pos); return; }
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
    // The theatre's air, refreshed every frame: the gust builds and eases on the
    // weather's own cycle, and the rain rides the same wind.
    this.applyWeather(this.state);
    this.renderer.setWind(this.state.windX ?? 0, this.state.windZ ?? 0);
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
      const onCat = this.state.catPhase === "firing";
      const deck = onCat ? carriers()[this.state.catCarrier] : this.state.onGround && this.state.groundKind === "deck" ? carrierAt(this.state.pos.x, this.state.pos.z) : null;
      if (!this.battleActive || !this.state.result) stepAircraft(this.state, inp, FIXED_DT);
      // Ground integration uses the moving ship's frame. Cross that boundary
      // once on departure/arrival, preserving the ship's launch momentum.
      if (deck && !this.state.onGround && this.state.catPhase !== "firing") {
        const v = fleetVelocityAt(carriers().indexOf(deck), this.fleetClock ?? 0, this.state.pos.x, this.state.pos.z);
        this.state.vel.x += v.x; this.state.vel.z += v.z;
      } else if (!deck && this.state.onGround && this.state.groundKind === "deck") {
        const landed = carrierAt(this.state.pos.x, this.state.pos.z);
        if (landed) {
          const v = fleetVelocityAt(carriers().indexOf(landed), this.fleetClock ?? 0, this.state.pos.x, this.state.pos.z);
          this.state.vel.x -= v.x; this.state.vel.z -= v.z;
        }
      }
      if (this.dfArmed) {
        if (!this.state.onGround) {
          // wheels off the deck/runway: the fight begins
          this.dfArmed = false;
          if (this.settings.missionMode === "strike") this.df.beginStrike(this.state);
          else if (this.settings.missionMode === "campaign") this.df.beginCampaign(this.state);
          else this.df.begin(this.state);
        } else if (!this.state.banner || this.state.time >= this.state.banner.until) {
          // keep the launch briefing up through taxi/cat tension chatter
          this.state.banner = { text: this.dfArmText, until: Infinity };
        }
      }
      // Releases come from target-pod clicks (queued in the Dogfight), not
      // from holding the key: the pod is the aiming station.
      this.df.step(FIXED_DT, this.state, inp.fire === true, false);
      this.stepShipRearm(inp.catHold, FIXED_DT);
      // A wheels-down on a friendly deck or runway is a recovery, not the end:
      // the racks and the hull come back full so the pilot can go again.
      if (wasAirborne && isRecoverySurface(this.state)) this.recoveryPending = true;
      if (this.state.airborne || this.state.result) this.recoveryPending = false;
      if (this.recoveryPending && isRecoverySurface(this.state) && this.state.speed <= 20) {
        if (!this.battleActive) this.refillOnRecovery();
        else if (this.state.spec.rotorcraft) this.rearmBattleAircraft();
        this.recoveryPending = false;
      }
      // A sortie that ends on a deck (or the runway) ends *there*: read the
      // boat off the ground the jet is sitting on, so RESTART MISSION — and the
      // next session — launches from the deck it actually landed on, whether
      // the pilot goes on to press REARM & CONTINUE or not.
      if (this.state.result && !this.launchRemembered) {
        this.launchRemembered = true;
        if (this.state.result.kind !== "crash") { this.df.recordRecovery?.(this.state.wire ?? 0); this.rememberRecovery(); }
      }
      wasAirborne = this.state.airborne;
      this.acc -= FIXED_DT;
      steps++;
    }
    this.stepTutorial();
    if (this.battleActive && (this.state.result?.kind === "wire" || this.state.result?.kind === "landing")) this.completeBattleRecovery();
    if (this.state.result) this.endPod();
    // A fatal crash starts the replay instead of cutting straight to the
    // screen; a trap or a bolter still ends the flight the normal way.
    if (this.state.result?.kind === "crash" && !this.crashSeq && !this.battleActive && !this.state.spec.surfaceVessel) this.beginCrashReplay();
    if (this.state.result && this.phase === "flying" && !this.crashSeq && !this.battleActive) {
      this.setPhase("result");
    }
    const alpha = steps > 0 ? THREE.MathUtils.clamp(this.acc / FIXED_DT, 0, 1) : 1;
    this.updateJetPose(alpha);
    this.updateAudio();
    this.updateHud();
  }

  /** Advance the first-flight lesson from the jet's own state. */
  private stepTutorial(): void {
    if (!this.tutorialActive) return;
    this.tutorialStep = advanceTutorialStep(this.tutorialStep, {
      onGround: this.state.onGround,
      gearDown: this.state.gearDown,
      altitudeM: this.state.pos.y,
      kills: this.df.kills,
    });
  }

  /** The coach card, or null when this is not a tutorial sortie. */
  private tutorialSnapshot(): TutorialHud | null {
    return this.tutorialActive ? tutorialHud(this.tutorialStep, this.settings.bindings) : null;
  }

  /** Return a recovered aircraft to launch while retaining the current mission. */
  private completeBattleRecovery(): void {
    const self = this.battle.pilots.find(p => p.id === this.netState.self);
    if (this.battleActive && (!self?.ready || self.hp <= 0)) return;
    this.endPod();
    const landed = this.state;
    this.df.recordRecovery?.(landed.wire ?? 0);
    // Standing on the deck it just caught a wire on, that deck is now home:
    // read it off the surface under the jet and write it into the gamestate, so
    // "rearm & continue" and the pilot's next session both start from here.
    const point = recoveryLaunchPoint(landed, this.spawnCarrier);
    if (point) {
      this.mission = point.kind;
      this.spawnCarrier = clampCarrier(point.carrier);
    } else {
      this.mission = landed.groundKind === "runway" ? "airfield" : "carrier";
    }
    this.rememberLaunch();
    this.state = this.newState(this.mission, this.spawnCarrier);
    const launchBriefing = this.state.banner?.text ?? "READY FOR LAUNCH";
    this.state.time = landed.time;
    this.state.flightTime = landed.flightTime;
    if (this.battleActive) this.rearmBattleAircraft();
    else this.refillOnRecovery();
    // A recovery is a new sortie for the same war: the campaign's stage, its
    // wrecked fortress and its convoy progress all survive the deck cycle,
    // because the operation itself is never rebuilt on this path.
    this.prevPos.copy(this.state.pos);
    this.prevQuat.copy(this.state.quat);
    this.rig.resetFollow();
    this.state.banner = { text: `RECOVERED & REARMED — ${launchBriefing}`, until: this.state.time + 30 };
  }

  /** Stores are local; a valid surface pose lets the host confirm hull repair. */
  private rearmBattleAircraft(): void {
    const self = this.battle.pilots.find(p => p.id === this.netState.self);
    if (!self?.ready || self.hp <= 0) return;
    this.df.refill();
    // Restore the authoritative hull while awaiting repair acknowledgement; this is not a new hit.
    this.df.setBattleHull(self.hp);
    this.state.subsystems = { engineL: 1, engineR: 1, hydraulics: 1, avionics: 1, fuelLeak: false, fuelPct: 100 };
    this.battleRecoveryLife = self.life;
    this.battleRecoveryAt = 0;
    this.pushBanner("RECOVERED & REARMED — READY TO LIFT");
  }

  private recoveryPending = false;
  private shipRearmHold = 0;

  private battleSide(pilot: string): number | null {
    const assigned = this.battle.pilots.find(p => p.id === pilot)?.side;
    if (assigned !== undefined) return assigned;
    // Older hosts do not send stations; retain their original spawn convention.
    const ids = [this.netState.self, ...this.netState.pilots.filter(p => !p.spectator).map(p => p.id)].sort();
    const slot = ids.indexOf(pilot);
    return slot < 0 ? null : slot % 2;
  }

  /** Local stores and host-owned repairs must agree on the friendly station. */
  private canServiceShip(pos: THREE.Vector3, speed: number, pilot = this.netState.self): boolean {
    if (![pos.x, pos.y, pos.z, speed].every(Number.isFinite) || speed > 2 || Math.abs(pos.y) > 3 || groundAt(pos.x, pos.z).kind !== "water") return false;
    let homes = carriers();
    if (this.battleActive) {
      const side = this.battleSide(pilot);
      if (side === null) return false;
      const pair = battleCarrierPair(Math.floor(this.battle.match) || 0, homes.length);
      homes = [homes[pair[side]]];
    }
    return homes.some(c => Math.hypot(c.x - pos.x, c.z - pos.z) <= 1000);
  }

  private stepShipRearm(held: boolean, dt: number): void {
    const st = this.state;
    if (!st.spec.surfaceVessel || st.result) return;
    if (!held || !this.canServiceShip(st.pos, st.speed)) { this.shipRearmHold = 0; return; }
    this.shipRearmHold += dt;
    if (this.shipRearmHold > 0 && this.shipRearmHold < 3) st.banner = { text: `NAVAL SERVICE — HOLD ${keyLabel(this.settings.bindings.cat)} · ${Math.ceil(3 - this.shipRearmHold)}s`, until: st.time + .2 };
    if (this.shipRearmHold >= 3) {
      if (this.battleActive) this.rearmBattleAircraft();
      else this.refillOnRecovery();
      this.shipRearmHold = -Infinity; // release before starting another service
    }
  }

  /**
   * Remember where a sortie ended, if it ended on a deck or the runway. The
   * landing is what makes this a "continue": the pilot relaunches from the same
   * boat, with the same loadout, instead of being thrown back to whichever
   * carrier the mission started from.
   */
  private rememberRecovery(): void {
    const point = recoveryLaunchPoint(this.state, this.spawnCarrier);
    if (!point) return; // died in the air: the deck in the file still stands
    this.mission = point.kind;
    this.spawnCarrier = clampCarrier(point.carrier);
    this.rememberLaunch();
  }

  /**
   * Hand the launch point to the UI to store (localStorage + the cloud
   * gamestate). Idempotent: launching from the boat already on file changes
   * nothing, so the render loop never spams a settings write.
   */
  private rememberLaunch(): void {
    const kind: LaunchKind = this.mission;
    const next = withLaunchPoint(this.settings, kind, this.spawnCarrier);
    if (!next) return;
    // Swap the record and hand it to the UI, which owns where settings live.
    // Not a job for applySettings(): the boat and the launch kind change no
    // graphics, audio or handling, and this runs from inside the sim step.
    this.settings = next;
    for (const fn of this.settingsListeners) fn(next);
  }

  /** Refuel and re-arm on a landing, and say so. */
  private refillOnRecovery(): void {
    this.df.refill();
    this.state.subsystems = { engineL: 1, engineR: 1, hydraulics: 1, avionics: 1, fuelLeak: false, fuelPct: 100 };
    const h = this.df.hud(this.state);
    const msl = h.missilesMax > 0 ? ` · ${h.missiles}/${h.missilesMax} MSL` : "";
    const flr = h.flaresMax > 0 ? ` · ${h.flares}/${h.flaresMax} FLARE` : "";
    this.state.banner = {
      text: `REARMED & REPAIRED — ${h.bombs}/${h.bombsMax} BOMBS${msl}${flr} · HULL ${h.hull}%`,
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

  /**
   * A spectator's camera: locked to the watched target in the normal modes, on
   * the carrier's LSO platform in the LSO view, and free to fly in free cam.
   * Our own airframe is not in the scene at all — there is no jet to show.
   */
  private updateSpectateCamera(dt: number): void {
    const target = this.spectateList[this.spectateIndex];
    this.renderer.jetGroup.visible = false;
    const mouse = this.input.takeMouse();
    this.rig.mouse(mouse.dx, mouse.dy);
    // The LSO view always stands on the deck nearest the action being watched:
    // use the nearest available deck station, including friendly carriers.
    const station = this.spectateList
      .filter(t => t.kind === "LSO" && t.carrier !== undefined)
      .sort((a, b) => a.pos.distanceToSquared(target?.pos ?? this.state.pos) - b.pos.distanceToSquared(target?.pos ?? this.state.pos))[0];
    const look = target?.pos ?? station?.pos ?? this.state.pos;
    const lsoPlatform = station
      ? { x: station.pos.x, y: station.pos.y, z: station.pos.z, lookX: look.x, lookY: look.y, lookZ: look.z }
      : undefined;
    if (target?.aircraft === "destroyer" && this.rig.mode !== "lso" && this.rig.mode !== "free") {
      this.rig.updateShip(this.renderer.camera, target.pos, target.quat, target.quat, dt);
      return;
    }
    this.rig.update(
      this.renderer.camera,
      target?.pos ?? this.state.pos,
      target?.quat ?? this.state.quat,
      target?.speed ?? 0,
      dt,
      false,
      lsoPlatform,
    );
  }

  private updateCamera(dt: number): void {
    if (this.spectating) {
      this.updateSpectateCamera(dt);
      return;
    }
    const st = this.state;
    const alpha = THREE.MathUtils.clamp(this.acc / FIXED_DT, 0, 1);
    const p = this.camP.lerpVectors(this.prevPos, st.pos, alpha);
    const q = this.camQ.copy(this.prevQuat).slerp(st.quat, alpha);
    const mouse = this.input.takeMouse();
    if (st.spec.surfaceVessel && (this.pod || this.rig.mode === "cockpit")) {
      st.turretYaw = ((st.turretYaw ?? 0) + mouse.dx * .0018 + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      st.turretPitch = THREE.MathUtils.clamp((st.turretPitch ?? .2) - mouse.dy * .0018, .025, 1.4);
    } else this.rig.mouse(mouse.dx, mouse.dy);
    // menu attract + crash replay get the slow orbit; in flight the third
    // camera is locked behind the jet
    const cinematic =
      this.phase === "menu" ||
      this.crashSeq !== null ||
      (this.phase === "result" && st.result?.kind === "crash");
    if (st.spec.surfaceVessel) this.rig.updateShip(this.renderer.camera, p, q, shipGunQuaternion(st, this.poseQ), dt, cinematic);
    else this.rig.update(this.renderer.camera, p, q, st.speed, dt, cinematic);
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
    const muted = this.phase !== "flying";
    // A spectator hears the room rather than a jet of their own: their engine
    // bed is silent and the wingmen passing by carry the whole picture.
    if (this.spectating) this.audio.update(0, 0, 0, false, true, this.weather.turbulence, 1);
    else this.audio.update(st.rpm, st.abLevel, st.speed, st.stalled && !st.onGround, muted, this.weather.turbulence, st.gLoad);

    // --- event layers ---
    // Catapult: the steam and the shove, the moment the shuttle fires.
    const cat = st.catPhase;
    if (cat === "firing" && this.lastCatPhase !== "firing") this.audio.catapult();
    this.lastCatPhase = cat;
    if (!muted) {
      if (st.gearDown !== this.lastGear) {
        this.audio.servo("gear");
        this.lastGear = st.gearDown;
      }
      if (st.flapsDown !== this.lastFlaps) {
        this.audio.servo("flap");
        this.lastFlaps = st.flapsDown;
      }
    }
    // The stall horn is a state, not an event: it stays on while the wing is
    // not flying and stops the instant it is.
    this.audio.stall(!muted && st.stalled && !st.onGround);

    if (!muted) {
      const now = performance.now();
      const incoming = this.hud.dfIncoming;
      if (incoming && now - this.lastWarningAt > 650) {
        this.audio.warning("missile");
        this.lastWarningAt = now;
      } else if (!incoming && this.df.threatT > 0 && now - this.lastWarningAt > 900) {
        this.audio.warning("guns");
        this.lastWarningAt = now;
      }
    }

    // A trap or a runway landing gets its own sound even though the phase has
    // already flipped to the result screen by the time this runs.
    const landed = st.result?.kind;
    if (landed && landed !== this.lastResultKind && (landed === "wire" || landed === "landing")) {
      this.audio.touchdown(landed, st.speed);
    }
    this.lastResultKind = landed ?? null;

    // Doppler, as heard: a wingman passing close gets louder and brighter, and
    // the pitch follows how fast the gap is closing.
    const near = this.nearestRemotePass();
    if (near) this.audio.flyby(near.rangeM, near.closure);
    else this.audio.flyby(1e6, 0);
    // Thunder arrives a few seconds after the flash, because it has to travel.
    const km = this.renderer.takeThunder();
    if (km > 0) this.audio.thunder(km);
  }

  /** The nearest other aircraft, and how fast its gap to us is closing. */
  private nearestRemotePass(): { rangeM: number; closure: number } | null {
    const from = this.viewerPos();
    let best: { rangeM: number; closure: number } | null = null;
    for (const id of this.remoteFleet.liveIds()) {
      const p = this.remoteFleet.pilotState(id);
      if (!p) continue;
      const rangeM = from.distanceTo(p.pos);
      if (best && rangeM >= best.rangeM) continue;
      const to = p.pos.clone().sub(from);
      best = { rangeM, closure: to.lengthSq() > 1 ? -p.vel.dot(to.normalize()) : 0 };
    }
    return best;
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
    // A spectator's HUD is the watched aircraft's HUD: swap the airframe under
    // the builder and every readout (including the radar picture and the
    // objective bearing) comes off the jet the camera is riding.
    const own = this.state;
    const watching = this.spectating ? this.spectateViewer : null;
    if (watching) this.state = watching;
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
      rotorcraft: st.spec.rotorcraft === true,
      surfaceVessel: st.spec.surfaceVessel === true,
      turretBearingDeg: ((st.headingDeg + (st.turretYaw ?? 0) * 180 / Math.PI) + 360) % 360,
      turretElevationDeg: (st.turretPitch ?? .2) * 180 / Math.PI,
      shipControls: st.spec.surfaceVessel
        ? `${keyLabel(this.settings.bindings.pitchUp)}/${keyLabel(this.settings.bindings.pitchDown)} ELEV · ${keyLabel(this.settings.bindings.rollLeft)}/${keyLabel(this.settings.bindings.rollRight)} TRAIN · ${keyLabel(this.settings.bindings.fire)} GUN · ${keyLabel(this.settings.bindings.missile)} VLS · ${keyLabel(this.settings.bindings.bomb)} DIRECTOR`
        : undefined,
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
        headingDeg: c.headingDeg,
        lengthM: c.deckLength,
      })),
      fieldX: af.centerX,
      fieldZ: af.centerZ,
      fieldHeadingDeg: af.headingDeg,
      fieldLengthM: af.runwayLength,
      worldExtent: EXTENT,
      localHour: this.dayHours,
      dayPhase: this.dayPhase,
      aircraftName: st.spec.name,
      pod: this.pod,
      bigMap: this.bigMap,
      remotes: this.remoteFleet.contacts(st.pos.x, st.pos.y, st.pos.z),
      netStatus: this.netState.status,
      netRoom: this.netState.room,
      netHost: this.netState.host,
      netPilots: this.netState.pilots.length,
      battle: this.battleActive ? this.battle : undefined,
      battleSelf: this.netState.self,
      operation: this.df.operationHud?.(st),
      weather: this.weatherMode,
      weatherLabel: this.weather.label,
      spectating: watching !== null,
      spectateKind: watching ? (this.spectateList[this.spectateIndex]?.kind ?? "") : "",
      spectateTarget: watching ? (this.spectateList[this.spectateIndex]?.label ?? "") : "",
      spectateIndex: this.spectateList.length ? this.spectateIndex + 1 : 0,
      spectateCount: this.spectateList.length,
      pings: this.pingHud(),
      subsystems: st.subsystems,
      tutorial: this.tutorialSnapshot(),
      lsoCall: st.lsoCall ?? null,
      lsoGrade: st.lsoGrade ?? null,
      ...this.dfHud(),
    };
    if (watching) {
      const target = this.spectateList[this.spectateIndex];
      this.hud = {
        ...this.hud,
        aircraftName: `SPECTATING ${target?.kind ?? "ROOM"} · ${target?.label ?? ""}`.trim(),
        // Stores and flares belong to the pilot flying, not to the watcher.
        dfBombs: 0, dfBombsMax: 0, dfBombsAway: 0, dfBombsTracking: 0, dfBombTracks: [],
        dfMissiles: 0, dfMissilesMax: 0, dfFlares: 0, dfFlaresMax: 0,
        dfDesignated: null, dfReleased: null, dfLanded: null,
        subsystems: undefined, lsoCall: null, lsoGrade: null,
      };
      this.state = own;
    } else {
      this.state = own;
    }
    // React re-renders at most ~20 Hz; the pitch-ladder canvas redraws
    // every frame from the latest snapshot regardless.
    const nowMs = performance.now();
    if (nowMs - this.lastHudNotify > 50) {
      this.lastHudNotify = nowMs;
      for (const fn of this.hudListeners) fn(this.hud);
    }
  }

  /** Room pings, with range, bearing and age, ready for the HUD to draw. */
  private pingHud(): TacticalPingHud[] {
    if (this.pings.length === 0) return [];
    const now = performance.now();
    return this.pings.map(p => ({
      id: p.id, kind: p.kind, from: p.from, label: p.label,
      x: p.x, y: p.y, z: p.z, km: p.km, brgDeg: p.brgDeg,
      age: (now - p.at) / 1000,
    }));
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
    | "dfConfirmation"
    | "dfDamageT"
    | "dfSpots"
    | "dfBombs"
    | "dfBombsMax"
    | "dfBombsAway"
    | "dfMissiles"
    | "dfMissilesMax"
    | "dfFlares"
    | "dfFlaresMax"
    | "dfIncoming"
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
      dfHull: st.spec.surfaceVessel && !this.battleActive ? Math.round(h.hull / st.spec.hull * 100) : h.hull,
      dfKills: h.kills,
      dfWave: h.wave,
      dfBandits: h.bandits,
      dfNearestKm: h.nearestKm,
      dfNearestBrgDeg: (h.nearestBrgDeg + 360) % 360,
      enemyMarkers: h.markers,
      dfThreat: h.threat || (this.battleActive && this.remoteWeapons.incoming),
      gunFiring: h.firing,
      dfHitT: h.hitT,
      dfConfirmation: h.confirmation,
      dfDamageT: h.damageT,
      dfSpots: h.spots,
      dfBombs: h.bombs,
      dfBombsMax: h.bombsMax,
      dfBombsAway: h.bombsAway,
      dfMissiles: h.missiles,
      dfMissilesMax: h.missilesMax,
      dfFlares: h.flares,
      dfFlaresMax: h.flaresMax,
      dfIncoming: h.incoming ?? this.remoteWeapons.warning ?? null,
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
