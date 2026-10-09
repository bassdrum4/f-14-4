# F-14 Tomcat Simulator

The full production simulator is now maintained in TypeScript, recovered from
the more advanced `fix/dogfight-gun-and-bandits` branch. This is the actual
source project behind the three-aircraft, multiplayer, dogfight/strike edition,
not the earlier stripped-down `src/game/game.ts` prototype.

## Workflow

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

**`npm run build` produces `dist/index.html`, a single self-contained
HTML page built from `src/main.tsx` and the TypeScript modules.** Copy that
file to any static web host.

For a GitHub Pages site that serves the repository root:

```bash
npm run build:publish
git add index.html
git commit -m "Publish rebuilt simulator"
git push
```

The existing root `index.html` is kept untouched until you explicitly run
`build:publish`. During development/build, a Vite HTML pre-transform swaps
its precompiled inline contents for the *current* `src/main.tsx` entry,
and `vite-plugin-singlefile` inlines the fresh output again.

### Where the newer features live

- `src/sim/aircraft.ts`: F-14A, F/A-18C, A-6E specifications
- `src/sim/flight.ts`: per-aircraft aerodynamics and carrier operations
- `src/sim/dogfight.ts`: aggressors, strike mission, missiles, ordnance
- `src/sim/engine.ts`: fixed-timestep orchestrator, missions, and HUD feed
- `src/net/multiplayer.ts`: peer-to-peer lobby and room synchronization
- `src/render/`: aircraft, effects, terrain, targeting, lights, remote jets
- `src/ui/`: menus, controls, HUD, targeting and multiplayer screens
- `src/accounts.ts`, `src/gamestate.ts`, `src/feedback/`: pilot profile,
  game-state integration and feedback

**Build equivalence:** This produces the same self-contained *kind* of HTML
page and preserves the feature set. Byte-for-byte equality with an existing
production bundle is not expected: minification hashes, dependency versions,
and later source fixes can change its bytes. Treat the current root HTML as a
known-working artifact until the rebuilt output is smoke-tested.

The `test:*` scripts run with Bun; no GitHub Actions are configured.
Some networked account/feedback/multiplayer workflows depend on their
respective external services and configuration.
