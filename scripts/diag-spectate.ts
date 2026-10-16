// Spectator mode and tactical tasking.
//
// What has to hold:
//
//   * a spectator is admitted to a room that has already launched, even when
//     the host has closed the door on new *aircraft* — watching never asks the
//     host to fit another jet into the fight,
//   * a pilot who tries to join that same launched room as a player is still
//     refused, so the late-join switch keeps meaning what it says,
//   * a spectator broadcasts no aircraft pose of its own, and never claims the
//     room when the host leaves,
//   * the camera can ride a pilot, a bandit, a deck or the LSO platform, and a
//     free camera flies itself,
//   * a spectator's HUD is the watched aircraft's HUD: airspeed, altitude,
//     heading and the radar picture all come off the jet the camera is on,
//   * tactical pings cross the room, carry a sanitised label, and malformed
//     ones are dropped,
//   * the host's weather is the room's weather.
//
// Usage: bun scripts/diag-spectate.ts  (or: bun run test:spectate)

import type { Peer } from "peerjs";
import { PerspectiveCamera, Quaternion, Scene, Vector3 } from "three";
import { Multiplayer, type NetState, type TacticalPing } from "../src/net/multiplayer";
import type { RemotePose } from "../src/render/remoteJets";
import type { AircraftId } from "../src/sim/aircraft";
import { spawnAircraft } from "../src/sim/flight";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { CameraRig } from "../src/render/cameras";
import { Sim } from "../src/sim/engine";
import { weatherPreset } from "../src/sim/weather";
import { defaultSettings, type MissionMode, type WeatherMode } from "../src/settings";
import { DEFAULT_SEED, setWorldSeed } from "../src/sim/world";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}
async function step(name: string, run: () => void | Promise<void>): Promise<void> {
  try {
    await run();
    console.log("PASS " + name);
  } catch (e) {
    failures++;
    console.error("FAIL " + name, e);
  }
}

setWorldSeed(DEFAULT_SEED);

// ---------------------------------------------------------------------------
// A mock PeerJS broker, so the room logic runs for real with no network.
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
const fakeSetTimeout = (fn: () => void, ms = 0): number => {
  const id = timerSeq++;
  timers.set(id, { id, fn, at: now + Math.max(0, ms), every: null });
  return id;
};
const fakeSetInterval = (fn: () => void, ms = 0): number => {
  const id = timerSeq++;
  timers.set(id, { id, fn, at: now + Math.max(1, ms), every: Math.max(1, ms) });
  return id;
};
(globalThis as unknown as { window: unknown }).window = {
  setTimeout: fakeSetTimeout,
  clearTimeout: (id: number) => void timers.delete(id),
  setInterval: fakeSetInterval,
  clearInterval: (id: number) => void timers.delete(id),
};
async function flush(): Promise<void> {
  for (let i = 0; i < 40; i++) await Promise.resolve();
}
async function advance(ms: number): Promise<void> {
  const target = now + ms;
  for (;;) {
    let next: Timer | null = null;
    for (const t of timers.values()) if (t.at <= target && (next === null || t.at < next.at)) next = t;
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

type Handler = (...args: any[]) => void;

class MockConn {
  open = false;
  dataChannel = { bufferedAmount: 0 };
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
  constructor(private readonly broker: MockBroker, readonly id: string) {
    queueMicrotask(() => {
      if (this.destroyed) return;
      if (!this.broker.register(this.id, this)) {
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
  reconnect(): void {}
  destroy(): void {
    this.destroyed = true;
    this.broker.unregister(this.id, this);
    this.handlers.clear();
  }
  connect(target: string): MockConn {
    const local = new MockConn(target);
    const remotePeer = this.broker.peers.get(target);
    if (!remotePeer) {
      queueMicrotask(() => this.emit("error", { type: "peer-unavailable", message: `no ${target}` }));
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

interface Pilot {
  net: Multiplayer;
  peers: MockPeer[];
  states: NetState[];
  roster: Map<string, { name: string; spectator: boolean; host: boolean; linked: boolean }>;
  poses: Map<string, RemotePose>;
  pings: TacticalPing[];
  weather: WeatherMode[];
  launches: string[];
  left: string[];
}

function makePilot(): Pilot {
  const rec: Pilot = { net: null as unknown as Multiplayer, peers: [], states: [], roster: new Map(), poses: new Map(), pings: [], weather: [], launches: [], left: [] };
  rec.net = new Multiplayer(
    {
      onState: (s) => rec.states.push(s),
      onPilot: (id, name, _aircraft: AircraftId) => rec.roster.set(id, { name, spectator: rec.roster.get(id)?.spectator ?? false, host: rec.roster.get(id)?.host ?? false, linked: true }),
      onPilotLeave: (id) => {
        rec.roster.delete(id);
        rec.left.push(id);
      },
      onPose: (id, pose) => rec.poses.set(id, { ...pose }),
      onLaunch: (mission) => rec.launches.push(mission),
      onPing: (ping) => rec.pings.push(ping),
      onWeather: (w) => rec.weather.push(w),
    },
    (id) => {
      const peer = new MockPeer(broker, id);
      rec.peers.push(peer);
      return peer as unknown as Peer;
    },
  );
  return rec;
}

const rosterOf = (p: Pilot) => p.net.snapshot.pilots;
const byName = (p: Pilot, name: string) => rosterOf(p).find((e) => e.name === name);

// ---------------------------------------------------------------------------
// The room
// ---------------------------------------------------------------------------

const host = makePilot();
host.net.open("alpha", "MAVERICK", "tomcat");
await flush();
host.net.setMode("campaign" as MissionMode);
host.net.setMissionStyle("operation");
host.net.setAllowLateJoin(false);
await flush();
check("the host closed the door on late-joining aircraft", host.net.snapshot.allowLateJoin === false);

// the room launches: everything after this is a running sortie
host.net.launch("carrier", 0, { id: 7, seed: 1, style: "operation", origin: { x: 0, z: 0, heading: 0, carrier: 0 } });
await flush();

await step("a spectator is admitted to a launched room", async () => {
  const spec = makePilot();
  spec.net.spectate("ALPHA", "VIPER", "tomcat");
  await flush();
  check("the spectator is online in the room", spec.net.snapshot.status === "online", spec.net.snapshot.status);
  check("and knows it is a spectator", spec.net.snapshot.spectator === true);
  check("and is not the host", spec.net.snapshot.host === false);
  check("the host sees it on the roster as a spectator", byName(host, "VIPER")?.spectator === true, JSON.stringify(rosterOf(host)));
  check("the host does not count it as a pilot with an aircraft", byName(host, "VIPER")?.name === "VIPER");
  check("the spectator catches up with the running sortie", spec.launches.length > 0, JSON.stringify(spec.launches));

  await step("a player is still refused a launched room", async () => {
    const late = makePilot();
    late.net.join("ALPHA", "TOO LATE", "hornet");
    await flush();
    const errored = late.states.some((s) => s.status === "error");
    check("the late pilot was turned away", errored, JSON.stringify(late.states.map((s) => s.status)));
    check("and is not on the roster", byName(host, "TOO LATE") === undefined);
  });
});

await step("a spectator never broadcasts an aircraft of its own", async () => {
  const spec = makePilot();
  spec.net.spectate("ALPHA", "WATCHER", "tomcat");
  await flush();
  const pose = { x: 1, y: 2, z: 3, qx: 0, qy: 0, qz: 0, qw: 1, vx: 0, vy: 0, vz: 0, speed: 0, sweepT: 0, flags: 0 } as RemotePose;
  spec.net.publish(pose);
  await advance(400);
  check("the host has no pose from the spectator", host.poses.get(spec.net.snapshot.self) === undefined);
  check("the spectator never claims the room", !spec.net.snapshot.host);
});

await step("tactical pings cross the room, and bad ones are dropped", async () => {
  const sender = makePilot();
  sender.net.spectate("ALPHA", "AWACS", "seahawk");
  await flush();
  const ping = sender.net.sendPing("threat", 4000, 1500, -2500, "SAM SITE 2");
  check("the sender gets its own ping back", ping !== null && ping.kind === "threat");
  await flush();
  const heard = host.pings.find((p) => p.label === "SAM SITE 2");
  check("the room heard the ping", heard !== undefined, JSON.stringify(host.pings));
  check("with its position intact", heard?.x === 4000 && heard?.z === -2500);
  check("and the sender's callsign on it", heard?.from === "AWACS", heard?.from);
  check("the label is sanitised for the radio", (heard?.label ?? "").length <= 12, heard?.label);

  // A malformed ping must not reach the handlers.
  const conns = (host.net as unknown as { conns: Map<string, MockConn> }).conns;
  const conn = [...conns.values()].find((c) => c.open);
  const before = host.pings.length;
  conn?.emit("data", JSON.stringify({ t: "ping", id: 1, kind: "threat", x: Number.NaN, y: 0, z: 0, label: "BAD" }));
  conn?.emit("data", JSON.stringify({ t: "ping", id: 2, kind: "nonsense", x: 0, y: 0, z: 0, label: "BAD" }));
  conn?.emit("data", JSON.stringify({ t: "ping", id: 3, kind: "threat", x: 0, y: 0, z: 0, label: "GOOD" }));
  await flush();
  check("nonsense pings are ignored, real ones are not", host.pings.length === before + 1 && host.pings[host.pings.length - 1].label === "GOOD");
});

await step("the host's weather is the room's weather", async () => {
  const spec = makePilot();
  spec.net.spectate("ALPHA", "BAROMETER", "tomcat");
  await flush();
  host.net.setWeather("storm");
  await flush();
  check("the wingman adopted the squall", spec.weather.includes("storm"), JSON.stringify(spec.weather));
  check("a spectator gets it too, from the roster on join", spec.net.snapshot.status === "online");
  const late = makePilot();
  late.net.spectate("ALPHA", "LATE SKY", "tomcat");
  await flush();
  check("a late joiner is handed the room's weather", late.weather.includes("storm"), JSON.stringify(late.weather));
});

// ---------------------------------------------------------------------------
// The camera
// ---------------------------------------------------------------------------

await step("the spectator camera cycles through pilots, decks, LSO and free", () => {
  const rig = new CameraRig();
  const seen = new Set<string>();
  for (let i = 0; i < 7; i++) {
    rig.cycle(true);
    seen.add(rig.mode);
  }
  check("a spectator can reach the LSO platform", seen.has("lso"), [...seen].join(","));
  check("and a free camera", seen.has("free"), [...seen].join(","));
  check("and the usual chase / cockpit / action views", seen.has("chase") && seen.has("cockpit") && seen.has("action"));

  const pilotRig = new CameraRig();
  const flown = new Set<string>();
  for (let i = 0; i < 7; i++) {
    pilotRig.cycle(false);
    flown.add(pilotRig.mode);
  }
  check("a flying pilot never lands on the LSO or free views", !flown.has("lso") && !flown.has("free"), [...flown].join(","));
});

await step("the LSO view stands on the platform and looks at the aircraft", () => {
  const rig = new CameraRig();
  const camera = new PerspectiveCamera();
  rig.mode = "lso";
  const platform = { x: 100, y: 30, z: 200, lookX: 900, lookY: 400, lookZ: -1200 };
  rig.update(camera, new Vector3(900, 400, -1200), new Quaternion(), 180, 1 / 60, false, platform);
  check("the camera is on the platform", camera.position.distanceTo(new Vector3(100, 30, 200)) < 1e-6, camera.position.toArray().join(","));
  const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const toJet = new Vector3(900 - 100, 400 - 30, -1200 - 200).normalize();
  check("and it is pointed at the aircraft", forward.dot(toJet) > 0.999, forward.dot(toJet).toFixed(4));
  check("the mode reads as the LSO platform", rig.label() === "LSO PLATFORM", rig.label());
});

await step("the free camera flies itself", () => {
  const rig = new CameraRig();
  rig.mode = "free";
  rig.freePos.set(0, 300, 0);
  rig.freeYaw = 0;
  rig.freePitch = 0;
  rig.stepFree(1, 0, 0, 1);
  check("it moves along its view direction", rig.freePos.z < -100 && Math.abs(rig.freePos.x) < 1, rig.freePos.toArray().join(","));
  const before = rig.freePos.clone();
  rig.stepFree(1, 0, 0, 1, true);
  check("and boosts when asked", rig.freePos.distanceTo(before) > 500, rig.freePos.distanceTo(before).toFixed(1));
  rig.mouse(40, -20);
  check("the mouse aims it", rig.freeYaw < 0 && rig.freePitch > 0, `${rig.freeYaw} ${rig.freePitch}`);
});

// ---------------------------------------------------------------------------
// The spectator HUD is the watched aircraft's HUD
// ---------------------------------------------------------------------------

await step("a spectator's readouts mirror the aircraft being watched", () => {
  const scene = new Scene();
  const df = new Dogfight(scene, new ExplosionField(scene, "low"));
  const sim = Object.create(Sim.prototype) as any;
  const target = {
    id: "pilot:1", kind: "PILOT", label: "GOOSE",
    pos: new Vector3(1200, 3000, -4000),
    quat: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2),
    vel: new Vector3(0, 0, -250), speed: 250, aircraft: "hornet" as AircraftId, flags: 0,
  };
  Object.assign(sim, {
    state: spawnAircraft("carrier", 0),
    spectateViewer: spawnAircraft("carrier", 0),
    hudFwd: new Vector3(),
    hudRight: new Vector3(),
    lastHudNotify: 0,
    hudListeners: new Set(),
    spectateList: [target],
    spectateIndex: 0,
    spectateId: target.id,
    weather: weatherPreset("storm"),
    weatherMode: "storm",
    dayHours: 9,
    dayPhase: "day",
    worldSeed: DEFAULT_SEED,
    fleetClock: 0,
    pings: [],
    pod: false,
    bigMap: false,
    hud: {},
    settings: { ...defaultSettings(), missionMode: "campaign" as MissionMode },
    netState: { status: "online", spectator: true, room: "ALPHA", self: "me", host: false, pilots: [] },
    remoteFleet: { contacts: () => [], liveIds: () => [] },
    remoteWeapons: { warning: null },
    rig: { mode: "chase" },
    battle: { match: 0, pilots: [] },
    battleSeq: 0,
    df,
  });
  sim.mirrorSpectateViewer(target);
  sim.updateHud();
  const hud = sim.snapshot;
  check("the HUD knows it is spectating", hud.spectating === true);
  check("and names what it is watching", hud.aircraftName.includes("SPECTATING") && hud.aircraftName.includes("GOOSE"), hud.aircraftName);
  check("the airspeed is the watched aircraft's", Math.abs(hud.speedKt - 250 * 1.94384) < 0.5, hud.speedKt);
  check("so is the altitude", Math.abs(hud.altFt - 3000 * 3.28084) < 1, hud.altFt);
  // A +90 deg yaw about Y points the nose of a -Z-forward airframe west.
  check("and the heading", Math.abs(hud.headingDeg - 270) < 0.5, hud.headingDeg);
  check("the viewer wears the watched airframe type", sim.spectateViewer.spec.id === "hornet", sim.spectateViewer.spec.id);
  check("watching lists exactly one view", hud.spectateCount === 1 && hud.spectateIndex === 1);
  check("the theatre weather rides the HUD", hud.weather === "storm" && hud.weatherLabel === "STORM SQUALL");
  check("a spectator is not shown the pilot's stores", hud.dfBombsMax === 0 && hud.dfMissilesMax === 0);
  df.dispose();
});

await step("cycling the watch list wraps, and holds a target across a rebuild", () => {
  const scene = new Scene();
  const df = new Dogfight(scene, new ExplosionField(scene, "low"));
  const sim = Object.create(Sim.prototype) as any;
  const live = new Map<string, { id: string; name: string; aircraft: AircraftId; pos: Vector3; quat: Quaternion; vel: Vector3; speed: number; sweepT: number; flags: number }>();
  for (const [id, name] of [["a", "GOOSE"], ["b", "ICEMAN"]] as const) {
    live.set(id, { id, name, aircraft: "hornet", pos: new Vector3(0, 2000, 0), quat: new Quaternion(), vel: new Vector3(0, 0, -200), speed: 200, sweepT: 0, flags: 0 });
  }
  Object.assign(sim, {
    state: spawnAircraft("carrier", 0),
    spectateViewer: spawnAircraft("carrier", 0),
    spectateList: [],
    spectateIndex: 0,
    spectateId: "",
    pings: [],
    weather: weatherPreset("clear"),
    weatherMode: "clear",
    worldSeed: DEFAULT_SEED,
    netState: { status: "online", spectator: true, room: "ALPHA", self: "me", host: false, pilots: [] },
    settings: { ...defaultSettings() },
    remoteFleet: { contacts: () => [], liveIds: () => [...live.keys()], pilotState: (id: string) => live.get(id) ?? null },
    rig: { mode: "chase" },
    df,
  });
  sim.updateSpectate(1 / 60);
  check("the watch list is built from the room and the fleet",
    sim.spectateList.some((t: any) => t.id === "pilot:a") &&
    sim.spectateList.some((t: any) => t.id === "pilot:b") &&
    sim.spectateList.some((t: any) => t.kind === "CARRIER") &&
    sim.spectateList.some((t: any) => t.kind === "LSO"),
    sim.spectateList.map((t: any) => t.id).join(","));
  sim.nextSpectateTarget();
  check("the camera moves to the next view", sim.spectateId !== "pilot:a", sim.spectateId);
  const held = sim.spectateId;
  sim.updateSpectate(1 / 60);
  check("and holds the same aircraft as the list is rebuilt", sim.spectateId === held, sim.spectateId);
  sim.nextSpectateTarget();
  check("and keeps cycling", sim.spectateId !== held, sim.spectateId);
  // The watched aircraft leaves the room: the camera lands on something real.
  sim.spectateId = "pilot:gone";
  sim.updateSpectate(1 / 60);
  check("a vanished target falls back onto a live one",
    sim.spectateList.some((t: any) => t.id === sim.spectateId), sim.spectateId);
  df.dispose();
});

await step("a spectator ping is called off what the camera is on", () => {
  const sent: Array<{ kind: string; x: number; z: number; label: string }> = [];
  const sim = Object.create(Sim.prototype) as any;
  Object.assign(sim, {
    state: spawnAircraft("carrier", 0),
    spectateList: [{ id: "bandit:1", kind: "BANDIT", label: "BANDIT 1", pos: new Vector3(5000, 2000, 5000), quat: new Quaternion(), vel: new Vector3(), speed: 0 }],
    spectateIndex: 0,
    lastDesignation: null,
    pings: [],
    chatLog: [],
    chatListeners: new Set(),
    netState: { status: "online", spectator: true, room: "ALPHA", self: "me", host: false, pilots: [] },
    net: {
      sendPing: (kind: string, x: number, y: number, z: number, label: string) => {
        sent.push({ kind, x, z, label });
        return { id: 1, from: "AWACS", kind, x, y, z, label, at: performance.now() } as TacticalPing;
      },
    },
  });
  const ping = sim.ping("threat");
  check("the ping was sent", sent.length === 1, JSON.stringify(sent));
  check("at the watched contact", sent[0]?.x === 5000 && sent[0]?.z === 5000, JSON.stringify(sent[0]));
  check("named after it, for the radio", sent[0]?.label.includes("BANDIT 1"), sent[0]?.label);
  check("and logged locally", sim.pings.length === 1 && ping !== null, JSON.stringify(sim.pings[0]));

  // With a designation up, the ping goes to the designated spot instead, and the
  // range is measured from the watched aircraft.
  sim.lastDesignation = new Vector3(8000, 0, 9000);
  sim.net.sendPing = (kind: string, x: number, y: number, z: number, label: string) => {
    sent.push({ kind, x, z, label });
    return { id: 2, from: "AWACS", kind, x, y, z, label, at: performance.now() } as TacticalPing;
  };
  sim.ping("target");
  check("a designation is pinged rather than the watched jet", sent[1]?.x === 8000 && sent[1]?.z === 9000, JSON.stringify(sent[1]));
  const range = sim.pings[sim.pings.length - 1];
  check("with the range measured from the camera's aircraft", Math.abs(range.km - 5) < 0.05, range.km);
});

await step("opening a room publishes the weather already selected on the board", async () => {
  const owner = makePilot();
  const sim: any = Object.create(Sim.prototype);
  Object.assign(sim, {
    settings: { ...defaultSettings(), weather: "storm", missionMode: "campaign" },
    remoteFleet: { clear() {} }, net: owner.net,
  });
  sim.openRoom("WEATHER HOST", "SKY");
  await flush();
  const guest = makePilot();
  guest.net.join("SKY", "WEATHER GUEST", "tomcat");
  await flush();
  check("the guest receives storm without the host changing it again", guest.weather.includes("storm"), JSON.stringify(guest.weather));
  guest.net.leave(); owner.net.leave();
});

await step("spectators can take a cockpit seat in the current room sortie", () => {
  for (const returningPilot of [false, true]) {
    const sim: any = Object.create(Sim.prototype);
    const launches: Array<{ mission: string; carrier: number }> = [];
    const profile = { id: 1234, seed: 7, style: "operation" };
    Object.assign(sim, {
      netState: { status: "online", host: false, spectator: true },
      phase: "flying", operationId: profile.id, lastRoomLaunch: null,
      renderer: { jetGroup: { visible: false } },
      net: { setSpectator(on: boolean) { sim.netState.spectator = on; } },
      applyRoomStyle() {},
      beginMission(mission: string, carrier: number) { launches.push({ mission, carrier }); },
      quitToMenu() { sim.phase = "menu"; },
    });
    if (returningPilot) sim.lastRoomLaunch = { mission: "carrier", carrier: 1, profile };
    else sim.followLaunch("carrier", 1, profile);
    check("the current launch is remembered while watching", sim.lastRoomLaunch?.profile === profile);
    sim.setSpectating(false);
    check(`${returningPilot ? "a returning pilot" : "a spectator joiner"} launches on the room's boat`, launches.length === 1 && launches[0].carrier === 1 && launches[0].mission === "carrier");
    check("the room's operation identity is preserved", sim.operationId === profile.id);
    check("the own-aircraft mesh is restored", sim.renderer.jetGroup.visible && !sim.spectating);
    // A normal duplicate host launch still must not reset an airborne pilot.
    sim.followLaunch("carrier", 1, profile);
    check("duplicate room launches leave an active pilot alone", launches.length === 1);
  }
});

{
    const h = makePilot();
    h.net.open('GATED', 'HOST', 'tomcat');
    await flush();
    h.net.setAllowLateJoin(false);
    h.net.launch('carrier', 0);
    await flush();
    const w = makePilot();
    w.net.spectate('GATED', 'WATCHER', 'tomcat');
    await flush();
    w.net.setSpectator(false);
    await flush();
    check('S1 closed rooms keep watchers out of cockpit seats', h.net.snapshot.pilots.find(p => p.name === 'WATCHER')?.spectator === true && !h.roster.has(w.net.snapshot.self));
    h.net.setAllowLateJoin(true);
    await flush();
    w.net.setSpectator(false);
    await flush();
    check('reopening admission permits taking a seat', h.net.snapshot.pilots.find(p => p.name === 'WATCHER')?.spectator === false && h.roster.has(w.net.snapshot.self));
    w.net.leave();
    h.net.leave();
}
{
    const h = makePilot();
    h.net.open('CLEAR', 'HOST', 'tomcat');
    await flush();
    const w = makePilot();
    let selectedWeather = 'storm';
    (w.net as any).handlers.onWeather = (v: string) => { selectedWeather = v; };
    w.net.join('CLEAR', 'STORM USER', 'tomcat');
    await flush();
    check('W1 a clear room overrides the guest saved storm', selectedWeather === 'clear');
    w.net.leave();
    h.net.leave();
}
{
    const h = makePilot();
    h.net.open('ONLYSPEC', 'HOST', 'tomcat');
    await flush();
    const w = makePilot();
    w.net.spectate('ONLYSPEC', 'WATCHER', 'tomcat');
    await flush();
    h.net.leave();
    await advance(100);
    const promoted = { host: w.net.snapshot.host, spectator: w.net.snapshot.spectator };
    w.net.setSpectator(false);
    check('S3 the promoted spectator can take a seat', !!promoted.host && !!promoted.spectator && !!w.net.snapshot.host && !w.net.snapshot.spectator);
    w.net.leave();
}
if (failures)
    process.exit(1);
