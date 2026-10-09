// Headless dogfight verification: the hostile carrier is on the water and
// motoring in before the jet leaves the deck, then launches its bandits off the
// catapults (never out of thin air), while the player's bombs fall
// ballistically, splash, and sink the boat. Bandits still close on the player,
// engage, take damage from aimed fire, break when lined up on, keep separation,
// hold fire through terrain, and waves keep coming off the deck. Also exercises
// clear().
// Usage: bun scripts/diag-dogfight.ts

import { Matrix4, Scene, Vector3 } from "three";
import { spawnAircraft, type AircraftState } from "../src/sim/flight";
import { Dogfight, DOGFIGHT_ARENA, terrainBlocks } from "../src/sim/dogfight";
import { carriers, deckAxes, groundAt } from "../src/sim/world";
import { ExplosionField } from "../src/render/effects";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const DT = 1 / 120;
const MAT4 = new Matrix4();
const UP = new Vector3(0, 1, 0);
const ORIGIN = new Vector3();
const DIR = new Vector3();

/**
 * Open water near the middle of the arena, well clear of the fleet: the fight
 * has to start away from land, and the hostile boat must not have to steer
 * through a friendly anchorage.
 */
function openWater(): Vector3 {
  for (let i = 1; i < 6000; i++) {
    const a = i * 2.39996; // golden-angle spiral
    const r = Math.sqrt(i) * 90;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.abs(x) > 3800 || Math.abs(z) > 3800) continue;
    if (groundAt(x, z).kind !== "water") continue;
    let clear = true;
    for (const c of carriers()) if (Math.hypot(c.x - x, c.z - z) < 4000) clear = false;
    if (clear) return new Vector3(x, 1500, z);
  }
  return new Vector3(0, 1500, 0);
}

/** A clean player state parked in mid-air, nose north, at a realistic 260 m/s
 *  Tomcat cruise — faster than the bandits' handicapped envelope (240 dry /
 *  265 burner), which is the whole point of that handicap. */
const PLAYER_SPEED = 260;
function airPlayer(): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.copy(openWater());
  st.vel.set(0, 0, -PLAYER_SPEED);
  st.speed = PLAYER_SPEED; // stepAircraft keeps this in lockstep with vel; tests must too
  st.gearDown = false;
  st.gearT = 0;
  st.onGround = false;
  return st;
}

/** Point the player's nose at a world point and fly at it. */
function face(st: AircraftState, target: Vector3): void {
  DIR.copy(target).sub(st.pos).normalize();
  MAT4.lookAt(ORIGIN, DIR, UP);
  st.quat.setFromRotationMatrix(MAT4);
  st.vel.copy(DIR).multiplyScalar(PLAYER_SPEED);
  st.speed = PLAYER_SPEED;
}

/**
 * Vector the player at the nearest bandit's intercept point (used by two
 * sections). The bore solves the actual intercept: the round flies at muzzle
 * speed along the bore INHERITING the jet's velocity, while the bandit flies at
 * its own — so the time of flight closes the loop on the RELATIVE velocity and
 * the aim pre-compensates gravity droop. Aiming at plain `pos + vel * d/v` in
 * a head-on merge over-leads by tens of metres and every round misses.
 */
const MUZZLE_SPEED = 1050;
/** The nearest target's measured jink acceleration, remembered between calls so
 *  the intercept can predict a weaving bandit: p(t) = p + v·t + ½a·t². A
 *  straight-line intercept against a bandit mid-jink misses by tens of metres.
 *  Tracked PER BANDIT ID: two bandits that swap nearest within a step would
 *  otherwise read as a single aircraft with a huge spurious acceleration. */
const lastByBandit = new Map<number, { pos: Vector3; vel: Vector3 }>();
const targetAccel = new Vector3();
function updateTargetAccel(
  target: { id?: number; pos: Vector3; vel: Vector3 },
): void {
  const last = target.id !== undefined ? lastByBandit.get(target.id) : undefined;
  if (
    last &&
    last.pos.distanceTo(target.pos) < 50 // same aircraft, one step later
  ) {
    targetAccel.copy(target.vel).sub(last.vel).divideScalar(DT);
  } else {
    targetAccel.set(0, 0, 0);
  }
  if (target.id !== undefined) {
    lastByBandit.set(target.id, { pos: target.pos.clone(), vel: target.vel.clone() });
  }
}
function interceptDir(
  player: AircraftState,
  target: { pos: Vector3; vel: Vector3 },
): Vector3 {
  updateTargetAccel(target);
  const w = target.pos.clone().sub(player.pos);
  const rel = target.vel.clone().sub(player.vel); // bandit motion in the jet's frame
  let tof = w.length() / MUZZLE_SPEED;
  for (let i = 0; i < 4; i++) {
    tof = w.clone().addScaledVector(rel, tof).length() / MUZZLE_SPEED;
  }
  // bore target: the intercept point minus where inheritance carries the round
  const aim = w.addScaledVector(rel, tof).addScaledVector(targetAccel, 0.5 * tof * tof);
  aim.y += 0.5 * 9.81 * tof * tof; // gravity droop over the flight
  return aim;
}
function aimAtNearest(df: Dogfight, player: AircraftState): boolean {
  const targets = df.targets();
  if (targets.length === 0) return false;
  let best = targets[0];
  let bestD = Infinity;
  for (const t of targets) {
    const d = t.pos.distanceTo(player.pos);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  face(player, player.pos.clone().add(interceptDir(player, best)));
  return true;
}

const scene = new Scene();
const blasts = new ExplosionField(scene, "low");
const df = new Dogfight(scene, blasts);
let player = airPlayer();

// --- 1. prepared on the deck: the boat is already inbound, nothing launched ---
{
  const parked = spawnAircraft("carrier", 0);
  const s0 = new Scene();
  const d0 = new Dogfight(s0, new ExplosionField(s0, "low"));
  d0.prepare(parked);
  const p0 = d0.hud(parked);
  check("prepare puts the boat on the water before wheels-up",
    p0.carrier !== null && p0.carrier.distKm > 4 && p0.carrier.distKm < 9, JSON.stringify(p0.carrier));
  check("prepare starts no fight and launches nothing",
    !p0.active && p0.bandits === 0 && (p0.carrier?.inbound ?? 1) === 0,
    `active=${p0.active} bandits=${p0.bandits} inbound=${p0.carrier?.inbound}`);
  for (let i = 0; i < Math.round(30 / DT); i++) {
    parked.time += DT;
    d0.step(DT, parked, false);
  }
  const p1 = d0.hud(parked);
  check("the boat motors in while the jet is still on the deck",
    p1.carrier!.distKm < p0.carrier!.distKm - 0.3,
    `${p0.carrier!.distKm.toFixed(2)}km -> ${p1.carrier!.distKm.toFixed(2)}km`);
  check("no bandits before the launch", p1.bandits === 0 && p1.carrier!.inbound === 0,
    `bandits=${p1.bandits}`);
  d0.begin(parked);
  const p2 = d0.hud(parked);
  check("the fight starts with the same boat, not a respawned one",
    p2.carrier !== null && Math.abs(p2.carrier.x - p1.carrier!.x) < 200 &&
      Math.abs(p2.carrier.distKm - p1.carrier!.distKm) < 0.2,
    JSON.stringify(p2.carrier));
  check("wave 1 is spotted on the cats when the fight starts",
    p2.active && p2.carrier!.inbound === 2, `inbound=${p2.carrier!.inbound}`);
  d0.dispose();
}

// --- 2. begin: the boat shows up on the horizon, not the bandits ---
df.begin(player);
const h0 = df.hud(player);
const cvStart = h0.carrier;
check("hostile carrier appears on the horizon", cvStart !== null && cvStart.distKm > 4 && cvStart.distKm < 9,
  JSON.stringify(cvStart));
check("the boat spawns in open water",
  cvStart !== null && groundAt(cvStart.x, cvStart.z).kind === "water");
check("no bandits appear out of thin air", h0.bandits === 0 && (cvStart?.inbound ?? 0) === 2,
  `bandits=${h0.bandits} inbound=${cvStart?.inbound}`);
check("the player starts with a full bomb load", h0.bombs === 6 && h0.bombsMax === 6,
  `${h0.bombs}/${h0.bombsMax}`);

// --- 3. the boat motors in; bandits take a cat shot off its deck ---
player.vel.set(0, 0, 0); // hover so any range change is the ship's, not ours
player.speed = 0;
const closeStart = cvStart!.distKm;
let firstSeen: { dist: number; y: number; alongBow: number } | null = null;
let launchesRolling = false;
for (let i = 0; i < Math.round(12 / DT); i++) {
  player.time += DT;
  df.step(DT, player, false);
  const h = df.hud(player);
  if (h.carrier && h.carrier.inbound > 0 && h.bandits > 0) launchesRolling = true;
  if (!firstSeen && h.bandits > 0 && h.carrier) {
    const t = df.targets()[0];
    const toPlayer = new Vector3(
      player.pos.x - h.carrier.x, 0, player.pos.z - h.carrier.z,
    ).normalize();
    firstSeen = {
      dist: t.pos.distanceTo(new Vector3(h.carrier.x, h.carrier.y, h.carrier.z)),
      y: t.pos.y - h.carrier.y,
      alongBow: t.vel.clone().normalize().dot(toPlayer),
    };
  }
}
const h1 = df.hud(player);
check("bandits launch from the hostile deck", h1.bandits >= 1, `bandits=${h1.bandits}`);
check("the first bandit comes off the deck, not mid-air",
  firstSeen !== null && firstSeen.dist < 500 && firstSeen.y >= 0 && firstSeen.y < 30,
  JSON.stringify(firstSeen));
check("launches come from the boat's catapults", launchesRolling);
check("the carrier motors in toward the player", h1.carrier!.distKm < closeStart - 0.1,
  `${closeStart.toFixed(2)}km -> ${h1.carrier!.distKm.toFixed(2)}km`);
check("the cat shot fires the bandit toward the player",
  firstSeen !== null && firstSeen.alongBow > 0.5, `alongBow=${firstSeen?.alongBow.toFixed(2)}`);

// --- 4. passive player: bandits close in and open fire ---
// Hover: with the target stationary the bandits' lead math aims exactly at it,
// so any damage taken is real engagement and not a test artifact.
const startDist = df.hud(player).nearestKm;
let minDist = Infinity;
const hullStart = df.hud(player).hull;
let outOfArena = 0;
let minPair = Infinity; // closest two bandits ever get to each other
let sawThreat = false;
let sawDamageFlash = false;
let hullAt30 = -1;
let spotsMatch = true;
let sawLead = false;
let joined = false; // only police the arena once a bandit is in the fight
for (let i = 0; i < Math.round(90 / DT); i++) {
  player.time += DT;
  df.step(DT, player, false);
  const h = df.hud(player);
  minDist = Math.min(minDist, h.nearestKm);
  if (h.bandits > 0 && h.nearestKm < 3) joined = true;
  if (joined) {
    // the arena is a radius around the player, not the world origin
    for (const m of h.markers) {
      if (Math.hypot(m.x - player.pos.x, m.z - player.pos.z) > DOGFIGHT_ARENA + 1200) outOfArena++;
    }
  }
  for (let a = 0; a < h.markers.length; a++) {
    for (let b2 = a + 1; b2 < h.markers.length; b2++) {
      minPair = Math.min(
        minPair,
        Math.hypot(h.markers[a].x - h.markers[b2].x, h.markers[a].z - h.markers[b2].z),
      );
    }
  }
  if (h.threat) sawThreat = true;
  if (h.damageT > 0) sawDamageFlash = true;
  if (hullAt30 < 0 && i * DT >= 30) hullAt30 = h.hull;
  if (h.spots.length !== h.bandits) spotsMatch = false;
  for (const s of h.spots) {
    if (s.km > 0.6 && Math.hypot(s.lx - s.x, s.ly - s.y, s.lz - s.z) > 0.5) sawLead = true;
  }
}
const after = df.hud(player);
check("bandits closed on the player", after.nearestKm < startDist * 0.4,
  `start ${startDist.toFixed(2)}km -> min ${minDist.toFixed(2)}km`);
check("bandits engaged: player hull damaged", after.hull < hullStart,
  `hull ${hullStart} -> ${after.hull}`);
// A landing on a friendly deck or runway is a recovery: the sim calls refill()
// on touchdown, which has to put the hull back to full at this level.
df.refill();
const repaired = df.hud(player);
check("refill restores a damaged hull to full", repaired.hull === hullStart,
  `hull ${after.hull} -> ${repaired.hull} (full ${hullStart})`);
check("bandits still alive and fighting", after.bandits > 0, String(after.bandits));
// The bandits are tuned to be beatable: a passive pilot (this test flies dead
// straight, never manoeuvring or shooting back) takes hits but is still flying
// half a minute into the engagement. That is the "little bit softer" the nerf
// is for — the fight is dangerous without being lost before it starts.
check("a passive pilot is still flying 30 s into the engagement", hullAt30 > 0,
  `hull ${hullAt30} at 30 s, ${after.hull} at 90 s`);
check("bandits stay inside the arena", outOfArena === 0, `${outOfArena} samples out`);
check("wingmen keep separation", minPair > 40, `min pair gap ${minPair.toFixed(0)} m`);
check("threat warning lights while bandits shoot", sawThreat);
check("damage flash lights when hit", sawDamageFlash);
check("one designator per bandit", spotsMatch);
check("gun cue leads moving bandits", sawLead);

// --- 5. aimed player scores kills, and wave 2 also comes off the deck ---
// Same invulnerable hull as section 4: this section validates gunnery and the
// wave cycle, and the faster merge geometry now produces honest mid-airs (a
// bandit inside the player's footprint takes BOTH out) that would otherwise
// end this pilot before the wave cycle is exercised.
player = airPlayer();
player.spec = { ...player.spec, hull: 1_000_000 };
df.begin(player);
let kills = 0;
let waveKillsDone = false;
let waveAdvanced = false;
let sawHit = false;
for (let i = 0; i < Math.round(200 / DT) && !waveAdvanced; i++) {
  if (df.hud(player).bandits > 0) aimAtNearest(df, player);
  player.time += DT;
  player.pos.addScaledVector(player.vel, DT);
  df.step(DT, player, true);
  const h = df.hud(player);
  if (h.hitT > 0) sawHit = true;
  kills = h.kills;
  if (kills >= 1) waveKillsDone = true;
  if (waveKillsDone && h.wave >= 2) waveAdvanced = true;
}
check("aimed fire splashes a bandit", waveKillsDone, `kills=${kills}`);
check("clearing wave 1 calls wave 2", waveAdvanced, `wave=${df.hud(player).wave}`);
check("hit marker flashes when our rounds connect", sawHit);
// the wave 2 aircraft must come up the cats too, no matter how far the boat is
{
  let wave2Seen: { dist: number; y: number } | null = null;
  for (let i = 0; i < Math.round(45 / DT) && !wave2Seen; i++) {
    player.time += DT;
    df.step(DT, player, false);
    const h = df.hud(player);
    if (h.bandits > 0 && h.carrier) {
      const t = df.targets()[0];
      wave2Seen = {
        dist: t.pos.distanceTo(new Vector3(h.carrier.x, h.carrier.y, h.carrier.z)),
        y: t.pos.y - h.carrier.y,
      };
    }
  }
  check("wave 2 launches from the carrier's deck too",
    wave2Seen !== null && wave2Seen.dist < 500 && wave2Seen.y < 30, JSON.stringify(wave2Seen));
}

// --- 6. a bandit being lined up on breaks instead of boring in ---
player = airPlayer();
df.begin(player);
{
  let closed = false;
  let maxSpeed = 0;
  for (let i = 0; i < Math.round(40 / DT); i++) {
    const targets = df.targets();
    let idx = -1;
    let bestD = Infinity;
    for (let k = 0; k < targets.length; k++) {
      const d = targets[k].pos.distanceTo(player.pos);
      if (d < bestD) {
        bestD = d;
        idx = k;
      }
    }
    if (idx >= 0) face(player, targets[idx].pos);
    player.time += DT;
    player.pos.addScaledVector(player.vel, DT);
    df.step(DT, player, false);
    const t2 = df.targets();
    if (idx >= 0 && idx < t2.length) {
      // once it is inside break range, a threatened bandit should wind up to
      // its evade speed (255), well above the 190-205 it cruises at otherwise
      if (t2[idx].pos.distanceTo(player.pos) < 1400) closed = true;
      if (closed) maxSpeed = Math.max(maxSpeed, t2[idx].vel.length());
    }
  }
  check("bandit breaks when lined up on", maxSpeed > 245, `max speed ${maxSpeed.toFixed(0)} m/s`);
}

// --- 7. terrain gates bandit fire ---
{
  const a = new Vector3();
  const b = new Vector3();
  let seed = 7;
  const rnd = () => {
    // Park-Miller: small multiplier keeps every step inside safe integer math
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  let lowBlocked = 0;
  let highBlocked = 0;
  for (let i = 0; i < 300; i++) {
    const x = (rnd() * 2 - 1) * 9000;
    const z = (rnd() * 2 - 1) * 9000;
    a.set(x, 400, z);
    b.set(x + (rnd() * 2 - 1) * 3000, 400, z + (rnd() * 2 - 1) * 3000);
    if (terrainBlocks(a, b)) lowBlocked++;
    a.y = 7000;
    b.y = 7000;
    if (terrainBlocks(a, b)) highBlocked++;
  }
  check("terrain blocks some low sight lines", lowBlocked > 0, `${lowBlocked} blocked`);
  check("terrain never blocks above the peaks", highBlocked === 0, `${highBlocked} blocked`);
}

// --- 8. bombs: no release on deck, ballistic fall, splash, deck hits ---
{
  // on the deck with the brake on, the racks stay shut
  const parked = spawnAircraft("carrier", 0);
  df.begin(parked);
  for (let i = 0; i < Math.round(3 / DT); i++) {
    parked.time += DT;
    df.step(DT, parked, false, true);
  }
  check("bombs cannot be released while parked on deck", df.hud(parked).bombs === 6,
    `${df.hud(parked).bombs} left`);

  // airborne over the sea: hold the key and watch them go
  player = airPlayer();
  player.vel.set(0, 0, 0);
  player.speed = 0;
  df.begin(player);
  for (let i = 0; i < Math.round(2 / DT); i++) {
    player.time += DT;
    df.step(DT, player, false, true);
  }
  const afterRelease = df.hud(player);
  check("holding the release key pickles bombs off the racks",
    afterRelease.bombs < 6 && afterRelease.bombs > 0, `${afterRelease.bombs} left`);
  check("released bombs are away, not gone", afterRelease.bombsAway === 6 - afterRelease.bombs,
    `${afterRelease.bombsAway} away, ${afterRelease.bombs} on the racks`);
  // from 1500 m the fall takes a while: they are still in the air, then splash
  let stillFalling = true;
  for (let i = 0; i < Math.round(6 / DT); i++) {
    player.time += DT;
    df.step(DT, player, false, false);
    if (df.hud(player).bombsAway === 0) stillFalling = false;
  }
  check("bombs fall ballistically for more than a moment", stillFalling,
    `${df.hud(player).bombsAway} away after 6 s`);
  for (let i = 0; i < Math.round(26 / DT); i++) {
    player.time += DT;
    df.step(DT, player, false, false);
  }
  check("bombs splash into the sea and clear",
    df.hud(player).bombsAway === 0 && df.hud(player).bombs < 6,
    `${df.hud(player).bombsAway} away, ${df.hud(player).bombs} on the racks`);
  // the same refill a recovery triggers puts the expended stores back
  const spent = df.hud(player).bombs;
  df.refill();
  check("refill reloads the racks", df.hud(player).bombs === 6,
    `${spent} -> ${df.hud(player).bombs}/6`);

  // hovering over the hostile deck: three hits sink it and stop the launches.
  // prepare() first: a fresh boat holds still under the bombs, while one already
  // running at flank speed would slide out from under a level drop.
  player = airPlayer();
  df.prepare(player);
  df.begin(player);
  const cvDef = df.hud(player).carrier!;
  player.pos.set(cvDef.x, cvDef.y + 900, cvDef.z);
  player.vel.set(0, 0, 0);
  player.speed = 0;
  for (let i = 0; i < Math.round(60 / DT); i++) {
    player.time += DT;
    df.step(DT, player, false, i < Math.round(3 / DT)); // release first 3 s only
  }
  const sunk = df.hud(player).carrier!;
  check("bombs on the deck hurt the carrier", sunk.hp < 100, `hp=${sunk.hp}`);
  check("three deck hits mission-kill the carrier", sunk.hp === 0 && sunk.status === "sinking",
    `${sunk.hp}% ${sunk.status}`);
  check("a sinking carrier launches nothing", sunk.inbound === 0, `inbound=${sunk.inbound}`);

  // whatever already launched may still be up there, but nothing new may come
  // off a sinking deck: hold the count for half a minute
  const atSink = df.hud(player).bandits;
  let grew = false;
  let maxBandits = atSink;
  for (let i = 0; i < Math.round(30 / DT); i++) {
    player.time += DT;
    df.step(DT, player, false, false);
    const h = df.hud(player);
    maxBandits = Math.max(maxBandits, h.bandits);
    if (h.bandits > atSink) grew = true;
  }
  const quiet = df.hud(player);
  check("a sunk carrier puts up no more aircraft",
    !grew && quiet.carrier!.inbound === 0 && quiet.wave === 1,
    `${atSink} -> ${maxBandits} bandits, wave ${quiet.wave}, inbound ${quiet.carrier!.inbound}`);
}

// --- 9. the gun crosshair: gunSolution follows the rounds, not the bore ---
//
// The crosshair is only useful if it is where the bullets actually go, so this
// pins the three states the HUD colours: a bandit on the nose, the sea, and the
// enemy boat's deck. The muzzle speed lives in interceptDir above.
{
  // A fresh fight: the section above has just sunk its boat, and a sunk boat
  // launches nothing, so the crosshair needs its own live carrier.
  const gdf = new Dogfight(scene, blasts);
  player = airPlayer();
  // The crosshair test flies straight at the bandits for minutes on end, so give
  // this pilot a hull that cannot be shot down: the point is the cue, not my
  // ability to evade in a headless script.
  player.spec = { ...player.spec, hull: 1_000_000 };
  gdf.begin(player);

  // --- fly until the crosshair calls a bandit: the cue itself is the aim loop
  let calledBandit = false;
  for (let i = 0; i < Math.round(180 / DT) && !calledBandit; i++) {
    const targets = gdf.targets();
    let best: { id?: number; pos: Vector3; vel: Vector3 } | null = null;
    let bestD = Infinity;
    for (const t of targets) {
      const d = t.pos.distanceTo(player.pos);
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    if (best && bestD < 2400) {
      // fly the intercept the pipper would give, then let the cue report what
      // the burst would hit (2400 m is the tracer's full 2 s reach, and the
      // jink-free zone where the solution is clean)
      face(player, player.pos.clone().add(interceptDir(player, best)));
      const cue = gdf.gunSolution(player);
      if (cue.hit === "bandit") {
        calledBandit = true;
        check("the crosshair range matches the solution point",
          Math.abs(cue.range - Math.hypot(cue.x - player.pos.x, cue.y - player.pos.y, cue.z - player.pos.z)) < 40,
          `cue ${cue.range.toFixed(0)} m`);
        check("a bandit in the cone reads as live", cue.live, `${cue.t.toFixed(2)} s`);
      }
    } else if (best) {
      // close on the bandits: a pilot steers toward the fight, he does not fly
      // a blind straight line past it (the carrier's spawn fan can sit well off
      // the initial heading)
      face(player, best.pos);
    }
    player.time += DT;
    player.pos.addScaledVector(player.vel, DT);
    gdf.step(DT, player, false);
  }
  check("the crosshair turns on a bandit in the cone", calledBandit);

  // --- nose up into empty sky: live rounds, nothing to hit
  {
    face(player, player.pos.clone().add(new Vector3(0.2, 1, -0.4).normalize().multiplyScalar(2000)));
    const cue = gdf.gunSolution(player);
    check("a burst into open sky hits nothing", cue.hit === null, String(cue.hit));
    check("and the rounds really did leave the jet", cue.t > 1.5, `${cue.t.toFixed(2)} s`);
  }

  // --- nose down at the sea: the water is a surface, so the cue calls ground
  {
    player.pos.y = 700;
    face(player, player.pos.clone().add(new Vector3(0, -0.8, -1).normalize().multiplyScalar(1500)));
    const cue = gdf.gunSolution(player);
    check("a burst into the sea reads as a surface hit", cue.hit === "ground", String(cue.hit));
    check("and the solution sits on the water", Math.abs(cue.y) < 4, cue.y.toFixed(1));
  }

  // --- and at the enemy boat: the carrier deck is a target too. Approach along
  // the ship's own axis, which is where its deck actually is.
  {
    const deck = gdf.enemyDeck();
    if (!deck) {
      check("the hostile boat is there to strafe", false);
    } else {
      const { fwd } = deckAxes(deck.headingDeg);
      player.pos.set(deck.x - fwd[0] * 900, deck.deckY + 120, deck.z - fwd[1] * 900);
      face(player, new Vector3(deck.x, deck.deckY, deck.z));
      const cue = gdf.gunSolution(player);
      check("the crosshair turns on the enemy deck", cue.hit === "ship", `${cue.hit} @ ${cue.range.toFixed(0)} m`);
    }
  }
  gdf.dispose();
}

// --- 10. clear + dispose are clean ---
df.clear();
check("clear empties the fight", df.hud(player).bandits === 0 && !df.hud(player).active);
check("clear removes the hostile carrier", df.hud(player).carrier === null);
check("clear refills the bomb racks", df.hud(player).bombs === 6);
df.dispose();
console.log(failures === 0 ? "\nALL DOGFIGHT CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
