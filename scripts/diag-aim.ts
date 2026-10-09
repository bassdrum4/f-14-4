// Regression: gun assistance must work at any world position, up to five degrees.
import { Quaternion, Vector3 } from "three";
import { Dogfight } from "../src/sim/dogfight";
import { spawnAircraft, type AircraftState } from "../src/sim/flight";

interface AssistHarness {
  assistBore(player: AircraftState, muzzle: Vector3, bore: Vector3): Vector3;
}
const assist = (Dogfight.prototype as unknown as AssistHarness).assistBore;
const player = spawnAircraft("airfield", 0);
const bore = new Vector3(0, 0, -1);
const rad = Math.PI / 180;
let failures = 0;
function check(name: string, condition: boolean): void {
  console.log(`${condition ? "PASS" : "FAIL"}: ${name}`);
  if (!condition) failures++;
}
function shot(offset: Vector3, angle: number, distance = 500, onDeck = false): Vector3 {
  const relative = new Vector3(Math.sin(angle * rad), 0, -Math.cos(angle * rad))
    .multiplyScalar(distance);
  const bandit = { pos: offset.clone().add(relative), quat: new Quaternion(), speed: 0, catT: onDeck ? 0 : -1 };
  return assist.call({ bandits: [bandit] } as unknown as AssistHarness, player, offset, bore);
}
const originShot = shot(new Vector3(), 4.9);
check("assist corrects a 4.9-degree aim error", Math.abs(bore.angleTo(originShot) / rad - 4.9) < 1e-7);
for (const offset of [new Vector3(0, 1500, 0), new Vector3(6000, 1500, -4000), new Vector3(-17000, 4000, 8000)]) {
  check(`same shot at ${offset.toArray()} has the same correction`, shot(offset, 4.9).distanceTo(originShot) < 1e-10);
}
check("targets beyond five degrees receive no correction", shot(new Vector3(), 5.1).distanceTo(bore) === 0);
check("targets beyond 1.5 km receive no correction", shot(new Vector3(), 4, 1501).distanceTo(bore) === 0);
check("aircraft still on deck receive no correction", shot(new Vector3(), 4, 500, true).distanceTo(bore) === 0);
check("the input bore is not mutated", bore.equals(new Vector3(0, 0, -1)));
process.exit(failures ? 1 : 0);
