# 🌸 Hupti — The Expressive Virtual Pet & Study Companion

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hupti.vercel.app-ff7b99?style=for-the-badge&logo=vercel)](https://hupti.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#-technical-highlights)
[![Bundle Size](https://img.shields.io/badge/Gzipped%20Transfer-~73%20KB-success?style=for-the-badge)](#-technical-highlights)

> A lightweight, responsive, and heartwarming desktop study companion built entirely with native web standards. Features fluid vector SVG animations, 8 curated procedural Web Audio soundscapes and pet vocalizations, an integrated task planner, a Pomodoro study engine, and an always-on-top floating PiP window.

<p align="center">
  <img src="assets/hupti-preview.png" alt="Hupti Interface Preview" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);" />
</p>

---

## 📑 Table of Contents

- [The Story Behind Hupti](#-the-story-behind-hupti)
- [Character Concept & Identity](#-character-concept--identity)
- [Key Features & Facilities](#-key-features--facilities)
  - [1. Personalized Onboarding & Voice](#1-personalized-onboarding--voice)
  - [2. "Taskbox" Planner & Smart Reminders](#2-taskbox-planner--smart-reminders)
  - [3. 8-Track Curated Procedural Ambient Soundboard](#3-8-track-curated-procedural-ambient-soundboard)
  - [4. Pomodoro Study Engine](#4-pomodoro-study-engine)
  - [5. Floating Picture-in-Picture Companion](#5-floating-picture-in-picture-companion)
  - [6. Wardrobe & 5 Desk Ambient Themes](#6-wardrobe--5-desk-ambient-themes)
  - [7. Emotional Lifecycle & Affection Model](#7-emotional-lifecycle--affection-model)
  - [8. Responsive Viewport & Zero-Scroll Mobile Fit](#8-responsive-viewport--zero-scroll-mobile-fit)
  - [9. Creator Spotlight & State Persistence](#9-creator-spotlight--state-persistence)
- [System Architecture](#-system-architecture)
- [Interactive Controls & Shortcuts](#-interactive-controls--shortcuts)
- [Technical Highlights](#-technical-highlights)
- [Quick Start](#-quick-start)
- [Credits & License](#-credits--license)

---

## 📖 The Story Behind Hupti

Hupti began during a late-night exam preparation session when studying for long hours started to feel overwhelming and monotonous.

The idea was to create a small companion that could sit quietly on the screen, respond to a little affection, and occasionally offer a comforting thought.

The concept, character identity, visual direction, emotional lifecycle, and overall architecture were planned as part of the project. AI-assisted coding tools, including Anti Gravity, helped with implementation and iterative refinement.

Hupti represents a personal experiment in combining frontend development, animation, browser audio, and thoughtful interaction design into a small but meaningful experience.

---

## 🌸 Character Concept & Identity

| Attribute | Specification |
| :--- | :--- |
| **Name** | **Hupti** (pronounced *Hup-tea*) |
| **Persona** | Affectionate, gentle, observant, slightly playful, and empathetic study partner. |
| **Visual Motif** | A 5-petal pink blossom with a golden pollen core—symbolizing fresh energy, soft resilience, and blooming warmth. |
| **Aesthetic** | Soft kawaii pastel minimalism (gentle strawberry blush, creamy whites, lavender twilight shadows). |
| **Communication** | **100% Non-Verbal Pet Vocalizations + Subtitle Thoughts.** Thoughts appear in a typewriter subtitle bubble; vocalizations are synthesized mathematically in real-time via the Web Audio API with zero text-to-speech robotics. |

---

## ✨ Key Features & Facilities

### 1. Personalized Onboarding & Voice
- **Name Introduction Screen:** Warm first-visit modal welcomes the user and saves their preferred name to `localStorage` (`hupti_user_name`).
- **Returning Visitor Greeting:** Returning users are greeted by name (*"Welcome back, [Name]! Ready to focus together today? 💖"*).
- **100% Non-Verbal Pet Vocalizations:** Strict acoustic policy—no robotic synthetic speech synthesis. Real-time pitch-bent chirps, purrs, and giggles synthesized via Web Audio nodes paired with subtle typewriter subtitles.
- **Companion Profile Editing:** Discrete option inside Settings to update stored name anytime.

### 2. "Taskbox" Planner & Smart Reminders
- **Header Pill with Dynamic Badge:** Quick access pill (`📝 Taskbox`) showing real-time count of pending tasks.
- **Rapid Scheduling:** Task name input with time picker and one-tap quick duration presets (`+15m`, `+25m`, `+45m`, `+60m`).
- **Live Due Countdowns:** Card statuses update in real time (`"in 18 mins"`, `"🔔 in 3 mins!"`, `"⚠️ Due now!"`).
- **Pre-Reminders (2–5 mins prior):** Plays a gentle two-tone chime and issues native browser notifications so you transition tasks without panic.
- **Focus Preservation:** Marking tasks complete does not spawn disruptive sound bursts or treat spikes, offering calm, focused encouragement.

### 3. 8-Track Curated Procedural Ambient Soundboard
Infinite study soundscapes synthesized in real time using math, noise generators, and oscillators—**zero external MP3/WAV dependencies**:

| Track | Theme | Synthesis Highlights |
| :--- | :--- | :--- |
| **☕ Cozy Lo-Fi Study Beats** | Lo-Fi Rhythm | Vinyl crackle + electric piano chords (Dm9–G13–Cmaj9) & mellow lo-fi beat |
| **🎧 Late Night Lo-Fi Chill** | Deep Lo-Fi | Slower 70 BPM Rhodes progression (Abmaj7–Gm7–Fm9), silky bassline & soft vinyl fuzz |
| **🌧️ Soft Rain & Distant Thunder** | Storm Ambience | Filtered pink rain hiss, delicate window droplet plinks & distant rolling thunder |
| **🎋 Peaceful Bamboo Flute** | Acoustic Melody | Soul-touching airy bamboo flute melody (*বাঁশির মিষ্টি সুর*) over natural morning breeze |
| **🎸 Cozy Fireside Acoustic Guitar** | Acoustic Strings | Warm fingerpicked nylon guitar chords (*অ্যাকোস্টিক গিটার*) in a repetitive slow melody |
| **🎹 Meditative Piano & Harmonium** | Melodic Bloom | Minimalist piano notes blended over warm harmonium chord drone (*হারমোনিয়াম*) |
| **🔥 Crackling Campfire** | Warm Hearth | Wood crackle transients and ember pops paired with a continuous low rumble |
| **🟤 Deep Focus Brown Noise** | Pure Focus | Smooth low-frequency brown noise with natural gentle LFO breathing wave |

*Includes synchronized top navbar dropdown, master volume slider (0–100%), and instant mute control (`M`).*

### 4. Pomodoro Study Engine
- **Standard Cycles:** 25-minute focus sprints followed by 5-minute restorative breaks.
- **Attentive Study Companion:** When focus begins, Hupti automatically puts on wireframe study glasses 👓 and displays dedicated focus encouragement (*"Focusing with you... Let's stay in the zone~ 💡"*).
- **Celebratory Completion Fanfare:** When a focus session completes, Hupti celebrates your milestone with a cheerful chime, an affectionate rosy blush glow, and a burst of floating hearts (*"Great focus session! Time for a short break~"*).
- **Controls & Metrics:** Header countdown pill (`🍅 25:00 Focus`), daily completed sprint tracker, and a 1-minute quick preview mode for testing.

### 5. Floating Picture-in-Picture Companion
- **Always-on-Top:** Utilizes the **Document Picture-in-Picture API** (with Video/Canvas fallback) to float Hupti over VS Code, Word, Zoom, or PDFs.
- **Fully Interactive Mini Window:** Synchronized vector animations, real-time pupil tracking, subtitle thoughts, Pomodoro timer, and quick action buttons.
- **Auto-Docking:** Seamlessly opens mini companion when switching browser tabs.

### 6. Wardrobe & 5 Desk Ambient Themes
Accessible via ribbon button or shortcut `C` with clean 3-tab navigation:
- **🌸 Accessories:** Sakura blossom, Sunflower 🌻, Snowdrop ❄️, Sprout 🌱, Scholar cap 🎓, Pastel ribbon 🎀, and Wireframe study glasses 👓.
- **🎨 Body Color Tints:** Strawberry Cream (default), Lavender Twilight, Mint Sage, Honey Peach, and Sky Blue.
- **🖼️ 5 Desk Ambient Background Presets:**
  - *Default Pastel:* Balanced soft cream & blush aesthetic.
  - *Sunflower Glow:* Warm golden-hour floral illumination.
  - *Cherry Blossom (Sakura):* Gentle spring blush pink.
  - *Rainy Drizzle:* Deep calming slate-blue rainy atmosphere.
  - *Twilight Horizon:* Serene evening violet and soft rose tones.
- *Saved permanently in `localStorage` (`hupti_bg_theme`), giving you full aesthetic control.*

### 7. Emotional Lifecycle & Affection Model
- **Forehead Petting:** Stroke across her forehead to hear affectionate purrs and raise affection.
- **Cheek Poking:** Tap squishy cheeks for playful surprised squeaks (pouts if teased repeatedly).
- **Warm Hugs:** Deep rosy blush, closed eyes, and ascending chord swells.
- **Strawberry Treats:** Spawns falling mochi treats with munching sounds, incrementing affection and treat stats.
- **Sleep & Wake Cycles:** Dims environment into rhythmic snores; gentle tap wakes her with a cheerful morning yawn.
- **Gentle Rebukes:** Soft sad sigh that temporarily deflates cheek puffiness.
- **Autonomous Idle Thoughts:** Typewriter subtitle reflections every 12–20 seconds when left idle.

### 8. Responsive Viewport & Zero-Scroll Mobile Fit
- **Desktop Wide-Corner Alignment:** Brand logo securely anchored to top-left; action controls grouped to top-right (Row 1 icon buttons + Row 2 Music & Taskbox pills); avatar and dialogue centered with zero clutter.
- **Strict 100dvh Mobile Fit:** Locked mobile viewport (`overflow: hidden; touch-action: none;`) eliminating page jumping, pull-to-refresh conflicts, and scrollbars on smartphones.

### 9. Creator Spotlight & State Persistence
- **About Creator Capsule:** Low-opacity pill at the bottom-left corner opening a minimalist card with direct [LinkedIn](https://www.linkedin.com/in/redwanul-rimon/) connectivity.
- **Full State Retention:** User name, tasks, affection levels, treat count, wardrobe selections, background themes, and day/night mode are automatically saved in `localStorage`.
- **Universal High Contrast:** Thoughtfully styled frosted-glass pills and borders ensure legibility across all backgrounds in both light and dark modes.

---

## 🧠 System Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              USER INPUTS                               │
 │   Pointer Gestures (Pet, Poke, Tap)  │ Keyboard Shortcuts (P, H, S...) │
 │   Taskbox Management & Scheduling    │ UI Modals & Ambient Selector    │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           InputHandler.js                              │
 │   Normalizes pointer coordinates, tracks stroke distance & swipe,      │
 │   handles global keyboard shortcuts, and drives pupil tracking         │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                            HuptiState.js                               │
 │   Central State Machine & Observer Hub                                 │
 │   - Mood States: IDLE, HAPPY, HUGGED, POUTED, SAD, SLEEPING, EATING    │
 │   - Pomodoro Focus Engine (25m Focus / 5m Break Cycles)                │
 │   - Wardrobe Accessories, Tints & 5 Ambient Background Presets         │
 │   - Affection Level (0–100%), Treats Counter & LocalStorage Sync       │
 └──────┬────────────────────┬────────────────────┬────────────────────┬──┘
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
 ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
 │HuptiRenderer │     │  SoundFX.js  │     │ PiPManager.js│     │  ES Modules  │
 │- Vector SVGs │     │- Web Audio   │     │- Document PiP│     │- main.js     │
 │- Eye tracking│     │  Synthesis   │     │- Video Stream│     │- modals.js   │
 │- Particle FX │     │- 8 Curated   │     │  Fallback    │     │- taskbox.js  │
 │- Accessories │     │  Soundscapes │     │- State Sync  │     │- feedback.js │
 │              │     │              │     │              │     │- pet.js      │
 └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 🎮 Interactive Controls & Shortcuts

| Action | Key | Mouse / Touch Gesture | Reaction |
| :--- | :---: | :--- | :--- |
| **💖 Pet** | `P` | Click or stroke across forehead | Purrs happily, winks, raises affection |
| **👉 Poke** | `K` | Click left or right squishy cheek | Surprised squeak; pouts if poked repeatedly |
| **✨ Boop** | `B` | Tap nose / center of face | Playful chirp and squish reaction |
| **🤗 Hug** | `H` | Click **🤗 Hug** button | Closes eyes, glows rosy, harmonic chord swell |
| **🍬 Treat** | `T` | Click **🍬 Treat** button | Drops strawberry mochi, happy munching sound |
| **💤 Sleep** | `Z` | Click **💤 Sleep** button | Dims room, drifts into sweet dreams with quiet snores |
| **☀️ Wake Up** | `W` | Tap anywhere on Hupti while sleeping | Cheerful morning yawn and chirp |
| **😠 Scold** | `S` | Click **😠 Scold** button | Gentle sad sigh, temporarily deflates cheeks |
| **📝 Taskbox** | — | Click **Taskbox** button | Opens focus task planner and pre-reminder list |
| **⤢ Floating PiP** | `O` | Click PiP icon in header | Pops Hupti into an always-on-top desktop mini window |
| **🎧 Soundscapes** | — | Click headphones icon in header | Opens 8-track ambient soundscapes player |
| **🎀 Wardrobe** | `C` | Click ribbon icon in header | Opens wardrobe (accessories, tints, 5 desk backgrounds) |
| **🔇 Toggle Sound**| `M` | Click speaker icon in header | Mutes/unmutes procedural sound effects |
| **🌙 Day/Night** | — | Click sun/moon icon in header | Toggles between light and dark themes |
| **✨ About Creator**| —| Click **About Creator** (bottom-left) | Opens creator modal with LinkedIn connect link |

---

## 🛠️ Technical Highlights

- **Vanilla Architecture & Zero Dependencies:** Built with HTML5, CSS3, and modern vanilla JavaScript (ES Modules). Zero runtime frameworks and zero build latency. The entire client codebase is ~347 KB uncompressed source (~73 KB gzipped transfer over HTTP) with zero external binary audio (MP3/WAV) or image dependencies required for pet operation.
- **Procedural Web Audio Engine:** Pet chirps, purrs, giggles, UI chimes, and 8 curated ambient study soundscapes are synthesized directly via the Web Audio API using mathematical oscillators (`OscillatorNode`), filters (`BiquadFilterNode`), noise buffers, and LFO modulators, eliminating external media requests.
- **Vector SVG Rigging:** Expressive anatomy rendered in scalable vector SVG with mathematical coordinate projection for pupil tracking toward cursor/touch coordinates, animated via standard CSS keyframe transitions.
- **Document Picture-in-Picture Support:** Integrates the Document Picture-in-Picture API in supported Chromium browsers to display the companion in an OS-level always-on-top window, with fallback handling for other browsers.
- **Security & Accessibility:** Configured with production security headers (CSP, `nosniff`, `DENY`, `strict-origin-when-cross-origin`) and Web3Forms integration with client-side rate limiting and honeypot protection. Includes high-contrast styling, 100% button tooltip and `aria-label` coverage, motion preference detection (`prefers-reduced-motion`), a global `:focus-visible` indicator, and a keyboard shortcuts toggle.
- **Development Model:** Designed and iteratively developed through human-directed conceptualization and AI-assisted pair programming with **Anti Gravity**.

---

## 💻 Quick Start

### 🌐 Instant Access
Try Hupti directly in your browser:  
👉 **[https://hupti.vercel.app/](https://hupti.vercel.app/)**



## 👤 Credits & License

- **Concept, Design & Architecture:** **Redwanul Islam Rimon** ([@RI-Rimon](https://github.com/RI-Rimon)) — [Connect on LinkedIn](https://www.linkedin.com/in/redwanul-rimon/)
- **AI-Assisted Pair Programming:** Built and polished with **Anti Gravity** (Google DeepMind)
- **Deployment Platform:** [Vercel](https://vercel.com/)
- **License:** Open Source under the [MIT License](LICENSE)


<p align="center">
  <i>"Remember to drink some water, take a deep breath, and be proud of how far you've come today." — Hupti 💖</i>
</p>
