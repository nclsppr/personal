/* Progressive enhancement: every product and merchant link exists in HTML. */
(function () {
  'use strict';
  var dialog = document.getElementById('objectDialog');
  var content = document.getElementById('objectDialogContent');
  var filters = document.querySelector('.collection-filters');
  var count = document.querySelector('.collection-count');
  var lastSummary = null;
  var ownsHash = false;

  function filterCollection(value) {
    document.querySelectorAll('.collection-section').forEach(function (section) {
      section.hidden = value !== 'all' && section.dataset.collection !== value;
    });
    filters.querySelectorAll('button').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === value));
    });
    var total = document.querySelectorAll('.collection-section:not([hidden]) .object-card').length;
    count.textContent = total + ' ' + count.dataset.label;
  }
  if (filters) {
    filters.hidden = false;
    filters.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter]');
      if (button) filterCollection(button.dataset.filter);
    });
  }
  if (!dialog || typeof dialog.showModal !== 'function') return;

  function showProduct(card, updateHistory) {
    if (!card) return;
    var section = card.closest('.collection-section');
    if (section.hidden) filterCollection('all');
    lastSummary = card.querySelector('summary');
    content.replaceChildren(card.querySelector('.object-detail').cloneNode(true));
    content.querySelector('h2').id = 'objectDialogTitle';
    dialog.setAttribute('aria-labelledby', 'objectDialogTitle');
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('object-opened');
    if (updateHistory) {
      history.pushState({ object: card.id }, '', '#' + card.id);
      ownsHash = true;
    }
  }
  document.querySelectorAll('.object-card summary').forEach(function (summary) {
    summary.addEventListener('click', function (event) {
      event.preventDefault();
      showProduct(summary.closest('.object-card'), true);
    });
  });
  function closeProduct() { if (dialog.open) dialog.close(); }
  dialog.querySelector('.object-close').addEventListener('click', closeProduct);
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProduct();
  });
  dialog.addEventListener('close', function () {
    document.body.classList.remove('object-opened');
    if (ownsHash) {
      ownsHash = false;
      history.back();
    } else if (document.querySelector('.object-card:target')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (lastSummary) lastSummary.focus({ preventScroll: true });
  });
  window.addEventListener('popstate', function () {
    ownsHash = false;
    var card = document.getElementById(location.hash.slice(1));
    if (card && card.matches('.object-card')) showProduct(card, false);
    else closeProduct();
  });
  var initial = document.getElementById(location.hash.slice(1));
  if (initial && initial.matches('.object-card')) showProduct(initial, false);
}());
