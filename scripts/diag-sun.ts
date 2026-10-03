// Sanity-check the solar position math against known Kauai values.
// Usage: bun scripts/diag-sun.ts

import { dayPhase, sunPosition, sunVector } from "../src/sim/sun";

const LAT = 21.92;
const LON = -159.47;
const TZ = -10; // Hawaii standard time
const DAY = 172; // 21 June

function at(h: number, day = DAY) {
  return sunPosition(h, LAT, LON, { dayOfYear: day, tzOffsetHours: TZ });
}

function fmt(t: number): string {
  const h = Math.floor(t) % 24;
  const m = Math.round((t - Math.floor(t)) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

console.log("Kauai (21.92N, 159.47W), 21 Jun. Expect sunrise ~05:53, sunset ~19:19, noon ~12:36 HST.\n");

for (let h = 0; h < 24; h++) {
  const s = at(h);
  const v = sunVector(s);
  const bars = "#".repeat(Math.max(0, Math.round(s.elevationDeg / 3)));
  console.log(
    `${String(h).padStart(2, "0")}:00  el=${s.elevationDeg.toFixed(1).padStart(6)}  az=${s.azimuthDeg.toFixed(0).padStart(3)}  vec=(${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)})  ${dayPhase(s.elevationDeg).padEnd(8)} ${bars}`,
  );
}

function cross(rising: boolean, day = DAY): number {
  let prev = at(0, day).elevationDeg;
  for (let m = 1; m <= 24 * 60; m++) {
    const e = at(m / 60, day).elevationDeg;
    if (rising ? prev < 0 && e >= 0 : prev >= 0 && e < 0) return (m - 0.5) / 60;
    prev = e;
  }
  return NaN;
}

function noon(day = DAY): { t: number; el: number } {
  let best = -90;
  let bestT = 0;
  for (let m = 0; m <= 24 * 60; m++) {
    const e = at(m / 60, day).elevationDeg;
    if (e > best) {
      best = e;
      bestT = m / 60;
    }
  }
  return { t: bestT, el: best };
}

const rise = cross(true);
const set = cross(false);
const n = noon();
console.log(`\n21 Jun: sunrise ${fmt(rise)}, sunset ${fmt(set)}, day length ${(set - rise).toFixed(2)} h, noon ${fmt(n.t)} el ${n.el.toFixed(1)} deg`);

const wRise = cross(true, 355);
const wSet = cross(false, 355);
const wNoon = noon(355);
console.log(`21 Dec: sunrise ${fmt(wRise)}, sunset ${fmt(wSet)}, day length ${(wSet - wRise).toFixed(2)} h, noon ${fmt(wNoon.t)} el ${wNoon.el.toFixed(1)} deg`);

const eRise = cross(true, 80);
const eSet = cross(false, 80);
console.log(`21 Mar: sunrise ${fmt(eRise)}, sunset ${fmt(eSet)}, day length ${(eSet - eRise).toFixed(2)} h (expect ~12 h)`);