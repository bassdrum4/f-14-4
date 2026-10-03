// F-14 Tomcat, built from tapered boxes. Iconic silhouette over poly count.
// Returns named parts the rig animates each frame (sweep, surfaces, gear, AB).

import * as THREE from "three";

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

export function buildTomcat(): TomcatMesh {
  const group = new THREE.Group();

  // --- fuselage segments (nose at -Z) ---
  add(group, taperedBox(0.5, 0.45, 1.7, 1.5, 1.9, 0, -0.08), MAT_BODY, 0, 0.1, -8.6); // radome
  add(group, taperedBox(1.7, 1.5, 3.0, 2.2, 3.9), MAT_BODY, 0, 0, -5.9); // forward
  add(group, taperedBox(3.0, 2.2, 3.5, 2.45, 7.0), MAT_BODY, 0, 0, -0.5); // mid
  add(group, taperedBox(3.5, 2.45, 3.1, 2.1, 4.6, 0, 0.1), MAT_BODY, 0, 0, 5.3); // aft
  add(group, taperedBox(3.1, 2.1, 2.6, 1.6, 1.8, 0, -0.25), MAT_BODY, 0, 0, 8.5); // nozzle deck
  add(group, taperedBox(2.0, 0.7, 2.3, 0.8, 6.0), MAT_BODY, 0, 1.1, 4.5); // spine
  add(group, taperedBox(1.2, 0.6, 2.0, 0.8, 2.2), MAT_BODY, 0, 0.95, -2.9); // cockpit fairing

  // gloves (fixed wing root ahead of pivot)
  add(group, taperedBox(1.0, 0.34, 2.0, 0.22, 3.0), MAT_THIN, 1.9, 0.28, -1.2);
  add(group, taperedBox(1.0, 0.34, 2.0, 0.22, 3.0), MAT_THIN, -1.9, 0.28, -1.2);

  // intakes
  const intakes = new THREE.Group();
  add(intakes, taperedBox(1.2, 1.7, 1.1, 1.9, 3.2), MAT_BODY, 2.25, -0.1, -3.0);
  add(intakes, taperedBox(1.2, 1.7, 1.1, 1.9, 3.2), MAT_BODY, -2.25, -0.1, -3.0);
  const inlet = new THREE.CylinderGeometry(0.52, 0.52, 0.3, 16);
  const in1 = add(intakes, inlet, MAT_DARK, 2.25, 0.2, -4.65);
  in1.rotation.x = Math.PI / 2;
  const in2 = add(intakes, inlet, MAT_DARK, -2.25, 0.2, -4.65);
  in2.rotation.x = Math.PI / 2;
  group.add(intakes);

  // canopy
  const canopy = add(
    group,
    new THREE.SphereGeometry(0.85, 16, 12),
    MAT_GLASS,
    0,
    1.15,
    -5.6,
  );
  canopy.scale.set(0.95, 0.8, 2.3);

  // engines / nozzles
  const nozzle = new THREE.CylinderGeometry(0.58, 0.66, 1.2, 14, 1, true);
  for (const sx of [-1, 1]) {
    const n = add(group, nozzle, MAT_DARK, sx * 0.85, -0.15, 9.4);
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
    const panel = new THREE.Mesh(panelGeom, MAT_THIN);
    panel.rotation.y = sx * (Math.PI / 2);
    pivot.add(panel);
    // flap: hinged sub-panel on the trailing edge (panel-local: -X is aft)
    const flapPivot = new THREE.Group();
    flapPivot.position.set(-1.85, 0, 2.9);
    const flapGeom = new THREE.BoxGeometry(1.0, 0.09, 3.6);
    const flap = new THREE.Mesh(flapGeom, MAT_THIN);
    flap.position.x = -0.5;
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
    const panel = new THREE.Mesh(geom, MAT_THIN);
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
    const fin = add(group, taperedBox(0.18, 3.0, 0.14, 2.0, 3.0, 0.35, 0), MAT_BODY, sx * 1.7, 1.85, 7.9);
    const rud = add(fin, new THREE.BoxGeometry(0.1, 2.0, 0.75), MAT_THIN, 0.2, -0.35, 1.75);
    rudders[i] = rud;
  }
  // ventral fins
  add(group, taperedBox(0.12, 0.8, 0.1, 0.5, 1.6, 0, 0.25), MAT_THIN, 1.45, -1.05, 6.9);
  add(group, taperedBox(0.12, 0.8, 0.1, 0.5, 1.6, 0, 0.25), MAT_THIN, -1.45, -1.05, 6.9);

  // --- landing gear ---
  const gear = new THREE.Group();
  // tyre bottoms are coplanar with the mains (flight.ts WHEEL_BOTTOM_Y = -2.03)
  const noseStrut = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8);
  add(gear, noseStrut, MAT_DARK, 0, -1.28, -6.0);
  const nw = wheel(0.3, 0.12);
  nw.position.set(0, -1.73, -6.0);
  gear.add(nw);
  for (const sx of [-1, 1]) {
    const strut = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
    add(gear, strut, MAT_DARK, sx * 2.3, -1.25, 0.5);
    const mw = wheel(0.33, 0.14);
    mw.position.set(sx * 2.3, -1.7, 0.5);
    gear.add(mw);
  }
  group.add(gear);

  group.traverse((o) => {
    o.frustumCulled = false;
  });

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
  };
}
