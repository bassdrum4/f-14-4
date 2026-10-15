// Module-level scratch and the sim's small pure geometry helpers. The sim steps
// at 120 Hz, so nothing here allocates per call: subsystems borrow these by name
// and must not expect the contents to survive across two of their own uses.

import * as THREE from "three";
import { isSharedMaterial } from "../../render/lights";
import { groundAt } from "../world";

// --- scratch vectors (step runs at 120 Hz; nothing allocates per call) ---
export const FWD = new THREE.Vector3();
export const TO_P = new THREE.Vector3();
export const PFWD = new THREE.Vector3();
export const DESIRED = new THREE.Vector3();
export const SEP = new THREE.Vector3();
export const LAT = new THREE.Vector3();
export const AIM = new THREE.Vector3();
export const AHEAD = new THREE.Vector3();
export const AXIS = new THREE.Vector3();
export const TMP = new THREE.Vector3();
export const REF = new THREE.Vector3();
export const CVPT = new THREE.Vector3(); // the hostile deck as a lock point
export const DIR = new THREE.Vector3();
export const TR_Z = new THREE.Vector3(0, 0, 1);
/** Stores are modelled nose-first down -Z; this is the axis that follows the
 *  velocity vector. */
export const NOSE_Z = new THREE.Vector3(0, 0, -1);
export const MAT4 = new THREE.Matrix4();
export const ROLL_Q = new THREE.Quaternion();
export const HQ = new THREE.Quaternion();
export const PITCH_Q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.105);
export const Z_AXIS = new THREE.Vector3(0, 0, 1);
export const WORLD_UP = new THREE.Vector3(0, 1, 0);
export const SYNC = new THREE.Vector3(); // the mirrored pose target

/**
 * Mirroring: how far past the newest packet a wingman's enemies are flown, and
 * how fast a correction is eased in. Packets arrive at ~7.5 Hz, so running a
 * little ahead of the last one keeps motion smooth — and costs less lag than
 * sitting a whole packet interval behind it.
 */
export const MIRROR_LEAD = 0.07; // s
export const MIRROR_EASE = 0.09; // s
export const ORIGIN = new THREE.Vector3();
// Dedicated scratch for the gun cue: it is evaluated from the render loop, so
// it must not share vectors with the fixed-step sim.
export const GUN_PREV = new THREE.Vector3();
export const GUN_P = new THREE.Vector3();
export const GUN_V = new THREE.Vector3();
export const GUN_FWD = new THREE.Vector3();
export const GUN_MUZ = new THREE.Vector3();
export const GUN_T = new THREE.Vector3();
export const GUN_B = new THREE.Vector3(); // bandit lead position inside the cue march
/** Beyond this the crosshair is drawn faded: the burst is out of reach. */
export const GUN_RANGE = 2000;
/** The gun cue integrates at the sim step so it matches the tracers exactly. */
export const GUN_DT = 1 / 120;

/** Deterministic hash in 0..1 — the sim's stand-in for Math.random. */
export function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}


/**
 * Release every geometry/material under `node` (a wreck or a retired ship).
 * Fleet-wide materials — nav lights, ship lamps — are left alone: they are
 * shared with every other aircraft and ship in the sky.
 */
export function disposeSubtree(node: THREE.Object3D): void {
  node.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
    const mat = mesh.material as THREE.Material | undefined;
    if (mat && !isSharedMaterial(mat)) mat.dispose();
  });
}

/**
 * True when terrain rises above the straight line between two points. Eight
 * samples along the line catch ridges and canyon walls reliably for both radar
 * terrain-masking and gunnery checks. Exported for the headless dogfight checks.
 */
export function terrainBlocks(a: THREE.Vector3, b: THREE.Vector3): boolean {
  for (let i = 1; i <= 8; i++) {
    const t = i / 9;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const z = a.z + (b.z - a.z) * t;
    if (groundAt(x, z).y > y) return true;
  }
  return false;
}

/** True when the segment a->b passes within `r` of point p. */
export function segSphere(a: THREE.Vector3, b: THREE.Vector3, p: THREE.Vector3, r: number): boolean {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
  const apx = p.x - a.x, apy = p.y - a.y, apz = p.z - a.z;
  const ab2 = abx * abx + aby * aby + abz * abz;
  const t = ab2 > 1e-9 ? Math.max(0, Math.min(1, (apx * abx + apy * aby + apz * abz) / ab2)) : 0;
  const dx = apx - abx * t, dy = apy - aby * t, dz = apz - abz * t;
  return dx * dx + dy * dy + dz * dz <= r * r;
}
