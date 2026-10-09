import { Scene, Vector3, InstancedMesh } from 'three';
import { RemoteWeapons } from '../src/render/remoteWeapons';
import { BattleReferee, type BattleAction } from '../src/net/versus';
import { Dogfight } from '../src/sim/dogfight';
import { ExplosionField } from '../src/render/effects';
import { spawnAircraft } from '../src/sim/flight';
let failures=0, seq=0;
function check(name:string,pass:boolean){console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)failures++;}
const ref=new BattleReferee();ref.reset(17);ref.reconcile([{id:'a',name:'ALPHA'},{id:'b',name:'BRAVO'}]);
const act=(patch:Partial<BattleAction>):BattleAction=>({kind:'hit',match:17,seq:++seq,life:1,victim:'b',victimLife:1,weapon:'gun',...patch});
ref.action('a',act({kind:'ready'}),0,0);ref.action('b',act({kind:'ready'}),0,0);
check('spawn shield blocks damage',!ref.action('a',act({}),2,400));
check('missile damages an unshielded opponent',ref.action('a',act({weapon:'missile'}),6,400)&&ref.snapshot(6).pilots[1].hp===10);
const lethal=act({weapon:'gun'});
ref.action('a',lethal,6.2,400,10);
check('kill and death awarded once',ref.snapshot(6.2).pilots[0].kills===1&&ref.snapshot(6.2).pilots[1].deaths===1);
check('duplicate hit ignored',!ref.action('a',lethal,6.3,400));
const respawn=ref.snapshot(9.3).pilots[1];
check('dead pilot respawns with full hull and a new life',respawn.hp===100&&respawn.life===2&&respawn.shield);
check('old-life hit cannot damage a respawn',!ref.action('a',act({weapon:'missile'}),15,400));
check('out-of-range gun claim rejected',!ref.action('a',act({victimLife:2}),15,6000));
check('unknown pilot rejected',!ref.action('intruder',act({victimLife:2}),15,400));
check('wrong match rejected',!ref.action('a',act({match:16,victimLife:2}),15,400));
const migrated=new BattleReferee();migrated.restore(ref.snapshot(15),20);
check('host takeover preserves scores and lives',migrated.snapshot(20).pilots[0].kills===1&&migrated.snapshot(20).pilots[1].life===2);
// Exercise real projectiles against a moving player target. The shooter and
// target share lateral velocity: assistance must lead their relative motion.
const scene=new Scene(), df=new Dogfight(scene,new ExplosionField(scene,'low'));
const p=spawnAircraft('carrier',0);p.pos.set(-27000,1800,-27000);p.vel.set(80,0,-210);p.speed=p.vel.length();p.onGround=false;p.gearT=0;p.quat.identity();
df.beginVersus(p);const target=p.pos.clone().add(new Vector3(20,0,-500));let gunHits=0;
for(let i=0;i<240;i++){
 p.pos.addScaledVector(p.vel,1/120);target.addScaledVector(p.vel,1/120);p.time+=1/120;
 df.setOpponents([{id:'b',life:2,pos:target.clone(),vel:p.vel.clone()}]);df.step(1/120,p,true);
 gunHits+=df.takePlayerHits().filter(h=>h.weapon==='gun'&&h.id==='b'&&h.life===2).length;
}
check('real gun rounds hit a moving remote aircraft',gunHits>0);
df.setOpponents([{id:'b',life:2,pos:p.pos.clone().add(new Vector3(0,0,-400)),vel:new Vector3()}]);df.requestMissile(p);let missileHits=0;
for(let i=0;i<1200;i++){p.time+=1/120;df.step(1/120,p,false);missileHits+=df.takePlayerHits().filter(h=>h.weapon==='missile').length;}
check('a real missile damages a remote aircraft',missileHits>0);
df.clear();df.step(1/120,p,true);check('cruise/co-op do not retain versus opponents',df.takePlayerHits().length===0);
const effectsScene=new Scene(), remoteWeapons=new RemoteWeapons(effectsScene,new ExplosionField(effectsScene,'low'));
remoteWeapons.add('b',{weapon:'gun',match:17,life:2,seq:10,pos:[0,1800,0],vel:[0,0,-1050]});
remoteWeapons.step(.1,[],'a');
const visuals=effectsScene.getObjectByName('remote-weapon-effects')!;
check('remote gunfire appears in the instanced tracer batch',(visuals.children[0] as InstancedMesh).count===1);
remoteWeapons.add('b',{weapon:'missile',match:17,life:2,seq:11,pos:[0,1800,0],vel:[0,0,-300]});
for(let i=0;i<5;i++)remoteWeapons.step(.1,[{id:'a',pos:new Vector3(0,1800,-900)}],'a');
check('an incoming remote missile raises the warning',remoteWeapons.incoming);
check('remote missiles have a visible airframe batch',(visuals.children[1] as InstancedMesh).count===1);
remoteWeapons.clear();check('respawn clears old remote weapon visuals',(visuals.children[0] as InstancedMesh).count===0&&!remoteWeapons.incoming);
remoteWeapons.dispose();
process.exit(failures?1:0);
