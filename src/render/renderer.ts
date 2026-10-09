import { buildScenery, buildAirbaseDetails } from "./details";
import { ResolutionBudget } from "./performance";
// Three.js renderer wrapper: scene graph, lighting, resize, quality scaling.
// The world root (terrain + airfield + carriers) is rebuilt at runtime whenever
// the terrain seed changes, so the mesh always follows the physics heightfield.

import * as THREE from "three";
import {
  buildAirfield,
  buildCarrier,
  buildNightLights,
  buildOcean,
  buildSky,
  buildTerrain,
  type TerrainPaint,
} from "./scene";
import { buildAircraft, type TomcatMesh } from "./geometry";
import { isSharedMaterial, updateAirLights, updateShipLights } from "./lights";
import { ScaleCues } from "./scale";
import { makeEnvironmentSample, sampleEnvironment, type EnvironmentSample } from "./environment";
import { DEFAULT_AIRCRAFT, type AircraftId } from "../sim/aircraft";
import { carriers } from "../sim/world";
import type { Quality } from "../settings";
import type { SunPosition } from "../sim/sun";

export class WorldRenderer {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  jet: TomcatMesh;
  jetGroup: THREE.Group;
  sun: THREE.DirectionalLight;
  oceanMat: THREE.MeshStandardMaterial;
  private quality: Quality;
  private resolutionBudget = new ResolutionBudget();
  private adaptiveResolution = true;
  private basePixelRatio = 1;
  private scenery!: THREE.Group;
  private terrainPaint!: TerrainPaint;
  private worldRoot = new THREE.Group();
  private nightRoot = new THREE.Group();
  private nightLights: THREE.MeshStandardMaterial;
  private sky: ReturnType<typeof buildSky>;
  private hemi: THREE.HemisphereLight;
  private ambient: THREE.AmbientLight;
  private env: EnvironmentSample = makeEnvironmentSample();
  private sunDir = new THREE.Vector3(0, 1, 0);
  private tmpColor = new THREE.Color();
  /** 0 = full day, 1 = night. Drives every nav light, lamp and strobe. */
  private dark = 0;
  /** In-world altitude cues: cloud decks, the jet's ground shadow, the masts. */
  private scaleCues: ScaleCues;

  constructor(
    canvas: HTMLCanvasElement,
    quality: Quality,
    initialPaint: TerrainPaint,
    aircraft: AircraftId = DEFAULT_AIRCRAFT,
  ) {
    this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.shadowMap.enabled = quality !== "low";
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xbfd3e0, 6000, 58000);

    // Far plane past the fog: the chain runs 60 km, and the sea haze should
    // close the horizon before the frustum does. The near plane is 1 m rather
    // than 10 cm because the sea is one 240 km sheet: depth precision is what
    // decides whether a pixel is water or beach at range, and every centimetre
    // taken off `near` is precision thrown away at the far end of the world.
    this.camera = new THREE.PerspectiveCamera(62, 1, 1, 70000);
    this.camera.position.set(0, 200, 200);

    // lighting
    this.hemi = new THREE.HemisphereLight(0xbfd8ff, 0x6b7a55, 0.75);
    this.scene.add(this.hemi);
    this.ambient = new THREE.AmbientLight(0xffffff, 0);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight(0xfff2dd, 2.0);
    this.sun.position.set(4000, 5500, 1500);
    this.scene.add(this.sun);
    // Added once here; applyDaylight only moves it.
    this.scene.add(this.sun.target);

    this.sun.castShadow = quality !== "low";
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera as THREE.OrthographicCamera;
    sc.left = -60;
    sc.right = 60;
    sc.top = 60;
    sc.bottom = -60;
    sc.near = 1;
    sc.far = 14000;
    this.sun.shadow.bias = -0.00001; // ~0.14 m across the 1..14000 depth range
    this.sun.shadow.normalBias = 0.05; // ~one shadow-map texel (120 m / 2048)

    // world (rebuildable)
    this.sky = buildSky();
    this.scene.add(this.sky.stars);
    this.scene.add(this.sky.mesh);
    // Approach lighting: dark by day, glowing after dusk. Rebuilt with the
    // world, since its positions come from the active layout. applyWorld()
    // re-binds this material to the group it actually puts in the scene —
    // keeping the constructor's instance would leave the daylight cycle
    // driving an orphaned material while the lights stayed dark forever.
    this.nightLights = buildNightLights().material;
    this.scene.add(this.nightRoot);
    const ocean = buildOcean();
    this.oceanMat = ocean.material as THREE.MeshStandardMaterial;
    this.scene.add(ocean);
    this.scene.add(this.worldRoot);
    this.applyWorld(initialPaint);

    this.jet = buildAircraft(aircraft);
    this.jetGroup = this.jet.group;
    this.scene.add(this.jetGroup);
    this.scaleCues = new ScaleCues(this.scene);
  }

  /**
   * Swap the player's airframe, e.g. when the aircraft is changed on the menu.
   * Only geometry is released — the airframe materials are module-shared.
   */
  setAircraft(id: AircraftId): void {
    this.jetGroup.removeFromParent();
    disposeGeometryTree(this.jetGroup);
    this.jet = buildAircraft(id);
    this.jetGroup = this.jet.group;
    this.scene.add(this.jetGroup);
  }

  /**
   * Drive the whole scene look from a sun position: light colour/intensity,
   * hemisphere fill, fog and the sky dome. Called every frame by the sim.
   */
  applyDaylight(sun: SunPosition, sunDir: THREE.Vector3, focus: THREE.Vector3): void {
    const env = sampleEnvironment(sun, this.env);
    this.sunDir.copy(sunDir).normalize();

    // Keep the sun light outside the world but pointed at the aircraft, so the
    // shadow camera stays tight and the shadows land under the jet.
    const d = 12000;
    this.sun.position.copy(focus).addScaledVector(this.sunDir, d);
    this.sun.target.position.copy(focus);
    this.sun.target.updateMatrixWorld();

    this.sun.color.copy(env.sunColor);
    this.sun.intensity = env.sunIntensity;
    this.hemi.color.copy(env.hemiSky);
    this.hemi.groundColor.copy(env.hemiGround);
    this.hemi.intensity = env.hemiIntensity;
    this.ambient.intensity = env.ambient;

    const fog = this.scene.fog as THREE.Fog | null;
    if (fog) {
      fog.color.copy(env.fogColor);
      fog.near = env.fogNear;
      fog.far = env.fogFar;
    }
    this.renderer.setClearColor(env.fogColor, 1);

    // Ocean tint follows the light so night water is not a bright blue slab.
    this.oceanMat.color.copy(env.fogColor).lerp(this.tmpColor.setRGB(0.05, 0.16, 0.24), 0.75);

    // Deck and runway lights come up as the sun goes down, so night approaches
    // stay flyable instead of being a black deck against black water. The same
    // darkness drives the ships' own lamps and every aircraft's nav lights.
    this.dark = clamp01((6 - sun.elevationDeg) / 12);
    this.nightLights.emissiveIntensity = this.dark * 2.4;
    // Cloud decks, ground shadow and masts read off the same sun and focus.
    this.scaleCues.update(focus, this.camera.position, this.sunDir, this.dark);

    this.sky.set(this.sunDir, env.sunColor, env.zenith, env.horizon, env.glow);
    // The dome and star field ride with the viewer: they are effectively at
    // infinity, so this keeps them inside the camera's far plane.
    this.sky.follow(focus);
    this.sky.setStarsVisible(env.starsVisible);
  }

  /** Rebuild terrain + airfield + carriers for the currently active seed. */
  applyWorld(paint: TerrainPaint): void {
    this.terrainPaint = paint;
    disposeTree(this.worldRoot);
    this.worldRoot.clear();
    this.worldRoot.add(buildTerrain(this.quality, paint));
    this.worldRoot.add(buildAirfield());
    this.worldRoot.add(buildAirbaseDetails());
    this.scenery = buildScenery(this.quality);
    this.worldRoot.add(this.scenery);
    for (const c of carriers()) this.worldRoot.add(buildCarrier(c));

    // Deck and runway lights follow the active layout too, or they would stay
    // where the previous world's carriers were.
    disposeTree(this.nightRoot);
    this.nightRoot.clear();
    const night = buildNightLights();
    this.nightLights = night.material;
    this.nightRoot.add(night.group);
    // These transforms never move. Avoid recalculating hundreds of matrices
    // every frame; the moving aircraft and hostile carrier remain dynamic.
    for (const root of [this.worldRoot, this.nightRoot]) {
      root.traverse(o => { o.updateMatrix(); o.matrixAutoUpdate = false; });
      root.updateMatrixWorld(true);
      root.traverse(o => { o.matrixWorldAutoUpdate = false; });
    }
  }

  applyQuality(q: Quality): void {
    const geometryChanged = q !== this.quality;
    this.quality = q;
    const shadows = q !== "low";
    // These are only set in the constructor today, so switching quality at
    // runtime would otherwise leave shadows stuck at their startup state.
    this.renderer.shadowMap.enabled = shadows;
    this.sun.castShadow = shadows;
    const pr =
      q === "low"
        ? 0.75
        : q === "medium"
          ? Math.min(window.devicePixelRatio, 1.5)
          : Math.min(window.devicePixelRatio, 2);
    this.basePixelRatio = pr;
    this.resolutionBudget.reset();
    this.renderer.setPixelRatio(pr);
    this.resize();
    if (geometryChanged && this.terrainPaint) this.applyWorld(this.terrainPaint);
  }

  resize(): void {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();
  }

  setAdaptiveResolution(enabled: boolean): void {
    this.adaptiveResolution = enabled;
    this.resolutionBudget.reset();
    this.renderer.setPixelRatio(this.basePixelRatio);
    this.resize();
  }

  updateFrameBudget(nowMs: number): void {
    if (this.resolutionBudget.sample(nowMs, this.adaptiveResolution, !document.hidden)) {
      this.renderer.setPixelRatio(this.basePixelRatio * this.resolutionBudget.scale);
      this.resize();
    }
  }

  /** Release GPU resources (world, cues, airframe, renderer). */
  dispose(): void {
    this.scaleCues.dispose();
    this.renderer.dispose();
  }

  render(): void {
    // Small scenery contributes little beyond a few kilometres. Keep terrain,
    // ships, runway and combat aircraft visible at their full existing ranges.
    for (const child of this.scenery.children) {
      const bounds = (child as THREE.InstancedMesh).boundingSphere;
      child.visible = !bounds || this.camera.position.distanceToSquared(bounds.center) < (bounds.radius + 5000) ** 2;
    }
    // slow swell drift: gives motion cues when judging height over water
    const t = performance.now() / 1000;
    const waves = this.oceanMat.bumpMap;
    // Wrapped into one tile: the same drift speed, without letting the offset
    // grow into the range where float32 UV precision starts to quantise and
    // the swell stutters on a long flight.
    if (waves) waves.offset.set((t * 0.006) % 1, (t * 0.0025) % 1);
    // Lights blink on wall-clock time, not sim time, so a paused night scene
    // still reads as a living one.
    updateAirLights(this.dark, t);
    updateShipLights(this.dark, t);
    this.renderer.render(this.scene, this.camera);
  }
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function disposeMaterial(m: THREE.Material): void {
  // Nav lights, ship lamps and other fleet-wide materials outlive a rebuilt
  // world: disposing one here would pull the lights off every other ship.
  if (isSharedMaterial(m)) return;
  const ref = m as THREE.Material & {
    map?: THREE.Texture | null;
    bumpMap?: THREE.Texture | null;
    roughnessMap?: THREE.Texture | null;
    normalMap?: THREE.Texture | null;
  };
  ref.map?.dispose();
  ref.bumpMap?.dispose();
  ref.roughnessMap?.dispose();
  ref.normalMap?.dispose();
  m.dispose();
}

/** Release only geometries under a node, leaving shared materials intact. */
function disposeGeometryTree(root: THREE.Object3D): void {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
  });
}

function disposeTree(root: THREE.Object3D): void {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if ((mesh as THREE.InstancedMesh).isInstancedMesh) (mesh as THREE.InstancedMesh).dispose();
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) {
      for (const mm of mat) disposeMaterial(mm);
    } else if (mat) {
      disposeMaterial(mat);
    }
  });
}
