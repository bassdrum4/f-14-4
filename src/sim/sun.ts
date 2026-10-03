// Solar position + time-of-day for the daylight cycle.
//
// Pure math, no dependencies. Low-precision solar position: declination from
// the day of year, then a local hour angle built from clock time, longitude
// and the equation of time. Good to a few arc-minutes, which is far more than
// a flight sim needs, and it maps local clock time onto the sun correctly as
// long as the caller supplies its UTC offset.

const DEG = Math.PI / 180;

export interface SunPosition {
  /** Compass azimuth of the sun, degrees clockwise from north. */
  azimuthDeg: number;
  /** Elevation above the horizon, degrees (negative = below the horizon). */
  elevationDeg: number;
}

export interface SunOptions {
  /** Day of the year, 1..366. */
  dayOfYear?: number;
  /** Offset from UTC in hours (Hawaii standard time = -10). */
  tzOffsetHours?: number;
}

/**
 * Sun position for a local clock time.
 * @param localHours local clock time in hours, 0..24
 * @param latDeg latitude, north positive
 * @param lonDeg longitude, east positive
 */
export function sunPosition(
  localHours: number,
  latDeg: number,
  lonDeg: number,
  opts: SunOptions = {},
): SunPosition {
  const dayOfYear = opts.dayOfYear ?? 172;
  const tz = opts.tzOffsetHours ?? 0;

  // --- declination of the sun for this day of year ---
  const declDeg = 23.44 * Math.sin(((360 / 365.24) * (dayOfYear - 81)) * DEG);

  // --- equation of time: true solar time minus mean solar time, minutes ---
  const b = ((360 / 364) * (dayOfYear - 81)) * DEG;
  const eqOfTimeMin = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  // --- local hour angle of the true sun ---
  // Local solar time: clock time adjusted for the longitude's offset from the
  // timezone meridian, then corrected by the equation of time. Solar noon is
  // when this reaches 12:00, which is why the -12 sits below.
  const solarHours = localHours + (lonDeg / 15 - tz) + eqOfTimeMin / 60;
  const hourAngleDeg = (solarHours - 12) * 15;

  const latR = latDeg * DEG;
  const declR = declDeg * DEG;
  const haR = hourAngleDeg * DEG;

  const sinEl = Math.sin(latR) * Math.sin(declR) + Math.cos(latR) * Math.cos(declR) * Math.cos(haR);
  const elevationDeg = Math.asin(clamp(sinEl, -1, 1)) / DEG;

  // Azimuth measured clockwise from north.
  const azNumer = Math.sin(haR);
  const azDenom = Math.cos(haR) * Math.sin(latR) - Math.tan(declR) * Math.cos(latR);
  const azimuthDeg = (((Math.atan2(azNumer, azDenom) / DEG + 180) % 360) + 360) % 360;

  return { azimuthDeg, elevationDeg };
}

/** Unit vector from the world origin toward the sun (three.js axes). */
export function sunVector(sun: SunPosition): { x: number; y: number; z: number } {
  const az = sun.azimuthDeg * DEG;
  const el = sun.elevationDeg * DEG;
  const cosEl = Math.cos(el);
  // Compass azimuth: 0 = north (-Z), 90 = east (+X).
  return {
    x: cosEl * Math.sin(az),
    y: Math.sin(el),
    z: -cosEl * Math.cos(az),
  };
}

/** Day phase from solar elevation, used to pick lighting palettes. */
export type DayPhase = "night" | "twilight" | "golden" | "day";

export function dayPhase(elevationDeg: number): DayPhase {
  if (elevationDeg < -6) return "night";
  if (elevationDeg < 2) return "twilight";
  if (elevationDeg < 12) return "golden";
  return "day";
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}