// Remote meshes consume a dedicated visual timeline; combat reads motion history.
import * as THREE from "three";
import { buildAircraft, type TomcatMesh } from "./geometry";
import type { AircraftId } from "../sim/aircraft";
import { MotionTimeline, motionSample, MAX_REWIND_MS } from "../net/motion";
import { headingOfQuat } from "../sim/world";

/** One decoded state frame from a remote pilot. */
export interface RemotePose {
  x: number;
  y: number;
  z: number;
  qx: number;
  qy: number;
  qz: number;
  qw: number;
  vx: number;
  vy: number;
  vz: number;
  speed: number;
  sweepT: number;
  flags: number;
  /** v2 motion extension; absent for legacy peers. */
  sentAt?: number; sampleAt?: number; epoch?: number;
  ax?: number; ay?: number; az?: number;
  wx?: number; wy?: number; wz?: number;
  gearT?: number; flapT?: number; abLevel?: number; held?: boolean;
}

export const FLAG_ON_GROUND = 1;
export const FLAG_GEAR = 2;
export const FLAG_FLAPS = 4;
export const FLAG_SPEEDBRAKE = 8;
export const FLAG_STALLED = 16;
export const FLAG_AB = 32;
export const FLAG_ACTIVE = 128;

/**
 * One-way link delay in ms, estimated by the net layer from the peer
 * connection's own RTT (never from extra traffic). The presented clock targets
 * the newest packet plus this, i.e. where the wingman is right now. */
let linkDelayMs = 25;
function clampDelay(ms: number): number {
  return Math.min(250, Math.max(0, ms));
}
/** One-way delay for a wingman we have not measured yet. */
export function setLinkDelayMs(ms: number): void {
  linkDelayMs = clampDelay(ms);
}
export function getLinkDelayMs(): number {
  return linkDelayMs;
}
/**
 * One-way delay measured on one pilot's own link. Every peer's path is
 * different, so each wingman is led by its own — the global above is only the
 * placeholder until that peer's first reading arrives.
 */
const peerDelayMs = new Map<string, number>();
export function setPeerLinkDelayMs(id: string, ms: number): void {
  if (!id) return;
  if (Number.isFinite(ms)) peerDelayMs.set(id, clampDelay(ms));
  else peerDelayMs.delete(id);
}
export function getPeerLinkDelayMs(id: string): number {
  return peerDelayMs.get(id) ?? linkDelayMs;
}
export function clearPeerLinkDelayMs(id: string): void {
  peerDelayMs.delete(id);
}

const STALE_MS = 1000;
const GONE_MS = 12000;

const TAG_TEXTURE_W = 512;
const TAG_TEXTURE_H = 128;

interface RemoteEntity {
  id: string; name: string; aircraft: AircraftId;
  mesh: TomcatMesh; tag: THREE.Sprite; tagTex: THREE.CanvasTexture;
  motion: MotionTimeline;
  buf: MotionTimeline["frames"];
  lastAt: number;
}

/** A callsign label drawn onto a canvas sprite (cached per remote). */
function makeTag(name: string, hostile = false): { tag: THREE.Sprite; texture: THREE.CanvasTexture } {
  const canvas = document.createElement("canvas");
  canvas.width = TAG_TEXTURE_W;
  canvas.height = TAG_TEXTURE_H;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, TAG_TEXTURE_W, TAG_TEXTURE_H);
    ctx.font = "600 64px ui-monospace, Menlo, monospace";
    const text = name.toUpperCase().slice(0, 14);
    const w = Math.min(ctx.measureText(text).width + 56, TAG_TEXTURE_W);
    const x = (TAG_TEXTURE_W - w) / 2;
    ctx.fillStyle = "rgba(6, 16, 22, 0.66)";
    ctx.beginPath();
    ctx.roundRect(x, 18, w, 92, 18);
    ctx.fill();
    ctx.strokeStyle = hostile ? "rgba(255, 120, 90, 0.7)" : "rgba(120, 255, 140, 0.55)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = hostile ? "rgba(255, 210, 185, 0.95)" : "rgba(214, 255, 226, 0.95)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, TAG_TEXTURE_W / 2, TAG_TEXTURE_H / 2 + 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const tag = new THREE.Sprite(material);
  tag.scale.set(24, 6, 1);
  tag.renderOrder = 3;
  return { tag, texture };
}

const GAMEPLAY = motionSample();
const HIT_HISTORY = motionSample();

export class RemoteFleet {
  private root = new THREE.Group();
  private remotes = new Map<string, RemoteEntity>();
  /** Wall clock of the previous update, for the presented clock's advance. */
  private lastUpdateAt = 0;
  private combatPilots: Set<string> | null = null;

  constructor(scene: THREE.Scene) {
    scene.add(this.root);
  }

  setCombatPilots(ids: string[] | null): void {
    const changed = (ids === null) !== (this.combatPilots === null);
    this.combatPilots = ids === null ? null : new Set(ids);
    if (changed) for (const r of this.remotes.values()) {
      const name = r.name; r.name = ""; this.setName(r.id, name);
    }
  }

  /** Create (or reset) the mesh for a peer as soon as its hello arrives. */
  spawn(id: string, aircraft: AircraftId, name: string): void {
    const existing = this.remotes.get(id);
    if (existing) {
      if (existing.aircraft === aircraft) {
        this.setName(id, name);
        return;
      }
      // The wingman changed airframe mid-session (they picked a Hornet in the
      // settings while flying with us): the old silhouette has to go, or we keep
      // seeing a Tomcat where they are flying something else.
      this.remove(id);
    }
    const mesh = buildAircraft(aircraft, "gray");
    mesh.afterburner.material = (mesh.afterburner.material as THREE.Material).clone();
    mesh.group.position.set(0, -8000, 0); // parked below the water until the first frame
    this.root.add(mesh.group);
    const { tag, texture } = makeTag(name, this.combatPilots !== null);
    this.root.add(tag);
    const motion = new MotionTimeline();
    this.remotes.set(id, {
      id,
      name,
      aircraft,
      mesh,
      tag,
      tagTex: texture,
      motion,
      buf: motion.frames,
      lastAt: 0,
    });
  }

  /** Update the callsign label (e.g. the pilot renamed themselves). */
  setName(id: string, name: string): void {
    const r = this.remotes.get(id);
    if (!r || r.name === name) return;
    r.name = name;
    this.root.remove(r.tag);
    r.tag.material.map = null;
    (r.tag.material as THREE.SpriteMaterial).dispose();
    r.tagTex.dispose();
    const { tag, texture } = makeTag(name, this.combatPilots !== null);
    r.tag = tag;
    r.tagTex = texture;
    this.root.add(tag);
  }

  /** Adopt a decoded packet and return whether the peer is now live. */
  push(id: string, p: RemotePose, nowMs: number): void {
    const r = this.remotes.get(id);
    if (!r) return;
    if (r.motion.push(p, nowMs, getPeerLinkDelayMs(id))) r.lastAt = r.motion.lastAt;
  }

  remove(id: string): void {
    const r = this.remotes.get(id);
    if (!r) return;
    r.mesh.group.removeFromParent();
    // Release geometry only: the airframe materials are module-shared.
    r.mesh.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
    });
    (r.mesh.afterburner.material as THREE.Material).dispose();
    r.tag.removeFromParent();
    (r.tag.material as THREE.SpriteMaterial).dispose();
    r.tagTex.dispose();
    this.remotes.delete(id);
    clearPeerLinkDelayMs(id);
  }

  /** One-way delay measured on this pilot's own link, not the room's. */
  setLinkDelay(id: string, ms: number): void {
    setPeerLinkDelayMs(id, ms);
  }

  clear(): void {
    for (const id of [...this.remotes.keys()]) this.remove(id);
  }

  count(): number {
    return this.remotes.size;
  }

  /** Live positions in world XZ, for minimap markers and range readouts. */
  positions(): Array<{ id: string; name: string; x: number; z: number }> {
    const out: Array<{ id: string; name: string; x: number; z: number }> = [];
    for (const r of this.remotes.values()) {
      if (!r.buf.length || performance.now() - r.lastAt > GONE_MS) continue;
      const p = r.buf[r.buf.length - 1].p;
      out.push({ id: r.id, name: r.name, x: p.x, z: p.z });
    }
    return out;
  }

  activePilotCount(): number {
    let count = 0;
    for (const r of this.remotes.values()) if (r.buf.length && performance.now() - r.lastAt <= GONE_MS &&
      (r.buf[r.buf.length - 1].p.flags & FLAG_ACTIVE)) count++;
    return count;
  }

  /** Gameplay prediction uses the current receiver time, never a mesh or a
   * presentation clock. Gun collision may use up to 200 ms of received history;
   * missile guidance, defenders and host validation use the current estimate. */
  combatTargets(lagCompensateGuns = false): Array<{ id: string; pos: THREE.Vector3; vel: THREE.Vector3; hitPos?: THREE.Vector3; onGround?: boolean; quat?: THREE.Quaternion; surfaceVessel?: boolean; aircraft?: AircraftId }> {
    const out: Array<{ id: string; pos: THREE.Vector3; vel: THREE.Vector3; hitPos?: THREE.Vector3; onGround?: boolean; quat?: THREE.Quaternion; surfaceVessel?: boolean; aircraft?: AircraftId }> = [];
    const now = performance.now();
    for (const r of this.remotes.values()) {
      if (!r.buf.length || now-r.lastAt > 800) continue;
      const p = r.buf[r.buf.length-1].p;
      if (!(p.flags & FLAG_ACTIVE)) continue;
      r.motion.sample(now, GAMEPLAY);
      let hitPos: THREE.Vector3 | undefined;
      if (lagCompensateGuns) {
        const rewind = Math.min(MAX_REWIND_MS, getPeerLinkDelayMs(r.id)+r.motion.metrics.delayMs);
        r.motion.sample(now-rewind,HIT_HISTORY); hitPos = HIT_HISTORY.pos.clone();
      }
      out.push({ id: r.id, pos: GAMEPLAY.pos.clone(), vel: GAMEPLAY.vel.clone(), hitPos, quat: GAMEPLAY.quat.clone(), surfaceVessel: r.aircraft === "destroyer", aircraft: r.aircraft, onGround: !!(p.flags & FLAG_ON_GROUND) });
    }
    return out;
  }

  /** Inspectable per-aircraft reconstruction statistics, copied off the hot path. */
  diagnostics(): Array<{ id: string } & MotionTimeline["metrics"]> {
    return [...this.remotes.values()].map(r => ({ id: r.id, ...r.motion.metrics }));
  }

  /** Every live wingman with range and bearing from a world point. */
  contacts(
    x: number,
    y: number,
    z: number,
  ): Array<{ id: string; name: string; x: number; z: number; km: number; brgDeg: number; headingDeg: number }> {
    const out: Array<{ id: string; name: string; x: number; z: number; km: number; brgDeg: number; headingDeg: number }> = [];
    for (const r of this.remotes.values()) {
      if (!r.buf.length || performance.now() - r.lastAt > GONE_MS) continue;
      const p = r.buf[r.buf.length - 1].p;
      const brg = (Math.atan2(p.x - x, -(p.z - z)) * 180) / Math.PI;
      out.push({
        id: r.id,
        name: r.name,
        x: p.x,
        z: p.z,
        km: Math.hypot(p.x - x, p.y - y, p.z - z) / 1000,
        brgDeg: (brg + 360) % 360,
        // Which way they are pointing, for the tactical map's chevrons.
        headingDeg: headingOfQuat({ x: p.qx, y: p.qy, z: p.qz, w: p.qw }),
      });
    }
    return out.sort((a, b) => a.km - b.km);
  }

  /** The closest live remote to a world point, with range and bearing. */
  nearest(x: number, y: number, z: number): { id: string; name: string; km: number; brgDeg: number } | null {
    let best: RemoteEntity | null = null;
    let bestD = Infinity;
    for (const r of this.remotes.values()) {
      if (!r.buf.length || performance.now()-r.lastAt > GONE_MS) continue;
      const p = r.buf[r.buf.length - 1].p;
      const d = Math.hypot(p.x - x, p.y - y, p.z - z);
      if (d < bestD) {
        bestD = d;
        best = r;
      }
    }
    if (!best) return null;
    const p = best.buf[best.buf.length - 1].p;
    const brg = (Math.atan2(p.x - x, -(p.z - z)) * 180) / Math.PI;
    return { id: best.id, name: best.name, km: bestD / 1000, brgDeg: (brg + 360) % 360 };
  }

  /** Live pose of a specific remote pilot for spectator camera & telemetry. */
  pilotState(id: string): {
    id: string;
    name: string;
    aircraft: AircraftId;
    pos: THREE.Vector3;
    quat: THREE.Quaternion;
    vel: THREE.Vector3;
    speed: number;
    sweepT: number;
    flags: number;
  } | null {
    const r = this.remotes.get(id);
    if (!r || !r.buf.length || performance.now() - r.lastAt > GONE_MS) return null;
    return {
      id: r.id,
      name: r.name,
      aircraft: r.aircraft,
      pos: r.mesh.group.position.clone(),
      quat: r.mesh.group.quaternion.clone(),
      vel: r.motion.visual.vel.clone(),
      speed: r.motion.visual.speed,
      sweepT: r.motion.visual.sweep,
      flags: r.motion.visual.flags,
    };
  }

  /** Ordered list of live remote pilot ids. */
  liveIds(): string[] {
    const now = performance.now();
    return [...this.remotes.values()]
      .filter((r) => r.buf.length > 0 && now - r.lastAt <= GONE_MS)
      .map((r) => r.id);
  }

  /** Hide a single remote's mesh (e.g. when a spectator is inside its cockpit). */
  setPilotVisible(id: string | null): void {
    for (const r of this.remotes.values()) {
      if (r.id === id) r.mesh.group.visible = false;
    }
  }

  /** Place every remote at the present moment and drive its mesh. Once a frame. */
  update(nowMs: number): void {
    // The presented clock rides real time between corrections; clamp the step so
    // a stalled frame (a tab coming back) cannot fling every remote forward.
    const dtMs = this.lastUpdateAt === 0 ? 0 : Math.min(Math.max(nowMs - this.lastUpdateAt, 0), 250);
    this.lastUpdateAt = nowMs;
    for (const r of this.remotes.values()) {
      const buf = r.buf;
      if (!buf.length) continue;
      const silent = nowMs - r.lastAt;
      if (silent > GONE_MS || (this.combatPilots !== null && (!this.combatPilots.has(r.id) || !(buf[buf.length - 1].p.flags & FLAG_ACTIVE)))) {
        r.mesh.group.visible = false;
        r.tag.visible = false;
        continue;
      }
      r.mesh.group.visible = true;
      r.tag.visible = true;

      const visual = r.motion.update(nowMs,getPeerLinkDelayMs(r.id));
      r.mesh.group.position.copy(visual.pos);
      r.mesh.group.quaternion.copy(visual.quat);
      r.tag.position.set(visual.pos.x, visual.pos.y+(r.aircraft === "destroyer" ? 45 : 7.5), visual.pos.z);
      if (r.mesh.sweepable !== false) {
        const sweep = THREE.MathUtils.degToRad(20+48*THREE.MathUtils.clamp(visual.sweep,0,1));
        r.mesh.wings[0].rotation.y = -sweep;
        r.mesh.wings[1].rotation.y = sweep;
      }
      // Remote packets contain no collective; present a governed rotor rate
      // on frame time rather than leaving the helicopter's blades frozen.
      if (r.mesh.rotor) r.mesh.rotor.rotation.y = (r.mesh.rotor.rotation.y + 27 * dtMs / 1000) % (Math.PI * 2);
      if (r.mesh.tailRotor) r.mesh.tailRotor.rotation.x = (r.mesh.tailRotor.rotation.x + 70 * dtMs / 1000) % (Math.PI * 2);
      r.mesh.gear.visible = visual.gear > .02;
      r.mesh.gear.scale.y = Math.max(.08,visual.gear);
      r.mesh.gear.position.y = (1-visual.gear)*1.1;
      r.mesh.afterburner.visible = visual.ab > .02;
      (r.mesh.afterburner.material as THREE.MeshBasicMaterial).opacity = .8*visual.ab;
      r.mesh.flaps[0].rotation.z = .4*visual.flap;
      r.mesh.flaps[1].rotation.z = -.4*visual.flap;

      (r.tag.material as THREE.SpriteMaterial).opacity = silent > STALE_MS ? 0.35 : 1;
    }
  }

  dispose(): void {
    this.clear();
    this.root.removeFromParent();
  }
}
