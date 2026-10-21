// Procedural aircraft surfaces. No external models, textures or browser APIs:
// the same airframes build offline, in multiplayer and in headless diagnostics.
import * as THREE from "three";

/** z, half-width, half-height, centre height. Nose points down body -Z. */
export type Station = readonly [number, number, number, number];

/** Smooth, closed cross sections with a gentle chine rather than box corners. */
export function loft(stations: readonly Station[], chine = 1): THREE.BufferGeometry {
  const positions: number[] = [], uv: number[] = [], colors: number[] = [], indices: number[] = [];
  const radial = 32, steps = 5;
  const rings = (stations.length - 1) * steps;
  const z0 = stations[0][0], length = stations[stations.length - 1][0] - z0;
  for (let r = 0; r <= rings; r++) {
    const segment = Math.min(stations.length - 2, Math.floor(r / steps));
    const t = (r - segment * steps) / steps;
    const a = stations[segment], b = stations[segment + 1];
    // Hermite tangents account for unevenly spaced stations, keeping the nose
    // smooth without overshooting the supplied cross-section bounds.
    const sample = (k: number): number => {
      const p = stations[Math.max(0, segment - 1)], n = stations[Math.min(stations.length - 1, segment + 2)];
      const m0 = (b[k] - p[k]) / (b[0] - p[0]) * (b[0] - a[0]);
      const m1 = (n[k] - a[k]) / (n[0] - a[0]) * (b[0] - a[0]);
      return THREE.MathUtils.clamp((2*t*t*t-3*t*t+1)*a[k] + (t*t*t-2*t*t+t)*m0 +
        (-2*t*t*t+3*t*t)*b[k] + (t*t*t-t*t)*m1, Math.min(a[k],b[k]), Math.max(a[k],b[k]));
    };
    const z = THREE.MathUtils.lerp(a[0], b[0], t), w = sample(1), h = sample(2), y = sample(3);
    for (let j = 0; j <= radial; j++) {
      const angle = j / radial * Math.PI * 2;
      const c = Math.cos(angle), s = Math.sin(angle);
      positions.push(w * Math.sign(c) * Math.pow(Math.abs(c), chine), y + h * s, z);
      uv.push(j / radial, (z-z0) / length);
      // Subtle naval two-tone paint: pale belly and cooler upper surfaces.
      const shade = .91 + .09 * (1 - s) * .5;
      colors.push(shade, shade, shade);
      if (r < rings && j < radial) {
        const i = r * (radial + 1) + j;
        indices.push(i, i+1, i+radial+1, i+1, i+radial+2, i+radial+1);
      }
    }
  }
  for (const [r, reverse] of [[0, true], [rings, false]] as const) {
    const centre = positions.length / 3;
    const st = reverse ? stations[0] : stations[stations.length-1];
    positions.push(0, st[3], st[0]); uv.push(.5, reverse ? 0 : 1); colors.push(1,1,1);
    for (let j = 0; j < radial; j++) {
      const i = r * (radial+1) + j;
      indices.push(...(reverse ? [centre, i+1, i] : [centre, i, i+1]));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(indices); g.computeVertexNormals();
  // Weld the UV seam's normals without welding the UV coordinates.
  const normals = g.getAttribute("normal"), v = new THREE.Vector3();
  for (let r = 0; r <= rings; r++) {
    const a = r * (radial+1), b = a + radial;
    v.set(normals.getX(a)+normals.getX(b), normals.getY(a)+normals.getY(b), normals.getZ(a)+normals.getZ(b)).normalize();
    normals.setXYZ(a,v.x,v.y,v.z); normals.setXYZ(b,v.x,v.y,v.z);
  }
  return g;
}

/** Closed symmetric airfoil, span along +Z, preserving the rig's panel frame. */
export function airfoil(root: number, tip: number, span: number, thickness: number, leadingSign=1): THREE.BufferGeometry {
  const stations: Station[] = [];
  // An elliptical leading edge and a thin trailing edge replace slab wings.
  // Build the chord as a loft, then remap axes: chord -> X, span -> Z.
  const positions: number[] = [], uv: number[] = [], indices: number[] = [];
  const chordSteps = 20, spanSteps = 5, perimeter = chordSteps * 2;
  for (let s = 0; s <= spanSteps; s++) {
    const t = s/spanSteps, chord = THREE.MathUtils.lerp(root,tip,t);
    stations.push([span*t,chord,0,0]);
    for (let j = 0; j <= perimeter; j++) {
      const upper = j <= chordSteps;
      const x = upper ? j/chordSteps : (perimeter-j)/chordSteps;
      const profile = 5*(.2969*Math.sqrt(x)-.126*x-.3516*x*x+.2843*x*x*x-.1036*x*x*x*x);
      positions.push((.5-x)*chord*leadingSign, (upper?1:-1)*profile*thickness*(1-.6*t), span*t);
      uv.push(x,t);
      if(s<spanSteps && j<perimeter) {
        const i = s*(perimeter+1)+j;
        indices.push(i,i+perimeter+1,i+1, i+1,i+perimeter+1,i+perimeter+2);
      }
    }
  }
  for (const [s, flip] of [[0,true],[spanSteps,false]] as const) {
    const centre = positions.length/3;
    positions.push(0,0,stations[s][0]); uv.push(.5,s/spanSteps);
    for(let j=0;j<perimeter;j++) {
      const i=s*(perimeter+1)+j;
      indices.push(...(flip?[centre,i,i+1]:[centre,i+1,i]));
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  if(leadingSign>0) for(let i=0;i<indices.length;i+=3) [indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
  g.setIndex(indices); g.computeVertexNormals();
  return g;
}

/** Swept fin profile in body Y/Z; thickness along X. */
export function finGeometry(height: number, chord: number, thickness: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-chord*.52,-height*.5);
  shape.lineTo(chord*.26,height*.5);
  shape.lineTo(chord*.58,height*.5);
  shape.lineTo(chord*.54,-height*.5);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false,steps:1});
  // Shape X becomes body Z, extrusion becomes body X.
  g.translate(0,0,-thickness*.5); g.rotateY(-Math.PI/2);
  return g;
}

/** Thin planform in the body X/Z plane, used for blended wing-root strakes. */
export function planform(points:readonly (readonly [number,number])[],thickness=.13):THREE.BufferGeometry {
  const shape=new THREE.Shape();
  points.forEach(([x,z],i)=>{if(i===0)shape.moveTo(x,z);else shape.lineTo(x,z);});
  shape.closePath();
  const g=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false});
  return g.translate(0,0,-thickness/2).rotateX(Math.PI/2);
}

/** Bevelled inlet rim and hollow duct: the dark recess sits behind the lip. */
export function intakeDuct(width:number,height:number,length:number):THREE.BufferGeometry {
  const shape=new THREE.Shape();
  shape.moveTo(-width/2,-height/2);shape.lineTo(width/2,-height/2);
  shape.lineTo(width/2,height/2);shape.lineTo(-width/2,height/2);shape.closePath();
  const hole=new THREE.Path(),rim=.075;
  hole.moveTo(-width/2+rim,-height/2+rim);hole.lineTo(-width/2+rim,height/2-rim);
  hole.lineTo(width/2-rim,height/2-rim);hole.lineTo(width/2-rim,-height/2+rim);hole.closePath();
  shape.holes.push(hole);
  const g=new THREE.ExtrudeGeometry(shape,{depth:length,bevelEnabled:true,bevelSize:.025,bevelThickness:.035,bevelSegments:2,steps:1});
  // Inlet ramp leans aft and the trunk narrows towards the engine nacelle.
  const pos=g.getAttribute("position");
  for(let i=0;i<pos.count;i++) {
    const t=THREE.MathUtils.clamp(pos.getZ(i)/length,0,1);
    pos.setXYZ(i,pos.getX(i)*(1-.12*t),pos.getY(i)*(1-.12*t),pos.getZ(i)+pos.getY(i)*.2);
  }
  g.computeVertexNormals();return g;
}

/** Shared, deterministic paint atlas with restrained seams, fasteners and wear. */
function paintAtlas(): THREE.DataTexture {
  const size=512, data=new Uint8Array(size*size*4);
  let seed=9217;
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    seed=(Math.imul(seed,1664525)+1013904223)|0;
    const row=Math.floor(y/64), offset=(row%2)*32;
    const seam=y%64===0 || (x+offset)%128===0;
    const rivet=y%64===4 && (x+offset)%16===0;
    const wear=(y%64<3 || (x+offset)%128<3)?-3:0;
    const value=THREE.MathUtils.clamp(235+((seed>>>28)-8)*.35+wear-(seam?23:0)-(rivet?30:0),0,255);
    const i=(y*size+x)*4;
    data[i]=data[i+1]=data[i+2]=value; data[i+3]=255;
  }
  const texture=new THREE.DataTexture(data,size,size);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.magFilter=THREE.LinearFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps=true; texture.anisotropy=4; texture.needsUpdate=true;
  return texture;
}

const paintMap=paintAtlas();
const materials=new Map<string,THREE.MeshStandardMaterial>();
export function aircraftMaterial(kind:"body"|"wing"|"dark"|"glass", bandit=false): THREE.MeshStandardMaterial {
  const key=`${kind}:${bandit}`;
  let m=materials.get(key);
  if(m) return m;
  const color=kind==="dark"?0x222831:kind==="glass"?0x6e9aa7:
    bandit?(kind==="wing"?0x80564d:0x94685c):(kind==="wing"?0xa0a9b0:0xb7bdc1);
  m=kind==="glass"?new THREE.MeshPhysicalMaterial({color,roughness:.13,metalness:0,
    clearcoat:1,clearcoatRoughness:.07,transparent:true,opacity:.48,depthWrite:false,
    side:THREE.FrontSide,envMapIntensity:1.3}):new THREE.MeshStandardMaterial({
    color,roughness:kind==="dark"?.56:.66,metalness:kind==="dark"?.65:.18,
    map:kind==="dark"?null:paintMap,vertexColors:kind==="body",envMapIntensity:.65,
  });
  m.userData.shared=true; materials.set(key,m); return m;
}

/** A cached sky/ground reflection, generated once rather than rendering six
 * additional cameras every frame. Lighting intensity still follows the sun. */
export function aircraftEnvironment(renderer:THREE.WebGLRenderer):THREE.WebGLRenderTarget {
  const scene=new THREE.Scene(), geometry=new THREE.SphereGeometry(50,32,16);
  const pos=geometry.getAttribute("position"), colors:number[]=[];
  const sky=new THREE.Color(0x91b9d8), horizon=new THREE.Color(0xe1e7e9), ground=new THREE.Color(0x424b51);
  for(let i=0;i<pos.count;i++) {
    const y=pos.getY(i)/50;
    const c=y>0?horizon.clone().lerp(sky,Math.sqrt(y)):horizon.clone().lerp(ground,Math.sqrt(-y));
    colors.push(c.r,c.g,c.b);
  }
  geometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  const material=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide});
  scene.add(new THREE.Mesh(geometry,material));
  const generator=new THREE.PMREMGenerator(renderer);
  const target=generator.fromScene(scene,.12,.1,100);
  generator.dispose(); geometry.dispose(); material.dispose();
  return target;
}
