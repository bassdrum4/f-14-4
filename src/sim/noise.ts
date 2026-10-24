// Deterministic seeded value noise + fbm/ridged variants.
// Fast enough for heightfield generation (called ~300k times at startup).

// Fast 32-bit hash finisher for grid corners.
function hashFinish(h: number): number {
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295; // 0..1
}

function fade(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Value noise in 0..1.
 * Optimized: Hoists seed multiplication and uses incremental integer math for
 * grid coordinates (ix+1, iz+1) to avoid redundant calculations across the 4 corners.
 */
export function valueNoise(x: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = fade(x - ix);
  const fz = fade(z - iz);

  // Pre-calculate seed and base coordinate hashes once per evaluation
  const s = Math.imul(seed, 1013904223);
  const hx0 = (Math.imul(ix, 374761393) + s) | 0;
  const hx1 = (hx0 + 374761393) | 0;
  const hz0 = Math.imul(iz, 668265263);
  const hz1 = (hz0 + 668265263) | 0;

  const a = hashFinish(hx0 + hz0);
  const b = hashFinish(hx1 + hz0);
  const c = hashFinish(hx0 + hz1);
  const d = hashFinish(hx1 + hz1);

  const ab = a + (b - a) * fx;
  const cd = c + (d - c) * fx;
  return ab + (cd - ab) * fz;
}

// Pre-computed 1/norm multipliers for octaves 1..5 where amp starts at 0.5 and halves each octave.
// norm = 1 - Math.pow(0.5, octaves); NORM_INV[k] = 1 / norm.
const NORM_INV = [0, 2, 1.3333333333333333, 1.1428571428571428, 1.0666666666666667, 1.032258064516129];

/** Fractal brownian motion in ~0..1 */
export function fbm(x: number, z: number, seed: number, octaves = 4): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, z * freq, seed + i * 131);
    amp *= 0.5;
    freq *= 2.03;
  }
  const normInv = octaves <= 5 ? NORM_INV[octaves] : 1 / (1 - Math.pow(0.5, octaves));
  return sum * normInv;
}

/** Ridged noise in 0..1 — sharp mountain crests */
export function ridged(x: number, z: number, seed: number, octaves = 4): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    const n = valueNoise(x * freq, z * freq, seed + i * 733);
    const r = 1 - Math.abs(2 * n - 1);
    sum += amp * r * r;
    amp *= 0.5;
    freq *= 2.11;
  }
  const normInv = octaves <= 5 ? NORM_INV[octaves] : 1 / (1 - Math.pow(0.5, octaves));
  return sum * normInv;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
