## 2025-05-20 - Carrier deck queries in groundAt anti-pattern

**Learning:** `groundAt(x, z)` is called heavily across simulation physics, targeting raymarching (`pickDesignation`), surface vessel collision, and radar altitude checks. Every `groundAt` query calls `carrierAt(x, z)`, which iterated through all 8 carrier definitions in `activeWorld.carriers` and performed full coordinate transformations (`worldToDeck`) with trigonometric function calls (`Math.sin`/`Math.cos` via `deckAxes`) for every ship, even when the query point was tens of kilometers away in open ocean.

**Action:** Always add cheap axis-aligned bounding box (AABB) checks before performing matrix/trig-heavy coordinate transformations in terrain or world spatial queries. Also memoize recurring trigonometric calculations (like `deckAxes`) when input angles belong to a small set of fixed or slowly changing values.
