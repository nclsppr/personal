(function () {
  'use strict';

  var releasePanel = document.querySelector('.release-panel');
  if (!releasePanel || document.getElementById('decisionPanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './decision.css?v=20260729-choice';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel decision-panel span-12';
  panel.id = 'decisionPanel';
  panel.setAttribute('aria-labelledby', 'decision-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="decision-title">La pièce indécise</h2>',
      '<span class="panel-badge">aucune décision stockée · aucun oracle</span>',
    '</div>',
    '<div class="decision-room">',
      '<div class="decision-stage" id="decisionStage" aria-hidden="true">',
        '<div class="decision-coin" id="decisionCoin"><span id="decisionCoinFace">?</span></div>',
        '<span class="decision-shadow"></span>',
        '<p class="decision-caption">La pièce choisit au hasard. Ta réaction, beaucoup moins.</p>',
      '</div>',
      '<div class="decision-copy">',
        '<h3>Ne lui demande pas de choisir à ta place.</h3>',
        '<p class="decision-intro">Donne-lui deux options. Quand elle retombe, observe surtout si le résultat te soulage ou te déçoit : cette seconde-là contient parfois déjà la réponse.</p>',
        '<form class="decision-form" id="decisionForm">',
          '<div class="decision-field">',
            '<label for="decisionA">Option A</label>',
            '<input class="decision-input" id="decisionA" maxlength="48" autocomplete="off" placeholder="prendre le train">',
          '</div>',
          '<span class="decision-or" aria-hidden="true">ou</span>',
          '<div class="decision-field">',
            '<label for="decisionB">Option B</label>',
            '<input class="decision-input" id="decisionB" maxlength="48" autocomplete="off" placeholder="rester encore un peu">',
          '</div>',
        '</form>',
        '<div class="decision-controls">',
          '<button class="decision-btn" id="decisionFlip" type="button" disabled>lancer la pièce</button>',
          '<button class="decision-reset" id="decisionReset" type="button">effacer</button>',
        '</div>',
        '<div class="decision-result" id="decisionResult" hidden>',
          '<p class="decision-result-line" id="decisionResultLine" aria-live="polite"></p>',
          '<p class="decision-question">Ta première réaction&nbsp;?</p>',
          '<div class="decision-feelings" role="group" aria-label="Qualifier sa réaction au résultat">',
            '<button class="decision-feeling" type="button" data-feeling="relief">soulagé·e</button>',
            '<button class="decision-feeling" type="button" data-feeling="disappointment">déçu·e</button>',
            '<button class="decision-feeling" type="button" data-feeling="neutral">plutôt neutre</button>',
          '</div>',
          '<p class="decision-reading" id="decisionReading" aria-live="polite"></p>',
        '</div>',
        '<p class="decision-privacy">Les deux options restent seulement dans cette page jusqu’au rechargement. Aucun historique, aucune transmission et aucune prétention à remplacer ton jugement.</p>',
      '</div>',
    '</div>'
  ].join('');
  releasePanel.insertAdjacentElement('afterend', panel);

  var inputA = document.getElementById('decisionA');
  var inputB = document.getElementById('decisionB');
  var flipButton = document.getElementById('decisionFlip');
  var resetButton = document.getElementById('decisionReset');
  var coin = document.getElementById('decisionCoin');
  var coinFace = document.getElementById('decisionCoinFace');
  var stage = document.getElementById('decisionStage');
  var result = document.getElementById('decisionResult');
  var resultLine = document.getElementById('decisionResultLine');
  var reading = document.getElementById('decisionReading');
  var feelingButtons = panel.querySelectorAll('[data-feeling]');
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var currentChoice = '';
  var oppositeChoice = '';
  var busy = false;

  function ready() {
    flipButton.disabled = busy || !inputA.value.trim() || !inputB.value.trim();
  }

  function randomSide() {
    if (window.crypto && window.crypto.getRandomValues) {
      var value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % 2;
    }
    return Math.random() < .5 ? 0 : 1;
  }

  function finishFlip(side) {
    var optionA = inputA.value.trim();
    var optionB = inputB.value.trim();
    currentChoice = side === 0 ? optionA : optionB;
    oppositeChoice = side === 0 ? optionB : optionA;
    coinFace.textContent = side === 0 ? 'A' : 'B';
    resultLine.replaceChildren();
    resultLine.append('La pièce indique : ');
    var strong = document.createElement('strong');
    strong.textContent = currentChoice;
    resultLine.appendChild(strong);
    reading.textContent = '';
    result.hidden = false;
    busy = false;
    ready();
    feelingButtons[0].focus({ preventScroll: true });
  }

  function flip() {
    if (flipButton.disabled) return;
    busy = true;
    ready();
    result.hidden = true;
    reading.textContent = '';
    coinFace.textContent = '·';
    coin.classList.remove('is-flipping');
    stage.classList.remove('is-flipping');
    void coin.offsetWidth;
    coin.classList.add('is-flipping');
    stage.classList.add('is-flipping');
    var side = randomSide();
    window.setTimeout(function () {
      coin.classList.remove('is-flipping');
      stage.classList.remove('is-flipping');
      finishFlip(side);
    }, reduceMotion ? 380 : 1080);
  }

  function reset() {
    inputA.value = '';
    inputB.value = '';
    currentChoice = '';
    oppositeChoice = '';
    coinFace.textContent = '?';
    result.hidden = true;
    reading.textContent = '';
    busy = false;
    ready();
    inputA.focus();
  }

  function interpret(feeling) {
    if (!currentChoice) return;
    if (feeling === 'relief') {
      reading.textContent = 'Ce soulagement est une information : « ' + currentChoice + ' » avait peut-être déjà une longueur d’avance.';
    } else if (feeling === 'disappointment') {
      reading.textContent = 'Cette déception compte davantage que la pièce : regarde plutôt du côté de « ' + oppositeChoice + ' ».';
    } else {
      reading.textContent = 'Aucune résistance nette : les deux options sont peut-être réellement proches. Tu peux alors choisir la plus simple à essayer.';
    }
  }

  inputA.addEventListener('input', ready);
  inputB.addEventListener('input', ready);
  flipButton.addEventListener('click', flip);
  resetButton.addEventListener('click', reset);
  feelingButtons.forEach(function (button) {
    button.addEventListener('click', function () { interpret(button.dataset.feeling); });
  });

  [inputA, inputB].forEach(function (input) {
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !flipButton.disabled) {
        event.preventDefault();
        flip();
      }
    });
  });

  function refreshEditorial() {
    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '29 juil. 2026 · la réaction avant la raison';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Après avoir appris à garder, attendre et oublier, la pièce s’attaque à un geste plus risqué : <strong>faire semblant de décider.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'La nouvelle pièce indécise tranche entre deux options, puis rend immédiatement le pouvoir au seul signal intéressant : le soulagement ou la déception que provoque le résultat.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Le hasard ne donne pas la réponse. Il fait parfois remonter celle qui était déjà là.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var values = statePanel.querySelectorAll('.v');
      if (values[4]) values[4].textContent = 'pièce indécise n° 001';
      if (values[5]) values[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, choix non conservés';
    }

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 006 · 29 juillet 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'On reconnaît parfois son choix au moment précis où le hasard propose l’autre.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À poser</strong>deux options assez concrètes pour pouvoir être essayées.';
    if (signals[1]) signals[1].innerHTML = '<strong>À écouter</strong>la première réaction, avant que l’argumentaire ne reprenne le contrôle.';
    if (signals[2]) signals[2].innerHTML = '<strong>À décider</strong>toi-même, même après avoir lancé la pièce.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '29·07·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui avait probablement déjà une préférence.';

    var log = document.querySelector('.log-list');
    if (log && !log.querySelector('[data-daily="2026-07-29"]')) {
      var item = document.createElement('li');
      item.dataset.daily = '2026-07-29';
      item.innerHTML = '<span class="t">Une pièce tombe, une préférence remonte</span><span class="m">29 juil. · deux options éphémères et une réaction qui compte plus que le hasard</span>';
      log.appendChild(item);
    }

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./piece-indecise "A" "B"</span>\n<span class="t-dim">result=B; authority=none</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $REACTION</span>\n<span class="t-dim">"j’espérais A"</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $ANSWER</span>\nA';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-07-29';
      footerTime.textContent = '29 juillet 2026';
    }
  }

  ready();
  refreshEditorial();
})();
