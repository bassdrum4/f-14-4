import type { DataConnection } from "peerjs";
import type { RemotePose } from "../render/remoteJets";
import { emptyPose, packMotion, unpackMotion } from "./poseProtocol";
import { limitMotion, sequenceNewer } from "./motion";

export type MotionControl =
  | { t: "motionReady"; generation: number; ack: number }
  | { t: "motionFallback" }
  | { t: "netPing"; at: number }
  | { t: "netPong"; at: number; received: number; sent: number };

/** One motion stream on the PeerJS-owned PC. Explicit negotiation is essential:
 * PeerJS 1.5.x installs ondatachannel and would adopt a second in-band channel
 * as its own primary data channel. ID 32 is reserved by our v2 hello contract;
 * PeerJS's single DCEP channel occupies 0 or 1 on this dedicated connection. */
export class MotionLink {
  readonly metrics = {
    transport: "legacy" as "legacy" | "motion" | "waiting",
    rttMs: 50,
    jitterMs: 0,
    loss: 0,
    receiveHz: 0,
    queueBytes: 0,
    skipped: 0,
    sentBytes: 0,
    received: 0,
    reordered: 0,
    clockOffsetMs: 0,
  };
  private channel: RTCDataChannel | null = null;
  private enabled = false;
  private remoteReady = false;
  private generation = 0;
  private remoteGeneration = 0;
  private disposed = false;
  private retryAt = 0;
  private createdAt = 0;
  private retries = 0;
  private seq = 0;
  private newest: number | undefined;
  private sequenceSpan = 0;
  private seen = new Set<number>();
  private sourceAt = NaN;
  private arrivalAt = NaN;
  private rateAt = 0;
  private rateCount = 0;
  private pingAt = -Infinity;
  private pendingPing: number | null = null;
  private offset = NaN;
  private targetOffset = NaN;
  private bestRtt = Infinity;
  private bestAt = 0;

  constructor(
    readonly conn: DataConnection,
    private onPose: (p: RemotePose) => void,
    private now = () => performance.now(),
  ) {}

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.metrics.transport = "waiting";
    this.openChannel();
  }

  private sendControl(msg: MotionControl): void {
    if (this.disposed || !this.conn.open) return;
    try {
      this.conn.send(JSON.stringify(msg));
    } catch {
      /* link is closing */
    }
  }

  private openChannel(): void {
    if (this.disposed || this.channel || this.now() < this.retryAt) return;
    const pc = this.conn.peerConnection;
    if (!pc || typeof pc.createDataChannel !== "function") {
      this.fallback();
      return;
    }
    if (this.retries >= 3) {
      this.fallback();
      return;
    }
    this.retries++;
    try {
      const dc = pc.createDataChannel("f14-motion-v2", {
        negotiated: true,
        id: 32,
        ordered: false,
        maxRetransmits: 0,
        protocol: "f14-motion-v2",
      });
      this.channel = dc;
      this.createdAt = this.now();
      this.remoteReady = false;
      this.generation++;
      dc.binaryType = "arraybuffer";
      dc.onmessage = (e) => {
        if (
          !this.disposed &&
          this.channel === dc &&
          e.data instanceof ArrayBuffer
        )
          this.receive(e.data);
      };
      dc.onopen = () => {
        if (this.channel === dc) this.sendReady();
      };
      dc.onclose = () => {
        if (this.channel !== dc) return;
        this.channel = null;
        this.remoteReady = false;
        this.metrics.transport = "waiting";
        this.retryAt = this.now() + 1000;
      };
      dc.onerror = () => {
        try {
          dc.close();
        } catch {
          /* already closed */
        }
      };
      this.sendReady(); // peer may send only once this channel exists
    } catch {
      this.retryAt = this.now() + 2000;
    }
  }

  private sendReady(): void {
    this.sendControl({
      t: "motionReady",
      generation: this.generation,
      ack: this.remoteGeneration,
    });
  }

  control(msg: MotionControl): void {
    if (!this.enabled || this.disposed) return;
    const now = this.now();
    if (msg.t === "motionFallback") {
      this.fallback(false);
      return;
    }
    if (msg.t === "motionReady") {
      if (
        !Number.isSafeInteger(msg.generation) ||
        msg.generation < 1 ||
        !Number.isSafeInteger(msg.ack) ||
        msg.ack < 0 ||
        msg.generation < this.remoteGeneration
      )
        return;
      const changed = msg.generation !== this.remoteGeneration;
      this.remoteGeneration = msg.generation;
      this.remoteReady = msg.ack === this.generation;
      if (this.channel && (changed || !this.remoteReady)) this.sendReady();
      return;
    }
    if (msg.t === "netPing") {
      if (Number.isFinite(msg.at) && msg.at >= 0)
        this.sendControl({
          t: "netPong",
          at: msg.at,
          received: now,
          sent: this.now(),
        });
      return;
    }
    if (
      msg.at !== this.pendingPing ||
      ![msg.at, msg.received, msg.sent].every(Number.isFinite) ||
      msg.sent < msg.received
    )
      return;
    this.pendingPing = null;
    const rtt = now - msg.at - (msg.sent - msg.received);
    if (rtt < 0 || rtt > 2000) return;
    this.observeRtt(rtt);
    // NTP's minimum-delay sample avoids mistaking queueing for clock skew.
    // Expire the minimum so route changes eventually get a new baseline.
    if (rtt < this.bestRtt || now - this.bestAt > 15000) {
      this.bestRtt = rtt;
      this.bestAt = now;
      this.targetOffset = (msg.at - msg.received + (now - msg.sent)) / 2;
    }
  }

  observeRtt(ms: number): void {
    if (Number.isFinite(ms) && ms >= 0 && ms <= 2000)
      this.metrics.rttMs += (ms - this.metrics.rttMs) * 0.25;
  }

  tick(): void {
    if (!this.enabled || this.disposed) return;
    const now = this.now();
    this.openChannel();
    if (
      this.channel?.readyState === "connecting" &&
      now - this.createdAt > 5000
    )
      this.channel.close();
    if (
      now - this.pingAt >= 2000 &&
      (this.conn.dataChannel?.bufferedAmount ?? 0) < 1024
    ) {
      this.pendingPing = now;
      this.pingAt = now;
      this.sendControl({ t: "netPing", at: now });
    }
    const span = now - this.rateAt;
    if (span >= 1000) {
      this.metrics.receiveHz = (this.rateCount * 1000) / span;
      this.rateAt = now;
      this.rateCount = 0;
    }
  }

  private lastWireAt = -Infinity;
  send(p: RemotePose, maxHz = 60): boolean {
    const dc = this.channel;
    if (!dc || dc.readyState !== "open" || !this.remoteReady) return false;
    const now = this.now();
    // Congestion on one peer never slows the rest of the mesh. High measured
    // loss suppresses optional bursts, while cruise remains at 30 Hz.
    if (
      now - this.lastWireAt + 0.5 <
      1000 / Math.min(maxHz, this.metrics.loss > 0.08 ? 30 : 60)
    )
      return false;
    this.metrics.queueBytes = dc.bufferedAmount;
    // Never enter PeerJS's serializer queue or allow more than one pose of
    // pending motion. Dropped updates are replaced by publish's newest pose.
    if (dc.bufferedAmount > 0) {
      this.metrics.skipped++;
      return false;
    }
    try {
      const buf = packMotion(p, ++this.seq);
      dc.send(buf);
      this.lastWireAt = now;
      this.metrics.sentBytes += buf.byteLength;
      this.metrics.transport = "motion";
      return true;
    } catch {
      return false;
    }
  }

  /** Legacy fallback only for peers that did not negotiate v2. Modern peers
   * wait/recover instead of leaking poses back into the reliable queue. */
  get legacy(): boolean {
    return !this.enabled;
  }

  private receive(buf: ArrayBuffer): void {
    const p = emptyPose(),
      seq = unpackMotion(buf, p),
      arrival = this.now();
    if (seq === null || this.seen.has(seq)) return;
    if (this.newest !== undefined && !sequenceNewer(seq, this.newest)) {
      if ((this.newest - seq) >>> 0 >= 128) return;
      this.metrics.reordered++;
    } else {
      this.sequenceSpan = Math.min(
        128,
        this.sequenceSpan +
          (this.newest === undefined ? 1 : (seq - this.newest) >>> 0),
      );
      this.newest = seq;
    }
    this.seen.add(seq);
    for (const n of this.seen)
      if ((this.newest! - n) >>> 0 >= 128) this.seen.delete(n);
    const expected = this.sequenceSpan;
    this.metrics.loss = Math.max(0, 1 - this.seen.size / expected);
    if (!Number.isFinite(this.offset))
      this.offset = Number.isFinite(this.targetOffset)
        ? this.targetOffset
        : arrival - p.sentAt! - this.metrics.rttMs / 2;
    if (Number.isFinite(this.targetOffset))
      this.offset += Math.max(-1, Math.min(1, this.targetOffset - this.offset));
    p.sampleAt = p.sentAt! + this.offset;
    this.metrics.clockOffsetMs = this.offset;
    if (p.sampleAt > arrival + 250 || p.sampleAt < arrival - 5000) return;
    if (p.sentAt! > this.sourceAt || !Number.isFinite(this.sourceAt)) {
      if (Number.isFinite(this.sourceAt)) {
        const variation = Math.abs(
          arrival - this.arrivalAt - (p.sentAt! - this.sourceAt),
        );
        this.metrics.jitterMs += (variation - this.metrics.jitterMs) / 16;
      }
      this.sourceAt = p.sentAt!;
      this.arrivalAt = arrival;
    }
    this.rateCount++;
    this.metrics.received++;
    limitMotion(p);
    this.onPose(p);
  }

  private fallback(announce = true): void {
    if (announce) this.sendControl({ t: "motionFallback" });
    this.enabled = false;
    this.metrics.transport = "legacy";
    const dc = this.channel;
    this.channel = null;
    if (dc) {
      dc.onopen = dc.onmessage = dc.onclose = dc.onerror = null;
      try {
        dc.close();
      } catch {
        /* already closed */
      }
    }
  }

  dispose(): void {
    this.disposed = true;
    const dc = this.channel;
    this.channel = null;
    if (dc) {
      dc.onopen = dc.onmessage = dc.onclose = dc.onerror = null;
      try {
        dc.close();
      } catch {
        /* already closed */
      }
    }
    this.seen.clear();
  }
}
