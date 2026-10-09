// Flight orchestrator: state machine, fixed-timestep sim, render loop, HUD feed.

import * as THREE from "three";
import { WorldRenderer } from "../render/renderer";
import { animateJet } from "../render/rig";
import { CameraRig, type CameraMode } from "../render/cameras";
import { AudioEngine } from "../audio/engineSound";
import { InputManager } from "../input/input";
import {
  spawnAircraft,
  stepAircraft,
  type AircraftState,
  type MissionKind,
} from "../sim/flight";
import {
  EXTENT,
  KAUAI,
  activeWorldDef,
  airfield,
  carriers,
  groundAt,
  makeKauaiSampler,
  nearestCarrier,
  resetWorld,
  setWorld,
  terrainHeight,
  type WorldId,
} from "../sim/world";
import { KAUAI_REGION, loadHeightfield, loadSatellite } from "../sim/mapbox";
import type { TerrainPaint, TerrainTextureRef } from "../render/scene";
import { CYCLE_MINUTES_PER_DAY, type Settings } from "../settings";
import { dayPhase, sunPosition, sunVector, type DayPhase } from "../sim/sun";
import { Dogfight } from "../sim/dogfight";

export type Phase = "menu" | "flying" | "paused" | "result";

export interface WorldState {
  status: "ready" | "loading" | "error";
  id: WorldId;
  error?: string;
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
  gear: boolean;
  flaps: boolean;
  speedbrake: boolean;
  trim: number;
  sweepDeg: number;
  stalled: boolean;
  onGround: boolean;
  catPhase: string;
  catProgress: number;
  pitchDeg: number;
  rollDeg: number;
  cameraMode: CameraMode;
  wire?: number;
  resultTitle?: string;
  resultDetail?: string;
  resultKind?: "wire" | "bolter" | "crash";
  banner?: string;
  flightTime: number;
  distCarrierKm: number;
  bearingCarrierDeg: number;
  carrierName: string;
  distFieldKm: number;
  bearingFieldDeg: number;
  worldLabel: string;
  worldAttribution: string | null;
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
  // dogfight mode
  dfActive: boolean;
  dfHull: number;
  dfKills: number;
  dfWave: number;
  dfBandits: number;
  dfNearestKm: number;
  dfNearestBrgDeg: number;
  enemyMarkers: Array<{ x: number; z: number }>;
}

const FIXED_DT = 1 / 120;

/** Hawaii standard time has no daylight saving, so the offset is fixed. */
const HAWAII_TZ = -10;

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
    throttlePct: 0, rpmPct: 0, ab: 0, gear: true, flaps: false, speedbrake: false,
    trim: 0.5, sweepDeg: 20, stalled: false, onGround: true, catPhase: "ready",
    catProgress: 0, pitchDeg: 0, rollDeg: 0, cameraMode: "chase", flightTime: 0,
    distCarrierKm: 0, bearingCarrierDeg: 0, carrierName: "—", distFieldKm: 0,
    bearingFieldDeg: 0, worldLabel: "Procedural islands", worldAttribution: null,
    radarAltFt: 0,
    playerX: 0, playerZ: 0, playerHeadingDeg: 0, carrierMarkers: [],
    fieldX: 0, fieldZ: 0, worldExtent: 12000,
    localHour: 12, dayPhase: "day",
    dfActive: false, dfHull: 100, dfKills: 0, dfWave: 1, dfBandits: 0,
    dfNearestKm: 0, dfNearestBrgDeg: 0, enemyMarkers: [],
  };
}

export class Game {
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
  private hud: HudSnapshot = defaultHud();
  private hudListeners = new Set<(h: HudSnapshot) => void>();
  private phaseListeners = new Set<(p: Phase) => void>();
  private lastHudNotify = 0;
  private worldId: WorldId = "archipelago";
  private worldState: WorldState = { status: "ready", id: "archipelago" };
  private worldListeners = new Set<(s: WorldState) => void>();
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

  constructor(canvas: HTMLCanvasElement, settings: Settings) {
    this.settings = settings;
    this.dayHours = this.resolveDayHours(settings);
    this.renderer = new WorldRenderer(canvas, settings.quality, {
      height: terrainHeight,
      style: "island",
      texture: null,
    });
    this.renderer.applyQuality(settings.quality);
    this.input = new InputManager(settings);
    // honour the persisted volume from the first frame — applySettings only
    // runs when the user touches a setting, so the constructor must seed it.
    this.audio.setVolume(settings.volume);
    this.df = new Dogfight(this.renderer.scene);
    this.input.attach(canvas);
    window.addEventListener("resize", this.onResize);
    this.state = spawnAircraft("carrier");
    this.updateJetPose(1);
    this.updateHud();
    this.raf = requestAnimationFrame(this.loop);
  }

  applySettings(s: Settings): void {
    const qualityChanged = s.quality !== this.settings.quality;
    const daylightChanged =
      s.daylight !== this.settings.daylight || s.timeOfDay !== this.settings.timeOfDay;
    const modeChanged = s.gameMode !== this.settings.gameMode;
    this.settings = s;
    this.input.applySettings(s);
    this.audio.setVolume(s.volume);
    if (qualityChanged) this.renderer.applyQuality(s.quality);
    if (daylightChanged) this.dayHours = this.resolveDayHours(s);
    // toggling the mode mid-flight starts or clears the fight immediately
    if (modeChanged) {
      if (s.gameMode === "dogfight" && this.phase === "flying") this.df.begin(this.state);
      else this.df.clear();
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

  private beginMission(mission: MissionKind, carrierIndex: number): void {
    this.mission = mission;
    this.state = spawnAircraft(mission, carrierIndex);
    if (this.settings.gameMode === "dogfight") this.df.begin(this.state);
    else this.df.clear();
    this.prevPos.copy(this.state.pos);
    this.prevQuat.copy(this.state.quat);
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

  quitToMenu(): void {
    this.df.clear();
    this.state = spawnAircraft(this.mission, this.spawnCarrier);
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

  subscribeHud(fn: (h: HudSnapshot) => void): () => void {
    this.hudListeners.add(fn);
    fn(this.hud);
    return () => {
      this.hudListeners.delete(fn);
    };
  }

  subscribeWorld(fn: (s: WorldState) => void): () => void {
    this.worldListeners.add(fn);
    fn(this.worldState);
    return () => {
      this.worldListeners.delete(fn);
    };
  }

  get worldStateSnapshot(): WorldState {
    return this.worldState;
  }

  /**
   * Switch worlds: "archipelago" is instant; "kauai" fetches Mapbox terrain
   * (+ satellite imagery) with a graceful fall back to the islands on failure.
   * Resolves with null on success or an error message for the UI.
   */
  async setWorldKind(kind: WorldId): Promise<string | null> {
    if (kind === this.worldId && this.worldState.status === "ready") return null;
    if (kind === "archipelago") {
      resetWorld();
      this.worldId = "archipelago";
      this.renderer.applyWorld(this.paint(null));
      this.setWorldState({ status: "ready", id: "archipelago" });
      this.afterWorldChange();
      return null;
    }

    this.setWorldState({ status: "loading", id: kind });
    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) throw new Error("no Mapbox token configured");
      const hf = await loadHeightfield(KAUAI_REGION, token);
      setWorld(KAUAI, makeKauaiSampler(hf));
      let texture: TerrainTextureRef | null = null;
      try {
        texture = await loadSatellite(KAUAI_REGION, token);
      } catch {
        texture = null; // imagery is optional; terrain + biome colours still work
      }
      this.worldId = "kauai";
      this.renderer.applyWorld(this.paint(texture));
      this.setWorldState({ status: "ready", id: "kauai" });
      this.afterWorldChange();
      return null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      resetWorld();
      this.worldId = "archipelago";
      this.renderer.applyWorld(this.paint(null));
      this.setWorldState({
        status: "error",
        id: "archipelago",
        error: `Couldn't load Mapbox terrain (${msg}) — staying on the procedural islands.`,
      });
      this.afterWorldChange();
      return msg;
    }
  }

  private paint(texture: TerrainTextureRef | null): TerrainPaint {
    const world = activeWorldDef();
    return { height: terrainHeight, style: world.id === "kauai" ? "tropical" : "island", texture };
  }

  private setWorldState(s: WorldState): void {
    this.worldState = s;
    for (const fn of this.worldListeners) fn(s);
  }

  /** Snap the parked jet back onto the (possibly new) world's surfaces. */
  private afterWorldChange(): void {
    this.state = spawnAircraft(this.mission, this.spawnCarrier);
    this.prevPos.copy(this.state.pos);
    this.prevQuat.copy(this.state.quat);
    this.updateJetPose(1);
    this.updateHud();
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.df.dispose();
    window.removeEventListener("resize", this.onResize);
    this.input.detach();
    this.audio.dispose();
    this.renderer.renderer.dispose();
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
      this.handleEdges();
      // An edge action may have paused the game; do not advance that frame.
      if (this.phase === "flying") this.stepSim(frameDt);
    } else if (this.phase === "paused") {
      if (this.input.take("pause")) this.resume();
    } else if (this.phase === "result") {
      this.input.take("pause"); // swallow esc while result shows
      this.updateJetPose(1);
      this.updateAudio();
    }

    this.advanceDaylight(frameDt);
    this.updateCamera(frameDt);
    this.updateSun();
    this.renderer.render();
  };

  private handleEdges(): void {
    if (this.input.take("pause")) {
      this.pause();
      return;
    }
    if (this.input.take("camera")) this.rig.cycle();
    if (this.input.take("gear")) {
      if (this.state.onGround && this.state.speed < 1) {
        this.pushBanner("GEAR LOCKED — cannot retract while parked");
      } else {
        this.state.gearDown = !this.state.gearDown;
      }
    }
    if (this.input.take("flaps")) this.state.flapsDown = !this.state.flapsDown;
    if (this.input.take("speedbrake")) this.state.speedbrake = !this.state.speedbrake;
    if (this.input.take("ab")) this.state.abOn = !this.state.abOn;
    this.input.take("cat"); // sim uses catHold from sampled input
  }

  private stepSim(frameDt: number): void {
    this.acc = Math.min(this.acc + frameDt, 0.25);
    let steps = 0;
    while (this.acc >= FIXED_DT && steps < 8) {
      // Advance control ramps at the same fixed rate as the flight model.
      // Sampling once per rendered frame changes handling with display FPS.
      const inp = this.input.sample(FIXED_DT);
      this.inputPitch = inp.pitch;
      this.inputRoll = inp.roll;
      this.inputYaw = inp.yaw;
      this.prevPos.copy(this.state.pos);
      this.prevQuat.copy(this.state.quat);
      stepAircraft(this.state, inp, FIXED_DT);
      this.df.step(FIXED_DT, this.state, inp.fire === true);
      this.acc -= FIXED_DT;
      steps++;
    }
    if (this.state.result && this.phase === "flying") {
      this.setPhase("result");
    }
    const alpha = steps > 0 ? THREE.MathUtils.clamp(this.acc / FIXED_DT, 0, 1) : 1;
    this.updateJetPose(alpha);
    this.updateAudio();
    this.updateHud();
  }

  private updateJetPose(alpha: number): void {
    const st = this.state;
    const g = this.renderer.jetGroup;
    // position: extrapolate along velocity for sub-step smoothness
    g.position.lerpVectors(this.prevPos, st.pos, alpha);
    const q = this.prevQuat.clone().slerp(st.quat, alpha);
    g.quaternion.copy(q);
    // control surfaces follow current inputs
    g.userData.elevator = -this.inputPitch * 0.6;
    g.userData.aileron = this.inputRoll * 0.5;
    g.userData.rudder = this.inputYaw * 0.5;
    animateJet(this.renderer.jet, st, alpha, 1 / 60);
  }

  private updateCamera(dt: number): void {
    const st = this.state;
    const alpha = THREE.MathUtils.clamp(this.acc / FIXED_DT, 0, 1);
    const p = new THREE.Vector3().lerpVectors(this.prevPos, st.pos, alpha);
    const q = this.prevQuat.clone().slerp(st.quat, alpha);
    const mouse = this.input.takeMouse();
    this.rig.mouse(mouse.dx, mouse.dy);
    // menu attract + crash replay get the slow orbit; in flight the third
    // camera is locked behind the jet
    const cinematic = this.phase === "menu" || (this.phase === "result" && st.result?.kind === "crash");
    this.rig.update(this.renderer.camera, p, q, st.speed, dt, cinematic);
    // hide airframe in cockpit view
    this.renderer.jetGroup.visible = this.rig.mode !== "cockpit" || this.phase === "menu";
    // menu attract mode: slow orbit
    if (this.phase === "menu") {
      this.rig.mode = "action";
    }
    if (this.phase === "result" && st.result?.kind === "crash") {
      this.rig.mode = "action";
    }
  }

  private updateAudio(): void {
    const st = this.state;
    this.audio.update(st.rpm, st.abLevel, st.speed, st.stalled && !st.onGround, this.phase !== "flying");
  }

  /**
   * Position the sun from the clock and hand the renderer everything it needs
   * to light, fog and tint the world. The sun's real bearing is used when the
   * active world has a geographic position (Kauai); the procedural islands use
   * the same solar path so the cycle still reads correctly there.
   */
  private updateSun(): void {
    const p = this.state.pos;
    // Both worlds share Kauai's latitude, so the sun path is consistent
    // whichever terrain is loaded.
    const sun = sunPosition(this.dayHours, KAUAI_REGION.centerLat, KAUAI_REGION.centerLon, {
      dayOfYear: dayOfYearNow(),
      tzOffsetHours: HAWAII_TZ,
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
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(st.quat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(st.quat);
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
      gear: st.gearDown && st.gearT > 0.95,
      flaps: st.flapsDown && st.flapT > 0.95,
      speedbrake: st.speedbrake && st.sbT > 0.95,
      trim: st.trim,
      sweepDeg: Math.round(20 + 48 * st.sweepT),
      stalled: st.stalled,
      onGround: st.onGround,
      catPhase: st.catPhase,
      catProgress: st.catProgress,
      pitchDeg,
      rollDeg: bankFromHorizon,
      cameraMode: this.rig.mode,
      wire: st.wire,
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
      worldAttribution: activeWorldDef().attribution,
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
      ...this.dfHud(),
    };
    // React re-renders at most ~20 Hz; the pitch-ladder canvas redraws
    // every frame from the latest snapshot regardless.
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
    "dfActive" | "dfHull" | "dfKills" | "dfWave" | "dfBandits" | "dfNearestKm" | "dfNearestBrgDeg" | "enemyMarkers"
  > {
    const h = this.df.hud(this.state);
    return {
      dfActive: h.active,
      dfHull: h.hull,
      dfKills: h.kills,
      dfWave: h.wave,
      dfBandits: h.bandits,
      dfNearestKm: h.nearestKm,
      dfNearestBrgDeg: (h.nearestBrgDeg + 360) % 360,
      enemyMarkers: h.markers,
    };
  }
}
