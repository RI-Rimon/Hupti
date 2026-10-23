/**
 * Modals - Unified Modal Controller
 * Handles open/close state, backdrop clicks, universal Escape key handling,
 * and accessibility focus return across all application dialogs.
 */

let lastTriggerElement = null;
const modalCloseHooks = new Map();

/**
 * Register an optional cleanup hook to run when a specific modal closes
 * @param {string} modalId
 * @param {Function} hookFn
 */
export function registerModalCloseHook(modalId, hookFn) {
  modalCloseHooks.set(modalId, hookFn);
}

/**
 * Open a modal dialog and track the trigger element for focus restoration
 * @param {string} modalId
 * @param {HTMLElement} [triggerEl]
 */
export function openModal(modalId, triggerEl = null) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (triggerEl) {
    lastTriggerElement = triggerEl;
  } else if (document.activeElement && document.activeElement !== document.body) {
    lastTriggerElement = document.activeElement;
  }

  modal.classList.add('active');

  // Set focus to the first interactive input or close button inside modal
  const focusable = modal.querySelector('input:not([type="hidden"]):not([style*="display: none"]), textarea, select, button:not(.modal-close), .modal-close');
  if (focusable) {
    setTimeout(() => {
      try {
        focusable.focus();
      } catch (e) {}
    }, 120);
  }
}

/**
 * Close a specific modal dialog
 * @param {string} modalId
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('active');

  // Run any registered cleanup hook
  const hook = modalCloseHooks.get(modalId);
  if (typeof hook === 'function') {
    hook();
  }

  // Restore focus if no other modal is open
  const anyActive = document.querySelector('.modal-overlay.active');
  if (!anyActive && lastTriggerElement && typeof lastTriggerElement.focus === 'function') {
    try {
      lastTriggerElement.focus();
    } catch (e) {}
  }
}

/**
 * Close all currently open modal dialogs
 */
export function closeAllModals() {
  const activeModals = document.querySelectorAll('.modal-overlay.active');
  activeModals.forEach((modal) => {
    closeModal(modal.id);
  });
}

/**
 * Initialize universal modal behaviors:
 * - Backdrop click to close
 * - .modal-close buttons
 * - Universal Escape key listener
 */
export function initModals() {
  // Backdrop click listener on all modal overlays
  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });

    // Wire close buttons inside each modal
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeModal(modal.id);
      });
    }
  });

  // Universal Escape key listener
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      if (activeModals.length > 0) {
        e.preventDefault();
        // Close the most recently opened / top-most active modal
        activeModals.forEach((modal) => {
          closeModal(modal.id);
        });
      }
    }
  });
}
