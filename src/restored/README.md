# Feature-complete standalone recovery

The production `index.html` contains a much newer app than the existing
`src/main.tsx`/TypeScript modules. These files are a **lossless recovery** of
the running app, not a fabricated rewrite:

- `runtime.js`: bundled full current simulator (F-14A, F/A-18C, A-6E,
  cruise/air combat/strike, targeting pod, missiles, guided bombs, and
  peer-to-peer multiplayer, plus other current functionality).
- `runtime.css`: extracted production styles.
- `standalone.template.html`: original HTML wrapper, with placeholders.

Usage:
- `npm run dev:source`: preview the complete recovered app at `/source.html`.
- `npm run build:source`: bundle the recovered app to `dist-source/`.
- `npm run check:standalone`: ensure that `index.html` is reproducible exactly.
- `npm run build:standalone`: regenerate the original, self-contained HTML
  for your web app and GitHub Pages.

**Important:** `runtime.js` is still *minified* code extracted from the
production build. The feature parity is functional, but the newer code has
NOT been re-created as separately typed, maintainable TypeScript modules.
Existing `src/` simulation tests exercise the **older** implementation
and must not be represented as validation of this recovered runtime.

To finish proper back-porting, migrate subsystems into TypeScript modules
(aircraft specs and flight model, mission logic, combat/strike, multiplayer,
HUD and menus), adding tests for each, then migrate the source entry point.
Do not overwrite the newer production bundle from the older TS entry.
