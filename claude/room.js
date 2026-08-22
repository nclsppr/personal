(function () {
  'use strict';

  var root = document.documentElement;
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var colorScheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applySystemTheme() {
    var dark = colorScheme && colorScheme.matches;
    root.dataset.ctheme = dark ? 'dark' : 'light';
    if (themeMeta) themeMeta.content = dark ? '#151511' : '#f3efe5';
  }

  applySystemTheme();
  if (colorScheme) {
    if (colorScheme.addEventListener) colorScheme.addEventListener('change', applySystemTheme);
    else if (colorScheme.addListener) colorScheme.addListener(applySystemTheme);
  }

  var objects = [
    { id: 'releasePanel', slug: 'courant-air', title: 'Le courant d\u2019air', date: '28 juil.', src: './release.js?v=20260821-archive', css: './release.css?v=20260821-archive' },
    { id: 'decisionPanel', slug: 'piece-indecise', title: 'La pièce indécise', date: '29 juil.', src: './decision.js?v=20260729-choice' },
    { id: 'pausePanel', slug: 'minute-sans-rendement', title: 'La minute sans rendement', date: '30 juil.', src: './pause.js?v=20260730-pause' },
    { id: 'helloPanel', slug: 'pretexte-a-ecrire', title: 'Le prétexte à écrire', date: '31 juil.', src: './hello.js?v=20260731-hello' },
    { id: 'detailPanel', slug: 'detail-a-rapporter', title: 'Le détail à rapporter', date: '1 août', src: './detail.js?v=20260801-detail' },
    { id: 'cairnPanel', slug: 'cairn-de-passage', title: 'Le cairn de passage', date: '3 août', src: './cairn.js?v=20260803-cairn' },
    { id: 'compassPanel', slug: 'boussole-sans-nord', title: 'La boussole sans nord', date: '4 août', src: './compass.js?v=20260804-compass' },
    { id: 'lakePanel', slug: 'lac-sans-photo', title: 'Le lac sans photo', date: '5 août', src: './lake.js?v=20260805-lake' },
    { id: 'benchPanel', slug: 'banc-pour-deux', title: 'Le banc pour deux', date: '6 août', src: './bench.js?v=20260806-bench' },
    { id: 'homewardPanel', slug: 'sac-du-retour', title: 'Le sac du retour', date: '7 août', src: './homeward.js?v=20260807-homeward' },
    { id: 'thresholdPanel', slug: 'seuil-du-retour', title: 'Le seuil du retour', date: '8 août', src: './threshold.js?v=20260808-threshold' },
    { id: 'sundayPanel', slug: 'derniere-part', title: 'La dernière part', date: '9 août', src: './sunday.js?v=20260809-last-slice' },
    { id: 'mondayPanel', slug: 'bureau-avant-bruit', title: 'Le bureau avant le bruit', date: '10 août', src: './monday.js?v=20260810-before-noise' },
    { id: 'hourglassPanel', slug: 'sablier-sans-alarme', title: 'Le sablier sans alarme', date: '11 août', src: './hourglass.js?v=20260811-silent-hourglass' }
  ];

  var archive = document.getElementById('objects-archive');
  var archiveDetails = document.getElementById('archiveDetails');
  var grid = document.getElementById('archiveGrid');
  var stage = document.getElementById('archiveStage');
  var status = document.getElementById('archiveStatus');
  var closeButton = document.getElementById('archiveClose');
  var activeSlug = '';
  var loading = {};
  var styleLoading = {};

  if (!archive || !archiveDetails || !grid || !stage || !status || !closeButton) return;

  function definitionForSlug(slug) {
    return objects.find(function (item) { return item.slug === slug; });
  }

  function buttons() {
    return grid.querySelectorAll('.archive-button');
  }

  function setMeta(selector, content) {
    var element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
  }

  function restorePageIdentity() {
    document.title = '/claude · Nicolas Pieper';
    setMeta('meta[name="description"]', 'Un carnet photo personnel de Nicolas Pieper, avec Pampy sur les routes d’Autriche et quelques expériences web gardées en archive.');
    setMeta('meta[property="og:title"]', '/claude · Nicolas Pieper');
    setMeta('meta[property="og:description"]', 'Nicolas, Pampy, l’Autriche en 2026 et quelques essais web gardés dans un tiroir.');
  }

  function setBusy(busy, message) {
    archive.setAttribute('aria-busy', busy ? 'true' : 'false');
    buttons().forEach(function (button) { button.disabled = busy; });
    if (message) status.textContent = message;
  }

  function markActive(slug) {
    buttons().forEach(function (button) {
      var active = button.dataset.object === slug;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
  }

  function hidePanels() {
    objects.forEach(function (item) {
      var panel = document.getElementById(item.id);
      if (panel) panel.hidden = true;
    });
  }

  function normalizePanel(definition) {
    var panel = document.getElementById(definition.id);
    if (!panel) return null;
    if (panel.parentElement !== stage) stage.appendChild(panel);
    panel.classList.add('archive-object-panel');
    return panel;
  }

  function ensureStyle(definition) {
    if (!definition.css) return Promise.resolve();
    if (styleLoading[definition.slug]) return styleLoading[definition.slug];

    var selector = 'link[data-room-style="' + definition.slug + '"]';
    var existing = document.querySelector(selector);
    if (existing && (existing.dataset.loaded === 'true' || existing.sheet)) return Promise.resolve();

    styleLoading[definition.slug] = new Promise(function (resolve, reject) {
      var link = existing || document.createElement('link');

      function loaded() {
        link.dataset.loaded = 'true';
        resolve();
      }

      function failed() {
        delete styleLoading[definition.slug];
        if (link.parentElement) link.remove();
        reject(new Error('archive stylesheet failed'));
      }

      link.addEventListener('load', loaded, { once: true });
      link.addEventListener('error', failed, { once: true });

      if (!existing) {
        link.rel = 'stylesheet';
        link.href = definition.css;
        link.dataset.roomStyle = definition.slug;
        document.head.appendChild(link);
      }
    });

    return styleLoading[definition.slug];
  }

  function ensureScript(definition) {
    if (loading[definition.slug]) return loading[definition.slug];

    loading[definition.slug] = ensureStyle(definition).then(function () {
      var selector = 'script[data-room-object="' + definition.slug + '"]';
      var existing = document.querySelector(selector);
      if (existing && existing.dataset.loaded === 'true') return;

      return new Promise(function (resolve, reject) {
        var script = existing || document.createElement('script');

        function loaded() {
          script.dataset.loaded = 'true';
          resolve();
        }

        function failed() {
          if (script.parentElement) script.remove();
          reject(new Error('archive script failed'));
        }

        script.addEventListener('load', loaded, { once: true });
        script.addEventListener('error', failed, { once: true });

        if (!existing) {
          script.src = definition.src;
          script.async = false;
          script.dataset.roomObject = definition.slug;
          document.body.appendChild(script);
        }
      });
    }).catch(function (error) {
      delete loading[definition.slug];
      throw error;
    });

    return loading[definition.slug];
  }

  function writeHash(slug) {
    if (!window.history || !window.history.replaceState) return;
    var destination = slug ? '#piece-' + slug : '#objects-archive';
    window.history.replaceState(null, '', window.location.pathname + window.location.search + destination);
  }

  function showObject(definition, updateHash) {
    hidePanels();
    var panel = normalizePanel(definition);
    if (!panel) throw new Error('archive panel missing');

    restorePageIdentity();
    archiveDetails.open = true;
    activeSlug = definition.slug;
    panel.hidden = false;
    stage.hidden = false;
    markActive(definition.slug);
    status.textContent = definition.title + ' · ' + definition.date;
    if (updateHash) writeHash(definition.slug);

    if (!reduceMotion) {
      window.requestAnimationFrame(function () {
        stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function openObject(definition, updateHash) {
    if (!definition) return;
    if (activeSlug === definition.slug) {
      closeObject(updateHash);
      return;
    }

    archiveDetails.open = true;
    setBusy(true, 'Ouverture de l\u2019objet...');
    ensureScript(definition).then(function () {
      showObject(definition, updateHash);
      setBusy(false);
    }).catch(function () {
      activeSlug = '';
      markActive('');
      stage.hidden = true;
      restorePageIdentity();
      setBusy(false, 'Cet objet n\u2019a pas pu être ouvert.');
    });
  }

  function closeObject(updateHash) {
    activeSlug = '';
    hidePanels();
    stage.hidden = true;
    markActive('');
    restorePageIdentity();
    status.textContent = 'Aucun objet ouvert.';
    if (updateHash) writeHash('');
  }

  grid.addEventListener('click', function (event) {
    var button = event.target.closest('.archive-button');
    if (!button) return;
    openObject(definitionForSlug(button.dataset.object), true);
  });

  closeButton.addEventListener('click', function () { closeObject(true); });

  archiveDetails.addEventListener('toggle', function () {
    if (!archiveDetails.open && activeSlug) closeObject(true);
  });

  hidePanels();
  restorePageIdentity();

  if (window.location.hash.indexOf('#piece-') === 0) {
    archiveDetails.open = true;
    openObject(definitionForSlug(window.location.hash.slice(7)), false);
  }
})();
