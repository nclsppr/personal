/* nicolaspieper.com — v2026
   Theme toggle · mobile sidebar · scrollspy · language deep-linking. No dependencies. */
(function () {
  'use strict';

  var THEME_COLOR = { light: '#FAF9F5', dark: '#262624' };

  /* ---------- Theme ---------- */
  function applyThemeColor(theme) {
    var color = THEME_COLOR[theme] || THEME_COLOR.light;

    // Update the single meta in place. Correct DOM state, sufficient on Android
    // Chrome / desktop Safari, and keeps the node identity the anti-flash <head>
    // script relies on.
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);

    // iOS Safari (viewport-fit=cover) only re-samples the status-bar / Dynamic
    // Island tint on a top-of-viewport compositing commit — which is why opening
    // the menu (fixed backdrop + sidebar) refreshes it but a bare .content write,
    // changing no layer, does not. Reproduce that commit by nudging the header,
    // already its own layer via backdrop-filter, with a Z-only transform across
    // two frames: forces a layer-tree transaction with no 2D movement (no flash).
    var header = document.querySelector('.site-header');
    if (header && typeof requestAnimationFrame === 'function') {
      var prev = header.style.transform;
      requestAnimationFrame(function () {
        header.style.transform = 'translateZ(0)';
        requestAnimationFrame(function () { header.style.transform = prev; });
      });
    }
  }

  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      applyThemeColor(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    });
  }

  /* ---------- Mobile sidebar ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('backdrop');

  function setSidebar(open) {
    if (!sidebar) return;
    if (!open && sidebar.contains(document.activeElement) && menuBtn) menuBtn.focus();
    sidebar.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('show', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
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
      if (e.key === 'Escape') setSidebar(false);
    });
  }

  /* ---------- Language deep-linking ----------
     Section ids are identical across /en and /fr, so carry the current
     section as a hash on the language-switch links: switching language
     keeps you where you were on the page (even after manual scrolling). */
  var langLinks = Array.prototype.slice
    .call(document.querySelectorAll('a[hreflang]'))
    .filter(function (a) {
      var h = (a.getAttribute('href') || '').split('#')[0];
      return h === '/' || h === '/fr/';
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
      links.forEach(function (a) { a.classList.remove('active'); });
      if (map[id]) map[id].classList.add('active');
      setLangHash(id);
    }

    var visible = {};
    function atPageBottom() {
      return window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
    }
    function update() {
      /* The last section (Contact) can be too short to ever reach the
         detection band, so pin it whenever the page is scrolled to the end. */
      if (sections.length && atPageBottom()) {
        activate(sections[sections.length - 1].id);
        return;
      }
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { activate(sections[i].id); return; }
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible[en.target.id] = en.isIntersecting;
      });
      update();
    }, { rootMargin: '-72px 0px -60% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
  }
})();
