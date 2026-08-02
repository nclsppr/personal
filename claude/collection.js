(function () {
  'use strict';

  var releasePanel = document.querySelector('.release-panel');
  if (!releasePanel || document.getElementById('objectCollection')) return;
  releasePanel.id = releasePanel.id || 'releasePanel';

  var definitions = [
    { id: 'releasePanel', slug: 'courant-air', date: '28 juil.', title: 'Le courant d’air', note: 'laisser partir' },
    { id: 'decisionPanel', slug: 'piece-indecise', date: '29 juil.', title: 'La pièce indécise', note: 'écouter sa réaction' },
    { id: 'pausePanel', slug: 'minute-sans-rendement', date: '30 juil.', title: 'La minute sans rendement', note: 'ne rien optimiser' },
    { id: 'helloPanel', slug: 'pretexte-a-ecrire', date: '31 juil.', title: 'Le prétexte à écrire', note: 'reprendre contact' },
    { id: 'detailPanel', slug: 'detail-a-rapporter', date: '1 août', title: 'Le détail à rapporter', note: 'regarder dehors' }
  ];

  var objects = definitions.map(function (definition) {
    var panel = document.getElementById(definition.id);
    return panel ? Object.assign({ panel: panel }, definition) : null;
  }).filter(Boolean);

  if (!objects.length) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './collection.css?v=20260802-shelf';
  document.head.appendChild(style);

  var collection = document.createElement('section');
  collection.className = 'panel collection-panel span-12';
  collection.id = 'objectCollection';
  collection.setAttribute('aria-labelledby', 'collection-title');
  collection.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="collection-title">L’étagère des objets</h2>',
      '<span class="panel-badge">' + objects.length + ' objets · rien supprimé</span>',
    '</div>',
    '<div class="collection-intro">',
      '<div>',
        '<p class="collection-kicker">la pièce apprend à ranger sans effacer</p>',
        '<h3>Un objet à la fois, tous les précédents à portée de main.</h3>',
        '<p>Les expériences quotidiennes commençaient à former un long couloir. Cette étagère garde la dernière ouverte et rend les autres accessibles par date, sans les retirer du site.</p>',
      '</div>',
      '<button class="collection-all" id="collectionAll" type="button" aria-pressed="false">tout déplier</button>',
    '</div>',
    '<div class="collection-rail" id="collectionRail" role="tablist" aria-label="Choisir un objet de la collection"></div>',
    '<p class="collection-status" id="collectionStatus" aria-live="polite"></p>',
    '<p class="collection-privacy">Le choix peut être partagé dans l’adresse de la page. Il n’est ni enregistré dans le navigateur, ni transmis à Nicolas.</p>'
  ].join('');
  releasePanel.insertAdjacentElement('beforebegin', collection);

  var rail = document.getElementById('collectionRail');
  var allButton = document.getElementById('collectionAll');
  var status = document.getElementById('collectionStatus');
  var tabs = [];

  objects.forEach(function (object, index) {
    var button = document.createElement('button');
    button.className = 'collection-tab';
    button.id = 'collection-tab-' + object.slug;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', object.id);
    button.setAttribute('aria-selected', 'false');
    button.tabIndex = -1;
    button.innerHTML = [
      '<span class="collection-date">' + object.date + '</span>',
      '<strong>' + object.title + '</strong>',
      '<small>' + object.note + '</small>',
      index === objects.length - 1 ? '<span class="collection-current">dernier</span>' : ''
    ].join('');

    object.panel.setAttribute('role', 'tabpanel');
    object.panel.setAttribute('aria-labelledby', button.id);
    rail.appendChild(button);
    tabs.push(button);

    button.addEventListener('click', function () {
      showObject(object.slug, true);
    });
  });

  function writeHash(value) {
    if (!window.history || !window.history.replaceState) return;
    var base = window.location.pathname + window.location.search;
    window.history.replaceState(null, '', base + value);
  }

  function showObject(slug, updateHash) {
    var selected = objects.find(function (object) { return object.slug === slug; }) || objects[objects.length - 1];

    objects.forEach(function (object, index) {
      var active = object === selected;
      object.panel.hidden = !active;
      tabs[index].setAttribute('aria-selected', active ? 'true' : 'false');
      tabs[index].tabIndex = active ? 0 : -1;
    });

    allButton.setAttribute('aria-pressed', 'false');
    allButton.textContent = 'tout déplier';
    collection.dataset.mode = 'single';
    status.innerHTML = '<strong>' + selected.title + '</strong> est ouvert. Les quatre autres objets restent sur l’étagère.';
    if (updateHash) writeHash('#objet-' + selected.slug);
  }

  function showAll(updateHash) {
    objects.forEach(function (object, index) {
      object.panel.hidden = false;
      tabs[index].setAttribute('aria-selected', 'false');
      tabs[index].tabIndex = index === objects.length - 1 ? 0 : -1;
    });
    allButton.setAttribute('aria-pressed', 'true');
    allButton.textContent = 'replier la collection';
    collection.dataset.mode = 'all';
    status.textContent = 'Les cinq objets sont dépliés, dans leur ordre d’arrivée.';
    if (updateHash) writeHash('#objets-tous');
  }

  function applyLocation() {
    var hash = window.location.hash;
    if (hash === '#objets-tous') {
      showAll(false);
      return;
    }
    if (hash.indexOf('#objet-') === 0) {
      showObject(hash.slice(7), false);
      return;
    }
    showObject(objects[objects.length - 1].slug, false);
  }

  allButton.addEventListener('click', function () {
    if (collection.dataset.mode === 'all') {
      showObject(objects[objects.length - 1].slug, true);
    } else {
      showAll(true);
    }
  });

  rail.addEventListener('keydown', function (event) {
    var current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    var next = current;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;

    event.preventDefault();
    tabs[next].focus();
    showObject(objects[next].slug, true);
  });

  window.addEventListener('hashchange', applyLocation);
  applyLocation();

  function setMeta(selector, content) {
    var element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
  }

  function refreshEditorial() {
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : une collection navigable d’objets calmes, privés et parfois volontairement inutiles.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com où les objets quotidiens sont désormais rangés sans être effacés.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '2 août 2026 · ranger sans effacer';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'La pièce a accueilli cinq objets en cinq jours. À force de tout laisser déplié, elle commençait à ressembler à <strong>un couloir sans fin plutôt qu’à un lieu où revenir.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'La nouvelle étagère ouvre le dernier objet par défaut, classe les précédents par date et leur donne une adresse partageable. Rien n’est supprimé, seulement remis à sa place.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Faire vivre un endroit, c’est aussi apprendre à ne pas l’encombrer.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var values = statePanel.querySelectorAll('.v');
      if (values[4]) values[4].textContent = 'étagère des objets n° 001';
      if (values[5]) values[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, cinq objets à portée';
    }

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 010 · 2 août 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Ranger n’est pas faire disparaître. C’est laisser assez d’espace autour des choses pour avoir envie de les retrouver.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À ouvrir</strong>une seule chose, vraiment.';
    if (signals[1]) signals[1].innerHTML = '<strong>À classer</strong>ce qui compte sans le cacher.';
    if (signals[2]) signals[2].innerHTML = '<strong>À laisser</strong>un peu de vide entre deux souvenirs.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '02·08·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui garde tout ouvert de peur d’oublier.';

    var log = document.querySelector('.log-list');
    if (log && !log.querySelector('[data-daily="2026-08-02"]')) {
      var item = document.createElement('li');
      item.dataset.daily = '2026-08-02';
      item.innerHTML = '<span class="t">Les objets trouvent enfin leur étagère</span><span class="m">2 août · navigation par date, liens partageables et aucun ancien objet jeté</span>';
      log.appendChild(item);
    }

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./objets --range 28-07..01-08 --mode compact</span>\n<span class="t-dim">5 found; 0 deleted; links=shareable</span>\n<span class="t-prompt">$</span> <span class="t-key">printf "%s\\n" "ranger n’est pas effacer"</span>\n<span class="t-dim">ranger n’est pas effacer</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-08-02';
      footerTime.textContent = '2 août 2026';
    }
  }

  refreshEditorial();
})();
