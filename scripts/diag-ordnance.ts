// Headless ordnance verification: laser designation and guidance, big
// explosions on every surface, water splashes, the target-pod pick, and the
// airframe collisions that stop jets flying through each other.
// Usage: bun scripts/diag-ordnance.ts

import { Matrix4, PerspectiveCamera, Scene, Vector3 } from "three";
import { spawnAircraft, type AircraftState } from "../src/sim/flight";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { pickDesignation, screenRay } from "../src/sim/targeting";
import { POD_OFFSET } from "../src/render/cameras";
import { airfield, groundAt } from "../src/sim/world";
import { InputManager } from "../src/input/input";
import { defaultSettings } from "../src/settings";

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

/** A clean player state parked in mid-air, nose along `headingDeg`. */
function airPlayer(x: number, y: number, z: number, headingDeg: number, speed = 250): AircraftState {
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

function newFight(player: AircraftState): { df: Dogfight; blasts: ExplosionField; scene: Scene } {
  const scene = new Scene();
  const blasts = new ExplosionField(scene, "low");
  const df = new Dogfight(scene, blasts);
  // prepare(): the hostile boat is on the water but launches nothing, so the
  // ordnance sections are not disturbed by bandits shooting at the player.
  df.prepare(player);
  return { df, blasts, scene };
}

// ---------------------------------------------------------------------------
// 1. the target-pod pick: what does the cursor actually point at?
// ---------------------------------------------------------------------------
{
  console.log("\n[targeting pick]");
  const af = airfield();
  const down = new Vector3(0, -1, 0);
  const o = new Vector3();

  o.set(af.centerX, 1800, af.centerZ);
  const onLand = pickDesignation(o, down);
  check("pick over the airfield finds the ground",
    onLand !== null && Math.abs(onLand.pos.y - af.elevation) < 2,
    JSON.stringify(onLand?.pos));
  check("pick reports the runway surface",
    onLand?.surface === "runway", onLand?.surface);

  o.set(6000, 1800, -6000);
  const onWater = pickDesignation(o, down);
  check("pick over open sea finds the water surface",
    onWater !== null && Math.abs(onWater.pos.y) < 1 && onWater.surface === "water",
    JSON.stringify(onWater?.pos));

  o.set(0, 1800, 0);
  check("pick into the sky returns nothing",
    pickDesignation(o, new Vector3(0, 1, 0)) === null);

  // a slanted ray must land on the hill it passes through, not on the sea behind
  const slant = new Vector3(0.4, -0.5, 0).normalize();
  o.set(-10000, 4000, 2000);
  const hit = pickDesignation(o, slant);
  check("slanted pick lands on whatever it meets first",
    hit !== null && hit.range > 0 && hit.range < 20000, JSON.stringify(hit));

  // the full click path the sim uses: a camera, a point projected to screen
  // space, and the ray that screen pixel casts back into the world
  const cam = new PerspectiveCamera(62, 1.6, 0.5, 70000);
  cam.position.set(af.centerX - 4000, af.elevation + 3000, af.centerZ + 500);
  cam.up.set(0, 1, 0);
  cam.lookAt(af.centerX, af.elevation, af.centerZ);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
  const ndc = new Vector3(af.centerX, af.elevation, af.centerZ).project(cam);
  const rayO = new Vector3();
  const rayD = new Vector3();
  screenRay(cam, ndc.x, ndc.y, rayO, rayD);
  const clickHit = pickDesignation(rayO, rayD);
  check("a screen click lands on the spot under the cursor",
    clickHit !== null && clickHit.pos.distanceTo(new Vector3(af.centerX, af.elevation, af.centerZ)) < 3,
    JSON.stringify(clickHit?.pos));
  // and a click on the sky designates nothing, rather than the ground behind it
  screenRay(cam, ndc.x, 2.5, rayO, rayD);
  check("a click on the sky designates nothing", pickDesignation(rayO, rayD) === null);

  // the hostile deck, which groundAt() does not know about
  const parked = spawnAircraft("carrier", 0);
  const scene = new Scene();
  const df = new Dogfight(scene, new ExplosionField(scene, "low"));
  df.prepare(parked);
  const deck = df.enemyDeck()!;
  check("the hostile carrier exposes its deck for targeting", deck !== null);
  o.set(deck.x, 2000, deck.z);
  const onDeck = pickDesignation(o, down, [deck]);
  check("pick finds the hostile flight deck",
    onDeck !== null && onDeck.onDeck && Math.abs(onDeck.pos.y - deck.deckY) < 1,
    JSON.stringify(onDeck?.pos));
  df.dispose();
}

// ---------------------------------------------------------------------------
// 2. the target pod: a click there fires a weapon, and the pod can still track
//    the weapon it cannot see
// ---------------------------------------------------------------------------
{
  console.log("\n[target pod]");
  const af = airfield();
  // Diving at the field, sensor flown onto it: exactly the shot a pod is for.
  const target = new Vector3(af.centerX, af.elevation, af.centerZ);
  const player = airPlayer(target.x - 6000, target.y + 2860, target.z, 90);
  const { df } = newFight(player);

  // the pod's release request is queued, not immediate: it has to come out of
  // the same step the rest of the sim does
  const cam = new PerspectiveCamera(62, 1.6, 0.5, 70000);
  const podPos = POD_OFFSET.clone().applyQuaternion(player.quat).add(player.pos);
  cam.position.copy(podPos);
  cam.up.set(0, 1, 0);
  cam.lookAt(target);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
  const ndc = target.clone().project(cam);
  const rayO = new Vector3();
  const rayD = new Vector3();
  screenRay(cam, ndc.x, ndc.y, rayO, rayD);
  const hit = pickDesignation(rayO, rayD, df.enemyDeck() ? [df.enemyDeck()!] : []);
  check("the pod's cursor ray finds the surface under the gate",
    hit !== null && hit.pos.distanceTo(target) < 12,
    JSON.stringify(hit?.pos));
  df.setDesignation(hit!.pos);
  const racks = df.hud(player).bombs;
  check("no weapon leaves the rack before the release step",
    df.hud(player).bombs === racks && df.hud(player).bombsAway === 0);
  df.requestBombRelease();
  df.step(DT, player, false, false);
  const fired = df.hud(player);
  check("the pod's release request pickles a weapon", fired.bombs === racks - 1,
    `${racks} -> ${fired.bombs}`);
  check("and it comes off guided", fired.bombsTracking === 1, `${fired.bombsTracking} tracking`);

  // The sensor head is forward of the racks, so the weapon is behind it at
  // release and drops out of the frame: the pod has to draw the weapon itself.
  let everInFrame = false;
  let alwaysTracked = true;
  for (let i = 0; i < Math.round(3 / DT); i++) {
    player.time += DT;
    player.pos.addScaledVector(player.vel, DT);
    df.step(DT, player, false, false);
    const tracks = df.bombPositions();
    if (tracks.length === 0) {
      // gone: it detonated, which is the end of the fall
      if (df.hud(player).bombsAway > 0) alwaysTracked = false;
      break;
    }
    if (tracks.length !== df.hud(player).bombsAway) alwaysTracked = false;
    cam.position.copy(POD_OFFSET.clone().applyQuaternion(player.quat).add(player.pos));
    cam.lookAt(target);
    cam.updateMatrixWorld(true);
    const p = tracks[0].clone().project(cam);
    const fwd = cam.getWorldDirection(new Vector3());
    const front = tracks[0].clone().sub(cam.position).dot(fwd) > 0;
    if (front && Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1) everInFrame = true;
  }
  check("every weapon in the air is reported for the pod's symbology", alwaysTracked);
  check("the sensor cannot see its own weapon, so the pod draws it",
    !everInFrame, "the bomb was suddenly inside the pod's frame");
  df.dispose();
}

// ---------------------------------------------------------------------------
// 3. a laser-guided bomb lands where the click was
// ---------------------------------------------------------------------------
{
  console.log("\n[laser-guided bombs]");
  const af = airfield();
  const target = new Vector3(af.centerX, af.elevation, af.centerZ);
  // release 6 km short, 2860 m above the field: roughly a ballistic fit, so
  // guidance only has to trim — exactly the shot a pod designation is for
  const player = airPlayer(target.x - 6000, target.y + 2860, target.z, 90);
  const { df, blasts } = newFight(player);

  df.setDesignation(target);
  check("the designation is registered", df.designated !== null);
  const before = df.hud(player).bombs;
  df.step(DT, player, false, true); // one release request
  const after = df.hud(player);
  check("a click release pickles one weapon", after.bombs === before - 1,
    `${before} -> ${after.bombs}`);
  check("the weapon is tracking the laser", after.bombsTracking === 1,
    `${after.bombsTracking} tracking`);
  check("the HUD reports the designation", after.designated !== null,
    JSON.stringify(after.designated));

  let flew = 0;
  while (flew < 45 && df.hud(player).bombsAway > 0) {
    player.time += DT;
    df.step(DT, player, false, false);
    flew += DT;
  }
  const miss = df.lastImpact.distanceTo(target);
  check("the guided bomb detonated on land", df.lastImpactKind === "ground", `${df.lastImpactKind}`);
  // the fuze trips on proximity to the spot, so a converged weapon lands
  // inside the detonation radius rather than merely nearby
  check("it landed on the designated spot", miss < 12,
    `miss ${miss.toFixed(1)} m after ${flew.toFixed(1)} s`);
  check("the impact spawned an explosion", blasts.blastCount >= 1, `${blasts.blastCount}`);
  check("the explosion is still burning", blasts.liveParticles > 0,
    `${blasts.liveParticles} particles`);

  // --- a release and a hit have to be visible from outside the pod too ----
  {
    // fresh shot so the release marker can be read at the moment of release
    const p3 = airPlayer(target.x - 6000, target.y + 2860, target.z, 90);
    const fresh = newFight(p3);
    fresh.df.setDesignation(target);
    fresh.df.requestBombRelease();
    fresh.df.step(DT, p3, false, false);
    const justReleased = fresh.df.hud(p3).released;
    check("the HUD marks the rack the weapon just left",
      justReleased !== null &&
        Math.hypot(justReleased.x - p3.pos.x, justReleased.y - p3.pos.y, justReleased.z - p3.pos.z) < 12,
      JSON.stringify(justReleased));
    check("the weapon smokes from the rack", fresh.blasts.liveParticles > 0,
      `${fresh.blasts.liveParticles} particles`);

    let hitAt = 0;
    for (let i = 0; i < Math.round(60 / DT) && fresh.df.hud(p3).bombsAway > 0; i++) {
      p3.time += DT;
      fresh.df.step(DT, p3, false, false);
      hitAt += DT;
    }
    const landed = fresh.df.hud(p3).landed;
    check("the HUD marks where the weapon went off", landed !== null, JSON.stringify(landed));
    check("and the mark is on the wreck",
      landed !== null && landed.kind === "ground" &&
        Math.hypot(landed.x - fresh.df.lastImpact.x, landed.z - fresh.df.lastImpact.z) < 1,
      JSON.stringify(landed));
    // the mark fades on its own, so the HUD does not accumulate old craters
    for (let i = 0; i < Math.round(12 / DT); i++) {
      p3.time += DT;
      fresh.df.step(DT, p3, false, false);
    }
    check("the impact mark expires", fresh.df.hud(p3).landed === null,
      JSON.stringify(fresh.df.hud(p3).landed));
    check("the release mark expires too", fresh.df.hud(p3).released === null);
    void hitAt;
    fresh.df.dispose();
  }

  // re-designating mid-flight must pull weapons already in the air
  console.log("\n[relock]");
  const player2 = airPlayer(6000, 3000, 9000, 90);
  const { df: df2 } = newFight(player2);
  df2.setDesignation(new Vector3(9000, 0, 9000));
  df2.step(DT, player2, false, true);
  check("bomb away toward the first spot", df2.hud(player2).bombsTracking === 1);
  df2.setDesignation(new Vector3(9000, 0, 8600));
  check("a new designation retargets it in flight",
    Math.abs(df2.designated!.z - 8600) < 1e-6,
    `${df2.designated!.z}`);
  df2.dispose();
}

// ---------------------------------------------------------------------------
// 4. water: a clean miss into the sea makes a splash, not a crater
// ---------------------------------------------------------------------------
{
  console.log("\n[ocean splash]");
  const target = new Vector3(6000, 0, -6000);
  check("the aim point is over open water", groundAt(target.x, target.z).kind === "water");
  const player = airPlayer(target.x - 6000, 2600, target.z, 90);
  const { df, blasts } = newFight(player);
  df.setDesignation(target);
  df.step(DT, player, false, true);
  let flew = 0;
  while (flew < 45 && df.hud(player).bombsAway > 0) {
    player.time += DT;
    df.step(DT, player, false, false);
    flew += DT;
  }
  check("a bomb into the sea splashes", df.lastImpactKind === "water", `${df.lastImpactKind}`);
  check("the splash is on target", df.lastImpact.distanceTo(target) < 12,
    `miss ${df.lastImpact.distanceTo(target).toFixed(1)} m`);
  check("the splash threw water", blasts.liveParticles > 0, `${blasts.liveParticles} particles`);
  df.dispose();
}

// ---------------------------------------------------------------------------
// 5. effects: every surface kind, and the pools recycle
// ---------------------------------------------------------------------------
{
  console.log("\n[explosions]");
  const scene = new Scene();
  const blasts = new ExplosionField(scene, "medium");
  const at = new Vector3(1000, 40, 1000);
  blasts.spawn(at, "ground", 1);
  check("a ground blast counts as a ground blast", blasts.lastBlastKind === "ground");
  const afterGround = blasts.liveParticles;
  blasts.spawn(at, "air", 1);
  check("an air blast counts as an air blast", blasts.lastBlastKind === "air");
  blasts.spawn(at, "water", 1.2);
  check("a water blast counts as a water blast", blasts.lastBlastKind === "water");
  check("each blast throws particles", blasts.blastCount === 3 && afterGround > 0,
    `${blasts.blastCount} blasts, ${afterGround} particles from the first`);
  check("a water blast throws at least as much as a ground one",
    blasts.liveParticles > afterGround, `${afterGround} -> ${blasts.liveParticles}`);
  // and it all clears: a pool that never drains would grow forever
  for (let i = 0; i < Math.round(8 / DT); i++) blasts.step(DT);
  check("effects burn out and free their particles", blasts.liveParticles === 0,
    `${blasts.liveParticles} left`);
  // small arms and guided trails reuse the same pools without exploding them
  blasts.spawnSpark(at, true);
  blasts.spawnSpark(at, false);
  for (let i = 0; i < 40; i++) blasts.trail(at, 1);
  check("sparks and trails do not add blasts", blasts.blastCount === 3, `${blasts.blastCount}`);
  for (let i = 0; i < Math.round(6 / DT); i++) blasts.step(DT);
  check("sparks and trails clear too", blasts.liveParticles === 0,
    `${blasts.liveParticles} left`);
  blasts.dispose();
}

// ---------------------------------------------------------------------------
// 6. collisions: nothing flies through anything
// ---------------------------------------------------------------------------
{
  console.log("\n[collisions]");
  // (a) the player cannot fly through the hostile deck
  const parked = spawnAircraft("carrier", 0);
  const scene = new Scene();
  const blasts = new ExplosionField(scene, "low");
  const df = new Dogfight(scene, blasts);
  df.begin(parked);
  const deck = df.enemyDeck()!;
  const hpBefore = df.hud(parked).carrier!.hp;
  parked.pos.set(deck.x, deck.deckY + 0.5, deck.z);
  parked.vel.set(0, 0, 0);
  parked.onGround = false;
  df.step(DT, parked, false);
  const hpAfter = df.hud(parked).carrier!.hp;
  check("flying into the enemy carrier hurts it", hpAfter < hpBefore, `${hpBefore} -> ${hpAfter}`);
  check("and destroys the jet",
    parked.result !== null && parked.result.title.includes("COLLIDED WITH"),
    parked.result?.title ?? "no result");
  df.dispose();

  // (b) a long engagement: bandits close, shoot, and never pass through the
  // player's airframe (they either break away or come apart in a mid-air)
  const player = airPlayer(0, 1500, 0, 0, 0);
  player.pos.set(0, 1500, 0);
  player.vel.set(0, 0, 0);
  player.speed = 0;
  const s2 = new Scene();
  const blasts2 = new ExplosionField(s2, "low");
  const df2 = new Dogfight(s2, blasts2);
  df2.begin(player);
  let minGap = Infinity;
  let minGround = Infinity; // closest any bandit came to flying into terrain
  let sawContact = false;
  for (let i = 0; i < Math.round(120 / DT); i++) {
    player.time += DT;
    df2.step(DT, player, false);
    for (const t of df2.targets()) {
      const gap = t.pos.distanceTo(player.pos);
      minGap = Math.min(minGap, gap);
      const g = groundAt(t.pos.x, t.pos.z).y;
      minGround = Math.min(minGround, t.pos.y - g);
    }
    const h = df2.hud(player);
    if (h.hitT > 0) sawContact = true;
  }
  check("bandits still engage", sawContact || df2.hud(player).hull < 100, "no engagement seen");
  check("nothing flies through the player", minGap > 15, `closest bandit ${minGap.toFixed(1)} m`);
  check("bandits never sit inside the terrain", minGround > 0, `${minGround.toFixed(1)} m clearance`);
  check("a long fight does not wipe the player out",
    player.result === null || player.result.title === "OUT OF THE FIGHT",
    player.result?.title ?? "flying");
  df2.dispose();
  blasts2.dispose();
}

// ---------------------------------------------------------------------------
// 7. the pod's release gesture: aiming the sensor is a drag, so letting go of
//    the drag has to fire — otherwise the shot never reaches requestBombRelease
// ---------------------------------------------------------------------------
{
  console.log("\n[pod input]");
  type Listener = (e: never) => void;
  const makeTarget = (into: Record<string, Listener[]>) => ({
    addEventListener: (t: string, fn: Listener) => {
      into[t] = [...(into[t] ?? []), fn];
    },
    removeEventListener: () => {},
  });
  const winEvents: Record<string, Listener[]> = {};
  const elEvents: Record<string, Listener[]> = {};
  const el = makeTarget(elEvents);
  // no DOM in this harness: the listeners the input manager installs are all
  // the browser surface it needs
  (globalThis as unknown as { window: unknown }).window = makeTarget(winEvents);
  const fire = (into: Record<string, Listener[]>, type: string, e: unknown) => {
    for (const fn of into[type] ?? []) (fn as (ev: unknown) => void)(e);
  };
  /** Press on the canvas at `from`, drag to `to`, release there. */
  const gesture = (from: [number, number], to: [number, number]) => {
    fire(elEvents, "mousedown", { button: 0, clientX: from[0], clientY: from[1] });
    fire(winEvents, "mousemove", {
      clientX: to[0],
      clientY: to[1],
      movementX: to[0] - from[0],
      movementY: to[1] - from[1],
    });
    fire(winEvents, "mouseup", { button: 0, clientX: to[0], clientY: to[1] });
  };

  // flying: a drag is the mouse-look, and nothing else
  const flying = new InputManager(defaultSettings());
  flying.attach(el as unknown as HTMLElement);
  gesture([400, 300], [520, 380]);
  check("outside the pod a camera drag is not a click", flying.takeClick() === null);
  check("and that drag still aims the view", flying.takeMouse().dx === 120);
  flying.detach();

  // in the pod: slew onto the target, let go, and the weapon goes
  const pod = new InputManager(defaultSettings());
  pod.attach(el as unknown as HTMLElement);
  pod.clicksAfterDrag = true;
  gesture([400, 300], [520, 380]);
  const shot = pod.takeClick();
  check("a pod slew fires where the button came up",
    shot !== null && shot.x === 520 && shot.y === 380, JSON.stringify(shot));
  check("the pod still slews while the button is down", pod.takeMouse().dx === 120);
  // a tap (no travel) fires at the same gate without swinging the sensor
  gesture([600, 400], [602, 401]);
  const tap = pod.takeClick();
  check("a tap in the pod fires at the gate without slewing the sensor",
    tap !== null && tap.x === 602 && tap.y === 401 && pod.takeMouse().dx === 0,
    JSON.stringify(tap));
  // and the gesture is pod-only: closing the pod restores camera-drag behaviour
  pod.clicksAfterDrag = false;
  gesture([300, 300], [420, 300]);
  check("leaving the pod stops drag releases from firing", pod.takeClick() === null);
  pod.detach();
  delete (globalThis as unknown as { window?: unknown }).window;
}

console.log(failures === 0 ? "\nALL ORDNANCE CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
