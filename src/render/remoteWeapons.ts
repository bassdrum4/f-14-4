// Cosmetic remote projectiles. Hull and scores remain owned by the referee.
// One instanced draw per weapon type keeps a busy room from adding draw calls
// for every tracer. Spawn packets travel directly over the existing mesh.
import * as THREE from 'three';
import { atmosphere } from '../sim/atmosphere';
import { groundAt } from '../sim/world';
import type { ExplosionField } from './effects';
import type { BattleShot } from '../net/versus';
interface Projectile { sender: string; shot: BattleShot; pos: THREE.Vector3; vel: THREE.Vector3; age: number; trail: number }
export interface WeaponContact { id: string; pos: THREE.Vector3 }
export class RemoteWeapons {
  private root = new THREE.Group();
  private projectiles: Projectile[] = [];
  private bullets = new THREE.InstancedMesh(new THREE.BoxGeometry(.22,.22,7),new THREE.MeshBasicMaterial({ color: 0xffb368, toneMapped: false }),256);
  private missiles = new THREE.InstancedMesh(new THREE.ConeGeometry(.3,3.5,6).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({ color: 0xece8d8, roughness: .6 }),32);
  private dummy = new THREE.Object3D();
  private dir = new THREE.Vector3();
  private aim = new THREE.Vector3();
  private axis = new THREE.Vector3();
  private nose = new THREE.Vector3(0,0,-1);
  incoming = false;
  constructor(scene: THREE.Scene, private blasts: ExplosionField) {
    this.root.name = "remote-weapon-effects";
    this.bullets.count = this.missiles.count = 0;
    this.bullets.frustumCulled = this.missiles.frustumCulled = false;
    this.root.add(this.bullets,this.missiles);scene.add(this.root);
  }
  add(sender: string, shot: BattleShot): void {
    if (this.projectiles.length >= 288) return;
    this.projectiles.push({ sender, shot, pos: new THREE.Vector3(...shot.pos), vel: new THREE.Vector3(...shot.vel), age: 0, trail: 0 });
  }
  clear(): void { this.projectiles = []; this.bullets.count = this.missiles.count = 0; this.incoming = false; }
  step(frameDt: number, contacts: WeaponContact[], self: string): void {
    let bulletCount=0, missileCount=0;this.incoming=false;
    const steps=Math.max(1,Math.ceil(Math.min(frameDt,.1)*120)),dt=Math.min(frameDt,.1)/steps;
    for(let i=this.projectiles.length-1;i>=0;i--){
      const p=this.projectiles[i], missile=p.shot.weapon==='missile';let dead=false;
      for(let sub=0;sub<steps&&!dead;sub++){
        p.age+=dt;
        if(!missile){
          const k=.5*atmosphere(p.pos.y).rho*.000025*p.vel.length()/.1;
          p.vel.multiplyScalar(Math.max(0,1-k*dt));p.vel.y-=9.81*dt;
        }else if(p.age<2.6){
          p.vel.addScaledVector(this.dir.copy(p.vel).normalize(),230*dt);
          if(p.vel.length()>640)p.vel.setLength(640);
        }else{
          const k=.5*atmosphere(p.pos.y).rho*.3*.045*p.vel.length()/230;
          p.vel.multiplyScalar(Math.max(0,1-k*dt));p.vel.y-=9.81*.6*dt;
        }
        p.pos.addScaledVector(p.vel,dt);
        if(missile&&p.age>.35){
          let target: WeaponContact|undefined, best=Infinity;
          for(const c of contacts){if(c.id===p.sender)continue;const d=c.pos.distanceToSquared(p.pos);if(d<best){best=d;target=c;}}
          if(target){
            if(target.id===self&&best<12000**2)this.incoming=true;
            if(best<26**2){this.blasts.spawn(p.pos.clone(),'air',.7);dead=true;continue;}
            const speed=p.vel.length();this.dir.copy(p.vel).normalize();this.aim.copy(target.pos).sub(p.pos).normalize();
            const angle=this.dir.angleTo(this.aim);this.axis.crossVectors(this.dir,this.aim);
            if(this.axis.lengthSq()<1e-8)this.axis.set(0,1,0);
            this.dir.applyAxisAngle(this.axis.normalize(),Math.min(angle,2.1*dt));p.vel.copy(this.dir).multiplyScalar(speed);
          }
        }
        if(p.age>(missile?25:2)||p.pos.y<=groundAt(p.pos.x,p.pos.z).y)dead=true;
      }
      if(dead){this.projectiles.splice(i,1);continue;}
      if(missile){
        p.trail-=frameDt;if(p.trail<=0){this.blasts.trail(p.pos,p.age<2.6?1.9:.9,p.age<2.6?1.6:1.1);p.trail=p.age<2.6?.045:.12;}
      }
      const mesh=missile?this.missiles:this.bullets,index=missile?missileCount++:bulletCount++;
      if(index>=mesh.instanceMatrix.count)continue;
      this.dummy.position.copy(p.pos);this.dummy.scale.setScalar(1);
      this.dummy.quaternion.setFromUnitVectors(this.nose,this.dir.copy(p.vel).normalize());this.dummy.updateMatrix();mesh.setMatrixAt(index,this.dummy.matrix);
    }
    this.bullets.count=Math.min(bulletCount,256);this.missiles.count=Math.min(missileCount,32);
    this.bullets.instanceMatrix.needsUpdate=this.missiles.instanceMatrix.needsUpdate=true;
  }
  dispose(): void {
    this.root.removeFromParent();this.clear();
    for(const mesh of [this.bullets,this.missiles]){mesh.dispose();mesh.geometry.dispose();(mesh.material as THREE.Material).dispose();}
  }
}
