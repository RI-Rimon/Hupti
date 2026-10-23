/**
 * Main - Application Coordinator & Entry Point
 * Orchestrates modular architecture: Pet lifecycle, Modals, Taskbox,
 * Web3Forms Feedback, Pomodoro study engine, and Ambient soundscapes.
 */

import { initModals, openModal, closeModal } from './modals.js';
import { initFeedback } from './feedback.js';
import { initTaskbox } from './taskbox.js';
import { initPet } from './pet.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Engines
  const soundFX = new window.SoundFX();
  const huptiState = new window.HuptiState(soundFX);
  const huptiRenderer = new window.HuptiRenderer('huptiContainer', 'particleCanvas');
  const pipManager = new window.PiPManager(huptiState, soundFX, huptiRenderer);
  const inputHandler = new window.InputHandler(huptiState, huptiRenderer, soundFX, pipManager);

  // Immediate Web Audio gesture unlock on first user interaction
  const unlockAudio = () => {
    soundFX.init();
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // 2. Initialize Subsystems
  initModals();
  initFeedback({ soundFX, huptiState });
  initTaskbox({ soundFX, huptiState });
  const petController = initPet({ huptiState, huptiRenderer, soundFX, pipManager });

  // 3. Header Action Buttons & Utility Controls
  const btnMuteToggle = document.getElementById('btnMuteToggle');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const btnPiPToggle = document.getElementById('btnPiPToggle');
  const btnHelp = document.getElementById('btnHelp');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const toggleShortcutsCheckbox = document.getElementById('toggleShortcutsCheckbox');
  const shortcutsStatusText = document.getElementById('shortcutsStatusText');

  // Mute / Unmute Button
  if (btnMuteToggle) {
    btnMuteToggle.addEventListener('click', () => {
      const isMuted = soundFX.toggleMute();
      btnMuteToggle.setAttribute('aria-pressed', isMuted);
      btnMuteToggle.innerHTML = isMuted
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
      btnMuteToggle.title = isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)';
      btnMuteToggle.setAttribute('aria-label', btnMuteToggle.title);
    });
  }

  // Theme Day / Night Toggle
  const applyThemeMode = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (btnThemeToggle) {
      const isDark = (theme === 'dark');
      btnThemeToggle.innerHTML = isDark
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      btnThemeToggle.title = isDark ? 'Switch to Pastel Day Theme' : 'Switch to Cozy Night Theme';
      btnThemeToggle.setAttribute('aria-label', btnThemeToggle.title);
    }
  };

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      soundFX.playClick();
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = (current === 'dark') ? 'light' : 'dark';
      sessionStorage.setItem('hupti_theme_override', next);
      applyThemeMode(next);
    });
  }

  // PiP Floating Companion Toggle
  if (btnPiPToggle) {
    btnPiPToggle.addEventListener('click', () => {
      soundFX.playClick();
      pipManager.toggle();
    });
  }

  // Help Modal & Keyboard Shortcuts On/Off Toggle
  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      openModal('helpModal', btnHelp);
    });
  }
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      closeModal('helpModal');
    });
  }

  // Keyboard Shortcuts Toggle Initialization
  if (toggleShortcutsCheckbox) {
    const isShortcutsEnabled = localStorage.getItem('hupti_shortcuts_enabled') !== 'false';
    toggleShortcutsCheckbox.checked = isShortcutsEnabled;
    if (shortcutsStatusText) shortcutsStatusText.textContent = isShortcutsEnabled ? 'On' : 'Off';

    toggleShortcutsCheckbox.addEventListener('change', () => {
      soundFX.playClick();
      const enabled = toggleShortcutsCheckbox.checked;
      localStorage.setItem('hupti_shortcuts_enabled', enabled ? 'true' : 'false');
      if (shortcutsStatusText) shortcutsStatusText.textContent = enabled ? 'On' : 'Off';
    });
  }

  // 4. Pomodoro Study Companion
  const btnPomodoroToggle = document.getElementById('btnPomodoroToggle');
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
  const btnClosePomodoro = document.getElementById('btnClosePomodoro');

  const updatePomodoroUI = (pomodoro) => {
    if (!pomodoro) return;
    const mins = Math.floor(pomodoro.timeLeft / 60);
    const secs = pomodoro.timeLeft % 60;
    const minsStr = String(mins).padStart(2, '0');
    const secsStr = String(secs).padStart(2, '0');
    const timeStr = `${minsStr}:${secsStr}`;

    if (pomoMinutes) pomoMinutes.textContent = minsStr;
    if (pomoSeconds) pomoSeconds.textContent = secsStr;

    if (pomodoroPill) {
      pomodoroPill.style.display = pomodoro.isActive ? 'inline-flex' : 'none';
    }
    if (pomodoroPillTime) pomodoroPillTime.textContent = timeStr;
    if (pomodoroPillMode) pomodoroPillMode.textContent = pomodoro.mode === 'focus' ? 'Focus' : 'Break';

    if (btnModeFocus) btnModeFocus.classList.toggle('active', pomodoro.mode === 'focus');
    if (btnModeBreak) btnModeBreak.classList.toggle('active', pomodoro.mode === 'break');

    if (pomoStartIcon && pomoStartText) {
      if (pomodoro.isRunning) {
        pomoStartIcon.textContent = '⏸️';
        pomoStartText.textContent = 'Pause';
      } else {
        pomoStartIcon.textContent = '▶️';
        pomoStartText.textContent = pomodoro.mode === 'focus' ? 'Start Focus' : 'Start Break';
      }
    }

    if (pomodoroStatusLabel) {
      if (pomodoro.isRunning) {
        pomodoroStatusLabel.textContent = pomodoro.mode === 'focus'
          ? 'Studying together! Full focus mode 💡'
          : 'Rest break! Drink water, stretch, and relax ☕';
      } else {
        pomodoroStatusLabel.textContent = 'Ready for your next study sprint!';
      }
    }

    if (pomoCompletedCount) {
      pomoCompletedCount.textContent = `⭐️ ${pomodoro.sessionsCompleted}`;
    }

    if (checkPomoTest) {
      checkPomoTest.checked = !!pomodoro.testMode;
    }
  };

  let prevSessionsCompleted = huptiState.getStateSnapshot().pomodoro?.sessionsCompleted || 0;

  huptiState.subscribe((state) => {
    if (state.pomodoro) {
      updatePomodoroUI(state.pomodoro);

      // Trigger celebratory animation (blush + hearts burst) when focus session completes
      if (state.pomodoro.sessionsCompleted > prevSessionsCompleted) {
        prevSessionsCompleted = state.pomodoro.sessionsCompleted;
        if (huptiRenderer && typeof huptiRenderer.triggerBlush === 'function') {
          huptiRenderer.triggerBlush(4000);
        }
        if (huptiRenderer && typeof huptiRenderer.spawnHeartsBurst === 'function') {
          huptiRenderer.spawnHeartsBurst(8);
        }
      } else {
        prevSessionsCompleted = state.pomodoro.sessionsCompleted;
      }
    }
  });

  if (btnPomodoroToggle) {
    btnPomodoroToggle.addEventListener('click', () => {
      openModal('pomodoroModal', btnPomodoroToggle);
    });
  }
  if (pomodoroPill) {
    pomodoroPill.addEventListener('click', () => {
      openModal('pomodoroModal', pomodoroPill);
    });
  }
  if (btnClosePomodoro) {
    btnClosePomodoro.addEventListener('click', () => {
      closeModal('pomodoroModal');
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

  // 5. Ambient Soundscapes System
  const btnAmbientToggle = document.getElementById('btnAmbientToggle');
  const btnCloseAmbient = document.getElementById('btnCloseAmbient');
  const ambientOptions = document.querySelectorAll('.ambient-option');
  const ambientVolumeSlider = document.getElementById('ambientVolumeSlider');
  const ambientVolumeLabel = document.getElementById('ambientVolumeLabel');
  const btnAmbientTogglePlay = document.getElementById('btnAmbientTogglePlay');
  const ambientPlayIcon = document.getElementById('ambientPlayIcon');
  const ambientPlayText = document.getElementById('ambientPlayText');
  const ambientQuickSelect = document.getElementById('ambientQuickSelect');
  const ambientTabBtns = document.querySelectorAll('.ambient-tab-btn');

  let selectedAmbientType = 'cozy_lofi';

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

    const currentMode = isPlaying ? (soundFX.activeAmbient || selectedAmbientType) : 'off';
    if (ambientQuickSelect) {
      ambientQuickSelect.value = currentMode;
    }
    if (ambientTabBtns) {
      ambientTabBtns.forEach((btn) => {
        const m = btn.getAttribute('data-ambient');
        btn.classList.toggle('active', isPlaying ? m === currentMode : m === 'off');
      });
    }
    if (ambientOptions) {
      ambientOptions.forEach((opt) => {
        const m = opt.getAttribute('data-ambient');
        opt.classList.toggle('active', isPlaying && m === currentMode);
      });
    }
  };

  const syncAmbientMode = (type, autoPlay = true) => {
    if (type === 'off') {
      soundFX.stopAmbient();
    } else {
      selectedAmbientType = type;
      if (autoPlay) {
        soundFX.startAmbient(type);
      }
    }
    updateAmbientPlayBtnUI();
    petController.updateGroovingState();
  };

  if (btnAmbientToggle) {
    btnAmbientToggle.addEventListener('click', () => {
      openModal('ambientModal', btnAmbientToggle);
    });
  }
  if (btnCloseAmbient) {
    btnCloseAmbient.addEventListener('click', () => {
      closeModal('ambientModal');
    });
  }

  if (ambientQuickSelect) {
    ambientQuickSelect.addEventListener('change', (e) => {
      const mode = e.target.value;
      soundFX.playClick();
      syncAmbientMode(mode, mode !== 'off');
    });
  }

  if (ambientTabBtns) {
    ambientTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFX.playClick();
        const mode = btn.getAttribute('data-ambient');
        syncAmbientMode(mode, mode !== 'off');
      });
    });
  }

  ambientOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      soundFX.playClick();
      const mode = opt.getAttribute('data-ambient');
      syncAmbientMode(mode, true);
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
        syncAmbientMode('off', false);
      } else {
        syncAmbientMode(selectedAmbientType, true);
      }
    });
  }

  // 6. Wardrobe Customization & Background Presets
  const btnWardrobeToggle = document.getElementById('btnWardrobeToggle');
  const btnCloseWardrobe = document.getElementById('btnCloseWardrobe');
  const wardrobeItems = document.querySelectorAll('.wardrobe-item');
  const checkWardrobeGlasses = document.getElementById('checkWardrobeGlasses');
  const tintSwatches = document.querySelectorAll('.tint-swatch');
  const wardrobeTabBtns = document.querySelectorAll('.wardrobe-tab-btn');
  const wardrobeTabPanes = document.querySelectorAll('.wardrobe-tab-pane');
  const bgThemeCards = document.querySelectorAll('.bg-theme-card');
  const BG_STORAGE_KEY = 'hupti_bg_theme';

  const syncWardrobeUI = (customization) => {
    if (!customization) return;
    wardrobeItems.forEach((item) => {
      const acc = item.getAttribute('data-accessory');
      item.classList.toggle('active', acc === customization.accessory);
    });
    if (checkWardrobeGlasses) {
      checkWardrobeGlasses.checked = !!customization.glasses;
    }
    tintSwatches.forEach((swatch) => {
      const tint = swatch.getAttribute('data-tint');
      swatch.classList.toggle('active', tint === customization.tint);
    });
  };

  huptiState.subscribe((state) => {
    if (state.customization) {
      huptiRenderer.applyAccessory(state.customization.accessory);
      huptiRenderer.setGlasses(state.customization.glasses);
      huptiRenderer.applyTint(state.customization.tint);
      syncWardrobeUI(state.customization);
    }
  });

  if (btnWardrobeToggle) {
    btnWardrobeToggle.addEventListener('click', () => {
      openModal('wardrobeModal', btnWardrobeToggle);
    });
  }
  if (btnCloseWardrobe) {
    btnCloseWardrobe.addEventListener('click', () => {
      closeModal('wardrobeModal');
    });
  }

  wardrobeTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      soundFX.playClick();
      const tabName = btn.getAttribute('data-tab');
      wardrobeTabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      wardrobeTabPanes.forEach((pane) => pane.classList.remove('active'));

      if (tabName === 'accessories') {
        const pane = document.getElementById('tabPaneAccessories');
        if (pane) pane.classList.add('active');
      } else if (tabName === 'colors') {
        const pane = document.getElementById('tabPaneColors');
        if (pane) pane.classList.add('active');
      } else if (tabName === 'backgrounds') {
        const pane = document.getElementById('tabPaneBackgrounds');
        if (pane) pane.classList.add('active');
      }
    });
  });

  const applyBgTheme = (bgKey) => {
    document.documentElement.setAttribute('data-bg-theme', bgKey);
    localStorage.setItem(BG_STORAGE_KEY, bgKey);
    bgThemeCards.forEach((card) => {
      card.classList.toggle('active', card.getAttribute('data-bg') === bgKey);
    });
  };

  const savedBgTheme = localStorage.getItem(BG_STORAGE_KEY) || 'default';
  applyBgTheme(savedBgTheme);

  bgThemeCards.forEach((card) => {
    card.addEventListener('click', () => {
      soundFX.playClick();
      const bgKey = card.getAttribute('data-bg');
      if (bgKey) applyBgTheme(bgKey);
    });
  });

  wardrobeItems.forEach((item) => {
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

  tintSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const tint = swatch.getAttribute('data-tint');
      huptiState.setTint(tint);
    });
  });

  // 7. Minimalist About Creator Modal
  const btnAboutCreator = document.getElementById('btnAboutCreator');
  const btnCloseAboutCreator = document.getElementById('btnCloseAboutCreator');

  if (btnAboutCreator) {
    btnAboutCreator.addEventListener('click', () => {
      soundFX.playClick();
      openModal('aboutCreatorModal', btnAboutCreator);
    });
  }
  if (btnCloseAboutCreator) {
    btnCloseAboutCreator.addEventListener('click', () => {
      closeModal('aboutCreatorModal');
    });
  }
});
