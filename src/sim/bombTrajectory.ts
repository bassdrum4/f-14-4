// Shared by the live weapon and the release check. Controls and guidance stay
// unchanged: drag, gravity, position integration, then the laser's turn limit.
import { Vector3 } from 'three';
import { atmosphere } from './atmosphere';
import { groundAt, isOnDeck, type CarrierDef } from './world';
const MASS = 450, DRAG = .28, AREA = .05, TURN_RATE = .55;
const direction = new Vector3(), toTarget = new Vector3(), axis = new Vector3();
export const BOMB_ARM_TIME = .35;
export const BOMB_DETONATION_RADIUS = 10;
export function advanceBomb(pos: Vector3, vel: Vector3, target: Vector3 | null, dt: number): void {
  const k = .5 * atmosphere(pos.y).rho * DRAG * AREA * vel.length() / MASS;
  vel.multiplyScalar(Math.max(0, 1 - k * dt));
  vel.y -= 9.81 * dt;
  pos.addScaledVector(vel, dt);
  if (!target) return;
  const speed = vel.length();
  if (speed <= 1) return;
  direction.copy(vel).divideScalar(speed);
  toTarget.copy(target).sub(pos).normalize();
  const angle = direction.angleTo(toTarget);
  if (angle <= 1e-4) return;
  axis.crossVectors(direction, toTarget);
  if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0);
  direction.applyAxisAngle(axis.normalize(), Math.min(angle, TURN_RATE * dt));
  vel.copy(direction).multiplyScalar(speed);
}
export function canBombReach(start: Vector3, velocity: Vector3, target: Vector3, deck: CarrierDef | null = null): boolean {
  const pos = start.clone(), vel = velocity.clone();
  const dt = 1 / 120;
  for (let step = 1; step <= 120 * 120; step++) {
    advanceBomb(pos, vel, target, dt);
    if (step * dt < BOMB_ARM_TIME) continue;
    if (pos.distanceToSquared(target) < BOMB_DETONATION_RADIUS ** 2) return true;
    if (deck && pos.y <= deck.deckY + 2 && isOnDeck(deck, pos.x, pos.z)) {
      // A deck hit inside the target's blast radius also reaches that spot.
      return pos.distanceTo(target) < 30;
    }
    if (pos.y <= groundAt(pos.x, pos.z).y) return pos.distanceTo(target) < BOMB_DETONATION_RADIUS;
  }
  return false;
}
