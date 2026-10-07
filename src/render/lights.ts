// Night lighting for airframes and ships.
//
// Nav lights, anti-collision strobes and ship lamps all hang off a handful of
// shared materials, so the daylight cycle can fade the whole fleet in with one
// value — the same idea as the runway/deck edge lights in scene.ts.
//
// Airframe lights are sprites: a point of light stays visible at two kilometres
// where a two-metre emissive sphere would not cover a pixel, and a sprite always
// faces the camera. Ship lights are emissive meshes because they need to sit on
// the hull and read as hardware.
//
// The sprites are textured: an untextured sprite is a hard square, which reads
// as a bright box hanging off the wingtip rather than a lamp. The glow is
// generated in memory, so everything here stays safe headless (no canvas, no
// DOM) and the sim harnesses can build carriers and bandits without a browser.

import * as THREE from "three";

/** Shared materials are never disposed with a wreck or a rebuilt world. */
export function isSharedMaterial(m: THREE.Material): boolean {
  return m.userData?.shared === true;
}

function shared<T extends THREE.Material>(m: T): T {
  m.userData.shared = true;
  return m;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// --- airframe lights ------------------------------------------------------

/**
 * A soft round glow, built pixel by pixel: white, with the alpha falling off
 * quadratically from a bright core to nothing at the rim. Sprites share it and
 * take their colour from the material, so one texture serves every lamp.
 */
function glowTexture(): THREE.DataTexture {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  const c = (size - 1) / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - c) / c;
      const dy = (y - c) / c;
      const d = Math.min(1, Math.hypot(dx, dy));
      const a = (1 - d) * (1 - d);
      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = Math.round(a * 255);
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/** One shared glow for every nav light and strobe. */
export const NAV_GLOW = glowTexture();

const NAV_RED = shared(new THREE.SpriteMaterial({
  color: 0xff2f22, map: NAV_GLOW, transparent: true, opacity: 0, depthWrite: false,
  blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
}));
const NAV_GREEN = shared(new THREE.SpriteMaterial({
  color: 0x2fff62, map: NAV_GLOW, transparent: true, opacity: 0, depthWrite: false,
  blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
}));
const NAV_WHITE = shared(new THREE.SpriteMaterial({
  color: 0xfff4d8, map: NAV_GLOW, transparent: true, opacity: 0, depthWrite: false,
  blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
}));
const STROBE = shared(new THREE.SpriteMaterial({
  color: 0xffffff, map: NAV_GLOW, transparent: true, opacity: 0, depthWrite: false,
  blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
}));

export interface AirLightSpots {
  /** Port wingtip (red). */
  leftTip: [number, number, number];
  /** Starboard wingtip (green). */
  rightTip: [number, number, number];
  /** Tail light (white). */
  tail: [number, number, number];
  /** Anti-collision strobe on the spine/fin. */
  beacon: [number, number, number];
}

function sprite(mat: THREE.SpriteMaterial, at: [number, number, number], size: number): THREE.Sprite {
  const s = new THREE.Sprite(mat);
  s.position.set(at[0], at[1], at[2]);
  s.scale.set(size, size, 1);
  s.frustumCulled = false;
  return s;
}

/**
 * Bolt the standard nav light set onto an airframe (body frame, nose at -Z).
 * When the wing panels are supplied the tip lights ride on them, so they sweep
 * back with the wings instead of floating off the wingtip.
 */
export function addAirLights(
  group: THREE.Object3D,
  spots: AirLightSpots,
  wings?: { right: THREE.Object3D; left: THREE.Object3D; tipSpan: number },
): void {
  // Sizes are the width of the glow quad, not the lamp: a lamp is centimetres
  // across but the halo has to stay a point of light at two kilometres. A 5 m
  // quad read as a slab hanging off the wing, so these stay modest. Headless
  // note: when no glow texture exists the quad is drawn square, so the size is
  // the only thing keeping it a light rather than a box.
  if (wings) {
    // Every wing panel builds its span along its own local +Z, outboard.
    wings.right.add(sprite(NAV_GREEN, [0, 0.04, wings.tipSpan], 2.6));
    wings.left.add(sprite(NAV_RED, [0, 0.04, wings.tipSpan], 2.6));
  } else {
    group.add(sprite(NAV_RED, spots.leftTip, 2.6));
    group.add(sprite(NAV_GREEN, spots.rightTip, 2.6));
  }
  group.add(sprite(NAV_WHITE, spots.tail, 2.2));
  group.add(sprite(STROBE, spots.beacon, 2.0));
}

/** Drive the airframe lights: `dark` 0 = full day, 1 = night. */
export function updateAirLights(dark: number, time: number): void {
  const on = clamp01(dark * 1.35);
  // Nav lights stay on around the clock, just faint in daylight.
  NAV_RED.opacity = 0.06 + on * 0.9;
  NAV_GREEN.opacity = 0.06 + on * 0.9;
  NAV_WHITE.opacity = 0.05 + on * 0.75;
  // Double-flash anti-collision strobe.
  const p = time % 1.4;
  const flash = p < 0.06 ? 1 : p < 0.16 ? 0.05 : p < 0.24 ? 0.8 : 0.03;
  STROBE.opacity = on * flash;
}

// --- ship lights ----------------------------------------------------------

/** Deck-edge / island lamps: warm, and only lit once the sun is low. */
export const SHIP_LAMP = shared(new THREE.MeshStandardMaterial({
  color: 0x101619, emissive: 0xffd9a0, emissiveIntensity: 0, roughness: 0.55,
}));
/** Red port navigation light. */
export const SHIP_NAV_RED = shared(new THREE.MeshStandardMaterial({
  color: 0x140b0a, emissive: 0xff3b2f, emissiveIntensity: 0, roughness: 0.5,
}));
/** Green starboard navigation light. */
export const SHIP_NAV_GREEN = shared(new THREE.MeshStandardMaterial({
  color: 0x0a140c, emissive: 0x38ff70, emissiveIntensity: 0, roughness: 0.5,
}));
/** Masthead / white round-the-clock light. */
export const SHIP_NAV_WHITE = shared(new THREE.MeshStandardMaterial({
  color: 0x14161a, emissive: 0xfff4d8, emissiveIntensity: 0, roughness: 0.5,
}));
/** Masthead anti-collision beacon (strobe). */
export const SHIP_BEACON = shared(new THREE.MeshStandardMaterial({
  color: 0x141014, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.4,
}));

/** Drive every ship lamp + beacon from the daylight state. */
export function updateShipLights(dark: number, time: number): void {
  SHIP_LAMP.emissiveIntensity = clamp01((dark - 0.15) / 0.85) * 2.6;
  SHIP_NAV_RED.emissiveIntensity = 0.25 + dark * 1.8;
  SHIP_NAV_GREEN.emissiveIntensity = 0.25 + dark * 1.8;
  SHIP_NAV_WHITE.emissiveIntensity = 0.25 + dark * 1.7;
  const p = time % 2.1;
  const flash = p < 0.08 ? 1 : p < 0.2 ? 0.04 : p < 0.28 ? 0.7 : 0.02;
  SHIP_BEACON.emissiveIntensity = dark * flash * 2.2;
}
