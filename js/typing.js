/**
 * Typing - Random-Word Typing Speed Challenge Engine
 * Focus-friendly, distraction-free typing speed test with real-time feedback,
 * 30s/60s duration modes, and WPM/Accuracy metrics.
 */

import { openModal, closeModal, registerModalCloseHook } from './modals.js';

const TYPING_WORD_POOL = [
  'sky', 'focus', 'breeze', 'light', 'whisper', 'flow', 'quiet', 'drift', 'cloud', 'calm',
  'stone', 'pace', 'dream', 'code', 'spark', 'river', 'gentle', 'ocean', 'peace', 'warm',
  'forest', 'bloom', 'shine', 'morning', 'star', 'soft', 'melody', 'window', 'cozy', 'garden',
  'green', 'breathe', 'listen', 'heart', 'smile', 'space', 'clear', 'water', 'silver', 'fresh',
  'night', 'coffee', 'study', 'wonder', 'simple', 'thought', 'moment', 'coastal', 'golden', 'amber',
  'path', 'leaf', 'spring', 'brook', 'memory', 'tempo', 'balance', 'zen', 'meadow', 'flute',
  'sound', 'flame', 'chill', 'ember', 'shadow', 'sunset', 'horizon', 'solitude', 'rhythm', 'branch',
  'petal', 'dew', 'serene', 'glow', 'dawn', 'timber', 'wave', 'rain', 'pine', 'harbor',
  'island', 'valley', 'mist', 'haze', 'journey', 'candle', 'novel', 'paper', 'quill', 'story',
  'feather', 'clock', 'time', 'tempo', 'groove', 'vibe', 'echo', 'chime', 'silent', 'still',
  'pause', 'breath', 'solace', 'blossom', 'sweet', 'comfort', 'haven', 'shelter', 'sanctuary', 'kind',
  'friend', 'companion', 'loyal', 'warmth', 'grace', 'bright', 'delight', 'vision', 'inspire', 'create',
  'write', 'craft', 'learn', 'grow', 'rise', 'reach', 'thrive', 'sparkle', 'glimmer', 'radiant'
];

let typingDuration = 30; // 30s or 60s
let typingTimeLeft = 30;
let typingIsRunning = false;
let typingTimerInterval = null;
let activeWordsList = [];
let currentWordIdx = 0;
let totalKeystrokes = 0;
let correctKeystrokes = 0;
let correctWordsCount = 0;
let incorrectWordsCount = 0;
let correctCharsCount = 0;
let errorCharsCount = 0;

/**
 * Generate random words from the pool
 * @param {number} count
 * @returns {string[]}
 */
function generateRandomWords(count = 50) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const rand = TYPING_WORD_POOL[Math.floor(Math.random() * TYPING_WORD_POOL.length)];
    list.push(rand);
  }
  return list;
}

/**
 * Initialize Typing Speed Challenge
 * @param {Object} options
 * @param {Object} options.soundFX
 */
export function initTypingTest({ soundFX }) {
  const btnTypingTestToggle = document.getElementById('btnTypingTestToggle');
  const typingTestModal = document.getElementById('typingTestModal');
  const btnCloseTypingTest = document.getElementById('btnCloseTypingTest');
  const durationPills = document.querySelectorAll('#typingDurationGroup .duration-pill');
  const typingTimerDisplay = document.getElementById('typingTimerDisplay');
  const typingWordsDisplay = document.getElementById('typingWordsDisplay');
  const typingInput = document.getElementById('typingInput');
  const btnRestartTyping = document.getElementById('btnRestartTyping');
  const typingResultsCard = document.getElementById('typingResultsCard');
  const resWpm = document.getElementById('resWpm');
  const resAccuracy = document.getElementById('resAccuracy');
  const resChars = document.getElementById('resChars');
  const btnTryAgain = document.getElementById('btnTryAgain');

  // Render words stream into box
  const renderTypingWords = () => {
    if (!typingWordsDisplay) return;
    typingWordsDisplay.replaceChildren();

    activeWordsList.forEach((word, wIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'typing-word' + (wIdx === currentWordIdx ? ' active' : '');
      wordSpan.setAttribute('data-widx', wIdx);

      // Render individual characters
      for (let c = 0; c < word.length; c++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = word[c];
        wordSpan.appendChild(charSpan);
      }
      typingWordsDisplay.appendChild(wordSpan);
    });
  };

  // Scroll active word into visible view inside word box
  const scrollActiveWordIntoView = () => {
    const activeEl = typingWordsDisplay.querySelector('.typing-word.active');
    if (activeEl && typingWordsDisplay) {
      const containerTop = typingWordsDisplay.offsetTop;
      const wordTop = activeEl.offsetTop;
      const relativeTop = wordTop - containerTop;
      if (relativeTop > 60) {
        typingWordsDisplay.scrollTop = activeEl.offsetTop - typingWordsDisplay.offsetTop - 20;
      } else {
        typingWordsDisplay.scrollTop = 0;
      }
    }
  };

  // Reset or Start Fresh Test
  const resetTypingTest = () => {
    if (typingTimerInterval) clearInterval(typingTimerInterval);
    typingTimerInterval = null;
    typingIsRunning = false;
    typingTimeLeft = typingDuration;
    currentWordIdx = 0;
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    correctWordsCount = 0;
    incorrectWordsCount = 0;
    correctCharsCount = 0;
    errorCharsCount = 0;

    activeWordsList = generateRandomWords(60);
    renderTypingWords();

    if (typingTimerDisplay) typingTimerDisplay.textContent = `${typingDuration}s`;
    if (typingInput) {
      typingInput.value = '';
      typingInput.disabled = false;
      typingInput.placeholder = 'Click here and start typing to begin...';
    }
    if (typingResultsCard) typingResultsCard.style.display = 'none';
    if (typingWordsDisplay) {
      typingWordsDisplay.scrollTop = 0;
    }
  };

  // Finish Typing Test & Calculate Stats
  const finishTypingTest = () => {
    if (typingTimerInterval) clearInterval(typingTimerInterval);
    typingTimerInterval = null;
    typingIsRunning = false;

    if (typingInput) {
      typingInput.disabled = true;
      typingInput.value = '';
      typingInput.placeholder = "Time's up!";
    }

    // Standard formula: 1 word = 5 characters
    const minutes = typingDuration / 60;
    const grossWpm = Math.round((correctCharsCount / 5) / minutes);
    const finalWpm = Math.max(0, grossWpm);

    const totalKeyHits = totalKeystrokes;
    const accuracy = totalKeyHits > 0
      ? Math.min(100, Math.max(0, Math.round((correctKeystrokes / totalKeyHits) * 100)))
      : 100;

    if (resWpm) resWpm.textContent = finalWpm;
    if (resAccuracy) resAccuracy.textContent = `${accuracy}%`;
    if (resChars) resChars.textContent = `${correctCharsCount} / ${errorCharsCount}`;

    if (typingResultsCard) typingResultsCard.style.display = 'flex';
  };

  // Start internal countdown timer
  const startTypingTimer = () => {
    typingIsRunning = true;
    typingTimerInterval = setInterval(() => {
      typingTimeLeft--;
      if (typingTimerDisplay) typingTimerDisplay.textContent = `${typingTimeLeft}s`;
      if (typingTimeLeft <= 0) {
        finishTypingTest();
      }
    }, 1000);
  };

  const openTypingModal = () => {
    if (soundFX) soundFX.playClick();
    openModal('typingTestModal', btnTypingTestToggle);
    resetTypingTest();
    setTimeout(() => {
      if (typingInput) typingInput.focus();
    }, 150);
  };

  const closeTypingModal = () => {
    closeModal('typingTestModal');
  };

  // Register cleanup hook with modals manager
  registerModalCloseHook('typingTestModal', () => {
    if (typingTimerInterval) clearInterval(typingTimerInterval);
    typingTimerInterval = null;
    typingIsRunning = false;
  });

  if (btnTypingTestToggle) btnTypingTestToggle.addEventListener('click', openTypingModal);
  if (btnCloseTypingTest) btnCloseTypingTest.addEventListener('click', closeTypingModal);

  // Duration Pills (30s / 60s)
  durationPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      if (soundFX) soundFX.playClick();
      durationPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const timeVal = parseInt(pill.getAttribute('data-time'), 10) || 30;
      typingDuration = timeVal;
      resetTypingTest();
      if (typingInput) typingInput.focus();
    });
  });

  if (btnRestartTyping) {
    btnRestartTyping.addEventListener('click', () => {
      if (soundFX) soundFX.playClick();
      resetTypingTest();
      if (typingInput) typingInput.focus();
    });
  }

  if (btnTryAgain) {
    btnTryAgain.addEventListener('click', () => {
      if (soundFX) soundFX.playClick();
      resetTypingTest();
      if (typingInput) typingInput.focus();
    });
  }

  // Real-time Keystroke Tracking
  if (typingInput) {
    typingInput.addEventListener('input', () => {
      const val = typingInput.value;

      // Start timer on user's first input
      if (!typingIsRunning && val.length > 0) {
        startTypingTimer();
      }

      if (currentWordIdx >= activeWordsList.length) {
        finishTypingTest();
        return;
      }

      const currentWord = activeWordsList[currentWordIdx];
      const wordEls = typingWordsDisplay.querySelectorAll('.typing-word');
      const currentWordEl = wordEls[currentWordIdx];

      // If user typed spacebar -> advance to next word
      if (val.endsWith(' ')) {
        const typedWord = val.trim();
        if (typedWord.length > 0) {
          totalKeystrokes += val.length;

          if (typedWord === currentWord) {
            currentWordEl.className = 'typing-word word-correct';
            correctWordsCount++;
            correctCharsCount += currentWord.length + 1; // including space
            correctKeystrokes += currentWord.length + 1;
          } else {
            currentWordEl.className = 'typing-word word-incorrect';
            incorrectWordsCount++;
            errorCharsCount += Math.abs(typedWord.length - currentWord.length) || 1;
          }

          // Advance to next word
          currentWordIdx++;
          typingInput.value = '';

          // Dynamically append more words if getting close to end
          if (currentWordIdx >= activeWordsList.length - 15) {
            const moreWords = generateRandomWords(30);
            moreWords.forEach((word) => {
              activeWordsList.push(word);
              const wordSpan = document.createElement('span');
              wordSpan.className = 'typing-word';
              for (let c = 0; c < word.length; c++) {
                const charSpan = document.createElement('span');
                charSpan.className = 'char';
                charSpan.textContent = word[c];
                wordSpan.appendChild(charSpan);
              }
              typingWordsDisplay.appendChild(wordSpan);
            });
          }

          // Update active word element
          const updatedWordEls = typingWordsDisplay.querySelectorAll('.typing-word');
          if (updatedWordEls[currentWordIdx]) {
            updatedWordEls[currentWordIdx].classList.add('active');
          }
          scrollActiveWordIntoView();
        } else {
          // Empty space pressed
          typingInput.value = '';
        }
        return;
      }

      // Live character by character feedback
      if (currentWordEl) {
        const charSpans = currentWordEl.querySelectorAll('.char');
        for (let i = 0; i < charSpans.length; i++) {
          if (i < val.length) {
            if (val[i] === currentWord[i]) {
              charSpans[i].className = 'char correct';
            } else {
              charSpans[i].className = 'char incorrect';
            }
          } else {
            charSpans[i].className = 'char';
          }
        }
      }
    });
  }
}
