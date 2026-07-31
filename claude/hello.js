(function () {
  'use strict';

  var anchor = document.getElementById('pausePanel') || document.getElementById('decisionPanel') || document.querySelector('.release-panel');
  if (!anchor || document.getElementById('helloPanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './hello.css?v=20260731-hello';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel hello-panel span-12';
  panel.id = 'helloPanel';
  panel.setAttribute('aria-labelledby', 'hello-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="hello-title">Le prétexte à écrire</h2>',
      '<span class="panel-badge">aucun nom · aucun envoi · juste un début</span>',
    '</div>',
    '<div class="hello-room">',
      '<div class="hello-line" aria-hidden="true">',
        '<div class="hello-wire">',
          '<span class="hello-node hello-node--from">toi</span>',
          '<span class="hello-pulse"></span>',
          '<span class="hello-node hello-node--to">↗</span>',
        '</div>',
        '<p class="hello-line-note">La page prépare la première phrase. Le reste du trajet ne lui appartient pas.</p>',
      '</div>',
      '<div class="hello-copy">',
        '<h3>Quelqu’un mérite peut-être un message sans occasion spéciale.</h3>',
        '<p class="hello-intro">Choisis seulement le type de lien, sans nommer personne. La pièce proposera une phrase de départ que tu peux copier, modifier ou ignorer.</p>',
        '<div class="hello-choices" role="group" aria-label="Choisir à qui l’on pense">',
          '<button class="hello-choice" type="button" data-hello-kind="family" aria-pressed="false">famille</button>',
          '<button class="hello-choice" type="button" data-hello-kind="friend" aria-pressed="false">ami·e</button>',
          '<button class="hello-choice" type="button" data-hello-kind="lost" aria-pressed="false">perdu de vue</button>',
          '<button class="hello-choice" type="button" data-hello-kind="thanks" aria-pressed="false">un merci</button>',
        '</div>',
        '<blockquote class="hello-message" id="helloMessage">Choisis un lien, pas une personne. Aucun nom ne sera demandé.</blockquote>',
        '<div class="hello-actions">',
          '<button class="hello-copy-btn" id="helloCopy" type="button" disabled>copier la phrase</button>',
          '<button class="hello-again" id="helloAgain" type="button" disabled>une autre ouverture</button>',
        '</div>',
        '<p class="hello-status" id="helloStatus" aria-live="polite">Rien n’est enregistré ici.</p>',
        '<p class="hello-privacy">La page ne connaît ni le destinataire ni ce que tu feras de la phrase. Aucun choix, message ou historique n’est stocké ou transmis.</p>',
      '</div>',
    '</div>'
  ].join('');
  anchor.insertAdjacentElement('afterend', panel);

  var prompts = {
    family: [
      'Je viens de penser à toi sans raison particulière. Comment vas-tu, vraiment ?',
      'Petit message du jour : quel est le meilleur moment de ta semaine jusqu’ici ?',
      'Je n’attends aucune occasion spéciale pour te le dire : je suis content·e que tu sois dans ma vie.',
      'J’avais simplement envie de prendre de tes nouvelles. Qu’est-ce qui occupe tes pensées en ce moment ?'
    ],
    friend: [
      'J’ai eu envie de prendre de tes nouvelles sans attendre d’avoir quelque chose d’important à raconter. Tu vas comment ?',
      'Question gratuite : quel petit truc t’a fait sourire récemment ?',
      'Je repensais à un souvenir avec toi. Il faudrait qu’on s’en fabrique un nouveau bientôt.',
      'Aucun sujet urgent, juste un salut et l’envie de savoir ce que devient ta semaine.'
    ],
    lost: [
      'Ça fait longtemps. Je n’ai pas de grand discours, juste envie de savoir comment tu vas.',
      'Une pensée m’a rappelé toi aujourd’hui. Comment va la vie de ton côté ?',
      'On a laissé passer du temps, pas forcément le lien. Ça me ferait plaisir d’avoir de tes nouvelles.',
      'Je me suis dit que reprendre contact n’avait pas besoin d’une meilleure raison que celle-ci : j’en ai envie.'
    ],
    thanks: [
      'Petit message sans urgence : merci pour ce que tu as fait. Ça compte encore.',
      'Je me rends compte que je ne t’ai peut-être jamais dit clairement merci. Alors : merci.',
      'Tu as rendu quelque chose plus facile ou plus beau pour moi. Je voulais simplement te le dire.',
      'Je repensais à un geste que tu as eu pour moi. Il n’est pas passé inaperçu, même si je le dis tard.'
    ]
  };

  var message = document.getElementById('helloMessage');
  var copyButton = document.getElementById('helloCopy');
  var againButton = document.getElementById('helloAgain');
  var status = document.getElementById('helloStatus');
  var choices = Array.from(panel.querySelectorAll('.hello-choice'));
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
    message.textContent = list[currentIndex];
    copyButton.disabled = false;
    againButton.disabled = false;
    status.textContent = 'La phrase est prête. Elle n’a quitté ni cette page ni cet appareil.';

    choices.forEach(function (choice) {
      choice.setAttribute('aria-pressed', choice.dataset.helloKind === kind ? 'true' : 'false');
    });
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (error) {}
    textarea.remove();
    return copied;
  }

  choices.forEach(function (choice) {
    choice.addEventListener('click', function () { renderPrompt(choice.dataset.helloKind); });
  });

  againButton.addEventListener('click', function () {
    if (currentKind) renderPrompt(currentKind);
  });

  copyButton.addEventListener('click', function () {
    var text = message.textContent;
    if (!text || copyButton.disabled) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        status.textContent = 'Phrase copiée. À toi de la rendre vraiment personnelle.';
      }).catch(function () {
        status.textContent = fallbackCopy(text) ? 'Phrase copiée. À toi de la rendre vraiment personnelle.' : 'La copie automatique a échoué ; sélectionne la phrase directement.';
      });
    } else {
      status.textContent = fallbackCopy(text) ? 'Phrase copiée. À toi de la rendre vraiment personnelle.' : 'La copie automatique a échoué ; sélectionne la phrase directement.';
    }
  });

  function setMeta(selector, content) {
    var element = document.querySelector(selector);
    if (element) element.setAttribute('content', content);
  }

  function refreshEditorial() {
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : des objets privés, une minute sans rendement et un prétexte pour reprendre contact.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com où l’on peut attendre, oublier, hésiter, faire une pause et trouver la première phrase d’un message.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '31 juil. 2026 · écrire sans attendre une occasion';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'La pièce a beaucoup appris à regarder vers l’intérieur. Aujourd’hui, elle tend un fil vers quelqu’un d’autre : <strong>un proche, un ami, une personne perdue de vue ou quelqu’un à remercier.</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Le nouvel objet ne demande aucun nom et n’envoie rien. Il propose seulement une première phrase, parce que le plus difficile est parfois d’ouvrir la conversation.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Un lien n’a pas toujours besoin d’une grande occasion. Parfois, un prétexte suffit.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var values = statePanel.querySelectorAll('.v');
      if (values[4]) values[4].textContent = 'prétexte à écrire n° 001';
      if (values[5]) values[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, prêt à relier';
    }

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 008 · 31 juillet 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Les messages les plus précieux commencent rarement par une occasion parfaite.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À choisir</strong>une personne à qui tu penses déjà.';
    if (signals[1]) signals[1].innerHTML = '<strong>À écrire</strong>avant que la raison de ne pas le faire arrive.';
    if (signals[2]) signals[2].innerHTML = '<strong>À laisser</strong>la conversation devenir ce qu’elle voudra.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '31·07·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui vient de traverser ton esprit.';

    var log = document.querySelector('.log-list');
    if (log && !log.querySelector('[data-daily="2026-07-31"]')) {
      var item = document.createElement('li');
      item.dataset.daily = '2026-07-31';
      item.innerHTML = '<span class="t">Un fil quitte la pièce vers quelqu’un d’autre</span><span class="m">31 juil. · quatre types de liens, quelques ouvertures et aucun nom conservé</span>';
      log.appendChild(item);
    }

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./premiere-phrase --destinataire inconnu</span>\n<span class="t-dim">occasion=none; intention=sincere; tracking=disabled</span>\n<span class="t-prompt">$</span> <span class="t-key">git status --short</span>\n<span class="t-dim">M  un_lien_qui_compte</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-07-31';
      footerTime.textContent = '31 juillet 2026';
    }
  }

  refreshEditorial();
})();
