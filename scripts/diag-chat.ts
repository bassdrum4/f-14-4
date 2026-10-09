// Headless room-radio verification: chat over the same mock signalling broker
// as the flow test, with no network and no browser.
//
// What this pins down:
//   1. a pilot's line reaches every other pilot on the mesh — including two
//      wingmen who are not linked through the host (full mesh, nobody relays),
//   2. lines carry the sender's callsign,
//   3. an empty (whitespace) line is never put on the wire,
//   4. an over-long line is cut at the cap before it leaves,
//   5. control characters and blank-line runs are cleaned on the way out,
//   6. talking while offline is a harmless no-op,
//   7. a rename mid-session is picked up by the next transmission.
//
// Usage: bun scripts/diag-chat.ts

import type { Peer } from "peerjs";
import { Multiplayer, CHAT_MAX, sanitizeChat, type ChatMsg } from "../src/net/multiplayer";

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
// Mock broker + peers (the same surface the flow test exercises)
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
// A pilot under test
// ---------------------------------------------------------------------------

function makePilot(name: string): { net: Multiplayer; heard: ChatMsg[] } {
  const rec = { net: null as unknown as Multiplayer, heard: [] as ChatMsg[] };
  rec.net = new Multiplayer(
    {
      onChat: (msg) => rec.heard.push(msg),
    },
    (id) => new MockPeer(broker, id) as unknown as Peer,
  );
  void name;
  return rec;
}

// ---------------------------------------------------------------------------
// 1. three pilots form the mesh
// ---------------------------------------------------------------------------

console.log("\n[mesh]");
const host = makePilot("host");
host.net.open("ALPHA", "MAVERICK", "tomcat");
await flush();

const goose = makePilot("goose");
goose.net.join("ALPHA", "GOOSE", "hornet");
await flush();

const slider = makePilot("slider");
slider.net.join("ALPHA", "SLIDER", "tomcat");
await flush();

check("all three are online",
  [host, goose, slider].every((p) => p.net.snapshot.status === "online"),
  [host, goose, slider].map((p) => p.net.snapshot.status).join(","));
check("the room is a full mesh (2 links per pilot)",
  host.net.snapshot.pilots.length === 2 &&
    goose.net.snapshot.pilots.length === 2 &&
    slider.net.snapshot.pilots.length === 2,
  JSON.stringify([host, goose, slider].map((p) => p.net.snapshot.pilots.length)));

// ---------------------------------------------------------------------------
// 2. the host speaks: both wingmen hear it
// ---------------------------------------------------------------------------

console.log("\n[the host transmits]");
host.net.sendChat("Bandits inbound, form up");
await flush();
check("both wingmen heard the host", goose.heard.length === 1 && slider.heard.length === 1,
  JSON.stringify([goose.heard, slider.heard]));
check("the line carries the sender's callsign",
  goose.heard[0]?.from === "MAVERICK" && slider.heard[0]?.from === "MAVERICK",
  JSON.stringify(goose.heard));
check("the text arrives intact",
  goose.heard[0]?.text === "Bandits inbound, form up", JSON.stringify(goose.heard[0]));
check("the sender is not its own audience", host.heard.length === 0);

// ---------------------------------------------------------------------------
// 3. a wingman speaks: the host and the other wingman hear it directly
// ---------------------------------------------------------------------------

console.log("\n[a wingman transmits]");
slider.net.sendChat("Copy, on your wing");
await flush();
check("the host heard the wingman", host.heard.length === 1, JSON.stringify(host.heard));
check("the other wingman heard it directly (no relay through the host)",
  goose.heard.length === 2 && goose.heard[1].from === "SLIDER",
  JSON.stringify(goose.heard));
check("each peer heard exactly its own transcript, once",
  host.heard.length === 1 && goose.heard.length === 2 && slider.heard.length === 1 &&
    !hasDuplicate(goose.heard) && !hasDuplicate(host.heard),
  JSON.stringify({ host: host.heard, goose: goose.heard, slider: slider.heard }));

// ---------------------------------------------------------------------------
// 4. what must never reach the wire
// ---------------------------------------------------------------------------

function hasDuplicate(lines: ChatMsg[]): boolean {
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].from === lines[i - 1].from && lines[i].text === lines[i - 1].text) return true;
  }
  return false;
}

const last = (lines: ChatMsg[]): ChatMsg | undefined => lines[lines.length - 1];

// ---------------------------------------------------------------------------
// 4. what must never reach the wire
// ---------------------------------------------------------------------------

const before = goose.heard.length + slider.heard.length;
host.net.sendChat("   \n\t  ");
await flush();
check("a whitespace-only line is dropped", goose.heard.length + slider.heard.length === before);

const long = "x".repeat(CHAT_MAX + 80);
host.net.sendChat(long);
await flush();
check("an over-long line is cut at the cap",
  last(goose.heard)?.text.length === CHAT_MAX && last(slider.heard)?.text.length === CHAT_MAX,
  `${last(goose.heard)?.text.length} / ${last(slider.heard)?.text.length}`);

host.net.sendChat("line one\n\n\n\nline two\x00\x07");
await flush();
check("control characters and blank-line runs are cleaned",
  last(goose.heard)?.text === "line one\nline two",
  JSON.stringify(last(goose.heard)?.text));

const offline = makePilot("idle");
offline.net.sendChat("anyone out there?");
await flush();
check("transmitting while offline is a harmless no-op", offline.heard.length === 0);
check("and nobody else heard it either", goose.heard.length + slider.heard.length === before + 4);

// ---------------------------------------------------------------------------
// 5. a rename rides the next transmission
// ---------------------------------------------------------------------------

console.log("\n[rename mid-session]");
goose.net.setName("GOOSE 2");
goose.net.sendChat("New callsign, same jet");
await flush();
check("the host heard the new callsign",
  last(host.heard)?.from === "GOOSE 2" && last(host.heard)?.text === "New callsign, same jet",
  JSON.stringify(last(host.heard)));

// ---------------------------------------------------------------------------
// 6. sanitizeChat itself
// ---------------------------------------------------------------------------

console.log("\n[sanitizer]");
check("control characters become spaces", sanitizeChat("a\x01b\x1fc") === "a b c",
  JSON.stringify(sanitizeChat("a\x01b\x1fc")));
check("the cap is enforced", sanitizeChat("y".repeat(400)).length === CHAT_MAX);
check("leading and trailing blanks go", sanitizeChat("  hi  ") === "hi");

host.net.dispose();
goose.net.dispose();
slider.net.dispose();

console.log(failures === 0 ? "\nALL ROOM RADIO CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
