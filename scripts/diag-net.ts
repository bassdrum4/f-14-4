// Multiplayer wire-format regression.
//
// The pose packet is the contract between two browsers: if either end packs a
// different field order, the other end flies a garbage aircraft and nothing
// throws. This pins the exact layout, the sequence number, the reject paths,
// and the room/id scheme the mesh relies on to find each other.
//
// Usage: bun scripts/diag-net.ts  (or: bun run test:net)

import {
  Multiplayer,
  POSE_BYTES,
  emptyPose,
  hostPeerId,
  packPose,
  sanitizeName,
  unpackPose,
} from "../src/net/multiplayer";
import {
  FLAG_AB,
  FLAG_FLAPS,
  FLAG_GEAR,
  FLAG_ON_GROUND,
  FLAG_SPEEDBRAKE,
  FLAG_STALLED,
  type RemotePose,
} from "../src/render/remoteJets";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const ALL_FLAGS =
  FLAG_ON_GROUND | FLAG_GEAR | FLAG_FLAPS | FLAG_SPEEDBRAKE | FLAG_STALLED | FLAG_AB;

function samplePose(): RemotePose {
  const p = emptyPose();
  p.x = 1234.5;
  p.y = -800.25;
  p.z = 9001.75;
  p.qx = 0.1;
  p.qy = 0.2;
  p.qz = 0.3;
  p.qw = 0.9273618;
  p.vx = 250.5;
  p.vy = -3.25;
  p.vz = 12.75;
  p.speed = 251.125;
  p.sweepT = 0.5;
  p.flags = ALL_FLAGS;
  return p;
}

// --- 1. a pose survives the round trip ------------------------------------
{
  const src = samplePose();
  const buf = packPose(src, 4242);
  check("a pose packet is exactly POSE_BYTES", buf.byteLength === POSE_BYTES, `${buf.byteLength}`);
  check("POSE_BYTES is the documented 52", POSE_BYTES === 52, `${POSE_BYTES}`);

  const out = emptyPose();
  const seq = unpackPose(buf, out);
  check("the sequence number round-trips", seq === 4242, String(seq));

  // float32 is the storage width, so compare against that precision rather
  // than exact equality for the fields the sim keeps in doubles.
  const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(1e-3, Math.abs(b) * 1e-6);
  check("position round-trips",
    near(out.x, src.x) && near(out.y, src.y) && near(out.z, src.z),
    `${out.x},${out.y},${out.z}`);
  check("velocity round-trips",
    near(out.vx, src.vx) && near(out.vy, src.vy) && near(out.vz, src.vz),
    `${out.vx},${out.vy},${out.vz}`);
  check("the quaternion round-trips",
    near(out.qx, src.qx) && near(out.qy, src.qy) && near(out.qz, src.qz) && near(out.qw, src.qw),
    `${out.qx},${out.qy},${out.qz},${out.qw}`);
  check("rotation stays normalized", Math.abs(Math.hypot(out.qx, out.qy, out.qz, out.qw) - 1) < 1e-4,
    String(Math.hypot(out.qx, out.qy, out.qz, out.qw)));
  check("airspeed round-trips", near(out.speed, src.speed), String(out.speed));
  check("every flag bit survives", out.flags === ALL_FLAGS,
    `${out.flags.toString(2)} vs ${ALL_FLAGS.toString(2)}`);
  // sweepT travels as a byte, so 0..1 quantizes to 1/255 steps.
  check("wing sweep round-trips within one byte step",
    Math.abs(out.sweepT - src.sweepT) <= 1 / 255,
    `${out.sweepT}`);
}

// --- 2. sweep sweep quantization is bounded and monotonic ------------------
{
  let prev = -1;
  let monotonic = true;
  let inRange = true;
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const p = emptyPose();
    p.sweepT = t;
    const out = emptyPose();
    unpackPose(packPose(p, 1), out);
    if (out.sweepT < prev) monotonic = false;
    if (out.sweepT < 0 || out.sweepT > 1) inRange = false;
    prev = out.sweepT;
  }
  check("sweep never decodes outside 0..1", inRange);
  check("sweep decodes monotonically", monotonic);
}

// --- 3. malformed packets are rejected, never half-applied -----------------
{
  const bad = new ArrayBuffer(POSE_BYTES - 4);
  check("a short packet is rejected", unpackPose(bad, emptyPose()) === null);
  check("an oversized packet is rejected", unpackPose(new ArrayBuffer(POSE_BYTES + 8), emptyPose()) === null);

  const wrongMagic = packPose(samplePose(), 7);
  new DataView(wrongMagic).setUint16(46, 0x1234);
  const out = emptyPose();
  out.x = 42;
  check("a packet without our magic is rejected", unpackPose(wrongMagic, out) === null);
  check("a rejected packet leaves the target untouched", out.x === 42, String(out.x));

  // a zeroed buffer is the honest worst case: right length, no magic
  check("an all-zero buffer is rejected", unpackPose(new ArrayBuffer(POSE_BYTES), emptyPose()) === null);
}

// --- 4. ids: the host is the only predictable one --------------------------
{
  check("host id is deterministic", hostPeerId("TOMCAT") === hostPeerId("tomcat"), hostPeerId("TOMCAT"));
  check("host id is a valid lowercase signalling id",
    /^[a-z0-9-]+$/.test(hostPeerId("Alpha-9")), hostPeerId("Alpha-9"));
  check("different rooms get different host ids", hostPeerId("ALPHA") !== hostPeerId("BRAVO"));
  check("room codes longer than 10 are truncated into one id",
    hostPeerId("ABCDEFGHIJKLMNOP") === hostPeerId("ABCDEFGHIJ"), hostPeerId("ABCDEFGHIJKLMNOP"));
  check("punctuation is stripped from the room code",
    hostPeerId("a!b@c#") === hostPeerId("abc"), hostPeerId("a!b@c#"));
  check("an empty room still yields a usable id", /^[a-z0-9-]+$/.test(hostPeerId("")), hostPeerId(""));
}

// --- 5. callsigns are safe to put on the wire and in a sprite --------------
{
  check("a callsign is trimmed and stripped", sanitizeName("  Viper!!  ") === "Viper", sanitizeName("  Viper!!  "));
  check("an empty callsign falls back to PILOT", sanitizeName("   ") === "PILOT", sanitizeName("   "));
  check("a callsign is capped at 12 characters", sanitizeName("ABCDEFGHIJKLMNOPQRST") === "ABCDEFGHIJKL",
    sanitizeName("ABCDEFGHIJKLMNOPQRST"));
  check("spaces and hyphens survive inside a callsign", sanitizeName("Maverick-1") === "Maverick-1",
    sanitizeName("Maverick-1"));
}

// --- 6. a fresh session is idle and costs nothing -------------------------
{
  const net = new Multiplayer();
  const s = net.snapshot;
  check("a new session is idle", s.status === "idle", s.status);
  check("a new session has an empty roster", s.pilots.length === 0, String(s.pilots.length));
  check("a new session is not online", !net.online);
  check("a new session is not the host", !net.isHost);
  check("a new session reports no traffic", s.sent === 0 && s.recv === 0, `${s.sent}/${s.recv}`);
  net.dispose();
  check("disposing an idle session is safe", true);
}

console.log(failures === 0 ? "\nALL NETWORK CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
