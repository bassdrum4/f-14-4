/** Deterministic MotionLink clock, wrap/reorder, loss, per-peer queue/recovery tests. */
import assert from "node:assert/strict";
import type { DataConnection } from "peerjs";
import { MotionLink, type MotionControl } from "../src/net/motionLink";
import { emptyPose, packMotion } from "../src/net/poseProtocol";
import type { RemotePose } from "../src/render/remoteJets";

let now = 1000;
class Channel {
  readyState = "open";
  bufferedAmount = 0;
  binaryType = "arraybuffer";
  sent: ArrayBuffer[] = [];
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: ArrayBuffer }) => void) | null = null;
  send(buf: ArrayBuffer) {
    this.sent.push(buf);
  }
  close() {
    this.readyState = "closed";
    this.onclose?.();
  }
}
function endpoint() {
  const received: RemotePose[] = [],
    controls: MotionControl[] = [],
    channels: Channel[] = [];
  const conn = {
    open: true,
    peer: "remote",
    dataChannel: { bufferedAmount: 0 },
    send: (wire: string) => controls.push(JSON.parse(wire)),
    peerConnection: {
      createDataChannel: (_label: string, config: RTCDataChannelInit) => {
        assert.equal(config.negotiated, true);
        assert.equal(config.id, 32);
        assert.equal(config.ordered, false);
        assert.equal(config.maxRetransmits, 0);
        const c = new Channel();
        channels.push(c);
        return c;
      },
    },
  };
  const link = new MotionLink(
    conn as unknown as DataConnection,
    (p) => received.push(p),
    () => now,
  );
  link.enable();
  link.control({ t: "motionReady", generation: 1, ack: 1 });
  return { link, conn, controls, channels, received };
}
const e = endpoint(),
  good = endpoint();
e.channels[0].bufferedAmount = 80;
assert(!e.link.send({ ...emptyPose(), sentAt: 1000 }));
assert(good.link.send({ ...emptyPose(), sentAt: 1000 }));
assert.equal(e.channels[0].sent.length, 0);
assert.equal(e.link.metrics.skipped, 1);
e.channels[0].bufferedAmount = 0;
assert(e.link.send({ ...emptyPose(), x: 999, sentAt: 1000 }));
assert.equal(e.channels[0].sent.length, 1);
assert(!e.link.send({ ...emptyPose(), sentAt: 1000 }), "rate guard");
for (const seq of [0xfffffffd, 0xffffffff, 0xfffffffe, 0, 1, 1, 0xffffff00]) {
  now += 34;
  e.channels[0].onmessage!({
    data: packMotion({ ...emptyPose(), sentAt: now + 5000, x: seq % 100 }, seq),
  });
}
assert.equal(e.received.length, 5);
assert.equal(e.link.metrics.reordered, 1);
assert.equal(
  e.link.metrics.loss,
  0,
  "wrap/reorder window has no genuine holes after repair",
);
// Correlated ping with a remote clock 5000 ms ahead; outbound/return each 50ms.
now = 5000;
e.link.tick();
const ping = e.controls
  .slice()
  .reverse()
  .find((m) => m.t === "netPing") as { t: "netPing"; at: number };
assert(ping);
now = 5100;
e.link.control({ t: "netPong", at: ping.at, received: 10050, sent: 10050 });
const target = (e.link as any).targetOffset;
assert.equal(target, -5000);
assert(e.link.metrics.rttMs > 50);
e.link.control({ t: "netPong", at: ping.at, received: 1e12, sent: 1e12 });
assert.equal(
  (e.link as any).targetOffset,
  target,
  "unsolicited/replayed pong ignored",
);
// Duplicate and damaged packets cannot alter the received poses.
const count = e.received.length;
e.channels[0].onmessage!({ data: new ArrayBuffer(80) });
assert.equal(e.received.length, count);
// Closing just motion retains the PC/control connection and recreates the stream.
e.channels[0].close();
assert.equal(e.conn.open, true);
now += 1100;
e.link.tick();
assert.equal(e.channels.length, 2);
e.link.control({ t: "motionReady", generation: 2, ack: 2 });
assert(e.link.send({ ...emptyPose(), sentAt: now }));
// Repeated channel failures negotiate a bilateral legacy fallback, never queue v2
// motion on the control channel. The room remains usable.
for (let i = 0; i < 3 && !e.link.legacy; i++) {
  e.channels[e.channels.length - 1].close();
  now += 1100;
  e.link.tick();
}
assert(e.link.legacy);
assert(e.controls.some((m) => m.t === "motionFallback"));
e.link.dispose();
good.link.dispose();
console.log("ALL MOTION LINK CHECKS PASSED");
