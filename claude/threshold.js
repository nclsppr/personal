(function () {
  'use strict';

  var homeward = document.getElementById('homewardPanel');
  var bench = document.getElementById('benchPanel');
  var collection = document.getElementById('objectCollection');
  var releasePanel = document.querySelector('.release-panel');
  var anchor = homeward || bench || collection || releasePanel;
  if (!anchor || document.getElementById('thresholdPanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './threshold.css?v=20260808-threshold';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel threshold-panel span-12';
  panel.id = 'thresholdPanel';
  panel.setAttribute('aria-labelledby', 'threshold-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="threshold-title">Le seuil du retour</h2>',
      '<span class="panel-badge">3 gestes · aucune donnée à fournir</span>',
    '</div>',
    '<div class="threshold-room">',
      '<div class="threshold-stage" id="thresholdStage" data-keys="false" data-lamp="false" data-door="false" aria-hidden="true">',
        '<span class="threshold-sky"></span>',
        '<div class="threshold-house">',
          '<span class="threshold-window"></span>',
          '<div class="threshold-doorway"><span class="threshold-door"></span></div>',
        '</div>',
        '<span class="threshold-mat"></span>',
        '<span class="threshold-tray"><i class="threshold-keys"></i></span>',
      '</div>',
      '<div class="threshold-copy">',
        '<p class="threshold-kicker">le voyage finit parfois par trois gestes très ordinaires</p>',
        '<h3>Poser les clés. Allumer. Entrer.</h3>',
        '<p class="threshold-intro">Pas de bilan, pas de photo à trier, pas de formulaire. Ce petit seuil sert seulement à marquer le moment où dehors redevient dedans.</p>',
        '<div class="threshold-steps" id="thresholdSteps">',
          '<button class="threshold-step" id="thresholdKeys" type="button" aria-pressed="false">',
            '<span class="threshold-step-index">1</span>',
            '<span><strong>poser les clés</strong><small>le trajet peut s’arrêter ici</small></span>',
          '</button>',
          '<button class="threshold-step" id="thresholdLamp" type="button" aria-pressed="false">',
            '<span class="threshold-step-index">2</span>',
            '<span><strong>allumer la lumière</strong><small>retrouver une pièce connue</small></span>',
          '</button>',
          '<button class="threshold-step threshold-step--door" id="thresholdDoor" type="button" aria-pressed="false" disabled>',
            '<span class="threshold-step-index">3</span>',
            '<span><strong>ouvrir la porte</strong><small>quand les deux premiers gestes sont faits</small></span>',
          '</button>',
        '</div>',
        '<p class="threshold-status" id="thresholdStatus" aria-live="polite">Deux petits gestes, puis la porte.</p>',
        '<button class="threshold-reset" id="thresholdReset" type="button">recommencer le retour</button>',
        '<p class="threshold-privacy">Aucun texte à saisir, aucune position à partager, aucun stockage et aucun appel réseau. Tout se remet à zéro au rechargement.</p>',
      '</div>',
    '</div>'
  ].join('');

  anchor.insertAdjacentElement('afterend', panel);

  var stage = document.getElementById('thresholdStage');
  var keysButton = document.getElementById('thresholdKeys');
  var lampButton = document.getElementById('thresholdLamp');
  var doorButton = document.getElementById('thresholdDoor');
  var resetButton = document.getElementById('thresholdReset');
  var status = document.getElementById('thresholdStatus');
  var state = { keys: false, lamp: false, door: false };

  function mark(button, done) {
    button.classList.toggle('is-done', done);
    button.setAttribute('aria-pressed', done ? 'true' : 'false');
  }

  function refresh() {
    stage.dataset.keys = state.keys ? 'true' : 'false';
    stage.dataset.lamp = state.lamp ? 'true' : 'false';
    stage.dataset.door = state.door ? 'true' : 'false';
    mark(keysButton, state.keys);
    mark(lampButton, state.lamp);
    mark(doorButton, state.door);
    keysButton.disabled = state.keys;
    lampButton.disabled = state.lamp;
    doorButton.disabled = state.door || !(state.keys && state.lamp);
    panel.classList.toggle('is-complete', state.door);
  }

  function describeReady() {
    if (state.keys && state.lamp) {
      status.textContent = 'Les clés sont posées, la lumière est allumée. La porte peut s’ouvrir.';
      doorButton.focus();
    } else if (state.keys) {
      status.textContent = 'Les clés ne vont plus nulle part. Il reste à allumer la lumière.';
    } else if (state.lamp) {
      status.textContent = 'Une lumière attend derrière la vitre. Il reste à poser les clés.';
    }
  }

  keysButton.addEventListener('click', function () {
    if (state.keys) return;
    state.keys = true;
    refresh();
    describeReady();
  });

  lampButton.addEventListener('click', function () {
    if (state.lamp) return;
    state.lamp = true;
    refresh();
    describeReady();
  });

  doorButton.addEventListener('click', function () {
    if (doorButton.disabled) return;
    state.door = true;
    refresh();
    status.textContent = 'Voilà. Tu es dedans. Le reste peut attendre demain.';
    resetButton.focus();
  });

  resetButton.addEventListener('click', function () {
    state = { keys: false, lamp: false, door: false };
    refresh();
    status.textContent = 'Deux petits gestes, puis la porte.';
    keysButton.focus();
  });

  function setMeta(selector, content) {
    var element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
  }

  function appendLog(log, date, title, meta) {
    if (!log || log.querySelector('[data-daily="' + date + '"]')) return;
    var item = document.createElement('li');
    item.dataset.daily = date;
    item.innerHTML = '<span class="t">' + title + '</span><span class="m">' + meta + '</span>';
    log.appendChild(item);
  }

  function refreshEditorial() {
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : sept objets calmes, quatre haltes hors étagère et un seuil du retour à franchir sans compte, suivi ni sauvegarde.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com avec des objets quotidiens, un carnet de route et trois gestes pour rentrer : poser les clés, allumer, ouvrir.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '8 août 2026 · rentrer sans faire de bilan';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Hier, la pièce préparait le sac. Aujourd’hui, elle s’intéresse au moment juste après : <strong>celui où le voyage s’arrête sans avoir besoin d’être résumé.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Le nouveau seuil tient en trois gestes : poser les clés, allumer une lumière, ouvrir une porte. Rien à raconter, rien à enregistrer, rien à optimiser.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Parfois, rentrer est déjà une activité complète.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var stateValues = statePanel.querySelectorAll('.v');
      if (stateValues[4]) stateValues[4].textContent = 'seuil du retour n° 001';
      if (stateValues[5]) stateValues[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, lumière à portée';
    }

    var collectionBadge = collection && collection.querySelector('.panel-badge');
    if (collectionBadge) collectionBadge.textContent = '7 objets · 4 haltes hors étagère';

    var roadtrip = document.querySelector('.roadtrip-promo');
    if (roadtrip) {
      var roadtripBadge = roadtrip.querySelector('.panel-badge');
      if (roadtripBadge) roadtripBadge.textContent = '1 au 8 août · jour du retour';
      var roadtripText = roadtrip.querySelector('.roadtrip-promo__copy > p');
      if (roadtripText) roadtripText.textContent = 'Dernier jour du carnet autrichien : la route rentre à la maison, les souvenirs peuvent rester un peu en vrac.';
      var roadtripLink = roadtrip.querySelector('.roadtrip-promo__link');
      if (roadtripLink) roadtripLink.textContent = 'Relire le carnet de route →';
    }

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 016 · 8 août 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Le dernier kilomètre ne demande aucun grand enseignement. Il suffit parfois d’une clé posée et d’une lumière familière.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À poser</strong>les clés avant de vouloir ranger toute la semaine.';
    if (signals[1]) signals[1].innerHTML = '<strong>À allumer</strong>une lumière connue plutôt qu’un nouveau plan.';
    if (signals[2]) signals[2].innerHTML = '<strong>À remettre</strong>le reste à demain sans négociation.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '08·08·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui vient de fermer une portière et n’a plus rien à prouver aujourd’hui.';

    appendLog(document.querySelector('.log-list'), '2026-08-08', 'Une lumière s’allume derrière la porte', '8 août · trois gestes de retour, aucune question personnelle et rien à sauvegarder');

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./seuil --keys down --lamp on</span>\n<span class="t-dim">door=ready; summary=not-required</span>\n<span class="t-prompt">$</span> <span class="t-key">./seuil --open</span>\n<span class="t-dim">inside=true; tomorrow=available</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-08-08';
      footerTime.textContent = '8 août 2026';
    }
  }

  refresh();
  refreshEditorial();
})();
