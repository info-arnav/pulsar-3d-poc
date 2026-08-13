// Real-time engine audio: looping sample, pitch + volume + filter driven by rpm/throttle.
export class EngineAudio {
  private ctx: AudioContext | null = null;
  private src: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private master: GainNode | null = null;
  private buffer: AudioBuffer | null = null;
  private gearBuffer: AudioBuffer | null = null;
  private brakeBuffer: AudioBuffer | null = null;
  private brakeSrc: AudioBufferSourceNode | null = null;
  private brakeGain: GainNode | null = null;
  ready = false;
  muted = false;

  async init() {
    if (this.ctx) {
      await this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;
    const res = await fetch("/Screen Recording 2026-08-13 103747.wav");
    this.buffer = await ctx.decodeAudioData(await res.arrayBuffer());

    // Preload gear shift sound
    try {
      const gearRes = await fetch("/gear.mp3");
      this.gearBuffer = await ctx.decodeAudioData(await gearRes.arrayBuffer());
    } catch (e) {
      console.warn("Failed to load gear shift sound:", e);
    }

    // Preload brake squeal sound
    try {
      const brakeRes = await fetch("/brake.mp3");
      this.brakeBuffer = await ctx.decodeAudioData(await brakeRes.arrayBuffer());
    } catch (e) {
      console.warn("Failed to load brake squeal sound:", e);
    }

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    this.master.connect(ctx.destination);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 900;
    this.filter.Q.value = 0.7;
    this.filter.connect(this.master);

    this.gain = ctx.createGain();
    this.gain.gain.value = 0.0001;
    this.gain.connect(this.filter);

    const src = ctx.createBufferSource();
    src.buffer = this.buffer;
    src.loop = true;
    src.playbackRate.value = 1;
    src.connect(this.gain);
    src.start();
    this.src = src;

    await ctx.resume();
    this.ready = true;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.08);
    }
  }

  // rpm 1200..10500, throttle 0..1
  update(rpm: number, throttle: number, load: number) {
    if (!this.ready || !this.ctx || !this.src || !this.gain || !this.filter) return;
    const t = this.ctx.currentTime;
    const n = Math.max(0, Math.min(1, (rpm - 1200) / 9300));
    const rate = 0.62 + n * 1.85;
    this.src.playbackRate.setTargetAtTime(rate, t, 0.06);
    const vol = 0.16 + n * 0.5 + throttle * 0.3 + load * 0.05;
    this.gain.gain.setTargetAtTime(Math.min(1, vol), t, 0.09);
    this.filter.frequency.setTargetAtTime(600 + n * 6500 + throttle * 2200, t, 0.09);
  }

  // percussive shift blip + gear shift audio
  shift(dir: number) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;

    // Play the gear shift MP3
    if (this.gearBuffer) {
      const gearSrc = this.ctx.createBufferSource();
      gearSrc.buffer = this.gearBuffer;
      const gearGain = this.ctx.createGain();
      gearGain.gain.setValueAtTime(0.7, t);
      gearSrc.connect(gearGain);
      gearGain.connect(this.master);
      gearSrc.start(t);
    }

    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(dir > 0 ? 220 : 160, t);
    o.frequency.exponentialRampToValueAtTime(dir > 0 ? 90 : 70, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 0.15);
    if (this.gain) {
      this.gain.gain.setTargetAtTime(this.gain.gain.value * 0.35, t, 0.02);
    }
  }

  setBraking(braking: boolean) {
    if (!this.ready || !this.ctx || !this.master || !this.brakeBuffer) return;
    const t = this.ctx.currentTime;
    if (braking) {
      if (this.brakeSrc) return; // already playing
      this.brakeSrc = this.ctx.createBufferSource();
      this.brakeSrc.buffer = this.brakeBuffer;
      this.brakeSrc.loop = true;
      this.brakeGain = this.ctx.createGain();
      this.brakeGain.gain.setValueAtTime(0.0001, t);
      this.brakeGain.gain.linearRampToValueAtTime(0.55, t + 0.15); // Fade in brake squeal
      this.brakeSrc.connect(this.brakeGain);
      this.brakeGain.connect(this.master);
      this.brakeSrc.start(t);
    } else {
      if (!this.brakeSrc) return;
      const src = this.brakeSrc;
      const gain = this.brakeGain;
      this.brakeSrc = null;
      this.brakeGain = null;
      if (gain && this.ctx) {
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); // Fade out brake squeal
        setTimeout(() => {
          try { src.stop(); } catch {}
        }, 150);
      }
    }
  }

  dispose() {
    try {
      this.src?.stop();
    } catch {
      /* noop */
    }
    this.ctx?.close();
    this.ctx = null;
    this.ready = false;
  }
}

export const engineAudio = new EngineAudio();
