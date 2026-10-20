/**
 * SoundFX - Procedural Audio Synthesizer for Hupti Virtual Pet
 * Uses the Web Audio API to generate all sound effects dynamically
 * without any external audio files.
 */

class SoundFX {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.initialized = false;
  }

  /**
   * Initializes the AudioContext on first user interaction.
   * Browsers require a user gesture before starting Web Audio.
   */
  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();

      // Master gain node for volume and mute control
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);

      // Dynamics compressor to soften peaks and give warm toy-like compression
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      this.initialized = true;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.45;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.05);
    }
    return this.isMuted;
  }

  /**
   * Helper to ensure AudioContext is active before playing sound
   */
  _canPlay() {
    this.init();
    return this.ctx && this.ctx.state !== 'suspended' && !this.isMuted;
  }

  /**
   * Pet: Soft, warm ascending melodic chime (purr/coo vibe) with smooth envelope and warm overtones
   */
  playPetChime() {
    if (!this._canPlay()) return;

    // Ascending warm pentatonic coo: E5 -> G#5 -> B5 -> E6
    const notes = [659.25, 830.61, 987.77, 1318.51];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      // Soft melodic envelope
      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.42);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.45);
    });

    // Layer with subtle warm cooing purr
    setTimeout(() => this.playPurr(), 120);
  }

  /**
   * Hug: Gentle, harmonic warm chord swell (like a comforting chime)
   */
  playHugSwell() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    // Comforting Major 9th Chord: F4, A4, C5, E5, G5
    const freqs = [349.23, 440.00, 523.25, 659.25, 783.99];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Gentle subtle detune for lush chorus warmth
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, now);

      // Gentle swell envelope: slow warm attack (0.28s) and long resonant decay
      const startTime = now + idx * 0.04;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.11, startTime + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  }

  /**
   * Gentle rhythmic warm purr using frequency modulated oscillator
   */
  playPurr() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    // Carrier
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(145, now);

    // LFO to create vibrating purr texture
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(14, now); // 14 Hz flutter
    lfoGain.gain.setValueAtTime(32, now);

    lfo.connect(osc.frequency);

    // Amplitude envelope
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
    mainGain.gain.linearRampToValueAtTime(0.14, now + 0.4);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

    osc.connect(mainGain);
    mainGain.connect(this.masterGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.7);
    osc.stop(now + 0.7);
  }

  /**
   * Poke: Squeaky, slightly high-pitched cute startled 'bloop'
   */
  playPokeBoop() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // High-pitched playful cartoon pitch sweep
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Treat / Snack: Playful double-pop crunch/munch harmonic chime
   */
  playTreatMunch() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    // Pop 1: crisp sweet crunch
    this._playPop(now, 520, 0.07);
    // Pop 2: second crunch
    this._playPop(now + 0.14, 680, 0.07);

    // Harmonic chime celebration (A5 -> D6 -> F#6)
    const chimeNotes = [880, 1174.66, 1479.98];
    chimeNotes.forEach((freq, idx) => {
      const t = now + 0.26 + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  _playPop(time, freq, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.45, time + dur);

    gain.gain.setValueAtTime(0.26, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  /**
   * Spontaneous Chatter: Subtle tiny greeting chirp or soft bell ping
   */
  playChatterChirp() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    // Twin soft bell pings: B5 (987.77 Hz) -> E6 (1318.51 Hz)
    const notes = [987.77, 1318.51];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.075);

      gain.gain.setValueAtTime(0, now + idx * 0.075);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.075 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.075 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.075);
      osc.stop(now + idx * 0.075 + 0.32);
    });
  }

  /**
   * Low soft melancholic chime / descending sigh when scolded
   */
  playSadSigh() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    const notes = [440, 392, 329.63]; // A4 -> G4 -> E4

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      osc.frequency.linearRampToValueAtTime(freq - 15, now + idx * 0.12 + 0.4);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.52);
    });
  }

  /**
   * Sleep: Soft descending lullaby tone for sleep
   */
  playSleepLullaby() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    // Gentle lullaby bells: C5, A4, F4, D4
    const notes = [523.25, 440.00, 349.23, 293.66];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);

      gain.gain.setValueAtTime(0, now + idx * 0.16);
      gain.gain.linearRampToValueAtTime(0.13, now + idx * 0.16 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.7);
    });
  }

  /**
   * Wake: Bright twin chime for waking up
   */
  playWakeChirp() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    // Bright morning twin chime with sparkling lift: E5 -> B5 -> E6
    const notes = [659.25, 987.77, 1318.51];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.42);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.45);
    });
  }

  /**
   * Subtle UI click feedback
   */
  playClick() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Soft dreaming snore/whisper for sleep state
   */
  playSoftSnore() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(240, now + 0.4);
    osc.frequency.linearRampToValueAtTime(160, now + 0.8);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.9);
  }
}

// Expose globally
window.SoundFX = SoundFX;
