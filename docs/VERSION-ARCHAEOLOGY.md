# Version history investigation

Investigated 2026-10-10. Repository baseline:
[`29d54f1`](https://github.com/bassdrum4/f-14-4/commit/29d54f138f1ea6ff8054947b7b81cf3c45b32d6f).

## Finding

The surviving code covers substantially more development than the recent
1.1.0 → 1.2.2 numbering describes. Thirteen distinct game states can be
identified, including an intermediate compiled build recovered from another
repository. Earlier development was exported in large snapshots with stale
1.0.0 metadata. No original release ledger or higher application version was
found in the accessible history.

**1.2.2 was assigned on October 9 from recent changes. It is a published build
label, not a recovered number for the whole development history.** Counting
features, commits, days, or downloads cannot establish a unique semantic
version without the original numbering convention and release records.

The current build uses **1.6.2** under an explicit reconstruction rule: retain
1.0.0 as the first saved flight-build baseline, increment the minor for each
substantial feature wave visible in a distinct saved state, and increment the
patch for fixes. Six feature waves follow that baseline; two fixes follow the
last feature wave. The complete thirteen-step mapping is in
[CHANGELOG.md](../CHANGELOG.md). This is a chosen convention grounded in saved
code, rather than a claim that an older 1.6.2 badge was recovered.

The first commit, October 1's `390a575`, has an empty tree. October 3's first
source export already contains the flight model, carrier operations, terrain,
HUD, cameras, sound, settings, and diagnostics. Work before that export cannot
be separated into individual updates from this repository.

GitHub reports that `f-14-4` itself was created on October 5 at 12:10 UTC,
after the dated October 3 source export. The repository creation date therefore
does not mark the start of the game. Its current metadata lists no forks and
does not identify it as a fork of another repository.

## Code timeline

Dates below are UTC. A date establishes when code was present in a saved
snapshot; it does not establish when the feature was first developed or
published. These rows describe observable game states, not numbered releases.

| Date | State | Code evidence |
| --- | --- | --- |
| Oct 3 | Flight and carrier simulator | [`93f9b4f`](https://github.com/bassdrum4/f-14-4/commit/93f9b4f7242f8ece28380e3644b210d290c5e7c3): `src/game/game.ts` already runs at `FIXED_DT = 1 / 120`; `flight.ts` implements catapult/wire/ground contact; `world.ts`, `mapbox.ts`, `png.ts`, HUD, cameras and settings are present. |
| Oct 5 | AI dogfighting and aircraft refinements | [`ac88c2e`](https://github.com/bassdrum4/f-14-4/commit/ac88c2e0ba6520fb5bd0e128a4e42838a400861e): a new 561-line `src/sim/dogfight.ts`, gun input/HUD integration, geometry and camera changes. |
| Oct 7, 15:16 | Multiple aircraft, guided bombs, strike missions, rooms and profiles | [`bored/a63d64f`](https://github.com/bassdrum4/bored/commit/a63d64fdcc5daf9d9e5cf9e29c52f566de06d8ad) stores a complete compiled game in `f-14`. It includes F-14A, F/A-18C and A-6E definitions, `requestBombRelease`, `designate`, strike mission options, PeerJS rooms, accounts and feedback. Missile methods and cloud gamestate code are absent. |
| Oct 7, 18:12 | Missiles and cloud preferences, plus the expanded typed source | [`fe6c2bc`](https://github.com/bassdrum4/f-14-4/commit/fe6c2bcaa4d7cb76dcd15b054c2f9bfab440ef45): `fireMissile`/missile collections now occur in the compiled build; `src/gamestate.ts` and `Gamestate.gs` persist preferences. This export also first exposes typed aircraft, targeting, multiplayer, accounts, feedback and effects modules in this repo. |
| Oct 8 | Gun muzzle/lead and bandit flight fixes | [`c10c99d`](https://github.com/bassdrum4/f-14-4/commit/c10c99d4c5e54082d67bb643212878f3fbfa1ad2): dedicated muzzle scratch storage, moving-target prediction, speed-derived AI turn limits and evade cooldowns. |
| Oct 9 | Fixed-step inputs and usable standalone controls | [`6ddf5e5`](https://github.com/bassdrum4/f-14-4/commit/6ddf5e509b2fc298f667b62258350fb6e0a9a10e): control timing, keyboard focus and graphics-quality switching fixes. |
| Oct 9 | Room radio and a shared host fight | [`63a9e17`](https://github.com/bassdrum4/f-14-4/commit/63a9e17faa886bbf535d4c5b3c627060d5075710): `sendChat`, `packEnemies`/`unpackEnemies`, `enemySnapshot`/`applyRemoteSnapshot`, remote aircraft improvements, pitch and landing fixes. The supplied patch's 19 target blob hashes were verified during recovery. |
| Oct 9 | Five-degree aim correction fixed | [`409dd07`](https://github.com/bassdrum4/f-14-4/commit/409dd074a1176352fec3a8fb8e63d66460e1e599): removes a repeated world-position subtraction and increases acquisition/correction to five degrees. |
| Oct 9 | Play-first menus, head-to-head combat and scenery | [`a7b3718`](https://github.com/bassdrum4/f-14-4/commit/a7b3718f48096f11f6073e1497ae195cef8952fa): `src/net/versus.ts`, procedural details, remote weapon effects, bomb trajectory checks, easier recovery, new home and settings navigation. Assigned label: 1.1.0. |
| Oct 9 | Rendering and network performance | [`58169f6`](https://github.com/bassdrum4/f-14-4/commit/58169f6c20d26f3130f252814294d54addfb0f32): `ResolutionBudget`, culling/static transforms and pose congestion recovery. Assigned label: 1.1.1. |
| Oct 9 | In-flight settings, large map and radio controls | [`d4af647`](https://github.com/bassdrum4/f-14-4/commit/d4af64778a04406e53be44eb36f3f350dc74723b): O/M/Enter controls and HUD options, water depth fixes, deterministic battle carriers and stores retained across respawn. Its branch still carried 1.1.0. |
| Oct 9 | Multiplayer validation and authority fixes | [`8fd6b76`](https://github.com/bassdrum4/f-14-4/commit/8fd6b76752a39b94f5ee4e589f65a00306a80a2e): connection identity, host-only controls, input sanitization, bounded enemy/roster counts, reconnect and interpolation changes. Displayed label still 1.1.1. |
| Oct 9 | Visible wires and survivable deck contact | [`7323eca`](https://github.com/bassdrum4/f-14-4/commit/7323eca4b0d9bb4238c524d1c6ecd4448122af90): visible pendants, `HARD_SINK = -15`, `IMPACT_SPEED = 120`, deck retention/landing results, navigation-key and tactical-map heading fixes. Displayed label still 1.1.1. |

The source-recovery commits, HTML rename, terminology change and branch merge
are not counted as additional feature states here. The October 9 version-only
commit changes no typed game source.

### Scale of the saved source

These counts include `src/**/*.ts`, `src/**/*.tsx` and `src/**/*.css`, including
comments. They exclude generated `src/restored/` output, dependencies, scripts
and inline production bundles. They measure saved source size, not releases or
development effort.

| Snapshot | Source files | Source lines |
| --- | ---: | ---: |
| Oct 3, `93f9b4f` | 23 | 5,367 |
| Oct 5, `ac88c2e` | 24 | 6,119 |
| Oct 7, `fe6c2bc` | 34 | 14,049 |
| Oct 9, `63a9e17` | 34 | 15,619 |
| Oct 9, `7323eca` | 39 | 16,942 |

The October 7 export changes 72 files overall, with 18,425 inserted and 6,351
deleted lines. Its title, “the Gamestate,” names only one part of that work.
Reading commit titles alone misses most of the game's expansion.

## Independent compiled-build evidence

The deleted `bored` file is retrievable from its commit:

```sh
git -C ../bored-audit show a63d64f:f-14 > /tmp/f14-oct7-early.html
git show fe6c2bc:isolate/index.html > /tmp/f14-oct7-later.html
```

Its Git blob is `6a19694045550f7a878104bf2bb11c6b2da78812` and its file size is
950,128 bytes. It differs from both the later October 7 build and the October 8
`index22.html` import. The earlier script has 935,449 characters; the later
October 7 script has 945,045. Both compile the application version to 1.0.0.

In the earlier build, `requestBombRelease`, `designate`, three named aircraft,
room mission methods and account/feedback storage keys survive minification.
The later build contains `fireMissile`, `missiles` and `gamestate` identifiers
that the earlier copy lacks. This establishes an intermediate game state even
though its typed source was never separately committed here. It does not prove
that either file was successfully deployed on its commit date.

Other tempting numbers are explained by the code:

- 18.3.1 is React/React DOM; 1.5.5 is PeerJS; 0.170.0 is Three.js.
- `f14sim.settings.v1`, `f14sim.accounts.v1`, `f14sim.feedback.v1`, and local
  `VERSION = 1` values identify storage formats.
- `index22.html` is an imported filename. Its embedded application version is
  1.0.0; the filename cannot establish release 22.
- Vite asset-name hashes identify content, not sequential update numbers.

## Search map and remaining routes

| Route | What was checked | Result / limit |
| --- | --- | --- |
| Application metadata | Every distinct historical package, `src/version.ts`, root/imported HTML and `isolate` JS/HTML build | Earlier application labels stay at 1.0.0; later assigned labels are 1.1.0, 1.1.1 and 1.2.2. No higher original application label found. |
| Other source markers | 219 distinct historical text blobs under source, diagnostics and docs; full commit messages | Version-like markers resolve to schemas, examples or the recent release messages. No older release ledger found. |
| Lockfiles and source maps | Historical Bun workspace headers, all saved object paths, and both recovered October 7 script bodies | Lockfile/config numbers describe dependency metadata; no application version is stored in the inspected workspace headers. No saved `.map` file or source-map reference in those recovered scripts. |
| Git ancestry | Full non-shallow clone, 25 reachable commits, all three remote heads, both PR heads, tags and releases | No tags or releases. The cloud exports collapse earlier development into snapshots. |
| Hidden local Git objects | `git fsck --full --no-reflogs --unreachable` | No unreachable objects found in this checkout. Another original checkout may still have useful reflogs or objects. |
| Workspace copies and forks | Existing HTML/package/patch paths in this workspace; current repository metadata | Local game files are the known build/source exports and the `bored` copy. GitHub reports zero forks and no parent repository. |
| Other repository copies | `bored`'s full branch history and deleted `f-14` file | Recovered the extra compiled snapshot and old deployment addresses. This was the strongest additional code lead. |
| Old F-14 repositories | `f-14`, `f-14-2`, `f-14-3`, `f-14-legacy`, `f-14-legacy-flight` | Current endpoints return 404. Their contents could not be independently examined in this investigation. |
| GitHub hosting records | 13 Pages deployment records, 14 Actions runs, 12 artifact records | All refer to already known commits; Pages records start October 8. Artifact metadata gives no older code lineage. Artifact payloads were not downloaded because their source commits are available. |
| Original Freebuff hosts | `flyer2.freebuff.app` → `english2.freebuff.app` → `english3.freebuff.app` → `spanish4.freebuff.app` | Link changes are saved in `bored` on October 5–7. All four roots now return HTTP 404. Host numbers do not establish application versions. |
| Public archives and indexing | Both search engines, plus archive indexes for those hosts | No relevant indexed version evidence. Archive queries returned no records for flyer2/english3; english2/spanish4 queries timed out, so those archive routes remain inconclusive. |
| Original class site | The Google Sites address preserved in `bored`'s README | The current page redirects to sign-in. The class site's earlier embed/revision history was not accessible publicly. |
| Saved patch and earlier context | `changes.patch`, earlier conversation retrieval and recent saved-file inventory | The patch exposes additional features but does not update the application version. No earlier F-14 release number was retrieved. This is not proof that no such record exists elsewhere. |
| Original Freebuff project | Cloud Git/revision history before exports | Still missing. The merge at `a6d69c7` preserves branch name `freebuff/bb840e738dba7e82d71d221d`, which may help identify the originating session. No project URL is inferred from that identifier. |
| Earlier local checkout/downloads | Original `.git` history, reflogs, earlier standalone downloads, screenshots of real badges | Not present in this workspace. These could supply an older numbered build or the original release convention. |

Useful reproduction commands, without changing the working tree:

```sh
git rev-parse --is-shallow-repository
git log --all --reverse --format='%h %aI %s'
git show --stat fe6c2bc
git show fe6c2bc:src/version.ts
git show fe6c2bc:package.json
git ls-tree -r -l 93f9b4f
git rev-list --objects --all
git fsck --full --no-reflogs --unreachable
```

An original project history, old checkout, or earlier build with an incremented
badge could resolve the original number and fill in additional updates. The
chosen 1.6.2 reconstruction accounts for the saved feature waves; it does not
claim to count unknown updates before or between these snapshots. The timeline
and counting rule preserve enough evidence to revise the label if that missing
history becomes available.
