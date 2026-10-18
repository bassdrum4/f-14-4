# Multiplayer motion, v1.10.0

## What changed

The previous renderer timestamped snapshots when they arrived, targeted the
newest arrival **plus** half an RTT, and normally extrapolated rather than
interpolating. Arrival jitter therefore changed the playback clock; motion
corrections could move metres in a frame. Rotation was not predicted, so rolls
advanced in packet-sized steps. `combatTargets()` also returned mesh positions,
coupling damage, guidance and defenders to rendering corrections. All traffic
shared PeerJS's reliable ordered stream.

The room still uses the same full mesh, roster, host authority, signalling,
mission and combat protocols. Changes are confined to aircraft reconstruction,
motion transport/scheduling, spectator update order and bounded gun history.

- `src/net/motion.ts`: a sorted, bounded snapshot history (64 entries / about
  1.5 seconds), monotone cubic Hermite position interpolation, normalized SLERP,
  acceleration and world angular velocity prediction. Prediction runs at full
  speed for its first 100 ms, then coasts smoothly to rest by 300 ms, travelling
  at most 200 ms worth of velocity. Ground motion has an 80 ms distance horizon
  and no speculative acceleration or angular motion. It retains the sender's
  world velocity, which includes carrier motion in `engine.buildPose()`.
- Rendering starts with a 70 ms **additional** buffer. The target is 60–160 ms,
  based on send spacing and measured transit variation. Expansion is faster
  than contraction. Playback slows to build a buffer without running backward;
  catching up is limited to 1.1× playback. This delay is additional to the
  estimated one-way transit time, not a claim of 70 ms total Internet latency.
- New prediction errors are corrected with an analytically integrated critically
  damped positional spring and quaternion correction decay. Ordinary buffered
  interpolation has no positional low-pass lag. Explicit respawn epochs,
  active/inactive transitions, impossible jumps, long silence and local tab
  return reset history/corrections instead of dragging a jet across the map.
  Takeoff/landing flags suppress derivative estimation across contact changes.
- Timestamped held snapshots freeze paused/background aircraft. Even complete
  packet loss cannot produce unlimited flight: prediction stops, labels dim
  after 1 second, combat targets expire after 800 ms, meshes hide after 12 seconds.
- Wing sweep, actual gear/flap positions and afterburner level are interpolated
  and eased. Gear retracts using the local mesh's scale/lift convention. Each
  remote has its own afterburner material. Rotors remain frame-time driven.
  Spectator sampling happens after the current frame's remote update and uses
  its visual orientation, velocity and telemetry, without another motion clock.

## Transport and rolling updates

A `hello.motion: 2` capability enables `f14-motion-v2` on the **existing**
`DataConnection.peerConnection`: negotiated SCTP ID **32**, unordered,
`maxRetransmits: 0`. No second Peer or RTCPeerConnection is created for motion.
The ID is reserved by this protocol; PeerJS's existing in-band control channel
occupies 0 or 1 on these dedicated peer connections.

Explicit negotiation matters with PeerJS 1.5.x: its `ondatachannel` handler
adopts an incoming in-band channel as the primary channel. Creating another
ordinary in-band channel would replace the reliable control stream. A negotiated
channel avoids that handler and requires no new SDP offer. Reliable readiness
messages acknowledge both channel generations; unilateral creation is not enough.
A closed channel is retried on the same PC. Three unsuccessful channel attempts
negotiate bilateral legacy fallback rather than stopping room controls.

Chat, weapon launches, damage, mission actions, scores and room controls keep the
existing reliable ordered PeerJS connection. Host enemy/operation state retains
its existing reliable formats and coalescing; this release does not replace
those reconstruction systems. Motion uses direct binary `RTCDataChannel.send`,
never PeerJS's serializer/application queue. A peer with any queued motion skips
that send and receives the newest state on a later opportunity. Congestion is
per peer. Legacy fallback similarly sends only when the browser and PeerJS
queues are empty, but **already-sent legacy reliable packets can still wait for
retransmission**. Removing that limitation requires upgrading the older client.

Legacy poses remain exactly **52 bytes**. V2 uses **80 bytes**, retaining that
prefix and adding:

| Offset | Field | Encoding |
| --- | --- | --- |
| 52 | sender `performance.now()` | float64 |
| 60 | discontinuity/respawn epoch | uint32 |
| 64 | acceleration x/y/z | int16 × 0.01 m/s² |
| 70 | world angular velocity x/y/z | int16 × 0.001 rad/s |
| 76 | gear, flap, afterburner | three normalized bytes |
| 79 | held state | byte, 0 or 1 |

The historical packet actually uses DataView's default **big endian** network
order; old comments calling it little endian were incorrect. That byte order is
preserved. Malformed/nonfinite values and unreasonable position, velocity,
quaternion and timestamp ranges are rejected before applying a decoded pose.
Derivatives are bounded to 120 m/s² and 12 rad/s.

Each motion link has its own sequence, wrap-safe uint32 comparisons and a
128-packet receive window. Duplicates/very old packets are discarded; recent
reordered packets can fill history without regressing the newest gameplay pose.
Missing packets in the window estimate loss (not browser transport loss stats).
Clock probes every 2 seconds use four monotonic timestamps, minimum-RTT offset
selection, route-sample expiry and bounded offset slewing. Browser ICE RTT stats
supplement probes. One-way latency remains an estimate: asymmetric paths cannot
be uniquely measured by these probes.

Cruise scheduling preserves a 30 Hz phase across irregular frame rates. Rapid
rotation, large acceleration, unexpected position errors and switch changes can
send sooner, with a 60 Hz ceiling. Strict inter-send spacing means some display
rates yield fewer burst packets (90 fps: 45 Hz; 144 fps: 48 Hz). Rooms with more
than four remote peers cap optional bursts at 40 Hz, and links with >8% estimated
loss suppress them to 30 Hz. The 15 Hz timer remains a fallback for low/no frame
production; background timers may throttle further.

Payload budget, excluding SCTP/DTLS/IP, chat and combat: at 30 Hz, old poses were
1.56 kB/s per remote peer; V2 is 2.40 kB/s, or **26.4 kB/s outgoing** for eleven
remote peers. Optional 60 Hz motion is 4.80 kB/s per peer in small rooms; large
rooms cap it at 3.20 kB/s. This is a deliberate 28-byte increase for timestamps,
derivatives, lifecycle and animation state, not a bandwidth reduction claim.

`Multiplayer.networkDiagnostics`, `RemoteFleet.diagnostics()` and the combined
`Sim.networkDiagnostics` expose link RTT, transit jitter, window loss, receive
rate, queue bytes, skipped sends, byte totals, clock offset, buffer delay,
prediction error, correction size, extrapolation age and resets. Diagnostics
are copied on demand rather than allocated every rendering frame.

## Gameplay and lag compensation

`combatTargets()` samples independent motion history at receiver **now**, with
bounded prediction. It never reads mesh transforms or spring corrections.
Missile seekers/proximity damage, remote weapon warnings, fleet defenders,
operation participation and host range/recovery validation use this API.
Minimap/radio contacts retain received positions; spectator/audio views use
visual poses intentionally.

Only the versus gunnery path requests `combatTargets(true)`. It adds a separate
historical `hitPos` sampled at the estimated observed target time, clamped to
**200 ms** of rewind. Gun assist, gun HUD trajectory and real tracer collision
use that history. Guidance and missile collisions continue using current `pos`.
History is cleared at life/epoch transitions. No client-supplied hit timestamp
can choose the rewind or expand the host's range gate. Existing host checks for
identity, current match/lives, shields, range, cadence and duplicate claims stay
in place. There is no hitbox enlargement or use of visually corrected positions.

This remains casual peer-to-peer combat: authoritative scores do **not** make
client-reported projectile hits or client-owned poses competitive anti-cheat.
The host does not replay every projectile. When transit plus visual buffering
exceeds 200 ms, the bounded gun rewind cannot perfectly match the older visual
pose; this deliberately caps compensation instead of granting unlimited rewind.
Fair validation across highly
asymmetric links would require a stronger server/referee protocol.

## Reproducible verification

```bash
bun install
npm run typecheck
npm run test:motion
npm run test:motion:link
npm run test:motion:combat
npm run test:motion:scheduling
npx playwright install chromium
npm run test:motion:browser
npm run build
npm run check:standalone
```

The browser diagnostic needs the historical networking source in Git history:
`36357aa:src/net/multiplayer.ts`. It bundles that actual implementation for the
legacy page, with the current test scene. It does not merely forge an old hello.
`F14_CHROMIUM_EXECUTABLE` can select a locally installed Chromium binary.
The test uses fake microphone permission/device flags solely to allow loopback
ICE enumeration in environments with only a loopback interface. No microphone
is accessed by the production game or requested by these networking changes.

### Deterministic results

Run in the implementation container, 20 seconds per scenario, seed 7, comparing
the math-only baseline from `36357aa` against the production timeline. Packets
are quantized through the real V2 codec. The baseline drops reordered packets
as the old network layer did. Latencies below are **one way**, not RTT.

Position RMS is measured relative to each renderer's intended simulation time.
P95 excess frame displacement subtracts the exact trajectory's displacement;
it measures correction/jitter, not total aircraft travel. The new buffer's
extra latency is explicitly reported rather than hidden in an error score.

| Scenario | Old/new RMS position error (m) | Old/new P95 excess displacement (m) | New extra buffer (ms) |
| --- | ---: | ---: | ---: |
| 50 ms, ±15 ms jitter, 1% loss | 4.655 / <0.001 | 5.159 / <0.001 | 81 |
| 100 ms, ±35 ms jitter, 5% loss | 6.171 / 0.001 | 9.149 / <0.001 | 118 |
| 200 ms, ±60 ms jitter, 10% loss | 7.357 / 0.001 | 13.083 / <0.001 | 154 |
| 250 ms delayed bursts, 5% loss | 6.805 / 0.117 | 5.896 / 0.019 | 93 |
| Aggressive maneuvers, 100 ms, jitter/loss/bursts | 7.724 / 0.031 | 11.290 / 0.007 | 134 |
| 20 Hz sender, 30 fps receiver | 6.879 / 0.002 | 7.778 / <0.001 | 122 |

The 60 Hz sender / 144 fps roll scenario reduced P95 attitude error from
13.13° to <0.01°; the varying-attitude aggressive case reduced 14.66° to 0.13°.
These smooth deterministic trajectories are favorable to interpolation; the
numbers are not Internet field measurements or a promise of sub-centimetre
error during arbitrary player inputs. The diagnostic also covers takeoff,
landing, moving decks, bounded stale prediction, shuffled/duplicate snapshots,
epoch/respawn resets, quaternion prediction and visual/gameplay independence.
The reconstruction-only CPU microbenchmark measured roughly **0.004–0.005 ms
per update of eleven aircraft** in this container, excluding mesh, GPU, packet
processing and app overhead. It is not a Chromebook benchmark.

### Actual browser transport verification

Chromium **153.0.8010.0**, real PeerJS **1.5.5**, localhost PeerServer, separate
browser contexts:

- Three-page full mesh; exactly one PC per pair, reliable ordered controls and
  negotiated unordered zero-retransmit motion on the same PC.
- Application-injected 100 ms latency, ±45 ms jitter, 10% motion loss,
  reordering and delayed bursts; reliable radio and weapon events still arrive.
- Per-channel motion backpressure, newest-state resumption and reliable radio.
- Motion channel close/recreation, including generation acknowledgment race.
- Actual host link reconnection and renewed motion negotiation.
- Synthetic visibility hold/resume and finite stale prediction.
- Historical `36357aa` networking client alongside modern clients, using the
  exact legacy 52-byte contract.

The impairment hook delays/drops motion **before** native SCTP send; it does
not emulate OS-level UDP loss, SCTP retransmission/congestion behavior, NAT,
TURN or a real WAN. Visibility is synthetic, not a claim of browser background
throttling verification. No Firefox/Safari, physical multi-device formation,
full gameplay WebGL visual review, or low-powered hardware performance was
verified by this browser test. Existing headless carrier, combat, mission and
spectator camera diagnostics cover those gameplay integration paths.

Release checks: all 48 headless diagnostics, TypeScript, production build and
standalone artifact checks passed. Browser transport checks passed separately
with the environment and limitations recorded above.
