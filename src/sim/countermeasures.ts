import { Vector3 } from 'three';

/** Shared by damaging seekers and the remote missile presentation. */
export interface FlareTarget {
  pos: Vector3;
  life: number;
  /** null denotes this pilot's own cartridge. */
  owner: string | null;
  ownerLife: number;
}
export interface Seeker {
  pos: Vector3;
  vel: Vector3;
  life: number;
  seed: number;
}
const direction = new Vector3(), offset = new Vector3();
export function captureFlare<T extends FlareTarget>(
  missile: Seeker, flares: readonly T[], dt: number,
  accept: (flare: T) => boolean,
): T | null {
  const speed = missile.vel.length();
  if (speed <= 1) return null;
  direction.copy(missile.vel).divideScalar(speed);
  let best: T | null = null, bestAngle = Infinity;
  for (const flare of flares) {
    if (flare.life <= 0 || !accept(flare)) continue;
    offset.copy(flare.pos).sub(missile.pos);
    const distance = offset.length();
    if (distance > 900 || distance < 1e-3) continue;
    const angle = direction.angleTo(offset.divideScalar(distance));
    if (angle > .6 || angle >= bestAngle) continue;
    best = flare; bestAngle = angle;
  }
  if (!best) return null;
  const rate = 3.6 * (1 - bestAngle / .6);
  const n = missile.seed + missile.pos.x * .31 + missile.pos.y * .17 + missile.pos.z * .53 + missile.life * 7.7;
  const noise = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return noise - Math.floor(noise) < 1 - Math.exp(-rate * dt) ? best : null;
}

/** Current range / relative closing speed; zero means the range is opening. */
export function missileWarning(pos: Vector3, vel: Vector3, playerPos: Vector3, playerVel: Vector3) {
  offset.copy(playerPos).sub(pos);
  const range = offset.length();
  const closing = range > 0 ? direction.copy(vel).sub(playerVel).dot(offset.divideScalar(range)) : 0;
  return {
    km: range / 1000,
    brgDeg: Math.atan2(pos.x - playerPos.x, -(pos.z - playerPos.z)) * 180 / Math.PI,
    sec: closing > 1 ? range / closing : 0,
  };
}
