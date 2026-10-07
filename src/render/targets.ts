// Strike-mission targets: the things that get bombed on land and at sea.
//
// Simple, readable silhouettes — a hangar is a box with an arched roof, a fuel
// farm is a ring of cylinders, a ship is a tapered hull with a superstructure.
// Each target owns its materials so a wreck can darken in place and the
// combat layer's disposeSubtree() can release everything when a wave clears.
// Nothing here is shared across targets: a strike wave can be torn down
// wholesale without pulling materials out from under a target still standing.

import * as THREE from "three";

export type TargetKind = "hangar" | "tank" | "warehouse" | "ship" | "patrol";

/** Hit radius (m) the combat layer checks a target's position against. */
export const TARGET_RADIUS: Record<TargetKind, number> = {
  hangar: 16,
  tank: 11,
  warehouse: 14,
  ship: 22,
  patrol: 13,
};

/** Structural hit points: one direct 500 kg bomb kills anything but a ship. */
export const TARGET_HP: Record<TargetKind, number> = {
  hangar: 34,
  tank: 26,
  warehouse: 34,
  ship: 52,
  patrol: 30,
};

function mat(color: number, roughness = 0.85, metalness = 0.08): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function add(
  g: THREE.Group,
  geom: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const m = new THREE.Mesh(geom, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}

/** A hangar: long box with a half-cylinder roof. */
function buildHangar(): THREE.Group {
  const g = new THREE.Group();
  const wall = mat(0x6d7464);
  const roof = mat(0x59604f, 0.95);
  const door = mat(0x3c4238, 0.9, 0.2);
  const body = new THREE.BoxGeometry(34, 11, 22);
  add(g, body, wall, 0, 5.5, 0);
  const arch = new THREE.CylinderGeometry(11, 11, 34, 14, 1, false, 0, Math.PI);
  arch.rotateZ(Math.PI / 2);
  arch.rotateY(Math.PI / 2);
  const roofMesh = add(g, arch, roof, 0, 11, 0);
  roofMesh.scale.set(1, 1, 1);
  const doors = new THREE.BoxGeometry(0.8, 8, 16);
  add(g, doors, door, -17.4, 4, 0);
  return g;
}

/** A fuel farm: three tanks with a conical top each. */
function buildTank(): THREE.Group {
  const g = new THREE.Group();
  const shell = mat(0xb8b2a2, 0.7, 0.25);
  const top = mat(0x8f8a7c, 0.75, 0.3);
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 13;
    const z = i === 1 ? 7 : -4;
    const body = new THREE.CylinderGeometry(6, 6, 9, 16);
    add(g, body, shell, x, 4.5, z);
    const cap = new THREE.ConeGeometry(6.1, 2.6, 16);
    add(g, cap, top, x, 10.3, z);
  }
  return g;
}

/** A supply warehouse: flat-roofed block with a loading canopy. */
function buildWarehouse(): THREE.Group {
  const g = new THREE.Group();
  const wall = mat(0x7a7263);
  const roof = mat(0x55504a, 0.95);
  const canopy = mat(0x4a5048, 0.9, 0.15);
  add(g, new THREE.BoxGeometry(30, 9, 18), wall, 0, 4.5, 0);
  add(g, new THREE.BoxGeometry(31, 1.2, 19), roof, 0, 9.4, 0);
  add(g, new THREE.BoxGeometry(8, 0.7, 6), canopy, -18, 6, 0);
  add(g, new THREE.BoxGeometry(1, 6, 1), canopy, -21, 3, -2.4);
  add(g, new THREE.BoxGeometry(1, 6, 1), canopy, -21, 3, 2.4);
  return g;
}

/**
 * A merchant ship: tapered hull, deckhouse aft, funnel, kingpost. Built along
 * +X (bow), the same ship-local frame buildCarrier() uses.
 */
function buildShip(): THREE.Group {
  const g = new THREE.Group();
  const hull = mat(0x2e3640, 0.6, 0.35);
  const deck = mat(0x6a7078, 0.8, 0.2);
  const house = mat(0xc9c4b4, 0.8);
  const funnel = mat(0x8a4438, 0.75, 0.2);
  const L = 118;
  // hull: a stretched, tapered box (scaled on the bow half via two boxes)
  const mid = new THREE.BoxGeometry(L * 0.62, 11, 17);
  add(g, mid, hull, 0, 4.5, 0);
  const bow = new THREE.BoxGeometry(L * 0.28, 10, 15);
  const bowMesh = add(g, bow, hull, L * 0.42, 4.8, 0);
  bowMesh.scale.z = 0.72;
  const stern = new THREE.BoxGeometry(L * 0.18, 9.5, 16);
  add(g, stern, hull, -L * 0.42, 4.6, 0);
  // waterline stripe + deck
  add(g, new THREE.BoxGeometry(L * 0.98, 1.2, 17.2), deck, 0, 10.2, 0);
  // deckhouse + funnel aft
  add(g, new THREE.BoxGeometry(15, 12, 13), house, -L * 0.32, 16.5, 0);
  add(g, new THREE.BoxGeometry(11, 3, 10), house, -L * 0.32, 24, 0);
  add(g, new THREE.CylinderGeometry(2.6, 3.2, 11, 10), funnel, -L * 0.22, 24, 0);
  // kingposts: vertical scale references on a flat deck
  for (const x of [L * 0.18, -L * 0.06]) {
    add(g, new THREE.CylinderGeometry(0.7, 0.9, 16, 8), deck, x, 18, 0);
    add(g, new THREE.BoxGeometry(12, 0.8, 0.8), deck, x, 25, 0);
  }
  return g;
}

/** A patrol boat: small hull, cabin, single mast. */
function buildPatrol(): THREE.Group {
  const g = new THREE.Group();
  const hull = mat(0x39424c, 0.6, 0.35);
  const cabin = mat(0xb9b4a6, 0.8);
  const deck = mat(0x6a7078, 0.8, 0.2);
  const L = 42;
  const mid = new THREE.BoxGeometry(L * 0.7, 6.5, 9);
  add(g, mid, hull, 0, 3, 0);
  const bow = new THREE.BoxGeometry(L * 0.32, 6, 8);
  const bowMesh = add(g, bow, hull, L * 0.46, 3.4, 0);
  bowMesh.scale.z = 0.55;
  add(g, new THREE.BoxGeometry(L * 0.98, 0.8, 9.2), deck, 0, 6.6, 0);
  add(g, new THREE.BoxGeometry(10, 5.5, 7.5), cabin, -L * 0.14, 9.8, 0);
  add(g, new THREE.BoxGeometry(6, 2.6, 5.5), cabin, -L * 0.14, 13.6, 0);
  add(g, new THREE.CylinderGeometry(0.4, 0.5, 9, 8), deck, -L * 0.14, 19, 0);
  return g;
}

/**
 * Build one target. Land targets sit on their own origin (y = ground), ships
 * float on the sea surface; the caller owns placement and heading.
 */
export function buildTargetMesh(kind: TargetKind): THREE.Group {
  switch (kind) {
    case "hangar":
      return buildHangar();
    case "tank":
      return buildTank();
    case "warehouse":
      return buildWarehouse();
    case "ship":
      return buildShip();
    case "patrol":
      return buildPatrol();
  }
}

/**
 * Burn a destroyed target in place: squash it, darken it, and leave it as a
 * wreck rather than pulling it out of the scene. The wreck is the scoreboard —
 * a struck target site has to still read as struck on the next pass.
 */
export function wreckTarget(group: THREE.Group): void {
  group.scale.y = 0.45;
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const m = mesh.material as THREE.MeshStandardMaterial;
    if (m.color) m.color.multiplyScalar(0.3);
    if (m.emissive) {
      m.emissive.setHex(0x2a0c04);
      m.emissiveIntensity = 1.4;
    }
    m.needsUpdate = true;
  });
}
