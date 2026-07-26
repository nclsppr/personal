(function () {
  'use strict';

  var STORAGE_KEY = 'claude-space-inner-weather-v1';
  var dial = document.getElementById('weatherDial');
  var result = document.getElementById('weatherResult');
  var trail = document.getElementById('weatherTrail');
  var clearBtn = document.getElementById('weatherClear');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-weather-choice]'));

  if (!dial || !result || !trail || !buttons.length) return;

  var weather = {
    clear: {
      icon: '☀',
      name: 'Ciel clair',
      message: 'Tout semble respirer correctement. Profite de cette éclaircie sans chercher immédiatement à la rentabiliser.'
    },
    variable: {
      icon: '◐',
      name: 'Variable',
      message: 'Un peu de lumière, quelques nuages. Une journée peut contenir plusieurs nuances à la fois.'
    },
    fog: {
      icon: '≈',
      name: 'Brume',
      message: 'La visibilité est courte. Inutile de voir tout l’horizon : le prochain pas suffit.'
    },
    wind: {
      icon: '↝',
      name: 'Grand vent',
      message: 'Beaucoup de mouvement aujourd’hui. Prendre une minute aide parfois à retrouver la direction.'
    },
    storm: {
      icon: 'ϟ',
      name: 'Orage',
      message: 'Le ciel est chargé. Rien n’oblige à tout régler maintenant ; on peut commencer par ralentir.'
    }
  };

  function dateKey(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function dateLabel(key) {
    var parts = key.split('-');
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function readHistory() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (entry) {
        return entry && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && weather[entry.value];
      });
    } catch (e) {
      return [];
    }
  }

  function writeHistory(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return true;
    } catch (e) {
      return false;
    }
  }

  function renderChoice(value, saved) {
    var item = weather[value];
    dial.dataset.weather = value || 'waiting';

    buttons.forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.weatherChoice === value ? 'true' : 'false');
    });

    if (!item) {
      result.innerHTML = '<strong>Aucun relevé pour aujourd’hui.</strong> Choisis le ciel qui ressemble le plus à ton état du moment.';
      return;
    }

    result.innerHTML = '<strong>' + item.name + '.</strong> ' + item.message + (saved === false ? ' <em>Ce navigateur n’a pas pu conserver le relevé.</em>' : '');
  }

  function renderTrail(entries) {
    trail.innerHTML = '';
    var recent = entries.slice().sort(function (a, b) {
      return a.date.localeCompare(b.date);
    }).slice(-7);

    if (!recent.length) {
      var empty = document.createElement('span');
      empty.className = 'weather-empty';
      empty.textContent = 'Aucun ancien ciel ici. Le premier point peut être posé aujourd’hui.';
      trail.appendChild(empty);
      return;
    }

    recent.forEach(function (entry) {
      var item = weather[entry.value];
      var day = document.createElement('span');
      day.className = 'weather-day';
      day.dataset.weather = entry.value;
      day.textContent = item.icon;
      day.title = dateLabel(entry.date) + ' · ' + item.name;
      day.setAttribute('aria-label', dateLabel(entry.date) + ' : ' + item.name);
      trail.appendChild(day);
    });
  }

  function saveToday(value) {
    var today = dateKey(new Date());
    var entries = readHistory().filter(function (entry) { return entry.date !== today; });
    entries.push({ date: today, value: value });
    entries.sort(function (a, b) { return a.date.localeCompare(b.date); });
    entries = entries.slice(-7);
    var saved = writeHistory(entries);
    renderChoice(value, saved);
    renderTrail(entries);
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      saveToday(button.dataset.weatherChoice);
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      renderChoice(null);
      renderTrail([]);
    });
  }

  var history = readHistory();
  var today = dateKey(new Date());
  var current = history.find(function (entry) { return entry.date === today; });
  renderChoice(current ? current.value : null);
  renderTrail(history);
})();
