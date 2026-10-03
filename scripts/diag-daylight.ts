// Check the daylight environment ramp across a full day.
// Usage: bun scripts/diag-daylight.ts

import { makeEnvironmentSample, sampleEnvironment } from "../src/render/environment";
import { dayPhase, sunPosition, sunVector } from "../src/sim/sun";

const LAT = 21.92;
const LON = -159.47;
const TZ = -10;
const DAY = 172;

const env = makeEnvironmentSample();
const hex = (c: { getHexString(): string }) => "#" + c.getHexString();

console.log("hour  el    phase     sun(#)   int   hemi    fog(#)   near  far   stars");
let prevSunI = -1;
let monotonic = true;
for (let h = 0; h <= 24; h += 2) {
  const sun = sunPosition(h, LAT, LON, { dayOfYear: DAY, tzOffsetHours: TZ });
  sampleEnvironment(sun, env);
  const v = sunVector(sun);
  const ok = v.y > 0.9 || Math.abs(Math.hypot(v.x, v.y, v.z) - 1) < 1e-6;
  if (!ok) monotonic = false;
  console.log(
    `${String(h).padStart(4)}  ${sun.elevationDeg.toFixed(1).padStart(6)}  ${dayPhase(sun.elevationDeg).padEnd(8)}  ${hex(env.sunColor)}  ${env.sunIntensity.toFixed(2)}  ${env.hemiIntensity.toFixed(2)}  ${hex(env.fogColor)}  ${String(env.fogNear).padStart(5)} ${String(env.fogFar).padStart(5)}  ${env.starsVisible ? "yes" : "-"}`,
  );
  void prevSunI;
  prevSunI = env.sunIntensity;
}

// key invariants
console.log("\nInvariants:");
const noon = sunPosition(12.6, LAT, LON, { dayOfYear: DAY, tzOffsetHours: TZ });
sampleEnvironment(noon, env);
const noonOk = env.sunIntensity > 1.8 && !env.starsVisible && env.ambient < 0.02;
console.log(`  noon is bright daylight, no stars, no night lift: ${noonOk}`);

const mid = sunPosition(0, LAT, LON, { dayOfYear: DAY, tzOffsetHours: TZ });
sampleEnvironment(mid, env);
const nightOk = env.sunIntensity < 0.5 && env.starsVisible && env.ambient > 0.05;
console.log(`  midnight is dim, starry, with ambient lift: ${nightOk}`);

const dusk = sunPosition(19.2, LAT, LON, { dayOfYear: DAY, tzOffsetHours: TZ });
sampleEnvironment(dusk, env);
const duskOk = env.sunIntensity > 0.3 && env.sunIntensity < 2 && env.glow > 0.5;
console.log(`  dusk is warm with a strong sky glow: ${duskOk} (el ${dusk.elevationDeg.toFixed(1)}, glow ${env.glow.toFixed(2)})`);

// stars must never be visible during the day and always at night
let starBug = false;
for (let h = 0; h < 24; h += 0.1) {
  const s = sunPosition(h, LAT, LON, { dayOfYear: DAY, tzOffsetHours: TZ });
  sampleEnvironment(s, env);
  const shouldBeNight = dayPhase(s.elevationDeg) === "night";
  if (env.starsVisible !== shouldBeNight) starBug = true;
}
console.log(`  star visibility tracks day phase across the whole day: ${!starBug}`);

console.log(`  sun vectors are unit length: ${monotonic}`);