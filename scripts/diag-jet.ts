// Verify the Tomcat's control-surface geometry + deflection directions in body
// coordinates (body: forward = -Z, up = +Y, right = +X) so placement/sign
// regressions in render/geometry.ts or render/rig.ts get caught.
// Usage: bun scripts/diag-jet.ts

import { Vector3, type Mesh, type Object3D } from "three";
import { buildTomcat } from "../src/render/geometry";
import { animateJet } from "../src/render/rig";
import type { AircraftState } from "../src/sim/flight";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

const jet = buildTomcat();

const state = {
  sweepT: 0, flapT: 0, gearT: 1, wheelPen: 0.1, abLevel: 0, time: 0,
} as unknown as AircraftState;

function meshOf(o: Object3D): Mesh {
  return o as Mesh;
}

/** World-space z extent of an object's geometry. */
function zRange(o: Object3D): [number, number] {
  const g = meshOf(o).geometry;
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  let lo = Infinity;
  let hi = -Infinity;
  for (const x of [bb.min.x, bb.max.x])
    for (const y of [bb.min.y, bb.max.y])
      for (const z of [bb.min.z, bb.max.z]) {
        const v = new Vector3(x, y, z).applyMatrix4(o.matrixWorld);
        lo = Math.min(lo, v.z);
        hi = Math.max(hi, v.z);
      }
  return [lo, hi];
}

/** World y of the most-aft corner (max z) — the trailing edge height. */
function aftEdgeY(o: Object3D): number {
  const g = meshOf(o).geometry;
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  let bestZ = -Infinity;
  let y = 0;
  for (const x of [bb.min.x, bb.max.x])
    for (const yy of [bb.min.y, bb.max.y])
      for (const z of [bb.min.z, bb.max.z]) {
        const v = new Vector3(x, yy, z).applyMatrix4(o.matrixWorld);
        if (v.z > bestZ) {
          bestZ = v.z;
          y = v.y;
        }
      }
  return y;
}

/** World x of the most-aft corner (max z) — the rudder trailing edge. */
function aftEdgeX(o: Object3D): number {
  const g = meshOf(o).geometry;
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  let bestZ = -Infinity;
  let x = 0;
  for (const px of [bb.min.x, bb.max.x])
    for (const py of [bb.min.y, bb.max.y])
      for (const pz of [bb.min.z, bb.max.z]) {
        const v = new Vector3(px, py, pz).applyMatrix4(o.matrixWorld);
        if (v.z > bestZ) {
          bestZ = v.z;
          x = v.x;
        }
      }
  return x;
}

function setInputs(elev: number, ail: number, rud: number, flapT: number): void {
  jet.group.userData.elevator = elev;
  jet.group.userData.aileron = ail;
  jet.group.userData.rudder = rud;
  state.flapT = flapT;
  animateJet(jet, state, 1, 1 / 60);
  jet.group.updateMatrixWorld(true);
}

const flapAftEdge: number[] = [];
const stabAftEdge: number[] = [];
const rudderTe: number[] = [];

// --- placement: both flaps must sit on the aft half of their wing panel ---
setInputs(0, 0, 0, 0);
for (let i = 0; i < 2; i++) {
  const side = i === 0 ? "R" : "L";
  const [pLo, pHi] = zRange(jet.wingPanels[i]);
  const [fLo, fHi] = zRange(meshOf(jet.flaps[i]).children[0]);
  const panelMid = (pLo + pHi) / 2;
  const flapMid = (fLo + fHi) / 2;
  check(
    `flap ${side} hangs off the trailing edge (aft of the panel midline)`,
    flapMid > panelMid && fHi <= pHi + 0.6 && fLo >= pLo - 0.6,
    `panel z ${pLo.toFixed(2)}..${pHi.toFixed(2)}, flap z ${fLo.toFixed(2)}..${fHi.toFixed(2)}`,
  );
}
for (let i = 0; i < 2; i++) flapAftEdge.push(aftEdgeY(meshOf(jet.flaps[i]).children[0]));
for (let i = 0; i < 2; i++) stabAftEdge.push(aftEdgeY(meshOf(jet.stabs[i]).children[0]));
for (let i = 0; i < 2; i++) rudderTe.push(aftEdgeX(jet.rudders[i]));

// --- flaps deploy down on both wings ---
setInputs(0, 0, 0, 1);
for (let i = 0; i < 2; i++) {
  const side = i === 0 ? "R" : "L";
  const y = aftEdgeY(meshOf(jet.flaps[i]).children[0]);
  check(`flaps down: ${side} flap trailing edge drops`, y < flapAftEdge[i] - 0.05, `${flapAftEdge[i].toFixed(3)} -> ${y.toFixed(3)}`);
}

// --- nose-up command: stabilator trailing edges rise ---
setInputs(-0.6, 0, 0, 0);
for (let i = 0; i < 2; i++) {
  const side = i === 0 ? "R" : "L";
  const y = aftEdgeY(meshOf(jet.stabs[i]).children[0]);
  check(`nose-up cmd: ${side} stab trailing edge rises`, y > stabAftEdge[i] + 0.05, `${stabAftEdge[i].toFixed(3)} -> ${y.toFixed(3)}`);
}

// --- roll right: right flap up, left flap down ---
setInputs(0, 0.5, 0, 0);
{
  const r = aftEdgeY(meshOf(jet.flaps[0]).children[0]);
  const l = aftEdgeY(meshOf(jet.flaps[1]).children[0]);
  check("roll right: right flap trailing edge up", r > flapAftEdge[0] + 0.05, `${flapAftEdge[0].toFixed(3)} -> ${r.toFixed(3)}`);
  check("roll right: left flap trailing edge down", l < flapAftEdge[1] - 0.05, `${flapAftEdge[1].toFixed(3)} -> ${l.toFixed(3)}`);
}

// --- yaw right: both rudder trailing edges move starboard (+x) ---
setInputs(0, 0, 0.5, 0);
for (let i = 0; i < 2; i++) {
  const side = i === 0 ? "R" : "L";
  const x = aftEdgeX(jet.rudders[i]);
  check(`yaw right: ${side} rudder trailing edge moves starboard`, x > rudderTe[i] + 0.02, `${rudderTe[i].toFixed(3)} -> ${x.toFixed(3)}`);
}

// --- afterburner plume must not cast a shadow ---
check("afterburner does not cast a shadow", jet.afterburner.castShadow === false);
check("airframe casts shadows", meshOf(jet.canopy).castShadow === true);

console.log(failures === 0 ? "\nALL JET GEOMETRY CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
