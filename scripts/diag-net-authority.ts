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
//      a forged id cannot eject a wingman from the roster mid-flight.
//
// Usage: bun scripts/diag-net-authority.ts

import type { Peer } from "peerjs";
import { Scene } from "three";
import { Multiplayer, type ChatMsg } from "../src/net/multiplayer";
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
}

function makePilot(): Pilot {
  const rec: Pilot = {
    net: null as unknown as Multiplayer,
    heard: [],
    hits: [],
    cvHits: [],
  };
  rec.net = new Multiplayer(
    {
      onChat: (msg) => rec.heard.push(msg),
      onHit: (id, dmg) => rec.hits.push({ id, dmg }),
      onCarrierHit: (dmg) => rec.cvHits.push(dmg),
    },
    (id) => new MockPeer(broker, id) as unknown as Peer,
  );
  return rec;
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

console.log(failures === 0 ? "\nALL ROOM AUTHORITY CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
