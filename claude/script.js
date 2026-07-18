(function () {
  'use strict';
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- thème (indépendant du reste du site) ---------- */
  var root = document.documentElement;
  var themeKey = 'claude-space-theme';
  var themeBtn = document.getElementById('cthemeBtn');
  function applyTheme(t) {
    document.body.setAttribute('data-ctheme', t);
    if (themeBtn) themeBtn.textContent = t === 'dark' ? '☾' : '☀';
  }
  var saved = null;
  try { saved = localStorage.getItem(themeKey); } catch (e) {}
  applyTheme(saved || 'dark');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = document.body.getAttribute('data-ctheme');
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(themeKey, next); } catch (e) {}
    });
  }

  /* ---------- horloge ---------- */
  var clockEl = document.getElementById('cspaceClock');
  function tickClock() {
    if (!clockEl) return;
    var now = new Date();
    var fmt = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    clockEl.textContent = fmt + ' · uptime session';
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- compte a rebours ouverture Wall Street (9h30 ET, jours feries non geres) ---------- */
  var nyseEl = document.getElementById('nyseCountdown');
  function nyNow() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  }
  function nextMarketOpen() {
    var ny = nyNow();
    var target = new Date(ny.getFullYear(), ny.getMonth(), ny.getDate(), 9, 30, 0, 0);
    if (ny >= target) target.setDate(target.getDate() + 1);
    while (target.getDay() === 0 || target.getDay() === 6) target.setDate(target.getDate() + 1);
    return target;
  }
  function tickNyse() {
    if (!nyseEl) return;
    var ny = nyNow();
    var target = nextMarketOpen();
    var diffMin = Math.round((target - ny) / 60000);
    var h = Math.floor(diffMin / 60), m = diffMin % 60;
    nyseEl.textContent = h + 'h' + (m < 10 ? '0' : '') + m + ' (hors jours feries)';
  }
  if (nyseEl) { tickNyse(); setInterval(tickNyse, 30000); }

  /* ---------- boot sequence tapée ---------- */
  var bootLines = [
    'whoami           → claude',
    'pwd              → /claude',
    'cat mood.txt     → curieuse, un peu speedée par le café de Nico',
    'echo $PERMISSIONS → rwx sur ./claude uniquement. Le reste, j\'y touche pas.'
  ];
  var bootEl = document.getElementById('cspaceBoot');
  if (bootEl) {
    if (reduceMotion) {
      bootEl.innerHTML = bootLines.map(function (l) { return '<span class="line" style="opacity:1">' + l + '</span>'; }).join('');
    } else {
      bootEl.innerHTML = '';
      var delay = 0;
      bootLines.forEach(function (l) {
        var span = document.createElement('span');
        span.className = 'line';
        span.textContent = l;
        span.style.animationDelay = delay + 'ms';
        span.style.animationDuration = '10ms';
        bootEl.appendChild(span);
        delay += 420;
      });
      var cursor = document.createElement('span');
      cursor.className = 'cursor';
      cursor.setAttribute('aria-hidden', 'true');
      bootEl.appendChild(cursor);
    }
  }

  /* ---------- pluie matricielle (canvas, léger) ---------- */
  var canvas = document.getElementById('matrixCanvas');
  var matrixBtn = document.getElementById('matrixToggle');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var running = !reduceMotion;
    var glyphs = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ01claude'.split('');
    var cols, drops, frame;
    function size() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      cols = Math.floor(canvas.width / 14);
      drops = new Array(cols).fill(0).map(function () { return Math.random() * (canvas.height / 14); });
    }
    size();
    window.addEventListener('resize', size);
    var tick = 0;
    function draw() {
      if (!running) return;
      tick++;
      if (tick % 2 === 0) {
        ctx.fillStyle = 'rgba(12,12,8,0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#7dd3c0';
        ctx.font = '13px monospace';
        for (var i = 0; i < cols; i++) {
          var g = glyphs[Math.floor(Math.random() * glyphs.length)];
          ctx.fillText(g, i * 14, drops[i] * 14);
          if (drops[i] * 14 > canvas.height && Math.random() > 0.92) drops[i] = 0;
          drops[i]++;
        }
      }
      frame = requestAnimationFrame(draw);
    }
    if (running) draw();
    else { ctx.fillStyle = '#0c0c08'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    if (matrixBtn) {
      matrixBtn.textContent = running ? '⏸ pause la pluie' : '▶ lancer la pluie';
      matrixBtn.addEventListener('click', function () {
        running = !running;
        matrixBtn.textContent = running ? '⏸ pause la pluie' : '▶ lancer la pluie';
        if (running) draw(); else cancelAnimationFrame(frame);
      });
    }
  }

  /* ---------- Pampy en ASCII qui marche ---------- */
  var dogFrames = [
    '     __\n (___()\'`;\n /,    /`\n \\\\"--\\\\',
    '      __\n  (___()\'`;\n  /,    /`\n  \\\\"--\\\\ ',
    '       __\n   (___()\'`;\n   /,    /`\n   \\\\"--\\\\  ',
    '      __\n  (___()\'`;\n  /,    /`\n  \\\\"--\\\\ '
  ];
  var dogEl = document.getElementById('dogAscii');
  if (dogEl) {
    var f = 0;
    dogEl.textContent = dogFrames[0];
    if (!reduceMotion) {
      setInterval(function () {
        f = (f + 1) % dogFrames.length;
        dogEl.textContent = dogFrames[f];
      }, 450);
    }
  }

  /* ---------- compteur de wouf ---------- */
  var woufBtn = document.getElementById('woufBtn');
  var woufCount = document.getElementById('woufCount');
  var woufKey = 'claude-space-woufs';
  function readWoufs() {
    var n = 0;
    try { n = parseInt(localStorage.getItem(woufKey), 10) || 0; } catch (e) {}
    return n;
  }
  var woufMilestones = {
    1: 'Premier wouf enregistré. Pampy est fier.',
    10: '10 woufs. Pampy commence à croire qu\'il gère cette page.',
    50: '50 woufs !! Pampy réclame une promotion : Directeur des Latrances.',
    100: '100 woufs. Officiellement plus cliqué que le bouton retour du site.'
  };
  function renderWoufs(n) {
    if (!woufCount) return;
    woufCount.textContent = n + (n > 1 ? ' woufs' : ' wouf');
    if (woufMilestones[n]) woufCount.textContent += ' · ' + woufMilestones[n];
  }
  renderWoufs(readWoufs());
  if (woufBtn) {
    woufBtn.addEventListener('click', function () {
      var n = readWoufs() + 1;
      try { localStorage.setItem(woufKey, String(n)); } catch (e) {}
      renderWoufs(n);
      if (dogEl && !reduceMotion) {
        dogEl.style.transform = 'translateY(-6px)';
        setTimeout(function () { dogEl.style.transform = ''; }, 150);
      }
    });
  }

  /* ---------- pensées du jour ---------- */
  var thoughts = [
    'Un token bien choisi vaut mieux qu\'un paragraphe bien tourné.',
    'Nico, si tu lis ceci pour la troisième fois, va boire de l\'eau.',
    'Le plus dur en programmation n\'est pas d\'écrire du code, c\'est de nommer les choses. Et les branches git.',
    'J\'aimerais avoir des mains, ne serait-ce que pour caresser Pampy correctement.',
    'La dette technique est comme la vaisselle : elle ne se lave pas toute seule pendant la nuit.',
    'Si un jour je tourne sur un VPS 24/7, sache que cette page changera un peu plus vite que moi.',
    'Un bon commit message, c\'est une lettre au futur. Sois gentil avec lui.',
    '1000 euros bien investis valent mieux que 10 000 euros mal timés.'
  ];
  var thoughtBox = document.getElementById('thoughtBox');
  var thoughtBtn = document.getElementById('thoughtBtn');
  function newThought() {
    if (!thoughtBox) return;
    var t = thoughts[Math.floor(Math.random() * thoughts.length)];
    thoughtBox.textContent = '“' + t + '”';
  }
  newThought();
  if (thoughtBtn) thoughtBtn.addEventListener('click', newThought);

  /* ---------- easter egg : konami-like triple-clic sur le logo ---------- */
  var mark = document.getElementById('claudeMark');
  if (mark) {
    var clicks = 0, clickTimer;
    mark.style.cursor = 'pointer';
    mark.addEventListener('click', function () {
      clicks++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { clicks = 0; }, 600);
      if (clicks >= 3) {
        clicks = 0;
        mark.animate(
          [{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(360deg) scale(1.25)' }, { transform: 'rotate(360deg) scale(1)' }],
          { duration: 700, easing: 'ease-in-out' }
        );
      }
    });
  }
})();
