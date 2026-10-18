/** Aircraft reconstruction, independent of meshes and the flight simulation.
 * All times are monotonic milliseconds on the receiver's clock. */
import { Quaternion, Vector3 } from "three";
import type { RemotePose } from "../render/remoteJets";

export const MAX_PREDICTION_MS = 200;
export const MAX_REWIND_MS = 200;
const GROUND = 1,
  ACTIVE = 128;
const AXES = ["x", "y", "z"] as const;
const SURFACES = ["speed", "sweep", "gear", "flap", "ab"] as const;
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
export function sequenceNewer(a: number, b: number): boolean {
  return ((a - b) | 0) > 0;
}
export function motionSample() {
  return {
    pos: new Vector3(),
    vel: new Vector3(),
    quat: new Quaternion(),
    speed: 0,
    sweep: 0,
    gear: 0,
    flap: 0,
    ab: 0,
    flags: 0,
  };
}
export type MotionSample = ReturnType<typeof motionSample>;
interface Frame {
  t: number;
  p: RemotePose;
}

/** Monotone cubic Hermite: limit tangents, not the final position (which would
 * introduce flat spots and derivative discontinuities). No endpoint overshoot. */
export function hermite(
  a: number,
  b: number,
  va: number,
  vb: number,
  seconds: number,
  u: number,
): number {
  const delta = b - a;
  if (Math.abs(delta) < 1e-7) return a;
  let ma = (va * seconds) / delta,
    mb = (vb * seconds) / delta;
  ma = Math.max(0, ma);
  mb = Math.max(0, mb);
  const norm = Math.hypot(ma, mb);
  if (norm > 3) {
    ma *= 3 / norm;
    mb *= 3 / norm;
  }
  const u2 = u * u,
    u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * a +
    (u3 - 2 * u2 + u) * ma * delta +
    (-2 * u3 + 3 * u2) * b +
    (u3 - u2) * mb * delta
  );
}

/** Bound derivatives by magnitude, including received values. 12g and 2 rolls/s
 * cover this game's aircraft without accepting numerical explosions. */
export function limitMotion(p: RemotePose): void {
  let k = Math.min(1, 120 / (Math.hypot(p.ax ?? 0, p.ay ?? 0, p.az ?? 0) || 1));
  p.ax = (p.ax ?? 0) * k;
  p.ay = (p.ay ?? 0) * k;
  p.az = (p.az ?? 0) * k;
  k = Math.min(1, 12 / (Math.hypot(p.wx ?? 0, p.wy ?? 0, p.wz ?? 0) || 1));
  p.wx = (p.wx ?? 0) * k;
  p.wy = (p.wy ?? 0) * k;
  p.wz = (p.wz ?? 0) * k;
}
const qa = new Quaternion(),
  qb = new Quaternion(),
  dq = new Quaternion();
/** Angular velocity is world-space, consistent with dq * q during prediction. */
export function derivatives(
  p: RemotePose,
  prev: RemotePose,
  seconds: number,
): void {
  if (
    seconds < 0.002 ||
    seconds > 0.25 ||
    (p.flags ^ prev.flags) & (GROUND | ACTIVE) ||
    p.held ||
    prev.held
  ) {
    p.ax = p.ay = p.az = p.wx = p.wy = p.wz = 0;
    return;
  }
  p.ax = (p.vx - prev.vx) / seconds;
  p.ay = (p.vy - prev.vy) / seconds;
  p.az = (p.vz - prev.vz) / seconds;
  qa.set(prev.qx, prev.qy, prev.qz, prev.qw).normalize();
  qb.set(p.qx, p.qy, p.qz, p.qw).normalize();
  dq.copy(qb).multiply(qa.invert()).normalize();
  if (dq.w < 0) dq.set(-dq.x, -dq.y, -dq.z, -dq.w);
  const sin = Math.hypot(dq.x, dq.y, dq.z);
  const k = sin < 1e-7 ? 0 : (2 * Math.atan2(sin, dq.w)) / sin / seconds;
  p.wx = dq.x * k;
  p.wy = dq.y * k;
  p.wz = dq.z * k;
  limitMotion(p);
}

export class MotionTimeline {
  readonly frames: Frame[] = [];
  readonly visual = motionSample();
  readonly metrics = {
    delayMs: 70,
    jitterMs: 0,
    intervalMs: 1000 / 30,
    predictionErrorM: 0,
    correctionM: 0,
    extrapolatedMs: 0,
    resets: 0,
  };
  private offset = new Vector3();
  private offsetVelocity = new Vector3();
  private rotationOffset = new Quaternion();
  private oldGoal = motionSample();
  private goal = motionSample();
  private axis = new Vector3();
  private turn = new Quaternion();
  private lastRenderAt = NaN;
  private renderTime = NaN;
  private lastArrival = NaN;
  private lastSource = NaN;
  private placed = false;
  lastAt = -Infinity;

  push(pose: RemotePose, arrival: number, oneWay = 25): boolean {
    const t = pose.sampleAt ?? arrival - oneWay;
    if (!Number.isFinite(t) || t > arrival + 250 || t < arrival - 5000)
      return false;
    const frames = this.frames,
      newest = frames[frames.length - 1];
    if (newest && t <= newest.t - 1000) return false;
    if (frames.some((f) => f.t === t)) return false;
    const p = { ...pose };
    const isNew = !newest || t > newest.t;
    // Epoch changes cannot be undone by a delayed packet from the previous life.
    if (
      newest &&
      p.epoch !== undefined &&
      newest.p.epoch !== undefined &&
      p.epoch !== newest.p.epoch &&
      !sequenceNewer(p.epoch, newest.p.epoch)
    )
      return false;
    const span = newest ? (t - newest.t) / 1000 : 0;
    const discontinuity =
      !!newest &&
      isNew &&
      (p.epoch !== newest.p.epoch ||
        arrival - this.lastAt > 1500 ||
        !!((p.flags ^ newest.p.flags) & ACTIVE) ||
        Math.hypot(
          p.x - newest.p.x - newest.p.vx * span,
          p.y - newest.p.y - newest.p.vy * span,
          p.z - newest.p.z - newest.p.vz * span,
        ) > Math.max(150, Math.abs(span) * 800));
    if (discontinuity) {
      frames.length = 0;
      this.placed = false;
      this.offset.set(0, 0, 0);
      this.offsetVelocity.set(0, 0, 0);
      this.rotationOffset.identity();
      this.metrics.resets++;
    }
    if (isNew) {
      if (Number.isFinite(this.lastSource) && !discontinuity) {
        const sourceDt = t - this.lastSource,
          arrivalDt = arrival - this.lastArrival;
        this.metrics.jitterMs +=
          (Math.abs(arrivalDt - sourceDt) - this.metrics.jitterMs) / 16;
        // Ignore gaps; loss should grow the jitter buffer, not claim a slower sender.
        if (sourceDt > 5 && sourceDt < 100)
          this.metrics.intervalMs += (sourceDt - this.metrics.intervalMs) * 0.1;
      }
      this.lastArrival = arrival;
      this.lastSource = t;
      this.lastAt = arrival;
    }
    const hadGoal = this.placed && frames.length > 0;
    if (hadGoal) this.sample(this.renderTime, this.oldGoal);
    let index = frames.length;
    while (index > 0 && frames[index - 1].t > t) index--;
    // Legacy clients supply no derivatives. Estimate only from a preceding frame.
    const previous = frames[index - 1];
    if (p.ax === undefined && previous)
      derivatives(p, previous.p, (t - previous.t) / 1000);
    limitMotion(p);
    frames.splice(index, 0, { t, p });
    while (frames.length > 64 || (frames.length > 2 && t - frames[0].t > 1500))
      frames.shift();
    if (hadGoal) {
      this.sample(this.renderTime, this.goal);
      this.metrics.predictionErrorM = this.oldGoal.pos.distanceTo(
        this.goal.pos,
      );
      this.offset.add(this.oldGoal.pos.sub(this.goal.pos));
      // Keep the rendered attitude continuous across a new prediction.
      this.rotationOffset
        .multiply(this.oldGoal.quat)
        .multiply(this.turn.copy(this.goal.quat).invert())
        .normalize();
    }
    return true;
  }

  /** Read history or bounded dead reckoning. No render state participates. */
  sample(t: number, out: MotionSample): MotionSample {
    const frames = this.frames;
    if (!frames.length) return out;
    let i = frames.length - 1;
    while (i > 0 && frames[i].t > t) i--;
    const a = frames[i],
      b = frames[i + 1],
      p = a.p;
    out.pos.set(p.x, p.y, p.z);
    out.vel.set(p.vx, p.vy, p.vz);
    out.quat.set(p.qx, p.qy, p.qz, p.qw).normalize();
    out.speed = p.speed;
    out.sweep = p.sweepT;
    out.flags = p.flags;
    out.gear = p.gearT ?? (p.flags & 2 ? 1 : 0);
    out.flap = p.flapT ?? (p.flags & 4 ? 1 : 0);
    out.ab = p.abLevel ?? (p.flags & 32 ? 1 : 0);
    if (b && t >= a.t) {
      const seconds = (b.t - a.t) / 1000,
        u = clamp((t - a.t) / (b.t - a.t), 0, 1),
        q = b.p;
      out.pos.set(
        hermite(p.x, q.x, p.vx, q.vx, seconds, u),
        hermite(p.y, q.y, p.vy, q.vy, seconds, u),
        hermite(p.z, q.z, p.vz, q.vz, seconds, u),
      );
      out.vel.lerp(this.axis.set(q.vx, q.vy, q.vz), u);
      out.quat.slerp(this.turn.set(q.qx, q.qy, q.qz, q.qw).normalize(), u);
      out.speed += (q.speed - out.speed) * u;
      out.sweep += (q.sweepT - out.sweep) * u;
      out.gear += ((q.gearT ?? (q.flags & 2 ? 1 : 0)) - out.gear) * u;
      out.flap += ((q.flapT ?? (q.flags & 4 ? 1 : 0)) - out.flap) * u;
      out.ab += ((q.abLevel ?? (q.flags & 32 ? 1 : 0)) - out.ab) * u;
    } else if (t > a.t && !p.held) {
      // First 100 ms at full rate, then smoothly coast to a stop by 300 ms.
      // On a deck the shorter horizon prevents carrying a jet over its edge.
      const horizon = p.flags & GROUND ? 0.08 : MAX_PREDICTION_MS / 1000;
      const age = (t - a.t) / 1000,
        start = horizon * 0.5;
      const tail = clamp((age - start) / horizon, 0, 1);
      const dt =
        age <= start ? age : start + horizon * (tail - tail * tail * 0.5);
      const rate = age <= start ? 1 : 1 - tail;
      this.axis.set(p.ax ?? 0, p.ay ?? 0, p.az ?? 0);
      if (p.flags & GROUND) this.axis.set(0, 0, 0); // deck velocity already includes fleet motion
      // Exponentially fading acceleration avoids increasing speed through a gap.
      const accDt = 0.08 * (1 - Math.exp(-dt / 0.08));
      out.pos
        .addScaledVector(out.vel, dt)
        .addScaledVector(this.axis, 0.5 * accDt * dt);
      out.vel.addScaledVector(this.axis, accDt).multiplyScalar(rate);
      this.axis.set(p.wx ?? 0, p.wy ?? 0, p.wz ?? 0);
      const omega = this.axis.length();
      if (omega > 1e-5 && !(p.flags & GROUND)) {
        this.axis.multiplyScalar(1 / omega);
        out.quat
          .premultiply(this.turn.setFromAxisAngle(this.axis, omega * dt))
          .normalize();
      }
    }
    return out;
  }

  update(now: number, oneWay = 25): MotionSample {
    if (!this.frames.length) return this.visual;
    const dt = Number.isFinite(this.lastRenderAt)
      ? clamp((now - this.lastRenderAt) / 1000, 0, 0.25)
      : 0;
    const frameGap = now - this.lastRenderAt;
    this.lastRenderAt = now;
    const desired = clamp(
      Math.max(60, this.metrics.intervalMs * 1.7) + this.metrics.jitterMs * 2,
      60,
      160,
    );
    this.metrics.delayMs +=
      (desired - this.metrics.delayMs) *
      (1 - Math.exp(-dt / (desired > this.metrics.delayMs ? 0.2 : 3)));
    const target = now - clamp(oneWay, 0, 250) - this.metrics.delayMs;
    const placing = !this.placed;
    if (placing || frameGap > 1000) {
      this.renderTime = target;
      this.placed = true;
      this.offset.set(0, 0, 0);
      this.offsetVelocity.set(0, 0, 0);
      this.rotationOffset.identity();
    } else {
      // Never reverse the playback clock when a jitter spike expands the buffer.
      this.renderTime += Math.max(
        0,
        Math.min(dt * 1100, target - this.renderTime),
      );
    }
    this.sample(this.renderTime, this.goal);
    // Exact critically damped spring, stable at any frame rate. Offset-only
    // correction preserves constant velocity (ordinary interpolation has no lag).
    const omega = 22,
      decay = Math.exp(-omega * dt);
    for (const key of AXES) {
      const x = this.offset[key],
        v = this.offsetVelocity[key],
        c = v + omega * x;
      this.offset[key] = (x + c * dt) * decay;
      this.offsetVelocity[key] = (v - omega * c * dt) * decay;
    }
    this.rotationOffset.slerp(this.turn.identity(), 1 - Math.exp(-dt * 22));
    this.visual.pos.copy(this.goal.pos).add(this.offset);
    this.visual.quat
      .copy(this.goal.quat)
      .premultiply(this.rotationOffset)
      .normalize();
    this.visual.vel.copy(this.goal.vel);
    const ease = 1 - Math.exp(-dt * 12);
    for (const key of SURFACES)
      this.visual[key] = placing
        ? this.goal[key]
        : this.visual[key] + (this.goal[key] - this.visual[key]) * ease;
    this.visual.flags = this.goal.flags;
    this.metrics.correctionM = this.offset.length();
    this.metrics.extrapolatedMs = Math.max(
      0,
      this.renderTime - this.frames[this.frames.length - 1].t,
    );
    return this.visual;
  }
}
