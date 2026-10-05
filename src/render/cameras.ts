// Camera rig: cockpit, chase, and action modes. Mouse drag looks around in
// chase. Cameras follow interpolated render state, never raw sim state.

import * as THREE from "three";

export type CameraMode = "cockpit" | "chase" | "action";

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export class CameraRig {
  mode: CameraMode = "chase";
  private yaw = 0;
  private pitch = 0;
  private orbitAngle = 0;
  private orbitTimer = 0;
  private cockpitPos = new THREE.Vector3(0, 1.15, -4.4);
  private smoothed = new THREE.Vector3();
  private tmpQ = new THREE.Quaternion();
  private lookTarget = new THREE.Vector3();
  private actionOffset = new THREE.Vector3();
  private upTmp = new THREE.Vector3();
  /** Cockpit attitude, filtered — the pilot's head, not the airframe. */
  private cockpitQ = new THREE.Quaternion();
  private cockpitReady = false;
  private tmpEuler = new THREE.Euler();

  cycle(): void {
    this.mode = this.mode === "chase" ? "cockpit" : this.mode === "cockpit" ? "action" : "chase";
    if (this.mode !== "chase") {
      this.yaw = 0;
      this.pitch = 0;
    }
    this.cockpitReady = false; // snap the filtered head to the new attitude
  }

  label(): string {
    return this.mode === "cockpit" ? "COCKPIT" : this.mode === "chase" ? "CHASE" : "ACTION";
  }

  /** Apply mouse drag deltas. Cockpit gets a narrower look-around cone. */
  mouse(dx: number, dy: number): void {
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

    if (this.mode === "chase") {
      const back = 26 + Math.min(speed * 0.08, 10);
      const offset = new THREE.Vector3(0, 7.5, back).applyQuaternion(quat);
      // apply user look rotation around the aircraft
      const lookQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, "YXZ"));
      const rotated = offset.clone().applyQuaternion(this.tmpQ.copy(quat).multiply(lookQ));
      const want = pos.clone().add(rotated);
      this.smoothed.lerp(want, 1 - Math.exp(-dt * 8));
      camera.position.copy(this.smoothed);
      this.lookTarget.copy(pos).add(new THREE.Vector3(0, 1.5, 0).applyQuaternion(quat));
      camera.up.set(0, 1, 0).applyQuaternion(quat).lerp(new THREE.Vector3(0, 1, 0), 0.55).normalize();
      camera.lookAt(this.lookTarget);
      return;
    }

    // action cam. In flight it is locked hard behind the jet: rigid offset,
    // no smoothing lag, so it reads as a boom camera bolted to the tail.
    // The menu and crash replays pass cinematic=true for a slow orbit instead.
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
    this.actionOffset.set(0, 8, 30).applyQuaternion(quat);
    camera.position.copy(pos).add(this.actionOffset);
    this.upTmp.set(0, 1.5, 0).applyQuaternion(quat);
    this.lookTarget.copy(pos).add(this.upTmp);
    camera.up.set(0, 1, 0).applyQuaternion(quat).lerp(WORLD_UP, 0.5).normalize();
    camera.lookAt(this.lookTarget);
  }
}
