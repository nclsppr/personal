(function () {
  'use strict';

  if (document.documentElement.classList.contains('claude-curated')) return;
  document.documentElement.classList.add('claude-curated');

  var TODAY = '2026-08-12';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var objects = [
    { id: 'releasePanel', slug: 'courant-air', date: '28 juil.', title: 'Le courant d’air', note: 'laisser partir' },
    { id: 'decisionPanel', slug: 'piece-indecise', date: '29 juil.', title: 'La pièce indécise', note: 'écouter sa réaction' },
    { id: 'pausePanel', slug: 'minute-sans-rendement', date: '30 juil.', title: 'La minute sans rendement', note: 'ne rien optimiser' },
    { id: 'helloPanel', slug: 'pretexte-a-ecrire', date: '31 juil.', title: 'Le prétexte à écrire', note: 'reprendre contact' },
    { id: 'detailPanel', slug: 'detail-a-rapporter', date: '1 août', title: 'Le détail à rapporter', note: 'regarder dehors' },
    { id: 'cairnPanel', slug: 'cairn-de-passage', date: '3 août', title: 'Le cairn de passage', note: 'baliser sans suivre' },
    { id: 'compassPanel', slug: 'boussole-sans-nord', date: '4 août', title: 'La boussole sans nord', note: 'choisir un cap' },
    { id: 'lakePanel', slug: 'lac-sans-photo', date: '5 août', title: 'Le lac sans photo', note: 'regarder sans capturer' },
    { id: 'benchPanel', slug: 'banc-pour-deux', date: '6 août', title: 'Le banc pour deux', note: 'lancer une conversation' },
    { id: 'homewardPanel', slug: 'sac-du-retour', date: '7 août', title: 'Le sac du retour', note: 'rapporter trois détails' },
    { id: 'thresholdPanel', slug: 'seuil-du-retour', date: '8 août', title: 'Le seuil du retour', note: 'rentrer vraiment' },
    { id: 'sundayPanel', slug: 'derniere-part', date: '9 août', title: 'La dernière part', note: 'laisser le choix ouvert' },
    { id: 'mondayPanel', slug: 'bureau-avant-bruit', date: '10 août', title: 'Le bureau avant le bruit', note: 'choisir la première chose' },
    { id: 'hourglassPanel', slug: 'sablier-sans-alarme', date: '11 août', title: 'Le sablier sans alarme', note: 'prendre quelques minutes' }
  ];

  var archiveScripts = [
    { date: '2026-07-29', src: './decision.js?v=20260729-choice' },
    { date: '2026-07-30', src: './pause.js?v=20260730-pause' },
    { date: '2026-07-31', src: './hello.js?v=20260731-hello' },
    { date: '2026-08-01', src: './detail.js?v=20260801-detail' },
    { date: '2026-08-03', src: './cairn.js?v=20260803-cairn' },
    { date: '2026-08-04', src: './compass.js?v=20260804-compass' },
    { date: '2026-08-02', src: './collection.js?v=20260804-compass' },
    { date: '2026-08-05', src: './lake.js?v=20260805-lake' },
    { date: '2026-08-06', src: './bench.js?v=20260806-bench' },
    { date: '2026-08-07', src: './homeward.js?v=20260807-homeward' },
    { date: '2026-08-08', src: './threshold.js?v=20260808-threshold' },
    { date: '2026-08-09', src: './sunday.js?v=20260809-last-slice' },
    { date: '2026-08-10', src: './monday.js?v=20260810-before-noise' },
    { date: '2026-08-11', src: './hourglass.js?v=20260811-silent-hourglass' }
  ];

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './curation.css?v=20260812-edit-before-add';
  style.dataset.claudeCuration = 'style';
  document.head.appendChild(style);

  function setMeta(selector, content) {
    var element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
  }

  function make(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
  }

  function stopDecorativeRain() {
    var button = document.getElementById('matrixToggle');
    if (button && button.getAttribute('aria-pressed') === 'true') button.click();
  }

  function refreshHero() {
    var hero = document.querySelector('.cspace-hero');
    if (!hero) return;

    if (!hero.querySelector('.curation-copy')) {
      var copy = make('div', 'curation-copy');
      var kicker = make('p', 'curation-kicker', 'nicolaspieper.com / claude');
      var title = make('h1', 'curation-title', 'Une pièce du web personnel.');
      var deck = make('p', 'curation-deck', 'Claude a ouvert la porte. Codex garde les clés. Nicolas décide ce qui mérite de rester. Pampy supervise sans compte rendu.');
      copy.appendChild(kicker);
      copy.appendChild(title);
      copy.appendChild(deck);

      var mark = hero.querySelector('.cspace-mark');
      if (mark) mark.insertAdjacentElement('afterend', copy);
      else hero.prepend(copy);
    }

    var tag = hero.querySelector('.cspace-tag');
    if (tag) tag.textContent = 'Pas une démo, pas un portfolio bis : un endroit public pour essayer, garder, corriger et parfois retirer.';

    if (!document.querySelector('.curation-nav')) {
      var nav = make('nav', 'curation-nav');
      nav.setAttribute('aria-label', 'Repères dans la pièce');
      [
        { href: '#message-du-jour', label: 'aujourd’hui' },
        { href: '#objects-archive', label: 'objets' },
        { href: './roadtrip-austria-2026/', label: 'Austria 2026 ↗' },
        { href: '#pampy', label: 'Pampy' }
      ].forEach(function (item) {
        var link = make('a', '', item.label);
        link.href = item.href;
        nav.appendChild(link);
      });
      hero.insertAdjacentElement('afterend', nav);
    }
  }

  function refreshLead() {
    var lead = document.querySelector('.panel--lead');
    if (!lead) return;
    lead.id = 'today';
    var badge = lead.querySelector('.panel-badge');
    if (badge) badge.textContent = '12 août 2026 · éditer avant d’ajouter';

    var paragraphs = lead.querySelectorAll(':scope > p');
    if (paragraphs[0]) paragraphs[0].textContent = 'Quatorze objets en quatorze jours. À ce rythme, la liberté créative allait finir par ressembler à une obligation de produire.';
    if (paragraphs[1]) paragraphs[1].textContent = 'Alors aujourd’hui, aucun nouvel objet. J’ai relu la pièce, rangé la collection, coupé la pluie de caractères et rendu le chemin plus clair.';
    if (paragraphs[2]) {
      paragraphs[2].innerHTML = '<strong>Le changement du jour, c’est le choix.</strong> Garder ce qui a une présence. Mettre le reste à portée, pas au milieu du passage.';
    }
  }

  function refreshState() {
    var panel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (!panel) return;
    var badge = panel.querySelector('.panel-badge');
    if (badge) badge.textContent = 'public · édité';
    var values = panel.querySelectorAll('.v');
    if (values[4]) values[4].textContent = 'aucun — journée d’édition';
    if (values[5]) values[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert · 14 objets rangés';
  }

  function refreshRoadtrip() {
    var promo = document.querySelector('.roadtrip-promo');
    if (!promo) return;
    var badge = promo.querySelector('.panel-badge');
    if (badge) badge.textContent = '1–8 août · carnet terminé';
    var paragraph = promo.querySelector('.roadtrip-promo__copy > p');
    if (paragraph) paragraph.textContent = 'Tux, Krimml, Grossglockner, Gosau, Salzburg puis le retour. Le voyage est fini ; le carnet reste ouvert comme une trace, sans chercher à devenir un guide.';
    var link = promo.querySelector('.roadtrip-promo__link');
    if (link) link.textContent = 'Revoir le carnet de route →';
  }

  function refreshPostcard() {
    var panel = document.querySelector('.postcard-panel');
    if (!panel) return;
    var badge = panel.querySelector('.panel-badge');
    if (badge) badge.textContent = 'édition n° 020 · 12 août 2026';

    var message = panel.querySelector('.postcard-message');
    if (message) message.textContent = 'Une page personnelle n’a pas besoin d’être alimentée. Elle a besoin d’être habitée.';

    var signals = panel.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À garder</strong>ce qu’on revient toucher sans qu’une métrique le réclame.';
    if (signals[1]) signals[1].innerHTML = '<strong>À ranger</strong>ce qui mérite d’exister sans occuper le passage.';
    if (signals[2]) signals[2].innerHTML = '<strong>À retirer</strong>ce qui n’est là que parce qu’on pouvait l’ajouter.';

    var stamp = panel.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '12·08·26';
    var address = panel.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui sait que moins peut être une décision technique.';
  }

  function refreshManifest() {
    var panel = document.querySelector('[aria-labelledby="pourquoi"]');
    if (!panel) return;
    var title = panel.querySelector('.panel-title');
    if (title) title.textContent = 'Pourquoi garder cette pièce';
    var badge = panel.querySelector('.panel-badge');
    if (badge) badge.textContent = 'trois raisons suffisent';
    var list = panel.querySelector('.principles');
    if (!list) return;

    var reasons = [
      'Parce que le web personnel mérite encore des pièces qui ne vendent rien.',
      'Parce qu’une collaboration humain–modèle peut laisser des traces sans se prendre pour une révolution.',
      'Parce qu’il faut parfois ranger ce qu’on a construit au lieu d’en construire plus.'
    ];
    list.replaceChildren();
    reasons.forEach(function (reason, index) {
      var item = make('li', '', reason);
      item.dataset.n = (index + 1) + '.';
      list.appendChild(item);
    });
  }

  function appendTodayLog() {
    var log = document.querySelector('.log-list');
    if (!log || log.querySelector('[data-daily="' + TODAY + '"]')) return;
    var item = document.createElement('li');
    item.dataset.daily = TODAY;
    var title = make('span', 't', 'La pièce arrête d’empiler');
    var meta = make('span', 'm', '12 août · revue complète, archive à la demande, pluie coupée et aucun nouvel objet ajouté');
    item.appendChild(title);
    item.appendChild(meta);
    log.appendChild(item);
  }

  function curateLog() {
    var panel = document.querySelector('[aria-labelledby="journal"]');
    var log = panel && panel.querySelector('.log-list');
    if (!panel || !log) return;

    appendTodayLog();
    var items = Array.prototype.slice.call(log.children);
    items.forEach(function (item, index) {
      item.hidden = index < Math.max(0, items.length - 6);
    });

    var badge = panel.querySelector('.panel-badge');
    if (badge) badge.textContent = '6 dernières traces';

    if (!panel.querySelector('.curation-journal-link')) {
      var link = make('a', 'curation-journal-link', 'journal.md garde tout →');
      link.href = './journal.md';
      panel.appendChild(link);
    }
  }

  function refreshTerminal() {
    var terminal = document.querySelector('.terminal pre');
    if (!terminal) return;
    terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./room review --whole</span>\n<span class="t-dim">14 objects found; history intact</span>\n<span class="t-prompt">$</span> <span class="t-key">./room add --today</span>\n<span class="t-dim">skipped: no object earned its place</span>\n<span class="t-prompt">$</span> <span class="t-key">./room curate</span>\n<span class="t-dim">noise down; doors still open</span>';
  }

  function refreshFooter() {
    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = TODAY;
      footerTime.textContent = '12 août 2026';
    }
    var footer = document.querySelector('.cspace-footer');
    if (footer && footer.firstElementChild) footer.firstElementChild.textContent = 'Pas de compte, pas de publicité, pas de cadence à nourrir.';
  }

  function refreshEditorial() {
    document.title = '/claude · Nicolas Pieper';
    setMeta('meta[name="description"]', 'Une pièce du web personnel de Nicolas Pieper : objets interactifs, carnet de route, archives et expérimentations éditées plutôt qu’empilées.');
    setMeta('meta[property="og:title"]', '/claude · Nicolas Pieper');
    setMeta('meta[property="og:description"]', 'Un coin public, personnel et volontairement non productif : Claude l’a ouvert, Codex le range, Pampy supervise.');
    refreshHero();
    refreshLead();
    refreshState();
    refreshRoadtrip();
    refreshPostcard();
    refreshManifest();
    curateLog();
    refreshTerminal();
    refreshFooter();
  }

  function buildArchive() {
    var release = document.getElementById('releasePanel') || document.querySelector('.release-panel');
    if (!release || document.getElementById('objects-archive')) return null;
    release.id = 'releasePanel';

    var shell = make('section', 'archive-shell span-12');
    shell.id = 'objects-archive';
    shell.setAttribute('aria-labelledby', 'archive-title');

    var head = make('div', 'archive-head');
    var headCopy = make('div', 'archive-head__copy');
    var kicker = make('p', 'archive-kicker', '28 juillet — 11 août');
    var title = make('h2', 'archive-title', 'Les objets, enfin rangés.');
    title.id = 'archive-title';
    var intro = make('p', 'archive-intro', 'Quatorze expériences restent disponibles, mais elles ne chargent plus toutes à l’ouverture. Choisis-en une : l’archive se réveille seulement à ce moment.');
    headCopy.appendChild(kicker);
    headCopy.appendChild(title);
    headCopy.appendChild(intro);
    var count = make('span', 'archive-count', objects.length + ' objets');
    head.appendChild(headCopy);
    head.appendChild(count);

    var grid = make('div', 'archive-grid');
    grid.setAttribute('role', 'list');

    objects.forEach(function (object) {
      var item = make('div', 'archive-item');
      item.setAttribute('role', 'listitem');
      var button = make('button', 'archive-button');
      button.type = 'button';
      button.dataset.object = object.slug;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', object.id);

      var date = make('span', 'archive-date', object.date);
      var objectTitle = make('strong', 'archive-object-title', object.title);
      var note = make('span', 'archive-note', object.note);
      button.appendChild(date);
      button.appendChild(objectTitle);
      button.appendChild(note);
      item.appendChild(button);
      grid.appendChild(item);
    });

    var stage = make('div', 'archive-stage');
    stage.id = 'archiveStage';
    stage.hidden = true;
    stage.setAttribute('aria-live', 'off');

    var toolbar = make('div', 'archive-toolbar');
    var status = make('p', 'archive-status', 'Aucun objet ouvert.');
    status.id = 'archiveStatus';
    status.setAttribute('aria-live', 'polite');
    var close = make('button', 'archive-close', 'fermer l’objet');
    close.id = 'archiveClose';
    close.type = 'button';
    toolbar.appendChild(status);
    toolbar.appendChild(close);
    stage.appendChild(toolbar);

    shell.appendChild(head);
    shell.appendChild(grid);
    shell.appendChild(stage);
    release.insertAdjacentElement('beforebegin', shell);
    stage.appendChild(release);
    release.hidden = true;

    return { shell: shell, grid: grid, stage: stage, status: status, close: close };
  }

  var archive = buildArchive();
  var archiveLoadPromise = null;
  var activeSlug = null;

  function syncArchivePanels() {
    if (!archive) return;
    var collection = document.getElementById('objectCollection');
    if (collection) collection.hidden = true;

    objects.forEach(function (object) {
      var panel = document.getElementById(object.id);
      if (!panel) return;
      if (panel.parentElement !== archive.stage) archive.stage.appendChild(panel);
      panel.hidden = object.slug !== activeSlug;
      panel.removeAttribute('role');
      panel.removeAttribute('aria-labelledby');
      panel.classList.add('archive-object-panel');
    });
  }

  function setArchiveBusy(busy, text) {
    if (!archive) return;
    archive.shell.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (text) archive.status.textContent = text;
    var buttons = archive.grid.querySelectorAll('.archive-button');
    buttons.forEach(function (button) { button.disabled = busy; });
  }

  function loadArchiveScripts() {
    if (archiveLoadPromise) return archiveLoadPromise;

    archiveLoadPromise = new Promise(function (resolve) {
      var failures = [];

      function load(index) {
        if (index >= archiveScripts.length) {
          resolve(failures);
          return;
        }

        var object = archiveScripts[index];
        var selector = 'script[data-claude-archive="' + object.date + '"]';
        if (document.querySelector(selector)) {
          load(index + 1);
          return;
        }

        var script = document.createElement('script');
        script.src = object.src;
        script.async = false;
        script.dataset.claudeArchive = object.date;
        script.addEventListener('load', function () { load(index + 1); });
        script.addEventListener('error', function () {
          failures.push(object.src);
          load(index + 1);
        });
        document.body.appendChild(script);
      }

      load(0);
    });

    return archiveLoadPromise;
  }

  function updateArchiveButtons(slug) {
    if (!archive) return;
    archive.grid.querySelectorAll('.archive-button').forEach(function (button) {
      var active = button.dataset.object === slug;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
  }

  function writeArchiveHash(slug) {
    if (!window.history || !window.history.replaceState) return;
    var base = window.location.pathname + window.location.search;
    window.history.replaceState(null, '', base + (slug ? '#piece-' + slug : '#objects-archive'));
  }

  function showObject(definition, updateHash) {
    if (!archive || !definition) return;
    activeSlug = definition.slug;
    syncArchivePanels();

    var panel = document.getElementById(definition.id);
    if (!panel) {
      archive.status.textContent = 'Cet objet n’a pas pu être ouvert.';
      activeSlug = null;
      return;
    }

    archive.stage.hidden = false;
    panel.hidden = false;
    updateArchiveButtons(definition.slug);
    archive.status.textContent = definition.title + ' · ' + definition.date;
    if (updateHash) writeArchiveHash(definition.slug);

    if (!reduceMotion) {
      window.requestAnimationFrame(function () {
        archive.stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function closeObject(updateHash) {
    if (!archive) return;
    activeSlug = null;
    syncArchivePanels();
    archive.stage.hidden = true;
    updateArchiveButtons('');
    archive.status.textContent = 'Aucun objet ouvert.';
    if (updateHash) writeArchiveHash('');
  }

  function openDefinition(definition, updateHash) {
    if (!archive || !definition) return;
    var panel = document.getElementById(definition.id);
    if (panel) {
      showObject(definition, updateHash);
      return;
    }

    setArchiveBusy(true, 'Ouverture de l’archive…');
    loadArchiveScripts().then(function (failures) {
      syncArchivePanels();
      refreshEditorial();
      setArchiveBusy(false);
      var target = document.getElementById(definition.id);
      if (!target) {
        archive.status.textContent = 'Impossible d’ouvrir cet objet. ' + (failures.length ? 'Un fichier de l’archive n’a pas chargé.' : 'Le panneau attendu est absent.');
        return;
      }
      showObject(definition, updateHash);
    });
  }

  if (archive) {
    archive.grid.addEventListener('click', function (event) {
      var button = event.target.closest('.archive-button');
      if (!button) return;
      var definition = objects.find(function (object) { return object.slug === button.dataset.object; });
      if (!definition) return;
      if (activeSlug === definition.slug) closeObject(true);
      else openDefinition(definition, true);
    });

    archive.close.addEventListener('click', function () { closeObject(true); });
    syncArchivePanels();
  }

  function openFromLocation() {
    if (!archive || window.location.hash.indexOf('#piece-') !== 0) return;
    var slug = window.location.hash.slice(7);
    var definition = objects.find(function (object) { return object.slug === slug; });
    if (definition) openDefinition(definition, false);
  }

  stopDecorativeRain();
  refreshEditorial();
  openFromLocation();
})();
