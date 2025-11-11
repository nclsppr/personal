const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const navLinks = Array.from(document.querySelectorAll('.nav a')).map((link) => [link.getAttribute('href').replace('#', ''), link]);
const navMap = new Map(navLinks);

if (navLinks.length) {
  setActiveNav(navLinks[0][0]);
}

function setActiveNav(id) {
  navMap.forEach((link) => link.classList.remove('is-active'));
  const active = navMap.get(id);
  if (active) {
    active.classList.add('is-active');
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      .forEach((entry, index) => {
        if (index === 0) {
          setActiveNav(entry.target.id);
        }
      });
  },
  {
    rootMargin: '-40% 0px -40% 0px',
    threshold: [0.2, 0.45, 0.7],
  }
);

Array.from(document.querySelectorAll('main section[id]')).forEach((section) => observer.observe(section));

navMap.forEach((link, id) => {
  link.addEventListener('click', () => {
    setActiveNav(id);
  });
});