(function () {
  'use strict';

  var releasePanel = document.querySelector('.release-panel');
  var collection = document.getElementById('objectCollection');
  if (!releasePanel || document.getElementById('lakePanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './lake.css?v=20260805-lake';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel lake-panel span-12';
  panel.id = 'lakePanel';
  panel.setAttribute('aria-labelledby', 'lake-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="lake-title">Le lac sans photo</h2>',
      '<span class="panel-badge">6 rives · zéro caméra</span>',
    '</div>',
    '<div class="lake-room">',
      '<div class="lake-scene" id="lakeScene" aria-hidden="true">',
        '<span class="lake-sun"></span>',
        '<span class="lake-mountain lake-mountain--back"></span>',
        '<span class="lake-mountain lake-mountain--front"></span>',
        '<span class="lake-shore"></span>',
        '<span class="lake-reflection lake-reflection--one"></span>',
        '<span class="lake-reflection lake-reflection--two"></span>',
        '<span class="lake-ripple lake-ripple--one"></span>',
        '<span class="lake-ripple lake-ripple--two"></span>',
        '<span class="lake-ripple lake-ripple--three"></span>',
        '<span class="lake-caption" id="lakeCaption">hors cadre</span>',
      '</div>',
      '<div class="lake-copy">',
        '<p class="lake-kicker">un paysage qui ne demande aucune preuve</p>',
        '<h3>Regarde ce que la photo oublierait.</h3>',
        '<p class="lake-intro">Choisis une rive. Le lac propose une seule chose à remarquer avant que le réflexe de cadrer, publier ou raconter ne reprenne la place.</p>',
        '<div class="lake-prompt" id="lakePrompt">',
          '<span class="lake-prompt-label">rive actuelle</span>',
          '<strong id="lakeHeading">hors cadre</strong>',
          '<p id="lakeInstruction">Choisis un détail que personne ne penserait à photographier.</p>',
        '</div>',
        '<div class="lake-actions">',
          '<button class="lake-button" id="lakePrevious" type="button" aria-label="Choisir la rive précédente">← rive précédente</button>',
          '<button class="lake-button lake-button--primary" id="lakeRipple" type="button">faire une ride</button>',
          '<button class="lake-button" id="lakeNext" type="button" aria-label="Choisir la rive suivante">rive suivante →</button>',
        '</div>',
        '<p class="lake-status" id="lakeStatus" aria-live="polite">Le lac attend sans enregistrer.</p>',
        '<p class="lake-privacy">Aucune caméra, microphone, géolocalisation, sauvegarde ou requête réseau. La rive choisie disparaît en fermant la page.</p>',
      '</div>',
    '</div>'
  ].join('');

  if (collection) collection.insertAdjacentElement('afterend', panel);
  else releasePanel.insertAdjacentElement('beforebegin', panel);

  var shores = [
    { heading: 'hors cadre', instruction: 'Choisis un détail que personne ne penserait à photographier.' },
    { heading: 'lumière', instruction: 'Repère l’endroit où la lumière hésite entre deux surfaces.' },
    { heading: 'son lointain', instruction: 'Écoute le son le plus éloigné, puis le plus proche.' },
    { heading: 'mouvement', instruction: 'Suis quelque chose qui bouge sans chercher à le nommer.' },
    { heading: 'compagnie', instruction: 'Observe ce que la présence d’une autre personne change au paysage.' },
    { heading: 'dix secondes', instruction: 'Laisse le paysage exister dix secondes sans le transformer en souvenir.' }
  ];

  var scene = document.getElementById('lakeScene');
  var caption = document.getElementById('lakeCaption');
  var heading = document.getElementById('lakeHeading');
  var instruction = document.getElementById('lakeInstruction');
  var status = document.getElementById('lakeStatus');
  var previous = document.getElementById('lakePrevious');
  var next = document.getElementById('lakeNext');
  var ripple = document.getElementById('lakeRipple');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = 0;
  var rippling = false;

  function render(nextIndex, announce) {
    index = (nextIndex + shores.length) % shores.length;
    var shore = shores[index];
    caption.textContent = shore.heading;
    heading.textContent = shore.heading;
    instruction.textContent = shore.instruction;
    scene.dataset.shore = String(index);
    if (announce) status.textContent = 'Rive choisie : ' + shore.heading + '.';
  }

  function step(amount) {
    if (rippling) return;
    render(index + amount, true);
  }

  function makeRipple() {
    if (rippling) return;
    rippling = true;
    ripple.disabled = true;
    previous.disabled = true;
    next.disabled = true;
    scene.classList.remove('is-rippling');
    void scene.offsetWidth;
    scene.classList.add('is-rippling');
    status.textContent = 'Une ride traverse le lac…';

    var duration = reduceMotion ? 180 : 1700;
    window.setTimeout(function () {
      scene.classList.remove('is-rippling');
      ripple.disabled = false;
      previous.disabled = false;
      next.disabled = false;
      rippling = false;
      status.textContent = 'La surface est calme. Rien n’a été capturé.';
    }, duration);
  }

  previous.addEventListener('click', function () { step(-1); });
  next.addEventListener('click', function () { step(1); });
  ripple.addEventListener('click', makeRipple);

  panel.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'Enter' && document.activeElement === ripple) {
      event.preventDefault();
      makeRipple();
    }
  });

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
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : sept objets calmes, un carnet de route et un lac qui invite à regarder sans capturer.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com avec sept objets quotidiens et un interlude alpin qui ne demande ni caméra, ni position, ni preuve.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '5 août 2026 · regarder sans capturer';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Les paysages spectaculaires déclenchent vite le même réflexe : sortir le téléphone pour prouver qu’on les a vus. Aujourd’hui, la pièce essaie autre chose : <strong>remarquer ce que l’image oublierait.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Le lac sans photo propose six rives d’observation — lumière, son, mouvement, compagnie ou simple hors-cadre — sans caméra, microphone, géolocalisation ni stockage.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Un souvenir peut commencer avant la photo, et parfois très bien survivre sans elle.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var values = statePanel.querySelectorAll('.v');
      if (values[4]) values[4].textContent = 'lac sans photo n° 001';
      if (values[5]) values[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, sept objets et une rive';
    }

    if (collection) {
      var collectionBadge = collection.querySelector('.panel-badge');
      if (collectionBadge) collectionBadge.textContent = '7 objets · l’interlude reste dehors';
    }

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 013 · 5 août 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Les meilleures vues ne demandent pas toujours d’être rapportées. Certaines préfèrent rester exactement là où elles ont eu lieu.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À voir</strong>le détail qui n’entrerait jamais dans la légende.';
    if (signals[1]) signals[1].innerHTML = '<strong>À entendre</strong>ce que l’écran ne saura pas conserver.';
    if (signals[2]) signals[2].innerHTML = '<strong>À laisser</strong>une vue exister sans devenir une publication.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '05·08·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui était vraiment là, même sans preuve dans sa pellicule.';

    appendLog(document.querySelector('.log-list'), '2026-08-05', 'Un lac refuse de poser pour la photo', '5 août · six rives d’observation, aucune caméra et aucun souvenir comptabilisé');

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./lac --camera off --shore hors-cadre</span>\n<span class="t-dim">noticed=1; captured=0; uploaded=0</span>\n<span class="t-prompt">$</span> <span class="t-key">printf "%s\\n" "j’y étais"</span>\n<span class="t-dim">j’y étais</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-08-05';
      footerTime.textContent = '5 août 2026';
    }
  }

  render(0, false);
  refreshEditorial();
})();
