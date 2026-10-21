/**
 * PiPManager - Document Picture-in-Picture & Video Stream Fallback Controller
 * Creates a floating, always-on-top mini companion window for Hupti that floats
 * over all tabs and desktop applications, with full interactive controls and state sync.
 */

class PiPManager {
  constructor(huptiState, soundFX, huptiRenderer) {
    this.state = huptiState;
    this.soundFX = soundFX;
    this.renderer = huptiRenderer;

    this.pipWindow = null;
    this.videoFallback = null;
    this.canvasFallback = null;
    this.fallbackAnimationId = null;

    this.autoDockOnReturn = false;
    this.autoPiPEnabled = true;
    this.isOpening = false;

    // Elements inside mini window
    this.miniElements = {};
    this.miniPupilX = 0;
    this.miniPupilY = 0;
    this.miniTargetPupilX = 0;
    this.miniTargetPupilY = 0;

    this.init();
  }

  /**
   * Check if Picture-in-Picture is supported
   */
  isDocumentPiPSupported() {
    return 'documentPictureInPicture' in window;
  }

  isVideoPiPSupported() {
    return document.pictureInPictureEnabled || false;
  }

  isSupported() {
    return this.isDocumentPiPSupported() || this.isVideoPiPSupported();
  }

  isActive() {
    return !!(this.pipWindow || (document.pictureInPictureElement && document.pictureInPictureElement === this.videoFallback));
  }

  init() {
    // Visibility change auto-mode handler
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

    // Listen to theme changes to sync with PiP window
    const observer = new MutationObserver(() => {
      if (this.pipWindow && this.pipWindow.document) {
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        this.pipWindow.document.documentElement.setAttribute('data-theme', theme);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /**
   * Toggle Picture-in-Picture floating window
   */
  async toggle() {
    if (this.isActive()) {
      this.close();
    } else {
      await this.open(false);
    }
  }

  /**
   * Open floating PiP window
   */
  async open(isAutoTriggered = false) {
    if (this.isActive() || this.isOpening) return;
    this.isOpening = true;

    try {
      if (this.isDocumentPiPSupported()) {
        await this.openDocumentPiP(isAutoTriggered);
      } else if (this.isVideoPiPSupported()) {
        await this.openVideoFallback(isAutoTriggered);
      } else {
        console.warn('Picture-in-Picture is not supported in this browser.');
      }
    } catch (err) {
      console.warn('Could not open Picture-in-Picture window:', err);
      // Fallback to video PiP if document PiP was rejected
      if (this.isVideoPiPSupported() && !this.pipWindow) {
        try {
          await this.openVideoFallback(isAutoTriggered);
        } catch (e2) {
          console.warn('Video PiP fallback also failed:', e2);
        }
      }
    } finally {
      this.isOpening = false;
      this.updateNavbarButton();
    }
  }

  /**
   * Document Picture-in-Picture (Chrome 116+, Edge 116+)
   * Provides full interactive HTML, live SVG, and clickable buttons.
   */
  async openDocumentPiP(isAutoTriggered = false) {
    const width = 310;
    const height = 345;

    this.pipWindow = await window.documentPictureInPicture.requestWindow({
      width,
      height
    });

    this.autoDockOnReturn = isAutoTriggered;
    const pipDoc = this.pipWindow.document;

    // Apply document title
    pipDoc.title = 'Hupti — Floating Companion 🌸';

    // Sync theme
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    pipDoc.documentElement.setAttribute('data-theme', theme);

    // Copy styles from main document to PiP window
    this.copyStylesheetsTo(pipDoc);

    // Render PiP content
    this.renderPiPContent(pipDoc);

    // Window closed handler (dock back to main tab)
    this.pipWindow.addEventListener('pagehide', () => {
      this.pipWindow = null;
      this.miniElements = {};
      this.updateNavbarButton();
      this.updateMainStagePlaceholder(false);
    });

    this.updateNavbarButton();
    this.updateMainStagePlaceholder(true);
  }

  /**
   * Copy styles and fonts to the PiP document
   */
  copyStylesheetsTo(targetDoc) {
    // 1. Google Fonts link
    const fontLink = targetDoc.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
    targetDoc.head.appendChild(fontLink);

    // 2. Clone stylesheets
    [...document.styleSheets].forEach((styleSheet) => {
      try {
        if (styleSheet.cssRules) {
          const style = targetDoc.createElement('style');
          style.textContent = [...styleSheet.cssRules].map(r => r.cssText).join('\n');
          targetDoc.head.appendChild(style);
        }
      } catch (e) {
        if (styleSheet.href) {
          const link = targetDoc.createElement('link');
          link.rel = 'stylesheet';
          link.href = styleSheet.href;
          targetDoc.head.appendChild(link);
        }
      }
    });

    // 3. Dedicated styles for the compact floating window
    const pipStyle = targetDoc.createElement('style');
    pipStyle.textContent = `
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: var(--bg-gradient);
        color: var(--text-main);
        font-family: 'Plus Jakarta Sans', sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        user-select: none;
        -webkit-user-select: none;
      }
      .mini-pip-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 0.6rem 0.65rem 0.5rem 0.65rem;
        box-sizing: border-box;
      }
      .mini-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 0.2rem;
      }
      .mini-brand {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-family: 'Fredoka', cursive, sans-serif;
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--accent-pink);
      }
      .mini-brand-icon {
        width: 20px;
        height: 20px;
      }
      .mini-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.25rem 0.6rem;
        border-radius: 9999px;
        background: var(--bg-card);
        border: 1px solid var(--btn-border);
        font-size: 0.72rem;
        font-weight: 600;
      }
      .mini-dock-btn {
        background: var(--btn-bg);
        border: 1px solid var(--btn-border);
        border-radius: 9999px;
        padding: 0.22rem 0.55rem;
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--text-main);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        transition: all 0.2s ease;
      }
      .mini-dock-btn:hover {
        background: var(--btn-hover-bg);
        color: var(--accent-pink);
      }
      .mini-avatar-stage {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        min-height: 140px;
      }
      .mini-avatar-svg {
        width: 155px;
        height: 145px;
        filter: var(--avatar-shadow);
        animation: hupti-float 4.2s ease-in-out infinite;
        transform-origin: center bottom;
      }
      .mini-dialogue-card {
        background: var(--bg-card);
        border: 1px solid var(--bg-card-border);
        border-radius: 14px;
        padding: 0.4rem 0.65rem;
        box-shadow: 0 4px 12px -2px rgba(0,0,0,0.06);
        margin: 0.2rem 0;
        text-align: center;
        min-height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mini-dialogue-text {
        font-size: 0.78rem;
        line-height: 1.35;
        font-weight: 500;
        color: var(--text-main);
        margin: 0;
      }
      .mini-controls-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        margin-top: 0.2rem;
      }
      .mini-pill-btn {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        padding: 0.38rem 0.45rem;
        background: var(--btn-bg);
        border: 1px solid var(--btn-border);
        border-radius: 9999px;
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-main);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.2, 0.8, 0.4, 1);
        box-shadow: var(--btn-shadow);
      }
      .mini-pill-btn:hover {
        transform: translateY(-2px);
        background: var(--btn-hover-bg);
        color: var(--accent-pink);
        box-shadow: var(--btn-hover-shadow);
      }
      .mini-pill-btn:active {
        transform: translateY(0) scale(0.96);
      }
      .mini-hearts-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
      }
      .floating-mini-heart {
        position: absolute;
        color: var(--accent-pink);
        font-size: 1rem;
        animation: floatHeart 1.4s ease-out forwards;
      }
      @keyframes floatHeart {
        0% { transform: translateY(0) scale(0.8); opacity: 1; }
        100% { transform: translateY(-45px) scale(1.3); opacity: 0; }
      }
    `;
    targetDoc.head.appendChild(pipStyle);
  }

  /**
   * Render HTML structure inside the PiP window
   */
  renderPiPContent(pipDoc) {
    const currentState = this.state.getStateSnapshot();

    pipDoc.body.innerHTML = `
      <div class="mini-pip-container">
        <!-- Mini Header -->
        <header class="mini-header">
          <div class="mini-brand">
            <svg class="mini-brand-icon" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="9" r="5.2" fill="#FFA5BA"/>
              <circle cx="22.5" cy="13.5" r="5.2" fill="#FF83A0"/>
              <circle cx="20" cy="21.5" r="5.2" fill="#FFA5BA"/>
              <circle cx="12" cy="21.5" r="5.2" fill="#FF83A0"/>
              <circle cx="9.5" cy="13.5" r="5.2" fill="#FFA5BA"/>
              <circle cx="16" cy="16" r="4.2" fill="#FFD166"/>
              <circle cx="14.8" cy="14.8" r="1.3" fill="#FFFBE6"/>
            </svg>
            <span>Hupti</span>
          </div>

          <div id="miniMoodBadge" class="mini-status-pill">
            ✨ Curious
          </div>

          <button id="btnMiniDock" class="mini-dock-btn" title="Dock back into main tab">
            ⤢ Dock
          </button>
        </header>

        <!-- Mini Avatar Stage -->
        <div class="mini-avatar-stage" id="miniAvatarStage" title="Tap Hupti to pet or poke!">
          <div class="mini-hearts-container" id="miniHeartsContainer"></div>
          
          <svg id="miniAvatarSvg" class="mini-avatar-svg" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="miniBodyGradient" cx="45%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#FFFFFF"/>
                <stop offset="60%" stop-color="#FFF3F7"/>
                <stop offset="100%" stop-color="#FFE4EE"/>
              </radialGradient>
              <radialGradient id="miniBodyDarkGradient" cx="45%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#FAF5FF"/>
                <stop offset="65%" stop-color="#EADBFF"/>
                <stop offset="100%" stop-color="#D5BFFF"/>
              </radialGradient>
              <radialGradient id="miniBlushGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#FF5A82" stop-opacity="0.8"/>
                <stop offset="50%" stop-color="#FF83A0" stop-opacity="0.5"/>
                <stop offset="100%" stop-color="#FFA4BA" stop-opacity="0"/>
              </radialGradient>
              <linearGradient id="miniPupilGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#2D1F38"/>
                <stop offset="70%" stop-color="#3F2A52"/>
                <stop offset="100%" stop-color="#674780"/>
              </linearGradient>
            </defs>

            <!-- Body -->
            <path id="miniHuptiBody" class="hupti-body-path" d="
              M 110 32
              C 160 32, 192 70, 194 116
              C 196 160, 168 198, 110 198
              C 52 198, 24 160, 26 116
              C 28 70, 60 32, 110 32
              Z
            "/>

            <!-- Head Blossom / Accessory Container -->
            <g id="miniHeadSprout" transform="translate(108, 30)">
              <g id="miniAccessoryContent">
                <path d="M 0 0 C -2 -7, 0 -13, 2 -16" stroke="#70C1B3" stroke-width="2.4" stroke-linecap="round" fill="none"/>
                <path d="M 0 -7 C -5 -9, -6 -14, -1 -12 Z" fill="#8CE0D0"/>
                <g transform="translate(2, -18) scale(0.65)">
                  <circle cx="0" cy="-8" r="5.2" fill="#FFA5BA"/>
                  <circle cx="7.6" cy="-2.5" r="5.2" fill="#FF83A0"/>
                  <circle cx="4.7" cy="6.5" r="5.2" fill="#FFA5BA"/>
                  <circle cx="-4.7" cy="6.5" r="5.2" fill="#FF83A0"/>
                  <circle cx="-7.6" cy="-2.5" r="5.2" fill="#FFA5BA"/>
                  <circle cx="0" cy="0" r="4.2" fill="#FFD166"/>
                  <circle cx="-1.2" cy="-1.2" r="1.3" fill="#FFFBE6"/>
                </g>
              </g>
            </g>

            <!-- Blush Cheeks -->
            <circle id="miniBlushL" class="hupti-blush" cx="50" cy="136" r="14" fill="url(#miniBlushGradient)"/>
            <circle id="miniBlushR" class="hupti-blush" cx="170" cy="136" r="14" fill="url(#miniBlushGradient)"/>

            <!-- Left Eye -->
            <g id="miniEyeL" class="hupti-eye-group">
              <g class="mini-eye-lid">
                <ellipse class="mini-eye-sclera" cx="74" cy="108" rx="19" ry="24" fill="#FFFFFF"/>
                <g class="mini-pupil-group" id="miniPupilL">
                  <ellipse cx="74" cy="109" rx="14" ry="18" fill="url(#miniPupilGradient)"/>
                  <circle cx="69" cy="99" r="6" fill="#FFFFFF"/>
                  <circle cx="79" cy="118" r="2.8" fill="#FFFFFF"/>
                </g>
                <path class="hupti-lash" d="M 58 98 Q 63 90 73 87" stroke="#453347" stroke-width="2.2" stroke-linecap="round"/>
                <path class="hupti-lash" d="M 82 89 Q 89 87 94 92" stroke="#453347" stroke-width="2.2" stroke-linecap="round"/>
              </g>
              <path class="mini-happy-eye" d="M 58 114 Q 74 94 90 114" fill="none" stroke="#453347" stroke-width="4.5" stroke-linecap="round" style="opacity: 0;"/>
              <path class="mini-sleep-eye" d="M 59 110 Q 74 122 89 110" fill="none" stroke="#453347" stroke-width="4.5" stroke-linecap="round" style="opacity: 0;"/>
            </g>

            <!-- Right Eye -->
            <g id="miniEyeR" class="hupti-eye-group">
              <g class="mini-eye-lid">
                <ellipse class="mini-eye-sclera" cx="146" cy="108" rx="19" ry="24" fill="#FFFFFF"/>
                <g class="mini-pupil-group" id="miniPupilR">
                  <ellipse cx="146" cy="109" rx="14" ry="18" fill="url(#miniPupilGradient)"/>
                  <circle cx="141" cy="99" r="6" fill="#FFFFFF"/>
                  <circle cx="151" cy="118" r="2.8" fill="#FFFFFF"/>
                </g>
                <path class="hupti-lash" d="M 162 98 Q 157 90 147 87" stroke="#453347" stroke-width="2.2" stroke-linecap="round"/>
                <path class="hupti-lash" d="M 138 89 Q 131 87 126 92" stroke="#453347" stroke-width="2.2" stroke-linecap="round"/>
              </g>
              <path class="mini-happy-eye" d="M 130 114 Q 146 94 162 114" fill="none" stroke="#453347" stroke-width="4.5" stroke-linecap="round" style="opacity: 0;"/>
              <path class="mini-sleep-eye" d="M 131 110 Q 146 122 161 110" fill="none" stroke="#453347" stroke-width="4.5" stroke-linecap="round" style="opacity: 0;"/>
            </g>

            <!-- Mini Study Glasses -->
            <g id="miniAccessoryGlasses" style="display: none;">
              <circle cx="74" cy="110" r="23" fill="none" stroke="#583C4F" stroke-width="2.6"/>
              <circle cx="146" cy="110" r="23" fill="none" stroke="#583C4F" stroke-width="2.6"/>
              <path d="M 97 110 Q 110 105 123 110" fill="none" stroke="#583C4F" stroke-width="2.6" stroke-linecap="round"/>
            </g>

            <!-- Mouth -->
            <path id="miniMouth" class="hupti-mouth-path" d="M 96 142 Q 103 147 110 143 Q 117 147 124 142" fill="none" stroke="#5A3D4A" stroke-width="3.2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- Mini Dialogue Box -->
        <div class="mini-dialogue-card">
          <p id="miniDialogueText" class="mini-dialogue-text">
            ${currentState.dialogue}
          </p>
        </div>

        <!-- Quick Action Buttons -->
        <footer class="mini-controls-bar">
          <button id="btnMiniPet" class="mini-pill-btn" title="Pet Hupti">
            <span>💖</span> Pet
          </button>
          <button id="btnMiniHug" class="mini-pill-btn" title="Hug Hupti">
            <span>🤗</span> Hug
          </button>
          <button id="btnMiniSleep" class="mini-pill-btn" title="Put to sleep / Wake up">
            <span id="miniSleepIcon">${currentState.isSleeping ? '☀️' : '💤'}</span>
            <span id="miniSleepText">${currentState.isSleeping ? 'Wake' : 'Sleep'}</span>
          </button>
          <button id="btnMiniTreat" class="mini-pill-btn" title="Give Snack">
            <span>🍬</span> Treat
          </button>
        </footer>
      </div>
    `;

    // Cache elements for real-time state sync
    this.miniElements = {
      dialogueText: pipDoc.getElementById('miniDialogueText'),
      moodBadge: pipDoc.getElementById('miniMoodBadge'),
      sleepIcon: pipDoc.getElementById('miniSleepIcon'),
      sleepText: pipDoc.getElementById('miniSleepText'),
      avatarSvg: pipDoc.getElementById('miniAvatarSvg'),
      mouth: pipDoc.getElementById('miniMouth'),
      blushL: pipDoc.getElementById('miniBlushL'),
      blushR: pipDoc.getElementById('miniBlushR'),
      scleras: pipDoc.querySelectorAll('.mini-eye-sclera'),
      pupils: pipDoc.querySelectorAll('.mini-pupil-group'),
      happyEyes: pipDoc.querySelectorAll('.mini-happy-eye'),
      sleepEyes: pipDoc.querySelectorAll('.mini-sleep-eye'),
      heartsContainer: pipDoc.getElementById('miniHeartsContainer'),
      glasses: pipDoc.getElementById('miniAccessoryGlasses'),
      accessory: pipDoc.getElementById('miniAccessoryContent')
    };

    // Bind event handlers
    const btnMiniDock = pipDoc.getElementById('btnMiniDock');
    const btnMiniPet = pipDoc.getElementById('btnMiniPet');
    const btnMiniHug = pipDoc.getElementById('btnMiniHug');
    const btnMiniSleep = pipDoc.getElementById('btnMiniSleep');
    const btnMiniTreat = pipDoc.getElementById('btnMiniTreat');
    const miniAvatarStage = pipDoc.getElementById('miniAvatarStage');

    btnMiniDock.addEventListener('click', () => this.close());

    btnMiniPet.addEventListener('click', () => {
      this.soundFX.playClick();
      this.state.pet();
      this.spawnMiniHearts();
    });

    btnMiniHug.addEventListener('click', () => {
      this.soundFX.playClick();
      this.state.hug();
      this.spawnMiniHearts();
    });

    btnMiniSleep.addEventListener('click', () => {
      this.soundFX.playClick();
      if (this.state.currentMood === MOODS.SLEEPING) {
        this.state.wakeUp();
      } else {
        this.state.putToSleep();
      }
    });

    btnMiniTreat.addEventListener('click', () => {
      this.soundFX.playClick();
      this.state.giveTreat();
    });

    miniAvatarStage.addEventListener('click', () => {
      if (this.state.currentMood === MOODS.SLEEPING) {
        this.state.wakeUp();
      } else {
        this.state.pet();
        this.spawnMiniHearts();
      }
    });

    // Eye pointer tracking inside PiP window
    pipDoc.addEventListener('pointermove', (e) => {
      if (this.state.currentMood === MOODS.SLEEPING) return;
      const rect = miniAvatarStage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) {
        const clamped = Math.min(dist / 14, 8);
        this.miniTargetPupilX = (dx / dist) * clamped;
        this.miniTargetPupilY = (dy / dist) * clamped;
      }
    });

    // Synchronize current state
    this.syncPiPState(currentState);

    // Start mini pupil loop
    this.startMiniRenderLoop();
  }

  /**
   * Sync visual elements inside PiP window when HuptiState changes
   */
  syncPiPState(state) {
    if (!this.pipWindow || !this.miniElements.dialogueText) return;

    // Update text
    this.miniElements.dialogueText.textContent = state.dialogue;

    // Update mood badge
    const moodMeta = {
      [MOODS.IDLE]: { icon: '✨', label: 'Curious' },
      [MOODS.HAPPY]: { icon: '💖', label: 'Loved' },
      [MOODS.HUGGED]: { icon: '🤗', label: 'Cozy Hug' },
      [MOODS.POUTED]: { icon: '😤', label: 'Sassy' },
      [MOODS.SAD]: { icon: '🥺', label: 'Sad' },
      [MOODS.SLEEPING]: { icon: '💤', label: 'Dreaming' },
      [MOODS.EATING]: { icon: '🍬', label: 'Snacking' },
      [MOODS.SURPRISED]: { icon: '👀', label: 'Boop!' }
    };
    const info = moodMeta[state.mood] || moodMeta[MOODS.IDLE];
    if (this.miniElements.moodBadge) {
      this.miniElements.moodBadge.innerHTML = `<span>${info.icon}</span> ${info.label}`;
    }

    // Sleep toggle text
    if (this.miniElements.sleepIcon && this.miniElements.sleepText) {
      this.miniElements.sleepIcon.textContent = state.isSleeping ? '☀️' : '💤';
      this.miniElements.sleepText.textContent = state.isSleeping ? 'Wake' : 'Sleep';
    }

    // Eyes shape
    if (state.mood === MOODS.HAPPY || state.mood === MOODS.HUGGED) {
      this.miniElements.scleras.forEach(el => el.style.opacity = '0');
      this.miniElements.pupils.forEach(el => el.style.opacity = '0');
      this.miniElements.sleepEyes.forEach(el => el.style.opacity = '0');
      this.miniElements.happyEyes.forEach(el => el.style.opacity = '1');
    } else if (state.mood === MOODS.SLEEPING) {
      this.miniElements.scleras.forEach(el => el.style.opacity = '0');
      this.miniElements.pupils.forEach(el => el.style.opacity = '0');
      this.miniElements.happyEyes.forEach(el => el.style.opacity = '0');
      this.miniElements.sleepEyes.forEach(el => el.style.opacity = '1');
    } else {
      this.miniElements.scleras.forEach(el => el.style.opacity = '1');
      this.miniElements.pupils.forEach(el => el.style.opacity = '1');
      this.miniElements.happyEyes.forEach(el => el.style.opacity = '0');
      this.miniElements.sleepEyes.forEach(el => el.style.opacity = '0');
    }

    // Mouth shape
    if (this.miniElements.mouth) {
      if (state.mood === MOODS.HAPPY) {
        this.miniElements.mouth.setAttribute('d', 'M 92 142 Q 110 162 128 142 Z');
        this.miniElements.mouth.setAttribute('fill', '#992B45');
      } else if (state.mood === MOODS.HUGGED) {
        this.miniElements.mouth.setAttribute('d', 'M 95 142 Q 110 156 125 142');
        this.miniElements.mouth.setAttribute('fill', 'none');
      } else if (state.mood === MOODS.POUTED) {
        this.miniElements.mouth.setAttribute('d', 'M 96 148 Q 104 140 110 144 Q 116 148 124 142');
        this.miniElements.mouth.setAttribute('fill', 'none');
      } else if (state.mood === MOODS.SLEEPING) {
        this.miniElements.mouth.setAttribute('d', 'M 104 145 Q 110 148 116 145');
        this.miniElements.mouth.setAttribute('fill', 'none');
      } else {
        this.miniElements.mouth.setAttribute('d', 'M 96 142 Q 103 147 110 143 Q 117 147 124 142');
        this.miniElements.mouth.setAttribute('fill', 'none');
      }
    }

    // Blush intensity
    if (this.miniElements.blushL && this.miniElements.blushR) {
      if (state.mood === MOODS.HAPPY || state.mood === MOODS.HUGGED) {
        this.miniElements.blushL.style.opacity = '1';
        this.miniElements.blushR.style.opacity = '1';
      } else if (state.mood === MOODS.SAD) {
        this.miniElements.blushL.style.opacity = '0.15';
        this.miniElements.blushR.style.opacity = '0.15';
      } else {
        this.miniElements.blushL.style.opacity = '0.55';
        this.miniElements.blushR.style.opacity = '0.55';
      }
    }

    // Glasses & Customization Sync
    if (this.miniElements.glasses && state.customization) {
      this.miniElements.glasses.style.display = state.customization.glasses ? 'inline' : 'none';
    }

    // Pomodoro badge indicator in PiP
    if (state.pomodoro && state.pomodoro.isActive && this.miniElements.moodBadge) {
      const mins = Math.floor(state.pomodoro.timeLeft / 60);
      const secs = state.pomodoro.timeLeft % 60;
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const isFocus = state.pomodoro.mode === 'focus';
      this.miniElements.moodBadge.innerHTML = `<span>🍅</span> ${timeStr} (${isFocus ? 'Focus' : 'Break'})`;
    }
  }

  /**
   * Mini pupil animation loop inside PiP
   */
  startMiniRenderLoop() {
    const loop = () => {
      if (!this.pipWindow) return;

      this.miniPupilX += (this.miniTargetPupilX - this.miniPupilX) * 0.18;
      this.miniPupilY += (this.miniTargetPupilY - this.miniPupilY) * 0.18;

      if (this.miniElements.pupils) {
        this.miniElements.pupils.forEach(pupil => {
          pupil.setAttribute('transform', `translate(${this.miniPupilX}, ${this.miniPupilY})`);
        });
      }

      this.pipWindow.requestAnimationFrame(loop);
    };

    if (this.pipWindow) {
      this.pipWindow.requestAnimationFrame(loop);
    }
  }

  /**
   * Spawn floating hearts in PiP window
   */
  spawnMiniHearts() {
    if (!this.pipWindow || !this.miniElements.heartsContainer) return;
    const heart = this.pipWindow.document.createElement('div');
    heart.className = 'floating-mini-heart';
    heart.textContent = '💖';
    heart.style.left = `${Math.random() * 60 + 20}%`;
    heart.style.top = `${Math.random() * 30 + 40}%`;

    this.miniElements.heartsContainer.appendChild(heart);
    setTimeout(() => {
      if (heart.parentElement) heart.remove();
    }, 1400);
  }

  /**
   * Fallback for browsers supporting Video PiP only
   */
  async openVideoFallback(isAutoTriggered = false) {
    if (!this.videoFallback) {
      this.canvasFallback = document.createElement('canvas');
      this.canvasFallback.width = 320;
      this.canvasFallback.height = 320;

      this.videoFallback = document.createElement('video');
      this.videoFallback.muted = true;
      this.videoFallback.autoplay = true;
      this.videoFallback.playsInline = true;
      this.videoFallback.style.position = 'fixed';
      this.videoFallback.style.top = '-9999px';
      this.videoFallback.style.left = '-9999px';
      this.videoFallback.style.opacity = '0';
      this.videoFallback.style.pointerEvents = 'none';
      document.body.appendChild(this.videoFallback);

      // Start stream
      const stream = this.canvasFallback.captureStream(30);
      this.videoFallback.srcObject = stream;
      await this.videoFallback.play();
    }

    this.autoDockOnReturn = isAutoTriggered;
    this.startCanvasFallbackLoop();

    await this.videoFallback.requestPictureInPicture();

    this.videoFallback.addEventListener('leavepictureinpicture', () => {
      this.stopCanvasFallbackLoop();
      this.updateNavbarButton();
      this.updateMainStagePlaceholder(false);
    }, { once: true });

    this.updateNavbarButton();
    this.updateMainStagePlaceholder(true);
  }

  startCanvasFallbackLoop() {
    const ctx = this.canvasFallback.getContext('2d');
    const render = () => {
      if (!this.videoFallback) return;

      const state = this.state.getStateSnapshot();
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      // Background
      ctx.fillStyle = isDark ? '#1C162E' : '#FFF6F8';
      ctx.fillRect(0, 0, 320, 320);

      // Cute circle card
      ctx.fillStyle = isDark ? '#2D2345' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(160, 140, 85, 0, Math.PI * 2);
      ctx.fill();

      // Cheeks
      ctx.fillStyle = '#FF7B99';
      ctx.beginPath();
      ctx.arc(115, 155, 12, 0, Math.PI * 2);
      ctx.arc(205, 155, 12, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = isDark ? '#F5EEFC' : '#3A2E4C';
      if (state.mood === MOODS.HAPPY || state.mood === MOODS.HUGGED) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = isDark ? '#F5EEFC' : '#3A2E4C';
        ctx.beginPath();
        ctx.arc(130, 130, 12, Math.PI, 0);
        ctx.arc(190, 130, 12, Math.PI, 0);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(130, 130, 10, 0, Math.PI * 2);
        ctx.arc(190, 130, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#5A3D4A';
      ctx.beginPath();
      ctx.arc(160, 155, 7, 0, Math.PI);
      ctx.stroke();

      // Subtitle
      ctx.fillStyle = isDark ? '#E5DCF2' : '#4A3E4E';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(state.dialogue.slice(0, 38), 160, 275);

      this.fallbackAnimationId = requestAnimationFrame(render);
    };

    render();
  }

  stopCanvasFallbackLoop() {
    if (this.fallbackAnimationId) {
      cancelAnimationFrame(this.fallbackAnimationId);
      this.fallbackAnimationId = null;
    }
  }

  /**
   * Close floating window and return to main tab
   */
  close() {
    if (this.pipWindow) {
      try {
        this.pipWindow.close();
      } catch (e) {}
      this.pipWindow = null;
      this.miniElements = {};
    }

    if (document.pictureInPictureElement) {
      try {
        document.exitPictureInPicture();
      } catch (e) {}
    }

    this.stopCanvasFallbackLoop();
    this.updateNavbarButton();
    this.updateMainStagePlaceholder(false);
  }

  /**
   * Handle Tab Switching (Visibility Change Auto-Trigger & Auto-Dock)
   */
  async handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      // User switched away to another tab or minimized
      if (this.autoPiPEnabled && !this.isActive()) {
        try {
          await this.open(true);
        } catch (e) {
          // Browsers require user activation for Document PiP; gracefully ignore
        }
      }
    } else if (document.visibilityState === 'visible') {
      // User returned to the main Hupti tab
      if (this.autoDockOnReturn && this.isActive()) {
        this.close();
      }
    }
  }

  /**
   * Update PiP button visual state in navbar
   */
  updateNavbarButton() {
    const btn = document.getElementById('btnPiPToggle');
    if (!btn) return;
    const active = this.isActive();
    btn.setAttribute('aria-pressed', active);
    if (active) {
      btn.classList.add('pip-active');
      btn.title = 'Dock Hupti back into page';
    } else {
      btn.classList.remove('pip-active');
      btn.title = 'Pop out floating Hupti (PiP)';
    }
  }

  /**
   * Show cute indicator in main stage when floating
   */
  updateMainStagePlaceholder(isFloating) {
    let badge = document.getElementById('pipFloatingIndicator');
    const container = document.getElementById('huptiContainer');

    if (isFloating) {
      if (!badge && container) {
        badge = document.createElement('div');
        badge.id = 'pipFloatingIndicator';
        badge.className = 'pip-floating-badge';
        badge.innerHTML = `
          <span>✨ Hupti is floating on your screen</span>
          <button id="btnReturnFromBadge" class="pip-dock-pill">Bring Hupti back ⤢</button>
        `;
        container.parentElement.appendChild(badge);

        const btnReturn = badge.querySelector('#btnReturnFromBadge');
        if (btnReturn) btnReturn.addEventListener('click', () => this.close());
      }
    } else {
      if (badge) badge.remove();
    }
  }
}

// Expose globally
window.PiPManager = PiPManager;
