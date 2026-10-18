## 2026-10-18 - Avoid canvas buffer re-allocation in HUD animation loops

**Learning:** Unconditionally assigning `canvas.width` or `canvas.height` on every frame inside a `useSyncExternalStore` or `requestAnimationFrame` loop forces the browser to destroy and reallocate the underlying GPU/pixel backing buffer ~60 times per second, even if dimensions haven't changed.
**Action:** Always check `canvas.width !== targetWidth || canvas.height !== targetHeight` before assigning `canvas.width`/`canvas.height` in 2D canvas render loops.
