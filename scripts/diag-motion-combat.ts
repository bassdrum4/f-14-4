/** Real gunnery and missile code using independent gameplay/history coordinates. */
import assert from "node:assert/strict";
import { Scene, Vector3 } from "three";
import { Dogfight } from "../src/sim/dogfight";
import { ExplosionField } from "../src/render/effects";
import { spawnAircraft } from "../src/sim/flight";

function engagement(weapon: "gun" | "missile", historical: boolean) {
  const scene = new Scene(),
    df = new Dogfight(scene, new ExplosionField(scene, "low"));
  const player = spawnAircraft("carrier", 0);
  player.pos.set(0, 2000, 0);
  player.vel.set(0, 0, -200);
  player.quat.identity();
  player.onGround = false;
  player.airborne = true;
  player.gearT = 0;
  df.beginVersus(player);
  // Current network position is to the side of the gun bore. Only the bounded
  // history coordinate is on it. Missiles must still choose the current position.
  const pos = new Vector3(100, 2000, -400),
    hitPos = new Vector3(0, 2000, -400);
  df.setOpponents([
    {
      id: "b",
      life: 2,
      pos,
      vel: new Vector3(),
      hitPos: historical ? hitPos : pos,
    },
  ]);
  if (weapon === "missile") df.requestMissile(player);
  let hits = 0;
  for (let i = 0; i < 1200; i++) {
    player.time += 1 / 120;
    df.step(1 / 120, player, weapon === "gun");
    hits += df
      .takePlayerHits()
      .filter(
        (h) => h.weapon === weapon && h.id === "b" && h.life === 2,
      ).length;
  }
  df.dispose();
  return hits;
}
assert(engagement("gun", true) > 0, "real gun collision uses received history");
assert(
  engagement("missile", true) > 0,
  "real missile seeker and proximity damage use current network target",
);
console.log("ALL MOTION COMBAT CHECKS PASSED");
