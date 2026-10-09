// Local rendering policy checks; no browser, network or Actions workflow.
import { strict as assert } from 'node:assert';
import { ResolutionBudget } from '../src/render/performance';
import { buildAircraft } from '../src/render/geometry';
import { buildCarrier } from '../src/render/scene';
import { carriers } from '../src/sim/world';
import { type Mesh, type InstancedMesh } from 'three';

const budget = new ResolutionBudget();
let now = 1000;
function run(seconds: number, hz: number, visible = true, enabled = true) {
  for (let i = 0; i < seconds * hz; i++) budget.sample(now += 1000 / hz, enabled, visible);
}
run(5, 60);
assert.equal(budget.scale, 1, 'smooth frames retain selected resolution');
run(7, 30);
assert.equal(budget.scale, .65, 'sustained load reduces pixels to a bounded floor');
run(2, 60);
assert.equal(budget.scale, .65, 'resolution does not immediately bounce back');
run(8, 60);
assert(budget.scale > .65 && budget.scale <= 1, 'resolution recovers slowly');
budget.reset();
run(10, 5, false);
assert.equal(budget.scale, 1, 'hidden tabs do not degrade quality');
run(10, 30, true, false);
assert.equal(budget.scale, 1, 'manual resolution stays fixed');
budget.sample(now += 5000, true, true);
run(1, 60);
assert.equal(budget.scale, 1, 'one long interruption does not degrade quality');

for (const id of ['tomcat', 'hornet', 'intruder'] as const) {
  const jet = buildAircraft(id);
  jet.group.traverse(o => {
    if ((o as Mesh).isMesh) assert(o.frustumCulled, `${id}: meshes can cull from both render passes`);
  });
}
const ship = buildCarrier(carriers()[0]);
let lamps = 0;
ship.traverse(o => {
  if ((o as InstancedMesh).isInstancedMesh) {
    lamps++;
    assert(!o.castShadow && !o.receiveShadow, 'deck lamps avoid the shadow pass');
    assert(o.frustumCulled && (o as InstancedMesh).boundingSphere, 'lamp instances have culling bounds');
  }
});
assert.equal(lamps, 4);
console.log('ALL PERFORMANCE POLICY CHECKS PASSED');
