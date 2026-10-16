// Co-op state: the host's combat frame on the wire and how a mirror applies it.

import * as THREE from "three";
import { Operation } from "../operations";
import { validSharedCombat } from "../combatSnapshot";
import type { SharedCombat } from "../combatSnapshot";
import { wreckTarget } from "../../render/targets";
import type { AircraftState } from "../flight";
import { carriers } from "../world";
import type { EnemyHit, EnemyPose, EnemySnapshot } from "./types";
import { HIT_FLASH, NO_HITS } from "./tuning";
import { CVPT, disposeSubtree } from "./scratch";

import type { Dogfight } from "./core";

export function sharedSnapshot(ctx: Dogfight): SharedCombat {
  const enemies = ctx.enemySnapshot();
  const finite = (n: number | undefined) => Number.isFinite(n) ? n! : 0;
  return { version: 1, id: ctx.combatId, revision: ++ctx.combatRevision, scenario: ctx.scenario, active: ctx.active,
    wave: ctx.wave, kills: ctx.kills, nextId: ctx.nextId, carrier: enemies.carrier ? { ...enemies.carrier } : null,
    fireSerial: ctx.fireSerial,
    bombs: ctx.enemyBombs.map(b => ({ id: b.id, pos: b.pos.toArray(), vel: b.vel.toArray(), age: b.age })),
    operation: ctx.operation ? { ...ctx.operation.state } : null, queue: [...ctx.roleQueue], launchTimer: ctx.launchTimer,
    targets: ctx.strikeTargets.map(t => ({ id: t.id, kind: t.kind, role: t.role ?? "practice", x: t.pos.x, y: t.pos.y, z: t.pos.z, hp: t.hp,
      sea: t.sea, dead: t.dead, disabled: t.disabled ?? false, arrived: t.arrived ?? false, headingDeg: t.headingDeg, speed: t.speed,
      progress: t.progress ?? 0, route: t.route ? { ...t.route } : null, ammo: t.ammo ?? 0, tracking: t.tracking ?? 0, cooldown: t.cooldown ?? 0 })),
    bandits: ctx.bandits.map(b => ({ id: b.id, x: b.pos.x, y: b.pos.y, z: b.pos.z, qx: b.quat.x, qy: b.quat.y, qz: b.quat.z, qw: b.quat.w,
      hp: b.hp, onDeck: b.catT >= 0, role: b.role ?? "fighter", speed: b.speed, missiles: b.missiles, ammo: b.ammo ?? 70,
      bombs: b.bombs ?? 0, retreat: b.retreat ?? false, sortieTime: b.sortieTime ?? 0, launchWave: b.launchWave ?? ctx.wave,
      missileCd: finite(b.missileCd), fireCd: finite(b.fireCd), burst: b.burst, catT: b.catT, catAcross: b.catAcross ?? 0, climbT: b.climbT })),
  };
}

export function applySharedSnapshot(ctx: Dogfight, frame: SharedCombat, nowMs: number): void {
  if (!ctx.mirror || !validSharedCombat(frame) || frame.id !== ctx.combatId || frame.revision <= ctx.receivedRevision) return;
  const hadSnapshot = ctx.receivedRevision >= 0;
  if (hadSnapshot && ctx.operation && frame.operation && frame.operation.fleetHull < ctx.operation.state.fleetHull) {
    const c = carriers()[frame.operation.fleetCarrier] ?? carriers()[0]; ctx.blasts.spawn(new THREE.Vector3(c.x, c.deckY + 2, c.z), "ground", 1.8);
  }
  if (hadSnapshot && frame.kills > ctx.kills) ctx.confirmDamage("TEAM TARGET DESTROYED", "destroyed");
  ctx.receivedRevision = frame.revision; ctx.combatRevision = frame.revision;
  ctx.fireSerial = Math.max(frame.fireSerial, ctx.receivedFire);
  ctx.scenario = frame.scenario; ctx.active = frame.active; ctx.wave = frame.wave; ctx.kills = frame.kills;
  ctx.operation = frame.operation ? new Operation({ ...frame.operation }) : null;
  if (frame.operation?.kind === "bastion" || frame.operation?.kind === "convoy") ctx.strikeVariant = frame.operation.kind;
  ctx.authored = !!frame.operation; ctx.roleQueue = [...frame.queue]; ctx.launchTimer = frame.launchTimer; ctx.nextId = frame.nextId;
  ctx.applyRemoteCarrier(frame.carrier);
  const seen = new Set<number>();
  for (const p of frame.targets) {
    seen.add(p.id);
    let t = ctx.strikeTargets.find(t => t.id === p.id);
    if (t && p.disabled && !t.disabled) ctx.confirmDamage("TEAM TRANSPORT DISABLED", "destroyed");
    if (!t) { ctx.spawnTarget(p.kind, p.x, p.y, p.z, p.headingDeg, p.sea); t = ctx.strikeTargets[ctx.strikeTargets.length - 1]; t.id = p.id; }
    if (p.dead && !t.dead) wreckTarget(t.mesh);
    Object.assign(t, { role: p.role, hp: p.hp, dead: p.dead, disabled: p.disabled, arrived: p.arrived, headingDeg: p.headingDeg,
      speed: p.speed, progress: p.progress, route: p.route ? { ...p.route } : null, ammo: p.ammo, tracking: p.tracking, cooldown: p.cooldown });
    t.pos.set(p.x, p.y, p.z); t.mesh.position.copy(t.pos); t.mesh.rotation.y = ((90 - t.headingDeg) * Math.PI) / 180;
    t.mesh.visible = !t.arrived;
  }
  for (let i = ctx.strikeTargets.length - 1; i >= 0; i--) if (!seen.has(ctx.strikeTargets[i].id)) {
    const t = ctx.strikeTargets[i]; t.mesh.removeFromParent(); disposeSubtree(t.mesh); ctx.strikeTargets.splice(i, 1);
  }
  ctx.snapDt = ctx.snapAt > 0 ? THREE.MathUtils.clamp((nowMs - ctx.snapAt) / 1000, .05, .6) : .2; ctx.snapAt = nowMs;
  seen.clear();
  for (const p of frame.bandits) {
    seen.add(p.id); let b = ctx.findBandit(p.id);
    if (b && b.role !== p.role) { ctx.removeBandit(b); b = null; }
    if (!b) b = ctx.spawnMirrorBandit(p);
    Object.assign(b, { role: p.role, hp: p.hp, speed: p.speed, missiles: p.missiles, ammo: p.ammo, bombs: p.bombs, retreat: p.retreat,
      sortieTime: p.sortieTime, launchWave: p.launchWave, missileCd: p.missileCd, fireCd: p.fireCd, burst: p.burst,
      catT: p.catT, catAcross: p.catAcross, climbT: p.climbT });
    b.netVel.set(0, 0, -p.speed).applyQuaternion(new THREE.Quaternion(p.qx, p.qy, p.qz, p.qw));
    b.netPos.set(p.x, p.y, p.z); b.netQuat.set(p.qx, p.qy, p.qz, p.qw);
  }
  for (let i = ctx.bandits.length - 1; i >= 0; i--) if (!seen.has(ctx.bandits[i].id)) ctx.removeBandit(ctx.bandits[i]);
  ctx.nextId = frame.nextId;
  const bombIds = new Set(frame.bombs.map(b => b.id));
  for (let i = ctx.enemyBombs.length - 1; i >= 0; i--) if (!bombIds.has(ctx.enemyBombs[i].id)) ctx.retireEnemyBomb(i);
  for (const p of frame.bombs) {
    let b = ctx.enemyBombs.find(b => b.id === p.id);
    if (!b) b = ctx.createEnemyBomb(p.id, new THREE.Vector3().fromArray(p.pos), new THREE.Vector3().fromArray(p.vel));
    b.pos.fromArray(p.pos); b.vel.fromArray(p.vel); b.age = p.age;
  }
}


// -------------------------------------------------------------------------
// Multiplayer: the room's fight
// -------------------------------------------------------------------------

/**
 * Hand the fight to the room, or take it back. A wingman mirrors the host's
 * enemies instead of running its own; the host runs them and streams them.
 * Switching authority drops the other pilot's bandits, so the two sims never
 * mix into one sky.
 */
export function setMirror(ctx: Dogfight, on: boolean, player: AircraftState): void {
  if (ctx.mirror === on) return;
  ctx.mirror = on;
  if (!ctx.operation || on) ctx.clearBandits();
  else for (const b of ctx.bandits) {
    // Display interpolation may lag a frame or lead a launch off the deck.
    // Authority resumes from the last accepted host pose, not that display.
    b.pos.copy(b.netPos); b.quat.copy(b.netQuat); b.remote = false;
    b.mesh.group.position.copy(b.pos); b.mesh.group.quaternion.copy(b.quat);
  }
  ctx.takenDown.clear();
  ctx.hitsOut = [];
  ctx.carrierHitOut = 0;
  if (on) {
    ctx.clearTargets(); ctx.operation = null; ctx.receivedRevision = -1;
    // Our own boat is the host's business now; theirs arrives on the next
    // packet. Our wave queue goes with it.
    ctx.releaseCarrier();
    ctx.launchQueued = 0;
  } else if (!ctx.cv && !ctx.operation && ctx.scenario === "dogfight" && !ctx.versus) {
    // Promoted to lead mid-flight: the boat is ours again, and stepWaves will
    // spot the next wave on it.
    ctx.spawnEnemyCarrier(player);
  }
}


/**
 * The fight for the wire, as the host sees it. The object is reused: the net
 * layer packs it on the spot, so it must not be stored.
 */
export function enemySnapshot(ctx: Dogfight): EnemySnapshot {
  const s = ctx.snapOut;
  const cv = ctx.cv;
  if (cv) {
    const c = s.carrier ?? (s.carrier = { x: 0, z: 0, headingDeg: 0, hp: 0, status: "closing" });
    c.x = cv.def.x;
    c.z = cv.def.z;
    c.headingDeg = cv.def.headingDeg;
    c.hp = cv.hp;
    c.status = cv.status;
  } else {
    s.carrier = null;
  }
  s.wave = ctx.wave;
  const n = ctx.bandits.length;
  s.bandits.length = n;
  for (let i = 0; i < n; i++) {
    const b = ctx.bandits[i];
    const p = s.bandits[i];
    const e: EnemyPose = p ?? {
      id: 0, x: 0, y: 0, z: 0, qx: 0, qy: 0, qz: 0, qw: 1, hp: 0, onDeck: false,
    };
    e.id = b.id;
    e.x = b.pos.x;
    e.y = b.pos.y;
    e.z = b.pos.z;
    e.qx = b.quat.x;
    e.qy = b.quat.y;
    e.qz = b.quat.z;
    e.qw = b.quat.w;
    e.hp = b.hp;
    e.onDeck = b.catT >= 0;
    s.bandits[i] = e;
  }
  return s;
}


/**
 * A packet from the host: put the room's enemies where the host says they are.
 * Bandits are matched by id, so one that joins or dies on the host simply
 * appears or disappears here.
 */
export function applyRemoteSnapshot(ctx: Dogfight, snap: EnemySnapshot, nowMs: number): void {
  if (!ctx.mirror || ctx.operation) return;
  ctx.snapDt = ctx.snapAt > 0
    ? THREE.MathUtils.clamp((nowMs - ctx.snapAt) / 1000, 0.05, 0.6)
    : 0.14;
  ctx.snapAt = nowMs;
  ctx.wave = snap.wave;
  ctx.applyRemoteCarrier(snap.carrier);
  const seen = new Set<number>();
  for (const p of snap.bandits) {
    seen.add(p.id);
    const down = ctx.takenDown.get(p.id);
    if (down !== undefined) {
      if (nowMs - down < 4000) continue;
      ctx.takenDown.delete(p.id);
    }
    const b = ctx.findBandit(p.id) ?? ctx.spawnMirrorBandit(p);
    b.hp = p.hp;
    b.catT = p.onDeck ? 0 : -1;
    // The velocity two packets imply lets the mesh run a little ahead of the
    // stream; on a brand new bandit it is zero, which is exactly right.
    b.netVel.set(
      (p.x - b.netPos.x) / ctx.snapDt,
      (p.y - b.netPos.y) / ctx.snapDt,
      (p.z - b.netPos.z) / ctx.snapDt,
    );
    b.speed = b.netVel.length();
    b.netPos.set(p.x, p.y, p.z);
    b.netQuat.set(p.qx, p.qy, p.qz, p.qw);
  }
  for (let i = ctx.bandits.length - 1; i >= 0; i--) {
    const b = ctx.bandits[i];
    if (!seen.has(b.id)) ctx.removeBandit(b);
  }
}


/** Host side: a wingman's rounds landed on a bandit of ours. */
export function applyRemoteHit(ctx: Dogfight, id: number, dmg: number, player: AircraftState, combatId?: number): void {
  if (combatId !== undefined && combatId !== ctx.combatId) return;
  const target = ctx.strikeTargets.find(t => t.id === id);
  if (target) { ctx.damageTarget(target, dmg, player); return; }
  const b = ctx.findBandit(id);
  if (!b) return;
  ctx.hitT = HIT_FLASH;
  ctx.damageBandit(b, dmg, player);
}


/** Host side: a wingman's weapon landed on the hostile boat. */
export function applyRemoteCarrierHit(ctx: Dogfight, dmg: number, player: AircraftState): void {
  const cv = ctx.cv;
  if (!cv) return;
  CVPT.set(cv.def.x, cv.def.deckY, cv.def.z);
  ctx.damageCarrier(CVPT.clone(), player, dmg);
}


/** Mirror: the hits our weapons just landed, for the host (clears them). */
export function takeHits(ctx: Dogfight): EnemyHit[] {
  if (ctx.hitsOut.length === 0) return NO_HITS;
  const out = ctx.hitsOut;
  ctx.hitsOut = [];
  return out;
}


/** Mirror: the damage our weapons just did to the boat (clears it). */
export function takeCarrierHit(ctx: Dogfight): number {
  const d = ctx.carrierHitOut;
  ctx.carrierHitOut = 0;
  return d;
}
