// World meshes: procedural terrain, ocean, sky dome, carrier, airfield.

import * as THREE from "three";
import { CAT_START_ALONG, EXTENT, STRIP, airfield, type CarrierDef } from "../sim/world";
import { fbm, smoothstep } from "../sim/noise";
import { QUALITY_SEGMENTS, type Quality } from "../settings";
import { SHIP_BEACON, SHIP_LAMP, SHIP_NAV_GREEN, SHIP_NAV_RED, SHIP_NAV_WHITE } from "./lights";

const HALF = EXTENT;

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Slope-aware biome colour: sand beaches, grass/forest patchwork, rock on
 * steep faces, alpine scree and a noise-wobbled snow line on the summits.
 * Seabed colours lighten into a turquoise shelf near the coast.
 */
function islandColor(h: number, slope: number, x: number, z: number, c: THREE.Color): void {
  if (h < -1) {
    const t = THREE.MathUtils.clamp((h + 90) / 90, 0, 1);
    c.setRGB(mix(0.05, 0.27, t), mix(0.13, 0.46, t), mix(0.19, 0.5, t), THREE.SRGBColorSpace);
    return;
  }
  const patch = fbm(x * 0.0016, z * 0.0016, 4242, 3); // vegetation patchwork
  const grain = (fbm(x * 0.02, z * 0.02, 808, 2) - 0.5) * 0.06;
  // dry grass ↔ lush grass ↔ forest
  let r = mix(0.44, 0.29, patch);
  let g = mix(0.48, 0.4, patch);
  let b = mix(0.28, 0.21, patch);
  r += grain;
  g += grain;
  b += grain;
  // beaches
  const beach = 1 - smoothstep(9, 42, h);
  r = mix(r, 0.83, beach);
  g = mix(g, 0.77, beach);
  b = mix(b, 0.57, beach);
  // rock on steep faces → alpine scree → snow
  const rock = smoothstep(0.5, 0.95, slope);
  r = mix(r, 0.38, rock);
  g = mix(g, 0.36, rock);
  b = mix(b, 0.33, rock);
  const alpine = smoothstep(560, 820, h) * (1 - 0.5 * rock);
  r = mix(r, 0.47, alpine);
  g = mix(g, 0.45, alpine);
  b = mix(b, 0.43, alpine);
  const line = 760 + patch * 280;
  const snow = smoothstep(line, line + 170, h) * (1 - smoothstep(0.8, 1.15, slope));
  r = mix(r, 0.93, snow);
  g = mix(g, 0.95, snow);
  b = mix(b, 0.97, snow);
  c.setRGB(r, g, b, THREE.SRGBColorSpace);
}

export interface TerrainPaint {
  height: (x: number, z: number) => number;
}

/**
 * Build the terrain mesh from a height sampler, coloured by slope-aware biome
 * vertex colours. The sampler is swapped (along with the whole paint) when the
 * world seed changes, so the mesh always matches the physics heightfield.
 */
export function buildTerrain(quality: Quality, paint: TerrainPaint): THREE.Mesh {
  const n = QUALITY_SEGMENTS[quality];
  const geom = new THREE.PlaneGeometry(HALF * 2, HALF * 2, n, n);
  geom.rotateX(-Math.PI / 2);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const w = n + 1;
  const cell = (HALF * 2) / n;

  // pass 1: heights (kept for slope estimation)
  const heights = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const h = paint.height(pos.getX(i), pos.getZ(i));
    pos.setY(i, h);
    heights[i] = h;
  }

  // biome colours from height + slope (central differences on the grid)
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const ix = i % w;
    const iy = (i / w) | 0;
    const xm = ix > 0 ? i - 1 : i;
    const xp = ix < w - 1 ? i + 1 : i;
    const zm = iy > 0 ? i - w : i;
    const zp = iy < w - 1 ? i + w : i;
    const gx = (heights[xp] - heights[xm]) / (Math.abs(xp - xm) * cell);
    const gz = (heights[zp] - heights[zm]) / (Math.abs(zp - zm) * cell);
    islandColor(heights[i], Math.hypot(gx, gz), pos.getX(i), pos.getZ(i), c);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  geom.computeVertexNormals();
  const mesh = new THREE.Mesh(geom, mat);
  mesh.receiveShadow = quality !== "low";
  return mesh;
}

/**
 * Tileable wave field: a sum of integer-frequency sine waves, so the texture
 * repeats seamlessly. Used as bump + roughness map — the shading and sun glint
 * it produces is what makes altitude and speed readable over open water.
 */
function oceanTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  // fx, fy = integer cycles per tile, phase, amplitude: long swells + chop
  const waves: Array<[number, number, number, number]> = [
    [2, 1, 0.6, 1.0],
    [1, 2, 2.2, 0.9],
    [3, 2, 4.1, 0.6],
    [2, 3, 1.4, 0.55],
    [5, 3, 3.3, 0.4],
    [3, 5, 5.0, 0.38],
    [7, 4, 0.9, 0.26],
    [4, 7, 2.7, 0.24],
  ];
  const norm = waves.reduce((a, w) => a + w[3], 0);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h = 0;
      for (const [fx, fy, ph, amp] of waves) {
        h += amp * Math.sin(2 * Math.PI * ((fx * x) / size + (fy * y) / size) + ph);
      }
      h /= norm;
      const v = Math.round(255 * (0.62 + 0.38 * Math.tanh(h * 1.7)));
      const i = (y * size + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(384, 384); // ~625 m per tile, scaled to the wider ocean
  tex.anisotropy = 4;
  return tex;
}

/**
 * Open water, one big sheet. It reaches far past the terrain mesh so a pilot
 * climbing at the edge of the chain sees ocean to the horizon, not a seam.
 */
export function buildOcean(): THREE.Mesh {
  const geom = new THREE.PlaneGeometry(240000, 240000, 1, 1);
  geom.rotateX(-Math.PI / 2);
  const waves = oceanTexture();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x16445e,
    roughness: 0.5,
    metalness: 0.4,
    transparent: true,
    opacity: 0.9, // shallow shelves read faintly through the surface
    bumpMap: waves,
    // Wave height in shading terms only. Pushed much past this the normal
    // perturbation outruns the surface and the sea reads as if it were
    // heaving, instead of as a flat sheet with wavetops on it.
    bumpScale: 0.5,
    roughnessMap: waves,
    // The sea is a single 2-triangle sheet 240 km across, and the seabed
    // shelves up close under it. Depth precision collapses over those
    // distances, so without a bias the two surfaces trade the depth test
    // frame by frame and the water appears to jump and flicker.
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -8,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = 0;
  return mesh;
}

export interface SkyDome {
  mesh: THREE.Mesh;
  /** Zenith + horizon colours, the sun's glow tint/direction, and its strength. */
  set(
    sunDir: THREE.Vector3,
    sunTint: THREE.Color,
    zenith: THREE.Color,
    horizon: THREE.Color,
    glow: number,
  ): void;
  /** Show/hide the star field layered behind the sky. */
  setStarsVisible(v: boolean): void;
  stars: THREE.Points;
  /** Keep the dome centred on the viewer so it never clips the far plane. */
  follow(p: THREE.Vector3): void;
}

/**
 * Sky dome as a tiny shader instead of a baked gradient, so the daylight cycle
 * can drive zenith/horizon colours and put the sun's glow in the right place.
 */
export function buildSky(): SkyDome {
  const geom = new THREE.SphereGeometry(42000, 32, 20);
  const uniforms: Record<string, THREE.IUniform> = {
    uZenith: { value: new THREE.Color(0x3d7ab8) },
    uHorizon: { value: new THREE.Color(0xc8d4dc) },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunTint: { value: new THREE.Color(0xffffff) },
    uGlow: { value: 0.35 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uZenith;
      uniform vec3 uHorizon;
      uniform vec3 uSunDir;
      uniform vec3 uSunTint;
      uniform float uGlow;
      varying vec3 vDir;
      void main() {
        vec3 dir = normalize(vDir);
        // vertical gradient: horizon colour up to zenith colour
        float t = clamp(dir.y, 0.0, 1.0);
        vec3 col = mix(uHorizon, uZenith, pow(t, 0.55));
        // sun glow, warm and tight near the disc, wide and soft at dusk
        float d = max(dot(dir, normalize(uSunDir)), 0.0);
        col += uSunTint * uGlow * pow(d, 6.0);
        col += uSunTint * uGlow * 0.35 * pow(d, 1.6);
        // below the horizon darken toward a flat sea haze
        col = mix(col * 0.55, col, smoothstep(-0.08, 0.02, dir.y));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.frustumCulled = false;

  // star field: cheap procedural points, only visible at night
  const starCount = 900;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    // deterministic golden-angle distribution over the upper hemisphere
    const y = 1 - (i / starCount) * 1.6;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * 2.39996;
    const R = 40000;
    positions[i * 3] = Math.cos(phi) * r * R;
    positions[i * 3 + 1] = y * R;
    positions[i * 3 + 2] = Math.sin(phi) * r * R;
  }
  const starGeom = new THREE.BufferGeometry();
  starGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starGeom,
    new THREE.PointsMaterial({ color: 0xdfe9ff, size: 90, sizeAttenuation: true, fog: false, transparent: true, opacity: 0 }),
  );
  stars.frustumCulled = false;

  return {
    mesh,
    stars,
    set(sunDir, sunTint, zenith, horizon, glow) {
      (uniforms.uSunDir.value as THREE.Vector3).copy(sunDir);
      (uniforms.uSunTint.value as THREE.Color).copy(sunTint);
      (uniforms.uZenith.value as THREE.Color).copy(zenith);
      (uniforms.uHorizon.value as THREE.Color).copy(horizon);
      uniforms.uGlow.value = glow;
    },
    setStarsVisible(v) {
      (stars.material as THREE.PointsMaterial).opacity = v ? 0.85 : 0;
      stars.visible = v;
    },
    follow(p) {
      mesh.position.copy(p);
      stars.position.copy(p);
    },
  };
}

// --------------------------------------------------------------------------
// Carrier
// --------------------------------------------------------------------------

/**
 * Where the island sits, across the deck from the ship's centreline. It hugs the
 * starboard edge whatever the hull's beam is, which keeps it out of the landing
 * area and off the port side where the angled strip runs out.
 */
function islandAcrossOf(c: CarrierDef): number {
  return c.deckWidth / 2 - 8.5;
}

function deckTexture(c: CarrierDef): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3d4348";
  ctx.fillRect(0, 0, 1024, 768);

  // speckle non-skid
  ctx.fillStyle = "#464d53";
  for (let i = 0; i < 2600; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 768, 3, 3);
  }

  // Canvas mapping (matches the deck slab's top-face UVs):
  //   canvas x: stern (along = -deckLength/2) at 0 .. bow tip at 1024
  //   canvas y: port (across = -deckWidth/2) at 0 .. starboard at 768
  const pxX = 1024 / c.deckLength;
  const pxY = 768 / c.deckWidth;
  const cx = (along: number) => (along + c.deckLength / 2) * pxX;
  const cy = (across: number) => (across + c.deckWidth / 2) * pxY;
  // The landing area is an angled strip: s runs along the strip, d across it.
  // (s, d) -> canvas, using the same frame as flight.ts stripCoords.
  const th = (c.landingAngleDeg * Math.PI) / 180;
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  const spx = (s: number, d: number) => cx(STRIP.startAlong + s * cos + d * sin);
  const spy = (s: number, d: number) => cy(STRIP.startAcross - s * sin + d * cos);

  const HW = STRIP.halfWidth;
  const LEN = c.landingLength;

  // landing area
  ctx.fillStyle = "#2a2f34";
  ctx.beginPath();
  ctx.moveTo(spx(0, -HW), spy(0, -HW));
  ctx.lineTo(spx(LEN, -HW), spy(LEN, -HW));
  ctx.lineTo(spx(LEN, HW), spy(LEN, HW));
  ctx.lineTo(spx(0, HW), spy(0, HW));
  ctx.closePath();
  ctx.fill();

  // strip edge lines
  ctx.strokeStyle = "#e8e8e5";
  ctx.lineWidth = 3;
  for (const d of [-HW, HW]) {
    ctx.beginPath();
    ctx.moveTo(spx(0, d), spy(0, d));
    ctx.lineTo(spx(LEN, d), spy(LEN, d));
    ctx.stroke();
  }

  // centerline dashes
  ctx.lineWidth = 4;
  for (let s = 16; s < LEN - 26; s += 34) {
    ctx.beginPath();
    ctx.moveTo(spx(s, 0), spy(s, 0));
    ctx.lineTo(spx(s + 22, 0), spy(s + 22, 0));
    ctx.stroke();
  }

  // arresting wire ticks, aligned with the rendered wire meshes
  ctx.strokeStyle = "#f2f2ef";
  ctx.lineWidth = 8;
  for (let i = 0; i < c.wireCount; i++) {
    const s = STRIP.wireFirstS + i * c.wireSpacing;
    ctx.beginPath();
    ctx.moveTo(spx(s, -HW), spy(s, -HW));
    ctx.lineTo(spx(s, HW), spy(s, HW));
    ctx.stroke();
  }

  // threshold bars at the approach (aft) end
  ctx.fillStyle = "#f2f2ef";
  for (let i = 0; i < 3; i++) {
    const s = 6 + i * 7;
    ctx.beginPath();
    ctx.moveTo(spx(s, -HW + 3), spy(s, -HW + 3));
    ctx.lineTo(spx(s + 2.5, -HW + 3), spy(s + 2.5, -HW + 3));
    ctx.lineTo(spx(s + 2.5, HW - 3), spy(s + 2.5, HW - 3));
    ctx.lineTo(spx(s, HW - 3), spy(s, HW - 3));
    ctx.closePath();
    ctx.fill();
  }

  // catapult tracks, port and starboard, matching the sim's catTrack start +
  // length (a carrier launches off both, the player off the port one)
  ctx.strokeStyle = "#d8d8d2";
  for (const off of [c.catapultOffsetX, -c.catapultOffsetX]) {
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx(CAT_START_ALONG), cy(off));
    ctx.lineTo(cx(CAT_START_ALONG + c.catapultLength), cy(off));
    ctx.stroke();
    ctx.lineWidth = 3;
    for (const a of [CAT_START_ALONG, CAT_START_ALONG + c.catapultLength]) {
      ctx.beginPath();
      ctx.moveTo(cx(a), cy(off - 6));
      ctx.lineTo(cx(a), cy(off + 6));
      ctx.stroke();
    }
  }

  // deck edge safety lines
  ctx.strokeStyle = "#b7beb4";
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 1012, 756);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function buildCarrier(c: CarrierDef): THREE.Group {
  const g = new THREE.Group();

  // Ship-local frame: +X = bow ("along"), +Z = starboard ("across"), +Y = up.
  // The group transform at the bottom maps this frame onto the sim's deck
  // axes (fwd = those of c.headingDeg), so geometry here uses plain
  // deck coordinates.
  const L = c.deckLength;
  const W = c.deckWidth;
  const deckTop = c.deckY;
  const hullTop = deckTop - 1; // deck slab occupies [deckTop - 1, deckTop]
  const hullH = hullTop + 14; // hull extends 14 m below the waterline (y = 0)

  const steel = new THREE.MeshStandardMaterial({ color: 0x565b60, roughness: 0.9 });

  // Hull: extruded plan outline with a pointed bow. The extrusion runs
  // downward from hullTop once laid flat.
  const hl = L / 2 + 2; // stern centreline
  const hw = W / 2 + 1; // hull half-width (a touch wider than the deck)
  const shape = new THREE.Shape();
  shape.moveTo(-hl, -hw); // stern, port corner
  shape.lineTo(hl - 55, -hw); // port side
  shape.lineTo(hl + 26, 0); // bow tip
  shape.lineTo(hl - 55, hw); // starboard side
  shape.lineTo(-hl, hw); // stern, starboard corner
  shape.closePath();
  const hullGeom = new THREE.ExtrudeGeometry(shape, { depth: hullH, bevelEnabled: false });
  hullGeom.rotateX(Math.PI / 2); // plan view lays flat in XZ; extrude becomes depth
  const hull = new THREE.Mesh(hullGeom, steel);
  hull.position.y = hullTop; // spans [hullTop - hullH, hullTop]
  g.add(hull);

  // Deck slab; its top surface sits exactly at c.deckY (the sim's deck). The
  // markings live on a canvas texture — headless runs (the dogfight harness
  // builds a hostile carrier with no DOM) fall back to plain deck steel.
  const deckMat =
    typeof document === "undefined"
      ? new THREE.MeshStandardMaterial({ color: 0x3c4247, roughness: 0.95 })
      : new THREE.MeshStandardMaterial({ map: deckTexture(c), roughness: 0.95 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(L, 1, W), deckMat);
  deck.position.y = deckTop - 0.5;
  g.add(deck);

  // Island superstructure, starboard side (across > 0). Its offset follows the
  // deck's width, so a wider hull keeps the island on the deck edge instead of
  // drifting into the middle of the landing area.
  const islandAcross = islandAcrossOf(c);
  const island = new THREE.Mesh(
    new THREE.BoxGeometry(28, 22, 14),
    new THREE.MeshStandardMaterial({ color: 0x8a8f8c, roughness: 0.9 }),
  );
  island.position.set(0, deckTop + 10.5, islandAcross);
  g.add(island);
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.6, 16, 6),
    new THREE.MeshStandardMaterial({ color: 0x6e7376 }),
  );
  mast.position.set(0, deckTop + 29, islandAcross);
  g.add(mast);
  const radar = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 4.5, 0.6, 20, 1, true, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xdbdbd5, roughness: 0.7, side: THREE.DoubleSide }),
  );
  radar.position.set(0, deckTop + 38, islandAcross);
  g.add(radar);

  // Navigation lights: port red, starboard green, masthead white, plus a
  // masthead anti-collision beacon. They are driven by the daylight cycle
  // (lights.ts), which is what makes a ship findable at night — important now
  // that hostile boats steam in from the horizon in the dark.
  const lampGeom = new THREE.BoxGeometry(1.1, 1.1, 1.1);
  const green = new THREE.Mesh(lampGeom, SHIP_NAV_GREEN);
  green.position.set(6, deckTop + 2.2, W / 2 - 1.5);
  g.add(green);
  const red = new THREE.Mesh(lampGeom, SHIP_NAV_RED);
  red.position.set(6, deckTop + 2.2, -W / 2 + 1.5);
  g.add(red);
  const masthead = new THREE.Mesh(lampGeom, SHIP_NAV_WHITE);
  masthead.position.set(0, deckTop + 37.6, islandAcross);
  g.add(masthead);
  const beacon = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7), SHIP_BEACON);
  beacon.position.set(0, deckTop + 35.4, islandAcross);
  g.add(beacon);

  // The ship carries its own deck lighting — landing-strip edge lights, running
  // lights down both deck edges and floodlights on the island. Outfitting the
  // hull rather than the world means the hostile carrier is lit too, instead of
  // only the ships that happen to be in the active layout.
  g.add(buildShipDeckLights(c));

  // Arresting wires, slung across the angled landing strip at the same deck
  // coordinates the sim uses to catch them (world.ts STRIP).
  const th = (c.landingAngleDeg * Math.PI) / 180;
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b });
  const wireGeom = new THREE.BoxGeometry(0.22, 0.22, STRIP.halfWidth * 2);
  for (let i = 0; i < c.wireCount; i++) {
    const s = STRIP.wireFirstS + i * c.wireSpacing;
    const along = STRIP.startAlong + s * cos;
    const across = STRIP.startAcross - s * sin;
    const seg = new THREE.Mesh(wireGeom, wireMat);
    seg.position.set(along, deckTop + 0.35, across);
    seg.rotation.y = th; // long axis (+Z) rotated to run across the strip
    g.add(seg);
  }

  // Place the ship in the ocean and align its local frame with the sim deck
  // frame: local +X -> fwd, local +Z -> starboard.
  g.position.set(c.x, 0, c.z);
  g.rotation.y = ((90 - c.headingDeg) * Math.PI) / 180;
  // Shadows are per-mesh (flags on a Group do not reach its children): the
  // ship casts onto its own deck and the sea, and receives the jet's shadow
  // while parked on the roof.
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  // The running lights must not throw their own little shadows around the
  // island; everything else on the ship both casts and receives.
  for (const lamp of [green, red, masthead, beacon]) lamp.castShadow = false;
  // The ship-wide flag assignment above also visits the instanced deck lamps.
  // Restore their flags: luminous strips do not need a second shadow draw.
  g.traverse(o => {
    if ((o as THREE.InstancedMesh).isInstancedMesh) {
      o.castShadow = false;
      o.receiveShadow = false;
    }
  });
  return g;
}

/**
 * Everything that lights a carrier at night, in the ship's own frame (+X bow,
 * +Z starboard): amber lights down the angled landing strip, green/red running
 * lights along the starboard and port deck edges, and floodlights on the island
 * so the deck and the superstructure are findable in the dark.
 *
 * One instanced mesh per colour: a carrier would otherwise be ~90 draw calls.
 */
function buildShipDeckLights(c: CarrierDef): THREE.Group {
  const g = new THREE.Group();
  const deckTop = c.deckY + 0.35;
  const th = (c.landingAngleDeg * Math.PI) / 180;
  const cos = Math.cos(th);
  const sin = Math.sin(th);

  // --- amber lights down both edges of the angled landing strip ---
  const strip: Array<[number, number, number]> = [];
  for (let s = 6; s <= c.landingLength - 6; s += 18) {
    for (const d of [-STRIP.halfWidth, STRIP.halfWidth]) {
      const along = STRIP.startAlong + s * cos + d * sin;
      const across = STRIP.startAcross - s * sin + d * cos;
      if (Math.abs(along) > c.deckLength / 2 || Math.abs(across) > c.deckWidth / 2) continue;
      strip.push([along, across, 5]);
    }
  }
  // threshold lights across the approach end
  for (let i = -2; i <= 2; i++) {
    const d = (STRIP.halfWidth / 2.5) * i;
    const along = STRIP.startAlong + d * sin;
    const across = STRIP.startAcross + d * cos;
    if (Math.abs(along) > c.deckLength / 2 || Math.abs(across) > c.deckWidth / 2) continue;
    strip.push([along, across, 3]);
  }
  g.add(instanceLamps(strip, SHIP_LAMP, new THREE.BoxGeometry(1, 0.3, 0.8), deckTop));

  // --- running lights down each deck edge ---
  const starboard: Array<[number, number, number]> = [];
  const port: Array<[number, number, number]> = [];
  const half = c.deckLength / 2 - 12;
  for (let along = -half; along <= half; along += 34) {
    starboard.push([along, c.deckWidth / 2 - 1.6, 3.4]);
    port.push([along, -c.deckWidth / 2 + 1.6, 3.4]);
  }
  g.add(instanceLamps(starboard, SHIP_NAV_GREEN, new THREE.BoxGeometry(3.4, 0.26, 0.7), deckTop));
  g.add(instanceLamps(port, SHIP_NAV_RED, new THREE.BoxGeometry(3.4, 0.26, 0.7), deckTop));

  // --- floodlights down the island's two faces (the island is 14 m deep and
  // sits on the starboard deck edge, per buildCarrier), so the superstructure
  // reads at night from both the flight deck and from off the ship's starboard
  // side ---
  const islandAcross = islandAcrossOf(c);
  const floods: Array<[number, number, number]> = [];
  for (let along = -12; along <= 12; along += 8) {
    floods.push([along, islandAcross - 6, 1.6]);
    floods.push([along, islandAcross + 6, 1.6]);
  }
  g.add(instanceLamps(floods, SHIP_LAMP, new THREE.BoxGeometry(1.6, 0.6, 1.6), c.deckY + 20));

  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = false;
      m.receiveShadow = false;
    }
  });
  return g;
}

/** One instanced mesh for a list of [along, across, length] lamp placements. */
function instanceLamps(
  spots: Array<[number, number, number]>,
  material: THREE.Material,
  geom: THREE.BufferGeometry,
  y: number,
): THREE.InstancedMesh {
  const inst = new THREE.InstancedMesh(geom, material, Math.max(1, spots.length));
  const m = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  spots.forEach(([along, across, len], i) => {
    pos.set(along, y, across);
    q.identity();
    scale.set(len, 1, 1);
    m.compose(pos, q, scale);
    inst.setMatrixAt(i, m);
  });
  inst.count = spots.length;
  inst.instanceMatrix.needsUpdate = true;
  inst.computeBoundingSphere();
  return inst;
}

// --------------------------------------------------------------------------
// Airfield
// --------------------------------------------------------------------------

function runwayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#4b4f54";
  ctx.fillRect(0, 0, 1024, 128);
  ctx.strokeStyle = "#dfe3e6";
  ctx.lineWidth = 6;
  ctx.setLineDash([60, 45]);
  ctx.beginPath();
  ctx.moveTo(10, 64);
  ctx.lineTo(1014, 64);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeRect(4, 8, 1016, 112);
  // threshold bars
  ctx.fillStyle = "#dfe3e6";
  for (let i = 0; i < 6; i++) ctx.fillRect(24, 8 + i * 20, 26, 8);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function buildAirfield(): THREE.Group {
  const g = new THREE.Group();
  const af = airfield();
  const runway = new THREE.Mesh(
    new THREE.BoxGeometry(af.runwayLength, 0.6, af.runwayWidth),
    new THREE.MeshStandardMaterial({
      map: runwayTexture(),
      roughness: 1,
      // top face sits 2 cm above the sim's runway plane; polygon offset keeps
      // it from z-fighting with the flattened plateau at distance
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
  );
  runway.position.set(af.centerX, af.elevation - 0.28, af.centerZ);
  g.add(runway);

  // ramp + a couple of hangars + tower
  const mat = new THREE.MeshStandardMaterial({ color: 0x7d8790, roughness: 0.9 });
  const hangar = new THREE.Mesh(new THREE.BoxGeometry(60, 18, 40), mat);
  hangar.position.set(af.centerX - 200, af.elevation + 9, af.centerZ - 140);
  g.add(hangar);
  const hangar2 = new THREE.Mesh(new THREE.BoxGeometry(60, 18, 40), mat);
  hangar2.position.set(af.centerX + 120, af.elevation + 9, af.centerZ - 150);
  g.add(hangar2);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 34, 10), mat);
  tower.position.set(af.centerX - 60, af.elevation + 17, af.centerZ - 160);
  g.add(tower);

  // The runway receives the jet's shadow but does not cast: its slab sits
  // 2 cm above the flattened plateau, and two surfaces that close together
  // only shadow-fight at the shadow map's texel size. Buildings do cast.
  runway.receiveShadow = true;
  for (const b of [hangar, hangar2, tower]) {
    b.castShadow = true;
    b.receiveShadow = true;
  }

  return g;
}

/**
 * Night lighting for the island airfield: emissive strips along the runway
 * edges and thresholds. Without these a night approach is unlandable, since the
 * plateau is unlit. One shared material, so the daylight cycle can raise and
 * lower every light with a single value.
 *
 * Ships carry their own deck lighting (see buildShipDeckLights) so the hostile
 * carrier — which is not part of any world layout — is lit as well.
 */
export function buildNightLights(): { group: THREE.Group; material: THREE.MeshStandardMaterial } {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x0a0f14,
    emissive: 0xffd9a0,
    emissiveIntensity: 0,
    roughness: 0.6,
  });

  // Collect placements first, then emit one instanced mesh: ~110 small boxes
  // as individual draw calls would cost far more than they are worth.
  const placements: Array<{ x: number; y: number; z: number; rotY: number; len: number }> = [];

  // --- airfield: runway edge lighting ---
  {
    const af = airfield();
    const y = af.elevation + 0.4;
    for (let x = -af.runwayLength / 2 + 20; x <= af.runwayLength / 2 - 20; x += 45) {
      for (const d of [-af.runwayWidth / 2 - 1.5, af.runwayWidth / 2 + 1.5]) {
        placements.push({ x: af.centerX + x, y, z: af.centerZ + d, rotY: 0, len: 5 });
      }
    }
    // threshold bars
    for (let i = -3; i <= 3; i++) {
      placements.push({ x: af.centerX - af.runwayLength / 2 + 4, y, z: af.centerZ + i * 7, rotY: 0, len: 4 });
      placements.push({ x: af.centerX + af.runwayLength / 2 - 4, y, z: af.centerZ + i * 7, rotY: 0, len: 4 });
    }
  }

  const geom = new THREE.BoxGeometry(1, 0.35, 0.9);
  const inst = new THREE.InstancedMesh(geom, material, placements.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scale = new THREE.Vector3();
  placements.forEach((p, i) => {
    pos.set(p.x, p.y, p.z);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.rotY);
    scale.set(p.len, 1, 1);
    m.compose(pos, q, scale);
    inst.setMatrixAt(i, m);
  });
  inst.instanceMatrix.needsUpdate = true;
  inst.computeBoundingSphere();
  group.add(inst);

  return { group, material };
}


