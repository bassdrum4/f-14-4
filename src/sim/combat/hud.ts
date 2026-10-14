// HUD assembly: the air-combat and strike readouts.

import { missileWarning } from "../countermeasures";
import { TARGET_HP } from "../../render/targets";
import type { AircraftState } from "../flight";
import { headingOfQuat, headingOfVel } from "../world";
import type { Bandit, DogfightHud, Missile } from "./types";
import {
  BANDIT_HP,
  DAMAGE_FLASH,
  HIT_FLASH,
  IMPACT_MARKER_TTL,
  MISSILE_WARN_R,
  MUZZLE_V,
  RELEASE_MARKER_TTL,
} from "./tuning";
import { DIR } from "./scratch";

import type { Dogfight } from "./core";


/**
 * The nearest hostile round in the air, as the RWR would call it: slant
 * range, bearing from the jet's nose, and the seconds it needs to arrive.
 * Null when nothing is inbound.
 */
export function incomingMissile(ctx: Dogfight, player: AircraftState): DogfightHud["incoming"] {
  let best: Missile | null = null;
  let bestD = Infinity;
  for (const m of ctx.missiles) {
    if (!m.hostile || m.decoy || (m.targetPilot && m.targetPilot !== ctx.localPilot)) continue; // a decoyed round is no longer a threat
    const d = m.pos.distanceTo(player.pos);
    if (d < bestD) {
      bestD = d;
      best = m;
    }
  }
  if (!best || bestD > MISSILE_WARN_R) return null;
  return missileWarning(best.pos, best.vel, player.pos, player.vel);
}


/** HUD snapshot of the fight, measured from the player. */
export function hud(ctx: Dogfight, player: AircraftState): DogfightHud {
  if (ctx.scenario === "strike") return ctx.strikeHud(player);
  let nearest: Bandit | null = null;
  let nearestD = Infinity;
  for (const b of ctx.bandits) {
    const d = b.pos.distanceTo(player.pos);
    if (d < nearestD) {
      nearestD = d;
      nearest = b;
    }
  }
  const dx = (nearest?.pos.x ?? 0) - player.pos.x;
  const dz = (nearest?.pos.z ?? 0) - player.pos.z;
  // Lead points: where the player's rounds and a bandit meet, for the HUD's
  // gun cue. Rounds leave at MUZZLE_V plus the shooter's own speed.
  const gunSpeed = Math.max(MUZZLE_V + player.vel.length(), 1);
  const spots: DogfightHud["spots"] = ctx.bandits.map((b) => {
    const dist = b.pos.distanceTo(player.pos);
    const vel = DIR.set(0, 0, -1).applyQuaternion(b.quat).multiplyScalar(b.speed).sub(player.vel);
    let tof = Math.min(dist / gunSpeed, 2);
    let lx = b.pos.x + vel.x * tof;
    let ly = b.pos.y + vel.y * tof;
    let lz = b.pos.z + vel.z * tof;
    // refine once against the lead point's own distance
    tof = Math.min(Math.hypot(lx - player.pos.x, ly - player.pos.y, lz - player.pos.z) / gunSpeed, 2);
    lx = b.pos.x + vel.x * tof;
    ly = b.pos.y + vel.y * tof;
    lz = b.pos.z + vel.z * tof;
    return { x: b.pos.x, y: b.pos.y, z: b.pos.z, lx, ly, lz, km: dist / 1000, health: Math.max(0, b.hp / BANDIT_HP), label: ctx.operation ? b.role?.toUpperCase() : undefined };
  });
  for (const opponent of ctx.opponents) {
    const dist = opponent.pos.distanceTo(player.pos);
    const lead = opponent.pos.clone().addScaledVector(DIR.copy(opponent.vel).sub(player.vel), Math.min(dist / MUZZLE_V, 2));
    spots.push({ x: opponent.pos.x, y: opponent.pos.y, z: opponent.pos.z, lx: lead.x, ly: lead.y, lz: lead.z, km: dist / 1000 });
  }
  const cv = ctx.cv;
  let carrier: DogfightHud["carrier"] = null;
  if (cv) {
    const cdx = cv.def.x - player.pos.x;
    const cdz = cv.def.z - player.pos.z;
    carrier = {
      name: cv.def.name,
      x: cv.def.x,
      y: cv.def.deckY,
      z: cv.def.z,
      distKm: Math.hypot(cdx, cdz) / 1000,
      brgDeg: (Math.atan2(cdx, -cdz) * 180) / Math.PI,
      hp: Math.max(0, Math.round(cv.hp)),
      status: cv.status,
      inbound: (ctx.operation ? ctx.roleQueue.length : ctx.launchQueued) + ctx.bandits.filter((b) => b.catT >= 0).length,
      headingDeg: cv.def.headingDeg,
    };
  }
  return {
    active: ctx.active,
    strike: false,
    hull: Math.max(0, Math.round(ctx.hull)),
    kills: ctx.kills,
    wave: ctx.wave,
    bandits: ctx.versus ? ctx.opponents.length : ctx.bandits.length,
    nearestKm: nearest ? nearestD / 1000 : 0,
    nearestBrgDeg: nearest ? (Math.atan2(dx, -dz) * 180) / Math.PI : 0,
    markers: ctx.versus
      ? ctx.opponents.map(b => ({ x: b.pos.x, z: b.pos.z, headingDeg: headingOfVel(b.vel) }))
      : ctx.bandits.map((b) => ({ x: b.pos.x, z: b.pos.z, headingDeg: headingOfQuat(b.quat) })),
    threat: ctx.threatT > 0,
    firing: ctx.gunLive,
    hitT: ctx.hitT / HIT_FLASH,
    confirmation: ctx.confirmation ? { ...ctx.confirmation } : null,
    damageT: ctx.damageT / DAMAGE_FLASH,
    spots,
    bombs: ctx.bombsLeft,
    bombsMax: ctx.bombsMax,
    bombsAway: ctx.bombs.length,
    bombsTracking: ctx.bombs.filter((b) => b.guided).length,
    missiles: ctx.missilesLeft,
    missilesMax: ctx.missilesMax,
    flares: ctx.flaresLeft,
    flaresMax: ctx.flaresMax,
    incoming: ctx.incomingMissile(player),
    designated: ctx.designation
      ? (() => {
          const d = ctx.designation!;
          return {
            x: d.x,
            y: d.y,
            z: d.z,
            km: Math.hypot(d.x - player.pos.x, d.y - player.pos.y, d.z - player.pos.z) / 1000,
          };
        })()
      : null,
    released: ctx.releaseAge < RELEASE_MARKER_TTL
      ? { x: ctx.releaseMarker.x, y: ctx.releaseMarker.y, z: ctx.releaseMarker.z, age: ctx.releaseAge }
      : null,
    landed: ctx.impactAge < IMPACT_MARKER_TTL
      ? { x: ctx.lastImpact.x, y: ctx.lastImpact.y, z: ctx.lastImpact.z, age: ctx.impactAge, kind: ctx.lastImpactKind ?? "ground" }
      : null,
    carrier,
  };
}


/** HUD snapshot for the strike scenario: targets instead of bandits. */
export function strikeHud(ctx: Dogfight, player: AircraftState): DogfightHud {
  let nearestD = Infinity;
  let ndx = 0;
  let ndz = 0;
  let alive = 0;
  const spots: DogfightHud["spots"] = [];
  const markers: Array<{ x: number; z: number; headingDeg: number }> = [];
  for (const t of ctx.strikeTargets) {
    if (t.dead || t.arrived) continue;
    alive++;
    const d = t.pos.distanceTo(player.pos);
    if (d < nearestD) {
      nearestD = d;
      ndx = t.pos.x - player.pos.x;
      ndz = t.pos.z - player.pos.z;
    }
    const ty = t.pos.y + 6;
    spots.push({ x: t.pos.x, y: ty, z: t.pos.z, lx: t.pos.x, ly: ty, lz: t.pos.z, km: d / 1000, health: Math.max(0, t.hp / TARGET_HP[t.kind]), label: t.disabled ? "STOPPED" : t.role?.toUpperCase() });
    markers.push({ x: t.pos.x, z: t.pos.z, headingDeg: t.headingDeg });
  }
  return {
    active: ctx.active,
    strike: true,
    hull: Math.max(0, Math.round(ctx.hull)),
    kills: ctx.kills,
    wave: ctx.wave,
    bandits: alive,
    nearestKm: alive ? nearestD / 1000 : 0,
    nearestBrgDeg: alive ? (Math.atan2(ndx, -ndz) * 180) / Math.PI : 0,
    markers,
    threat: ctx.threatT > 0,
    firing: ctx.gunLive,
    hitT: ctx.hitT / HIT_FLASH,
    confirmation: ctx.confirmation ? { ...ctx.confirmation } : null,
    damageT: ctx.damageT / DAMAGE_FLASH,
    spots,
    bombs: ctx.bombsLeft,
    bombsMax: ctx.bombsMax,
    bombsAway: ctx.bombs.length,
    bombsTracking: ctx.bombs.filter((b) => b.guided).length,
    missiles: ctx.missilesLeft,
    missilesMax: ctx.missilesMax,
    flares: ctx.flaresLeft,
    flaresMax: ctx.flaresMax,
    incoming: ctx.incomingMissile(player),
    designated: ctx.designation
      ? (() => {
          const d = ctx.designation!;
          return {
            x: d.x,
            y: d.y,
            z: d.z,
            km: Math.hypot(d.x - player.pos.x, d.y - player.pos.y, d.z - player.pos.z) / 1000,
          };
        })()
      : null,
    released: ctx.releaseAge < RELEASE_MARKER_TTL
      ? { x: ctx.releaseMarker.x, y: ctx.releaseMarker.y, z: ctx.releaseMarker.z, age: ctx.releaseAge }
      : null,
    landed: ctx.impactAge < IMPACT_MARKER_TTL
      ? { x: ctx.lastImpact.x, y: ctx.lastImpact.y, z: ctx.lastImpact.z, age: ctx.impactAge, kind: ctx.lastImpactKind ?? "ground" }
      : null,
    carrier: null,
  };
}
