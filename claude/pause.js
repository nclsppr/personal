(function () {
  'use strict';

  var anchor = document.getElementById('decisionPanel') || document.querySelector('.release-panel');
  if (!anchor || document.getElementById('pausePanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './pause.css?v=20260730-pause';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel pause-panel span-12';
  panel.id = 'pausePanel';
  panel.setAttribute('aria-labelledby', 'pause-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="pause-title">La minute sans rendement</h2>',
      '<span class="panel-badge">60 secondes · aucun score · aucune trace</span>',
    '</div>',
    '<div class="pause-room">',
      '<div class="pause-stage" id="pauseStage" aria-hidden="true">',
        '<div class="pause-dial" id="pauseDial"><span class="pause-clock" id="pauseClock">01:00</span></div>',
        '<p class="pause-stage-note">Le cercle avance. Rien d’autre ne t’est demandé.</p>',
      '</div>',
      '<div class="pause-copy">',
        '<h3>Une minute qui ne cherche pas à devenir utile.</h3>',
        '<p class="pause-intro">Pas de respiration imposée, de série à maintenir ou de performance calme à réussir. Lance simplement soixante secondes et laisse l’écran ne rien attendre de toi.</p>',
        '<p class="pause-message" id="pauseMessage">Quand tu es prêt·e, pose les mains et commence.</p>',
        '<div class="pause-actions">',
          '<button class="pause-start" id="pauseStart" type="button">commencer la minute</button>',
          '<button class="pause-stop" id="pauseStop" type="button" hidden>repartir plus tôt</button>',
        '</div>',
        '<p class="pause-status" id="pauseStatus" aria-live="polite">Le minuteur est immobile.</p>',
        '<p class="pause-privacy">Aucun son, aucune notification, aucun stockage et aucun appel réseau. Fermer l’onglet suffit pour partir.</p>',
      '</div>',
    '</div>'
  ].join('');
  anchor.insertAdjacentElement('afterend', panel);

  var totalSeconds = 60;
  var stage = document.getElementById('pauseStage');
  var dial = document.getElementById('pauseDial');
  var clock = document.getElementById('pauseClock');
  var message = document.getElementById('pauseMessage');
  var startButton = document.getElementById('pauseStart');
  var stopButton = document.getElementById('pauseStop');
  var status = document.getElementById('pauseStatus');
  var frame = 0;
  var startedAt = 0;
  var running = false;
  var lastAnnouncedSecond = totalSeconds;

  function formatTime(seconds) {
    var whole = Math.max(0, Math.ceil(seconds));
    return '00:' + String(whole).padStart(2, '0');
  }

  function phraseFor(seconds) {
    if (seconds <= 0) return 'La minute est terminée. Elle n’a rien produit, et c’était tout son travail.';
    if (seconds <= 15) return 'Encore quelques secondes sans objectif.';
    if (seconds <= 30) return 'Relâche peut-être les épaules. Le minuteur n’en fera pas une statistique.';
    if (seconds <= 45) return 'Regarde un point autour de toi qui n’est pas cet écran.';
    return 'Tu n’as rien à produire pendant cette minute.';
  }

  function render(seconds) {
    var bounded = Math.max(0, Math.min(totalSeconds, seconds));
    var progress = ((totalSeconds - bounded) / totalSeconds) * 360;
    dial.style.setProperty('--pause-progress', progress.toFixed(2) + 'deg');
    clock.textContent = formatTime(bounded);
    message.textContent = phraseFor(bounded);

    var announced = Math.ceil(bounded);
    if (announced !== lastAnnouncedSecond) {
      lastAnnouncedSecond = announced;
      if (announced > 0 && announced % 15 === 0) status.textContent = announced + ' secondes restent, sans urgence.';
    }
  }

  function finish(early) {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    running = false;
    stage.classList.remove('is-running');
    stage.classList.toggle('is-complete', !early);
    startButton.disabled = false;
    startButton.textContent = early ? 'recommencer la minute' : 'reprendre une minute';
    stopButton.hidden = true;

    if (early) {
      render(totalSeconds);
      status.textContent = 'Tu es reparti·e plus tôt. Aucun échec enregistré.';
    } else {
      render(0);
      status.textContent = 'Une minute entièrement à toi vient de passer.';
    }
  }

  function tick(now) {
    if (!running) return;
    var elapsed = (now - startedAt) / 1000;
    var remaining = totalSeconds - elapsed;
    render(remaining);
    if (remaining <= 0) finish(false);
    else frame = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    startedAt = performance.now();
    lastAnnouncedSecond = totalSeconds;
    stage.classList.remove('is-complete');
    stage.classList.add('is-running');
    startButton.disabled = true;
    stopButton.hidden = false;
    status.textContent = 'La minute a commencé.';
    render(totalSeconds);
    frame = requestAnimationFrame(tick);
  }

  startButton.addEventListener('click', start);
  stopButton.addEventListener('click', function () { finish(true); });

  function setMeta(selector, content) {
    var element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
  }

  function refreshEditorial() {
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : une fenêtre, des objets privés et une minute qui ne mesure rien.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com où l’on peut attendre, oublier, hésiter et maintenant ne rien produire pendant une minute.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '30 juil. 2026 · une minute sans rendement';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Après avoir appris à garder, attendre, oublier et hésiter, la pièce tente quelque chose de presque subversif : <strong>ne rien optimiser pendant une minute.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Le nouveau cercle avance pendant soixante secondes sans guider la respiration, distribuer de badge ou compter une série. Il ne promet même pas de rendre plus productif ensuite.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Le temps peut aussi passer sans devenir une donnée.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var values = statePanel.querySelectorAll('.v');
      if (values[4]) values[4].textContent = 'minute sans rendement n° 001';
      if (values[5]) values[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, rien mesuré';
    }

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 007 · 30 juillet 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Une minute n’a pas besoin de rapporter quelque chose pour avoir compté.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À arrêter</strong>le réflexe de remplir chaque intervalle disponible.';
    if (signals[1]) signals[1].innerHTML = '<strong>À regarder</strong>un détail qui ne réclame aucune décision.';
    if (signals[2]) signals[2].innerHTML = '<strong>À reprendre</strong>seulement quand la minute est vraiment passée.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '30·07·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui n’a rien à prouver pendant soixante secondes.';

    var log = document.querySelector('.log-list');
    if (log && !log.querySelector('[data-daily="2026-07-30"]')) {
      var item = document.createElement('li');
      item.dataset.daily = '2026-07-30';
      item.innerHTML = '<span class="t">Une minute refuse de devenir productive</span><span class="m">30 juil. · soixante secondes sans score, stockage, notification ni objectif caché</span>';
      log.appendChild(item);
    }

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">time ./minute-sans-rendement --seconds 60</span>\n<span class="t-dim">elapsed=60s; score=none; streak=none</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $PRODUCTIVITY_GAIN</span>\n<span class="t-dim">not measured</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-07-30';
      footerTime.textContent = '30 juillet 2026';
    }
  }

  render(totalSeconds);
  refreshEditorial();
})();
