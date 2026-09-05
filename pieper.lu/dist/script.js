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
