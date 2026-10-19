## 2025-02-17 - React RAF Canvas Effect Churn
**Learning:** React components wrapping canvas animation loops with `useSyncExternalStore` snapshots (which change reference every frame at 60Hz) will cancel and recreate `useEffect` callbacks every 16ms if the snapshot is included in the dependency array.
**Action:** Use a `useRef` to hold the latest snapshot and set the `useEffect` dependencies to `[]`, allowing `requestAnimationFrame` to run uninterrupted while reading `ref.current`.
