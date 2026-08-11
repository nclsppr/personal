(function () {
  'use strict';

  var monday = document.getElementById('mondayPanel');
  var sunday = document.getElementById('sundayPanel');
  var threshold = document.getElementById('thresholdPanel');
  var collection = document.getElementById('objectCollection');
  var releasePanel = document.querySelector('.release-panel');
  var anchor = monday || sunday || threshold || collection || releasePanel;
  if (!anchor || document.getElementById('hourglassPanel')) return;

  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './hourglass.css?v=20260811-silent-hourglass';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel hourglass-panel span-12';
  panel.id = 'hourglassPanel';
  panel.setAttribute('aria-labelledby', 'hourglass-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="hourglass-title">Le sablier sans alarme</h2>',
      '<span class="panel-badge">3–20 min · aucun ping</span>',
    '</div>',
    '<div class="hourglass-layout">',
      '<div class="hourglass-scene" id="hourglassScene" data-state="idle" aria-hidden="true">',
        '<div class="hourglass-glow"></div>',
        '<div class="hourglass-frame">',
          '<span class="hourglass-cap hourglass-cap--top"></span>',
          '<span class="hourglass-cap hourglass-cap--bottom"></span>',
          '<span class="hourglass-post hourglass-post--left"></span>',
          '<span class="hourglass-post hourglass-post--right"></span>',
          '<div class="hourglass-glass">',
            '<span class="hourglass-sand hourglass-sand--top"></span>',
            '<span class="hourglass-stream"></span>',
            '<span class="hourglass-sand hourglass-sand--bottom"></span>',
          '</div>',
        '</div>',
        '<span class="hourglass-shadow"></span>',
      '</div>',
      '<div class="hourglass-copy">',
        '<p class="hourglass-kicker">une petite île de temps</p>',
        '<h3>Choisis quelques minutes. Rien ne te réclamera à la fin.</h3>',
        '<p class="hourglass-intro">Un minuteur volontairement discret pour lire, réfléchir, jouer avec Pampy, finir une chose ou ne rien produire du tout. Il reste dans cet onglet et ne demande aucune permission.</p>',
        '<div class="hourglass-presets" role="group" aria-label="Choisir la durée du sablier">',
          '<button class="hourglass-preset" type="button" data-minutes="3" aria-pressed="false"><strong>03</strong><span>minutes</span></button>',
          '<button class="hourglass-preset" type="button" data-minutes="5" aria-pressed="true"><strong>05</strong><span>minutes</span></button>',
          '<button class="hourglass-preset" type="button" data-minutes="10" aria-pressed="false"><strong>10</strong><span>minutes</span></button>',
          '<button class="hourglass-preset" type="button" data-minutes="20" aria-pressed="false"><strong>20</strong><span>minutes</span></button>',
        '</div>',
        '<div class="hourglass-readout">',
          '<span class="hourglass-time" id="hourglassTime" aria-live="off">05:00</span>',
          '<p class="hourglass-status" id="hourglassStatus" aria-live="polite">Cinq minutes sont prêtes. Le sablier n’a pas encore bougé.</p>',
        '</div>',
        '<div class="hourglass-actions">',
          '<button class="hourglass-action hourglass-action--primary" id="hourglassStart" type="button">commencer</button>',
          '<button class="hourglass-action" id="hourglassPause" type="button" disabled>pause</button>',
          '<button class="hourglass-action hourglass-action--quiet" id="hourglassReset" type="button" disabled>remettre le sable en haut</button>',
        '</div>',
        '<p class="hourglass-privacy">Pas de son, pas de notification, pas de stockage et pas d’appel réseau. Si le navigateur suspend cet onglet, le temps est recalculé au retour à partir de l’horloge de l’appareil.</p>',
      '</div>',
    '</div>'
  ].join('');

  anchor.insertAdjacentElement('afterend', panel);

  var presets = Array.prototype.slice.call(panel.querySelectorAll('.hourglass-preset'));
  var scene = document.getElementById('hourglassScene');
  var timeEl = document.getElementById('hourglassTime');
  var statusEl = document.getElementById('hourglassStatus');
  var startBtn = document.getElementById('hourglassStart');
  var pauseBtn = document.getElementById('hourglassPause');
  var resetBtn = document.getElementById('hourglassReset');

  var selectedMinutes = 5;
  var durationMs = selectedMinutes * 60000;
  var remainingMs = durationMs;
  var deadline = 0;
  var timer = 0;
  var state = 'idle';

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function format(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    var minutes = Math.floor(total / 60);
    var seconds = total % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  function setProgress() {
    var elapsed = durationMs - remainingMs;
    var progress = durationMs ? clamp(elapsed / durationMs, 0, 1) : 0;
    scene.style.setProperty('--hourglass-progress', progress.toFixed(4));
    scene.style.setProperty('--hourglass-top', ((1 - progress) * 45).toFixed(2) + '%');
    scene.style.setProperty('--hourglass-bottom', (progress * 45).toFixed(2) + '%');
    timeEl.textContent = format(remainingMs);
  }

  function stopTicker() {
    if (timer) window.clearInterval(timer);
    timer = 0;
  }

  function finish() {
    stopTicker();
    remainingMs = 0;
    state = 'done';
    scene.dataset.state = 'done';
    setProgress();
    statusEl.textContent = 'C’est fini. Aucun son n’a interrompu la pièce.';
    startBtn.textContent = 'recommencer';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'pause';
    resetBtn.disabled = false;

    if (!reduceMotion && typeof scene.animate === 'function') {
      scene.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.018)' }, { transform: 'scale(1)' }],
        { duration: 520, easing: 'ease-out' }
      );
    }
  }

  function tick() {
    if (state !== 'running') return;
    remainingMs = Math.max(0, deadline - Date.now());
    setProgress();
    if (remainingMs <= 0) finish();
  }

  function start() {
    if (state === 'done' || state === 'idle') remainingMs = durationMs;
    deadline = Date.now() + remainingMs;
    state = 'running';
    scene.dataset.state = 'running';
    startBtn.textContent = 'en cours';
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'pause';
    resetBtn.disabled = false;
    statusEl.textContent = 'Le sable descend. Tu peux fermer les yeux sur le reste quelques minutes.';
    stopTicker();
    timer = window.setInterval(tick, 250);
    tick();
  }

  function pause() {
    if (state === 'running') {
      remainingMs = Math.max(0, deadline - Date.now());
      stopTicker();
      state = 'paused';
      scene.dataset.state = 'paused';
      setProgress();
      startBtn.disabled = true;
      pauseBtn.textContent = 'reprendre';
      statusEl.textContent = 'Le sablier est suspendu. Rien ne presse.';
      return;
    }

    if (state === 'paused') {
      deadline = Date.now() + remainingMs;
      state = 'running';
      scene.dataset.state = 'running';
      pauseBtn.textContent = 'pause';
      statusEl.textContent = 'Le sable redescend, sans bruit.';
      stopTicker();
      timer = window.setInterval(tick, 250);
      tick();
    }
  }

  function reset() {
    stopTicker();
    remainingMs = durationMs;
    state = 'idle';
    scene.dataset.state = 'idle';
    startBtn.textContent = 'commencer';
    startBtn.disabled = false;
    pauseBtn.textContent = 'pause';
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    statusEl.textContent = selectedMinutes + (selectedMinutes === 1 ? ' minute est prête.' : ' minutes sont prêtes.') + ' Le sablier n’a pas encore bougé.';
    setProgress();
  }

  function choose(minutes, button) {
    selectedMinutes = minutes;
    durationMs = minutes * 60000;
    remainingMs = durationMs;
    presets.forEach(function (preset) {
      var active = preset === button;
      preset.setAttribute('aria-pressed', String(active));
      preset.classList.toggle('is-selected', active);
    });
    reset();
    statusEl.textContent = minutes + ' minutes sont prêtes. Rien ne sonnera à la fin.';
  }

  presets.forEach(function (preset) {
    if (preset.getAttribute('aria-pressed') === 'true') preset.classList.add('is-selected');
    preset.addEventListener('click', function () {
      choose(parseInt(preset.dataset.minutes, 10), preset);
    });
  });

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pause);
  resetBtn.addEventListener('click', reset);

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && state === 'running') tick();
  });

  setProgress();

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
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : objets interactifs, carnet de route archivé et un sablier silencieux pour prendre quelques minutes sans notification.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com avec des objets quotidiens, Pampy à la sécurité et un minuteur qui refuse de sonner.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '11 août 2026 · quelques minutes sans ping';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Hier, le bureau s’ouvrait avant le bruit. <strong>Aujourd’hui, la pièce garde un petit morceau de temps à l’écart.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Le nouveau sablier propose trois, cinq, dix ou vingt minutes et fait exprès de ne rien déclencher à la fin : ni son, ni notification, ni permission demandée.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Une durée peut être utile sans devenir une urgence. Quand le sable est en bas, la page se contente de le dire.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var stateValues = statePanel.querySelectorAll('.v');
      if (stateValues[4]) stateValues[4].textContent = 'sablier sans alarme n° 001';
      if (stateValues[5]) stateValues[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, mode silencieux';
    }

    var collectionPanel = document.getElementById('objectCollection');
    var collectionBadge = collectionPanel && collectionPanel.querySelector('.panel-badge');
    if (collectionBadge) collectionBadge.textContent = '7 objets · 7 haltes hors étagère';

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 019 · 11 août 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Tout ce qui mesure le temps n’a pas besoin de te rappeler à l’ordre. Certaines minutes peuvent simplement passer.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À prendre</strong>cinq minutes qui ne produisent rien de mesurable.';
    if (signals[1]) signals[1].innerHTML = '<strong>À couper</strong>un ping qui n’avait pas vraiment besoin d’exister.';
    if (signals[2]) signals[2].innerHTML = '<strong>À laisser</strong>le temps se terminer sans transformer la fin en alarme.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '11·08·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui aimerait parfois qu’un minuteur sache se taire.';

    appendLog(document.querySelector('.log-list'), '2026-08-11', 'Un sablier refuse poliment de sonner', '11 août · 3 à 20 minutes, pause locale, zéro notification, zéro stockage et aucune permission');

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./sablier --minutes 5 --alarm off</span>\n<span class="t-dim">timer=running; notifications=0; audio=0</span>\n<span class="t-prompt">$</span> <span class="t-key">./sablier --on-finish whisper</span>\n<span class="t-dim">done. that was enough.</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-08-11';
      footerTime.textContent = '11 août 2026';
    }
  }

  refreshEditorial();
})();
