// Theme and background pre-initialization (prevents flash of unstyled theme)
(function () {
  try {
    const savedBg = localStorage.getItem('hupti_bg_theme') || 'default';
    document.documentElement.setAttribute('data-bg-theme', savedBg);

    const theme = sessionStorage.getItem('hupti_theme_override') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    // Fallback gracefully if localStorage is unavailable
  }
})();

// Vercel Web Analytics stub
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
