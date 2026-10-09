// Keyboard + mouse input. Produces smoothed axis values for the sim and
// edge-triggered "just pressed" events for toggles.

import type { Action, Settings } from "../settings";

/** A left-click on the canvas, in client (CSS) pixels. */
export interface ClickEvent {
  x: number;
  y: number;
}

export interface InputFrame {
  pitch: number; // -1..1, +1 = nose up
  roll: number; // -1..1, +1 = roll right
  yaw: number; // -1..1, +1 = yaw right
  throttleUp: boolean;
  throttleDown: boolean;
  trimUp: boolean;
  trimDown: boolean;
  brake: boolean;
  catHold: boolean;
  fire: boolean;
}

export class InputManager {
  bindings: Record<Action, string>;
  sensitivity: number;

  private down = new Set<string>();
  private pressedQueue = new Set<Action>();
  private consumed = new Set<Action>();

  // axis state
  private pitch = 0;
  private roll = 0;
  private yaw = 0;

  // mouse camera drag
  mouseDX = 0;
  mouseDY = 0;
  private dragging = false;
  /** Pointer position in client pixels, for HUD designators. */
  pointerX = 0;
  pointerY = 0;
  /** Left-clicks (press + release without dragging) waiting to be consumed. */
  private clicks: ClickEvent[] = [];
  private pressStart: ClickEvent | null = null;
  private pressTravel = 0;
  /**
   * In the target pod a slew *ends* in a designation, so a release after
   * dragging still counts as a click. Everywhere else a camera drag is not a
   * click, or looking around would fire the guns course changes.
   */
  clicksAfterDrag = false;

  // rebind capture
  capture: ((code: string) => void) | null = null;

  private el: HTMLElement | null = null;
  private onKeyBound = (e: KeyboardEvent) => this.onKeyDown(e);
  private onKeyUpBound = (e: KeyboardEvent) => this.onKeyUp(e);
  private onDownBound = (e: MouseEvent) => this.onMouseDown(e);
  private onUpBound = (e: MouseEvent) => this.onMouseUp(e);
  private onMoveBound = (e: MouseEvent) => this.onMouseMove(e);
  private onBlurBound = () => {
    // A key-up event can be lost when the page loses focus; clear all
    // pressed/released latches as well as held keys.
    this.down.clear();
    this.pressedQueue.clear();
    this.consumed.clear();
    this.dragging = false;
    this.pressStart = null;
    this.pressTravel = 0;
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.clicks = [];
  };

  constructor(settings: Settings) {
    this.bindings = { ...settings.bindings };
    this.sensitivity = settings.sensitivity;
  }

  attach(el: HTMLElement): void {
    this.el = el;
    window.addEventListener("keydown", this.onKeyBound);
    window.addEventListener("keyup", this.onKeyUpBound);
    window.addEventListener("blur", this.onBlurBound);
    el.addEventListener("mousedown", this.onDownBound);
    window.addEventListener("mouseup", this.onUpBound);
    window.addEventListener("mousemove", this.onMoveBound);
  }

  detach(): void {
    window.removeEventListener("keydown", this.onKeyBound);
    window.removeEventListener("keyup", this.onKeyUpBound);
    window.removeEventListener("blur", this.onBlurBound);
    if (this.el) {
      this.el.removeEventListener("mousedown", this.onDownBound);
      this.el = null;
    }
    window.removeEventListener("mouseup", this.onUpBound);
    window.removeEventListener("mousemove", this.onMoveBound);
  }

  applySettings(s: Settings): void {
    this.bindings = { ...s.bindings };
    this.sensitivity = s.sensitivity;
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (this.capture) {
      e.preventDefault();
      this.capture(e.code);
      return;
    }
    if (e.repeat) return;
    // Menu controls keep their standard keyboard behaviour: arrows drive
    // sliders/selects and Space activates the focused button instead of
    // being eaten by the flight controls (and never reaching the widget).
    // Escape is exempt — it is the global pause/resume key and must keep
    // working wherever focus sits.
    const target = e.target as HTMLElement | null;
    if (
      e.code !== "Escape" &&
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.isContentEditable)
    ) {
      return;
    }
    const code = e.code;
    const action = this.actionFor(code);
    if (action) e.preventDefault();
    this.down.add(code);
    if (action && !this.consumed.has(action)) {
      this.pressedQueue.add(action);
      this.consumed.add(action);
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.down.delete(e.code);
    const action = this.actionFor(e.code);
    if (action) this.consumed.delete(action);
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    // A press only becomes a look-around drag once it actually travels; a tap
    // stays a click, so the target pod can be aimed at without first having to
    // fight the camera.
    this.pressStart = { x: e.clientX, y: e.clientY };
    this.pressTravel = 0;
  }

  private onMouseMove(e: MouseEvent): void {
    this.pointerX = e.clientX;
    this.pointerY = e.clientY;
    if (this.pressStart) {
      this.pressTravel = Math.max(
        this.pressTravel,
        Math.hypot(e.clientX - this.pressStart.x, e.clientY - this.pressStart.y),
      );
      if (!this.dragging && this.pressTravel > 4) this.dragging = true;
    }
    if (this.dragging) {
      this.mouseDX += e.movementX ?? 0;
      this.mouseDY += e.movementY ?? 0;
    }
  }

  private onMouseUp(e: MouseEvent): void {
    const wasDrag = this.dragging;
    this.dragging = false;
    this.pressStart = null;
    const slop = this.clicksAfterDrag ? Infinity : 4;
    if (e.button === 0 && (!wasDrag || this.clicksAfterDrag) && this.pressTravel <= slop) {
      this.clicks.push({ x: e.clientX, y: e.clientY });
      if (this.clicks.length > 4) this.clicks.shift();
    }
    this.pressTravel = 0;
  }

  /** Next left-click, or null when there is none pending. */
  takeClick(): ClickEvent | null {
    return this.clicks.shift() ?? null;
  }

  /** Drop pending clicks (screen changes, mission start). */
  clearClicks(): void {
    this.clicks = [];
  }

  private actionFor(code: string): Action | null {
    for (const a of Object.keys(this.bindings) as Action[]) {
      if (this.bindings[a] === code) return a;
    }
    return null;
  }

  private isDown(action: Action): boolean {
    return this.down.has(this.bindings[action]);
  }

  /** Consume an edge-triggered press (returns true once per press). */
  take(action: Action): boolean {
    if (this.pressedQueue.has(action)) {
      this.pressedQueue.delete(action);
      return true;
    }
    return false;
  }

  /** Drop queued edge events and clicks (used when screens change). */
  clearEdges(): void {
    this.pressedQueue.clear();
    this.clicks = [];
  }

  /** Sample axes for this sim tick. dt is the sim timestep. */
  sample(dt: number): InputFrame {
    // Pressing ramps in smoothly, but a released key recentres about twice as
    // fast: a digital key has to be able to stop the aircraft. With a symmetric
    // slow ramp the roll kept going for ~0.3 s after the key came up, so a
    // keyboard pilot overshot every bank by 30-40 deg.
    const press = 3.6 * this.sensitivity; // units per second toward target
    const release = press * 2;
    const tPitch = (this.isDown("pitchUp") ? 1 : 0) - (this.isDown("pitchDown") ? 1 : 0);
    const tRoll = (this.isDown("rollRight") ? 1 : 0) - (this.isDown("rollLeft") ? 1 : 0);
    const tYaw = (this.isDown("yawRight") ? 1 : 0) - (this.isDown("yawLeft") ? 1 : 0);

    this.pitch = moveToward(this.pitch, tPitch, (tPitch === 0 ? release : press) * dt);
    this.roll = moveToward(this.roll, tRoll, (tRoll === 0 ? release : press) * dt);
    this.yaw = moveToward(this.yaw, tYaw, (tYaw === 0 ? release : press) * dt);

    return {
      pitch: applyExpo(this.pitch),
      roll: applyExpo(this.roll),
      yaw: applyExpo(this.yaw),
      throttleUp: this.isDown("throttleUp"),
      throttleDown: this.isDown("throttleDown"),
      trimUp: this.isDown("trimUp"),
      trimDown: this.isDown("trimDown"),
      brake: this.isDown("brake"),
      catHold: this.isDown("cat"),
      fire: this.isDown("fire"),
    };
  }

  /** Mouse drag delta in px since last call, then resets. */
  takeMouse(): { dx: number; dy: number } {
    const d = { dx: this.mouseDX, dy: this.mouseDY };
    this.mouseDX = 0;
    this.mouseDY = 0;
    return d;
  }
}

function moveToward(v: number, target: number, maxStep: number): number {
  if (v < target) return Math.min(v + maxStep, target);
  if (v > target) return Math.max(v - maxStep, target);
  return v;
}

/** Soften small inputs (fine aiming) while keeping full deflection reachable. */
function applyExpo(v: number): number {
  const sign = Math.sign(v);
  const a = Math.abs(v);
  return sign * (0.35 * a + 0.65 * a * a * a);
}
