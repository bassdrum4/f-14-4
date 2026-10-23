// Missiles and hostile air-to-air rounds: launch, guidance and fusing.

import { captureFlare } from "../countermeasures";
import { hitsVessel } from "../surface";
import { launchNavalMissile, navalTarget } from "./naval";
import * as THREE from "three";
import type { BlastKind } from "../../render/effects";
import { atmosphere } from "../atmosphere";
import type { AircraftState } from "../flight";
import { groundAt, isOnDeck } from "../world";
import type { Bandit, CombatOpponent, Flare, Missile } from "./types";
import {
  BANDIT_MISSILE_CD,
  BANDIT_MISSILE_CONE,
  BANDIT_MISSILE_MAX,
  BANDIT_MISSILE_MIN,
  GRAVITY,
  HIT_FLASH,
  IMPACT_SMOKE_TTL,
  MISSILE_ACCEL,
  MISSILE_AIR_R,
  MISSILE_AREA,
  MISSILE_ARM,
  MISSILE_CD,
  MISSILE_CD0,
  MISSILE_CV_DMG,
  MISSILE_DET,
  MISSILE_HP,
  MISSILE_LIFE,
  MISSILE_MASS,
  MISSILE_MOTOR,
  MISSILE_PLAYER_DMG,
  MISSILE_STATIONS,
  MISSILE_TRAIL_COLD,
  MISSILE_TRAIL_HOT,
  MISSILE_TURN,
  MISSILE_V_MAX,
  THREAT_HOLD,
} from "./tuning";
import { AXIS, CVPT, DIR, FWD, NOSE_Z, TMP, TO_P, hash, terrainBlocks } from "./scratch";

import type { Dogfight } from "./core";

/** A locked victim's new life cannot inherit an old naval warhead. */
function canHitOpponent(m: Missile, opponent: CombatOpponent): boolean {
  return m.naval?.kind !== "pilot" || m.naval.id !== opponent.id || m.naval.life === opponent.life;
}

/**
 * Can this seeker be talked out of the jet? A burning flare inside the
 * seeker's cone and range is a decoy; the closer to boresight it sits, the
 * faster the lock lets go. Once a round is captured it stays captured.
 */
export function tryFlareCapture(ctx: Dogfight, m: Missile, dt: number): Flare | null {
  return captureFlare(m, ctx.flares, dt, f => m.hostile
    ? f.owner === null
    : ctx.versus && f.owner !== null && ctx.opponents.some(o => o.id === f.owner && o.life === f.ownerLife));
}


/** Take a round out of the fight and back into the mesh pool. */
export function retireMissile(ctx: Dogfight, i: number, m: Missile): void {
  m.mesh.visible = false;
  ctx.missilePool.push(m.mesh);
  ctx.missiles.splice(i, 1);
}


/**
 * Aggressors carry a couple of rounds each, so "missile inbound" is a real
 * event in a dogfight. A bandit inside its launch envelope, roughly on
 * boresight and with the player in sight takes the shot.
 */
export function banditMissiles(ctx: Dogfight, b: Bandit, dt: number, player: AircraftState): void {
  if (ctx.operation && (ctx.mirror || b.role !== "escort" || b.retreat)) return;
  if (b.catT >= 0 || b.missiles <= 0) return;
  b.missileCd -= dt;
  if (b.missileCd > 0 || player.result) return;
  // An air-to-air round is for an aircraft in the air. A jet parked or
  // rolling on the deck is a gun target, not a missile shot: the seeker has
  // the ground behind it and no closure to work with, and it keeps a pilot
  // who is still on the ground from being the subject of a launch.
  if (player.onGround) return;
  FWD.set(0, 0, -1).applyQuaternion(b.quat);
  TO_P.copy(player.pos).sub(b.pos);
  const dist = TO_P.length();
  if (dist < BANDIT_MISSILE_MIN || dist > BANDIT_MISSILE_MAX) return;
  if (FWD.angleTo(TO_P) > BANDIT_MISSILE_CONE) return;
  if (terrainBlocks(b.pos, player.pos)) return;
  if (!ctx.fireHostileMissile(b, player)) return;
  b.missiles--;
  // A re-attack is a fresh setup: give the pilot time to break and flare.
  b.missileCd = BANDIT_MISSILE_CD + hash(b.id * 5.7 + player.time) * 8;
}


/** One rail shot: down and outboard first, then the motor lights. */
export function fireHostileMissile(ctx: Dogfight, b: Bandit, player: AircraftState): boolean {
  const side = hash(b.id * 3.7 + b.pos.z) > 0.5 ? 1 : -1;
  const pos = b.pos.clone().add(new THREE.Vector3(side * 3.4, -1.4, 0.6).applyQuaternion(b.quat));
  const vel = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(b.quat)
    .multiplyScalar(Math.max(b.speed, 140))
    .add(new THREE.Vector3(side * 4, -3, 0).applyQuaternion(b.quat));
  if (!ctx.putHostileRound(pos, vel, hash(b.id * 2.3 + player.time) * 97)) return false;
  if (ctx.operation) {
    const target = ctx.defenders.find(p => p.pos === player.pos)?.id ?? ctx.localPilot;
    ctx.missiles[ctx.missiles.length - 1].targetPilot = target;
    if (!ctx.mirror) ctx.enemyFire.push({ combatId: ctx.combatId, seq: ++ctx.fireSerial, weapon: "missile", pos: pos.toArray(), vel: vel.toArray(), target });
  }
  ctx.threatT = THREAT_HOLD;
  ctx.banner(player, "MISSILE INBOUND — BREAK AND FLARE");
  return true;
}


/**
 * Put one hostile round in the air from `pos` with `vel` (the warhead then
 * chases the player until a flare decoys it). Shared by the bandit launch
 * above and the diagnostics hook below, so a test flies the same round the
 * sim does.
 */
export function putHostileRound(ctx: Dogfight, pos: THREE.Vector3, vel: THREE.Vector3, seed: number): boolean {
  const mesh = ctx.missilePool.pop();
  if (!mesh) return false;
  mesh.visible = true;
  mesh.position.copy(pos);
  mesh.quaternion.setFromUnitVectors(NOSE_Z, DIR.copy(vel).normalize());
  ctx.blasts.spawnSpark(pos, false);
  ctx.blasts.trail(pos, 1.3, 1.6);
  ctx.flash(pos);
  ctx.onMissileLaunch?.(true, pos);
  ctx.missiles.push({
    id: ++ctx.missileSerial,
    pos,
    vel,
    motor: MISSILE_MOTOR,
    arm: MISSILE_ARM,
    trailT: 0,
    mesh,
    hostile: true,
    life: MISSILE_LIFE,
    decoy: null,
    seed,
  });
  return true;
}


/** Every hostile round in the air: where it is, and whether a flare has it. */
export function hostileRounds(ctx: Dogfight): Array<{ x: number; y: number; z: number; decoyed: boolean }> {
  const out: Array<{ x: number; y: number; z: number; decoyed: boolean }> = [];
  for (const m of ctx.missiles) {
    if (m.hostile) out.push({ x: m.pos.x, y: m.pos.y, z: m.pos.z, decoyed: m.decoy !== null });
  }
  return out;
}


/**
 * Fire one hostile round from a point and heading, as if a bandit had. Used
 * by the headless countermeasure check so the decoy logic can be flown
 * without waiting on a bandit's launch geometry.
 */
export function fireHostileRoundForTest(ctx: Dogfight, pos: THREE.Vector3, vel: THREE.Vector3, seed = 1): boolean {
  return ctx.putHostileRound(pos, vel, seed);
}


/** Steer one seeker head onto a point; returns the range to it. */
export function steerSeeker(_ctx: Dogfight, m: Missile, target: THREE.Vector3, dt: number): number {
  const speed = m.vel.length();
  if (speed <= 1) return Infinity;
  DIR.copy(m.vel).divideScalar(speed);
  TMP.copy(target).sub(m.pos);
  const toT = TMP.length();
  if (toT < 1e-3) return 0;
  TMP.divideScalar(toT);
  const ang = DIR.angleTo(TMP);
  if (ang > 1e-4) {
    AXIS.crossVectors(DIR, TMP);
    if (AXIS.lengthSq() < 1e-8) AXIS.set(0, 1, 0);
    AXIS.normalize();
    DIR.applyAxisAngle(AXIS, Math.min(ang, MISSILE_TURN * dt));
    m.vel.copy(DIR).multiplyScalar(speed);
  }
  return toT;
}


/**
 * Ask for one missile launch (the missile key). The shot is taken on the
 * next sim step if a live target exists and the jet is airborne; the racks
 * are per-airframe (the Tomcat and Hornet ride two, the Intruder none).
 */
export function requestMissile(ctx: Dogfight, player: AircraftState): void {
  if (player.spec.surfaceVessel) { launchNavalMissile(ctx, player); return; }
  if (ctx.missileCd > 0 || ctx.missilesLeft <= 0 || ctx.missilePool.length === 0) return;
  if (player.onGround || player.result) {
    if (!player.onGround) return;
    ctx.banner(player, "MISSILES — AIRBORNE ONLY");
    return;
  }
  const target = ctx.nearestMissileTarget(player.pos);
  if (!target) {
    ctx.banner(player, "NO MISSILE TARGET ON THE GRID");
    return;
  }
  ctx.fireMissile(player);
}


/** The nearest thing a seeker can lock: bandit, strike target or the boat. */
export function nearestMissileTarget(ctx: Dogfight, from: THREE.Vector3): THREE.Vector3 | null {
  let best: THREE.Vector3 | null = null;
  let bestD = Infinity;
  for (const b of ctx.bandits) {
    if (b.catT >= 0) continue;
    const d = b.pos.distanceToSquared(from);
    if (d < bestD) {
      bestD = d;
      best = b.pos;
    }
  }
  for (const opponent of ctx.opponents) {
    const d = opponent.pos.distanceToSquared(from);
    if (d < bestD) { bestD = d; best = opponent.pos; }
  }
  for (const t of ctx.strikeTargets) {
    if (t.dead || t.arrived) continue;
    const d = t.pos.distanceToSquared(from);
    if (d < bestD) {
      bestD = d;
      best = t.pos;
    }
  }
  const cv = ctx.cv;
  if (cv && cv.status !== "sinking" && cv.status !== "sunk") {
    CVPT.set(cv.def.x, cv.def.deckY + 6, cv.def.z);
    const d = CVPT.distanceToSquared(from);
    if (d < bestD) {
      bestD = d;
      best = CVPT;
    }
  }
  return best;
}


/** Drop one off the next rail: it inherits the jet's velocity vector. */
export function fireMissile(ctx: Dogfight, player: AircraftState): void {
  const mesh = ctx.missilePool.pop();
  if (!mesh) return;
  const [sx, sy, sz] = MISSILE_STATIONS[ctx.missiles.length % MISSILE_STATIONS.length];
  const naval = player.spec.surfaceVessel;
  const pos = player.pos.clone().add(new THREE.Vector3(sx, naval ? 9 : sy, naval ? -30 : sz).applyQuaternion(player.quat));
  // A rail launch: down and outboard first, then the motor lights and the
  // seeker pulls it around.
  const vel = player.vel
    .clone()
    .add(new THREE.Vector3(sx > 0 ? 5 : -5, -3.5, 0).applyQuaternion(player.quat));
  if (naval) vel.copy(player.vel).add(new THREE.Vector3(0, 100, 0));
  mesh.visible = true;
  mesh.position.copy(pos);
  mesh.quaternion.setFromUnitVectors(NOSE_Z, DIR.copy(vel).normalize());
  // the launch has to read: rail flash, a puff of motor smoke, a bright core
  ctx.blasts.spawnSpark(pos, false);
  ctx.blasts.trail(pos, 1.3, 1.6);
  ctx.flash(pos);
  ctx.pushReleaseMarker(pos);
  ctx.onMissileLaunch?.(false, pos);
  ctx.missiles.push({
    id: ++ctx.missileSerial,
    pos,
    vel,
    motor: MISSILE_MOTOR,
    arm: MISSILE_ARM,
    trailT: 0,
    mesh,
    hostile: false,
    life: MISSILE_LIFE,
    decoy: null,
    seed: hash(pos.x * 1.7 + pos.z * 0.9 + ctx.missiles.length),
  });
  if (ctx.versus) ctx.weaponLaunches.push({ weapon: "missile", pos: pos.toArray(), vel: vel.toArray() });
  ctx.missilesLeft--; ctx.storesUsed++;
  ctx.missileCd = MISSILE_CD;
  ctx.banner(
    player,
    ctx.missilesLeft > 0 ? "FOX 2 — MISSILE AWAY" : "FOX 2 — LAST MISSILE AWAY",
  );
}


/** Fly the seeker heads, one sim step at a time. */
export function stepMissiles(ctx: Dogfight, dt: number, player: AircraftState): void {
  ctx.missileCd = Math.max(0, ctx.missileCd - dt);
  for (let i = ctx.missiles.length - 1; i >= 0; i--) {
    const m = ctx.missiles[i];
    // --- a round that runs out of energy is gone ---
    m.life -= dt;
    if (m.life <= 0) {
      ctx.retireMissile(i, m);
      continue;
    }
    // --- motor: thrust, then an unpowered coast with drag and sag ---
    if (m.motor > 0) {
      m.motor -= dt;
      const speed = m.vel.length();
      if (speed > 1) {
        DIR.copy(m.vel).divideScalar(speed);
        m.vel.addScaledVector(DIR, MISSILE_ACCEL * dt);
        if (m.vel.length() > MISSILE_V_MAX) m.vel.setLength(MISSILE_V_MAX);
      }
    } else {
      const atm = atmosphere(m.pos.y);
      const sp = m.vel.length();
      if (sp > 1) {
        const k = (0.5 * atm.rho * MISSILE_CD0 * MISSILE_AREA * sp) / MISSILE_MASS;
        m.vel.multiplyScalar(Math.max(0, 1 - k * dt));
      }
      m.vel.y -= GRAVITY * 0.6 * dt; // a lifting body, not a brick
    }
    m.pos.addScaledVector(m.vel, dt);

    // --- seeker ---
    m.arm -= dt;
    if (m.arm <= 0) {
      if (m.hostile) {
        // A hostile round hunts the player — unless a flare has fooled it.
        // The capture is sticky: a seeker that went for the flare keeps the
        // flare, which is why a burst of cartridges works at all.
        if (m.decoy && m.decoy.life <= 0) m.decoy = null;
        if (!m.decoy) m.decoy = tryFlareCapture(ctx, m, dt);
        const target = m.decoy ? m.decoy.pos : m.targetPilot && m.targetPilot !== ctx.localPilot ? ctx.defenders.find(p => p.id === m.targetPilot)?.pos ?? player.pos : player.pos;
        ctx.steerSeeker(m, target, dt);
      } else {
        if (m.decoy && m.decoy.life <= 0) m.decoy = null;
        if (!m.decoy) m.decoy = tryFlareCapture(ctx, m, dt);
        // A captured PvP seeker fuzes its cartridge, without claiming a hit
        // or damaging a nearby airframe with the decoy explosion.
        if (m.decoy) {
          if (ctx.steerSeeker(m, m.decoy.pos, dt) < MISSILE_DET) {
            ctx.blasts.spawn(m.pos.clone(), "air", .7);
            ctx.retireMissile(i, m);
            continue;
          }
        }
        const target = m.decoy ? null : m.naval ? navalTarget(ctx, m) : ctx.nearestMissileTarget(m.pos);
        if (target) {
          const toT = ctx.steerSeeker(m, target, dt);
          if (toT < MISSILE_DET && (!m.naval || target.distanceTo(m.naval.point) < 40)) {
            ctx.impactMissile(i, m.pos, "air", player);
            continue;
          }
        }
      }
    }

    // --- plume: hard white smoke while the motor burns, wisps after ---
    m.trailT -= dt;
    if (m.trailT <= 0) {
      ctx.blasts.trail(m.pos, m.motor > 0 ? 1.9 : 0.9, m.motor > 0 ? 1.6 : 1.1);
      m.trailT = m.motor > 0 ? MISSILE_TRAIL_HOT : MISSILE_TRAIL_COLD;
    }

    m.mesh.position.copy(m.pos);
    m.mesh.quaternion.setFromUnitVectors(NOSE_Z, DIR.copy(m.vel).normalize());

    // --- detonations: the seeker's own target, the boat's deck, or the
    // surface. The fuze only goes live once the round has cleared its
    // launcher: a warhead whose fuze could see the launching aircraft (it
    // sits a few metres off the rail) blew the shooter out of the sky with
    // its own weapon on the first step. ---
    const armed = m.arm <= 0;
    let hit: BlastKind | null = null;
    if (armed) {
      if (m.hostile) {
        // A bandit's round belongs to the bandits' side: it fuzes the player
        // (or a flare), never a friendly airframe, or the pack shot itself
        // down as its own rounds left the rail.
        const decoyed = m.decoy !== null;
        // A decoyed round goes off on the cartridge that fooled it, and the
        // jet is untouched: that is the whole exchange the pilot paid for.
        if (decoyed && m.decoy!.pos.distanceTo(m.pos) < MISSILE_DET) {
          ctx.blasts.spawn(TMP.copy(m.pos), "air", 1.0);
          ctx.retireMissile(i, m);
          continue;
        }
        // A seeker that has gone for a flare is no longer looking at the
        // jet: the fuze follows the flare, so a cartridge dropped a few
        // metres off the wing still breaks the attack instead of trading a
        // flare for the warhead's splash.
        if (!decoyed && (player.spec.surfaceVessel ? hitsVessel(m.pos, m.pos, player, 12) : player.pos.distanceTo(m.pos) < MISSILE_AIR_R)) {
          ctx.hitT = HIT_FLASH;
          ctx.damagePlayer(player, MISSILE_PLAYER_DMG);
          hit = "air";
        }
      } else if (!m.decoy) {
        for (const b of ctx.bandits) {
          if (b.catT >= 0) continue;
          if (b.pos.distanceTo(m.pos) < MISSILE_AIR_R) {
            ctx.hitT = HIT_FLASH;
            ctx.damageBandit(b, MISSILE_HP, player);
            hit = "air";
            break;
          }
        }
        if (!hit && ctx.opponents.some(o => canHitOpponent(m, o) && (o.surfaceVessel && o.quat ? hitsVessel(m.pos, m.pos, { pos: o.pos, quat: o.quat }, 12) : o.pos.distanceTo(m.pos) < MISSILE_AIR_R))) hit = "air";
      }
      if (!hit) {
        for (const t of ctx.strikeTargets) {
          if (t.dead || t.arrived) continue;
          TMP.copy(t.pos);
          TMP.y += 8;
          if (TMP.distanceTo(m.pos) < (m.naval ? 18 : t.radius + MISSILE_DET)) {
            hit = "ground";
            break;
          }
        }
      }
      if (!hit) {
        const cv = ctx.cv;
        if (
          cv &&
          cv.status !== "sinking" &&
          cv.status !== "sunk" &&
          m.pos.y <= cv.def.deckY + 4 &&
          isOnDeck(cv.def, m.pos.x, m.pos.z)
        ) {
          hit = "ground";
        }
      }
    }
    if (!hit) {
      const g = groundAt(m.pos.x, m.pos.z);
      if (m.pos.y <= g.y) hit = g.kind === "water" ? "water" : "ground";
    }
    if (hit && m.decoy) {
      ctx.blasts.spawn(m.pos.clone(), hit, .7);
      ctx.retireMissile(i, m);
    } else if (hit) ctx.impactMissile(i, m.pos, hit, player);
  }
}


/**
 * A missile warhead goes off: three times the flash of a bomb, with splash
 * damage around the burst so a near miss still counts. The warhead is a
 * class above a 500 lb bomb: anything within 30 m of the burst is destroyed,
 * and the blast reaches 60 m.
 */
export function impactMissile(ctx: Dogfight, i: number, at: THREE.Vector3, kind: BlastKind, player: AircraftState): void {
  const g = groundAt(at.x, at.z);
  const y = Math.max(at.y, g.y + (kind === "air" ? 0 : 1.5));
  ctx.lastImpact.set(at.x, y, at.z);
  ctx.lastImpactKind = kind;
  ctx.impactAge = 0;
  for (const t of ctx.strikeTargets) {
    if (t.dead || t.arrived) continue;
    const d = Math.hypot(at.x - t.pos.x, at.y - (t.pos.y + 6), at.z - t.pos.z);
    if (d > 60) continue;
    ctx.damageTarget(t, d < 30 ? MISSILE_HP : MISSILE_HP * 0.55, player);
  }
  ctx.blasts.spawn(TMP.set(at.x, y, at.z), kind, kind === "water" ? 2.6 : 2.3);
  // a column that outlives the fireball, so the kill reads from any camera
  ctx.blasts.trail(TMP.set(at.x, y + 10, at.z), 4.6, IMPACT_SMOKE_TTL);
  ctx.blasts.trail(TMP.set(at.x, y + 24, at.z), 6.5, IMPACT_SMOKE_TTL * 0.8);
  for (const opponent of ctx.opponents) {
    if (!canHitOpponent(ctx.missiles[i], opponent)) continue;
    if (opponent.surfaceVessel && opponent.quat ? hitsVessel(at, at, { pos: opponent.pos, quat: opponent.quat }, 16) : opponent.pos.distanceTo(at) < MISSILE_AIR_R) ctx.hitOpponent(opponent, "missile");
  }

  // splash damage on anything airborne near the burst
  for (const b of ctx.bandits) {
    if (b.catT >= 0) continue;
    if (b.pos.distanceTo(at) < MISSILE_AIR_R * 1.5 && b.hp > 0) {
      ctx.damageBandit(b, MISSILE_HP * 0.5, player);
    }
  }
  const cv = ctx.cv;
  if (
    cv &&
    cv.status !== "sinking" &&
    cv.status !== "sunk" &&
    isOnDeck(cv.def, at.x, at.z)
  ) {
    ctx.damageCarrier(TMP, player, MISSILE_CV_DMG);
  }
  ctx.flash(TMP);
  const m = ctx.missiles[i];
  m.mesh.visible = false;
  ctx.missilePool.push(m.mesh);
  ctx.missiles.splice(i, 1);
}
