// Bombs and the target pod: designation, release, trails and ground markers.

import {
  BOMB_ARM_TIME as BOMB_ARM,
  BOMB_DETONATION_RADIUS as LGB_DET,
  advanceBomb,
  canBombReach,
} from "../bombTrajectory";
import * as THREE from "three";
import type { BlastKind } from "../../render/effects";
import type { AircraftState } from "../flight";
import { deckAxes, groundAt, isOnDeck } from "../world";
import {
  BOMB_AIR_RADIUS,
  BOMB_HP,
  BOMB_RELEASE_CD,
  BOMB_STATIONS,
  BOMB_TRAIL,
  BOMB_TRAIL_TTL,
  HIT_FLASH,
  IMPACT_SMOKE_TTL,
  LGB_TRAIL,
  LGB_TRAIL_TTL,
} from "./tuning";
import { DIR, NOSE_Z, TMP } from "./scratch";

import type { Dogfight } from "./core";


/**
 * Point the laser at a world spot (from the target pod's click). Bombs
 * already in the air follow a live designation, so re-clicking re-targets
 * them; null clears the aim point.
 */
export function setDesignation(ctx: Dogfight, p: THREE.Vector3 | null): void {
  ctx.designationAttachment = null;
  if (!p) {
    ctx.designation = null;
    return;
  }
  if (ctx.designation) ctx.designation.copy(p);
  else ctx.designation = p.clone();
  const ship = ctx.strikeTargets.find(t => t.sea && !t.dead && !t.arrived && t.pos.distanceTo(p) < t.radius + (t.kind === "ship" ? 55 : 30));
  const cv = ctx.cv && ctx.cv.status !== "sinking" && ctx.cv.status !== "sunk" && isOnDeck(ctx.cv.def, p.x, p.z) ? ctx.cv : null;
  if (ship || cv) {
    const x = ship?.pos.x ?? cv!.def.x, z = ship?.pos.z ?? cv!.def.z;
    const { fwd, right } = deckAxes(ship?.headingDeg ?? cv!.def.headingDeg);
    ctx.designationAttachment = { id: ship?.id ?? "carrier", along: (p.x - x) * fwd[0] + (p.z - z) * fwd[1],
      across: (p.x - x) * right[0] + (p.z - z) * right[1], height: p.y - (ship?.pos.y ?? cv!.def.deckY) };
  }
  for (const b of ctx.bombs) {
    if (b.guided && b.target) b.target.copy(p);
  }
}

export function followDesignation(ctx: Dogfight): void {
  const lock = ctx.designationAttachment, d = ctx.designation;
  if (!lock || !d) return;
  const ship = typeof lock.id === "number" ? ctx.strikeTargets.find(t => t.id === lock.id) : null;
  const cv = lock.id === "carrier" ? ctx.cv : null;
  if ((!ship && !cv) || ship?.arrived) { ctx.designationAttachment = null; return; }
  const { fwd, right } = deckAxes(ship?.headingDeg ?? cv!.def.headingDeg);
  d.set((ship?.pos.x ?? cv!.def.x) + fwd[0] * lock.along + right[0] * lock.across,
    (ship?.pos.y ?? cv!.def.deckY) + lock.height,
    (ship?.pos.z ?? cv!.def.z) + fwd[1] * lock.along + right[1] * lock.across);
  for (const b of ctx.bombs) if (b.guided && b.target) b.target.copy(d);
}


/**
 * Queue one weapon release (a target-pod click). The release cooldown still
 * applies, but a double click is not swallowed: the second weapon goes when
 * the rack is ready.
 */
export function requestBombRelease(ctx: Dogfight, player?: AircraftState): boolean {
  if (player && !ctx.bombReachable(player)) {
    ctx.banner(player, "BOMB CANNOT REACH TARGET — CLOSE IN OR CLIMB");
    return false;
  }
  ctx.releaseQueue++;
  return true;
}

export function bombReachable(ctx: Dogfight, player: AircraftState): boolean {
  if (!ctx.designation) return true;
  const [x, y, z] = BOMB_STATIONS[ctx.station % BOMB_STATIONS.length];
  const pos = player.pos.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(player.quat));
  const vel = player.vel.clone().add(new THREE.Vector3(0, -2.5, 0).applyQuaternion(player.quat));
  return canBombReach(pos, vel, ctx.designation, ctx.enemyDeck());
}


/**
 * Live weapon positions, for the target pod's weapon symbology and for
 * headless checks. Allocates; not for per-frame hot loops.
 */
export function bombPositions(ctx: Dogfight): THREE.Vector3[] {
  return ctx.bombs.map((b) => b.pos.clone());
}


// -------------------------------------------------------------------------
// Bombs

/** Arm, release and fly the player's bombs, one sim step at a time. */
export function stepBombs(ctx: Dogfight, dt: number, player: AircraftState, held: boolean): void {
  ctx.bombCd = Math.max(0, ctx.bombCd - dt);
  if ((held || ctx.releaseQueue > 0) && ctx.bombCd <= 0 && ctx.bombsLeft > 0 && !player.onGround) {
    if (!ctx.bombReachable(player)) {
      ctx.releaseQueue = 0;
      ctx.banner(player, "BOMB CANNOT REACH TARGET — CLOSE IN OR CLIMB");
    } else {
      ctx.releaseBomb(player);
    }
    ctx.bombCd = BOMB_RELEASE_CD;
    if (!held) ctx.releaseQueue = Math.max(0, ctx.releaseQueue - 1);
    if (ctx.bombsLeft === 0) ctx.banner(player, "BOMBS EXPENDED");
  }
  for (let i = ctx.bombs.length - 1; i >= 0; i--) {
    const b = ctx.bombs[i];
    b.age += dt;
    advanceBomb(b.pos, b.vel, b.guided ? b.target : null, dt, b.age);
    b.mesh.position.copy(b.pos);
    b.mesh.quaternion.setFromUnitVectors(NOSE_Z, DIR.copy(b.vel).normalize());

    // --- wake: every store trails smoke all the way down ---
    b.trailT -= dt;
    if (b.trailT <= 0) {
      if (b.guided) ctx.blasts.trail(b.pos, 1.6, LGB_TRAIL_TTL);
      else ctx.blasts.trail(b.pos, 1.15, BOMB_TRAIL_TTL);
      b.trailT = b.guided ? LGB_TRAIL : BOMB_TRAIL;
    }

    b.arm -= dt;
    if (b.arm > 0) continue;
    // A guided weapon that reaches its spot detonates there, even on a limb
    // where the surface is a moving deck.
    if (b.guided && b.target && b.pos.distanceToSquared(b.target) < LGB_DET * LGB_DET) {
      const onWater = groundAt(b.target.x, b.target.z).kind === "water";
      ctx.impactBomb(i, b.target, onWater ? "water" : "ground", player);
      continue;
    }
    // A bomb that catches an aircraft breaks it up — everything is a target.
    let hitAir = false;
    for (const bandit of ctx.bandits) {
      if (bandit.catT >= 0) continue;
      if (bandit.pos.distanceTo(b.pos) < BOMB_AIR_RADIUS) {
        ctx.hitT = HIT_FLASH;
        ctx.blasts.spawn(bandit.pos.clone(), "air", 1);
        ctx.damageBandit(bandit, BOMB_HP * 2, player);
        hitAir = true;
        break;
      }
    }
    if (hitAir) {
      ctx.impactBomb(i, b.pos, "air", player);
      continue;
    }
    // A strike target is solid: a bomb that reaches a ship or a structure
    // detonates on it rather than falling through to the surface below.
    let hitTarget = false;
    for (const t of ctx.strikeTargets) {
      if (t.dead || t.arrived) continue;
      TMP.copy(t.pos);
      TMP.y += 8;
      if (TMP.distanceToSquared(b.pos) < (t.radius + 3) * (t.radius + 3)) {
        ctx.impactBomb(i, b.pos, "ground", player);
        hitTarget = true;
        break;
      }
    }
    if (hitTarget) continue;
    // the hostile deck is not part of the world layout, so it is checked first
    const cv = ctx.cv;
    if (
      cv &&
      cv.status !== "sinking" &&
      cv.status !== "sunk" &&
      b.pos.y <= cv.def.deckY + 2 &&
      isOnDeck(cv.def, b.pos.x, b.pos.z)
    ) {
      ctx.damageCarrier(b.pos, player, BOMB_HP);
      ctx.impactBomb(i, b.pos, "ground", player);
      continue;
    }
    const g = groundAt(b.pos.x, b.pos.z);
    if (b.pos.y <= g.y) {
      ctx.impactBomb(i, b.pos, g.kind === "water" ? "water" : "ground", player);
    }
  }
}


/**
 * Detonate a weapon: a fireball on land, a deck or in the air, a water column
 * in the sea. Retires the bomb and remembers the spot for diagnostics.
 */
export function impactBomb(ctx: Dogfight, i: number, at: THREE.Vector3, kind: BlastKind, player: AircraftState): void {
  const g = groundAt(at.x, at.z);
  const y = Math.max(at.y, g.y + (kind === "air" ? 0 : 1.5));
  ctx.lastImpact.set(at.x, y, at.z);
  ctx.lastImpactKind = kind;
  ctx.impactAge = 0;
  ctx.blastTargets(at, player);
  ctx.blasts.spawn(TMP.set(at.x, y, at.z), kind, kind === "water" ? 1.15 : 1);
  // A column that outlives the fireball: "did it hit?" has to stay answerable
  // for a few seconds after the flash, from any camera.
  ctx.blasts.trail(TMP.set(at.x, y + 6, at.z), 3.4, IMPACT_SMOKE_TTL);
  ctx.blasts.trail(TMP.set(at.x, y + 16, at.z), 5, IMPACT_SMOKE_TTL * 0.8);
  ctx.flash(TMP);
  ctx.retireBomb(i);
}


/** Pickle one off the next rack station: it inherits the jet's velocity. */
export function releaseBomb(ctx: Dogfight, player: AircraftState): void {
  const mesh = ctx.bombPool.pop();
  if (!mesh) return;
  const [sx, sy, sz] = BOMB_STATIONS[ctx.station % BOMB_STATIONS.length];
  ctx.station++;
  const pos = player.pos.clone().add(new THREE.Vector3(sx, sy, sz).applyQuaternion(player.quat));
  // the rack kicks it down and clear of the airframe; after that it is ballistic
  const vel = player.vel
    .clone()
    .add(new THREE.Vector3(0, -2.5, 0).applyQuaternion(player.quat));
  mesh.visible = true;
  mesh.position.copy(pos);
  // A release has to read from the chase camera: a bright kick off the rack,
  // a short-lived flash and a smoke marker that stays on the rack position for
  // a moment, so the drop is unmistakable even before the bomb is in view.
  ctx.blasts.spawnSpark(pos, false);
  ctx.blasts.trail(pos, 1.5, 2.2);
  ctx.flash(pos);
  ctx.pushReleaseMarker(pos);
  const guided = ctx.designation !== null;
  ctx.bombs.push({
    pos,
    vel,
    arm: BOMB_ARM,
    age: 0,
    mesh,
    guided,
    target: guided ? ctx.designation!.clone() : null,
    trailT: 0,
  });
  ctx.bombsLeft--; ctx.storesUsed++;
}


/**
 * Remember where the last release happened, so the HUD can mark the rack
 * position for a moment — the pilot sees the pickle even if the store itself
 * is hidden under the wing.
 */
export function pushReleaseMarker(ctx: Dogfight, at: THREE.Vector3): void {
  ctx.releaseMarker.copy(at);
  ctx.releaseAge = 0;
}

export function retireBomb(ctx: Dogfight, i: number): void {
  const b = ctx.bombs[i];
  b.mesh.visible = false;
  ctx.bombPool.push(b.mesh);
  ctx.bombs.splice(i, 1);
}


/**
 * Keep the laser marker on the designation. Driven by sim time, so the pulse
 * freezes on pause.
 */
export function stepDesignator(ctx: Dogfight, player: AircraftState): void {
  const d = ctx.designation;
  const on = d !== null && !player.result;
  ctx.designator.visible = on;
  if (!d || !on) return;
  ctx.designator.position.set(d.x, d.y + 3, d.z);
  ctx.designator.scale.setScalar(1 + 0.12 * Math.sin(player.time * 7));
}
