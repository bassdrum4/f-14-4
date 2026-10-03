// World meshes: procedural terrain, ocean, sky dome, carrier, airfield.

import * as THREE from "three";
import { EXTENT, STRIP, airfield, carriers, type CarrierDef } from "../sim/world";
import { fbm, smoothstep } from "../sim/noise";
import { QUALITY_SEGMENTS, type Quality } from "../settings";

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

export type TerrainStyle = "island" | "tropical";

export interface TerrainTextureRef {
  canvas: HTMLCanvasElement;
  worldX0: number;
  worldZ0: number;
  worldW: number;
  worldH: number;
}

export interface TerrainPaint {
  height: (x: number, z: number) => number;
  style: TerrainStyle;
  /** Stitched satellite imagery covering the world square, if available. */
  texture?: TerrainTextureRef | null;
}

/** Tropical fallback palette for real terrain (no snow line in Hawaii). */
function tropicalColor(h: number, slope: number, x: number, z: number, c: THREE.Color): void {
  if (h < -1) {
    const t = THREE.MathUtils.clamp((h + 90) / 90, 0, 1);
    c.setRGB(mix(0.05, 0.27, t), mix(0.13, 0.46, t), mix(0.19, 0.5, t), THREE.SRGBColorSpace);
    return;
  }
  const patch = fbm(x * 0.0011, z * 0.0011, 991, 3); // vegetation patchwork
  const grain = (fbm(x * 0.02, z * 0.02, 553, 2) - 0.5) * 0.06;
  let r = mix(0.24, 0.34, patch) + grain;
  let g = mix(0.42, 0.38, patch) + grain;
  let b = mix(0.2, 0.24, patch) + grain;
  const beach = 1 - smoothstep(3, 30, h);
  r = mix(r, 0.82, beach);
  g = mix(g, 0.76, beach);
  b = mix(b, 0.57, beach);
  const rock = smoothstep(0.55, 1.05, slope);
  r = mix(r, 0.36, rock);
  g = mix(g, 0.34, rock);
  b = mix(b, 0.31, rock);
  const high = smoothstep(700, 1100, h) * (1 - 0.6 * rock) * 0.5;
  r = mix(r, 0.42, high);
  g = mix(g, 0.4, high);
  b = mix(b, 0.38, high);
  c.setRGB(r, g, b, THREE.SRGBColorSpace);
}

const TERRAIN_COLORS: Record<TerrainStyle, (h: number, slope: number, x: number, z: number, c: THREE.Color) => void> = {
  island: islandColor,
  tropical: tropicalColor,
};

/**
 * Build the terrain mesh from an arbitrary height sampler: either stitched
 * satellite imagery (UVs mapped in world space so imagery lines up with the
 * physics heightfield exactly) or slope-aware biome vertex colours.
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

  let mat: THREE.MeshStandardMaterial;
  if (paint.texture) {
    const { canvas, worldX0, worldZ0, worldW, worldH } = paint.texture;
    const uv = geom.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) - worldX0) / worldW, (pos.getZ(i) - worldZ0) / worldH);
    }
    uv.needsUpdate = true;
    const tex = new THREE.CanvasTexture(canvas);
    tex.flipY = false; // row 0 of the stitched canvas is the north edge
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
  } else {
    // biome colours from height + slope (central differences on the grid)
    const colorize = TERRAIN_COLORS[paint.style];
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
      colorize(heights[i], Math.hypot(gx, gz), pos.getX(i), pos.getZ(i), c);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  }
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
  tex.repeat.set(96, 96); // ~625 m per tile across the 60 km ocean
  tex.anisotropy = 4;
  return tex;
}

export function buildOcean(): THREE.Mesh {
  const geom = new THREE.PlaneGeometry(60000, 60000, 1, 1);
  geom.rotateX(-Math.PI / 2);
  const waves = oceanTexture();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x16445e,
    roughness: 0.5,
    metalness: 0.4,
    transparent: true,
    opacity: 0.9, // shallow shelves read faintly through the surface
    bumpMap: waves,
    bumpScale: 1.6,
    roughnessMap: waves,
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

  // catapult track (port side), matching the sim's catTrack start + length
  ctx.strokeStyle = "#d8d8d2";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx(-40), cy(c.catapultOffsetX));
  ctx.lineTo(cx(-40 + c.catapultLength), cy(c.catapultOffsetX));
  ctx.stroke();
  ctx.lineWidth = 3;
  for (const a of [-40, -40 + c.catapultLength]) {
    ctx.beginPath();
    ctx.moveTo(cx(a), cy(c.catapultOffsetX - 6));
    ctx.lineTo(cx(a), cy(c.catapultOffsetX + 6));
    ctx.stroke();
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

  // Deck slab; its top surface sits exactly at c.deckY (the sim's deck).
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(L, 1, W),
    new THREE.MeshStandardMaterial({ map: deckTexture(c), roughness: 0.95 }),
  );
  deck.position.y = deckTop - 0.5;
  g.add(deck);

  // Island superstructure, starboard side (across > 0).
  const island = new THREE.Mesh(
    new THREE.BoxGeometry(28, 22, 14),
    new THREE.MeshStandardMaterial({ color: 0x8a8f8c, roughness: 0.9 }),
  );
  island.position.set(0, deckTop + 10.5, 30);
  g.add(island);
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.6, 16, 6),
    new THREE.MeshStandardMaterial({ color: 0x6e7376 }),
  );
  mast.position.set(0, deckTop + 29, 30);
  g.add(mast);
  const radar = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 4.5, 0.6, 20, 1, true, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xdbdbd5, roughness: 0.7, side: THREE.DoubleSide }),
  );
  radar.position.set(0, deckTop + 38, 30);
  g.add(radar);

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
  g.castShadow = false;
  g.receiveShadow = true;
  return g;
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

  return g;
}

/**
 * Night lighting: emissive strips along each carrier's angled landing strip and
 * the runway edges. Without these a night approach is unlandable, since the
 * deck is unlit. One shared material, so the daylight cycle can raise and
 * lower every light with a single value.
 */
export function buildNightLights(): { group: THREE.Group; material: THREE.MeshStandardMaterial } {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x0a0f14,
    emissive: 0xffd9a0,
    emissiveIntensity: 0,
    roughness: 0.6,
  });

  // Collect placements first, then emit one instanced mesh: ~190 small boxes
  // as individual draw calls would cost far more than they are worth.
  const placements: Array<{ x: number; y: number; z: number; rotY: number; len: number }> = [];

  // --- carrier: lights down both edges of the angled landing strip ---
  for (const c of carriers()) {
    const th = (c.landingAngleDeg * Math.PI) / 180;
    const cos = Math.cos(th);
    const sin = Math.sin(th);
    const deckTop = c.deckY + 0.5;
    const rot = ((90 - c.headingDeg) * Math.PI) / 180;
    const place = (along: number, across: number, len: number) => {
      // The strip's forward end overhangs the deck (the bow is narrower than
      // the landing area is long), so drop any light that falls off the slab.
      if (Math.abs(along) > c.deckLength / 2 || Math.abs(across) > c.deckWidth / 2) return;
      placements.push({
        x: c.x + along * Math.cos(rot) + across * Math.sin(rot),
        y: deckTop,
        z: c.z - along * Math.sin(rot) + across * Math.cos(rot),
        rotY: rot,
        len,
      });
    };
    for (let s = 6; s <= c.landingLength - 6; s += 18) {
      for (const d of [-STRIP.halfWidth, STRIP.halfWidth]) {
        place(STRIP.startAlong + s * cos + d * sin, STRIP.startAcross - s * sin + d * cos, 5);
      }
    }
    // threshold lights at the approach end
    for (let i = -2; i <= 2; i++) {
      const d = (STRIP.halfWidth / 2.5) * i;
      place(STRIP.startAlong + d * sin, STRIP.startAcross + d * cos, 3);
    }
  }

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
  inst.frustumCulled = false;
  group.add(inst);

  return { group, material };
}

export { HALF as TERRAIN_HALF };
