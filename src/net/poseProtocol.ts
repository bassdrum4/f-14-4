import type { RemotePose } from "../render/remoteJets";
/** Bytes per pose packet. */
export const POSE_BYTES = 52;
/** Marks a buffer as ours; a stray or truncated packet is dropped. */
const MAGIC = 0xf14a;

/**
 * Pack a pose into 52 network-order bytes:
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
  const p = emptyPose();
  p.x = v.getFloat32(0);
  p.y = v.getFloat32(4);
  p.z = v.getFloat32(8);
  p.vx = v.getFloat32(12);
  p.vy = v.getFloat32(16);
  p.vz = v.getFloat32(20);
  p.qx = v.getFloat32(24);
  p.qy = v.getFloat32(28);
  p.qz = v.getFloat32(32);
  p.qw = v.getFloat32(36);
  p.speed = v.getFloat32(40);
  p.sweepT = v.getUint8(44) / 255;
  p.flags = v.getUint8(45);
  if (!validPose(p)) return null;
  Object.assign(out, p);
  return v.getUint32(48);
}

function clampByte(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : Math.round(n);
}

/** A blank pose, for the local builder and for decode targets. */
export function emptyPose(): RemotePose {
  return {
    x: 0,
    y: 0,
    z: 0,
    qx: 0,
    qy: 0,
    qz: 0,
    qw: 1,
    vx: 0,
    vy: 0,
    vz: 0,
    speed: 0,
    sweepT: 0,
    flags: 0,
  };
}

/** Version 2 keeps the legacy prefix, then adds a monotonic timestamp, epoch,
 * bounded acceleration/angular velocity and actual animated surface positions.
 * Network byte order matches the historical DataView packet (big endian).
 * Only capability-negotiated motion channels carry this extension. */
export const MOTION_BYTES = 80;
export function packMotion(p: RemotePose, seq: number): ArrayBuffer {
  const buf = new ArrayBuffer(MOTION_BYTES);
  new Uint8Array(buf).set(new Uint8Array(packPose(p, seq)));
  const v = new DataView(buf);
  v.setFloat64(52, p.sentAt ?? 0);
  v.setUint32(60, p.epoch ?? 0);
  const fields = [p.ax, p.ay, p.az, p.wx, p.wy, p.wz];
  for (let i = 0; i < 6; i++)
    v.setInt16(
      64 + i * 2,
      Math.round(
        Math.max(
          -32767,
          Math.min(32767, (fields[i] ?? 0) * (i < 3 ? 100 : 1000)),
        ),
      ),
    );
  v.setUint8(76, clampByte((p.gearT ?? (p.flags & 2 ? 1 : 0)) * 255));
  v.setUint8(77, clampByte((p.flapT ?? (p.flags & 4 ? 1 : 0)) * 255));
  v.setUint8(78, clampByte((p.abLevel ?? (p.flags & 32 ? 1 : 0)) * 255));
  v.setUint8(79, p.held ? 1 : 0);
  return buf;
}
export function unpackMotion(buf: ArrayBuffer, out: RemotePose): number | null {
  if (buf.byteLength !== MOTION_BYTES) return null;
  const p = emptyPose(),
    seq = unpackPose(buf.slice(0, POSE_BYTES), p);
  if (seq === null) return null;
  const v = new DataView(buf),
    time = v.getFloat64(52);
  if (!Number.isFinite(time) || time < 0 || time > 1e12 || v.getUint8(79) > 1)
    return null;
  p.sentAt = time;
  p.epoch = v.getUint32(60);
  p.ax = v.getInt16(64) / 100;
  p.ay = v.getInt16(66) / 100;
  p.az = v.getInt16(68) / 100;
  p.wx = v.getInt16(70) / 1000;
  p.wy = v.getInt16(72) / 1000;
  p.wz = v.getInt16(74) / 1000;
  p.gearT = v.getUint8(76) / 255;
  p.flapT = v.getUint8(77) / 255;
  p.abLevel = v.getUint8(78) / 255;
  p.held = v.getUint8(79) !== 0;
  Object.assign(out, p);
  return seq;
}
function validPose(p: RemotePose): boolean {
  if (
    ![p.x, p.y, p.z, p.vx, p.vy, p.vz, p.qx, p.qy, p.qz, p.qw, p.speed].every(
      Number.isFinite,
    )
  )
    return false;
  const q = Math.hypot(p.qx, p.qy, p.qz, p.qw);
  return (
    Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)) <= 2e7 &&
    Math.hypot(p.vx, p.vy, p.vz) <= 2500 &&
    p.speed >= 0 &&
    p.speed <= 3000 &&
    q >= 0.5 &&
    q <= 1.5
  );
}
