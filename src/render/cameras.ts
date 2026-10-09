// Camera rig: cockpit, chase, and action modes. Mouse drag looks around in
// chase. Cameras follow interpolated render state, never raw sim state.
//
// Chase and action share one rule for the roll axis: the camera follows
// heading and pitch fully but only ROLL_FOLLOW of the bank, and its position
// is built in that frame. A bank then reads as the jet rotating about its own
// nose-tail axis in front of the camera — not as the whole world pivoting
// around the line of sight between the jet and the camera.

import * as THREE from "three";

export type CameraMode = "cockpit" | "chase" | "action" | "pod";

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const ORIGIN = new THREE.Vector3();

/**
 * Where the targeting pod's sensor head sits, in the airframe's body frame.
 * Note this is forward of every store station: a bomb just off the rack is
 * behind the sensor, which is why the pod draws weapon symbology rather than
 * relying on seeing the weapon itself.
 */
export const POD_OFFSET = new THREE.Vector3(0, -1.35, -7.6);
const POD_SLEW = 0.0018; // rad per pixel of mouse drag

/** Fraction of the airframe's roll the chase and action cameras follow. */
export const ROLL_FOLLOW = 0.25;

export class CameraRig {
  mode: CameraMode = "chase";
  private yaw = 0;
  private pitch = 0;
  private orbitAngle = 0;
  private orbitTimer = 0;
  private cockpitPos = new THREE.Vector3(0, 1.15, -4.4);
  private smoothed = new THREE.Vector3();
  /** False until the follow camera has a valid mark: snap, never glide in. */
  private smoothedReady = false;
  private tmpQ = new THREE.Quaternion();
  private lookTarget = new THREE.Vector3();
  private offsetTmp = new THREE.Vector3();
  private upTmp = new THREE.Vector3();
  private fwd = new THREE.Vector3();
  private baseM = new THREE.Matrix4();
  private baseQ = new THREE.Quaternion();
  private lookQ = new THREE.Quaternion();
  /** Cockpit attitude, filtered — the pilot's head, not the airframe. */
  private cockpitQ = new THREE.Quaternion();
  private cockpitReady = false;
  private tmpEuler = new THREE.Euler();
  /** Pod line of sight, in world yaw/pitch (gimbal-stabilised). */
  private podYaw = 0;
  private podPitch = 0;
  private podPos = new THREE.Vector3();
  private podDir = new THREE.Vector3();
  private podLook = new THREE.Vector3();

  cycle(): void {
    // The pod is a temporary view, not part of the loop: leave it first, then
    // step through chase / cockpit / action.
    if (this.mode === "pod") this.mode = "chase";
    else this.mode = this.mode === "chase" ? "cockpit" : this.mode === "cockpit" ? "action" : "chase";
    if (this.mode !== "chase") {
      this.yaw = 0;
      this.pitch = 0;
    }
    this.cockpitReady = false; // snap the filtered head to the new attitude
    this.smoothedReady = false; // and snap the follow camera to its new mark
  }

  /**
   * Snap the follow camera to its mark at the next update. Called on mission
   * start and screen changes: without it the camera glides in from whatever
   * stale position it last held — which reads as the view lurching when the
   * flight begins.
   */
  resetFollow(): void {
    this.smoothedReady = false;
  }

  get isPod(): boolean {
    return this.mode === "pod";
  }

  /**
   * Enter the target pod, lined up with the nose. The pod's line of sight is
   * world-referenced, not bolted to the airframe: a real gimbal holds the target
   * while the jet banks, which is what makes clicking a point on the ground
   * feel steady while manoeuvring.
   */
  enterPod(aircraftQuat: THREE.Quaternion): void {
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(aircraftQuat);
    this.podYaw = Math.atan2(fwd.x, -fwd.z);
    this.podPitch = Math.asin(THREE.MathUtils.clamp(fwd.y, -1, 1));
    this.mode = "pod";
  }

  exitPod(): void {
    if (this.mode === "pod") this.mode = "chase";
    this.yaw = 0;
    this.pitch = 0;
  }

  label(): string {
    switch (this.mode) {
      case "cockpit":
        return "COCKPIT";
      case "pod":
        return "TARGET POD";
      case "action":
        return "ACTION";
      default:
        return "CHASE";
    }
  }

  /** Apply mouse drag deltas. Cockpit gets a narrower look-around cone. */
  mouse(dx: number, dy: number): void {
    if (this.mode === "pod") {
      // Slew the sensor: drag right to look right, drag up to look up.
      this.podYaw += dx * POD_SLEW;
      this.podPitch = THREE.MathUtils.clamp(this.podPitch - dy * POD_SLEW, -1.5, 0.5);
      return;
    }
    const limit = this.mode === "cockpit" ? 1.5 : 2.6;
    this.yaw = THREE.MathUtils.clamp(this.yaw - dx * 0.004, -limit, limit);
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy * 0.004, -1.2, 1.2);
  }

  /**
   * Position/orient the camera.
   * @param pos interpolated aircraft position
   * @param quat interpolated aircraft orientation
   * @param speed m/s (for action-cam distance)
   * @param dt frame dt for internal smoothing
   * @param cinematic true for the menu / crash attract shot (slow circle)
   */
  update(
    camera: THREE.PerspectiveCamera,
    pos: THREE.Vector3,
    quat: THREE.Quaternion,
    speed: number,
    dt: number,
    cinematic = false,
  ): void {
    if (this.mode === "pod") {
      // Sensor head under the nose, sight line from the pod's own gimbal.
      camera.position.copy(this.podPos.copy(POD_OFFSET).applyQuaternion(quat).add(pos));
      const cp = Math.cos(this.podPitch);
      this.podDir.set(Math.sin(this.podYaw) * cp, Math.sin(this.podPitch), -Math.cos(this.podYaw) * cp);
      camera.up.set(0, 1, 0);
      camera.lookAt(this.podLook.copy(camera.position).add(this.podDir));
      return;
    }

    if (this.mode === "cockpit") {
      // Filter the airframe attitude into a "head" attitude. A real pilot's
      // head is stabilised against the short-period jitter that the rigid
      // airframe sees, so the view stays readable instead of rocking with
      // every gust and control twitch. Position stays rigid (it is a cockpit).
      if (!this.cockpitReady) {
        this.cockpitQ.copy(quat);
        this.cockpitReady = true;
      } else {
        this.cockpitQ.slerp(quat, 1 - Math.exp(-dt * 6));
      }
      camera.position.copy(pos).add(this.cockpitPos.clone().applyQuaternion(this.cockpitQ));
      camera.quaternion.copy(this.cockpitQ);
      // look around from the cockpit with the mouse, and keep a little
      // head-lag on the vertical axis for feel
      this.tmpEuler.set(this.pitch, this.yaw, 0, "YXZ");
      camera.rotateY(this.tmpEuler.y);
      camera.rotateX(this.tmpEuler.x - this.pitch * 0.15);
      return;
    }

    // Shared chase/action frame: heading and pitch followed fully, roll only
    // partially. The camera sits in this frame, so the airframe visibly rolls
    // about its own nose-tail axis instead of the world spinning around the
    // view line. (Cockpit mode above stays fully rigid — that is a head.)
    this.fwd.set(0, 0, -1).applyQuaternion(quat);
    this.upTmp
      .set(0, 1, 0)
      .applyQuaternion(quat)
      .multiplyScalar(ROLL_FOLLOW)
      .addScaledVector(WORLD_UP, 1 - ROLL_FOLLOW)
      .normalize();
    this.baseM.lookAt(ORIGIN, this.fwd, this.upTmp);
    this.baseQ.setFromRotationMatrix(this.baseM);
    this.lookTarget.copy(pos).addScaledVector(this.upTmp, 1.2);

    if (this.mode === "chase") {
      const back = 26 + Math.min(speed * 0.08, 10);
      // mouse look orbits the camera around the jet inside that frame
      this.lookQ.setFromEuler(this.tmpEuler.set(this.pitch, this.yaw, 0, "YXZ"));
      this.offsetTmp.set(0, 7.5, back).applyQuaternion(this.tmpQ.copy(this.baseQ).multiply(this.lookQ)).add(pos);
      if (!this.smoothedReady) {
        this.smoothed.copy(this.offsetTmp);
        this.smoothedReady = true;
      } else {
        this.smoothed.lerp(this.offsetTmp, 1 - Math.exp(-dt * 8));
      }
      camera.position.copy(this.smoothed);
      camera.up.copy(this.upTmp);
      camera.lookAt(this.lookTarget);
      return;
    }

    // action cam. In flight it is a rigid boom bolted behind the jet: same
    // frame, no smoothing lag. The menu and crash replays pass cinematic=true
    // for a slow orbit instead.
    if (cinematic) {
      this.orbitTimer += dt;
      const r = 34 + Math.sin(this.orbitTimer * 0.21) * 6;
      this.orbitAngle += dt * 0.14;
      const wx = pos.x + Math.cos(this.orbitAngle) * r;
      const wz = pos.z + Math.sin(this.orbitAngle) * r;
      const wy = pos.y + 9 + Math.sin(this.orbitTimer * 0.33) * 3;
      camera.position.set(wx, wy, wz);
      camera.up.set(0, 1, 0);
      camera.lookAt(pos);
      return;
    }
    this.offsetTmp.set(0, 8, 30).applyQuaternion(this.baseQ);
    camera.position.copy(pos).add(this.offsetTmp);
    camera.up.copy(this.upTmp);
    camera.lookAt(this.lookTarget);
  }
}
