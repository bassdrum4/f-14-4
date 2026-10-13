import type { EnemyCarrierState, EnemyPose, Scenario } from "./dogfight";
import type { TargetKind } from "../render/targets";
import type { ConvoyRoute, EnemyRole, OperationState, TargetRole } from "./operations";

export interface SharedTarget {
  id: number; kind: TargetKind; role: TargetRole; x: number; y: number; z: number;
  headingDeg: number; hp: number; sea: boolean; dead: boolean; disabled: boolean; arrived: boolean;
  speed: number; progress: number; route: ConvoyRoute | null; ammo: number; tracking: number; cooldown: number;
}
export interface SharedBandit extends EnemyPose {
  role: EnemyRole; speed: number; missiles: number; ammo: number; bombs: number;
  retreat: boolean; sortieTime: number; launchWave: number; missileCd: number;
  fireCd: number; burst: number; catT: number; catAcross: number; climbT: number;
}
export interface SharedCombat {
  version: 1; id: number; revision: number; active: boolean; scenario: Scenario; wave: number;
  kills: number; nextId: number; carrier: EnemyCarrierState | null;
  operation: OperationState | null; targets: SharedTarget[]; bandits: SharedBandit[];
  queue: EnemyRole[]; launchTimer: number;
  fireSerial: number;
  bombs: Array<{ id: number; pos: number[]; vel: number[]; age: number }>;
}
export interface EnemyFire { combatId: number; seq: number; weapon: "gun" | "missile"; pos: number[]; vel: number[]; target?: string }
export function validEnemyFire(f: EnemyFire): boolean {
  return !!f && Number.isSafeInteger(f.combatId) && Number.isSafeInteger(f.seq) && f.seq > 0 && (f.weapon === "gun" || f.weapon === "missile") &&
    [f.pos, f.vel].every(v => Array.isArray(v) && v.length === 3 && v.every(n => Number.isFinite(n) && Math.abs(n) <= 100000)) && (f.target === undefined || typeof f.target === "string");
}
const finite = (o: object, keys: string[]) => !!o && typeof o === "object" && keys.every(k => typeof (o as Record<string, unknown>)[k] === "number" && Number.isFinite((o as Record<string, number>)[k]));
/** Bound arrays and validate all fields used by simulation before accepting a frame. */
export function validSharedCombat(value: unknown): value is SharedCombat {
  if (!value || typeof value !== "object") return false;
  const s = value as SharedCombat;
  if (s.version !== 1 || !finite(s, ["id", "revision", "wave", "kills", "nextId", "launchTimer", "fireSerial"]) || s.id <= 0 || s.revision < 0 || typeof s.active !== "boolean" || !["strike", "dogfight"].includes(s.scenario)) return false;
  if (!Array.isArray(s.targets) || s.targets.length > 16 || !Array.isArray(s.bandits) || s.bandits.length > 16 || !Array.isArray(s.queue) || s.queue.length > 8 || !s.queue.every(r => ["fighter", "scout", "bomber", "escort"].includes(r))) return false;
  if (!Array.isArray(s.bombs) || s.bombs.length > 8 || !s.bombs.every(b => b && finite(b, ["id", "age"]) && [b.pos, b.vel].every(v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite)))) return false;
  if (!s.targets.every(t => t && finite(t, ["id", "x", "y", "z", "headingDeg", "hp", "speed", "progress", "ammo", "tracking", "cooldown"]) && ["hangar", "tank", "warehouse", "ship", "patrol"].includes(t.kind) && ["cargo", "escort", "radar", "practice"].includes(t.role) && [t.sea, t.dead, t.disabled, t.arrived].every(b => typeof b === "boolean") && (t.route === null || finite(t.route, ["x", "z", "dx", "dz", "length"])))) return false;
  if (!s.bandits.every(b => b && finite(b, ["id", "x", "y", "z", "qx", "qy", "qz", "qw", "hp", "speed", "missiles", "ammo", "bombs", "sortieTime", "launchWave", "missileCd", "fireCd", "burst", "catT", "catAcross", "climbT"]) && ["scout", "bomber", "escort", "fighter"].includes(b.role) && typeof b.retreat === "boolean" && typeof b.onDeck === "boolean")) return false;
  if (new Set(s.targets.map(t => t.id)).size !== s.targets.length || new Set(s.bandits.map(b => b.id)).size !== s.bandits.length) return false;
  if (s.carrier && (!finite(s.carrier, ["x", "z", "headingDeg", "hp"]) || !["closing", "on station", "sinking", "sunk"].includes(s.carrier.status))) return false;
  const allIds = [...s.targets.map(t => t.id), ...s.bandits.map(b => b.id), ...s.bombs.map(b => b.id)];
  if (new Set(allIds).size !== allIds.length || !allIds.every(n => Number.isSafeInteger(n) && n >= 0)) return false;
  const o = s.operation;
  if (o && (o.version !== 1 || o.id !== s.id || !finite(o, ["id", "seed", "elapsed", "phaseTime", "fleetCarrier", "fleetHull", "stopped", "arrived", "deckDamage", "optional"]) || !["convoy", "fleet"].includes(o.kind) || !["briefing", "active", "success", "failure"].includes(o.status) || !["convoy", "scout", "forming", "strike", "counterattack", "final"].includes(o.phase) || ![o.scoutStopped, o.scoutReported, o.suppressed].every(b => typeof b === "boolean") || typeof o.reason !== "string" || o.reason.length > 180)) return false;
  return true;
}
