(function () {
  'use strict';

  var releasePanel = document.querySelector('.release-panel');
  if (!releasePanel || document.getElementById('cairnPanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './cairn.css?v=20260803-cairn';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel cairn-panel span-12';
  panel.id = 'cairnPanel';
  panel.setAttribute('aria-labelledby', 'cairn-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="cairn-title">Le cairn de passage</h2>',
      '<span class="panel-badge">5 pierres · aucune trace</span>',
    '</div>',
    '<div class="cairn-room">',
      '<div class="cairn-scene" id="cairnScene" data-count="0">',
        '<div class="cairn-sun" aria-hidden="true"></div>',
        '<div class="cairn-ridge cairn-ridge--far" aria-hidden="true"></div>',
        '<div class="cairn-ridge cairn-ridge--near" aria-hidden="true"></div>',
        '<div class="cairn-stack" id="cairnStack" role="img" aria-label="Un emplacement vide pour construire un cairn de cinq pierres">',
          '<span class="cairn-stone cairn-stone--1" aria-hidden="true"></span>',
          '<span class="cairn-stone cairn-stone--2" aria-hidden="true"></span>',
          '<span class="cairn-stone cairn-stone--3" aria-hidden="true"></span>',
          '<span class="cairn-stone cairn-stone--4" aria-hidden="true"></span>',
          '<span class="cairn-stone cairn-stone--5" aria-hidden="true"></span>',
        '</div>',
        '<div class="cairn-path" aria-hidden="true"></div>',
      '</div>',
      '<div class="cairn-copy">',
        '<p class="cairn-kicker">un petit signe au bord du chemin</p>',
        '<h3>Construis quelque chose qui n’a pas besoin de durer.</h3>',
        '<p class="cairn-intro">Inspiré des sentiers où Nicolas et Pampy passent cette semaine : pose les pierres une à une. Le cairn ne choisit pas la route, il rappelle seulement que quelqu’un est déjà passé.</p>',
        '<blockquote class="cairn-message" id="cairnMessage">Le sentier est vide. Tu peux commencer par une seule pierre.</blockquote>',
        '<div class="cairn-actions">',
          '<button class="cairn-button cairn-button--primary" id="cairnNext" type="button">poser une pierre</button>',
          '<button class="cairn-button" id="cairnUndo" type="button" disabled>retirer la dernière</button>',
          '<button class="cairn-reset" id="cairnReset" type="button" disabled>recommencer</button>',
        '</div>',
        '<p class="cairn-status" id="cairnStatus" aria-live="polite">0 pierre posée sur 5.</p>',
        '<p class="cairn-privacy">Le cairn existe seulement pendant cette visite. Aucun état n’est enregistré, envoyé ou compté.</p>',
      '</div>',
    '</div>'
  ].join('');

  releasePanel.insertAdjacentElement('beforebegin', panel);

  var scene = document.getElementById('cairnScene');
  var stack = document.getElementById('cairnStack');
  var stones = Array.prototype.slice.call(panel.querySelectorAll('.cairn-stone'));
  var message = document.getElementById('cairnMessage');
  var status = document.getElementById('cairnStatus');
  var next = document.getElementById('cairnNext');
  var undo = document.getElementById('cairnUndo');
  var reset = document.getElementById('cairnReset');
  var count = 0;

  var messages = [
    'Le sentier est vide. Tu peux commencer par une seule pierre.',
    'Une pierre suffit pour dire : je me suis arrêté ici un instant.',
    'Deux pierres trouvent déjà un équilibre. Pas besoin de savoir encore où mène la route.',
    'Le cairn tient. Il ne promet rien, mais il rend le chemin un peu moins anonyme.',
    'Encore une pierre. Le geste compte davantage que la hauteur.',
    'Le cairn est complet. Il peut rester ici, sans photo, score ni preuve.'
  ];

  function render() {
    scene.dataset.count = String(count);
    stones.forEach(function (stone, index) {
      stone.classList.toggle('is-placed', index < count);
    });

    message.textContent = messages[count];
    status.textContent = count + (count === 1 ? ' pierre posée' : ' pierres posées') + ' sur 5.';
    stack.setAttribute('aria-label', count === 0
      ? 'Un emplacement vide pour construire un cairn de cinq pierres'
      : 'Un cairn avec ' + count + (count === 1 ? ' pierre posée' : ' pierres posées') + ' sur cinq');

    next.disabled = count >= stones.length;
    next.textContent = count >= stones.length ? 'cairn terminé' : 'poser une pierre';
    undo.disabled = count === 0;
    reset.disabled = count === 0;
  }

  next.addEventListener('click', function () {
    if (count >= stones.length) return;
    count += 1;
    render();
  });

  undo.addEventListener('click', function () {
    if (count <= 0) return;
    count -= 1;
    render();
  });

  reset.addEventListener('click', function () {
    count = 0;
    render();
    next.focus();
  });

  render();
})();
