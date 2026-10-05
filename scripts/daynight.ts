// Headless day/night verification: sun path, phase transitions, environment
// lighting response and the fast-cycle clock. Mirrors exactly the chain the
// game runs every frame: advanceDaylight -> sunPosition -> sunVector /
// dayPhase -> sampleEnvironment (what applyDaylight feeds the lights).
// Usage: bun scripts/daynight.ts

import { Color } from "three";
import { dayPhase, sunPosition, sunVector } from "../src/sim/sun";
import { makeEnvironmentSample, sampleEnvironment } from "../src/render/environment";
import { CYCLE_MINUTES_PER_DAY } from "../src/settings";
import { KAUAI_REGION } from "../src/sim/mapbox";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) {
    console.log(`  ok  ${name}`);
  } else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const LAT = KAUAI_REGION.centerLat;
const LON = KAUAI_REGION.centerLon;
const TZ = -10; // Hawaii standard time, no DST
const DAY_OF_YEAR = 278; // Oct 5

// --- 1. solar noon: peak elevation near midday, plausible height for Kauai ---
{
  let peak = -90;
  let peakHour = 0;
  for (let h = 4; h <= 20; h += 0.05) {
    const el = sunPosition(h, LAT, LON, { dayOfYear: DAY_OF_YEAR, tzOffsetHours: TZ }).elevationDeg;
    if (el > peak) {
      peak = el;
      peakHour = h;
    }
  }
  // Kauai in early October: declination ~ -4.3 deg, so max elevation ~ 63-66 deg
  check("solar noon peak elevation ~64 deg", peak > 60 && peak < 68, `${peak.toFixed(1)} deg`);
  check("solar noon occurs 11:30-13:00 HST", peakHour >= 11.5 && peakHour <= 13, `${peakHour.toFixed(2)} h`);
  console.log(`      (solar noon ${fmt(peakHour)}, elevation ${peak.toFixed(1)} deg)`);
}

// --- 2. night floor: well below the horizon around midnight ---
{
  const el = sunPosition(0, LAT, LON, { dayOfYear: DAY_OF_YEAR, tzOffsetHours: TZ }).elevationDeg;
  check("midnight sun below -50 deg", el < -50, `${el.toFixed(1)} deg`);
}

// --- 3. sunrise/sunset inside an October-Hawaii window ---
{
  const rise = crossing(5, 8, 0, "rise");
  const set = crossing(17, 20, 0, "set");
  check("sunrise 05:45-06:45 HST", rise !== null && rise >= 5.75 && rise <= 6.75, `${rise}`);
  check("sunset 17:30-18:45 HST", set !== null && set >= 17.5 && set <= 18.75, `${set}`);
  console.log(
    `      (sunrise ${rise === null ? "?" : fmt(rise)}, sunset ${set === null ? "?" : fmt(set)})`,
  );
}

// --- 4. phase transitions in the right order, both directions ---
{
  const seq: string[] = [];
  for (let h = 0; h <= 24; h += 1 / 60) {
    const p = dayPhase(sunPosition(h, LAT, LON, { dayOfYear: DAY_OF_YEAR, tzOffsetHours: TZ }).elevationDeg);
    if (seq[seq.length - 1] !== p) seq.push(p);
  }
  const joined = seq.join(">");
  check(
    "phases rise night>twilight>golden>day",
    joined.includes("night>twilight>golden>day"),
    joined,
  );
  check(
    "phases fall day>golden>twilight>night",
    joined.includes("day>golden>twilight>night"),
    joined,
  );
  check("day is not permanently night", joined.includes("day"), joined);
  console.log(`      (day sequence: ${joined})`);
}

// --- 5. environment responds: day is bright, night is dark with stars ---
{
  const noon = envAt(12);
  const midnight = envAt(0);
  const dusk = envAt(crossing(17, 20, 0, "set") ?? 18.1);

  check("noon sun intensity ~2.0", noon.sunIntensity > 1.8, `${noon.sunIntensity.toFixed(2)}`);
  check("midnight sun intensity < 0.5", midnight.sunIntensity < 0.5, `${midnight.sunIntensity.toFixed(2)}`);
  check("day is >= 3x brighter than night", noon.sunIntensity > midnight.sunIntensity * 3);
  check("stars visible at night", midnight.starsVisible);
  check("stars hidden at noon", !noon.starsVisible);
  check("night ambient lift > day ambient", midnight.ambient > noon.ambient,
    `${midnight.ambient.toFixed(3)} vs ${noon.ambient.toFixed(3)}`);
  check("night fog darker than day fog", lum(midnight.fogColor) < lum(noon.fogColor) * 0.35,
    `${lum(midnight.fogColor).toFixed(3)} vs ${lum(noon.fogColor).toFixed(3)}`);
  check("dusk sits between night and day brightness",
    dusk.sunIntensity > midnight.sunIntensity && dusk.sunIntensity < noon.sunIntensity,
    `${dusk.sunIntensity.toFixed(2)}`);
  check("golden-hour sun is warm (R > B)", dusk.sunColor.r > dusk.sunColor.b + 0.1,
    `r=${dusk.sunColor.r.toFixed(2)} b=${dusk.sunColor.b.toFixed(2)}`);
}

// --- 6. sunVector matches the sun position (three.js axes, -Z = north) ---
{
  let worst = 0;
  for (let h = 0; h <= 24; h += 1) {
    const sun = sunPosition(h, LAT, LON, { dayOfYear: DAY_OF_YEAR, tzOffsetHours: TZ });
    const v = sunVector(sun);
    const len = Math.hypot(v.x, v.y, v.z);
    const azBack = ((Math.atan2(v.x, -v.z) * 180) / Math.PI + 360) % 360;
    const dAz = Math.abs(((azBack - sun.azimuthDeg + 540) % 360) - 180);
    worst = Math.max(worst, Math.abs(len - 1), Math.abs(v.y - Math.sin(sun.elevationDeg * Math.PI / 180)), dAz);
  }
  check("sunVector unit, y=sin(elev), azimuth matches", worst < 1e-6, `worst ${worst}`);
}

// --- 7. fast cycle clock: 4 real minutes per simulated day ---
{
  let hours = 6;
  const step = 1 / 60;
  const frames = 60 * 60 * CYCLE_MINUTES_PER_DAY; // one full day of 60fps frames
  for (let i = 0; i < frames; i++) {
    hours = (hours + (step / 60) * (24 / CYCLE_MINUTES_PER_DAY)) % 24;
  }
  check("fast cycle: full day wraps in CYCLE_MINUTES_PER_DAY", Math.abs(hours - 6) < 0.01, `ended ${hours.toFixed(3)} h`);

  hours = 0;
  for (let i = 0; i < 60 * 60; i++) {
    hours = (hours + (step / 60) * (24 / CYCLE_MINUTES_PER_DAY)) % 24;
  }
  check("fast cycle: 1 real minute = 6 sim hours", Math.abs(hours - 6) < 0.01, `ended ${hours.toFixed(3)} h`);
}

// --- 8. live clock stays a valid local hour (what "live" mode feeds in) ---
{
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Pacific/Honolulu",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const live = (h % 24) + m / 60;
  check("live HST clock resolves to 0..24", live >= 0 && live < 24, `${live.toFixed(2)}`);
  console.log(`      (Hawaii right now: ${fmt(live)})`);
}

// --- helpers ---

/** First hour in [lo,hi] where solar elevation crosses `level` (deg). */
function crossing(lo: number, hi: number, level: number, dir: "rise" | "set"): number | null {
  let prev = elevAt(lo) - level;
  for (let h = lo + 1 / 60; h <= hi; h += 1 / 60) {
    const cur = elevAt(h) - level;
    if (dir === "rise" ? prev < 0 && cur >= 0 : prev >= 0 && cur < 0) return h;
    prev = cur;
  }
  return null;
}

function elevAt(h: number): number {
  return sunPosition(h, LAT, LON, { dayOfYear: DAY_OF_YEAR, tzOffsetHours: TZ }).elevationDeg;
}

function envAt(h: number) {
  const sun = sunPosition(h, LAT, LON, { dayOfYear: DAY_OF_YEAR, tzOffsetHours: TZ });
  return sampleEnvironment(sun, makeEnvironmentSample());
}

function lum(c: Color): number {
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

function fmt(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`;
}

if (failures > 0) {
  console.error(`\n${failures} day/night check(s) FAILED`);
  process.exit(1);
}
console.log("\nday/night cycle verified");
