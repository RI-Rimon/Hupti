# 🌸 Hupti (হুপ্তি) — The Expressive Virtual Pet Companion

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hupti.vercel.app-ff6584?style=for-the-badge&logo=vercel&logoColor=white)](https://hupti.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-RI--Rimon%2FHupti-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RI-Rimon/Hupti)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural%20Web%20Audio-7952B3?style=for-the-badge&logo=web-audio-api&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Document PiP](https://img.shields.io/badge/Window-Document%20PiP-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/web-platform/document-picture-in-picture/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20External%20Libs-success?style=for-the-badge)](https://github.com/RI-Rimon/Hupti)

> A minimalist, responsive, and heartwarming virtual companion that lives directly in your browser or floats over your desktop work. Crafted with fluid vector animations, procedural acoustic pet vocalizations, and zero external framework bloat.

---

## 📑 Table of Contents

- [The Story Behind Hupti](#-the-story-behind-hupti)
- [Character Concept & Identity](#-character-concept--identity)
- [How Hupti Works (Architecture)](#-how-hupti-works-architecture)
- [Key Features](#-key-features)
- [Interactive Controls & Shortcuts](#-interactive-controls--shortcuts)
- [Technical Stack & Design Decisions](#-technical-stack--design-decisions)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Future Roadmap & Ideas](#-future-roadmap--ideas)
- [Credits & Acknowledgments](#-credits--acknowledgments)

---

## 📖 The Story Behind Hupti

Hupti began during a late-night exam preparation session when studying for long hours started to feel overwhelming, isolating, and monotonous. 

Staring at walls of technical documentation and lecture slides, the idea was born: **what if there was a gentle, quiet presence on the screen—a small digital friend who doesn't demand high-maintenance gaming loops, but simply responds warmly to gentle affection, sits quietly beside your workflow, and occasionally surprises you with a comforting thought?**

The character's identity, visual aesthetic, emotional lifecycle, and system architecture were deliberately planned to evoke tranquility:
- **No realistic animal stereotypes:** Hupti is not strictly a cat, bird, or dog. She is an abstract, squishy, kawaii essence of warmth.
- **Thoughtful Interaction Design:** Soft pastel gradients, fluid SVG eyes that track your cursor, subtle breathing pulses, and blushing cheeks.
- **Ethical & Relaxing Audio:** No loud, jarring chimes or robotic text-to-speech voices reading text aloud. Her thoughts appear silently in written form, accompanied only by warm, organic procedural acoustic purrs and coos.

Implementation and iterative refinement were developed with the assistance of **Anti Gravity** (Google DeepMind's advanced agentic coding environment). Hupti stands as a personal exploration in blending frontend craft, dynamic SVG vector animation, procedural browser acoustics, and human-centered emotional design into a delightful micro-experience.

---

## 🌸 Character Concept & Identity

| Attribute | Specification |
| :--- | :--- |
| **Name** | **Hupti** (pronounced *Hup-tee*) |
| **Persona** | Affectionate, slightly playful, empathetic, and sweet. |
| **Visual Motif** | A 5-petal pink blossom with a golden pollen core—symbolizing fresh energy, soft resilience, and blooming warmth. |
| **Aesthetic** | Soft pastel minimalism (gentle strawberry blush, cream whites, lavender night shadows). |
| **Communication** | **100% Non-Verbal Vocalizations + Written Thoughts.** Dialogue appears in a clean typewriter subtitle card; audio is synthesized procedurally via oscillators. |

---

## 🧠 How Hupti Works (Architecture)

Hupti is engineered from the ground up without heavy external dependencies or runtime frameworks (such as React, Vue, or Three.js). The entire system relies on clean, modular Vanilla JavaScript conforming to the **Observer Pattern**.

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                       USER INPUTS                           │
 │   Pointer Gestures (Forehead Stroke, Cheek Poke, Tap)       │
 │   Keyboard Shortcuts (P, T, H, S, W, R, F, M, O)            │
 │   Action Buttons & Tab Visibility (Document PiP Auto-Dock)  │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                      InputHandler.js                        │
 │   Normalizes pointer coordinates, tracks swipe distance,     │
 │   dispatches intent, and drives real-time pupil tracking    │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                       HuptiState.js                         │
 │   Central State Machine & Observer Hub                      │
 │   - Mood States: IDLE, HAPPY, HUGGED, POUTED, SAD, SLEEP    │
 │   - Autonomous Idle Chatter Timer (12–20s interval)         │
 │   - Affection Level (0–100%) & Treat Counter                │
 │   - LocalStorage State Persistence Engine                   │
 └──────┬───────────────────────┬───────────────────────┬──────┘
        │                       │                       │
        ▼                       ▼                       ▼
 ┌───────────────┐       ┌──────────────┐       ┌───────────────┐
 │HuptiRenderer  │       │  SoundFX.js  │       │ PiPManager.js │
 │- SVG morphing │       │- Web Audio   │       │- Document PiP │
 │- Eye tracking │       │  Oscillators │       │- Video Stream │
 │- Squish/bounce│       │- Filter Envs │       │  Fallback     │
 │- Canvas hearts│       │- Zero audio  │       │- Bi-direction │
 │  & treats     │       │  file assets │       │  State Sync   │
 └───────────────┘       └──────────────┘       └───────────────┘
```

### Module Breakdown:

1. **[`js/huptistate.js`](file:///c:/Users/redwa/OneDrive/Desktop/Test%20for%20antigravity/Vertual%20Pet/js/huptistate.js) — The Core State Machine:**
   - Governs Hupti's emotional model, affection percentages, and treat counts.
   - Implements an autonomous idle timer: if no interaction occurs for 12–20 seconds while awake, Hupti autonomously shares a sweet or motivational thought.
   - Automatically serializes and reloads state to `window.localStorage` so affection and treat memories persist across browser sessions.

2. **[`js/huptirenderer.js`](file:///c:/Users/redwa/OneDrive/Desktop/Test%20for%20antigravity/Vertual%20Pet/js/huptirenderer.js) — Dynamic Visual Engine:**
   - Controls vector SVG elements (morphing eye paths, dynamic sclera clipping, smiling/pouting mouth arcs, cheek blush opacities).
   - Renders a lightweight HTML5 `<canvas>` particle engine for bursting floating hearts and falling strawberry mochi treats.
   - Implements spring-interpolated pupil tracking so Hupti's eyes smoothly follow your cursor.

3. **[`js/soundfx.js`](file:///c:/Users/redwa/OneDrive/Desktop/Test%20for%20antigravity/Vertual%20Pet/js/soundfx.js) — Procedural Web Audio Engine:**
   - Generates 100% of sound effects dynamically using math and the browser's native `AudioContext`.
   - Utilizes `OscillatorNode` (sine, triangle), `BiquadFilterNode`, and exponential gain envelopes to synthesize soft vibrating purrs, rising affectionate chord swells, cute boops, and snores without loading any external `.mp3` or `.wav` files.

4. **[`js/pipmanager.js`](file:///c:/Users/redwa/OneDrive/Desktop/Test%20for%20antigravity/Vertual%20Pet/js/pipmanager.js) — Always-on-Top Floating Companion:**
   - Implements the cutting-edge **Document Picture-in-Picture API** (`window.documentPictureInPicture`), enabling Hupti to break free from the browser tab into an always-on-top frameless floating mini desktop widget (~310×345px).
   - Includes an offscreen HTML5 Canvas stream fallback (`canvas.captureStream()` → `video.requestPictureInPicture()`) for browsers that only support standard video PiP.
   - Bi-directionally synchronizes theme, mood, dialog, and audio between the main tab and floating window.

5. **[`js/inputhandler.js`](file:///c:/Users/redwa/OneDrive/Desktop/Test%20for%20antigravity/Vertual%20Pet/js/inputhandler.js) & [`js/app.js`](file:///c:/Users/redwa/OneDrive/Desktop/Test%20for%20antigravity/Vertual%20Pet/js/app.js):**
   - Coordinates keyboard shortcuts, mouse/touch drag strokes on Hupti's forehead, cheek pokes, theme switching, typewriter dialogue transitions, and feedback handling.

---

## 🚀 Key Features

### 1. ⤢ Picture-in-Picture Floating Mini Companion
- **Always-on-Top Floating Mode:** Click the PiP icon in the header or press shortcut **`O`** to pop Hupti into a dedicated floating window that stays on top of all desktop apps (VS Code, Word, Zoom, Discord, etc.).
- **Fully Interactive in Mini View:**
  - Animated SVG face with real-time pupil tracking.
  - Live written subtitle thoughts card.
  - Interactive quick buttons (💖 Pet, 🤗 Hug, 💤 Sleep/Wake, 🍬 Treat).
  - Tapping her face directly inside the mini window triggers affectionate heart bursts.
- **Auto-Switch & Docking:** Hupti can automatically transfer into floating mode when you switch browser tabs and seamlessly dock back when you return.

### 2. 🤗 Virtual Embrace (Warm Hugs)
- Press **`H`** or click **🤗 Hug** to give Hupti a warm virtual embrace.
- Her eyes gently close, cheeks glow with deep rosy radiance, floating hearts ascend, and a soft harmonic chord swell plays as she snuggles closer.

### 3. 💭 Autonomous Heartwarming Thoughts
- Hupti doesn't just sit frozen: when you are busy working, every 12–20 seconds she shares gentle, uplifting thoughts:
  - *"You are my sweet human, you know that?"*
  - *"Don't forget to take care of yourself today! Have a sip of water."*
  - *"Waiting to get a sweet hug from you... 💖"*
  - *"You're doing amazing, even if things feel tough. I'm right here!"*
  - *"Just sitting here appreciating how kind you are to me."*

### 4. 🎶 Organic Procedural Pet Acoustics
- Zero robotic text-to-speech voices. Hupti's vocalizations are entirely procedural pet sounds:
  - **💖 Pet:** Rhythmic soft purr vibrating in tandem with gentle melodic chirps.
  - **🤗 Hug:** Warm ascending musical chord swell.
  - **🍬 Treat:** Playful double-crunch munching chime.
  - **👉 Poke:** High-pitched, playful surprised squeak / "boop".
  - **💤 Sleep / ☀️ Wake:** Descending sleepy sigh lullaby / bright morning chime.
  - **✨ Idle Chatter:** Subtle bell ping alerting you that a new thought has appeared in text.

### 5. 💾 Browser State Persistence
- Progress is never lost: your **"Treats Enjoyed"** counter and **Affection / Happiness percentage** are safely stored in browser `localStorage`.
- Reopening or refreshing the page instantly restores your relationship with Hupti.

### 6. 🌗 Cozy Pastel Day & Night Themes
- One-click toggle between an airy warm cream/blush day palette and a deep lavender dark mode designed for late-night study sessions.

### 7. 💌 Privacy-Preserving Feedback System
- A discreet bottom-docked feedback modal lets visitors rate Hupti and share thoughts without exposing sensitive developer credentials in the DOM.

---

## 🎮 Interactive Controls & Shortcuts

| Action | Shortcut Key | Gesture / Mouse / Touch | Reaction |
| :--- | :---: | :--- | :--- |
| **💖 Pet** | `P` | Click or stroke back and forth across her forehead | Purrs happily, winks, raises affection |
| **👉 Poke** | `T` | Click left or right squishy cheek | Surprised boop squeak; pouts if teased too much |
| **🤗 Hug** | `H` | Click **🤗 Hug** button | Closes eyes, glows rosy, harmonic chord swell |
| **🍬 Treat** | `F` | Click **🍬 Treat** button | Drops strawberry mochi, happy munching sound |
| **💤 Sleep** | `S` | Click **💤 Sleep** button | Dims the room, drifts into sweet dreams with quiet snores |
| **☀️ Wake Up** | `W` | Gently tap anywhere on Hupti while sleeping | Cheerful morning yawn and chirp |
| **😠 Scold** | `R` | Click **😠 Scold** button | Gentle sad sigh, temporarily deflates cheeks |
| **⤢ Floating PiP** | `O` | Click PiP icon in header | Pops Hupti into an always-on-top desktop mini window |
| **🔇 Toggle Audio** | `M` | Click speaker icon in header | Mutes/unmutes procedural audio effects |
| **🌙 Day/Night** | — | Click sun/moon icon in header | Smoothly toggles between light and night themes |

---

## 🛠️ Technical Stack & Design Decisions

- **HTML5 & SVG:** Semantic markup and mathematical SVG coordinate vectors allowing infinite resolution scaling without raster pixelation.
- **Pure CSS3:** Hardware-accelerated CSS keyframe transforms (`translate3d`, `scale`) for 60fps breathing and floating idle cycles.
- **Vanilla JavaScript (ES6+):** Zero compilation steps, zero external dependencies, near-instant load time (< 80 KB total asset weight).
- **Web Audio API:** Procedural synthesis eliminates 100% of network latency, audio loading errors, and copyright issues.
- **Document Picture-in-Picture API:** Provides full DOM rendering and interactive event loops inside a floating OS-level window.

---

## 💻 Quick Start & Local Setup

### 🌐 Instant Web Access
No installation required! Visit the live deployment:
👉 **[https://hupti.vercel.app/](https://hupti.vercel.app/)**

### 💻 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RI-Rimon/Hupti.git
   cd Hupti
   ```

2. **Launch with Node.js built-in server:**
   ```bash
   node server.js
   ```
   Open your browser to [**http://localhost:8080**](http://localhost:8080).

3. *Alternatively*, open [`index.html`](file:///c:/Users/redwa/OneDrive/Desktop/Test%20for%20antigravity/Vertual%20Pet/index.html) directly in any modern browser (Chrome 116+ recommended for full Document PiP support).

---

## 🔮 Future Roadmap & Ideas

Hupti is an evolving project. Below are planned features and conceptual directions under exploration:

- [ ] **🍅 Pomodoro Study Companion:**
  - Integrated 25-minute study focus timer and 5-minute break cycles.
  - Hupti puts on tiny study glasses or a graduation cap during focus intervals and gently prompts you to hydrate, stretch, or rest your eyes during breaks.
- [ ] **🎀 Custom Accessories & Seasonal Themes:**
  - Unlockable blossoms (cherry blossom, sunflower, winter snowdrop).
  - Customizable body tints (match your OS or desk setup theme).
- [ ] **🎧 Procedural Ambient Lo-Fi / Rain Soundscapes:**
  - An optional background sound generator (soft rain, gentle wind chimes, crackling fireplace) synthesized via Web Audio to assist study focus.
- [ ] **📱 Progressive Web App (PWA) Offline Support:**
  - Web App Manifest and Service Worker caching so Hupti can be installed directly onto Windows/macOS/iOS/Android and run 100% offline.
- [ ] **🎮 Cozy Micro-Interactions:**
  - A mini bouncing ball of yarn or floating bubble that Hupti's pupils track and interact with when clicked.
- [ ] **📊 Empathy Journal:**
  - A gentle, private weekly log visualizing how many hugs, treats, and study hours you and Hupti shared together.

---

## 👤 Credits & Acknowledgments

- **Concept, Design & Architecture:** Redwan Rimon ([@RI-Rimon](https://github.com/RI-Rimon))
- **AI-Assisted Pair Programming:** Built and polished with **Anti Gravity** (Google DeepMind)
- **Deployment Platform:** [Vercel](https://vercel.com/)
- **License:** Open Source under the [MIT License](LICENSE)

---

<p align="center">
  <i>"Remember to drink some water, take a deep breath, and be proud of how far you've come today." — Hupti 💖</i>
</p>
