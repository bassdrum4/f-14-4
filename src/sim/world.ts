// World layouts: the procedural archipelago and the real-terrain Kauai map.
// One layout is active at a time. The height sampler is swappable — analytic
// procedural terrain or a Mapbox DEM heightfield — while airfield, carriers and
// the flattening rules always derive from the active layout, so the sim, the
// renderer and the HUD all agree on one source of truth.

import { fbm, ridged, smoothstep } from "./noise";

/** Terrain mesh extent (half-size, meters). Beyond this: open ocean. */
export const EXTENT = 12000;

export const SEA = { y: 0 };

export interface AirfieldDef {
  centerX: number;
  centerZ: number;
  elevation: number; // plateau height above sea level
  runwayLength: number;
  runwayWidth: number;
  headingDeg: number;
}

export interface CarrierDef {
  name: string;
  x: number;
  z: number;
  deckY: number; // deck top above sea level
  headingDeg: number; // bow direction (0 = north)
  deckLength: number;
  deckWidth: number;
  landingLength: number; // angled landing strip length
  landingAngleDeg: number; // angled deck relative to ship axis
  wireCount: number;
  wireSpacing: number; // meters between wires
  catapultOffsetX: number; // cat track lateral offset from deck centreline
  catapultLength: number;
}

function carrier(name: string, x: number, z: number, headingDeg: number): CarrierDef {
  return {
    name, x, z, headingDeg,
    deckY: 19,
    deckLength: 300,
    deckWidth: 77,
    landingLength: 240,
    landingAngleDeg: 9.5,
    wireCount: 4,
    wireSpacing: 12.5,
    catapultOffsetX: -14,
    catapultLength: 94,
  };
}

export type WorldId = "archipelago" | "kauai";

export interface WorldDef {
  id: WorldId;
  label: string;
  /** Required attribution when real-world data is in use (Mapbox terms). */
  attribution: string | null;
  airfield: AirfieldDef;
  carriers: CarrierDef[];
}

/**
 * Angled-deck landing strip frame, in deck coordinates (along = fore/aft,
 * across = starboard, origin at the ship's centre). Shared by the sim's trap
 * logic and the renderer so the painted deck and wire meshes sit exactly
 * where the sim checks them.
 */
export const STRIP = {
  startAlong: -115, // aft end of the landing area, along the deck
  startAcross: 5, //  centreline offset at the aft end (toward starboard)
  halfWidth: 15, //    touchdown corridor half-width
  wireFirstS: 35, //   first arresting wire, metres from the strip start
  catchSMin: 26, //    earliest s that can catch a wire
  catchSMax: 170, //   latest s that can catch a wire
};

// ---------------------------------------------------------------------------
// The two worlds
// ---------------------------------------------------------------------------

/** Fictional archipelago: airfield on the main island, carriers in open sea. */
export const ARCHIPELAGO: WorldDef = {
  id: "archipelago",
  label: "Procedural islands",
  attribution: null,
  airfield: {
    centerX: -1800,
    centerZ: 2400,
    elevation: 140,
    runwayLength: 2200,
    runwayWidth: 48,
    headingDeg: 90, // runway points east
  },
  carriers: [
    carrier("ALPHA", 6200, -1400, 135), // east-southeast waters
    carrier("BRAVO", 9500, 9500, 85), // south-east approaches
    carrier("CHARLIE", -9500, 9500, 125), // south-west approaches
    carrier("DELTA", -9500, -9500, 275), // north-west approaches
  ],
};

/**
 * Real terrain: south Kauai, Hawaii. Airfield on the Koloa coastal plain,
 * carriers in verified open water (>= 2.2 km from land, clear sea lanes).
 * Fitted against live Mapbox terrain-RGB data (see scripts/worldfit.ts).
 */
export const KAUAI: WorldDef = {
  id: "kauai",
  label: "Kauai, Hawaii — live terrain",
  attribution: "Terrain & imagery © Mapbox © OpenStreetMap",
  airfield: {
    centerX: 1500,
    centerZ: 2250,
    elevation: 57,
    runwayLength: 2200,
    runwayWidth: 48,
    headingDeg: 90,
  },
  carriers: [
    carrier("LEHUA", -10500, 5500, 90),
    carrier("MAKANI", -500, 10250, 50),
    carrier("NALU", 10500, 10500, 0),
    carrier("KAI", 10500, 2250, 40),
  ],
};

export const WORLDS: Record<WorldId, WorldDef> = { archipelago: ARCHIPELAGO, kauai: KAUAI };

// ---------------------------------------------------------------------------
// Active world + sampler
// ---------------------------------------------------------------------------

export interface HeightSource {
  sample(x: number, z: number): number;
}

let activeWorld: WorldDef = ARCHIPELAGO;
let activeSampler: (x: number, z: number) => number = proceduralHeight;

export function setWorld(world: WorldDef, sampler: (x: number, z: number) => number): void {
  activeWorld = world;
  activeSampler = sampler;
}

export function resetWorld(): void {
  activeWorld = ARCHIPELAGO;
  activeSampler = proceduralHeight;
}

export function activeWorldDef(): WorldDef {
  return activeWorld;
}

export function airfield(): AirfieldDef {
  return activeWorld.airfield;
}

export function carriers(): CarrierDef[] {
  return activeWorld.carriers;
}

/** Ground height at (x,z) for the active world (physics + mesh building). */
export function terrainHeight(x: number, z: number): number {
  return activeSampler(x, z);
}

/** Test whether (x,z) lies on the flattened runway/plateau. */
export function isRunway(x: number, z: number): boolean {
  const af = activeWorld.airfield;
  const dx = Math.abs(x - af.centerX);
  const dz = Math.abs(z - af.centerZ);
  return dx <= af.runwayLength / 2 + 60 && dz <= af.runwayWidth / 2 + 60;
}

/** Deck-local axes: fwd = ship bow direction, right = starboard. */
export function deckAxes(headingDeg: number): { fwd: [number, number]; right: [number, number] } {
  const h = (headingDeg * Math.PI) / 180;
  // Ship forward in world XZ (bow direction): heading 0 = north = -Z
  const fwd: [number, number] = [Math.sin(h), -Math.cos(h)];
  const right: [number, number] = [Math.cos(h), Math.sin(h)];
  return { fwd, right };
}

/** Convert world XZ into a carrier's deck-local (along, across) meters. */
export function worldToDeck(c: CarrierDef, x: number, z: number): [number, number] {
  const { fwd, right } = deckAxes(c.headingDeg);
  const dx = x - c.x;
  const dz = z - c.z;
  return [dx * fwd[0] + dz * fwd[1], dx * right[0] + dz * right[1]];
}

/** Is this world point over the given carrier's flight deck? */
export function isOnDeck(c: CarrierDef, x: number, z: number): boolean {
  const [along, across] = worldToDeck(c, x, z);
  return Math.abs(along) <= c.deckLength / 2 && Math.abs(across) <= c.deckWidth / 2;
}

/** The carrier whose deck covers (x,z), if any. */
export function carrierAt(x: number, z: number): CarrierDef | null {
  for (const c of activeWorld.carriers) {
    if (isOnDeck(c, x, z)) return c;
  }
  return null;
}

/** Closest carrier to (x,z) — HUD nav + landing-frame fallback. */
export function nearestCarrier(x: number, z: number): CarrierDef {
  let best = activeWorld.carriers[0];
  let bestD = Infinity;
  for (const c of activeWorld.carriers) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

export type SurfaceKind = "terrain" | "runway" | "deck" | "water";

/**
 * Ground height + surface kind for collision. Deck beats terrain;
 * runway beats terrain; water only if terrain is below sea level.
 */
export function groundAt(x: number, z: number): { y: number; kind: SurfaceKind } {
  const deck = carrierAt(x, z);
  if (deck) return { y: deck.deckY, kind: "deck" };
  const h = terrainHeight(x, z);
  const af = activeWorld.airfield;
  if (isRunway(x, z) && h > af.elevation - 30) {
    return { y: af.elevation, kind: "runway" };
  }
  if (h < SEA.y) return { y: SEA.y, kind: "water" };
  return { y: h, kind: "terrain" };
}

// ---------------------------------------------------------------------------
// Shared layout operations: runway flattening + guaranteed-deep anchorages
// ---------------------------------------------------------------------------

/**
 * Layout shaping applied to any terrain source: flatten the airfield plateau
 * in, and guarantee at least 40 m of water around every carrier so a ship can
 * never sit on shallow ground that peeks through the sea surface.
 */
export function applyLayoutOps(
  x: number,
  z: number,
  h: number,
  af: AirfieldDef,
  cs: CarrierDef[],
): number {
  // --- flatten airfield plateau (fully flat within runway + 100 m, fades over 400 m) ---
  const dx = Math.abs(x - af.centerX);
  const dz = Math.abs(z - af.centerZ);
  const halfL = af.runwayLength / 2 + 100;
  const halfW = af.runwayWidth / 2 + 100;
  const boxDist = Math.hypot(Math.max(dx - halfL, 0), Math.max(dz - halfW, 0));
  const runwayFlat = 1 - smoothstep(0, 400, boxDist);
  h = h + (af.elevation - h) * runwayFlat;

  // --- ensure carrier areas are open water (at least 40 m deep) ---
  for (const c of cs) {
    const cd = Math.hypot(x - c.x, z - c.z);
    const keep = 1 - smoothstep(700, 1600, cd);
    if (keep > 0) {
      const target = Math.min(h, -40);
      h = h * (1 - keep) + target * keep;
    }
  }

  return h;
}

/** Sampler for a loaded Mapbox DEM heightfield: ocean mapping + layout ops. */
export function makeKauaiSampler(hf: HeightSource): (x: number, z: number) => number {
  const af = KAUAI.airfield;
  const cs = KAUAI.carriers;
  return (x: number, z: number) => {
    // Outside the playable square the DEM's clamped edge would turn into
    // invisible "land" in the physics, so report open ocean instead.
    if (Math.abs(x) > EXTENT + 500 || Math.abs(z) > EXTENT + 500) return -40;
    let h = hf.sample(x, z);
    // Mapbox terrain-RGB reports exactly sea level over the ocean (no
    // bathymetry), so map that to a seabed depth the sim can collide with.
    if (h < 0.5) h = -40;
    return applyLayoutOps(x, z, h, af, cs);
  };
}

// ---------------------------------------------------------------------------
// Procedural terrain — a small archipelago: the main island carries the
// airfield, the others give the world a varied mix (a tall volcanic range,
// rugged fjord country, a low atoll, an islet chain). All of it is analytic
// and deterministic, so the sim can query heights for physics any time.
// ---------------------------------------------------------------------------

interface Landmass {
  x: number;
  z: number;
  r: number; // land is full strength inside this radius
  falloff: number; // coastline fade distance
  ridgeAmp: number; // mountain amplitude
  hillAmp: number; // rolling-hills amplitude
  seed: number;
  base?: number; // interior baseline height (default LAND_BASE)
  coastSharp?: number; // < 1 pinches the coastline into cliffs
}

const LANDMASSES: Landmass[] = [
  // main island — carries the airfield
  { x: ARCHIPELAGO.airfield.centerX, z: ARCHIPELAGO.airfield.centerZ, r: 4300, falloff: 3400, ridgeAmp: 820, hillAmp: 200, seed: 17 },
  // north-east: tall volcanic range with snowcaps
  { x: 2500, z: 6200, r: 2400, falloff: 2800, ridgeAmp: 1750, hillAmp: 260, seed: 41, coastSharp: 0.55 },
  // south-west: rugged fjord country
  { x: -5800, z: -2600, r: 2500, falloff: 2600, ridgeAmp: 1300, hillAmp: 240, seed: 73, coastSharp: 0.7 },
  // south: low sandy atoll ringed by lagoons
  { x: -1500, z: -5600, r: 1700, falloff: 2600, ridgeAmp: 120, hillAmp: 60, base: 14, seed: 101 },
  // east islet chain
  { x: 5600, z: 3600, r: 1100, falloff: 1700, ridgeAmp: 620, hillAmp: 150, seed: 131 },
  { x: 6600, z: 5300, r: 750, falloff: 1150, ridgeAmp: 420, hillAmp: 110, seed: 149 },
];

/** Named summits — landmarks you can see from the air and steer by. */
const PEAKS = [
  { x: 3000, z: 6600, h: 1500, r: 1100 },
  { x: 1800, z: 5500, h: 950, r: 850 },
  { x: -6100, z: -1700, h: 1150, r: 950 },
  { x: -5200, z: -3200, h: 800, r: 750 },
  { x: -700, z: -900, h: 850, r: 950 },
  { x: -4300, z: 4500, h: 720, r: 800 },
];

/** Baseline upland height so island interiors never sit at sea level. */
const LAND_BASE = 70;

function proceduralHeight(x: number, z: number): number {
  const seed = 1337;
  const af = ARCHIPELAGO.airfield;

  // --- domain warp: meandering ridgelines, ragged coastlines ---
  const wxo = fbm(x * 0.00008, z * 0.00008, seed + 3, 3) - 0.5;
  const wzo = fbm(x * 0.00008, z * 0.00008, seed + 9, 3) - 0.5;
  const wx = x + wxo * 3600;
  const wz = z + wzo * 3600;
  const coastWarp = (fbm(x * 0.00022, z * 0.00022, seed + 71, 4) - 0.5) * 2600;

  // --- land mask: strongest island wins and brings its own character ---
  let land = 0;
  let nearCoast = 0;
  let ridgeAmp = 0;
  let hillAmp = 0;
  let baseH = LAND_BASE;
  for (const m of LANDMASSES) {
    const d = Math.hypot(x - m.x, z - m.z);
    const shore = m.r + m.falloff * (m.coastSharp ?? 1);
    const mask = 1 - smoothstep(m.r, shore, d + coastWarp);
    if (mask > land) {
      land = mask;
      ridgeAmp = m.ridgeAmp;
      hillAmp = m.hillAmp;
      baseH = m.base ?? LAND_BASE;
    }
    nearCoast = Math.max(nearCoast, 1 - smoothstep(m.r, shore + 2600, d));
  }

  // --- relief: ranges in bands, hills, fine detail, plus named summits ---
  const rangeMask = smoothstep(0.34, 0.72, fbm(wx * 0.00011, wz * 0.00011, seed + 5, 3));
  const rid = ridged(wx * 0.0003, wz * 0.0003, seed, 5);
  const hills = fbm(wx * 0.0007, wz * 0.0007, seed + 9, 5);
  const detail = fbm(x * 0.004, z * 0.004, seed + 23, 3);
  let peak = 0;
  for (const p of PEAKS) {
    const d = Math.hypot(x - p.x, z - p.z);
    if (d < p.r * 1.8) {
      const t = 1 - smoothstep(p.r * 0.3, p.r * 1.5, d);
      peak = Math.max(peak, p.h * t * t);
    }
  }
  const upland =
    Math.pow(rid, 1.5) * ridgeAmp * (0.35 + 0.65 * rangeMask) +
    hills * hillAmp +
    detail * 16 +
    peak;

  // Broad basin around the airfield keeps the approach clear and makes the
  // plateau read as a valley floor rather than a mesa.
  const fieldD = Math.hypot(x - af.centerX, z - af.centerZ);
  const basin = 0.32 + 0.68 * smoothstep(1400, 3600, fieldD);

  const relief = (baseH + upland * basin) * land;

  // --- seabed: deeper basins offshore, shelving up near the coasts ---
  const seabed = (-14 - ridged(x * 0.00022, z * 0.00022, seed + 40, 3) * 130) * (1 - 0.5 * nearCoast);
  const h = relief + seabed * (1 - land);

  return applyLayoutOps(x, z, h, af, ARCHIPELAGO.carriers);
}
