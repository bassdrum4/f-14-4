// Cosmetic remote projectiles. Hull and scores remain owned by the referee.
// One instanced draw per weapon type keeps a busy room from adding draw calls
// for every tracer. Spawn packets travel directly over the existing mesh.
import * as THREE from 'three';
import { missileWarning } from '../sim/countermeasures';
import { atmosphere } from '../sim/atmosphere';
import { groundAt } from '../sim/world';
import type { ExplosionField } from './effects';
import type { BattleShot, BattleMissiles } from '../net/versus';
interface Projectile { sender: string; shot: BattleShot; pos: THREE.Vector3; vel: THREE.Vector3; age: number; trail: number; target: string | null; id: number; sinceUpdate: number }
export interface WeaponContact { id: string; pos: THREE.Vector3; vel?: THREE.Vector3 }
export class RemoteWeapons {
  private root = new THREE.Group();
  private projectiles: Projectile[] = [];
  private bullets = new THREE.InstancedMesh(new THREE.BoxGeometry(.22,.22,7),new THREE.MeshBasicMaterial({ color: 0xffb368, toneMapped: false }),256);
  private missiles = new THREE.InstancedMesh(new THREE.ConeGeometry(.3,3.5,6).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({ color: 0xece8d8, roughness: .6 }),32);
  private dummy = new THREE.Object3D();
  private dir = new THREE.Vector3();
  private nose = new THREE.Vector3(0,0,-1);
  incoming = false;
  warning: ReturnType<typeof missileWarning> | null = null;
  private stationary = new THREE.Vector3();
  constructor(scene: THREE.Scene, private blasts: ExplosionField) {
    this.root.name = "remote-weapon-effects";
    this.bullets.count = this.missiles.count = 0;
    this.bullets.frustumCulled = this.missiles.frustumCulled = false;
    this.root.add(this.bullets,this.missiles);scene.add(this.root);
  }
  add(sender: string, shot: BattleShot): void {
    if (shot.weapon !== 'gun' || this.projectiles.length >= 288) return;
    this.projectiles.push({ sender, shot, pos: new THREE.Vector3(...shot.pos), vel: new THREE.Vector3(...shot.vel), age: 0, trail: 0, target: null, id: shot.seq, sinceUpdate: 0 });
  }
  /** Reconcile flight owned by the shooter; never reroll the defender's flares. */
  reconcile(sender: string, snapshot: BattleMissiles): void {
    const live = new Set(snapshot.missiles.map(m => m.id));
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.sender === sender && p.shot.weapon === 'missile' &&
        (p.shot.match !== snapshot.match || p.shot.life !== snapshot.life || !live.has(p.id))) {
        this.blasts.spawn(p.pos.clone(), 'air', .7);
        this.projectiles.splice(i, 1);
      }
    }
    for (const m of snapshot.missiles) {
      let p = this.projectiles.find(p => p.sender === sender && p.shot.weapon === 'missile' && p.id === m.id);
      if (!p) {
        if (this.projectiles.length >= 288) continue;
        p = { sender, shot: { weapon: 'missile', match: snapshot.match, life: snapshot.life, seq: snapshot.seq, pos: m.pos, vel: m.vel },
          pos: new THREE.Vector3(), vel: new THREE.Vector3(), age: m.age, trail: 0, target: m.target, id: m.id, sinceUpdate: 0 };
        this.projectiles.push(p);
      }
      p.pos.fromArray(m.pos); p.vel.fromArray(m.vel); p.age = m.age;
      p.target = m.target; p.sinceUpdate = 0;
    }
  }
  prune(match: number, pilots: ReadonlyArray<{ id: string; life: number; hp: number }>): void {
    this.projectiles = this.projectiles.filter(p => p.shot.match === match && pilots.some(row => row.id === p.sender && row.life === p.shot.life && row.hp > 0));
  }
  clear(): void { this.projectiles = []; this.bullets.count = this.missiles.count = 0; this.incoming = false; this.warning = null; }
  step(frameDt: number, contacts: WeaponContact[], self: string): void {
    let bulletCount=0, missileCount=0;this.incoming=false;this.warning=null;
    const steps=Math.max(1,Math.ceil(Math.min(frameDt,.1)*120)),dt=Math.min(frameDt,.1)/steps;
    for(let i=this.projectiles.length-1;i>=0;i--){
      const p=this.projectiles[i], missile=p.shot.weapon==='missile';let dead=false;
      for(let sub=0;sub<steps&&!dead;sub++){
        p.age+=dt;
        if(!missile){
          const k=.5*atmosphere(p.pos.y).rho*.000025*p.vel.length()/.1;
          p.vel.multiplyScalar(Math.max(0,1-k*dt));p.vel.y-=9.81*dt;
        }else{
          // Short extrapolation hides packet spacing. Seeker state and endings
          // come from the damaging simulation, including capture and relock.
          const advance = Math.min(dt, Math.max(0, .15 - p.sinceUpdate));
          p.pos.addScaledVector(p.vel, advance); p.sinceUpdate += dt;
          const target = contacts.find(c => c.id === p.target);
          if (target && target.id === self && p.pos.distanceToSquared(target.pos) < 12000**2) {
            this.incoming = true;
            const warning = missileWarning(p.pos, p.vel, target.pos, target.vel ?? this.stationary);
            if (!this.warning || warning.km < this.warning.km) this.warning = warning;
          }
        }
        if (!missile) p.pos.addScaledVector(p.vel, dt);
        if(missile ? p.sinceUpdate > 2 : p.age > 2 || p.pos.y <= groundAt(p.pos.x,p.pos.z).y)dead=true;
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
