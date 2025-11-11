const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const navLinks = document.querySelectorAll('.nav a[href^="#"]');
navLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (!target) return;

    window.scrollTo({
      top: target.offsetTop - 40,
      behavior: 'smooth'
    });
  });
});
