// Engine sound: two-jet turbine whine, rumble, afterburner roar, wind noise.
// All synthesized — no audio files. Created on first user gesture.

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private started = false;

  private whine: OscillatorNode | null = null;
  private whineGain: GainNode | null = null;
  private whine2: OscillatorNode | null = null;
  private whineGain2: GainNode | null = null;
  private rumbleSrc: AudioBufferSourceNode | null = null;
  private rumbleGain: GainNode | null = null;
  private rumbleFilter: BiquadFilterNode | null = null;
  private windSrc: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windQ: BiquadFilterNode | null = null;

  volume = 0.7;

  /** Must be called from a user gesture (click/keydown). */
  start(): void {
    if (this.started) return;
    try {
      const Ctor: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
    } catch {
      return;
    }
    const ctx = this.ctx;
    if (!ctx) return;
    this.started = true;

    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(ctx.destination);

    // --- turbine whine (two detuned saws through a lowpass) ---
    this.whine = ctx.createOscillator();
    this.whine.type = "sawtooth";
    this.whine.frequency.value = 300;
    const whineFilter = ctx.createBiquadFilter();
    whineFilter.type = "lowpass";
    whineFilter.frequency.value = 2200;
    this.whineGain = ctx.createGain();
    this.whineGain.gain.value = 0;
    this.whine.connect(whineFilter).connect(this.whineGain).connect(this.master);
    this.whine.start();

    this.whine2 = ctx.createOscillator();
    this.whine2.type = "sawtooth";
    this.whine2.frequency.value = 306;
    this.whineGain2 = ctx.createGain();
    this.whineGain2.gain.value = 0;
    this.whine2.connect(this.whineGain2).connect(whineFilter);
    this.whine2.start();

    // --- brown noise buffer for rumble & wind ---
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const makeLoop = (): AudioBufferSourceNode => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      return src;
    };

    // --- engine rumble (lowpass noise) ---
    this.rumbleSrc = makeLoop();
    this.rumbleFilter = ctx.createBiquadFilter();
    this.rumbleFilter.type = "lowpass";
    this.rumbleFilter.frequency.value = 200;
    this.rumbleGain = ctx.createGain();
    this.rumbleGain.gain.value = 0;
    this.rumbleSrc.connect(this.rumbleFilter).connect(this.rumbleGain).connect(this.master);
    this.rumbleSrc.start();

    // --- wind (bandpassed noise, gains with airspeed) ---
    this.windSrc = makeLoop();
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = "bandpass";
    this.windFilter.frequency.value = 500;
    this.windFilter.Q.value = 0.8;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0;
    this.windQ = ctx.createBiquadFilter();
    this.windQ.type = "highpass";
    this.windQ.frequency.value = 150;
    this.windSrc.connect(this.windFilter).connect(this.windGain).connect(this.windQ).connect(this.master);
    this.windSrc.start();
  }

  /** Brief hit tick; a two-note rising tone distinguishes a destroyed target. */
  combatFeedback(kind: "hit" | "destroyed"): void {
    const ctx = this.ctx, master = this.master;
    if (!ctx || !master || ctx.state !== "running" || this.volume <= 0) return;
    const tones = kind === "destroyed" ? [660, 990] : [1250];
    for (let i = 0; i < tones.length; i++) {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.1;
      const duration = kind === "destroyed" ? 0.16 : 0.065;
      osc.type = "sine";
      osc.frequency.value = tones[i];
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(kind === "destroyed" ? 0.22 : 0.16, start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain).connect(master);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
      osc.start(start);
      osc.stop(start + duration);
    }
  }

  resume(): void {
    void this.ctx?.resume();
  }

  setVolume(v: number): void {
    this.volume = v;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
    }
  }

  /** rpm 0..1, ab 0..1, speed m/s, stalled, muted (menu/pause). */
  update(rpm: number, ab: number, speed: number, stalled: boolean, muted: boolean): void {
    if (!this.ctx || !this.started) return;
    const t = this.ctx.currentTime;
    const ramp = 0.08;

    const vol = muted ? 0 : 1;
    const whineHz = 240 + 1250 * rpm + 180 * ab;
    const whineAmp = vol * (0.012 + 0.05 * rpm + 0.02 * ab);

    this.whine?.frequency.setTargetAtTime(whineHz, t, ramp);
    this.whine2?.frequency.setTargetAtTime(whineHz * 1.51, t, ramp);
    this.whineGain?.gain.setTargetAtTime(whineAmp, t, ramp);
    this.whineGain2?.gain.setTargetAtTime(whineAmp * 0.6, t, ramp);

    this.rumbleFilter?.frequency.setTargetAtTime(120 + 500 * rpm + 300 * ab, t, ramp);
    this.rumbleGain?.gain.setTargetAtTime(vol * (0.05 + 0.22 * rpm + 0.25 * ab), t, ramp);

    const sN = Math.min(1, speed / 320);
    this.windFilter?.frequency.setTargetAtTime(300 + 1100 * sN, t, ramp);
    this.windGain?.gain.setTargetAtTime(vol * (0.4 * sN * sN + (stalled ? 0.15 : 0)), t, ramp);
  }

  dispose(): void {
    this.whine?.stop();
    this.whine2?.stop();
    this.rumbleSrc?.stop();
    this.windSrc?.stop();
    void this.ctx?.close();
    this.started = false;
  }
}
