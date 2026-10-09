// Headless verification of the shared fight: one pilot (the room host) runs the
// hostile carrier and its bandits and streams them, and every other pilot flies
// inside that fight rather than starting one of their own.
//
// What this pins down:
//   1. the host's snapshot really describes its fight (boat pose + hull, every
//      bandit's pose, hull, id and deck state),
//   2. a mirroring client puts those aircraft exactly where the host says, and
//      flies them from the packets alone — no local AI steering and no local
//      wave ever appears on a wingman's machine,
//   3. a bandit the host no longer lists disappears from the mirror,
//   4. the boat's hull, state and existence all follow the host,
//   5. a wingman's own bursts are predicted locally AND reported to the host,
//      and the host settles a kill it is told about,
//   6. handing authority back (the host left, we are promoted) drops the
//      mirrored fight and puts a boat back under our own control.
//
// Usage: bun scripts/diag-enemy-sync.ts

import { Matrix4, Scene, Vector3 } from "three";
import { spawnAircraft, type AircraftState } from "../src/sim/flight";
import { Dogfight, type EnemySnapshot } from "../src/sim/dogfight";
import { carriers, groundAt } from "../src/sim/world";
import { ExplosionField } from "../src/render/effects";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const DT = 1 / 120;
const MAT4 = new Matrix4();
const UP = new Vector3(0, 1, 0);
const ORIGIN = new Vector3();
const DIR = new Vector3();

/** Open water near the middle of the arena, clear of the friendly fleet. */
function openWater(): Vector3 {
  for (let i = 1; i < 6000; i++) {
    const a = i * 2.39996;
    const r = Math.sqrt(i) * 90;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.abs(x) > 3800 || Math.abs(z) > 3800) continue;
    if (groundAt(x, z).kind !== "water") continue;
    let clear = true;
    for (const c of carriers()) if (Math.hypot(c.x - x, c.z - z) < 4000) clear = false;
    if (clear) return new Vector3(x, 1500, z);
  }
  return new Vector3(0, 1500, 0);
}

function airPlayer(): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.copy(openWater());
  st.vel.set(0, 0, -260);
  st.speed = 260;
  st.gearDown = false;
  st.gearT = 0;
  st.onGround = false;
  return st;
}

function face(st: AircraftState, target: Vector3): void {
  DIR.copy(target).sub(st.pos).normalize();
  MAT4.lookAt(ORIGIN, DIR, UP);
  st.quat.setFromRotationMatrix(MAT4);
  st.vel.copy(DIR).multiplyScalar(st.speed);
}

// ---------------------------------------------------------------------------
// 1. the host's fight
// ---------------------------------------------------------------------------
console.log("\n[the host runs the fight]");
const hostScene = new Scene();
const hostDf = new Dogfight(hostScene, new ExplosionField(hostScene, "low"));
const hostPlayer = airPlayer();
hostDf.begin(hostPlayer);
// Fly the host's fight until a wave has actually left the deck: launches take
// real sim seconds, and the point of this file is real streamed aircraft.
for (let i = 0; i < Math.round(90 / DT) && hostDf.targets().length < 2; i++) {
  hostPlayer.time += DT;
  hostDf.step(DT, hostPlayer, false);
}
const snap = hostDf.enemySnapshot();
check("the host's fight streams its boat", snap.carrier !== null, JSON.stringify(snap.carrier));
check("the streamed boat carries a pose, a hull and a state",
  !!snap.carrier && Number.isFinite(snap.carrier.x) && Number.isFinite(snap.carrier.headingDeg) &&
    snap.carrier.hp > 0 && snap.carrier.status === "closing",
  JSON.stringify(snap.carrier));
check("the host's fight streams bandits", snap.bandits.length >= 2, `${snap.bandits.length}`);
check("every streamed bandit has an id, a pose and a hull",
  snap.bandits.every((b) => Number.isFinite(b.x) && Number.isFinite(b.qw) && b.hp > 0 && b.id >= 0),
  JSON.stringify(snap.bandits));
check("streamed bandits are airborne once they have left the deck",
  snap.bandits.some((b) => !b.onDeck), JSON.stringify(snap.bandits.map((b) => b.onDeck)));

// The snapshot object is reused by the host every frame, so a receiver makes a
// copy: this is what the net layer effectively hands over.
function copyOf(s: EnemySnapshot): EnemySnapshot {
  return {
    carrier: s.carrier ? { ...s.carrier } : null,
    bandits: s.bandits.map((b) => ({ ...b })),
    wave: s.wave,
  };
}

// ---------------------------------------------------------------------------
// 2. a wingman mirrors it
// ---------------------------------------------------------------------------
console.log("\n[a wingman mirrors the fight]");
const wingScene = new Scene();
const wingDf = new Dogfight(wingScene, new ExplosionField(wingScene, "low"));
const wingPlayer = airPlayer();
check("a mirror starts with no enemies of its own",
  wingDf.enemyDeck() === null && wingDf.hud(wingPlayer).bandits === 0);
wingDf.setMirror(true, wingPlayer);
check("mirroring is on and still owns nothing", wingDf.mirroring && wingDf.enemyDeck() === null);

const first = copyOf(snap);
let nowMs = 1000;
wingDf.applyRemoteSnapshot(first, nowMs);
const wHud = wingDf.hud(wingPlayer);
check("the mirrored boat exists at the host's position",
  !!wingDf.enemyDeck() && wingDf.enemyDeck()!.x === first.carrier!.x &&
    wingDf.enemyDeck()!.z === first.carrier!.z && wingDf.enemyDeck()!.headingDeg === first.carrier!.headingDeg,
  JSON.stringify(wingDf.enemyDeck()));
check("the mirrored boat carries the host's hull",
  wHud.carrier !== null && wHud.carrier.hp === first.carrier!.hp &&
    wHud.carrier.status === first.carrier!.status,
  JSON.stringify(wHud.carrier));
check("the mirrored bandits are where the host's are",
  wHud.markers.length === first.bandits.length &&
    wHud.markers.every((m, i) =>
      Math.abs(m.x - first.bandits[i].x) < 1e-6 && Math.abs(m.z - first.bandits[i].z) < 1e-6),
  JSON.stringify(wHud.markers));
check("the room's wave number rides along", wHud.wave === first.wave, `${wHud.wave}`);

// A wingman's sim must not fly the host's aircraft for it.
const held = wHud.markers.map((m) => ({ x: m.x, z: m.z }));
for (let i = 0; i < Math.round(1 / DT); i++) {
  wingPlayer.time += DT;
  wingDf.step(DT, wingPlayer, false);
}
const still = wingDf.hud(wingPlayer).markers;
check("a mirrored bandit does not steer itself between packets",
  still.length === held.length &&
    still.every((m, i) => Math.hypot(m.x - held[i].x, m.z - held[i].z) < 1),
  JSON.stringify(still));
check("no local wave appears on a mirror", wingDf.hud(wingPlayer).bandits === held.length);

// The next packet moves them, and the wingman follows it. The step is a real
// bandit's: ~225 m/s over one packet interval, so the receiver's small lead
// past the newest packet stays inside a few tens of metres of it.
const moved = copyOf(first);
moved.bandits = moved.bandits.map((b, i) => ({ ...b, x: b.x + (i === 0 ? 30 : -30) }));
nowMs += 133;
wingDf.applyRemoteSnapshot(moved, nowMs);
for (let i = 0; i < Math.round(0.5 / DT); i++) {
  wingPlayer.time += DT;
  wingDf.step(DT, wingPlayer, false);
}
const followed = wingDf.hud(wingPlayer).markers;
check("the wingman moved with the host, not where it left them",
  followed.every((m, i) => Math.hypot(m.x - held[i].x, m.z - held[i].z) > 15),
  JSON.stringify(followed));
check("the wingman follows the host's new position",
  followed.every((m, i) => Math.abs(m.x - moved.bandits[i].x) < 60),
  JSON.stringify(followed));

// ---------------------------------------------------------------------------
// 3. the host's roster of bandits is the authority
// ---------------------------------------------------------------------------
console.log("\n[the host owns the roster]");
const oneFewer = copyOf(first);
oneFewer.bandits = oneFewer.bandits.slice(0, 1);
oneFewer.carrier = { ...first.carrier!, hp: 12, status: "sinking" };
nowMs += 133;
wingDf.applyRemoteSnapshot(oneFewer, nowMs);
const afterDrop = wingDf.hud(wingPlayer);
check("a bandit the host no longer has disappears",
  afterDrop.bandits === 1, `${afterDrop.bandits} left`);
check("the boat's hull state follows the packets",
  afterDrop.carrier !== null && afterDrop.carrier.hp === 12 && afterDrop.carrier.status === "sinking",
  JSON.stringify(afterDrop.carrier));
nowMs += 133;
wingDf.applyRemoteSnapshot({ carrier: null, bandits: [], wave: 9 }, nowMs);
check("the boat goes when the host's does",
  wingDf.enemyDeck() === null && wingDf.hud(wingPlayer).carrier === null);

// ---------------------------------------------------------------------------
// 4. a wingman's burst: predicted here, reported to the host
// ---------------------------------------------------------------------------
console.log("\n[the wingman's guns]");
const gunScene = new Scene();
const gunDf = new Dogfight(gunScene, new ExplosionField(gunScene, "low"));
const gunPlayer = airPlayer();
gunDf.setMirror(true, gunPlayer);
const straightAhead = {
  id: 42,
  x: gunPlayer.pos.x,
  y: gunPlayer.pos.y,
  z: gunPlayer.pos.z - 700,
  qx: 0, qy: 0, qz: 0, qw: 1,
  hp: 12,
  onDeck: false,
};
gunDf.applyRemoteSnapshot({ carrier: null, bandits: [straightAhead], wave: 2 }, 1000);
for (let i = 0; i < Math.round(1.5 / DT); i++) {
  gunPlayer.time += DT;
  const t = gunDf.targets()[0];
  if (t) face(gunPlayer, t.pos);
  gunDf.step(DT, gunPlayer, true);
}
const hits = gunDf.takeHits();
check("a burst on a mirrored bandit is reported to the host",
  hits.length > 0 && hits.every((h) => h.id === 42 && h.dmg > 0),
  JSON.stringify(hits.slice(0, 4)));
check("the hit is predicted here too: the bandit went down",
  gunDf.hud(gunPlayer).bandits === 0, `${gunDf.hud(gunPlayer).bandits} left`);
check("the report is handed over once", gunDf.takeHits().length === 0);

// ---------------------------------------------------------------------------
// 5. the host settles what it is told
// ---------------------------------------------------------------------------
console.log("\n[the host settles the damage]");
const victim = snap.bandits[0];
const beforeKill = hostDf.hud(hostPlayer);
hostDf.applyRemoteHit(victim.id, 1e6, hostPlayer);
const afterKill = hostDf.hud(hostPlayer);
check("the host takes a wingman's word for a kill",
  afterKill.bandits === beforeKill.bandits - 1 && afterKill.kills === beforeKill.kills + 1,
  `${beforeKill.bandits}->${afterKill.bandits}, ${beforeKill.kills}->${afterKill.kills}`);
check("a hit on a bandit nobody has is ignored",
  (hostDf.applyRemoteHit(99999, 500, hostPlayer), hostDf.hud(hostPlayer).kills === afterKill.kills));
const hullBefore = hostDf.hud(hostPlayer).carrier!.hp;
hostDf.applyRemoteCarrierHit(15, hostPlayer);
check("the host takes a wingman's word for damage on the boat",
  hostDf.hud(hostPlayer).carrier!.hp === hullBefore - 15,
  `${hullBefore} -> ${hostDf.hud(hostPlayer).carrier!.hp}`);

// ---------------------------------------------------------------------------
// 6. authority handed back
// ---------------------------------------------------------------------------
console.log("\n[authority comes back]");
const back = new Dogfight(new Scene(), new ExplosionField(new Scene(), "low"));
const backPlayer = airPlayer();
back.setMirror(true, backPlayer);
back.applyRemoteSnapshot(copyOf(snap), 1000);
check("the mirror took the fight first", back.hud(backPlayer).bandits === snap.bandits.length);
back.setMirror(false, backPlayer);
check("handing it back drops the mirrored bandits", back.hud(backPlayer).bandits === 0);
check("and puts a hostile boat back under our own control",
  back.enemyDeck() !== null && back.hud(backPlayer).carrier !== null);

hostDf.dispose();
wingDf.dispose();
gunDf.dispose();
back.dispose();

console.log(failures === 0 ? "\nALL ENEMY SYNC CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
