/**
 * Feedback - Web3Forms Integration & Feedback Flow
 * Secure, rate-limited feedback dispatch via Web3Forms API without exposed email addresses.
 */

import { openModal, closeModal } from './modals.js';

const WEB3FORMS_ACCESS_KEY = '640fcd38-9c42-4a40-aa7a-528739db0e4a';
const FEEDBACK_RATE_LIMIT_MS = 60000; // 60 seconds
const STORAGE_KEY_LAST_FEEDBACK = 'hupti_last_feedback_ts';

const ratingDescriptions = {
  1: '1 Star — Needs work',
  2: '2 Stars — Cute',
  3: '3 Stars — Really sweet!',
  4: '4 Stars — Love Hupti!',
  5: '5 Stars — Absolutely adore Hupti! 💖'
};

let currentRating = 5;

/**
 * Initialize Feedback Form and Web3Forms Submission
 * @param {Object} options
 * @param {Object} options.soundFX
 * @param {Object} options.huptiState
 */
export function initFeedback({ soundFX, huptiState }) {
  const btnOpenFeedback = document.getElementById('btnOpenFeedback');
  const btnCloseFeedback = document.getElementById('btnCloseFeedback');
  const btnFeedbackDone = document.getElementById('btnFeedbackDone');
  const feedbackModal = document.getElementById('feedbackModal');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackSuccessState = document.getElementById('feedbackSuccessState');
  const feedbackErrorBanner = document.getElementById('feedbackErrorBanner');
  const starButtons = document.querySelectorAll('.star-btn');
  const ratingInput = document.getElementById('ratingInput');
  const starRatingLabel = document.getElementById('starRatingLabel');
  const feedbackEmail = document.getElementById('feedbackEmail');
  const feedbackMessage = document.getElementById('feedbackMessage');
  const btnSubmitFeedback = document.getElementById('btnSubmitFeedback');
  const submitBtnText = document.getElementById('submitBtnText');
  const botcheckInput = feedbackForm ? feedbackForm.querySelector('input[name="botcheck"]') : null;

  const updateStarVisuals = (rating) => {
    starButtons.forEach((btn) => {
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

  starButtons.forEach((btn) => {
    const val = parseInt(btn.getAttribute('data-value'), 10);

    btn.addEventListener('mouseenter', () => {
      starButtons.forEach((b) => {
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
      starButtons.forEach((b) => b.classList.remove('hovered'));
      updateStarVisuals(currentRating);
    });

    btn.addEventListener('click', () => {
      currentRating = val;
      if (ratingInput) ratingInput.value = currentRating;
      updateStarVisuals(currentRating);
      if (soundFX) soundFX.playClick();
    });
  });

  const openFeedbackModal = () => {
    if (feedbackErrorBanner) {
      feedbackErrorBanner.style.display = 'none';
      feedbackErrorBanner.textContent = '';
    }
    if (feedbackForm) feedbackForm.style.display = 'block';
    if (feedbackSuccessState) feedbackSuccessState.style.display = 'none';
    if (btnSubmitFeedback) btnSubmitFeedback.disabled = false;
    if (submitBtnText) submitBtnText.textContent = 'Send Feedback 💌';

    openModal('feedbackModal', btnOpenFeedback);
  };

  const closeFeedbackModal = () => {
    closeModal('feedbackModal');
  };

  if (btnOpenFeedback) btnOpenFeedback.addEventListener('click', openFeedbackModal);
  if (btnCloseFeedback) btnCloseFeedback.addEventListener('click', closeFeedbackModal);
  if (btnFeedbackDone) btnFeedbackDone.addEventListener('click', closeFeedbackModal);

  // Form Submission
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 1. Honeypot check: reject if bot checked hidden input
      if (botcheckInput && botcheckInput.checked) {
        console.warn('Bot submission blocked.');
        return;
      }

      const emailVal = feedbackEmail ? feedbackEmail.value.trim() : '';
      const msgVal = feedbackMessage ? feedbackMessage.value.trim() : '';

      if (!emailVal || !msgVal) return;

      // 2. Client-side 60-second rate limit
      const lastSubmission = Number(localStorage.getItem(STORAGE_KEY_LAST_FEEDBACK) || 0);
      const elapsed = Date.now() - lastSubmission;
      if (elapsed < FEEDBACK_RATE_LIMIT_MS) {
        const waitSeconds = Math.ceil((FEEDBACK_RATE_LIMIT_MS - elapsed) / 1000);
        if (feedbackErrorBanner) {
          feedbackErrorBanner.textContent = `Please wait ${waitSeconds} second${waitSeconds > 1 ? 's' : ''} before sending feedback again.`;
          feedbackErrorBanner.style.display = 'block';
        }
        return;
      }

      if (feedbackErrorBanner) {
        feedbackErrorBanner.style.display = 'none';
        feedbackErrorBanner.textContent = '';
      }

      // 3. UI Loading State
      if (btnSubmitFeedback) btnSubmitFeedback.disabled = true;
      if (submitBtnText) submitBtnText.textContent = 'Sending... 💌';

      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `New Hupti Feedback (${currentRating} Stars)`,
        from_name: 'Hupti Virtual Pet',
        email: emailVal,
        rating: `${currentRating} / 5 Stars (${ratingDescriptions[currentRating]})`,
        message: msgVal,
        botcheck: botcheckInput ? botcheckInput.checked : false
      };

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        // Record submission timestamp for rate limiting
        localStorage.setItem(STORAGE_KEY_LAST_FEEDBACK, Date.now().toString());

        // Reset form inputs
        if (feedbackMessage) feedbackMessage.value = '';

        // Show success state
        if (feedbackForm) feedbackForm.style.display = 'none';
        if (feedbackSuccessState) feedbackSuccessState.style.display = 'flex';

        if (soundFX) soundFX.playHugSwell();
        if (huptiState) {
          const MOODS = window.MOODS || {};
          huptiState.setMood(MOODS.HUGGED || 'hugged', 4500, "Thank you for your feedback! Hupti is sending you lots of love! 💖");
        }
      } catch (err) {
        console.warn('Feedback dispatch error:', err);
        if (btnSubmitFeedback) btnSubmitFeedback.disabled = false;
        if (submitBtnText) submitBtnText.textContent = 'Send Feedback 💌';
        if (feedbackErrorBanner) {
          feedbackErrorBanner.textContent = 'Could not send feedback right now. Please check your network connection and try again.';
          feedbackErrorBanner.style.display = 'block';
        }
      }
    });
  }
}
