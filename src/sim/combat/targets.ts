// Strike targets on land and at sea: spawning, waves, damage and wrecks.

import * as THREE from "three";
import { TARGET_HP, TARGET_RADIUS, buildTargetMesh, wreckTarget } from "../../render/targets";
import type { TargetKind } from "../../render/targets";
import type { AircraftState } from "../flight";
import { groundAt } from "../world";
import { isFortressPrimary } from "../operations";
import type { StrikeTarget } from "./types";
import { BOMB_HP, CV_HP, CV_NAME, HIT_FLASH, MAX_CLAIMED_CV_HIT, WAVE_RESPAWN } from "./tuning";
import { TMP, disposeSubtree, hash } from "./scratch";

import type { Dogfight } from "./core";


/** Damage the hostile boat (bomb on the deck, or gun rounds in a strafe). */
export function damageCarrier(ctx: Dogfight, at: THREE.Vector3, player: AircraftState, dmg: number): void {
  const cv = ctx.cv;
  if (!cv || cv.status === "sinking" || cv.status === "sunk") return;
  // Same wire-damage guard as the bandits: no NaN, no negative hulls, and no
  // claim bigger than the biggest hit the fight can produce.
  if (!Number.isFinite(dmg) || dmg <= 0) return;
  dmg = Math.min(dmg, MAX_CLAIMED_CV_HIT);
  // A wingman's hit goes to the host as well: the host owns the hull, and the
  // snapshot it sends back settles the damage a packet later.
  if (ctx.mirror) ctx.carrierHitOut += dmg;
  if (!ctx.mirror && (ctx.operation?.state.kind === "fleet" || ctx.operation?.state.kind === "campaign")) {
    const before = ctx.operation.state.suppressed; ctx.operation.damageDeck(dmg);
    if (!before && ctx.operation.state.suppressed) { ctx.roleQueue = []; ctx.banner(player, "FLIGHT DECK DISABLED — NO FURTHER LAUNCHES"); }
  }
  cv.hp = Math.max(0, Math.min(CV_HP, cv.hp - dmg));
  ctx.hitT = HIT_FLASH;
  ctx.flash(at);
  if (cv.hp <= 0) {
    cv.status = "sinking";
    cv.sinkT = 0;
    cv.speed = 0;
    ctx.launchQueued = 0;
    ctx.confirmDamage("CARRIER DISABLED", "destroyed");
    ctx.kills++; // the boat counts as a kill
    ctx.banner(player, `DIRECT HIT — ${CV_NAME} IS SINKING — NO MORE LAUNCHES`);
  } else {
    ctx.confirmDamage("CARRIER HIT", "hit");
    ctx.banner(player, `DIRECT HIT — ${CV_NAME} HULL ${cv.hp}%`);
  }
}


// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Strike scenario: land and sea targets in waves

/**
 * Blast damage to strike targets around an impact. A weapon that lands on or
 * next to a structure tears it apart; further out it still hurts. This is
 * what makes a near miss on a hangar count without turning every bomb into
 * an area weapon.
 */
export function blastTargets(ctx: Dogfight, at: THREE.Vector3, player: AircraftState): void {
  for (const t of ctx.strikeTargets) {
    if (t.dead || t.arrived) continue;
    const d = Math.hypot(at.x - t.pos.x, at.y - (t.pos.y + 6), at.z - t.pos.z);
    if (d > 45) continue;
    ctx.damageTarget(t, BOMB_HP * (d < 15 ? 1.4 : d < 28 ? 1 : 0.6), player);
  }
}


/** Damage a strike target; a dead one is wrecked in place and keeps smoking. */
export function damageTarget(ctx: Dogfight, t: StrikeTarget, dmg: number, player: AircraftState): void {
  if (t.dead || t.arrived || !Number.isFinite(dmg) || dmg <= 0) return;
  dmg = Math.min(dmg, BOMB_HP * 2);
  if (ctx.mirror) { ctx.hitsOut.push({ id: t.id, dmg, combatId: ctx.combatId }); ctx.confirmDamage("TARGET HIT", "hit"); return; }
  t.hp -= dmg;
  if (t.role === "cargo") {
    t.speed = t.hp < TARGET_HP.ship ? 3 : 6;
    if (t.hp <= TARGET_HP.ship * .5 && !t.disabled) { t.disabled = true; t.speed = 0; ctx.confirmDamage("TRANSPORT DISABLED", "destroyed"); ctx.banner(player, "PROPULSION DISABLED — TRANSPORT STOPPED"); }
  }
  ctx.hitT = HIT_FLASH;
  if (t.hp > 0) { ctx.confirmDamage("TARGET HIT", "hit"); return; }
  ctx.confirmDamage("TARGET DESTROYED", "destroyed");
  t.dead = true;
  t.wreckT = 0;
  t.smokeT = 0.6;
  ctx.kills++;
  if (ctx.operation && t.role !== "cargo" && !isFortressPrimary(t.role)) ctx.operation.state.optional++;
  wreckTarget(t.mesh);
  TMP.set(t.pos.x, t.pos.y + 7, t.pos.z);
  ctx.blasts.spawn(TMP, "ground", t.role === "fuel" ? 2.4 : 1.35);
  ctx.flash(TMP);
  if (t.role === "fuel") {
    for (const other of ctx.strikeTargets) {
      if (other !== t && !other.dead && !other.arrived && other.pos.distanceTo(t.pos) < 165) {
        ctx.damageTarget(other, 16, player);
      }
    }
    ctx.banner(player, "FUEL DEPOT DETONATION — SECONDARY CHAIN REACTION");
    return;
  }
  const left = ctx.strikeTargets.reduce((n, x) => n + (x.dead ? 0 : 1), 0);
  ctx.banner(
    player,
    ctx.operation ? `${t.role?.toUpperCase()} DESTROYED` : left > 0 ? `TARGET CLEARED — ${left} LEFT` : "ALL TARGETS DOWN — STAND BY FOR THE NEXT WAVE",
  );
}


/** One wave: a target site on land plus a group of ships at sea. */
export function spawnStrikeWave(ctx: Dogfight, player: AircraftState): number {
  // Keep the latest wrecks without growing the scene or exceeding wire limits.
  while (ctx.strikeTargets.length > 8) {
    const old = ctx.strikeTargets.shift()!; old.mesh.removeFromParent(); disposeSubtree(old.mesh);
  }
  const landN = Math.min(3 + Math.floor(ctx.wave / 2), 5);
  const seaN = Math.min(1 + Math.floor((ctx.wave + 1) / 2), 3);
  let n = 0;
  const site = ctx.findLandSite(player);
  if (site) {
    const kinds: TargetKind[] = ["hangar", "tank", "warehouse", "tank", "hangar"];
    for (let i = 0; i < landN; i++) {
      const ang = (i / landN) * Math.PI * 2 + hash(ctx.wave * 7.7 + i) * 0.9;
      const r = 55 + hash(ctx.wave * 3.1 + i * 2.3) * 55;
      const x = site.x + Math.cos(ang) * r;
      const z = site.z + Math.sin(ang) * r;
      const g = groundAt(x, z);
      if (g.kind === "water") continue;
      ctx.spawnTarget(kinds[i % kinds.length], x, g.y, z, 0, false);
      n++;
    }
  }
  const sea = ctx.findSeaSite(player);
  if (sea) {
    const brg = (Math.atan2(sea.x - player.pos.x, -(sea.z - player.pos.z)) * 180) / Math.PI;
    for (let i = 0; i < seaN; i++) {
      const across = (i - (seaN - 1) / 2) * 460;
      const ang = ((brg + 90) * Math.PI) / 180;
      const x = sea.x + Math.cos(ang) * across;
      const z = sea.z + Math.sin(ang) * across;
      const kind: TargetKind = i % 2 ? "patrol" : "ship";
      // steam back toward the player's area, so the group closes slowly and
      // a second pass finds it nearer than the first
      ctx.spawnTarget(kind, x, 0, z, brg + 180 + (hash(ctx.wave * 5.9 + i) * 30 - 15), true);
      n++;
    }
  }
  return n;
}

export function spawnTarget(ctx: Dogfight, 
  kind: TargetKind,
  x: number,
  y: number,
  z: number,
  headingDeg: number,
  sea: boolean,
): void {
  const mesh = buildTargetMesh(kind);
  mesh.position.set(x, y, z);
  // same heading convention as the fleet: +X is the bow
  mesh.rotation.y = ((90 - headingDeg) * Math.PI) / 180;
  ctx.root.add(mesh);
  ctx.strikeTargets.push({
    id: ctx.nextId++,
    kind,
    sea,
    hp: TARGET_HP[kind],
    pos: new THREE.Vector3(x, y, z),
    headingDeg,
    // A slow convoy, not speedboats: a level bombing run has to be able to
    // lead and hit a ship, so they steam at ~12 kt with the patrol slightly
    // quicker.
    speed: sea ? (kind === "patrol" ? 9 : 6) : 0,
    radius: TARGET_RADIUS[kind],
    mesh,
    dead: false,
    wreckT: 0,
    smokeT: 0,
  });
}


/** Flat-ish land 5-12 km from the player, well inside the chain. */
export function findLandSite(ctx: Dogfight, player: AircraftState): THREE.Vector3 | null {
  for (let i = 0; i < 28; i++) {
    const ang = hash(ctx.wave * 31.7 + i * 7.13) * Math.PI * 2;
    const dist = 5000 + hash(ctx.wave * 17.9 + i * 3.7) * 7000;
    const x = player.pos.x + Math.sin(ang) * dist;
    const z = player.pos.z - Math.cos(ang) * dist;
    if (Math.abs(x) > 27000 || Math.abs(z) > 27000) continue;
    const g = groundAt(x, z);
    if (g.kind !== "terrain" || g.y < 30) continue;
    // reject slopes: the site has to be flat enough to build on
    let flat = true;
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2 + 0.4;
      const h = groundAt(x + Math.cos(a) * 160, z + Math.sin(a) * 160).y;
      if (Math.abs(h - g.y) > 28) {
        flat = false;
        break;
      }
    }
    if (!flat) continue;
    return new THREE.Vector3(x, g.y, z);
  }
  return null;
}


/** Open water 5-12 km from the player, with room for a group to steam. */
export function findSeaSite(ctx: Dogfight, player: AircraftState): THREE.Vector3 | null {
  for (let i = 0; i < 28; i++) {
    const ang = hash(ctx.wave * 13.3 + i * 5.19) * Math.PI * 2;
    const dist = 5000 + hash(ctx.wave * 23.7 + i * 9.7) * 7000;
    const x = player.pos.x + Math.sin(ang) * dist;
    const z = player.pos.z - Math.cos(ang) * dist;
    if (Math.abs(x) > 28000 || Math.abs(z) > 28000) continue;
    if (groundAt(x, z).kind !== "water") continue;
    let open = true;
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2;
      if (groundAt(x + Math.cos(a) * 700, z + Math.sin(a) * 700).kind !== "water") {
        open = false;
        break;
      }
    }
    if (!open) continue;
    return new THREE.Vector3(x, 0, z);
  }
  return null;
}


/** Ships steam on; wrecks smoke for half a minute. Land targets stand still. */
export function stepTargets(ctx: Dogfight, dt: number): void {
  for (const t of ctx.strikeTargets) {
    if (t.dead) {
      t.wreckT += dt;
      if (t.wreckT < 20) {
        t.smokeT -= dt;
        if (t.smokeT <= 0) {
          ctx.blasts.trail(TMP.set(t.pos.x, t.pos.y + 6, t.pos.z), 2.2, 3.4);
          t.smokeT = 0.5;
        }
      }
      continue;
    }
    if (t.speed <= 0) continue;
    if (t.route) {
      if (ctx.operation?.state.status === "briefing" || t.arrived || t.disabled) continue;
      t.progress = Math.min(t.route.length, (t.progress ?? 0) + t.speed * dt);
      t.pos.set(t.route.x + t.route.dx * t.progress, t.pos.y, t.route.z + t.route.dz * t.progress);
      if (t.progress >= t.route.length && !ctx.mirror) { t.arrived = true; t.mesh.visible = false; }
      t.mesh.position.copy(t.pos); t.mesh.rotation.y = ((90 - t.headingDeg) * Math.PI) / 180; continue;
    }
    const h = (t.headingDeg * Math.PI) / 180;
    t.pos.x += Math.sin(h) * t.speed * dt;
    t.pos.z += -Math.cos(h) * t.speed * dt;
    // never steam onto a coast: sheer off instead
    if (groundAt(t.pos.x + Math.sin(h) * 600, t.pos.z - Math.cos(h) * 600).kind !== "water") {
      t.headingDeg = (t.headingDeg + 25) % 360;
    }
    t.mesh.position.set(t.pos.x, t.pos.y, t.pos.z);
  }
}


/**
 * Strike wave bookkeeping: while anything stands, the wave runs; once the
 * grid is clear the next one is on the way after a short pause. There is no
 * boat to sink here — the pressure comes from each wave growing.
 */
export function stepStrikeWaves(ctx: Dogfight, dt: number, player: AircraftState): void {
  const alive = ctx.strikeTargets.reduce((n, t) => n + (t.dead ? 0 : 1), 0);
  if (alive > 0) {
    ctx.waveClock += dt;
    return;
  }
  if (ctx.waveTimer <= 0) {
    ctx.waveTimer = WAVE_RESPAWN;
    ctx.banner(
      player,
      `WAVE ${ctx.wave} CLEARED — ${ctx.kills} TARGET${ctx.kills === 1 ? "" : "S"} TAGGED`,
    );
    return;
  }
  ctx.waveTimer -= dt;
  if (ctx.waveTimer <= 0) {
    ctx.wave++;
    const n = ctx.spawnStrikeWave(player);
    ctx.banner(player, `WAVE ${ctx.wave} — ${n} NEW TARGETS ON THE GRID`);
  }
}

export function clearTargets(ctx: Dogfight): void {
  for (const t of ctx.strikeTargets) {
    t.mesh.removeFromParent();
    disposeSubtree(t.mesh);
  }
  ctx.strikeTargets = [];
}
