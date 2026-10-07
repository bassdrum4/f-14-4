// Headless verification for the selectable aircraft and the expanded ordnance:
//  * every airframe is a distinct spec, and spawnAircraft wires the right one,
//  * the flight model really uses it (a light fighter out-accelerates and
//    out-rolls the heavy bomber; fixed-wing types never sweep; no burner on the
//    Intruder),
//  * dogfight racks/hull follow the airframe (bomber = sixteen bombs),
//  * the enemy carrier can be shot with guns, not just bombed (everything is
//    shootable), and rounds are ballistic projectiles that stop at the ground.
// Usage: bun scripts/diag-aircraft.ts

import { Matrix4, Scene, Vector3 } from "three";
import { AIRCRAFT, AIRCRAFT_LIST, specFor, type AircraftId } from "../src/sim/aircraft";
import { buildAircraft } from "../src/render/geometry";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { spawnAircraft, stepAircraft, type AircraftState } from "../src/sim/flight";
import { groundAt } from "../src/sim/world";

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

/** Point the nose along a world direction (safe even when it is near vertical). */
function aim(st: AircraftState, dir: Vector3): void {
  const d = dir.clone().normalize();
  const up = Math.abs(d.y) > 0.95 ? new Vector3(0, 0, -1) : UP;
  MAT4.lookAt(ORIGIN, d, up);
  st.quat.setFromRotationMatrix(MAT4);
}

/** A point over clear water near the middle of the arena. */
function overWater(): { x: number; z: number } {
  for (let i = 1; i < 6000; i++) {
    const a = i * 2.39996; // golden-angle spiral
    const r = Math.sqrt(i) * 90;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (groundAt(x, z).kind === "water") return { x, z };
  }
  return { x: 0, z: 0 };
}

function idle() {
  return {
    pitch: 0, roll: 0, yaw: 0,
    throttleUp: false, throttleDown: false,
    trimUp: false, trimDown: false,
    brake: false, catHold: false,
  };
}

/** A clean level-flight state for the given airframe. */
function cruise(id: AircraftId, speed = 200): AircraftState {
  const st = spawnAircraft("airfield", 0, id);
  st.pos.set(0, 3000, 0);
  st.vel.set(0, 0, -speed);
  st.speed = speed;
  st.gearDown = false;
  st.gearT = 0;
  st.flapsDown = false;
  st.flapT = 0;
  st.throttle = 0.8;
  st.rpm = 0.8;
  st.trim = 0.5;
  st.onGround = false;
  st.banner = null;
  return st;
}

/** Mid-air player over open water (used for ordnance tests). */
function airPlayer(id: AircraftId): AircraftState {
  const st = spawnAircraft("airfield", 0, id);
  st.pos.set(0, 1500, 0);
  st.vel.set(0, 0, 0);
  st.speed = 0;
  st.gearDown = false;
  st.gearT = 0;
  st.onGround = false;
  st.banner = null;
  return st;
}

// --- 1. the registry: three distinct types with distinct capabilities ---
{
  check("three airframes are offered", AIRCRAFT_LIST.length === 3, `${AIRCRAFT_LIST.length}`);
  const ids = new Set(AIRCRAFT_LIST.map((a) => a.id));
  check("airframe ids are unique", ids.size === AIRCRAFT_LIST.length);
  const fighter = AIRCRAFT.tomcat;
  const bomber = AIRCRAFT.intruder;
  const agile = AIRCRAFT.hornet;
  check("the bomber carries more bombs than the interceptor", bomber.bombs > fighter.bombs,
    `${bomber.bombs} vs ${fighter.bombs}`);
  check("the bomber carries more bombs than the multirole", bomber.bombs > agile.bombs,
    `${bomber.bombs} vs ${agile.bombs}`);
  check("the bomber has a tougher hull", bomber.hull > agile.hull, `${bomber.hull} vs ${agile.hull}`);
  check("the multirole rolls harder than the bomber", agile.clAil > bomber.clAil);
  check("the multirole is lighter than the interceptor", agile.mass < fighter.mass);
  check("all specs are fully populated",
    AIRCRAFT_LIST.every((a) => a.mass > 0 && a.sWing > 0 && a.hull > 0 && a.gunRps > 0 && a.name.length > 0));
  check("the Intruder has no afterburner", bomber.abThrust === 0, `${bomber.abThrust}`);
  check("unknown ids fall back to the Tomcat",
    specFor("nope" as AircraftId).id === "tomcat");
}

// --- 2. spawnAircraft wires the requested airframe ---
{
  for (const a of AIRCRAFT_LIST) {
    const st = spawnAircraft("carrier", 0, a.id);
    check(`spawn(${a.id}) carries its own spec`, st.spec.id === a.id && st.spec === a);
  }
  check("spawn still defaults to the Tomcat", spawnAircraft("airfield", 0).spec.id === "tomcat");
}

// --- 3. the flight model uses the spec ---
{
  // Acceleration: full burner, same start, the light fighter should pull ahead.
  const hornet = cruise("hornet");
  hornet.throttle = 1;
  hornet.rpm = 1;
  hornet.abOn = true;
  const intruder = cruise("intruder");
  intruder.throttle = 1;
  intruder.rpm = 1;
  intruder.abOn = true;
  for (let i = 0; i < Math.round(6 / DT); i++) {
    stepAircraft(hornet, { ...idle(), pitch: 0.05 }, DT);
    stepAircraft(intruder, { ...idle(), pitch: 0.05 }, DT);
  }
  check("the light fighter out-accelerates the bomber",
    hornet.speed > intruder.speed + 10,
    `${hornet.speed.toFixed(0)} vs ${intruder.speed.toFixed(0)} m/s`);
  check("the bomber never lights a burner", intruder.abLevel === 0, `${intruder.abLevel}`);

  // Roll authority.
  const fast = cruise("hornet");
  for (let i = 0; i < Math.round(1.5 / DT); i++) stepAircraft(fast, { ...idle(), roll: 1 }, DT);
  const slow = cruise("intruder");
  for (let i = 0; i < Math.round(1.5 / DT); i++) stepAircraft(slow, { ...idle(), roll: 1 }, DT);
  check("the multirole rolls faster than the bomber",
    Math.abs(fast.omega.z) > Math.abs(slow.omega.z) * 1.3,
    `${Math.abs(fast.omega.z).toFixed(2)} vs ${Math.abs(slow.omega.z).toFixed(2)} rad/s`);

  // Wing sweep: variable on the Tomcat, fixed on the others.
  const tomcat = cruise("tomcat", 400);
  for (let i = 0; i < Math.round(4 / DT); i++) stepAircraft(tomcat, idle(), DT);
  check("the Tomcat sweeps its wings at speed", tomcat.sweepT > 0.5 && tomcat.sweep > 45,
    `sweepT=${tomcat.sweepT.toFixed(2)} sweep=${tomcat.sweep.toFixed(0)}`);
  const hornet2 = cruise("hornet", 400);
  for (let i = 0; i < Math.round(4 / DT); i++) stepAircraft(hornet2, idle(), DT);
  check("fixed-wing types never sweep", hornet2.sweepT === 0 && hornet2.sweep === 0,
    `sweep=${hornet2.sweep}`);
}

// --- 4. dogfight loadout follows the airframe ---
{
  const d = new Dogfight(new Scene(), new ExplosionField(new Scene(), "low"));
  const bomber = airPlayer("intruder");
  d.begin(bomber);
  const hb = d.hud(bomber);
  check("the bomber is racked with sixteen bombs", hb.bombsMax === 16 && hb.bombs === 16,
    `${hb.bombs}/${hb.bombsMax}`);
  check("the bomber's hull is the tougher one", hb.hull === 130, `${hb.hull}`);
  // hold the release: 16 bombs at 0.5 s spacing takes 8 s to empty the racks
  for (let i = 0; i < Math.round(9 / DT); i++) {
    bomber.time += DT;
    d.step(DT, bomber, false, true);
  }
  const after = d.hud(bomber);
  check("the bomber can pickle all sixteen away", after.bombs === 0 && after.bombsAway === 16,
    `${after.bombs} left, ${after.bombsAway} away`);

  const tomcat = airPlayer("tomcat");
  d.begin(tomcat);
  const ht = d.hud(tomcat);
  check("the interceptor is racked with six bombs", ht.bombsMax === 6 && ht.bombs === 6,
    `${ht.bombs}/${ht.bombsMax}`);
  check("the interceptor's hull is 100", ht.hull === 100, `${ht.hull}`);
  d.dispose();
}

// --- 5. everything is shootable: guns can hull the enemy carrier ---
{
  const df = new Dogfight(new Scene(), new ExplosionField(new Scene(), "low"));
  const player = airPlayer("tomcat");
  df.begin(player);
  const cv = df.hud(player).carrier!;
  // dive on the deck from directly above and hold the trigger for two seconds.
  // Bandits do not launch until 2.2 s, so this window is deterministic.
  player.pos.set(cv.x, cv.y + 120, cv.z);
  player.vel.set(0, 0, 0);
  player.speed = 0;
  aim(player, new Vector3(0, -0.99, -0.14));
  for (let i = 0; i < Math.round(2 / DT); i++) {
    player.time += DT;
    df.step(DT, player, true);
  }
  const hit = df.hud(player).carrier!;
  check("gun rounds chew the enemy carrier's hull", hit.hp < 100, `hp=${hit.hp}`);
  check("the carrier is still floating while it has hull left",
    hit.status !== "sunk" && hit.status !== "sinking", hit.status);
  df.dispose();
}

// --- 6. rounds are ballistic and stop at the ground ---
{
  // Fire straight down at the sea from low level. At 1000 m/s the rounds reach
  // the surface in a fraction of their 1.6 s life: if the ground check were
  // missing they would still be in flight when we look.
  const df = new Dogfight(new Scene(), new ExplosionField(new Scene(), "low"));
  const player = airPlayer("tomcat");
  const w = overWater();
  player.pos.set(w.x, 300, w.z);
  df.begin(player);
  aim(player, new Vector3(0, -1, 0));
  player.vel.set(0, 0, 0);
  player.speed = 0;
  for (let i = 0; i < Math.round(0.6 / DT); i++) {
    player.time += DT;
    df.step(DT, player, true);
  }
  check("firing puts rounds in the air", df.tracerCount() > 0, `${df.tracerCount()}`);
  // 0.6 s more: the last round is only ~0.6 s old, so a round that ignored the
  // sea would still be alive. None should be.
  for (let i = 0; i < Math.round(0.6 / DT); i++) {
    player.time += DT;
    df.step(DT, player, false);
  }
  check("rounds stop at the water instead of tunnelling", df.tracerCount() === 0,
    `${df.tracerCount()} still flying`);
  check("the burst was fired over open water", groundAt(player.pos.x, player.pos.z).kind === "water");
  df.dispose();
}

// --- 7. every airframe mesh builds with the parts the rig needs ---
{
  for (const a of AIRCRAFT_LIST) {
    const m = buildAircraft(a.id);
    check(`mesh(${a.id}) exposes the rig parts`,
      m.wings.length === 2 && m.rudders.length === 2 && m.flaps.length === 2 &&
        !!m.gear && !!m.canopy && !!m.intakes && !!m.afterburner && m.group.children.length > 0);
  }
  check("only the Tomcat is sweepable",
    buildAircraft("tomcat").sweepable === true &&
      buildAircraft("hornet").sweepable === false &&
      buildAircraft("intruder").sweepable === false);
  check("bandit paint still builds a Tomcat", buildAircraft("tomcat", "bandit").group.children.length > 0);

  // --- wing sweep direction ------------------------------------------------
  // Body frame: nose at -Z, tail at +Z. A swept wing's tip therefore has to sit
  // AFT of its root. The F/A-18 and A-6 shipped swept the wrong way (tips forward,
  // over the cockpit), so this pins both the direction and the built-in angle.
  /**
   * A wing tip in body coordinates: outboard along ±X, and the aft displacement
   * measured from the wing root (the rig pivot), since body +Z is aft.
   */
  const wingTip = (id: AircraftId, side: 0 | 1) => {
    const m = buildAircraft(id);
    m.group.updateMatrixWorld(true);
    const panel = m.wingPanels[side];
    panel.geometry.computeBoundingBox();
    // the panel geometry spans 0..span along its own +Z, so the tip is max.z
    const tip = new Vector3(0, 0, panel.geometry.boundingBox!.max.z).applyMatrix4(
      panel.matrixWorld,
    );
    const sign = side === 0 ? 1 : -1;
    const pivot = m.wings[side].position;
    // Both offsets are measured from the wing root, so the angle is the wing's
    // own sweep and not diluted by where the root sits on the fuselage.
    return { outboard: (tip.x - pivot.x) * sign, aft: tip.z - pivot.z };
  };

  for (const [id, sweep] of [["hornet", 0.34], ["intruder", 0.12]] as Array<
    [AircraftId, number]
  >) {
    for (const side of [0, 1] as const) {
      const { outboard, aft } = wingTip(id, side);
      const where = `${id} ${side === 0 ? "right" : "left"} wing`;
      check(`mesh(${where}) tip sweeps aft`, aft > 0.3 && outboard > 1,
        `outboard ${outboard.toFixed(2)}, aft ${aft.toFixed(2)}`);
      const deg = (Math.atan2(aft, outboard) * 180) / Math.PI;
      check(`mesh(${where}) is swept ${((sweep * 180) / Math.PI).toFixed(1)}°`,
        Math.abs(deg - (sweep * 180) / Math.PI) < 1.5, `${deg.toFixed(1)}°`);
    }
  }
  // A wing that is not swept stays square: the Tomcat's panels sit straight out
  // until the rig swings them, so their tips must not be displaced fore or aft.
  for (const side of [0, 1] as const) {
    const { outboard, aft } = wingTip("tomcat", side);
    check(`mesh(tomcat ${side === 0 ? "right" : "left"} wing) builds square`,
      Math.abs(aft) < 0.5 && outboard > 1,
      `outboard ${outboard.toFixed(2)}, aft ${aft.toFixed(2)}`);
  }
}

// --- 8. the aircraft picker's list mirrors the spec table ---
{
  for (const a of AIRCRAFT_LIST) check(`list contains ${a.id}`, AIRCRAFT[a.id] === a);
  const ids = Object.keys(AIRCRAFT);
  check("spec table has exactly the offered ids", ids.length === AIRCRAFT_LIST.length,
    ids.join(","));
}

console.log(failures === 0 ? "\nALL AIRCRAFT CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
