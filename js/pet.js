/**
 * Pet - Hupti Avatar Controller & Emotional Lifecycle
 * Coordinates typewriter thoughts, mood animations, affectionate reactions,
 * returning visitor greetings, and ambient music grooving.
 */

import { openModal, closeModal } from './modals.js';

const USER_NAME_STORAGE_KEY = 'hupti_user_name';
const INACTIVITY_TIMEOUT_MS = 3.5 * 60 * 1000; // 3.5 minutes

/**
 * Initialize Hupti Pet Lifecycle, Subtitles, and State Sync
 * @param {Object} options
 * @param {Object} options.huptiState
 * @param {Object} options.huptiRenderer
 * @param {Object} options.soundFX
 * @param {Object} options.pipManager
 */
export function initPet({ huptiState, huptiRenderer, soundFX, pipManager }) {
  const MOODS = window.MOODS || {
    IDLE: 'idle',
    HAPPY: 'happy',
    HUGGED: 'hugged',
    POUTED: 'pouted',
    SAD: 'sad',
    SLEEPING: 'sleeping',
    EATING: 'eating',
    SURPRISED: 'surprised'
  };

  const dialogueText = document.getElementById('dialogueText');
  const moodBadge = document.getElementById('moodBadge');
  const affectionFill = document.getElementById('affectionFill');
  const affectionText = document.getElementById('affectionText');
  const treatsCounter = document.getElementById('treatsCounter');
  const btnSleepWake = document.getElementById('btnSleepWake');
  const btnSleepIcon = document.getElementById('btnSleepIcon');
  const btnSleepLabel = document.getElementById('btnSleepLabel');
  const btnSleepKey = document.getElementById('btnSleepKey');
  const controlsContainer = document.getElementById('controlsContainer');

  // Welcome modal elements
  const welcomeModal = document.getElementById('welcomeModal');
  const welcomeNameForm = document.getElementById('welcomeNameForm');
  const userNameInput = document.getElementById('userNameInput');
  const btnSubmitName = document.getElementById('btnSubmitName');
  const currentUserNameDisplay = document.getElementById('currentUserNameDisplay');
  const btnChangeName = document.getElementById('btnChangeName');

  let typeWriterTimeout = null;
  let grooveResumeTimeout = null;
  let inactivityTimer = null;
  let isAutoSleeping = false;
  let lastTabLeaveTime = Date.now();

  const moodDetails = {
    [MOODS.IDLE]: { label: 'Curious & Relaxed', icon: '✨', class: 'mood-idle' },
    [MOODS.HAPPY]: { label: 'Loved & Cheerful', icon: '💖', class: 'mood-happy' },
    [MOODS.HUGGED]: { label: 'Warm Cozy Hug', icon: '🤗', class: 'mood-hugged' },
    [MOODS.POUTED]: { label: 'A Bit Sassy', icon: '😤', class: 'mood-pouted' },
    [MOODS.SAD]: { label: 'Needs Gentle Hugs', icon: '🥺', class: 'mood-sad' },
    [MOODS.SLEEPING]: { label: 'Dreaming Sweetly', icon: '💤', class: 'mood-sleeping' },
    [MOODS.EATING]: { label: 'Snack Paradise', icon: '🍬', class: 'mood-eating' },
    [MOODS.SURPRISED]: { label: 'Startled Boop!', icon: '👀', class: 'mood-surprised' }
  };

  // Dialogue Typing Animation
  const typeDialogue = (text) => {
    if (!dialogueText) return;
    if (typeWriterTimeout) clearTimeout(typeWriterTimeout);

    dialogueText.classList.add('fading');
    dialogueText.textContent = '';

    let i = 0;
    const speed = 20;

    const typeNext = () => {
      if (i < text.length) {
        dialogueText.textContent += text.charAt(i);
        i++;
        typeWriterTimeout = setTimeout(typeNext, speed);
      } else {
        dialogueText.classList.remove('fading');
      }
    };

    setTimeout(typeNext, 80);
  };

  // Music Grooving & Vibing Animation Controller
  const updateGroovingState = () => {
    const isPlaying = soundFX && soundFX.isAmbientPlaying && soundFX.isAmbientPlaying();
    const isSleeping = huptiState.isSleeping || huptiState.currentMood === MOODS.SLEEPING;

    if (isPlaying && !isSleeping && huptiState.currentMood === MOODS.IDLE) {
      document.body.classList.add('hupti-grooving-mode');
      if (huptiRenderer) huptiRenderer.setGrooving(true);
    } else {
      document.body.classList.remove('hupti-grooving-mode');
      if (huptiRenderer) huptiRenderer.setGrooving(false);
    }
  };

  const interruptGroove = (duration = 2200) => {
    if (grooveResumeTimeout) clearTimeout(grooveResumeTimeout);
    document.body.classList.remove('hupti-grooving-mode');
    if (huptiRenderer) huptiRenderer.setGrooving(false);

    grooveResumeTimeout = setTimeout(() => {
      updateGroovingState();
    }, duration);
  };

  // Central State Subscription
  huptiState.subscribe((state) => {
    try {
      if (huptiRenderer) {
        huptiRenderer.applyMood(state.mood);
        if (state.isSpontaneousChatter) {
          huptiRenderer.spontaneousChatterGlance();
        }
      }

      typeDialogue(state.dialogue);

      const info = moodDetails[state.mood] || moodDetails[MOODS.IDLE];
      if (moodBadge && info) {
        moodBadge.innerHTML = `<span class="mood-icon">${info.icon}</span> ${info.label}`;
        moodBadge.className = `status-pill ${info.class}`;
      }

      if (affectionFill) affectionFill.style.width = `${state.affection}%`;
      if (affectionText) affectionText.textContent = `${state.affection}%`;
      if (treatsCounter) treatsCounter.textContent = state.treatCount;

      // Sleep / Wake controls toggle
      if (state.isSleeping) {
        document.body.classList.add('hupti-sleeping-mode');
        if (btnSleepIcon) btnSleepIcon.textContent = '☀️';
        if (btnSleepLabel) btnSleepLabel.textContent = 'Wake Up';
        if (btnSleepKey) btnSleepKey.textContent = 'W';
        if (controlsContainer) controlsContainer.classList.add('sleeping-dim');
      } else {
        document.body.classList.remove('hupti-sleeping-mode');
        if (btnSleepIcon) btnSleepIcon.textContent = '💤';
        if (btnSleepLabel) btnSleepLabel.textContent = 'Sleep';
        if (btnSleepKey) btnSleepKey.textContent = 'Z';
        if (controlsContainer) controlsContainer.classList.remove('sleeping-dim');
      }

      // Sync Picture-in-Picture window if active
      if (pipManager && pipManager.isActive()) {
        pipManager.syncPiPState(state);
      }

      // Grooving sync
      if (state.isSleeping) {
        document.body.classList.remove('hupti-grooving-mode');
        if (huptiRenderer) huptiRenderer.setGrooving(false);
      } else if (state.mood === MOODS.IDLE) {
        updateGroovingState();
      } else {
        interruptGroove(2200);
      }
    } catch (err) {
      console.warn('Error in state subscriber:', err);
    }
  });

  // Welcome & Returning Visitor Greeting
  const initUserGreeting = () => {
    const savedName = localStorage.getItem(USER_NAME_STORAGE_KEY);

    if (savedName) {
      if (currentUserNameDisplay) {
        currentUserNameDisplay.textContent = savedName;
      }
      setTimeout(() => {
        if (huptiRenderer) {
          if (typeof huptiRenderer.triggerBlush === 'function') huptiRenderer.triggerBlush(4000);
          if (typeof huptiRenderer.blink === 'function') huptiRenderer.blink();
        }
        huptiState.setMood(
          MOODS.HAPPY,
          8000,
          `Welcome back, ${savedName}! Ready to focus together today? 💖`
        );
      }, 300);
    } else {
      // First visit: open onboarding modal
      openModal('welcomeModal', null);
      setTimeout(() => {
        if (userNameInput) userNameInput.focus();
      }, 250);
    }
  };

  const handleNameSubmission = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const raw = userNameInput ? userNameInput.value.trim() : '';
    const name = raw || 'Friend';

    localStorage.setItem(USER_NAME_STORAGE_KEY, name);

    if (currentUserNameDisplay) {
      currentUserNameDisplay.textContent = name;
    }

    closeModal('welcomeModal');

    if (soundFX) {
      soundFX.init();
      soundFX.playHappyChirp();
    }
    if (huptiRenderer) {
      if (typeof huptiRenderer.triggerBlush === 'function') huptiRenderer.triggerBlush(4000);
      if (typeof huptiRenderer.spawnHeartsBurst === 'function') huptiRenderer.spawnHeartsBurst(8);
    }

    huptiState.setMood(
      MOODS.HAPPY,
      8500,
      `Hey ${name}, so happy to meet you! I am your virtual pet, Hupti 🌸`
    );
  };

  if (welcomeNameForm) welcomeNameForm.addEventListener('submit', handleNameSubmission);
  if (btnSubmitName) {
    btnSubmitName.addEventListener('click', (e) => {
      if (welcomeNameForm && !welcomeNameForm.checkValidity()) return;
      handleNameSubmission(e);
    });
  }

  if (btnChangeName) {
    btnChangeName.addEventListener('click', () => {
      if (soundFX) soundFX.playClick();
      closeModal('helpModal');

      const existingName = localStorage.getItem(USER_NAME_STORAGE_KEY) || '';
      if (userNameInput) userNameInput.value = existingName;

      openModal('welcomeModal', btnChangeName);
      setTimeout(() => {
        if (userNameInput) userNameInput.focus();
      }, 200);
    });
  }

  // Returning to tab greeting
  const handleReturnToTab = () => {
    const awayDuration = Date.now() - lastTabLeaveTime;
    const savedName = localStorage.getItem(USER_NAME_STORAGE_KEY);
    if (savedName && awayDuration > 15000) {
      const isSleeping = huptiState.isSleeping || huptiState.currentMood === MOODS.SLEEPING;
      if (!isSleeping) {
        lastTabLeaveTime = Date.now();
        if (huptiRenderer) {
          if (typeof huptiRenderer.triggerBlush === 'function') huptiRenderer.triggerBlush(3500);
          if (typeof huptiRenderer.blink === 'function') huptiRenderer.blink();
        }
        if (soundFX) soundFX.playHappyChirp();

        const returnGreetings = [
          `Welcome back, ${savedName}! Ready to focus together today? 💖`,
          `Yay, you're back, ${savedName}! Missed you~ 🌸`,
          `Welcome back, ${savedName}! Let's keep making progress! ✨`
        ];
        const greeting = returnGreetings[Math.floor(Math.random() * returnGreetings.length)];
        huptiState.setMood(MOODS.HAPPY, 7500, greeting);
      }
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      lastTabLeaveTime = Date.now();
    } else if (document.visibilityState === 'visible') {
      handleReturnToTab();
    }
  });

  window.addEventListener('focus', () => {
    handleReturnToTab();
  });

  // Inactivity Sleep Controller (3.5 minutes)
  const wakeFromAutoSleep = () => {
    if (isAutoSleeping && huptiState.currentMood === MOODS.SLEEPING) {
      isAutoSleeping = false;
      const savedName = localStorage.getItem(USER_NAME_STORAGE_KEY);
      const wakeLine = savedName
        ? `Yaaawn~ Hupti is awake! So happy to see you back, ${savedName} 💖`
        : "Yaaawn~ Hupti is awake! So happy to see you back~ 💖";
      huptiState.wakeUp(wakeLine);
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);

    if (isAutoSleeping) {
      wakeFromAutoSleep();
    }

    inactivityTimer = setTimeout(() => {
      const isSleeping = huptiState.isSleeping || huptiState.currentMood === MOODS.SLEEPING;
      const isMusicPlaying = soundFX && soundFX.isAmbientPlaying && soundFX.isAmbientPlaying();

      if (!isSleeping && !isMusicPlaying) {
        isAutoSleeping = true;
        if (soundFX) soundFX.playSleepLullaby();
        huptiState.setMood(
          MOODS.SLEEPING,
          0,
          "Hupti drifted off to sleep while you were away... zzz"
        );
      }
    }, INACTIVITY_TIMEOUT_MS);
  };

  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach((evt) => {
    window.addEventListener(evt, resetInactivityTimer, { passive: true });
  });

  resetInactivityTimer();

  if (btnSleepWake) {
    btnSleepWake.addEventListener('click', () => {
      isAutoSleeping = false;
    });
  }

  initUserGreeting();

  return {
    updateGroovingState,
    interruptGroove
  };
}
