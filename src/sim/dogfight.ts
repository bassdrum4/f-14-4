// Public entry point for the combat sim. The implementation is split across
// ./combat/* — core.ts is the state machine, every sibling is one subsystem —
// and this module keeps the historical import path and surface stable for the
// engine, the net layer and the headless diagnostics.

export { Dogfight } from "./combat/core";
export { DOGFIGHT_ARENA } from "./combat/tuning";
export { terrainBlocks } from "./combat/scratch";

export type {
  CarrierStatus,
  CombatOpponent,
  DogfightHud,
  EnemyCarrierState,
  EnemyHit,
  EnemyPose,
  EnemySnapshot,
  GunCue,
  PlayerHit,
  Scenario,
} from "./combat/types";
