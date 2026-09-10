(function () {
  'use strict';

  // ─── Nav: estado "scrolled" ──────────────────────────────────
  var nav = document.getElementById('nav');
  function updateNav() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  // ─── Menú móvil ──────────────────────────────────────────────
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    if (!mobileMenu) return;
    var willOpen = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', willOpen);
    document.body.classList.toggle('nav-open', willOpen);
    if (burger) burger.setAttribute('aria-expanded', String(willOpen));
  }

  if (burger) burger.addEventListener('click', toggleMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll('[data-close]').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

})();
