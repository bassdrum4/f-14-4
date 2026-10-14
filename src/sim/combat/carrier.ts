// The hostile carrier (the bandits' home deck) and its catapult launches.

import * as THREE from "three";
import { buildAircraft, buildTomcat } from "../../render/geometry";
import type { EnemyRole } from "../operations";
import { buildCarrier } from "../../render/scene";
import { CAT_ACCEL, CAT_TIME, CAT_V_END } from "../flight";
import type { AircraftState } from "../flight";
import { CAT_START_ALONG, carriers, deckAxes, groundAt, makeCarrier } from "../world";
import type { CarrierDef } from "../world";
import type { Bandit, EnemyCarrier, EnemyCarrierState } from "./types";
import {
  BANDIT_HP,
  BANDIT_MISSILE_ARM_DELAY,
  BANDIT_MISSILE_FIRST_WAVE,
  BANDIT_MISSILE_LOAD,
  CV_CAT_LATERAL,
  CV_CLIMB_TIME,
  CV_CLOSE_SPEED,
  CV_FRIENDLY_CLEAR,
  CV_HP,
  CV_LAUNCH_GAP,
  CV_LAUNCH_HOLD,
  CV_LAUNCH_RANGE,
  CV_NAME,
  CV_STANDOFF,
  CV_START_DIST,
  CV_TURN_DEG,
} from "./tuning";
import { HQ, PITCH_Q, WORLD_UP, disposeSubtree, hash } from "./scratch";

import type { Dogfight } from "./core";


/** The hostile boat's hull, for the targeting pick (null once it is gone). */
export function enemyDeck(ctx: Dogfight): CarrierDef | null {
  return ctx.cv ? ctx.cv.def : null;
}


/** Drop the hostile boat (mirroring hands it over to the host). */
export function releaseCarrier(ctx: Dogfight): void {
  if (!ctx.cv) return;
  ctx.cv.mesh.removeFromParent();
  disposeSubtree(ctx.cv.mesh);
  ctx.cv = null;
  ctx.fightOver = false;
}


/** Wire a mirrored boat into place, or move the one we already have. */
export function applyRemoteCarrier(ctx: Dogfight, c: EnemyCarrierState | null): void {
  if (!c) {
    ctx.releaseCarrier();
    return;
  }
  if (!ctx.cv) {
    const def = makeCarrier(CV_NAME, c.x, c.z, c.headingDeg);
    const mesh = buildCarrier(def);
    ctx.root.add(mesh);
    ctx.cv = { def, mesh, hp: c.hp, status: c.status, speed: 0, sinkT: 0 };
  }
  const cv = ctx.cv;
  cv.def.x = c.x;
  cv.def.z = c.z;
  cv.def.headingDeg = c.headingDeg;
  cv.hp = c.hp;
  if (cv.status !== c.status) {
    // The host's boat is going down: run our own sinking from here, so the
    // waterline animation is ours rather than a number in a packet.
    if (c.status === "sinking") cv.sinkT = 0;
    cv.status = c.status;
  }
  if (c.status !== "sinking" && c.status !== "sunk") {
    cv.mesh.position.set(c.x, 0, c.z);
    cv.mesh.rotation.y = ((90 - c.headingDeg) * Math.PI) / 180;
  }
}


// -------------------------------------------------------------------------
// Hostile carrier

/**
 * Put the hostile boat on the horizon, ahead of the player's nose when there
 * is open water there, and let it steam in from there.
 */
export function spawnEnemyCarrier(ctx: Dogfight, player: AircraftState): void {
  const hdg = ctx.authored && ctx.operationOrigin ? ctx.operationOrigin.heading * Math.PI / 180 : ctx.playerHeading(player);
  const originX = ctx.authored ? ctx.operationOrigin?.x ?? player.pos.x : player.pos.x;
  const originZ = ctx.authored ? ctx.operationOrigin?.z ?? player.pos.z : player.pos.z;
  const base = hdg + (hash(ctx.wave * 23.7 + 4.1 + (ctx.authored ? ctx.operationSeed : 0)) * 2 - 1) * 0.8;
  const startDistance = ctx.authored ? 18000 : CV_START_DIST;
  // Fan out around the first bearing until the whole approach is water —
  // a carrier must not spawn on a hillside, and must not have to cross one.
  // The fan widens to the full circle, so an island dead ahead cannot leave
  // the boat beached.
  let ang = base;
  for (let i = 0; i < 17; i++) {
    if (i > 0) ang = base + (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * 0.42;
    const x = originX + Math.sin(ang) * startDistance;
    const z = originZ - Math.cos(ang) * startDistance;
    const mx = (x + player.pos.x) / 2;
    const mz = (z + player.pos.z) / 2;
    // the chain is 60 km across: keep the fan inside it, and outside that
    // the heightfield is open ocean anyway
    if (Math.abs(x) > 40000 || Math.abs(z) > 40000) continue;
    if (groundAt(x, z).kind !== "water" || groundAt(mx, mz).kind !== "water") continue;
    break;
  }
  const x = originX + Math.sin(ang) * startDistance;
  const z = originZ - Math.cos(ang) * startDistance;
  // The bow points back at the player: it is coming for us.
  const headingDeg = (((ang + Math.PI) * 180) / Math.PI + 360) % 360;
  const def = makeCarrier(CV_NAME, x, z, headingDeg);
  const mesh = buildCarrier(def);
  ctx.root.add(mesh);
  ctx.cv = { def, mesh, hp: CV_HP, status: "closing", speed: 0, sinkT: 0 };
}


/** Steam the hostile boat toward the player and hold it at stand-off range. */
export function stepCarrier(ctx: Dogfight, dt: number, player: AircraftState): void {
  const cv = ctx.cv;
  if (!cv) return;
  if (cv.status === "sinking" || cv.status === "sunk") {
    cv.sinkT += dt;
    cv.mesh.position.y = -Math.min(cv.sinkT * 0.55, 17);
    cv.mesh.rotation.z = Math.min(cv.sinkT * 0.008, 0.22);
    if (cv.status === "sinking" && cv.sinkT > 60) cv.status = "sunk";
    return;
  }
  // A wingman's boat is steered by the host's packets, not by our own AI.
  if (ctx.mirror) return;
  const def = cv.def;
  const toX = player.pos.x - def.x;
  const toZ = player.pos.z - def.z;
  const dist = Math.hypot(toX, toZ);

  // --- rudder: bring the bow onto the player, slowly ---
  const { fwd: currentBow } = deckAxes(def.headingDeg);
  const shoalAhead = groundAt(def.x + currentBow[0] * 900, def.z + currentBow[1] * 900).kind !== "water";
  const wantHdg = shoalAhead ? (def.headingDeg + 90) % 360 : ((Math.atan2(toX, -toZ) * 180) / Math.PI + 360) % 360;
  const delta = ((((wantHdg - def.headingDeg) % 360) + 540) % 360) - 180;
  const maxTurn = CV_TURN_DEG * dt;
  def.headingDeg =
    (def.headingDeg + THREE.MathUtils.clamp(delta, -maxTurn, maxTurn) + 360) % 360;

  // --- throttle: close the range, then hold station short of it ---
  let target = 0;
  if (dist > CV_STANDOFF + 600) target = CV_CLOSE_SPEED;
  else if (dist > CV_STANDOFF) target = (CV_CLOSE_SPEED * (dist - CV_STANDOFF)) / 600;
  // Never run down a friendly anchorage: the fleet is not a target.
  for (const c of carriers()) {
    if (Math.hypot(c.x - def.x, c.z - def.z) < CV_FRIENDLY_CLEAR) target = 0;
  }
  if (shoalAhead) target = 0;
  cv.speed += (target - cv.speed) * (1 - Math.exp(-dt / 4));

  // --- advance, but only over open water ---
  if (cv.speed > 0.1) {
    const { fwd } = deckAxes(def.headingDeg);
    const ahead = 900;
    if (groundAt(def.x + fwd[0] * ahead, def.z + fwd[1] * ahead).kind === "water") {
      def.x += fwd[0] * cv.speed * dt;
      def.z += fwd[1] * cv.speed * dt;
    }
  }
  cv.status = cv.speed > 0.5 ? "closing" : "on station";
  cv.mesh.position.set(def.x, 0, def.z);
  cv.mesh.rotation.y = ((90 - def.headingDeg) * Math.PI) / 180;
}


/** Launch aircraft while a wave is queued and the boat is in range. */
export function stepLaunches(ctx: Dogfight, dt: number, player: AircraftState): void {
  const cv = ctx.cv;
  if (!cv || ctx.launchQueued <= 0) return;
  if (cv.status === "sinking" || cv.status === "sunk") return;
  const dist = Math.hypot(player.pos.x - cv.def.x, player.pos.z - cv.def.z);
  // Hold the deck until the boat is in range, unless the player is running
  // away hard — then launch anyway and let the bandits catch up.
  if (dist > CV_LAUNCH_RANGE && ctx.waveClock < CV_LAUNCH_HOLD) return;
  ctx.launchTimer -= dt;
  if (ctx.launchTimer > 0) return;
  ctx.launchTimer = CV_LAUNCH_GAP;
  ctx.launchQueued--;
  ctx.launchOne(player, cv);
}


/** Roll one bandit: down a catapult, off the bow, then it is the AI's job. */
export function launchOne(ctx: Dogfight, player: AircraftState, cv: EnemyCarrier, role: EnemyRole = "fighter"): void {
  const def = cv.def;
  ctx.launchSide = -ctx.launchSide;
  const { fwd, right } = deckAxes(def.headingDeg);
  const across = ctx.launchSide * CV_CAT_LATERAL;
  const start = new THREE.Vector3(
    def.x + fwd[0] * CAT_START_ALONG + right[0] * across,
    def.deckY + 2.4,
    def.z + fwd[1] * CAT_START_ALONG + right[1] * across,
  );
  const id = ctx.nextId++;
  const mesh = role === "bomber" ? buildAircraft("intruder", "bandit") : buildTomcat("bandit");
  mesh.gear.visible = true; // gear down on the cat, up once it is flying
  mesh.afterburner.visible = true; // deck launches are full-burner shots
  mesh.wings[0].rotation.y = 0; // spread for the deck
  mesh.wings[1].rotation.y = 0;
  mesh.group.position.copy(start);
  ctx.root.add(mesh.group);
  const b: Bandit = {
    id,
    role, ammo: ctx.operation ? 70 : undefined, bombs: role === "bomber" ? 1 : 0, retreat: false, sortieTime: 0,
    hp: BANDIT_HP,
    pos: start.clone(),
    quat: new THREE.Quaternion(),
    bank: 0,
    speed: 0,
    fireCd: 2 + hash(id) * 2,
    burst: 0,
    evadeT: 0,
    evadeCd: 0,
    launchWave: ctx.wave,
    reactionT: 0,
    smokeT: 0,
    missiles: (role === "fighter" || role === "escort") && ctx.wave >= BANDIT_MISSILE_FIRST_WAVE ? BANDIT_MISSILE_LOAD : 0,
    missileCd: BANDIT_MISSILE_ARM_DELAY + hash(id * 7.3) * 6,
    phase: hash(id * 11.3) * Math.PI * 2,
    mesh,
    catT: 0,
    catStart: start,
    catAcross: across,
    catDir: new THREE.Vector3(fwd[0], 0, fwd[1]),
    climbT: 0,
    sweepT: 0,
    abOn: false,
    abT: 0,
    abCool: 2,
    // Ours: this one is steered here, not by a packet.
    remote: false,
    netPos: start.clone(),
    netQuat: new THREE.Quaternion(),
    netVel: new THREE.Vector3(),
  };
  ctx.setCatPose(b, def.deckY);
  ctx.bandits.push(b);
  if (ctx.bandits.length === 1) ctx.banner(player, `CAT LAUNCH — ${ctx.operation ? role.toUpperCase() : "BANDITS"} OFF ${CV_NAME}`);
}


/** Deck pose: on the cat at `t` seconds after release (heading + 6 deg nose up). */
export function setCatPose(ctx: Dogfight, b: Bandit, deckY: number): void {
  const t = b.catT;
  const dist = Math.min(0.5 * CAT_ACCEL * t * t, 0.5 * CAT_ACCEL * CAT_TIME * CAT_TIME);
  if (ctx.cv && b.catAcross !== undefined) {
    const def = ctx.cv.def, { fwd, right } = deckAxes(def.headingDeg);
    b.catStart.set(def.x + fwd[0] * CAT_START_ALONG + right[0] * b.catAcross, deckY + 2.4, def.z + fwd[1] * CAT_START_ALONG + right[1] * b.catAcross);
    b.catDir.set(fwd[0], 0, fwd[1]);
  }
  b.pos.copy(b.catStart).addScaledVector(b.catDir, dist);
  b.pos.y = deckY + 2.4;
  const headingDeg = ctx.cv ? ctx.cv.def.headingDeg : 0;
  HQ.setFromAxisAngle(WORLD_UP, (-headingDeg * Math.PI) / 180);
  b.quat.copy(HQ).multiply(PITCH_Q);
  b.speed = CAT_ACCEL * t;
  b.mesh.group.position.copy(b.pos);
  b.mesh.group.quaternion.copy(b.quat);
}


/** One bandit's catapult stroke; hand off to the AI at end of stroke. */
export function stepLaunch(ctx: Dogfight, b: Bandit, dt: number): void {
  b.catT += dt;
  const deckY = ctx.cv ? ctx.cv.def.deckY : 19;
  if (CAT_ACCEL * b.catT < CAT_V_END) {
    ctx.setCatPose(b, deckY);
    return;
  }
  // off the bow: pin the pose at end of stroke, then go flying
  b.catT = CAT_TIME;
  ctx.setCatPose(b, deckY);
  b.catT = -1;
  b.speed = CAT_V_END + (ctx.cv?.speed ?? 0);
  b.climbT = CV_CLIMB_TIME;
  b.mesh.gear.visible = false;
  b.mesh.afterburner.visible = false;
  // the deck shot is full burner: light it as it comes off the bow
  b.abOn = true;
  b.abT = 4;
  b.abCool = 0;
}
