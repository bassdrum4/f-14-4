// Weather: one theatre state, shared by the flight model, the carrier decks,
// the sky and the sea.
//
// A preset is a *look* and a *feel* at once. The flight model reads the wind,
// the gusts and the turbulence; the world reads the sea state (heave, pitch,
// roll) and therefore so do the carrier decks; the renderer reads cloud cover,
// rain, lightning and the visibility scaling. Because it is all derived from
// the mode plus the world seed, every pilot in a room feels the same squall
// without a single byte of it crossing the wire.

import type { WeatherMode } from "../settings";

export interface WeatherPreset {
  mode: WeatherMode;
  label: string;
  /** Steady wind speed (m/s) at flight level, and how far gusts push it. */
  windSpeed: number;
  gust: number;
  /** s of the gust cycle, so a squall breathes instead of being constant. */
  gustPeriod: number;
  /** 0..1: random load factor the airframe shakes under in the air. */
  turbulence: number;
  /** Sea state handed to the fleet: heave amplitude, deck pitch/roll, period. */
  seaHeave: number;
  seaPitchDeg: number;
  seaRollDeg: number;
  seaPeriod: number;
  /** 0..1 cloud cover, and how much it dims the sun. */
  cloudCover: number;
  sunScale: number;
  /** Rain density (0 = none) and the fog range multiplier it comes with. */
  rain: number;
  fogScale: number;
  /** Strikes per minute across the theatre; 0 = no thunderstorm. */
  lightning: number;
  /** What the brief tells the pilot before they launch. */
  brief: string;
}

export const WEATHER: Record<WeatherMode, WeatherPreset> = {
  clear: {
    mode: "clear",
    label: "CLEAR",
    windSpeed: 3,
    gust: 1.4,
    gustPeriod: 26,
    turbulence: 0.06,
    seaHeave: 0,
    seaPitchDeg: 0,
    seaRollDeg: 0,
    seaPeriod: 12,
    cloudCover: 0.18,
    sunScale: 1,
    rain: 0,
    fogScale: 1,
    lightning: 0,
    brief: "Clear skies, calm sea. Ideal for a first launch and a first trap.",
  },
  overcast: {
    mode: "overcast",
    label: "OVERCAST",
    windSpeed: 9,
    gust: 3.4,
    gustPeriod: 18,
    turbulence: 0.22,
    seaHeave: 0.9,
    seaPitchDeg: 0.5,
    seaRollDeg: 0.8,
    seaPeriod: 11,
    cloudCover: 0.82,
    sunScale: 0.42,
    rain: 0,
    fogScale: 0.7,
    lightning: 0,
    brief: "A low overcast and a moderate swell. The deck moves under you, and the crosswind is real.",
  },
  storm: {
    mode: "storm",
    label: "STORM SQUALL",
    windSpeed: 19,
    gust: 8,
    gustPeriod: 13,
    turbulence: 0.55,
    seaHeave: 2.4,
    seaPitchDeg: 1.1,
    seaRollDeg: 1.8,
    seaPeriod: 8.5,
    cloudCover: 1,
    sunScale: 0.2,
    rain: 1,
    fogScale: 0.28,
    lightning: 6,
    brief: "A squall line over the task force: heavy swell, driving rain, lightning and a hard crosswind.",
  },
};

/** The preset a mode stands for, clamped so a corrupt setting cannot break it. */
export function weatherPreset(mode: WeatherMode | undefined): WeatherPreset {
  return WEATHER[mode ?? "clear"] ?? WEATHER.clear;
}

/**
 * The wind in world axes and the gusting factor for a preset.
 *
 * The bearing is a pure function of the world seed, so the squall blows the
 * same way for everyone in the room, and it is stable for the whole sortie
 * instead of wandering between frames.
 */
export function windFor(preset: WeatherPreset | undefined, seed: number, timeS: number): { x: number; z: number; gust: number } {
  const p = preset ?? WEATHER.clear;
  const bearing = ((seed * 3601 + 977) % 360) * (Math.PI / 180);
  const gust = 1 + p.gust / Math.max(p.windSpeed, 0.001) * Math.sin((timeS / p.gustPeriod) * Math.PI * 2);
  const speed = p.windSpeed * gust;
  return { x: Math.sin(bearing) * speed, z: -Math.cos(bearing) * speed, gust };
}

/** Sea state for a preset: what the fleet is doing in this weather. */
export function seaStateFor(preset: WeatherPreset): { heave: number; pitchDeg: number; rollDeg: number; period: number } | null {
  if (preset.seaHeave <= 0 && preset.seaPitchDeg <= 0 && preset.seaRollDeg <= 0) return null;
  return { heave: preset.seaHeave, pitchDeg: preset.seaPitchDeg, rollDeg: preset.seaRollDeg, period: preset.seaPeriod };
}
