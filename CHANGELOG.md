# Changelog

The current label uses the code-state reconstruction below. Older entries
preserve labels that were actually assigned at the time. Earlier development
arrived in large exports with stale 1.0.0 metadata; see
[the code history investigation](docs/VERSION-ARCHAEOLOGY.md) for the surviving
timeline, recovered intermediate build, and remaining history gaps.

## 1.7.2 — 2026-10-11

- Give wave-1 Aggressors a 1.1-second evasive reaction delay and wave-2
  fighters a 0.65-second delay, with gentler, shorter evasive maneuvers and
  longer cooldowns. Keep difficulty with each launched aircraft, and retain
  full collision and terrain avoidance. Wave 3 onward retains veteran agility.
- Add readable hit/destruction messages and distinct volume-controlled audio
  cues. Throttle burst sounds and keep destruction visible through later hits.
- Show damage percentages and health bars on wounded fighters, with smoke
  below half health on both host and mirrored aircraft.
- Add the Strike and Aggressor operation upgrades to docs/IDEAS.md as TODOs,
  including convoy interdiction, fleet defense, target consequences, enemy
  roles, finite objectives, optional recovery, and shared co-op progression.
- Add local regressions for difficulty progression, interrupted threats,
  surviving early-wave fighters, confirmation priority, expiry, and reset.

## 1.7.1 — 2026-10-11

- Keep Aggressor waves 1–2 guns-only. Fighters launched from wave 3 onward
  carry two missiles, with the existing arming delay and launch restrictions.
- Keep early-wave survivors guns-only when later waves begin. Add local
  checks for launch loadouts and actual missile firing across waves 1–4.

## 1.7.0 — 2026-10-11

- Keep the intentional 9.5° angled landing deck, including matching deck
  paint, wires and landing geometry.
- Give the friendly fleet gentle oval patrols at up to five knots within its
  deep-water anchorages. Keep terrain fixed, move hulls and attached lights,
  and carry parked or rolling aircraft with the translating and turning deck.
- Synchronize fleet time from the room host, including late joins, host
  migration and movement while a local flight menu is open. Coalesce clock
  updates under congestion instead of queuing old positions.
- Slow the hostile carrier to about twelve knots. Preserve its wave launches
  and attach each catapult stroke to the ship's current position and heading.
- Make both map sizes heading-up: the player stays facing the top, all world
  positions and marker bearings rotate, labels stay upright, and north moves
  around the compass edge.
- Add local regressions for patrol safety, stable parked aircraft, moving-deck
  launches, shared fleet time and map projection. No Actions test changes.

## 1.6.6 — 2026-10-11

Five player-flow fixes:
- Require full throttle and engine spool before a carrier catapult shot; explain
  power, catapult and climb in order.
- Leave the connected room when choosing Fly Solo.
- Let room guests choose their own aircraft; shared sortie settings remain with the host.
- Offer Rearm & Continue after a solo landing, preserving enemies, score and
  flight time, with Restart Mission as a separate choice.
- Explain that the room and combat continue while the local flight menu is open.

Ten code fixes:
- Reject mouse releases without a canvas press, including releases on menu controls.
- Clear smoothed flight axes immediately on focus loss.
- Consume binding-capture keys before flight controls, so Escape cancels capture.
- Swap occupied bindings so rebinding one action cannot strand another.
- Keep callsign accounts usable when browser storage reads or writes are blocked.
- Keep the fallback guest callsign stable for the session.
- Include adaptive resolution in cloud profile save and restore.
- Preserve reports submitted while feedback retries are in progress.
- Share in-flight feedback delivery and retries to avoid duplicate submissions.
- Service a sliding helicopter once it slows after touchdown, instead of missing
  recovery when its touchdown tick is above the servicing speed.

Three other fixes:
- UI: display assigned keys in menu, controls and launch instructions.
- Performance: adapt resolution under sustained frame rates below four FPS.
- Resource lifecycle: release world geometry, owned materials, textures and
  shadow resources on renderer teardown; avoid constructing orphaned night lights.

Add local regressions for the above event sequences and extend recovery tests.
Update catapult checks to wait for engine spool. No GitHub Actions test changes.

## 1.6.5 — 2026-10-10

- Share shooter-owned PvP missile flight and targeting state so remote visuals
  and warnings follow real flare capture, relock and retirement decisions.
  Coalesce snapshots under congestion instead of queuing stale flight updates.
- Restore every supported cloud keybinding, including flares, map and settings.
- Spawn the Seahawk in a stable airborne hover for PvP starts and respawns,
  rather than inheriting a fixed-wing 408-knot launch.
- Add regressions for cross-client seeker agreement, delayed updates, network
  backpressure, cloud controls and helicopter spawn stability. No Actions changes.

## 1.6.4 — 2026-10-09

- Synchronize PvP flare cartridges, divert damaging player-fired seekers, and
  show the same countermeasures and missile warnings on the receiving pilot.
  Validate and deduplicate shot events; keep flare budgets through respawns.
- Calculate approximate impact time from relative closing velocity, restore
  pooled flare scale, and use smaller, shorter-lived smoke trails.
- Re-arm real Seahawk deck/runway touchdowns in PvP, keeping the helicopter
  parked where it landed and waiting for host confirmation of hull repairs.
- Animate remote helicopter rotors; make local rotation independent of frame
  rate. Label collective and lift-off correctly and omit jet approach cues.
- Round the new aircraft fuselages and refine the Crusader nose and Seahawk
  tail. Add local regression coverage without changing GitHub Actions.

## 1.6.3 — 2026-10-09

- Keep surviving wingmen connected when the host relays another pilot's
  departure; only the host may name another pilot in a departure notice.
- Treat completed PvP carrier/runway recoveries as landings, preserving lives
  and scores. Re-arm and return to a launch position; the host confirms hull
  repair against the reported aircraft position and speed. Real crashes still
  count as deaths and trigger the existing respawn.
- Add local regression coverage for disconnect cascades, promoted-host
  departures, all recovery results, repair acknowledgement and crash handling.
  No GitHub Actions changes.

## 1.6.2 — 2026-10-10

Correct the version using thirteen saved game states, including a deleted
October 7 build recovered from `bored`. The previous 1.2.2 calculation covered
only recent changes and omitted the earlier feature waves.

The rule is one minor increment for each saved state that introduces a
substantial player-facing system, and one patch increment for a state that
fixes existing behavior. Group features saved together into the same increment.
Start from the first saved flight build's 1.0.0 label. Recovery, rename, merge,
terminology and version-only commits add no feature increment.

| Reconstructed step | Saved code state |
| --- | --- |
| 1.0.0 | October 3 flight/carrier simulator baseline. |
| 1.1.0 | October 5 AI dogfighting. |
| 1.2.0 | Early October 7 compiled copy: multiple aircraft, guided bombing/strike, multiplayer rooms and profiles. |
| 1.3.0 | Later October 7 snapshot: missiles and cloud preferences. |
| 1.3.1 | October 8 gun muzzle/lead and bandit flight fixes. |
| 1.3.2 | Fixed-step inputs, keyboard focus and quality switching. |
| 1.4.0 | Room chat and shared host enemies. |
| 1.4.1 | Five-degree gun correction fixed. |
| 1.5.0 | Play-first menus, head-to-head combat, scenery and bomb reach checks. |
| 1.5.1 | Browser rendering and network congestion improvements. |
| 1.6.0 | In-flight settings, tactical map and radio controls. |
| 1.6.1 | Multiplayer packet/authority fixes. |
| 1.6.2 | Visible arresting wires, deck contact, navigation and map-heading fixes. |

**These steps are an explicit reconstruction, not recovered historical releases
or tags.** Work before the first source export and updates collapsed between
snapshots remain uncounted. Another convention could assign a different number;
the code evidence and rule above explain why this build now uses 1.6.2.

This update changes the displayed label and documentation. The source build
refreshes both standalone deployment files and their generated runtime exports.

## 1.2.2 — 2026-10-09

The current release includes the changes below. The displayed version stayed
at 1.1.1 while these updates landed; this release corrects that drift.

- Visible arresting cables and deck-edge supports; more forgiving gear-down
  deck contact, landing rolls and recovery results, with impact-speed limits.
- Correct tactical-map headings for ships, aircraft and the runway.
- Bound navigation keys prevent page scrolling even during auto-repeat.
- Hardened multiplayer packet validation, sender identity and host authority.
- In-flight settings (O), a large tactical map (M), radio entry (Enter), and
  independent HUD ladder and gun-cross toggles.
- Water depth fixes, consistent two-carrier battle assignments, and ordnance
  stores that survive respawn and re-arm through landing.
- Both deployed HTML files now expose their package version as metadata; the
  standalone check rejects stale versions or differing deployment copies.

### How recent build labels were assigned

Git history contains no release tags. The following maps recent changes to
minor/patch updates using the labels assigned in October 9's published builds.
It does not account for the full development history before those labels.
**1.2.0 and 1.2.1 are reconstructed milestones, not claimed historical releases
or tags.** Merge/build commits are not separate updates.

| Version | Evidence | Reason |
| --- | --- | --- |
| 1.1.0 | [`a7b3718`](https://github.com/bassdrum4/f-14-4/commit/a7b3718f48096f11f6073e1497ae195cef8952fa) | Published Play-first UI, head-to-head combat, scenery and weapon/recovery changes. |
| 1.1.1 | [`58169f6`](https://github.com/bassdrum4/f-14-4/commit/58169f6c20d26f3130f252814294d54addfb0f32) | Published browser performance and network congestion update. |
| 1.2.0 (reconstructed) | [`d4af647`](https://github.com/bassdrum4/f-14-4/commit/d4af64778a04406e53be44eb36f3f350dc74723b) | New in-flight controls and HUD options warrant a minor update; water/stores fixes ship with them. |
| 1.2.1 (reconstructed) | [`8fd6b76`](https://github.com/bassdrum4/f-14-4/commit/8fd6b76) | Multiplayer validation and authority fixes warrant a patch. |
| 1.2.2 (current) | [`7323eca`](https://github.com/bassdrum4/f-14-4/commit/7323eca4b0d9bb4238c524d1c6ecd4448122af90), plus version correction | Landing, cable visibility, navigation and map corrections warrant the next patch. |

Older snapshots repeatedly carried the default 1.0.0 even as their features
changed. Comparing source and compiled copies establishes additional game
states, including an intermediate October 7 build recovered from `bored`,
but does not recover their original release numbers. The recent numbering
preserves published 1.1.0/1.1.1 labels; the earlier history remains incomplete.
