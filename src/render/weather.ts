// Weather effects: rain, lightning and the sea's own haze.
//
// The flight model and the decks already know the weather (see sim/weather.ts);
// this is the part the pilot *sees*. Rain is one recycled point cloud that
// follows the camera, lightning is a light-level spike the renderer folds into
// its ambient lighting, and thunder is reported back so the audio engine can
// rumble on the same strike.

import * as THREE from "three";
import type { WeatherPreset } from "../sim/weather";
import type { Quality } from "../settings";

/** Rain columns, per quality tier. Enough to read as a squall, cheap enough
 *  to keep at frame rate while also drawing a 60 km world. */
const DROPS: Record<Quality, number> = { low: 1200, medium: 3200, high: 5600 };

/** Half-extent of the rain volume around the viewpoint, in metres. */
const BOX = 420;
const BOX_H = 260;
const FALL = 46; // m/s of terminal rain, before the wind's drift
const WIND_DRIFT = 0.35; // how much of the wind the drops carry

export class WeatherFx {
  private rain: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private positions: Float32Array;
  private velocities: Float32Array;
  private count: number;
  private preset: WeatherPreset | null = null;
  /** 0..1 lightning flash, decaying after each strike. */
  private flash = 0;
  private strikePending = 0;
  private strikeAt = 0;
  private seed = 1;

  constructor(scene: THREE.Scene, quality: Quality, seed = 1) {
    this.seed = seed;
    this.count = DROPS[quality] ?? DROPS.medium;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3] = (rand(this.seed + i * 3) * 2 - 1) * BOX;
      this.positions[i * 3 + 1] = rand(this.seed + i * 3 + 1) * BOX_H;
      this.positions[i * 3 + 2] = (rand(this.seed + i * 3 + 2) * 2 - 1) * BOX;
      this.velocities[i] = 0.75 + rand(this.seed + i * 7) * 0.5;
    }
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    // Long thin streaks read as falling rain rather than a snow flurry.
    const material = new THREE.PointsMaterial({
      color: 0xbcd0e0,
      size: 3.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: true,
    });
    this.rain = new THREE.Points(this.geometry, material);
    this.rain.frustumCulled = false;
    this.rain.visible = false;
    this.rain.renderOrder = 4;
    scene.add(this.rain);
  }

  /** Follow the active weather preset. */
  setPreset(p: WeatherPreset): void {
    this.preset = p;
    const mat = this.rain.material as THREE.PointsMaterial;
    mat.opacity = p.rain * 0.55;
    this.rain.visible = p.rain > 0.01;
  }

  /** Current lightning flash (0..1), for the lighting rig to add to ambient. */
  get flashLevel(): number {
    return this.flash;
  }

  /**
   * Distance to the strike that just happened, in km (0 when there was none).
   * The audio engine uses it to delay the thunderclap by the speed of sound.
   */
  takeStrike(): number {
    const km = this.strikePending;
    this.strikePending = 0;
    return km;
  }

  /**
   * Step the effects around the viewer. `dt` is frame time, `focus` the point
   * the scene is being drawn around (the aircraft, or the camera in a
   * spectator view) and `wind` the wind vector the drops ride.
   */
  update(dt: number, focus: THREE.Vector3, wind: { x: number; z: number }): void {
    const p = this.preset;
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3.2);
    if (p && p.lightning > 0) {
      // A strike every ~10/lightning seconds, with a jittered gap so squalls
      // do not read as a metronome.
      this.strikeAt -= dt;
      if (this.strikeAt <= 0) {
        this.strikeAt = (60 / p.lightning) * (0.45 + rand(this.seed + Math.floor(performance.now())) * 1.1);
        this.flash = 1;
        // Somewhere in the squall, 1.5 to 9 km out: near enough to hear.
        this.strikePending = 1.5 + rand(this.seed + Math.floor(performance.now() * 0.37)) * 7.5;
      }
    }
    if (!this.rain.visible) return;
    const pos = this.positions;
    const windX = wind.x * WIND_DRIFT;
    const windZ = wind.z * WIND_DRIFT;
    for (let i = 0; i < this.count; i++) {
      const iy = i * 3 + 1;
      pos[iy] -= FALL * this.velocities[i] * dt;
      pos[i * 3] += windX * dt;
      pos[i * 3 + 2] += windZ * dt;
      // Recycle a drop that hit the sea, and wrap in X/Z so the column travels
      // with the aircraft instead of running out behind it.
      if (pos[iy] < focus.y - 40) {
        pos[iy] = focus.y + BOX_H;
        pos[i * 3] = focus.x + (rand(this.seed + i + Math.floor(performance.now())) * 2 - 1) * BOX;
        pos[i * 3 + 2] = focus.z + (rand(this.seed + i * 5 + Math.floor(performance.now())) * 2 - 1) * BOX;
      }
      if (pos[i * 3] < focus.x - BOX) pos[i * 3] += BOX * 2;
      else if (pos[i * 3] > focus.x + BOX) pos[i * 3] -= BOX * 2;
      if (pos[i * 3 + 2] < focus.z - BOX) pos[i * 3 + 2] += BOX * 2;
      else if (pos[i * 3 + 2] > focus.z + BOX) pos[i * 3 + 2] -= BOX * 2;
    }
    (this.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
  }

  setQuality(quality: Quality): void {
    const want = DROPS[quality] ?? DROPS.medium;
    if (want === this.count) return;
    // Rebuild the cloud at the new density; cheap, and only on a settings change.
    this.count = want;
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3] = (rand(this.seed + i * 3) * 2 - 1) * BOX;
      this.positions[i * 3 + 1] = rand(this.seed + i * 3 + 1) * BOX_H;
      this.positions[i * 3 + 2] = (rand(this.seed + i * 3 + 2) * 2 - 1) * BOX;
      this.velocities[i] = 0.75 + rand(this.seed + i * 7) * 0.5;
    }
    this.geometry.dispose();
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.rain.geometry = this.geometry;
  }

  dispose(): void {
    this.rain.removeFromParent();
    this.geometry.dispose();
    (this.rain.material as THREE.Material).dispose();
  }
}

/** Small deterministic hash in 0..1, so a rain field is the same every launch. */
function rand(n: number): number {
  const h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) ^ 0x165667b1;
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}
