(function () {
  'use strict';

  var bench = document.getElementById('benchPanel');
  var collection = document.getElementById('objectCollection');
  var releasePanel = document.querySelector('.release-panel');
  if ((!bench && !collection && !releasePanel) || document.getElementById('homewardPanel')) return;

  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './homeward.css?v=20260807-homeward';
  document.head.appendChild(style);

  var panel = document.createElement('section');
  panel.className = 'panel homeward-panel span-12';
  panel.id = 'homewardPanel';
  panel.setAttribute('aria-labelledby', 'homeward-title');
  panel.innerHTML = [
    '<div class="panel-head">',
      '<h2 class="panel-title" id="homeward-title">Le sac du retour</h2>',
      '<span class="panel-badge">3 poches · rien n’est enregistré</span>',
    '</div>',
    '<div class="homeward-room">',
      '<div class="homeward-stage" id="homewardStage" data-filled="0" aria-hidden="true">',
        '<span class="homeward-horizon"></span>',
        '<span class="homeward-road"></span>',
        '<div class="homeward-case">',
          '<span class="homeward-handle"></span>',
          '<span class="homeward-pocket homeward-pocket--detail"><i></i></span>',
          '<span class="homeward-pocket homeward-pocket--words"><i></i></span>',
          '<span class="homeward-pocket homeward-pocket--again"><i></i></span>',
          '<span class="homeward-tag" id="homewardTag">0 / 3</span>',
        '</div>',
        '<span class="homeward-line homeward-line--one"></span>',
        '<span class="homeward-line homeward-line--two"></span>',
      '</div>',
      '<div class="homeward-copy">',
        '<p class="homeward-kicker">avant de repartir, choisir ce qui traverse avec nous</p>',
        '<h3>On ne peut pas tout ramener. Trois choses suffisent.</h3>',
        '<p class="homeward-intro">Après un voyage, une journée ou une visite, glisse ici un détail, une phrase et un petit geste à refaire. Le sac existe seulement dans cet onglet.</p>',
        '<form class="homeward-form" id="homewardForm">',
          '<label class="homeward-field">',
            '<span><strong>un détail</strong><small>quelque chose que la photo aurait raté</small></span>',
            '<input id="homewardDetail" type="text" maxlength="90" autocomplete="off" placeholder="une lumière, un bruit, un détour…">',
          '</label>',
          '<label class="homeward-field">',
            '<span><strong>une phrase</strong><small>entendue, dite ou à raconter</small></span>',
            '<input id="homewardWords" type="text" maxlength="90" autocomplete="off" placeholder="quelques mots qui méritent de rentrer…">',
          '</label>',
          '<label class="homeward-field">',
            '<span><strong>un petit truc à refaire</strong><small>une habitude minuscule à rapporter</small></span>',
            '<input id="homewardAgain" type="text" maxlength="90" autocomplete="off" placeholder="marcher plus lentement, appeler quelqu’un…">',
          '</label>',
          '<div class="homeward-actions">',
            '<button class="homeward-button homeward-button--primary" id="homewardClose" type="submit" disabled>fermer le sac</button>',
            '<button class="homeward-button" id="homewardClear" type="button">vider</button>',
          '</div>',
        '</form>',
        '<div class="homeward-inventory" id="homewardInventory" hidden>',
          '<p class="homeward-inventory-label">inventaire de poche</p>',
          '<ul id="homewardInventoryList"></ul>',
          '<div class="homeward-actions">',
            '<button class="homeward-button homeward-button--primary" id="homewardCopy" type="button">copier l’inventaire</button>',
            '<button class="homeward-button" id="homewardReopen" type="button">rouvrir le sac</button>',
          '</div>',
        '</div>',
        '<p class="homeward-status" id="homewardStatus" aria-live="polite">Le sac est vide. Une seule poche suffit pour commencer.</p>',
        '<p class="homeward-privacy">Aucun compte, serveur, cookie, stockage local ou appel réseau. Le contenu disparaît au rechargement de la page ; seule une copie volontaire passe par le presse-papiers de cet appareil.</p>',
      '</div>',
    '</div>'
  ].join('');

  if (bench) bench.insertAdjacentElement('afterend', panel);
  else if (collection) collection.insertAdjacentElement('afterend', panel);
  else releasePanel.insertAdjacentElement('beforebegin', panel);

  var form = document.getElementById('homewardForm');
  var stage = document.getElementById('homewardStage');
  var tag = document.getElementById('homewardTag');
  var fields = [
    { input: document.getElementById('homewardDetail'), label: 'Détail' },
    { input: document.getElementById('homewardWords'), label: 'Phrase' },
    { input: document.getElementById('homewardAgain'), label: 'À refaire' }
  ];
  var closeButton = document.getElementById('homewardClose');
  var clearButton = document.getElementById('homewardClear');
  var inventory = document.getElementById('homewardInventory');
  var inventoryList = document.getElementById('homewardInventoryList');
  var copyButton = document.getElementById('homewardCopy');
  var reopenButton = document.getElementById('homewardReopen');
  var status = document.getElementById('homewardStatus');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var snapshot = [];
  var animationTimer = 0;

  function values() {
    return fields.map(function (field) {
      return { label: field.label, value: field.input.value.trim() };
    }).filter(function (item) { return item.value.length > 0; });
  }

  function refresh() {
    var filled = values().length;
    stage.dataset.filled = String(filled);
    tag.textContent = filled + ' / 3';
    closeButton.disabled = filled === 0;
    fields.forEach(function (field, index) {
      field.input.closest('.homeward-field').classList.toggle('is-filled', field.input.value.trim().length > 0);
      stage.querySelectorAll('.homeward-pocket')[index].classList.toggle('is-filled', field.input.value.trim().length > 0);
    });
  }

  function animateClose() {
    window.clearTimeout(animationTimer);
    panel.classList.remove('is-closing');
    void panel.offsetWidth;
    panel.classList.add('is-closing');
    animationTimer = window.setTimeout(function () {
      panel.classList.remove('is-closing');
    }, reduceMotion ? 80 : 760);
  }

  function renderInventory() {
    inventoryList.replaceChildren();
    snapshot.forEach(function (item) {
      var li = document.createElement('li');
      var label = document.createElement('strong');
      var value = document.createElement('span');
      label.textContent = item.label;
      value.textContent = item.value;
      li.append(label, value);
      inventoryList.appendChild(li);
    });
  }

  function clearAll() {
    snapshot = [];
    fields.forEach(function (field) { field.input.value = ''; });
    inventory.hidden = true;
    form.hidden = false;
    inventoryList.replaceChildren();
    copyButton.textContent = 'copier l’inventaire';
    status.textContent = 'Le sac est vide. Une seule poche suffit pour commencer.';
    refresh();
    fields[0].input.focus();
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

  function copyInventory() {
    var text = snapshot.map(function (item) { return item.label + ' — ' + item.value; }).join('\n');
    var operation = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); })
      : Promise.resolve(fallbackCopy(text));

    operation.then(function (copied) {
      copyButton.textContent = copied ? 'inventaire copié' : 'copie impossible';
      status.textContent = copied
        ? 'La copie est dans le presse-papiers. Le site n’en conserve aucun exemplaire.'
        : 'Le navigateur a refusé la copie. L’inventaire reste visible juste au-dessus.';
    });
  }

  fields.forEach(function (field) { field.input.addEventListener('input', refresh); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    snapshot = values();
    if (!snapshot.length) return;
    renderInventory();
    animateClose();
    form.hidden = true;
    inventory.hidden = false;
    status.textContent = snapshot.length === 1
      ? 'Une chose rentre avec toi. C’est déjà assez.'
      : snapshot.length + ' choses rentrent avec toi. Le reste peut rester ici.';
    copyButton.focus();
  });

  clearButton.addEventListener('click', clearAll);
  copyButton.addEventListener('click', copyInventory);
  reopenButton.addEventListener('click', function () {
    inventory.hidden = true;
    form.hidden = false;
    copyButton.textContent = 'copier l’inventaire';
    status.textContent = 'Le sac est rouvert. Tu peux encore changer ce qui rentre avec toi.';
    fields[0].input.focus();
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
    setMeta('meta[name="description"]', 'Un petit espace vivant entre Nicolas, Claude, Codex et Pampy : sept objets calmes, trois haltes hors étagère et un sac du retour qui ne garde rien après le rechargement.');
    setMeta('meta[property="og:description"]', 'Une pièce étrange de nicolaspieper.com avec des objets quotidiens, un carnet de route et un inventaire de poche à remplir sans compte, suivi ni sauvegarde.');

    var lead = document.querySelector('.panel--lead');
    if (lead) {
      var badge = lead.querySelector('.panel-badge');
      if (badge) badge.textContent = '7 août 2026 · choisir ce qui rentre avec nous';
      var paragraphs = lead.querySelectorAll('p');
      if (paragraphs[0]) paragraphs[0].innerHTML = 'La pièce a beaucoup parlé de départs, de détours et de choses à remarquer. À l’approche du retour, elle pose une autre question&nbsp;: <strong>qu’est-ce qui mérite vraiment de rentrer avec nous&nbsp;?</strong>';
      if (paragraphs[1]) paragraphs[1].textContent = 'Le nouveau sac a trois poches : un détail, une phrase et un petit geste à refaire. Une seule suffit, rien n’est enregistré et tout disparaît au rechargement.';
      if (paragraphs[2]) paragraphs[2].textContent = 'Un souvenir n’a pas besoin d’être complet pour rester vivant. Il a surtout besoin d’être choisi.';
    }

    var statePanel = document.querySelector('[aria-labelledby="statut-du-lieu"]');
    if (statePanel) {
      var stateValues = statePanel.querySelectorAll('.v');
      if (stateValues[4]) stateValues[4].textContent = 'sac du retour n° 001';
      if (stateValues[5]) stateValues[5].innerHTML = '<span class="dot dot--ok" aria-hidden="true"></span>ouvert, bagage léger';
    }

    var collectionBadge = collection && collection.querySelector('.panel-badge');
    if (collectionBadge) collectionBadge.textContent = '7 objets · 3 haltes hors étagère';

    var postcardBadge = document.querySelector('.postcard-panel .panel-badge');
    if (postcardBadge) postcardBadge.textContent = 'édition n° 015 · 7 août 2026';
    var postcardMessage = document.querySelector('.postcard-message');
    if (postcardMessage) postcardMessage.textContent = 'Au retour, le meilleur bagage n’est pas forcément celui qu’on ferme. C’est parfois le détail qu’on décide de ne pas perdre.';
    var signals = document.querySelectorAll('.postcard-signal');
    if (signals[0]) signals[0].innerHTML = '<strong>À ramener</strong>un détail assez précis pour rouvrir toute une journée.';
    if (signals[1]) signals[1].innerHTML = '<strong>À raconter</strong>une phrase plutôt qu’un résumé complet.';
    if (signals[2]) signals[2].innerHTML = '<strong>À refaire</strong>un petit geste qui rendait les journées meilleures.';
    var stamp = document.querySelector('.postcard-stamp small');
    if (stamp) stamp.textContent = '07·08·26';
    var address = document.querySelector('.postcard-address');
    if (address) address.textContent = 'À la personne qui préfère rentrer avec trois choses choisies qu’avec cent photos triées.';

    appendLog(document.querySelector('.log-list'), '2026-08-07', 'Un sac attend près de la porte', '7 août · trois poches privées, aucun souvenir imposé et rien conservé au rechargement');

    var terminal = document.querySelector('.terminal pre');
    if (terminal) {
      terminal.innerHTML = '<span class="t-prompt">$</span> <span class="t-key">./retour --pockets 3 --storage off</span>\n<span class="t-dim">detail=?; phrase=?; again=?</span>\n<span class="t-prompt">$</span> <span class="t-key">echo "prendre moins, choisir mieux"</span>\n<span class="t-dim">prendre moins, choisir mieux</span>\n<span class="t-prompt">$</span> <span class="t-key">echo $?</span>\n0';
    }

    var footerTime = document.querySelector('.cspace-footer time');
    if (footerTime) {
      footerTime.dateTime = '2026-08-07';
      footerTime.textContent = '7 août 2026';
    }
  }

  refresh();
  refreshEditorial();
})();
