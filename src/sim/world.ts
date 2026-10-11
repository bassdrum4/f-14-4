// World layout: one procedural archipelago, generated from a seed.
//
// The seed is the whole multiplayer synchronisation story. The host sends a
// single number — once when a pilot joins, and again only if somebody actually
// changes it — and every pilot rebuilds the identical island chain locally.
// Terrain never crosses the wire, and nothing is re-sent per frame.
//
// The seed drives the terrain: island positions, sizes, ridgelines, summits and
// the noise offsets the generator runs on. The fleet layout (the airfield
// plateau and the carrier anchorages) is deliberately fixed, because the flight
// model, the deck meshes and the trap logic all agree on it. `applyLayoutOps`
// then forces the runway flat and every anchorage deep, and the generator keeps
// islands clear of both, so any seed is flyable.

import { fbm, ridged, smoothstep } from "./noise";

/**
 * Terrain mesh extent (half-size, meters). Beyond this: open ocean.
 *
 * The chain runs a long way: a 60 km square of mostly water, with island
 * groups strung across it and the fleet's carriers spread between them. The
 * heightfield is analytic, so this is the size of the *mesh* and the HUD box;
 * physics is exact anywhere in it.
 */
export const EXTENT = 30000;

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
    // Deliberately bigger than a real 333 m fleet carrier. This sim is flown
    // with a keyboard or a stick, not a HOTAS with a trimmed Tomcat, so
    // the last 100 m of the approach is far harder than the real thing: the deck
    // is stretched to keep a trap achievable without turning it into a barn door.
    // The hostile carrier uses the same hull (makeCarrier), so the two match.
    deckLength: 435,
    deckWidth: 112,
    landingLength: 348,
    landingAngleDeg: 9.5,
    wireCount: 4,
    wireSpacing: 18,
    catapultOffsetX: -20,
    catapultLength: 136,
  };
}

/**
 * Build a carrier that is not part of a world layout (the dogfight's hostile
 * boat): same hull/deck numbers as the fleet, but its position and heading are
 * live and move with the sim.
 */
export const makeCarrier = carrier;

export interface WorldDef {
  id: string;
  label: string;
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
  startAlong: -167, // aft end of the landing area, along the deck
  startAcross: 8, //   centreline offset at the aft end (toward starboard)
  halfWidth: 21, //    touchdown corridor half-width
  wireFirstS: 51, //   first arresting wire, metres from the strip start
  catchSMin: 38, //    earliest s that can catch a wire
  catchSMax: 246, //   latest s that can catch a wire
};

/**
 * Where the catapult shuttle starts, along the deck from the ship's centre
 * (positive = forward). Shared by the flight model, the bandit launches and the
 * painted deck, so a jet always launches down the track that is drawn under it.
 * It sits in the aft half of the deck, so the jet is parked well back with the
 * whole forward deck ahead of it (~200 m of run-out past the end of the stroke).
 */
export const CAT_START_ALONG = -80;

// ---------------------------------------------------------------------------
// The fleet layout — fixed, whatever the terrain seed is
// ---------------------------------------------------------------------------

/** Fictional archipelago: airfield on the main island, carriers in open sea. */
export const ARCHIPELAGO: WorldDef = {
  id: "archipelago",
  label: "Procedural islands",
  airfield: {
    centerX: -1800,
    centerZ: 2400,
    elevation: 140,
    runwayLength: 2200,
    runwayWidth: 48,
    headingDeg: 90, // runway points east
  },
  carriers: [
    carrier("ALPHA", 10000, 2000, 135), // due east of the main island
    carrier("BRAVO", 20000, 9000, 85), // north-east approaches
    carrier("CHARLIE", -27000, 8000, 125), // far west, off the NW chain
    carrier("DELTA", -8000, -16000, 275), // south-central basin
    carrier("ECHO", 6000, 12000, 40), // north of the airfield
    carrier("FOXTROT", 26000, 14000, 0), // north-east corner
    carrier("GOLF", 15000, -24000, 275), // southern waters
    carrier("HOTEL", -17000, 8000, 275), // between the west islands
  ],
};

// Anchorages shape terrain permanently; live ship positions must not reshape it.
const activeWorld: WorldDef = { ...ARCHIPELAGO, carriers: ARCHIPELAGO.carriers.map(c => ({ ...c })) };

/** Gentle oval patrols stay inside each anchorage's guaranteed deep water. */
export const FLEET_SPEED = 2.57; // m/s, maximum five knots
export function fleetPoseAt(index: number, seconds: number): { x: number; z: number; headingDeg: number } {
  const home = ARCHIPELAGO.carriers[index];
  const { fwd, right } = deckAxes(home.headingDeg);
  const phase = seconds * FLEET_SPEED / 220;
  const along = 220 * Math.sin(phase), across = 80 * (1 - Math.cos(phase));
  const vx = fwd[0] * 220 * Math.cos(phase) + right[0] * 80 * Math.sin(phase);
  const vz = fwd[1] * 220 * Math.cos(phase) + right[1] * 80 * Math.sin(phase);
  return {
    x: home.x + fwd[0] * along + right[0] * across,
    z: home.z + fwd[1] * along + right[1] * across,
    headingDeg: (Math.atan2(vx, -vz) * 180 / Math.PI + 360) % 360,
  };
}

/** Translation plus yaw velocity at a point on a patrol deck, in world axes. */
export function fleetVelocityAt(index: number, seconds: number, x: number, z: number): { x: number; z: number } {
  const home = ARCHIPELAGO.carriers[index], omega = FLEET_SPEED / 220;
  const phase = seconds * omega, { fwd, right } = deckAxes(home.headingDeg);
  const a = 220 * Math.cos(phase), b = 80 * Math.sin(phase);
  const da = -220 * Math.sin(phase) * omega, db = 80 * Math.cos(phase) * omega;
  const headingRate = (a * db - b * da) / (a * a + b * b);
  const pose = fleetPoseAt(index, seconds);
  return {
    x: (fwd[0] * a + right[0] * b) * omega - headingRate * (z - pose.z),
    z: (fwd[1] * a + right[1] * b) * omega + headingRate * (x - pose.x),
  };
}

export function setFleetTime(seconds: number): void {
  activeWorld.carriers.forEach((c, i) => Object.assign(c, fleetPoseAt(i, seconds)));
}

// ---------------------------------------------------------------------------
// Seed -> island chain
// ---------------------------------------------------------------------------

/** The world a fresh install flies, and the one `resetWorld()` returns to. */
export const DEFAULT_SEED = 1337;

/** Clamp anything the user (or the wire) hands us into a stable integer seed. */
export function sanitizeSeed(raw: number): number {
  if (!Number.isFinite(raw)) return DEFAULT_SEED;
  const n = Math.floor(raw);
  return ((n % 2147483647) + 2147483647) % 2147483647;
}

/**
 * The world a room code stands for — the code *is* the world.
 *
 * Every pilot who types the same code generates the same island chain locally,
 * so a seed is never shown, never copied around and never put on the wire. The
 * normalisation mirrors the net layer's room handling (upper case, alphanumerics
 * only, at most 10 characters), so "f14-alpha" and "F14ALPHA" are one world.
 * An empty code is solo flight, which flies the default world.
 */
export function worldSeedForRoom(raw: string): number {
  const code = normalizeRoomCode(raw);
  return code ? sanitizeSeed(hash32(code)) : DEFAULT_SEED;
}

function normalizeRoomCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

/** FNV-1a — cheap, and well spread for short codes. */
function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

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

/** A named summit — a landmark you can see from the air and steer by. */
interface Peak {
  x: number;
  z: number;
  h: number;
  r: number;
}

interface WorldGen {
  landmasses: Landmass[];
  peaks: Peak[];
  /** Base offset for every noise lookup, so two seeds never share a texture. */
  noise: number;
}

/** Baseline upland height so island interiors never sit at sea level. */
const LAND_BASE = 70;

/** How far an island's coast must stay from a carrier before it is accepted. */
const FLEET_CLEARANCE = 3000;
/** ... and from the airfield island, so the runway approach stays a valley. */
const HUB_CLEARANCE = 2500;

/**
 * Small deterministic PRNG (mulberry32). The island chain is a pure function of
 * the seed, so two pilots who agree on the number generate the same islands.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The island chain a seed stands for.
 *
 * The hub island always carries the airfield. The rest are strung on a jittered
 * ring across the 60 km square, each given one of four characters (volcanic
 * range, rugged fjord coast, rolling hills, low atoll). Candidates that would
 * crowd the airfield or a carrier anchorage are rejected rather than carved up,
 * so the runway and every ship keep clean water and a clear approach.
 */
function generateWorld(seed: number): WorldGen {
  const rnd = mulberry32(seed);
  const noise = Math.floor(rnd() * 1000000);
  const landmasses: Landmass[] = [];
  const peaks: Peak[] = [];
  const hubX = ARCHIPELAGO.airfield.centerX;
  const hubZ = ARCHIPELAGO.airfield.centerZ;

  // --- the hub: the airfield island, always present ---
  {
    const x = hubX + (rnd() - 0.5) * 600;
    const z = hubZ + (rnd() - 0.5) * 600;
    const r = 3800 + rnd() * 900;
    const ridgeAmp = 700 + rnd() * 520;
    landmasses.push({
      x, z, r, falloff: 3000,
      ridgeAmp, hillAmp: 180 + rnd() * 90, seed: 17 + Math.floor(rnd() * 60),
    });
    // Summits sit ~0.85r out, clear of the flattened runway plateau.
    peaks.push({ x: x - r * 0.65, z: z - r * 0.6, h: ridgeAmp * (0.85 + rnd() * 0.2), r: 900 + rnd() * 300 });
    peaks.push({ x: x + r * 0.7, z: z + r * 0.5, h: ridgeAmp * 0.6, r: 700 + rnd() * 250 });
  }

  // --- the chain: islands on a jittered ring, clear of the fleet ---
  const count = 12 + Math.floor(rnd() * 5);
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 24; attempt++) {
      const angle = rnd() * Math.PI * 2;
      const radius = 13000 + rnd() * 13000;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const r = 900 + rnd() * 2100;
      const falloff = r * (0.9 + rnd() * 0.5);
      const reach = r + falloff;
      if (Math.hypot(x - hubX, z - hubZ) <= reach + HUB_CLEARANCE) continue;
      if (ARCHIPELAGO.carriers.some((c) => Math.hypot(x - c.x, z - c.z) <= reach + FLEET_CLEARANCE)) continue;

      const kind = rnd();
      let ridgeAmp: number;
      let hillAmp: number;
      let base: number | undefined;
      let coastSharp: number | undefined;
      if (kind < 0.26) {
        // tall volcanic range
        ridgeAmp = 1150 + rnd() * 700;
        hillAmp = 200 + rnd() * 80;
        coastSharp = 0.55 + rnd() * 0.2;
      } else if (kind < 0.54) {
        // rugged fjord country
        ridgeAmp = 780 + rnd() * 480;
        hillAmp = 190 + rnd() * 70;
        coastSharp = 0.65 + rnd() * 0.15;
      } else if (kind < 0.78) {
        // rolling hills
        ridgeAmp = 360 + rnd() * 380;
        hillAmp = 120 + rnd() * 70;
      } else {
        // low sandy atoll
        ridgeAmp = 80 + rnd() * 130;
        hillAmp = 50 + rnd() * 40;
        base = 14 + rnd() * 12;
      }
      landmasses.push({
        x, z, r, falloff, ridgeAmp, hillAmp,
        seed: 10 + Math.floor(rnd() * 900), base, coastSharp,
      });
      if (ridgeAmp > 750) {
        peaks.push({ x: x - r * 0.35, z: z - r * 0.3, h: ridgeAmp * (0.7 + rnd() * 0.3), r: 650 + rnd() * 400 });
        if (rnd() < 0.55) {
          peaks.push({ x: x + r * 0.4, z: z + r * 0.35, h: ridgeAmp * 0.6, r: 550 + rnd() * 350 });
        }
      }
      break; // placed — move on to the next island
    }
  }

  return { landmasses, peaks, noise };
}

// ---------------------------------------------------------------------------
// Active world
// ---------------------------------------------------------------------------

let activeSeed = DEFAULT_SEED;
let activeSampler: (x: number, z: number) => number = makeProceduralSampler(DEFAULT_SEED);

/**
 * Regenerate the world for `seed`. Deterministic and synchronous — no fetch and
 * no network — so a client can rebuild the room's terrain from the host's seed
 * the instant the seed arrives.
 */
export function setWorldSeed(seed: number): void {
  setFleetTime(0);
  activeSeed = sanitizeSeed(seed);
  activeSampler = makeProceduralSampler(activeSeed);
}

export function resetWorld(): void {
  setWorldSeed(DEFAULT_SEED);
}

export function activeWorldSeed(): number {
  return activeSeed;
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

/**
 * Heading in degrees (0 = north, clockwise) for a body whose forward axis is
 * -Z — the convention every aircraft here uses. The map draws everything
 * north-up, so this is the number that turns a marker into an arrow.
 */
export function headingOfQuat(q: { x: number; y: number; z: number; w: number }): number {
  const fx = -2 * (q.x * q.z + q.y * q.w);
  const fz = -(1 - 2 * (q.x * q.x + q.y * q.y));
  return ((Math.atan2(fx, -fz) * 180) / Math.PI + 360) % 360;
}

/** Heading in degrees from a velocity vector (0 = north). Unmoving = 0. */
export function headingOfVel(v: { x: number; z: number }): number {
  if (v.x * v.x + v.z * v.z < 25) return 0;
  return ((Math.atan2(v.x, -v.z) * 180) / Math.PI + 360) % 360;
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
  // --- flatten airfield plateau (fully flat within runway + 300 m, fades over
  // 500 m). The margins are generous on purpose: the terrain mesh is coarse
  // over a 60 km world (a cell is 150-300 m), and a plateau only as wide as the
  // runway would let an interpolated triangle poke up through the runway slab
  // at low graphics settings.
  const dx = Math.abs(x - af.centerX);
  const dz = Math.abs(z - af.centerZ);
  const halfL = af.runwayLength / 2 + 300;
  const halfW = af.runwayWidth / 2 + 300;
  const boxDist = Math.hypot(Math.max(dx - halfL, 0), Math.max(dz - halfW, 0));
  const runwayFlat = 1 - smoothstep(0, 500, boxDist);
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

// ---------------------------------------------------------------------------
// Procedural terrain — a small archipelago: the main island carries the
// airfield, the others give the world a varied mix (a tall volcanic range,
// rugged fjord country, a low atoll, an islet chain). All of it is analytic
// and deterministic, so the sim can query heights for physics any time.
// ---------------------------------------------------------------------------

function makeProceduralSampler(seed: number): (x: number, z: number) => number {
  const { landmasses, peaks, noise } = generateWorld(seed);
  const af = ARCHIPELAGO.airfield;

  return (x: number, z: number) => {
    // --- domain warp: meandering ridgelines, ragged coastlines ---
    const wxo = fbm(x * 0.00008, z * 0.00008, noise + 3, 3) - 0.5;
    const wzo = fbm(x * 0.00008, z * 0.00008, noise + 9, 3) - 0.5;
    const wx = x + wxo * 3600;
    const wz = z + wzo * 3600;
    const coastWarp = (fbm(x * 0.00022, z * 0.00022, noise + 71, 4) - 0.5) * 2600;

    // --- land mask: strongest island wins and brings its own character ---
    let land = 0;
    let nearCoast = 0;
    let ridgeAmp = 0;
    let hillAmp = 0;
    let baseH = LAND_BASE;
    for (const m of landmasses) {
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
    const rangeMask = smoothstep(0.34, 0.72, fbm(wx * 0.00011, wz * 0.00011, noise + 5, 3));
    const rid = ridged(wx * 0.0003, wz * 0.0003, noise, 5);
    const hills = fbm(wx * 0.0007, wz * 0.0007, noise + 9, 5);
    const detail = fbm(x * 0.004, z * 0.004, noise + 23, 3);
    let peak = 0;
    for (const p of peaks) {
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
    const seabed = (-14 - ridged(x * 0.00022, z * 0.00022, noise + 40, 3) * 130) * (1 - 0.5 * nearCoast);
    const h = relief + seabed * (1 - land);

    return applyLayoutOps(x, z, h, af, ARCHIPELAGO.carriers);
  };
}
