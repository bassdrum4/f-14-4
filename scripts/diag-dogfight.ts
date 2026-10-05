// Headless dogfight verification: AI bandits close on the player, engage,
// take damage from aimed fire, and waves respawn. Also exercises clear().
// Usage: bun scripts/diag-dogfight.ts

import { Matrix4, Scene, Vector3 } from "three";
import { spawnAircraft, type AircraftState } from "../src/sim/flight";
import { Dogfight } from "../src/sim/dogfight";

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

/** A clean player state parked in mid-air, nose north, 200 m/s. */
function airPlayer(): AircraftState {
  const st = spawnAircraft("airfield", 0);
  st.pos.set(0, 1500, 0);
  st.vel.set(0, 0, -200);
  st.gearDown = false;
  st.gearT = 0;
  return st;
}

/** Point the player's nose at a world point and fly at it. */
function face(st: AircraftState, target: Vector3): void {
  DIR.copy(target).sub(st.pos).normalize();
  MAT4.lookAt(ORIGIN, DIR, UP);
  st.quat.setFromRotationMatrix(MAT4);
  st.vel.copy(DIR).multiplyScalar(200);
}

const scene = new Scene();
const df = new Dogfight(scene);
let player = airPlayer();

// --- 1. begin: wave 1 spawns and pursues ---
df.begin(player);
check("wave 1 spawns bandits", df.hud(player).wave === 1 && df.hud(player).bandits === 2,
  JSON.stringify(df.hud(player)));
const startDist = df.hud(player).nearestKm;

// --- 2. passive player: bandits close in and open fire ---
let minDist = Infinity;
let hullStart = df.hud(player).hull;
let outOfArena = 0;
for (let i = 0; i < Math.round(90 / DT); i++) {
  player.time += DT;
  df.step(DT, player, false);
  const h = df.hud(player);
  minDist = Math.min(minDist, h.nearestKm);
  for (const m of h.markers) {
    if (Math.abs(m.x) > 9600 || Math.abs(m.z) > 9600) outOfArena++;
  }
}
const after = df.hud(player);
check("bandits closed on the player", after.nearestKm < startDist * 0.4,
  `start ${startDist.toFixed(2)}km -> min ${minDist.toFixed(2)}km`);
check("bandits engaged: player hull damaged", after.hull < hullStart,
  `hull ${hullStart} -> ${after.hull}`);
check("bandits still alive and fighting", after.bandits > 0, String(after.bandits));
check("bandits stay inside the arena", outOfArena === 0, `${outOfArena} samples out`);

// --- 3. aimed player scores kills ---
player = airPlayer();
df.begin(player);
let kills = 0;
let waveKillsDone = false;
let waveAdvanced = false;
for (let i = 0; i < Math.round(180 / DT) && !waveAdvanced; i++) {
  const h = df.hud(player);
  if (h.bandits > 0) {
    // lead the nearest bandit: aim where it will be when the rounds arrive
    const targets = df.targets();
    let best = targets[0];
    let bestD = Infinity;
    for (const t of targets) {
      const d = t.pos.distanceTo(player.pos);
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    if (best) {
      const tof = bestD / (1000 + player.vel.length());
      face(player, best.pos.clone().addScaledVector(best.vel, tof));
    }
  }
  player.time += DT;
  player.pos.addScaledVector(player.vel, DT);
  df.step(DT, player, true);
  kills = df.hud(player).kills;
  if (kills >= 1) waveKillsDone = true;
  if (waveKillsDone && df.hud(player).wave >= 2) waveAdvanced = true;
}
check("aimed fire splashes a bandit", waveKillsDone, `kills=${kills}`);
check("clearing wave 1 spawns wave 2", waveAdvanced, `wave=${df.hud(player).wave}`);

// --- 4. clear + dispose are clean ---
df.clear();
check("clear empties the fight", df.hud(player).bandits === 0 && !df.hud(player).active);
df.dispose();
console.log(failures === 0 ? "\nALL DOGFIGHT CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
