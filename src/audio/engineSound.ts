// Engine sound: two-jet turbine whine, rumble, afterburner roar, wind noise.
// All synthesized — no audio files. Created on first user gesture.
//
// On top of the basic engine bed sit the immersion layers: a buffet rattle that
// rises with turbulence and stall, a G-strain squeeze that ducks the high
// frequencies as the pilot loads the airframe, a flyby whoosh for a wingman
// passing at speed (its pitch follows the closing rate, which is the audible
// half of Doppler), and thunder for the squall's lightning.

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
  // Immersion layers.
  private buffetSrc: AudioBufferSourceNode | null = null;
  private buffetGain: GainNode | null = null;
  private buffetFilter: BiquadFilterNode | null = null;
  private strain: OscillatorNode | null = null;
  private strainGain: GainNode | null = null;
  private flybySrc: AudioBufferSourceNode | null = null;
  private flybyGain: GainNode | null = null;
  private flybyFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

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

    this.noiseBuffer = buf;

    // --- buffet: the airframe shaking in turbulence, at the stall, or under G ---
    this.buffetSrc = makeLoop();
    this.buffetFilter = ctx.createBiquadFilter();
    this.buffetFilter.type = "bandpass";
    this.buffetFilter.frequency.value = 62;
    this.buffetFilter.Q.value = 0.9;
    this.buffetGain = ctx.createGain();
    this.buffetGain.gain.value = 0;
    this.buffetSrc.connect(this.buffetFilter).connect(this.buffetGain).connect(this.master);
    this.buffetSrc.start();

    // --- G-strain: a low squeeze that swells as the pilot pulls ---
    this.strain = ctx.createOscillator();
    this.strain.type = "triangle";
    this.strain.frequency.value = 74;
    this.strainGain = ctx.createGain();
    this.strainGain.gain.value = 0;
    this.strain.connect(this.strainGain).connect(this.master);
    this.strain.start();

    // --- flyby: a whoosh whose pitch tracks a wingman's closing speed ---
    this.flybySrc = makeLoop();
    this.flybyFilter = ctx.createBiquadFilter();
    this.flybyFilter.type = "bandpass";
    this.flybyFilter.frequency.value = 700;
    this.flybyFilter.Q.value = 1.1;
    this.flybyGain = ctx.createGain();
    this.flybyGain.gain.value = 0;
    this.flybySrc.connect(this.flybyFilter).connect(this.flybyGain).connect(this.master);
    this.flybySrc.start();

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

  /**
   * rpm 0..1, ab 0..1, speed m/s, stalled, muted (menu/pause), plus the
   * immersion layers: turbulence 0..1, load factor and whether the airframe is
   * heavy enough to be riding the buffet.
   */
  update(
    rpm: number,
    ab: number,
    speed: number,
    stalled: boolean,
    muted: boolean,
    turbulence = 0,
    gLoad = 1,
  ): void {
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
    // Buffet and G both make the pilot strain to hear: the high-frequency bed
    // ducks a little as the low-frequency layers come up.
    const buffet = Math.min(1, turbulence + (stalled ? 0.5 : 0) + Math.max(0, (gLoad - 3.5) / 5) * 0.5);
    const strain = Math.max(0, Math.min(1, (gLoad - 3.2) / 4.5));
    const duck = 1 - 0.35 * Math.max(buffet, strain);
    this.windFilter?.frequency.setTargetAtTime(300 + 1100 * sN, t, ramp);
    this.windGain?.gain.setTargetAtTime(vol * duck * (0.4 * sN * sN + (stalled ? 0.15 : 0)), t, ramp);

    this.buffetFilter?.frequency.setTargetAtTime(48 + 70 * buffet, t, ramp);
    this.buffetGain?.gain.setTargetAtTime(vol * (0.22 * buffet * buffet + (stalled ? 0.1 : 0)), t, ramp);

    this.strain?.frequency.setTargetAtTime(66 + 34 * strain, t, ramp);
    this.strainGain?.gain.setTargetAtTime(vol * 0.11 * strain, t, ramp);
  }

  /**
   * A wingman passing: range in metres and closing rate in m/s. The whoosh gets
   * louder and brighter as the gap closes, which is the audible half of the
   * Doppler shift a flyby has on the ground. Silent when nobody is close.
   */
  flyby(rangeM: number, closureMS: number): void {
    if (!this.ctx || !this.started) return;
    const t = this.ctx.currentTime;
    const near = Math.min(1, Math.max(0, 1 - rangeM / 1400));
    const bright = 420 + 1400 * Math.min(1, Math.abs(closureMS) / 260);
    this.flybyGain?.gain.setTargetAtTime(near * near * this.volume * 0.5, t, 0.06);
    this.flybyFilter?.frequency.setTargetAtTime(bright, t, 0.08);
  }

  /** Thunder: a low, slow noise swell, delayed by distance. */
  thunder(rangeKm: number): void {
    const ctx = this.ctx, master = this.master, buf = this.noiseBuffer;
    if (!ctx || !master || !buf || ctx.state !== "running" || this.volume <= 0) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 220;
    const gain = ctx.createGain();
    // Sound covers a kilometre in ~2.9 s: the clap arrives after the flash.
    const start = ctx.currentTime + Math.min(6, Math.max(0, rangeKm) / 0.343);
    const peak = Math.max(0.05, 0.5 / (1 + rangeKm * 0.05)) * this.volume;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 2.2);
    src.connect(filter).connect(gain).connect(master);
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
    src.start(start);
    src.stop(start + 2.4);
  }

  dispose(): void {
    this.whine?.stop();
    this.whine2?.stop();
    this.rumbleSrc?.stop();
    this.windSrc?.stop();
    this.buffetSrc?.stop();
    this.strain?.stop();
    this.flybySrc?.stop();
    void this.ctx?.close();
    this.started = false;
  }
}
