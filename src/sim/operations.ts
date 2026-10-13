import { EXTENT, terrainHeight, ARCHIPELAGO } from "./world";

export type MissionStyle = "operation" | "endless";
export type EnemyRole = "fighter" | "scout" | "bomber" | "escort";
export type TargetRole = "cargo" | "escort" | "radar" | "practice";
export type OperationPhase = "convoy" | "scout" | "forming" | "strike" | "counterattack" | "final";
export interface OperationState {
  version: 1; id: number; seed: number; kind: "convoy" | "fleet";
  status: "briefing" | "active" | "success" | "failure";
  phase: OperationPhase; elapsed: number; phaseTime: number;
  fleetCarrier: number; fleetHull: number; stopped: number; arrived: number;
  scoutStopped: boolean; scoutReported: boolean; suppressed: boolean; deckDamage: number;
  optional: number; reason: string;
}
export interface OperationMetrics { stopped: number; arrived: number; scouts: number; attackers: number; queued: number }

/** Objective transitions are independent of aircraft, rendering and HUD text. */
export class Operation {
  constructor(public state: OperationState) {}
  static create(kind: OperationState["kind"], id: number, seed: number, fleetCarrier: number): Operation {
    return new Operation({ version: 1, id, seed, kind, status: "briefing", phase: kind === "convoy" ? "convoy" : "scout",
      elapsed: 0, phaseTime: 0, fleetCarrier, fleetHull: 100, stopped: 0, arrived: 0,
      scoutStopped: false, scoutReported: false, suppressed: false, deckDamage: 0, optional: 0, reason: "" });
  }
  start(): void { if (this.state.status === "briefing") this.state.status = "active"; }
  finish(success: boolean, reason: string): void {
    if (this.state.status === "success" || this.state.status === "failure") return;
    this.state.status = success ? "success" : "failure"; this.state.reason = reason;
  }
  reportScout(): void { this.state.scoutReported = true; }
  damageFleet(damage: number): void {
    if (this.state.status !== "active" || !Number.isFinite(damage) || damage <= 0) return;
    this.state.fleetHull = Math.max(0, this.state.fleetHull - damage);
    if (this.state.fleetHull <= 0) this.finish(false, "The friendly carrier was disabled.");
  }
  damageDeck(damage: number): void {
    this.state.deckDamage += damage;
    if (this.state.deckDamage >= 60) this.state.suppressed = true;
  }
  private phase(phase: OperationPhase): void { this.state.phase = phase; this.state.phaseTime = 0; }
  /** Returns a phase change so combat can spot the corresponding launch queue. */
  advance(dt: number, m: OperationMetrics): OperationPhase | null {
    const s = this.state;
    if (s.kind === "convoy") {
      if (s.stopped < 3 && m.stopped === 3) s.optional++;
      s.stopped = m.stopped; s.arrived = m.arrived;
    }
    if (s.status !== "active") return null;
    s.elapsed += dt; s.phaseTime += dt;
    if (s.kind === "convoy") {
      if (s.stopped >= 2) this.finish(true, "At least two transports stopped before unloading.");
      else if (s.arrived >= 2) this.finish(false, "Two transports reached the unloading line.");
      return null;
    }
    if (s.fleetHull <= 0) { this.finish(false, "The friendly carrier was disabled."); return null; }
    if (s.suppressed && m.attackers === 0 && m.queued === 0 && s.phase !== "scout") {
      this.finish(true, "Enemy launches suppressed; surviving attackers resolved."); return null;
    }
    const before = s.phase;
    if (s.phase === "scout" && m.scouts === 0 && m.queued === 0) {
      s.scoutStopped = !s.scoutReported; this.phase("forming");
    } else if (s.phase === "forming" && s.phaseTime >= (s.scoutStopped ? 60 : 15)) this.phase("strike");
    else if (s.phase === "strike" && m.attackers === 0 && m.queued === 0) this.phase("counterattack");
    else if (s.phase === "counterattack" && s.phaseTime >= 60) this.phase("final");
    else if (s.phase === "final" && m.attackers === 0 && m.queued === 0) this.finish(true, "Both attacks resolved; friendly fleet protected.");
    return s.phase !== before ? s.phase : null;
  }
}

export interface ConvoyRoute { x: number; z: number; dx: number; dz: number; length: number }
const hash = (n: number) => { const a = Math.sin(n * 127.1 + 311.7) * 43758.5453; return a - Math.floor(a); };
/** Validate the whole formation corridor, including bow/stern and lateral ships. */
export function safeConvoyRoute(r: ConvoyRoute): boolean {
  for (const c of ARCHIPELAGO.carriers) {
    const along = Math.max(0, Math.min(r.length, (c.x - r.x) * r.dx + (c.z - r.z) * r.dz));
    if (Math.hypot(c.x - r.x - r.dx * along, c.z - r.z - r.dz * along) < 1800) return false;
  }
  for (let d = -180; d <= r.length + 200; d += 40) {
    for (const side of [-1100, -930, -850, -770, -530, -450, -370, -80, 0, 80, 370, 450, 530, 770, 850, 930, 1100]) {
      const x = r.x + r.dx * d - r.dz * side, z = r.z + r.dz * d + r.dx * side;
      if (Math.abs(x) > EXTENT - 200 || Math.abs(z) > EXTENT - 200 || terrainHeight(x, z) > -12) return false;
    }
  }
  return true;
}
export function convoyRoute(x: number, z: number, seed: number): ConvoyRoute | null {
  let best: ConvoyRoute | null = null, distance = Infinity;
  for (let i = 0; i < 160; i++) {
    const angle = hash(seed * 7 + i * 9.1) * Math.PI * 2;
    const radius = i < 96 ? 5000 + hash(seed + i * 3.7) * 8000 : 14000 + hash(seed + i) * 16000;
    const dir = angle + Math.PI + (hash(seed * 3 + i) - .5) * 1.2;
    const r = { x: x + Math.sin(angle) * radius, z: z - Math.cos(angle) * radius, dx: Math.sin(dir), dz: -Math.cos(dir), length: 3480 };
    const d = Math.hypot(r.x - x, r.z - z);
    if (d < distance && safeConvoyRoute(r)) { best = r; distance = d; }
  }
  // A deterministic perimeter search handles dense islands near inland runways.
  if (!best) for (let i = 0; i < 64; i++) {
    const a = i * Math.PI * 2 / 64;
    const r = { x: Math.sin(a) * 26000, z: Math.cos(a) * 26000, dx: Math.cos(a), dz: -Math.sin(a), length: 3480 };
    const d = Math.hypot(r.x - x, r.z - z);
    if (d < distance && safeConvoyRoute(r)) { best = r; distance = d; }
  }
  return best;
}

export function operationTitle(s: OperationState): string { return s.kind === "convoy" ? "STOP THE CONVOY" : "FLEET DEFENSE"; }
export interface OperationHud {
  state: OperationState; eta: number | null; warning: boolean;
  target: { x: number; y: number; z: number; label: string; km: number; altitudeFt: number; closureKt: number; bearing: number } | null;
  storesUsed: number; recoveryBonus: number; recoveryWire: number; kills: number;
}
export function phaseObjective(s: OperationState): string {
  if (s.status === "briefing") return s.kind === "convoy" ? "Stop 2 of 3 transports. Escort and radar are optional." : "Protect your carrier. Intercept scouts, then bombers.";
  if (s.status === "success" || s.status === "failure") return s.reason;
  if (s.kind === "convoy") return `TRANSPORTS STOPPED ${s.stopped}/2 · ARRIVED ${s.arrived}/3`;
  return ({ scout: "INTERCEPT THE SCOUT — PREVENT ITS REPORT", forming: "PREPARE FOR THE STRIKE — REARM OR MOVE TO INTERCEPT", strike: "INTERCEPT BOMBERS — ESCORT IS SECONDARY", counterattack: "COUNTERATTACK THE FLIGHT DECK OR REARM", final: "FINAL STRIKE — INTERCEPT SPLIT BOMBERS", convoy: "" })[s.phase];
}
