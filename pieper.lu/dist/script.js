'use strict';

// The document remains fully readable with JavaScript disabled.
// IntersectionObserver enhances the reading stamp without scroll listeners.
const marker = document.querySelector('.reading-marker');
const lastChapter = document.querySelector('#contact');
if (marker && lastChapter && 'IntersectionObserver' in window) {
  const readingObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        marker.classList.add('is-read');
        marker.setAttribute('href', '#debut');
        marker.setAttribute('aria-label', 'Vous avez lu Pieper. Revenir au début');
        readingObserver.disconnect();
      }
    }
  }, { threshold: 0.35 });
  readingObserver.observe(lastChapter);
}

// A normal image link remains available without JavaScript or dialog support.
const portraitTrigger = document.querySelector('[data-portrait-trigger]');
const portraitDialog = document.querySelector('#pampy-portrait');
if (portraitTrigger && portraitDialog && typeof portraitDialog.showModal === 'function') {
  portraitTrigger.setAttribute('aria-haspopup', 'dialog');
  portraitTrigger.setAttribute('aria-controls', portraitDialog.id);
  portraitTrigger.setAttribute('aria-expanded', 'false');

  portraitTrigger.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (portraitDialog.open) return;
    portraitDialog.showModal();
    portraitTrigger.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('portrait-open');
  });

  // Escape and the native dialog form both dispatch close.
  portraitDialog.addEventListener('close', () => {
    portraitTrigger.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('portrait-open');
    portraitTrigger.focus({ preventScroll: true });
  });

  portraitDialog.addEventListener('click', (event) => {
    if (event.target !== portraitDialog) return;
    const bounds = portraitDialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) portraitDialog.close();
  });
}
