// Authored-operation glue: phase transitions, the launch queue, enemy bombs and
// the fleet defenders those operations shoot at.

import { specFor } from "../aircraft";
import { BOMB_ARM_TIME as BOMB_ARM, advanceBomb } from "../bombTrajectory";
import * as THREE from "three";
import { convoyRoute, isFortressPrimary, operationPhaseDuration } from "../operations";
import type { OperationHud } from "../operations";
import { validEnemyFire } from "../combatSnapshot";
import type { EnemyFire } from "../combatSnapshot";
import type { AircraftState } from "../flight";
import { carriers, groundAt, isOnDeck } from "../world";
import type { Bandit, EnemyBomb, FleetDefender } from "./types";
import { MUZZLE_V, THREAT_HOLD } from "./tuning";
import { AHEAD, AXIS, DESIRED, FWD, NOSE_Z, disposeSubtree, terrainBlocks } from "./scratch";

import type { Dogfight } from "./core";

export function operationHud(ctx: Dogfight, player: AircraftState): OperationHud | undefined {
  const state = ctx.operation?.state; if (!state) return undefined;
  const cargo = ctx.strikeTargets.filter(t => t.role === "cargo" && !t.dead && !t.disabled && !t.arrived);
  const bastion = ctx.strikeTargets.filter(t => isFortressPrimary(t.role) && !t.dead && !t.disabled);
  const threat = ctx.bandits.filter(b => !b.retreat && (b.role === "scout" || b.role === "bomber")).sort((a, b) => a.pos.distanceToSquared(player.pos) - b.pos.distanceToSquared(player.pos))[0];
  const isConvoyPhase = state.kind === "convoy" || (state.kind === "campaign" && state.phase === "convoy");
  const isBastionPhase = state.kind === "bastion" || (state.kind === "campaign" && state.phase === "bastion");
  const target = isConvoyPhase
    ? cargo.sort((a, b) => a.pos.distanceToSquared(player.pos) - b.pos.distanceToSquared(player.pos))[0]
    : isBastionPhase
    ? bastion.sort((a, b) => a.pos.distanceToSquared(player.pos) - b.pos.distanceToSquared(player.pos))[0]
    : threat;
  const cvPoint = (state.kind === "fleet" || (state.kind === "campaign" && !isConvoyPhase && !isBastionPhase)) && !target && ctx.cv ? new THREE.Vector3(ctx.cv.def.x, ctx.cv.def.deckY + 30, ctx.cv.def.z) : undefined;
  const pos = target?.pos ?? cvPoint; const vel = new THREE.Vector3();
  if (target && "quat" in target) vel.set(0, 0, -target.speed).applyQuaternion(target.quat);
  else if (target) vel.set(Math.sin(target.headingDeg * Math.PI / 180) * target.speed, 0, -Math.cos(target.headingDeg * Math.PI / 180) * target.speed);
  let eta: number | null = null;
  if (isConvoyPhase && cargo.length) eta = Math.min(...cargo.map(t => ((t.route?.length ?? 0) - (t.progress ?? 0)) / Math.max(t.speed, .1)));
  else if (state.phase === "forming") eta = Math.max(0, operationPhaseDuration(state) - state.phaseTime);
  else if (state.phase === "counterattack") eta = Math.max(0, operationPhaseDuration(state) - state.phaseTime);
  else if (ctx.enemyBombs.length) { const c = carriers()[state.fleetCarrier] ?? carriers()[0]; eta = Math.min(...ctx.enemyBombs.map(b => b.pos.distanceTo(new THREE.Vector3(c.x, c.deckY, c.z)) / Math.max(b.vel.length(), 1))); }
  else if (threat) { const c = carriers()[state.fleetCarrier] ?? carriers()[0]; eta = Math.max(0, (Math.hypot(threat.pos.x - c.x, threat.pos.z - c.z) - (threat.role === "scout" ? 3000 : 1000)) / Math.max(threat.speed, 120)); }
  const radarOnline = ctx.strikeTargets.some(t => t.role === "radar" && !t.dead && !t.arrived);
  const sams = ctx.strikeTargets.filter(t => (t.role === "sam" || t.role === "aaa") && !t.dead && !t.arrived);
  let terrainMasked = false;
  let samLockProgress = 0;
  for (const s of sams) {
    const dist = s.pos.distanceTo(player.pos);
    if (dist < 6200 && !player.onGround) {
      if (terrainBlocks(s.pos.clone().add(new THREE.Vector3(0, 14, 0)), player.pos)) terrainMasked = true;
      if ((s.tracking ?? 0) > 0) samLockProgress = Math.max(samLockProgress, Math.min(1, (s.tracking ?? 0) / (radarOnline ? 2.4 : 4.8)));
    }
  }
  return { state: { ...state }, eta, warning: ctx.defenseWarning || ctx.strikeTargets.some(t => (t.tracking ?? 0) > 0 && t.pos.distanceTo(player.pos) < 5500),
    terrainMasked, radarOnline, samLockProgress, ...ctx.missionStats,
    target: pos ? { x: pos.x, y: pos.y + (target && "quat" in target ? 0 : 10), z: pos.z, label: target?.role?.toUpperCase() ?? (cvPoint ? "FLIGHT DECK" : "OBJECTIVE"), km: pos.distanceTo(player.pos) / 1000,
      altitudeFt: pos.y * 3.28084, closureKt: player.vel.clone().sub(vel).dot(pos.clone().sub(player.pos).normalize()) * 1.94384,
      bearing: (Math.atan2(pos.x - player.pos.x, -(pos.z - player.pos.z)) * 180 / Math.PI + 360) % 360 } : null };
}

export function spawnBastion(ctx: Dogfight, player: AircraftState): void {
  const ox = ctx.operationOrigin?.x ?? player.pos.x;
  const oz = ctx.operationOrigin?.z ?? player.pos.z;
  let site: THREE.Vector3 | null = null;
  let bestD = Infinity;
  for (let i = 0; i < 96; i++) {
    const ang = ((ctx.operationSeed * 37 + i * 19) % 360) * Math.PI / 180;
    const dist = 4500 + ((ctx.operationSeed * 13 + i * 43) % 9000);
    const x = ox + Math.sin(ang) * dist;
    const z = oz - Math.cos(ang) * dist;
    if (Math.abs(x) > 25000 || Math.abs(z) > 25000) continue;
    const g = groundAt(x, z);
    if (g.kind !== "terrain" || g.y < 22 || g.y > 460) continue;
    const d = Math.hypot(x - ox, z - oz);
    if (d < bestD) { bestD = d; site = new THREE.Vector3(x, g.y, z); }
  }
  if (!site) {
    // Fallback to hub island ridge near airfield
    const gx = -1800 + 1600, gz = 2400 - 1100;
    site = new THREE.Vector3(gx, Math.max(30, groundAt(gx, gz).y), gz);
  }
  const layout: Array<{ kind: "bunker" | "hangar" | "tank" | "radar" | "sam" | "warehouse"; role: "bunker" | "hangar" | "fuel" | "radar" | "sam" | "aaa"; dx: number; dz: number; ammo: number }> = [
    { kind: "bunker", role: "bunker", dx: 0, dz: 0, ammo: 0 },
    { kind: "hangar", role: "hangar", dx: -95, dz: 40, ammo: 0 },
    { kind: "tank", role: "fuel", dx: 85, dz: -35, ammo: 0 },
    { kind: "radar", role: "radar", dx: -30, dz: -110, ammo: 0 },
    { kind: "sam", role: "sam", dx: 135, dz: 95, ammo: 6 },
    { kind: "sam", role: "sam", dx: -145, dz: -85, ammo: 6 },
    { kind: "warehouse", role: "aaa", dx: 40, dz: 120, ammo: 64 },
  ];
  for (const item of layout) {
    const tx = site.x + item.dx;
    const tz = site.z + item.dz;
    const ty = Math.max(6, groundAt(tx, tz).y);
    ctx.spawnTarget(item.kind, tx, ty, tz, 0, false);
    const t = ctx.strikeTargets[ctx.strikeTargets.length - 1];
    Object.assign(t, { role: item.role, route: null, progress: 0, speed: 0, ammo: item.ammo, tracking: 0, cooldown: 0, disabled: false, arrived: false });
  }
}

export function spawnConvoy(ctx: Dogfight, player: AircraftState): void {
  const route = convoyRoute(ctx.operationOrigin?.x ?? player.pos.x, ctx.operationOrigin?.z ?? player.pos.z, ctx.operationSeed);
  if (!route) { ctx.operation?.finish(false, "No safe convoy route in this world. Choose a new operation."); return; }
  const heading = Math.atan2(route.dx, -route.dz) * 180 / Math.PI;
  for (let i = 0; i < 5; i++) {
    const side = i < 3 ? (i - 1) * 450 : i === 3 ? -850 : 850;
    const start = { ...route, x: route.x - route.dz * side, z: route.z + route.dx * side, length: route.length - (i < 3 ? i * 100 : 0) };
    ctx.spawnTarget(i < 3 ? "ship" : "patrol", start.x, 0, start.z, heading, true);
    const t = ctx.strikeTargets[ctx.strikeTargets.length - 1];
    Object.assign(t, { role: i < 3 ? "cargo" : i === 3 ? "escort" : "radar", route: start, progress: 0, speed: 6,
      ammo: i === 3 ? 48 : 0, tracking: 0, cooldown: 0, disabled: false, arrived: false });
  }
}

export function stepOperation(ctx: Dogfight, dt: number, player: AircraftState): void {
  const op = ctx.operation!; const before = op.state.status;
  const isBastionPhase = op.state.kind === "bastion" || (op.state.kind === "campaign" && op.state.phase === "bastion");
  const stoppedCount = isBastionPhase
    ? ctx.strikeTargets.filter(t => isFortressPrimary(t.role) && (t.dead || t.disabled)).length
    : ctx.strikeTargets.filter(t => t.role === "cargo" && (t.dead || t.disabled)).length;
  const phase = op.advance(dt, { stopped: stoppedCount,
    arrived: ctx.strikeTargets.filter(t => t.role === "cargo" && t.arrived).length,
    scouts: ctx.bandits.filter(b => b.role === "scout").length, attackers: ctx.bandits.filter(b => b.role !== "scout").length + ctx.enemyBombs.length, queued: ctx.roleQueue.length });
  if (phase === "convoy") {
    ctx.clearTargets();
    ctx.scenario = "strike";
    ctx.spawnConvoy(player);
    ctx.banner(player, "STAGE 2: STOP THE CONVOY — INTERDICT ENEMY SUPPLY SHIPS");
  } else if (phase === "scout") {
    ctx.clearTargets();
    ctx.scenario = "dogfight";
    if (!ctx.cv && !ctx.mirror) ctx.spawnEnemyCarrier(player);
    ctx.wave = 1; ctx.roleQueue = ["scout"]; ctx.launchTimer = 1;
    ctx.banner(player, "STAGE 3: FLEET DEFENSE — OPFOR CARRIER STRIKE INBOUND");
  } else if (phase === "strike" || phase === "final") {
    ctx.wave = phase === "strike" ? 2 : 3; ctx.roleQueue = ["bomber", "bomber", "escort"]; ctx.launchTimer = 1;
    ctx.banner(player, phase === "final" ? "FINAL STRIKE — SPLIT BOMBERS INBOUND" : "BOMBER STRIKE — INTERCEPT THE BOMBERS FIRST");
  } else if (phase === "forming") ctx.banner(player, op.state.scoutStopped ? `SCOUT STOPPED — ${operationPhaseDuration(op.state)} SECONDS TO PREPARE` : "SCOUT REPORTED — STRIKE FORMING IN 15 SECONDS");
  else if (phase === "counterattack") ctx.banner(player, `COUNTERATTACK — ${operationPhaseDuration(op.state)}s · BOMB THE DECK OR REARM`);
  if (op.state.suppressed) ctx.roleQueue = [];
  if (before !== op.state.status) {
    ctx.roleQueue = []; ctx.launchQueued = 0;
    for (const b of ctx.bandits) b.retreat = true;
    ctx.banner(player, `${op.state.status === "success" ? "OPERATION COMPLETE" : "OPERATION FAILED"} — ${op.state.reason}`);
  }
}

export function stepOperationLaunches(ctx: Dogfight, dt: number, player: AircraftState): void {
  if (!ctx.cv || ctx.operation?.state.status !== "active" || ctx.operation.state.suppressed || ctx.roleQueue.length === 0) return;
  ctx.launchTimer -= dt; if (ctx.launchTimer > 0) return;
  ctx.launchTimer = 8;
  ctx.launchOne(player, ctx.cv, ctx.roleQueue.shift()!);
}

export function stepRoleAircraft(ctx: Dogfight, b: Bandit, dt: number, player: AircraftState): void {
  if (b.catT >= 0) { ctx.stepLaunch(b, dt); return; }
  b.sortieTime = (b.sortieTime ?? 0) + dt;
  const op = ctx.operation!, fleet = carriers()[op.state.fleetCarrier] ?? carriers()[0];
  if (b.hp <= 9 || (b.role === "escort" && (b.ammo ?? 0) + b.missiles <= 0) || b.sortieTime > 240 || op.state.status !== "active") b.retreat = true;
  const split = op.state.phase === "final" && !b.retreat && b.role === "bomber";
  const approach = new THREE.Vector3(fleet.x, Math.max(1400, groundAt(b.pos.x, b.pos.z).y + 500), fleet.z);
  if (split && Math.hypot(b.pos.x - fleet.x, b.pos.z - fleet.z) > 9000) {
    const sign = b.id % 2 ? 1 : -1; approach.x += sign * 5500; approach.z += sign * 3500;
  }
  if (b.retreat) approach.set(ctx.cv?.def.x ?? fleet.x + 20000, 1800, ctx.cv?.def.z ?? fleet.z + 20000);
  const dist = Math.hypot(b.pos.x - fleet.x, b.pos.z - fleet.z);
  if (!b.retreat && b.role === "scout" && dist < 3000) { op.reportScout(); ctx.removeBandit(b); ctx.banner(player, "SCOUT REPORTED YOUR FLEET POSITION"); return; }
  if (!b.retreat && b.role === "bomber" && dist < 3200 && (b.bombs ?? 0) > 0) {
    b.bombs = 0; b.retreat = true;
    ctx.createEnemyBomb(ctx.nextId++, b.pos.clone().add(new THREE.Vector3(0, -2, 0)), new THREE.Vector3(0, 0, -b.speed).applyQuaternion(b.quat));
    ctx.banner(player, "BOMBER RELEASE — GUIDED BOMB INBOUND");
  }
  if (b.retreat && (b.pos.distanceTo(approach) < 900 || b.sortieTime > 300)) { ctx.removeBandit(b); return; }
  FWD.set(0, 0, -1).applyQuaternion(b.quat); DESIRED.copy(approach).sub(b.pos).normalize();
  AXIS.crossVectors(FWD, DESIRED); const angle = FWD.angleTo(DESIRED);
  if (AXIS.lengthSq() > 1e-8) FWD.applyAxisAngle(AXIS.normalize(), Math.min(angle, .18 * dt));
  if (b.climbT > 0) { b.climbT -= dt; FWD.y = Math.max(FWD.y, .2); FWD.normalize(); }
  // A fixed climb bias is too shallow for the archipelago's steep coasts.
  // Sample the approach corridor and climb at the slope needed to clear it.
  const horizontal = AHEAD.copy(FWD).setY(0).normalize();
  let climbSlope = FWD.y / Math.max(Math.hypot(FWD.x, FWD.z), .01);
  for (const distance of [600, 1200, 2400, 3600]) {
    const floor = groundAt(b.pos.x + horizontal.x * distance, b.pos.z + horizontal.z * distance).y + 400;
    climbSlope = Math.max(climbSlope, (floor - b.pos.y) / distance);
  }
  FWD.copy(horizontal).setY(climbSlope).normalize();
  const bank = THREE.MathUtils.clamp(AXIS.y * angle, -.7, .7); ctx.aimQuat(b, FWD, bank);
  b.speed += ((b.role === "scout" ? 220 : 185) - b.speed) * Math.min(1, dt * .5);
  b.pos.addScaledVector(FWD, b.speed * dt); b.mesh.group.position.copy(b.pos); b.mesh.group.quaternion.copy(b.quat);
  ctx.stepDamageSmoke(b, dt);
  if (b.pos.y <= groundAt(b.pos.x, b.pos.z).y + 2) ctx.crashBandit(b, player, "ground");
}

export function stepEscortDefense(ctx: Dogfight, dt: number, player: AircraftState): void {
  if (!ctx.operation || ctx.operation.state.status !== "active") return;
  ctx.defenseWarning = false;
  const radar = ctx.strikeTargets.some(t => t.role === "radar" && !t.dead && !t.arrived);
  for (const t of ctx.strikeTargets) {
    if ((t.role !== "escort" && t.role !== "aaa" && t.role !== "sam") || t.dead || t.arrived || (t.ammo ?? 0) <= 0 || ctx.mirror) continue;
    t.cooldown = Math.max(0, (t.cooldown ?? 0) - dt);
    const origin = t.pos.clone().add(new THREE.Vector3(0, 12, 0));
    const pilot = ctx.nearestDefender(player, t.pos), distance = t.pos.distanceTo(pilot.pos);
    const maxRange = t.role === "sam" ? (radar ? 5800 : 3400) : 2200;
    if (distance > maxRange || pilot.onGround || pilot.result || terrainBlocks(origin, pilot.pos)) { t.tracking = 0; continue; }
    if (t.cooldown > 0) continue;
    ctx.defenseWarning = true; t.tracking = (t.tracking ?? 0) + dt;
    if (t.role === "sam") {
      if (t.tracking < (radar ? 2.4 : 4.8)) continue;
      t.ammo = Math.max(0, (t.ammo ?? 0) - 1); t.tracking = 0; t.cooldown = 10;
      const aim = pilot.pos.clone().add(new THREE.Vector3(0, 40, 0)).sub(origin).normalize().multiplyScalar(220);
      if (ctx.putHostileRound(origin, aim, ctx.operation.state.elapsed * 13 + t.id)) {
        // The round hunts whoever the battery locked: a wingman if one is closer
        // than we are, otherwise the local jet. An unknown id means "the local
        // pilot", which is exactly what the seeker assumes by default.
        const targetId = ctx.defenders.find(p => p.pos === pilot.pos)?.id ?? ctx.localPilot;
        if (targetId) ctx.missiles[ctx.missiles.length - 1].targetPilot = targetId;
        ctx.enemyFire.push({ combatId: ctx.combatId, seq: ++ctx.fireSerial, weapon: "missile", pos: origin.toArray(), vel: aim.toArray(), ...(targetId ? { target: targetId } : {}) });
        ctx.banner(player, "SAM LAUNCH — BREAK · FLARES OR TERRAIN");
      }
      ctx.threatT = THREAT_HOLD;
      continue;
    }
    if (t.tracking < (radar ? 3 : 6)) continue;
    t.ammo = Math.max(0, (t.ammo ?? 0) - 6); t.tracking = 0; t.cooldown = 5;
    for (let i = 0; i < 6; i++) {
      const aim = pilot.pos.clone().addScaledVector(pilot.vel, distance / MUZZLE_V).sub(origin).normalize();
      ctx.scatter(aim, .05, ctx.operation.state.elapsed * 7 + i); ctx.spawnTracer(origin, aim, true, null);
    }
    ctx.threatT = THREAT_HOLD;
  }
}

export function setDefenders(ctx: Dogfight, self: string, defenders: FleetDefender[]): void { ctx.localPilot = self; ctx.defenders = defenders; }

export function createEnemyBomb(ctx: Dogfight, id: number, pos: THREE.Vector3, vel: THREE.Vector3): EnemyBomb {
  const geo = new THREE.CylinderGeometry(.25, .25, 2.8, 8); geo.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffd250, roughness: .7 }));
  mesh.position.copy(pos); ctx.root.add(mesh);
  const b = { id, pos, vel, age: 0, mesh }; ctx.enemyBombs.push(b); return b;
}

export function retireEnemyBomb(ctx: Dogfight, index: number): void {
  const b = ctx.enemyBombs[index]; b.mesh.removeFromParent(); disposeSubtree(b.mesh); ctx.enemyBombs.splice(index, 1);
}

export function stepEnemyBombs(ctx: Dogfight, dt: number, player: AircraftState): void {
  const s = ctx.operation?.state; if (!s) return;
  const c = carriers()[s.fleetCarrier] ?? carriers()[0], target = new THREE.Vector3(c.x, c.deckY + 2, c.z);
  if (s.fleetHull < 70) { ctx.fleetSmokeTimer -= dt; if (ctx.fleetSmokeTimer <= 0) { ctx.blasts.trail(target, 3, 4); ctx.fleetSmokeTimer = .7; } }
  for (let i = ctx.enemyBombs.length - 1; i >= 0; i--) {
    const b = ctx.enemyBombs[i]; b.age += dt; advanceBomb(b.pos, b.vel, target, dt, b.age);
    b.mesh.position.copy(b.pos); b.mesh.quaternion.setFromUnitVectors(NOSE_Z, b.vel.clone().normalize());
    if (ctx.mirror) continue;
    const hit = b.age >= BOMB_ARM && (b.pos.distanceTo(target) < 15 || (b.pos.y <= c.deckY + 2 && isOnDeck(c, b.pos.x, b.pos.z)));
    if (hit || b.age > 90 || b.pos.y <= groundAt(b.pos.x, b.pos.z).y) {
      if (hit) { ctx.operation!.damageFleet(30); ctx.banner(player, `BOMB IMPACT — FRIENDLY CARRIER ${s.fleetHull}%`); }
      ctx.blasts.spawn(b.pos, hit ? "ground" : "water", 1.8); ctx.retireEnemyBomb(i);
    }
  }
}

export function nearestDefender(ctx: Dogfight, player: AircraftState, from: THREE.Vector3): AircraftState {
  let closest: FleetDefender | null = null, distance = player.result ? Infinity : from.distanceToSquared(player.pos);
  for (const p of ctx.defenders) { const d = p.pos.distanceToSquared(from); if (d < distance) { closest = p; distance = d; } }
  return closest ? { ...player, spec: specFor(closest.aircraft ?? player.spec.id), pos: closest.pos, vel: closest.vel, speed: closest.vel.length(), onGround: closest.onGround ?? false, result: null } : player;
}

export function takeEnemyFire(ctx: Dogfight): EnemyFire[] { const shots = ctx.enemyFire; ctx.enemyFire = []; return shots; }

export function receiveEnemyFire(ctx: Dogfight, shot: EnemyFire): void {
  if (!ctx.mirror || !validEnemyFire(shot) || shot.combatId !== ctx.combatId || shot.seq <= ctx.receivedFire) return;
  ctx.receivedFire = shot.seq;
  const pos = new THREE.Vector3().fromArray(shot.pos), vel = new THREE.Vector3().fromArray(shot.vel);
  if (shot.weapon === "gun") ctx.spawnTracer(pos, vel.normalize(), true, null);
  else if (ctx.putHostileRound(pos, vel, shot.seq)) ctx.missiles[ctx.missiles.length - 1].targetPilot = shot.target;
  ctx.threatT = THREAT_HOLD;
}
