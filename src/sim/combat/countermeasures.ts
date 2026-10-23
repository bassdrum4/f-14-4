// Flares: the pilot's cartridges, remote salvoes and seeker capture.

import type { FlareTarget } from "../countermeasures";
import type { WeaponLaunch } from "../../net/versus";
import * as THREE from "three";
import { atmosphere } from "../atmosphere";
import type { AircraftState } from "../flight";
import { groundAt } from "../world";
import {
  FLARE_BURN,
  FLARE_CD,
  FLARE_EJECT_BACK,
  FLARE_EJECT_DOWN,
  FLARE_GRAVITY,
  FLARE_SALVO,
  FLARE_SPREAD,
  FLARE_TRAIL,
  GRAVITY,
  LOCAL_FLARE_RESERVE,
} from "./tuning";

import type { Dogfight } from "./core";


// -------------------------------------------------------------------------
// Missiles

// -------------------------------------------------------------------------
// Countermeasures (flares)

/**
 * Deploy flares (the countermeasure key): one press ejects a small salvo.
 * Cartridges come off the airframe's spec, so a Crusader with 16 has four
 * presses and a Tomcat with 30 has eight (the last releases two). Nothing stops a pilot flaring at
 * nothing — that is what the count is for.
 */
export function requestFlares(ctx: Dogfight, player: AircraftState): void {
  if (ctx.flareCd > 0 || player.result) return;
  if (ctx.flaresLeft <= 0) {
    ctx.banner(player, "NO FLARES LEFT");
    return;
  }
  if (player.onGround) {
    ctx.banner(player, "FLARES — AIRBORNE ONLY");
    return;
  }
  const n = Math.min(FLARE_SALVO, ctx.flaresLeft);
  ctx.deployFlares(player, n);
  ctx.onFlare?.();
  ctx.flaresLeft -= n;
  ctx.flareCd = FLARE_CD;
  ctx.banner(
    player,
    ctx.flaresLeft > 0
      ? `FLARES AWAY — ${ctx.flaresLeft} LEFT`
      : "FLARES — LAST SALVO AWAY",
  );
}


/** Eject `n` cartridges from the belly, scattering as they fall away. */
export function deployFlares(ctx: Dogfight, player: AircraftState, n: number): void {
  for (let k = 0; k < n; k++) {
    const side = k % 2 === 0 ? 1 : -1;
    const roll = Math.floor(k / 2) === 0 ? 0 : 1;
    const off = new THREE.Vector3(side * (1.2 + roll * 1.4), -1.5, 2.4 + roll * 1.2);
    const pos = player.pos.clone().add(off.applyQuaternion(player.quat));
    const eject = new THREE.Vector3(
      side * (FLARE_SPREAD + roll * 1.1),
      -FLARE_EJECT_DOWN,
      FLARE_EJECT_BACK,
    ).applyQuaternion(player.quat);
    const vel = player.vel.clone().add(eject);
    if (!ctx.putFlare(pos, vel, null, 0)) return;
    if (ctx.versus) ctx.weaponLaunches.push({ weapon: "flare", pos: pos.toArray(), vel: vel.toArray() });
  }
}


/** A remote cartridge spends no local stores and is never echoed back. */
export function receiveRemoteFlare(ctx: Dogfight, owner: string, life: number, shot: WeaponLaunch): boolean {
  if (!ctx.versus || shot.weapon !== "flare" || ctx.flarePool.length <= LOCAL_FLARE_RESERVE) return false;
  if (ctx.flares.filter(f => f.owner === owner).length >= 28) return false;
  return ctx.putFlare(new THREE.Vector3(...shot.pos), new THREE.Vector3(...shot.vel), owner, life);
}


/** Live references let cosmetic seekers follow the same burning cartridges. */
export function flareTargets(ctx: Dogfight): readonly FlareTarget[] { return ctx.flares; }

export function putFlare(ctx: Dogfight, pos: THREE.Vector3, vel: THREE.Vector3, owner: string | null, ownerLife: number): boolean {
  const mesh = ctx.flarePool.pop();
  if (!mesh) return false;
  mesh.scale.setScalar(1);
  mesh.visible = true;
  mesh.position.copy(pos);
  ctx.root.add(mesh);
  ctx.flares.push({ pos, vel, life: FLARE_BURN, trailT: 0, mesh, owner, ownerLife });
  ctx.blasts.flareIgnition(pos);
  return true;
}


/** Fly the cartridges: ballistic, burning, trailing smoke, then gone. */
export function stepFlares(ctx: Dogfight, dt: number): void {
  ctx.flareCd = Math.max(0, ctx.flareCd - dt);
  if (ctx.flares.length === 0) return;
  for (let i = ctx.flares.length - 1; i >= 0; i--) {
    const f = ctx.flares[i];
    f.life -= dt;
    if (f.life <= 0) {
      f.mesh.visible = false;
      ctx.flarePool.push(f.mesh);
      ctx.flares.splice(i, 1);
      continue;
    }
    const sp = f.vel.length();
    if (sp > 1) {
      // small and light: it slows hard and falls away from the jet
      const k = (0.5 * atmosphere(f.pos.y).rho * 0.05 * sp) / 1.2;
      f.vel.multiplyScalar(Math.max(0, 1 - k * dt));
    }
    f.vel.y -= GRAVITY * FLARE_GRAVITY * dt;
    f.pos.addScaledVector(f.vel, dt);
    f.trailT -= dt;
    if (f.trailT <= 0) {
      ctx.blasts.trail(f.pos, .4, .75);
      f.trailT = FLARE_TRAIL;
    }
    const g = groundAt(f.pos.x, f.pos.z);
    if (f.pos.y <= g.y) {
      // Seekers holding this reference must see that the cartridge went out.
      f.life = 0;
      f.mesh.visible = false;
      ctx.flarePool.push(f.mesh);
      ctx.flares.splice(i, 1);
      continue;
    }
    f.mesh.position.copy(f.pos);
    const fade = Math.min(1, f.life / 0.8);
    f.mesh.scale.setScalar(fade);
  }
}


// --- diagnostics (headless checks; see scripts/diag-flares.ts) ------------

/** Live decoys in the air. */
export function flareCount(ctx: Dogfight): number {
  return ctx.flares.length;
}
