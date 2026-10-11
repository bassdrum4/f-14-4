import type { BattleAction, BattleSnapshot, BattleShot, BattleMissiles } from "./versus";
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
// Send rate is decoupled from the render loop, but not from the pose: `publish()`
// is called every frame with the local aircraft, and the moment that pose is
// newer than the one on the wire it goes out (see flushPose) — bounded by a
// ~30 Hz floor and a ~80 Hz guard for a hard manoeuvre, so a 144 Hz display
// cannot flood the link but a jink never waits for a tick. A 15 Hz heartbeat
// still sends whatever the last pose was, which is what keeps a page with no
// animation frames (a hidden tab) and the headless flow harness in step.
// Poses carry velocity, and the renderer (../render/remoteJets.ts) draws each
// wingman at "now": their newest packet carried forward by the one-way delay
// measured from the peer connection's own RTT, with corrections eased in.
//
// The fight rides the same channel: the host's snapshot goes on every other
// heartbeat beat, and on a frame flush when the fight has changed and its own
// floor allows, so a mirroring wingman sees the bandits move at the pace the
// host is flying them rather than at the heartbeat.
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
import { DEFAULT_AIRCRAFT, isAircraftId } from "../sim/aircraft";
import type { MissionKind } from "../sim/flight";
import { setLinkDelayMs, type RemotePose } from "../render/remoteJets";
import type { CarrierStatus, EnemySnapshot } from "../sim/dogfight";
import type { MissionMode } from "../settings";

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

/** One radio transmission, as the lobby chat log sees it. */
export interface ChatMsg {
  from: string;
  text: string;
}

export interface NetHandlers {
  onState?: (s: NetState) => void;
  /** A pilot we have not seen before (or one who changed airframe). */
  onPilot?: (id: string, name: string, aircraft: AircraftId) => void;
  onPilotLeave?: (id: string) => void;
  onPose?: (id: string, pose: RemotePose) => void;
  /** A wingman started a sortie; everyone still in the lobby is invited along. */
  onLaunch?: (mission: MissionKind, carrier: number) => void;
  /** The room's fight, streamed by the host. */
  onEnemies?: (snap: EnemySnapshot) => void;
  /** The room's mission profile changed — the host is the one who set it. */
  onMode?: (mode: MissionMode) => void;
  /** A wingman's rounds landed on an enemy the host owns. */
  onHit?: (id: number, dmg: number) => void;
  /** A wingman's weapon landed on the hostile boat. */
  onCarrierHit?: (dmg: number) => void;
  /** A pilot spoke on the room's radio. */
  onChat?: (msg: ChatMsg) => void;
  /** One-way delay measured on one pilot's link, in ms. */
  onLinkDelay?: (id: string, ms: number) => void;
  onBattleAction?: (sender: string, action: BattleAction) => void;
  onBattleState?: (snapshot: BattleSnapshot) => void;
  onBattleShot?: (sender: string, shot: BattleShot) => void;
  onBattleMissiles?: (sender: string, snapshot: BattleMissiles) => void;
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

// ---------------------------------------------------------------------------
// Enemy stream (the host-authoritative fight)
// ---------------------------------------------------------------------------
//
// The enemies are not simulated on every machine: one pilot — the room host —
// runs the hostile carrier and its bandits and broadcasts them, and everyone
// else flies in that fight. Sending a second packet per pose tick would be
// wasted traffic, so the fight goes out every other tick (~7.5 Hz) down the same
// channel and the receiver leads each packet slightly and eases onto every
// correction (see sim/dogfight.ts). That keeps a bandit crossing at 250 m/s
// smooth with no jitter buffer, which is the least lag this can be done with.
// Damage travels the other way as a rare JSON message, so a wingman's kill
// still lands on the pilot who owns the aircraft.

/** Marks an enemy snapshot, at both ends of the buffer. */
const ENEMY_MAGIC = 0xf14b;
/** Bytes per bandit on the wire. */
const ENEMY_STRIDE = 40;
/** Header (28 B) + tail (2 B). */
const ENEMY_FIXED = 28 + 2;
/** Most bandits a wave holds; a packet never grows past this. */
const ENEMY_MAX = 12;

const CARRIER_STATUS: CarrierStatus[] = ["closing", "on station", "sinking", "sunk"];

/**
 * Pack the fight: header, the boat (when there is one), then every bandit as
 * position, orientation, hull and id — little-endian floats, like a pose.
 *
 *   0  u16 magic          8  f32 carrier x     28  bandits, 40 B each:
 *   2  u8  boat present  12  f32 carrier z        0 f32 x, y, z
 *   3  u8  bandit count  16  f32 carrier hdg     12 f32 qx, qy, qz, qw
 *   4  u16 wave          20  f32 carrier hull    28 f32 hull
 *   6  u16 seq           24  u8  boat status     32 u16 id, 34 u8 on deck
 *                       last 2 bytes: magic
 */
export function packEnemies(snap: EnemySnapshot, seq: number): ArrayBuffer {
  const n = Math.min(snap.bandits.length, ENEMY_MAX);
  const buf = new ArrayBuffer(ENEMY_FIXED + n * ENEMY_STRIDE);
  const v = new DataView(buf);
  v.setUint16(0, ENEMY_MAGIC);
  v.setUint8(2, snap.carrier ? 1 : 0);
  v.setUint8(3, n);
  v.setUint16(4, snap.wave & 0xffff);
  v.setUint16(6, seq & 0xffff);
  const c = snap.carrier;
  if (c) {
    v.setFloat32(8, c.x);
    v.setFloat32(12, c.z);
    v.setFloat32(16, c.headingDeg);
    v.setFloat32(20, c.hp);
    v.setUint8(24, Math.max(0, CARRIER_STATUS.indexOf(c.status)));
  }
  let o = 28;
  for (let i = 0; i < n; i++, o += ENEMY_STRIDE) {
    const b = snap.bandits[i];
    v.setFloat32(o, b.x);
    v.setFloat32(o + 4, b.y);
    v.setFloat32(o + 8, b.z);
    v.setFloat32(o + 12, b.qx);
    v.setFloat32(o + 16, b.qy);
    v.setFloat32(o + 20, b.qz);
    v.setFloat32(o + 24, b.qw);
    v.setFloat32(o + 28, b.hp);
    v.setUint16(o + 32, b.id & 0xffff);
    v.setUint8(o + 34, b.onDeck ? 1 : 0);
  }
  v.setUint16(o, ENEMY_MAGIC);
  return buf;
}

/** Decode an enemy snapshot, or null when the payload is not one. */
export function unpackEnemies(buf: ArrayBuffer): EnemySnapshot | null {
  if (buf.byteLength < ENEMY_FIXED) return null;
  const v = new DataView(buf);
  if (v.getUint16(0) !== ENEMY_MAGIC) return null;
  const n = v.getUint8(3);
  // The sender never puts more than ENEMY_MAX bandits on the wire. Without
  // this ceiling a peer could claim 255 and have the host build 255 aircraft.
  if (n > ENEMY_MAX) return null;
  // A pose packet is 52 bytes, which no enemy packet can be: the sizes are
  // exact, so the two formats cannot be confused for one another.
  if (buf.byteLength !== ENEMY_FIXED + n * ENEMY_STRIDE) return null;
  if (v.getUint16(buf.byteLength - 2) !== ENEMY_MAGIC) return null;
  const snap: EnemySnapshot = { carrier: null, bandits: [], wave: v.getUint16(4) };
  if ((v.getUint8(2) & 1) !== 0) {
    snap.carrier = {
      x: v.getFloat32(8),
      z: v.getFloat32(12),
      headingDeg: v.getFloat32(16),
      hp: v.getFloat32(20),
      status: CARRIER_STATUS[v.getUint8(24)] ?? "closing",
    };
  }
  let o = 28;
  for (let i = 0; i < n; i++, o += ENEMY_STRIDE) {
    snap.bandits.push({
      id: v.getUint16(o + 32),
      x: v.getFloat32(o),
      y: v.getFloat32(o + 4),
      z: v.getFloat32(o + 8),
      qx: v.getFloat32(o + 12),
      qy: v.getFloat32(o + 16),
      qz: v.getFloat32(o + 20),
      qw: v.getFloat32(o + 24),
      hp: v.getFloat32(o + 28),
      onDeck: (v.getUint8(o + 34) & 1) !== 0,
    });
  }
  return snap;
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
  owner?: string; // stable pilot identity behind a promoted host's room alias
  name: string;
  aircraft: AircraftId;
  host: boolean;
}

type Control =
  | { t: "hello"; name: string; aircraft: AircraftId; mode: MissionMode; owner?: string }
  | { t: "roster"; peers: RosterEntry[]; mode: MissionMode }
  | { t: "join"; peer: RosterEntry }
  | { t: "bye"; id: string }
  | { t: "name"; name: string; aircraft: AircraftId }
  | { t: "mode"; mode: MissionMode }
  | { t: "host" }
  | { t: "hit"; id: number; dmg: number }
  | { t: "cvhit"; dmg: number }
  | { t: "battleAction"; action: BattleAction }
  | { t: "battleState"; snapshot: BattleSnapshot }
  | { t: "battleShot"; shot: BattleShot }
  | { t: "battleMissiles"; snapshot: BattleMissiles }
  | { t: "launch"; mission: MissionKind; carrier: number }
  | { t: "chat"; from: string; text: string };

// ---------------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------------

/** Pose sends per second on the heartbeat. A timer is the fallback rate, not
 *  the flying rate: the frame flush below is what carries the pose in flight,
 *  and this keeps a page with no animation frames (a hidden tab, the headless
 *  flow harness) in step. Cheap enough that a full mesh stays trivial. */
export const SEND_HZ = 15;
const SEND_INTERVAL_MS = 1000 / SEND_HZ;
/** Fastest the frame flush may repeat, in ms: the sustained rate while flying
 *  is ~30 Hz instead of the old fixed 15 Hz. */
const FLUSH_MIN_GAP_MS = 1000 / 30;
/** A hard manoeuvre may send at 60 Hz; ordinary flight stays near 30 Hz. */
const BURST_MIN_GAP_MS = 1000 / 60;
/** Unexpected movement relative to the previous velocity, rather than distance
 *  travelled. At 300 m/s ordinary cruise used to trigger a burst every frame. */
const BURST_POS_M = 6;
const BURST_SPEED_MS = 18;
const BURST_SWEEP = 0.06;
/** Floor between fight snapshots on the fast path (the heartbeat sends them on
 *  every other beat whatever happens). */
/** Beat-to-beat the fight rides half the poses (7.5 Hz); a frame flush that
 *  finds the fight dirty carries it at once (up to the flush rate). Gating that
 *  by the clock would silence the fight on any page whose timers are throttled
 *  or virtualised, so this is a beat count, not a time. */
const ENEMY_BEATS = 2;
/** How long a dialed link may sit unanswered before we give up on it. */
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
/** Longest the host may go without repeating an unchanged scoreboard. */
const BATTLE_REFRESH_MS = 2000;

const ICE_DEFAULT: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

// ---------------------------------------------------------------------------

function sanitizeRoom(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  return s || "TOMCAT";
}

export function sanitizeName(raw: unknown): string {
  const s = (typeof raw === "string" ? raw : "").trim().replace(/[^\w .\-]/g, "").slice(0, 12);
  return s || "PILOT";
}

/**
 * Only an airframe this build actually has. The `aircraft` field arrives from
 * the other end and is handed straight to the mesh builder, so an id nobody
 * ships has to collapse to a known one rather than be believed.
 */
export function sanitizeAircraft(raw: unknown): AircraftId {
  return isAircraftId(raw) ? raw : DEFAULT_AIRCRAFT;
}

/** Longest chat line the wire will carry; anything past it is cut. */
export const CHAT_MAX = 160;

/**
 * A chat line: collapse the runs of blank lines, then strip the remaining
 * control characters (real newlines survive both), and cut it at the cap.
 * Emptiness is the caller's decision — the sender drops it, a receiver still
 * hears it as silence.
 */
export function sanitizeChat(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/\s*\n\s*/g, "\n")
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, CHAT_MAX);
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
  /**
   * The connection that may issue host-only commands: the room's predictable
   * peer id, plus whoever we accepted a takeover from after the host left.
   * Nothing else can promote itself, however loudly its packet claims to.
   */
  private hostAuthority: string | null = null;
  /** A lost host link is being re-dialled; at most one attempt in flight. */
  private redialPending = false;
  private room = "";
  private selfId = "";
  private name = "PILOT";
  private aircraft: AircraftId = DEFAULT_AIRCRAFT;
  /** The room's mission profile. The host owns it; everyone else follows. */
  private mode: MissionMode = "cruise";
  private status: NetStatus = "idle";
  private error: string | undefined;
  /**
   * Host: the last scoreboard actually put on the wire, as its JSON. The
   * head-to-head scoreboard used to be re-broadcast ten times a second whether
   * or not a single number had changed — the heaviest message in the room, on
   * the same reliable channel as the poses. See publishBattle.
   */
  private battleCache: string | null = null;
  private battleSentAt = 0;
  /** Host: the newest fight state, picked up by every other sender tick. */
  private enemy: EnemySnapshot | null = null;
  private enemySeq = 0;
  private enemyFlip = false;

  /** Live data links, keyed by the remote peer id. */
  private conns = new Map<string, DataConnection>();
  private missileWire: string | null = null;
  private missileSent = new WeakMap<DataConnection, string>();
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
  /** True once a frame flush has put a pose on the wire since the last beat.
   *  Tracked as a flag, not by comparing clocks: a throttled, virtualised or
   *  coarse timer must never be able to silence the link entirely. */
  private sentSinceBeat = false;

  // --- fast path state ----------------------------------------------------
  /** A pose written by publish() that has not gone on the wire yet. */
  private poseDirty = false;
  /** When the last pose packet left, and what was in it. */
  private lastSendAt = 0;
  private lastSentX = 0;
  private lastSentY = 0;
  private lastSentZ = 0;
  private lastSentVX = 0;
  private lastSentVY = 0;
  private lastSentVZ = 0;
  private lastSentQX = 0;
  private lastSentQY = 0;
  private lastSentQZ = 0;
  private lastSentQW = 1;
  private lastSentSpeed = 0;
  private lastSentSweep = 0;
  private lastSentFlags = 0;
  /** The fight: when it last went out, and whether it has moved since. */
  /** Beats since the fight last went out (see ENEMY_BEATS). */
  private enemySinceBeat = ENEMY_BEATS;
  private enemyDirty = false;
  /** One-way delay estimate for the receivers, from the link's own RTT. */
  private rttMs = 0;
  private rttPolledAt = 0;
  private rttPending = false;
  /** Which link the next RTT poll will look at; walks the whole mesh. */
  private rttCursor = 0;

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
          id: p.owner ?? p.id,
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

  /**
   * May this connection speak with the room's authority? The predictable peer
   * id always may; after a takeover, whoever we accepted the handover from may
   * too. Nothing else does — `launch`, `mode` and `battleState` all hang off
   * this, which is what stops a joiner force-starting a mission for the room.
   */
  private isHostConn(conn: DataConnection): boolean {
    return conn.peer === this.hostAuthority || conn.peer === hostPeerId(this.room);
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
    this.enemy = null;
    this.enemySeq = 0;
    this.status = "connecting";
    this.emit();

    // A predictable 4-char tail keeps ids unique without a directory service.
    const id = asHost ? hostPeerId(this.room) : `f14sim-${idSlug(this.room)}-${randomSuffix()}`;
    this.selfId = id;
    this.hostAuthority = asHost ? id : null;

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
    this.missileWire = null;
    this.missileSent = new WeakMap();
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
    this.hostAuthority = null;
    this.redialPending = false;
    this.battleCache = null;
    this.sent = 0;
    this.recv = 0;
    this.sentWindow = [];
    this.tickCount = 0;
    this.poseDirty = false;
    this.lastSendAt = 0;
    this.enemySinceBeat = ENEMY_BEATS;
    this.enemyDirty = false;
    this.rttMs = 0;
    this.rttPolledAt = 0;
    this.rttPending = false;
    this.rttCursor = 0;
    this.seq = 0;
    this.hostRetries = 0;
    this.enemy = null;
    this.enemySeq = 0;
    this.enemyFlip = false;
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
      // While other wingmen are still linked this is a lost link to one
      // peer, not a missing room — say so, and don't contradict the message
      // that was just shown for the host leaving.
      this.error = this.conns.size > 0
        ? "The room host is not answering — wingmen already linked still fly."
        : "No room with that code — check it, or open the room yourself.";
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
      this.sendAll(JSON.stringify({ t: "host" } satisfies Control));
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

  /**
   * Re-establish a link to the room's host after it dropped. Only ever one
   * attempt in flight, and never once we have taken the room over ourselves —
   * the dial itself is `dialHost`, which already retries a host the broker has
   * not finished registering.
   */
  private scheduleHostRedial(): void {
    if (this.host || this.hostDuty || this.redialPending || this.status !== "online") return;
    const id = hostPeerId(this.room);
    if (this.conns.has(id) || this.dialing.has(id)) return;
    this.redialPending = true;
    this.hostRetries = 0;
    window.setTimeout(() => {
      this.redialPending = false;
      if (this.status !== "online" || this.host || this.hostDuty) return;
      if (this.conns.has(hostPeerId(this.room)) || this.dialing.has(hostPeerId(this.room))) return;
      this.error = "Reconnecting to the room host…";
      this.emit();
      this.dialHost();
    }, HOST_RETRY_MS);
  }

  /** Dial a peer. `known` is the roster entry when we already have one. */
  private dial(id: string, known: RosterEntry | null): void {
    if (!this.peer || this.peer.destroyed) return;
    if (this.conns.has(id) || this.dialing.has(id) || id === this.selfId) return;
    // The room's host is not one more pilot. A roster at its ceiling must
    // never be the reason a pilot cannot reach (or re-reach) the room's door —
    // which is exactly what happened to a full room re-dialling a lost host.
    if (id !== hostPeerId(this.room) && this.pilots.size + 1 >= MAX_PILOTS) return;
    this.dialing.add(id);
    let conn: DataConnection;
    try {
      conn = this.peer.connect(id, {
        serialization: "binary",
        // Combat and room controls share this reliable channel. Motion sends
        // respect backpressure so old poses cannot keep enlarging its queue.
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
      // A fresh channel starts its own sequence, so any remembered "newest"
      // from a previous link to this pilot must not drop it. The next published
      // pose flushes at once and, when we run the fight, it goes too: a
      // reconnected wingman is back in the room's state on the next frame rather
      // than on the next heartbeat.
      this.lastSeq.delete(conn.peer);
      this.lastSendAt = 0;
      this.enemyDirty = true;
      // The room's host is whoever answers on the predictable id, and a brand
      // new link has none of the room's state cached yet.
      if (conn.peer === hostPeerId(this.room)) this.hostAuthority = conn.peer;
      this.battleCache = null;
      // Announce ourselves. The host answers with the roster; a mesh peer
      // already knows us from the roster it got earlier.
      this.send(conn, {
        t: "hello",
        name: this.name,
        aircraft: this.aircraft,
        mode: this.mode,
        owner: this.selfId,
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
      // JSON.parse will happily hand back a string, a number or null; none of
      // those have a `t`, and reading one would throw out of the data handler.
      if (typeof msg !== "object" || msg === null || typeof msg.t !== "string") return;
      this.onControl(conn, msg);
      return;
    }
    const buf = toArrayBuffer(data);
    if (!buf) return;
    const pose = emptyPose();
    const seq = unpackPose(buf, pose);
    if (seq === null) {
      // Not a pose: the other binary format on this channel is the fight.
      const snap = unpackEnemies(buf);
      if (snap) this.handlers.onEnemies?.(snap);
      return;
    }
    const prev = this.lastSeq.get(conn.peer);
    if (prev !== undefined && seq <= prev) return; // reordered or duplicated
    this.lastSeq.set(conn.peer, seq);
    this.recv++;
    this.handlers.onPose?.(this.pilots.get(conn.peer)?.owner ?? conn.peer, pose);
  }

  private onControl(conn: DataConnection, msg: Control): void {
    switch (msg.t) {
      case "hello": {
        const entry: RosterEntry = {
          id: conn.peer,
          owner: conn.peer === hostPeerId(this.room) && typeof msg.owner === "string" && msg.owner.startsWith(`f14sim-${idSlug(this.room)}-`) ? msg.owner : undefined,
          name: sanitizeName(msg.name),
          aircraft: sanitizeAircraft(msg.aircraft),
          // The room host is the only predictable peer id, so the connection
          // decides this and the packet never can: hello used to carry a
          // `host: true` claim, and believing it let any joiner declare itself
          // host — then force-launch the room, rewrite its mission profile and
          // fabricate its head-to-head scoreboard.
          host: this.isHostConn(conn),
        };
        const known = this.pilots.has(conn.peer);
        if (!this.adopt(conn.peer, entry)) break;
        if (this.host || this.hostDuty) {
          // Tell the newcomer who else is here, and everyone else about them.
          // The room's mission profile rides the roster: a pilot joining an
          // attack room flies the attack, not whatever they last flew solo.
          const roster: RosterEntry[] = [
            { id: this.rosterId(), owner: this.selfId, name: this.name, aircraft: this.aircraft, host: true },
            ...this.pilots.values(),
          ].filter((p) => p.id !== conn.peer);
          this.send(conn, { t: "roster", peers: roster, mode: this.mode } satisfies Control);
          for (const other of this.conns.values()) {
            if (other === conn || !other.open) continue;
            this.send(other, { t: "join", peer: entry } satisfies Control);
          }
        } else {
          // Someone else is hosting: their profile is the room's.
          this.adoptMode(msg.mode);
        }
        if (!known) this.emit();
        break;
      }
      case "roster": {
        // Only the room's host hands out a roster. Taking one from any other
        // wingman let a stranger file arbitrary pilots — and a bogus host — on
        // ours, and (through the dial tie-break below) make us dial ids of
        // their choosing. `msg.peers` is also checked: a scalar or an absent
        // array used to throw straight out of the data handler.
        if (!this.isHostConn(conn) || !Array.isArray(msg.peers)) break;
        this.adoptMode(msg.mode);
        for (const entry of msg.peers) {
          if (!entry || typeof entry.id !== "string" || entry.id === this.selfId) continue;
          const known = this.pilots.has(entry.id);
          if (!this.adopt(entry.id, entry)) break;
          // Deterministic tie-break so both ends do not dial each other.
          if (!entry.host && !this.conns.has(entry.id) && this.selfId < entry.id) {
            this.dial(entry.id, entry);
          }
          if (!known) this.emit();
        }
        break;
      }
      case "join": {
        // Same rule as `roster`: the host introduces pilots, nobody else.
        const entry = msg.peer;
        if (!this.isHostConn(conn)) break;
        if (!entry || typeof entry.id !== "string" || entry.id === this.selfId) break;
        const known = this.pilots.has(entry.id);
        if (!this.adopt(entry.id, entry)) break;
        if (!this.conns.has(entry.id) && this.selfId < entry.id) this.dial(entry.id, entry);
        if (!known) this.emit();
        break;
      }
      case "host": {
        const candidate = [this.selfId, ...this.pilots.keys()].sort()[0];
        const liveHost = [...this.pilots.values()].some(p => p.host && this.conns.get(p.id)?.open);
        if (!this.host && !liveHost && conn.peer === candidate) {
          // Record who now speaks for the room, so their launch/mode/battle
          // commands are accepted on the connections we already have.
          this.hostAuthority = conn.peer;
          for (const p of this.pilots.values()) p.host = p.id === conn.peer;
          this.emit();
        }
        break;
      }
      case "launch":
        // Host-only, and the boat has to be a real number: a non-numeric
        // carrier reached the sim as NaN, which put the spawn on no boat at
        // all instead of being dropped.
        if (!this.isHostConn(conn)) break;
        if (msg.mission !== "carrier" && msg.mission !== "airfield") break;
        if (!Number.isFinite(msg.carrier)) break;
        this.handlers.onLaunch?.(msg.mission, Math.trunc(msg.carrier));
        break;
      case "mode":
        if (this.isHostConn(conn)) this.adoptMode(msg.mode);
        break;
      case "battleShot": {
        const shot = msg.shot;
        if (
          this.pilots.has(conn.peer) && shot &&
          (shot.weapon === "gun" || shot.weapon === "missile" || shot.weapon === "flare") &&
          Number.isSafeInteger(shot.seq) && shot.seq >= 0 &&
          Number.isSafeInteger(shot.life) && shot.life >= 0 &&
          Number.isSafeInteger(shot.match) && shot.match >= 0 &&
          Array.isArray(shot.pos) && shot.pos.length === 3 &&
          Array.isArray(shot.vel) && shot.vel.length === 3 &&
          shot.pos.every(v => Number.isFinite(v) && Math.abs(v) <= 1e7) &&
          shot.vel.every(v => Number.isFinite(v) && Math.abs(v) <= 2000)
        ) this.handlers.onBattleShot?.(this.pilots.get(conn.peer)?.owner ?? conn.peer, shot);
        break;
      }
      case "battleMissiles": {
        const s = msg.snapshot;
        if (this.pilots.has(conn.peer) && s && Number.isSafeInteger(s.match) && Number.isSafeInteger(s.life) && Number.isSafeInteger(s.seq) &&
          Array.isArray(s.missiles) && s.missiles.length <= 32 && s.missiles.every(m => m && Number.isSafeInteger(m.id) &&
            Number.isFinite(m.age) && m.age >= 0 && m.age <= 26 && (m.target === null || typeof m.target === "string") &&
            Array.isArray(m.pos) && m.pos.length === 3 && m.pos.every(Number.isFinite) &&
            Array.isArray(m.vel) && m.vel.length === 3 && m.vel.every(Number.isFinite))) {
          this.handlers.onBattleMissiles?.(this.pilots.get(conn.peer)?.owner ?? conn.peer, s);
        }
        break;
      }
      case "battleAction":
        if (this.host && this.pilots.has(conn.peer) && msg.action && typeof msg.action === "object") this.handlers.onBattleAction?.(conn.peer, msg.action);
        break;
      case "battleState":
        // The scoreboard is the host's to publish. Field-by-field validation
        // then happens in the engine, which is where the numbers are used.
        if (
          !this.host &&
          this.isHostConn(conn) &&
          msg.snapshot &&
          Number.isFinite(msg.snapshot.match) &&
          Array.isArray(msg.snapshot.pilots) &&
          msg.snapshot.pilots.length <= 32
        ) this.handlers.onBattleState?.(msg.snapshot);
        break;
      case "hit":
        // Damage claims are only accepted from a pilot on the roster, and only
        // as a real positive number: a NaN or a negative used to poison the
        // bandit's hull (an unkillable bandit) or heal it.
        if (
          this.pilots.has(conn.peer) &&
          Number.isInteger(msg.id) &&
          Number.isFinite(msg.dmg) &&
          msg.dmg > 0
        ) {
          this.handlers.onHit?.(msg.id, msg.dmg);
        }
        break;
      case "cvhit":
        if (this.pilots.has(conn.peer) && Number.isFinite(msg.dmg) && msg.dmg > 0) {
          this.handlers.onCarrierHit?.(msg.dmg);
        }
        break;
      case "bye": {
        // A pilot may retire only its own connection. The host also relays
        // other pilots' departures: that packet names the wingman, and must
        // never be read as the host itself leaving. A promoted host's direct
        // goodbye uses its owner id instead of its public connection id.
        let id = conn.peer;
        if (this.isHostConn(conn) && msg.id !== conn.peer && msg.id !== this.pilots.get(conn.peer)?.owner) {
          if (typeof msg.id !== "string" || !this.pilots.has(msg.id)) break;
          id = msg.id;
        }
        this.drop(id, false);
        break;
      }
      case "chat": {
        const text = sanitizeChat(msg.text);
        // The callsign comes from the roster, not the packet, so nobody can
        // speak for another pilot on the radio.
        if (text) {
          const pilot = this.pilots.get(conn.peer);
          this.handlers.onChat?.({ from: pilot ? pilot.name : sanitizeName(msg.from), text });
        }
        break;
      }
      case "name":
        if (this.pilots.has(conn.peer) && typeof msg.name === "string") {
          const p = this.pilots.get(conn.peer)!;
          p.name = sanitizeName(msg.name);
          p.aircraft = sanitizeAircraft(msg.aircraft);
          this.handlers.onPilot?.(p.owner ?? conn.peer, p.name, p.aircraft);
          this.emit();
        }
        break;
      default:
        break;
    }
  }

  /**
   * Adopt the room's mission profile. The host is the one who decides it, so a
   * host never takes a mode off the wire; everyone else follows the moment a
   * hello, a roster or a mode change says so.
   */
  private adoptMode(mode: MissionMode | undefined): void {
    if (!mode || this.host) return;
    if (mode !== "cruise" && mode !== "dogfight" && mode !== "strike" && mode !== "versus") return;
    if (mode === this.mode) return;
    this.mode = mode;
    this.handlers.onMode?.(mode);
  }

  /** Record a pilot. False when the room is already at its ceiling. */
  private adopt(id: string, entry: RosterEntry): boolean {
    if (id === this.selfId) return true;
    const prev = this.pilots.get(id);
    // A room has a hard cap (MAX_PILOTS). `roster`, `join` and `hello` all
    // reach this, so a peer that kept announcing pilots used to grow the map
    // without bound; the new ones stop at the ceiling.
    if (!prev && this.pilots.size >= MAX_PILOTS) return false;
    const next: RosterEntry = { ...entry, id };
    this.pilots.set(id, next);
    // The renderer only needs to hear about a pilot it has not built a mesh
    // for yet, or one whose callsign/airframe actually changed.
    const changed = !prev || prev.name !== next.name || prev.aircraft !== next.aircraft || prev.owner !== next.owner;
    if (prev && prev.owner !== next.owner) this.handlers.onPilotLeave?.(prev.owner ?? id);
    if (changed) this.handlers.onPilot?.(next.owner ?? id, next.name, next.aircraft);
    return true;
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
    const departing = this.pilots.get(id);
    const had = this.pilots.delete(id);
    if (this.hostAuthority === id) this.hostAuthority = null;
    const wasHost = id === hostPeerId(this.room) || departing?.host === true;
    if (wasHost && this.status === "online") {
      this.error = "The room host left. You are still linked to the others.";
      // Somebody has to answer the room's door; see maybePromote().
      this.maybePromote();
      // ...and somebody has to re-establish the link if nobody did: a NAT
      // timeout kills one WebRTC path and leaves the rest of the mesh fine,
      // and without this that pilot loses the fight stream for the session.
      this.scheduleHostRedial();
    }
    if (had) {
      this.handlers.onPilotLeave?.(departing?.owner ?? id);
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

  /**
   * Set the room's mission profile. Only the host does this — which is exactly
   * what stops two pilots flying "attack" and "peaceful" at each other.
   */
  setMode(mode: MissionMode): void {
    if (mode === this.mode) return;
    this.mode = mode;
    this.sendAll(JSON.stringify({ t: "mode", mode } satisfies Control));
  }

  /**
   * Host: hand the fight to the room. Nothing is sent here — the sender picks
   * the newest state up on its own schedule (see tick) and the frame flush
   * carries it sooner when the fight has moved (see flushPose).
   */
  publishEnemies(snap: EnemySnapshot | null): void {
    this.enemy = snap;
    if (snap) this.enemyDirty = true;
  }

  sendBattleShot(shot: BattleShot): void { this.sendAll(JSON.stringify({ t: "battleShot", shot } satisfies Control)); }
  sendBattleMissiles(snapshot: BattleMissiles): void {
    this.missileWire = JSON.stringify({ t: "battleMissiles", snapshot } satisfies Control);
    this.flushBattleMissiles();
  }

  private flushBattleMissiles(): void {
    const wire = this.missileWire;
    if (!wire) return;
    for (const conn of this.conns.values()) {
      if (!conn.open || this.missileSent.get(conn) === wire) continue;
      if ((conn.dataChannel?.bufferedAmount ?? 0) > 2048 || ((conn as DataConnection & { bufferSize?: number }).bufferSize ?? 0) > 8) continue;
      try { conn.send(wire); this.missileSent.set(conn, wire); } catch { /* retry newest state on the next heartbeat */ }
    }
  }

  sendBattleAction(action: BattleAction): void {
    if (this.host) this.handlers.onBattleAction?.(this.selfId, action);
    else this.sendAll(JSON.stringify({ t: "battleAction", action } satisfies Control));
  }

  /**
   * Host: publish the head-to-head scoreboard. Unchanged frames are skipped —
   * between fights a room of twelve used to push ~200 kB/s of identical JSON
   * down the same reliable channel the poses ride, which is exactly the
   * traffic that makes motion late. A refresh every BATTLE_REFRESH_MS keeps a
   * rejoining pilot from waiting on a state that never changes, and a new
   * link invalidates the cache outright (see attach).
   */
  publishBattle(snapshot: BattleSnapshot): void {
    if (!this.host) return;
    const wire = JSON.stringify({ t: "battleState", snapshot } satisfies Control);
    const now = performance.now();
    if (wire === this.battleCache && now - this.battleSentAt < BATTLE_REFRESH_MS) return;
    this.battleCache = wire;
    this.battleSentAt = now;
    this.sendAll(wire);
  }

  /** Mirror: our rounds landed on an aircraft the host owns. */
  hitBandit(id: number, dmg: number): void {
    this.sendAll(JSON.stringify({ t: "hit", id, dmg } satisfies Control));
  }

  /** Mirror: our weapon landed on the hostile boat. */
  hitCarrier(dmg: number): void {
    this.sendAll(JSON.stringify({ t: "cvhit", dmg } satisfies Control));
  }

  /**
   * Say something on the room's radio. The mesh is full, so this is one fan-out
   * of a small JSON string on the same channel the lobby traffic already uses —
   * every pilot hears it directly, nobody relays for anyone.
   */
  sendChat(text: string): void {
    const msg = sanitizeChat(text);
    if (!msg) return;
    this.sendAll(JSON.stringify({ t: "chat", from: this.name, text: msg } satisfies Control));
  }

  /** Our own callsign, so the chat log can mark our own transmissions. */
  get callsign(): string {
    return this.name;
  }

  private sendAll(msg: string): void {
    for (const conn of this.conns.values()) {
      if (!conn.open) continue;
      try {
        conn.send(msg);
      } catch {
        /* channel is being torn down; the close handler will clean up */
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
   * Called every frame with the local aircraft's state. The pose is recorded and
   * then pushed at once if the wire has been quiet for the floor (see
   * flushPose): the network rate still does not follow the display refresh rate,
   * but it no longer waits for the heartbeat either, which is the difference
   * between a wingman drawn where he is and one drawn a tick behind.
   */
  publish(pose: RemotePose): void {
    const p = this.pose;
    p.x = pose.x; p.y = pose.y; p.z = pose.z;
    p.qx = pose.qx; p.qy = pose.qy; p.qz = pose.qz; p.qw = pose.qw;
    p.vx = pose.vx; p.vy = pose.vy; p.vz = pose.vz;
    p.speed = pose.speed;
    p.sweepT = pose.sweepT;
    p.flags = pose.flags;
    this.poseDirty = true;
    this.flushPose();
  }

  /**
   * The frame wrote a newer pose: send it unless the wire is still warm. A hard
   * change (a jink, a cat shot, a switch moving) may skip the floor down to the
   * burst guard, so the far end hears about it on this frame, not the next tick.
   */
  private flushPose(): void {
    if (!this.poseDirty || this.status !== "online" || this.conns.size === 0) return;
    const now = performance.now();
    const since = now - this.lastSendAt;
    const dt = since / 1000;
    const rotationDot = Math.abs(this.pose.qx * this.lastSentQX + this.pose.qy * this.lastSentQY + this.pose.qz * this.lastSentQZ + this.pose.qw * this.lastSentQW);
    const big =
      Math.abs(this.pose.x - this.lastSentX - this.lastSentVX * dt) +
        Math.abs(this.pose.y - this.lastSentY - this.lastSentVY * dt) +
        Math.abs(this.pose.z - this.lastSentZ - this.lastSentVZ * dt) >
        BURST_POS_M ||
      rotationDot < Math.cos(2.5 * Math.PI / 180) ||
      Math.abs(this.pose.speed - this.lastSentSpeed) > BURST_SPEED_MS ||
      Math.abs(this.pose.sweepT - this.lastSentSweep) > BURST_SWEEP ||
      this.pose.flags !== this.lastSentFlags;
    if (since < (big ? BURST_MIN_GAP_MS : FLUSH_MIN_GAP_MS)) return;
    this.sendPose(now, this.enemyDirty);
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

  /**
   * The heartbeat: a pose every SEND_INTERVAL_MS whatever else happens, so a
   * page that produces no frames still reports itself, plus the fight on every
   * other beat. In flight the flush above is the faster path; this is the floor
   * under it.
   */
  private tick = (): void => {
    this.flushBattleMissiles();
    if (this.status !== "online" || this.conns.size === 0) return;
    // A hidden tab is throttled to ~1 Hz by the browser; zeroing velocity makes
    // the wingman hold position instead of extrapolating off into the sunset.
    if (this.hidden) {
      this.pose.vx = 0;
      this.pose.vy = 0;
      this.pose.vz = 0;
    }
    this.enemyFlip = !this.enemyFlip;
    const now = performance.now();
    // The beat carries a pose unless a frame flush already did since the last
    // one. In flight the flushes are the fast path and this is only the floor
    // under them; on a page that produces no frames (a hidden tab, a headless
    // harness) it is the whole sender, so it must never be skipped on a guess
    // about how much real time has passed.
    if (!this.sentSinceBeat) this.sendPose(now, this.enemyFlip);
    this.sentSinceBeat = false;
    // The link already measures its own RTT; read it for the receivers' lead.
    this.pollRtt(now);
  };

  /**
   * Put the newest pose on the wire, now, optionally with the fight behind it.
   * Both the heartbeat and the frame flush end up here so the tallies, the
   * sequence number and the "what we last sent" record cannot drift apart.
   */
  private sendPose(now: number, withEnemy: boolean): boolean {
    let enemyBuf: ArrayBuffer | null = null;
    if (withEnemy && this.enemy && ++this.enemySinceBeat >= ENEMY_BEATS) {
      enemyBuf = packEnemies(this.enemy, ++this.enemySeq);
    }
    const buf = packPose(this.pose, ++this.seq);
    let any = false;
    for (const conn of this.conns.values()) {
      if (!conn.open) continue;
      // Poses supersede older poses. Do not pile stale motion behind a slow
      // channel's reliable combat/control messages; send the newest on drain.
      const channel = conn.dataChannel;
      const queued = (conn as DataConnection & { bufferSize?: number }).bufferSize ?? 0;
      if ((channel?.bufferedAmount ?? 0) > 2048 || queued > 8) continue;
      try {
        conn.send(buf);
        if (enemyBuf) conn.send(enemyBuf);
        any = true;
      } catch {
        /* channel is being torn down; the close handler will clean up */
      }
    }
    if (!any) return false;
    // Retire the fight only now that a wingman has it. Clearing it before the
    // loop meant a backpressured link silently swallowed a whole snapshot and
    // the bandits sat still until the next two beats.
    if (enemyBuf) {
      this.enemyDirty = false;
      this.enemySinceBeat = 0;
    }
    this.poseDirty = false;
    this.sentSinceBeat = true;
    this.lastSendAt = now;
    this.lastSentX = this.pose.x;
    this.lastSentY = this.pose.y;
    this.lastSentZ = this.pose.z;
    this.lastSentVX = this.pose.vx;
    this.lastSentVY = this.pose.vy;
    this.lastSentVZ = this.pose.vz;
    this.lastSentQX = this.pose.qx;
    this.lastSentQY = this.pose.qy;
    this.lastSentQZ = this.pose.qz;
    this.lastSentQW = this.pose.qw;
    this.lastSentSpeed = this.pose.speed;
    this.lastSentSweep = this.pose.sweepT;
    this.lastSentFlags = this.pose.flags;
    this.sent++;
    this.sentWindow.push(now);
    if (this.sentWindow.length > 240) this.sentWindow.splice(0, this.sentWindow.length - 240);
    // The send rate and packet tallies are only interesting while they move, so
    // republish them roughly once a second rather than on every packet.
    if (++this.tickCount >= SEND_HZ) {
      this.tickCount = 0;
      this.emit();
    }
    return true;
  }

  /**
   * Read the data link's own round-trip time off the peer connection. The
   * browser measures it already, so this adds no traffic at all — the flow
   * harness's mock links simply have no stats and are skipped. Half of it is the
   * one-way delay the renderer leads every remote by.
   */
  private pollRtt(now: number): void {
    if (this.rttPending || now - this.rttPolledAt < 1000) return;
    this.rttPolledAt = now;
    const ids = [...this.conns.keys()];
    if (ids.length === 0) return;
    this.rttCursor %= ids.length;
    // Rotate. The first link used to be the only one ever measured, so one
    // peer's delay was applied to every wingman in the room — a 200 ms pilot
    // dragged a 20 ms one a fifth of a second into the past.
    const start = this.rttCursor;
    for (let i = 0; i < ids.length; i++) {
      const idx = (start + i) % ids.length;
      const id = ids[idx];
      const conn = this.conns.get(id);
      if (!conn || !conn.open) continue;
      const pc = (conn as unknown as { peerConnection?: RTCPeerConnection }).peerConnection;
      if (!pc || typeof pc.getStats !== "function") continue;
      this.rttCursor = (idx + 1) % ids.length;
      this.rttPending = true;
      const owner = this.pilots.get(id)?.owner ?? id;
      pc.getStats().then(
        (report) => {
          let best = 0;
          report.forEach((stat) => {
            const r = stat as { currentRoundTripTime?: number };
            const v = r.currentRoundTripTime;
            if (typeof v === "number" && Number.isFinite(v) && v > best) best = v;
          });
          if (best > 0) {
            this.rttMs = best * 1000;
            const oneWay = this.rttMs / 2;
            // The global is the fallback for a wingman we have not measured
            // yet; the per-peer value is what that wingman is drawn on.
            setLinkDelayMs(oneWay);
            this.handlers.onLinkDelay?.(owner, oneWay);
          }
          this.rttPending = false;
        },
        () => {
          this.rttPending = false;
        },
      );
      return;
    }
  }

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
