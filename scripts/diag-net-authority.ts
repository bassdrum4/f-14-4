// Headless room-authority verification: what the net layer accepts from a
// wingman's connection. No network, no browser — the same mock signalling
// broker as the flow and radio tests.
//
// What this pins down, in the order a pilot meets it in flight:
//   1. a damage claim (bandit hull, enemy carrier) is only taken from a pilot
//      on the roster, and only as a real positive number — a NaN or a negative
//      hull used to leave an unkillable bandit or a healed carrier,
//   2. a legitimate claim still lands: the guard is not a mute switch,
//   3. a radio line is credited to the roster callsign, so nobody can speak for
//      another pilot,
//   4. "bye" only ever retires the pilot behind the connection that sent it, so
//      a forged id cannot eject a wingman from the roster mid-flight,
//   5. a malformed control frame cannot throw out of the data handler,
//   6. only the room's host introduces pilots (roster/join) and only the room's
//      host may launch the room, rewrite its mission profile or publish its
//      scoreboard — the peer id decides that, never the packet,
//   7. the roster stops at the room ceiling and the fight stream stops at the
//      bandit ceiling,
//   8. an unchanged head-to-head scoreboard is not re-broadcast,
//   9. every link is measured for delay, not just the first one, and
//  10. losing the link to the room host re-dials it instead of stranding the
//      pilot with a frozen fight for the rest of the session.
//
// Usage: bun scripts/diag-net-authority.ts

import type { Peer } from "peerjs";
import { Scene } from "three";
import { Multiplayer, packEnemies, unpackEnemies, type ChatMsg } from "../src/net/multiplayer";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { spawnAircraft } from "../src/sim/flight";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

// The net layer schedules its sender on window timers, which Bun has no global
// window for. Manual timers keep the test instant and deterministic.
type Timer = { id: number; fn: () => void; at: number; every: number | null };
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
(globalThis as unknown as { window: unknown }).window = {
  setTimeout: fakeSetTimeout,
  clearTimeout: (id: number) => timers.delete(id),
  setInterval: fakeSetInterval,
  clearInterval: (id: number) => timers.delete(id),
};

async function flush(): Promise<void> {
  for (let i = 0; i < 40; i++) await Promise.resolve();
}

// ---------------------------------------------------------------------------
// Mock broker + peers
// ---------------------------------------------------------------------------

type Handler = (...args: any[]) => void;

class MockBroker {
  readonly peers = new Map<string, MockPeer>();
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
        this.emit("error", { type: "unavailable-id", message: `ID ${this.id} is taken` });
        return;
      }
      this.emit("open", this.id);
    });
  }
  on(event: string, fn: Handler): void {
    const list = this.handlers.get(event) ?? [];
    list.push(fn);
    this.handlers.set(event, list);
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

// ---------------------------------------------------------------------------
// A pilot under test: records everything the fight hands the sim
// ---------------------------------------------------------------------------

interface Pilot {
  net: Multiplayer;
  heard: ChatMsg[];
  hits: Array<{ id: number; dmg: number }>;
  cvHits: number[];
  launches: Array<{ mission: string; carrier: number }>;
  modes: string[];
  battleStates: number;
  links: Array<{ id: string; ms: number }>;
}

function makePilot(): Pilot {
  const rec: Pilot = {
    net: null as unknown as Multiplayer,
    heard: [],
    hits: [],
    cvHits: [],
    launches: [],
    modes: [],
    battleStates: 0,
    links: [],
  };
  rec.net = new Multiplayer(
    {
      onChat: (msg) => rec.heard.push(msg),
      onHit: (id, dmg) => rec.hits.push({ id, dmg }),
      onCarrierHit: (dmg) => rec.cvHits.push(dmg),
      onLaunch: (mission, carrier) => rec.launches.push({ mission, carrier }),
      onMode: (mode) => rec.modes.push(mode),
      onBattleState: () => rec.battleStates++,
      onLinkDelay: (id, ms) => rec.links.push({ id, ms }),
    },
    (id) => new MockPeer(broker, id) as unknown as Peer,
  );
  return rec;
}

/**
 * Run a frame straight through a receiver's data handler and report whether it
 * threw. `rawSend` cannot answer this: the mock delivers inside a microtask,
 * where an exception escapes the test instead of being caught by it.
 */
function deliver(net: Multiplayer, toPeer: string, frame: unknown): "ok" | "threw" {
  const conns = (net as unknown as { conns: Map<string, unknown> }).conns;
  const conn = conns.get(toPeer);
  if (!conn) throw new Error(`no connection to ${toPeer}`);
  try {
    (net as unknown as { onData(c: unknown, d: unknown): void }).onData(conn, JSON.stringify(frame));
    return "ok";
  } catch {
    return "threw";
  }
}

/** Run the timers that have come due, so a scheduled retry actually happens. */
function advance(ms: number): void {
  now += ms;
  const due = [...timers.values()].filter((t) => t.at <= now);
  for (const t of due) {
    if (t.every === null) {
      timers.delete(t.id);
      t.fn();
    } else {
      t.at = now + t.every;
      t.fn();
    }
  }
}

/** Read back one pilot's RTT from an injected peer connection. */
function installStats(net: Multiplayer, peerId: string, rttSeconds: number): void {
  const conns = (net as unknown as { conns: Map<string, { peerConnection?: unknown }> }).conns;
  const conn = conns.get(peerId);
  if (!conn) throw new Error(`no connection to ${peerId}`);
  conn.peerConnection = {
    getStats: () =>
      Promise.resolve({
        forEach: (fn: (s: unknown) => void) => fn({ currentRoundTripTime: rttSeconds }),
      }),
  };
}

/** Put a raw control packet on the wire, as a hostile or buggy peer would. */
function rawSend(net: Multiplayer, toPeer: string, msg: unknown): void {
  const conns = (net as unknown as {
    conns: Map<string, { send(d: unknown): void }>;
  }).conns;
  const conn = conns.get(toPeer);
  if (!conn) throw new Error(`no connection to ${toPeer}`);
  conn.send(JSON.stringify(msg));
}

// ---------------------------------------------------------------------------
// The room
// ---------------------------------------------------------------------------

console.log("\n[room]");
const host = makePilot();
host.net.open("ALPHA", "MAVERICK", "tomcat");
await flush();
const goose = makePilot();
goose.net.join("ALPHA", "GOOSE", "hornet");
await flush();

const slider = makePilot();
slider.net.join("ALPHA", "SLIDER", "tomcat");
await flush();

// The host announces itself as the room peer id: wingmen address it by that.
const hostId = host.net.snapshot.self;
const roster = () => host.net.snapshot.pilots.map((p) => p.name);
check("the wingmen are on the host's roster", roster().join() === "GOOSE,SLIDER", roster().join());

// ---------------------------------------------------------------------------
// 1. damage claims
// ---------------------------------------------------------------------------

console.log("\n[damage claims]");
const banditId = 7;
rawSend(goose.net, hostId, { t: "hit", id: banditId, dmg: 20 });
rawSend(goose.net, hostId, { t: "cvhit", dmg: 33 });
await flush();
check(
  "a wingman's bandit damage still lands",
  host.hits.length === 1 && host.hits[0].id === banditId && host.hits[0].dmg === 20,
  JSON.stringify(host.hits),
);
check("a wingman's carrier damage still lands", host.cvHits.length === 1 && host.cvHits[0] === 33, JSON.stringify(host.cvHits));

// JSON has no NaN: a hostile packet that meant NaN arrives as null. A negative
// hull is the other half of the same hole — it healed the target instead.
rawSend(goose.net, hostId, { t: "hit", id: banditId, dmg: null });
rawSend(goose.net, hostId, { t: "hit", id: banditId, dmg: -50 });
rawSend(goose.net, hostId, { t: "hit", id: banditId });
rawSend(goose.net, hostId, { t: "cvhit", dmg: null });
rawSend(goose.net, hostId, { t: "cvhit", dmg: -10 });
await flush();
check(
  "a non-numeric or negative claim cannot poison the hull",
  host.hits.length === 1 && host.cvHits.length === 1,
  JSON.stringify([host.hits.length, host.cvHits.length]),
);

// The hull itself is the last line of defence: a claim that reaches the sim has
// to leave a real, finite hull behind — a NaN used to make a bandit (or the
// enemy carrier) impossible to kill for the rest of the sortie.
const scene = new Scene();
const fight = new Dogfight(scene, new ExplosionField(scene, "low"));
const player = spawnAircraft("carrier", 0);
player.onGround = false;
player.airborne = true;
player.gearT = 0;
player.pos.set(500, 600, 500);
fight.begin(player);
for (let i = 0; i < 1800; i++) {
  player.time += 1 / 120;
  fight.step(1 / 120, player, false);
}
const bandits = fight.enemySnapshot().bandits;
check("the fight launched its first bandits", bandits.length > 0, String(bandits.length));
const bandit = bandits[0];
const banditHp = () => fight.enemySnapshot().bandits.find((b) => b.id === bandit.id)?.hp ?? -1;
const wholeHull = banditHp();
fight.applyRemoteHit(bandit.id, Number.NaN, player);
fight.applyRemoteHit(bandit.id, -50, player);
check(
  "a NaN or negative bandit claim cannot poison the hull",
  banditHp() === wholeHull,
  `${banditHp()} vs ${wholeHull}`,
);

const carrierHp = () => fight.hud(player).carrier?.hp ?? -1;
check("the hostile carrier starts whole", carrierHp() === 100, String(carrierHp()));
fight.applyRemoteCarrierHit(1e9, player);
check("an absurd carrier claim is clamped to one big hit", carrierHp() === 10, String(carrierHp()));
fight.applyRemoteCarrierHit(Number.NaN, player);
fight.applyRemoteCarrierHit(-40, player);
check(
  "a NaN or negative carrier claim cannot poison or heal the hull",
  carrierHp() === 10,
  String(carrierHp()),
);
fight.clear();

// ---------------------------------------------------------------------------
// 2. the radio
// ---------------------------------------------------------------------------

console.log("\n[radio]");
rawSend(goose.net, hostId, { t: "chat", from: "MAVERICK", text: "who is this" });
await flush();
check(
  "a line is credited to the roster callsign, not the packet",
  host.heard.length === 1 && host.heard[0].from === "GOOSE" && host.heard[0].text === "who is this",
  JSON.stringify(host.heard),
);

// ---------------------------------------------------------------------------
// 3. leaving the room
// ---------------------------------------------------------------------------

console.log("\n[leaving]");
// A wingman announces its *own* departure: the id in the payload is redundant,
// and honouring it let one pilot eject another.
goose.net.leave();
await flush();
check("a real departure still clears its roster entry", roster().join() === "SLIDER", roster().join());

const goose2 = makePilot();
goose2.net.join("ALPHA", "GOOSE", "hornet");
await flush();
check("the wingman is back", roster().join() === "GOOSE,SLIDER", roster().join());

const sliderId = host.net.snapshot.pilots.find((p) => p.name === "SLIDER")!.id;
rawSend(goose2.net, hostId, { t: "bye", id: sliderId });
await flush();
check(
  "a forged bye cannot eject the pilot it names",
  roster().includes("SLIDER") && !roster().includes("GOOSE"),
  roster().join(),
);

// ---------------------------------------------------------------------------
// 5. a hostile peer, a fresh room
// ---------------------------------------------------------------------------

console.log("\n[hostile frames]");
const h2 = makePilot();
h2.net.open("BRAVO", "ICEMAN", "tomcat");
await flush();
const w1 = makePilot();
w1.net.join("BRAVO", "JESTER", "hornet");
await flush();
const w2 = makePilot();
w2.net.join("BRAVO", "MERLIN", "tomcat");
await flush();

const h2Id = h2.net.snapshot.self;
const w1Id = h2.net.snapshot.pilots.find((p) => p.name === "JESTER")!.id;
const w2Id = h2.net.snapshot.pilots.find((p) => p.name === "MERLIN")!.id;
check("the second room is up", h2.net.snapshot.pilots.length === 2, JSON.stringify(h2.net.snapshot.pilots));

// Nothing was type-checked before it was used: `.trim()` on a number and
// `.replace()` on an object both threw out of the data handler, which kills
// that one message and leaves a warning in the pilot's console.
const junk: unknown[] = [
  { t: "chat", from: "ICE", text: 123 },
  { t: "chat", text: { $: "x" } },
  { t: "name", name: null, aircraft: {} },
  { t: "hello", name: 42, aircraft: 9 },
  { t: "roster" },
  { t: "join" },
  { t: "launch", mission: "carrier", carrier: "abc" },
  { t: "mode", mode: 12 },
  { t: "battleState" },
  { t: "nonsense" },
  "not even an object",
];
let threw = 0;
for (const frame of junk) {
  if (deliver(h2.net, w1Id, frame) === "threw") threw++;
  if (deliver(w1.net, w2Id, frame) === "threw") threw++;
}
check("no malformed frame throws out of the data handler", threw === 0, `${threw} threw`);
check(
  "the room survives the burst",
  h2.net.snapshot.pilots.length === 2 && w1.net.snapshot.pilots.length === 2,
  JSON.stringify([h2.net.snapshot.pilots.length, w1.net.snapshot.pilots.length]),
);

// The airframe is the one field that goes straight to the mesh builder.
deliver(h2.net, w1Id, { t: "hello", name: "JESTER", aircraft: "not-a-jet" });
const filed = h2.net.snapshot.pilots.find((p) => p.id === w1Id);
check("an unknown airframe collapses to a real one", filed?.aircraft === "tomcat", String(filed?.aircraft));

// ---------------------------------------------------------------------------
// 6. only the room's host speaks with the room's authority
// ---------------------------------------------------------------------------

console.log("\n[host authority]");
deliver(h2.net, w1Id, { t: "hello", name: "JESTER", aircraft: "hornet", host: true });
await flush();
check(
  "a joiner cannot claim the room by saying so",
  h2.net.snapshot.pilots.find((p) => p.id === w1Id)?.host === false,
  String(h2.net.snapshot.pilots.find((p) => p.id === w1Id)?.host),
);

// With the forged flag accepted, every host-only command opened up with it.
deliver(h2.net, w1Id, { t: "launch", mission: "carrier", carrier: 0 });
await flush();
check("a wingman cannot launch the room", h2.launches.length === 0, JSON.stringify(h2.launches));
deliver(h2.net, w1Id, { t: "launch", mission: "carrier", carrier: "abc" });
await flush();
check("a non-numeric boat index cannot reach the sim", h2.launches.length === 0, JSON.stringify(h2.launches));

// The real host still can — the guard is authority, not a mute switch.
deliver(w1.net, h2Id, { t: "launch", mission: "carrier", carrier: 0 });
await flush();
check("the room host's own launch lands", w1.launches.length === 1, JSON.stringify(w1.launches));
deliver(w1.net, h2Id, { t: "launch", mission: "carrier", carrier: 3 });
await flush();
check("the host's boat index arrives intact", w1.launches[1]?.carrier === 3, JSON.stringify(w1.launches));

deliver(w1.net, h2Id, { t: "mode", mode: "strike" });
await flush();
check("the host's mission profile lands", w1.modes.join() === "strike", w1.modes.join());

deliver(w1.net, w2Id, { t: "hello", name: "MERLIN", aircraft: "tomcat", host: true });
deliver(w1.net, w2Id, { t: "mode", mode: "versus" });
deliver(w1.net, w2Id, { t: "battleState", snapshot: { match: 7, pilots: [] } });
await flush();
check("a wingman cannot rewrite the mission profile", w1.modes.join() === "strike", w1.modes.join());
check("a wingman cannot fabricate the scoreboard", w1.battleStates === 0, String(w1.battleStates));

deliver(w1.net, h2Id, { t: "battleState", snapshot: { match: 7, pilots: [] } });
await flush();
check("the host's scoreboard reaches the room", w1.battleStates === 1, String(w1.battleStates));

// Rosters are the host's to hand out: a forged one filed strangers on ours and
// (through the dial tie-break) made us dial ids of the sender's choosing.
const ghosts = Array.from({ length: 40 }, (_, i) => ({
  id: `f14sim-bravo-ghost${i}`,
  name: `GHOST${i}`,
  aircraft: "tomcat",
  host: true,
}));
deliver(w1.net, w2Id, { t: "roster", peers: ghosts, mode: "versus" });
deliver(w1.net, w2Id, { t: "join", peer: { id: "f14sim-bravo-stray", name: "STRAY", aircraft: "tomcat" } });
await flush();
const w1Names = w1.net.snapshot.pilots.map((p) => p.name);
check("a wingman's forged roster is ignored", !w1Names.some((n) => n.startsWith("GHOST")), w1Names.join());
check("a wingman's forged join is ignored", !w1Names.includes("STRAY"), w1Names.join());
check("a wingman's forged roster cannot set the mission profile", w1.modes.join() === "strike", w1.modes.join());

// ---------------------------------------------------------------------------
// 7. ceilings
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 7. the scoreboard is sent when it changes, not on a clock
// ---------------------------------------------------------------------------

console.log("\n[scoreboard]");
const score = { match: 7, pilots: [] };
// Baseline: section 6 already put one on each of them.
const baseW1 = w1.battleStates;
const baseW2 = w2.battleStates;
h2.net.publishBattle(score);
await flush();
h2.net.publishBattle(score);
await flush();
h2.net.publishBattle({ ...score });
await flush();
check(
  "an unchanged scoreboard is not re-broadcast",
  w1.battleStates === baseW1 + 1 && w2.battleStates === baseW2 + 1,
  JSON.stringify([w1.battleStates - baseW1, w2.battleStates - baseW2]),
);
h2.net.publishBattle({
  match: 7,
  pilots: [{ id: w1Id, name: "JESTER", hp: 80, kills: 1, deaths: 0, life: 2, shield: false, respawnIn: 0, ready: true }],
});
await flush();
check(
  "a changed scoreboard goes out at once",
  w1.battleStates === baseW1 + 2 && w2.battleStates === baseW2 + 2,
  JSON.stringify([w1.battleStates - baseW1, w2.battleStates - baseW2]),
);

// ---------------------------------------------------------------------------
// 8. every link is measured
// ---------------------------------------------------------------------------

console.log("\n[link delay]");
installStats(h2.net, w1Id, 0.02);
installStats(h2.net, w2Id, 0.4);
const poll = (t: number) => (h2.net as unknown as { pollRtt(now: number): void }).pollRtt(t);
poll(10_000); await flush();
poll(12_000); await flush();
poll(14_000); await flush();
poll(16_000); await flush();
const measured = new Map(h2.links.map((l) => [l.id, l.ms]));
check(
  "every link is measured, not just the first",
  measured.size === 2,
  `${measured.size} of 2 (${[...measured.keys()].join()})`,
);
check(
  "each wingman gets its own one-way delay",
  Math.abs((measured.get(w1Id) ?? -1) - 10) < 0.001 && Math.abs((measured.get(w2Id) ?? -1) - 200) < 0.001,
  JSON.stringify([...measured]),
);

// ---------------------------------------------------------------------------
// 9. losing the room host
// ---------------------------------------------------------------------------

console.log("\n[losing the host link]");
// Give somebody else the promotion race, so this pilot must re-dial rather
// than take the room over — the case that used to strand it.
deliver(w1.net, h2Id, { t: "join", peer: { id: "0", name: "OPENER", aircraft: "tomcat", host: false } });
await flush();
const toHost = (w1.net as unknown as { conns: Map<string, { open: boolean; emit(e: string): void }> }).conns.get(h2Id);
if (!toHost) throw new Error("no host link to drop");
toHost.open = false; // the path died: the other end never hears about it
toHost.emit("close");
await flush();
check(
  "the dead host link is off the roster",
  !w1.net.snapshot.pilots.some((p) => p.host),
  JSON.stringify(w1.net.snapshot.pilots),
);
advance(1500);
await flush();
check(
  "the room host link is re-dialled",
  w1.net.snapshot.pilots.some((p) => p.host && p.id === h2Id),
  JSON.stringify(w1.net.snapshot.pilots),
);

console.log("\n[ceilings]");
// The host is allowed to introduce the room, but not to grow it forever.
const flood = Array.from({ length: 60 }, (_, i) => ({
  id: `f14sim-bravo-p${i}`,
  name: `P${i}`,
  aircraft: "tomcat",
  host: false,
}));
deliver(w1.net, h2Id, { t: "roster", peers: flood, mode: "cruise" });
await flush();
check(
  "a flood of roster entries stops at the room ceiling",
  w1.net.snapshot.pilots.length <= 12,
  String(w1.net.snapshot.pilots.length),
);

// The fight stream has a bandit ceiling too: the count is a byte the sender
// chooses, and 255 of them would be 255 aircraft built on the host.
const empty = packEnemies({ carrier: null, bandits: [], wave: 1 }, 1);
const tooMany = new ArrayBuffer(30 + 200 * 40);
new Uint8Array(tooMany).set(new Uint8Array(empty));
new DataView(tooMany).setUint8(3, 200);
new Uint8Array(tooMany, tooMany.byteLength - 2).set(new Uint8Array(empty, 28, 2));
check("a snapshot claiming 200 bandits is rejected", unpackEnemies(tooMany) === null);
check("an honest snapshot still decodes", unpackEnemies(empty)?.bandits.length === 0);

console.log(failures === 0 ? "\nALL ROOM AUTHORITY CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
