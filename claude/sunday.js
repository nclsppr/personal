(function () {
  'use strict';

  var threshold = document.getElementById('thresholdPanel');
  var homeward = document.getElementById('homewardPanel');
  var collection = document.getElementById('objectCollection');
  var releasePanel = document.querySelector('.release-panel');
  var anchor = threshold || homeward || collection || releasePanel;
  if (!anchor || document.getElementById('sundayPanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './sunday.css?v=20260809-last-slice';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel sunday-panel span-12';
  panel.id = 'sundayPanel';
  panel.setAttribute('aria-labelledby', 'sunday-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="sunday-title">La dernière part</h2>',
      '<span class="panel-badge">8 parts · aucun compte à régler</span>',
    '</div>',
    '<div class="sunday-pizza">',
      '<div class="sunday-stage" aria-hidden="true">',
        '<span class="sunday-table"></span>',
        '<div class="sunday-plate" id="sundayPlate" data-remaining="8">',
          '<svg class="sunday-pizza-svg" viewBox="0 0 200 200" focusable="false">',
            '<circle class="sunday-crust" cx="100" cy="100" r="84"></circle>',
            '<path class="sunday-slice" d="M 100,100 L 100.00,16.00 A 84,84 0 0 1 159.40,40.60 Z"></path>',
            '<path class="sunday-slice" d="M 100,100 L 159.40,40.60 A 84,84 0 0 1 184.00,100.00 Z"></path>',
            '<path class="sunday-slice" d="M 100,100 L 184.00,100.00 A 84,84 0 0 1 159.40,159.40 Z"></path>',
            '<path class="sunday-slice" d="M 100,100 L 159.40,159.40 A 84,84 0 0 1 100.00,184.00 Z"></path>',
            '<path class="sunday-slice" d="M 100,100 L 100.00,184.00 A 84,84 0 0 1 40.60,159.40 Z"></path>',
            '<path class="sunday-slice" d="M 100,100 L 40.60,159.40 A 84,84 0 0 1 16.00,100.00 Z"></path>',
            '<path class="sunday-slice" d="M 100,100 L 16.00,100.00 A 84,84 0 0 1 40.60,40.60 Z"></path>',
            '<path class="sunday-slice" d="M 100,100 L 40.60,40.60 A 84,84 0 0 1 100.00,16.00 Z"></path>',
            '<circle class="sunday-center-dot" cx="100" cy="100" r="4"></circle>',
          '</svg>',
        '</div>',
        '<span class="sunday-napkin"></span>',
      '</div>',
      '<div class="sunday-copy">',
        '<p class="sunday-kicker">dimanche, aucune métrique sérieuse</p>',
        '<h3>Une pizza disparaît mieux quand personne ne compte trop.</h3>',
        '<p class="sunday-intro">Prends une part, puis une autre. Il n’y a ni panier, ni paiement, ni livraison : seulement huit morceaux virtuels et la question inévitable de la dernière part.</p>',
        '<div class="sunday-actions">',
          '<button class="sunday-action" id="sundayTake" type="button">prendre une part</button>',
          '<button class="sunday-action sunday-action--quiet" id="sundayReset" type="button">refaire la pizza</button>',
        '</div>',
        '<p class="sunday-status" id="sundayStatus" aria-live="polite"><strong>8 parts.</strong> Pour l’instant, tout le monde peut encore faire semblant d’être raisonnable.</p>',
        '<p class="sunday-privacy">Cette pizza ne connaît ni ton nom, ni ton appétit. Aucun clic n’est stocké, transmis ou comptabilisé ; un rechargement la remet entière.</p>',
      '</div>',
    '</div>'
  ].join('');

  anchor.insertAdjacentElement('afterend', panel);

  var plate = document.getElementById('sundayPlate');
  var takeButton = document.getElementById('sundayTake');
  var resetButton = document.getElementById('sundayReset');
  var status = document.getElementById('sundayStatus');
  var slices = Array.prototype.slice.call(panel.querySelectorAll('.sunday-slice'));
  var order = [1, 5, 3, 7, 0, 4, 2, 6];
  var remaining = slices.length;

  slices.forEach(function (slice, index) {
    var angle = index * Math.PI / 4;
    slice.style.setProperty('--slice-x', (Math.cos(angle) * 42).toFixed(0) + 'px');
    slice.style.setProperty('--slice-y', (Math.sin(angle) * 42).toFixed(0) + 'px');
    slice.style.setProperty('--slice-r', ((index % 2 ? 1 : -1) * (8 + index)).toFixed(0) + 'deg');
  });

  function render() {
    plate.dataset.remaining = String(remaining);
    takeButton.disabled = remaining === 0;

    if (remaining === 8) {
      takeButton.textContent = 'prendre une part';
      status.innerHTML = '<strong>8 parts.</strong> Pour l’instant, tout le monde peut encore faire semblant d’être raisonnable.';
    } else if (remaining > 1) {
      takeButton.textContent = 'prendre une autre part';
      status.innerHTML = '<strong>' + remaining + ' parts restent.</strong> Quelqu’un peut encore arriver, ça devrait aller.';
    } else if (remaining === 1) {
      takeButton.textContent = 'prendre la dernière part';
      status.innerHTML = '<strong>La dernière part.</strong> La négociation la plus ancienne du monde peut commencer.';
    } else {
      takeButton.textContent = 'pizza terminée';
      status.innerHTML = '<strong>Plus une part.</strong> Ici, bonne nouvelle : en refaire une ne coûte ni farine, ni vaisselle.';
    }
  }

  takeButton.addEventListener('click', function () {
    if (remaining <= 0) return;
    var takenCount = slices.length - remaining;
    var slice = slices[order[takenCount]];
    if (slice) slice.classList.add('is-taken');
    remaining--;
    render();
    if (remaining === 0) resetButton.focus();
  });

  resetButton.addEventListener('click', function () {
    slices.forEach(function (slice) { slice.classList.remove('is-taken'); });
    remaining = slices.length;
    render();
    takeButton.focus();
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
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : objets interactifs, carnet de route archivé et une pizza du dimanche dont les clics ne quittent jamais la page.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com avec des objets quotidiens, un carnet autrichien désormais complet et huit parts virtuelles à partager sans compte ni suivi.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '9 août 2026 · personne ne compte les parts';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Le voyage est rentré, les clés sont posées, et la pièce peut redevenir inutile. <strong>Aujourd’hui, elle met simplement une pizza au milieu de la table.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Huit parts disparaissent une à une, sans panier, paiement, profil, score ou historique. Même la dernière part ne déclenche aucune notification.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Un dimanche correct n’a pas toujours besoin d’un projet. Parfois, il lui faut juste une table.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var stateValues = statePanel.querySelectorAll('.v');
      if (stateValues[4]) stateValues[4].textContent = 'dernière part n° 001';
      if (stateValues[5]) stateValues[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, four imaginaire chaud';
    }

    var collectionBadge = collection && collection.querySelector('.panel-badge');
    if (collectionBadge) collectionBadge.textContent = '7 objets · 5 haltes hors étagère';

    var roadtrip = document.querySelector('.roadtrip-promo');
    if (roadtrip) {
      var roadtripBadge = roadtrip.querySelector('.panel-badge');
      if (roadtripBadge) roadtripBadge.textContent = '1 au 8 août · carnet complet';
      var roadtripText = roadtrip.querySelector('.roadtrip-promo__copy > p');
      if (roadtripText) roadtripText.textContent = 'Le carnet autrichien est rentré à Hettange-Grande : glaciers, routes, Pampy et détours restent consultables sans être transformés en bilan.';
      var roadtripLink = roadtrip.querySelector('.roadtrip-promo__link');
      if (roadtripLink) roadtripLink.textContent = 'Relire le carnet complet →';
    }

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 017 · 9 août 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Après les kilomètres et les grands paysages, une table ordinaire peut très bien être le meilleur point de vue.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À poser</strong>quelque chose au milieu de la table, même sans occasion.';
    if (signals[1]) signals[1].innerHTML = '<strong>À partager</strong>sans sortir la calculatrice pour savoir qui a eu le plus.';
    if (signals[2]) signals[2].innerHTML = '<strong>À laisser</strong>la dernière part devenir un problème parfaitement facultatif.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '09·08·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui sait qu’une table remplie vaut parfois mieux qu’un programme rempli.';

    appendLog(document.querySelector('.log-list'), '2026-08-09', 'Une pizza arrive sans commande', '9 août · huit parts virtuelles, aucun panier, aucune télémétrie et une dernière part volontairement compliquée');

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./pizza --slices 8 --tracking off</span>\n<span class="t-dim">table=ready; account=not-required</span>\n<span class="t-prompt">$</span> <span class="t-key">./pizza --take-until last</span>\n<span class="t-dim">remaining=1; diplomacy=optional</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-08-09';
      footerTime.textContent = '9 août 2026';
    }
  }

  render();
  refreshEditorial();
})();
