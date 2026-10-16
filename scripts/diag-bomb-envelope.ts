import { Scene, Vector3 } from 'three';
import { canBombReach } from '../src/sim/bombTrajectory';
import { Dogfight } from '../src/sim/dogfight';
import { ExplosionField } from '../src/render/effects';
import { spawnAircraft } from '../src/sim/flight';
import { groundAt } from '../src/sim/world';
let failures = 0;
function check(name: string, pass: boolean) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) failures++; }
// Open ocean isolates the weapon envelope from island occlusion.
const start = new Vector3(-27000, 900, -27000), velocity = new Vector3(0,-2.5,-240);
const near = new Vector3(-27000,0,-28000);
check('a normal altitude/range drop can reach the spot', canBombReach(start,velocity,near));
// The laser's guidance window bounds the weapon. A low, fast release is still
// answered out to its glide limit, and past that limit the store flies
// ballistically and the spot cannot be reached: the old free-energy steering
// held a line of sight forever and would chase a target 22 km away.
check('a glide inside the laser window reaches the spot', canBombReach(new Vector3(-27000,30,-27000),new Vector3(0,-2.5,-300),new Vector3(-27000,0,-35000)));
check('a stand-off past the laser window is refused', !canBombReach(new Vector3(-27000,30,-27000),new Vector3(0,-2.5,-300),new Vector3(-27000,0,-39000)));
check('a target behind a low fast aircraft is unreachable', !canBombReach(new Vector3(-27000,15,-27000),new Vector3(0,-2.5,-300),new Vector3(-27000,0,-26000)));
const scene = new Scene(), df = new Dogfight(scene, new ExplosionField(scene,'low'));
const player=spawnAircraft('airfield',0); player.pos.copy(start); player.vel.copy(velocity);player.onGround=false;player.gearT=0;
df.setAircraft(player);df.setDesignation(near);
const before=df.hud(player).bombs;
check('reachable pod click is accepted',df.requestBombRelease(player));
for(let i=0;i<120*30;i++){player.time+=1/120;df.step(1/120,player,false); if(df.lastImpactKind) break;}
check('accepted trajectory actually detonates at the designated spot',df.lastImpact.distanceTo(near)<12);
check('one accepted click spends one bomb',df.hud(player).bombs===before-1);
player.pos.set(-27000,15,-27000);player.vel.set(0,0,-300);df.setDesignation(new Vector3(-27000,groundAt(-27000,-26000).y,-26000));
const remaining=df.hud(player).bombs;
check('impossible pod click is rejected',!df.requestBombRelease(player));
for(let i=0;i<120;i++)df.step(1/120,player,false);
check('rejected click leaves the rack unchanged',df.hud(player).bombs===remaining);
check('rejected click explains why',player.banner?.text.includes('CANNOT REACH')===true);
process.exit(failures?1:0);
