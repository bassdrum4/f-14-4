# Mission update: convoy interdiction and fleet defense

Design for the next playable update. **Not implemented in this release.**
The current modes still run their original waves; `docs/IDEAS.md` tracks the
larger wishlist. Start with two authored operations rather than adding many
shallow mission names.

## What makes the loop work

Give the pilot one understandable job, two meaningful ways to approach it,
and a visible consequence for the choice. A successful pass should change
the battle. More hit points and more simultaneous aircraft do not provide
that depth. Keep normal-view designation, held-B salvo bombing, optional
target pod, carrier rearming, and the early guns-only fighter difficulty.

Show a brief before launch: objective, nearest threat, starting loadout.
During flight show one current objective and its useful ETA. Use short radio
updates for phase changes. Do not make the player open menus to understand
what to do, and do not make a difficult landing the gate to success.

## Strike: Stop the Convoy

**Job:** prevent at least two of three transports from reaching the unloading
line. Destroying or disabling propulsion counts as stopping a transport.
The third transport and escorts are optional bonuses. Two arrivals make the
primary objective impossible and fail the operation immediately.

Initial balancing targets below are playtest values, not measured results:

| Element | Starting design | Player decision or consequence |
| --- | --- | --- |
| Three transports | A validated deep-water route; 6 m/s, roughly 8–10 minutes to arrival after wheels-up | Attack cargo immediately, or spend time clearing defense |
| One armed escort | Patrols the convoy; warns before firing short AA bursts with cooldowns | Spend a bomb to make subsequent passes safer, or approach outside its coverage |
| Optional radar vessel | Coordinates AA tracking; destroying it increases defense reaction delay | Suppression buys safer runs without being required for success |
| Transport propulsion | A damaging hit cuts speed; sufficient damage disables it permanently | An accurate first pass buys time and can satisfy the objective without sinking every ship |
| Return to deck | Repair and replenish stores; the convoy continues progressing | Rearming costs time, rather than resetting mission progress |

Place ships far enough apart that a single splash does not clear the convoy.
Tune disabled-transport damage thresholds around the **actual** bomb damage
and each supported aircraft's loadout. A Tomcat's six bombs should allow a
reasonable mix of objective hits, optional suppression, and a missed shot;
the A-6's larger load should help without being mandatory. Keep helicopter
and low-store starts viable through guns or an explicit briefing that suggests
an appropriate aircraft before launching.

Draw distinct cargo/escort labels and a persistent offscreen arrow to the
selected objective. The HUD reads `STOPPED 1/2 · NEXT ARRIVAL 4:20`.
Do not ask players to hunt invisible ships or calculate a route themselves.
If terrain generation cannot produce a safe sea route, select another route
before launch; ships must not beach while the objective clock keeps running.

First version has the escort and radar choices. Add one limited patrol pair
only after the base operation is fun. Limit AA range and track rate, show
tracers and `ESCORT TRACKING`, then fire; a warning must precede damage.
No surprise hits, infinitely accurate fire, or unannounced replenishment.

## Aggressor: Fleet Defense

**Job:** protect the friendly carrier through two finite attacks. The friendly
carrier starts at 100% mission hull; zero hull fails the operation. Surviving
the final attack wins. Sinking the opposing carrier prevents further launches
and awards an early win after any already-launched attackers are resolved.

| Phase | Threat and pacing | Why the pilot cares |
| --- | --- | --- |
| Scout | One visible, marked scout closes on a reporting line | Intercepting it gives a 45-second preparation/rearm bonus |
| First strike | Two bombers plus one escort; about 90 seconds of intercept warning | Bombers pursue the carrier; chasing the escort allows the real threat through |
| Counterattack window | At least 60 seconds after the first strike is resolved | Choose deck recovery or bombing the hostile flight deck to stop the second launch |
| Final strike | Two bombers from separated bearings plus one escort | Protect the fleet against a different attack shape rather than a larger swarm |
| Debrief | Objectives resolved, no more scheduled launches | Finish immediately, recover for a bonus, or start another operation |

Size starting distance using actual attacker speed so the promised warning is
real. Cap aircraft pressure at three in the first attack. The scout is phase
one, the first strike phase two: both retain the current wave-1/2 guns-only
fighter rules and slower reactions. Only the final phase unlocks the existing
limited fighter missiles. Make bombers identifiable by silhouette/label and
behavior, not merely by an extra health bar.

Each bomber gets one attack pass with finite bombs, then withdraws. Escorts
have finite gun bursts and missiles; badly damaged or empty escorts withdraw.
Retreating planes crossing a defined exit boundary count as resolved, so an
unfindable survivor cannot wedge progression. Damage flight-deck launch
capability with a threshold separate from sinking the opposing carrier:
suppression gives a useful result even without an entire bomb load.

Show `INTERCEPT BOMBERS · CARRIER 85% · IMPACT ~0:55`. ETA is an estimate
from the attackers' current route and speed, not a guaranteed countdown.
Offscreen arrows should prioritize inbound bombers and show altitude/closure.
Preserve fire-window and damage confirmation cues; no extra keyboard sequence
is required to attack a carrier on a fast pass.

## Completion and replay

Latch success/failure once. Continue the world without spawning fresh waves.
Offer **Finish operation**, **Recover for bonus**, and **Next operation**;
keep the completion HUD visible if the pilot chooses recovery. Optional
landing improves the score, and a later landing crash never erases a secured
primary objective. Before success, losing all active pilots fails the sortie.

Debrief the outcome, stopped transports or fleet damage, optional objectives,
stores used, and recovery grade. A failed sortie offers Retry with the same
operation seed and a separate new-operation option. Keep endless practice
as a clearly labeled alternative after the authored operations work.

Vary route, approach direction and optional targets first. Add coastal radar,
airfield suppression, fighter-sweep and withdrawal variants later, each with
a different consequence rather than an identical kill-all objective.

## Implementation order and multiplayer contract

1. **Shared combat correctness first.** Current `EnemySnapshot` and binary
   packets transmit the hostile carrier and bandits; they omit Strike targets.
   `applyRemoteHit()` also only resolves bandit IDs. Add bounded target
   snapshots with identity, kind, pose, health, disabled/dead state and target
   hit handling. Mirror clients must not spawn their own targets or advance
   waves. Verify this before adding convoy clocks or escorts.
2. **Target readability.** Objective markers, offscreen direction, bomber
   altitude/closure, and the current objective line. Make finding and hitting
   targets reliable before adding pressure.
3. **Operation state.** A separate typed state machine owns phase, clock,
   objectives, outcome and deterministic seed. Combat reports events (target
   disabled, scout resolved, bomber released, carrier hit), rather than HUD
   text driving progression. Recovery replenishes aircraft without clearing
   that state.
4. **Ship the convoy operation first.** Safe routes, transport consequences,
   finite success/failure, escort warnings, optional recovery and debrief.
   Playtest one aircraft/one operation before adding variants.
5. **Ship fleet defense.** Enemy roles, target priorities, finite stores,
   withdrawal, friendly-carrier mission hull, flight-deck suppression, and two
   paced attacks. Add dynamic variants after both basic paths are fun.

The room host owns objectives, clocks, damage and phase transitions. Share
a versioned operation snapshot with late joiners. A join does **not** reset
the operation; they enter with the current targets, hull, elapsed time and
outcome. Host takeover continues the latest acknowledged state. Replicate
enemy roles, remaining ammunition and scheduled launches as well as poses;
otherwise migration quietly restores spent weapons or duplicates an attack.
Reject stale operation IDs after Retry/Next and coalesce snapshots under
congestion. Room admission remains governed by the default-on late-join
checkbox introduced in v1.7.3.

## Acceptance checks

- Stop two transports by damage or destruction; optional escort survives;
  success latches and no next wave appears. Let two arrive; failure latches.
- Validate complete sea routes across representative seeds. Check arrival
  timing and speed reduction against fixed simulation time.
- Use the actual ordnance model to verify at least one viable loadout and
  rearm strategy. Run short manual playtests for target finding and firing.
- Kill/lose the scout; verify the timing difference. Let bombers through;
  carrier hull changes. Empty/damaged attackers withdraw and cannot stall
  the phase. Suppress launches while existing bombers remain airborne.
- Recover, rearm, crash, retry and choose next: progress persists only where
  intended; secured success survives an optional recovery crash.
- Two clients destroy the same target without double credit. A late player
  sees a transport already disabled. Host takeover preserves deadlines,
  launch suppression, ammo and hull. Retry drops old packets.
- Build editable TS/React sources into both standalone HTML copies and test
  the built game. Keep these checks local; do not attach tests to Actions.
