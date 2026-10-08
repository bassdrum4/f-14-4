// Ordnance effects: big explosions on any surface, water splashes, debris and
// smoke, plus the small puffs used for gun rounds and guided-bomb trails.
//
// Everything is pooled and preallocated: a bomb run releases sixteen weapons and
// each impact spawns a fireball, a shock wave, smoke, debris and a brief light,
// so allocating per hit would stall the frame. Pools that run dry simply drop
// particles — the biggest salvo degrades gracefully instead of hitching.
//
// Variation is deterministic (an internal LCG, never Math.random) so a replay
// looks the same twice, matching the sim's no-Math.random rule.

import * as THREE from "three";
import { clamp } from "../sim/noise";
import type { Quality } from "../settings";

/** What the blast landed on: land/runway/deck, open air, or the sea. */
export type BlastKind = "ground" | "air" | "water";

interface Particle {
  mesh: THREE.Mesh;
  life: number; // seconds left; <= 0 = free
  ttl: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  size0: number;
  size1: number;
  opacity: number;
  gravity: number; // m/s^2 down
  rise: number; // m/s^2 up (smoke column lift)
  drag: number; // fraction of velocity shed per second
  spin: number; // rad/s tumble (debris)
  hot: THREE.Color;
  cool: THREE.Color;
}

const SPHERE = 0;
const BOX = 1;
const RING = 2;
const COLUMN = 3;

export class ExplosionField {
  private root = new THREE.Group();
  private light: THREE.PointLight;
  private fire: Particle[] = [];
  private smoke: Particle[] = [];
  private spray: Particle[] = [];
  private debris: Particle[] = [];
  private wave: Particle[] = [];
  private foam: Particle[] = [];
  private column: Particle[] = [];
  private geoms: THREE.BufferGeometry[] = [];
  private seed = 12345;
  private lightDecay = 0;
  private lightPeak = 0;
  private blasts = 0;
  private last: BlastKind | null = null;
  private quality: Quality;

  constructor(scene: THREE.Scene, quality: Quality = "medium") {
    this.quality = quality;
    const sphere = new THREE.SphereGeometry(0.5, 12, 9);
    const box = new THREE.BoxGeometry(1, 1, 1);
    const ring = new THREE.RingGeometry(0.62, 1, 30);
    const column = new THREE.CylinderGeometry(0.5, 0.62, 1, 12, 1, false);
    this.geoms.push(sphere, box, ring, column);
    const geoms = [sphere, box, ring, column];

    // Sized for a full bomb load landing together: the Intruder can put
    // sixteen weapons on one pass, and a pool that runs dry just drops
    // particles, which would read as a salvo of half-explosions.
    this.fire = this.makePool(geoms, SPHERE, THREE.AdditiveBlending, 96);
    this.smoke = this.makePool(geoms, SPHERE, THREE.NormalBlending, 160);
    this.spray = this.makePool(geoms, SPHERE, THREE.AdditiveBlending, 128);
    this.debris = this.makePool(geoms, BOX, THREE.NormalBlending, 96);
    this.wave = this.makePool(geoms, RING, THREE.AdditiveBlending, 16);
    this.foam = this.makePool(geoms, RING, THREE.NormalBlending, 16);
    this.column = this.makePool(geoms, COLUMN, THREE.NormalBlending, 12);

    // One moving light for the flash: a bomb going off at dusk should light the
    // ground under it, but a light per impact would blow the light budget.
    this.light = new THREE.PointLight(0xffb060, 0, 4000, 2);
    this.light.castShadow = false;
    this.root.add(this.light);
    scene.add(this.root);
  }

  private makePool(
    geoms: THREE.BufferGeometry[],
    shape: number,
    blending: THREE.Blending,
    count: number,
  ): Particle[] {
    const out: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending,
        side: shape === RING ? THREE.DoubleSide : THREE.FrontSide,
        toneMapped: blending === THREE.NormalBlending ? true : false,
      });
      const mesh = new THREE.Mesh(geoms[shape], mat);
      mesh.visible = false;
      mesh.frustumCulled = false;
      if (shape === RING) mesh.rotation.x = -Math.PI / 2;
      this.root.add(mesh);
      out.push({
        mesh,
        life: 0,
        ttl: 1,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        size0: 1,
        size1: 1,
        opacity: 1,
        gravity: 0,
        rise: 0,
        drag: 0,
        spin: 0,
        hot: new THREE.Color(),
        cool: new THREE.Color(),
      });
    }
    return out;
  }

  setQuality(q: Quality): void {
    this.quality = q;
  }

  /** Blasts spawned since construction (diagnostics/tests). */
  get blastCount(): number {
    return this.blasts;
  }

  /** Surface kind of the most recent blast (diagnostics/tests). */
  get lastBlastKind(): BlastKind | null {
    return this.last;
  }

  /** Particles alive right now — a running measure of how busy the scene is. */
  get liveParticles(): number {
    let n = 0;
    for (const pool of [this.fire, this.smoke, this.spray, this.debris, this.wave, this.foam, this.column]) {
      for (const p of pool) if (p.life > 0) n++;
    }
    return n;
  }

  /**
   * A full explosion on land (or a deck/runway), a fireball in the air, or a
   * water column in the sea. `scale` 1 = a 500 kg bomb; a ditching aircraft is
   * worth ~1.6.
   */
  spawn(at: THREE.Vector3, kind: BlastKind, scale = 1): void {
    this.blasts++;
    this.last = kind;
    if (kind === "water") {
      this.splash(at, scale);
      return;
    }
    this.fireball(at, kind === "air", scale);
  }

  /**
   * A machine-gun round striking the ground or the sea. Deliberately a little
   * oversized: the splash is what tells the pilot where the burst is landing,
   * and a dust speck at combat range told them nothing.
   */
  spawnSpark(at: THREE.Vector3, water: boolean): void {
    if (water) {
      for (let i = 0; i < 5; i++) {
        const dir = this.randomDir(0.7);
        this.emit(this.spray, at, dir.multiplyScalar(11 + this.rnd() * 12), {
          size0: 1.1, size1: 3.4, ttl: 0.55, opacity: 0.8, gravity: 9.81, drag: 0.4,
          hot: 0xeaf6ff, cool: 0x9fd6ff,
        });
      }
      this.emit(this.foam, at, ZERO, {
        size0: 3, size1: 18, ttl: 0.8, opacity: 0.75, hot: 0xf2faff, cool: 0xdfeef8,
      });
      return;
    }
    this.emit(this.fire, at, UP.clone().multiplyScalar(3), {
      size0: 1.9, size1: 6.5, ttl: 0.3, opacity: 0.95, hot: 0xfff0c0, cool: 0xff5a10,
    });
    for (let i = 0; i < 4; i++) {
      this.emit(this.debris, at, this.randomDir(0.9).multiplyScalar(7 + this.rnd() * 16), {
        size0: 0.35, size1: 0.35, ttl: 0.6 + this.rnd() * 0.4, opacity: 0.95,
        gravity: 9.81, drag: 0.2, spin: 6, hot: 0x6b6357, cool: 0x4a453d,
      });
    }
    this.emit(this.smoke, at, UP.clone().multiplyScalar(4), {
      size0: 2.2, size1: 9, ttl: 1.1, opacity: 0.55, gravity: -1.2, drag: 0.7,
      hot: 0x8d8d88, cool: 0x6a6a66,
    });
  }

  /**
   * A wisp behind something falling fast (guided bombs). `ttl` lengthens the
   * streak: a long glide needs a trail that outlives the puff rate.
   */
  trail(at: THREE.Vector3, scale = 1, ttl = 1.5): void {
    this.emit(this.smoke, at, ZERO, {
      size0: 1.2 * scale, size1: 5 * scale, ttl, opacity: 0.42, rise: 1.4, drag: 0.4,
      hot: 0x6d6d68, cool: 0x8f8f8a,
    });
  }

  /**
   * A jet coming apart: the airframe breaks into tumbling grey pieces that
   * arc away from the break-up, with fire between them. Called at the fatal
   * break-up so the death screen shows the plane actually blowing apart, not
   * just a fireball sprite.
   */
  spawnBreakup(at: THREE.Vector3, quality: Quality = this.quality): void {
    // fire puffs between the pieces
    const puffs = quality === "low" ? 3 : 6;
    for (let i = 0; i < puffs; i++) {
      const dir = this.randomDir(0.6);
      this.emit(this.fire, at, dir.multiplyScalar(9 + this.rnd() * 12), {
        size0: 6, size1: 17, ttl: 0.5 + this.rnd() * 0.4,
        opacity: 0.95, rise: 4, drag: 1.1, hot: 0xfff3c4, cool: 0xff4a08,
      });
    }
    // the airframe itself: big flat grey pieces — wings, tail, fuselage
    // sections — flung outward and tumbling, each burning at the torn edge
    const pieces = quality === "low" ? 5 : 9;
    for (let i = 0; i < pieces; i++) {
      const dir = this.randomDir(0.75);
      this.emit(this.debris, at, dir.multiplyScalar(14 + this.rnd() * 22), {
        size0: 1.6 + this.rnd() * 2.6,
        size1: 1.6 + this.rnd() * 2.6,
        ttl: 2.2 + this.rnd() * 1.6,
        opacity: 0.95,
        gravity: 9.81,
        drag: 0.1,
        spin: 4 + this.rnd() * 9,
        hot: 0x9aa0a6,
        cool: 0x5b6066,
      });
    }
    // small burning shards
    const shards = quality === "low" ? 5 : 10;
    for (let i = 0; i < shards; i++) {
      const dir = this.randomDir(0.9);
      this.emit(this.debris, at, dir.multiplyScalar(22 + this.rnd() * 30), {
        size0: 0.5 + this.rnd() * 0.8,
        size1: 0.5 + this.rnd() * 0.8,
        ttl: 1.6 + this.rnd() * 1.2,
        opacity: 0.9,
        gravity: 9.81,
        drag: 0.12,
        spin: 7 + this.rnd() * 12,
        hot: 0xffb060,
        cool: 0x2a2224,
      });
    }
    // a long smoke column so the fall keeps reading
    this.emit(this.smoke, at, UP.clone().multiplyScalar(5), {
      size0: 9, size1: 34, ttl: 3.4, opacity: 0.75, rise: 7, drag: 0.4,
      hot: 0x2c2724, cool: 0x7d7a74,
    });
    this.flashLight(at, 26000);
  }

  // -------------------------------------------------------------------------

  private fireball(at: THREE.Vector3, air: boolean, scale: number): void {
    const base = (air ? 15 : 17) * scale;
    // core + fireball puffs
    this.emit(this.fire, at, UP.clone().multiplyScalar(2 * scale), {
      size0: base * 0.35, size1: base * 1.1, ttl: 0.22 + this.rnd() * 0.12,
      opacity: 1, rise: 6, drag: 1.4, hot: 0xffffff, cool: 0xffd28a,
    });
    const puffs = this.quality === "low" ? 3 : 6;
    for (let i = 0; i < puffs; i++) {
      const dir = this.randomDir(0.55);
      this.emit(this.fire, at, dir.multiplyScalar(7 * scale + this.rnd() * 9 * scale), {
        size0: base * (0.3 + this.rnd() * 0.25),
        size1: base * (0.95 + this.rnd() * 0.55),
        ttl: 0.45 + this.rnd() * 0.5,
        opacity: 0.95,
        rise: 5 + this.rnd() * 5,
        drag: 1.1,
        hot: 0xfff3c4,
        cool: 0xff4a08,
      });
    }
    // smoke column
    const smokeN = this.quality === "low" ? 4 : air ? 7 : 11;
    for (let i = 0; i < smokeN; i++) {
      const dir = this.randomDir(0.8);
      this.emit(this.smoke, at, dir.multiplyScalar(4 * scale + this.rnd() * 7 * scale), {
        size0: base * (0.35 + this.rnd() * 0.25),
        size1: base * (1.1 + this.rnd() * 0.8),
        ttl: 1.5 + this.rnd() * 1.8,
        opacity: 0.8,
        rise: 6 + this.rnd() * 7,
        drag: 0.45,
        hot: 0x2c2724,
        cool: 0x7d7a74,
      });
    }
    // shock wave on the surface (a bomb in the air has no ground ring)
    if (!air) {
      this.emit(this.wave, at, ZERO, {
        size0: base * 0.4, size1: base * 2.6, ttl: 0.55, opacity: 0.75,
        hot: 0xffe0a8, cool: 0xff7a30,
      });
      this.emit(this.wave, at, ZERO, {
        size0: base * 0.2, size1: base * 1.7, ttl: 0.8, opacity: 0.4,
        hot: 0xfff4d2, cool: 0xffb060,
      });
      // dirt, flung
      const debrisN = this.quality === "low" ? 3 : 13;
      for (let i = 0; i < debrisN; i++) {
        const dir = this.randomDir(0.95);
        this.emit(this.debris, at, dir.multiplyScalar(12 * scale + this.rnd() * 26 * scale), {
          size0: (0.6 + this.rnd() * 1.6) * scale,
          size1: (0.6 + this.rnd() * 1.6) * scale,
          ttl: 1.4 + this.rnd() * 1.4,
          opacity: 0.95,
          gravity: 9.81,
          drag: 0.18,
          spin: 5 + this.rnd() * 9,
          hot: 0x574f45,
          cool: 0x35322c,
        });
      }
    } else {
      const debrisN = this.quality === "low" ? 4 : 12;
      for (let i = 0; i < debrisN; i++) {
        const dir = this.randomDir(1);
        this.emit(this.debris, at, dir.multiplyScalar(10 * scale + this.rnd() * 22 * scale), {
          size0: (0.4 + this.rnd() * 1.1) * scale,
          size1: (0.4 + this.rnd() * 1.1) * scale,
          ttl: 1.6 + this.rnd() * 1.6,
          opacity: 0.95,
          gravity: 9.81,
          drag: 0.12,
          spin: 6 + this.rnd() * 10,
          hot: 0x8a4438,
          cool: 0x2a2224,
        });
      }
    }
    this.flashLight(at, 24000 * scale * scale);
  }

  private splash(at: THREE.Vector3, scale: number): void {
    const base = 16 * scale;
    // water column: fast up, then it falls back through the surface
    // A splash is thrown up fast and then falls back through the surface, so
    // the column is driven by upward acceleration for as long as it lives.
    this.emit(this.column, at, ZERO, {
      size0: 2, size1: 2, ttl: 0.85, opacity: 0.85,
      rise: 95 * scale,
      hot: 0xdfefff, cool: 0xa9c8dd,
      flatten: { radius: 7 * scale, height: 48 * scale },
    });
    this.emit(this.column, at, ZERO, {
      size0: 2, size1: 2, ttl: 1.2, opacity: 0.5,
      rise: 60 * scale,
      hot: 0xf2faff, cool: 0xc4dcec,
      flatten: { radius: 14 * scale, height: 30 * scale },
    });
    const sprayN = this.quality === "low" ? 8 : 20;
    for (let i = 0; i < sprayN; i++) {
      const dir = this.randomDir(0.85);
      this.emit(this.spray, at, dir.multiplyScalar(14 * scale + this.rnd() * 26 * scale), {
        size0: 1.2 * scale,
        size1: (2.4 + this.rnd() * 2.6) * scale,
        ttl: 0.7 + this.rnd() * 0.8,
        opacity: 0.85,
        gravity: 9.81,
        drag: 0.28,
        hot: 0xffffff,
        cool: 0x9fd6ff,
      });
    }
    const mistN = this.quality === "low" ? 3 : 8;
    for (let i = 0; i < mistN; i++) {
      const dir = this.randomDir(0.9);
      this.emit(this.smoke, at, dir.multiplyScalar(5 * scale + this.rnd() * 9 * scale), {
        size0: base * (0.3 + this.rnd() * 0.2),
        size1: base * (1.1 + this.rnd() * 0.7),
        ttl: 1.3 + this.rnd() * 1.4,
        opacity: 0.55,
        rise: 3 + this.rnd() * 4,
        drag: 0.6,
        hot: 0xdfe9f2,
        cool: 0xf4f9fd,
      });
    }
    // spreading rings of foam on the surface
    for (let i = 0; i < 3; i++) {
      this.emit(this.foam, at, ZERO, {
        size0: base * (0.3 + i * 0.25),
        size1: base * (1.6 + i * 0.9),
        ttl: 0.9 + i * 0.5,
        opacity: 0.75 - i * 0.18,
        hot: 0xffffff,
        cool: 0xd8ecf7,
      });
    }
    this.flashLight(at, 12000 * scale * scale);
  }

  private flashLight(at: THREE.Vector3, peak: number): void {
    if (this.quality === "low") return;
    this.light.position.copy(at);
    this.lightPeak = peak;
    this.lightDecay = 0.36;
    this.light.intensity = peak;
  }

  // -------------------------------------------------------------------------

  private emit(
    pool: Particle[],
    at: THREE.Vector3,
    vel: THREE.Vector3,
    spec: {
      size0: number;
      size1: number;
      ttl: number;
      opacity: number;
      hot: number | THREE.Color;
      cool: number | THREE.Color;
      gravity?: number;
      rise?: number;
      drag?: number;
      spin?: number;
      /** Cylinder/ring particles take an explicit radius + height instead. */
      flatten?: { radius: number; height: number };
    },
  ): void {
    let p: Particle | null = null;
    for (const cand of pool) {
      if (cand.life <= 0) {
        p = cand;
        break;
      }
    }
    if (!p) return; // pool exhausted: drop the particle rather than hitch
    p.life = spec.ttl;
    p.ttl = spec.ttl;
    p.pos.copy(at);
    p.vel.copy(vel);
    p.size0 = spec.size0;
    p.size1 = spec.size1;
    p.opacity = spec.opacity;
    p.gravity = spec.gravity ?? 0;
    p.rise = spec.rise ?? 0;
    p.drag = spec.drag ?? 0;
    p.spin = spec.spin ?? 0;
    p.hot.set(spec.hot as THREE.ColorRepresentation);
    p.cool.set(spec.cool as THREE.ColorRepresentation);
    const mat = p.mesh.material as THREE.MeshBasicMaterial;
    mat.color.copy(p.hot);
    mat.opacity = spec.opacity;
    if (spec.flatten) {
      p.mesh.scale.set(spec.flatten.radius, spec.flatten.height, spec.flatten.radius);
    } else {
      p.mesh.scale.setScalar(Math.max(0.01, spec.size0));
    }
    if (p.spin !== 0 && p.mesh.geometry !== this.geoms[RING]) {
      p.mesh.rotation.set(this.rnd() * 6.28, this.rnd() * 6.28, this.rnd() * 6.28);
    }
    p.mesh.position.copy(at);
    p.mesh.visible = true;
  }

  step(dt: number): void {
    if (this.lightDecay > 0) {
      this.lightDecay -= dt;
      const t = clamp(this.lightDecay / 0.36, 0, 1);
      this.light.intensity = this.lightPeak * t * t;
      if (this.lightDecay <= 0) this.light.intensity = 0;
    }
    for (const pool of [this.fire, this.smoke, this.spray, this.debris, this.wave, this.foam, this.column]) {
      for (const p of pool) {
        if (p.life <= 0) continue;
        p.life -= dt;
        if (p.life <= 0) {
          p.mesh.visible = false;
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0;
          continue;
        }
        const t = 1 - p.life / p.ttl; // 0 fresh -> 1 gone
        if (p.gravity !== 0) p.vel.y -= p.gravity * dt;
        if (p.rise !== 0) p.vel.y += p.rise * dt;
        if (p.drag !== 0) p.vel.multiplyScalar(Math.max(0, 1 - p.drag * dt));
        p.pos.addScaledVector(p.vel, dt);
        p.mesh.position.copy(p.pos);
        const grow = 1 - (1 - t) * (1 - t); // ease out
        const size = p.size0 + (p.size1 - p.size0) * grow;
        const isFlat = p.mesh.geometry === this.geoms[RING] || p.mesh.geometry === this.geoms[COLUMN];
        if (!isFlat) p.mesh.scale.setScalar(Math.max(0.01, size));
        else if (p.mesh.geometry === this.geoms[RING]) {
          // rings are unit-radius: the fade size *is* the radius in metres
          p.mesh.scale.set(size, size, 1);
        }
        const mat = p.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = p.opacity * Math.pow(1 - t, 1.35);
        mat.color.copy(p.hot).lerp(p.cool, Math.min(1, t * 1.15));
        if (p.spin !== 0) p.mesh.rotateY(p.spin * dt);
      }
    }
  }

  dispose(): void {
    this.root.removeFromParent();
    for (const pool of [this.fire, this.smoke, this.spray, this.debris, this.wave, this.foam, this.column]) {
      for (const p of pool) (p.mesh.material as THREE.Material).dispose();
    }
    for (const g of this.geoms) g.dispose();
    this.light.dispose();
    this.fire = this.smoke = this.spray = this.debris = this.wave = this.foam = this.column = [];
  }

  /** Deterministic unit direction, biased upward by `flatness` (0 = sphere). */
  private randomDir(flatness: number): THREE.Vector3 {
    const a = this.rnd() * Math.PI * 2;
    const z = this.rnd() * 2 - 1;
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    const y = z * (1 - flatness) + flatness * 0.55;
    return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).normalize();
  }

  private rnd(): number {
    this.seed = (this.seed * 1103515245 + 12345) % 2147483648;
    return this.seed / 2147483648;
  }
}

const ZERO = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
