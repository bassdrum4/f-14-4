import * as THREE from "three";
import type { AircraftState } from "../flight";
import { SHIP_MISSILE_RANGE, shipGunQuaternion } from "../surface";
import { groundAt } from "../world";
import type { Dogfight } from "./core";
import type { Missile } from "./types";

type NavalLock = NonNullable<Missile["naval"]>;

/** Select within a radar director cone; a launch retains that target identity. */
export function navalLock(ctx: Dogfight, player: AircraftState, point?: THREE.Vector3): NavalLock | null {
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(shipGunQuaternion(player, new THREE.Quaternion()));
  let best: NavalLock | null = null, score = Infinity;
  const consider = (kind: NavalLock["kind"], id: number | string, pos: THREE.Vector3) => {
    const to = pos.clone().sub(player.pos), range = to.length();
    if (range < 100 || range > (ctx.versus ? 12_000 : SHIP_MISSILE_RANGE)) return;
    const angle = direction.angleTo(to);
    if (angle > Math.PI / 3) return;
    const cost = angle + range / SHIP_MISSILE_RANGE * .15;
    if (cost < score) { score = cost; best = { kind, id, point: pos.clone(), cruiseHeight: 0 }; }
  };
  if (point) {
    if (point.distanceTo(player.pos) > (ctx.versus ? 12_000 : SHIP_MISSILE_RANGE) || point.distanceTo(player.pos) < 100) return null;
    // Attach a surface designation to a moving convoy target when possible.
    const target = ctx.strikeTargets.find(t => !t.dead && !t.arrived && t.pos.distanceTo(point) < t.radius + 30);
    best = { kind: target ? "surface" : "point", id: target?.id ?? 0, point: point.clone(), cruiseHeight: 0 };
  } else {
    for (const b of ctx.bandits) if (b.catT < 0) consider("air", b.id, b.pos);
    for (const t of ctx.strikeTargets) if (!t.dead && !t.arrived) consider("surface", t.id, t.pos.clone().add(new THREE.Vector3(0, 8, 0)));
    for (const o of ctx.opponents) consider("pilot", o.id, o.pos);
    if (ctx.cv && ctx.cv.status !== "sinking" && ctx.cv.status !== "sunk") consider("carrier", 0, new THREE.Vector3(ctx.cv.def.x, ctx.cv.def.deckY + 2, ctx.cv.def.z));
  }
  if (!best) return null;
  const lock = best as NavalLock;
  // Terrain clearance is computed once at launch along the whole corridor.
  // The terminal leg then dives to the locked surface target.
  if (lock.kind !== "air" && lock.kind !== "pilot") {
    lock.cruiseHeight = Math.max(200, lock.point.y + 180);
    for (let i = 0; i <= 64; i++) {
      const p = player.pos.clone().lerp(lock.point, i / 64);
      lock.cruiseHeight = Math.max(lock.cruiseHeight, groundAt(p.x, p.z).y + 180);
    }
  }
  return lock;
}

export function launchNavalMissile(ctx: Dogfight, player: AircraftState, point?: THREE.Vector3): boolean {
  if (player.result || ctx.missileCd > 0) return false;
  if (ctx.missilesLeft <= 0 || !ctx.missilePool.length) { ctx.banner(player, "VLS EMPTY — STOP NEAR A FRIENDLY CARRIER AND HOLD REARM"); return false; }
  const lock = navalLock(ctx, player, point);
  if (!lock) { ctx.banner(player, `NO VLS LOCK — AIM AT A CONTACT WITHIN ${ctx.versus ? 12 : 18} KM`); return false; }
  // Use the common launch path for pooling, stores, feedback and network shots.
  ctx.fireMissile(player);
  const missile = ctx.missiles[ctx.missiles.length - 1];
  missile.naval = lock;
  missile.motor = ctx.versus ? 20 : 32;
  missile.life = ctx.versus ? 26 : 48;
  ctx.banner(player, `${lock.kind === "air" || lock.kind === "pilot" ? "SAM" : "STRIKE MISSILE"} AWAY — VLS ${ctx.missilesLeft}/${ctx.missilesMax}`);
  return true;
}

/** Resolve live target motion without allowing a weapon to jump to a new one. */
export function navalTarget(ctx: Dogfight, m: Missile): THREE.Vector3 | null {
  const lock = m.naval!;
  if (lock.kind === "air") {
    const b = ctx.bandits.find(b => b.id === lock.id && b.catT < 0);
    if (!b) return null;
    lock.point.copy(b.pos);
    return b.pos.clone().addScaledVector(new THREE.Vector3(0, 0, -b.speed).applyQuaternion(b.quat), Math.min(1.5, b.pos.distanceTo(m.pos) / 640));
  }
  if (lock.kind === "pilot") {
    const p = ctx.opponents.find(o => o.id === lock.id);
    if (!p) return null;
    lock.point.copy(p.pos); return p.pos;
  }
  if (lock.kind === "surface") {
    const t = ctx.strikeTargets.find(t => t.id === lock.id && !t.dead && !t.arrived);
    if (!t) return null;
    lock.point.copy(t.pos).y += 8;
  } else if (lock.kind === "carrier") {
    if (!ctx.cv || ctx.cv.status === "sinking" || ctx.cv.status === "sunk") return null;
    lock.point.set(ctx.cv.def.x, ctx.cv.def.deckY + 2, ctx.cv.def.z);
  }
  const aim = lock.point.clone();
  if (Math.hypot(aim.x - m.pos.x, aim.z - m.pos.z) > Math.max(600, lock.cruiseHeight * .7)) aim.y = lock.cruiseHeight;
  return aim;
}
