// Rendering regressions that do not require a DOM or GPU.
import assert from "node:assert/strict";
import * as THREE from "three";
import { airfoil, loft } from "../src/render/airframe";
import { buildAircraft, disposeAircraft } from "../src/render/geometry";
import { animateExhaust } from "../src/render/aircraftDetails";
import { animateJet } from "../src/render/rig";
import { spawnAircraft } from "../src/sim/flight";

// Surface winding matters: a beautiful silhouette can hide inside-out surfaces.
const body=loft([[-2,.1,.1,0],[0,1,1,0],[2,.1,.1,0]]);
const bp=body.getAttribute("position"),bn=body.getAttribute("normal");
for(let i=0;i<bp.count-2;i++) {
  assert(bp.getX(i)*bn.getX(i)+bp.getY(i)*bn.getY(i)>0,'loft normals face outward');
}
for(const sign of [-1,1]) {
  const g=airfoil(4,2,7,.3,sign),p=g.getAttribute("position"),n=g.getAttribute("normal");
  for(let i=0;i<p.count;i++) if(Math.abs(p.getY(i))>.015) {
    assert(p.getY(i)*n.getY(i)>0,'both mirrored airfoils have outward normals');
  }
  g.dispose();
}
body.dispose();

const camera=new THREE.PerspectiveCamera();
for(const id of ['tomcat','hornet','crusader','intruder','seahawk'] as const) {
  const jet=buildAircraft(id),state=spawnAircraft('airfield',0,id);
  const materialSet=new Set<THREE.Material>();
  let triangles=0,near=0;
  jet.group.traverse(o=>{
    const mesh=o as THREE.Mesh;
    if(!mesh.isMesh)return;
    const pos=mesh.geometry.getAttribute('position');
    if(!pos)return;
    triangles+=(mesh.geometry.index?.count??pos.count)/3;
    for(const key of ['position','normal','uv']) {
      const attr=mesh.geometry.getAttribute(key);
      assert(attr,`${id}: ${key} exists`);
      for(const v of attr.array)assert(Number.isFinite(v),`${id}: finite ${key}`);
    }
    assert(mesh.frustumCulled,`${id}: culling enabled`);
    const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    for(const m of materials) {
      materialSet.add(m);
      if((m as THREE.MeshStandardMaterial).vertexColors)assert(mesh.geometry.hasAttribute('color'),`${id}: vertex-colour material has colours`);
    }
  });
  assert(triangles<30000,`${id}: bounded model triangles (${triangles})`);
  assert(materialSet.size<16,`${id}: batched hardware and shared paint`);
  state.sweepT=1;state.gearT=1;state.abLevel=1;state.time=4;
  animateJet(jet,state,1,1/60);jet.group.updateMatrixWorld(true);
  camera.position.set(0,5,25);camera.updateMatrixWorld(true);
  jet.group.traverse(o=>{if(o instanceof THREE.LOD)o.update(camera);});
  jet.group.traverseVisible(o=>{if((o as THREE.Mesh).isMesh)near++;});
  camera.position.set(0,5,3000);camera.updateMatrixWorld(true);
  jet.group.traverse(o=>{if(o instanceof THREE.LOD)o.update(camera);});
  let far=0;jet.group.traverseVisible(o=>{if((o as THREE.Mesh).isMesh)far++;});
  assert(far<near,`${id}: distance removes detail draws`);
  if(id==='intruder'||id==='seahawk')assert(!jet.afterburner.visible,`${id}: no fictional afterburner`);
  else {
    assert(jet.afterburner.visible,`${id}: burner lights`);
    assert(!jet.afterburner.castShadow,`${id}: burner casts no shadow`);
    const origin=jet.afterburner.position.clone();
    animateExhaust(jet,.2,1);assert.equal(jet.afterburner.scale.x,1,'throttle cannot move exhaust sideways');
    animateExhaust(jet,1,2);assert(jet.afterburner.position.equals(origin),'nozzle attachment stays fixed');
    const p=jet.afterburner.geometry.getAttribute('position');
    for(let i=0;i<p.count;i++) {
      if(id==='tomcat')assert(Math.abs(p.getX(i))>.8,'each F-14 plume belongs to an engine, never the centreline');
      if(id==='hornet')assert(Math.abs(p.getX(i))>.2,'each Hornet plume belongs to an engine');
      assert(p.getZ(i)>-.001,'all flames extend aft of the nozzle');
    }
  }
  console.log(`PASS ${id}: ${Math.round(triangles)} triangles; ${near} near / ${far} far meshes`);
  disposeAircraft(jet);
}

// Removing or swapping one aircraft must not invalidate another's paint.
const a=buildAircraft('tomcat'),b=buildAircraft('tomcat');
let sharedDisposals=0,flameDisposals=0;
const sharedMaterial=(a.group.children.find(o=>(o as THREE.Mesh).isMesh) as THREE.Mesh).material as THREE.Material;
sharedMaterial.addEventListener('dispose',()=>sharedDisposals++);
(a.afterburner.material as THREE.Material).addEventListener('dispose',()=>flameDisposals++);
animateExhaust(a,1,1);animateExhaust(b,.1,1);
assert.notEqual(a.afterburner.material,b.afterburner.material,'each pilot owns its flame opacity');
assert.notEqual((a.afterburner.material as THREE.MeshBasicMaterial).opacity,(b.afterburner.material as THREE.MeshBasicMaterial).opacity);
disposeAircraft(a);assert.equal(flameDisposals,1);assert.equal(sharedDisposals,0);
disposeAircraft(b);
console.log('ALL AIRCRAFT VISUAL REGRESSIONS PASSED');
