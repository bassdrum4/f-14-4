// Math-only copy of remoteJets.ts update at 36357aa, for reproducible comparisons.
// Arrival-time snapshots, clock correction and 600 ms velocity extrapolation.
import { Quaternion, Vector3 } from "three";
import type { RemotePose } from "../../src/render/remoteJets";
export class LegacyRemoteMotion {
  buf: { t: number; p: RemotePose }[] = [];
  pos = new Vector3();
  quat = new Quaternion();
  private present = NaN;
  private last = 0;
  push(p: RemotePose, now: number): void {
    this.buf.push({ t: now, p });
    if (this.buf.length > 10) this.buf.shift();
  }
  update(now: number, delay: number): void {
    if (!this.buf.length) return;
    const dt =
      this.last === 0 ? 0 : Math.min(Math.max(now - this.last, 0), 250);
    this.last = now;
    const target = this.buf[this.buf.length - 1].t + delay;
    if (!Number.isFinite(this.present)) this.present = target;
    else {
      this.present += dt;
      const error = target - this.present;
      if (error > 350) this.present = target;
      else
        this.present += Math.min(
          9,
          Math.max(-6, error * (1 - Math.exp(-dt / 70))),
        );
    }
    let a = this.buf[0],
      b: typeof a | undefined;
    for (let i = this.buf.length - 1; i >= 0; i--)
      if (this.buf[i].t <= this.present) {
        a = this.buf[i];
        b = this.buf[i + 1];
        break;
      }
    if (b) {
      const u = Math.max(
        0,
        Math.min(1, (this.present - a.t) / Math.max(1, b.t - a.t)),
      );
      this.pos.set(
        a.p.x + (b.p.x - a.p.x) * u,
        a.p.y + (b.p.y - a.p.y) * u,
        a.p.z + (b.p.z - a.p.z) * u,
      );
      this.quat
        .set(a.p.qx, a.p.qy, a.p.qz, a.p.qw)
        .slerp(new Quaternion(b.p.qx, b.p.qy, b.p.qz, b.p.qw), u);
    } else {
      const t = Math.min(Math.max(this.present - a.t, 0), 600) / 1000;
      this.pos.set(a.p.x + a.p.vx * t, a.p.y + a.p.vy * t, a.p.z + a.p.vz * t);
      this.quat.set(a.p.qx, a.p.qy, a.p.qz, a.p.qw);
    }
  }
}
