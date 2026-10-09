// Graphics-only load shedding. Never changes physics steps or network clocks.
export class ResolutionBudget {
  scale = 1;
  private last = 0;
  private elapsed = 0;
  private frames = 0;
  private spareWindows = 0;

  reset(): void {
    this.scale = 1;
    this.last = this.elapsed = this.frames = this.spareWindows = 0;
  }

  sample(nowMs: number, enabled: boolean, visible: boolean): boolean {
    const dt = this.last ? nowMs - this.last : 0;
    this.last = nowMs;
    // Tab suspension, resize and world construction are not sustained load.
    if (!enabled || !visible || dt <= 0 || dt > 250) {
      this.elapsed = this.frames = this.spareWindows = 0;
      return false;
    }
    this.elapsed += dt;
    this.frames++;
    if (this.elapsed < 1000 || this.frames < 20) return false;
    const mean = this.elapsed / this.frames;
    this.elapsed = this.frames = 0;
    const previous = this.scale;
    if (mean > 24) {
      this.scale = Math.max(.65, this.scale - .1);
      this.spareWindows = 0;
    } else if (mean < 18.5) {
      // Recover slowly, so a marginal GPU does not oscillate every second.
      if (++this.spareWindows >= 6) {
        this.scale = Math.min(1, this.scale + .05);
        this.spareWindows = 0;
      }
    } else this.spareWindows = 0;
    return Math.abs(previous - this.scale) > .001;
  }
}
