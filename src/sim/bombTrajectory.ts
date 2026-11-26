// Ballistic fall for the enemy bombers' stores. Player bombs are dropped by the
// target pod and follow their own arc in combat/ordnance.ts; these are the
// weapons the mission's bombers release at the fleet.
import { Vector3 } from 'three';
import { atmosphere } from './atmosphere';
const MASS = 450, DRAG = .28, AREA = .05, TURN_RATE = .55;
// The canards buy every correction with lift, and lift costs speed: each radian
// of steering takes this fraction off the weapon's speed. With it, hard
// corrections bleed energy and the envelope becomes the few kilometres a
// laser-guided store actually has.
const TURN_DRAG = .22;
// How long the designator keeps guiding one weapon. When the window closes the
// store flies the rest of the way ballistically, like any other iron bomb.
export const BOMB_GUIDANCE_TIME = 34;
const direction = new Vector3(), toTarget = new Vector3(), axis = new Vector3();
export const BOMB_ARM_TIME = .35;
/**
 * One step of a store in flight. `target` steers it (null flies ballistics) and
 * `age` is seconds since release: the laser only guides inside its window.
 */
export function advanceBomb(pos: Vector3, vel: Vector3, target: Vector3 | null, dt: number, age = 0): void {
  const k = .5 * atmosphere(pos.y).rho * DRAG * AREA * vel.length() / MASS;
  vel.multiplyScalar(Math.max(0, 1 - k * dt));
  vel.y -= 9.81 * dt;
  pos.addScaledVector(vel, dt);
  if (!target || age >= BOMB_GUIDANCE_TIME) return;
  const speed = vel.length();
  if (speed <= 1) return;
  direction.copy(vel).divideScalar(speed);
  toTarget.copy(target).sub(pos).normalize();
  const angle = direction.angleTo(toTarget);
  if (angle <= 1e-4) return;
  axis.crossVectors(direction, toTarget);
  if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0);
  const turn = Math.min(angle, TURN_RATE * dt);
  direction.applyAxisAngle(axis.normalize(), turn);
  vel.copy(direction).multiplyScalar(speed * Math.max(0, 1 - TURN_DRAG * turn));
}
