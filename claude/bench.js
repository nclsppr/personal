(function () {
  'use strict';

  var releasePanel = document.querySelector('.release-panel');
  if (!releasePanel || document.getElementById('benchPanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './bench.css?v=20260806-bench';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel bench-panel span-12';
  panel.id = 'benchPanel';
  panel.setAttribute('aria-labelledby', 'bench-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="bench-title">Le banc pour deux</h2>',
      '<span class="panel-badge">20 questions · aucune réponse demandée</span>',
    '</div>',
    '<div class="bench-room">',
      '<div class="bench-stage" id="benchStage" data-context="route" aria-hidden="true">',
        '<span class="bench-skyline"></span>',
        '<span class="bench-path"></span>',
        '<span class="bench-seat bench-seat--left"><i></i></span>',
        '<span class="bench-seat bench-seat--right"><i></i></span>',
        '<span class="bench-thread"></span>',
        '<span class="bench-bubble" id="benchBubble">et toi&nbsp;?</span>',
      '</div>',
      '<div class="bench-copy">',
        '<p class="bench-kicker">une place laissée libre dans la pièce</p>',
        '<h3>Pose une question qui ne ressemble pas à un formulaire.</h3>',
        '<p class="bench-intro">Choisis le moment. Le banc propose une question à partager avec la personne à côté — ou à envoyer à quelqu’un qui manque un peu à la scène.</p>',
        '<div class="bench-contexts" id="benchContexts" role="group" aria-label="Choisir le contexte de la conversation">',
          '<button type="button" data-bench-context="route" aria-pressed="true">en route</button>',
          '<button type="button" data-bench-context="table" aria-pressed="false">à table</button>',
          '<button type="button" data-bench-context="walk" aria-pressed="false">en marchant</button>',
          '<button type="button" data-bench-context="distance" aria-pressed="false">à distance</button>',
        '</div>',
        '<blockquote class="bench-question" id="benchQuestion">Quel détail du trajet veux-tu garder, même s’il n’apparaît sur aucune photo&nbsp;?</blockquote>',
        '<div class="bench-actions">',
          '<button class="bench-button bench-button--primary" id="benchAnother" type="button">une autre question</button>',
          '<button class="bench-button" id="benchCopy" type="button">copier la question</button>',
        '</div>',
        '<p class="bench-status" id="benchStatus" aria-live="polite">Le banc est prêt. La réponse peut rester entre vous.</p>',
        '<p class="bench-privacy">Aucun nom, réponse, contact, historique ou appel réseau. Copier place seulement la question dans le presse-papiers de cet appareil.</p>',
      '</div>',
    '</div>'
  ].join('');

  var lake = document.getElementById('lakePanel');
  var collection = document.getElementById('objectCollection');
  if (lake) lake.insertAdjacentElement('afterend', panel);
  else if (collection) collection.insertAdjacentElement('afterend', panel);
  else releasePanel.insertAdjacentElement('beforebegin', panel);

  var questions = {
    route: [
      'Quel détail du trajet veux-tu garder, même s’il n’apparaît sur aucune photo&nbsp;?',
      'Quel détour accepterais-tu volontiers de refaire demain&nbsp;?',
      'Qu’est-ce qui t’a fait rire plus que prévu aujourd’hui&nbsp;?',
      'À quel moment as-tu pensé «&nbsp;on a bien fait de venir&nbsp;»&nbsp;?',
      'Qu’est-ce qu’on devrait absolument faire avant de rentrer&nbsp;?'
    ],
    table: [
      'Quel petit plaisir récent mériterait de devenir une habitude&nbsp;?',
      'Quelle chose compliquée pourrait attendre demain&nbsp;?',
      'Quel repas te ramène instantanément quelque part&nbsp;?',
      'Qu’est-ce que quelqu’un à cette table fait mieux qu’il ne le croit&nbsp;?',
      'Quel projet minuscule ferait du bien à commencer ensemble&nbsp;?'
    ],
    walk: [
      'Qu’as-tu remarqué que les autres ont probablement manqué&nbsp;?',
      'Où aimerais-tu marcher sans objectif la prochaine fois&nbsp;?',
      'Qu’est-ce qui te paraît plus simple après avoir pris l’air&nbsp;?',
      'Quel bruit d’aujourd’hui voudrais-tu pouvoir rejouer&nbsp;?',
      'Si ce chemin donnait un conseil, lequel serait-ce&nbsp;?'
    ],
    distance: [
      'Quel détail banal de ta journée aimerais-tu me raconter&nbsp;?',
      'À quoi devrions-nous trinquer la prochaine fois qu’on se voit&nbsp;?',
      'Quelle photo n’as-tu pas prise récemment mais pourrais quand même décrire&nbsp;?',
      'De quoi as-tu besoin en ce moment&nbsp;: une idée, une oreille ou une distraction&nbsp;?',
      'Quel souvenir commun te revient sans raison particulière&nbsp;?'
    ]
  };

  var contextLabels = {
    route: 'en route',
    table: 'à table',
    walk: 'en marchant',
    distance: 'à distance'
  };

  var stage = document.getElementById('benchStage');
  var bubble = document.getElementById('benchBubble');
  var contextGroup = document.getElementById('benchContexts');
  var contextButtons = Array.prototype.slice.call(contextGroup.querySelectorAll('button'));
  var question = document.getElementById('benchQuestion');
  var another = document.getElementById('benchAnother');
  var copy = document.getElementById('benchCopy');
  var status = document.getElementById('benchStatus');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var context = 'route';
  var questionIndex = 0;
  var animationTimer = 0;

  function plainText(html) {
    var temporary = document.createElement('textarea');
    temporary.innerHTML = html;
    return temporary.value;
  }

  function animateConversation() {
    window.clearTimeout(animationTimer);
    panel.classList.remove('is-speaking');
    void panel.offsetWidth;
    panel.classList.add('is-speaking');
    animationTimer = window.setTimeout(function () {
      panel.classList.remove('is-speaking');
    }, reduceMotion ? 80 : 720);
  }

  function render(announce) {
    question.innerHTML = questions[context][questionIndex];
    stage.dataset.context = context;
    bubble.textContent = context === 'distance' ? 'un signe' : 'et toi ?';
    contextButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.benchContext === context ? 'true' : 'false');
    });
    copy.textContent = 'copier la question';
    animateConversation();
    if (announce) status.textContent = 'Question choisie pour le moment « ' + contextLabels[context] + ' ».';
  }

  function chooseAnother() {
    var list = questions[context];
    var next = questionIndex;
    while (next === questionIndex && list.length > 1) next = Math.floor(Math.random() * list.length);
    questionIndex = next;
    render(true);
  }

  function chooseContext(nextContext) {
    if (!questions[nextContext]) return;
    context = nextContext;
    questionIndex = Math.floor(Math.random() * questions[context].length);
    render(true);
  }

  function fallbackCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    field.remove();
    return copied;
  }

  function copyQuestion() {
    var text = plainText(questions[context][questionIndex]);
    var operation = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); })
      : Promise.resolve(fallbackCopy(text));

    operation.then(function (copied) {
      copy.textContent = copied ? 'question copiée' : 'copie impossible';
      status.textContent = copied
        ? 'La question est dans le presse-papiers. La réponse ne quitte pas votre conversation.'
        : 'Le navigateur a refusé la copie. La question reste visible juste au-dessus.';
    });
  }

  contextButtons.forEach(function (button) {
    button.addEventListener('click', function () { chooseContext(button.dataset.benchContext); });
  });
  another.addEventListener('click', chooseAnother);
  copy.addEventListener('click', copyQuestion);

  contextGroup.addEventListener('keydown', function (event) {
    var current = contextButtons.indexOf(document.activeElement);
    if (current < 0) return;
    var next = current;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % contextButtons.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + contextButtons.length) % contextButtons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = contextButtons.length - 1;
    else return;
    event.preventDefault();
    contextButtons[next].focus();
    chooseContext(contextButtons[next].dataset.benchContext);
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
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : sept objets calmes, un lac sans photo et un banc qui aide à commencer une vraie conversation.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com avec des objets quotidiens, un carnet de route et vingt questions à partager sans compte, suivi ni réponse enregistrée.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '6 août 2026 · laisser une place à côté';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'Cette pièce s’adressait surtout à la personne devant l’écran. Aujourd’hui, elle tire une chaise pour quelqu’un d’autre&nbsp;: <strong>le nouvel objet est fait pour être utilisé à deux.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Le banc propose vingt questions selon le moment — en route, à table, en marchant ou à distance — sans demander de nom, de réponse, de compte ou de contact.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Le web peut aussi servir à lever les yeux de l’écran et à mieux regarder la personne qui est là.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var values = statePanel.querySelectorAll('.v');
      if (values[4]) values[4].textContent = 'banc pour deux n° 001';
      if (values[5]) values[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, une place libre';
    }

    var collectionBadge = collection && collection.querySelector('.panel-badge');
    if (collectionBadge) collectionBadge.textContent = '7 objets · 2 haltes hors étagère';

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 014 · 6 août 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Certaines bonnes questions n’ont pas besoin d’une réponse brillante. Seulement d’une place, d’un peu de temps et de quelqu’un à côté.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À demander</strong>quelque chose qui ne ressemble pas à « alors, ça va ? ».';
    if (signals[1]) signals[1].innerHTML = '<strong>À écouter</strong>la réponse sans préparer la suivante.';
    if (signals[2]) signals[2].innerHTML = '<strong>À laisser</strong>un silence faire aussi partie de la conversation.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '06·08·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui prendrait volontiers la place libre à côté.';

    appendLog(document.querySelector('.log-list'), '2026-08-06', 'Un banc laisse une place libre', '6 août · vingt débuts de conversation, aucune réponse collectée et deux sièges imaginaires');

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./banc --seats 2 --answers off</span>\n<span class="t-dim">question=ready; person=not-profiled</span>\n<span class="t-prompt">$</span> <span class="t-key">printf "%s\\n" "et toi ?"</span>\n<span class="t-dim">et toi ?</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-08-06';
      footerTime.textContent = '6 août 2026';
    }
  }

  render(false);
  refreshEditorial();
})();