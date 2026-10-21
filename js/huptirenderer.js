/**
 * HuptiRenderer - High-Fidelity Expressive Vector & Canvas Renderer
 * Handles SVG facial rigging, pupil tracking, organic squish/stretch,
 * blush glow, mouth transitions, and particle physics.
 */

class HuptiRenderer {
  constructor(containerId, particleCanvasId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.getElementById(particleCanvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // Pupil tracking state
    this.targetPupilX = 0;
    this.targetPupilY = 0;
    this.currentPupilX = 0;
    this.currentPupilY = 0;
    this.maxPupilOffset = 10; // Max pupil travel distance

    // Particles system
    this.particles = [];
    this.ambientParticles = [];
    this.lastFrameTime = performance.now();

    // Blink timer
    this.blinkTimer = null;
    this.isBlinking = false;
    this.isSquishing = false;

    // Chewing animation loop handle
    this.chewTimer = null;

    // Current mood cache
    this.mood = MOODS.IDLE;

    this.initCanvas();
    this.initAmbientParticles();
    this.startBlinkLoop();
    this.startRenderLoop();
  }

  initCanvas() {
    if (!this.canvas) return;
    const resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      if (this.ctx) {
        this.ctx.scale(dpr, dpr);
      }
      this.cssWidth = rect.width;
      this.cssHeight = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  initAmbientParticles() {
    this.ambientParticles = [];
    for (let i = 0; i < 18; i++) {
      this.ambientParticles.push({
        x: Math.random() * (this.cssWidth || 600),
        y: Math.random() * (this.cssHeight || 600),
        size: Math.random() * 2.5 + 1.2,
        speedY: -(Math.random() * 0.25 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        color: ['#FFB6C1', '#B5D8FA', '#E2C2FF', '#FFE194'][Math.floor(Math.random() * 4)]
      });
    }
  }

  /**
   * Update pupil tracking target based on mouse / pointer position
   */
  updatePointerTarget(clientX, clientY) {
    if (this.mood === MOODS.SLEEPING) {
      this.targetPupilX = 0;
      this.targetPupilY = 0;
      return;
    }

    const rect = this.container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2 - 20; // Hupti's eye level

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      const clampedDist = Math.min(dist / 18, this.maxPupilOffset);
      this.targetPupilX = (dx / dist) * clampedDist;
      this.targetPupilY = (dy / dist) * clampedDist;
    } else {
      this.targetPupilX = 0;
      this.targetPupilY = 0;
    }
  }

  /**
   * Natural blinking loop with random intervals and occasional double-blinks
   */
  startBlinkLoop() {
    const triggerBlink = () => {
      // Don't blink if sleeping, happy crescents, or hugged
      if (this.mood !== MOODS.SLEEPING && this.mood !== MOODS.HAPPY && this.mood !== MOODS.HUGGED && !this.isBlinking) {
        this.blink();
        // 20% chance of an adorable double blink
        if (Math.random() < 0.22) {
          setTimeout(() => {
            if (this.mood !== MOODS.SLEEPING && this.mood !== MOODS.HAPPY && this.mood !== MOODS.HUGGED) {
              this.blink();
            }
          }, 240);
        }
      }
      const nextDelay = Math.random() * 3200 + 2400; // 2.4s to 5.6s
      this.blinkTimer = setTimeout(triggerBlink, nextDelay);
    };

    this.blinkTimer = setTimeout(triggerBlink, 2000);
  }

  blink() {
    const eyeElements = document.querySelectorAll('.hupti-eye-lid');
    this.isBlinking = true;
    eyeElements.forEach(el => el.classList.add('blinking'));

    setTimeout(() => {
      eyeElements.forEach(el => el.classList.remove('blinking'));
      this.isBlinking = false;
    }, 140);
  }

  /**
   * Playful body squash/squish effect on tap or poke
   */
  squish(factorX = 1.12, factorY = 0.88, duration = 350) {
    const body = document.getElementById('huptiAvatar');
    if (!body || this.isSquishing) return;

    this.isSquishing = true;
    body.style.transition = 'transform 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    body.style.transform = `scale(${factorX}, ${factorY})`;

    setTimeout(() => {
      body.style.transform = `scale(0.95, 1.05)`;
      setTimeout(() => {
        body.style.transform = '';
        body.style.transition = '';
        this.isSquishing = false;
      }, 160);
    }, 120);
  }

  /**
   * Update visual elements based on mood state
   */
  applyMood(mood) {
    this.mood = mood;
    const avatar = document.getElementById('huptiAvatar');
    if (avatar) {
      avatar.setAttribute('data-mood', mood);
    }

    // Stop chewing loop if changing away from eating
    if (mood !== MOODS.EATING && this.chewTimer) {
      clearInterval(this.chewTimer);
      this.chewTimer = null;
    }

    // Switch mouth shape
    this.updateMouth(mood);

    // Switch eyes shape
    this.updateEyes(mood);

    // Update blush
    this.updateBlush(mood);

    // Mood specific particle burst
    if (mood === MOODS.HAPPY) {
      this.spawnHeartsBurst(8);
      this.squish(1.08, 0.94);
    } else if (mood === MOODS.HUGGED) {
      this.spawnHeartsBurst(12);
      this.nuzzleHugAnimation();
    } else if (mood === MOODS.POUTED) {
      this.squish(0.92, 1.1);
    } else if (mood === MOODS.SAD) {
      this.spawnTearBurst();
    } else if (mood === MOODS.EATING) {
      this.startChewing();
      this.spawnTreatCrumbs();
    } else if (mood === MOODS.SLEEPING) {
      this.spawnZzzBurst();
    }
  }

  /**
   * Sweet, gentle squeeze/nuzzle animation when hugged
   */
  nuzzleHugAnimation() {
    const body = document.getElementById('huptiAvatar');
    if (!body) return;

    body.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
    // Inward cozy squeeze
    body.style.transform = 'scale(0.92, 1.07) translateY(6px)';

    setTimeout(() => {
      // Outward gentle relaxing sway
      body.style.transform = 'scale(1.05, 0.95) translateY(-4px)';
      setTimeout(() => {
        body.style.transform = 'scale(0.98, 1.02) translateY(2px)';
        setTimeout(() => {
          body.style.transform = '';
          body.style.transition = '';
        }, 400);
      }, 400);
    }, 450);
  }

  /**
   * Subtle curious head tilt when she speaks spontaneously
   */
  spontaneousChatterGlance() {
    const body = document.getElementById('huptiAvatar');
    if (!body || this.isSquishing) return;

    body.style.transition = 'transform 0.3s ease';
    body.style.transform = 'rotate(2.6deg) translateY(-6px)';

    setTimeout(() => {
      body.style.transform = 'rotate(-1.2deg) translateY(-2px)';
      setTimeout(() => {
        body.style.transform = '';
        body.style.transition = '';
      }, 300);
    }, 320);
  }

  updateEyes(mood) {
    const eyeL = document.getElementById('eyeL');
    const eyeR = document.getElementById('eyeR');
    const eyeLids = document.querySelectorAll('.hupti-eye-lid');
    const eyePupils = document.querySelectorAll('.hupti-pupil-group');
    const eyeScleras = document.querySelectorAll('.hupti-eye-sclera');
    const eyeLashes = document.querySelectorAll('.hupti-lash');
    const happyEyes = document.querySelectorAll('.hupti-happy-eye');
    const sleepEyes = document.querySelectorAll('.hupti-sleep-eye');
    const sadTears = document.querySelectorAll('.hupti-tear-drop');

    // Reset visibility and transforms
    happyEyes.forEach(el => el.style.opacity = '0');
    sleepEyes.forEach(el => el.style.opacity = '0');
    eyePupils.forEach(el => el.style.opacity = '1');
    eyeScleras.forEach(el => el.style.opacity = '1');
    eyeLashes.forEach(el => el.style.opacity = '1');
    sadTears.forEach(el => el.style.opacity = '0');

    if (eyeL) eyeL.style.transform = '';
    if (eyeR) eyeR.style.transform = '';
    eyeLids.forEach(el => {
      if (!el.classList.contains('blinking')) {
        el.style.transform = '';
      }
    });

    if (mood === MOODS.HAPPY || mood === MOODS.HUGGED) {
      // Kawaii smiling crescents (hide open sclera & pupil)
      eyePupils.forEach(el => el.style.opacity = '0');
      eyeScleras.forEach(el => el.style.opacity = '0');
      eyeLashes.forEach(el => el.style.opacity = '0');
      happyEyes.forEach(el => el.style.opacity = '1');
    } else if (mood === MOODS.SLEEPING) {
      // Peaceful sleeping lines (hide open sclera & pupil)
      eyePupils.forEach(el => el.style.opacity = '0');
      eyeScleras.forEach(el => el.style.opacity = '0');
      eyeLashes.forEach(el => el.style.opacity = '0');
      sleepEyes.forEach(el => el.style.opacity = '1');
    } else if (mood === MOODS.POUTED) {
      // Sassy half-lidded narrowed eyes
      eyeLids.forEach(el => el.style.transform = 'scaleY(0.68)');
    } else if (mood === MOODS.SAD) {
      // Drooping sad eyes with quivering tears
      if (eyeL) eyeL.style.transform = 'rotate(7deg)';
      if (eyeR) eyeR.style.transform = 'rotate(-7deg)';
      sadTears.forEach(el => el.style.opacity = '1');
    }
  }

  updateMouth(mood) {
    const mouthPath = document.getElementById('huptiMouth');
    const mouthTongue = document.getElementById('huptiTongue');
    if (!mouthPath) return;

    if (mouthTongue) {
      mouthTongue.style.opacity = mood === MOODS.HAPPY ? '1' : '0';
    }

    switch (mood) {
      case MOODS.HAPPY:
        // Wide cheerful open curve with tongue
        mouthPath.setAttribute('d', 'M 92 142 Q 110 162 128 142 Z');
        mouthPath.setAttribute('fill', '#992B45');
        mouthPath.setAttribute('stroke', '#661427');
        break;

      case MOODS.HUGGED:
        // Tender sweet cozy smile
        mouthPath.setAttribute('d', 'M 95 142 Q 110 156 125 142');
        mouthPath.setAttribute('fill', 'none');
        mouthPath.setAttribute('stroke', '#5A3D4A');
        break;

      case MOODS.POUTED:
        // Cute wavy disgruntled pout
        mouthPath.setAttribute('d', 'M 96 148 Q 104 140 110 144 Q 116 148 124 142');
        mouthPath.setAttribute('fill', 'none');
        mouthPath.setAttribute('stroke', '#5A3D4A');
        break;

      case MOODS.SAD:
        // Gentle quivering downward arc
        mouthPath.setAttribute('d', 'M 95 150 Q 110 138 125 150');
        mouthPath.setAttribute('fill', 'none');
        mouthPath.setAttribute('stroke', '#5A3D4A');
        break;

      case MOODS.SLEEPING:
        // Tiny relaxed sleeping dot / crescent
        mouthPath.setAttribute('d', 'M 104 145 Q 110 148 116 145');
        mouthPath.setAttribute('fill', 'none');
        mouthPath.setAttribute('stroke', '#785A6B');
        break;

      case MOODS.SURPRISED:
        // Small round surprised 'O'
        mouthPath.setAttribute('d', 'M 104 142 A 6 7 0 1 0 116 142 A 6 7 0 1 0 104 142');
        mouthPath.setAttribute('fill', '#992B45');
        mouthPath.setAttribute('stroke', '#5A3D4A');
        break;

      case MOODS.EATING:
        // Nom nom chew
        mouthPath.setAttribute('d', 'M 98 144 Q 110 156 122 144 Z');
        mouthPath.setAttribute('fill', '#992B45');
        mouthPath.setAttribute('stroke', '#661427');
        break;

      case MOODS.IDLE:
      default:
        // Gentle warm cat / dune smile
        mouthPath.setAttribute('d', 'M 96 142 Q 103 147 110 143 Q 117 147 124 142');
        mouthPath.setAttribute('fill', 'none');
        mouthPath.setAttribute('stroke', '#5A3D4A');
        break;
    }
  }

  updateBlush(mood) {
    const blushL = document.getElementById('blushL');
    const blushR = document.getElementById('blushR');
    const blushMarks = document.querySelectorAll('.hupti-blush-mark');

    if (!blushL || !blushR) return;

    if (mood === MOODS.HUGGED) {
      // Extra rosy pink & glowing warmth for hug
      blushL.style.opacity = '1';
      blushR.style.opacity = '1';
      blushL.setAttribute('r', '19');
      blushR.setAttribute('r', '19');
      blushMarks.forEach(m => m.style.opacity = '0.95');
    } else if (mood === MOODS.HAPPY || mood === MOODS.EATING) {
      blushL.style.opacity = '0.9';
      blushR.style.opacity = '0.9';
      blushL.setAttribute('r', '17');
      blushR.setAttribute('r', '17');
      blushMarks.forEach(m => m.style.opacity = '0.8');
    } else if (mood === MOODS.SAD) {
      blushL.style.opacity = '0.12';
      blushR.style.opacity = '0.12';
      blushL.setAttribute('r', '11');
      blushR.setAttribute('r', '11');
      blushMarks.forEach(m => m.style.opacity = '0');
    } else if (mood === MOODS.POUTED) {
      blushL.style.opacity = '0.75';
      blushR.style.opacity = '0.75';
      blushL.setAttribute('r', '15');
      blushR.setAttribute('r', '15');
      blushMarks.forEach(m => m.style.opacity = '0.4');
    } else {
      // Idle / Normal
      blushL.style.opacity = '0.55';
      blushR.style.opacity = '0.55';
      blushL.setAttribute('r', '13');
      blushR.setAttribute('r', '13');
      blushMarks.forEach(m => m.style.opacity = '0.35');
    }
  }

  startChewing() {
    let frame = 0;
    const mouthPath = document.getElementById('huptiMouth');
    if (this.chewTimer) clearInterval(this.chewTimer);

    this.chewTimer = setInterval(() => {
      if (this.mood !== MOODS.EATING) {
        clearInterval(this.chewTimer);
        return;
      }
      frame++;
      if (frame % 2 === 0) {
        mouthPath.setAttribute('d', 'M 98 144 Q 110 156 122 144 Z');
        mouthPath.setAttribute('fill', '#992B45');
        this.squish(1.05, 0.96, 120);
      } else {
        mouthPath.setAttribute('d', 'M 101 144 Q 110 148 119 144');
        mouthPath.setAttribute('fill', 'none');
      }
    }, 180);
  }

  /**
   * Particle generation helpers
   */
  spawnHeartsBurst(count = 6) {
    const rect = this.container.getBoundingClientRect();
    const originX = rect.width / 2;
    const originY = rect.height / 2 - 20;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'heart',
        x: originX + (Math.random() - 0.5) * 80,
        y: originY + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 2 + 1.5),
        size: Math.random() * 8 + 12,
        opacity: 1,
        fadeSpeed: 0.015,
        color: ['#FF6584', '#FF8DA1', '#FF4E78', '#FFB4C4'][Math.floor(Math.random() * 4)],
        rotation: (Math.random() - 0.5) * 0.4
      });
    }
  }

  spawnZzzBurst() {
    const rect = this.container.getBoundingClientRect();
    const originX = rect.width / 2 + 50;
    const originY = rect.height / 2 - 40;

    this.particles.push({
      type: 'text',
      text: Math.random() < 0.5 ? 'Z' : 'z',
      x: originX,
      y: originY,
      vx: 0.5 + Math.random() * 0.5,
      vy: -(0.8 + Math.random() * 0.5),
      size: 16 + Math.random() * 8,
      opacity: 0.9,
      fadeSpeed: 0.008,
      waveOffset: Math.random() * Math.PI,
      color: '#B6A6CA'
    });
  }

  spawnTreatCrumbs() {
    const rect = this.container.getBoundingClientRect();
    const originX = rect.width / 2;
    const originY = rect.height / 2 + 25;

    // First: a falling strawberry treat toward her mouth
    this.particles.push({
      type: 'treatItem',
      x: originX,
      y: originY - 90,
      vx: 0,
      vy: 2.8,
      size: 18,
      opacity: 1,
      targetY: originY - 10,
      fadeSpeed: 0,
      color: '#FF6584'
    });

    // Burst of colorful crumbs & star sparkles
    setTimeout(() => {
      for (let i = 0; i < 14; i++) {
        this.particles.push({
          type: 'crumb',
          x: originX + (Math.random() - 0.5) * 35,
          y: originY,
          vx: (Math.random() - 0.5) * 3.5,
          vy: -(Math.random() * 2.5 + 1.2),
          gravity: 0.1,
          size: Math.random() * 4 + 2,
          opacity: 1,
          fadeSpeed: 0.022,
          color: ['#FF9EAA', '#FFE494', '#FFB7B2', '#FFFFFF', '#FFD166'][Math.floor(Math.random() * 5)]
        });
      }
    }, 280);
  }

  spawnTearBurst() {
    const rect = this.container.getBoundingClientRect();
    const originX = rect.width / 2;
    const originY = rect.height / 2 + 10;

    for (let i = 0; i < 4; i++) {
      this.particles.push({
        type: 'tear',
        x: originX + (i % 2 === 0 ? -35 : 35) + (Math.random() - 0.5) * 6,
        y: originY,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 1.5 + 0.5,
        gravity: 0.06,
        size: Math.random() * 3 + 3,
        opacity: 0.8,
        fadeSpeed: 0.015,
        color: '#89CFF0'
      });
    }
  }

  /**
   * Main render loop using requestAnimationFrame
   */
  startRenderLoop() {
    const render = (time) => {
      const dt = (time - this.lastFrameTime) / 1000;
      this.lastFrameTime = time;

      // 1. Lerp pupils smoothly toward target
      const lerpSpeed = 0.15;
      this.currentPupilX += (this.targetPupilX - this.currentPupilX) * lerpSpeed;
      this.currentPupilY += (this.targetPupilY - this.currentPupilY) * lerpSpeed;

      const pupils = document.querySelectorAll('.hupti-pupil-group');
      pupils.forEach(pupil => {
        pupil.setAttribute('transform', `translate(${this.currentPupilX}, ${this.currentPupilY})`);
      });

      // 2. Periodic sleep Zzz emitter
      if (this.mood === MOODS.SLEEPING && Math.random() < 0.025) {
        this.spawnZzzBurst();
      }

      // 3. Render Canvas Particles
      this.renderParticles();

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  renderParticles() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.cssWidth || 600, this.cssHeight || 600);

    // Render ambient dust motes
    for (let i = 0; i < this.ambientParticles.length; i++) {
      const p = this.ambientParticles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y < -10) p.y = (this.cssHeight || 600) + 10;
      if (p.x < -10) p.x = (this.cssWidth || 600) + 10;
      if (p.x > (this.cssWidth || 600) + 10) p.x = -10;

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Render dynamic active particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.opacity -= p.fadeSpeed;

      if (p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);

      if (p.type === 'heart') {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation || 0);
        this.ctx.fillStyle = p.color;
        this.drawHeart(this.ctx, 0, 0, p.size);
      } else if (p.type === 'treatItem') {
        // Falling treat item (strawberry candy)
        if (p.y >= p.targetY) {
          p.opacity -= 0.15;
        }
        this.ctx.translate(p.x, p.y);
        // Draw strawberry mochi
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        // cute green leaf
        this.ctx.fillStyle = '#70C1B3';
        this.ctx.beginPath();
        this.ctx.ellipse(0, -p.size / 2, 3, 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // shine dot
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(-2, -2, 1.8, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === 'text') {
        p.x += Math.sin(p.y * 0.03 + (p.waveOffset || 0)) * 0.6;
        this.ctx.fillStyle = p.color;
        this.ctx.font = `bold ${p.size}px "Fredoka", "Quicksand", sans-serif`;
        this.ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'tear') {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // crumb / spark
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }

  drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    // top left curve
    ctx.bezierCurveTo(
      x, y, 
      x - size / 2, y, 
      x - size / 2, y + topCurveHeight
    );
    // bottom left curve
    ctx.bezierCurveTo(
      x - size / 2, y + (size + topCurveHeight) / 2, 
      x, y + (size + topCurveHeight) / 1.5, 
      x, y + size
    );
    // bottom right curve
    ctx.bezierCurveTo(
      x, y + (size + topCurveHeight) / 1.5, 
      x + size / 2, y + (size + topCurveHeight) / 2, 
      x + size / 2, y + topCurveHeight
    );
    // top right curve
    ctx.bezierCurveTo(
      x + size / 2, y, 
      x, y, 
      x, y + topCurveHeight
    );
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Apply head accessory (Blossoms, Sprout, Grad Cap, Ribbon)
   */
  applyAccessory(accessoryId) {
    const container = document.getElementById('headAccessoryContent');
    if (!container) return;

    const templates = {
      sakura: `
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
      `,
      sunflower: `
        <path d="M 0 0 C -2 -7, 0 -13, 2 -16" stroke="#52B788" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <path d="M 0 -7 C -5 -9, -6 -14, -1 -12 Z" fill="#74C69D"/>
        <g transform="translate(2, -18) scale(0.65)">
          <circle cx="0" cy="-8" r="4.8" fill="#FFD166"/>
          <circle cx="5.6" cy="-5.6" r="4.8" fill="#FFC043"/>
          <circle cx="8" cy="0" r="4.8" fill="#FFD166"/>
          <circle cx="5.6" cy="5.6" r="4.8" fill="#FFC043"/>
          <circle cx="0" cy="8" r="4.8" fill="#FFD166"/>
          <circle cx="-5.6" cy="5.6" r="4.8" fill="#FFC043"/>
          <circle cx="-8" cy="0" r="4.8" fill="#FFD166"/>
          <circle cx="-5.6" cy="-5.6" r="4.8" fill="#FFC043"/>
          <circle cx="0" cy="0" r="5.4" fill="#6B4423"/>
          <circle cx="-1.2" cy="-1.2" r="1.4" fill="#996035"/>
        </g>
      `,
      snowdrop: `
        <path d="M 0 0 C -2 -7, 0 -13, 2 -16" stroke="#70C1B3" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <g transform="translate(2, -18) scale(0.72)">
          <path d="M 0 -8 C -4 -2, -5 6, 0 8 C 5 6, 4 -2, 0 -8 Z" fill="#E2F4FD"/>
          <path d="M -5 -4 C -8 0, -8 6, -3 8 C -1 6, -3 0, -5 -4 Z" fill="#BFE3F7"/>
          <path d="M 5 -4 C 8 0, 8 6, 3 8 C 1 6, 3 0, 5 -4 Z" fill="#BFE3F7"/>
          <circle cx="0" cy="-7" r="2.2" fill="#8CE0D0"/>
        </g>
      `,
      sprout: `
        <path d="M 0 0 C -1 -6, 0 -12, 1 -15" stroke="#52B788" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <g transform="translate(1, -15) scale(0.85)">
          <path d="M -1 0 C -8 -4, -10 -12, -2 -11 C -2 -4, -1 -1, -1 0 Z" fill="#8CE0D0"/>
          <path d="M 1 0 C 8 -4, 10 -12, 2 -11 C 2 -4, 1 -1, 1 0 Z" fill="#52B788"/>
        </g>
      `,
      gradcap: `
        <g transform="translate(2, -16) scale(0.82)">
          <polygon points="0,-10 14,-2 0,6 -14,-2" fill="#2E2538"/>
          <polygon points="0,-8 11,-2 0,4 -11,-2" fill="#3D324A"/>
          <rect x="-6" y="2" width="12" height="6" rx="2" fill="#241B2D"/>
          <circle cx="0" cy="-2" r="1.6" fill="#FFD166"/>
          <path d="M 0 -2 Q 9 2 10 10" stroke="#FFD166" stroke-width="1.4" fill="none"/>
          <circle cx="10" cy="11" r="1.4" fill="#FFA500"/>
        </g>
      `,
      ribbon: `
        <g transform="translate(2, -16) scale(0.78)">
          <path d="M -1 -2 C -10 -10, -12 6, -1 1 Z" fill="#FF83A0"/>
          <path d="M -1 -1 C -7 -7, -9 4, -1 1 Z" fill="#FFA5BA"/>
          <path d="M 1 -2 C 10 -10, 12 6, 1 1 Z" fill="#FF83A0"/>
          <path d="M 1 -1 C 7 -7, 9 4, 1 1 Z" fill="#FFA5BA"/>
          <path d="M -2 2 Q -6 10 -8 14" stroke="#FF6584" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="M 2 2 Q 6 10 8 14" stroke="#FF6584" stroke-width="2" stroke-linecap="round" fill="none"/>
          <circle cx="0" cy="0" r="3.2" fill="#FF527B"/>
          <circle cx="-0.8" cy="-0.8" r="1" fill="#FFFBE6"/>
        </g>
      `
    };

    container.innerHTML = templates[accessoryId] || templates.sakura;
  }

  /**
   * Toggle study wireframe glasses
   */
  setGlasses(show) {
    const glasses = document.getElementById('accessoryGlasses');
    if (!glasses) return;
    glasses.style.display = show ? 'inline' : 'none';
  }

  /**
   * Apply color tint to body gradient & theme
   */
  applyTint(tintId) {
    document.documentElement.setAttribute('data-tint', tintId);
    
    const gradLight = document.getElementById('huptiBodyGradient');
    const gradDark = document.getElementById('huptiBodyDarkGradient');

    const tints = {
      strawberry: {
        light: ['#FFFFFF', '#FFF3F7', '#FFE4EE'],
        dark: ['#FAF5FF', '#EADBFF', '#D5BFFF']
      },
      lavender: {
        light: ['#FFFFFF', '#F8F3FF', '#EDE0FF'],
        dark: ['#F5EFFF', '#DFCBFC', '#C4A5FA']
      },
      sage: {
        light: ['#FFFFFF', '#F2FAF5', '#DCF2E4'],
        dark: ['#EBF7EF', '#C8E8D3', '#A0D4B2']
      },
      peach: {
        light: ['#FFFFFF', '#FFF6F0', '#FFE7D6'],
        dark: ['#FFF1E6', '#FED1B2', '#FDB180']
      },
      sky: {
        light: ['#FFFFFF', '#F0F8FF', '#D8ECFD'],
        dark: ['#E5F3FD', '#BADBF9', '#8AC2F4']
      }
    };

    const scheme = tints[tintId] || tints.strawberry;

    if (gradLight) {
      const stops = gradLight.querySelectorAll('stop');
      if (stops.length >= 3) {
        stops[0].setAttribute('stop-color', scheme.light[0]);
        stops[1].setAttribute('stop-color', scheme.light[1]);
        stops[2].setAttribute('stop-color', scheme.light[2]);
      }
    }

    if (gradDark) {
      const stops = gradDark.querySelectorAll('stop');
      if (stops.length >= 3) {
        stops[0].setAttribute('stop-color', scheme.dark[0]);
        stops[1].setAttribute('stop-color', scheme.dark[1]);
        stops[2].setAttribute('stop-color', scheme.dark[2]);
      }
    }
  }
}

// Expose globally
window.HuptiRenderer = HuptiRenderer;
