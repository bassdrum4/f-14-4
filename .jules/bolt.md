# Bolt's Journal - Critical Performance Learnings

## 2025-05-18 - HUD Canvas RAF Loops & React Snapshot Subscriptions
**Learning:** Canvas-based HUD overlays (`PitchLadder`, `TargetBoxes`, `TargetPod`) run high-frequency `requestAnimationFrame` drawing loops. If a RAF canvas component takes a state/snapshot object (`hud: HudSnapshot`) as a prop and includes it in `useEffect` dependencies, the RAF loop gets torn down (`cancelAnimationFrame`) and re-created on every single React render (~60 FPS during flight), causing unnecessary effect churn and garbage collection pressure.
**Action:** Pass the stable engine instance (`sim: Sim | null`) to RAF canvas components and read `sim.snapshot` dynamically inside the `draw()` callback, with `[sim]` as the `useEffect` dependency.
