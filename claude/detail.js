(function () {
  'use strict';

  var anchor = document.getElementById('helloPanel') || document.getElementById('pausePanel') || document.getElementById('decisionPanel') || document.querySelector('.release-panel');
  if (!anchor || document.getElementById('detailPanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './detail.css?v=20260801-detail';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel detail-panel span-12';
  panel.id = 'detailPanel';
  panel.setAttribute('aria-labelledby', 'detail-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="detail-title">Le détail à rapporter</h2>',
      '<span class="panel-badge">aucune photo requise · aucune trace collectée</span>',
    '</div>',
    '<div class="detail-room">',
      '<div class="detail-viewfinder" id="detailViewfinder" aria-hidden="true">',
        '<span class="detail-horizon"></span>',
        '<span class="detail-road"></span>',
        '<span class="detail-ticket detail-ticket--one" data-detail-ticket="color">couleur</span>',
        '<span class="detail-ticket detail-ticket--two" data-detail-ticket="sound">son</span>',
        '<span class="detail-ticket detail-ticket--three" data-detail-ticket="gesture">geste</span>',
        '<span class="detail-reticle"></span>',
      '</div>',
      '<div class="detail-copy">',
        '<p class="detail-kicker">consigne de regard n° 001</p>',
        '<h3>Ramène un détail, pas une preuve.</h3>',
        '<p class="detail-intro">Choisis une façon de regarder. La pièce te confie une petite mission à emporter dehors, en voyage comme au coin de la rue.</p>',
        '<div class="detail-choices" role="group" aria-label="Choisir une façon de regarder">',
          '<button class="detail-choice" type="button" data-detail-kind="color" aria-pressed="false">une couleur</button>',
          '<button class="detail-choice" type="button" data-detail-kind="sound" aria-pressed="false">un son</button>',
          '<button class="detail-choice" type="button" data-detail-kind="gesture" aria-pressed="false">un geste</button>',
          '<button class="detail-choice" type="button" data-detail-kind="detour" aria-pressed="false">un détour</button>',
        '</div>',
        '<blockquote class="detail-prompt" id="detailPrompt">Choisis une piste. Rien ne sera demandé au retour.</blockquote>',
        '<div class="detail-actions">',
          '<button class="detail-again" id="detailAgain" type="button" disabled>une autre consigne</button>',
          '<p class="detail-status" id="detailStatus" aria-live="polite">La consigne reste seulement le temps de cette visite.</p>',
        '</div>',
        '<p class="detail-privacy">Aucun accès à la caméra, au micro ou à la localisation. Aucun choix n’est enregistré ou transmis. Le souvenir, lui, t’appartient.</p>',
      '</div>',
    '</div>'
  ].join('');
  anchor.insertAdjacentElement('afterend', panel);

  var prompts = {
    color: [
      'Repère une couleur que tu n’aurais jamais choisie, mais qui fonctionne parfaitement là où elle se trouve.',
      'Trouve une teinte qui change complètement entre l’ombre et la lumière.',
      'Choisis la couleur que tu ramènerais de cette journée si elle tenait dans une poche.',
      'Regarde dix secondes la couleur la moins spectaculaire autour de toi.',
      'Trouve deux objets sans rapport qui portent exactement la même couleur.'
    ],
    sound: [
      'Écoute le son qui te confirme que tu es précisément ici et nulle part ailleurs.',
      'Repère le bruit le plus lointain que tu arrives encore à distinguer.',
      'Attends quelques secondes après que tout semble silencieux : quel son reste ?',
      'Trouve un son régulier qui pourrait servir de métronome à cet endroit.',
      'Écoute la façon dont une porte, un chemin ou une pièce annonce le passage de quelqu’un.'
    ],
    gesture: [
      'Observe un geste de soin si discret que la personne qui le fait ne pense probablement pas être regardée.',
      'Repère la manière dont quelqu’un attend : les mains, le regard, le poids du corps.',
      'Trouve un geste transmis par habitude, comme s’il avait été appris il y a longtemps.',
      'Observe une personne rendre quelque chose plus simple pour une autre.',
      'Garde en mémoire un geste que tu aimerais refaire toi-même un jour.'
    ],
    detour: [
      'Lors du prochain trajet à pied, lève les yeux à l’endroit où tu regardes habituellement le sol.',
      'Arrête-toi juste avant le point de vue évident et regarde ce qui se passe sur le côté.',
      'Retourne-toi une fois après être arrivé : le chemin raconte souvent autre chose dans l’autre sens.',
      'Choisis le détail que tu n’aurais jamais vu en suivant uniquement un itinéraire.',
      'Prends deux minutes pour observer l’endroit sans décider tout de suite ce qu’il faut en faire.'
    ]
  };

  var prompt = document.getElementById('detailPrompt');
  var again = document.getElementById('detailAgain');
  var status = document.getElementById('detailStatus');
  var viewfinder = document.getElementById('detailViewfinder');
  var choices = Array.from(panel.querySelectorAll('.detail-choice'));
  var tickets = Array.from(panel.querySelectorAll('.detail-ticket'));
  var currentKind = '';
  var currentIndex = -1;

  function chooseIndex(length) {
    if (length < 2) return 0;
    var next = Math.floor(Math.random() * length);
    if (next === currentIndex) next = (next + 1) % length;
    return next;
  }

  function renderPrompt(kind) {
    var list = prompts[kind];
    if (!list) return;

    currentKind = kind;
    currentIndex = chooseIndex(list.length);
    prompt.textContent = list[currentIndex];
    again.disabled = false;
    status.textContent = 'Consigne prête. Tu peux la garder, l’ignorer ou en demander une autre.';

    choices.forEach(function (choice) {
      choice.setAttribute('aria-pressed', choice.dataset.detailKind === kind ? 'true' : 'false');
    });
    tickets.forEach(function (ticket) {
      ticket.classList.toggle('detail-ticket--active', ticket.dataset.detailTicket === kind);
    });

    viewfinder.classList.remove('is-looking');
    void viewfinder.offsetWidth;
    viewfinder.classList.add('is-looking');
  }

  choices.forEach(function (choice) {
    choice.addEventListener('click', function () { renderPrompt(choice.dataset.detailKind); });
  });

  again.addEventListener('click', function () {
    if (currentKind) renderPrompt(currentKind);
  });

  function setMeta(selector, content) {
    var element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
  }

  function refreshEditorial() {
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : des objets privés, une pause, un prétexte pour écrire et une consigne pour regarder dehors.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com où l’on peut attendre, oublier, hésiter, écrire à quelqu’un et rapporter un détail du dehors.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '1 août 2026 · regarder avant de documenter';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'La pièce savait déjà aider à écrire à quelqu’un. Aujourd’hui, elle propose de refermer l’écran un instant et de <strong>rapporter un détail du dehors plutôt qu’une preuve.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Une couleur, un son, un geste ou un détour : le nouvel objet donne une consigne de regard, puis ne demande aucun compte rendu.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Les meilleurs souvenirs ne sont pas toujours ceux qui occupent le plus de stockage.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var values = statePanel.querySelectorAll('.v');
      if (values[4]) values[4].textContent = 'détail à rapporter n° 001';
      if (values[5]) values[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, regard tourné dehors';
    }

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 009 · 1 août 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Un voyage n’a pas besoin d’être lointain pour contenir un détail qu’on n’avait encore jamais remarqué.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À regarder</strong>ce qui ne cherche pas à être photographié.';
    if (signals[1]) signals[1].innerHTML = '<strong>À écouter</strong>le son qui appartient uniquement à cet endroit.';
    if (signals[2]) signals[2].innerHTML = '<strong>À rapporter</strong>un détail assez petit pour tenir dans la mémoire.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '01·08·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui pense que rien de particulier ne s’est passé aujourd’hui.';

    var log = document.querySelector('.log-list');
    if (log && !log.querySelector('[data-daily="2026-08-01"]')) {
      var item = document.createElement('li');
      item.dataset.daily = '2026-08-01';
      item.innerHTML = '<span class="t">La pièce ouvre enfin la porte vers le dehors</span><span class="m">1 août · quatre consignes de regard, aucun capteur et aucun souvenir réclamé</span>';
      log.appendChild(item);
    }

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./regarder-dehors --mode minuscule</span>\n<span class="t-dim">detail=found; photo=optional; tracking=disabled</span>\n<span class="t-prompt">$</span> <span class="t-key">printf "%s\\n" "je m’en souviendrai"</span>\n<span class="t-dim">je m’en souviendrai</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-08-01';
      footerTime.textContent = '1 août 2026';
    }
  }

  refreshEditorial();
})();
