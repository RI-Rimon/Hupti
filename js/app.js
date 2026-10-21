/**
 * App - Application Coordinator and UI Binder
 * Bootstraps SoundFX, HuptiState, HuptiRenderer, PiPManager, and InputHandler,
 * managing the dialogue typewriter effect, themes, status badges, Pomodoro,
 * ambient soundscapes, and wardrobe customization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize core modules
  const soundFX = new window.SoundFX();
  const huptiState = new window.HuptiState(soundFX);
  const huptiRenderer = new window.HuptiRenderer('huptiContainer', 'particleCanvas');
  const pipManager = new window.PiPManager(huptiState, soundFX, huptiRenderer);
  const inputHandler = new window.InputHandler(huptiState, huptiRenderer, soundFX, pipManager);

  // Immediate Web Audio gesture unlock on first user click/tap/keypress
  const unlockAudio = () => {
    soundFX.init();
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // 2. Cache All Primary DOM Elements
  const dialogueText = document.getElementById('dialogueText');
  const moodBadge = document.getElementById('moodBadge');
  const affectionFill = document.getElementById('affectionFill');
  const affectionText = document.getElementById('affectionText');
  const btnSleepWake = document.getElementById('btnSleepWake');
  const btnSleepIcon = document.getElementById('btnSleepIcon');
  const btnSleepLabel = document.getElementById('btnSleepLabel');
  const btnSleepKey = document.getElementById('btnSleepKey');
  const btnMuteToggle = document.getElementById('btnMuteToggle');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const btnPiPToggle = document.getElementById('btnPiPToggle');
  const btnHelp = document.getElementById('btnHelp');
  const helpModal = document.getElementById('helpModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const controlsContainer = document.getElementById('controlsContainer');
  const treatsCounter = document.getElementById('treatsCounter');

  // Feedback Modal Elements
  const btnOpenFeedback = document.getElementById('btnOpenFeedback');
  const feedbackModal = document.getElementById('feedbackModal');
  const btnCloseFeedback = document.getElementById('btnCloseFeedback');
  const btnFeedbackDone = document.getElementById('btnFeedbackDone');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackSuccessState = document.getElementById('feedbackSuccessState');
  const starButtons = document.querySelectorAll('.star-btn');
  const ratingInput = document.getElementById('ratingInput');
  const starRatingLabel = document.getElementById('starRatingLabel');
  const feedbackEmail = document.getElementById('feedbackEmail');
  const feedbackMessage = document.getElementById('feedbackMessage');
  const btnSubmitFeedback = document.getElementById('btnSubmitFeedback');
  const submitBtnText = document.getElementById('submitBtnText');

  // Pomodoro Modal Elements
  const pomodoroModal = document.getElementById('pomodoroModal');
  const btnPomodoroToggle = document.getElementById('btnPomodoroToggle');
  const btnClosePomodoro = document.getElementById('btnClosePomodoro');
  const pomodoroPill = document.getElementById('pomodoroPill');
  const pomodoroPillTime = document.getElementById('pomodoroPillTime');
  const pomodoroPillMode = document.getElementById('pomodoroPillMode');
  const pomoMinutes = document.getElementById('pomoMinutes');
  const pomoSeconds = document.getElementById('pomoSeconds');
  const pomodoroStatusLabel = document.getElementById('pomodoroStatusLabel');
  const btnPomoStartPause = document.getElementById('btnPomoStartPause');
  const pomoStartIcon = document.getElementById('pomoStartIcon');
  const pomoStartText = document.getElementById('pomoStartText');
  const btnPomoReset = document.getElementById('btnPomoReset');
  const btnPomoSkip = document.getElementById('btnPomoSkip');
  const btnModeFocus = document.getElementById('btnModeFocus');
  const btnModeBreak = document.getElementById('btnModeBreak');
  const pomoCompletedCount = document.getElementById('pomoCompletedCount');
  const checkPomoTest = document.getElementById('checkPomoTest');

  // Ambient Soundscapes Modal Elements
  const ambientModal = document.getElementById('ambientModal');
  const btnAmbientToggle = document.getElementById('btnAmbientToggle');
  const btnCloseAmbient = document.getElementById('btnCloseAmbient');
  const ambientOptions = document.querySelectorAll('.ambient-option');
  const ambientVolumeSlider = document.getElementById('ambientVolumeSlider');
  const ambientVolumeLabel = document.getElementById('ambientVolumeLabel');
  const btnAmbientTogglePlay = document.getElementById('btnAmbientTogglePlay');
  const ambientPlayIcon = document.getElementById('ambientPlayIcon');
  const ambientPlayText = document.getElementById('ambientPlayText');

  // Wardrobe & Themes Modal Elements
  const wardrobeModal = document.getElementById('wardrobeModal');
  const btnWardrobeToggle = document.getElementById('btnWardrobeToggle');
  const btnCloseWardrobe = document.getElementById('btnCloseWardrobe');
  const wardrobeItems = document.querySelectorAll('.wardrobe-item');
  const checkWardrobeGlasses = document.getElementById('checkWardrobeGlasses');
  const tintSwatches = document.querySelectorAll('.tint-swatch');

  let typeWriterTimeout = null;
  let selectedAmbientType = 'rain';

  // 3. Dialogue Typing Animation
  const typeDialogue = (text) => {
    if (!dialogueText) return;
    if (typeWriterTimeout) clearTimeout(typeWriterTimeout);

    dialogueText.classList.add('fading');
    dialogueText.textContent = '';

    let i = 0;
    const speed = 20; // ms per character

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

  // 4. Mood metadata dictionary
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

  // 5. Pomodoro UI Updater
  const updatePomodoroUI = (pomodoro) => {
    if (!pomodoro) return;
    const mins = Math.floor(pomodoro.timeLeft / 60);
    const secs = pomodoro.timeLeft % 60;
    const minsStr = String(mins).padStart(2, '0');
    const secsStr = String(secs).padStart(2, '0');
    const timeStr = `${minsStr}:${secsStr}`;

    if (pomoMinutes) pomoMinutes.textContent = minsStr;
    if (pomoSeconds) pomoSeconds.textContent = secsStr;

    // Header Pill
    if (pomodoroPill) {
      pomodoroPill.style.display = pomodoro.isActive ? 'inline-flex' : 'none';
    }
    if (pomodoroPillTime) pomodoroPillTime.textContent = timeStr;
    if (pomodoroPillMode) pomodoroPillMode.textContent = pomodoro.mode === 'focus' ? 'Focus' : 'Break';

    // Tabs
    if (btnModeFocus) btnModeFocus.classList.toggle('active', pomodoro.mode === 'focus');
    if (btnModeBreak) btnModeBreak.classList.toggle('active', pomodoro.mode === 'break');

    // Start/Pause Button
    if (pomoStartIcon && pomoStartText) {
      if (pomodoro.isRunning) {
        pomoStartIcon.textContent = '⏸️';
        pomoStartText.textContent = 'Pause';
      } else {
        pomoStartIcon.textContent = '▶️';
        pomoStartText.textContent = pomodoro.mode === 'focus' ? 'Start Focus' : 'Start Break';
      }
    }

    // Status message
    if (pomodoroStatusLabel) {
      if (pomodoro.isRunning) {
        pomodoroStatusLabel.textContent = pomodoro.mode === 'focus'
          ? 'Studying together! Full focus mode 💡'
          : 'Rest break! Drink water, stretch, and relax ☕';
      } else {
        pomodoroStatusLabel.textContent = 'Ready for your next study sprint!';
      }
    }

    // Sessions count
    if (pomoCompletedCount) {
      pomoCompletedCount.textContent = `⭐️ ${pomodoro.sessionsCompleted}`;
    }

    // Test mode checkbox
    if (checkPomoTest) {
      checkPomoTest.checked = !!pomodoro.testMode;
    }
  };

  // 6. Wardrobe UI Updater
  const syncWardrobeUI = (customization) => {
    if (!customization) return;

    // Sync active accessory item
    wardrobeItems.forEach(item => {
      const acc = item.getAttribute('data-accessory');
      item.classList.toggle('active', acc === customization.accessory);
    });

    // Sync glasses checkbox
    if (checkWardrobeGlasses) {
      checkWardrobeGlasses.checked = !!customization.glasses;
    }

    // Sync active tint swatch
    tintSwatches.forEach(swatch => {
      const tint = swatch.getAttribute('data-tint');
      swatch.classList.toggle('active', tint === customization.tint);
    });
  };

  // 7. Ambient Play Button UI Updater
  const updateAmbientPlayBtnUI = () => {
    const isPlaying = soundFX.isAmbientPlaying();
    if (btnAmbientTogglePlay) {
      btnAmbientTogglePlay.classList.toggle('playing', isPlaying);
    }
    if (ambientPlayIcon) {
      ambientPlayIcon.textContent = isPlaying ? '⏹️' : '▶️';
    }
    if (ambientPlayText) {
      ambientPlayText.textContent = isPlaying ? 'Stop Soundscape' : 'Play Soundscape';
    }
    if (btnAmbientToggle) {
      btnAmbientToggle.classList.toggle('pip-active', isPlaying);
    }
  };

  // 8. Rating UI Updater
  const ratingDescriptions = {
    1: '1 Star — Needs work',
    2: '2 Stars — Cute',
    3: '3 Stars — Really sweet!',
    4: '4 Stars — Love Hupti!',
    5: '5 Stars — Absolutely adore Hupti! 💖'
  };
  let currentRating = 5;

  const updateStarVisuals = (rating) => {
    starButtons.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-value'), 10);
      if (val <= rating) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    if (starRatingLabel) {
      starRatingLabel.textContent = ratingDescriptions[rating] || `${rating} Stars`;
    }
  };

  // =========================================================================
  // 9. Central State Change Listener
  // =========================================================================
  huptiState.subscribe((state) => {
    try {
      // A. Apply renderer visual changes
      huptiRenderer.applyMood(state.mood);

      // If spontaneous idle chatter, give a cute head tilt
      if (state.isSpontaneousChatter) {
        huptiRenderer.spontaneousChatterGlance();
      }

      // B. Dialogue text update
      typeDialogue(state.dialogue);

      // C. Mood badge update
      const info = moodDetails[state.mood] || moodDetails[MOODS.IDLE];
      if (moodBadge) {
        moodBadge.innerHTML = `<span class="mood-icon">${info.icon}</span> ${info.label}`;
        moodBadge.className = `status-pill ${info.class}`;
      }

      // D. Affection bar & counter
      if (affectionFill) {
        affectionFill.style.width = `${state.affection}%`;
      }
      if (affectionText) {
        affectionText.textContent = `${state.affection}%`;
      }
      if (treatsCounter) {
        treatsCounter.textContent = state.treatCount;
      }

      // E. Sleep / Wake controls toggle
      if (state.isSleeping) {
        document.body.classList.add('hupti-sleeping-mode');
        if (btnSleepIcon) btnSleepIcon.textContent = '☀️';
        if (btnSleepLabel) btnSleepLabel.textContent = 'Wake Up';
        if (btnSleepKey) btnSleepKey.textContent = 'W';

        if (controlsContainer) {
          controlsContainer.classList.add('sleeping-dim');
        }
      } else {
        document.body.classList.remove('hupti-sleeping-mode');
        if (btnSleepIcon) btnSleepIcon.textContent = '💤';
        if (btnSleepLabel) btnSleepLabel.textContent = 'Sleep';
        if (btnSleepKey) btnSleepKey.textContent = 'S';

        if (controlsContainer) {
          controlsContainer.classList.remove('sleeping-dim');
        }
      }

      // F. Sync Picture-in-Picture floating window if active
      if (pipManager && pipManager.isActive()) {
        pipManager.syncPiPState(state);
      }

      // G. Sync Customization (Accessory, Glasses, Tint)
      if (state.customization) {
        huptiRenderer.applyAccessory(state.customization.accessory);
        huptiRenderer.setGlasses(state.customization.glasses);
        huptiRenderer.applyTint(state.customization.tint);
        syncWardrobeUI(state.customization);
      }

      // H. Sync Pomodoro Study Companion
      if (state.pomodoro) {
        updatePomodoroUI(state.pomodoro);
      }
    } catch (err) {
      console.warn('Error in state subscriber:', err);
    }
  });

  // =========================================================================
  // 10. Header Action Utilities
  // =========================================================================

  // Audio mute toggle button
  if (btnMuteToggle) {
    btnMuteToggle.addEventListener('click', () => {
      const isMuted = soundFX.toggleMute();
      btnMuteToggle.setAttribute('aria-pressed', isMuted);
      btnMuteToggle.innerHTML = isMuted
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
      btnMuteToggle.title = isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)';
    });
  }

  // Theme Day / Night toggle
  if (btnThemeToggle) {
    let isDark = false;
    btnThemeToggle.addEventListener('click', () => {
      isDark = !isDark;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      btnThemeToggle.innerHTML = isDark
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      btnThemeToggle.title = isDark ? 'Switch to Pastel Day Theme' : 'Switch to Cozy Night Theme';
    });
  }

  // Picture-in-Picture Floating Window Toggle
  if (btnPiPToggle) {
    btnPiPToggle.addEventListener('click', () => {
      soundFX.playClick();
      pipManager.toggle();
    });
  }

  // Info & Keyboard Help Modal Toggle
  if (btnHelp && helpModal) {
    btnHelp.addEventListener('click', () => {
      helpModal.classList.add('active');
    });
  }
  if (btnCloseModal && helpModal) {
    btnCloseModal.addEventListener('click', () => {
      helpModal.classList.remove('active');
    });
  }
  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        helpModal.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // 11. Feedback Modal Logic
  // =========================================================================
  starButtons.forEach(btn => {
    const val = parseInt(btn.getAttribute('data-value'), 10);

    btn.addEventListener('mouseenter', () => {
      starButtons.forEach(b => {
        const bVal = parseInt(b.getAttribute('data-value'), 10);
        if (bVal <= val) {
          b.classList.add('hovered');
        } else {
          b.classList.remove('hovered');
        }
      });
      if (starRatingLabel) {
        starRatingLabel.textContent = ratingDescriptions[val];
      }
    });

    btn.addEventListener('mouseleave', () => {
      starButtons.forEach(b => b.classList.remove('hovered'));
      updateStarVisuals(currentRating);
    });

    btn.addEventListener('click', () => {
      currentRating = val;
      if (ratingInput) ratingInput.value = currentRating;
      updateStarVisuals(currentRating);
      soundFX.playClick();
    });
  });

  const openFeedback = () => {
    if (feedbackModal) feedbackModal.classList.add('active');
  };
  const closeFeedback = () => {
    if (feedbackModal) feedbackModal.classList.remove('active');
  };

  if (btnOpenFeedback) btnOpenFeedback.addEventListener('click', openFeedback);
  if (btnCloseFeedback) btnCloseFeedback.addEventListener('click', closeFeedback);
  if (btnFeedbackDone) btnFeedbackDone.addEventListener('click', closeFeedback);
  if (feedbackModal) {
    feedbackModal.addEventListener('click', (e) => {
      if (e.target === feedbackModal) closeFeedback();
    });
  }

  // Handle Feedback Form Submission
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailVal = feedbackEmail ? feedbackEmail.value.trim() : '';
      const msgVal = feedbackMessage ? feedbackMessage.value.trim() : '';

      if (!emailVal || !msgVal) return;

      if (btnSubmitFeedback) {
        btnSubmitFeedback.disabled = true;
      }
      if (submitBtnText) {
        submitBtnText.textContent = 'Sending love... 💌';
      }

      const payload = {
        email: emailVal,
        rating: `${currentRating} / 5 Stars (${ratingDescriptions[currentRating]})`,
        message: msgVal,
        submittedAt: new Date().toISOString()
      };

      try {
        fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});

        const dest = atob('cmVkd2FuLnJpbW9uMjIxQGdtYWlsLmNvbQ==');
        fetch(`https://formsubmit.co/ajax/${dest}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (err) {
        console.warn('Feedback dispatch attempt:', err);
      }

      setTimeout(() => {
        if (feedbackForm) feedbackForm.style.display = 'none';
        if (feedbackSuccessState) feedbackSuccessState.style.display = 'flex';

        soundFX.playHugSwell();
        huptiState.setMood(MOODS.HUGGED, 4500, "Thank you for your feedback! Hupti is sending you lots of love! 💖");
      }, 500);
    });
  }

  // =========================================================================
  // 12. Pomodoro Study Companion Event Listeners
  // =========================================================================
  const openPomodoro = () => {
    if (pomodoroModal) pomodoroModal.classList.add('active');
  };
  const closePomodoro = () => {
    if (pomodoroModal) pomodoroModal.classList.remove('active');
  };

  if (btnPomodoroToggle) btnPomodoroToggle.addEventListener('click', openPomodoro);
  if (pomodoroPill) pomodoroPill.addEventListener('click', openPomodoro);
  if (btnClosePomodoro) btnClosePomodoro.addEventListener('click', closePomodoro);
  if (pomodoroModal) {
    pomodoroModal.addEventListener('click', (e) => {
      if (e.target === pomodoroModal) closePomodoro();
    });
  }

  if (btnPomoStartPause) {
    btnPomoStartPause.addEventListener('click', () => {
      soundFX.playClick();
      const snap = huptiState.getStateSnapshot();
      if (snap.pomodoro.isRunning) {
        huptiState.pausePomodoro();
      } else {
        huptiState.startPomodoro();
      }
    });
  }

  if (btnPomoReset) {
    btnPomoReset.addEventListener('click', () => {
      soundFX.playClick();
      huptiState.resetPomodoro();
    });
  }

  if (btnPomoSkip) {
    btnPomoSkip.addEventListener('click', () => {
      soundFX.playClick();
      huptiState.skipPomodoro();
    });
  }

  if (btnModeFocus) {
    btnModeFocus.addEventListener('click', () => {
      soundFX.playClick();
      huptiState.resetPomodoro();
    });
  }

  if (btnModeBreak) {
    btnModeBreak.addEventListener('click', () => {
      soundFX.playClick();
      huptiState.skipPomodoro();
    });
  }

  if (checkPomoTest) {
    checkPomoTest.addEventListener('change', () => {
      soundFX.playClick();
      huptiState.togglePomodoroTestMode();
    });
  }

  // =========================================================================
  // 13. Ambient Soundscapes Event Listeners
  // =========================================================================
  const openAmbient = () => {
    if (ambientModal) ambientModal.classList.add('active');
  };
  const closeAmbient = () => {
    if (ambientModal) ambientModal.classList.remove('active');
  };

  if (btnAmbientToggle) btnAmbientToggle.addEventListener('click', openAmbient);
  if (btnCloseAmbient) btnCloseAmbient.addEventListener('click', closeAmbient);
  if (ambientModal) {
    ambientModal.addEventListener('click', (e) => {
      if (e.target === ambientModal) closeAmbient();
    });
  }

  ambientOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      ambientOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedAmbientType = opt.getAttribute('data-ambient');
      soundFX.playClick();

      if (soundFX.isAmbientPlaying()) {
        soundFX.startAmbient(selectedAmbientType);
        updateAmbientPlayBtnUI();
      }
    });
  });

  if (ambientVolumeSlider) {
    ambientVolumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      soundFX.setAmbientVolume(val / 100);
      if (ambientVolumeLabel) ambientVolumeLabel.textContent = `${val}%`;
    });
  }

  if (btnAmbientTogglePlay) {
    btnAmbientTogglePlay.addEventListener('click', () => {
      soundFX.playClick();
      if (soundFX.isAmbientPlaying()) {
        soundFX.stopAmbient();
      } else {
        soundFX.startAmbient(selectedAmbientType);
      }
      updateAmbientPlayBtnUI();
    });
  }

  // =========================================================================
  // 14. Wardrobe & Custom Themes Event Listeners
  // =========================================================================
  const openWardrobe = () => {
    if (wardrobeModal) wardrobeModal.classList.add('active');
  };
  const closeWardrobe = () => {
    if (wardrobeModal) wardrobeModal.classList.remove('active');
  };

  if (btnWardrobeToggle) btnWardrobeToggle.addEventListener('click', openWardrobe);
  if (btnCloseWardrobe) btnCloseWardrobe.addEventListener('click', closeWardrobe);
  if (wardrobeModal) {
    wardrobeModal.addEventListener('click', (e) => {
      if (e.target === wardrobeModal) closeWardrobe();
    });
  }

  wardrobeItems.forEach(item => {
    item.addEventListener('click', () => {
      const acc = item.getAttribute('data-accessory');
      huptiState.setAccessory(acc);
    });
  });

  if (checkWardrobeGlasses) {
    checkWardrobeGlasses.addEventListener('change', (e) => {
      huptiState.toggleGlasses(e.target.checked);
    });
  }

  tintSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const tint = swatch.getAttribute('data-tint');
      huptiState.setTint(tint);
    });
  });
});
