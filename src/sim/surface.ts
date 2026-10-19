// Deterministic surface-vessel integration. Uses the same state, controls and
// fixed timestep as aircraft, without entering the aerodynamic/landing model.
import { Quaternion, Vector3 } from "three";
import type { AircraftState, FlightInput } from "./flight";
import { carriers, EXTENT, groundAt } from "./world";

export const SHIP_MAX_SPEED = 16; // 31 knots; sim-tuned, not a naval simulator
export const SHIP_GUN_BASE = new Vector3(0, 23, -14);
export const SHIP_MISSILE_RANGE = 18_000;
const UP = new Vector3(0, 1, 0);
const Q = new Quaternion();
const P = new Vector3();
const F = new Vector3();

/** Full hull footprint, including the bow/stern, must remain in open water. */
export function navigableWater(x: number, z: number, heading: number): boolean {
  const a = heading * Math.PI / 180, sin = Math.sin(a), cos = Math.cos(a);
  for (const along of [-76, -38, 0, 38, 76]) for (const across of [-13, 0, 13]) {
    const px = x + sin * along + cos * across;
    const pz = z - cos * along + sin * across;
    if (Math.abs(px) > EXTENT - 120 || Math.abs(pz) > EXTENT - 120 || groundAt(px, pz).kind !== "water") return false;
  }
  return true;
}

export function shipSpawn(carrier: number, slot = 0): Vector3 {
  const home = carriers()[carrier] ?? carriers()[0];
  // Search full footprints, not just a water pixel. Also separates co-op ships
  // by a stable room slot without moving aircraft from their normal catapults.
  for (let ring = 0; ring < 30; ring++) for (let i = 0; i < 24; i++) {
    const a = (i / 24 * Math.PI * 2) + slot * 2.399963;
    const r = 650 + ring * 200 + slot * 180;
    const x = home.x + Math.cos(a) * r, z = home.z + Math.sin(a) * r;
    if (navigableWater(x, z, home.headingDeg) && carriers().every(c => Math.hypot(c.x - x, c.z - z) > 400)) return new Vector3(x, 1, z);
  }
  throw new Error("No safe destroyer station near this carrier");
}

export function shipGunQuaternion(st: AircraftState, out: Quaternion): Quaternion {
  return out.setFromAxisAngle(UP, -(st.turretYaw ?? 0)).premultiply(st.quat)
    .multiply(Q.setFromAxisAngle(P.set(1, 0, 0), st.turretPitch ?? 0.2));
}

export function gunMuzzle(st: AircraftState, out: Vector3, direction: Vector3): Vector3 {
  if (!st.spec.surfaceVessel) return out.copy(st.pos).addScaledVector(direction, 8);
  return out.copy(SHIP_GUN_BASE).applyQuaternion(st.quat).add(st.pos).addScaledVector(direction, 6);
}

export function stepSurfaceVessel(st: AircraftState, inp: FlightInput, dt: number): void {
  st.time += dt; st.flightTime += dt;
  if (inp.throttleUp) st.throttle = Math.min(1, st.throttle + dt * .25);
  if (inp.throttleDown) st.throttle = Math.max(0, st.throttle - dt * .25);
  st.brakeOn = inp.brake;
  st.rpm += (st.throttle - st.rpm) * (1 - Math.exp(-dt / 3));
  const engines = st.subsystems ? (st.subsystems.engineL + st.subsystems.engineR) * .5 : 1;
  const target = inp.brake ? 0 : st.throttle * SHIP_MAX_SPEED * engines;
  st.speed += (target - st.speed) * (1 - Math.exp(-dt / (inp.brake ? 3 : 12)));
  // Rudder authority builds with flow; ships can still steer at very low way.
  const yawRate = inp.yaw * .045 * Math.max(.25, Math.min(1, st.speed / 5));
  const heading = (st.headingDeg + yawRate * dt * 180 / Math.PI + 360) % 360;
  const a = heading * Math.PI / 180;
  const x = st.pos.x + Math.sin(a) * st.speed * dt;
  const z = st.pos.z - Math.cos(a) * st.speed * dt;
  const clearFleet = carriers().every(c => Math.hypot(c.x - x, c.z - z) > 260);
  if (navigableWater(x, z, heading) && clearFleet) {
    st.pos.x = x; st.pos.z = z; st.headingDeg = heading;
  } else {
    st.speed = 0; st.throttle = 0;
    st.banner = { text: clearFleet ? "SHOAL WATER — ENGINES STOPPED · TURN TO OPEN WATER" : "FLEET COLLISION WARNING — ENGINES STOPPED", until: st.time + 2 };
  }
  // The guns train independently of the helm. Keep them clear of our deck.
  st.turretYaw = ((st.turretYaw ?? 0) + inp.roll * dt * .65 + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  st.turretPitch = Math.max(.025, Math.min(1.4, (st.turretPitch ?? .2) + inp.pitch * dt * .5));
  st.quat.setFromAxisAngle(UP, -st.headingDeg * Math.PI / 180);
  // Low-amplitude heave: never sink the weapon station below the waterline.
  st.pos.y = 1 + .25 * Math.sin(st.time * .65);
  F.set(0, 0, -1).applyQuaternion(st.quat);
  st.vel.copy(F).multiplyScalar(st.speed); st.omega.set(0, -yawRate, 0);
  st.onGround = false; st.airborne = false; st.groundKind = "water";
  st.gearDown = st.flapsDown = st.abOn = st.stalled = false;
  st.gearT = st.flapT = st.abLevel = 0; st.catPhase = "idle";
  st.mach = 0; st.alpha = 0; st.gLoad = 1; st.vspeed = 0;
}

/** Swept segment vs the ship's oriented hull/deckhouse, with a fuze margin. */
export function hitsVessel(from: Vector3, to: Vector3, st: Pick<AircraftState, "pos" | "quat">, margin = 0): boolean {
  Q.copy(st.quat).invert();
  P.copy(from).sub(st.pos).applyQuaternion(Q);
  F.copy(to).sub(st.pos).applyQuaternion(Q).sub(P);
  let lo = 0, hi = 1;
  const mins = [-11 - margin, -3 - margin, -72 - margin];
  const maxs = [11 + margin, 29 + margin, 72 + margin];
  for (let axis = 0; axis < 3; axis++) {
    const origin = P.getComponent(axis), delta = F.getComponent(axis);
    if (Math.abs(delta) < 1e-9) { if (origin < mins[axis] || origin > maxs[axis]) return false; continue; }
    const a = (mins[axis] - origin) / delta, b = (maxs[axis] - origin) / delta;
    lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b));
    if (lo > hi) return false;
  }
  return true;
}
