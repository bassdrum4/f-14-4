# Where to take the F-14 sim next

A working wishlist, ordered by how much fun per unit of work. Nothing here is
promised — it is the honest list of what I would build, why, and what I think
you want based on everything you have asked for so far.

---

## Mission upgrades TODO — 2026-10-11

Start with **Stop the Convoy** for Strike and **Fleet Defense** for Aggressor.
Keep quick bombing controls, short briefings, and optional recovery intact.

- [ ] Replace endless-wave-only progression with finite operations, clear
  success/failure conditions, and an optional endless mode.
- [ ] Strike / Stop the Convoy: transports head toward a destination; escorts
  defend them. Damaging transports slows their arrival. Let players choose
  between immediately attacking transports and clearing escorts first.
- [ ] Strike variants: airbase attack, coastal-defense suppression, and fleet
  crippling. Give each a primary objective and optional supporting targets.
- [ ] Make targets affect the operation: radar damage weakens defensive
  coordination, fuel fires threaten nearby structures, flight-deck damage
  stops launches, and propulsion damage slows ships.
- [ ] Add readable strike defenses: signaled anti-aircraft guns and limited
  patrol fighters, with clear warnings and opportunities for another pass.
- [ ] Aggressor / Fleet Defense: scout flight, escorted bomber strike against
  the friendly carrier, then a counterattack opening before the next launch.
  Intercepting scouts should delay the strike; friendly-carrier damage matters.
- [ ] Give enemies roles, finite ammunition, and retreat behavior. Bombers
  pursue the fleet while escorts engage the player; damaged/empty fighters
  withdraw rather than chase forever.
- [ ] Vary Aggressor operations with split attacks, fighter sweeps followed by
  strikes, withdrawals, and a final launch from a badly damaged carrier.
- [ ] Show one current objective and concise radio updates with useful arrival
  estimates. On completion offer finish now, optional landing/recovery bonus,
  or another operation; a difficult landing must not block mission completion.
- [ ] Share operation state and objectives in co-op, including late joins and
  host migration. Test objectives, failure paths, rearm, retry, and recovery.
- [ ] Before adding pressure, improve target selection, persistent offscreen
  arrows, altitude/closure guidance, and explicit firing-window feedback.

Delivered prerequisites: waves 1–2 have no enemy missiles, slower evasive
reactions, and gentler maneuvering; combat has hit/destruction feedback.

---

## What I read from your asks

The pattern across your requests is **readability over realism**:

- "can't tell if I'm 500 or 5000 feet up" → the world must communicate state,
  not just the instruments.
- "hard to see if you're shooting or not" → every action needs an unmistakable
  visual consequence.
- "no visual jump" → continuity and polish; the camera and world should never
  break the illusion.
- "cluttered homepage" → information hierarchy; show less, better.
- "bombing missions, waves" → mission variety on the same solid core loop.

So the guiding principle for everything below: **the sim should always be
legible**. Realism is welcome when it teaches or communicates; it is dead
weight when it only adds numbers.

---

## Tier 1 — high fun, fits the existing systems

### 1. Threats that shoot back (AAA + SAMs)
Strike mode is currently a range. Give the target sites teeth:
- **AAA batteries**: tracer streams arcing up at you (reuse the tracer system,
  ballistic arcs are already there), audible snap when rounds pass close.
- **SAM sites**: a launch plume on the ground, 8–12 s of missile time, and an
  RWR-style HUD warning ("SAM LAUNCH — BREAK"). The dogfight's `damagePlayer`
  and threat flash already exist to build on.
- Give the player **chaff/flare (X key or new binding)** with a simple
  countermeasure success roll — this turns every strike run into a decision.

### 2. Damage you can see on your own jet
- Progressive damage model: oil streak, then smoke trail, then engine flame-out
  on one side at hull < 30. The hull number exists; the jet should show it.
- A "damage control" readout: which system is degraded (controls, radar, one
  engine) instead of only a hull percentage.

### 3. Carrier landing grades (LSO)
- Score every trap: wire number, touchdown point, sink rate, lineup deviation.
  Grade it 1–5 ("OK UNDERLINE", "BOLTER", "CUT PASS") with a deck report after
  each recovery. The sim already computes every input needed (wire, touchdown
  vs, strip coordinates). This is the single most replayable thing a carrier
  sim can add — the numbers are already in `stepAircraft`.

### 4. Mission types built on the new strike machinery
Same wave engine, different dressing:
- **SEAD**: SAM sites that must die first, with launches until they do.
- **Armed reconnaissance**: fly the photo run over waypoints, survive.
- **Close air support**: a ground battle line that moves; danger-close
  engagements with marked friendlies (smoke markers).
- **Anti-ship**: the dogfight's hostile carrier as a pure target — it already
  moves, takes bomb damage and sinks.

### 5. Kneeboard / map screen (M key)
A pause-able top-down map with the target list, threat rings, and the route
home. The minimap proves the data plumbing exists; this is a bigger, readable
version. Also solves "where are the targets" in strike mode without HUD clutter.

---

## Tier 2 — bigger lifts, big payoff

### 6. Missiles and a radar scope
The full air-to-air picture:
- AIM-7 (semi-active, needs a lock and a beam on target until impact) and
  AIM-9 (heat seeker, growl audio, uncaged seeker head).
- A small radar scope in the HUD: contacts as blips, scan volume, lock
  symbology. This is a project by itself but it is what makes a Tomcat sim a
  *Tomcat* sim — the AWG-9 and the Phoenix are the aircraft's identity.
- Counterplay: bandits that chaff, notch, and run.

### 7. Deterministic replays
The sim is explicitly deterministic (no Math.random anywhere, fixed timestep).
That means a replay is just an **input log**:
- Record (time, action-code) pairs + the seed; playback is exact.
- Then: share-a-flight clips, crash investigation ("what happened on that
  landing"), and ghost runs for the carrier-landing qualification.
- Cheap to build (the input layer is already edge/axis based) and it is a
  superpower almost no browser sim has.

### 8. Real audio design
The engine loop is one layer. Suggest:
- Layered engine: intake whine (rpm), core rumble (thrust), AB roar, airframe
  buffet noise at high alpha, wind on the canopy with speed.
- **Doppler** on passing bandits and tracers snapping past the canopy.
- Radio chatter: "Tomcat 111, cleared hot", LSO calls on recovery. Even
  synthesized or recorded short phrases change the feel enormously.

### 9. Multiplayer co-op missions
Right now multiplayer shares the world (seed = room) and aircraft, but combat
is local. For shared strikes:
- **Host-authoritative combat**: the host runs the wave engine and broadcasts
  target states (positions/hp) at ~5 Hz; wingmen run local prediction. The
  pose-sync plumbing in `net/multiplayer.ts` is the template.
- Wingman commands (two/four, cover me, attack my target).
- Shared scoring: who tagged what, mission debrief.

### 10. Joystick + controller support
The browser controller API is a day of work and opens the sim to anyone with a stick:
- Deadzones, curves (the expo already exists for keys), axis binding UI.
- Trigger = guns, hat = camera, throttle axis mapping.

---

## Tier 3 — polish and atmosphere

- **Contrails above ~7 km** and wingtip vortices at high g — both double as
  scale/energy cues, continuing the "world says it too" work.
- **Afterburner heat haze** (cheap screen distortion behind the nozzles).
- Better water: sun glitter, ship wake trails (the hostile carrier leaves none
  today), shoreline foam.
- Night: cockpit instrument glow, ground lights bloom, lightning cells.
- **Flocks of birds** over the water at low level — surprisingly strong scale
  cue and pure atmosphere.
- Photo mode (freeze, orbit camera, focal length).
- **Auto quality scaling**: measure frame time for 2 s and step quality down if
  under 45 fps, instead of asking the player to guess.
- Persistent **pilot logbook**: sorties, traps, tags, best LSO grade, all in
  localStorage next to the account. The account system is already there.

---

## Things I would fix in the current features

- **Bombs on moving ships**: ships steam slowly now so a level run with lead
  works, but a proper **CCIP release cue** on the HUD (a "pickle now" flash when
  the bomb would land on the designated target) would make anti-ship runs feel
  skillful instead of approximate.
- **Bandit variety**: two bandit types (a heavy attacker that goes for the
  carrier, a light dogfighter that goes for you) — reuses `BANDIT_SPEED` style
  tuning tables.
- **Wave pacing**: strike waves currently always spawn a land site + a sea
  group; alternate "all sea", "all land" and "convoy + escort" compositions so
  waves feel authored.
- **Pause menu continues into the mission picker**: "change mission" from the
  pause screen rather than quit → menu → start.
- **Onboarding**: one 60-second tutorial sortie (take off, fly to the tanker
  marker, trap) would teach the keyboard scheme faster than the controls list.

---

## If I had to pick three

1. **LSO landing grades** — cheapest, endlessly replayable, pure fun.
2. **AAA/SAM threats + chaff/flare** — turns strike mode into a real contest.
3. **Deterministic replays** — unique, and the codebase is already built for it.
