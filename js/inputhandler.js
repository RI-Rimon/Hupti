/**
 * InputHandler - Manages Keyboard, Mouse, and Touch interactions
 * Bridges direct avatar contact and control bar triggers to HuptiState & HuptiRenderer.
 */

class InputHandler {
  constructor(state, renderer, soundFX, pipManager = null) {
    this.state = state;
    this.renderer = renderer;
    this.soundFX = soundFX;
    this.pipManager = pipManager;

    this.isDragging = false;
    this.dragDistance = 0;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.dragTargetIsForehead = false;

    this.initKeyboard();
    this.initButtons();
    this.initAvatarDirectInteractions();
    this.initGlobalPointerTracking();
  }

  /**
   * Keyboard shortcuts listener
   */
  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // 1. Strictly ignore if modifier keys are pressed (e.g. Ctrl+S, Ctrl+P, Alt+Tab, Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // 2. Strictly ignore if active element is an input, textarea, select, or contenteditable
      const activeEl = document.activeElement;
      if (activeEl && (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) ||
        activeEl.isContentEditable
      )) {
        return;
      }

      // 3. Strictly ignore if ANY modal overlay is currently open (Taskbox, Wardrobe, Pomodoro, Feedback, Welcome)
      if (document.querySelector('.modal-overlay.active')) return;

      // 4. Strictly ignore if user has toggled keyboard shortcuts off in settings
      if (localStorage.getItem('hupti_shortcuts_enabled') === 'false') return;

      const key = e.key.toUpperCase();

      switch (key) {
        case 'P':
          // Pet
          this.flashButton('btnPet');
          this.state.pet();
          break;

        case 'H':
          // Hug
          this.flashButton('btnHug');
          this.state.hug();
          break;

        case 'T':
          // Treat (logical T)
          this.flashButton('btnTreat');
          this.state.giveTreat();
          break;

        case 'K':
          // Poke (logical K)
          this.flashButton('btnPoke');
          this.state.poke();
          this.renderer.squish(0.9, 1.12);
          break;

        case 'S':
          // Scold (logical S)
          this.flashButton('btnScold');
          this.state.scold();
          this.renderer.squish(1.04, 0.96);
          break;

        case 'B':
          // Boop
          this.soundFX.playHappyChirp();
          this.state.poke();
          this.renderer.squish(0.92, 1.08);
          break;

        case 'Z':
          // Sleep (Zzz)
          if (this.state.currentMood !== MOODS.SLEEPING) {
            this.flashButton('btnSleepWake');
            this.state.putToSleep();
          }
          break;

        case 'W':
          // Wake Up
          if (this.state.currentMood === MOODS.SLEEPING) {
            this.flashButton('btnSleepWake');
            this.state.wakeUp();
          } else {
            this.flashButton('btnSleepWake');
            this.state.pet();
          }
          break;

        case 'M':
          // Toggle Mute
          const muteBtn = document.getElementById('btnMuteToggle');
          if (muteBtn) muteBtn.click();
          break;

        case 'O':
          // Toggle Floating Mini Window (PiP)
          if (this.pipManager) {
            this.soundFX.playClick();
            this.pipManager.toggle();
          }
          break;

        case 'C':
          // Toggle Wardrobe & Custom Themes
          const btnWardrobe = document.getElementById('btnWardrobeToggle');
          if (btnWardrobe) btnWardrobe.click();
          break;
      }
    });
  }

  /**
   * Action buttons bindings
   */
  initButtons() {
    const bindBtn = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.soundFX.playClick();
        action();
      });
    };

    bindBtn('btnPet', () => this.state.pet());
    bindBtn('btnPoke', () => {
      this.state.poke();
      this.renderer.squish(0.9, 1.12);
    });
    bindBtn('btnHug', () => this.state.hug());
    bindBtn('btnSleepWake', () => {
      if (this.state.currentMood === MOODS.SLEEPING) {
        this.state.wakeUp();
      } else {
        this.state.putToSleep();
      }
    });
    bindBtn('btnScold', () => {
      this.state.scold();
      this.renderer.squish(1.04, 0.96);
    });
    bindBtn('btnTreat', () => this.state.giveTreat());
  }

  /**
   * Direct avatar click & drag interactions (forehead stroke, cheek poke, body tap)
   */
  initAvatarDirectInteractions() {
    const forehead = document.getElementById('hitForehead');
    const cheekL = document.getElementById('hitCheekL');
    const cheekR = document.getElementById('hitCheekR');
    const avatar = document.getElementById('huptiAvatar');

    // Forehead petting interaction
    if (forehead) {
      forehead.addEventListener('pointerdown', (e) => {
        this.isDragging = true;
        this.dragTargetIsForehead = true;
        this.dragDistance = 0;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
      });

      forehead.addEventListener('click', (e) => {
        e.stopPropagation();
        this.state.pet();
      });
    }

    // Cheek poking interaction
    const handleCheekPoke = (e, side) => {
      e.stopPropagation();
      this.state.poke();
      if (side === 'left') {
        this.renderer.squish(0.88, 1.12);
      } else {
        this.renderer.squish(1.12, 0.88);
      }
    };

    if (cheekL) {
      cheekL.addEventListener('click', (e) => handleCheekPoke(e, 'left'));
    }
    if (cheekR) {
      cheekR.addEventListener('click', (e) => handleCheekPoke(e, 'right'));
    }

    // Direct click anywhere on avatar
    if (avatar) {
      avatar.addEventListener('click', (e) => {
        if (this.state.currentMood === MOODS.SLEEPING) {
          this.state.wakeUp();
        } else {
          // If clicked in general area, playful pet
          this.state.pet();
        }
      });
    }

    // Pointer move for petting stroke detection
    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;

      const dist = Math.hypot(e.clientX - this.lastPointerX, e.clientY - this.lastPointerY);
      this.dragDistance += dist;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      if (this.dragTargetIsForehead && this.dragDistance > 30) {
        this.state.continuousPet();
        this.renderer.spawnHeartsBurst(1);
        this.dragDistance = 0;
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
      this.dragTargetIsForehead = false;
      this.dragDistance = 0;
    });

    window.addEventListener('pointercancel', () => {
      this.isDragging = false;
      this.dragTargetIsForehead = false;
    });
  }

  /**
   * Pointer tracking across viewport to make Hupti's eyes follow the cursor
   */
  initGlobalPointerTracking() {
    window.addEventListener('pointermove', (e) => {
      this.renderer.updatePointerTarget(e.clientX, e.clientY);
    });

    // Touch device support
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.renderer.updatePointerTarget(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  /**
   * Visual button ripple / active state when triggered by keyboard
   */
  flashButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.add('keyboard-active');
    setTimeout(() => {
      btn.classList.remove('keyboard-active');
    }, 200);
  }
}

// Expose globally
window.InputHandler = InputHandler;
