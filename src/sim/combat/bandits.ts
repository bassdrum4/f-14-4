// Bandit airframes: steering, gunnery, collisions and how they die.

import * as THREE from "three";
import { buildAircraft } from "../../render/geometry";
import { animateExhaust } from "../../render/aircraftDetails";
import type { SharedBandit } from "../combatSnapshot";
import type { BlastKind } from "../../render/effects";
import { AIRCRAFT } from "../aircraft";
import { sustainedTurnRate } from "../flight";
import type { AircraftState } from "../flight";
import { groundAt, isOnDeck } from "../world";
import type { Bandit, EnemyPose } from "./types";
import {
  AIM_CONE,
  ARENA,
  BANDIT_AB_TIME,
  BANDIT_HIT_R,
  BANDIT_HP,
  BANDIT_MAX_AB,
  BANDIT_MAX_DRY,
  BANDIT_SPEED,
  BANDIT_SPREAD,
  BANDIT_TURN_FLOOR,
  CEILING,
  CV_FIRST_LAUNCH,
  CV_NAME,
  ENGAGE_DIST,
  EVADE_DIST,
  KEEP_APART,
  MAX_CLAIMED_HIT,
  MERGE_DIST,
  MID_AIR_DAMAGE,
  MUZZLE_V,
  NOSE_BREAK_DIST,
  NOSE_CONE_COS,
  PANIC_DIST,
  PLAYER_HIT_R,
  RAM_CARRIER_HP,
  THREAT_HOLD,
  WAVE_MAX,
  WAVE_RESPAWN,
  fighterSkill,
} from "./tuning";
import {
  AHEAD,
  AIM,
  AXIS,
  DESIRED,
  FWD,
  LAT,
  MAT4,
  MIRROR_EASE,
  MIRROR_LEAD,
  ORIGIN,
  PFWD,
  ROLL_Q,
  SEP,
  SYNC,
  TMP,
  TO_P,
  WORLD_UP,
  Z_AXIS,
  disposeSubtree,
  hash,
  terrainBlocks,
} from "./scratch";

import type { Dogfight } from "./core";


/** The bandit with this id. Packs are tiny, so a scan costs nothing. */
export function findBandit(ctx: Dogfight, id: number): Bandit | null {
  for (const b of ctx.bandits) if (b.id === id) return b;
  return null;
}


/**
 * Build a bandit the host owns: same airframe, same tracer colour, no local
 * steering. Used when a packet names an aircraft we have no mesh for yet.
 */
export function spawnMirrorBandit(ctx: Dogfight, p: EnemyPose): Bandit {
  const mesh = buildAircraft((p as SharedBandit).role === "bomber" ? "intruder" : "tomcat", "bandit");
  mesh.gear.visible = p.onDeck;
  mesh.afterburner.visible = false;
  mesh.wings[0].rotation.y = 0;
  mesh.wings[1].rotation.y = 0;
  const pos = new THREE.Vector3(p.x, p.y, p.z);
  const quat = new THREE.Quaternion(p.qx, p.qy, p.qz, p.qw);
  mesh.group.position.copy(pos);
  mesh.group.quaternion.copy(quat);
  ctx.root.add(mesh.group);
  const b: Bandit = {
    id: p.id,
    hp: p.hp,
    pos,
    quat,
    bank: 0,
    speed: 200,
    fireCd: 1.5 + hash(p.id) * 2,
    burst: 0,
    evadeT: 0,
    evadeCd: 0,
    // A mirrored bandit is the host's aircraft: the host fires its rounds.
    missiles: 0,
    missileCd: Infinity,
    phase: hash(p.id * 11.3) * Math.PI * 2,
    mesh,
    catT: p.onDeck ? 0 : -1,
    catStart: pos.clone(),
    catDir: new THREE.Vector3(0, 0, -1),
    climbT: 0,
    sweepT: 1,
    abOn: false,
    abT: 0,
    abCool: 2,
    remote: true,
    netPos: pos.clone(),
    netQuat: quat.clone(),
    netVel: new THREE.Vector3(),
  };
  ctx.bandits.push(b);
  return b;
}


/**
 * Fly a mirrored bandit: ease onto the newest packet, led by the velocity the
 * last two packets imply. Nothing here steers — the host is flying it.
 */
export function stepMirrorBandit(ctx: Dogfight, b: Bandit, dt: number): void {
  SYNC.set(
    b.netPos.x + b.netVel.x * MIRROR_LEAD,
    b.netPos.y + b.netVel.y * MIRROR_LEAD,
    b.netPos.z + b.netVel.z * MIRROR_LEAD,
  );
  const k = 1 - Math.exp(-dt / MIRROR_EASE);
  b.pos.lerp(SYNC, k);
  b.quat.slerp(b.netQuat, k);
  b.sweepT = Math.min(1, b.sweepT + dt / 6);
  if (b.role !== "bomber") { b.mesh.wings[0].rotation.y = -1.0 * b.sweepT; b.mesh.wings[1].rotation.y = 1.0 * b.sweepT; }
  b.mesh.gear.visible = b.catT >= 0;
  b.mesh.group.position.copy(b.pos);
  b.mesh.group.quaternion.copy(b.quat);
  ctx.stepDamageSmoke(b, dt);
}

export function stepDamageSmoke(ctx: Dogfight, b: Bandit, dt: number): void {
  if (b.hp > BANDIT_HP * 0.5) return;
  b.smokeT = (b.smokeT ?? 0) - dt;
  if (b.smokeT <= 0) {
    ctx.blasts.trail(b.pos, 1.3, 2.4);
    b.smokeT = 0.18;
  }
}


/**
 * A round or a warhead landed on a bandit. On a mirror client the damage is
 * applied here and predicted (the hit has to read instantly) and is also sent
 * to the host, who owns the aircraft and settles the kill.
 */
export function damageBandit(ctx: Dogfight, b: Bandit, dmg: number, player: AircraftState): void {
  // Last line of defence for damage that arrives over the wire: a non-finite
  // or negative number would make the bandit impossible to kill.
  if (!Number.isFinite(dmg) || dmg <= 0) return;
  if (b.hp <= 0) return;
  if (ctx.mirror && ctx.operation) { ctx.hitsOut.push({ id: b.id, dmg: Math.min(dmg, MAX_CLAIMED_HIT), combatId: ctx.combatId }); ctx.confirmDamage("BANDIT HIT", "hit"); return; }
  b.hp -= Math.min(dmg, MAX_CLAIMED_HIT);
  if (b.hp > 0) ctx.confirmDamage("AIRCRAFT HIT", "hit");
  if (ctx.mirror) ctx.hitsOut.push({ id: b.id, dmg });
  if (b.hp <= 0) {
    if (ctx.mirror) ctx.takenDown.set(b.id, performance.now());
    ctx.killBandit(b, player);
  }
}


/**
 * Live bandit positions + velocities, for radar/aim-assist features and
 * headless tests. Allocates; not for per-frame hot loops.
 */
export function targets(ctx: Dogfight): Array<{ id: number; pos: THREE.Vector3; vel: THREE.Vector3 }> {
  const out: Array<{ id: number; pos: THREE.Vector3; vel: THREE.Vector3 }> = [];
  for (const b of ctx.bandits) {
    const vel = new THREE.Vector3(0, 0, -1).applyQuaternion(b.quat).multiplyScalar(b.speed);
    // id: stable per bandit, so callers that track motion (accel estimators)
    // do not confuse two bandits that swap nearest within a step.
    out.push({ id: b.id, pos: b.pos.clone(), vel });
  }
  return out;
}


// -------------------------------------------------------------------------

export function clearBandits(ctx: Dogfight): void {
  for (const b of ctx.bandits) {
    b.mesh.group.removeFromParent();
    disposeSubtree(b.mesh.group);
  }
  ctx.bandits = [];
}

export function playerHeading(_ctx: Dogfight, player: AircraftState): number {
  FWD.set(0, 0, -1).applyQuaternion(player.quat);
  return Math.atan2(FWD.x, -FWD.z);
}


/** Point the bandit's forward (-Z) at `dir` with the given bank. */
export function aimQuat(_ctx: Dogfight, b: Bandit, dir: THREE.Vector3, bank: number): void {
  MAT4.lookAt(ORIGIN, dir, WORLD_UP);
  b.quat.setFromRotationMatrix(MAT4);
  ROLL_Q.setFromAxisAngle(Z_AXIS, bank);
  b.quat.multiply(ROLL_Q);
}


/**
 * One bandit's step. Returns false when the bandit is gone (it flew into the
 * ground and broke up), so the caller can skip its guns.
 */
export function stepBandit(ctx: Dogfight, b: Bandit, dt: number, player: AircraftState): boolean {
  if (b.catT >= 0) {
    ctx.stepLaunch(b, dt);
    return true;
  }
  // away from the deck: gear up, wings sweeping back, nose held up
  b.sweepT = Math.min(1, b.sweepT + dt / 5);
  if (b.role !== "bomber") { b.mesh.wings[0].rotation.y = -1.0 * b.sweepT; b.mesh.wings[1].rotation.y = 1.0 * b.sweepT; }
  if (b.climbT > 0) b.climbT -= dt;

  FWD.set(0, 0, -1).applyQuaternion(b.quat);
  TO_P.copy(player.pos).sub(b.pos);
  const dist = TO_P.length();

  const skill = fighterSkill(b.launchWave ?? ctx.wave);
  // --- pick a mode: engage, or break when threatened ---
  // Being on the bandit's six is the classic chase; being lined up in the
  // player's own gun cone counts too, so the pack reacts instead of boring in.
  const onSix = FWD.dot(TO_P) < -0.35 * dist; // player behind and close
  PFWD.set(0, 0, -1).applyQuaternion(player.quat);
  const nosed =
    player.speed > 45 &&
    dist < NOSE_BREAK_DIST &&
    PFWD.dot(TO_P) < -NOSE_CONE_COS * dist;
  if (b.evadeT > 0) {
    b.evadeT -= dt;
    if (b.evadeT <= 0) b.evadeCd = skill.cooldown + hash(b.id + player.time * 1.3) * 5;
  } else if (b.evadeCd > 0) {
    b.evadeCd -= dt;
  } else if ((onSix && dist < EVADE_DIST) || nosed) {
    b.reactionT = (b.reactionT ?? 0) + dt;
    if (b.reactionT >= skill.reaction) {
      b.evadeT = skill.duration + hash(b.id + player.time) * 1.2 * skill.jink;
      b.reactionT = 0;
    }
  } else {
    b.reactionT = 0;
  }
  if (b.evadeT > 0 || b.evadeCd > 0) b.reactionT = 0;

  // --- afterburner: lit for the merge, the evade and the chase; it cycles
  // so the plume blinks like a pilot riding the burner in bursts ---
  const wantsAb = b.evadeT > 0 || (dist > 1200 && b.climbT <= 0) || b.climbT > 0;
  if (b.abOn) {
    b.abT -= dt;
    if (b.abT <= 0 || !wantsAb) {
      b.abOn = false;
      b.abCool = 3 + hash(b.id + player.time * 0.7) * 3;
    }
  } else if (b.abCool > 0) {
    b.abCool -= dt;
  } else if (wantsAb) {
    b.abOn = true;
    b.abT = BANDIT_AB_TIME;
  }
  animateExhaust(b.mesh, b.abOn ? 1 : 0, player.time);

  if (b.evadeT > 0) {
    // jink: weave around the current heading with a climb bias
    TMP.set(1, 0, 0).applyQuaternion(b.quat); // right wing
    DESIRED.copy(FWD)
      .addScaledVector(TMP, Math.sin(player.time * 1.9 + b.phase) * 0.7 * skill.jink)
      .addScaledVector(WORLD_UP, (Math.cos(player.time * 1.4 + b.phase) * 0.35 + 0.2) * skill.jink);
    DESIRED.normalize();
    b.speed += (BANDIT_SPEED.evade - b.speed) * (1 - Math.exp(-dt / 1.2));
  } else {
    // lead pursuit: aim ahead of the player so guns line up naturally
    AIM.copy(player.pos).addScaledVector(player.vel, Math.min(dist / MUZZLE_V, 1.2) * 0.8);
    DESIRED.copy(AIM).sub(b.pos).normalize();
    b.speed += ((dist > 3000 ? BANDIT_SPEED.pursue : BANDIT_SPEED.close) - b.speed) *
      (1 - Math.exp(-dt / 1.5));
  }
  // The burner sets the real ceiling: dry flight tops at the player's own
  // military thrust numbers, the burner stretches to the AB envelope.
  const vmax = b.abOn ? BANDIT_MAX_AB : BANDIT_MAX_DRY;
  if (b.speed > vmax) b.speed = vmax;
  // straight off the bow: climb to a fighting altitude before it hunts
  if (b.climbT > 0) {
    DESIRED.y += 0.55;
    DESIRED.normalize();
  }

  // --- merge discipline: slide past the player, never through them ---
  // The merge turn starts early (any closing geometry) and a hard push-out
  // takes over inside PANIC_DIST, so bandits shoulder away instead of flying
  // straight through the airframe the player is sitting in.
  if (dist > 1 && dist < MERGE_DIST) {
    const closing = FWD.dot(TO_P) / dist; // +1 = nose-on the player
    if (closing > 0.25) {
      const side = hash(b.id * 9.1 + 0.37) > 0.5 ? 1 : -1;
      LAT.set(TO_P.z, 0, -TO_P.x).normalize();
      DESIRED.addScaledVector(LAT, side * (1 - dist / MERGE_DIST) * 1.25).normalize();
    }
    if (dist < PANIC_DIST) {
      // too close to be clever: get out of the player's skin
      TMP.copy(b.pos).sub(player.pos).setY(0).normalize();
      DESIRED.addScaledVector(TMP, (1 - dist / PANIC_DIST) * 1.4).normalize();
      DESIRED.y += 0.25;
      DESIRED.normalize();
    }
  }

  // --- shoulder away from wingmen so the pack doesn't stack into one jet ---
  for (const o of ctx.bandits) {
    if (o === b) continue;
    SEP.copy(b.pos).sub(o.pos);
    const d2 = SEP.lengthSq();
    if (d2 > 1e-6 && d2 < KEEP_APART * KEEP_APART) {
      const d = Math.sqrt(d2);
      DESIRED.addScaledVector(SEP.divideScalar(d), (1 - d / KEEP_APART) * 0.9);
    }
  }
  DESIRED.normalize();

  // --- safety: never hunt the terrain, never leave the box ---
  AHEAD.copy(b.pos).addScaledVector(DESIRED, 1200);
  const floor = groundAt(AHEAD.x, AHEAD.z).y + 260;
  const needClimb = (floor - b.pos.y) / 1200;
  if (needClimb > DESIRED.y) {
    DESIRED.y = needClimb;
    DESIRED.normalize();
  }
  if (b.pos.y < floor) DESIRED.y = Math.max(DESIRED.y, 0.5);
  if (b.pos.y > CEILING) DESIRED.y = Math.min(DESIRED.y, -0.1);
  // Arena check is relative to the player, so the fight follows the player
  // anywhere in the 60 km chain instead of being pinned over the origin.
  if (Math.hypot(b.pos.x - player.pos.x, b.pos.z - player.pos.z) > ARENA) {
    DESIRED.addScaledVector(TMP.copy(player.pos).sub(b.pos).setY(0).normalize(), 0.8).normalize();
  }

  // --- steer: rotate forward toward desired at a capped rate, bank into it
  const angle = FWD.angleTo(DESIRED);
  let turnSign = 0;
  if (angle > 1e-4) {
    AXIS.crossVectors(FWD, DESIRED);
    if (AXIS.lengthSq() < 1e-8) AXIS.copy(WORLD_UP);
    else AXIS.normalize();
    turnSign = Math.sign(AXIS.y);
    const turnCap = Math.max(
      sustainedTurnRate(AIRCRAFT.tomcat, Math.max(b.speed, BANDIT_SPEED.min), b.pos.y),
      BANDIT_TURN_FLOOR,
    );
    const evadeScale = b.evadeT > 0 && dist > MERGE_DIST && needClimb <= 0 ? skill.turn : 1;
    FWD.applyAxisAngle(AXIS, Math.min(angle, turnCap * evadeScale * dt));
  }
  const bankTarget = angle > 0.05 ? turnSign * Math.min(angle * 1.6, 1.15) : 0;
  b.bank += (bankTarget - b.bank) * (1 - Math.exp(-dt * 2.5));
  ctx.aimQuat(b, FWD, b.bank);

  // --- integrate + publish to the mesh ---
  b.pos.addScaledVector(FWD, Math.max(b.speed, BANDIT_SPEED.min) * dt);
  b.mesh.group.position.copy(b.pos);
  b.mesh.group.quaternion.copy(b.quat);

  ctx.stepDamageSmoke(b, dt);
  // --- terrain: a bandit that hits the ground or the sea breaks up ---
  const g = groundAt(b.pos.x, b.pos.z);
  if (b.pos.y <= g.y + 2) {
    ctx.crashBandit(b, player, g.kind === "water" ? "water" : "ground");
    return false;
  }
  return true;
}

export function banditGuns(ctx: Dogfight, b: Bandit, dt: number, player: AircraftState): void {
  if (ctx.operation && (ctx.mirror || b.role !== "escort" || b.retreat || (b.ammo ?? 0) <= 0)) return;
  if (b.catT >= 0) return; // still on the cat: no shooting from the deck
  b.fireCd -= dt;
  if (b.fireCd > 0) return;
  FWD.set(0, 0, -1).applyQuaternion(b.quat);
  TO_P.copy(player.pos).sub(b.pos);
  const dist = TO_P.length();
  const offBore = FWD.angleTo(TO_P);
  if (dist > ENGAGE_DIST || offBore > AIM_CONE || dist < 60) return;
  if (terrainBlocks(b.pos, player.pos)) return; // no shooting through hills

  if (b.burst <= 0) {
    b.burst = 5 + Math.floor(hash(b.id * 17.7 + player.time) * 3);
    b.fireCd = 1.9 + hash(b.id * 3.1 + player.time * 0.7) * 1.6;
    return;
  }
  b.burst--;
  if (ctx.operation) b.ammo = Math.max(0, (b.ammo ?? 0) - 1);
  b.fireCd = 0.09; // ~11 rps inside the burst
  // lead the player, then scatter
  AIM.copy(player.pos).addScaledVector(player.vel, dist / MUZZLE_V);
  TMP.copy(AIM).sub(b.pos).normalize();
  ctx.scatter(TMP, BANDIT_SPREAD, player.time * 13.7 + b.id * 3.3);
  ctx.spawnTracer(b.pos, TMP, true, null);
  ctx.threatT = THREAT_HOLD;
}

export function killBandit(ctx: Dogfight, b: Bandit, player: AircraftState): void {
  ctx.removeBandit(b);
  ctx.kills++;
  ctx.confirmDamage("AIRCRAFT DESTROYED", "destroyed");
  // it broke up in the air: fireball, debris and a bright core
  ctx.blasts.spawn(b.pos.clone(), "air", 1);
  ctx.flash(b.pos);
  const left = ctx.bandits.length;
  ctx.banner(
    player,
    left > 0 ? `BANDIT DOWN — ${left} LEFT` : "BANDIT DOWN — RANGE CLEAR",
  );
}


/** A bandit that flew into the ground, the sea or a hill. */
export function crashBandit(ctx: Dogfight, b: Bandit, player: AircraftState, kind: BlastKind): void {
  const at = b.pos.clone();
  ctx.removeBandit(b);
  ctx.kills++;
  ctx.lastImpact.set(at.x, at.y, at.z);
  ctx.lastImpactKind = kind;
  ctx.blasts.spawn(at, kind === "water" ? "water" : "ground", 1.1);
  ctx.banner(
    player,
    kind === "water" ? "BANDIT DOWN — FLEW INTO THE SEA" : "BANDIT DOWN — FLEW INTO THE TERRAIN",
  );
}


/** Pull a bandit out of the fight and release its geometry. */
export function removeBandit(ctx: Dogfight, b: Bandit): void {
  const idx = ctx.bandits.indexOf(b);
  if (idx >= 0) ctx.bandits.splice(idx, 1);
  // pulling the wreck from the scene and releasing its geometry keeps a long
  // fight from accumulating hidden jets
  b.mesh.group.removeFromParent();
  disposeSubtree(b.mesh.group);
}


/**
 * Airframes are solid. A bandit inside the player's footprint takes both of
 * them out of the fight; wingmen that touch each other break up together; and
 * a jet that flies into the enemy carrier's deck does the ship real damage
 * before it goes in.
 */
export function stepCollisions(ctx: Dogfight, player: AircraftState): void {
  for (let i = ctx.bandits.length - 1; i >= 0; i--) {
    const b = ctx.bandits[i];
    if (b.catT >= 0) continue; // rolling on the cat is not a mid-air
    if (b.pos.distanceTo(player.pos) > PLAYER_HIT_R) continue;
    const at = b.pos.clone();
    if (ctx.mirror) ctx.takenDown.set(b.id, performance.now());
    ctx.removeBandit(b);
    ctx.kills++;
    ctx.blasts.spawn(at, "air", 1.3);
    ctx.damagePlayer(player, MID_AIR_DAMAGE);
    if (!player.result) ctx.banner(player, "MID-AIR COLLISION — CHECK YOUR HULL");
  }
  for (let i = ctx.bandits.length - 1; i > 0; i--) {
    const a = ctx.bandits[i];
    for (let j = i - 1; j >= 0; j--) {
      const o = ctx.bandits[j];
      if (a.pos.distanceTo(o.pos) > BANDIT_HIT_R) continue;
      ctx.blasts.spawn(a.pos.clone().lerp(o.pos, 0.5), "air", 1.1);
      ctx.kills++;
      ctx.removeBandit(a);
      ctx.removeBandit(o);
      ctx.banner(player, "BANDITS COLLIDED");
      break;
    }
  }
  // the hostile boat is not in groundAt(), so its deck is checked by hand
  const cv = ctx.cv;
  if (!cv || cv.status === "sinking" || cv.status === "sunk") return;
  if (!isOnDeck(cv.def, player.pos.x, player.pos.z)) return;
  if (player.pos.y > cv.def.deckY + 2.5) return; // a fly-by, not a hit
  ctx.damageCarrier(player.pos.clone(), player, RAM_CARRIER_HP);
  player.result = {
    kind: "crash",
    title: `COLLIDED WITH ${cv.def.name}`,
    detail: "You flew into the opposing carrier. The hull is holed; so is yours.",
  };
}


/**
 * Wave bookkeeping. A wave is alive while it still has aircraft queued on the
 * deck or flying; once it is gone the boat needs a few seconds to spot the
 * next one, and a sunk boat launches nothing at all.
 */
export function stepWaves(ctx: Dogfight, dt: number, player: AircraftState): void {
  if (ctx.bandits.length > 0 || ctx.launchQueued > 0) {
    ctx.waveClock += dt;
    return;
  }
  if (ctx.fightOver) return;
  if (ctx.cv && (ctx.cv.status === "sinking" || ctx.cv.status === "sunk")) {
    ctx.fightOver = true;
    ctx.banner(player, `OPFOR CARRIER OUT OF ACTION — NO MORE LAUNCHES`);
    return;
  }
  if (ctx.waveTimer <= 0) {
    ctx.waveTimer = WAVE_RESPAWN;
    if (ctx.wave > 0) ctx.banner(player, `WAVE ${ctx.wave} CLEARED — ${ctx.kills} TAGGED`);
    return;
  }
  ctx.waveTimer -= dt;
  if (ctx.waveTimer <= 0) {
    ctx.wave++;
    const count = Math.min(1 + ctx.wave, WAVE_MAX);
    ctx.launchQueued = count;
    ctx.launchTimer = CV_FIRST_LAUNCH;
    ctx.waveClock = 0;
    ctx.banner(player, `WAVE ${ctx.wave} — ${count} BANDIT${count > 1 ? "S" : ""} SPOTTED ON ${CV_NAME}`);
  }
}
