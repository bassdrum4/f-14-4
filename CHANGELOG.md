# Changelog

Release labels are recorded below. Older entries preserve labels that were
actually assigned at the time. Earlier development
arrived in large exports with stale 1.0.0 metadata; see
[the code history investigation](docs/VERSION-ARCHAEOLOGY.md) for the surviving
timeline, recovered intermediate build, and remaining history gaps.

## Unreleased — Destroyer review fixes

- Keep director clicks on hostile decks attached to the moving carrier.
- Bind naval PvP locks to the target's current life and use surface cruise/terminal guidance for player-controlled destroyers.
- Match the gun cue's destroyer hit shape to the oriented hull used by damaging rounds.
- Require naval service at the pilot's assigned friendly carrier in head-to-head, with the same water, altitude and speed checks on the client and host.
- Preserve host-assigned stations through joins, departures, respawns and host takeover; enforce naval life locks during missile fuzing and splash damage as well as guidance.
- Add eleven cross-system regressions covering moving-target impacts, respawns, local/remote service validation, roster changes, campaign preservation and mixed aircraft/destroyer co-op damage. Keep aircraft landing fixtures limited to aircraft.

## 2.10.0 — Playable destroyer beta

- Added DDG DESTROYER with a BETA PHASE selector badge, saved selection and sea spawn in solo and multiplayer.
- Added separate surface movement: gradual engine response, helm, braking, hull-footprint checks against shoals/land and fleet collision clearance.
- Added an independent rapid-fire gun/director, 32 VLS rounds, pinned air/surface locks, terrain-clearing coastal strike guidance, countermeasures, ship-scale cameras/HUD and carrier-side servicing.
- Adapted fleet defense, convoy interdiction, coastal bombardment and the three-stage campaign for naval play. Mixed co-op and head-to-head retain the existing combat authority, shields and scores.
- Added headless movement/combat/mission/service checks and a Chromium selector-to-launch smoke test.

## 1.10.0 — 2026-10-17

- Buffer timestamped remote motion with adaptive delay, bounded Hermite/SLERP
  reconstruction, acceleration/angular prediction and stable error correction.
  Explicit lifecycle and held states prevent respawn streaks and stale flight.
- Negotiate an unordered, zero-retransmit motion channel on each existing
  PeerJS connection. Preserve reliable controls/combat and the legacy pose
  contract; add clock sync, reorder/loss tracking, independent backpressure,
  channel recovery and per-peer diagnostics.
- Separate gameplay positions from rendered meshes, add bounded received-history
  gun compensation, interpolate remote surface animations and update spectator
  views from the current visual frame.
- Add deterministic impairment/scheduling/combat tests and actual Chromium/PeerJS
  mesh, channel recovery, reconnection and historical-client compatibility tests.
  See `docs/MULTIPLAYER-NETWORKING.md` for measured results and verification limits.

## 1.9.3 — 2026-10-16

- Make the laser-guided bomb genuinely guided, with a bounded envelope.
  Steering rotated the weapon's velocity vector at no cost, so a store held a
  flat line of sight indefinitely and could chase a designated spot 22 km away
  in over two minutes — a glider, not a bomb. Every radian of correction now
  costs the weapon speed (canard lift costs energy), and the designator guides
  for a finite window; when that window closes the store flies ballistically
  like any other iron bomb. Measured envelope: a click inside roughly 5–8 km
  (depending on release altitude and speed) is still hit inside the detonation
  radius — including up to 100° off the nose — while past that limit the release
  is refused with the existing "BOMB CANNOT REACH TARGET" warning rather than
  spent. No visual changes. `test:bomb-envelope` pins the new reach.

## 1.9.2 — 2026-10-15

- Make the pod click the shot. Aiming the sensor is a drag and the weapon goes
  to the spot under the cursor, but the release of the drag was firing too —
  from a moving hand, at wherever the gate happened to be when the button came
  up, so a slew made to look around spent a bomb on the way past. A drag now
  only slews and the click behind it is the designation, which is the click the
  pilot actually makes: a tap on a target puts the weapon on it (measured
  4 m at 4.7 km, the pixel resolution of the sensor at that range).
- Stop the HUD eating pod clicks: the radio box and the operation panel take
  pointer events and sit over the canvas, so a designation aimed at the lower
  half of the sensor frame landed on a panel instead of the ground. Nothing on
  the HUD is clickable while the pod is up.
- Add `test:pod-click`, which drives the real pod path — real input gestures,
  real camera rig, real `Sim.handlePodClick`, in the frame order the loop runs
  them — and checks that a slew fires nothing, that a click designates what it
  was aimed at, that the weapon detonates on it, and that a spot the weapon
  cannot reach is refused with the reason rather than spent. Regenerate both
  standalone builds.

## 1.9.1 — 2026-10-15

- Fix the fatal crash: a solo death froze the wreck in the air with no result
  screen, because the frame loop skipped the sim (which owns the crash replay)
  whenever the replay flag was set. The wreck now falls out to the result menu
  and the stick stays dead through it.
- Give the target pod back its entry view. Closing the pod (R) dropped the
  pilot into chase whatever camera they were on; it now restores cockpit,
  chase or action.
- Make the pedal steer. A held rudder left a sideslip the weathercock and yaw
  damper unwound, so the nose snapped back the other way the moment it was
  released. The pedal now commands a coordinated turn — the nose and the flight
  path come round together and the heading holds on release.
- Add `test:crash`, the pod-view checks in `test:camera` and the pedal
  hold/release checks in `test:turn`, and regenerate both standalone builds.

## 1.9.0 — 2026-10-15

- Add Operation Iron Bastion: the island strike becomes a defended airbase with
  a command bunker, hardened hangars and a fuel depot inside a radar-cued SAM
  belt and an AAA curtain. Terrain masks the radar picture, and destroying the
  radar shortens battery reach and slows lock. The fuel depot chains into its
  neighbours, and a locking battery fires a guided round at the pilot.
- Add the Task Force Archon campaign: three ordered stages (island bastion,
  reinforcement convoy, opposing fleet) that cannot be won by clearing the map.
  A recovery carries the stage, the wrecks and the hull damage into the next
  sortie; losing the flagship fails it at any stage.
- Add weather (Clear, Overcast, Storm) as flight model, sea and renderer at
  once: wind, gusting and turbulence, fleet heave and deck pitch/roll, cloud,
  rain, lightning, thunder and visibility. It derives from the preset and the
  world seed, so a room agrees on the squall without a packet, and the host's
  preset is the room's.
- Add airframe battle damage — one-sided engine loss, degrading hydraulics and
  avionics, a leaking tank — flown as asymmetric yaw and lagging controls and
  listed on a damage-control readout. Add LSO grades with live Paddles calls and
  slope/lineup grading on the results card.
- Add spectator mode: watch or ride a pilot, bandit, deck, LSO platform or free
  camera without admission, broadcasting no pose and never claiming the room,
  and switch back into a seat from the lobby. Add tactical pings (P), and
  engine-bed immersion audio: turbulence buffet, G-strain, flyby and thunder.
- Add setup and lobby controls for weather, the Strike variant and the campaign,
  and the two new bindings (N, P). Add `test:iads`, `test:campaign`,
  `test:weather` and `test:spectate`, and regenerate both standalone builds.
  Keep tests local and off GitHub Actions.

## 1.8.1 — 2026-10-13

- Give mission aircraft terrain clearance based on the upcoming approach slope.
  The default-world final bomber no longer flies into a coast and awards an
  unopposed Fleet Defense win.
- Count successfully recovered co-op pilots as survivors while they choose
  rearm/continue, and stop counting remote aircraft after their poses expire.
- Resume enemy aircraft from the latest authoritative pose at host takeover,
  preserving the streamed ammunition and mission clocks.
- Deliver wingman damage only to the host, once even when takeover retains
  two connections to it. Guests ignore peer damage instead of echoing claims.
- Require attempt-scoped damage in Endless Strike as well as authored
  operations, retaining legacy Endless Aggressor compatibility.
- Add full unopposed fleet runs across three worlds, recovery/loss, takeover
  pose and practice damage regressions. Keep diagnostics local, off Actions.

## 1.8.0 — 2026-10-13

- Make Strike default to Stop the Convoy: three transports follow a validated
  deep-water route, damage slows/disables propulsion, two stops secure the
  objective and two arrivals fail it. Radar destruction doubles escort tracking
  delay; AA gives advance warnings and fires finite bursts with cooldowns.
- Make Aggressor default to Fleet Defense: a scout, two escorted bomber
  attacks, a 60-second counterattack/rearm window and a final split approach.
  Scouts stopped before reporting buy 45 seconds. Bombers drop visible guided
  bombs on the friendly fleet; friendly-carrier hull determines failure.
  Flight-deck damage suppresses launches independently of sinking the ship.
  Escorts have finite gun/missile stores, and damaged/empty aircraft withdraw.
- Add role labels, objective HUD, ETA, bomber altitude/closure and persistent
  offscreen arrows. A single laser designation follows a moving ship/carrier
  and remains latched through a salvo. Keep bombing controls, confirmation and the
  early guns-only fighter difficulty. Retain original modes as Endless Practice.
- Add finite outcomes, debriefs, Retry Same Operation, Next Operation and
  optional recovery bonuses with wire number. Landing/rearming retains combat
  progress; a later recovery crash cannot erase secured mission success.
- Synchronize Strike targets and complete operation state in co-op: hull,
  phases, deadlines, enemy stores, launch queues and inbound bombs. Host-owned
  gun/missile events reach all pilots. Late joiners catch up and takeover keeps
  the operation. Scope damage/state by attempt ID and coalesce congested frames.
- Add operation and network regressions, exercise the actual UI in a browser,
  and regenerate both standalone builds. Keep all tests local, off Actions.

## 1.7.3 — 2026-10-13

- Remove waiting-lobby chat. Keep Enter chat during multiplayer flight,
  show incoming messages briefly, and close with Escape without pausing.
  Release held flight controls when focusing text fields; prevent radio from
  opening in solo flight or over menus, and release launch-button focus.
- Add a default-on host checkbox for joining after launch. Enforce it on
  admission, preserve it during host takeover, and send the current launch
  point to allowed late arrivals. Show the room code and admission policy in
  O-settings. Hide the inactive air-battle join button before launch.
- Return failed room searches to an actionable error state, name the missing
  room, and offer OPEN ROOM so the player can immediately create it.
- Restrict mission profile handshakes and enemy snapshots to the room host;
  a wingman's handshake or binary packet cannot overwrite the shared fight.
- Apply a cloud-restored launch point to the parked solo aircraft immediately
  instead of requiring a reload. Keep airborne aircraft in place.
- Specify the next Strike convoy and Aggressor fleet-defense operations in
  docs/MISSION-UPDATE.md, including the missing Strike target-sync prerequisite.
  These operations remain a design, not implemented gameplay.
- Extend local regression checks for room policy, late arrival, takeover,
  missing-room recovery, host authority, text-entry controls and launch restore.
  Rebuild both standalone HTML copies; no Actions test changes.

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
