/* nicolaspieper.com - v2026
   Theme toggle · mobile sidebar · scrollspy · language deep-linking. No dependencies. */
(function () {
  'use strict';

  /* ---------- Legacy section links ----------
     Detailed homepage sections moved to Work or CV. Keep old bookmarks useful
     while leaving the static content fully readable when JavaScript is absent. */
  var legacyHash = window.location.hash.slice(1);
  var legacyPages = {
    'how-i-lead': ['/work/#engineering-principles', '/fr/work/#engineering-principles'],
    'stack': ['/work/#technical-background', '/fr/work/#technical-background'],
    'career': ['/cv/#cv-exp-title', '/fr/cv/#cv-exp-title'],
    'education': ['/cv/#cv-edu-title', '/fr/cv/#cv-edu-title'],
    'how-i-work': ['/work/#engineering-principles', '/fr/work/#engineering-principles'],
    'current-focus': ['/work/', '/fr/work/']
  };
  if ((location.pathname === '/' || location.pathname === '/fr/') && legacyPages[legacyHash]) {
    var legacyTarget = legacyPages[legacyHash][location.pathname === '/fr/' ? 1 : 0];
    location.replace(legacyTarget);
    return;
  }

  /* Sections supprimées dont le contenu vit désormais sous une autre ancre de
     la même page (ex. « Leadership in practice » fusionné dans la section 01). */
  var legacyAliases = { 'leadership-in-practice': 'solutions-team' };
  if (legacyAliases[legacyHash] && !document.getElementById(legacyHash) && document.getElementById(legacyAliases[legacyHash])) {
    location.replace('#' + legacyAliases[legacyHash]);
  }

  var THEME_COLOR = { light: '#FAF9F5', dark: '#262624' };

  /* ---------- Theme ---------- */
  function applyThemeColor(theme) {
    var color = THEME_COLOR[theme] || THEME_COLOR.light;

    // Keep browser chrome in sync where theme-color is supported. Recent
    // Safari versions also sample the opaque html/body canvas from the CSS.
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }

  var themeBtn = document.getElementById('themeBtn');
  var isFR = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;
  var THEME_LABEL = isFR
    ? { toDark: 'Activer le mode sombre', toLight: 'Activer le mode clair' }
    : { toDark: 'Switch to dark mode', toLight: 'Switch to light mode' };

  function syncThemeButton(theme) {
    if (!themeBtn) return;
    var dark = theme === 'dark';
    themeBtn.setAttribute('aria-label', dark ? THEME_LABEL.toLight : THEME_LABEL.toDark);
    themeBtn.setAttribute('aria-pressed', String(dark));
  }
  var initialTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  applyThemeColor(initialTheme);
  syncThemeButton(initialTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      applyThemeColor(next);
      syncThemeButton(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    });
  }

  /* ---------- Mobile sidebar ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('backdrop');
  var mainEl = document.getElementById('main');
  var headerBrand = document.querySelector('.site-header .brand');
  var headerNav = document.querySelector('.site-header .header-nav');
  var headerActions = document.querySelector('.site-header .header-actions');
  var MENU_LABEL = isFR
    ? { open: 'Ouvrir la navigation', close: 'Fermer la navigation' }
    : { open: 'Open navigation', close: 'Close navigation' };

  function setInert(element, inert) {
    if (!element) return;
    if (inert) element.setAttribute('inert', '');
    else element.removeAttribute('inert');
  }

  function setSidebar(open) {
    if (!sidebar) return;
    var wasOpen = sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('show', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? MENU_LABEL.close : MENU_LABEL.open);
    }
    // Treat the open drawer as modal: lock the page, hide everything behind it
    // from assistive technology, then keep keyboard focus inside the drawer.
    document.body.classList.toggle('nav-open', open);
    [mainEl, headerBrand, headerNav, headerActions].forEach(function (element) {
      setInert(element, open);
    });
    if (open) {
      requestAnimationFrame(function () {
        var firstLink = sidebar.querySelector('a[href]');
        if (firstLink) firstLink.focus();
      });
    } else if (wasOpen && menuBtn && window.innerWidth <= 980) {
      menuBtn.focus();
    }
  }

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      setSidebar(!sidebar.classList.contains('open'));
    });
    if (backdrop) backdrop.addEventListener('click', function () { setSidebar(false); });
    sidebar.addEventListener('click', function (e) {
      if (e.target.closest('a')) setSidebar(false);
    });
    document.addEventListener('keydown', function (e) {
      if (!sidebar.classList.contains('open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setSidebar(false);
        return;
      }
      if (e.key === 'Tab') {
        var focusable = [menuBtn].concat(Array.prototype.slice.call(sidebar.querySelectorAll('a[href]')));
        var current = focusable.indexOf(document.activeElement);
        if (current === -1) current = 0;
        var next = e.shiftKey
          ? (current - 1 + focusable.length) % focusable.length
          : (current + 1) % focusable.length;
        e.preventDefault();
        focusable[next].focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980 && sidebar.classList.contains('open')) setSidebar(false);
    });
  }

  /* ---------- Language deep-linking ----------
     Section ids are identical across /en and /fr, so carry the current
     section as a hash on the language-switch links: switching language
     keeps you where you were on the page (even after manual scrolling). */
  var routePairs = {
    '/': ['/', '/fr/'],
    '/fr/': ['/', '/fr/'],
    '/work/': ['/work/', '/fr/work/'],
    '/fr/work/': ['/work/', '/fr/work/']
  };
  var languagePair = routePairs[location.pathname] || [];
  var langLinks = Array.prototype.slice
    .call(document.querySelectorAll('a[hreflang]'))
    .filter(function (a) {
      var h = (a.getAttribute('href') || '').split('#')[0];
      return languagePair.indexOf(h) !== -1;
    });

  function setLangHash(id) {
    langLinks.forEach(function (a) {
      var base = (a.getAttribute('href') || '').split('#')[0];
      a.setAttribute('href', id ? base + '#' + id : base);
    });
  }

  /* ---------- Scrollspy ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.side-group a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) { map[id] = a; sections.push(sec); }
    });

    var current = null;
    function activate(id) {
      if (current === id) return;
      current = id;
      links.forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
      if (map[id]) { map[id].classList.add('active'); map[id].setAttribute('aria-current', 'location'); }
      setLangHash(id);
    }

    function atPageBottom() {
      return window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
    }
    function update() {
      /* Pick the last section whose start crossed the reading marker.
         Unlike an intersection band, this also handles very short sections. */
      if (sections.length && atPageBottom()) {
        activate(sections[sections.length - 1].id);
        return;
      }
      var marker = Math.max(84, Math.min(window.innerHeight * 0.32, 240));
      var next = sections.length ? sections[0].id : null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= marker) next = sections[i].id;
        else break;
      }
      if (next) activate(next);
    }
    update();

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    window.addEventListener('resize', update);
  }
})();
