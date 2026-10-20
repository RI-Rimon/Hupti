/**
 * HuptiState - State Machine and Behavior Controller for Hupti
 * Handles emotions, dialogues, sleep cycles, affection, spontaneous idle chatter,
 * and interaction timeouts.
 */

const MOODS = {
  IDLE: 'idle',
  HAPPY: 'happy',
  HUGGED: 'hugged',
  POUTED: 'pouted',
  SAD: 'sad',
  SLEEPING: 'sleeping',
  EATING: 'eating',
  SURPRISED: 'surprised'
};

class HuptiState {
  constructor(soundFX) {
    this.soundFX = soundFX;
    this.currentMood = MOODS.IDLE;
    this.previousMood = MOODS.IDLE;
    this.affection = 65; // default 0 - 100
    this.treatCount = 0; // default
    this.pokeCount = 0;
    this.lastInteractionTime = Date.now();
    this.moodTimeout = null;
    this.snoreInterval = null;
    this.idleChatterTimer = null;
    this.nextIdleChatterDelay = Math.random() * 8000 + 12000; // 12 - 20 seconds
    this.subscribers = [];

    // Load persisted progress from localStorage
    this.loadState();

    // Personality Dialogue Bank with Rich Variety
    this.dialogues = {
      [MOODS.IDLE]: [
        "Just observing the world... got a moment to hang out?",
        "Blink... blink. Watching your cursor dance around is so mesmerizing!",
        "I wonder what soft clouds taste like... vanilla marshmallows?",
        "Sitting here, being cute and round. Life is cozy.",
        "Psst! If you stroke my forehead, I might just purr for you.",
        "Floating gently on a breeze of warm thoughts~",
        "Did you know? Even small moments of peace make the whole day softer.",
        "Looking right at you! Your presence makes this space feel warm."
      ],
      [MOODS.HAPPY]: [
        "Aww, that feels so soothing! You always know how to make my day.",
        "Purrrrr... right behind my eyes is my absolute favorite spot!",
        "Hehe, tickles! You really are the sweetest human ever.",
        "My cheeks are glowing bright pink... I feel so cherished!",
        "Floating on cloud nine! More gentle pets, please?",
        "Mmm, my forehead feels all warm and tingly with love~",
        "Happy little sparks are bubbling inside my chest!",
        "You have the gentlest touch... I never want this to stop."
      ],
      [MOODS.HUGGED]: [
        "Mmm, this warm hug feels so safe and cozy... thank you! 💖",
        "A big warm hug! You really know how to melt my heart.",
        "Hugging you right back! Never letting go!",
        "Squeeeze~ your warmth makes all the clouds go away!",
        "Can we stay like this for a little bit? So comforting...",
        "Wrapped in love! My whole body feels like a warm marshmallow.",
        "Deep breath in... feeling your kindness all around me."
      ],
      [MOODS.POUTED]: [
        "Hey! Be gentle, mister... I'm small and delicate, you know!",
        "Hmph! If you poke my cheeks one more time, I might just float away.",
        "Ouchies! My squishy face is for gentle pats, not poking!",
        "I'm giving you the silent treatment for exactly ten seconds... hmph!",
        "Look at my cheeks puffing up! You're lucky you're cute.",
        "Tsk tsk! My face is not a doorbell, mister!",
        "Squished cheek protest in progress: (¬_¬) Be nice!"
      ],
      [MOODS.SAD]: [
        "Did I do something wrong? I'm sorry... please don't be upset.",
        "Sniff... I was just trying my best. Can we be friends again?",
        "My little heart feels like a deflated balloon right now...",
        "I promise to be super good... could I have a gentle hug?",
        "Looking down at the floor... my blush completely faded away.",
        "Sniffling quietly... can we start over with a fresh smile?",
        "A tiny tear is rolling down... please don't be stern with me."
      ],
      [MOODS.SLEEPING]: [
        "Shh... Hupti is dreaming sweet dreams. (Press W or click to wake her up)",
        "Zzz... chasing strawberry clouds across a pastel sky... Zzz...",
        "Soft cozy snoozing... so warm and peaceful... zZz...",
        "*Tiny quiet snore* ... dreaming of star sprinkles and warm blankets...",
        "Curled up in a sleepy orb. Press W or gently tap to wake.",
        "Drifting between marshmallow galaxies... zZz..."
      ],
      [MOODS.EATING]: [
        "Om nom nom! Strawberry mochi! You're the absolute best!",
        "*Munch munch* Yummy in my tummy! That hits the spot!",
        "Sweet treats make everything 1000% happier! Look at my happy eyes!",
        "Crunch, nibble, swallow! Pure bliss in every bite!",
        "Mmm, so delicious! My eyes are practically sparkling with joy!"
      ],
      [MOODS.SURPRISED]: [
        "Eep! Oh, you startled me for a second!",
        "Whoa! My eyes went wide as saucers!",
        "Boop! That tickled right on the nose!",
        "Gasp! You're full of surprises today!"
      ]
    };

    // Emotional, Heartwarming & Motivational Spontaneous Idle Thoughts (12-20s)
    this.idleChatterBank = [
      "You are my sweet human, you know that?",
      "Don't forget to take care of yourself today! Have a sip of water.",
      "Waiting to get a sweet hug from you... 💖",
      "You're doing amazing, even if things feel tough. I'm right here!",
      "Just sitting here appreciating how kind you are to me.",
      "Psst... are you busy? Just wanted to say hi and send you love!",
      "Daydreaming a little bit... wonder what happy thing happens next?",
      "I'm watching you work, remember you're doing your best!",
      "Humming a quiet little tune to myself... 🎵",
      "My cheeks feel like they could use a warm little hug right about now..."
    ];

    this.currentDialogue = this.dialogues[MOODS.IDLE][0];

    // Start spontaneous idle chatter monitor
    this.startIdleChatterLoop();
  }

  /**
   * Register state change observer
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.getStateSnapshot());
  }

  notify(extraMeta = {}) {
    const snapshot = {
      ...this.getStateSnapshot(),
      ...extraMeta
    };
    this.subscribers.forEach(cb => cb(snapshot));
  }

  getStateSnapshot() {
    return {
      mood: this.currentMood,
      previousMood: this.previousMood,
      dialogue: this.currentDialogue,
      affection: this.affection,
      treatCount: this.treatCount,
      isSleeping: this.currentMood === MOODS.SLEEPING
    };
  }

  /**
   * Persistence: Load state from localStorage
   */
  loadState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('hupti_virtual_pet_save');
        if (saved) {
          const data = JSON.parse(saved);
          if (typeof data.treatCount === 'number' && !isNaN(data.treatCount)) {
            this.treatCount = Math.max(0, data.treatCount);
          }
          if (typeof data.affection === 'number' && !isNaN(data.affection)) {
            this.affection = Math.min(100, Math.max(10, data.affection));
          }
        }
      }
    } catch (e) {
      console.warn('Could not restore Hupti state from localStorage:', e);
    }
  }

  /**
   * Persistence: Save state to localStorage
   */
  saveState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = {
          treatCount: this.treatCount,
          affection: this.affection,
          lastSaved: Date.now()
        };
        window.localStorage.setItem('hupti_virtual_pet_save', JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Could not persist Hupti state to localStorage:', e);
    }
  }

  /**
   * Spontaneous Idle Chatter Loop (Monitors inactivity between 8-15 seconds)
   */
  startIdleChatterLoop() {
    if (this.idleChatterTimer) clearInterval(this.idleChatterTimer);

    this.idleChatterTimer = setInterval(() => {
      // Only chat spontaneously if awake, in idle mode, and past the idle threshold
      if (this.currentMood === MOODS.IDLE) {
        const elapsed = Date.now() - this.lastInteractionTime;
        if (elapsed >= this.nextIdleChatterDelay) {
          this.triggerSpontaneousChatter();
        }
      }
    }, 1500);
  }

  triggerSpontaneousChatter() {
    // Select an autonomous thought different from current
    const available = this.idleChatterBank.filter(t => t !== this.currentDialogue);
    const randomIndex = Math.floor(Math.random() * available.length);
    this.currentDialogue = available[randomIndex] || this.idleChatterBank[0];

    // Non-verbal alert: subtle tiny greeting chime alerting user to new text thought
    this.soundFX.playChatterChirp();

    // Reset idle timer with new randomized 12-20s window
    this.lastInteractionTime = Date.now();
    this.nextIdleChatterDelay = Math.random() * 8000 + 12000;

    // Notify listeners with chatter flag to animate avatar glance
    this.notify({ isSpontaneousChatter: true });
  }

  /**
   * Set mood with optional custom dialogue and duration before returning to IDLE
   */
  setMood(newMood, duration = 4000, customDialogue = null) {
    if (this.currentMood === MOODS.SLEEPING && newMood !== MOODS.IDLE && newMood !== MOODS.SLEEPING) {
      // Must wake up first
      return;
    }

    if (this.moodTimeout) {
      clearTimeout(this.moodTimeout);
      this.moodTimeout = null;
    }

    if (this.snoreInterval) {
      clearInterval(this.snoreInterval);
      this.snoreInterval = null;
    }

    this.previousMood = this.currentMood;
    this.currentMood = newMood;
    this.lastInteractionTime = Date.now();
    this.nextIdleChatterDelay = Math.random() * 7000 + 8000;

    // Select dialogue
    if (customDialogue) {
      this.currentDialogue = customDialogue;
    } else {
      const bank = this.dialogues[newMood] || this.dialogues[MOODS.IDLE];
      const randomIndex = Math.floor(Math.random() * bank.length);
      this.currentDialogue = bank[randomIndex];
    }

    // Handle sleeping ambient sounds
    if (newMood === MOODS.SLEEPING) {
      this.snoreInterval = setInterval(() => {
        if (this.currentMood === MOODS.SLEEPING && Math.random() < 0.4) {
          this.soundFX.playSoftSnore();
        }
      }, 5000);
    }

    this.notify();

    // Auto-revert to idle if temporary mood
    if (duration > 0 && newMood !== MOODS.SLEEPING && newMood !== MOODS.IDLE) {
      this.moodTimeout = setTimeout(() => {
        this.setMood(MOODS.IDLE, 0);
      }, duration);
    }
  }

  /**
   * Action: Pet Hupti
   */
  pet() {
    if (this.currentMood === MOODS.SLEEPING) {
      this.wakeUp("Mmm... waking up to warm gentle forehead kisses... so nice!");
      return;
    }

    this.affection = Math.min(100, this.affection + 6);
    this.pokeCount = Math.max(0, this.pokeCount - 1);
    this.saveState();

    this.soundFX.playPetChime();
    this.setMood(MOODS.HAPPY, 4500);
  }

  /**
   * Action: Hug Hupti (Virtual Embrace)
   */
  hug() {
    if (this.currentMood === MOODS.SLEEPING) {
      this.wakeUp("Mmm... waking up in your cozy warm embrace!");
      return;
    }

    this.affection = Math.min(100, this.affection + 8);
    this.pokeCount = 0;
    this.saveState();

    this.soundFX.playHugSwell();
    this.setMood(MOODS.HUGGED, 4500);
  }

  /**
   * Action: Continuous petting (dragging across forehead)
   */
  continuousPet() {
    if (this.currentMood === MOODS.SLEEPING) {
      this.wakeUp();
      return;
    }
    this.affection = Math.min(100, this.affection + 1);
    this.saveState();
    this.lastInteractionTime = Date.now();
    if (this.currentMood !== MOODS.HAPPY && this.currentMood !== MOODS.HUGGED) {
      this.soundFX.playPurr();
      this.setMood(MOODS.HAPPY, 3500);
    } else {
      // Refresh duration
      if (this.moodTimeout) clearTimeout(this.moodTimeout);
      this.moodTimeout = setTimeout(() => this.setMood(MOODS.IDLE, 0), 3500);
    }
  }

  /**
   * Action: Poke / Tease Hupti
   */
  poke() {
    if (this.currentMood === MOODS.SLEEPING) {
      this.wakeUp("Whoa! Sudden wake up! My heart did a tiny flutter!");
      return;
    }

    this.pokeCount++;
    this.soundFX.playPokeBoop();

    if (this.pokeCount >= 2) {
      this.pokeCount = 0;
      this.affection = Math.max(10, this.affection - 3);
      this.saveState();
      this.setMood(MOODS.POUTED, 4500);
    } else {
      this.setMood(MOODS.SURPRISED, 1800);
    }
  }

  /**
   * Action: Put to Sleep
   */
  putToSleep() {
    if (this.currentMood === MOODS.SLEEPING) return;
    this.soundFX.playSleepLullaby();
    this.setMood(MOODS.SLEEPING, 0);
  }

  /**
   * Action: Wake Up
   */
  wakeUp(customMessage = null) {
    if (this.currentMood !== MOODS.SLEEPING) return;
    this.soundFX.playWakeChirp();
    const wakeMsg = customMessage || "Yaaawn~ Good morning! Hupti is refreshed and ready to play!";
    this.currentMood = MOODS.IDLE;
    this.setMood(MOODS.HAPPY, 3500, wakeMsg);
  }

  /**
   * Action: Scold / Gentle Rebuke
   */
  scold() {
    if (this.currentMood === MOODS.SLEEPING) {
      this.wakeUp("Ouch... woke up to a stern voice... did I do something bad?");
      return;
    }

    this.affection = Math.max(5, this.affection - 12);
    this.pokeCount = 0;
    this.saveState();
    this.soundFX.playSadSigh();
    this.setMood(MOODS.SAD, 5500);
  }

  /**
   * Action: Give Treat / Snack
   */
  giveTreat() {
    if (this.currentMood === MOODS.SLEEPING) {
      this.wakeUp("Ooh! I smelled sweet strawberry treats in my sleep!");
      return;
    }

    this.treatCount++;
    this.affection = Math.min(100, this.affection + 10);
    this.pokeCount = 0;
    this.saveState();
    this.soundFX.playTreatMunch();

    this.setMood(MOODS.EATING, 2600);
    setTimeout(() => {
      if (this.currentMood === MOODS.EATING) {
        this.setMood(MOODS.HAPPY, 4000);
      }
    }, 2600);
  }
}

// Expose globally
window.HuptiState = HuptiState;
window.MOODS = MOODS;
