// User settings + keybindings, persisted to localStorage.

import type { WorldId } from "./sim/world";

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
  | "fire";

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
  fire: "Fire guns (dogfight)",
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
};

export type DaylightMode = "live" | "fixed" | "cycle";

export type GameMode = "cruise" | "dogfight";

export const DAYLIGHT_LABELS: Record<DaylightMode, string> = {
  live: "Real time (Hawaii)",
  fixed: "Fixed time of day",
  cycle: "Fast cycle",
};

export const GAME_MODE_LABELS: Record<GameMode, string> = {
  cruise: "Cruise — free flight",
  dogfight: "Dogfight — AI bandits",
};

/** Minutes of real time for one full day in "cycle" mode (4 minutes). */
export const CYCLE_MINUTES_PER_DAY = 4;

export interface Settings {
  volume: number; // 0..1
  sensitivity: number; // 0.4..1.5 — control input ramp rate multiplier
  quality: Quality;
  world: WorldId; // procedural islands or real Mapbox terrain
  gameMode: GameMode; // free flight or AI dogfight
  daylight: DaylightMode;
  /** Local clock hour 0..24, used by "fixed" mode. */
  timeOfDay: number;
  minimap: boolean;
  bindings: Record<Action, string>;
}

export const QUALITY_SEGMENTS: Record<Quality, number> = {
  low: 144,
  medium: 216,
  high: 320,
};

const KEY = "f14sim.settings.v1";

export function defaultSettings(): Settings {
  return {
    volume: 0.7,
    sensitivity: 1,
    quality: "medium",
    world: "archipelago",
    gameMode: "cruise",
    daylight: "live",
    timeOfDay: 9,
    minimap: true,
    bindings: { ...DEFAULT_BINDINGS },
  };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const base = defaultSettings();
    return {
      volume: typeof parsed.volume === "number" ? clampNum(parsed.volume, 0, 1) : base.volume,
      sensitivity:
        typeof parsed.sensitivity === "number" ? clampNum(parsed.sensitivity, 0.4, 1.5) : base.sensitivity,
      quality:
        parsed.quality === "low" || parsed.quality === "medium" || parsed.quality === "high"
          ? parsed.quality
          : base.quality,
      world:
        parsed.world === "archipelago" || parsed.world === "kauai" ? parsed.world : base.world,
      gameMode: parsed.gameMode === "dogfight" || parsed.gameMode === "cruise" ? parsed.gameMode : base.gameMode,
      daylight:
        parsed.daylight === "live" || parsed.daylight === "fixed" || parsed.daylight === "cycle"
          ? parsed.daylight
          : base.daylight,
      timeOfDay:
        typeof parsed.timeOfDay === "number" ? clampNum(parsed.timeOfDay, 0, 24) : base.timeOfDay,
      minimap: typeof parsed.minimap === "boolean" ? parsed.minimap : base.minimap,
      bindings: { ...base.bindings, ...(parsed.bindings ?? {}) },
    };
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
