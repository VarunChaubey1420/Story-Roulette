/**
 * Web Audio API synthesizer for Story Roulette
 * Antique mechanical clockwork, brass ratchet ticks, lock clack, and cinematic chime.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.6;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
      } catch {
        // Fallback gracefully
      }
    } else if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
      } catch {
        // Safe catch
      }
    }
  }

  /**
   * Mechanical ratchet / gear tick sound
   * Generates a short filtered noise click with subtle wooden/brass resonance
   */
  public playTick(pitchMultiplier = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sharp transient pulse
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(320 * pitchMultiplier, now + 0.025);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800 * pitchMultiplier, now);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.08 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio never blocks app execution
    }
  }

  /**
   * Reel stopping latch / mechanical clack
   * Deep metallic thud + latch snap
   */
  public playReelStop(reelIndex = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 180 + reelIndex * 35;

      // Body of mechanical thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);

      // Metallic spring / brass click transient
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      const clickFilter = this.ctx.createBiquadFilter();

      click.type = 'sawtooth';
      click.frequency.setValueAtTime(2200, now);
      click.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      clickFilter.type = 'highpass';
      clickFilter.frequency.setValueAtTime(1200, now);

      clickGain.gain.setValueAtTime(0.18 * this.volume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      click.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.masterGain);

      click.start(now);
      click.stop(now + 0.06);
    } catch {
      // Safe catch
    }
  }

  /**
   * Cinematic prompt reveal chord
   * Warm antique gong & brass harmonic pad
   */
  public playReveal() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // D minor / F majestic antique chord frequencies: D3 (146.83), A3 (220), F4 (349.23), C5 (523.25), E5 (659.25)
      const freqs = [146.83, 220.0, 349.23, 523.25, 659.25];

      freqs.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        const startAt = now + i * 0.04;
        const duration = 2.2 - i * 0.2;

        gain.gain.setValueAtTime(0.001, startAt);
        gain.gain.linearRampToValueAtTime((0.14 / (i + 1)) * this.volume, startAt + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startAt);
        osc.stop(startAt + duration + 0.1);
      });
    } catch {
      // Safe catch
    }
  }

  /**
   * Countdown beep for recording mode (3, 2, 1)
   */
  public playCountdownTick(isFinal = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 587.33, now); // A5 or D5

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.15));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + (isFinal ? 0.4 : 0.2));
    } catch {
      // Safe catch
    }
  }

  /**
   * Mechanical lever pull / activation sound
   */
  public playLever() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Safe catch
    }
  }
}

export const sound = new SoundEngine();
