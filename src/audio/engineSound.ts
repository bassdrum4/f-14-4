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
  private compressor: DynamicsCompressorNode | null = null;
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
  private whiteBuffer: AudioBuffer | null = null;
  /** The stall horn: a plain square tone, gated when the wing lets go. */
  private horn: OscillatorNode | null = null;
  private hornGain: GainNode | null = null;
  /** Throttles: guns and explosions can arrive faster than the ear wants. */
  private lastShotAt = -1;
  private lastBoomAt = -1;

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
    // A compressor on the master bus keeps a bomb salvo and a gun burst from
    // clipping over the engine bed, without the pilot touching the volume.
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 5;
    this.compressor.attack.value = 0.004;
    this.compressor.release.value = 0.25;
    this.master.connect(this.compressor).connect(ctx.destination);

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
    // A one-second white buffer feeds the transient effects — guns, impacts,
    // steam and whooshes — which need a brighter source than the brown bed.
    const whiteBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const whiteData = whiteBuf.getChannelData(0);
    for (let i = 0; i < whiteData.length; i++) whiteData[i] = Math.random() * 2 - 1;
    this.whiteBuffer = whiteBuf;
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

    // --- stall horn: the one warning the pilot cannot mistake for a system ---
    this.horn = ctx.createOscillator();
    this.horn.type = "square";
    this.horn.frequency.value = 420;
    const hornFilter = ctx.createBiquadFilter();
    hornFilter.type = "lowpass";
    hornFilter.frequency.value = 1100;
    this.hornGain = ctx.createGain();
    this.hornGain.gain.value = 0;
    this.horn.connect(hornFilter).connect(this.hornGain).connect(this.master);
    this.horn.start();

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

  /**
   * A burst of gunfire. Our own gun is close and bright; a bandit's is quieter
   * and darker with range. Throttled, because a 10-rounds-a-second burst is one
   * mechanical event, not ten separate sounds.
   */
  gunfire(hostile: boolean, rangeM = 0): void {
    const ctx = this.ctx, master = this.master, white = this.whiteBuffer;
    if (!ctx || !master || !white || ctx.state !== "running" || this.volume <= 0) return;
    const near = hostile ? Math.max(0, 1 - rangeM / 1500) : 1;
    if (near <= 0.02) return;
    const t = ctx.currentTime;
    if (t - this.lastShotAt < (hostile ? 0.06 : 0.035)) return;
    this.lastShotAt = t;
    const level = (hostile ? 0.14 * near * near : 0.2) * this.volume;

    const src = ctx.createBufferSource();
    src.buffer = white;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = hostile ? 850 : 1650;
    band.Q.value = 0.85;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(level, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
    src.connect(band).connect(gain).connect(master);
    src.start(t);
    src.stop(t + 0.09);
    src.onended = () => { src.disconnect(); band.disconnect(); gain.disconnect(); };

    // The chest thump under the crack, which is most of what a cannon sounds
    // like from inside the jet.
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = "triangle";
    thump.frequency.setValueAtTime(hostile ? 85 : 125, t);
    thump.frequency.exponentialRampToValueAtTime(45, t + 0.07);
    thumpGain.gain.setValueAtTime(level * 0.55, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    thump.connect(thumpGain).connect(master);
    thump.start(t);
    thump.stop(t + 0.1);
    thump.onended = () => { thump.disconnect(); thumpGain.disconnect(); };
  }

  /**
   * A fireball or a water column: a low boom on a short delay by distance, plus
   * the crack that makes it read as an explosion rather than a door slamming.
   */
  explosion(kind: "ground" | "air" | "water", scale: number, rangeM: number): void {
    const ctx = this.ctx, master = this.master, white = this.whiteBuffer;
    if (!ctx || !master || !white || ctx.state !== "running" || this.volume <= 0) return;
    if (rangeM > 9000) return;
    const near = Math.max(0, 1 - rangeM / 9000);
    if (near <= 0.01) return;
    const t = ctx.currentTime;
    if (t - this.lastBoomAt < 0.035) return;
    this.lastBoomAt = t;
    const size = Math.min(2.4, Math.max(0.5, scale));
    const start = t + Math.min(0.35, rangeM / 343);
    const level = Math.min(0.8, (0.16 + 0.16 * size) * Math.pow(near, 0.8)) * this.volume;

    const src = ctx.createBufferSource();
    src.buffer = white;
    const filter = ctx.createBiquadFilter();
    if (kind === "water") {
      filter.type = "bandpass";
      filter.frequency.value = 620;
      filter.Q.value = 0.7;
    } else {
      filter.type = "lowpass";
      filter.frequency.value = 180 + 160 * size;
    }
    const gain = ctx.createGain();
    const tail = kind === "water" ? 0.55 : 0.85 + size * 0.45;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(level, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tail);
    src.connect(filter).connect(gain).connect(master);
    src.start(start);
    src.stop(start + tail + 0.05);
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };

    if (kind === "water") return;
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(64, start);
    sub.frequency.exponentialRampToValueAtTime(28, start + 0.5);
    subGain.gain.setValueAtTime(level * 0.7, start);
    subGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);
    sub.connect(subGain).connect(master);
    sub.start(start);
    sub.stop(start + 0.7);
    sub.onended = () => { sub.disconnect(); subGain.disconnect(); };
  }

  /** A missile clearing the rail: a whoosh and a few seconds of motor roar. */
  missileLaunch(hostile: boolean, rangeM = 0): void {
    const ctx = this.ctx, master = this.master, white = this.whiteBuffer;
    if (!ctx || !master || !white || ctx.state !== "running" || this.volume <= 0) return;
    const near = hostile ? Math.max(0, 1 - rangeM / 5000) : 1;
    if (near <= 0.02) return;
    const t = ctx.currentTime;
    const level = (hostile ? 0.09 : 0.13) * near * this.volume;
    const src = ctx.createBufferSource();
    src.buffer = white;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(320, t);
    band.frequency.exponentialRampToValueAtTime(1400, t + 0.55);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(level, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    src.connect(band).connect(gain).connect(master);
    src.start(t);
    src.stop(t + 0.8);
    src.onended = () => { src.disconnect(); band.disconnect(); gain.disconnect(); };

    const motor = ctx.createOscillator();
    const motorGain = ctx.createGain();
    motor.type = "sawtooth";
    motor.frequency.setValueAtTime(55, t);
    motorGain.gain.setValueAtTime(0.0001, t);
    motorGain.gain.linearRampToValueAtTime(level * 0.45, t + 0.08);
    motorGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    motor.connect(motorGain).connect(master);
    motor.start(t);
    motor.stop(t + 1.35);
    motor.onended = () => { motor.disconnect(); motorGain.disconnect(); };
  }

  /** Steam, shuttle and a hard shove: the catapult, from the cockpit. */
  catapult(): void {
    const ctx = this.ctx, master = this.master, white = this.whiteBuffer;
    if (!ctx || !master || !white || ctx.state !== "running" || this.volume <= 0) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = white;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 600;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.22 * this.volume, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    src.connect(hp).connect(gain).connect(master);
    src.start(t);
    src.stop(t + 1.15);
    src.onended = () => { src.disconnect(); hp.disconnect(); gain.disconnect(); };

    const shove = ctx.createOscillator();
    const shoveGain = ctx.createGain();
    shove.type = "sine";
    shove.frequency.setValueAtTime(58, t);
    shove.frequency.exponentialRampToValueAtTime(32, t + 0.7);
    shoveGain.gain.setValueAtTime(0.3 * this.volume, t);
    shoveGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    shove.connect(shoveGain).connect(master);
    shove.start(t);
    shove.stop(t + 0.85);
    shove.onended = () => { shove.disconnect(); shoveGain.disconnect(); };
  }

  /** A salvo of countermeasure cartridges popping out of the belly. */
  flarePop(): void {
    const ctx = this.ctx, master = this.master, white = this.whiteBuffer;
    if (!ctx || !master || !white || ctx.state !== "running" || this.volume <= 0) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = white;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 2400;
    band.Q.value = 1.4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    src.connect(band).connect(gain).connect(master);
    src.start(t);
    src.stop(t + 0.16);
    src.onended = () => { src.disconnect(); band.disconnect(); gain.disconnect(); };
  }

  /** RWR / guns-break beeps. Throttling the repeat is the caller's job. */
  warning(kind: "missile" | "guns"): void {
    const ctx = this.ctx, master = this.master;
    if (!ctx || !master || ctx.state !== "running" || this.volume <= 0) return;
    const tones = kind === "missile" ? [1280, 960] : [760];
    for (let i = 0; i < tones.length; i++) {
      const t = ctx.currentTime + i * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = tones[i];
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.035 * this.volume, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.065);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + 0.075);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    }
  }

  /** Gear and flap motors: a short servo whine and a mechanical clunk. */
  servo(kind: "gear" | "flap"): void {
    const ctx = this.ctx, master = this.master, white = this.whiteBuffer;
    if (!ctx || !master || !white || ctx.state !== "running" || this.volume <= 0) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = white;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = kind === "gear" ? 380 : 760;
    band.Q.value = 2.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.045 * this.volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "gear" ? 0.35 : 0.2));
    src.connect(band).connect(gain).connect(master);
    src.start(t);
    src.stop(t + 0.4);
    src.onended = () => { src.disconnect(); band.disconnect(); gain.disconnect(); };
  }

  /** Tyres, wire and a deck plate taking the jet's weight. */
  touchdown(kind: "wire" | "landing", speedMS: number): void {
    const ctx = this.ctx, master = this.master, white = this.whiteBuffer;
    if (!ctx || !master || !white || ctx.state !== "running" || this.volume <= 0) return;
    const t = ctx.currentTime;
    const level = Math.min(0.3, 0.08 + speedMS * 0.005) * this.volume;
    const src = ctx.createBufferSource();
    src.buffer = white;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = kind === "wire" ? 1800 : 1200;
    band.Q.value = 0.9;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "wire" ? 0.35 : 0.22));
    src.connect(band).connect(gain).connect(master);
    src.start(t);
    src.stop(t + 0.4);
    src.onended = () => { src.disconnect(); band.disconnect(); gain.disconnect(); };

    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = "sine";
    thud.frequency.setValueAtTime(72, t);
    thud.frequency.exponentialRampToValueAtTime(38, t + 0.2);
    thudGain.gain.setValueAtTime(level * 0.8, t);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    thud.connect(thudGain).connect(master);
    thud.start(t);
    thud.stop(t + 0.3);
    thud.onended = () => { thud.disconnect(); thudGain.disconnect(); };
  }

  /** The stall horn. A steady tone while the wing is not flying. */
  stall(on: boolean): void {
    if (!this.ctx || !this.hornGain) return;
    this.hornGain.gain.setTargetAtTime(on ? 0.05 * this.volume : 0, this.ctx.currentTime, 0.05);
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
    this.horn?.stop();
    this.flybySrc?.stop();
    this.compressor?.disconnect();
    void this.ctx?.close();
    this.started = false;
  }
}
