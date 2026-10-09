// User settings + keybindings, persisted to localStorage.

import { DEFAULT_AIRCRAFT, type AircraftId } from "./sim/aircraft";

export type Quality = "low" | "medium" | "high";

export type Action =
  | "pitchUp"
  | "pitchDown"
  | "rollLeft"
  | "rollRight"
  | "yawLeft"
  | "yawRight"
  | "throttleUp"
  | "throttleDown"
  | "brake"
  | "gear"
  | "flaps"
  | "speedbrake"
  | "ab"
  | "cat"
  | "camera"
  | "pause"
  | "trimUp"
  | "trimDown"
  | "fire"
  | "bomb"
  | "missile"
  | "settings"
  | "map";

export const ACTION_LABELS: Record<Action, string> = {
  pitchUp: "Pitch up (nose up)",
  pitchDown: "Pitch down (nose down)",
  rollLeft: "Roll left",
  rollRight: "Roll right",
  yawLeft: "Yaw left (rudder)",
  yawRight: "Yaw right (rudder)",
  throttleUp: "Throttle up",
  throttleDown: "Throttle down",
  brake: "Wheel brakes",
  gear: "Landing gear",
  flaps: "Flaps",
  speedbrake: "Speed brake",
  ab: "Afterburner (toggle)",
  cat: "Catapult (hold)",
  camera: "Cycle camera",
  pause: "Pause",
  trimUp: "Trim nose up",
  trimDown: "Trim nose down",
  fire: "Fire guns",
  bomb: "Bombs / target pod (click to designate)",
  missile: "Fire missile (nearest target)",
  settings: "Settings (in flight)",
  map: "Tactical map (big / small)",
};

export const DEFAULT_BINDINGS: Record<Action, string> = {
  pitchUp: "ArrowUp",
  pitchDown: "ArrowDown",
  rollLeft: "ArrowLeft",
  rollRight: "ArrowRight",
  yawLeft: "KeyA",
  yawRight: "KeyD",
  throttleUp: "KeyW",
  throttleDown: "KeyS",
  brake: "KeyB",
  gear: "KeyG",
  flaps: "KeyF",
  speedbrake: "KeyX",
  ab: "ShiftLeft",
  cat: "Space",
  camera: "KeyC",
  pause: "Escape",
  trimUp: "KeyT",
  trimDown: "KeyV",
  fire: "KeyQ",
  bomb: "KeyR",
  missile: "KeyE",
  settings: "KeyO",
  map: "KeyM",
};

export type DaylightMode = "live" | "fixed" | "cycle";

export type MissionMode = "cruise" | "dogfight" | "strike" | "versus";

export const DAYLIGHT_LABELS: Record<DaylightMode, string> = {
  live: "Real time (Hawaii)",
  fixed: "Fixed time of day",
  cycle: "Fast cycle",
};

export const MISSION_MODE_LABELS: Record<MissionMode, string> = {
  versus: "Head-to-head — fight other pilots in your room",
  cruise: "Cruise — free flight",
  dogfight: "Air combat — aggressor bandits fly from the opposing carrier",
  strike: "Strike — practice runs against land and sea targets",
};

/** Short chips for the picker: the profile name, without the explanation. */
export const MISSION_MODE_CHIPS: Record<MissionMode, string> = {
  versus: "HEAD-TO-HEAD",
  cruise: "CRUISE",
  dogfight: "AGGRESSOR",
  strike: "STRIKE",
};

/** Minutes of real time for one full day in "cycle" mode (4 minutes). */
export const CYCLE_MINUTES_PER_DAY = 4;

export interface Settings {
  volume: number; // 0..1
  sensitivity: number; // 0.4..3 — control input ramp rate multiplier
  quality: Quality;
  aircraft: AircraftId; // the type the player flies
  missionMode: MissionMode; // free flight or an aggressor profile
  daylight: DaylightMode;
  /** Local clock hour 0..24, used by "fixed" mode. */
  timeOfDay: number;
  minimap: boolean;
  /** Green angle ladder + flight-path marker over the middle of the view. */
  hudLadder: boolean;
  /** Green gunsight cross, its tracer ladder and the range readout. */
  hudGunCross: boolean;
  bindings: Record<Action, string>;
  /** Multiplayer callsign, shown to the rest of the flight. */
  callsign: string;
  /** Last room code used, so rejoining does not mean retyping it. Blank until
   *  a pilot types one — the field is never pre-filled with a guess. */
  room: string;
}

// Terrain grid resolution. The world is a long chain (60 km square), so these
// are the segment counts that keep a cell between ~150 m and ~300 m — enough to
// shape islands without sampling a quarter of a million vertices at startup.
export const QUALITY_SEGMENTS: Record<Quality, number> = {
  low: 192,
  medium: 288,
  high: 384,
};

const KEY = "f14sim.settings.v1";

export function defaultSettings(): Settings {
  return {
    volume: 0.7,
    sensitivity: 1.35,
    quality: "medium",
    aircraft: DEFAULT_AIRCRAFT,
    missionMode: "cruise",
    daylight: "fixed",
    timeOfDay: 9,
    minimap: true,
    hudLadder: true,
    hudGunCross: true,
    bindings: { ...DEFAULT_BINDINGS },
    callsign: "",
    room: "",
  };
}

/** A stable default callsign, e.g. "PILOT-4821", for a first-time pilot. */
export function defaultCallsign(): string {
  return `PILOT-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** A room code that is easy to read out loud — no look-alike glyphs, no
 *  forced prefix: a room is any word or code the host wants. */
export function suggestRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let tail = "";
  for (let i = 0; i < 5; i++) tail += alphabet[Math.floor(Math.random() * alphabet.length)];
  return tail;
}

/** The callsign to show: the saved one, or a fresh default. */
export function callsignOf(s: Settings): string {
  return s.callsign.trim() || defaultCallsign();
}

/** Uppercase, alphanumeric room code — the same shape the net layer uses. */
export function roomCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // First run: mint an identity and keep it, so the callsign a pilot sees in
      // the lobby is the same one they see next launch.
      const fresh = defaultSettings();
      fresh.callsign = defaultCallsign();
      saveSettings(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const base = defaultSettings();
    const next: Settings = {
      volume: typeof parsed.volume === "number" ? clampNum(parsed.volume, 0, 1) : base.volume,
      sensitivity:
        typeof parsed.sensitivity === "number" ? clampNum(parsed.sensitivity, 0.4, 3) : base.sensitivity,
      quality:
        parsed.quality === "low" || parsed.quality === "medium" || parsed.quality === "high"
          ? parsed.quality
          : base.quality,
      aircraft:
        parsed.aircraft === "tomcat" || parsed.aircraft === "hornet" || parsed.aircraft === "intruder"
          ? parsed.aircraft
          : base.aircraft,
      missionMode:
        parsed.missionMode === "dogfight" || parsed.missionMode === "cruise" || parsed.missionMode === "strike" || parsed.missionMode === "versus"
          ? parsed.missionMode
          : base.missionMode,
      daylight:
        parsed.daylight === "live" || parsed.daylight === "fixed" || parsed.daylight === "cycle"
          ? parsed.daylight
          : base.daylight,
      timeOfDay:
        typeof parsed.timeOfDay === "number" ? clampNum(parsed.timeOfDay, 0, 24) : base.timeOfDay,
      minimap: typeof parsed.minimap === "boolean" ? parsed.minimap : base.minimap,
      hudLadder: typeof parsed.hudLadder === "boolean" ? parsed.hudLadder : base.hudLadder,
      hudGunCross: typeof parsed.hudGunCross === "boolean" ? parsed.hudGunCross : base.hudGunCross,
      bindings: { ...base.bindings, ...(parsed.bindings ?? {}) },
      callsign: typeof parsed.callsign === "string" ? parsed.callsign.slice(0, 12) : base.callsign,
      room: typeof parsed.room === "string" ? roomCode(parsed.room) : base.room,
    };
    // Settings saved by an older build have no callsign; mint one and write it
    // back once, so a guest identity is stable from then on. The room code is
    // deliberately left blank — a pilot fills it in when they want a room.
    if (!next.callsign) {
      next.callsign = defaultCallsign();
      saveSettings(next);
    }
    return next;
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable — settings stay in memory */
  }
}

function clampNum(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Pretty key label: "ArrowUp" → "↑", "KeyW" → "W", "ShiftLeft" → "LShift" */
export function keyLabel(code: string): string {
  if (code.startsWith("Arrow")) {
    const m: Record<string, string> = { Up: "↑", Down: "↓", Left: "←", Right: "→" };
    return m[code.slice(5)] ?? code;
  }
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code === "ShiftLeft") return "L Shift";
  if (code === "ShiftRight") return "R Shift";
  if (code === "Space") return "Space";
  if (code === "Escape") return "Esc";
  if (code === "Minus") return "-";
  if (code === "Equal") return "=";
  return code;
}
