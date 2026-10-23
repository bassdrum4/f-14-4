// First-flight tutorial, checked without a browser.
//
// Covers the two things that are easy to break: who is offered the lesson
// (only a pilot who has never flown) and the sortie itself (one passive drone,
// no waves, and the coach advances on the jet's own state).
//
// Usage: bun scripts/diag-tutorial.ts  (or: bun run test:tutorial)

const store = new Map<string, string>();
(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

import { Scene } from "three";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { spawnAircraft } from "../src/sim/flight";
import { advanceTutorialStep, tutorialCards, tutorialHud, TUTORIAL_STEP_COUNT } from "../src/tutorial";
import { defaultSettings, loadSettings } from "../src/settings";
import { applyGamestate, profileOf } from "../src/accounts";
import type { GamestateProfile } from "../src/gamestate";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

console.log("tutorial — who is offered it");
{
  const KEY = "f14sim.settings.v1";
  store.clear();
  const fresh = loadSettings();
  check("a fresh pilot has not flown", fresh.hasFlown === false, String(fresh.hasFlown));

  // A save written before the flag existed belongs to an existing pilot, not a
  // new one: the first flight should not be offered again after an update.
  store.set(KEY, JSON.stringify({ volume: 0.4, aircraft: "hornet" }));
  const veteran = loadSettings();
  check("an older save is treated as a pilot who has flown", veteran.hasFlown === true, String(veteran.hasFlown));

  store.set(KEY, JSON.stringify({ hasFlown: false }));
  const firstRun = loadSettings();
  check("an explicit false still offers the tutorial", firstRun.hasFlown === false, String(firstRun.hasFlown));

  const profile = profileOf({ ...defaultSettings(), hasFlown: false });
  check("the cloud profile carries the flag", profile.hasFlown === false, String(profile.hasFlown));
  const fetched = applyGamestate({ ...defaultSettings(), hasFlown: true }, profile);
  check("a fetched new-pilot profile keeps the offer", fetched.hasFlown === false, String(fetched.hasFlown));
  const older = profileOf(defaultSettings()) as GamestateProfile;
  delete (older as { hasFlown?: boolean }).hasFlown;
  const returning = applyGamestate({ ...defaultSettings(), hasFlown: false }, older);
  check("an older cloud profile belongs to a pilot who has flown", returning.hasFlown === true, String(returning.hasFlown));
}

console.log("tutorial — lesson progression");
{
  check("there are four cards", TUTORIAL_STEP_COUNT === 4, String(TUTORIAL_STEP_COUNT));
  const cards = tutorialCards(defaultSettings().bindings);
  check("the first card is the cat shot", cards[0].title === "CAT SHOT", cards[0].title);
  check("the cards name the pilot's own keys",
    cards[0].body.includes("Space") && cards[2].body.includes("Q"), cards[0].body);

  check("parked on the deck keeps the cat-shot card",
    advanceTutorialStep(0, { onGround: true, gearDown: true, altitudeM: 20, kills: 0 }) === 0);
  check("wheels off the deck moves to clean-up",
    advanceTutorialStep(0, { onGround: false, gearDown: true, altitudeM: 100, kills: 0 }) === 1);
  check("gear still down at altitude keeps the clean-up card",
    advanceTutorialStep(1, { onGround: false, gearDown: true, altitudeM: 800, kills: 0 }) === 1);
  check("gear up but low keeps the clean-up card",
    advanceTutorialStep(1, { onGround: false, gearDown: false, altitudeM: 200, kills: 0 }) === 1);
  check("clean and climbing moves to guns",
    advanceTutorialStep(1, { onGround: false, gearDown: false, altitudeM: 500, kills: 0 }) === 2);
  check("no kill keeps the guns card",
    advanceTutorialStep(2, { onGround: false, gearDown: false, altitudeM: 800, kills: 0 }) === 2);
  check("a kill finishes the lesson",
    advanceTutorialStep(2, { onGround: false, gearDown: false, altitudeM: 800, kills: 1 }) === 3);
  check("the last card is marked complete", tutorialHud(3, defaultSettings().bindings).complete === true);
  check("the coach reports one-based steps", tutorialHud(1, defaultSettings().bindings).step === 2,
    String(tutorialHud(1, defaultSettings().bindings).step));

  // Steps never rewind: dropping the gear again must not reopen an old card.
  check("a later step does not go backwards",
    advanceTutorialStep(3, { onGround: true, gearDown: true, altitudeM: 0, kills: 0 }) === 3);
}

console.log("tutorial — the practice drone and its sortie");
{
  const scene = new Scene();
  const blasts = new ExplosionField(scene, "low");
  const df = new Dogfight(scene, blasts);
  const player = spawnAircraft("carrier", 0);
  df.prepareTutorial(player);

  check("the tutorial is marked as such", df.tutorial === true);
  check("it is active before wheels-up", df.active === true);
  check("there is no hostile carrier to fight", df.cv === null);
  check("there is exactly one practice drone", df.bandits.length === 1, String(df.bandits.length));
  const drone = df.bandits[0];
  check("the drone is passive", drone.tutorial === true && drone.missiles === 0 && drone.fireCd === Infinity);
  check("the drone has an orbit", !!drone.tutorialOrbit);
  check("the drone starts within sight of the deck",
    drone.pos.distanceTo(player.pos) > 700 && drone.pos.distanceTo(player.pos) < 2600,
    drone.pos.distanceTo(player.pos).toFixed(0));

  const before = drone.pos.clone();
  for (let i = 0; i < 240; i++) df.step(1 / 120, player, false, false);
  check("the drone flies its orbit", drone.pos.distanceTo(before) > 10, drone.pos.distanceTo(before).toFixed(1));
  check("it never shoots the parked pilot", player.result === null);

  df.damageBandit(drone, 100, player);
  check("a burst kills the drone", df.kills === 1, String(df.kills));
  check("the range is clear afterwards", df.bandits.length === 0, String(df.bandits.length));

  // Killing the practice target must not call a wave: the lesson does not turn
  // into Endless Practice behind the pilot's back.
  for (let i = 0; i < 120 * 25; i++) df.step(1 / 120, player, false, false);
  check("no wave launches after the lesson", df.bandits.length === 0 && df.wave === 1,
    `bandits=${df.bandits.length} wave=${df.wave}`);
  blasts.dispose();
}

if (failures > 0) {
  console.error(`\n${failures} tutorial check(s) failed`);
  process.exit(1);
}
console.log("\nALL TUTORIAL CHECKS PASSED");
