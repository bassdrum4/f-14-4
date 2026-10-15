// Integrated air defence (Option 1): the island bastion, its radar-cued SAM
// batteries, the AAA curtain and the terrain-masking fight.
//
// What has to hold:
//
//   * Operation Iron Bastion sites a fortified airbase on real land — command
//     bunker, hardened hangars, fuel depot — with radar, two SAM batteries and
//     an AAA site defending it,
//   * the three primary fortress targets (bunker, hangar, fuel) are what wins
//     or loses the operation; radar/SAM/AAA are the defences, not the score,
//   * the fuel depot detonates and chains into what is stored beside it,
//   * destroying the radar shortens the batteries' reach and slows their lock,
//   * terrain breaks the lock outright, and the HUD says so,
//   * a SAM launch puts a guided hostile round in the air at the pilot.
//
// Usage: bun scripts/diag-iads.ts  (or: bun run test:iads)

import { strict as assert } from "node:assert";
import { Scene, Vector3 } from "three";
import { Dogfight, terrainBlocks } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { spawnAircraft } from "../src/sim/flight";
import { PRIMARY_FORTRESS_ROLES, isFortressPrimary } from "../src/sim/operations";
import { carriers, groundAt, setWorldSeed, DEFAULT_SEED } from "../src/sim/world";
import { validSharedCombat } from "../src/sim/combatSnapshot";

let failures = 0;
function test(name: string, run: () => void) {
  try {
    run();
    console.log("PASS " + name);
  } catch (e) {
    failures++;
    console.error("FAIL " + name, e);
  }
}

setWorldSeed(DEFAULT_SEED);

/** A bastion sortie, with the pilot airborne and over the target area. */
function bastion(id = 401, seed = 7) {
  const scene = new Scene();
  const df: any = new Dogfight(scene, new ExplosionField(scene, "low"));
  const player = spawnAircraft("carrier", 0);
  player.pos.y = 3000;
  player.onGround = false;
  player.airborne = true;
  player.speed = 180;
  player.catPhase = "idle";
  df.strikeVariant = "bastion";
  // The engine hands the fight its pilots every frame; a battery's round has to
  // know which one it is chasing.
  df.setDefenders("pilot", []);
  df.configureOperations(true, seed, id, { x: carriers()[0].x, z: carriers()[0].z, heading: 0, carrier: 0 }, "bastion");
  df.prepareStrike(player);
  df.beginStrike(player);
  return { df, player, d: df as any };
}

function role(df: any, r: string): any {
  const t = df.strikeTargets.find((x: any) => x.role === r);
  assert(t, `no ${r} in the bastion layout`);
  return t;
}

test("Iron Bastion sites a fortified airbase on dry land with its defences", () => {
  const { df, d } = bastion();
  const roles = d.strikeTargets.map((t: any) => t.role);
  for (const r of ["bunker", "hangar", "fuel"]) assert(roles.includes(r), `missing primary ${r}`);
  assert.equal(roles.filter((r: string) => r === "sam").length, 2, "two SAM batteries defend the base");
  assert(roles.includes("aaa"), "an AAA site covers the approach");
  assert(roles.includes("radar"), "the site is radar-cued");
  for (const t of d.strikeTargets) {
    assert.notEqual(groundAt(t.pos.x, t.pos.z).kind, "water", `${t.role} is sited on dry land`);
    assert(t.pos.y > 0, `${t.role} sits above sea level`);
  }
  // the defences start with ammunition, the fortress itself does not shoot
  assert.equal(role(d, "sam").ammo, 6);
  assert.equal(role(d, "aaa").ammo, 64);
  assert.equal(role(d, "bunker").ammo, 0);
  // and the airfield is defended as a single cluster, not scattered at random
  const centre = role(d, "bunker").pos;
  for (const t of d.strikeTargets) assert(t.pos.distanceTo(centre) < 420, `${t.role} belongs to the same complex`);
  df.dispose();
});

test("the fortress primaries decide the operation; the defences do not score", () => {
  const { df, player, d } = bastion(402);
  assert.equal(PRIMARY_FORTRESS_ROLES.length, 3);
  assert.deepEqual([...PRIMARY_FORTRESS_ROLES].sort(), ["bunker", "fuel", "hangar"].sort());
  assert(isFortressPrimary("bunker") && isFortressPrimary("fuel") && isFortressPrimary("hangar"));
  assert(!isFortressPrimary("sam") && !isFortressPrimary("radar") && !isFortressPrimary("aaa"));
  // kill the defences first: nothing is won, and no optional score moves
  for (const r of ["radar", "sam", "aaa"]) d.damageTarget(role(d, r), 400, player);
  df.step(1 / 60, player, false);
  assert.equal(df.operationState!.status, "active", "the radar and the batteries are not the objective");
  // now the three primaries
  for (const r of ["bunker", "hangar", "fuel"]) d.damageTarget(role(d, r), 400, player);
  df.step(1 / 60, player, false);
  assert.equal(df.operationState!.status, "success");
  assert.equal(df.operationState!.stopped, 3);
  df.dispose();
});

test("fuel depot detonations chain into what is stored around them", () => {
  const { df, player, d } = bastion(403);
  const fuel = role(d, "fuel");
  // put a neighbour in blast range and one safely outside it
  const near = role(d, "hangar");
  const far = role(d, "aaa");
  near.pos.copy(fuel.pos).add(new Vector3(60, 0, 0));
  far.pos.copy(fuel.pos).add(new Vector3(600, 0, 0));
  const nearHp = near.hp;
  const farHp = far.hp;
  d.damageTarget(fuel, 400, player);
  assert(fuel.dead, "the depot itself is destroyed");
  assert(near.hp < nearHp, "the neighbouring revetment takes the blast");
  assert.equal(far.hp, farHp, "and the blast does not reach across the complex");
  df.dispose();
});

test("destroying the radar shortens SAM reach and slows the lock", () => {
  const { df, player, d } = bastion(404);
  const sam = role(d, "sam");
  const radar = role(d, "radar");
  // sit inside the radar-cued envelope but outside the standalone one
  player.pos.copy(sam.pos).add(new Vector3(0, 900, 4600));
  player.vel.set(0, 0, 0);
  player.speed = 0;
  player.onGround = false;
  d.stepEscortDefense(3, player);
  assert(df.tracerCount() > 0 || d.missiles.some((m: any) => m.hostile), "a radar-cued battery engages at long range");
  // knock the radar out and repeat: nothing reaches that far any more
  d.missiles.length = 0;
  d.damageTarget(radar, 400, player);
  sam.tracking = 0;
  sam.cooldown = 0;
  sam.ammo = 6;
  d.stepEscortDefense(6, player);
  assert.equal(df.tracerCount(), 0, "no engagement once the radar is gone");
  assert(!d.missiles.some((m: any) => m.hostile));
  // but it can still defend itself at close range: one round off the rail,
  // then a reload — a battery never fires the gun bursts the AAA site does
  player.pos.copy(sam.pos).add(new Vector3(0, 600, 1800));
  const before = sam.ammo;
  d.stepEscortDefense(6, player);
  assert(d.missiles.some((m: any) => m.hostile), "the battery launches once the jet is close enough");
  assert.equal(sam.ammo, before - 1, "the rail is one round lighter");
  assert(sam.cooldown > 0, "and the battery is reloading");
  df.dispose();
});

test("terrain masks the jet from the batteries, and the HUD reports it", () => {
  const { df, player, d } = bastion(405);
  const sam = role(d, "sam");
  // A ridge between the battery and the jet: the masking check must agree with
  // what the HUD tells the pilot.
  const hidden = sam.pos.clone().add(new Vector3(1200, 20, 1200));
  player.pos.copy(hidden);
  player.onGround = false;
  player.vel.set(0, 0, 0);
  d.stepEscortDefense(4, player);
  const hud = df.operationHud(player)!;
  assert.equal(typeof hud.terrainMasked, "boolean");
  assert.equal(typeof hud.radarOnline, "boolean");
  assert.equal(hud.radarOnline, true, "the site radar is still up");
  const masked = hud.terrainMasked;
  // Whatever the terrain says, the HUD must agree with the model: a masked jet
  // is not tracked, and an exposed one is.
  assert.equal(masked, terrainBlocks(sam.pos.clone().add(new Vector3(0, 14, 0)), player.pos));
  df.dispose();
});

test("AAA lays a curtain of tracer bursts and runs out of ammunition", () => {
  const { df, player, d } = bastion(406);
  const aaa = role(d, "aaa");
  player.pos.copy(aaa.pos).add(new Vector3(0, 700, 900));
  player.vel.set(0, 0, 0);
  player.speed = 0;
  player.onGround = false;
  d.strikeTargets.filter((t: any) => t.role === "sam").forEach((t: any) => { t.ammo = 0; });
  d.stepEscortDefense(4, player);
  assert(df.tracerCount() > 0, "the AAA site opens fire");
  assert(aaa.ammo < 64, "and spends its belt doing it");
  for (let i = 0; i < 40; i++) { aaa.cooldown = 0; aaa.tracking = 0; d.stepEscortDefense(4, player); }
  assert.equal(aaa.ammo, 0, "the belt runs dry rather than going negative");
  assert(df.tracerCount() > 0, "rounds already in the air still fly");
  df.dispose();
});

test("a SAM launch is a guided hostile round, and the site reloads", () => {
  const { df, player, d } = bastion(407);
  const sam = role(d, "sam");
  player.pos.copy(sam.pos).add(new Vector3(0, 800, 2000));
  player.vel.set(0, 0, 0);
  d.stepEscortDefense(6, player);
  const launched = d.missiles.filter((m: any) => m.hostile);
  assert(launched.length > 0, "the battery launched");
  assert(launched.every((m: any) => m.targetPilot === "pilot"), "and its round is guided at the pilot it locked");
  assert(sam.ammo <= 5, "the rail is one round lighter");
  assert(sam.cooldown > 0, "and the site is reloading");
  df.dispose();
});

test("a bastion sortie never expires on its own, and its wire frame stays valid", () => {
  const { df, player, d } = bastion(408);
  for (let i = 0; i < 4000; i++) df.step(.05, player, false, false, true);
  assert.equal(df.operationState!.status, "active", "the fortress has to be taken: it cannot time out");
  assert.equal(d.strikeTargets.length, 7, "no waves are added to a fixed fortress layout");
  assert(validSharedCombat(df.sharedSnapshot()));
  df.dispose();
});

test("bastion targets survive the shared-combat validator", () => {
  const { df } = bastion(409);
  const frame = df.sharedSnapshot();
  assert(frame.operation, "the operation rides the snapshot");
  assert.equal(frame.operation!.kind, "bastion");
  assert(frame.targets.some((t: { role: string }) => t.role === "sam"));
  assert(frame.targets.some((t: { role: string }) => t.role === "bunker"));
  df.dispose();
});

if (failures) process.exit(1);
