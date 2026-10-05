// Air-combat layer for dogfight mode: AI bandits, guns, tracers, hull damage.
//
// Bandits are kinematic steered point masses, not the full flight model —
// cheap, stable, and plenty good enough to fight. Everything is deterministic:
// variation comes from sim time and bandit index, never Math.random, so a
// given engagement replays the same way the flight model does.
//
// The player keeps the real F-14 physics; only the hostiles are simplified.

import * as THREE from "three";
import { buildTomcat, type TomcatMesh } from "../render/geometry";
import { groundAt } from "./world";
import type { AircraftState } from "./flight";

// --- tuning ---
const HULL_MAX = 100;
const GUN_ROUNDS_PER_S = 10; // player M61 rate (playable, not 100 rps)
const GUN_DAMAGE = 12; // 3 hits kill a bandit
const BANDIT_HP = 34;
const BANDIT_DAMAGE = 9; // ~12 hits to put the player in the water
const MUZZLE_V = 1000; // m/s
const TRACER_LIFE = 1.6; // s
const HIT_RADIUS = 9; // m, airframe sphere
const PLAYER_SPREAD = 0.005; // rad
const BANDIT_SPREAD = 0.016; // rad
const BANDIT_TURN = 0.75; // rad/s — agile but beatable
const BANDIT_SPEED = { pursue: 235, close: 215, evade: 270, min: 140 };
const CEILING = 4300; // m — bandits stay in the fight box
const ARENA = 9500; // m — keep the fight over the islands
const EVADE_DIST = 900; // break when the player is inside this on the six
const ENGAGE_DIST = 1300; // open fire inside this
const AIM_CONE = 0.14; // rad — roughly on the nose before firing
const MAX_TRACERS = 80;
const MAX_FLASHES = 6;
const WAVE_RESPAWN = 6; // s between waves
const WAVE_MAX = 5;

interface Bandit {
  id: number;
  hp: number;
  pos: THREE.Vector3;
  quat: THREE.Quaternion; // forward = -Z
  bank: number; // smoothed roll for looks, rad
  speed: number; // m/s
  fireCd: number; // s until next shot / burst decision
  burst: number; // rounds left in the current burst
  evadeT: number; // s of jink remaining
  phase: number; // per-bandit jink phase
  mesh: TomcatMesh;
}

interface Tracer {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  hostile: boolean;
  mesh: THREE.Mesh;
}

interface Flash {
  pos: THREE.Vector3;
  life: number; // 1 -> 0
  mesh: THREE.Mesh;
}

export interface DogfightHud {
  active: boolean;
  hull: number;
  kills: number;
  wave: number;
  bandits: number;
  nearestKm: number;
  nearestBrgDeg: number;
  markers: Array<{ x: number; z: number }>;
}

// --- scratch vectors (step runs at 120 Hz; nothing allocates per call) ---
const FWD = new THREE.Vector3();
const TO_P = new THREE.Vector3();
const DESIRED = new THREE.Vector3();
const AIM = new THREE.Vector3();
const AHEAD = new THREE.Vector3();
const AXIS = new THREE.Vector3();
const TMP = new THREE.Vector3();
const REF = new THREE.Vector3();
const DIR = new THREE.Vector3();
const TR_Z = new THREE.Vector3(0, 0, 1);
const MAT4 = new THREE.Matrix4();
const ROLL_Q = new THREE.Quaternion();
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const ORIGIN = new THREE.Vector3();

/** Deterministic hash in 0..1 — the sim's stand-in for Math.random. */
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export class Dogfight {
  active = false;
  private hull = HULL_MAX;
  private kills = 0;
  private wave = 0;
  private nextId = 0;
  private bandits: Bandit[] = [];
  private tracers: Tracer[] = [];
  private flashPool: Flash[] = [];
  private gunCd = 0;
  private waveTimer = 0;
  private root = new THREE.Group();
  private tracerPool: THREE.Mesh[] = [];
  private matPlayer: THREE.MeshBasicMaterial;
  private matBandit: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    // tracers: short additive slugs, colour-coded by side
    const geom = new THREE.BoxGeometry(0.16, 0.16, 4.6);
    this.matPlayer = new THREE.MeshBasicMaterial({
      color: 0xffe28a, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.matBandit = new THREE.MeshBasicMaterial({
      color: 0xff5040, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 0; i < MAX_TRACERS; i++) {
      const m = new THREE.Mesh(geom, this.matPlayer);
      m.visible = false;
      m.frustumCulled = false;
      this.root.add(m);
      this.tracerPool.push(m);
    }
    // kill flashes: expanding additive spheres
    const flashGeom = new THREE.SphereGeometry(1, 12, 8);
    for (let i = 0; i < MAX_FLASHES; i++) {
      const m = new THREE.Mesh(
        flashGeom,
        new THREE.MeshBasicMaterial({
          color: 0xffa040, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }),
      );
      m.visible = false;
      this.root.add(m);
      this.flashPool.push({ pos: new THREE.Vector3(), life: 0, mesh: m });
    }
    scene.add(this.root);
  }

  /** Start (or restart) the fight around the player. */
  begin(player: AircraftState): void {
    this.clear();
    this.active = true;
    this.hull = HULL_MAX;
    this.kills = 0;
    this.wave = 1;
    this.waveTimer = 0;
    this.spawnWave(player);
    this.banner(player, `WAVE 1 — ${this.bandits.length} BANDITS INBOUND — WEAPONS FREE`);
  }

  /** Stop fighting and clear everything (menu / cruise mode). */
  clear(): void {
    this.active = false;
    this.clearBandits();
    for (const t of this.tracers) {
      t.mesh.visible = false;
      this.tracerPool.push(t.mesh);
    }
    this.tracers = [];
    for (const f of this.flashPool) {
      f.life = 0;
      f.mesh.visible = false;
    }
  }

  dispose(): void {
    this.root.removeFromParent();
    this.root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | undefined;
      mat?.dispose();
    });
    this.bandits = [];
    this.tracers = [];
    this.flashPool = [];
    this.tracerPool = [];
  }

  /**
   * Advance the fight one fixed sim step.
   * @param fireHeld true while the player holds the fire key
   * @returns true if the player was shot down this step
   */
  step(dt: number, player: AircraftState, fireHeld: boolean): boolean {
    if (!this.active || player.result) return false;
    this.playerGuns(dt, player, fireHeld);
    for (const b of this.bandits) {
      this.stepBandit(b, dt, player);
      this.banditGuns(b, dt, player);
    }
    this.stepTracers(dt, player);
    this.stepFlashes(dt);
    this.stepWaves(dt, player);
    return false;
  }

  /** HUD snapshot of the fight, measured from the player. */
  hud(player: AircraftState): DogfightHud {
    let nearest: Bandit | null = null;
    let nearestD = Infinity;
    for (const b of this.bandits) {
      const d = b.pos.distanceTo(player.pos);
      if (d < nearestD) {
        nearestD = d;
        nearest = b;
      }
    }
    const dx = (nearest?.pos.x ?? 0) - player.pos.x;
    const dz = (nearest?.pos.z ?? 0) - player.pos.z;
    return {
      active: this.active,
      hull: Math.max(0, Math.round(this.hull)),
      kills: this.kills,
      wave: this.wave,
      bandits: this.bandits.length,
      nearestKm: nearest ? nearestD / 1000 : 0,
      nearestBrgDeg: nearest ? (Math.atan2(dx, -dz) * 180) / Math.PI : 0,
      markers: this.bandits.map((b) => ({ x: b.pos.x, z: b.pos.z })),
    };
  }

  /**
   * Live bandit positions + velocities, for radar/aim-assist features and
   * headless tests. Allocates; not for per-frame hot loops.
   */
  targets(): Array<{ pos: THREE.Vector3; vel: THREE.Vector3 }> {
    const out: Array<{ pos: THREE.Vector3; vel: THREE.Vector3 }> = [];
    for (const b of this.bandits) {
      const vel = new THREE.Vector3(0, 0, -1).applyQuaternion(b.quat).multiplyScalar(b.speed);
      out.push({ pos: b.pos.clone(), vel });
    }
    return out;
  }

  // -------------------------------------------------------------------------

  private clearBandits(): void {
    for (const b of this.bandits) {
      b.mesh.group.removeFromParent();
      b.mesh.group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | undefined;
        mat?.dispose();
      });
    }
    this.bandits = [];
  }

  private spawnWave(player: AircraftState): void {
    const count = Math.min(1 + this.wave, WAVE_MAX);
    const hdg = this.playerHeading(player);
    for (let i = 0; i < count; i++) {
      const id = this.nextId++;
      // spread spawn bearings around the player so they arrive from a front
      const ang = hdg + (hash(id * 3.7 + this.wave * 13.1) * 2 - 1) * 2.4;
      const dist = 5200 + hash(id * 7.3 + 1.1) * 2200;
      const x = player.pos.x + Math.sin(ang) * dist;
      const z = player.pos.z - Math.cos(ang) * dist;
      const y = Math.max(
        player.pos.y + 300 + hash(id * 5.9 + 2.7) * 700,
        groundAt(x, z).y + 450,
        700,
      );
      const mesh = buildTomcat("bandit");
      mesh.gear.visible = false;
      mesh.afterburner.visible = false;
      mesh.wings[0].rotation.y = -1.0; // swept for the merge
      mesh.wings[1].rotation.y = 1.0;
      mesh.group.position.set(x, y, z);
      this.root.add(mesh.group);
      const b: Bandit = {
        id,
        hp: BANDIT_HP,
        pos: new THREE.Vector3(x, y, z),
        quat: new THREE.Quaternion(),
        bank: 0,
        speed: BANDIT_SPEED.pursue,
        fireCd: 2 + hash(id) * 2,
        burst: 0,
        evadeT: 0,
        phase: hash(id * 11.3) * Math.PI * 2,
        mesh,
      };
      // face the player-ish on arrival
      this.aimQuat(b, TMP.copy(player.pos).sub(b.pos).normalize(), 0);
      this.bandits.push(b);
    }
  }

  private playerHeading(player: AircraftState): number {
    FWD.set(0, 0, -1).applyQuaternion(player.quat);
    return Math.atan2(FWD.x, -FWD.z);
  }

  /** Point the bandit's forward (-Z) at `dir` with the given bank. */
  private aimQuat(b: Bandit, dir: THREE.Vector3, bank: number): void {
    MAT4.lookAt(ORIGIN, dir, WORLD_UP);
    b.quat.setFromRotationMatrix(MAT4);
    ROLL_Q.setFromAxisAngle(Z_AXIS, bank);
    b.quat.multiply(ROLL_Q);
  }

  private stepBandit(b: Bandit, dt: number, player: AircraftState): void {
    FWD.set(0, 0, -1).applyQuaternion(b.quat);
    TO_P.copy(player.pos).sub(b.pos);
    const dist = TO_P.length();

    // --- pick a mode: engage, or break away when the player is on the six ---
    const onSix = FWD.dot(TO_P) < -0.35 * dist; // player behind and close
    if (b.evadeT > 0) b.evadeT -= dt;
    else if (onSix && dist < EVADE_DIST) b.evadeT = 4 + hash(b.id + player.time) * 2;

    if (b.evadeT > 0) {
      // jink: weave around the current heading with a climb bias
      TMP.set(1, 0, 0).applyQuaternion(b.quat); // right wing
      DESIRED.copy(FWD)
        .addScaledVector(TMP, Math.sin(player.time * 1.9 + b.phase) * 0.95)
        .addScaledVector(WORLD_UP, Math.cos(player.time * 1.4 + b.phase) * 0.45 + 0.2);
      DESIRED.normalize();
      b.speed += (BANDIT_SPEED.evade - b.speed) * (1 - Math.exp(-dt / 1.2));
    } else {
      // lead pursuit: aim ahead of the player so guns line up naturally
      AIM.copy(player.pos).addScaledVector(player.vel, Math.min(dist / MUZZLE_V, 1.2) * 0.8);
      DESIRED.copy(AIM).sub(b.pos).normalize();
      b.speed += ((dist > 3000 ? BANDIT_SPEED.pursue : BANDIT_SPEED.close) - b.speed) *
        (1 - Math.exp(-dt / 1.5));
    }

    // --- safety: never hunt the terrain, never leave the box ---
    AHEAD.copy(b.pos).addScaledVector(DESIRED, 1200);
    const floor = groundAt(AHEAD.x, AHEAD.z).y + 260;
    const needClimb = (floor - b.pos.y) / 1200;
    if (needClimb > DESIRED.y) {
      DESIRED.y = needClimb;
      DESIRED.normalize();
    }
    if (b.pos.y < floor) DESIRED.y = Math.max(DESIRED.y, 0.5);
    if (b.pos.y > CEILING) DESIRED.y = Math.min(DESIRED.y, -0.1);
    if (Math.abs(b.pos.x) > ARENA || Math.abs(b.pos.z) > ARENA) {
      DESIRED.addScaledVector(TMP.copy(b.pos).multiplyScalar(-1).normalize(), 0.8).normalize();
    }

    // --- steer: rotate forward toward desired at a capped rate, bank into it
    const angle = FWD.angleTo(DESIRED);
    let turnSign = 0;
    if (angle > 1e-4) {
      AXIS.crossVectors(FWD, DESIRED);
      if (AXIS.lengthSq() < 1e-8) AXIS.copy(WORLD_UP);
      else AXIS.normalize();
      turnSign = Math.sign(AXIS.y);
      FWD.applyAxisAngle(AXIS, Math.min(angle, BANDIT_TURN * dt));
    }
    const bankTarget = angle > 0.05 ? turnSign * Math.min(angle * 1.6, 1.15) : 0;
    b.bank += (bankTarget - b.bank) * (1 - Math.exp(-dt * 2.5));
    this.aimQuat(b, FWD, b.bank);

    // --- integrate + publish to the mesh ---
    b.pos.addScaledVector(FWD, Math.max(b.speed, BANDIT_SPEED.min) * dt);
    b.mesh.group.position.copy(b.pos);
    b.mesh.group.quaternion.copy(b.quat);
  }

  private banditGuns(b: Bandit, dt: number, player: AircraftState): void {
    b.fireCd -= dt;
    if (b.fireCd > 0) return;
    FWD.set(0, 0, -1).applyQuaternion(b.quat);
    TO_P.copy(player.pos).sub(b.pos);
    const dist = TO_P.length();
    const offBore = FWD.angleTo(TO_P);
    if (dist > ENGAGE_DIST || offBore > AIM_CONE || dist < 60) return;

    if (b.burst <= 0) {
      b.burst = 6 + Math.floor(hash(b.id * 17.7 + player.time) * 4);
      b.fireCd = 1.4 + hash(b.id * 3.1 + player.time * 0.7) * 1.4;
      return;
    }
    b.burst--;
    b.fireCd = 0.09; // ~11 rps inside the burst
    // lead the player, then scatter
    AIM.copy(player.pos).addScaledVector(player.vel, dist / MUZZLE_V);
    TMP.copy(AIM).sub(b.pos).normalize();
    this.scatter(TMP, BANDIT_SPREAD, player.time * 13.7 + b.id * 3.3);
    this.spawnTracer(b.pos, TMP, true, 0);
  }

  private playerGuns(dt: number, player: AircraftState, fireHeld: boolean): void {
    if (!fireHeld) {
      this.gunCd = 0;
      return;
    }
    this.gunCd -= dt;
    while (this.gunCd <= 0) {
      this.gunCd += 1 / GUN_ROUNDS_PER_S;
      FWD.set(0, 0, -1).applyQuaternion(player.quat);
      TMP.copy(player.pos).addScaledVector(FWD, 8);
      this.scatter(FWD, PLAYER_SPREAD, player.time * 31.7 + this.gunCd * 97);
      this.spawnTracer(TMP, FWD, false, player.vel.length());
    }
  }

  private spawnTracer(origin: THREE.Vector3, dir: THREE.Vector3, hostile: boolean, inherit: number): void {
    if (this.tracers.length >= MAX_TRACERS || this.tracerPool.length === 0) return;
    const mesh = this.tracerPool.pop()!;
    mesh.material = hostile ? this.matBandit : this.matPlayer;
    mesh.visible = true;
    mesh.position.copy(origin);
    this.tracers.push({
      pos: origin.clone(),
      vel: dir.clone().multiplyScalar(MUZZLE_V + inherit),
      life: TRACER_LIFE,
      hostile,
      mesh,
    });
  }

  private stepTracers(dt: number, player: AircraftState): void {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      const prev = TMP.copy(t.pos);
      t.pos.addScaledVector(t.vel, dt);
      t.mesh.position.copy(t.pos);
      t.mesh.quaternion.setFromUnitVectors(TR_Z, DIR.copy(t.vel).normalize());

      let dead = t.life <= 0;
      if (!dead) {
        if (t.hostile) {
          if (segSphere(prev, t.pos, player.pos, HIT_RADIUS)) {
            this.damagePlayer(player, BANDIT_DAMAGE);
            dead = true;
          }
        } else {
          for (const b of this.bandits) {
            if (segSphere(prev, t.pos, b.pos, HIT_RADIUS)) {
              b.hp -= GUN_DAMAGE;
              dead = true;
              if (b.hp <= 0) this.killBandit(b, player);
              break;
            }
          }
        }
      }
      if (dead) {
        t.mesh.visible = false;
        this.tracerPool.push(t.mesh);
        this.tracers.splice(i, 1);
      }
    }
  }

  private killBandit(b: Bandit, player: AircraftState): void {
    const idx = this.bandits.indexOf(b);
    if (idx >= 0) this.bandits.splice(idx, 1);
    this.kills++;
    this.flash(b.pos);
    // remove the wreck: pulling it from the scene and releasing its geometry
    // keeps a long fight from accumulating hidden jets
    b.mesh.group.removeFromParent();
    b.mesh.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | undefined;
      mat?.dispose();
    });
    const left = this.bandits.length;
    this.banner(
      player,
      left > 0 ? `SPLASH ONE — ${left} BANDIT${left > 1 ? "S" : ""} LEFT` : "SPLASH ONE — FIGHT'S CLEAR",
    );
  }

  private damagePlayer(player: AircraftState, dmg: number): void {
    const before = this.hull;
    this.hull -= dmg;
    if (before > 60 && this.hull <= 60) this.banner(player, "TAKING HITS — HULL 60%");
    if (before > 30 && this.hull <= 30) this.banner(player, "HULL CRITICAL — DISENGAGE");
    if (this.hull <= 0 && !player.result) {
      player.result = {
        kind: "crash",
        title: "SHOT DOWN",
        detail: `Downed by a bandit over the islands. ${this.kills} kill${this.kills === 1 ? "" : "s"}.`,
      };
    }
  }

  private stepWaves(dt: number, player: AircraftState): void {
    if (this.bandits.length > 0) return;
    if (this.waveTimer <= 0) {
      this.waveTimer = WAVE_RESPAWN;
      if (this.wave > 0) this.banner(player, `WAVE ${this.wave} CLEARED — ${this.kills} KILLS`);
      return;
    }
    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.wave++;
      this.spawnWave(player);
      this.banner(player, `WAVE ${this.wave} — ${this.bandits.length} BANDITS INBOUND`);
    }
  }

  private flash(at: THREE.Vector3): void {
    const f = this.flashPool.find((x) => x.life <= 0);
    if (!f) return;
    f.pos.copy(at);
    f.life = 1;
    f.mesh.visible = true;
  }

  private stepFlashes(dt: number): void {
    for (const f of this.flashPool) {
      if (f.life <= 0) continue;
      f.life -= dt * 1.8;
      if (f.life <= 0) {
        f.mesh.visible = false;
        continue;
      }
      const s = 3 + (1 - f.life) * 26;
      f.mesh.position.copy(f.pos);
      f.mesh.scale.setScalar(s);
      (f.mesh.material as THREE.MeshBasicMaterial).opacity = f.life * 0.9;
    }
  }

  /** Rotate `dir` by a deterministic cone of `spread` radians. */
  private scatter(dir: THREE.Vector3, spread: number, seed: number): void {
    const a = hash(seed) * Math.PI * 2;
    const r = spread * (hash(seed + 0.5) * 2 - 1);
    REF.set(Math.cos(a), Math.sin(a), 0);
    if (Math.abs(dir.z) > 0.95) REF.set(1, 0, 0);
    AXIS.crossVectors(dir, REF).normalize();
    dir.applyAxisAngle(AXIS, r);
  }

  private banner(player: AircraftState, text: string): void {
    player.banner = { text, until: player.time + 3 };
  }
}

/** True when the segment a->b passes within `r` of point p. */
function segSphere(a: THREE.Vector3, b: THREE.Vector3, p: THREE.Vector3, r: number): boolean {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
  const apx = p.x - a.x, apy = p.y - a.y, apz = p.z - a.z;
  const ab2 = abx * abx + aby * aby + abz * abz;
  const t = ab2 > 1e-9 ? Math.max(0, Math.min(1, (apx * abx + apy * aby + apz * abz) / ab2)) : 0;
  const dx = apx - abx * t, dy = apy - aby * t, dz = apz - abz * t;
  return dx * dx + dy * dy + dz * dz <= r * r;
}
