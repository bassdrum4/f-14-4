// Bombs and the target pod: a click picks a spot and one weapon lands on it.
//
// There is deliberately no guidance envelope, no release queue and no reach
// check here. The pod resolves the surface under the cursor, the click drops a
// store immediately, and that store follows a single arc which ends exactly on
// the point that was clicked. What the pilot clicks is where the bomb goes off.

import * as THREE from "three";
import type { BlastKind } from "../../render/effects";
import type { AircraftState } from "../flight";
import { groundAt, isOnDeck } from "../world";
import {
  BOMB_HP,
  BOMB_STATIONS,
  BOMB_TRAIL,
  BOMB_TRAIL_TTL,
  IMPACT_SMOKE_TTL,
} from "./tuning";
import { DIR, NOSE_Z, TMP } from "./scratch";
import type { Dogfight } from "./core";

/** Cruise speed along the arc, and the shortest/longest flight it may take. */
const BOMB_SPEED = 380; // m/s
const MIN_FLIGHT = 1.5; // s
const MAX_FLIGHT = 18; // s

/**
 * Point the pod's laser at a world spot. Weapons already in the air keep the
 * spot they were dropped on: a later click is a new bomb, not a new order.
 */
export function setDesignation(ctx: Dogfight, p: THREE.Vector3 | null): void {
  ctx.designation = p ? p.clone() : null;
}

/**
 * Drop one weapon onto `target`, the surface point the pod picked. It leaves
 * the next rack station and detonates on that exact point. Returns false when
 * the racks are empty (or the jet cannot release).
 */
export function releaseBombAt(
  ctx: Dogfight,
  player: AircraftState,
  target: THREE.Vector3,
): boolean {
  if (player.onGround || player.result) return false;
  if (ctx.bombsLeft <= 0) {
    ctx.banner(player, "BOMBS EXPENDED");
    return false;
  }
  const mesh = ctx.bombPool.pop();
  if (!mesh) return false;

  const [sx, sy, sz] = BOMB_STATIONS[ctx.station % BOMB_STATIONS.length];
  ctx.station++;
  const from = player.pos
    .clone()
    .add(new THREE.Vector3(sx, sy, sz).applyQuaternion(player.quat));
  const to = target.clone();
  const range = from.distanceTo(to);
  const flight = THREE.MathUtils.clamp(range / BOMB_SPEED, MIN_FLIGHT, MAX_FLIGHT);
  // The rack throws the store along the jet's velocity; the arc then curves
  // onto the clicked point. The kick is capped so a slow jet close to its
  // target gets a fall rather than a loop.
  const kick = player.vel.clone().multiplyScalar(flight * 0.22);
  if (kick.length() > range * 0.45) kick.setLength(range * 0.45);
  const ctrl = from.clone().add(kick);

  mesh.visible = true;
  mesh.position.copy(from);
  // A release has to read from the chase camera: a bright kick off the rack,
  // a short-lived flash and a smoke marker on the rack position.
  ctx.blasts.spawnSpark(from, false);
  ctx.blasts.trail(from, 1.5, 2.2);
  ctx.flash(from);
  ctx.pushReleaseMarker(from);
  ctx.bombs.push({ from, ctrl, to, pos: from.clone(), t: 0, flight, mesh, trailT: 0 });
  ctx.bombsLeft--;
  ctx.storesUsed++;
  return true;
}

/** Fly every weapon still in the air, and detonate the ones that have arrived. */
export function stepBombs(ctx: Dogfight, dt: number, player: AircraftState): void {
  for (let i = ctx.bombs.length - 1; i >= 0; i--) {
    const b = ctx.bombs[i];
    b.t = Math.min(b.flight, b.t + dt);
    const u = b.flight > 0 ? b.t / b.flight : 1;
    const w = 1 - u;
    // Quadratic Bézier: rack -> forward kick -> clicked point.
    b.pos.set(
      w * w * b.from.x + 2 * w * u * b.ctrl.x + u * u * b.to.x,
      w * w * b.from.y + 2 * w * u * b.ctrl.y + u * u * b.to.y,
      w * w * b.from.z + 2 * w * u * b.ctrl.z + u * u * b.to.z,
    );
    DIR.set(
      2 * w * (b.ctrl.x - b.from.x) + 2 * u * (b.to.x - b.ctrl.x),
      2 * w * (b.ctrl.y - b.from.y) + 2 * u * (b.to.y - b.ctrl.y),
      2 * w * (b.ctrl.z - b.from.z) + 2 * u * (b.to.z - b.ctrl.z),
    );
    if (DIR.lengthSq() > 1e-8) {
      b.mesh.quaternion.setFromUnitVectors(NOSE_Z, DIR.normalize());
    }
    b.mesh.position.copy(b.pos);

    b.trailT -= dt;
    if (b.trailT <= 0) {
      ctx.blasts.trail(b.pos, 1.3, BOMB_TRAIL_TTL);
      b.trailT = BOMB_TRAIL;
    }
    if (u >= 1) detonateBomb(ctx, i, player);
  }
}

/**
 * The weapon has reached its point: burst there, damage whatever is at that
 * point, and retire it. There is no proximity or collision test to miss — the
 * arc ends on the clicked coordinate.
 */
export function detonateBomb(ctx: Dogfight, i: number, player: AircraftState): void {
  const at = ctx.bombs[i].to;
  const cv = ctx.cv;
  const onDeck =
    !!cv &&
    cv.status !== "sinking" &&
    cv.status !== "sunk" &&
    Math.abs(at.y - cv.def.deckY) <= 6 &&
    isOnDeck(cv.def, at.x, at.z);
  if (onDeck) ctx.damageCarrier(at, player, BOMB_HP);
  const g = groundAt(at.x, at.z);
  const kind: BlastKind = !onDeck && g.kind === "water" ? "water" : "ground";
  const y = Math.max(at.y, g.y + 1.5);
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

/**
 * Live weapon positions, for the target pod's weapon symbology and for
 * headless checks. Allocates; not for per-frame hot loops.
 */
export function bombPositions(ctx: Dogfight): THREE.Vector3[] {
  return ctx.bombs.map((b) => b.pos.clone());
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
