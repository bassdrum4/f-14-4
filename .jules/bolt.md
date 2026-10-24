## 2025-02-23 - HTML5 Canvas Dimension Guarding
**Learning:** Mutating `canvas.width` or `canvas.height` unconditionally in React `useEffect` hooks (e.g., during 20 Hz HUD updates) clears the canvas context state and triggers internal GPU backing buffer re-allocation on every frame.
**Action:** Always check `if (cv.width !== targetWidth || cv.height !== targetHeight)` before assigning canvas dimensions.
