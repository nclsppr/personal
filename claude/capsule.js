(function () {
  'use strict';

  var root = document.getElementById('timeCapsule');
  var form = document.getElementById('capsuleForm');
  var message = document.getElementById('capsuleMessage');
  var count = document.getElementById('capsuleChars');
  var sealed = document.getElementById('capsuleSealed');
  var revealed = document.getElementById('capsuleRevealed');
  var status = document.getElementById('capsuleStatus');
  var countdown = document.getElementById('capsuleCountdown');
  var revealText = document.getElementById('capsuleRevealText');
  var reset = document.getElementById('capsuleReset');

  if (!root || !form || !message) return;

  var storageKey = 'claude-space-time-capsule-v1';
  var timer = null;

  function readCapsule() {
    try {
      var raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.message !== 'string' || !Number.isFinite(parsed.unlockAt)) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeCapsule(data) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  }

  function removeCapsule() {
    try { localStorage.removeItem(storageKey); } catch (error) {}
  }

  function tomorrowAtMidnight(now) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime();
  }

  function setVisible(element, visible) {
    if (!element) return;
    element.hidden = !visible;
  }

  function updateCharacterCount() {
    if (!count) return;
    count.textContent = message.value.length + ' / 180';
  }

  function formatRemaining(milliseconds) {
    var totalMinutes = Math.max(0, Math.ceil(milliseconds / 60000));
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    if (hours > 0) return hours + ' h ' + String(minutes).padStart(2, '0') + ' min';
    if (minutes > 0) return minutes + ' min';
    return 'quelques secondes';
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function renderEmpty() {
    stopTimer();
    root.dataset.state = 'empty';
    setVisible(form, true);
    setVisible(sealed, false);
    setVisible(revealed, false);
    message.value = '';
    updateCharacterCount();
  }

  function renderRevealed(data) {
    stopTimer();
    root.dataset.state = 'revealed';
    setVisible(form, false);
    setVisible(sealed, false);
    setVisible(revealed, true);
    if (revealText) revealText.textContent = data.message;
  }

  function renderSealed(data) {
    root.dataset.state = 'sealed';
    setVisible(form, false);
    setVisible(sealed, true);
    setVisible(revealed, false);

    function tick() {
      var remaining = data.unlockAt - Date.now();
      if (remaining <= 0) {
        renderRevealed(data);
        return;
      }
      if (status) status.textContent = 'Ta phrase est rangée. Elle reviendra demain.';
      if (countdown) countdown.textContent = 'ouverture dans environ ' + formatRemaining(remaining);
    }

    stopTimer();
    tick();
    timer = setInterval(tick, 30000);
  }

  function render() {
    var data = readCapsule();
    if (!data) {
      renderEmpty();
      return;
    }
    if (Date.now() >= data.unlockAt) renderRevealed(data);
    else renderSealed(data);
  }

  message.addEventListener('input', updateCharacterCount);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = message.value.trim();
    if (!text) {
      message.focus();
      return;
    }

    var now = new Date();
    var data = {
      message: text.slice(0, 180),
      sealedAt: now.getTime(),
      unlockAt: tomorrowAtMidnight(now)
    };

    if (!writeCapsule(data)) {
      if (status) status.textContent = 'Ce navigateur refuse de garder la capsule. Rien n’a été envoyé ailleurs.';
      setVisible(sealed, true);
      setVisible(form, true);
      return;
    }

    renderSealed(data);
  });

  if (reset) {
    reset.addEventListener('click', function () {
      removeCapsule();
      renderEmpty();
      message.focus();
    });
  }

  updateCharacterCount();
  render();
})();