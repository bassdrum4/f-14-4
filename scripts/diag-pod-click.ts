// Target-pod aiming: what the player clicks is where the weapon goes.
//
// This drives the real pod path — the real InputManager gestures, the real
// CameraRig, and the real Sim.handlePodClick, in the order the frame loop runs
// them — so the click the pilot makes is the click the game resolves. It needs
// no WebGL, audio or DOM beyond the browser surface the input layer touches.
//
// Usage: bun scripts/diag-pod-click.ts

import { Matrix4, PerspectiveCamera, Scene, Vector3 } from "three";
import { Sim } from "../src/sim/engine";
import { spawnAircraft, type AircraftState } from "../src/sim/flight";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { CameraRig } from "../src/render/cameras";
import { InputManager } from "../src/input/input";
import { defaultSettings } from "../src/settings";
import { airfield, groundAt } from "../src/sim/world";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const W = 1600;
const H = 900;
const FRAME = 1 / 60;
const DT = 1 / 120;
const UP = new Vector3(0, 1, 0);
const ORIGIN = new Vector3();
const MAT4 = new Matrix4();

// ---------------------------------------------------------------------------
// The browser surface the input layer installs itself on. Nothing else of the
// DOM is needed: the renderer is stubbed out and the camera is a real one.
// ---------------------------------------------------------------------------
type Listener = (e: never) => void;
const winEvents: Record<string, Listener[]> = {};
const elEvents: Record<string, Listener[]> = {};
const canvas = {
  clientWidth: W,
  clientHeight: H,
  style: { cursor: "" },
  addEventListener: (t: string, fn: Listener) => {
    elEvents[t] = [...(elEvents[t] ?? []), fn];
  },
  removeEventListener: () => {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: H, right: W, bottom: H, x: 0, y: 0 }),
};
(globalThis as unknown as { window: unknown }).window = {
  addEventListener: (t: string, fn: Listener) => {
    winEvents[t] = [...(winEvents[t] ?? []), fn];
  },
  removeEventListener: () => {},
  devicePixelRatio: 1,
  innerWidth: W,
  innerHeight: H,
};
const fire = (into: Record<string, Listener[]>, type: string, e: unknown) => {
  for (const fn of into[type] ?? []) (fn as (ev: unknown) => void)(e);
};
const pressKey = (code: string) =>
  fire(winEvents, "keydown", { code, repeat: false, preventDefault: () => {}, target: null });
const releaseKey = (code: string) => fire(winEvents, "keyup", { code, target: null });
const moveTo = (x: number, y: number, dx = 0, dy = 0) =>
  fire(winEvents, "mousemove", { clientX: x, clientY: y, movementX: dx, movementY: dy });
const pressButton = (x: number, y: number) => fire(elEvents, "mousedown", { button: 0, clientX: x, clientY: y });
const releaseButton = (x: number, y: number) => fire(winEvents, "mouseup", { button: 0, clientX: x, clientY: y });

// ---------------------------------------------------------------------------
// A Sim carrying only the pieces the pod touches, plus a real rig, input,
// dogfight and camera. Object.create keeps Sim.prototype's real methods.
// ---------------------------------------------------------------------------
const settings = defaultSettings();
const BOMB_KEY = settings.bindings.bomb;

function airPlayer(x: number, y: number, z: number, headingDeg: number, speed: number): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.set(x, y, z);
  const h = (headingDeg * Math.PI) / 180;
  const dir = new Vector3(Math.sin(h), 0, -Math.cos(h));
  MAT4.lookAt(ORIGIN, dir, UP);
  st.quat.setFromRotationMatrix(MAT4);
  st.vel.copy(dir).multiplyScalar(speed);
  st.speed = speed;
  st.gearDown = false;
  st.gearT = 0;
  st.flapsDown = false;
  st.flapT = 0;
  st.onGround = false;
  st.airborne = true;
  st.banner = null;
  return st;
}

function podSim(player: AircraftState) {
  const sim = Object.create(Sim.prototype) as Record<string, any>;
  const scene = new Scene();
  const blasts = new ExplosionField(scene, "low");
  const df = new Dogfight(scene, blasts);
  df.prepare(player);
  const camera = new PerspectiveCamera(62, W / H, 1, 70000);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  const rig = new CameraRig();
  const input = new InputManager(settings);
  input.attach(canvas as unknown as HTMLElement);
  sim.state = player;
  sim.df = df;
  sim.rig = rig;
  sim.input = input;
  sim.renderer = {
    camera,
    renderer: { domElement: canvas },
    jetGroup: { visible: true },
    setWind: () => {},
  };
  sim.pod = false;
  sim.pickOrigin = new Vector3();
  sim.pickDir = new Vector3();
  sim.banners = [] as string[];
  sim.pushBanner = (t: string) => (sim.banners as string[]).push(t);
  return { sim, df, rig, input, camera, player, log: sim.banners as string[] };
}
type Ctx = ReturnType<typeof podSim>;

/**
 * One game frame, in the order the engine runs it: edges (so the pod click is
 * resolved against the image already on screen), then the mouse deltas reach
 * the rig, then the camera is placed, then the picture is drawn.
 */
function frame(ctx: Ctx): void {
  ctx.sim.handleEdges();
  const m = ctx.input.takeMouse();
  ctx.rig.mouse(m.dx, m.dy);
  ctx.rig.update(ctx.camera, ctx.player.pos, ctx.player.quat, ctx.player.speed, FRAME);
  ctx.camera.updateMatrixWorld(true);
}

/** Where a world point sits in client pixels of the current view. */
function pixelOf(ctx: Ctx, p: Vector3): { x: number; y: number; front: boolean; inside: boolean } {
  ctx.camera.updateMatrixWorld(true);
  const v = p.clone().project(ctx.camera);
  const front = v.z < 1;
  const x = (v.x * 0.5 + 0.5) * W;
  const y = (0.5 - v.y * 0.5) * H;
  return { x, y, front, inside: front && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 };
}

/** Fly straight for `seconds`, stepping the fight, as the pilot holds the pass. */
function fly(ctx: Ctx, seconds: number): void {
  const steps = Math.round(seconds / DT);
  for (let i = 0; i < steps; i++) {
    ctx.player.time += DT;
    ctx.player.pos.addScaledVector(ctx.player.vel, DT);
    ctx.df.step(DT, ctx.player, false, false);
  }
}

const af = airfield();
const TARGET = new Vector3(af.centerX, af.elevation, af.centerZ);
console.log(`target: airfield centre (${TARGET.x}, ${TARGET.y}, ${TARGET.z}) — ${groundAt(TARGET.x, TARGET.z).kind}`);

// ---------------------------------------------------------------------------
// 1. the pod opens on its key and looks where the nose looks
// ---------------------------------------------------------------------------
console.log("\n[opening the pod]");
const START = new Vector3(TARGET.x - 6000, TARGET.y + 2860, TARGET.z);
{
  const ctx = podSim(airPlayer(START.x, START.y, START.z, 90, 250));
  const before = pixelOf(ctx, TARGET);
  pressKey(BOMB_KEY);
  releaseKey(BOMB_KEY);
  frame(ctx);
  check("the pod key opens the pod and the rig follows", ctx.sim.pod === true && ctx.rig.isPod);
  check("it opens looking down the nose, as a real pod's gimbal holds", before.inside === false,
    "the target was already inside a nose-on sensor frame");
  console.log(`      (the target sits at pixel ${before.x.toFixed(0)},${before.y.toFixed(0)} before slewing)`);
}

// ---------------------------------------------------------------------------
// 2. slewing is a look, not a shot
// ---------------------------------------------------------------------------
console.log("\n[slewing]");
const pod = (() => {
  const ctx = podSim(airPlayer(START.x, START.y, START.z, 90, 250));
  pressKey(BOMB_KEY);
  releaseKey(BOMB_KEY);
  frame(ctx);
  return ctx;
})();
{
  const bombs = pod.df.hud(pod.player).bombs;
  // one drag down the screen, held for a few frames, then let go
  pressButton(W / 2, H / 2);
  let cur = { x: W / 2, y: H / 2 };
  for (let i = 0; i < 4; i++) {
    cur = { x: cur.x, y: cur.y + 80 };
    moveTo(cur.x, cur.y, 0, 80);
    frame(pod);
  }
  releaseButton(cur.x, cur.y);
  frame(pod);
  frame(pod);
  const after = pixelOf(pod, TARGET);
  check("the drag slewed the sensor onto the ground", after.inside,
    `target still at pixel ${after.x.toFixed(0)},${after.y.toFixed(0)}`);
  check("letting go of the slew fires nothing", pod.df.hud(pod.player).bombs === bombs,
    `${bombs} -> ${pod.df.hud(pod.player).bombs}`);
  check("and it says nothing about a weapon", !pod.log.some(t => t.startsWith("LGB")),
    pod.log[pod.log.length - 1] ?? "");
}

// ---------------------------------------------------------------------------
// 3. the click is the shot, at the pixel that was clicked
// ---------------------------------------------------------------------------
console.log("\n[clicking]");
{
  const pixel = pixelOf(pod, TARGET);
  const bombs = pod.df.hud(pod.player).bombs;
  moveTo(pixel.x, pixel.y); // park the gate on the target
  frame(pod);
  pressButton(pixel.x, pixel.y);
  releaseButton(pixel.x + 1, pixel.y); // a click, with a pixel of hand jitter
  frame(pod); // the click is resolved here and the release queued
  const d = pod.df.designated?.clone() ?? null;
  const miss = d ? d.distanceTo(TARGET) : Infinity;
  check("the click designates the spot under the cursor", d !== null && miss < 25,
    d ? `designation is ${miss.toFixed(1)} m from the clicked spot` : "no designation");
  check("the pod reports the weapon away", pod.log.some(t => t.startsWith("LGB AWAY")),
    pod.log[pod.log.length - 1] ?? "");
  fly(pod, DT); // one sim step: the queued release leaves the rack
  check("the click spends one weapon where the drag spent none",
    pod.df.hud(pod.player).bombs === bombs - 1,
    `${bombs} -> ${pod.df.hud(pod.player).bombs}`);

  // the click also moves a laser already pointed somewhere else
  moveTo(pixel.x + 6, pixel.y + 6);
  pressButton(pixel.x + 6, pixel.y + 6);
  releaseButton(pixel.x + 6, pixel.y + 6);
  frame(pod);
  const d2 = pod.df.designated?.clone() ?? null;
  check("a second click re-aims the laser", d2 !== null && d2.distanceTo(d ?? TARGET) > 1,
    `designation did not move (${d2 ? d2.distanceTo(d ?? TARGET).toFixed(3) : "none"} m)`);
}

// ---------------------------------------------------------------------------
// 4. and the weapon goes there
// ---------------------------------------------------------------------------
console.log("\n[the weapon]");
{
  const dropped = pod.df.hud(pod.player).bombsAway;
  check("the weapon left the rack", dropped >= 1, `${dropped} away`);
  const clicked = pod.df.designated!.clone();
  let flew = 0;
  while (flew < 90 && pod.df.hud(pod.player).bombsAway > 0) {
    fly(pod, DT);
    flew += DT;
  }
  const miss = pod.df.lastImpact.distanceTo(clicked);
  check("it detonated on land", pod.df.lastImpactKind === "ground", `${pod.df.lastImpactKind}`);
  check("it landed on the clicked spot", miss < 12, `${miss.toFixed(1)} m off after ${flew.toFixed(1)} s`);
  pod.input.detach();
}

// ---------------------------------------------------------------------------
// 5. a click on nothing spends nothing, and a click it cannot reach says so
// ---------------------------------------------------------------------------
console.log("\n[refusals]");
{
  const ctx = podSim(airPlayer(START.x, START.y, START.z, 90, 250));
  pressKey(BOMB_KEY);
  releaseKey(BOMB_KEY);
  frame(ctx);
  // slew down onto the ground, then click the sky above it
  pressButton(W / 2, H / 2);
  let cur = { x: W / 2, y: H / 2 };
  for (let i = 0; i < 4; i++) {
    cur = { x: cur.x, y: cur.y + 80 };
    moveTo(cur.x, cur.y, 0, 80);
    frame(ctx);
  }
  releaseButton(cur.x, cur.y);
  frame(ctx);
  const bombs = ctx.df.hud(ctx.player).bombs;
  // the sky: straight up from the sensor head, which is the top of the frame
  moveTo(W / 2, 4);
  pressButton(W / 2, 4);
  releaseButton(W / 2, 4);
  frame(ctx);
  check("a click on the sky designates nothing", ctx.df.designated === null,
    JSON.stringify(ctx.df.designated));
  check("a click on the sky spends nothing", ctx.df.hud(ctx.player).bombs === bombs);
  check("and it says why", ctx.log.includes("NO TARGET UNDER THE CURSOR"),
    ctx.log[ctx.log.length - 1] ?? "");
  ctx.input.detach();
}

{
  // A spot the weapon cannot reach: over open ocean, low and fast, with the
  // click going to a point a kilometre behind the jet. A bomb cannot turn round
  // in the fifteen metres of altitude it has, so the predictor refuses it —
  // diag-bomb-envelope pins the same envelope. The sensor has to slew right
  // round to see the spot at all, which is its own check on the gimbal.
  const seaFrom = new Vector3(-27000, 15, -27000);
  const seaAim = new Vector3(-27000, 0, -26000);
  check("the refusal case really is over open water",
    groundAt(seaAim.x, seaAim.z).kind === "water" && groundAt(seaFrom.x, seaFrom.z).kind === "water",
    `${groundAt(seaAim.x, seaAim.z).kind} / ${groundAt(seaFrom.x, seaFrom.z).kind}`);
  const ctx = podSim(airPlayer(seaFrom.x, seaFrom.y, seaFrom.z, 0, 300)); // flying away from the spot
  pressKey(BOMB_KEY);
  releaseKey(BOMB_KEY);
  frame(ctx);
  // slew the gimbal right round: a drag of pi / POD_SLEW pixels
  pressButton(W / 2, H / 2);
  moveTo(W / 2, H / 2, 0, 0);
  moveTo(W / 2 + 400, H / 2, 400, 0);
  moveTo(W / 2 + 800, H / 2, 400, 0);
  moveTo(W / 2 + 1200, H / 2, 400, 0);
  moveTo(W / 2 + 1600, H / 2, 400, 0);
  moveTo(W / 2 + 1780, H / 2, 180, 0);
  releaseButton(W / 2 + 1780, H / 2);
  for (let i = 0; i < 6; i++) frame(ctx);
  const pixel = pixelOf(ctx, seaAim);
  const bombs = ctx.df.hud(ctx.player).bombs;
  check("the gimbal slews right round to the spot behind", pixel.inside,
    `aim at pixel ${pixel.x.toFixed(0)},${pixel.y.toFixed(0)}`);
  moveTo(pixel.x, pixel.y);
  pressButton(pixel.x, pixel.y);
  releaseButton(pixel.x, pixel.y);
  frame(ctx);
  const d = ctx.df.designated;
  check("the click still lands on the spot that was clicked",
    d !== null && d.distanceTo(seaAim) < 40,
    d ? `${d.distanceTo(seaAim).toFixed(1)} m off` : "no designation");
  check("but it does not spend a weapon", ctx.df.hud(ctx.player).bombs === bombs,
    `${bombs} -> ${ctx.df.hud(ctx.player).bombs}`);
  // the predictor's warning rides the flight banner, not the pod's own notice
  check("and the pilot is told to close in or climb",
    ctx.player.banner?.text.includes("CANNOT REACH") === true,
    ctx.player.banner?.text ?? "no banner");
  ctx.input.detach();
}

// ---------------------------------------------------------------------------
// 6. leaving the pod gives the camera back and stops listening for clicks
// ---------------------------------------------------------------------------
console.log("\n[closing the pod]");
{
  const ctx = podSim(airPlayer(START.x, START.y, START.z, 90, 250));
  ctx.rig.mode = "cockpit";
  pressKey(BOMB_KEY);
  releaseKey(BOMB_KEY);
  frame(ctx);
  const opened = ctx.sim.pod;
  pressKey(BOMB_KEY);
  releaseKey(BOMB_KEY);
  frame(ctx);
  check("the pod key both opens and closes it", opened && ctx.sim.pod === false);
  check("the camera goes back where the pilot was", ctx.rig.mode === "cockpit", ctx.rig.mode);
  // a click outside the pod is a camera drag, not a designation
  const bombs = ctx.df.hud(ctx.player).bombs;
  pressButton(W / 2, H / 2);
  moveTo(W / 2 + 120, H / 2 + 40, 120, 40);
  releaseButton(W / 2 + 120, H / 2 + 40);
  frame(ctx);
  check("a drag outside the pod does not designate", ctx.df.designated === null);
  check("and does not spend a weapon", ctx.df.hud(ctx.player).bombs === bombs);
  ctx.input.detach();
}

delete (globalThis as unknown as { window?: unknown }).window;

console.log(failures === 0 ? "\nALL POD-CLICK CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
