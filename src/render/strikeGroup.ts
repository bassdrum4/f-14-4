// The friendly carrier's strike group: the escort ships that steam with her.
//
// A US Navy carrier strike group is built around one aircraft carrier: a
// Ticonderoga-class guided-missile cruiser, a destroyer squadron of Arleigh
// Burke-class destroyers, often a frigate, and a fast combat support ship for
// fuel and stores. This module builds that formation around the fleet's single
// carrier, so in the campaign she never steams alone.
//
// The ships are decoration, not sim: no hull points, no collision, no radar
// return. They ride the carrier's own deck frame (+X bow, +Z starboard, the
// same frame buildCarrier uses) at fixed stations and follow her straight, slow
// leg, so the group reads as one task force under way.

import * as THREE from "three";
import { carriers, deckAxes } from "../sim/world";
import { SHIP_NAV_GREEN, SHIP_NAV_RED, SHIP_NAV_WHITE } from "./lights";

export type EscortKind = "cruiser" | "destroyer" | "frigate" | "supply";

/** One escort's station, in metres from the carrier along (+ forward) and across (+ starboard). */
export interface EscortSpec {
  name: string;
  kind: EscortKind;
  along: number;
  across: number;
}

/**
 * The formation, roughly a real CSG's: the cruiser and a destroyer ahead and
 * off the bows, a second destroyer on the port quarter, the frigate in the
 * plane-guard slot astern, and the support ship further astern. Every station
 * stays inside a couple of kilometres of the carrier, in the deep water her
 * anchorage guarantees.
 */
export const STRIKE_GROUP: readonly EscortSpec[] = [
  { name: "CHANCELLORSVILLE", kind: "cruiser", along: 700, across: -1100 },
  { name: "FITZGERALD", kind: "destroyer", along: 500, across: 1300 },
  { name: "STETHEM", kind: "destroyer", along: -1500, across: -800 },
  { name: "INGRAHAM", kind: "frigate", along: -900, across: 250 },
  { name: "RAINIER", kind: "supply", along: -1900, across: 900 },
];

/** Hull dimensions per class: length, beam, freeboard above the waterline and draft. */
const CLASS: Record<EscortKind, { length: number; beam: number; freeboard: number; draft: number }> = {
  cruiser: { length: 173, beam: 16.8, freeboard: 7, draft: 7 },
  destroyer: { length: 155, beam: 20, freeboard: 6.5, draft: 6.5 },
  frigate: { length: 138, beam: 14, freeboard: 6, draft: 6 },
  supply: { length: 230, beam: 32, freeboard: 9, draft: 8 },
};

/**
 * A warship's waterline hull: a sharp bow, parallel sides and a transom stern,
 * extruded downward from the deck line. Laid out in the ship's own frame, so
 * +X is the bow and +Z is starboard once the group is yawed like the carrier.
 */
function hullGeometry(length: number, beam: number, freeboard: number, draft: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const shoulder = length * 0.36;
  shape.moveTo(-length / 2, -beam / 2);
  shape.lineTo(shoulder, -beam / 2);
  shape.lineTo(length / 2, 0);
  shape.lineTo(shoulder, beam / 2);
  shape.lineTo(-length / 2, beam / 2);
  shape.closePath();
  const geom = new THREE.ExtrudeGeometry(shape, { depth: freeboard + draft, bevelEnabled: false });
  geom.rotateX(Math.PI / 2);
  return geom;
}

/** Build one escort's mesh, complete with navigation lights for night steaming. */
export function buildEscort(spec: EscortSpec): THREE.Group {
  const g = new THREE.Group();
  g.name = `escort:${spec.name}`;
  const cls = CLASS[spec.kind];
  const steel = new THREE.MeshStandardMaterial({ color: 0x5b6169, roughness: 0.92 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x3f464c, roughness: 0.95 });
  const haze = new THREE.MeshStandardMaterial({ color: 0x8b9094, roughness: 0.85 });
  const gear = new THREE.MeshStandardMaterial({ color: 0x6e7376, roughness: 0.75 });
  const F = cls.freeboard;

  const hull = new THREE.Mesh(hullGeometry(cls.length, cls.beam, F, cls.draft), steel);
  hull.position.y = F;
  g.add(hull);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(cls.length * 0.9, 0.5, cls.beam * 0.9), deckMat);
  deck.position.set(-cls.length * 0.03, F + 0.25, 0);
  g.add(deck);

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material = haze) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  const mast = (r: number, h: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, h, 6), gear);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  const gun = (x: number) => {
    box(9, 3.4, 8, x, F + 1.7, 0, gear);
    box(9, 0.8, 0.8, x + 7, F + 2.6, 0, gear);
  };
  const vls = (x: number) => box(9, 1.3, cls.beam * 0.5, x, F + 1.2, 0, deckMat);
  const radarPanels = (x: number, y: number) => {
    for (const side of [-1, 1]) {
      const panel = box(0.5, 5, 6, x, y, side * 0.9, haze);
      panel.rotation.y = side * 0.6;
    }
  };

  if (spec.kind === "supply") {
    box(64, 20, 24, -46, F + 10, 0); // accommodation block
    box(16, 13, 22, 62, F + 6.5, 0); // bridge, forward
    mast(5, 16, -30, F + 26, 0); // funnel
    for (const x of [44, -6, -84]) mast(1.1, 26, x, F + 13, 0); // kingposts
    for (const [x, z] of [[20, -8], [20, 8], [4, -8], [4, 8]] as const) box(14, 6, 6, x, F + 3, z, deckMat); // deck cargo
  } else if (spec.kind === "cruiser") {
    box(30, 14, 12, 4, F + 7, 0); // forward superstructure
    box(26, 9, 11, -46, F + 4.5, 0); // aft deckhouse
    mast(3.4, 12, -16, F + 11, 0); // funnel
    mast(0.9, 18, 2, F + 23, 0); // mast
    radarPanels(2, F + 27);
    gun(56);
    vls(34);
    gun(-62);
  } else if (spec.kind === "destroyer") {
    box(24, 13, 14, 10, F + 6.5, 0);
    box(18, 8, 14, -40, F + 4, 0); // hangar
    box(11, 10, 10, -14, F + 9, 0); // funnel block
    mast(0.8, 16, 16, F + 21, 0);
    radarPanels(16, F + 25);
    gun(44);
    vls(26);
    box(20, 0.4, 13, -52, F + 0.4, 0, deckMat); // helipad
  } else {
    box(20, 11, 11, 10, F + 5.5, 0); // bridge
    box(16, 8, 10, -30, F + 5, 0); // hangar
    mast(3, 11, -8, F + 9.5, 0); // funnel
    mast(0.7, 14, 12, F + 17, 0);
    radarPanels(12, F + 21);
    gun(38);
    box(18, 0.4, 11, -42, F + 0.4, 0, deckMat); // helipad
  }

  // Running lights: red to port, green to starboard, white at the masthead.
  const lamp = (mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    g.add(m);
  };
  const bowX = cls.length * 0.3;
  lamp(SHIP_NAV_RED, bowX, F + 2.2, -cls.beam / 2 + 0.8);
  lamp(SHIP_NAV_GREEN, bowX, F + 2.2, cls.beam / 2 - 0.8);
  lamp(SHIP_NAV_WHITE, 0, F + (spec.kind === "supply" ? 34 : 30), 0);

  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return g;
}

/**
 * Put one escort on her station relative to the fleet carrier: the station is
 * fixed in the carrier's deck frame, so the whole group travels as one.
 */
export function placeEscort(ship: THREE.Object3D, spec: EscortSpec): void {
  const carrier = carriers()[0];
  const { fwd, right } = deckAxes(carrier.headingDeg);
  ship.position.set(
    carrier.x + fwd[0] * spec.along + right[0] * spec.across,
    carrier.heave ?? 0,
    carrier.z + fwd[1] * spec.along + right[1] * spec.across,
  );
  ship.rotation.y = ((90 - carrier.headingDeg) * Math.PI) / 180;
}
