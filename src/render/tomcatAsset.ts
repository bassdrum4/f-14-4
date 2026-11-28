// Browser-independent packed geometry; the livery texture is embedded in the build.
import * as THREE from "three";
import type { TomcatMesh } from "./geometry";
import { parts, diffuse } from "./assets/tomcatAssetData";

type Part = keyof typeof parts;
const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const cache=new Map<Part,THREE.BufferGeometry>();
function geometry(part:Part):THREE.BufferGeometry {
  let g=cache.get(part);
  if(!g){
    const p=parts[part], pos=new Int16Array(bytes(p.p).buffer), n=new Int8Array(bytes(p.n).buffer);
    const uv=new Uint16Array(bytes(p.u).buffer);
    g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(Array.from(pos,v=>v/1000),3));
    g.setAttribute("normal",new THREE.Float32BufferAttribute(Array.from(n,v=>v/127),3));
    g.setAttribute("uv",new THREE.Float32BufferAttribute(Array.from(uv,v=>v/65535),2));
    g.setIndex(new THREE.BufferAttribute(new Uint16Array(bytes(p.i).buffer),1));
    cache.set(part,g);
  }
  return g.clone();
}
let map:THREE.Texture|undefined;
const paint=new THREE.MeshStandardMaterial({color:0xbfc5cb,roughness:.55,metalness:.18,side:THREE.DoubleSide});
paint.userData.shared=true;
function material():THREE.MeshStandardMaterial{
  if(!map&&typeof document!=="undefined"){
    map=new THREE.TextureLoader().load(diffuse,()=>{paint.color.set(0xffffff);paint.needsUpdate=true;});
    map.colorSpace=THREE.SRGBColorSpace;map.flipY=false;map.anisotropy=4;
    paint.map=map;paint.needsUpdate=true;
  }
  return paint;
}
const glass=new THREE.MeshStandardMaterial({color:0x263946,roughness:.18,metalness:.62,side:THREE.DoubleSide});
glass.userData.shared=true;
function replace(mesh:THREE.Mesh,g:THREE.BufferGeometry,mat:THREE.Material=material()):void{
  mesh.geometry.dispose();mesh.geometry=g;mesh.material=mat;
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=true;
}
function remove(o:THREE.Object3D):void{
  o.removeFromParent();o.traverse(child=>{const m=child as THREE.Mesh;if(m.isMesh)m.geometry.dispose();});
}
function inLocal(g:THREE.BufferGeometry,o:THREE.Object3D):THREE.BufferGeometry{
  o.updateWorldMatrix(true,false);return g.applyMatrix4(o.matrixWorld.clone().invert());
}
function add(parent:THREE.Object3D,g:THREE.BufferGeometry,mat:THREE.Material=material()):THREE.Mesh{
  const mesh=new THREE.Mesh(g,mat);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
/** Fit licensed exterior geometry to the existing flight rig. Only the visual mesh changes. */
export function applyTomcatAsset(jet:TomcatMesh):void{
  const {group,wings,wingPanels,flaps,stabs,rudders,canopy,gear,afterburner,intakes}=jet;
  // Keep the animated gear, plume and nav lights.
  // The imported fuselage already includes the nacelles, wing gloves, nose and fins.
  for(const r of rudders)r.removeFromParent();
  const fixed=new Set<THREE.Object3D>([...wings,...stabs,canopy,gear,afterburner,intakes]);
  for(const child of [...group.children])if((child as THREE.Mesh).isMesh&&!fixed.has(child))remove(child);
  for(const child of [...intakes.children])remove(child);
  for(const child of [...group.children])if(child.name==="airframe-detail-lod")remove(child);
  const body=add(group,geometry("body"));body.name="imported-tomcat-fuselage";
  group.children.splice(group.children.indexOf(body),1);group.children.unshift(body);
  // Remove procedural canopy framing and wing markings: the licensed livery already has them.
  for(const child of [...canopy.children])remove(child);
  canopy.position.set(0,0,0);canopy.scale.set(1,1,1);canopy.rotation.set(0,0,0);
  replace(canopy,geometry("glass"),glass);
  for(const [i,suffix] of [[0,"r"],[1,"l"]] as const){
    const sx=i===0?1:-1;
    const w=wings[i],panel=wingPanels[i],flap=flaps[i];
    w.position.set(sx*2.5,.25,1.45);
    // The source is already in the spread-wing pose (20 degrees).
    // Undo that pose when mapping to the local panel so the rig can sweep it.
    w.rotation.y=-sx*THREE.MathUtils.degToRad(20);
    panel.rotation.y=sx*Math.PI/2;
    for(const child of [...panel.children])if(child!==flap&&!(child as THREE.Sprite).isSprite)remove(child);
    replace(panel,inLocal(geometry(`wing${suffix}`),panel));
    const flapGeometry=inLocal(geometry(`flap${suffix}`),panel);
    flapGeometry.computeBoundingBox();const b=flapGeometry.boundingBox!;
    flap.position.set(sx>0?b.max.x:b.min.x,(b.min.y+b.max.y)/2,(b.min.z+b.max.z)/2);
    for(const c of [...flap.children])remove(c);
    add(flap,flapGeometry.translate(-flap.position.x,-flap.position.y,-flap.position.z));
    // Real wingtip location, in the same moving frame as the stock nav light.
    panel.geometry.computeBoundingBox();
    for(const c of panel.children)if((c as THREE.Sprite).isSprite)c.position.z=panel.geometry.boundingBox!.max.z-.25;
    w.rotation.y=0;
    const stab=stabs[i];stab.position.set(sx*2,.1,7.4);stab.rotation.set(0,0,0);
    for(const c of [...stab.children])remove(c);
    add(stab,inLocal(geometry(`stab${suffix}`),stab));
    const rudder=rudders[i];group.add(rudder);
    rudder.rotation.set(0,0,0);rudder.position.set(sx*1.7,1.8,7.2);
    replace(rudder,inLocal(geometry(`rudder${suffix}`),rudder));
  }
  // Use the imported nozzle geometry and align the stock plume animation.
  const engineDetail=new THREE.LOD();const nozzles=new THREE.Group();
  add(nozzles,geometry("engine"));engineDetail.addLevel(nozzles,0);engineDetail.addLevel(new THREE.Group(),850);group.add(engineDetail);
  afterburner.position.set(0,-.05,9.17);
  const plume=afterburner.geometry.getAttribute("position");
  for(let i=0;i<plume.count;i++)plume.setX(i,plume.getX(i)-Math.sign(plume.getX(i))*.10);
  plume.needsUpdate=true;afterburner.geometry.computeBoundingSphere();
  group.userData.airframeAsset="Muhamad Mirza Arrafi — CC BY 4.0";
}
