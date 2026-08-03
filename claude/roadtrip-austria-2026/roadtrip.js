(function () {
  'use strict';

  var root = document.documentElement;
  var themeKey = 'claude-space-theme';
  var storageKey = 'roadtrip-austria-2026:v2';
  var legacyStorageKey = 'roadtrip-austria-2026:v1';
  var themeBtn = document.getElementById('cthemeBtn');
  var checkboxes = Array.from(document.querySelectorAll('[data-check]'));
  var dayStatusFields = Array.from(document.querySelectorAll('[data-day-status]'));
  var tripStatus = document.getElementById('tripStatus');
  var tripStatusDetail = document.getElementById('tripStatusDetail');
  var tripProgress = document.getElementById('tripProgress');
  var progressLabel = document.getElementById('progressLabel');
  var nextMilestone = document.getElementById('nextMilestone');
  var nextMilestoneLink = document.getElementById('nextMilestoneLink');
  var saveState = document.getElementById('saveState');
  var resetButton = document.getElementById('resetTrip');
  var immediatePrepGroups = ['prep-vignette', 'prep-dog-docs', 'prep-dog-kit', 'prep-offline-maps'];
  var storageAvailable = canUseStorage();

  function canUseStorage() {
    try {
      var probe = storageKey + ':probe';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return true;
    } catch (error) {
      return false;
    }
  }

  function applyTheme(value) {
    var theme = value === 'light' ? 'light' : 'dark';
    var isDark = theme === 'dark';
    root.dataset.ctheme = theme;

    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = isDark ? '#14140f' : '#faf7f0';

    if (themeBtn) {
      themeBtn.textContent = isDark ? '☀' : '☾';
      themeBtn.setAttribute('aria-pressed', String(isDark));
      themeBtn.setAttribute('aria-label', isDark ? 'Activer le thème clair' : 'Activer le thème sombre');
    }
  }

  function loadTheme() {
    var savedTheme = null;
    try { savedTheme = localStorage.getItem(themeKey); } catch (error) {}
    applyTheme(savedTheme || 'dark');
  }

  function toggleTheme() {
    var next = root.dataset.ctheme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(themeKey, next); } catch (error) {}
  }

  function baselineState() {
    return {
      version: 2,
      checks: {
        'prep-vignette': true,
        'prep-dog-docs': true,
        'prep-dog-kit': true,
        'prep-offline-maps': true,
        'd1-arrive-tux': true,
        'd1-pampy-walk': true,
        'd2-weather-check': true,
        'd2-schlegeis-hike': true,
        'd2-pampy-care': true,
        'd3-dog-arrangement': true
      },
      dayStatus: {
        d1: 'on-track',
        d2: 'on-track',
        d3: 'adapted'
      },
      updatedAt: null
    };
  }

  function readState() {
    var baseline = baselineState();
    if (!storageAvailable) return baseline;

    try {
      var currentRaw = localStorage.getItem(storageKey);
      var current = currentRaw ? JSON.parse(currentRaw) : null;

      if (current && current.version === 2) {
        return {
          version: 2,
          checks: Object.assign({}, baseline.checks, current.checks && typeof current.checks === 'object' ? current.checks : {}),
          dayStatus: Object.assign({}, baseline.dayStatus, current.dayStatus && typeof current.dayStatus === 'object' ? current.dayStatus : {}),
          updatedAt: typeof current.updatedAt === 'string' ? current.updatedAt : null
        };
      }

      var legacyRaw = localStorage.getItem(legacyStorageKey);
      var legacy = legacyRaw ? JSON.parse(legacyRaw) : null;
      if (!legacy || legacy.version !== 1) return baseline;

      var legacyChecks = legacy.checks && typeof legacy.checks === 'object' ? legacy.checks : {};
      var migratedChecks = Object.assign({}, baseline.checks, legacyChecks);
      if (legacyChecks['d2-olpererhuette'] === true) migratedChecks['d2-schlegeis-hike'] = true;

      return {
        version: 2,
        checks: migratedChecks,
        dayStatus: Object.assign({}, legacy.dayStatus && typeof legacy.dayStatus === 'object' ? legacy.dayStatus : {}, baseline.dayStatus),
        updatedAt: typeof legacy.updatedAt === 'string' ? legacy.updatedAt : null
      };
    } catch (error) {
      return baseline;
    }
  }

  function collectState() {
    var checks = {};
    var statuses = {};

    checkboxes.forEach(function (input) {
      checks[input.id] = input.checked;
    });

    dayStatusFields.forEach(function (field) {
      statuses[field.dataset.dayStatus] = field.value;
    });

    return {
      version: 2,
      checks: checks,
      dayStatus: statuses,
      updatedAt: new Date().toISOString()
    };
  }

  function applyState(state) {
    checkboxes.forEach(function (input) {
      input.checked = state.checks[input.id] === true;
    });

    dayStatusFields.forEach(function (field) {
      var value = state.dayStatus[field.dataset.dayStatus];
      field.value = ['planned', 'on-track', 'adapted', 'review'].indexOf(value) >= 0 ? value : 'planned';
      updateDayCard(field);
    });

    renderSummary(state.updatedAt);
  }

  function save() {
    var state = collectState();

    if (storageAvailable) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        storageAvailable = false;
      }
    }

    renderSummary(storageAvailable ? state.updatedAt : null);
  }

  function updateDayCard(field) {
    var card = document.querySelector('[data-day-card="' + field.dataset.dayStatus + '"]');
    if (card) card.dataset.status = field.value;
  }

  function criticalGroups() {
    var groups = {};

    checkboxes.forEach(function (input) {
      if (input.dataset.optional === 'true') return;
      var key = input.dataset.criticalGroup || input.id;

      if (!groups[key]) {
        groups[key] = {
          key: key,
          inputs: [],
          due: input.dataset.due ? new Date(input.dataset.due) : null,
          label: input.dataset.milestone || input.id
        };
      }

      groups[key].inputs.push(input);
    });

    return Object.keys(groups).map(function (key) {
      var group = groups[key];
      group.done = group.inputs.some(function (input) { return input.checked; });
      return group;
    });
  }

  function anchorForGroup(group) {
    var row = group.inputs[0];
    var dayItem = row.closest('.day-list > li');
    return dayItem && dayItem.id ? '#' + dayItem.id : '#avant-depart';
  }

  function renderSummary(updatedAt) {
    var groups = criticalGroups();
    var done = groups.filter(function (group) { return group.done; });
    var percentage = groups.length ? Math.round((done.length / groups.length) * 100) : 0;
    var now = new Date();
    var tripStart = new Date('2026-08-01T00:30:00+02:00');
    var tripEnd = new Date('2026-08-08T20:00:00+02:00');
    var arrivalDone = document.getElementById('d8-arrive-hettange').checked;
    var statuses = dayStatusFields.map(function (field) { return field.value; });
    var reviewCount = statuses.filter(function (status) { return status === 'review'; }).length;
    var adaptedCount = statuses.filter(function (status) { return status === 'adapted'; }).length;
    var confirmedDays = statuses.filter(function (status) { return status === 'on-track'; }).length;
    var overdue = groups.filter(function (group) {
      return !group.done && group.due && group.due.getTime() < now.getTime();
    });

    tripProgress.value = percentage;
    tripProgress.textContent = percentage + ' %';
    progressLabel.textContent = done.length + ' sur ' + groups.length;

    if (arrivalDone) {
      tripStatus.textContent = 'Roadtrip terminé';
      tripStatusDetail.textContent = 'Retour à Hettange-Grande confirmé. Mission accomplie.';
    } else if (reviewCount > 0) {
      tripStatus.textContent = 'Plan à ajuster';
      tripStatusDetail.textContent = reviewCount + ' journée' + (reviewCount > 1 ? 's' : '') + ' marquée' + (reviewCount > 1 ? 's' : '') + ' « à revoir ».';
    } else if (now.getTime() < tripStart.getTime()) {
      var prepLeft = groups.filter(function (group) {
        return immediatePrepGroups.indexOf(group.key) >= 0 && !group.done;
      }).length;

      tripStatus.textContent = prepLeft === 0 ? 'Prêt à partir' : prepLeft + ' essentiel' + (prepLeft > 1 ? 's' : '') + ' à confirmer';
      tripStatusDetail.textContent = prepLeft === 0 ? 'Les indispensables de cette nuit sont cochés.' : 'Le départ reste souple, mais ces points méritent une vérification.';
    } else if (now.getTime() > tripEnd.getTime()) {
      tripStatus.textContent = 'Arrivée à confirmer';
      tripStatusDetail.textContent = 'Coche l’arrivée à Hettange-Grande pour refermer le carnet.';
    } else if (overdue.length > 0) {
      tripStatus.textContent = overdue.length + ' étape' + (overdue.length > 1 ? 's' : '') + ' à confirmer';
      tripStatusDetail.textContent = 'Un oubli de coche n’est pas un retard. Vérifie simplement les jalons passés.';
    } else {
      tripStatus.textContent = 'Dans les temps';
      tripStatusDetail.textContent = confirmedDays + ' journée' + (confirmedDays > 1 ? 's' : '') + ' comme prévu, ' + adaptedCount + ' adaptée' + (adaptedCount > 1 ? 's' : '') + '.';
    }

    var next = groups.filter(function (group) { return !group.done; }).sort(function (a, b) {
      var aTime = a.due ? a.due.getTime() : Number.MAX_SAFE_INTEGER;
      var bTime = b.due ? b.due.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })[0];

    nextMilestone.textContent = next ? next.label : 'Profiter du retour';
    nextMilestoneLink.href = next ? anchorForGroup(next) : '#itineraire';
    nextMilestoneLink.textContent = next ? 'Voir ce repère ↓' : 'Relire le carnet ↑';

    if (!storageAvailable) {
      saveState.textContent = 'Sauvegarde locale indisponible dans ce navigateur.';
    } else if (updatedAt) {
      var savedDate = new Date(updatedAt);
      saveState.textContent = 'Sauvegardé sur cet appareil à ' + savedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '.';
    } else {
      saveState.textContent = 'Les coches seront sauvegardées uniquement sur cet appareil.';
    }
  }

  function resetTrip() {
    var accepted = window.confirm('Effacer tes nouvelles coches et revenir au journal déjà connu: samedi à Tux, dimanche à Schlegeis et lundi adapté avec Pampy ?');
    if (!accepted) return;

    if (storageAvailable) {
      try { localStorage.removeItem(storageKey); } catch (error) {}
      try { localStorage.removeItem(legacyStorageKey); } catch (error) {}
    }

    applyState(baselineState());
    resetButton.focus();
  }

  loadTheme();
  applyState(readState());

  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  checkboxes.forEach(function (input) { input.addEventListener('change', save); });
  dayStatusFields.forEach(function (field) {
    field.addEventListener('change', function () {
      updateDayCard(field);
      save();
    });
  });
  if (resetButton) resetButton.addEventListener('click', resetTrip);

  window.addEventListener('storage', function (event) {
    if (event.key === storageKey || event.key === legacyStorageKey) applyState(readState());
    if (event.key === themeKey) applyTheme(event.newValue || 'dark');
  });
})();
