// Multiplayer over WebRTC data channels.
//
// There is no hosted server. Two browsers meet through the PeerJS signalling
// broker, agree on an ICE path, and then talk directly: aircraft state rides a
// binary ArrayBuffer on the data channel. It is built into the browser, so
// this costs nothing to run.
//
// Topology: one peer opens the room and registers a predictable id
// (`f14sim-<room>-h`). Everyone else dials that id. The host keeps the roster,
// and once a new pilot is announced every peer dials every *other* peer by id,
// so the pose stream is a full mesh rather than relayed through the host. The
// host can then leave without breaking the formation.
//
// The wire format is deliberately not JSON: a pose is 52 bytes of little-endian
// floats packed with a DataView (see `packPose`). Control traffic — hello,
// roster, join, launch, goodbye — is a small JSON string, which is fine because
// it happens a handful of times per session. BinaryPack (the default
// data-channel serialization) carries both, so the receiver only has to check
// whether the payload is a string or an ArrayBuffer.
//
// The world is not sent at all. The room code determines it (see
// sim/world.ts's worldSeedForRoom), so two pilots who type the same code build
// the same islands on their own machines: no terrain payload, no seed handover,
// and nothing about the world on the wire at any point.
//
// Send rate is decoupled from the render loop: `publish()` is called every
// frame and only records the latest pose; a 15 Hz timer does the sending, so a
// 144 Hz display does not put 144 packets a second on the wire. Poses carry
// velocity, and the renderer (../render/remoteJets.ts) interpolates ~110 ms
// behind the newest packet and extrapolates along that velocity when one is
// late, which is what keeps a wingman crossing at Mach 1 from stuttering.
//
// Background tabs: rAF and setInterval both throttle to ~1 Hz when the page is
// hidden. Rather than let a hidden pilot's aircraft keep flying on stale
// velocity, the sender keeps firing but zeroes the velocity, so the wingman
// parks in place instead of ghosting off across the map.
//
// Configuration (optional — the public broker works out of the box):
//   VITE_PEER_HOST / VITE_PEER_PORT / VITE_PEER_PATH / VITE_PEER_KEY / VITE_PEER_SECURE
//   VITE_PEER_ICE   — JSON array of RTCIceServer (add a TURN server for strict NATs)

import { Peer, type DataConnection } from "peerjs";
import type { AircraftId } from "../sim/aircraft";
import { DEFAULT_AIRCRAFT } from "../sim/aircraft";
import type { MissionKind } from "../sim/flight";
import type { RemotePose } from "../render/remoteJets";

export type NetStatus = "idle" | "connecting" | "online" | "error";

/** A pilot on the roster, as the UI sees them. */
export interface NetPilot {
  id: string;
  name: string;
  aircraft: AircraftId;
  host: boolean;
  /** True once we have a live data link to them. */
  linked: boolean;
}

export interface NetState {
  status: NetStatus;
  room: string;
  /** Our own signalling id. */
  self: string;
  /** We opened this room. */
  host: boolean;
  pilots: NetPilot[];
  /** Packets sent per second, averaged over the last second. */
  hz: number;
  /** Poses sent since the session opened. */
  sent: number;
  /** Poses received since the session opened. */
  recv: number;
  error?: string;
}

export interface NetHandlers {
  onState?: (s: NetState) => void;
  /** A pilot we have not seen before (or one who changed airframe). */
  onPilot?: (id: string, name: string, aircraft: AircraftId) => void;
  onPilotLeave?: (id: string) => void;
  onPose?: (id: string, pose: RemotePose) => void;
  /** A wingman started a sortie; everyone still in the lobby is invited along. */
  onLaunch?: (mission: MissionKind, carrier: number) => void;
}

/**
 * How a signalling peer is constructed. The default is PeerJS itself; headless
 * tests inject a mock broker so the whole join sequence can be replayed without
 * a network (scripts/diag-mp-flow.ts).
 */
export type PeerFactory = (id: string, options?: ConstructorParameters<typeof Peer>[1]) => Peer;

// ---------------------------------------------------------------------------
// Wire format
// ---------------------------------------------------------------------------

/** Bytes per pose packet. */
export const POSE_BYTES = 52;
/** Marks a buffer as ours; a stray or truncated packet is dropped. */
const MAGIC = 0xf14a;

/**
 * Pack a pose into 52 little-endian bytes:
 *   0  f32 x, y, z         12
 *  12  f32 vx, vy, vz      24
 *  24  f32 qx, qy, qz, qw  40
 *  40  f32 speed           44
 *  44  u8  sweepT (0..255) 45
 *  45  u8  flags           46
 *  46  u16 magic           48
 *  48  u32 sequence        52
 */
export function packPose(p: RemotePose, seq: number): ArrayBuffer {
  const buf = new ArrayBuffer(POSE_BYTES);
  const v = new DataView(buf);
  v.setFloat32(0, p.x);
  v.setFloat32(4, p.y);
  v.setFloat32(8, p.z);
  v.setFloat32(12, p.vx);
  v.setFloat32(16, p.vy);
  v.setFloat32(20, p.vz);
  v.setFloat32(24, p.qx);
  v.setFloat32(28, p.qy);
  v.setFloat32(32, p.qz);
  v.setFloat32(36, p.qw);
  v.setFloat32(40, p.speed);
  v.setUint8(44, clampByte(p.sweepT * 255));
  v.setUint8(45, p.flags & 0xff);
  v.setUint16(46, MAGIC);
  v.setUint32(48, seq >>> 0);
  return buf;
}

/**
 * Decode a pose packet. Returns the sequence number and fills `out` with a
 * fresh pose, or returns null when the payload is not a valid packet.
 */
export function unpackPose(buf: ArrayBuffer, out: RemotePose): number | null {
  if (buf.byteLength !== POSE_BYTES) return null;
  const v = new DataView(buf);
  if (v.getUint16(46) !== MAGIC) return null;
  out.x = v.getFloat32(0);
  out.y = v.getFloat32(4);
  out.z = v.getFloat32(8);
  out.vx = v.getFloat32(12);
  out.vy = v.getFloat32(16);
  out.vz = v.getFloat32(20);
  out.qx = v.getFloat32(24);
  out.qy = v.getFloat32(28);
  out.qz = v.getFloat32(32);
  out.qw = v.getFloat32(36);
  out.speed = v.getFloat32(40);
  out.sweepT = v.getUint8(44) / 255;
  out.flags = v.getUint8(45);
  return v.getUint32(48);
}

function clampByte(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : Math.round(n);
}

/** A blank pose, for the local builder and for decode targets. */
export function emptyPose(): RemotePose {
  return {
    x: 0, y: 0, z: 0,
    qx: 0, qy: 0, qz: 0, qw: 1,
    vx: 0, vy: 0, vz: 0,
    speed: 0, sweepT: 0, flags: 0,
  };
}

/** Normalise whatever the data channel hands us into an ArrayBuffer. */
function toArrayBuffer(data: unknown): ArrayBuffer | null {
  if (data instanceof ArrayBuffer) return data;
  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView;
    return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Control messages (JSON — a handful per session, so size does not matter)
// ---------------------------------------------------------------------------

interface RosterEntry {
  id: string;
  name: string;
  aircraft: AircraftId;
  host: boolean;
}

type Control =
  | { t: "hello"; name: string; aircraft: AircraftId; host: boolean }
  | { t: "roster"; peers: RosterEntry[] }
  | { t: "join"; peer: RosterEntry }
  | { t: "bye"; id: string }
  | { t: "name"; name: string; aircraft: AircraftId }
  | { t: "launch"; mission: MissionKind; carrier: number };

// ---------------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------------

/** Pose sends per second. 15 Hz is the sweet spot for a jet sim: fast enough
 *  that interpolation hides the gaps at fighter speeds, cheap enough that a
 *  full mesh stays trivial on a home uplink. */
export const SEND_HZ = 15;
const SEND_INTERVAL_MS = 1000 / SEND_HZ;
/** How long a dialled link may sit un-answered before we give up on it. */
const HANDSHAKE_TIMEOUT_MS = 8000;
/**
 * Dialling the host can fail simply because the host's own peer has not finished
 * registering with the broker yet — the two pilots clicking "open" and "join" a
 * few seconds apart is the normal case, not the exception. Retry a handful of
 * times (with a growing gap) before declaring the room missing.
 */
const HOST_DIAL_RETRIES = 4;
const HOST_RETRY_MS = 1200;
/** Cap on the mesh, so a public room code cannot invite a mob. */
const MAX_PILOTS = 12;

const ICE_DEFAULT: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

// ---------------------------------------------------------------------------

function sanitizeRoom(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  return s || "TOMCAT";
}

export function sanitizeName(raw: string): string {
  const s = raw.trim().replace(/[^\w .\-]/g, "").slice(0, 12);
  return s || "PILOT";
}

/**
 * A 6-character tail for a client id. It is padded rather than left to chance
 * because `toString(36)` can come back short (trailing zeroes are dropped) and
 * a one-character tail could collide with the host's `-h`.
 */
function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8).padEnd(6, "0");
}

/** PeerJS ids must be plain: alphanumerics, `-` and `_`. */
function idSlug(room: string): string {
  return sanitizeRoom(room).toLowerCase();
}

/** The room's host id — the only predictable id in the scheme. */
export function hostPeerId(room: string): string {
  return `f14sim-${idSlug(room)}-h`;
}

function iceServers(): RTCIceServer[] {
  const raw = import.meta.env.VITE_PEER_ICE as string | undefined;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as RTCIceServer[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
      /* bad override — fall through to the public STUN server */
    }
  }
  return ICE_DEFAULT;
}

function peerOptions(): ConstructorParameters<typeof Peer>[1] {
  const host = import.meta.env.VITE_PEER_HOST as string | undefined;
  const port = import.meta.env.VITE_PEER_PORT as string | undefined;
  const opts: ConstructorParameters<typeof Peer>[1] = { config: { iceServers: iceServers() } };
  if (host) {
    opts.host = host;
    opts.port = port ? Number(port) : 443;
    opts.path = (import.meta.env.VITE_PEER_PATH as string | undefined) ?? "/";
    opts.secure = (import.meta.env.VITE_PEER_SECURE as string | undefined) !== "false";
    const key = import.meta.env.VITE_PEER_KEY as string | undefined;
    if (key) opts.key = key;
  }
  return opts;
}

// ---------------------------------------------------------------------------

export class Multiplayer {
  private handlers: NetHandlers;
  private peer: Peer | null = null;
  /**
   * A second signalling peer, used only when a room's host leaves and this pilot
   * takes over the room's predictable id so newcomers can still find a way in.
   * The primary peer (and every data channel on it) is never touched.
   */
  private hostDuty: Peer | null = null;
  private hostRetries = 0;
  private host = false;
  private room = "";
  private selfId = "";
  private name = "PILOT";
  private aircraft: AircraftId = DEFAULT_AIRCRAFT;
  private status: NetStatus = "idle";
  private error: string | undefined;

  /** Live data links, keyed by the remote peer id. */
  private conns = new Map<string, DataConnection>();
  /** Outbound dials in flight, so we do not dial the same pilot twice. */
  private dialing = new Set<string>();
  /** The roster: everyone but us. */
  private pilots = new Map<string, RosterEntry>();
  /** Newest sequence number seen per pilot, to drop reordered packets. */
  private lastSeq = new Map<string, number>();

  private pose = emptyPose();
  private seq = 0;
  private timer: number | null = null;
  private hidden = false;
  private sent = 0;
  private recv = 0;
  private sentWindow: number[] = [];
  /** Counts sender ticks so the lobby's tallies refresh about once a second. */
  private tickCount = 0;

  constructor(
    handlers: NetHandlers = {},
    private makePeer: PeerFactory = (id, options) => new Peer(id, options),
  ) {
    this.handlers = handlers;
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibility);
    }
  }

  // --- queries ------------------------------------------------------------

  get snapshot(): NetState {
    return {
      status: this.status,
      room: this.room,
      self: this.selfId,
      host: this.host,
      pilots: [...this.pilots.values()]
        .map((p) => ({
          id: p.id,
          name: p.name,
          aircraft: p.aircraft,
          host: p.host,
          linked: this.conns.has(p.id) && this.conns.get(p.id)!.open,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      hz: this.measuredHz(),
      sent: this.sent,
      recv: this.recv,
      error: this.error,
    };
  }

  get online(): boolean {
    return this.status === "online";
  }

  get isHost(): boolean {
    return this.host;
  }

  // --- session ------------------------------------------------------------

  /** Open a room. The name/aircraft are announced to whoever joins later. */
  open(room: string, name: string, aircraft: AircraftId): void {
    this.start(room, name, aircraft, true);
  }

  /** Join an existing room by code. */
  join(room: string, name: string, aircraft: AircraftId): void {
    this.start(room, name, aircraft, false);
  }

  private start(room: string, name: string, aircraft: AircraftId, asHost: boolean): void {
    this.stopSession();
    this.room = sanitizeRoom(room);
    this.name = sanitizeName(name);
    this.aircraft = aircraft;
    this.host = asHost;
    this.error = undefined;
    this.status = "connecting";
    this.emit();

    // A predictable 4-char tail keeps ids unique without a directory service.
    const id = asHost ? hostPeerId(this.room) : `f14sim-${idSlug(this.room)}-${randomSuffix()}`;
    this.selfId = id;

    let peer: Peer;
    try {
      peer = this.makePeer(id, peerOptions());
    } catch (err) {
      this.fail(err);
      return;
    }
    this.peer = peer;

    peer.on("open", (openedId) => {
      this.selfId = openedId;
      this.status = "online";
      this.startSender();
      if (!asHost) this.dialHost();
      this.emit();
    });
    peer.on("connection", (conn) => this.attach(conn, null));
    peer.on("disconnected", () => this.reconnectSignalling(peer));
    peer.on("error", (err) => this.fail(err));
  }

  /** The signalling socket dropped. Existing data channels keep working. */
  private reconnectSignalling(peer: Peer | null): void {
    if (!peer || peer.destroyed) return;
    try {
      peer.reconnect();
    } catch {
      /* give up silently — the channels in flight are unaffected */
    }
  }

  /** Tear the session down; the solo sim keeps flying regardless. */
  leave(): void {
    for (const conn of this.conns.values()) {
      try {
        conn.send(JSON.stringify({ t: "bye", id: this.selfId } satisfies Control));
        conn.close();
      } catch {
        /* already gone */
      }
    }
    this.stopSession();
    this.status = "idle";
    this.error = undefined;
    this.emit();
  }

  /**
   * The id other pilots should know us by. Normally our own signalling id; a
   * promoted host answers as the room's predictable host id instead, because
   * that is the id a newcomer dialled to reach us.
   */
  private rosterId(): string {
    return this.hostDuty ? hostPeerId(this.room) : this.selfId;
  }

  private stopSession(): void {
    this.stopSender();
    if (this.hostDuty) {
      try {
        this.hostDuty.removeAllListeners();
        this.hostDuty.destroy();
      } catch {
        /* ignore */
      }
      this.hostDuty = null;
    }
    for (const conn of this.conns.values()) {
      try {
        conn.close();
      } catch {
        /* ignore */
      }
    }
    this.conns.clear();
    this.dialing.clear();
    this.pilots.clear();
    this.lastSeq.clear();
    if (this.peer) {
      try {
        this.peer.removeAllListeners();
        this.peer.destroy();
      } catch {
        /* ignore */
      }
      this.peer = null;
    }
    this.host = false;
    this.selfId = "";
    this.sent = 0;
    this.recv = 0;
    this.sentWindow = [];
    this.tickCount = 0;
    this.seq = 0;
    this.hostRetries = 0;
  }

  private fail(err: unknown): void {
    const e = err as { type?: string; message?: string } | undefined;
    let msg = e?.message ?? String(err);
    if (e?.type === "unavailable-id") {
      msg = this.host
        ? "That room code is already in use — pick another."
        : "Could not register with the signalling server.";
    } else if (e?.type === "server-error" || e?.type === "socket-error" || e?.type === "network") {
      msg = "Could not reach the matchmaking server. Solo flight still works.";
    } else if (e?.type === "peer-unavailable") {
      // One dial failed — a room that is not open yet, or a pilot who just
      // quit. The session itself is fine, so do not tear it down over this.
      // PeerJS reports the id it could not reach in the message; the dial is
      // also still sitting in `dialing`, which would block a retry.
      const failedId = typeof msg === "string" ? (msg.trim().split(/\s+/).pop() ?? "") : "";
      if (failedId) this.dialing.delete(failedId);
      const hostId = hostPeerId(this.room);
      if (!this.host && failedId === hostId && this.hostRetries < HOST_DIAL_RETRIES) {
        this.hostRetries++;
        this.error = `Looking for room ${this.room}…`;
        this.emit();
        window.setTimeout(() => {
          if (this.status === "online" && !this.conns.has(hostId)) this.dialHost();
        }, HOST_RETRY_MS * this.hostRetries);
        return;
      }
      this.error = "No room with that code — check it, or open the room yourself.";
      this.emit();
      return;
    }
    this.status = "error";
    this.error = msg;
    this.stopSender();
    this.emit();
  }

  // --- roster + mesh ------------------------------------------------------

  private dialHost(): void {
    if (!this.peer) return;
    const id = hostPeerId(this.room);
    if (this.conns.has(id) || this.dialing.has(id)) return;
    this.dial(id, null);
  }

  /**
   * The room's host left. Everyone still linked keeps flying — the mesh is
   * peer-to-peer — but a newcomer has only one predictable id to dial, so the
   * surviving pilot with the lowest signalling id claims the room's host id on a
   * second peer. Exactly one survivor does this, so the id cannot be double
   * booked; if another pilot wins the race, we simply stand down.
   */
  private maybePromote(): void {
    if (this.host || this.hostDuty || this.status !== "online") return;
    const candidates = [this.selfId, ...this.pilots.keys()].sort();
    if (candidates[0] !== this.selfId) return;
    let peer: Peer;
    try {
      peer = this.makePeer(hostPeerId(this.room), peerOptions());
    } catch {
      return;
    }
    this.hostDuty = peer;
    peer.on("open", () => {
      this.host = true;
      this.error = "You are the room host now — new wingmen can join with the same code.";
      this.emit();
    });
    peer.on("connection", (conn) => this.attach(conn, null));
    peer.on("disconnected", () => this.reconnectSignalling(peer));
    peer.on("error", (err) => {
      const e = err as { type?: string } | undefined;
      if (e?.type !== "unavailable-id" && e?.type !== "peer-unavailable") {
        this.error = "Could not take over the room. Wingmen already linked still fly.";
      }
      try {
        peer.removeAllListeners();
        peer.destroy();
      } catch {
        /* ignore */
      }
      if (this.hostDuty === peer) this.hostDuty = null;
      this.host = false;
      this.emit();
    });
  }

  /** Dial a peer. `known` is the roster entry when we already have one. */
  private dial(id: string, known: RosterEntry | null): void {
    if (!this.peer || this.peer.destroyed) return;
    if (this.conns.has(id) || this.dialing.has(id) || id === this.selfId) return;
    if (this.pilots.size + 1 >= MAX_PILOTS) return;
    this.dialing.add(id);
    let conn: DataConnection;
    try {
      conn = this.peer.connect(id, {
        serialization: "binary",
        // Reliable + ordered: a dropped pose would leave the wingman parked,
        // and at ~52 bytes / 15 Hz there is no congestion to trade it for.
        reliable: true,
        metadata: { name: this.name, aircraft: this.aircraft },
      });
    } catch {
      this.dialing.delete(id);
      return;
    }
    if (known) this.adopt(id, known);
    this.attach(conn, known);
    // A dial that never opens must not wedge the mesh.
    window.setTimeout(() => {
      if (!conn.open && !this.conns.has(id)) {
        this.dialing.delete(id);
        conn.close();
      }
    }, HANDSHAKE_TIMEOUT_MS);
  }

  /** Wire up a data connection, inbound or outbound. */
  private attach(conn: DataConnection, known: RosterEntry | null): void {
    conn.on("open", () => {
      this.dialing.delete(conn.peer);
      this.conns.set(conn.peer, conn);
      if (conn.peer === hostPeerId(this.room)) this.hostRetries = 0;
      // Announce ourselves. The host answers with the roster; a mesh peer
      // already knows us from the roster it got earlier.
      this.send(conn, {
        t: "hello",
        name: this.name,
        aircraft: this.aircraft,
        host: this.host || this.hostDuty !== null,
      } satisfies Control);
      if (known) this.adopt(conn.peer, known);
      this.emit();
    });
    conn.on("data", (data) => this.onData(conn, data));
    conn.on("close", () => this.drop(conn.peer, true));
    conn.on("error", () => this.drop(conn.peer, true));
  }

  private onData(conn: DataConnection, data: unknown): void {
    if (typeof data === "string") {
      let msg: Control;
      try {
        msg = JSON.parse(data) as Control;
      } catch {
        return;
      }
      this.onControl(conn, msg);
      return;
    }
    const buf = toArrayBuffer(data);
    if (!buf) return;
    const pose = emptyPose();
    const seq = unpackPose(buf, pose);
    if (seq === null) return;
    const prev = this.lastSeq.get(conn.peer);
    if (prev !== undefined && seq <= prev) return; // reordered or duplicated
    this.lastSeq.set(conn.peer, seq);
    this.recv++;
    this.handlers.onPose?.(conn.peer, pose);
  }

  private onControl(conn: DataConnection, msg: Control): void {
    switch (msg.t) {
      case "hello": {
        const entry: RosterEntry = {
          id: conn.peer,
          name: sanitizeName(msg.name),
          aircraft: msg.aircraft,
          // The room host is the only predictable peer id, and it announces
          // itself here: without this, whoever receives the host's own hello
          // first would file the host on the roster as an ordinary pilot (and
          // the lobby would show the wrong owner for the room).
          host: msg.host === true || conn.peer === hostPeerId(this.room),
        };
        const known = this.pilots.has(conn.peer);
        this.adopt(conn.peer, entry);
        if (this.host || this.hostDuty) {
          // Tell the newcomer who else is here, and everyone else about them.
          const roster: RosterEntry[] = [
            { id: this.rosterId(), name: this.name, aircraft: this.aircraft, host: true },
            ...this.pilots.values(),
          ].filter((p) => p.id !== conn.peer);
          this.send(conn, { t: "roster", peers: roster } satisfies Control);
          for (const other of this.conns.values()) {
            if (other === conn || !other.open) continue;
            this.send(other, { t: "join", peer: entry } satisfies Control);
          }
        }
        if (!known) this.emit();
        break;
      }
      case "roster": {
        for (const entry of msg.peers) {
          if (entry.id === this.selfId) continue;
          const known = this.pilots.has(entry.id);
          this.adopt(entry.id, entry);
          // Deterministic tie-break so both ends do not dial each other.
          if (!entry.host && !this.conns.has(entry.id) && this.selfId < entry.id) {
            this.dial(entry.id, entry);
          }
          if (!known) this.emit();
        }
        break;
      }
      case "join": {
        const entry = msg.peer;
        if (entry.id === this.selfId) break;
        const known = this.pilots.has(entry.id);
        this.adopt(entry.id, entry);
        if (!this.conns.has(entry.id) && this.selfId < entry.id) this.dial(entry.id, entry);
        if (!known) this.emit();
        break;
      }
      case "launch":
        if (msg.mission === "carrier" || msg.mission === "airfield") {
          this.handlers.onLaunch?.(msg.mission, msg.carrier);
        }
        break;
      case "bye":
        if (msg.id) this.drop(msg.id, false);
        break;
      case "name":
        if (this.pilots.has(conn.peer)) {
          const p = this.pilots.get(conn.peer)!;
          p.name = sanitizeName(msg.name);
          p.aircraft = msg.aircraft;
          this.handlers.onPilot?.(conn.peer, p.name, p.aircraft);
          this.emit();
        }
        break;
      default:
        break;
    }
  }

  /** Record a pilot, telling the renderer when they are new or changed. */
  private adopt(id: string, entry: RosterEntry): void {
    if (id === this.selfId) return;
    const prev = this.pilots.get(id);
    const next: RosterEntry = { ...entry, id };
    this.pilots.set(id, next);
    // The renderer only needs to hear about a pilot it has not built a mesh
    // for yet, or one whose callsign/airframe actually changed.
    const changed = !prev || prev.name !== next.name || prev.aircraft !== next.aircraft;
    if (changed) this.handlers.onPilot?.(id, next.name, next.aircraft);
  }

  private drop(id: string, tellHost: boolean): void {
    if (!id) return;
    const conn = this.conns.get(id);
    if (conn) {
      try {
        conn.close();
      } catch {
        /* ignore */
      }
      this.conns.delete(id);
    }
    this.dialing.delete(id);
    this.lastSeq.delete(id);
    const had = this.pilots.delete(id);
    const wasHost = id === hostPeerId(this.room);
    if (wasHost && this.status === "online") {
      this.error = "The room host left. You are still linked to the others.";
      // Somebody has to answer the room's door; see maybePromote().
      this.maybePromote();
    }
    if (had) {
      this.handlers.onPilotLeave?.(id);
      if (this.host && tellHost) {
        const bye = JSON.stringify({ t: "bye", id } satisfies Control);
        for (const other of this.conns.values()) {
          if (other.open) {
            try {
              other.send(bye);
            } catch {
              /* ignore */
            }
          }
        }
      }
    }
    this.emit();
  }

  // --- local pose ---------------------------------------------------------

  /**
   * Announce that we are starting a sortie. The mesh has no referee, so
   * whoever takes off is the one who tells the room which mission and which
   * boat to use; wingmen who are still in the lobby lift off with them.
   */
  launch(mission: MissionKind, carrier: number): void {
    const msg = JSON.stringify({ t: "launch", mission, carrier } satisfies Control);
    for (const conn of this.conns.values()) {
      if (!conn.open) continue;
      try {
        conn.send(msg);
      } catch {
        /* ignore */
      }
    }
  }

  /** Change our callsign; the roster is updated in place. */
  setName(name: string): void {
    this.name = sanitizeName(name);
    const msg = JSON.stringify({ t: "name", name: this.name, aircraft: this.aircraft } satisfies Control);
    for (const conn of this.conns.values()) {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch {
          /* ignore */
        }
      }
    }
    this.emit();
  }

  setAircraft(aircraft: AircraftId): void {
    this.aircraft = aircraft;
    this.setName(this.name);
  }

  /**
   * Called every frame with the local aircraft's state. Nothing is sent here:
   * the newest pose is kept and the 15 Hz sender picks it up. That decouples
   * the network rate from the display refresh rate.
   */
  publish(pose: RemotePose): void {
    const p = this.pose;
    p.x = pose.x; p.y = pose.y; p.z = pose.z;
    p.qx = pose.qx; p.qy = pose.qy; p.qz = pose.qz; p.qw = pose.qw;
    p.vx = pose.vx; p.vy = pose.vy; p.vz = pose.vz;
    p.speed = pose.speed;
    p.sweepT = pose.sweepT;
    p.flags = pose.flags;
  }

  private startSender(): void {
    if (this.timer !== null) return;
    this.timer = window.setInterval(this.tick, SEND_INTERVAL_MS);
  }

  private stopSender(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private tick = (): void => {
    if (this.status !== "online" || this.conns.size === 0) return;
    // A hidden tab is throttled to ~1 Hz by the browser; zeroing velocity makes
    // the wingman hold position instead of extrapolating off into the sunset.
    if (this.hidden) {
      this.pose.vx = 0;
      this.pose.vy = 0;
      this.pose.vz = 0;
    }
    const buf = packPose(this.pose, ++this.seq);
    let any = false;
    for (const conn of this.conns.values()) {
      if (!conn.open) continue;
      try {
        conn.send(buf);
        any = true;
      } catch {
        /* channel is being torn down; the close handler will clean up */
      }
    }
    if (!any) return;
    this.sent++;
    const now = performance.now();
    this.sentWindow.push(now);
    if (this.sentWindow.length > 120) this.sentWindow.splice(0, this.sentWindow.length - 120);
    // The send rate and packet tallies are only interesting while they move, so
    // republish them roughly once a second rather than on every packet.
    if (++this.tickCount >= SEND_HZ) {
      this.tickCount = 0;
      this.emit();
    }
  };

  private measuredHz(): number {
    const now = performance.now();
    let n = 0;
    for (let i = this.sentWindow.length - 1; i >= 0; i--) {
      if (now - this.sentWindow[i] <= 1000) n++;
      else break;
    }
    return n;
  }

  private onVisibility = (): void => {
    this.hidden = document.hidden;
    // Send one packet straight away so the change is felt immediately rather
    // than after the throttled interval.
    this.tick();
  };

  // --- misc ---------------------------------------------------------------

  private send(conn: DataConnection, msg: Control): void {
    if (!conn.open) return;
    try {
      conn.send(JSON.stringify(msg));
    } catch {
      /* ignore */
    }
  }

  private emit(): void {
    this.handlers.onState?.(this.snapshot);
  }

  dispose(): void {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
    this.stopSession();
    this.status = "idle";
  }
}
