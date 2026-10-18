/** Deterministic impairment benchmark + reconstruction/codec/gameplay regression.
 * Latency is ONE WAY. RMS error is relative to each renderer's intended time;
 * visible correction is frame displacement minus the exact trajectory displacement.
 * No sockets/browsers are simulated by this diagnostic. */
import assert from "node:assert/strict";
import { Euler, Quaternion, Vector3, Scene } from "three";
import {
  MotionTimeline,
  derivatives,
  hermite,
  motionSample,
  sequenceNewer,
} from "../src/net/motion";
import {
  emptyPose,
  packMotion,
  unpackMotion,
  packPose,
  unpackPose,
  MOTION_BYTES,
} from "../src/net/poseProtocol";
import {
  RemoteFleet,
  FLAG_ACTIVE,
  FLAG_ON_GROUND,
  type RemotePose,
} from "../src/render/remoteJets";
import { LegacyRemoteMotion } from "./fixtures/legacyRemoteMotion";

assert(sequenceNewer(0, 0xffffffff));
assert(!sequenceNewer(0xffffffff, 0));
assert(!sequenceNewer(9, 9));
for (let i = 0; i <= 100; i++) {
  const n = hermite(0, 10, 1000, -1000, 0.1, i / 100);
  assert(n >= 0 && n <= 10);
}
const source = {
  ...emptyPose(),
  sentAt: 1234.567,
  epoch: 0xffffffff,
  ax: 12.34,
  ay: -4.56,
  az: 7,
  wx: 1.234,
  wy: -2.345,
  wz: 3.456,
  gearT: 0.3,
  flapT: 0.4,
  abLevel: 0.8,
  held: true,
};
const decoded = emptyPose();
assert.equal(packMotion(source, 0xffffffff).byteLength, MOTION_BYTES);
assert.equal(unpackMotion(packMotion(source, 0xffffffff), decoded), 0xffffffff);
assert.equal(decoded.sentAt, source.sentAt);
assert.equal(decoded.epoch, source.epoch);
assert(Math.abs(decoded.wy! - source.wy) < 0.001);
assert.equal(unpackPose(packMotion(source, 1), emptyPose()), null); // rolling-update contract
assert.equal(unpackMotion(packPose(source, 1), emptyPose()), null);
for (const offset of [0, 12, 24, 40, 52]) {
  const bad = packMotion(source, 1);
  if (offset === 52) new DataView(bad).setFloat64(offset, NaN);
  else new DataView(bad).setFloat32(offset, NaN);
  const target = { ...emptyPose(), x: 42 };
  assert.equal(unpackMotion(bad, target), null);
  assert.equal(target.x, 42);
}

const q = new Quaternion(),
  axis = new Vector3(0, 1, 0);
function trajectory(ms: number, kind = "turn", estimate = true): RemotePose {
  const t = ms / 1000,
    p = emptyPose();
  p.flags = FLAG_ACTIVE;
  p.speed = 250;
  p.sentAt = ms;
  p.sampleAt = ms;
  p.epoch = 1;
  if (kind === "straight") {
    p.x = 250 * t;
    p.y = 2000;
    p.vx = 250;
  } else if (kind === "carrier") {
    p.x = 9 * t;
    p.y = 20 + Math.sin(t) * 0.3;
    p.vx = 9;
    p.vy = Math.cos(t) * 0.3;
    p.flags |= FLAG_ON_GROUND;
  } else if (kind === "takeoff") {
    p.x = 35 * t + 8 * t * t;
    p.vx = 35 + 16 * t;
    p.y = t < 3 ? 20 : 20 + (t - 3) * (t - 3) * 3;
    p.vy = t < 3 ? 0 : 6 * (t - 3);
    if (t < 3) p.flags |= FLAG_ON_GROUND;
  } else if (kind === "landing") {
    p.x = 65 * t;
    p.vx = 65;
    p.y = Math.max(20, 200 - 20 * t);
    p.vy = t < 9 ? -20 : 0;
    if (t >= 9) p.flags |= FLAG_ON_GROUND;
  } else {
    const w = 0.32;
    p.x = (250 / w) * Math.sin(w * t);
    p.z = (250 / w) * (Math.cos(w * t) - 1);
    p.vx = 250 * Math.cos(w * t);
    p.vz = -250 * Math.sin(w * t);
    p.y = 2000 + 50 * Math.sin(t * 0.4);
    p.vy = 20 * Math.cos(t * 0.4);
  }
  q.setFromAxisAngle(axis, kind === "roll" ? 0 : 0.32 * t);
  if (kind === "roll") q.setFromAxisAngle(new Vector3(0, 0, 1), t * 3);
  p.qx = q.x;
  p.qy = q.y;
  p.qz = q.z;
  p.qw = q.w;
  if (kind === "aggressive") {
    p.x += 20 * Math.sin(t * 2.3);
    p.y += 10 * Math.cos(t * 3);
    p.vx += 46 * Math.cos(t * 2.3);
    p.vy -= 30 * Math.sin(t * 3);
    q.setFromEuler(
      new Euler(0.2 * Math.sin(t * 1.5), 0.32 * t, 0.9 * Math.sin(t * 2)),
    );
    p.qx = q.x;
    p.qy = q.y;
    p.qz = q.z;
    p.qw = q.w;
  }
  // Analytic acceleration for turn, exact angular velocity for both maneuvers.
  if (kind === "turn" || kind === "roll") {
    p.ax = -80 * Math.sin(0.32 * t);
    p.az = -80 * Math.cos(0.32 * t);
    p.ay = -8 * Math.sin(t * 0.4);
  }
  p.wx = 0;
  p.wy = kind === "roll" ? 0 : 0.32;
  p.wz = kind === "roll" ? 3 : 0;
  p.gearT = p.flags & FLAG_ON_GROUND ? 1 : 0;
  p.flapT = p.gearT;
  p.abLevel = 0.7;
  p.sweepT = 0.5;
  if (estimate) derivatives(p, trajectory(ms - 10, kind, false), 0.01);
  return p;
}
{
  const a = trajectory(0, "roll"),
    b = trajectory(20, "roll");
  derivatives(b, a, 0.02);
  assert(Math.abs(b.wz! - 3) < 1e-6);
  const tl = new MotionTimeline();
  tl.push(a, 50, 50);
  tl.push(b, 70, 50);
  const out = motionSample();
  tl.sample(100, out);
  assert(
    Math.abs(
      out.quat.angleTo(new Quaternion(0, 0, Math.sin(0.15), Math.cos(0.15))),
    ) < 0.01,
  );
  tl.sample(1000, out);
  const stop = out.pos.clone(),
    rot = out.quat.clone();
  tl.sample(9000, out);
  assert(out.pos.distanceTo(stop) < 1e-8);
  assert(out.quat.angleTo(rot) < 1e-6);
  assert.equal(out.vel.length(), 0);
}
{
  const tl = new MotionTimeline();
  for (const t of [0, 66, 33, 100]) tl.push(trajectory(t), t + 100, 100);
  assert.deepEqual(
    tl.frames.map((f) => f.t),
    [0, 33, 66, 100],
  );
  assert(!tl.push(trajectory(33), 200, 100));
  const jump = { ...trajectory(133), x: 20000, epoch: 2 };
  tl.push(jump, 233, 100);
  tl.update(233, 100);
  assert.equal(tl.visual.pos.x, 20000);
  assert.equal(tl.frames.length, 1);
  assert(!tl.push(trajectory(166), 266, 100)); // previous life cannot resurrect
  tl.push(
    { ...jump, sentAt: 200, sampleAt: 200, vx: 0, vy: 0, vz: 0, held: true },
    300,
    100,
  );
  const out = motionSample();
  tl.sample(800, out);
  assert.equal(out.pos.x, 20000);
  tl.update(2000, 100);
  assert(Number.isFinite(tl.visual.pos.x));
}

function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
const percentile = (v: number[], p: number) =>
  v.slice().sort((a, b) => a - b)[Math.floor((v.length - 1) * p)] ?? 0;
interface Scenario {
  name: string;
  latency: number;
  jitter: number;
  loss: number;
  fps: number;
  hz?: number;
  kind?: string;
  burst?: boolean;
}
const scenarios: Scenario[] = [
  {
    name: "clean straight",
    latency: 10,
    jitter: 0,
    loss: 0,
    fps: 60,
    kind: "straight",
  },
  { name: "50ms + jitter", latency: 50, jitter: 15, loss: 0.01, fps: 60 },
  { name: "100ms + 5% loss", latency: 100, jitter: 35, loss: 0.05, fps: 60 },
  { name: "200ms + 10% loss", latency: 200, jitter: 60, loss: 0.1, fps: 60 },
  {
    name: "delayed bursts",
    latency: 75,
    jitter: 20,
    loss: 0.05,
    fps: 60,
    burst: true,
  },
  {
    name: "20Hz / 30fps",
    latency: 75,
    jitter: 25,
    loss: 0.05,
    fps: 30,
    hz: 20,
  },
  {
    name: "60Hz / 144fps rolls",
    latency: 50,
    jitter: 20,
    loss: 0.03,
    fps: 144,
    hz: 60,
    kind: "roll",
  },
  {
    name: "aggressive maneuvers",
    latency: 100,
    jitter: 45,
    loss: 0.1,
    fps: 60,
    kind: "aggressive",
    burst: true,
  },
  {
    name: "takeoff",
    latency: 50,
    jitter: 15,
    loss: 0.03,
    fps: 60,
    kind: "takeoff",
  },
  {
    name: "landing",
    latency: 100,
    jitter: 25,
    loss: 0.05,
    fps: 30,
    kind: "landing",
  },
  {
    name: "moving carrier",
    latency: 100,
    jitter: 25,
    loss: 0.05,
    fps: 60,
    kind: "carrier",
  },
];
console.log(
  "scenario | old/new RMS m | old/new p95 correction m | old/new p95 rotation error deg | buffer ms",
);
const rows = [];
for (const s of scenarios) {
  const rand = random(7),
    timeline = new MotionTimeline(),
    legacy = new LegacyRemoteMotion();
  const deliveries: { at: number; p: RemotePose }[] = [];
  for (let at = 0; at < 20000; at += 1000 / (s.hz ?? 30)) {
    if (rand() < s.loss) continue;
    const latency = Math.max(
      0,
      s.latency +
        (rand() * 2 - 1) * s.jitter +
        (s.burst && at % 4000 < 180 ? 250 : 0),
    );
    const p = trajectory(at, s.kind),
      decoded = emptyPose();
    unpackMotion(packMotion(p, deliveries.length + 1), decoded);
    decoded.sampleAt = p.sampleAt;
    deliveries.push({ at: at + latency, p: decoded });
  }
  deliveries.sort((a, b) => a.at - b.at);
  let index = 0,
    n = 0,
    err = 0,
    oldErr = 0,
    oldNewest = -Infinity;
  const corrections: number[] = [],
    oldCorrections: number[] = [],
    angles: number[] = [],
    oldAngles: number[] = [];
  let prev = new Vector3(),
    oldPrev = new Vector3(),
    truthPrev = new Vector3(),
    oldTruthPrev = new Vector3();
  for (let now = 0; now < 20000; now += 1000 / s.fps) {
    while (index < deliveries.length && deliveries[index].at <= now) {
      const d = deliveries[index++];
      timeline.push(d.p, d.at, s.latency);
      if (d.p.sentAt! > oldNewest) {
        legacy.push(d.p, d.at);
        oldNewest = d.p.sentAt!;
      }
    }
    const visual = timeline.update(now, s.latency);
    legacy.update(now, s.latency);
    // This is the presentation's intended sender time, rather than hiding the
    // new buffer's extra latency by comparing all renderers against now.
    const renderTime = (timeline as unknown as { renderTime: number })
      .renderTime;
    const t = trajectory(Number.isFinite(renderTime) ? renderTime : 0, s.kind),
      ot = trajectory(now, s.kind);
    const truth = new Vector3(t.x, t.y, t.z),
      oldTruth = new Vector3(ot.x, ot.y, ot.z);
    if (now > 2000) {
      err += visual.pos.distanceToSquared(truth);
      oldErr += legacy.pos.distanceToSquared(oldTruth);
      n++;
      corrections.push(
        visual.pos.clone().sub(prev).sub(truth.clone().sub(truthPrev)).length(),
      );
      oldCorrections.push(
        legacy.pos
          .clone()
          .sub(oldPrev)
          .sub(oldTruth.clone().sub(oldTruthPrev))
          .length(),
      );
      angles.push(
        (visual.quat.angleTo(new Quaternion(t.qx, t.qy, t.qz, t.qw)) * 180) /
          Math.PI,
      );
      oldAngles.push(
        (legacy.quat.angleTo(new Quaternion(ot.qx, ot.qy, ot.qz, ot.qw)) *
          180) /
          Math.PI,
      );
    }
    prev.copy(visual.pos);
    oldPrev.copy(legacy.pos);
    truthPrev.copy(truth);
    oldTruthPrev.copy(oldTruth);
  }
  const row = {
    scenario: s.name,
    oldRms: Math.sqrt(oldErr / n),
    newRms: Math.sqrt(err / n),
    oldP95: percentile(oldCorrections, 0.95),
    newP95: percentile(corrections, 0.95),
    oldAngle: percentile(oldAngles, 0.95),
    newAngle: percentile(angles, 0.95),
    delay: timeline.metrics.delayMs,
  };
  rows.push(row);
  console.log(
    `${s.name} | ${row.oldRms.toFixed(3)}/${row.newRms.toFixed(3)} | ${row.oldP95.toFixed(3)}/${row.newP95.toFixed(3)} | ${row.oldAngle.toFixed(2)}/${row.newAngle.toFixed(2)} | ${row.delay.toFixed(0)}`,
  );
  assert(row.newRms < 5, `${s.name}: reconstruction error ${row.newRms}`);
  assert(row.newP95 < 2, `${s.name}: correction ${row.newP95}`);
  assert(timeline.metrics.delayMs >= 60 && timeline.metrics.delayMs <= 160);
  assert(timeline.frames.length <= 64);
}
assert(
  rows[2].newP95 < rows[2].oldP95 * 0.5,
  "jitter correction must substantially improve",
);
assert(
  rows[6].newAngle < rows[6].oldAngle * 0.3,
  "roll attitude prediction must substantially improve",
);

// Gameplay APIs must not read the mesh; spectator APIs should follow the mesh.
{
  const documentBefore = globalThis.document;
  (globalThis as any).document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => null }),
  };
  const fleet = new RemoteFleet(new Scene());
  fleet.spawn("remote", "tomcat", "REMOTE");
  const now = performance.now();
  for (let i = 4; i >= 0; i--) {
    const t = now - i * 34;
    fleet.push("remote", { ...trajectory(t, "straight"), sampleAt: t }, t + 10);
  }
  fleet.update(now);
  const mesh = (fleet as any).remotes.get("remote").mesh.group;
  const before = fleet.combatTargets()[0].pos.clone();
  mesh.position.set(9e6, 9e6, 9e6);
  const after = fleet.combatTargets(true)[0];
  assert(after.pos.distanceTo(before) < 1);
  assert(after.hitPos!.distanceTo(after.pos) < 55);
  assert.equal(fleet.pilotState("remote")!.pos.x, 9e6);
  fleet.dispose();
  (globalThis as any).document = documentBefore;
}
// CPU benchmark excludes packet-time allocations, mesh work and GPU rendering.
{
  const timelines = Array.from({ length: 11 }, () => new MotionTimeline());
  for (const tl of timelines)
    for (let t = 0; t <= 1000; t += 1000 / 30)
      tl.push(trajectory(t), t + 50, 50);
  const start = performance.now();
  for (let i = 0; i < 20000; i++)
    for (const tl of timelines) tl.update(1000 + (i % 10), 50);
  console.log(
    `CPU: ${((performance.now() - start) / 20000).toFixed(4)} ms per 11-aircraft update (this container)`,
  );
}
console.log("ALL MOTION CHECKS PASSED");
