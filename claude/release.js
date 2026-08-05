(function () {
  'use strict';

  var form = document.getElementById('releaseForm');
  var textarea = document.getElementById('releaseMessage');
  var count = document.getElementById('releaseCount');
  var button = document.getElementById('releaseButton');
  var sky = document.getElementById('releaseSky');
  var fragments = document.getElementById('releaseFragments');
  var status = document.getElementById('releaseStatus');
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!form || !textarea || !count || !button || !sky || !fragments || !status) return;

  function renderCount() {
    var length = textarea.value.length;
    count.textContent = length + ' / 220';
    button.disabled = textarea.value.trim().length === 0;
  }

  function sampleCharacters(text, limit) {
    var chars = Array.from(text.replace(/\s+/g, ' ').trim());
    if (chars.length <= limit) return chars;

    var sampled = [];
    var step = chars.length / limit;
    for (var i = 0; i < limit; i++) sampled.push(chars[Math.floor(i * step)]);
    return sampled;
  }

  function release(text) {
    fragments.replaceChildren();
    sky.classList.remove('is-breathing');
    void sky.offsetWidth;
    sky.classList.add('is-breathing');

    var chars = sampleCharacters(text, reduceMotion ? 32 : 72);
    chars.forEach(function (char, index) {
      var span = document.createElement('span');
      var angle = -34 + Math.random() * 24;
      var distance = 170 + Math.random() * 260;
      var x = Math.cos(angle * Math.PI / 180) * distance;
      var y = Math.sin(angle * Math.PI / 180) * distance - 55 - Math.random() * 90;

      span.className = 'release-fragment';
      span.textContent = char === ' ' ? '·' : char;
      span.style.left = (12 + Math.random() * 40) + '%';
      span.style.top = (58 + Math.random() * 23) + '%';
      span.style.setProperty('--x', x.toFixed(0) + 'px');
      span.style.setProperty('--y', y.toFixed(0) + 'px');
      span.style.setProperty('--r', (-55 + Math.random() * 110).toFixed(0) + 'deg');
      span.style.setProperty('--s', (.55 + Math.random() * .75).toFixed(2));
      span.style.setProperty('--delay', (index * 13 + Math.random() * 180).toFixed(0) + 'ms');
      span.style.setProperty('--duration', (1650 + Math.random() * 1050).toFixed(0) + 'ms');
      fragments.appendChild(span);
    });

    window.setTimeout(function () {
      fragments.replaceChildren();
      sky.classList.remove('is-breathing');
    }, reduceMotion ? 900 : 3400);
  }

  textarea.addEventListener('input', renderCount);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = textarea.value.trim();
    if (!text) return;

    textarea.value = '';
    renderCount();
    release(text);
    status.textContent = 'C’est parti. Rien n’a été sauvegardé.';

    window.setTimeout(function () {
      status.textContent = 'Le courant d’air est de nouveau libre.';
    }, reduceMotion ? 1100 : 3600);
  });

  renderCount();
})();

(function loadDailyRoomObjects() {
  'use strict';

  var objects = [
    { date: '2026-07-29', src: './decision.js?v=20260729-choice' },
    { date: '2026-07-30', src: './pause.js?v=20260730-pause' },
    { date: '2026-07-31', src: './hello.js?v=20260731-hello' },
    { date: '2026-08-01', src: './detail.js?v=20260801-detail' },
    { date: '2026-08-03', src: './cairn.js?v=20260803-cairn' },
    { date: '2026-08-04', src: './compass.js?v=20260804-compass' },
    { date: '2026-08-02', src: './collection.js?v=20260804-compass' },
    { date: '2026-08-05', src: './lake.js?v=20260805-lake' }
  ];

  function load(index) {
    if (index >= objects.length) return;
    var object = objects[index];
    var selector = 'script[data-claude-daily="' + object.date + '"]';
    if (document.querySelector(selector)) {
      load(index + 1);
      return;
    }

    var script = document.createElement('script');
    script.src = object.src;
    script.async = false;
    script.dataset.claudeDaily = object.date;
    script.addEventListener('load', function () { load(index + 1); });
    script.addEventListener('error', function () { load(index + 1); });
    document.body.appendChild(script);
  }

  load(0);
})();
