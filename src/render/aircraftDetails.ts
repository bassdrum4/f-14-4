import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { AircraftId } from "../sim/aircraft";
import type { TomcatMesh } from "./geometry";
import { aircraftMaterial } from "./airframe";

const shared = <T extends THREE.Material>(m:T):T => { m.userData.shared=true; return m; };
const frameMat=shared(new THREE.MeshStandardMaterial({color:0x414a50,roughness:.48,metalness:.35}));
const cockpitMat=shared(new THREE.MeshStandardMaterial({color:0x1b2329,roughness:.88}));
const seatMat=shared(new THREE.MeshStandardMaterial({color:0x566055,roughness:.94}));
const metalMat=shared(new THREE.MeshStandardMaterial({color:0x879196,roughness:.35,metalness:.83}));
const markingMat=shared(new THREE.MeshStandardMaterial({color:0x535e67,roughness:.8,side:THREE.DoubleSide}));
const warningMat=shared(new THREE.MeshStandardMaterial({color:0xb79b54,roughness:.8}));

const lettering:Record<string,string[]>={
  A:['01110','11011','11011','11111','11011','11011','11011'],
  J:['00111','00011','00011','00011','11011','11011','01110'],
  N:['11001','11001','11101','11111','11011','11001','11001'],
  V:['11011','11011','11011','11011','11011','01110','00100'],
  Y:['11011','11011','01110','00100','00100','00100','00100'],
  '0':['01110','11011','11011','11011','11011','11011','01110'],
  '1':['00100','01100','00100','00100','00100','00100','01110'],
};

/** Small stencils stay geometry-based and offline, including headless builds. */
function stencil(text:string,height:number):THREE.BufferGeometry {
  const pieces:THREE.BufferGeometry[]=[],pixel=height/7;
  for(let i=0;i<text.length;i++) {
    const rows=lettering[text[i]];
    if(!rows) continue;
    for(let y=0;y<7;y++) for(let x=0;x<5;x++) if(rows[y][x]==='1') {
      pieces.push(new THREE.PlaneGeometry(pixel*1.01,pixel*1.01)
        .translate((i*6+x-text.length*3)*pixel,(3-y)*pixel,0));
    }
  }
  const result=mergeGeometries(pieces)!;
  for(const p of pieces)p.dispose();
  return result;
}

/** Merge small static hardware by material, rather than one draw per rivet. */
class DetailBatch {
  private parts=new Map<THREE.Material,THREE.BufferGeometry[]>();
  add(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0,rx=0,ry=0,rz=0):void {
    g.rotateX(rx); g.rotateY(ry); g.rotateZ(rz); g.translate(x,y,z);
    // All sources use the same three attributes after de-indexing.
    const geometry=g.index?g.toNonIndexed():g;
    if(geometry!==g) g.dispose();
    for(const key of Object.keys(geometry.attributes)) if(!["position","normal","uv"].includes(key)) geometry.deleteAttribute(key);
    const list=this.parts.get(m)??[]; list.push(geometry); this.parts.set(m,list);
  }
  attach(parent:THREE.Object3D):void {
    for(const [material,parts] of this.parts) {
      const geometry=mergeGeometries(parts);
      for(const part of parts) part.dispose();
      if(!geometry) throw new Error("Aircraft detail attributes do not match");
      geometry.computeBoundingSphere();
      const mesh=new THREE.Mesh(geometry,material);
      mesh.name="aircraft-hardware"; mesh.castShadow=true; mesh.receiveShadow=true;
      parent.add(mesh);
    }
  }
}

function tube(points:THREE.Vector3[],radius=.025):THREE.BufferGeometry {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),Math.max(8,points.length*2),radius,5,false);
}

function attachDetailLOD(batch:DetailBatch,parent:THREE.Object3D,distance=850):void {
  const detail=new THREE.Group(),lod=new THREE.LOD();
  batch.attach(detail); lod.addLevel(detail,0); lod.addLevel(new THREE.Group(),distance);
  parent.add(lod);
}

function cockpit(jet:TomcatMesh,id:AircraftId):void {
  const canopy=jet.canopy;
  canopy.geometry.computeBoundingSphere();
  const r=canopy.geometry.boundingSphere!.radius;
  const frame=new DetailBatch();
  // Bows and canopy sills follow the glass ellipsoid exactly.
  for(const z of [-.56,.27]) {
    const radius=Math.sqrt(1-z*z)*r;
    const points=Array.from({length:17},(_,i)=>{
      const a=i/16*Math.PI;
      return new THREE.Vector3(Math.cos(a)*radius,Math.sin(a)*radius,z*r);
    });
    frame.add(tube(points,.021),frameMat);
  }
  for(const sx of [-1,1]) {
    const points=Array.from({length:17},(_,i)=>{
      const z=-.95+i/16*1.9;
      return new THREE.Vector3(sx*Math.sqrt(1-z*z)*r,.015,z*r);
    });
    frame.add(tube(points,.024),frameMat);
  }
  const longitudinal=Array.from({length:20},(_,i)=>{
    const a=.09+i/19*(Math.PI-.18);
    return new THREE.Vector3(0,Math.sin(a)*r,Math.cos(a)*r);
  });
  if(id==="intruder"||id==="seahawk") frame.add(tube(longitudinal,.025),frameMat);
  // The tub masks the fuselage under the glass and gives real depth to the crew.
  frame.add(new THREE.BoxGeometry(r*1.55,r*.35,r*1.45),cockpitMat,0,-r*.14,0);
  const seats=id==="tomcat"?[[0,-.23],[0,.4]]:
    id==="intruder"||id==="seahawk"?[[-.37,.12],[.37,.12]]:[[0,.12]];
  for(const [x,z] of seats) {
    frame.add(new THREE.BoxGeometry(r*.44,r*.61,r*.19),seatMat,x*r,r*.22,z*r);
    frame.add(new THREE.BoxGeometry(r*.45,r*.12,r*.33),cockpitMat,x*r,0,(z-.13)*r);
    // Helmet and visor: recognizable occupants without an expensive character rig.
    frame.add(new THREE.SphereGeometry(r*.15,10,8),seatMat,x*r,r*.61,(z-.09)*r);
    frame.add(new THREE.SphereGeometry(r*.135,10,6,0,Math.PI),cockpitMat,x*r,r*.62,(z-.14)*r,0,Math.PI);
    frame.add(new THREE.BoxGeometry(r*.04,r*.36,r*.025),warningMat,(x-.11)*r,r*.25,(z-.11)*r);
    frame.add(new THREE.BoxGeometry(r*.04,r*.36,r*.025),warningMat,(x+.11)*r,r*.25,(z-.11)*r);
  }
  attachDetailLOD(frame,canopy,600);
  canopy.name="reflective-canopy";
}

function flameTexture():THREE.DataTexture {
  const w=32,h=128,data=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    const t=y/(h-1), edge=Math.pow(Math.sin(x/(w-1)*Math.PI),.3);
    const i=(y*w+x)*4;
    const cell=Math.exp(-Math.pow((t*4.3)%1-.3,2)/.015);
    data[i]=data[i+1]=data[i+2]=Math.round(185+70*cell);
    data[i+3]=Math.round(255*edge*Math.pow(1-t,.75));
  }
  const texture=new THREE.DataTexture(data,w,h);
  texture.magFilter=texture.minFilter=THREE.LinearFilter; texture.needsUpdate=true;
  return texture;
}
const plumeMap=flameTexture();

function engines(jet:TomcatMesh,id:AircraftId,batch:DetailBatch):void {
  const config=id==="tomcat"?{x:[-1.55,1.55],y:-.15,z:10,r:.58}:
    id==="hornet"?{x:[-.78,.78],y:-.2,z:8.05,r:.48}:
    id==="crusader"?{x:[0],y:0,z:8.25,r:.55}:
    id==="intruder"?{x:[-.85,.85],y:-.3,z:8.3,r:.4}:null;
  if(!config) return;
  const {x:centres,y,z,r}=config;
  const plumes:THREE.BufferGeometry[]=[];
  for(const x of centres) {
    // Recessed turbine, a dark exhaust cavity, lip and overlapping nozzle petals.
    batch.add(new THREE.CylinderGeometry(r*.84,r*.84,.08,24),cockpitMat,x,y,z-.14,Math.PI/2);
    batch.add(new THREE.TorusGeometry(r,.037,6,32),metalMat,x,y,z);
    for(let i=0;i<16;i++) {
      const a=i/16*Math.PI*2;
      batch.add(new THREE.BoxGeometry(.028,r*.17,.65),metalMat,
        x+Math.cos(a)*r,y+Math.sin(a)*r,z-.32,0,0,a);
    }
    if(id==="intruder") continue;
    const points=[new THREE.Vector2(r*.9,0),new THREE.Vector2(r,.3),
      new THREE.Vector2(r*.7,1.6),new THREE.Vector2(.025,3.8)];
    const g=new THREE.LatheGeometry(points,20).rotateX(Math.PI/2);
    g.translate(x,0,0);
    const position=g.getAttribute("position"),colors:number[]=[];
    for(let i=0;i<position.count;i++) {
      const t=THREE.MathUtils.clamp(position.getZ(i)/3.8,0,1);
      const c=new THREE.Color().setRGB(.38+t*.55,.56-t*.22,1-t*.44);
      colors.push(c.r,c.g,c.b);
    }
    g.setAttribute("color",new THREE.Float32BufferAttribute(colors,3)); plumes.push(g);
    const core=new THREE.LatheGeometry([new THREE.Vector2(r*.38,0),new THREE.Vector2(r*.34,.6),
      new THREE.Vector2(.015,2.1)],16).rotateX(Math.PI/2).translate(x,0,0);
    core.setAttribute("color",new THREE.Float32BufferAttribute(
      Array.from({length:core.getAttribute("position").count*3},(_,j)=>j%3===0?.65:j%3===1?.78:1),3));
    plumes.push(core);
  }
  const flame=jet.afterburner;
  flame.geometry.dispose();
  if(id==="intruder") { flame.geometry=new THREE.BufferGeometry(); flame.visible=false; return; }
  // Normalise attributes before merging the lathe and shock cells.
  const geometries=plumes.map(g=>{ const n=g.index?g.toNonIndexed():g; if(n!==g) g.dispose(); return n; });
  flame.geometry=mergeGeometries(geometries)!;
  for(const g of geometries) g.dispose();
  (flame.material as THREE.Material).dispose();
  flame.material=new THREE.MeshBasicMaterial({map:plumeMap,vertexColors:true,color:0xffffff,
    transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,
    side:THREE.DoubleSide,toneMapped:false});
  flame.position.set(0,y,z); flame.rotation.set(0,0,0); flame.scale.set(1,1,1);
  flame.name="engine-plumes"; flame.castShadow=false; flame.receiveShadow=false;
}

function markings(jet:TomcatMesh):void {
  for(const panel of jet.wingPanels) {
    panel.geometry.computeBoundingBox();
    const bb=panel.geometry.boundingBox!;
    const span=bb.max.z;
    if(span<1) continue;
    const batch=new DetailBatch();
    // Low-visibility national insignia: star and bars, attached to the moving wing.
    const shape=new THREE.Shape();
    for(let i=0;i<10;i++) {
      const a=i/10*Math.PI*2, r=i%2?.15:.35;
      const x=Math.cos(a)*r,y=Math.sin(a)*r;
      if(i===0) shape.moveTo(x,y); else shape.lineTo(x,y);
    }
    shape.closePath();
    batch.add(new THREE.ShapeGeometry(shape),markingMat,0,.19,span*.68,-Math.PI/2);
    batch.add(new THREE.BoxGeometry(.17,.015,.87),markingMat,0,.18,span*.68);
    // Walkway blocks at the root and a thin maintenance stripe.
    batch.add(new THREE.BoxGeometry(.7,.015,span*.24),markingMat,0,.18,span*.18);
    attachDetailLOD(batch,panel);
  }
}

export function addAircraftDetails(jet:TomcatMesh,id:AircraftId,bandit:boolean):void {
  jet.group.name=`aircraft-${id}`;
  cockpit(jet,id);
  const details=new THREE.Group(); details.name="airframe-close-detail";
  const lod=new THREE.LOD(); lod.name="airframe-detail-lod";
  lod.addLevel(details,0); lod.addLevel(new THREE.Group(),850); jet.group.add(lod);
  const batch=new DetailBatch();
  engines(jet,id,batch);
  const fuselageWidth=id==="tomcat"?1.72:id==="hornet"?1.27:id==="intruder"?1.33:id==="seahawk"?1.16:.93;
  for(const sx of [-1,1]) batch.add(stencil("NAVY",.32),markingMat,sx*fuselageWidth,.1,2.2,0,sx*Math.PI/2);
  // Tail identifiers follow each aircraft's real fin, including Hornet cant.
  for(const child of jet.group.children) {
    const fin=child as THREE.Mesh;
    if(!fin.isMesh || !(fin.geometry instanceof THREE.ExtrudeGeometry))continue;
    fin.geometry.computeBoundingBox();
    if(fin.geometry.boundingBox!.max.y-fin.geometry.boundingBox!.min.y<1)continue;
    const tail=new DetailBatch();
    for(const sx of [-1,1]) {
      tail.add(stencil('AJ',.48),markingMat,sx*.12,.4,.65,0,sx*Math.PI/2);
      tail.add(stencil('101',.22),markingMat,sx*.12,-.18,.55,0,sx*Math.PI/2);
    }
    attachDetailLOD(tail,fin);
  }
  if(id!=="seahawk") {
    // Pitot, dorsal aerial, brake hook and anti-glare nose panel.
    const nose=id==="tomcat"?-9.55:id==="hornet"?-7.7:id==="intruder"?-8.8:-8.1;
    batch.add(new THREE.ConeGeometry(.035,.7,8),metalMat,0,.05,nose-.3,-Math.PI/2);
    batch.add(new THREE.BoxGeometry(.04,.5,.42),aircraftMaterial("dark",bandit),0,1.15,1.8,0,0,-.13);
    batch.add(new THREE.CylinderGeometry(.055,.055,2.5,8),metalMat,0,-.8,6.8,Math.PI/2);
    batch.add(new THREE.BoxGeometry(.3,.14,.18),cockpitMat,0,-.83,8.03);
  }
  batch.attach(details);
  markings(jet);
  // Detailed oleo struts and wheel hubs keep the existing contact stations.
  const gear=new DetailBatch();
  for(const wheel of jet.gear.children) {
    if(!(wheel instanceof THREE.Mesh) || !(wheel.geometry instanceof THREE.CylinderGeometry)) continue;
    if(wheel.rotation.z===0) {
      gear.add(new THREE.CylinderGeometry(.055,.055,.55,10),metalMat,wheel.position.x,wheel.position.y-.12,wheel.position.z);
    } else for(const sx of [-1,1]) {
      gear.add(new THREE.CylinderGeometry(.15,.15,.03,12),metalMat,
        wheel.position.x+sx*.15,wheel.position.y,wheel.position.z,0,0,Math.PI/2);
    }
  }
  if(id!=="seahawk") {
    gear.add(tube([new THREE.Vector3(0,-1.35,-6),new THREE.Vector3(0,-.43,-6)],.055),metalMat);
    for(const sx of [-1,1]) gear.add(tube([new THREE.Vector3(sx*2.3,-1.6,.5),
      new THREE.Vector3(sx*1.5,-.3,.8)],.07),metalMat);
  }
  gear.attach(jet.gear);
}

/** One convention for player, AI and multiplayer exhausts: the origin is the
 * nozzle exit and only length scales, so the twin plumes never drift sideways. */
export function animateExhaust(jet:TomcatMesh,level:number,time:number):void {
  const flame=jet.afterburner;
  const ab=THREE.MathUtils.clamp(level,0,1);
  const flicker=.94+.06*Math.sin(time*47)*Math.sin(time*31);
  flame.visible=ab>.02 && flame.name==="engine-plumes";
  (flame.material as THREE.MeshBasicMaterial).opacity=ab*.78*flicker;
  flame.scale.set(1,1,.25+ab*.95*flicker);
}
