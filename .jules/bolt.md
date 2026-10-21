## 2025-05-18 - Distance-squared bounding checks on procedural terrain queries
**Learning:** Procedural heightfield generation (`terrainHeight`) iterates over 15+ landmasses and multiple peaks for every sample. Since domain warping max offset is bounded, distance-squared bounding checks allow skipping distant landmasses and peaks before evaluating expensive `Math.hypot` / `Math.sqrt` calculations.
**Action:** When querying procedural noise grids with spatial features, precompute maximum reach radii squared to filter out distant features using fast `dx*dx + dz*dz` comparisons.
