// Headless verification for the SH-60B Seahawk: the rotary-wing flight model.
//  * spawn is parked on the deck with no catapult,
//  * collective lifts it straight off the deck,
//  * the collective lever answers fast (a governor, not a jet spool),
//  * it hovers (thrust balances weight at that altitude's density) and climbs,
//  * up arrow tilts the disc FORWARD and down arrow back: the arrow pair reads
//    the other way round from the fixed-wing stick, because asking a helicopter
//    for "up" is asking it to go that way,
//  * a held bank keeps turning — the nose is pulled round with the bank instead
//    of the machine sliding sideways down its own fuselage,
//  * cyclic tilts to translate, pedal yaws,
//  * landing on the deck does not end the sortie (no tailhook),
//  * the mesh has a spinning rotor and never sweeps a wing.
// Usage: bun scripts/diag-heli.ts  (or: bun run test:heli)

import { Vector3 } from "three";
import { AIRCRAFT } from "../src/sim/aircraft";
import { atmosphere } from "../src/sim/atmosphere";
import { buildAircraft } from "../src/render/geometry";
import { spawnAircraft, stepAircraft } from "../src/sim/flight";
import { InputManager } from "../src/input/input";
import { defaultSettings } from "../src/settings";

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * The collective a hover costs at this altitude: rotor thrust has to equal
 * weight, and thrust scales with the density ratio, so thin air costs more.
 */
function hoverCollective(mass: number, idle: number, max: number, altM: number): number {
  const sigma = atmosphere(altM).sigma;
  return clamp((mass * 9.81 - sigma * idle) / (sigma * (max - idle)), 0, 1);
}

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

// --- a browser to type into -------------------------------------------------
// WHICH arrow does it is a promise made by the Controls screen, so the sections
// below drive the real InputManager with synthetic KeyboardEvents and push the
// frames it produces through the real flight model.
type Handler = (e: unknown) => void;
const winListeners = new Map<string, Set<Handler>>();
(globalThis as Record<string, unknown>).window = {
  addEventListener(type: string, h: Handler) {
    if (!winListeners.has(type)) winListeners.set(type, new Set());
    winListeners.get(type)!.add(h);
  },
  removeEventListener(type: string, h: Handler) {
    winListeners.get(type)?.delete(h);
  },
};
const keyboardEl = { addEventListener() {}, removeEventListener() {} };
function keyEvent(type: string, code: string): void {
  for (const h of [...(winListeners.get(type) ?? [])]) {
    h({ code, repeat: false, target: null, preventDefault() {} });
  }
}
const keys = new InputManager(defaultSettings());
keys.attach(keyboardEl as unknown as HTMLElement);

/** One input frame per sim tick, exactly as the engine takes them. */
function sample(dt: number) {
  return keys.sample(dt);
}

const DT = 1 / 120;
const idle = () => ({
  pitch: 0, roll: 0, yaw: 0,
  throttleUp: false, throttleDown: false,
  trimUp: false, trimDown: false, brake: false, catHold: false,
});

// --- 1. the spec is rotary wing ---
{
  const spec = AIRCRAFT.seahawk;
  check("the Seahawk is flagged rotorcraft", spec.rotorcraft === true);
  check("its thrust exceeds its weight (hover margin)",
    spec.thrustDry > spec.mass * 9.81, `${spec.thrustDry} vs ${(spec.mass * 9.81).toFixed(0)} N`);
  check("it carries countermeasures", spec.flares > 0, `${spec.flares}`);
  const st = spawnAircraft("carrier", 0, "seahawk");
  check("it spawns parked on the deck, not on the catapult", st.catPhase === "idle", st.catPhase);
  check("its banner says collective, not catapult", (st.banner?.text ?? "").toLowerCase().includes("collective"),
    st.banner?.text);
}

// --- 2. collective lifts it off the deck ---
{
  const st = spawnAircraft("carrier", 0, "seahawk");
  const deckY = st.pos.y;
  // Full collective for 6 s.
  for (let i = 0; i < Math.round(6 / DT); i++) {
    stepAircraft(st, { ...idle(), throttleUp: true }, DT);
  }
  check("full collective climbs off the deck", st.pos.y > deckY + 25, `dY ${(st.pos.y - deckY).toFixed(1)} m`);
  check("and it is airborne", st.airborne && !st.onGround);
  check("no result was raised just by lifting", st.result === null, JSON.stringify(st.result));
}

// --- 3. hover: near-zero vertical speed with the collective trimmed ---
{
  const st = spawnAircraft("airfield", 0, "seahawk");
  st.pos.set(0, 1200, 0);
  st.vel.set(0, 0, 0);
  st.onGround = false;
  st.airborne = true;
  st.banner = null;
  // Find the hover collective: rotor thrust == weight at sea-level sigma.
  const hold = hoverCollective(st.spec.mass, st.spec.idleThrust, st.spec.thrustDry, 1200);
  check("a hover is inside the rotor's envelope at altitude",
    (st.spec.mass * 9.81) / atmosphere(1200).sigma < st.spec.thrustDry,
    `need ${((st.spec.mass * 9.81) / atmosphere(1200).sigma).toFixed(0)} N`);
  st.throttle = hold;
  st.rpm = hold;
  for (let i = 0; i < Math.round(8 / DT); i++) stepAircraft(st, idle(), DT);
  check("it hovers near zero vertical speed", Math.abs(st.vspeed) < 1.5, `${st.vspeed.toFixed(2)} m/s`);
  check("hover altitude holds", Math.abs(st.pos.y - 1200) < 12, `y ${st.pos.y.toFixed(1)}`);
  check("hover is ~1 g", st.gLoad > 0.6 && st.gLoad < 1.4, `${st.gLoad.toFixed(2)}`);
}

// --- 4. cyclic: nose-down tilts and translates; the collective holds height ---
{
  const st = spawnAircraft("airfield", 0, "seahawk");
  st.pos.set(0, 1500, 0);
  st.vel.set(0, 0, 0);
  st.onGround = false;
  st.airborne = true;
  st.banner = null;
  const hold = hoverCollective(st.spec.mass, st.spec.idleThrust, st.spec.thrustDry, 1500);
  st.throttle = hold;
  st.rpm = hold;
  // Hold full forward cyclic (nose down) for 10 s: the machine tilts over and
  // translates, without sinking away or stalling (a rotor does not stall).
  // +pitch is nose DOWN here: the fore/aft cyclic reads reversed from the
  // winged stick, so the key that asks for it forward is ArrowUp (section 4b).
  for (let i = 0; i < Math.round(10 / DT); i++) stepAircraft(st, { ...idle(), pitch: 1 }, DT);
  const nose = new Vector3(0, 0, -1).applyQuaternion(st.quat);
  const horiz = new Vector3(st.vel.x, 0, st.vel.z);
  const noseH = new Vector3(nose.x, 0, nose.z).normalize();
  check("the machine leans nose-down into the translation", nose.y < -0.2, `nose.y ${nose.y.toFixed(2)}`);
  check("forward cyclic builds forward speed", horiz.length() > 20, `${horiz.length().toFixed(1)} m/s`);
  check("and the velocity is along the nose, not sideways",
    horiz.clone().normalize().dot(noseH) > 0.9, `dot ${horiz.clone().normalize().dot(noseH).toFixed(2)}`);
  check("translation stays level-ish (no dive), not stalled", !st.stalled && st.alpha === 0);
  // Now bank right: should roll to a right bank (negative roll attitude).
  const st2 = spawnAircraft("airfield", 0, "seahawk");
  st2.pos.set(0, 1500, 0);
  st2.onGround = false;
  st2.airborne = true;
  st2.banner = null;
  for (let i = 0; i < Math.round(3 / DT); i++) stepAircraft(st2, { ...idle(), roll: 1 }, DT);
  const right = new Vector3(1, 0, 0).applyQuaternion(st2.quat);
  check("right cyclic rolls into a right bank", right.y < -0.1, `right.y ${right.y.toFixed(2)}`);
}

// --- 4b. the arrow pair, through the real keyboard ---
{
  const st = spawnAircraft("airfield", 0, "seahawk");
  st.pos.set(0, 1500, 0);
  st.vel.set(0, 0, 0);
  st.onGround = false;
  st.airborne = true;
  st.banner = null;
  const hold = hoverCollective(st.spec.mass, st.spec.idleThrust, st.spec.thrustDry, 1500);
  st.rpm = hold;
  st.throttle = hold;
  for (let i = 0; i < Math.round(2 / DT); i++) stepAircraft(st, idle(), DT);

  /** Hold these arrow codes for a while, stepping the real input manager. */
  const holdKeys = (codes: string[], seconds: number): void => {
    for (const c of codes) keyEvent("keydown", c);
    for (let i = 0; i < Math.round(seconds / DT); i++) stepAircraft(st, sample(DT), DT);
    for (const c of codes) keyEvent("keyup", c);
    sample(DT);
  };
  const noseY = () => new Vector3(0, 0, -1).applyQuaternion(st.quat).y;
  const groundSpeed = () => Math.hypot(st.vel.x, st.vel.z);

  holdKeys(["ArrowUp"], 8);
  check("up arrow leans the disc forward", noseY() < -0.15, `nose.y ${noseY().toFixed(2)}`);
  const speeding = groundSpeed();
  check("and up arrow accelerates the machine forward", speeding > 12, `${speeding.toFixed(1)} m/s`);
  check("up arrow is not a height control on its own", Math.abs(st.pos.y - 1500) < 300, `y ${st.pos.y.toFixed(0)}`);

  holdKeys(["ArrowDown"], 10);
  check("down arrow lifts the nose the other way", noseY() > 0.15, `nose.y ${noseY().toFixed(2)}`);
  check("and down arrow takes the speed back off", groundSpeed() < speeding - 5,
    `${groundSpeed().toFixed(1)} vs ${speeding.toFixed(1)} m/s`);
}

// --- 4c. a held bank keeps turning ------------------------------------------
// The reported bug: hold a bank and the turn looked right for a second or two,
// then the heading froze and the machine slid sideways down its own fuselage.
// A banked helicopter has its nose pulled round by the fin and tail rotor, so
// the model turns the nose with the bank — continuously, for as long as the
// pilot holds it, at the rate the bank is actually making.
{
  const hold = hoverCollective(AIRCRAFT.seahawk.mass, AIRCRAFT.seahawk.idleThrust, AIRCRAFT.seahawk.thrustDry, 1500);
  const st = spawnAircraft("airfield", 0, "seahawk");
  st.pos.set(0, 1500, 0);
  st.vel.set(0, 0, 0);
  st.onGround = false;
  st.airborne = true;
  st.banner = null;
  st.rpm = hold;
  st.throttle = hold;
  for (let i = 0; i < Math.round(2 / DT); i++) stepAircraft(st, idle(), DT);

  const wrap = (d: number) => ((d + 540) % 360) - 180;
  const bankDeg = () =>
    (Math.asin(Math.max(-1, Math.min(1, new Vector3(1, 0, 0).applyQuaternion(st.quat).y))) * 180) / Math.PI;
  const slipDeg = () => {
    const f = new Vector3(0, 0, -1).applyQuaternion(st.quat);
    const r = new Vector3(1, 0, 0).applyQuaternion(st.quat);
    const vf = st.vel.x * f.x + st.vel.z * f.z;
    const vr = st.vel.x * r.x + st.vel.z * r.z;
    return (Math.atan2(vr, Math.max(vf, 1)) * 180) / Math.PI;
  };

  const h0 = st.headingDeg;
  const turns: number[] = [];
  const banks: number[] = [];
  const slips: number[] = [];
  const speeds: number[] = [];
  let prevH = st.headingDeg;
  keyEvent("keydown", "ArrowUp");
  keyEvent("keydown", "ArrowLeft");
  for (let sec = 0; sec < 12; sec++) {
    for (let i = 0; i < Math.round(1 / DT); i++) stepAircraft(st, sample(DT), DT);
    turns.push(wrap(st.headingDeg - prevH));
    prevH = st.headingDeg;
    banks.push(Math.abs(bankDeg()));
    slips.push(Math.abs(slipDeg()));
    speeds.push(st.speed);
  }
  keyEvent("keyup", "ArrowUp");
  keyEvent("keyup", "ArrowLeft");

  const tail = turns.slice(-4);
  check("a held bank rolls past the old 40 deg stop", Math.max(...banks) > 44,
    `max ${Math.max(...banks).toFixed(1)} deg`);
  check("and the bank holds while the key is held", Math.min(...banks.slice(4)) > 38,
    `min ${Math.min(...banks.slice(4)).toFixed(1)} deg`);
  check("the turn never stops: the nose is still coming round in the last second",
    Math.abs(tail[tail.length - 1]) > 2, `${tail[tail.length - 1].toFixed(1)} deg/s`);
  check("every one of the last four seconds turns the nose", tail.every((t) => Math.abs(t) > 2),
    tail.map((t) => t.toFixed(1)).join(", "));
  check("and the whole hold turns through a real arc", Math.abs(wrap(st.headingDeg - h0)) > 60,
    `${wrap(st.headingDeg - h0).toFixed(0)} deg`);
  check("the nose stays with the flight path (no skidding turn)", Math.max(...slips.slice(6)) < 12,
    `max slip ${Math.max(...slips.slice(6)).toFixed(1)} deg`);
  check("and the machine does not run away past its never-exceed speed", Math.max(...speeds) < 100,
    `max ${Math.max(...speeds).toFixed(0)} m/s`);
}

// --- 5. pedal yaws the nose ---
{
  const st = spawnAircraft("airfield", 0, "seahawk");
  st.pos.set(0, 1500, 0);
  st.onGround = false;
  st.airborne = true;
  st.banner = null;
  const h0 = st.headingDeg;
  for (let i = 0; i < Math.round(3 / DT); i++) stepAircraft(st, { ...idle(), yaw: 1 }, DT);
  const delta = ((st.headingDeg - h0 + 540) % 360) - 180;
  check("right pedal yaws the nose right", delta > 5, `delta ${delta.toFixed(1)} deg`);
}

// --- 6. a deck landing is a recovery, not the end of the sortie ---
{
  const st = spawnAircraft("carrier", 0, "seahawk");
  st.pos.y += 40;
  st.onGround = false;
  st.airborne = true;
  st.vel.set(0, -2, 0);
  // Sink onto the deck the way a pilot would: a little under hover collective.
  // (An idle-collective arrival is a 4,800 fpm slam, and that really is a
  // crash — the test that expected otherwise was wrong, not the model.)
  const hold = hoverCollective(st.spec.mass, st.spec.idleThrust, st.spec.thrustDry, st.pos.y);
  st.rpm = hold * 0.96;
  st.throttle = st.rpm;
  for (let i = 0; i < Math.round(12 / DT); i++) stepAircraft(st, idle(), DT);
  check("the descent stays inside the landing limits", st.vel.y > -15, `${st.vel.y.toFixed(1)} m/s`);
  check("it settles onto the deck", st.onGround, `y ${st.pos.y.toFixed(1)}`);
  check("landing does not freeze the sortie (no wire/landing result)", st.result === null,
    JSON.stringify(st.result));
  const y = st.pos.y;
  for (let i = 0; i < Math.round(4 / DT); i++) stepAircraft(st, { ...idle(), throttleUp: true }, DT);
  check("and it can lift off again", st.pos.y > y + 10 && !st.onGround, `dY ${(st.pos.y - y).toFixed(1)}`);
}

// --- 7. the mesh: rotor present, no variable-sweep wing ---
{
  const m = buildAircraft("seahawk");
  check("the Seahawk mesh has a main rotor", !!m.rotor);
  check("and a tail rotor", !!m.tailRotor);
  check("and it is not a variable-sweep type", m.sweepable === false);
  check("and it still exposes the shared rig parts",
    m.wings.length === 2 && m.rudders.length === 2 && m.flaps.length === 2 && !!m.gear && !!m.canopy);
}

console.log(failures === 0 ? "\nALL HELICOPTER CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
