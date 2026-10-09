// Laser designation: turn a screen pick into a world point the bombs can be
// guided to.
//
// The heightfield is analytic, so there is nothing to raycast against — marching
// the ray against groundAt() is cheaper than intersecting the terrain mesh and,
// more importantly, it agrees exactly with the physics the bombs fly in. Ship
// decks that are not part of the active layout (the hostile carrier) get an
// explicit plane test, because groundAt() knows nothing about them.

import * as THREE from "three";
import { groundAt, isOnDeck, type CarrierDef, type SurfaceKind } from "./world";

export interface Designation {
  /** Where the laser is pointed, on the surface. */
  pos: THREE.Vector3;
  /** Slant range from the sensor, metres. */
  range: number;
  surface: SurfaceKind;
  /** The designator is on a flight deck (friendly or hostile). */
  onDeck: boolean;
}

const MARCH_STEP = 22; // m
const BISECT = 12; // refinement iterations -> sub-centimetre
const MAX_RANGE = 24000;

const RAYCASTER = new THREE.Raycaster();
const NDC = new THREE.Vector2();

/** Ray through a normalised-device-coordinate point on the camera. */
export function screenRay(
  camera: THREE.PerspectiveCamera,
  ndcX: number,
  ndcY: number,
  outOrigin: THREE.Vector3,
  outDir: THREE.Vector3,
): void {
  NDC.set(ndcX, ndcY);
  RAYCASTER.setFromCamera(NDC, camera);
  outOrigin.copy(RAYCASTER.ray.origin);
  outDir.copy(RAYCASTER.ray.direction).normalize();
}

/**
 * The first surface along a ray: terrain, runway, water, or a carrier deck.
 * Returns null when the ray reaches the sky within `maxRange`.
 */
export function pickDesignation(
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  extraDecks: CarrierDef[] = [],
  maxRange = MAX_RANGE,
): Designation | null {
  // --- ship decks that groundAt() does not know about ---
  let deckT = Infinity;
  let deckSurface: SurfaceKind = "deck";
  for (const deck of extraDecks) {
    if (dir.y >= -1e-5 || origin.y <= deck.deckY) continue;
    const t = (deck.deckY - origin.y) / dir.y;
    if (t < 0 || t > maxRange || t >= deckT) continue;
    const x = origin.x + dir.x * t;
    const z = origin.z + dir.z * t;
    if (!isOnDeck(deck, x, z)) continue;
    deckT = t;
    deckSurface = "deck";
  }

  // --- march the terrain / sea, then bisect the crossing ---
  let prevT = 0;
  for (let t = MARCH_STEP; t <= maxRange; t += MARCH_STEP) {
    if (t > deckT) break; // a deck is nearer than anything we will find now
    const x = origin.x + dir.x * t;
    const y = origin.y + dir.y * t;
    const z = origin.z + dir.z * t;
    const g = groundAt(x, z);
    if (y <= g.y) {
      let lo = prevT;
      let hi = t;
      for (let i = 0; i < BISECT; i++) {
        const mid = (lo + hi) / 2;
        const mx = origin.x + dir.x * mid;
        const my = origin.y + dir.y * mid;
        const mz = origin.z + dir.z * mid;
        if (my <= groundAt(mx, mz).y) hi = mid;
        else lo = mid;
      }
      if (hi < deckT) {
        const hit = new THREE.Vector3(
          origin.x + dir.x * hi,
          origin.y + dir.y * hi,
          origin.z + dir.z * hi,
        );
        const surface = groundAt(hit.x, hit.z).kind;
        return { pos: hit, range: hi, surface, onDeck: surface === "deck" };
      }
      break;
    }
    prevT = t;
  }

  if (deckT < Infinity) {
    const hit = new THREE.Vector3(
      origin.x + dir.x * deckT,
      origin.y + dir.y * deckT,
      origin.z + dir.z * deckT,
    );
    return { pos: hit, range: deckT, surface: deckSurface, onDeck: true };
  }
  return null;
}
