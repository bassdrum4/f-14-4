// Remote aircraft for multiplayer: one mesh per wingman, driven from the
// packets that arrive from the net layer. The netcode itself lives in
// ../net/multiplayer.ts; this file only turns decoded poses into smooth motion.
//
// A wingman is drawn at "now", not behind it. Each remote keeps a presented
// clock that rides real time and is pulled onto the newest packet plus the
// measured one-way delay, so the aircraft is where the pilot is rather than one
// send interval in the past. Corrections are eased in a few milliseconds at a
// time (and a hopelessly stale remote snaps forward), which is what keeps the
// formation smooth while the link is being chased; between packets the pose is
// carried along the last known velocity.

import * as THREE from "three";
import { buildAircraft, type TomcatMesh } from "./geometry";
import type { AircraftId } from "../sim/aircraft";

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
}

export const FLAG_ON_GROUND = 1;
export const FLAG_GEAR = 2;
export const FLAG_FLAPS = 4;
export const FLAG_SPEEDBRAKE = 8;
export const FLAG_STALLED = 16;
export const FLAG_AB = 32;

/**
 * One-way link delay in ms, estimated by the net layer from the peer
 * connection's own RTT (never from extra traffic). The presented clock targets
 * the newest packet plus this, i.e. where the wingman is right now. */
let linkDelayMs = 25;
export function setLinkDelayMs(ms: number): void {
  linkDelayMs = Math.min(150, Math.max(6, ms));
}
export function getLinkDelayMs(): number {
  return linkDelayMs;
}

/** How quickly the presented clock is walked onto its target (ms). */
const CORR_TAU_MS = 70;
/** Per-frame limits on a correction, so no packet ever causes a visible pop. */
const MAX_LURCH_MS = 9; // forward: catching up on a remote that slipped behind
const MAX_BACKSTEP_MS = 6; // backward: easing off when we are running early
/** Past this much error the remote is simply out of date: snap it. */
const MAX_BEHIND_MS = 350;
const MAX_EXTRAP_MS = 600; // keep flying on velocity this long after a gap
const STALE_MS = 2500; // dim the label when the peer goes quiet
const GONE_MS = 12000; // hide a peer that has stopped sending entirely
const MAX_SNAPSHOTS = 10;

const TAG_TEXTURE_W = 512;
const TAG_TEXTURE_H = 128;

interface Snapshot {
  t: number;
  p: RemotePose;
}

interface RemoteEntity {
  id: string;
  name: string;
  /** The airframe id the mesh was built from: a change means a rebuild. */
  aircraft: AircraftId;
  mesh: TomcatMesh;
  tag: THREE.Sprite;
  tagTex: THREE.CanvasTexture;
  buf: Snapshot[];
  lastAt: number;
  /** The instant this aircraft is being drawn at, on our clock (ms). */
  presentT: number;
  /** False until the first packet places the clock (then it eases, never snaps). */
  placed: boolean;
}

/** A callsign label drawn onto a canvas sprite (cached per remote). */
function makeTag(name: string): { tag: THREE.Sprite; texture: THREE.CanvasTexture } {
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
    ctx.strokeStyle = "rgba(120, 255, 140, 0.55)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "rgba(214, 255, 226, 0.95)";
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

const V_A = new THREE.Vector3();
const Q_A = new THREE.Quaternion();
const Q_B = new THREE.Quaternion();

export class RemoteFleet {
  private root = new THREE.Group();
  private remotes = new Map<string, RemoteEntity>();
  /** Wall clock of the previous update, for the presented clock's advance. */
  private lastUpdateAt = 0;

  constructor(scene: THREE.Scene) {
    scene.add(this.root);
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
    mesh.group.position.set(0, -8000, 0); // parked below the water until the first frame
    this.root.add(mesh.group);
    const { tag, texture } = makeTag(name);
    this.root.add(tag);
    this.remotes.set(id, {
      id,
      name,
      aircraft,
      mesh,
      tag,
      tagTex: texture,
      buf: [],
      lastAt: 0,
      presentT: 0,
      placed: false,
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
    const { tag, texture } = makeTag(name);
    r.tag = tag;
    r.tagTex = texture;
    this.root.add(tag);
  }

  /** Adopt a decoded packet and return whether the peer is now live. */
  push(id: string, p: RemotePose, nowMs: number): void {
    const r = this.remotes.get(id);
    if (!r) return;
    r.buf.push({ t: nowMs, p });
    if (r.buf.length > MAX_SNAPSHOTS) r.buf.splice(0, r.buf.length - MAX_SNAPSHOTS);
    r.lastAt = nowMs;
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
    r.tag.removeFromParent();
    (r.tag.material as THREE.SpriteMaterial).dispose();
    r.tagTex.dispose();
    this.remotes.delete(id);
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

  /** Every live wingman with range and bearing from a world point. */
  contacts(
    x: number,
    y: number,
    z: number,
  ): Array<{ id: string; name: string; x: number; z: number; km: number; brgDeg: number }> {
    const out: Array<{ id: string; name: string; x: number; z: number; km: number; brgDeg: number }> = [];
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
      });
    }
    return out.sort((a, b) => a.km - b.km);
  }

  /** The closest live remote to a world point, with range and bearing. */
  nearest(x: number, y: number, z: number): { id: string; name: string; km: number; brgDeg: number } | null {
    let best: RemoteEntity | null = null;
    let bestD = Infinity;
    for (const r of this.remotes.values()) {
      if (!r.buf.length) continue;
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
      if (silent > GONE_MS) {
        r.mesh.group.visible = false;
        r.tag.visible = false;
        continue;
      }
      r.mesh.group.visible = true;
      r.tag.visible = true;

      // Where the wingman is now: their newest packet, carried forward by the
      // one-way delay the net layer measured. The presented clock is walked
      // onto that target, a few ms at a time, instead of being snapped to it.
      const newest = buf[buf.length - 1];
      const target = newest.t + linkDelayMs;
      if (!r.placed) {
        r.presentT = target;
        r.placed = true;
      } else {
        r.presentT += dtMs;
        const err = target - r.presentT;
        if (err > MAX_BEHIND_MS) {
          r.presentT = target; // far too stale to ease: this is a rejoin
        } else {
          const ease = err * (1 - Math.exp(-dtMs / CORR_TAU_MS));
          r.presentT += Math.min(MAX_LURCH_MS, Math.max(-MAX_BACKSTEP_MS, ease));
        }
      }
      const rt = r.presentT;

      // newest snapshot at or before the presented time, and the one after it
      let a: Snapshot | null = null;
      let b: Snapshot | null = null;
      for (let i = buf.length - 1; i >= 0; i--) {
        if (buf[i].t <= rt) {
          a = buf[i];
          b = buf[i + 1] ?? null;
          break;
        }
      }
      if (!a) {
        // No packet is old enough: the clock is behind the oldest one in the
        // buffer (the measured lead just shrank). Start from that packet and
        // interpolate forward from it.
        a = buf[0];
        b = buf.length > 1 && buf[1].t <= rt ? buf[1] : null;
      }

      if (a && b) {
        const span = Math.max(b.t - a.t, 1);
        const f = THREE.MathUtils.clamp((rt - a.t) / span, 0, 1);
        V_A.set(
          a.p.x + (b.p.x - a.p.x) * f,
          a.p.y + (b.p.y - a.p.y) * f,
          a.p.z + (b.p.z - a.p.z) * f,
        );
        Q_A.set(a.p.qx, a.p.qy, a.p.qz, a.p.qw);
        Q_B.set(b.p.qx, b.p.qy, b.p.qz, b.p.qw);
        Q_A.slerp(Q_B, f);
      } else {
        const dt = Math.min(Math.max(rt - a.t, 0), MAX_EXTRAP_MS) / 1000;
        V_A.set(a.p.x + a.p.vx * dt, a.p.y + a.p.vy * dt, a.p.z + a.p.vz * dt);
        Q_A.set(a.p.qx, a.p.qy, a.p.qz, a.p.qw);
      }

      r.mesh.group.position.copy(V_A);
      r.mesh.group.quaternion.copy(Q_A);
      r.tag.position.set(V_A.x, V_A.y + 7.5, V_A.z);

      // surface state, approximated from the packet flags
      if (r.mesh.sweepable !== false) {
        const sweep = THREE.MathUtils.degToRad(20 + 48 * THREE.MathUtils.clamp(a.p.sweepT, 0, 1));
        r.mesh.wings[0].rotation.y = -sweep;
        r.mesh.wings[1].rotation.y = sweep;
      }
      r.mesh.gear.visible = (a.p.flags & FLAG_GEAR) !== 0;
      const ab = (a.p.flags & FLAG_AB) !== 0;
      r.mesh.afterburner.visible = ab;
      if (ab) (r.mesh.afterburner.material as THREE.MeshBasicMaterial).opacity = 0.8;
      const flap = (a.p.flags & FLAG_FLAPS) !== 0 ? 0.4 : 0;
      r.mesh.flaps[0].rotation.z = flap;
      r.mesh.flaps[1].rotation.z = -flap;

      (r.tag.material as THREE.SpriteMaterial).opacity = silent > STALE_MS ? 0.35 : 1;
    }
  }

  dispose(): void {
    this.clear();
    this.root.removeFromParent();
  }
}
