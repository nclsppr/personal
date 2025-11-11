const storageKey = 'np-theme';
const documentElement = document.documentElement;
const toggleButton = document.getElementById('theme-toggle');
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');
const yearEl = document.getElementById('year');

const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme, persist = false) {
  documentElement.setAttribute('data-theme', theme);
  if (persist) {
    localStorage.setItem(storageKey, theme);
  }
  const isDark = theme === 'dark';
  iconSun.classList.toggle('hidden', isDark);
  iconMoon.classList.toggle('hidden', !isDark);
  if (toggleButton) {
    toggleButton.setAttribute('aria-pressed', String(isDark));
  }
}

function initializeTheme() {
  const storedTheme = localStorage.getItem(storageKey);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    applyTheme(storedTheme);
    return;
  }
  applyTheme(prefersDark() ? 'dark' : 'light');
}

if (toggleButton) {
  toggleButton.addEventListener('click', () => {
    const currentTheme = documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });
}

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    const storedTheme = localStorage.getItem(storageKey);
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });
}

initializeTheme();

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const drawer = document.getElementById('mobile-nav');
    if (drawer && drawer.hasAttribute('open')) {
      drawer.removeAttribute('open');
    }
  });
});
