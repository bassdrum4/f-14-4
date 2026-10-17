## 2025-02-14 - Ray marching optimization for analytic terrain designation

**Learning:** `pickDesignation` performs fixed 22m step ray marching against the analytic terrain heightfield (`groundAt`). For skyward rays or rays starting high above max terrain altitude (2500 m), marching all 1090 steps evaluates noise functions thousands of times unnecessarily.
**Action:** When raycasting analytic terrain, bound marching by `MAX_TERRAIN_HEIGHT` to jump over high-altitude empty air when pointing down, or exit early when pointing into the sky.
