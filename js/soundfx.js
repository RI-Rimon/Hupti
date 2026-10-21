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
    this.ambientGain = null;
    this.ambientVolume = 0.5;
    this.activeAmbient = null;
    this.ambientNodes = [];
    this.ambientIntervals = [];
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

      // Dedicated ambient soundscape gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

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

  /**
   * Sparkling celebration chime (for completing Pomodoro focus intervals)
   */
  playCelebrationChime() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    // Ascending celebratory fanfare: C5, E5, G5, B5, C6
    const chord = [523.25, 659.25, 783.99, 987.77, 1046.50];

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.9);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      overtone.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.95);
      overtone.stop(now + idx * 0.08 + 0.95);
    });
  }

  // =========================================================================
  // Procedural Ambient Lo-Fi / Study Soundscapes Generator (Zero Audio Files)
  // =========================================================================

  /**
   * Generates mathematical noise buffers for rain, wind, and hearth textures
   */
  createNoiseBuffer(type = 'pink', duration = 3.5) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.2;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
    }
    return buffer;
  }

  /**
   * Starts an ambient study soundscape: 'rain' | 'chimes' | 'fireplace' | 'lofi'
   */
  startAmbient(type) {
    this.init();
    if (!this.ctx) return;
    this.stopAmbient();

    this.activeAmbient = type;

    if (type === 'rain') {
      this._startRainSoundscape();
    } else if (type === 'chimes') {
      this._startWindChimesSoundscape();
    } else if (type === 'fireplace') {
      this._startFireplaceSoundscape();
    } else if (type === 'lofi') {
      this._startLoFiPadSoundscape();
    }
  }

  /**
   * Stops all active ambient sound generators
   */
  stopAmbient() {
    this.ambientIntervals.forEach(id => clearInterval(id));
    this.ambientIntervals = [];

    this.ambientNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.ambientNodes = [];
    this.activeAmbient = null;
  }

  setAmbientVolume(volume) {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(this.ambientVolume, this.ctx.currentTime + 0.05);
    }
  }

  isAmbientPlaying() {
    return !!this.activeAmbient;
  }

  // --- Rain Generator ---
  _startRainSoundscape() {
    const buffer = this.createNoiseBuffer('pink', 4.0);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter into soft soothing rain hiss
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    // Subtle LFO wave to create natural rain ebb and flow
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.ambientGain);

    source.start(0);
    lfo.start(0);

    this.ambientNodes.push(source, filter, lfo, lfoGain, rainGain);

    // Periodic delicate glass droplet plinks
    const plinkTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const dropOsc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();

      const freq = Math.random() * 800 + 2400; // 2400Hz - 3200Hz
      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(freq, now);
      dropOsc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + 0.04);

      dropGain.gain.setValueAtTime(0, now);
      dropGain.gain.linearRampToValueAtTime(0.035, now + 0.005);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      dropOsc.connect(dropGain);
      dropGain.connect(this.ambientGain);

      dropOsc.start(now);
      dropOsc.stop(now + 0.05);
    }, 280);

    this.ambientIntervals.push(plinkTimer);
  }

  // --- Zen Wind Chimes Generator ---
  _startWindChimesSoundscape() {
    // 1. Soft ambient breeze
    const breezeBuffer = this.createNoiseBuffer('pink', 4.0);
    if (breezeBuffer) {
      const breezeSrc = this.ctx.createBufferSource();
      breezeSrc.buffer = breezeBuffer;
      breezeSrc.loop = true;

      const breezeFilter = this.ctx.createBiquadFilter();
      breezeFilter.type = 'bandpass';
      breezeFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      breezeFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      const breezeGain = this.ctx.createGain();
      breezeGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      breezeSrc.connect(breezeFilter);
      breezeFilter.connect(breezeGain);
      breezeGain.connect(this.ambientGain);

      breezeSrc.start(0);
      this.ambientNodes.push(breezeSrc, breezeFilter, breezeGain);
    }

    // 2. Chime Pentatonic scale: D5, E5, G5, A5, C6, D6, E6
    const pentatonic = [587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

    const playChimeNote = () => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.76, now); // Metallic non-harmonic overtone

      const decayTime = Math.random() * 1.5 + 2.2; // 2.2s to 3.7s decay

      chimeGain.gain.setValueAtTime(0, now);
      chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.015);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

      osc.connect(chimeGain);
      overtone.connect(chimeGain);
      chimeGain.connect(this.ambientGain);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + decayTime + 0.1);
      overtone.stop(now + decayTime + 0.1);
    };

    // Initial strike
    setTimeout(playChimeNote, 300);

    // Random interval for wind chime strikes
    const chimeTimer = setInterval(() => {
      if (Math.random() < 0.65) {
        playChimeNote();
        // Occasional double chime strike
        if (Math.random() < 0.45) {
          setTimeout(playChimeNote, 220);
        }
      }
    }, 2400);

    this.ambientIntervals.push(chimeTimer);
  }

  // --- Cozy Hearth & Fireplace Generator ---
  _startFireplaceSoundscape() {
    // 1. Warm low brown rumble
    const brownBuffer = this.createNoiseBuffer('brown', 3.5);
    if (!brownBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = brownBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(rumbleGain);
    rumbleGain.connect(this.ambientGain);

    source.start(0);
    this.ambientNodes.push(source, filter, rumbleGain);

    // 2. Randomized micro crackles and ember pops
    const crackleTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      if (Math.random() < 0.7) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();

        const freq = Math.random() * 1200 + 400;
        osc.type = Math.random() < 0.5 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

        popGain.gain.setValueAtTime(Math.random() * 0.08 + 0.02, now);
        popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        osc.connect(popGain);
        popGain.connect(this.ambientGain);

        osc.start(now);
        osc.stop(now + 0.035);
      }
    }, 140);

    this.ambientIntervals.push(crackleTimer);
  }

  // --- Warm Lo-Fi Chords Drone Pad ---
  _startLoFiPadSoundscape() {
    // Progression: Cmaj7, Am7, Fmaj7, G7sus
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 261.63, 329.63, 392.00], // Fmaj7
      [196.00, 261.63, 293.66, 392.00]  // Gsus4
    ];

    let chordIdx = 0;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(460, this.ctx.currentTime);
    filter.connect(this.ambientGain);
    this.ambientNodes.push(filter);

    const playNextChord = () => {
      if (!this.ctx) return;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;
      const now = this.ctx.currentTime;

      notes.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Soft slow swell and crossfade
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.06, now + 1.2);
        noteGain.gain.setValueAtTime(0.06, now + 4.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.8);

        osc.connect(noteGain);
        noteGain.connect(filter);

        osc.start(now);
        osc.stop(now + 6.0);
      });
    };

    playNextChord();
    const chordTimer = setInterval(playNextChord, 5000);
    this.ambientIntervals.push(chordTimer);
  }
}

// Expose globally
window.SoundFX = SoundFX;
