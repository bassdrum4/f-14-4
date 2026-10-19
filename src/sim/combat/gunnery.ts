// The player's guns: rounds, tracers, the HUD gun cue and hit flashes.

import * as THREE from "three";
import { atmosphere } from "../atmosphere";
import { gunMuzzle, hitsVessel, shipGunQuaternion } from "../surface";
const GUN_Q = new THREE.Quaternion();

function bore(player: AircraftState, out: THREE.Vector3): THREE.Vector3 {
  return out.set(0, 0, -1).applyQuaternion(player.spec.surfaceVessel ? shipGunQuaternion(player, GUN_Q) : player.quat);
}
import type { AircraftState } from "../flight";
import { groundAt, isOnDeck } from "../world";
import type { GunCue } from "./types";
import {
  ASSIST_CONE,
  ASSIST_MAX,
  ASSIST_RANGE,
  BANDIT_DAMAGE,
  BULLET_CDA,
  BULLET_MASS,
  CARRIER_GUN_DAMAGE,
  GRAVITY,
  HIT_FLASH,
  HIT_RADIUS,
  MAX_TRACERS,
  MUZZLE_V,
  PLAYER_SPREAD,
  TRACER_LIFE,
} from "./tuning";
import {
  AXIS,
  DIR,
  FWD,
  GUN_B,
  GUN_DT,
  GUN_FWD,
  GUN_MUZ,
  GUN_P,
  GUN_PREV,
  GUN_RANGE,
  GUN_T,
  GUN_V,
  REF,
  TMP,
  TR_Z,
  hash,
  segSphere,
} from "./scratch";

import type { Dogfight } from "./core";


/** Rounds currently in flight — diagnostics and headless checks. */
export function tracerCount(ctx: Dogfight): number {
  return ctx.tracers.length;
}


/**
 * March the player's rounds from this frame's muzzle state and report where
 * they end up. Evaluated once per rendered frame by the HUD, so the returned
 * object is reused — read it, do not keep it. Uses the same assisted bore
 * the fired rounds get, so the pipper shows where the bullets actually go.
 */
export function gunSolution(ctx: Dogfight, player: AircraftState): GunCue {
  const cue = ctx.cueOut;
  const fwd = bore(player, GUN_FWD);
  gunMuzzle(player, GUN_MUZ, fwd);
  GUN_P.copy(GUN_MUZ);
  // Rounds leave at muzzle speed along the (assisted) bore, plus the jet's
  // own velocity — identical to what fireGuns will actually spawn.
  const assisted = ctx.assistBore(player, GUN_MUZ, fwd);
  GUN_V.copy(assisted).multiplyScalar(MUZZLE_V).add(player.vel);
  // A lit pipper must mean the same contact radius as the actual projectile.
  const airR = HIT_RADIUS;
  const cv = ctx.cv;
  const shipLive = cv !== null && cv.status !== "sinking" && cv.status !== "sunk";
  const steps = Math.round(TRACER_LIFE / GUN_DT);
  let hit: GunCue["hit"] = null;
  let t = 0;
  ctx.pathCount = 0;
  for (let i = 0; i < steps; i++) {
    const atm = atmosphere(GUN_P.y);
    const sp = GUN_V.length();
    if (sp > 1) {
      const k = (0.5 * atm.rho * BULLET_CDA * sp) / BULLET_MASS;
      GUN_V.multiplyScalar(Math.max(0, 1 - k * GUN_DT));
    }
    GUN_V.y -= GRAVITY * GUN_DT;
    GUN_PREV.copy(GUN_P);
    GUN_P.addScaledVector(GUN_V, GUN_DT);
    t += GUN_DT;
    // sample the trajectory for the HUD's bullet ladder (every ~0.1 s)
    if (i % 12 === 0 && ctx.pathCount < ctx.pathBuf.length) {
      ctx.pathBuf[ctx.pathCount++].copy(GUN_P);
    }
    for (const b of ctx.bandits) {
      if (b.catT >= 0) continue;
      // The bandit keeps flying while the round is in the air, so test the
      // path against where the bandit WILL be at this step's flight time —
      // straight-line along its current velocity (jinks excluded). Testing the
      // stale position made the pipper go dark in every merge even when a
      // burst would connect.
      const vel = DIR.set(0, 0, -1).applyQuaternion(b.quat).multiplyScalar(b.speed);
      GUN_B.copy(b.pos).addScaledVector(vel, t);
      if (segSphere(GUN_PREV, GUN_P, GUN_B, airR)) {
        hit = "bandit";
        break;
      }
    }
    for (const opponent of ctx.opponents) {
      GUN_B.copy(opponent.hitPos ?? opponent.pos).addScaledVector(opponent.vel, t);
      if (segSphere(GUN_PREV, GUN_P, GUN_B, airR)) { hit = "bandit"; break; }
    }
    if (hit) break;
    for (const t of ctx.strikeTargets) {
      if (t.dead || t.arrived) continue;
      GUN_T.copy(t.pos);
      GUN_T.y += 8;
      if (segSphere(GUN_PREV, GUN_P, GUN_T, t.radius + 2)) {
        hit = "target";
        break;
      }
    }
    if (hit) break;
    if (shipLive && GUN_P.y <= cv!.def.deckY + 6 && isOnDeck(cv!.def, GUN_P.x, GUN_P.z)) {
      hit = "ship";
      break;
    }
    if (GUN_P.y <= groundAt(GUN_P.x, GUN_P.z).y) {
      // back the solution up to the actual surface crossing inside this step,
      // so the pipper sits ON the water/deck instead of one integration step
      // below it (the round arrives at ~800 m/s of descent: a whole step is
      // several metres of overshoot)
      const gy = groundAt(GUN_P.x, GUN_P.z).y;
      const f = Math.min(1, Math.max(0, (GUN_PREV.y - gy) / (GUN_PREV.y - GUN_P.y)));
      GUN_P.lerpVectors(GUN_PREV, GUN_P, f);
      hit = "ground";
      break;
    }
  }
  cue.x = GUN_P.x;
  cue.y = GUN_P.y;
  cue.z = GUN_P.z;
  cue.t = t;
  cue.hit = hit;
  cue.range = GUN_P.distanceTo(GUN_MUZ);
  cue.live = hit !== null || cue.range <= GUN_RANGE;
  return cue;
}


/**
 * The sampled bullet path behind the gun cue, muzzle to solution point: the
 * HUD draws it as a ladder of dots so "where will my rounds go" is answered
 * before the trigger is squeezed. Reused buffer — read it, do not keep it.
 */
export function gunPath(ctx: Dogfight): { points: THREE.Vector3[]; n: number } {
  ctx.pathOut.n = ctx.pathCount;
  return ctx.pathOut;
}


/**
 * The gun's bore with the tiny aim assist applied. Assists only when the
 * nearest live bandit sits inside a narrow cone of where the nose points,
 * and then only bends the shot up to ASSIST_MAX toward the bandit's LEAD
 * point — the spot a burst should actually be aimed at.
 */
export function assistBore(ctx: Dogfight, 
  _player: AircraftState,
  muzzle: THREE.Vector3,
  bore: THREE.Vector3,
): THREE.Vector3 {
  let best: THREE.Vector3 | null = null;
  let bestAngle = ASSIST_CONE;
  for (const b of ctx.bandits) {
    if (b.catT >= 0) continue;
    TMP.copy(b.pos).sub(muzzle);
    const dist = TMP.length();
    if (dist > ASSIST_RANGE) continue;
    // lead the target like a burst should be led
    const vel = DIR.set(0, 0, -1).applyQuaternion(b.quat).multiplyScalar(b.speed);
    const tof = Math.min(dist / MUZZLE_V, 1.2);
    TMP.addScaledVector(vel.sub(_player.vel), tof);
    TMP.y += .5 * GRAVITY * tof * tof;
    // TMP is already relative to the muzzle; subtracting it again made
    // assist depend on the aircraft's world position and altitude.
    TMP.normalize();
    const ang = bore.angleTo(TMP);
    if (ang < bestAngle) {
      bestAngle = ang;
      best = TMP.clone();
    }
  }
  for (const opponent of ctx.opponents) {
    TMP.copy(opponent.hitPos ?? opponent.pos).sub(muzzle);
    const distance = TMP.length();
    if (distance > ASSIST_RANGE) continue;
    const tof = Math.min(distance / MUZZLE_V, 1.2);
    TMP.addScaledVector(DIR.copy(opponent.vel).sub(_player.vel), tof);
    TMP.y += .5 * GRAVITY * tof * tof;
    TMP.normalize();
    const angle = bore.angleTo(TMP);
    if (angle < bestAngle) { bestAngle = angle; best = TMP.clone(); }
  }
  if (!best) return bore;
  // pull a fraction of the remaining angle toward the lead point
  const pull = Math.min(bestAngle, ASSIST_MAX);
  AXIS.crossVectors(bore, best);
  if (AXIS.lengthSq() < 1e-10) return bore;
  AXIS.normalize();
  return bore.clone().applyAxisAngle(AXIS, pull);
}

export function playerGuns(ctx: Dogfight, dt: number, player: AircraftState, fireHeld: boolean): void {
  if (!fireHeld) {
    ctx.gunCd = 0;
    ctx.gunLive = false;
    return;
  }
  ctx.gunLive = true;
  const rate = Math.max(1, player.spec.gunRps);
  ctx.gunCd -= dt;
  while (ctx.gunCd <= 0) {
    ctx.gunCd += 1 / rate;
    bore(player, FWD);
    // The cue's dedicated muzzle scratch, not TMP: assistBore recomputes the
    // lead direction into TMP, so passing TMP as the muzzle zeroed it and
    // every round spawned from the world origin, 1500 m from the fight.
    gunMuzzle(player, GUN_MUZ, FWD);
    // the same slight aim assist the crosshair solution uses, so the pipper
    // and the rounds agree exactly
    const assisted = ctx.assistBore(player, GUN_MUZ, FWD);
    ctx.scatter(assisted, PLAYER_SPREAD, player.time * 31.7 + ctx.gunCd * 97);
    // Our own rounds carry the jet's full velocity vector, so a burst fired in
    // a hard turn goes where the gun cue says rather than drifting off the bore.
    // (The bandits keep firing relative to their own frame; they are steered
    // point masses and their gunnery is tuned separately.)
    ctx.spawnTracer(GUN_MUZ, assisted, false, player.vel);
    // muzzle flash at the ports: the burst has to read from any camera
    // (no smoke puff here — it read as haze drifting over the nose)
    ctx.muzzleT = 0.055;
    ctx.muzzle.position.copy(GUN_MUZ);
  }
}

export function spawnTracer(ctx: Dogfight, 
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  hostile: boolean,
  inherit: THREE.Vector3 | null,
): void {
  if (ctx.tracers.length >= MAX_TRACERS || ctx.tracerPool.length === 0) return;
  const mesh = ctx.tracerPool.pop()!;
  mesh.material = hostile ? ctx.matBandit : ctx.matPlayer;
  // Our own rounds are drawn fat and long on purpose: a slim 20 mm slug is
  // nearly invisible against terrain at combat range, and "can't tell if I'm
  // shooting" is a visibility problem, not a ballistics one.
  mesh.scale.setScalar(hostile ? 1 : 1.7);
  mesh.visible = true;
  mesh.position.copy(origin);
  const vel = dir.clone().multiplyScalar(MUZZLE_V);
  if (inherit) vel.add(inherit);
  if (hostile && ctx.operation && !ctx.mirror) ctx.enemyFire.push({ combatId: ctx.combatId, seq: ++ctx.fireSerial, weapon: "gun", pos: origin.toArray(), vel: vel.toArray() });
  if (!hostile && ctx.versus) ctx.weaponLaunches.push({ weapon: "gun", pos: origin.toArray(), vel: vel.toArray() });
  ctx.tracers.push({
    pos: origin.clone(),
    vel,
    life: TRACER_LIFE,
    hostile,
    mesh,
  });
}

export function stepTracers(ctx: Dogfight, dt: number, player: AircraftState): void {
  const cv = ctx.cv;
  for (let i = ctx.tracers.length - 1; i >= 0; i--) {
    const t = ctx.tracers[i];
    t.life -= dt;
    // Rounds are projectiles: quadratic drag first, then gravity, so a long
    // burst needs lead and a touch of lob instead of flying dead straight.
    const atm = atmosphere(t.pos.y);
    const sp = t.vel.length();
    if (sp > 1) {
      const k = (0.5 * atm.rho * BULLET_CDA * sp) / BULLET_MASS; // 1/s
      t.vel.multiplyScalar(Math.max(0, 1 - k * dt));
    }
    t.vel.y -= GRAVITY * dt;
    const prev = GUN_PREV.copy(t.pos);
    t.pos.addScaledVector(t.vel, dt);
    t.mesh.position.copy(t.pos);
    t.mesh.quaternion.setFromUnitVectors(TR_Z, DIR.copy(t.vel).normalize());

    let dead = t.life <= 0;
    if (!dead) {
      if (t.hostile) {
        if (player.spec.surfaceVessel ? hitsVessel(prev, t.pos, player) : segSphere(prev, t.pos, player.pos, HIT_RADIUS)) {
          ctx.damagePlayer(player, BANDIT_DAMAGE);
          dead = true;
        }
      } else {
        for (const b of ctx.bandits) {
          if (b.catT >= 0) continue; // still on the cat, not a valid target
          if (segSphere(prev, t.pos, b.pos, HIT_RADIUS)) {
            ctx.hitT = HIT_FLASH;
            dead = true;
            ctx.damageBandit(b, player.spec.gunDamage, player);
            break;
          }
        }
        if (!dead) for (const opponent of ctx.opponents) {
          if (opponent.surfaceVessel && opponent.quat ? hitsVessel(prev, t.pos, { pos: opponent.hitPos ?? opponent.pos, quat: opponent.quat }) : segSphere(prev, t.pos, opponent.hitPos ?? opponent.pos, HIT_RADIUS)) {
            ctx.hitOpponent(opponent, "gun");
            dead = true;
            break;
          }
        }
        // Strafing works on strike targets too: a gun pass on an unarmoured
        // structure or a ship's deckhouse does real (if modest) damage.
        if (!dead) {
          for (const tg of ctx.strikeTargets) {
            if (tg.dead) continue;
            REF.copy(tg.pos);
            REF.y += 8;
            if (segSphere(prev, t.pos, REF, tg.radius)) {
              ctx.damageTarget(tg, tg.sea && !player.spec.surfaceVessel ? 2 : player.spec.gunDamage * 0.5, player);
              dead = true;
              break;
            }
          }
        }
        // Everything is shootable, the enemy deck included: strafe it down.
        if (
          !dead && cv && cv.status !== "sinking" && cv.status !== "sunk" &&
          t.pos.y <= cv.def.deckY + 6 && isOnDeck(cv.def, t.pos.x, t.pos.z)
        ) {
          ctx.damageCarrier(t.pos, player, CARRIER_GUN_DAMAGE);
          dead = true;
        }
      }
    }
    // Rounds stop at the ground (or the sea) instead of flying through hills,
    // and they kick up dirt or a little spray where they land.
    if (!dead) {
      const g = groundAt(t.pos.x, t.pos.z);
      if (t.pos.y <= g.y) {
        ctx.blasts.spawnSpark(t.pos.setY(Math.max(g.y + 0.4, t.pos.y)), g.kind === "water");
        dead = true;
      }
    }
    if (dead) {
      t.mesh.visible = false;
      ctx.tracerPool.push(t.mesh);
      ctx.tracers.splice(i, 1);
    }
  }
}

export function flash(ctx: Dogfight, at: THREE.Vector3): void {
  const f = ctx.flashPool.find((x) => x.life <= 0);
  if (!f) return;
  f.pos.copy(at);
  f.life = 1;
  f.mesh.visible = true;
}

export function stepFlashes(ctx: Dogfight, dt: number): void {
  for (const f of ctx.flashPool) {
    if (f.life <= 0) continue;
    f.life -= dt * 1.8;
    if (f.life <= 0) {
      f.mesh.visible = false;
      continue;
    }
    const s = 3 + (1 - f.life) * 26;
    f.mesh.position.copy(f.pos);
    f.mesh.scale.setScalar(s);
    (f.mesh.material as THREE.MeshBasicMaterial).opacity = f.life * 0.9;
  }
}


/** Rotate `dir` by a deterministic cone of `spread` radians. */
export function scatter(_ctx: Dogfight, dir: THREE.Vector3, spread: number, seed: number): void {
  const a = hash(seed) * Math.PI * 2;
  const r = spread * (hash(seed + 0.5) * 2 - 1);
  REF.set(Math.cos(a), Math.sin(a), 0);
  if (Math.abs(dir.z) > 0.95) REF.set(1, 0, 0);
  AXIS.crossVectors(dir, REF).normalize();
  dir.applyAxisAngle(AXIS, r);
}
