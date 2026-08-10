(function () {
  'use strict';

  var sunday = document.getElementById('sundayPanel');
  var threshold = document.getElementById('thresholdPanel');
  var homeward = document.getElementById('homewardPanel');
  var collection = document.getElementById('objectCollection');
  var releasePanel = document.querySelector('.release-panel');
  var anchor = sunday || threshold || homeward || collection || releasePanel;
  if (!anchor || document.getElementById('mondayPanel')) return;

  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './monday.css?v=20260810-before-noise';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel monday-panel span-12';
  panel.id = 'mondayPanel';
  panel.setAttribute('aria-labelledby', 'monday-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="monday-title">Le bureau avant le bruit</h2>',
      '<span class="panel-badge">3 tiroirs · zéro notification</span>',
    '</div>',
    '<div class="monday-desk">',
      '<div class="monday-scene" aria-hidden="true">',
        '<span class="monday-wall-line"></span>',
        '<span class="monday-lamp"><i></i></span>',
        '<span class="monday-mug"></span>',
        '<span class="monday-notebook"><i></i></span>',
        '<span class="monday-pencil"></span>',
        '<span class="monday-shadow"></span>',
      '</div>',
      '<div class="monday-copy">',
        '<p class="monday-kicker">lundi, ou n’importe quel jour de reprise</p>',
        '<h3>Avant d’ouvrir tout le reste, choisis seulement par où entrer.</h3>',
        '<p class="monday-intro">Pas une todo-list. Trois tiroirs minuscules : remettre quelque chose en mouvement, retisser un lien ou protéger un peu d’espace. Ouvre-en un, prends la carte, puis quitte la pièce si elle suffit.</p>',
        '<div class="monday-drawers" role="group" aria-label="Choisir un tiroir de reprise">',
          '<button class="monday-drawer" type="button" data-monday-mode="move"><span class="monday-drawer__code">01</span><strong>remettre en mouvement</strong><small>une première action concrète</small></button>',
          '<button class="monday-drawer" type="button" data-monday-mode="connect"><span class="monday-drawer__code">02</span><strong>retisser un lien</strong><small>une personne avant un flux</small></button>',
          '<button class="monday-drawer" type="button" data-monday-mode="protect"><span class="monday-drawer__code">03</span><strong>protéger l’espace</strong><small>un peu de silence avant la suite</small></button>',
        '</div>',
        '<div class="monday-card" id="mondayCard" data-state="waiting">',
          '<p class="monday-card__label" id="mondayCardLabel">aucun tiroir ouvert</p>',
          '<p class="monday-card__text" id="mondayCardText" aria-live="polite">Le bureau est encore calme. Tu n’as rien à optimiser ici.</p>',
        '</div>',
        '<div class="monday-actions">',
          '<button class="monday-action" id="mondayAgain" type="button" disabled>une autre carte</button>',
          '<button class="monday-action monday-action--quiet" id="mondayClear" type="button" disabled>refermer les tiroirs</button>',
        '</div>',
        '<p class="monday-privacy">Aucun choix n’est enregistré, compté ou transmis. Le bureau revient exactement comme neuf au rechargement.</p>',
      '</div>',
    '</div>'
  ].join('');

  anchor.insertAdjacentElement('afterend', panel);

  var prompts = {
    move: [
      'Rouvre une seule chose commencée avant la coupure et écris la prochaine action en moins de dix mots.',
      'Choisis un petit résultat visible que tu peux produire avant de chercher à tout comprendre.',
      'Ferme deux onglets, garde celui qui contient réellement la prochaine étape.',
      'Commence par la couture la plus évidente, pas par le chantier qui a le plus gros nom.',
      'Fais cinq minutes de quelque chose qui existe déjà avant de créer une nouvelle liste.'
    ],
    connect: [
      'Envoie un bonjour à une personne avant d’envoyer un statut à un groupe.',
      'Demande à quelqu’un ce qui a changé pendant ton absence, sans lui demander un résumé parfait.',
      'Remercie la personne qui a gardé un fil vivant pendant que tu regardais ailleurs.',
      'Choisis une conversation qui mérite dix lignes de moins et une vraie question de plus.',
      'Avant de répondre au flux, réponds à une personne.'
    ],
    protect: [
      'Laisse une notification non urgente attendre vingt minutes de plus.',
      'Garde le premier quart d’heure sans tableau de bord si rien ne brûle réellement.',
      'Décide d’une chose que tu ne reprendras pas aujourd’hui, même si elle sait clignoter.',
      'Pose le téléphone hors de portée le temps de remettre une seule idée en place.',
      'Ne transforme pas immédiatement le calme du retour en backlog.'
    ]
  };

  var labels = {
    move: 'tiroir 01 · remettre en mouvement',
    connect: 'tiroir 02 · retisser un lien',
    protect: 'tiroir 03 · protéger l’espace'
  };

  var drawers = Array.prototype.slice.call(panel.querySelectorAll('.monday-drawer'));
  var card = document.getElementById('mondayCard');
  var cardLabel = document.getElementById('mondayCardLabel');
  var cardText = document.getElementById('mondayCardText');
  var again = document.getElementById('mondayAgain');
  var clear = document.getElementById('mondayClear');
  var activeMode = null;
  var lastIndex = { move: -1, connect: -1, protect: -1 };

  function nextPrompt(mode) {
    var list = prompts[mode];
    var index = Math.floor(Math.random() * list.length);
    if (list.length > 1 && index === lastIndex[mode]) index = (index + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
    lastIndex[mode] = index;
    return list[index];
  }

  function openDrawer(mode) {
    activeMode = mode;
    drawers.forEach(function (drawer) {
      var selected = drawer.dataset.mondayMode === mode;
      drawer.classList.toggle('is-open', selected);
      drawer.setAttribute('aria-pressed', String(selected));
    });

    card.dataset.state = 'shown';
    cardLabel.textContent = labels[mode];
    cardText.textContent = nextPrompt(mode);
    again.disabled = false;
    clear.disabled = false;

    if (!reduceMotion && typeof card.animate === 'function') {
      card.animate(
        [{ transform: 'translateY(5px) rotate(-0.4deg)', opacity: .45 }, { transform: 'translateY(0) rotate(0)', opacity: 1 }],
        { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
    }
  }

  drawers.forEach(function (drawer) {
    drawer.setAttribute('aria-pressed', 'false');
    drawer.addEventListener('click', function () { openDrawer(drawer.dataset.mondayMode); });
  });

  again.addEventListener('click', function () {
    if (!activeMode) return;
    cardText.textContent = nextPrompt(activeMode);
    if (!reduceMotion && typeof card.animate === 'function') {
      card.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
    }
  });

  clear.addEventListener('click', function () {
    activeMode = null;
    drawers.forEach(function (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-pressed', 'false');
    });
    card.dataset.state = 'waiting';
    cardLabel.textContent = 'aucun tiroir ouvert';
    cardText.textContent = 'Le bureau est encore calme. Tu n’as rien à optimiser ici.';
    again.disabled = true;
    clear.disabled = true;
    drawers[0].focus();
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
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : objets interactifs, carnet de route archivé et un bureau de reprise qui laisse les notifications dehors.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com avec des objets quotidiens, un carnet autrichien complet et trois tiroirs pour reprendre sans immédiatement rouvrir tout le bruit.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '10 août 2026 · avant que les notifications gagnent';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Le voyage est rangé, le dimanche a mangé sa dernière part, et lundi remet doucement les câbles sur la table. <strong>Aujourd’hui, la pièce ouvre un bureau avant le bruit.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Trois tiroirs proposent seulement une manière d’entrer : remettre quelque chose en mouvement, retisser un lien ou protéger un peu d’espace. Pas de planning global, pas de score de reprise.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Le monde peut attendre quelques minutes avant de redevenir une boîte de réception.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var stateValues = statePanel.querySelectorAll('.v');
      if (stateValues[4]) stateValues[4].textContent = 'bureau avant le bruit n° 001';
      if (stateValues[5]) stateValues[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, inbox encore dehors';
    }

    var collectionBadge = collection && collection.querySelector('.panel-badge');
    if (collectionBadge) collectionBadge.textContent = '7 objets · 6 haltes hors étagère';

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 018 · 10 août 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Une reprise n’a pas besoin de commencer par tout rouvrir. Un seul tiroir suffit pour retrouver le fil.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À rouvrir</strong>une seule chose qui a déjà un fil.';
    if (signals[1]) signals[1].innerHTML = '<strong>À saluer</strong>une personne avant de saluer un canal entier.';
    if (signals[2]) signals[2].innerHTML = '<strong>À protéger</strong>quelques minutes sans notification juste parce que c’est possible.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '10·08·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui peut revenir sans transformer le retour en sprint dès la première minute.';

    appendLog(document.querySelector('.log-list'), '2026-08-10', 'Un bureau ouvre avant la boîte de réception', '10 août · trois tiroirs de reprise, aucune saisie, aucune télémétrie et le droit de commencer petit');

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./reprise --open one-drawer</span>\n<span class="t-dim">inbox=closed; backlog=not-loaded</span>\n<span class="t-prompt">$</span> <span class="t-key">./reprise --mode humain</span>\n<span class="t-dim">next=small; telemetry=0</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-08-10';
      footerTime.textContent = '10 août 2026';
    }
  }

  refreshEditorial();
})();
