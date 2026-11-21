(function () {
  'use strict';
  var viewport = document.getElementById('race-slides');
  if (!viewport) return;
  var controls = viewport.nextElementSibling;
  var previous = controls.querySelector('[data-race-prev]');
  var next = controls.querySelector('[data-race-next]');
  var count = controls.querySelector('[data-race-count]');
  var total = viewport.children.length;
  var destination = null;
  var displayed = -1;

  function visibleIndex() {
    return Math.max(0, Math.min(total - 1, Math.round(viewport.scrollLeft / viewport.clientWidth)));
  }

  function activeIndex() {
    return destination === null ? visibleIndex() : destination;
  }

  function update() {
    var index = visibleIndex();
    if (index === destination) destination = null;
    if (index === displayed) return;
    displayed = index;
    count.textContent = (index + 1) + ' / ' + total;
    previous.setAttribute('aria-disabled', String(index === 0));
    next.setAttribute('aria-disabled', String(index === total - 1));
  }

  function select(index) {
    if (index < 0 || index >= total) return;
    destination = index;
    viewport.scrollTo({ left: destination * viewport.clientWidth });
    update();
  }

  function followScroll() {
    destination = null;
    update();
  }

  previous.addEventListener('click', function () { select(activeIndex() - 1); });
  next.addEventListener('click', function () { select(activeIndex() + 1); });
  viewport.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    switch (event.key) {
      case 'ArrowLeft': select(activeIndex() - 1); break;
      case 'ArrowRight': select(activeIndex() + 1); break;
      case 'Home': select(0); break;
      case 'End': select(total - 1); break;
      default: return;
    }
    event.preventDefault();
  });
  viewport.addEventListener('pointerdown', followScroll);
  viewport.addEventListener('wheel', followScroll, { passive: true });
  viewport.addEventListener('scroll', update, { passive: true });
  viewport.addEventListener('scrollend', followScroll);
  window.addEventListener('resize', followScroll);
  update();
  controls.hidden = false;
}());
