// In-world scale cues: the answer to "I can't tell if I'm 500 or 5000 feet up".
//
// Instruments say a number; the world has to say it too. Three cues, aimed at
// three altitude bands:
//
//   cloud decks  — fixed translucent layers at ~3,100 ft and ~6,100 ft. One is
//                  a floor, the other a ceiling; crossing either gives an
//                  instant vertical reference that terrain alone cannot.
//   ground shadow — the jet's shadow on the surface below, displaced along the
//                  sun's azimuth by (height / tan(elevation)). It is the oldest
//                  altitude cue in aviation: the lower you are, the bigger and
//                  harder it reads; high up it is a faint smudge far away.
//   comms masts  — three ~60 m towers at the airfield, the only man-made
//                  vertical objects in the world besides ships: a wingtip
//                  past one of those tells you how low "low" is.
//
// Everything here is cheap: one plane per cloud layer (texture-tiled), one
// shadow quad, three thin boxes. The layers ride with the camera so the deck is
// effectively infinite, and both fade out as the camera approaches their
// altitude so passing through a layer is a soft dissolve, not a hard line.

import * as THREE from "three";
import { airfield, groundAt } from "../sim/world";

/** Cloud deck altitudes (m) and how strongly they read. */
const LAYERS = [
  { y: 950, opacity: 0.42, tiles: 7 },
  { y: 1850, opacity: 0.3, tiles: 5 },
];

/** Fade a layer out within this distance of the camera (m). */
const LAYER_FADE = 260;

/** Shadow fades with height but never fully goes: a smudge is still a cue. */
const SHADOW_FADE = 2800;

function cloudTexture(seed: number): THREE.CanvasTexture {
  const size = 256;
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext("2d")!;
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  // Soft blobs drawn with wrap-around copies so the tile is seamless.
  for (let i = 0; i < 30; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 20 + rnd() * 48;
    const a = 0.13 + rnd() * 0.22;
    for (const [dx, dy] of [
      [0, 0],
      [size, 0],
      [-size, 0],
      [0, size],
      [0, -size],
    ] as const) {
      const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      g.addColorStop(0, `rgba(255,255,255,${a.toFixed(3)})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function shadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(8,12,16,0.85)");
  g.addColorStop(0.55, "rgba(8,12,16,0.45)");
  g.addColorStop(1, "rgba(8,12,16,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}

interface Layer {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  tex: THREE.CanvasTexture;
}

export class ScaleCues {
  private root = new THREE.Group();
  private layers: Layer[] = [];
  private shadow: THREE.Mesh;
  private shadowMat: THREE.MeshBasicMaterial;
  private shadowTex: THREE.CanvasTexture;

  constructor(scene: THREE.Scene) {
    for (const def of LAYERS) {
      const tex = cloudTexture(Math.round(def.y));
      tex.repeat.set(def.tiles, def.tiles);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: def.opacity,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: true,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = def.y;
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      this.root.add(mesh);
      this.layers.push({ mesh, mat, tex });
    }

    this.shadowTex = shadowTexture();
    this.shadowMat = new THREE.MeshBasicMaterial({
      map: this.shadowTex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      fog: true,
    });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(46, 30), this.shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.frustumCulled = false;
    this.shadow.renderOrder = 1;
    this.root.add(this.shadow);

    // --- comms masts at the airfield: the world's only vertical landmarks ---
    const af = airfield();
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x8a4438, roughness: 0.8, metalness: 0.25 });
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff3020, toneMapped: false });
    const spots: Array<[number, number, number]> = [
      [-950, 780, 62],
      [320, -820, 74],
      [1250, 420, 52],
    ];
    for (const [dx, dz, h] of spots) {
      const x = af.centerX + dx;
      const z = af.centerZ + dz;
      const y = groundAt(x, z).y;
      const mast = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.6, h, 1.6), mastMat);
      shaft.position.y = h / 2;
      mast.add(shaft);
      for (const fy of [0.45, 0.75]) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(11, 0.7, 0.7), mastMat);
        arm.position.y = h * fy;
        mast.add(arm);
      }
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), beaconMat);
      beacon.position.y = h + 1.2;
      mast.add(beacon);
      mast.position.set(x, y, z);
      this.root.add(mast);
    }

    scene.add(this.root);
  }

  /**
   * Per-frame update. `focus` is the jet, `sunDir` points from the surface up
   * toward the sun, `dark` is 0 by day and 1 at night.
   */
  update(focus: THREE.Vector3, cameraPos: THREE.Vector3, sunDir: THREE.Vector3, dark: number): void {
    // --- cloud decks ride with the camera and dissolve as it nears them ---
    for (let i = 0; i < this.layers.length; i++) {
      const l = this.layers[i];
      l.mesh.position.x = cameraPos.x;
      l.mesh.position.z = cameraPos.z;
      const d = Math.abs(cameraPos.y - LAYERS[i].y);
      const fade = Math.min(1, Math.max(0, (d - 60) / LAYER_FADE));
      l.mat.opacity = LAYERS[i].opacity * fade * (1 - 0.72 * dark);
    }

    // --- the jet's shadow on the surface below ---
    const g = groundAt(focus.x, focus.z);
    const agl = focus.y - g.y;
    const sunUp = sunDir.y;
    if (sunUp < 0.07 || agl < 1.5) {
      this.shadow.visible = false;
      return;
    }
    // displacement along the sun's azimuth: h / tan(elevation), clamped so a
    // low sun does not throw the shadow off the map
    const k = Math.min(agl / sunUp, 600 / Math.max(Math.hypot(sunDir.x, sunDir.z), 1e-3));
    const sx = focus.x - sunDir.x * k;
    const sz = focus.z - sunDir.z * k;
    const sy = groundAt(sx, sz).y + 1.6;
    this.shadow.position.set(sx, sy, sz);
    const soft = Math.max(0, 1 - agl / SHADOW_FADE);
    this.shadowMat.opacity = (0.14 + 0.42 * soft * soft) * (1 - 0.8 * dark);
    this.shadow.visible = this.shadowMat.opacity > 0.02;
  }

  dispose(): void {
    this.root.removeFromParent();
    // every material here is owned by this class (nothing is shared), so the
    // whole subtree can be released wholesale
    this.root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry?.dispose();
      (mesh.material as THREE.Material | undefined)?.dispose();
    });
    for (const l of this.layers) l.tex.dispose();
    this.shadowTex.dispose();
  }
}
