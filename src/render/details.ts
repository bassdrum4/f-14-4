// Seeded scenery in small instanced batches. No downloaded models or textures;
// chunk bounds let the renderer cull islands outside the camera's view.
import * as THREE from 'three';
import { activeWorldSeed, airfield, terrainHeight } from '../sim/world';
import { QUALITY_SEGMENTS, type Quality } from '../settings';
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
export function buildScenery(quality: Quality): THREE.Group {
  const root = new THREE.Group();
  root.name = 'instanced-island-scenery';
  const count = quality === 'low' ? 35 : quality === 'medium' ? 130 : 240;
  const af = airfield();
  const cell = 60000 / QUALITY_SEGMENTS[quality];
  const renderedHeight = (x: number, z: number) => {
    const gx = Math.floor((x + 30000) / cell), gz = Math.floor((z + 30000) / cell);
    const x0 = gx * cell - 30000, z0 = gz * cell - 30000;
    const u = (x - x0) / cell, v = (z - z0) / cell;
    const a = terrainHeight(x0, z0), b = terrainHeight(x0 + cell, z0), c = terrainHeight(x0, z0 + cell), d = terrainHeight(x0 + cell, z0 + cell);
    return u + v <= 1 ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v);
  };
  const trunk = new THREE.CylinderGeometry(.6, .9, 1, 5);
  const crown = new THREE.ConeGeometry(1, 1, 6);
  const rock = new THREE.IcosahedronGeometry(1, 0);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x695a3c, roughness: 1 });
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x405a31, roughness: 1 });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x786c59, roughness: 1 });
  const dummy = new THREE.Object3D(), color = new THREE.Color();
  for (let cx = -2; cx <= 2; cx++) for (let cz = -2; cz <= 2; cz++) {
    const rnd = random(activeWorldSeed() ^ Math.imul(cx + 7, 75431) ^ Math.imul(cz + 7, 31793));
    const trees: Array<[number, number, number, number]> = [], rocks: Array<[number, number, number, number]> = [];
    for (let attempt = 0; attempt < 1600 && trees.length + rocks.length < count; attempt++) {
      const x = cx * 12000 + (rnd() - .5) * 12000;
      const z = cz * 12000 + (rnd() - .5) * 12000;
      if (Math.abs(x - af.centerX) < af.runwayLength / 2 + 250 && Math.abs(z - af.centerZ) < 350) continue;
      const y = renderedHeight(x, z);
      if (y < 2 || y > 750) continue;
      const slope = Math.hypot(terrainHeight(x + 10, z) - y, terrainHeight(x, z + 10) - y) / 10;
      if (slope > .7) continue;
      const size = rnd();
      (y < 22 || slope > .35 ? rocks : trees).push([x, y, z, size]);
    }
    for (const [geo, mat, placements, kind] of [[trunk, trunkMat, trees, 0], [crown, crownMat, trees, 1], [rock, rockMat, rocks, 2]] as const) {
      if (!placements.length) continue;
      const mesh = new THREE.InstancedMesh(geo, mat, placements.length);
      placements.forEach(([x,y,z,size], i) => {
        const height = 8 + size * 12;
        dummy.position.set(x, y + (kind === 0 ? height * .25 : kind === 1 ? height * .65 : 2 + size * 3), z);
        dummy.rotation.set(0, size * 11, kind === 2 ? size : 0);
        dummy.scale.set(kind === 0 ? 1 : kind === 1 ? height * .28 : 3 + size * 7, kind === 0 ? height * .5 : kind === 1 ? height : 4 + size * 7, kind === 0 ? 1 : kind === 1 ? height * .28 : 3 + size * 7);
        dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
        color.set(kind === 1 ? 0x405a31 : kind === 2 ? 0x786c59 : 0x695a3c).multiplyScalar(.8 + size * .4);
        mesh.setColorAt(i, color);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere(); mesh.receiveShadow = quality !== 'low';
      root.add(mesh);
    }
  }
  return root;
}

export function buildAirbaseDetails(): THREE.Group {
  const group = new THREE.Group(), af = airfield();
  group.name = 'airbase-apron';
  const concrete = new THREE.MeshStandardMaterial({ color: 0x74766e, roughness: 1 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x43515b, roughness: .7 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x8bafb8, metalness: .35, roughness: .3 });
  const yellow = new THREE.MeshBasicMaterial({ color: 0xd9b756 });
  const add = (w: number,h: number,d: number,x: number,y: number,z: number,mat: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    mesh.position.set(af.centerX+x,af.elevation+y,af.centerZ+z); group.add(mesh); return mesh;
  };
  add(550,.08,140,-30,.04,-140,concrete);
  add(45,.06,85,-300,.05,-70,concrete);
  add(45,.06,85,230,.05,-70,concrete);
  add(480,.025,1,-30,.12,-110,yellow);
  // Hangar doors and corrugated roof ribs give existing blocks readable scale.
  for (const [x,z] of [[-200,-140],[120,-150]]) {
    add(46,12,.25,x,6,z+20.15,steel);
    for (let i = -2; i <= 2; i++) add(.35,12,.35,x+i*9,6,z+20.35,concrete);
    add(63,.7,43,x,18.4,z,steel);
  }
  add(17,7,17,-60,34,-160,glass);
  add(21,1,21,-60,38,-160,steel);
  const crates = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),steel,24);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 24; i++) {
    dummy.position.set(af.centerX-70+(i%8)*9,af.elevation+2.2,af.centerZ-190-Math.floor(i/8)*7);
    dummy.scale.set(6,4.4,3); dummy.updateMatrix(); crates.setMatrixAt(i,dummy.matrix);
  }
  crates.computeBoundingSphere(); group.add(crates);
  return group;
}
