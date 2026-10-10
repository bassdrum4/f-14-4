// Applies interpolated sim state to the Tomcat mesh every frame:
// wing sweep, control surfaces, gear, flaps, afterburner, cockpit visibility.

import * as THREE from "three";
import type { TomcatMesh } from "./geometry";
import type { AircraftState } from "../sim/flight";

export function animateJet(
  jet: TomcatMesh,
  s: AircraftState,
  alpha: number, // interpolation factor
  dt: number,
): void {
  const g = jet.group;

  // position + orientation interpolation is done by the caller on g directly.

  // wing sweep: 20 deg (out) to 68 deg (back). Panels span outward along ±X,
  // so the right (+X) wing rotates about -Y to swing its tip aft (body +Z).
  // Fixed-wing types keep the sweep baked into their geometry.
  if (jet.sweepable !== false) {
    const sweep = THREE.MathUtils.degToRad(20 + 48 * s.sweepT);
    jet.wings[0].rotation.y = -sweep;
    jet.wings[1].rotation.y = sweep;
  }

  // flaps droop when down (also act as flaperons)
  const flapDroop = 0.45 * s.flapT;
  const ailDefl = clampSym(g.userData.aileron ?? 0, 0.5);
  jet.flaps[0].rotation.z = flapDroop - ailDefl * 0.4;
  jet.flaps[1].rotation.z = -(flapDroop + ailDefl * 0.4);

  // stabs: elevator
  const elev = clampSym(g.userData.elevator ?? 0, 0.6);
  jet.stabs[0].rotation.x = elev;
  jet.stabs[1].rotation.x = elev;

  // rudders — the twin fins are not mirrored (both share the body frame), so
  // both rudders deflect the same way: trailing edges move together.
  const rud = clampSym(g.userData.rudder ?? 0, 0.5);
  jet.rudders[0].rotation.y = rud;
  jet.rudders[1].rotation.y = rud;

  // gear: fold legs up + hide when retracted; lift by tyre compression so the
  // wheels sit on the deck/runway instead of sinking into it
  const gearT = s.gearT;
  jet.gear.visible = gearT > 0.02;
  jet.gear.scale.y = Math.max(0.08, gearT);
  jet.gear.position.y = (1 - gearT) * 1.1 + (gearT > 0.02 ? s.wheelPen : 0);

  // rotorcraft: the main disc and the tail rotor spin with engine spool. The
  // blades are driven on frame time (not sim time) so the disc keeps turning
  // while paused, and the rate reads as a spinning blur rather than a strobing
  // set of blades at low frame rates.
  if (jet.rotor) {
    const spin = (0.25 + 0.75 * clampSym(s.rpm, 1)) * 38;
    jet.rotor.rotation.y = (jet.rotor.rotation.y + spin * dt) % (Math.PI * 2);
  }
  if (jet.tailRotor) {
    const spin = (0.25 + 0.75 * clampSym(s.rpm, 1)) * 70;
    jet.tailRotor.rotation.x = (jet.tailRotor.rotation.x + spin * dt) % (Math.PI * 2);
  }

  // afterburner flame
  const flameMat = jet.afterburner.material as THREE.MeshBasicMaterial;
  const flicker = 0.85 + 0.15 * Math.sin(s.time * 47.0) * Math.sin(s.time * 31.0);
  const ab = s.abLevel;
  flameMat.opacity = ab * 0.85 * flicker;
  jet.afterburner.scale.set(0.8 + ab * 0.5, 1, 1.6 * ab + 0.2);
  jet.afterburner.visible = ab > 0.02;

  // subtle exhaust shimmer: nozzle glow light follows AB
  if (g.userData.exhaustLight) {
    const l = g.userData.exhaustLight as THREE.PointLight;
    l.intensity = ab * 40 * flicker;
  }

  void alpha;
  void dt;
}

function clampSym(v: number, max: number): number {
  return v < -max ? -max : v > max ? max : v;
}
