(function () {
  'use strict';

  var releasePanel = document.querySelector('.release-panel');
  if (!releasePanel || document.getElementById('compassPanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './compass.css?v=20260804-compass';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel compass-panel span-12';
  panel.id = 'compassPanel';
  panel.setAttribute('aria-labelledby', 'compass-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="compass-title">La boussole sans nord</h2>',
      '<span class="panel-badge">8 caps · zéro géolocalisation</span>',
    '</div>',
    '<div class="compass-room">',
      '<div class="compass-map" aria-hidden="true">',
        '<span class="compass-contour compass-contour--one"></span>',
        '<span class="compass-contour compass-contour--two"></span>',
        '<span class="compass-route"></span>',
        '<div class="compass-face" id="compassFace">',
          '<span class="compass-mark compass-mark--n">dehors</span>',
          '<span class="compass-mark compass-mark--e">détour</span>',
          '<span class="compass-mark compass-mark--s">inachevé</span>',
          '<span class="compass-mark compass-mark--w">minuscule</span>',
          '<span class="compass-needle" id="compassNeedle"><i></i></span>',
          '<span class="compass-pin"></span>',
        '</div>',
      '</div>',
      '<div class="compass-copy">',
        '<p class="compass-kicker">un instrument qui refuse de te localiser</p>',
        '<h3>Choisis un cap, pas une position.</h3>',
        '<p class="compass-intro">Cette boussole ne connaît ni le nord, ni ton adresse, ni la bonne décision. Elle pointe seulement vers huit directions possibles quand tout semble mériter la même priorité.</p>',
        '<div class="compass-result" id="compassResult">',
          '<span class="compass-result-label">cap actuel</span>',
          '<strong id="compassHeading">vers le dehors</strong>',
          '<p id="compassPrompt">Sors voir ce que la fenêtre ne montre pas.</p>',
        '</div>',
        '<div class="compass-actions">',
          '<button class="compass-button compass-button--primary" id="compassSpin" type="button">faire tourner</button>',
          '<button class="compass-button" id="compassLeft" type="button" aria-label="Choisir le cap précédent">← un cran</button>',
          '<button class="compass-button" id="compassRight" type="button" aria-label="Choisir le cap suivant">un cran →</button>',
        '</div>',
        '<p class="compass-status" id="compassStatus" aria-live="polite">La boussole attend un mouvement.</p>',
        '<p class="compass-privacy">Aucun capteur, GPS, stockage ou appel réseau. Le cap disparaît en fermant la page.</p>',
      '</div>',
    '</div>'
  ].join('');

  releasePanel.insertAdjacentElement('beforebegin', panel);

  var directions = [
    { heading: 'vers le dehors', prompt: 'Sors voir ce que la fenêtre ne montre pas.' },
    { heading: 'vers quelqu’un', prompt: 'Envoie un signe sans attendre d’avoir quelque chose d’important à dire.' },
    { heading: 'vers le détour', prompt: 'Prends le chemin qui ajoute dix minutes et enlève un peu d’automatique.' },
    { heading: 'vers le calme', prompt: 'Laisse une minute sans commentaire, musique ni notification.' },
    { heading: 'vers l’inachevé', prompt: 'Reviens à une chose imparfaite au lieu d’en ouvrir une nouvelle.' },
    { heading: 'vers un merci', prompt: 'Nomme précisément ce que quelqu’un a rendu plus simple.' },
    { heading: 'vers le minuscule', prompt: 'Choisis une tâche si petite qu’elle ne mérite presque pas une liste.' },
    { heading: 'vers demain', prompt: 'Décide d’une chose que tu peux remettre sans culpabilité.' }
  ];

  var face = document.getElementById('compassFace');
  var heading = document.getElementById('compassHeading');
  var prompt = document.getElementById('compassPrompt');
  var status = document.getElementById('compassStatus');
  var spin = document.getElementById('compassSpin');
  var left = document.getElementById('compassLeft');
  var right = document.getElementById('compassRight');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = 0;
  var turn = 0;
  var spinning = false;

  function shortestDelta(from, to) {
    var delta = to - from;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    return delta;
  }

  function render(nextIndex, extraTurns, announce) {
    var normalized = (nextIndex + directions.length) % directions.length;
    var currentAngle = index * 45;
    var targetAngle = normalized * 45;
    turn += shortestDelta(currentAngle, targetAngle) + (extraTurns || 0) * 360;
    index = normalized;

    face.style.setProperty('--compass-turn', turn + 'deg');
    heading.textContent = directions[index].heading;
    prompt.textContent = directions[index].prompt;
    if (announce) status.textContent = 'La boussole pointe ' + directions[index].heading + '.';
  }

  function step(amount) {
    if (spinning) return;
    render(index + amount, 0, true);
  }

  function finishSpin(nextIndex) {
    spinning = false;
    panel.classList.remove('is-spinning');
    spin.disabled = false;
    left.disabled = false;
    right.disabled = false;
    heading.textContent = directions[nextIndex].heading;
    prompt.textContent = directions[nextIndex].prompt;
    status.textContent = 'Cap trouvé : ' + directions[nextIndex].heading + '.';
  }

  spin.addEventListener('click', function () {
    if (spinning) return;
    spinning = true;
    panel.classList.add('is-spinning');
    spin.disabled = true;
    left.disabled = true;
    right.disabled = true;

    var nextIndex = Math.floor(Math.random() * directions.length);
    if (nextIndex === index) nextIndex = (nextIndex + 3) % directions.length;
    var duration = reduceMotion ? 0 : 980;
    render(nextIndex, reduceMotion ? 0 : 3, false);
    status.textContent = 'La boussole cherche un cap…';
    window.setTimeout(function () { finishSpin(nextIndex); }, duration);
  });

  left.addEventListener('click', function () { step(-1); });
  right.addEventListener('click', function () { step(1); });

  panel.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    }
  });

  render(0, 0, false);
})();
