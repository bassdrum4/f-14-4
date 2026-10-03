// Daylight environment: turns a sun position into scene lighting, fog and sky
// colours. One place owns the look of the world at every time of day, so the
// renderer, the sky dome and the fog always agree.

import * as THREE from "three";
import { dayPhase, type SunPosition } from "../sim/sun";

export interface EnvironmentSample {
  sunColor: THREE.Color;
  sunIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  zenith: THREE.Color;
  horizon: THREE.Color;
  glow: number;
  /** Ambient floor so a moonlit world stays playable, never pitch black. */
  ambient: number;
  starsVisible: boolean;
}

const c = (hex: number) => new THREE.Color(hex);

/** Reusable output so the per-frame path allocates nothing. */
export function makeEnvironmentSample(): EnvironmentSample {
  return {
    sunColor: new THREE.Color(),
    sunIntensity: 2,
    hemiSky: new THREE.Color(),
    hemiGround: new THREE.Color(),
    hemiIntensity: 0.75,
    fogColor: new THREE.Color(),
    fogNear: 3500,
    fogFar: 30000,
    zenith: new THREE.Color(),
    horizon: new THREE.Color(),
    glow: 0.35,
    ambient: 0,
    starsVisible: false,
  };
}

// Palette stops, keyed by solar elevation in degrees.
const DAY = {
  sun: c(0xfff2dd),
  hemiSky: c(0xbfd8ff),
  hemiGround: c(0x6b7a55),
  fog: c(0xbfd3e0),
  zenith: c(0x3d7ab8),
  horizon: c(0xc8d4dc),
  glow: 0.4,
  sunIntensity: 2.0,
  hemiIntensity: 0.75,
};

const GOLDEN = {
  sun: c(0xffb066),
  hemiSky: c(0xffc79a),
  hemiGround: c(0x5c5340),
  fog: c(0xe3b48a),
  zenith: c(0x2f5f92),
  horizon: c(0xf0b978),
  glow: 0.85,
  sunIntensity: 1.55,
  hemiIntensity: 0.6,
};

const TWILIGHT = {
  sun: c(0xff8a4d),
  hemiSky: c(0x8a6f9c),
  hemiGround: c(0x39352f),
  fog: c(0x8a7a92),
  zenith: c(0x1d3560),
  horizon: c(0xd98a5e),
  glow: 0.95,
  sunIntensity: 0.5,
  hemiIntensity: 0.42,
};

const NIGHT = {
  sun: c(0x9fb6e8), // moonlight
  hemiSky: c(0x2b3f66),
  hemiGround: c(0x14181f),
  fog: c(0x0e1726),
  zenith: c(0x060c18),
  horizon: c(0x16233c),
  glow: 0.16,
  sunIntensity: 0.34,
  hemiIntensity: 0.3,
};

interface Stop {
  at: number; // solar elevation in degrees
  p: typeof DAY;
}

// Elevation ramp: deep night -> twilight -> golden -> full day.
const STOPS: Stop[] = [
  { at: -18, p: NIGHT },
  { at: -6, p: NIGHT },
  { at: 0, p: TWILIGHT },
  { at: 6, p: GOLDEN },
  { at: 16, p: DAY },
  { at: 90, p: DAY },
];

/** Sample the environment for a sun position. */
export function sampleEnvironment(sun: SunPosition, out: EnvironmentSample): EnvironmentSample {
  const el = sun.elevationDeg;

  // find the bracketing stops and blend
  let lo = STOPS[0];
  let hi = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (el >= STOPS[i].at && el <= STOPS[i + 1].at) {
      lo = STOPS[i];
      hi = STOPS[i + 1];
      break;
    }
  }
  if (el <= STOPS[0].at) {
    lo = hi = STOPS[0];
  } else if (el >= STOPS[STOPS.length - 1].at) {
    lo = hi = STOPS[STOPS.length - 1];
  }
  const span = hi.at - lo.at;
  const t = span <= 0 ? 0 : smoothstep((el - lo.at) / span);

  mix(out.sunColor, lo.p.sun, hi.p.sun, t);
  mix(out.hemiSky, lo.p.hemiSky, hi.p.hemiSky, t);
  mix(out.hemiGround, lo.p.hemiGround, hi.p.hemiGround, t);
  mix(out.fogColor, lo.p.fog, hi.p.fog, t);
  mix(out.zenith, lo.p.zenith, hi.p.zenith, t);
  mix(out.horizon, lo.p.horizon, hi.p.horizon, t);
  out.glow = lerp(lo.p.glow, hi.p.glow, t);
  out.sunIntensity = lerp(lo.p.sunIntensity, hi.p.sunIntensity, t);
  out.hemiIntensity = lerp(lo.p.hemiIntensity, hi.p.hemiIntensity, t);

  // Night gets a small ambient lift plus a shorter fog range, which reads as
  // darkness closing in rather than a washed-out grey world.
  const night = 1 - smoothstep(clamp((el + 6) / 12, 0, 1));
  out.ambient = night * 0.12;
  out.fogNear = lerp(3500, 1400, night);
  out.fogFar = lerp(30000, 15000, night);
  out.starsVisible = dayPhase(el) === "night";
  return out;
}

function mix(target: THREE.Color, a: THREE.Color, b: THREE.Color, t: number): void {
  target.copy(a).lerp(b, t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}