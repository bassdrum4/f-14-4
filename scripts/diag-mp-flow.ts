// Headless multiplayer flow verification: the whole session sequence, replayed
// through a mock signalling broker, with no network and no browser.
//
// The net layer talks to PeerJS through a small surface (on / connect / send /
// close), so injecting a mock Peer is enough to run what actually happens when
// one pilot opens a room and others join it:
//
//   1. the host registers the room's one predictable id,
//   2. a joiner dials it, both ends say hello, the host answers with the roster,
//   3. a third pilot joins and the host introduces it, so every pair forms one
//      (and only one) data link — a full mesh, not a star,
//   4. poses flow over every link at the fixed send rate,
//   5. a wingman renaming or changing airframe is picked up by the others,
//   6. leaving is announced to everyone,
//   7. if the host leaves, the surviving lowest-id pilot claims the room id on a
//      second peer so newcomers can still get in,
//   8. a code typed before the host has registered is retried instead of being
//      declared missing, and a code already in use is refused,
//   9. the room's world travels as one seed, and both ends regenerate identical
//      terrain from it — the world itself never crosses the wire.
//
// Usage: bun scripts/diag-mp-flow.ts

import type { Peer } from "peerjs";
import {
  Multiplayer,
  emptyPose,
  hostPeerId,
  packEnemies,
  packPose,
  unpackEnemies,
  unpackPose,
  type NetState,
} from "../src/net/multiplayer";
import type { RemotePose } from "../src/render/remoteJets";
import type { AircraftId } from "../src/sim/aircraft";
import type { EnemySnapshot } from "../src/sim/dogfight";
import type { MissionKind } from "../src/sim/flight";
import type { BattleAction, BattleSnapshot, BattleShot } from "../src/net/versus";
import type { MissionMode } from "../src/settings";
import { DEFAULT_SEED, setWorldSeed, terrainHeight, worldSeedForRoom } from "../src/sim/world";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

// ---------------------------------------------------------------------------
// A controllable clock. The net layer schedules its pose sender on an interval
// and its dial retries on timeouts; driving them by hand keeps the test instant
// and deterministic.
// ---------------------------------------------------------------------------

interface Timer {
  id: number;
  fn: () => void;
  at: number;
  every: number | null;
}

const timers = new Map<number, Timer>();
let timerSeq = 1;
let now = 0;

function fakeSetTimeout(fn: () => void, ms = 0): number {
  const id = timerSeq++;
  timers.set(id, { id, fn, at: now + Math.max(0, ms), every: null });
  return id;
}
function fakeSetInterval(fn: () => void, ms = 0): number {
  const id = timerSeq++;
  timers.set(id, { id, fn, at: now + Math.max(1, ms), every: Math.max(1, ms) });
  return id;
}
function fakeClear(id: number): void {
  timers.delete(id);
}

(globalThis as unknown as { window: unknown }).window = {
  setTimeout: fakeSetTimeout,
  clearTimeout: fakeClear,
  setInterval: fakeSetInterval,
  clearInterval: fakeClear,
};

/** Let queued deliveries (connection open, data) run to completion. */
async function flush(): Promise<void> {
  for (let i = 0; i < 40; i++) await Promise.resolve();
}

/** Run every timer due within `ms`, in time order, letting deliveries settle. */
async function advance(ms: number): Promise<void> {
  const target = now + ms;
  for (;;) {
    let next: Timer | null = null;
    for (const t of timers.values()) {
      if (t.at <= target && (next === null || t.at < next.at)) next = t;
    }
    if (!next) break;
    now = next.at;
    if (next.every === null) timers.delete(next.id);
    else next.at = now + next.every;
    next.fn();
    await flush();
  }
  now = target;
  await flush();
}

// ---------------------------------------------------------------------------
// Mock broker + peers
// ---------------------------------------------------------------------------

type Handler = (...args: any[]) => void;

/**
 * Every control payload that crosses the wire, in order. Poses are binary, so
 * anything recorded here is lobby traffic — which is how the tests can prove
 * that the world is handed over once instead of being re-sent in flight.
 */
const controlLog: string[] = [];

class MockConn {
  open = false;
  pair: MockConn | null = null;
  private handlers = new Map<string, Handler[]>();

  constructor(readonly peer: string) {}

  on(event: string, fn: Handler): void {
    const list = this.handlers.get(event) ?? [];
    list.push(fn);
    this.handlers.set(event, list);
  }

  emit(event: string, ...args: unknown[]): void {
    for (const fn of this.handlers.get(event) ?? []) fn(...args);
  }

  openNow(): void {
    if (this.open) return;
    this.open = true;
    this.emit("open");
  }

  send(data: unknown): void {
    if (!this.open || !this.pair) return;
    if (typeof data === "string") controlLog.push(data);
    // The wire hands over a copy, exactly like a data channel would.
    const payload = data instanceof ArrayBuffer ? data.slice(0) : data;
    const target = this.pair;
    queueMicrotask(() => target.emit("data", payload));
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    const other = this.pair;
    this.pair = null;
    queueMicrotask(() => {
      this.emit("close");
      if (other && other.open) {
        other.open = false;
        other.pair = null;
        other.emit("close");
      }
    });
  }
}

class MockBroker {
  readonly peers = new Map<string, MockPeer>();
  /** Every dial attempted, as "from->to", so the mesh can be audited. */
  readonly dials: string[] = [];

  register(id: string, p: MockPeer): boolean {
    if (this.peers.has(id)) return false;
    this.peers.set(id, p);
    return true;
  }

  unregister(id: string, p: MockPeer): void {
    if (this.peers.get(id) === p) this.peers.delete(id);
  }
}

class MockPeer {
  destroyed = false;
  private handlers = new Map<string, Handler[]>();

  constructor(
    private readonly broker: MockBroker,
    readonly id: string,
  ) {
    queueMicrotask(() => {
      if (this.destroyed) return;
      if (!this.broker.register(this.id, this)) {
        // PeerJS refuses a duplicate id: two rooms cannot share a code.
        this.emit("error", { type: "unavailable-id", message: `ID ${this.id} is taken` });
        return;
      }
      this.emit("open", this.id);
    });
  }

  on(event: string, fn: Handler): this {
    const list = this.handlers.get(event) ?? [];
    list.push(fn);
    this.handlers.set(event, list);
    return this;
  }

  emit(event: string, ...args: unknown[]): void {
    for (const fn of this.handlers.get(event) ?? []) fn(...args);
  }

  removeAllListeners(): void {
    this.handlers.clear();
  }

  reconnect(): void {
    /* the mock signalling socket never drops */
  }

  destroy(): void {
    this.destroyed = true;
    this.broker.unregister(this.id, this);
    this.handlers.clear();
  }

  connect(target: string): MockConn {
    this.broker.dials.push(`${this.id}->${target}`);
    const local = new MockConn(target);
    const remotePeer = this.broker.peers.get(target);
    if (!remotePeer) {
      queueMicrotask(() => {
        if (this.destroyed) return;
        this.emit("error", {
          type: "peer-unavailable",
          message: `Could not connect to peer ${target}`,
        });
      });
      return local;
    }
    const remote = new MockConn(this.id);
    local.pair = remote;
    remote.pair = local;
    queueMicrotask(() => {
      if (this.destroyed || remotePeer.destroyed) return;
      remotePeer.emit("connection", remote);
      local.openNow();
      remote.openNow();
    });
    return local;
  }
}

const broker = new MockBroker();

// ---------------------------------------------------------------------------
// A pilot under test
// ---------------------------------------------------------------------------

interface Pilot {
  net: Multiplayer;
  /** Every signalling peer this pilot has made (the second one is host duty). */
  peers: MockPeer[];
  states: NetState[];
  roster: Map<string, { name: string; aircraft: AircraftId; host: boolean; linked: boolean }>;
  poses: Map<string, RemotePose>;
  poseCount: number;
  left: string[];
  /** Sorties the room asked us to join. */
  launches: Array<{ mission: MissionKind; carrier: number }>;
  /** Mission profiles the room pushed at us. */
  modes: MissionMode[];
  /** Fight snapshots, as they arrived. */
  enemies: EnemySnapshot[];
  /** Hits another pilot reported landing on an enemy we run. */
  hits: Array<{ id: number; dmg: number }>;
  /** Damage another pilot reported landing on the hostile boat. */
  carrierHits: number[];
  battleActions: Array<{ sender: string; action: BattleAction }>;
  battleStates: BattleSnapshot[];
  battleShots: Array<{ sender: string; shot: BattleShot }>;
}

function makePilot(): Pilot {
  const rec: Pilot = {
    net: null as unknown as Multiplayer,
    peers: [],
    states: [],
    roster: new Map(),
    poses: new Map(),
    poseCount: 0,
    left: [],
    launches: [],
    modes: [],
    enemies: [],
    hits: [],
    carrierHits: [],
    battleActions: [],
    battleStates: [],
    battleShots: [],
  };
  rec.net = new Multiplayer(
    {
      onState: (s) => rec.states.push(s),
      onPilot: (id, name, aircraft) => {
        rec.roster.set(id, {
          name,
          aircraft,
          host: rec.roster.get(id)?.host ?? false,
          linked: rec.roster.get(id)?.linked ?? false,
        });
      },
      onPilotLeave: (id) => {
        rec.roster.delete(id);
        rec.left.push(id);
      },
      onPose: (id, pose) => {
        rec.poses.set(id, { ...pose });
        rec.poseCount++;
      },
      onLaunch: (mission, carrier) => {
        rec.launches.push({ mission, carrier });
      },
      onMode: (mode) => rec.modes.push(mode),
      onEnemies: (snap) => rec.enemies.push(snap),
      onHit: (id, dmg) => rec.hits.push({ id, dmg }),
      onCarrierHit: (dmg) => rec.carrierHits.push(dmg),
      onBattleAction: (sender, action) => rec.battleActions.push({ sender, action }),
      onBattleState: (snapshot) => rec.battleStates.push(snapshot),
      onBattleShot: (sender, shot) => rec.battleShots.push({ sender, shot }),
    },
    (id) => {
      const peer = new MockPeer(broker, id);
      rec.peers.push(peer);
      return peer as unknown as Peer;
    },
  );
  return rec;
}

/** The roster as the lobby would read it, keyed by callsign. */
function rosterOf(p: Pilot): Array<{ id: string; name: string; aircraft: AircraftId; host: boolean; linked: boolean }> {
  return p.net.snapshot.pilots.map((e) => ({
    id: e.id,
    name: e.name,
    aircraft: e.aircraft,
    host: e.host,
    linked: e.linked,
  }));
}

const byName = (p: Pilot, name: string) => rosterOf(p).find((e) => e.name === name);

// ---------------------------------------------------------------------------
// 1. the host opens the room
// ---------------------------------------------------------------------------
console.log("\n[open the room]");
const host = makePilot();
host.net.open("alpha", "MAVERICK", "tomcat");
await flush();
check("the host registers the room's predictable id",
  host.net.snapshot.self === hostPeerId("ALPHA"), host.net.snapshot.self);
check("the room code is normalised to upper case", host.net.snapshot.room === "ALPHA",
  host.net.snapshot.room);
check("the host is online", host.net.snapshot.status === "online", host.net.snapshot.status);
check("the host knows it is the host", host.net.snapshot.host && host.net.isHost);
check("an empty room has no pilots", rosterOf(host).length === 0);

// ---------------------------------------------------------------------------
// 2. the first wingman joins: dial, hello, roster
// ---------------------------------------------------------------------------
console.log("\n[join]");
const wing = makePilot();
wing.net.join("ALPHA", "GOOSE", "hornet");
await flush();
check("the joiner dialled the room's host id",
  broker.dials.includes(`${wing.peers[0].id}->${hostPeerId("ALPHA")}`),
  broker.dials.join(", "));
check("the joiner sees the host, and as a host",
  byName(wing, "MAVERICK")?.host === true, JSON.stringify(rosterOf(wing)));
check("the joiner does not call itself the host", !wing.net.snapshot.host);
check("the host sees the joiner", byName(host, "GOOSE")?.name === "GOOSE");
check("the joiner's airframe rides the hello",
  byName(host, "GOOSE")?.aircraft === "hornet", byName(host, "GOOSE")?.aircraft);
check("the link is live at both ends",
  byName(host, "GOOSE")?.linked === true && byName(wing, "MAVERICK")?.linked === true);

// ---------------------------------------------------------------------------
// 3. a third pilot forms the mesh
// ---------------------------------------------------------------------------
console.log("\n[mesh]");
const third = makePilot();
third.net.join("ALPHA", "ICEMAN", "intruder");
await flush();
check("every pilot sees the other two",
  rosterOf(host).length === 2 && rosterOf(wing).length === 2 && rosterOf(third).length === 2,
  `${rosterOf(host).length}/${rosterOf(wing).length}/${rosterOf(third).length}`);
check("every roster entry is linked",
  [host, wing, third].every((p) => rosterOf(p).every((e) => e.linked)));
check("the new pilot sees the host as the host",
  byName(third, "MAVERICK")?.host === true);

// exactly one dial per unordered pair of pilots is what makes the mesh a mesh:
// twice would mean both ends dialled each other, zero would mean a missing link.
const pairKey = (a: string, b: string) => [a, b].sort().join("|");
const dialPairs = broker.dials.map((d) => {
  const [from, to] = d.split("->");
  return pairKey(from, to);
});
const uniquePairs = new Set(dialPairs);
check("only one dial happened per pilot pair", dialPairs.length === uniquePairs.size,
  broker.dials.join(", "));

// ---------------------------------------------------------------------------
// 4. poses flow over every link
// ---------------------------------------------------------------------------
console.log("\n[pose traffic]");
const pose = emptyPose();
pose.x = 1234.5; pose.y = 800.25; pose.z = -4321.75;
pose.qx = 0.1; pose.qy = 0.2; pose.qz = 0.3; pose.qw = 0.9273618;
pose.vx = 250.5; pose.vy = -3.25; pose.vz = 12.75;
pose.speed = 251.125; pose.sweepT = 0.5; pose.flags = 0b1101;
host.net.publish(pose);
await advance(200); // the sender runs at 15 Hz
const seen = wing.poses.get(hostPeerId("ALPHA"));
check("the host's pose reached the wingman", seen !== undefined);
if (seen) {
  const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(1e-3, Math.abs(b) * 1e-6);
  check("the pose survived the wire",
    near(seen.x, pose.x) && near(seen.y, pose.y) && near(seen.z, pose.z) &&
      near(seen.vx, pose.vx) && near(seen.speed, pose.speed),
    JSON.stringify(seen));
}
check("poses repeat at the sender's rate",
  wing.poseCount >= 2 && wing.poseCount <= 6, `${wing.poseCount} in 200 ms`);
const before = third.poseCount;
await advance(1000);
check("a second link carries poses too", third.poseCount > before + 8,
  `${before} -> ${third.poseCount}`);

// ---------------------------------------------------------------------------
// 5. a wingman changes callsign and airframe mid-session
// ---------------------------------------------------------------------------
console.log("\n[rename + re-airframe]");
wing.net.setName("GOOSE 2");
wing.net.setAircraft("intruder");
await flush();
check("the others see the new callsign", byName(host, "GOOSE 2") !== undefined,
  JSON.stringify(rosterOf(host).map((e) => e.name)));
check("and the new airframe", byName(host, "GOOSE 2")?.aircraft === "intruder",
  byName(host, "GOOSE 2")?.aircraft);

// ---------------------------------------------------------------------------
// 6. a wingman leaves
// ---------------------------------------------------------------------------
console.log("\n[leave]");
third.net.leave();
await flush();
check("the others drop the departed pilot",
  rosterOf(host).length === 1 && rosterOf(wing).length === 1,
  `${rosterOf(host).length}/${rosterOf(wing).length}`);
check("the departure is reported once", host.left.length === 1, `${host.left.length}`);
check("the leaver is idle", third.net.snapshot.status === "idle");

// ---------------------------------------------------------------------------
// 7. the host leaves: the room is handed over
// ---------------------------------------------------------------------------
console.log("\n[host handover]");
host.net.leave();
await flush();
// The message is replaced a moment later by the takeover notice, so look for it
// in the state stream rather than in the latest snapshot.
check("the survivor is told the host left",
  wing.states.some((s) => (s.error ?? "").includes("host left")),
  wing.states.map((s) => s.error).filter(Boolean).join(" | "));
await flush();
check("the survivor took over the room", wing.net.isHost);
check("the room is still online", wing.net.snapshot.status === "online");

const late = makePilot();
late.net.join("ALPHA", "SLIDER", "tomcat");
await flush();
check("a newcomer can still join after the host left",
  rosterOf(late).length === 1 && rosterOf(late)[0]?.name === "GOOSE 2",
  JSON.stringify(rosterOf(late)));
check("a promoted host keeps its pilot identity for new arrivals", rosterOf(late)[0]?.id === wing.net.snapshot.self, JSON.stringify(rosterOf(late)));
check("the newcomer is linked to the survivor",
  rosterOf(late)[0]?.linked === true, JSON.stringify(rosterOf(late)));
check("the survivor sees the newcomer", byName(wing, "SLIDER") !== undefined,
  JSON.stringify(rosterOf(wing).map((e) => e.name)));

// ---------------------------------------------------------------------------
// 8. a code typed before the room exists is retried, then found
// ---------------------------------------------------------------------------
console.log("\n[late room]");
const early = makePilot();
early.net.join("BRAVO", "HOLLYWOOD", "tomcat");
await flush();
check("the session stays up while it looks", early.net.snapshot.status === "online");
check("it says it is still looking",
  (early.net.snapshot.error ?? "").includes("Looking for room"), early.net.snapshot.error);

// the host opens the room while the joiner is still retrying
const lateHost = makePilot();
lateHost.net.open("BRAVO", "VIPER", "tomcat");
await flush();
await advance(4000);
check("the retry finds the room once it exists", byName(early, "VIPER") !== undefined,
  JSON.stringify(rosterOf(early)));
check("and the link comes up", byName(early, "VIPER")?.linked === true);
check("the host sees the retried joiner", byName(lateHost, "HOLLYWOOD") !== undefined);

// ---------------------------------------------------------------------------
// 9. a room code that is already in use is refused
// ---------------------------------------------------------------------------
console.log("\n[code clash]");
const clash = makePilot();
clash.net.open("BRAVO", "CHIPPY", "tomcat");
await flush();
check("taking a live room code fails",
  clash.net.snapshot.status === "error", clash.net.snapshot.status);
check("and says why", (clash.net.snapshot.error ?? "").includes("already in use"),
  clash.net.snapshot.error);

// ---------------------------------------------------------------------------
// 10. the host launches the room together
// ---------------------------------------------------------------------------
console.log("\n[launch]");
const lead = makePilot();
lead.net.open("CHARLIE", "MAVERICK", "tomcat");
await flush();
const numberTwo = makePilot();
numberTwo.net.join("CHARLIE", "GOOSE", "tomcat");
await flush();
check("the room is linked before the launch", byName(lead, "GOOSE")?.linked === true,
  JSON.stringify(rosterOf(lead)));

lead.net.launch("carrier", 2);
await flush();
check("the wingman is told to launch", numberTwo.launches.length === 1,
  JSON.stringify(numberTwo.launches));
check("with the mission and the boat",
  numberTwo.launches[0]?.mission === "carrier" && numberTwo.launches[0]?.carrier === 2,
  JSON.stringify(numberTwo.launches[0]));
check("the launcher does not hear their own call", lead.launches.length === 0,
  JSON.stringify(lead.launches));
// Only the host may launch the room.
numberTwo.net.launch("airfield", 0);
await flush();
check("a member cannot change the host launch",
  lead.launches.length === 0,
  JSON.stringify(lead.launches));

// A peer cannot talk the room into a mission that does not exist.
numberTwo.net.launch("submarine" as MissionKind, 0);
await flush();
check("an unknown mission is dropped", lead.launches.length === 0,
  JSON.stringify(lead.launches));

// ---------------------------------------------------------------------------
// 11. the room code *is* the world: same code, same islands, nothing sent
// ---------------------------------------------------------------------------
console.log("\n[room code -> world]");
const scout = makePilot();
scout.net.open("delta-99", "ICEMAN", "tomcat");
await flush();
const wingTwo = makePilot();
controlLog.length = 0;
// typed differently on purpose: the two must still land on one room, and so on
// one world
wingTwo.net.join("DELTA99", "SLIDER", "tomcat");
await flush();

check("both ends settle on the same normalised room code",
  scout.net.snapshot.room === "DELTA99" && wingTwo.net.snapshot.room === "DELTA99",
  `${scout.net.snapshot.room} / ${wingTwo.net.snapshot.room}`);

// The code alone decides the terrain, so both build the same world without a
// single byte about it crossing the wire.
const probes: Array<[number, number]> = [[1000, -2000], [-9000, 14000], [0, 0], [20000, 9000]];
setWorldSeed(worldSeedForRoom(scout.net.snapshot.room));
const hostWorld = probes.map(([x, z]) => terrainHeight(x, z));
setWorldSeed(worldSeedForRoom(wingTwo.net.snapshot.room));
const clientWorld = probes.map(([x, z]) => terrainHeight(x, z));
check("both pilots build identical terrain from the room code",
  clientWorld.every((h, i) => h === hostWorld[i]),
  `${JSON.stringify(hostWorld)} vs ${JSON.stringify(clientWorld)}`);

// A different room is a different world, and the code is matched loosely.
setWorldSeed(worldSeedForRoom("DELTA99"));
const here = terrainHeight(1000, -2000);
setWorldSeed(worldSeedForRoom("OTHERROOM"));
const elsewhere = terrainHeight(1000, -2000);
check("a different room code is a different world", here !== elsewhere, `${here} vs ${elsewhere}`);
check("case and punctuation do not change the world",
  worldSeedForRoom("f14-alpha") === worldSeedForRoom("F14ALPHA"), "");
check("an empty code falls back to the home world",
  worldSeedForRoom("") === DEFAULT_SEED, `${worldSeedForRoom("")}`);

// Nothing about the world is on the wire, ever: the join handover is lobby
// traffic only.
const worldish = controlLog.filter((m) => /seed|world|terrain/i.test(m));
check("the join handover carries no world payload", worldish.length === 0, worldish.join(" | "));
check("but it did carry the handshake",
  controlLog.some((m) => m.includes('"hello"')) && controlLog.some((m) => m.includes('"roster"')),
  controlLog.join(" | "));

// Flying does not either: poses flow, the world does not.
controlLog.length = 0;
const beforePoses = wingTwo.poseCount;
scout.net.publish(emptyPose());
await advance(1000);
check("poses keep flowing", wingTwo.poseCount > beforePoses + 8, `${beforePoses} -> ${wingTwo.poseCount}`);
check("and no world traffic appears in flight", controlLog.length === 0, controlLog.join(" | "));

// ---------------------------------------------------------------------------
// 12. the mission profile is the room's: the host decides, everyone flies it
// ---------------------------------------------------------------------------
console.log("\n[mission profile]");
const skipper = makePilot();
skipper.net.open("ECHO", "MAVERICK", "tomcat");
await flush();

// Picked in the lobby before anyone joined: the roster has to carry it.
skipper.net.setMode("dogfight");
await flush();
const joiner = makePilot();
joiner.net.join("ECHO", "GOOSE", "tomcat");
await flush();
check("a joiner is told the room's profile", joiner.modes.includes("dogfight"),
  JSON.stringify(joiner.modes));
check("the host does not take a profile off the wire", skipper.modes.length === 0,
  JSON.stringify(skipper.modes));

skipper.net.setMode("strike");
await flush();
check("a later change reaches the linked wingman",
  joiner.modes[joiner.modes.length - 1] === "strike", JSON.stringify(joiner.modes));
const modesBeforeRepeat = joiner.modes.length;
skipper.net.setMode("strike");
await flush();
check("setting the profile it already has sends nothing",
  joiner.modes.length === modesBeforeRepeat, JSON.stringify(joiner.modes));

const lateEnemy = makePilot();
lateEnemy.net.join("echo", "ICEMAN", "tomcat");
await flush();
check("the profile rides the roster to a newcomer",
  lateEnemy.modes.includes("strike"), JSON.stringify(lateEnemy.modes));

// ---------------------------------------------------------------------------
// 13. the fight: the host streams it, the room mirrors it
// ---------------------------------------------------------------------------
console.log("\n[enemy stream]");
const fight: EnemySnapshot = {
  carrier: { x: 1200, z: -3400, headingDeg: 210.5, hp: 74, status: "closing" },
  bandits: [
    { id: 7, x: 900, y: 1400, z: -3000, qx: 0.1, qy: 0.2, qz: 0.3, qw: 0.9273618, hp: 60, onDeck: false },
    { id: 8, x: 880, y: 1410, z: -2990, qx: 0, qy: 0, qz: 0, qw: 1, hp: 100, onDeck: true },
  ],
  wave: 3,
};
const enemiesBefore = joiner.enemies.length;
const posesBefore = joiner.poseCount;
skipper.net.publishEnemies(fight);
await advance(1000);
const got = joiner.enemies[joiner.enemies.length - 1];
check("the wingman received the fight", joiner.enemies.length > enemiesBefore,
  `${joiner.enemies.length}`);
const gc = got?.carrier ?? null;
check("the boat survived the wire",
  gc !== null && Math.abs(gc.x - 1200) < 1e-3 && gc.hp === 74 && gc.status === "closing" &&
    Math.abs(gc.headingDeg - 210.5) < 1e-3,
  JSON.stringify(gc));
const gb = got?.bandits ?? [];
check("the bandits survived the wire, ids and all",
  gb.length === 2 && gb[0].id === 7 && gb[1].id === 8, JSON.stringify(gb));
check("a bandit keeps its pose, hull and deck state",
  !!gb[0] && Math.abs(gb[0].x - 900) < 1e-3 && Math.abs(gb[0].y - 1400) < 1e-3 &&
    Math.abs(gb[0].z + 3000) < 1e-3 && Math.abs(gb[0].qw - 0.9273618) < 1e-6 &&
    gb[0].hp === 60 && !gb[0].onDeck && gb[1].onDeck,
  JSON.stringify(gb[0]));
check("the wave rides along", got?.wave === 3, `${got?.wave}`);
check("the fight goes out at half the pose rate",
  joiner.enemies.length - enemiesBefore < (joiner.poseCount - posesBefore) * 0.75,
  `${joiner.enemies.length - enemiesBefore} fights vs ${joiner.poseCount - posesBefore} poses`);

// A wave that clears arrives as an empty fight, not as a stale one.
skipper.net.publishEnemies({ carrier: null, bandits: [], wave: 4 });
await advance(300);
const cleared = joiner.enemies[joiner.enemies.length - 1];
check("a cleared fight arrives empty",
  !!cleared && cleared.bandits.length === 0 && cleared.carrier === null && cleared.wave === 4,
  JSON.stringify(cleared));

// Nobody is running the fight any more (the host went solo): nothing is sent.
const quiet = joiner.enemies.length;
skipper.net.publishEnemies(null);
await advance(400);
check("no fight is sent once the host stops publishing",
  joiner.enemies.length === quiet, `${quiet} -> ${joiner.enemies.length}`);

// ---------------------------------------------------------------------------
// 14. damage flows the other way, to the pilot who owns the aircraft
// ---------------------------------------------------------------------------
console.log("\n[wingman damage]");
joiner.net.hitBandit(7, 42.5);
joiner.net.hitCarrier(11);
await flush();
check("the host hears a wingman's hit on a bandit",
  skipper.hits.length === 1 && skipper.hits[0].id === 7 && skipper.hits[0].dmg === 42.5,
  JSON.stringify(skipper.hits));
check("and a wingman's hit on the boat",
  skipper.carrierHits.length === 1 && skipper.carrierHits[0] === 11,
  JSON.stringify(skipper.carrierHits));
check("a wingman's own report is not echoed back at it", joiner.hits.length === 0);

// ---------------------------------------------------------------------------
// 15. the wire format: a fight packet and a pose packet cannot be confused
// ---------------------------------------------------------------------------
console.log("\n[wire format]");
const roundTrip = unpackEnemies(packEnemies(fight, 9));
check("a fight packet survives a round trip",
  roundTrip !== null && roundTrip.bandits.length === 2 && roundTrip.wave === 3 &&
    roundTrip.bandits[1].onDeck === true,
  JSON.stringify(roundTrip));
{
  const pose = emptyPose();
  pose.x = 1234.5;
  pose.y = -200;
  pose.z = 77.25;
  pose.qw = 1;
  pose.speed = 250;
  pose.flags = 5;
  const poseBuf = packPose(pose, 1);
  check("a pose packet is not read as a fight", unpackEnemies(poseBuf) === null);
  check("a fight packet is not read as a pose", unpackPose(packEnemies(fight, 1), emptyPose()) === null);
}
check("a truncated packet is refused", unpackEnemies(new ArrayBuffer(20)) === null);
check("a corrupted packet is refused", (() => {
  const buf = packEnemies(fight, 2);
  new DataView(buf).setUint16(buf.byteLength - 2, 0);
  return unpackEnemies(buf) === null;
})());
check("a fight packet carries the codec sequence", (() => {
  const buf = packEnemies(fight, 513);
  return new DataView(buf).getUint16(6) === (513 & 0xffff);
})());

console.log("\n[head-to-head room traffic]");
skipper.net.setMode("versus");
await flush();
check("head-to-head mode follows the host", joiner.modes[joiner.modes.length - 1] === "versus");
const battleAction: BattleAction = { kind: "hit", match: 29, seq: 4, life: 1, victim: skipper.net.snapshot.self, victimLife: 2, weapon: "gun" };
joiner.net.sendBattleAction(battleAction);
await flush();
check("player hits arrive at the host with the actual sender", skipper.battleActions.length === 1 && skipper.battleActions[0].sender === joiner.net.snapshot.self && skipper.battleActions[0].action.victimLife === 2);
const battleState: BattleSnapshot = { match: 29, pilots: [{ id: joiner.net.snapshot.self, name: "JOINER", hp: 93, kills: 1, deaths: 0, life: 2, ready: true, shield: false, respawnIn: 0 }] };
skipper.net.publishBattle(battleState);
await flush();
check("authoritative hull and scores reach the other pilot", joiner.battleStates[joiner.battleStates.length - 1]?.pilots[0].hp === 93);
joiner.net.sendBattleShot({ weapon: "missile", match: 29, life: 2, seq: 9, pos: [100, 1400, 200], vel: [0, 0, -260] });
await flush();
check("weapon launch visuals reach the opponent with pilot identity", skipper.battleShots.length === 1 && skipper.battleShots[0].sender === joiner.net.snapshot.self && skipper.battleShots[0].shot.weapon === "missile");
const statesBefore = skipper.battleStates.length;
joiner.net.publishBattle({ match: 99, pilots: [] });
await flush();
check("a non-host cannot publish battle scores", skipper.battleStates.length === statesBefore);
joiner.net.setMode("cruise");
await flush();
check("a non-host cannot change the room mission", skipper.modes[skipper.modes.length - 1] !== "cruise");

for (const p of [host, wing, third, late, early, lateHost, clash, lead, numberTwo, scout, wingTwo, skipper, joiner, lateEnemy]) p.net.dispose();

console.log(failures === 0 ? "\nALL MULTIPLAYER FLOW CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
