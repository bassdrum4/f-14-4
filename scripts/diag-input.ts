// Verify InputManager key routing: flight keys still drive the sim, but keys
// targeted at menu form controls (sliders, selects, buttons) are left alone,
// while Escape keeps working as the global pause/resume key.
// Usage: bun scripts/diag-input.ts

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

// --- minimal DOM stubs -----------------------------------------------------

type Listener = (e: unknown) => void;

class FakeTarget {
  private listeners = new Map<string, Set<Listener>>();
  addEventListener(type: string, fn: Listener): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
  }
  removeEventListener(type: string, fn: Listener): void {
    this.listeners.get(type)?.delete(fn);
  }
  dispatch(type: string, event: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) fn(event);
  }
  count(type: string): number {
    return this.listeners.get(type)?.size ?? 0;
  }
}

const win = new FakeTarget();
(globalThis as unknown as { window: unknown }).window = win;

interface FakeKey {
  code: string;
  repeat: boolean;
  target: { tagName: string; isContentEditable: boolean };
  prevented: boolean;
  preventDefault(): void;
}

function key(code: string, tagName = "BODY"): FakeKey {
  const e: FakeKey = {
    code,
    repeat: false,
    target: { tagName, isContentEditable: false },
    prevented: false,
    preventDefault() {
      e.prevented = true;
    },
  };
  return e;
}

// --- attach + flight keys --------------------------------------------------

const settings = defaultSettings();
const input = new InputManager(settings);
const canvas = new FakeTarget();
input.attach(canvas as unknown as HTMLElement);

check("window listeners attached", win.count("keydown") === 1 && win.count("keyup") === 1);

// held pitch-up key on the page body: consumed by the flight controls
const up = key("ArrowUp");
win.dispatch("keydown", up);
check("flight key is prevent-defaulted", up.prevented);
check("edge fires once", input.take("pitchUp") && !input.take("pitchUp"));
const f1 = input.sample(1 / 60);
check("sample() reports pitch axis", f1.pitch > 0, `pitch=${f1.pitch.toFixed(3)}`);
win.dispatch("keyup", key("ArrowUp"));
const f2 = input.sample(1 / 60);
check("key release decays the axis", f2.pitch < f1.pitch, `${f1.pitch.toFixed(3)} -> ${f2.pitch.toFixed(3)}`);

// same key while a slider/select/button has focus: handed to the widget
for (const tag of ["INPUT", "SELECT", "BUTTON", "TEXTAREA"]) {
  const e = key("ArrowUp", tag);
  win.dispatch("keydown", e);
  check(`${tag} keeps the arrow key (no preventDefault)`, !e.prevented);
}
check("arrow into a widget never reaches the sim", !input.take("pitchUp"));
const idle = input.sample(1 / 60);
check("axis unchanged by widget key", idle.pitch === 0, `pitch=${idle.pitch}`);

// Space on a focused button must not fire the catapult edge
const spaceInButton = key("Space", "BUTTON");
win.dispatch("keydown", spaceInButton);
check("Space on a button is left to the button", !spaceInButton.prevented && !input.take("cat"));

// Escape is exempt everywhere: pause must fire even from a focused button
const esc = key("Escape", "BUTTON");
win.dispatch("keydown", esc);
check("Escape still pauses from a focused button", esc.prevented && input.take("pause"));

// --- detach ----------------------------------------------------------------

input.detach();
check("listeners removed on detach", win.count("keydown") === 0 && win.count("keyup") === 0);

console.log(failures === 0 ? "\nALL INPUT CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
