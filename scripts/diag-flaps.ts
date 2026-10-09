// Headless flap verification: builds the Tomcat mesh, animates it exactly like
// the render rig does, and measures the world-space motion of each flap's
// leading/trailing ends. Reports which end droops which way — ground truth for
// "one flap is wrong" without eyeballing the preview.
// Usage: bun scripts/diag-flaps.ts

import { Vector3 } from "three";
import { buildTomcat, type TomcatMesh } from "../src/render/geometry";
import { animateJet } from "../src/render/rig";
import { spawnAircraft, type AircraftState } from "../src/sim/flight";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`FAIL  ${name} ${extra}`);
  }
}

function pose(over: Partial<AircraftState>): { jet: TomcatMesh; st: AircraftState } {
  const jet = buildTomcat();
  const st = spawnAircraft("airfield", 0);
  st.flapT = 0;
  st.gearT = 0;
  st.abLevel = 0;
  st.time = 0;
  Object.assign(st, over);
  jet.group.userData.aileron = 0;
  animateJet(jet, st, 1, 1 / 60);
  jet.group.updateMatrixWorld(true);
  return { jet, st };
}

/** World position of a flap-hinge-frame point (x measured along the surface). */
function end(jet: TomcatMesh, i: number, x: number): Vector3 {
  return new Vector3(x, 0, 0).applyMatrix4(jet.flaps[i].matrixWorld);
}

interface Ends {
  aft: Vector3; // whichever end is aft in body coords (larger world Z)
  fwd: Vector3;
}

function bothEnds(jet: TomcatMesh, i: number): Ends {
  const a = end(jet, i, -1);
  const b = end(jet, i, 1);
  return a.z >= b.z ? { aft: a, fwd: b } : { aft: b, fwd: a };
}

function delta(from: Ends, to: Ends): { aftDy: number; fwdDy: number } {
  return { aftDy: to.aft.y - from.aft.y, fwdDy: to.fwd.y - from.fwd.y };
}

const AIL = 0.5; // what engine.ts feeds for full roll input

// --- 1. droop: flapT 0 -> 1, wings unswept ---
{
  const neutral = pose({ flapT: 0, sweepT: 0 });
  const dropped = pose({ flapT: 1, sweepT: 0 });
  const right = delta(bothEnds(neutral.jet, 0), bothEnds(dropped.jet, 0));
  const left = delta(bothEnds(neutral.jet, 1), bothEnds(dropped.jet, 1));
  console.log(
    `  droop  right: TE Δy=${right.aftDy.toFixed(3)}  left: TE Δy=${left.aftDy.toFixed(3)}`,
  );
  check("right flap TE droops DOWN", right.aftDy < -0.01, `${right.aftDy.toFixed(3)}`);
  check("left flap TE droops DOWN", left.aftDy < -0.01, `${left.aftDy.toFixed(3)}`);
  check(
    "droop is symmetric",
    Math.abs(right.aftDy - left.aftDy) < 1e-4,
    `${right.aftDy.toFixed(4)} vs ${left.aftDy.toFixed(4)}`,
  );
  check("droop does not lift the LE", right.fwdDy > -0.005 && left.fwdDy > -0.005,
    `fwd ${right.fwdDy.toFixed(3)} / ${left.fwdDy.toFixed(3)}`);
}

// --- 2. flaperon: full roll-right input, wings unswept ---
{
  const neutral = pose({ flapT: 0, sweepT: 0 });
  const rolled = pose({ flapT: 0, sweepT: 0 });
  rolled.jet.group.userData.aileron = AIL;
  animateJet(rolled.jet, rolled.st, 1, 1 / 60);
  rolled.jet.group.updateMatrixWorld(true);
  const right = delta(bothEnds(neutral.jet, 0), bothEnds(rolled.jet, 0));
  const left = delta(bothEnds(neutral.jet, 1), bothEnds(rolled.jet, 1));
  console.log(
    `  roll-right  right TE Δy=${right.aftDy.toFixed(3)}  left TE Δy=${left.aftDy.toFixed(3)}`,
  );
  check("roll right lifts the RIGHT flap TE", right.aftDy > 0.01, `${right.aftDy.toFixed(3)}`);
  check("roll right drops the LEFT flap TE", left.aftDy < -0.01, `${left.aftDy.toFixed(3)}`);
}

// --- 3. same checks with wings fully swept ---
{
  const neutral = pose({ flapT: 0, sweepT: 1 });
  const dropped = pose({ flapT: 1, sweepT: 1 });
  const right = delta(bothEnds(neutral.jet, 0), bothEnds(dropped.jet, 0));
  const left = delta(bothEnds(neutral.jet, 1), bothEnds(dropped.jet, 1));
  console.log(
    `  swept droop  right TE Δy=${right.aftDy.toFixed(3)}  left TE Δy=${left.aftDy.toFixed(3)}`,
  );
  check("swept: right flap TE droops DOWN", right.aftDy < -0.01, `${right.aftDy.toFixed(3)}`);
  check("swept: left flap TE droops DOWN", left.aftDy < -0.01, `${left.aftDy.toFixed(3)}`);
}

// --- 4. flaps stay rigidly attached to their wing panels when sweeping ---
{
  const out = pose({ flapT: 1, sweepT: 0 });
  const back = pose({ flapT: 1, sweepT: 1 });
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? "right" : "left";
    // The flap pivot is a child of the wing panel, so sweeping (a rigid
    // rotation of the whole wing about the pivot axis) must keep the hinge at
    // a constant distance from the wing pivot origin.
    const dOut = end(out.jet, i, 0).distanceTo(out.jet.wings[i].getWorldPosition(new Vector3()));
    const dBack = end(back.jet, i, 0).distanceTo(back.jet.wings[i].getWorldPosition(new Vector3()));
    check(
      `${side} flap hinge stays rigid under sweep`,
      Math.abs(dOut - dBack) < 1e-4,
      `${dOut.toFixed(4)} -> ${dBack.toFixed(4)}`,
    );
  }
  // and the swept flap must still droop with the wing (world-space check)
  const rOut = bothEnds(out.jet, 0).aft;
  const rBack = bothEnds(back.jet, 0).aft;
  check("right flap hinge follows the wing aft under sweep", rBack.z > rOut.z,
    `z ${rOut.z.toFixed(2)} -> ${rBack.z.toFixed(2)}`);
}

console.log(failures === 0 ? "\nALL FLAP CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
