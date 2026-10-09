# F-14 Carrier Simulator

The **current** simulator lives in typed TypeScript/React modules in `src/`.
This source was recovered from the newest feature-complete project
(commit `63a9e17`), not the early F-14-only prototype.

## Run locally

```bash
npm install
npm run dev
```

## Build the same kind of self-contained HTML used by GitHub Pages and the web app

```bash
npm run typecheck
npm run build
```

The Vite build uses **`app/index.html` and `src/main.tsx`** as its entry,
**not** the precompiled `index.html` at the repo root.
`vite-plugin-singlefile` bundles the full source application into one
HTML file at `dist/index.html`. Only after a successful build, the publish
plugin copies it to `index.html` and `isolate/index.html` (for both hosts).
It also refreshes `src/restored/runtime.js` and `runtime.css` as generated
outputs, although those files are **not the build inputs**.

To deploy GitHub Pages from the repository root, commit the updated
`index.html` after building:

```bash
git add index.html isolate/index.html src/restored
git commit -m "Publish TypeScript build"
git push
```

The result preserves the existing *features and deployment format*, but its
HTML need not be byte-for-byte identical to the old build because this source
contains newer fixes and has been rebuilt from source.

## Source layout

- `src/sim/aircraft.ts` — F-14A, F/A-18C, A-6E
- `src/sim/flight.ts` — aircraft handling, carrier launches and recovery
- `src/sim/dogfight.ts` — bandits, shared host fight, bombs/missiles, strike
- `src/sim/engine.ts` — flight loop, missions, HUD, chat, world sync
- `src/net/multiplayer.ts` — peer-to-peer rooms, roster, chat, pose exchange
- `src/render/` — terrain, aircraft geometry, remote aircraft, visual effects
- `src/ui/` — HUD, menus, target pod, multiplayer screens
- `src/accounts.ts`, `src/gamestate.ts`, `src/feedback/` — profiles,
  persisted flight preferences, feedback
- `scripts/diag-*.ts` — offline/diagnostic tests (Bun required)

Some cloud and networking functionality depends on external services.
There are no GitHub Actions workflows configured.
