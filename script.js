/* ============================================
   NICOLAS PIEPER — SCRIPT
   ============================================ */

/* ---------- Language switching ---------- */
function setLang(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-en]').forEach(function (el) {
        var text = el.getAttribute('data-' + lang);
        if (text !== null) el.innerHTML = text;
    });

    // Update every toggle button (header + mobile nav)
    document.querySelectorAll('.btn-en').forEach(function (b) {
        b.classList.toggle('active', lang === 'en');
    });
    document.querySelectorAll('.btn-fr').forEach(function (b) {
        b.classList.toggle('active', lang === 'fr');
    });

    // Update meta description
    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
        desc.setAttribute('content', lang === 'fr'
            ? 'Leader technique & constructeur de plateformes. Comme une bonne pizza, les grandes plateformes demandent du temps et les bons ingrédients.'
            : 'Engineering Leader & Platform Builder. Like good pizza, great platforms take time and the right ingredients.'
        );
    }

    localStorage.setItem('lang', lang);
}

/* ---------- Mobile navigation ---------- */
function toggleNav() {
    var nav = document.getElementById('mobileNav');
    var isOpen = nav.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

/* ---------- Init ---------- */
(function () {
    var saved = localStorage.getItem('lang');
    var lang = saved || (navigator.language && navigator.language.startsWith('fr') ? 'fr' : 'en');
    setLang(lang);
})();