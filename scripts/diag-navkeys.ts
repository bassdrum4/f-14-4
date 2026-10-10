// Navigation keys, end to end.
//
// Every binding the Controls screen advertises has to do what its label says,
// in the direction it says, by the amount the input ramp promises — and the
// frame it produces has to actually fly the aeroplane. The keys are driven
// through the real InputManager with synthetic KeyboardEvents (the same
// handlers the browser calls), then the resulting frame is pushed through the
// real flight model, so a sign that is backwards anywhere between the
// keydown and the control surface shows up here.
//
// Usage: bun scripts/diag-navkeys.ts
import { InputManager, type InputFrame } from "../src/input/input";
import { defaultSettings, type Settings } from "../src/settings";
import { spawnAircraft, stepAircraft, type AircraftState, type FlightInput } from "../src/sim/flight";

const DT = 1 / 120;
let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

// --- a browser to type into -------------------------------------------------
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
const el = {
  addEventListener() {},
  removeEventListener() {},
};

interface FakeKey {
  code: string;
  repeat: boolean;
  target: unknown;
  prevented: boolean;
  preventDefault(): void;
}
function dispatch(type: string, code: string, opts: { repeat?: boolean; target?: unknown } = {}): FakeKey {
  const e: FakeKey = {
    code,
    repeat: opts.repeat ?? false,
    target: opts.target ?? null,
    prevented: false,
    preventDefault() {
      this.prevented = true;
    },
  };
  for (const h of [...(winListeners.get(type) ?? [])]) h(e);
  return e;
}
const down = (code: string, opts?: { repeat?: boolean; target?: unknown }) => dispatch("keydown", code, opts);
const up = (code: string) => dispatch("keyup", code);

/** The ramp input.ts documents: 3.6 · sensitivity units/second, then expo. */
const expo = (v: number): number => {
  const a = Math.abs(v);
  return Math.sign(v) * (0.35 * a + 0.65 * a * a * a);
};
const approx = (a: number, b: number, eps = 1e-6): boolean => Math.abs(a - b) <= eps;

function rig(sensitivity = 1.35): InputManager {
  const s: Settings = defaultSettings();
  const m = new InputManager(s);
  m.applySettings({ ...s, sensitivity });
  m.attach(el as unknown as HTMLElement);
  return m;
}

/** Hold `codes` for `seconds`, sampling every sim tick; returns the last frame. */
function hold(m: InputManager, codes: string[], seconds: number): InputFrame {
  for (const c of codes) down(c);
  let f = m.sample(DT);
  for (let i = 1; i < Math.round(seconds / DT); i++) f = m.sample(DT);
  return f;
}
function release(m: InputManager, codes: string[], seconds = 0): InputFrame {
  for (const c of codes) up(c);
  let f = m.sample(DT);
  for (let i = 1; i < Math.round(seconds / DT); i++) f = m.sample(DT);
  return f;
}
function clear(m: InputManager): void {
  for (const c of [
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "KeyW", "KeyA", "KeyS", "KeyD", "KeyB", "KeyQ", "KeyJ", "KeyZ",
  ]) up(c);
  m.sample(DT);
}

// --- 1. direction: each navigation key drives its own axis, with its sign ----
// The convention under test is the one the Controls screen promises:
//   ArrowUp = nose up (+pitch)   ArrowLeft = roll left (-roll)
//   A/D     = rudder left/right  W/S       = throttle up/down
console.log("--- direction ---");
{
  const cases: Array<[string, string[], (f: InputFrame) => number, number]> = [
    ["ArrowUp pitches the nose up", ["ArrowUp"], (f) => f.pitch, 1],
    ["ArrowDown pitches the nose down", ["ArrowDown"], (f) => f.pitch, -1],
    ["ArrowLeft rolls left", ["ArrowLeft"], (f) => f.roll, -1],
    ["ArrowRight rolls right", ["ArrowRight"], (f) => f.roll, 1],
    ["A yaws left", ["KeyA"], (f) => f.yaw, -1],
    ["D yaws right", ["KeyD"], (f) => f.yaw, 1],
  ];
  for (const [name, codes, axis, want] of cases) {
    const m = rig(1);
    const f = hold(m, codes, 1);
    check(name, approx(axis(f), want), `got ${axis(f).toFixed(4)} want ${want}`);
    m.detach();
  }

  // Opposite keys must cancel, not fight: a keyboard has no springs.
  for (const [name, codes, axis] of [
    ["Up and Down cancel on the pitch axis", ["ArrowUp", "ArrowDown"], (f: InputFrame) => f.pitch],
    ["Left and Right cancel on the roll axis", ["ArrowLeft", "ArrowRight"], (f: InputFrame) => f.roll],
    ["A and D cancel on the rudder axis", ["KeyA", "KeyD"], (f: InputFrame) => f.yaw],
  ] as Array<[string, string[], (f: InputFrame) => number]>) {
    const m = rig(1);
    const f = hold(m, codes, 1);
    check(name, approx(axis(f), 0), `got ${axis(f).toFixed(4)}`);
    m.detach();
  }
}

// --- 2. amount: the ramp rate the input layer promises -----------------------
console.log("--- amount ---");
{
  // Pressing ramps at 3.6 · sensitivity units/second; a digital key reaches
  // full deflection in 1/3.6 s and no sooner.
  const m = rig(1);
  const f = hold(m, ["ArrowUp"], 0.1);
  check(
    "0.10 s of ArrowUp at sensitivity 1 ramps to expo(0.36)",
    approx(f.pitch, expo(0.36)),
    `got ${f.pitch.toFixed(6)} want ${expo(0.36).toFixed(6)}`,
  );
  clear(m);
  const full = hold(m, ["ArrowUp"], 1 / 3.6);
  check(
    "a pitch key reaches full deflection in 1/3.6 s",
    approx(full.pitch, 1, 1e-9),
    `got ${full.pitch.toFixed(6)}`,
  );
  clear(m);

  // Releasing centres at twice the press rate, which is what lets a keyboard
  // pilot actually stop a roll instead of coasting through it.
  hold(m, ["ArrowRight"], 1);
  const coast = release(m, ["ArrowRight"], 0.1);
  const atDoubleRate = 1 - 2 * 3.6 * 0.1;
  check(
    "a released axis centres at twice the press rate",
    approx(coast.roll, expo(atDoubleRate), 1e-6),
    `got ${coast.roll.toFixed(6)} want ${expo(atDoubleRate).toFixed(6)} (single-rate would be ${expo(1 - 3.6 * 0.1).toFixed(6)})`,
  );
  clear(m);
  m.detach();
}
{
  // Sensitivity multiplies the ramp, and only the ramp — not the endpoints.
  const fast = rig(2);
  const fFast = hold(fast, ["ArrowDown"], 0.1);
  check(
    "sensitivity 2 ramps twice as fast",
    approx(fFast.pitch, -expo(0.72), 1e-6),
    `got ${fFast.pitch.toFixed(6)} want ${-expo(0.72).toFixed(6)}`,
  );
  fast.detach();

  const slow = rig(0.5);
  const fSlow = hold(slow, ["ArrowDown"], 0.1);
  check(
    "sensitivity 0.5 ramps half as fast",
    approx(fSlow.pitch, -expo(0.18), 1e-6),
    `got ${fSlow.pitch.toFixed(6)} want ${-expo(0.18).toFixed(6)}`,
  );
  slow.detach();

  const full = rig(3);
  const fFull = hold(full, ["ArrowDown"], 1);
  check(
    "a higher sensitivity still stops at full deflection, never past it",
    approx(fFull.pitch, -1, 1e-9),
    `got ${fFull.pitch.toFixed(6)}`,
  );
  full.detach();
}

// --- 3. the rest of the nav/weapon keys: plain on/off states -----------------
console.log("--- switches ---");
{
  const switches: Array<[string, string, (f: InputFrame) => boolean]> = [
    ["W opens the throttle", "KeyW", (f) => f.throttleUp],
    ["S closes the throttle", "KeyS", (f) => f.throttleDown],
    ["B is the wheel brake", "KeyB", (f) => f.brake],
    ["Space holds the catapult", "Space", (f) => f.catHold],
    ["Q is the gun trigger", "KeyQ", (f) => f.fire],
  ];
  for (const [name, code, pick] of switches) {
    const m = rig(1);
    check(`${name} (pressed)`, pick(hold(m, [code], 0.05)));
    check(`${name} (released)`, !pick(release(m, [code], 0.05)));
    m.detach();
  }
}

// --- 4. the plumbing around the keys ----------------------------------------
console.log("--- plumbing ---");
{
  const m = rig(1);
  const bound = down("ArrowUp");
  check("a bound key is prevented from scrolling the page", bound.prevented);
  up("ArrowUp");
  // Any code nobody has bound, read off the live table: adding a keybind (the
  // flare key, for one) must not silently make this check meaningless.
  const unboundCode = ["KeyH", "KeyJ", "KeyK", "KeyL", "F7"].find(
    (c) => !Object.values(m.bindings).includes(c),
  )!;
  const unbound = down(unboundCode);
  check(`an unbound key is left alone (${unboundCode})`, !unbound.prevented);
  up(unboundCode);

  m.clearEdges();
  down("ArrowUp");
  const first = m.take("pitchUp");
  const second = m.take("pitchUp");
  check("a held key fires its edge once, not once per auto-repeat", first && !second);
  const held = down("ArrowUp", { repeat: true });
  check("an auto-repeat event never re-queues the edge", !m.take("pitchUp") && held.prevented);
  up("ArrowUp");
  m.clearEdges();

  // Typing must not fly the aircraft: the handler bails out on text targets.
  const boxed = down("KeyW", { target: { tagName: "INPUT" } });
  const f = m.sample(DT);
  check("keys aimed at a text box do not move the controls", !f.throttleUp);
  check("keys aimed at a text box are not even prevented", !boxed.prevented);
  up("KeyW");

  // Window blur must drop everything held, or the jet flies itself after
  // the pilot clicks another window.
  down("ArrowRight");
  void m.sample(DT);
  for (const h of [...(winListeners.get("blur") ?? [])]) h({});
  const after = m.sample(DT);
  check("losing focus releases every held key", approx(after.roll, 0, 1e-6), `got ${after.roll.toFixed(6)}`);
  m.detach();
}

// --- 5. rebinding -----------------------------------------------------------
console.log("--- rebinding ---");
{
  const s = defaultSettings();
  const m = new InputManager(s);
  m.applySettings({ ...s, sensitivity: 1 });
  m.attach(el as unknown as HTMLElement);
  const before = hold(m, ["KeyA"], 1);
  clear(m);
  check("A yaws left on the default binding", approx(before.yaw, -1), `got ${before.yaw.toFixed(4)}`);

  m.applySettings({ ...s, sensitivity: 1, bindings: { ...s.bindings, yawLeft: "KeyJ" } });
  const afterA = hold(m, ["KeyA"], 1);
  clear(m);
  check("A stops yawing once it is rebound", approx(afterA.yaw, 0), `got ${afterA.yaw.toFixed(4)}`);

  const afterJ = hold(m, ["KeyJ"], 1);
  clear(m);
  check("the new binding yaws left instead", approx(afterJ.yaw, -1), `got ${afterJ.yaw.toFixed(4)}`);
  m.detach();
}

// --- 6. end to end: the frame the keys produce actually flies the jet --------
// Everything above proves the axis values. This proves the axis values mean
// what the Controls screen says they mean once they reach the control
// surfaces: +pitch climbs, +roll rolls right, +yaw swings the nose right,
// and the throttle keys actually move the throttle.
console.log("--- through the flight model ---");
{
  function airborne(): AircraftState {
    const st = spawnAircraft("carrier", 0);
    st.pos.set(0, 3000, 0);
    st.onGround = false;
    st.airborne = true;
    st.catPhase = "idle";
    st.gearDown = false;
    st.gearT = 0;
    st.flapsDown = false;
    st.flapT = 0;
    const { x, y, z, w } = st.quat;
    // velocity along the nose, so the jet starts settled instead of departed
    st.vel.set(-2 * (x * z + y * w), -2 * (y * z - x * w), -(1 - 2 * (x * x + y * y))).multiplyScalar(180);
    st.speed = 180;
    st.omega.set(0, 0, 0);
    st.throttle = 0.7;
    st.rpm = 0.7;
    return st;
  }
  function attitude(st: AircraftState): { pitch: number; bank: number; hdg: number } {
    const { x, y, z, w } = st.quat;
    const fy = -2 * (y * z - x * w);
    const ry = 2 * (x * y + z * w);
    const fx = -2 * (x * z + y * w);
    const fz = -(1 - 2 * (x * x + y * y));
    const deg = (v: number) => (Math.asin(Math.max(-1, Math.min(1, v))) * 180) / Math.PI;
    return {
      pitch: deg(fy),
      bank: deg(-ry),
      hdg: ((Math.atan2(fx, -fz) * 180) / Math.PI + 360) % 360,
    };
  }
  /** One second of held keys, turned into the frame the sim steps with. */
  function fly(codes: string[]): AircraftState {
    const m = rig(1);
    const frame = hold(m, codes, 1);
    m.detach();
    const st = airborne();
    const a = attitude(st);
    const inp = frame as FlightInput;
    for (let i = 0; i < 120; i++) stepAircraft(st, inp, DT);
    void a;
    return st;
  }

  const s0 = airborne();
  const a0 = attitude(s0);

  const climb = fly(["ArrowUp"]);
  const aClimb = attitude(climb);
  check(
    "holding ArrowUp climbs the jet",
    aClimb.pitch - a0.pitch > 5,
    `pitch ${a0.pitch.toFixed(1)} -> ${aClimb.pitch.toFixed(1)}`,
  );

  const dive = fly(["ArrowDown"]);
  const aDive = attitude(dive);
  check(
    "holding ArrowDown dives the jet",
    aDive.pitch - a0.pitch < -5,
    `pitch ${a0.pitch.toFixed(1)} -> ${aDive.pitch.toFixed(1)}`,
  );

  const right = fly(["ArrowRight"]);
  const aRight = attitude(right);
  check(
    "holding ArrowRight rolls the jet to the right",
    aRight.bank - a0.bank > 20,
    `bank ${a0.bank.toFixed(1)} -> ${aRight.bank.toFixed(1)}`,
  );

  const left = fly(["ArrowLeft"]);
  const aLeft = attitude(left);
  check(
    "holding ArrowLeft rolls the jet to the left",
    aLeft.bank - a0.bank < -20,
    `bank ${a0.bank.toFixed(1)} -> ${aLeft.bank.toFixed(1)}`,
  );

  const yawRight = fly(["KeyD"]);
  const aYawR = attitude(yawRight);
  const dR = ((aYawR.hdg - a0.hdg + 540) % 360) - 180;
  check("holding D swings the nose right", dR > 2, `hdg ${a0.hdg.toFixed(1)} -> ${aYawR.hdg.toFixed(1)}`);

  const yawLeft = fly(["KeyA"]);
  const aYawL = attitude(yawLeft);
  const dL = ((aYawL.hdg - a0.hdg + 540) % 360) - 180;
  check("holding A swings the nose left", dL < -2, `hdg ${a0.hdg.toFixed(1)} -> ${aYawL.hdg.toFixed(1)}`);

  const spoolUp = fly(["KeyW"]);
  check("holding W spools the throttle up", spoolUp.throttle > 0.7, `throttle ${spoolUp.throttle.toFixed(3)}`);

  const spoolDown = fly(["KeyS"]);
  check("holding S spools the throttle down", spoolDown.throttle < 0.7, `throttle ${spoolDown.throttle.toFixed(3)}`);
}

console.log(failures === 0 ? "\nALL NAVKEY CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
