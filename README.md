# 🌸 Hupti — The Expressive Virtual Pet

A complete, responsive, and minimalist interactive web application for an expressive virtual pet named **Hupti**.

---

## 🌟 Concept & Identity
- **Name:** Hupti
- **Character Concept:** Hupti is an abstract, minimalist, adorable entity focused purely on expressive eyes, mouth, and facial features with a kawaii/soft minimalist aesthetic.
- **Visual Theme:** Consistent soft pink flower blossom motif (seen in the top-left logo, the browser tab favicon, and Hupti's blooming head accessory).
- **Personality:** Playful, sweet, slightly sassy, emotional, and clearly conveys a cute female persona through soft pastel accents, fluid eye expressions, dynamic pupil tracking, autonomous written thoughts, and blush animations.
- **Audio Philosophy:** **100% Non-Verbal Pet Vocalizations Only.** No robotic speech synthesis. Hupti's thoughts appear purely as written text in the bottom subtitle box, accompanied by sweet, organic procedural pet sounds (purrs, coos, squeaks, and chimes) synthesized via the Web Audio API.

---

## 🚀 Key Features

### 1. Logo & Icon Consistency (Flower Petal Theme)
- Top-left brand logo, browser tab favicon, and Hupti's head blossom accessory all feature the exact same cohesive 5-petal pink blossom with a golden center core.

### 2. Flexible Controls Layout & Zero-Overlap Dock
- All 6 interactive pill buttons (💖 Pet, 👉 Poke, 🤗 Hug, 💤 Sleep, 😠 Scold, 🍬 Treat) use flexible centering (`display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;`).
- The feedback pill is docked in its own dedicated safe row below the controls, ensuring all buttons (especially "Treat" and "Scold") are 100% visible and clickable on any screen size without overlap.

### 3. State Persistence (LocalStorage)
- Hupti remembers your journey: the **"Treats Enjoyed"** count and **Affection / Happiness percentage** are saved in the browser's `localStorage`.
- When refreshing or reopening the page, your progress is automatically restored.

### 4. Cute Non-Verbal Pet Vocalizations (Web Audio API)
- Zero external audio files and zero text-to-speech:
  - **💖 Pet:** Warm, rhythmic soft vibrating purr layered with a cozy melodic chirp.
  - **🤗 Hug:** Gentle, rising soft coo / warm musical chord swell.
  - **🍬 Treat / Snack:** Rapid cute double-munch crunch / happy sweet chirp.
  - **👉 Poke:** Tiny, surprised squeak / playful high-pitch "boop".
  - **💤 Sleep / ☀️ Wake:** Sleepy descending sigh tone for sleep; cheerful morning chirp for waking up.
  - **✨ Idle Chatter:** Subtle, tiny bell ping alerting the user that a new thought has appeared in text.
- All sounds respect the unobtrusive mute toggle (Shortcut: `M`).

### 5. Emotional, Heartwarming & Motivational Written Thoughts
- When left alone for **12–20 seconds** while awake, Hupti autonomously shares sweet, comforting written thoughts in her dialogue card:
  - *"You are my sweet human, you know that?"*
  - *"Don't forget to take care of yourself today! Have a sip of water."*
  - *"Waiting to get a sweet hug from you... 💖"*
  - *"You're doing amazing, even if things feel tough. I'm right here!"*
  - *"Just sitting here appreciating how kind you are to me."*

### 6. Bottom Feedback & Rating Modal (Privacy-Focused)
- Floating pill button docked cleanly below the action buttons:
  > **💬 How much do you like Hupti? Let us know!**
- Interactive 1 to 5 Star Rating and feedback textarea.
- Privacy-first submission: developer email address is kept strictly server-side / background-only and never exposed in the UI.

---

## 🎮 How to Interact with Hupti

| Interaction | Keyboard Shortcut | Mouse / Touch Gesture |
| :--- | :---: | :--- |
| **💖 Pet / Stroke** | `P` | Click or stroke back and forth across her forehead |
| **👉 Poke / Tease** | `T` | Click her squishy left or right cheek |
| **🤗 Hug / Embrace** | `H` | Click the Hug pill button |
| **💤 Put to Sleep** | `S` | Click the Sleep pill button |
| **☀️ Wake Up** | `W` | Click the Wake button or gently tap Hupti |
| **😠 Scold / Rebuke** | `R` | Click the Scold pill button |
| **🍬 Give Treat** | `F` | Click the Treat pill button (drops a strawberry snack!) |
| **🔇 Toggle Mute** | `M` | Click the speaker icon in the top header |
| **🌙 Toggle Day/Night** | — | Click the sun/moon icon in the top header |
| **💬 Give Feedback** | — | Click the feedback button at the bottom |

---

## 💻 How to View & Run

- 🌐 **Live Web Server Link:** [**http://localhost:8080**](http://localhost:8080)
- 📁 **Direct Local File Link:** [**index.html**](file:///c:/Users/redwa/OneDrive/Desktop/Test%20for%20antigravity/Vertual%20Pet/index.html)
