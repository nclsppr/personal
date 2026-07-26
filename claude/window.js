(function () {
  'use strict';

  var windowEl = document.getElementById('roomWindow');
  if (!windowEl) return;

  var timeEl = document.getElementById('windowTime');
  var dateEl = document.getElementById('windowDate');
  var kickerEl = document.getElementById('windowKicker');
  var greetingEl = document.getElementById('windowGreeting');
  var noteEl = document.getElementById('windowNote');
  var badgeEl = document.getElementById('windowPhaseBadge');
  var lampBtn = document.getElementById('windowLamp');
  var starsEl = document.getElementById('windowStars');
  var lampKey = 'claude-space-window-lamp';

  var copy = {
    dawn: {
      badge: 'aube locale',
      kicker: 'le jour arrive doucement',
      greeting: 'La pièce se réveille.',
      notes: [
        'Tout n’a pas besoin d’être décidé avant le premier café.',
        'Le matin est une version bêta de la journée.',
        'Une fenêtre ouverte suffit parfois à remettre les idées dans l’ordre.'
      ]
    },
    day: {
      badge: 'jour local',
      kicker: 'la lumière est déjà entrée',
      greeting: 'Il fait jour ici.',
      notes: [
        'Le monde peut attendre deux minutes pendant que tu regardes dehors.',
        'Les bonnes idées aiment aussi les pauses sans objectif.',
        'Cette fenêtre ne montre rien d’urgent, et c’est volontaire.'
      ]
    },
    dusk: {
      badge: 'soir local',
      kicker: 'les contours deviennent plus doux',
      greeting: 'La journée baisse le volume.',
      notes: [
        'On peut fermer les onglets sans avoir terminé toutes les pensées.',
        'Le soir n’est pas un retard : c’est une transition.',
        'Une lampe allumée transforme parfois une pièce entière.'
      ]
    },
    night: {
      badge: 'nuit locale',
      kicker: 'le reste du site dort peut-être',
      greeting: 'La fenêtre garde la veille.',
      notes: [
        'Les idées nocturnes ont le droit d’attendre le matin avant de devenir des décisions.',
        'Quelqu’un quelque part regarde probablement une autre fenêtre.',
        'La nuit rend les petits endroits du web un peu plus grands.'
      ]
    }
  };

  function phaseForHour(hour) {
    if (hour >= 6 && hour < 9) return 'dawn';
    if (hour >= 9 && hour < 18) return 'day';
    if (hour >= 18 && hour < 22) return 'dusk';
    return 'night';
  }

  function daySeed(date) {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  }

  function seededIndex(seed, length) {
    var value = (seed * 9301 + 49297) % 233280;
    return Math.floor((value / 233280) * length);
  }

  function renderStars(date) {
    if (!starsEl || starsEl.childElementCount) return;
    var seed = daySeed(date) || 1;
    for (var i = 0; i < 34; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      var star = document.createElement('i');
      star.style.left = (4 + (seed % 92)) + '%';
      seed = (seed * 1664525 + 1013904223) >>> 0;
      star.style.top = (5 + (seed % 78)) + '%';
      star.style.animationDelay = '-' + ((seed % 2800) / 1000) + 's';
      if (seed % 5 === 0) {
        star.style.width = '3px';
        star.style.height = '3px';
      }
      starsEl.appendChild(star);
    }
  }

  function readLamp() {
    try { return localStorage.getItem(lampKey) === 'on'; } catch (e) { return false; }
  }

  function applyLamp(isOn) {
    windowEl.classList.toggle('is-lit', isOn);
    if (lampBtn) {
      lampBtn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      lampBtn.textContent = isOn ? 'éteindre la lampe' : 'allumer la lampe';
    }
  }

  function updateWindow() {
    var now = new Date();
    var phase = phaseForHour(now.getHours());
    var phaseCopy = copy[phase];
    var noteIndex = seededIndex(daySeed(now) + phase.length, phaseCopy.notes.length);

    windowEl.setAttribute('data-phase', phase);
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (kickerEl) kickerEl.textContent = phaseCopy.kicker;
    if (greetingEl) greetingEl.textContent = phaseCopy.greeting;
    if (noteEl) noteEl.textContent = phaseCopy.notes[noteIndex];
    if (badgeEl) badgeEl.textContent = phaseCopy.badge;
  }

  renderStars(new Date());
  applyLamp(readLamp());
  updateWindow();
  setInterval(updateWindow, 30000);

  if (lampBtn) {
    lampBtn.addEventListener('click', function () {
      var next = !windowEl.classList.contains('is-lit');
      applyLamp(next);
      try { localStorage.setItem(lampKey, next ? 'on' : 'off'); } catch (e) {}
    });
  }
})();
