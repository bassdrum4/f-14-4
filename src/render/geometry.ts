// F-14 Tomcat, built from tapered boxes. Iconic silhouette over poly count.
// Returns named parts the rig animates each frame (sweep, surfaces, gear, AB).

import * as THREE from "three";
import type { AircraftId } from "../sim/aircraft";
import { addAirLights, type AirLightSpots } from "./lights";

/**
 * Named parts every airframe exposes so the rig can animate it: wings (which
 * the F-14 sweeps), control surfaces, gear, canopy, intakes and the burner.
 */
export interface TomcatMesh {
  group: THREE.Group;
  wings: [THREE.Group, THREE.Group];
  wingPanels: [THREE.Mesh, THREE.Mesh];
  stabs: [THREE.Group, THREE.Group];
  rudders: [THREE.Mesh, THREE.Mesh];
  flaps: [THREE.Group, THREE.Group];
  gear: THREE.Group;
  canopy: THREE.Mesh;
  intakes: THREE.Group;
  afterburner: THREE.Mesh;
  /** False for fixed-wing types: the rig leaves their wings where built. */
  sweepable?: boolean;
  /** Rotary wing: the main rotor disc and the tail rotor, spun by the rig. */
  rotor?: THREE.Object3D;
  tailRotor?: THREE.Object3D;
}

const MAT_BODY = new THREE.MeshStandardMaterial({
  color: 0x9aa3ad,
  roughness: 0.55,
  metalness: 0.35,
});
const MAT_DARK = new THREE.MeshStandardMaterial({
  color: 0x23282e,
  roughness: 0.85,
  metalness: 0.2,
});
const MAT_GLASS = new THREE.MeshStandardMaterial({
  color: 0x2a3d4a,
  roughness: 0.15,
  metalness: 0.6,
  transparent: true,
  opacity: 0.85,
});
const MAT_FLAME = new THREE.MeshBasicMaterial({
  color: 0x7fc4ff,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const MAT_THIN = new THREE.MeshStandardMaterial({
  color: 0x8f98a2,
  roughness: 0.6,
  metalness: 0.3,
  side: THREE.DoubleSide,
});

/**
 * Box of length `len` along Z, cross-section tapering from (w0,h0) at the
 * front (z=-len/2) to (w1,h1) at the back, with the back offset by (cx,cy).
 * Winding stays valid, so computeVertexNormals keeps outward normals.
 */
/** Bandit materials: standard material without the shared-instance pitfalls. */
function std(color: number, roughness: number, metalness: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

interface ShipMats {
  matBody: THREE.Material;
  matDark: THREE.Material;
  matThin: THREE.Material;
  matGlass: THREE.Material;
}

/**
 * Player jets share the stock grey materials (rebuilt by swapping geometry
 * only); bandits get their own dark-red set so hostiles read at a glance.
 */
function makeMats(paint: "gray" | "bandit"): ShipMats {
  if (paint === "bandit") {
    return {
      matBody: std(0x8a4438, 0.6, 0.3),
      matDark: std(0x2a2224, 0.85, 0.2),
      matThin: std(0x743a30, 0.65, 0.25),
      matGlass: new THREE.MeshStandardMaterial({
        color: 0x3d2a2a, roughness: 0.15, metalness: 0.6, transparent: true, opacity: 0.85,
      }),
    };
  }
  return { matBody: MAT_BODY, matDark: MAT_DARK, matThin: MAT_THIN, matGlass: MAT_GLASS };
}

/**
 * Common shadow flags — the airframe casts, the additive plume never darkens
 * the deck — and the nav light set, which every airframe carries so it is
 * visible at night (its own and the hostile ones alike).
 */
function finishShip(
  group: THREE.Group,
  afterburner: THREE.Mesh,
  spots: AirLightSpots,
  wings?: { right: THREE.Object3D; left: THREE.Object3D; tipSpan: number },
): void {
  addAirLights(group, spots, wings);
  group.traverse((o) => {
    // Mesh bounds follow the animated parent transforms. Off-screen aircraft
    // must be culled from both the colour pass and the sun's shadow pass.
    o.frustumCulled = true;
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  // Light sprites face the camera from every angle, but still cull off-screen.
  group.traverse((o) => {
    if ((o as THREE.Sprite).isSprite) {
      o.frustumCulled = true;
      o.renderOrder = 4;
    }
  });
  afterburner.castShadow = false;
}

/** Landing gear at the flight model's wheel stations, shared by every type. */
function buildGearLegs(matDark: THREE.Material): THREE.Group {
  const gear = new THREE.Group();
  add(gear, new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), matDark, 0, -1.28, -6.0);
  const nw = wheel(0.3, 0.12);
  nw.position.set(0, -1.73, -6.0);
  gear.add(nw);
  for (const sx of [-1, 1]) {
    add(gear, new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8), matDark, sx * 2.3, -1.25, 0.5);
    const mw = wheel(0.33, 0.14);
    mw.position.set(sx * 2.3, -1.7, 0.5);
    gear.add(mw);
  }
  return gear;
}

/**
 * A fixed wing/flap pair using the house convention: panels rotate ±90° about Y
 * to point their span outboard, so the wing is built along local +Z and then
 * swung out.
 *
 * The sweep sign matters and is easy to get backwards: the nose is at -Z, so a
 * swept wing's tip belongs AFT (+Z) of the root. Rotating by (90° - sweep) puts
 * the tip outboard and aft; (90° + sweep) would sweep it forward, across the
 * intake and over the cockpit, which is what the F/A-18 and A-6 shipped with.
 * Headless geometry checks pin both the direction and the angle
 * (scripts/diag-aircraft.ts).
 */
function buildWingPair(
  sx: number,
  root: [number, number, number],
  rootChord: number,
  tipChord: number,
  span: number,
  sweep: number,
  matThin: THREE.Material,
): { pivot: THREE.Group; panel: THREE.Mesh; flap: THREE.Group } {
  const pivot = new THREE.Group();
  pivot.position.set(sx * root[0], root[1], root[2]);
  const panelGeom = taperedBox(rootChord, 0.26, tipChord, 0.1, span);
  panelGeom.translate(0, 0, span / 2);
  const panel = new THREE.Mesh(panelGeom, matThin);
  panel.rotation.y = sx * (Math.PI / 2 - sweep);
  pivot.add(panel);
  const flapPivot = new THREE.Group();
  flapPivot.position.set(-sx * rootChord * 0.42, 0, span * 0.42);
  const flap = new THREE.Mesh(new THREE.BoxGeometry(rootChord * 0.45, 0.09, span * 0.42), matThin);
  flap.position.x = -sx * rootChord * 0.22;
  flapPivot.add(flap);
  panel.add(flapPivot);
  return { pivot, panel, flap: flapPivot };
}

function taperedBox(
  w0: number,
  h0: number,
  w1: number,
  h1: number,
  len: number,
  cx = 0,
  cy = 0,
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(1, 1, 1);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const t = z + 0.5; // 0 front, 1 back
    const w = w0 + (w1 - w0) * t;
    const h = h0 + (h1 - h0) * t;
    pos.setX(i, pos.getX(i) * w + cx * t);
    pos.setY(i, pos.getY(i) * h + cy * t);
    pos.setZ(i, z * len);
  }
  g.computeVertexNormals();
  return g;
}

function add(
  parent: THREE.Object3D,
  geom: THREE.BufferGeometry,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(geom, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function wheel(r: number, halfW: number): THREE.Mesh {
  const g = new THREE.CylinderGeometry(r, r, halfW * 2, 12);
  const m = new THREE.Mesh(g, MAT_DARK);
  m.rotation.z = Math.PI / 2;
  return m;
}

function buildTomcatMesh(paint: "gray" | "bandit"): TomcatMesh {
  const group = new THREE.Group();
  const { matBody, matDark, matThin, matGlass } = makeMats(paint);

  // --- fuselage segments (nose at -Z) ---
  add(group, taperedBox(0.5, 0.45, 1.7, 1.5, 1.9, 0, -0.08), matBody, 0, 0.1, -8.6); // radome
  add(group, taperedBox(1.7, 1.5, 3.0, 2.2, 3.9), matBody, 0, 0, -5.9); // forward
  add(group, taperedBox(3.0, 2.2, 3.5, 2.45, 7.0), matBody, 0, 0, -0.5); // mid
  add(group, taperedBox(3.5, 2.45, 3.1, 2.1, 4.6, 0, 0.1), matBody, 0, 0, 5.3); // aft
  add(group, taperedBox(3.1, 2.1, 2.6, 1.6, 1.8, 0, -0.25), matBody, 0, 0, 8.5); // nozzle deck
  add(group, taperedBox(2.0, 0.7, 2.3, 0.8, 6.0), matBody, 0, 1.1, 4.5); // spine
  add(group, taperedBox(1.2, 0.6, 2.0, 0.8, 2.2), matBody, 0, 0.95, -2.9); // cockpit fairing

  // gloves (fixed wing root ahead of pivot)
  add(group, taperedBox(1.0, 0.34, 2.0, 0.22, 3.0), matThin, 1.9, 0.28, -1.2);
  add(group, taperedBox(1.0, 0.34, 2.0, 0.22, 3.0), matThin, -1.9, 0.28, -1.2);

  // intakes
  const intakes = new THREE.Group();
  add(intakes, taperedBox(1.2, 1.7, 1.1, 1.9, 3.2), matBody, 2.25, -0.1, -3.0);
  add(intakes, taperedBox(1.2, 1.7, 1.1, 1.9, 3.2), matBody, -2.25, -0.1, -3.0);
  const inlet = new THREE.CylinderGeometry(0.52, 0.52, 0.3, 16);
  const in1 = add(intakes, inlet, matDark, 2.25, 0.2, -4.65);
  in1.rotation.x = Math.PI / 2;
  const in2 = add(intakes, inlet, matDark, -2.25, 0.2, -4.65);
  in2.rotation.x = Math.PI / 2;
  group.add(intakes);

  // canopy
  const canopy = add(
    group,
    new THREE.SphereGeometry(0.85, 16, 12), matGlass,
    0,
    1.15,
    -5.6,
  );
  canopy.scale.set(0.95, 0.8, 2.3);

  // engines / nozzles
  const nozzle = new THREE.CylinderGeometry(0.58, 0.66, 1.2, 14, 1, true);
  for (const sx of [-1, 1]) {
    const n = add(group, nozzle, matDark, sx * 0.85, -0.15, 9.4);
    n.rotation.x = Math.PI / 2;
  }

  // afterburner flames
  const flameGeom = new THREE.ConeGeometry(0.5, 2.6, 12, 1, true);
  const afterburner = new THREE.Mesh(flameGeom, MAT_FLAME.clone());
  afterburner.rotation.x = Math.PI / 2;
  afterburner.position.set(0, -0.15, 11.0);
  group.add(afterburner);

  // --- wings (sweep about Y at the pivot) ---
  const wings: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  const wingPanels: [THREE.Mesh, THREE.Mesh] = [] as unknown as [THREE.Mesh, THREE.Mesh];
  const flaps: [THREE.Group, THREE.Group] = [] as unknown as [THREE.Group, THREE.Group];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const pivot = new THREE.Group();
    pivot.position.set(sx * 1.55, 0.25, 0.8);
    // panel: built along +Z (span), then rotated so +Z -> outward ±X
    const panelGeom = taperedBox(4.3, 0.3, 2.3, 0.12, 7.8);
    panelGeom.translate(0, 0, 3.9);
    const panel = new THREE.Mesh(panelGeom, matThin);
    panel.rotation.y = sx * (Math.PI / 2);
    pivot.add(panel);
    // flap: hinged sub-panel on the trailing edge. The two panel frames are
    // 180° apart (rotation.y = ±90°), so local X points forward on the right
    // wing and aft on the left — the hinge and its offset mirror with the wing.
    const flapPivot = new THREE.Group();
    flapPivot.position.set(-sx * 1.85, 0, 2.9);
    const flapGeom = new THREE.BoxGeometry(1.0, 0.09, 3.6);
    const flap = new THREE.Mesh(flapGeom, matThin);
    flap.position.x = -sx * 0.5;
    flapPivot.add(flap);
    panel.add(flapPivot);
    group.add(pivot);
    wings[i] = pivot;
    wingPanels[i] = panel;
    flaps[i] = flapPivot;
  }

  // --- horizontal stabilators ---
  const stabs: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const pivot = new THREE.Group();
    pivot.position.set(sx * 1.35, -0.45, 7.4);
    const geom = taperedBox(2.0, 0.16, 1.1, 0.08, 3.4);
    geom.translate(0, 0, 1.7);
    const panel = new THREE.Mesh(geom, matThin);
    panel.rotation.y = sx * (Math.PI / 2);
    pivot.add(panel);
    pivot.rotation.z = -sx * 0.06; // slight anhedral
    group.add(pivot);
    stabs[i] = pivot;
  }

  // --- twin vertical fins + rudders ---
  const rudders: [THREE.Mesh, THREE.Mesh] = [] as unknown as [THREE.Mesh, THREE.Mesh];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const fin = add(group, taperedBox(0.18, 3.0, 0.14, 2.0, 3.0, 0.35, 0), matBody, sx * 1.7, 1.85, 7.9);
    const rud = add(fin, new THREE.BoxGeometry(0.1, 2.0, 0.75), matThin, 0.2, -0.35, 1.75);
    rudders[i] = rud;
  }
  // ventral fins
  add(group, taperedBox(0.12, 0.8, 0.1, 0.5, 1.6, 0, 0.25), matThin, 1.45, -1.05, 6.9);
  add(group, taperedBox(0.12, 0.8, 0.1, 0.5, 1.6, 0, 0.25), matThin, -1.45, -1.05, 6.9);

  // --- landing gear ---
  const gear = new THREE.Group();
  // tyre bottoms are coplanar with the mains (flight.ts WHEEL_BOTTOM_Y = -2.03)
  const noseStrut = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8);
  add(gear, noseStrut, matDark, 0, -1.28, -6.0);
  const nw = wheel(0.3, 0.12);
  nw.position.set(0, -1.73, -6.0);
  gear.add(nw);
  for (const sx of [-1, 1]) {
    const strut = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
    add(gear, strut, matDark, sx * 2.3, -1.25, 0.5);
    const mw = wheel(0.33, 0.14);
    mw.position.set(sx * 2.3, -1.7, 0.5);
    gear.add(mw);
  }
  group.add(gear);

  // The sun's shadow camera is framed tightly around the jet (see
  // renderer.ts), so the airframe is the caster that matters.
  finishShip(
    group,
    afterburner,
    { leftTip: [-9.2, 0.3, 0.9], rightTip: [9.2, 0.3, 0.9], tail: [0, 1.0, 10.2], beacon: [0, 1.7, 4.2] },
    { right: wingPanels[0], left: wingPanels[1], tipSpan: 7.7 },
  );

  return {
    group,
    wings,
    wingPanels,
    stabs,
    rudders,
    flaps,
    gear,
    canopy,
    intakes,
    afterburner,
    sweepable: true,
  };
}

/** F/A-18C Hornet: light twin-tail multirole, fixed moderately-swept wing. */
function buildHornetMesh(paint: "gray" | "bandit"): TomcatMesh {
  const { matBody, matDark, matThin, matGlass } = makeMats(paint);
  const group = new THREE.Group();

  // --- fuselage (nose at -Z) ---
  add(group, taperedBox(0.35, 0.35, 1.2, 1.05, 2.2, 0, -0.05), matBody, 0, 0.05, -6.6); // radome
  add(group, taperedBox(1.2, 1.05, 2.2, 1.7, 4.0), matBody, 0, 0, -3.4); // forward
  add(group, taperedBox(2.2, 1.7, 2.6, 1.9, 6.6), matBody, 0, 0, 2.0); // mid
  add(group, taperedBox(2.6, 1.9, 2.2, 1.5, 2.4, 0, 0.1), matBody, 0, 0, 6.5); // aft
  add(group, taperedBox(1.5, 0.5, 1.8, 0.55, 4.4), matBody, 0, 0.8, 1.0); // spine
  add(group, taperedBox(1.0, 0.45, 1.5, 0.55, 1.6), matBody, 0, 0.72, -1.6); // cockpit fairing

  // LERX strakes along the wing roots
  for (const sx of [-1, 1]) {
    const lerx = add(group, taperedBox(0.85, 0.16, 1.7, 0.12, 3.2), matThin, sx * 1.55, 0.16, -1.5);
    lerx.rotation.y = sx * 0.2;
  }

  // intakes (rectangular, under the LERX)
  const intakes = new THREE.Group();
  for (const sx of [-1, 1]) {
    add(intakes, taperedBox(1.0, 1.25, 0.95, 1.4, 2.8), matBody, sx * 1.75, -0.2, -2.1);
    add(intakes, new THREE.BoxGeometry(0.82, 1.05, 0.2), matDark, sx * 1.75, -0.1, -3.5);
  }
  group.add(intakes);

  // bubble canopy, set well forward
  const canopy = add(group, new THREE.SphereGeometry(0.7, 16, 12), matGlass, 0, 0.9, -4.0);
  canopy.scale.set(0.95, 0.85, 2.1);

  // canted twin tails with rudders
  const rudders: [THREE.Mesh, THREE.Mesh] = [] as unknown as [THREE.Mesh, THREE.Mesh];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const fin = add(group, taperedBox(0.16, 2.2, 0.12, 1.4, 2.4, 0.3, 0), matBody, sx * 1.25, 1.5, 5.6);
    fin.rotation.z = -sx * 0.3;
    rudders[i] = add(fin, new THREE.BoxGeometry(0.09, 1.4, 0.5), matThin, 0.16, -0.35, 1.1);
  }

  // twin nozzles + a single blended burner plume
  const nozzle = new THREE.CylinderGeometry(0.48, 0.56, 0.9, 12, 1, true);
  for (const sx of [-1, 1]) {
    const n = add(group, nozzle, matDark, sx * 0.78, -0.2, 7.6);
    n.rotation.x = Math.PI / 2;
  }
  const afterburner = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.2, 12, 1, true), MAT_FLAME.clone());
  afterburner.rotation.x = Math.PI / 2;
  afterburner.position.set(0, -0.2, 8.8);
  group.add(afterburner);

  // wings (fixed sweep)
  const wings: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  const wingPanels: [THREE.Mesh, THREE.Mesh] = [] as unknown as [THREE.Mesh, THREE.Mesh];
  const flaps: [THREE.Group, THREE.Group] = [] as unknown as [THREE.Group, THREE.Group];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const w = buildWingPair(sx, [1.35, 0.0, 0.4], 3.4, 1.7, 5.4, 0.34, matThin);
    group.add(w.pivot);
    wings[i] = w.pivot;
    wingPanels[i] = w.panel;
    flaps[i] = w.flap;
  }

  // all-moving stabs
  const stabs: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const pivot = new THREE.Group();
    pivot.position.set(sx * 1.0, -0.35, 6.0);
    const geom = taperedBox(1.7, 0.14, 0.9, 0.06, 2.6);
    geom.translate(0, 0, 1.3);
    const panel = new THREE.Mesh(geom, matThin);
    panel.rotation.y = sx * (Math.PI / 2);
    pivot.add(panel);
    pivot.rotation.z = -sx * 0.05;
    group.add(pivot);
    stabs[i] = pivot;
  }

  const gear = buildGearLegs(matDark);
  group.add(gear);
  finishShip(
    group,
    afterburner,
    { leftTip: [-6.6, 0.05, 0.9], rightTip: [6.6, 0.05, 0.9], tail: [0, 0.9, 8.4], beacon: [0, 1.4, 2.4] },
    { right: wingPanels[0], left: wingPanels[1], tipSpan: 5.3 },
  );

  return {
    group, wings, wingPanels, stabs, rudders, flaps, gear, canopy, intakes, afterburner,
    sweepable: false,
  };
}

/** A-6E Intruder: fat armoured bomb truck, single tail, no afterburner. */
function buildIntruderMesh(paint: "gray" | "bandit"): TomcatMesh {
  const { matBody, matDark, matThin, matGlass } = makeMats(paint);
  const group = new THREE.Group();

  // --- fuselage: rounded nose into a fat bomb-bay belly (nose at -Z) ---
  const nose = add(group, new THREE.SphereGeometry(1.15, 16, 12), matBody, 0, 0, -6.9);
  nose.scale.set(1.0, 0.95, 1.7);
  add(group, taperedBox(2.3, 2.1, 2.6, 2.35, 4.6), matBody, 0, -0.05, -3.2);
  add(group, taperedBox(2.6, 2.35, 2.7, 2.2, 5.8), matBody, 0, -0.05, 2.0);
  add(group, taperedBox(2.7, 2.2, 2.1, 1.5, 3.2, 0, 0.2), matBody, 0, 0, 6.4);
  add(group, taperedBox(1.7, 0.5, 2.0, 0.55, 4.0), matBody, 0, 1.05, 0.5);

  // wide side-by-side canopy
  const canopy = add(group, new THREE.SphereGeometry(0.95, 16, 12), matGlass, 0, 1.25, -4.4);
  canopy.scale.set(1.2, 0.72, 1.7);

  // round side intakes beside the crew
  const intakes = new THREE.Group();
  for (const sx of [-1, 1]) {
    const duct = add(intakes, new THREE.CylinderGeometry(0.72, 0.72, 2.0, 14), matBody, sx * 1.45, 0.15, -3.9);
    duct.rotation.x = Math.PI / 2;
    const lip = add(intakes, new THREE.CylinderGeometry(0.62, 0.62, 0.2, 14), matDark, sx * 1.45, 0.15, -4.95);
    lip.rotation.x = Math.PI / 2;
  }
  group.add(intakes);

  // single tall tail with the rudder mounted on it (both rig slots share it)
  const fin = add(group, taperedBox(0.22, 3.2, 0.18, 2.0, 2.8, 0.5, 0), matBody, 0, 2.0, 6.6);
  const rud = add(fin, new THREE.BoxGeometry(0.12, 2.2, 0.6), matThin, 0.18, -0.5, 1.35);
  const rudders: [THREE.Mesh, THREE.Mesh] = [rud, rud];

  // small nozzles (no burner on the Intruder)
  const nozzle = new THREE.CylinderGeometry(0.4, 0.46, 0.8, 12, 1, true);
  for (const sx of [-1, 1]) {
    const n = add(group, nozzle, matDark, sx * 0.85, -0.3, 7.9);
    n.rotation.x = Math.PI / 2;
  }
  // inert burner mesh so the rig can animate it (always invisible: no AB)
  const afterburner = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.6, 10, 1, true), MAT_FLAME.clone());
  afterburner.rotation.x = Math.PI / 2;
  afterburner.position.set(0, -0.3, 9.0);
  afterburner.visible = false;
  group.add(afterburner);

  // big straight wings
  const wings: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  const wingPanels: [THREE.Mesh, THREE.Mesh] = [] as unknown as [THREE.Mesh, THREE.Mesh];
  const flaps: [THREE.Group, THREE.Group] = [] as unknown as [THREE.Group, THREE.Group];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const w = buildWingPair(sx, [1.5, 0.0, 0.0], 4.0, 2.0, 6.4, 0.12, matThin);
    group.add(w.pivot);
    wings[i] = w.pivot;
    wingPanels[i] = w.panel;
    flaps[i] = w.flap;
  }

  const stabs: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const pivot = new THREE.Group();
    pivot.position.set(sx * 1.2, -0.15, 6.3);
    const geom = taperedBox(2.2, 0.16, 1.2, 0.07, 3.0);
    geom.translate(0, 0, 1.5);
    const panel = new THREE.Mesh(geom, matThin);
    panel.rotation.y = sx * (Math.PI / 2);
    pivot.add(panel);
    pivot.rotation.z = -sx * 0.05;
    group.add(pivot);
    stabs[i] = pivot;
  }

  const gear = buildGearLegs(matDark);
  group.add(gear);
  finishShip(
    group,
    afterburner,
    { leftTip: [-7.7, 0.05, 0.9], rightTip: [7.7, 0.05, 0.9], tail: [0, 3.3, 7.4], beacon: [0, 1.9, 0.6] },
    { right: wingPanels[0], left: wingPanels[1], tipSpan: 6.3 },
  );

  return {
    group, wings, wingPanels, stabs, rudders, flaps, gear, canopy, intakes, afterburner,
    sweepable: false,
  };
}


/** F-8E Crusader: the last gunfighter — supersonic, high swept wing, nose inlet. */
function buildCrusaderMesh(paint: "gray" | "bandit"): TomcatMesh {
  const { matBody, matDark, matThin, matGlass } = makeMats(paint);
  const group = new THREE.Group();

  // --- fuselage: a tube with a nose inlet (nose at -Z) ---
  add(group, taperedBox(1.32, 1.3, 1.55, 1.5, 1.5, 0, -0.04), matBody, 0, -0.05, -7.35); // inlet lip
  add(group, taperedBox(1.55, 1.5, 1.72, 1.6, 4.6), matBody, 0, 0, -4.3); // forward
  add(group, taperedBox(1.72, 1.6, 1.86, 1.72, 6.4), matBody, 0, 0, 1.2); // mid
  add(group, taperedBox(1.86, 1.72, 1.5, 1.2, 3.6, 0, 0.16), matBody, 0, 0, 6.2); // aft
  add(group, taperedBox(1.1, 0.5, 1.35, 0.6, 2.2), matBody, 0, 0.78, -0.4); // dorsal spine

  // nose inlet: a dark ring with the translating centrebody
  const ring = add(group, new THREE.CylinderGeometry(0.64, 0.64, 0.34, 16, 1, true), matDark, 0, -0.05, -8.1);
  ring.rotation.x = Math.PI / 2;
  const spike = add(group, new THREE.ConeGeometry(0.34, 0.95, 12), matDark, 0, -0.05, -8.25);
  spike.rotation.x = -Math.PI / 2;

  // canopy, set forward of the wing
  const canopy = add(group, new THREE.SphereGeometry(0.78, 16, 12), matGlass, 0, 0.95, -4.0);
  canopy.scale.set(0.95, 0.82, 2.2);

  // single tall fin with the rudder mounted on it
  const fin = add(group, taperedBox(0.2, 2.9, 0.16, 1.9, 2.6, 0.55, 0), matBody, 0, 1.7, 6.35);
  const rud = add(fin, new THREE.BoxGeometry(0.1, 2.0, 0.7), matThin, 0.2, -0.42, 1.35);
  const rudders: [THREE.Mesh, THREE.Mesh] = [rud, rud];
  // ventral fins under the tail
  for (const sx of [-1, 1]) {
    add(group, taperedBox(0.12, 0.72, 0.1, 0.42, 1.5, 0, 0.2), matThin, sx * 0.92, -0.85, 6.2);
  }

  // exhaust nozzle + burner
  const nozzle = add(group, new THREE.CylinderGeometry(0.55, 0.62, 1.0, 14, 1, true), matDark, 0, 0, 7.75);
  nozzle.rotation.x = Math.PI / 2;
  const afterburner = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.4, 12, 1, true), MAT_FLAME.clone());
  afterburner.rotation.x = Math.PI / 2;
  afterburner.position.set(0, 0, 9.05);
  group.add(afterburner);

  // --- high-mounted swept wing (the F-8's variable-incidence wing) ---
  const wings: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  const wingPanels: [THREE.Mesh, THREE.Mesh] = [] as unknown as [THREE.Mesh, THREE.Mesh];
  const flaps: [THREE.Group, THREE.Group] = [] as unknown as [THREE.Group, THREE.Group];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    // 42 deg quarter-chord sweep, mounted high on the fuselage
    const w = buildWingPair(sx, [1.0, 0.5, 0.6], 3.3, 1.5, 4.5, (42 * Math.PI) / 180, matThin);
    group.add(w.pivot);
    wings[i] = w.pivot;
    wingPanels[i] = w.panel;
    flaps[i] = w.flap;
  }

  // --- low all-moving tailplane ---
  const stabs: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.95, -0.5, 6.0);
    const geom = taperedBox(1.9, 0.15, 1.0, 0.07, 2.4);
    geom.translate(0, 0, 1.2);
    const panel = new THREE.Mesh(geom, matThin);
    panel.rotation.y = sx * (Math.PI / 2);
    pivot.add(panel);
    pivot.rotation.z = -sx * 0.05;
    group.add(pivot);
    stabs[i] = pivot;
  }

  const gear = buildGearLegs(matDark);
  group.add(gear);
  const intakes = new THREE.Group(); // the F-8's inlet is the nose, kept for the rig
  group.add(intakes);
  finishShip(
    group,
    afterburner,
    { leftTip: [-5.5, 0.55, 0.6], rightTip: [5.5, 0.55, 0.6], tail: [0, 3.0, 7.4], beacon: [0, 1.5, -0.4] },
    { right: wingPanels[0], left: wingPanels[1], tipSpan: 4.4 },
  );

  return {
    group, wings, wingPanels, stabs, rudders, flaps, gear, canopy, intakes, afterburner,
    sweepable: false,
  };
}

/** SH-60B Seahawk: a four-blade rotor, a fat fuselage and a long tail boom. */
function buildSeahawkMesh(paint: "gray" | "bandit"): TomcatMesh {
  const { matBody, matDark, matThin, matGlass } = makeMats(paint);
  const group = new THREE.Group();

  // --- fuselage (nose at -Z): a rounded nose into a boxy cabin and tail boom ---
  const nose = add(group, new THREE.SphereGeometry(1.15, 16, 12), matBody, 0, -0.1, -5.6);
  nose.scale.set(1.0, 1.0, 1.9);
  add(group, taperedBox(2.3, 2.1, 2.5, 2.35, 4.2), matBody, 0, -0.05, -2.2);
  add(group, taperedBox(2.5, 2.35, 2.3, 2.1, 4.6), matBody, 0, -0.05, 1.6);
  add(group, taperedBox(2.3, 2.1, 1.0, 0.95, 5.4, 0, 0.35), matBody, 0, 0.25, 6.0); // tail boom
  add(group, taperedBox(1.6, 0.4, 1.9, 0.5, 3.4), matBody, 0, 1.2, -0.4); // engine deck

  // canopy, set well forward
  const canopy = add(group, new THREE.SphereGeometry(0.9, 16, 12), matGlass, 0, 0.7, -4.4);
  canopy.scale.set(1.05, 0.7, 1.7);

  // engine cowl intakes on the upper deck
  const intakes = new THREE.Group();
  for (const sx of [-1, 1]) {
    add(intakes, new THREE.CylinderGeometry(0.42, 0.42, 0.5, 14), matDark, sx * 0.55, 1.5, 0.6).rotation.x = Math.PI / 2;
  }
  group.add(intakes);

  // --- single tall fin + tail rotor (two blades, vertical plane) ---
  const fin = add(group, taperedBox(0.2, 2.6, 0.16, 1.6, 2.4, 0.5, 0), matBody, 0, 1.7, 8.2);
  const rud = add(fin, new THREE.BoxGeometry(0.1, 1.7, 0.6), matThin, 0.18, -0.4, 1.25);
  const rudders: [THREE.Mesh, THREE.Mesh] = [rud, rud];
  const tailRotor = new THREE.Group();
  tailRotor.position.set(0.35, 2.0, 8.7);
  for (let i = 0; i < 2; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 1.9), matThin);
    blade.rotation.x = (i * Math.PI) / 2;
    blade.position.y = 0;
    tailRotor.add(blade);
  }
  group.add(tailRotor);

  // --- main rotor: four blades on a mast above the cabin ---
  const rotor = new THREE.Group();
  rotor.position.set(0, 2.65, -0.4);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.9, 12), matDark);
  mast.position.y = -0.35;
  rotor.add(mast);
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.12, 0.62), matThin);
    blade.position.x = 3.75;
    const arm = new THREE.Group();
    arm.rotation.y = (i * Math.PI) / 2;
    arm.add(blade);
    rotor.add(arm);
  }
  group.add(rotor);

  // --- stabs (the Seahawk's small stabilator), fixed wing slots for the rig ---
  const stabs: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? 1 : -1;
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.4, 0.4, 7.2);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 1.0), matThin);
    panel.position.x = sx * 1.0;
    pivot.add(panel);
    group.add(pivot);
    stabs[i] = pivot;
  }

  // Rig slots the airframe does not really have, kept so shared animation code works.
  const wings: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  const wingPanels: [THREE.Mesh, THREE.Mesh] = [] as unknown as [THREE.Mesh, THREE.Mesh];
  const flaps: [THREE.Group, THREE.Group] = [] as unknown as [THREE.Group, THREE.Group];
  for (let i = 0; i < 2; i++) {
    const pivot = new THREE.Group();
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), matThin);
    pivot.add(panel);
    group.add(pivot);
    wings[i] = pivot;
    wingPanels[i] = panel;
    const flap = new THREE.Group();
    pivot.add(flap);
    flaps[i] = flap;
  }

  // --- landing gear: two mains and a tail wheel, tyre soles on the deck line ---
  const gear = new THREE.Group();
  for (const sx of [-1, 1]) {
    add(gear, new THREE.CylinderGeometry(0.1, 0.1, 1.0, 8), matDark, sx * 1.7, -1.35, 0.9);
    const mw = wheel(0.33, 0.14);
    mw.position.set(sx * 1.7, -1.7, 0.9);
    gear.add(mw);
  }
  add(gear, new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), matDark, 0, -1.28, -5.6);
  const tw = wheel(0.3, 0.12);
  tw.position.set(0, -1.73, -5.6);
  gear.add(tw);
  group.add(gear);

  // inert burner mesh so the shared rig has something to drive (never lit)
  const afterburner = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 10, 1, true), MAT_FLAME.clone());
  afterburner.rotation.x = Math.PI / 2;
  afterburner.position.set(0, 0.3, 8.4);
  afterburner.visible = false;
  group.add(afterburner);

  finishShip(
    group,
    afterburner,
    { leftTip: [-8.2, 2.65, -0.4], rightTip: [8.2, 2.65, -0.4], tail: [0, 3.2, 8.6], beacon: [0, 1.7, -0.4] },
  );

  return {
    group, wings, wingPanels, stabs, rudders, flaps, gear, canopy, intakes, afterburner,
    sweepable: false, rotor, tailRotor,
  };
}

/** Build the player's airframe. Any unknown id falls back to the Tomcat. */
export function buildAircraft(id: AircraftId, paint: "gray" | "bandit" = "gray"): TomcatMesh {
  switch (id) {
    case "hornet":
      return buildHornetMesh(paint);
    case "crusader":
      return buildCrusaderMesh(paint);
    case "intruder":
      return buildIntruderMesh(paint);
    case "seahawk":
      return buildSeahawkMesh(paint);
    case "tomcat":
    default:
      return buildTomcatMesh(paint);
  }
}

/** Back-compat: bandit AI always flies the Tomcat silhouette. */
export function buildTomcat(paint: "gray" | "bandit" = "gray"): TomcatMesh {
  return buildTomcatMesh(paint);
}
