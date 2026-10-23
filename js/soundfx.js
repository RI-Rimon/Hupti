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

  /**
   * Sweet, gentle pre-reminder chime (for Taskbox notifications)
   */
  playReminderChime() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    // Harmonious two-tone gentle bell: F5 (698.46) -> C6 (1046.50)
    const tones = [698.46, 1046.50];

    tones.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, now + idx * 0.16);

      gain.gain.setValueAtTime(0, now + idx * 0.16);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.16 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.16 + 0.85);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.16);
      overtone.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.9);
      overtone.stop(now + idx * 0.16 + 0.9);
    });
  }

  /**
   * Sweet, non-verbal pet chirp/giggle for greetings and happy moments
   * (Strictly procedural Web Audio - NO browser speech synthesis / text-to-speech)
   */
  playHappyChirp() {
    if (!this._canPlay()) return;

    const now = this.ctx.currentTime;
    // Adorable ascending pentatonic sparkle: C6 -> E6 -> G6 -> C7
    const freqs = [1046.50, 1318.51, 1567.98, 2093.00];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, now + idx * 0.07 + 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.18);
    });

    // Followed by a warm, contented purr swell
    setTimeout(() => this.playPurr(), 240);
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
   * Starts an ambient study soundscape (Full 14-Track Lineup):
   * 'rain' | 'coffeeshop' | 'forest' | 'zen' | 'ocean' | 'midnight' | 'hearth' | 'meadow' |
   * 'bamboo_flute' | 'acoustic_guitar' | 'piano_harmonium' | 'kyoto_temple' | 'latenight_lofi' | 'nordic_brook' | 'off'
   */
  startAmbient(type) {
    this.init();
    if (!this.ctx) return;
    this.stopAmbient();

    if (!type || type === 'off') {
      return;
    }

    this.activeAmbient = type;

    if (type === 'rain') {
      this._startRainSoundscape();
    } else if (type === 'coffeeshop' || type === 'cozy-lofi') {
      this._startCoffeeShopLoFiSoundscape();
    } else if (type === 'forest' || type === 'forest-breeze') {
      this._startForestBreezeSoundscape();
    } else if (type === 'zen' || type === 'zen-chimes') {
      this._startZenChimesSoundscape();
    } else if (type === 'ocean' || type === 'ocean-waves') {
      this._startOceanWavesSoundscape();
    } else if (type === 'midnight' || type === 'midnight-lofi') {
      this._startMidnightLoFiSoundscape();
    } else if (type === 'hearth' || type === 'purr-hearth') {
      this._startPurrAndHearthSoundscape();
    } else if (type === 'meadow' || type === 'summer-meadow') {
      this._startSummerMeadowSoundscape();
    } else if (type === 'bamboo_flute' || type === 'flute') {
      this._startBambooFluteSoundscape();
    } else if (type === 'acoustic_guitar' || type === 'guitar') {
      this._startAcousticGuitarSoundscape();
    } else if (type === 'piano_harmonium' || type === 'piano') {
      this._startPianoHarmoniumSoundscape();
    } else if (type === 'kyoto_temple' || type === 'temple') {
      this._startKyotoTempleSoundscape();
    } else if (type === 'latenight_lofi' || type === 'lofi_beats') {
      this._startLateNightLoFiSoundscape();
    } else if (type === 'nordic_brook' || type === 'brook') {
      this._startNordicBrookSoundscape();
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

  // --- Cozy Coffee Shop Lo-Fi ---
  _startCoffeeShopLoFiSoundscape() {
    // 1. Vinyl crackle layer
    const crackleBuffer = this.createNoiseBuffer('brown', 3.0);
    if (crackleBuffer) {
      const crackleSrc = this.ctx.createBufferSource();
      crackleSrc.buffer = crackleBuffer;
      crackleSrc.loop = true;

      const crackleFilter = this.ctx.createBiquadFilter();
      crackleFilter.type = 'highpass';
      crackleFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      const crackleGain = this.ctx.createGain();
      crackleGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      crackleSrc.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(this.ambientGain);

      crackleSrc.start(0);
      this.ambientNodes.push(crackleSrc, crackleFilter, crackleGain);
    }

    // 2. Mellow Electric Piano (Rhodes) Chords
    const chords = [
      [293.66, 349.23, 440.00, 523.25, 659.25], // Dm9
      [196.00, 246.94, 329.63, 392.00, 523.25], // G13
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
      [220.00, 277.18, 329.63, 415.30, 523.25]  // A7b13
    ];
    let chordIdx = 0;

    const rhodesFilter = this.ctx.createBiquadFilter();
    rhodesFilter.type = 'lowpass';
    rhodesFilter.frequency.setValueAtTime(520, this.ctx.currentTime);
    rhodesFilter.connect(this.ambientGain);
    this.ambientNodes.push(rhodesFilter);

    const playRhodesChord = () => {
      if (!this.ctx) return;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const overtone = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.02);

        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, now + i * 0.02);

        // Soft bell-like electric piano attack and warm sustain
        noteGain.gain.setValueAtTime(0, now + i * 0.02);
        noteGain.gain.linearRampToValueAtTime(0.045, now + i * 0.02 + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.015, now + i * 0.02 + 1.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.02 + 4.2);

        osc.connect(noteGain);
        overtone.connect(noteGain);
        noteGain.connect(rhodesFilter);

        osc.start(now + i * 0.02);
        overtone.start(now + i * 0.02);
        osc.stop(now + 4.5);
        overtone.stop(now + 4.5);
      });
    };

    playRhodesChord();
    const chordTimer = setInterval(playRhodesChord, 4200);
    this.ambientIntervals.push(chordTimer);

    // 3. Gentle brush rhythm tap every 2.1s
    const brushTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      const nBuffer = this.createNoiseBuffer('pink', 0.2);
      if (nBuffer) {
        noise.buffer = nBuffer;
        const bFilter = this.ctx.createBiquadFilter();
        bFilter.type = 'bandpass';
        bFilter.frequency.setValueAtTime(3200, now);
        bFilter.Q.setValueAtTime(1.2, now);

        const bGain = this.ctx.createGain();
        bGain.gain.setValueAtTime(0.025, now);
        bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

        noise.connect(bFilter);
        bFilter.connect(bGain);
        bGain.connect(this.ambientGain);

        noise.start(now);
        noise.stop(now + 0.07);
      }
    }, 2100);
    this.ambientIntervals.push(brushTimer);
  }

  // --- Forest Night Breeze ---
  _startForestBreezeSoundscape() {
    // 1. Distant wind rustle through trees
    const windBuffer = this.createNoiseBuffer('pink', 4.0);
    if (windBuffer) {
      const windSrc = this.ctx.createBufferSource();
      windSrc.buffer = windBuffer;
      windSrc.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

      const windLfo = this.ctx.createOscillator();
      const windLfoGain = this.ctx.createGain();
      windLfo.type = 'sine';
      windLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
      windLfoGain.gain.setValueAtTime(160, this.ctx.currentTime);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.ambientGain);

      windSrc.start(0);
      windLfo.start(0);
      this.ambientNodes.push(windSrc, windFilter, windLfo, windLfoGain, windGain);
    }

    // 2. Night crickets chirping softly
    const cricketTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      if (Math.random() < 0.65) {
        const now = this.ctx.currentTime;
        const bursts = Math.random() < 0.5 ? 2 : 3;

        for (let b = 0; b < bursts; b++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(4600 + Math.random() * 200, now + b * 0.06);

          gain.gain.setValueAtTime(0, now + b * 0.06);
          gain.gain.linearRampToValueAtTime(0.015, now + b * 0.06 + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + b * 0.06 + 0.04);

          osc.connect(gain);
          gain.connect(this.ambientGain);

          osc.start(now + b * 0.06);
          osc.stop(now + b * 0.06 + 0.045);
        }
      }
    }, 2800);
    this.ambientIntervals.push(cricketTimer);
  }

  // --- Zen Meditation Singing Bowls & Chimes ---
  _startZenChimesSoundscape() {
    // 1. Deep atmospheric singing bowl drone (G3 + D4)
    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    droneGain.connect(this.ambientGain);

    const f1 = 196.00; // G3
    const f2 = 293.66; // D4

    [f1, f2].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (idx === 0 ? 0.3 : -0.3), this.ctx.currentTime);
      osc.connect(droneGain);
      osc.start(0);
      this.ambientNodes.push(osc);
    });
    this.ambientNodes.push(droneGain);

    // 2. Slow resonant Tibetan singing bowl chime strikes
    const bowls = [216.00, 288.00, 432.00, 576.00];

    const playSingingBowl = () => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const freq = bowls[Math.floor(Math.random() * bowls.length)];

      const osc = this.ctx.createOscillator();
      const overtone1 = this.ctx.createOscillator();
      const overtone2 = this.ctx.createOscillator();
      const bowlGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      overtone1.type = 'sine';
      overtone1.frequency.setValueAtTime(freq * 2.76, now);

      overtone2.type = 'sine';
      overtone2.frequency.setValueAtTime(freq * 5.4, now);

      const decay = 5.5;

      bowlGain.gain.setValueAtTime(0, now);
      bowlGain.gain.linearRampToValueAtTime(0.09, now + 0.04);
      bowlGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(bowlGain);
      overtone1.connect(bowlGain);
      overtone2.connect(bowlGain);
      bowlGain.connect(this.ambientGain);

      osc.start(now);
      overtone1.start(now);
      overtone2.start(now);
      osc.stop(now + decay + 0.1);
      overtone1.stop(now + decay + 0.1);
      overtone2.stop(now + decay + 0.1);
    };

    playSingingBowl();
    const bowlTimer = setInterval(playSingingBowl, 6500);
    this.ambientIntervals.push(bowlTimer);
  }

  // =========================================================================
  // 4 Brand New Procedural Tracks (Completing the 8-Track Lineup)
  // =========================================================================

  // --- Track 5: Gentle Ocean Waves (Coastal Calm) ---
  _startOceanWavesSoundscape() {
    // 1. Rolling Deep Wave Swell
    const swellBuffer = this.createNoiseBuffer('pink', 5.0);
    if (!swellBuffer) return;

    const swellSrc = this.ctx.createBufferSource();
    swellSrc.buffer = swellBuffer;
    swellSrc.loop = true;

    // Resonant lowpass that opens and closes smoothly like approaching waves
    const swellFilter = this.ctx.createBiquadFilter();
    swellFilter.type = 'lowpass';
    swellFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    swellFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

    // Ultra-slow LFO (0.09 Hz = ~11s per wave cycle)
    const swellLfo = this.ctx.createOscillator();
    const swellLfoGain = this.ctx.createGain();
    swellLfo.type = 'sine';
    swellLfo.frequency.setValueAtTime(0.09, this.ctx.currentTime);
    swellLfoGain.gain.setValueAtTime(260, this.ctx.currentTime);
    swellLfo.connect(swellLfoGain);
    swellLfoGain.connect(swellFilter.frequency);

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.48, this.ctx.currentTime);

    // Secondary amplitude swell matching wave crest
    const ampLfo = this.ctx.createOscillator();
    const ampLfoGain = this.ctx.createGain();
    ampLfo.type = 'sine';
    ampLfo.frequency.setValueAtTime(0.09, this.ctx.currentTime);
    ampLfoGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    ampLfo.connect(ampLfoGain);
    ampLfoGain.connect(swellGain.gain);

    swellSrc.connect(swellFilter);
    swellFilter.connect(swellGain);
    swellGain.connect(this.ambientGain);

    swellSrc.start(0);
    swellLfo.start(0);
    ampLfo.start(0);

    this.ambientNodes.push(swellSrc, swellFilter, swellLfo, swellLfoGain, swellGain, ampLfo, ampLfoGain);

    // 2. Foamy surf hiss & receding pebbles on shore
    const surfBuffer = this.createNoiseBuffer('pink', 4.0);
    if (surfBuffer) {
      const surfSrc = this.ctx.createBufferSource();
      surfSrc.buffer = surfBuffer;
      surfSrc.loop = true;

      const surfFilter = this.ctx.createBiquadFilter();
      surfFilter.type = 'bandpass';
      surfFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);
      surfFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const surfGain = this.ctx.createGain();
      surfGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      // Slower offset LFO for surf wash
      const surfLfo = this.ctx.createOscillator();
      const surfLfoGain = this.ctx.createGain();
      surfLfo.type = 'sine';
      surfLfo.frequency.setValueAtTime(0.09, this.ctx.currentTime);
      surfLfoGain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      surfLfo.connect(surfLfoGain);
      surfLfoGain.connect(surfGain.gain);

      surfSrc.connect(surfFilter);
      surfFilter.connect(surfGain);
      surfGain.connect(this.ambientGain);

      surfSrc.start(0);
      surfLfo.start(0);
      this.ambientNodes.push(surfSrc, surfFilter, surfGain, surfLfo, surfLfoGain);
    }
  }

  // --- Track 6: Midnight Study Lo-Fi (Dreamy Beats) ---
  _startMidnightLoFiSoundscape() {
    // 1. Vinyl tape saturation / hiss layer
    const tapeBuffer = this.createNoiseBuffer('brown', 3.5);
    if (tapeBuffer) {
      const tapeSrc = this.ctx.createBufferSource();
      tapeSrc.buffer = tapeBuffer;
      tapeSrc.loop = true;

      const tapeFilter = this.ctx.createBiquadFilter();
      tapeFilter.type = 'highpass';
      tapeFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);

      const tapeGain = this.ctx.createGain();
      tapeGain.gain.setValueAtTime(0.045, this.ctx.currentTime);

      tapeSrc.connect(tapeFilter);
      tapeFilter.connect(tapeGain);
      tapeGain.connect(this.ambientGain);

      tapeSrc.start(0);
      this.ambientNodes.push(tapeSrc, tapeFilter, tapeGain);
    }

    // 2. Dreamy Midnight Minor 9th Chords (Fmaj9 -> Em9 -> Dm9 -> Cmaj9)
    const chords = [
      [174.61, 261.63, 329.63, 392.00, 523.25], // Fmaj9
      [164.81, 246.94, 293.66, 392.00, 493.88], // Em9
      [146.83, 220.00, 261.63, 349.23, 440.00], // Dm9
      [130.81, 196.00, 246.94, 329.63, 392.00]  // Cmaj9
    ];
    let chordIdx = 0;

    const chordFilter = this.ctx.createBiquadFilter();
    chordFilter.type = 'lowpass';
    chordFilter.frequency.setValueAtTime(440, this.ctx.currentTime);
    chordFilter.connect(this.ambientGain);
    this.ambientNodes.push(chordFilter);

    const playMidnightChord = () => {
      if (!this.ctx) return;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const sub = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        sub.type = 'triangle';
        sub.frequency.setValueAtTime(freq * 0.5, now + idx * 0.03);

        noteGain.gain.setValueAtTime(0, now + idx * 0.03);
        noteGain.gain.linearRampToValueAtTime(0.04, now + idx * 0.03 + 0.35);
        noteGain.gain.exponentialRampToValueAtTime(0.012, now + idx * 0.03 + 2.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 5.2);

        osc.connect(noteGain);
        sub.connect(noteGain);
        noteGain.connect(chordFilter);

        osc.start(now + idx * 0.03);
        sub.start(now + idx * 0.03);
        osc.stop(now + 5.5);
        sub.stop(now + 5.5);
      });
    };

    playMidnightChord();
    const chordTimer = setInterval(playMidnightChord, 4800);
    this.ambientIntervals.push(chordTimer);

    // 3. Relaxing chill-hop kick / muted snare pulse
    const beatTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;

      // Soft low warm kick on beat 1
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(75, now);
      kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

      kickGain.gain.setValueAtTime(0.12, now);
      kickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      kickOsc.connect(kickGain);
      kickGain.connect(this.ambientGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.2);

      // Soft muted rim tap on beat 2 (1.2s later)
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const snNow = this.ctx.currentTime;
        const nSrc = this.ctx.createBufferSource();
        const nBuf = this.createNoiseBuffer('pink', 0.15);
        if (nBuf) {
          nSrc.buffer = nBuf;
          const snFilter = this.ctx.createBiquadFilter();
          snFilter.type = 'bandpass';
          snFilter.frequency.setValueAtTime(2600, snNow);
          snFilter.Q.setValueAtTime(2.0, snNow);

          const snGain = this.ctx.createGain();
          snGain.gain.setValueAtTime(0.025, snNow);
          snGain.gain.exponentialRampToValueAtTime(0.0001, snNow + 0.05);

          nSrc.connect(snFilter);
          snFilter.connect(snGain);
          snGain.connect(this.ambientGain);

          nSrc.start(snNow);
          nSrc.stop(snNow + 0.06);
        }
      }, 1200);
    }, 2400);

    this.ambientIntervals.push(beatTimer);
  }

  // --- Track 7: Purr & Hearth (Warm Fireplace & Rhythmic Cat Purr) ---
  _startPurrAndHearthSoundscape() {
    // 1. Cozy Fireplace Brown Noise Rumble
    const fireBuffer = this.createNoiseBuffer('brown', 4.0);
    if (fireBuffer) {
      const fireSrc = this.ctx.createBufferSource();
      fireSrc.buffer = fireBuffer;
      fireSrc.loop = true;

      const fireFilter = this.ctx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(240, this.ctx.currentTime);

      const fireGain = this.ctx.createGain();
      fireGain.gain.setValueAtTime(0.42, this.ctx.currentTime);

      fireSrc.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(this.ambientGain);

      fireSrc.start(0);
      this.ambientNodes.push(fireSrc, fireFilter, fireGain);
    }

    // 2. Randomized Wood Crackle / Ember Pops
    const crackleTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      if (Math.random() < 0.65) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();

        const freq = Math.random() * 900 + 500;
        osc.type = Math.random() < 0.5 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.022);

        popGain.gain.setValueAtTime(Math.random() * 0.07 + 0.02, now);
        popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

        osc.connect(popGain);
        popGain.connect(this.ambientGain);

        osc.start(now);
        osc.stop(now + 0.03);
      }
    }, 130);
    this.ambientIntervals.push(crackleTimer);

    // 3. Rhythmic Ambient Cat Purr (28Hz fundamental + 56Hz harmonic with 0.28Hz breathing envelope)
    const purrGain = this.ctx.createGain();
    purrGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    // Natural breathing AM LFO
    const breathLfo = this.ctx.createOscillator();
    const breathGain = this.ctx.createGain();
    breathLfo.type = 'sine';
    breathLfo.frequency.setValueAtTime(0.28, this.ctx.currentTime); // ~3.5s breathing cycle
    breathGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    breathLfo.connect(breathGain);
    breathGain.connect(purrGain.gain);

    const purrOsc1 = this.ctx.createOscillator();
    const purrOsc2 = this.ctx.createOscillator();
    purrOsc1.type = 'triangle';
    purrOsc1.frequency.setValueAtTime(28, this.ctx.currentTime);
    purrOsc2.type = 'sine';
    purrOsc2.frequency.setValueAtTime(56, this.ctx.currentTime);

    // 26Hz purr flutter tremolo
    const flutterLfo = this.ctx.createOscillator();
    const flutterGain = this.ctx.createGain();
    flutterLfo.type = 'sine';
    flutterLfo.frequency.setValueAtTime(26, this.ctx.currentTime);
    flutterGain.gain.setValueAtTime(14, this.ctx.currentTime);
    flutterLfo.connect(flutterGain);
    flutterGain.connect(purrOsc1.frequency);

    purrOsc1.connect(purrGain);
    purrOsc2.connect(purrGain);
    purrGain.connect(this.ambientGain);

    purrOsc1.start(0);
    purrOsc2.start(0);
    breathLfo.start(0);
    flutterLfo.start(0);

    this.ambientNodes.push(purrGain, breathLfo, breathGain, purrOsc1, purrOsc2, flutterLfo, flutterGain);
  }

  // --- Track 8: Summer Night Meadow (Crickets & Breeze) ---
  _startSummerMeadowSoundscape() {
    // 1. Warm Night Meadow Breeze (Bandpass filtered noise)
    const breezeBuffer = this.createNoiseBuffer('pink', 4.0);
    if (breezeBuffer) {
      const breezeSrc = this.ctx.createBufferSource();
      breezeSrc.buffer = breezeBuffer;
      breezeSrc.loop = true;

      const breezeFilter = this.ctx.createBiquadFilter();
      breezeFilter.type = 'bandpass';
      breezeFilter.frequency.setValueAtTime(360, this.ctx.currentTime);
      breezeFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);

      const breezeGain = this.ctx.createGain();
      breezeGain.gain.setValueAtTime(0.24, this.ctx.currentTime);

      // Slow wind sway
      const breezeLfo = this.ctx.createOscillator();
      const breezeLfoGain = this.ctx.createGain();
      breezeLfo.type = 'sine';
      breezeLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
      breezeLfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
      breezeLfo.connect(breezeLfoGain);
      breezeLfoGain.connect(breezeFilter.frequency);

      breezeSrc.connect(breezeFilter);
      breezeFilter.connect(breezeGain);
      breezeGain.connect(this.ambientGain);

      breezeSrc.start(0);
      breezeLfo.start(0);
      this.ambientNodes.push(breezeSrc, breezeFilter, breezeGain, breezeLfo, breezeLfoGain);
    }

    // 2. Polyphonic Meadow Crickets (4200Hz, 4800Hz, 5400Hz)
    const cricketFreqs = [4200, 4800, 5400];
    const meadowTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      if (Math.random() < 0.7) {
        const now = this.ctx.currentTime;
        const pulses = Math.floor(Math.random() * 3) + 2; // 2 to 4 pulses
        const baseFreq = cricketFreqs[Math.floor(Math.random() * cricketFreqs.length)];

        for (let p = 0; p < pulses; p++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq + Math.random() * 80 - 40, now + p * 0.05);

          gain.gain.setValueAtTime(0, now + p * 0.05);
          gain.gain.linearRampToValueAtTime(0.016, now + p * 0.05 + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + p * 0.05 + 0.038);

          osc.connect(gain);
          gain.connect(this.ambientGain);

          osc.start(now + p * 0.05);
          osc.stop(now + p * 0.05 + 0.042);
        }
      }
    }, 1800);
    this.ambientIntervals.push(meadowTimer);
  }

  // =========================================================================
  // 6 Brand New High-Fidelity Acoustic & Melodic Instrumental Soundscapes
  // =========================================================================

  // --- Track 9: Peaceful Morning Bamboo Flute (বাঁশির মিষ্টি সুর) ---
  _startBambooFluteSoundscape() {
    // 1. Soft Natural Morning Breeze
    const breezeBuffer = this.createNoiseBuffer('pink', 4.0);
    if (breezeBuffer) {
      const breezeSrc = this.ctx.createBufferSource();
      breezeSrc.buffer = breezeBuffer;
      breezeSrc.loop = true;

      const breezeFilter = this.ctx.createBiquadFilter();
      breezeFilter.type = 'lowpass';
      breezeFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      const breezeGain = this.ctx.createGain();
      breezeGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

      breezeSrc.connect(breezeFilter);
      breezeFilter.connect(breezeGain);
      breezeGain.connect(this.ambientGain);

      breezeSrc.start(0);
      this.ambientNodes.push(breezeSrc, breezeFilter, breezeGain);
    }

    // 2. Soulful Pentatonic Bamboo Flute Melody (Raag Bhupali / Morning Peace)
    const flutePhrases = [
      [261.63, 293.66, 329.63, 392.00],       // C4, D4, E4, G4
      [392.00, 440.00, 523.25, 440.00, 392.00], // G4, A4, C5, A4, G4
      [523.25, 587.33, 523.25, 392.00, 329.63], // C5, D5, C5, G4, E4
      [293.66, 329.63, 293.66, 261.63]        // D4, E4, D4, C4
    ];
    let phraseIdx = 0;

    const playFlutePhrase = () => {
      if (!this.ctx || this.isMuted) return;
      const phrase = flutePhrases[phraseIdx];
      phraseIdx = (phraseIdx + 1) % flutePhrases.length;
      const now = this.ctx.currentTime;

      phrase.forEach((freq, idx) => {
        const noteStart = now + idx * 0.95;
        const dur = 1.35;

        // Core resonant flute tone
        const osc = this.ctx.createOscillator();
        const overtone = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);
        // Subtle micro-pitch bend at onset mimicking bamboo breath
        osc.frequency.exponentialRampToValueAtTime(freq * 1.006, noteStart + 0.12);
        osc.frequency.setValueAtTime(freq, noteStart + 0.28);

        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, noteStart);

        // Delayed expressive vibrato (5.2 Hz)
        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        vibrato.type = 'sine';
        vibrato.frequency.setValueAtTime(5.2, noteStart);
        vibratoGain.gain.setValueAtTime(0, noteStart);
        vibratoGain.gain.linearRampToValueAtTime(3.8, noteStart + 0.45);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        // Breath envelope
        noteGain.gain.setValueAtTime(0, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.08, noteStart + 0.25);
        noteGain.gain.setValueAtTime(0.08, noteStart + dur - 0.35);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);

        osc.connect(noteGain);
        overtone.connect(noteGain);
        noteGain.connect(this.ambientGain);

        osc.start(noteStart);
        overtone.start(noteStart);
        vibrato.start(noteStart);
        osc.stop(noteStart + dur + 0.05);
        overtone.stop(noteStart + dur + 0.05);
        vibrato.stop(noteStart + dur + 0.05);

        // Airy breath noise transient across the embouchure
        const breathBuf = this.createNoiseBuffer('pink', 0.4);
        if (breathBuf) {
          const bSrc = this.ctx.createBufferSource();
          bSrc.buffer = breathBuf;
          const bFilt = this.ctx.createBiquadFilter();
          bFilt.type = 'bandpass';
          bFilt.frequency.setValueAtTime(freq * 1.5, noteStart);
          bFilt.Q.setValueAtTime(2.8, noteStart);

          const bGain = this.ctx.createGain();
          bGain.gain.setValueAtTime(0, noteStart);
          bGain.gain.linearRampToValueAtTime(0.022, noteStart + 0.08);
          bGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.35);

          bSrc.connect(bFilt);
          bFilt.connect(bGain);
          bGain.connect(this.ambientGain);

          bSrc.start(noteStart);
          bSrc.stop(noteStart + 0.4);
        }
      });
    };

    playFlutePhrase();
    const fluteTimer = setInterval(playFlutePhrase, 5200);
    this.ambientIntervals.push(fluteTimer);
  }

  // --- Track 10: Cozy Fireside Acoustic Guitar (অ্যাকোস্টিক ফিঙ্গারস্টাইল গিটার) ---
  _startAcousticGuitarSoundscape() {
    // 1. Soft Fireside Warmth in background
    const fireBuffer = this.createNoiseBuffer('brown', 3.5);
    if (fireBuffer) {
      const fireSrc = this.ctx.createBufferSource();
      fireSrc.buffer = fireBuffer;
      fireSrc.loop = true;
      const fireFilt = this.ctx.createBiquadFilter();
      fireFilt.type = 'lowpass';
      fireFilt.frequency.setValueAtTime(200, this.ctx.currentTime);
      const fireGain = this.ctx.createGain();
      fireGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      fireSrc.connect(fireFilt);
      fireFilt.connect(fireGain);
      fireGain.connect(this.ambientGain);
      fireSrc.start(0);
      this.ambientNodes.push(fireSrc, fireFilt, fireGain);
    }

    // 2. Warm Fingerstyle Acoustic Chords (Cmaj7 -> Am9 -> Fmaj7 -> G6)
    const guitarChords = [
      [130.81, 196.00, 261.63, 329.63, 493.88], // Cmaj7
      [110.00, 164.81, 261.63, 329.63, 493.88], // Am9
      [87.31, 130.81, 220.00, 261.63, 329.63],  // Fmaj7
      [98.00, 146.83, 196.00, 246.94, 329.63]   // G6
    ];
    let chordIdx = 0;
    let stringIdx = 0;

    // Body resonance filter
    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(1600, this.ctx.currentTime);
    bodyFilter.connect(this.ambientGain);
    this.ambientNodes.push(bodyFilter);

    const pluckTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const chord = guitarChords[chordIdx];
      const freq = chord[stringIdx];

      // Move to next string in arpeggio
      stringIdx = (stringIdx + 1) % chord.length;
      if (stringIdx === 0) {
        chordIdx = (chordIdx + 1) % guitarChords.length;
      }

      // Pluck synthesis: Dual sine & triangle with string tension release
      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const pluckGain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 1.012, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.04);

      sub.type = 'sine';
      sub.frequency.setValueAtTime(freq, now);

      const decay = freq < 150 ? 2.2 : 1.5;

      pluckGain.gain.setValueAtTime(0, now);
      pluckGain.gain.linearRampToValueAtTime(0.065, now + 0.004);
      pluckGain.gain.exponentialRampToValueAtTime(0.015, now + 0.5);
      pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(pluckGain);
      sub.connect(pluckGain);
      pluckGain.connect(bodyFilter);

      osc.start(now);
      sub.start(now);
      osc.stop(now + decay + 0.05);
      sub.stop(now + decay + 0.05);
    }, 400);

    this.ambientIntervals.push(pluckTimer);
  }

  // --- Track 11: Meditative Piano & Soft Harmonium Bloom (পিয়ানো ও হারমোনিয়াম হারমোনি) ---
  _startPianoHarmoniumSoundscape() {
    // 1. Warm Harmonium Chord Drone (Bellows breath on C3 + G3 + C4)
    const harmoniumNotes = [130.81, 196.00, 261.63];
    const harmoniumGain = this.ctx.createGain();
    harmoniumGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

    // Natural hand-pumped bellows LFO
    const bellowsLfo = this.ctx.createOscillator();
    const bellowsLfoGain = this.ctx.createGain();
    bellowsLfo.type = 'sine';
    bellowsLfo.frequency.setValueAtTime(0.22, this.ctx.currentTime); // ~4.5s bellows cycle
    bellowsLfoGain.gain.setValueAtTime(0.035, this.ctx.currentTime);
    bellowsLfo.connect(bellowsLfoGain);
    bellowsLfoGain.connect(harmoniumGain.gain);

    const harmFilter = this.ctx.createBiquadFilter();
    harmFilter.type = 'lowpass';
    harmFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
    harmFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    harmoniumNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const reed = this.ctx.createOscillator();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.35 : -0.25), this.ctx.currentTime);

      reed.type = 'sawtooth';
      reed.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const rGain = this.ctx.createGain();
      rGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      reed.connect(rGain);

      osc.connect(harmFilter);
      rGain.connect(harmFilter);

      osc.start(0);
      reed.start(0);
      this.ambientNodes.push(osc, reed, rGain);
    });

    harmFilter.connect(harmoniumGain);
    harmoniumGain.connect(this.ambientGain);
    bellowsLfo.start(0);
    this.ambientNodes.push(bellowsLfo, bellowsLfoGain, harmFilter, harmoniumGain);

    // 2. Sparse Minimalist Acoustic Piano Notes
    const pianoNotes = [329.63, 392.00, 493.88, 523.25, 587.33, 659.25, 783.99]; // E4, G4, B4, C5, D5, E5, G5
    let pianoIdx = 0;

    const playPianoNote = () => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const freq = pianoNotes[pianoIdx];
      pianoIdx = (pianoIdx + 1) % pianoNotes.length;

      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const pianoGain = this.ctx.createGain();
      const pianoFilter = this.ctx.createBiquadFilter();

      pianoFilter.type = 'lowpass';
      pianoFilter.frequency.setValueAtTime(1200, now);
      pianoFilter.frequency.exponentialRampToValueAtTime(350, now + 3.0);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, now);

      const decay = 3.8;

      pianoGain.gain.setValueAtTime(0, now);
      pianoGain.gain.linearRampToValueAtTime(0.08, now + 0.008);
      pianoGain.gain.exponentialRampToValueAtTime(0.02, now + 1.2);
      pianoGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(pianoFilter);
      overtone.connect(pianoFilter);
      pianoFilter.connect(pianoGain);
      pianoGain.connect(this.ambientGain);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + decay + 0.1);
      overtone.stop(now + decay + 0.1);
    };

    playPianoNote();
    const pianoTimer = setInterval(playPianoNote, 3200);
    this.ambientIntervals.push(pianoTimer);
  }

  // --- Track 12: Kyoto Temple Rain & Bamboo Bell (Hi-Fi Ambient) ---
  _startKyotoTempleSoundscape() {
    // 1. Rainfall on Cedar Veranda Tiles
    const tileBuffer = this.createNoiseBuffer('pink', 4.0);
    if (tileBuffer) {
      const tileSrc = this.ctx.createBufferSource();
      tileSrc.buffer = tileBuffer;
      tileSrc.loop = true;

      const tileFilter = this.ctx.createBiquadFilter();
      tileFilter.type = 'bandpass';
      tileFilter.frequency.setValueAtTime(950, this.ctx.currentTime);
      tileFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      const tileGain = this.ctx.createGain();
      tileGain.gain.setValueAtTime(0.32, this.ctx.currentTime);

      tileSrc.connect(tileFilter);
      tileFilter.connect(tileGain);
      tileGain.connect(this.ambientGain);

      tileSrc.start(0);
      this.ambientNodes.push(tileSrc, tileFilter, tileGain);
    }

    // Delicate wooden raindrop plinks
    const dropTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = Math.random() * 500 + 800; // 800 - 1300Hz wooden resonance
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + 0.035);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start(now);
      osc.stop(now + 0.045);
    }, 180);
    this.ambientIntervals.push(dropTimer);

    // 2. Hollow Resonant Bamboo Wind Bell / Water Chime
    const bellPitches = [523.25, 659.25, 783.99, 1046.50];
    const bellTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      if (Math.random() < 0.65) {
        const now = this.ctx.currentTime;
        const freq = bellPitches[Math.floor(Math.random() * bellPitches.length)];

        const osc = this.ctx.createOscillator();
        const hollow = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        hollow.type = 'triangle';
        hollow.frequency.setValueAtTime(freq * 2.76, now);

        const decay = 3.2;

        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.linearRampToValueAtTime(0.08, now + 0.015);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(bellGain);
        hollow.connect(bellGain);
        bellGain.connect(this.ambientGain);

        osc.start(now);
        hollow.start(now);
        osc.stop(now + decay + 0.05);
        hollow.stop(now + decay + 0.05);
      }
    }, 4500);
    this.ambientIntervals.push(bellTimer);
  }

  // --- Track 13: Late Night Midnight Lo-Fi Beats (Warm Vinyl & Rhodes) ---
  _startLateNightLoFiSoundscape() {
    // 1. Vinyl tape crackle & warm fuzz
    const crackleBuffer = this.createNoiseBuffer('brown', 3.0);
    if (crackleBuffer) {
      const crackleSrc = this.ctx.createBufferSource();
      crackleSrc.buffer = crackleBuffer;
      crackleSrc.loop = true;

      const crackleFilt = this.ctx.createBiquadFilter();
      crackleFilt.type = 'highpass';
      crackleFilt.frequency.setValueAtTime(1600, this.ctx.currentTime);

      const crackleGain = this.ctx.createGain();
      crackleGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

      crackleSrc.connect(crackleFilt);
      crackleFilt.connect(crackleGain);
      crackleGain.connect(this.ambientGain);

      crackleSrc.start(0);
      this.ambientNodes.push(crackleSrc, crackleFilt, crackleGain);
    }

    // 2. Mellow Rhodes Chords (Abmaj7 -> Gm7 -> Fm9 -> Ebmaj7)
    const chords = [
      [207.65, 261.63, 311.13, 392.00], // Abmaj7
      [196.00, 233.08, 293.66, 349.23], // Gm7
      [174.61, 207.65, 261.63, 311.13], // Fm9
      [155.56, 196.00, 233.08, 293.66]  // Ebmaj7
    ];
    let chordIdx = 0;

    const rhodesFilt = this.ctx.createBiquadFilter();
    rhodesFilt.type = 'lowpass';
    rhodesFilt.frequency.setValueAtTime(550, this.ctx.currentTime);
    rhodesFilt.connect(this.ambientGain);
    this.ambientNodes.push(rhodesFilt);

    const playRhodesChord = () => {
      if (!this.ctx || this.isMuted) return;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);

        noteGain.gain.setValueAtTime(0, now + idx * 0.02);
        noteGain.gain.linearRampToValueAtTime(0.045, now + idx * 0.02 + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.012, now + idx * 0.02 + 2.5);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.02 + 4.5);

        osc.connect(noteGain);
        noteGain.connect(rhodesFilt);

        osc.start(now + idx * 0.02);
        osc.stop(now + 4.6);
      });
    };

    playRhodesChord();
    const chordTimer = setInterval(playRhodesChord, 4500);
    this.ambientIntervals.push(chordTimer);

    // 3. Relaxing 70 BPM Chill-Hop Beat (Beat every 857ms)
    const beatTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;

      // Soft low warm kick on Beat 1
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(68, now);
      kickOsc.frequency.exponentialRampToValueAtTime(36, now + 0.12);

      kickGain.gain.setValueAtTime(0.12, now);
      kickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      kickOsc.connect(kickGain);
      kickGain.connect(this.ambientGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.2);

      // Soft muted brush rim tap on Beat 2 (428ms later)
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const snNow = this.ctx.currentTime;
        const nSrc = this.ctx.createBufferSource();
        const nBuf = this.createNoiseBuffer('pink', 0.12);
        if (nBuf) {
          nSrc.buffer = nBuf;
          const snFilter = this.ctx.createBiquadFilter();
          snFilter.type = 'bandpass';
          snFilter.frequency.setValueAtTime(2400, snNow);
          snFilter.Q.setValueAtTime(1.8, snNow);

          const snGain = this.ctx.createGain();
          snGain.gain.setValueAtTime(0.022, snNow);
          snGain.gain.exponentialRampToValueAtTime(0.0001, snNow + 0.05);

          nSrc.connect(snFilter);
          snFilter.connect(snGain);
          snGain.connect(this.ambientGain);

          nSrc.start(snNow);
          nSrc.stop(snNow + 0.06);
        }
      }, 428);
    }, 857);

    this.ambientIntervals.push(beatTimer);
  }

  // --- Track 14: Starry Nordic Pines & Flowing Brook ---
  _startNordicBrookSoundscape() {
    // 1. Crystal-Clear Mountain Stream Gurgling over Stones
    const waterBuffer1 = this.createNoiseBuffer('pink', 4.0);
    const waterBuffer2 = this.createNoiseBuffer('white', 3.5);

    if (waterBuffer1 && waterBuffer2) {
      // Lower brook gurgle
      const src1 = this.ctx.createBufferSource();
      src1.buffer = waterBuffer1;
      src1.loop = true;

      const filt1 = this.ctx.createBiquadFilter();
      filt1.type = 'bandpass';
      filt1.frequency.setValueAtTime(580, this.ctx.currentTime);
      filt1.Q.setValueAtTime(1.8, this.ctx.currentTime);

      const lfo1 = this.ctx.createOscillator();
      const lfoGain1 = this.ctx.createGain();
      lfo1.type = 'sine';
      lfo1.frequency.setValueAtTime(0.18, this.ctx.currentTime);
      lfoGain1.gain.setValueAtTime(140, this.ctx.currentTime);
      lfo1.connect(lfoGain1);
      lfoGain1.connect(filt1.frequency);

      const gain1 = this.ctx.createGain();
      gain1.gain.setValueAtTime(0.28, this.ctx.currentTime);

      src1.connect(filt1);
      filt1.connect(gain1);
      gain1.connect(this.ambientGain);

      src1.start(0);
      lfo1.start(0);
      this.ambientNodes.push(src1, filt1, lfo1, lfoGain1, gain1);

      // Higher crisp splash over rocks
      const src2 = this.ctx.createBufferSource();
      src2.buffer = waterBuffer2;
      src2.loop = true;

      const filt2 = this.ctx.createBiquadFilter();
      filt2.type = 'bandpass';
      filt2.frequency.setValueAtTime(1150, this.ctx.currentTime);
      filt2.Q.setValueAtTime(2.2, this.ctx.currentTime);

      const lfo2 = this.ctx.createOscillator();
      const lfoGain2 = this.ctx.createGain();
      lfo2.type = 'sine';
      lfo2.frequency.setValueAtTime(0.31, this.ctx.currentTime);
      lfoGain2.gain.setValueAtTime(220, this.ctx.currentTime);
      lfo2.connect(lfoGain2);
      lfoGain2.connect(filt2.frequency);

      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(0.12, this.ctx.currentTime);

      src2.connect(filt2);
      filt2.connect(gain2);
      gain2.connect(this.ambientGain);

      src2.start(0);
      lfo2.start(0);
      this.ambientNodes.push(src2, filt2, lfo2, lfoGain2, gain2);
    }

    // 2. Starry Nocturnal Wind in Pine Needles
    const pineBuffer = this.createNoiseBuffer('pink', 4.0);
    if (pineBuffer) {
      const pineSrc = this.ctx.createBufferSource();
      pineSrc.buffer = pineBuffer;
      pineSrc.loop = true;

      const pineFilter = this.ctx.createBiquadFilter();
      pineFilter.type = 'lowpass';
      pineFilter.frequency.setValueAtTime(340, this.ctx.currentTime);

      const pineLfo = this.ctx.createOscillator();
      const pineLfoGain = this.ctx.createGain();
      pineLfo.type = 'sine';
      pineLfo.frequency.setValueAtTime(0.07, this.ctx.currentTime);
      pineLfoGain.gain.setValueAtTime(110, this.ctx.currentTime);
      pineLfo.connect(pineLfoGain);
      pineLfoGain.connect(pineFilter.frequency);

      const pineGain = this.ctx.createGain();
      pineGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      pineSrc.connect(pineFilter);
      pineFilter.connect(pineGain);
      pineGain.connect(this.ambientGain);

      pineSrc.start(0);
      pineLfo.start(0);
      this.ambientNodes.push(pineSrc, pineFilter, pineGain, pineLfo, pineLfoGain);
    }
  }
}

// Expose globally
window.SoundFX = SoundFX;
