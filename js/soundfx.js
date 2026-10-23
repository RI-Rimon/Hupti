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

  /**
   * Starts an ambient study soundscape (Curated 8-Track Lineup):
   * 1. 'cozy_lofi': Cozy Lo-Fi Study Beats
   * 2. 'latenight_lofi': Late Night Lo-Fi Chill
   * 3. 'soft_rain': Soft Rain & Distant Thunder
   * 4. 'bamboo_flute': Peaceful Bamboo Flute
   * 5. 'acoustic_guitar': Cozy Fireside Acoustic Guitar
   * 6. 'piano_harmonium': Meditative Piano & Harmonium
   * 7. 'campfire': Crackling Campfire
   * 8. 'brown_noise': Deep Focus Brown Noise
   */
  startAmbient(type) {
    this.init();
    if (!this.ctx) return;
    this.stopAmbient();

    if (!type || type === 'off') {
      return;
    }

    this.activeAmbient = type;

    switch (type) {
      case 'cozy_lofi':
      case 'coffeeshop':
      case 'cozy-lofi':
        this._startCoffeeShopLoFiSoundscape();
        break;
      case 'latenight_lofi':
      case 'lofi_beats':
      case 'latenight':
      case 'midnight':
      case 'midnight-lofi':
        this._startLateNightLoFiSoundscape();
        break;
      case 'soft_rain':
      case 'rain':
      case 'kyoto_temple':
        this._startRainSoundscape();
        break;
      case 'bamboo_flute':
      case 'flute':
        this._startBambooFluteSoundscape();
        break;
      case 'acoustic_guitar':
      case 'guitar':
        this._startAcousticGuitarSoundscape();
        break;
      case 'piano_harmonium':
      case 'piano':
        this._startPianoHarmoniumSoundscape();
        break;
      case 'campfire':
      case 'fireplace':
      case 'hearth':
      case 'purr-hearth':
        this._startFireplaceSoundscape();
        break;
      case 'brown_noise':
      case 'brown':
      case 'noise':
      case 'ocean':
      case 'ocean-waves':
      case 'forest':
      case 'zen':
      case 'meadow':
      case 'nordic_brook':
        this._startDeepFocusBrownNoise();
        break;
      default:
        this._startCoffeeShopLoFiSoundscape();
        break;
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

  // --- Track 1: Cozy Lo-Fi Study Beats ---
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

  // --- Track 2: Late Night Lo-Fi Chill ---
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

  // --- Track 3: Soft Rain & Distant Thunder ---
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
    rainGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

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

    // Distant soft low-frequency thunder rumble (every ~22 seconds)
    const thunderTimer = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      if (Math.random() < 0.65) {
        const tNow = this.ctx.currentTime;
        const tBuf = this.createNoiseBuffer('brown', 3.5);
        if (!tBuf) return;
        const tSrc = this.ctx.createBufferSource();
        tSrc.buffer = tBuf;

        const tFilt = this.ctx.createBiquadFilter();
        tFilt.type = 'lowpass';
        tFilt.frequency.setValueAtTime(120, tNow);

        const tGain = this.ctx.createGain();
        tGain.gain.setValueAtTime(0.001, tNow);
        tGain.gain.linearRampToValueAtTime(0.18, tNow + 1.2);
        tGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 3.4);

        tSrc.connect(tFilt);
        tFilt.connect(tGain);
        tGain.connect(this.ambientGain);

        tSrc.start(tNow);
        tSrc.stop(tNow + 3.5);
      }
    }, 22000);
    this.ambientIntervals.push(thunderTimer);
  }

  // --- Track 4: Peaceful Bamboo Flute ---
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

  // --- Track 5: Cozy Fireside Acoustic Guitar ---
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

  // --- Track 6: Meditative Piano & Harmonium ---
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

  // --- Track 7: Crackling Campfire ---
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

  // --- Track 8: Deep Focus Brown Noise ---
  _startDeepFocusBrownNoise() {
    const buffer = this.createNoiseBuffer('brown', 4.0);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Smooth lowpass filter for deep, soothing brown noise (blocks background speech/traffic)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.48, this.ctx.currentTime);

    // Subtle gentle wave LFO so the tone breathes naturally
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.035, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    source.start(0);
    lfo.start(0);
    this.ambientNodes.push(source, filter, gain, lfo, lfoGain);
  }
}

// Expose globally
window.SoundFX = SoundFX;
