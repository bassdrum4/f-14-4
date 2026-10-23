// Every tuning number the combat sim uses, in one place, so a value can be found
// and adjusted without reading the systems that consume it.

import type { EnemyHit } from "./types";


// --- tuning ---
export const HULL_MAX = 100; // fallback until the player's spec is known
// Bandit tuning. Deliberately a shade softer than the original pass: the horde
// was winning exchanges rather than losing them, which is the wrong way round
// for the bandit. They still turn hard, still break when lined up on, and still
// hurt — a careless pilot will lose the jet — but they miss more, shoot from
// closer, and need more hits to end the fight.
export const BANDIT_HP = 30; // was 34: one good burst now finishes one
export const BANDIT_DAMAGE = 7; // was 9 — about 14 hits to put the player in the water
// Speed envelope: bandits fly the same F-14 the player flies — same turn
// authority, same jink — with ONE deliberate handicap: a lower top speed.
// The afterburner still lights (same plume, still the fastest they can go),
// but even lit they are slower than the original numbers were. They win the
// turn, the player wins the chase.
export const BANDIT_MAX_DRY = 240; // m/s (~465 kt) — slower than the original 270 cap
export const BANDIT_MAX_AB = 265; // m/s (~515 kt) — burner lit, still under the old cap
export const BANDIT_AB_TIME = 8; // s of continuous burner before a cooldown
export const MUZZLE_V = 1050; // m/s
export const TRACER_LIFE = 2.0; // s
export const HIT_RADIUS = 9; // m, airframe sphere
export const PLAYER_SPREAD = 0.005; // rad
export const BANDIT_SPREAD = 0.021; // rad — was 0.016: a wider cone means more misses
// Maneuverability: the bandits fly the SAME F-14 the player flies, and they
// read their turn ceiling straight off that airframe's spec. sustainedTurnRate()
// takes the F-14's lift curve, weight, 7.5 g limit, drag and thrust and returns
// the most rate the jet can HOLD at the bandit's current speed and altitude —
// the rate the player's own Tomcat could sit on without bleeding speed. The
// pilot's wing is capped by the same aero, and by the energy that runs out when
// they spend it; a bandit, which carries no energy state, is held to the
// steady-state number instead, so sitting at max pull no longer lets one gain.
// The old flat 410 m radius (nearly 35 deg/s at combat speed) was a number the
// player's F-14 could never match at all. The floor only keeps the steering
// controller alive in the first seconds off the catapult, below the speed band
// the turn spec is meaningful in. The lower top speed above is the ONLY
// remaining handicap.
export const BANDIT_TURN_FLOOR = 0.12; // rad/s (~7 deg/s) — low-speed controller floor
// Target speeds inside the envelope — lower than the original tune (215-235
// cruise, 270 break) in every state, but fast enough that a merge still happens
// and a hovering or slow player is still closed on.
export const BANDIT_SPEED = { pursue: 205, close: 190, evade: 255, min: 140 };
export const CEILING = 6000; // m — bandits stay in the fight box (islands reach ~3 km)
/** Keep the fight with the player: the chain is 60 km across, so the box is a
 *  radius around the player rather than one centred on the world origin. */
export const DOGFIGHT_ARENA = 16000;
export const ARENA = DOGFIGHT_ARENA;
export const EVADE_DIST = 600; // break when the player is inside this on the six
export const ENGAGE_DIST = 1200; // open fire inside this (was 1300: closer, less time on target)
export const AIM_CONE = 0.14; // rad — roughly on the nose before firing
export const NOSE_CONE_COS = 0.92; // player inside ~23 deg of the bandit = being lined up on
export const NOSE_BREAK_DIST = 850; // m — inside this, a lined-up bandit breaks hard
export const KEEP_APART = 240; // m — bandits shoulder away from each other
export const MERGE_DIST = 420; // m — slide past the player rather than through them
export const PANIC_DIST = 150; // m — inside this, break away hard from the player
export const THREAT_HOLD = 0.45; // s — rounds-inbound warning after a round goes out
export const HIT_FLASH = 0.5; // s — hit-marker flash after player rounds connect
export const DAMAGE_FLASH = 0.55; // s — red pulse when the player takes hits
export const MAX_TRACERS = 80;
export const MAX_FLASHES = 6;
// Rounds are projectiles, not laser bolts: they drop and slow in flight. The
// drag area is small on purpose — a 20 mm round is dense and slick, and an
// over-dragged bullet visibly decelerated and curved, which read as the guns
// "not shooting straight". The gun cue (see gunSolution) accounts for the drop
// and the drag that remain, so the crosshair is where the rounds actually go.
// --- gun aim assist ---
// Correct toward a bandit's lead point within five degrees of the bore.
// The fired rounds and HUD solution use the same correction, capped at five
// degrees and limited to 1.5 km so distant contacts do not attract the gun.
export const ASSIST_CONE = 5 * Math.PI / 180;
export const ASSIST_MAX = 5 * Math.PI / 180;
export const ASSIST_RANGE = 1500; // m: no assist beyond this

export const BULLET_MASS = 0.1; // kg (20 mm class)
export const BULLET_CDA = 0.000025; // drag coefficient x frontal area, m^2
export const CARRIER_GUN_DAMAGE = 1; // per round on a 100 hp hull — strafing takes ~10 s
export const WAVE_RESPAWN = 6; // s between endless strike waves
// Aggressor sorties get a longer breath between launch cycles: clearing a wave
// is the moment to check fuel, ordnance and the boat, not the start of the next
// one. Endless Practice and Fleet Defense use their own gaps below.
export const AGGRESSOR_WAVE_RESPAWN = 16; // s between aggressor waves (Endless Practice)
export const OPERATION_LAUNCH_GAP = 12; // s between aircraft launches in Fleet Defense
export const WAVE_MAX = 5;

// --- the hostile carrier (the bandits' home deck) ---
export const CV_NAME = "AGGRESSOR";
export const CV_HP = 100;
export const CV_START_DIST = 7200; // m — where the boat shows up on the horizon
export const CV_LAUNCH_RANGE = 7800; // m — inside this, it can launch (it starts in range)
export const CV_LAUNCH_HOLD = 40; // s — but never sit on a wave longer than this
// A slow approach (~12 kt), with enough motion to lead a bombing run.
export const CV_CLOSE_SPEED = 6; // m/s
export const CV_STANDOFF = 2800; // m — hold this far off the player
export const CV_TURN_DEG = 0.45; // deg/s rudder (a 300 m hull does not pivot)
export const CV_FRIENDLY_CLEAR = 2200; // m — never steam into a friendly anchorage
export const CV_FIRST_LAUNCH = 2.2; // s after a wave is called that the first jet rolls
export const CV_LAUNCH_GAP = 6; // s between aircraft off the two cats in an aggressor wave
export const CV_CAT_LATERAL = 20; // |CarrierDef.catapultOffsetX| — one cat each side
export const CV_CLIMB_TIME = 3.5; // s of nose-up after a shot before it starts hunting

// --- bombs ---
export const BOMB_MAG = 6; // default racks, overridden by the player's airframe
export const BOMB_HP = 34; // one hit takes a third of the carrier's hull
export const BOMB_RELEASE_CD = 0.5; // s between releases while the key is held
export const BOMB_AIR_RADIUS = 13; // m — a near miss on an airframe breaks it up
export const GRAVITY = 9.81;

// --- laser-guided bombs ---
export const LGB_TRAIL = 0.09; // s between trail puffs behind a guided bomb
export const LGB_TRAIL_TTL = 2.4; // s each puff hangs, i.e. how long the wake reads
// Every store smokes from the moment it leaves the rack, guided or not: without
// it a falling bomb is a dark speck lost against the terrain, and the pilot
// cannot tell whether the release happened at all.
export const BOMB_TRAIL = 0.16; // s between trail puffs behind a free-fall bomb
export const BOMB_TRAIL_TTL = 3.2; // s each puff hangs
/** How long the last impact keeps its place marked on the HUD. */
export const IMPACT_MARKER_TTL = 9;
/** How long the rack the last store left is marked on the HUD. */
export const RELEASE_MARKER_TTL = 4;
/** A lingering smoke column where a weapon went off, so the hit reads. */
export const IMPACT_SMOKE_TTL = 7;

// --- collisions (airframes do not pass through each other) ---
export const RAM_CARRIER_HP = 45; // damage a jet does to a hull it flies into
export const MID_AIR_DAMAGE = 55; // and what it does to the player's own hull
export const PLAYER_HIT_R = 28; // m — bandit inside this is a mid-air
export const BANDIT_HIT_R = 26; // m — two bandits inside this break up together
/** Rack stations in body coords (right, up, aft): three pairs under the wings. */
export const BOMB_STATIONS: Array<[number, number, number]> = [
  [-2.6, -1.5, 0.5],
  [2.6, -1.5, 0.5],
  [-4.1, -1.25, 0.7],
  [4.1, -1.25, 0.7],
  [-2.6, -1.5, 1.6],
  [2.6, -1.5, 1.6],
];

// --- missiles ---
// Air-intercept missiles for the types that carry them (the Tomcat and the
// Hornet ride two each; the Intruder is a clean bomb truck). A launch locks the
// nearest live enemy — bandit, strike target or the hostile boat — and the
// weapon steers onto it, so off-boresight snaps read like a real seeker rather
// than a bullet.
export const MISSILE_CD = 1.1; // s between launches (rails cycle)
export const MISSILE_MOTOR = 2.6; // s of rocket burn
export const MISSILE_ACCEL = 230; // m/s^2 while the motor burns
export const MISSILE_V_MAX = 640; // m/s hard cap
export const MISSILE_TURN = 2.1; // rad/s seek authority — kills a jinking bandit
export const MISSILE_ARM = 0.35; // s before the seeker goes live (clears the jet)
export const MISSILE_DET = 26; // m proximity fuze on the locked target
export const MISSILE_AIR_R = 30; // m airburst radius on any airframe
export const MISSILE_HP = 90; // damage: one hit breaks any aircraft outright
// A wingman reports its own weapon results, so its claims are capped at the
// biggest single hit the fight can actually produce (with headroom for tuning):
// anything above this is a bug or a cheat, not a hit.
export const MAX_CLAIMED_HIT = MISSILE_HP * 2;
export const MAX_CLAIMED_CV_HIT = RAM_CARRIER_HP * 2;
export const MISSILE_CV_DMG = 38; // damage to the hostile carrier's hull
export const MISSILE_MASS = 230; // kg
export const MISSILE_CD0 = 0.3; // drag coefficient (coast phase)
export const MISSILE_AREA = 0.045; // m^2 frontal area
export const MISSILE_TRAIL_HOT = 0.045; // s between motor plume puffs
export const MISSILE_TRAIL_COLD = 0.12; // s between coast puffs
/** Under-wing rail stations: outboard of the bomb racks, just behind CG. */
export const MISSILE_STATIONS: Array<[number, number, number]> = [
  [-4.6, -1.1, -0.4],
  [4.6, -1.1, -0.4],
];

// --- countermeasures ---
// A press ejects a small salvo of burning cartridges. They inherit the jet's
// velocity, fall away with drag, and burn for a few seconds; a hostile seeker
// that sees one inside its cone can be decoyed onto it (see captureFlare), which
// is the whole point of carrying them. Amounts come off the airframe's spec.
export const FLARE_SALVO = 4; // cartridges per press
export const FLARE_CD = 0.7; // s between presses
export const FLARE_BURN = 4.5; // s each cartridge burns
export const FLARE_EJECT_DOWN = 14; // m/s ejection, downward (body -Y)
export const FLARE_EJECT_BACK = 5; // m/s ejection, aft (body +Z)
export const FLARE_SPREAD = 3.4; // m/s of per-cartridge scatter
export const FLARE_TRAIL = 0.055; // s between smoke puffs behind a burning cartridge
export const MAX_FLARES = 256; // local cartridges plus bounded remote salvos
export const LOCAL_FLARE_RESERVE = 32; // remote effects cannot exhaust the pilot's pool
export const FLARE_GRAVITY = 0.55; // flares are light and draggy, not bricks

// --- bandit air-to-air rounds ---
// Waves 1–2 teach finding contacts and gun combat. Missiles join from wave 3,
// once the pilot has had time to learn the merge and countermeasures.
export const BANDIT_MISSILE_FIRST_WAVE = 3;
export const BANDIT_MISSILE_LOAD = 2; // rounds per bandit from wave 3
export const BANDIT_MISSILE_ARM_DELAY = 16; // s a fresh bandit waits before its first shot
export const BANDIT_MISSILE_CD = 22; // s between one bandit's shots
export const BANDIT_MISSILE_MIN = 700; // m: inside this the shot is a merge, not a launch
export const BANDIT_MISSILE_MAX = 5200; // m: outside this the round cannot reach
export const BANDIT_MISSILE_CONE = 0.5; // rad off the bandit's bore to take the shot
export const MISSILE_LIFE = 26; // s before a round runs out of energy and is gone
export const MISSILE_PLAYER_DMG = 34; // warhead damage against the player's hull
export const MISSILE_WARN_R = 9000; // m: the RWR call-out range

export const ROOKIE_SKILL = { reaction: 1.1, jink: 0.45, turn: 0.75, duration: 1.1, cooldown: 14 };
export const INTERMEDIATE_SKILL = { reaction: 0.65, jink: 0.7, turn: 0.9, duration: 1.4, cooldown: 11 };
export const VETERAN_SKILL = { reaction: 0, jink: 1, turn: 1, duration: 1.8, cooldown: 9 };
export function fighterSkill(wave: number) {
  return wave <= 1 ? ROOKIE_SKILL : wave === 2 ? INTERMEDIATE_SKILL : VETERAN_SKILL;
}

export const NO_HITS: EnemyHit[] = [];
