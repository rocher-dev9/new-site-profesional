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

  // ─── Hero: estudio creativo con IA ──────────────────────────
  var aiText = document.getElementById('ai-text');
  var aiOutput = document.getElementById('ai-output');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (aiText && aiOutput && !reduceMotion) {
    var aiFont = document.getElementById('ai-font');
    var aiStatus = document.getElementById('ai-status');
    var prompts = [
      { text: 'Diseña una identidad para una marca de café', font: 'Serif editorial',
        colors: ['#2d1e17', '#b86b3c', '#f2dfc7', '#7a8b5a'] },
      { text: 'Crea un pack de posts para el lanzamiento', font: 'Sans geométrica',
        colors: ['#5850ec', '#e8834a', '#fbe2c6', '#15121f'] },
      { text: 'Prototipa un dashboard IoT accesible', font: 'Sans técnica',
        colors: ['#0e8a5a', '#dcf3e8', '#15121f', '#e0a82e'] },
      { text: 'Plantea una campaña para redes sociales', font: 'Display rotunda',
        colors: ['#d9482c', '#fbe2c6', '#7a5bd8', '#15121f'] }
    ];
    var i = 0;

    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    function type(str) {
      var n = 0;
      return new Promise(function (resolve) {
        (function step() {
          aiText.textContent = str.slice(0, ++n);
          if (n < str.length) setTimeout(step, 38 + Math.random() * 40);
          else resolve();
        })();
      });
    }

    function erase() {
      return new Promise(function (resolve) {
        (function step() {
          var s = aiText.textContent;
          aiText.textContent = s.slice(0, -2);
          if (aiText.textContent.length) setTimeout(step, 14);
          else resolve();
        })();
      });
    }

    function apply(p) {
      p.colors.forEach(function (c, k) { aiOutput.style.setProperty('--c' + (k + 1), c); });
      aiFont.textContent = p.font;
    }

    function loop() {
      var p = prompts[i];
      return erase()
        .then(function () { return type(p.text); })
        .then(function () {
          aiOutput.classList.add('is-loading');
          aiStatus.parentNode.classList.add('is-busy');
          aiStatus.textContent = 'generando propuesta…';
          return wait(1300);
        })
        .then(function () {
          apply(p);
          aiOutput.classList.remove('is-loading');
          aiStatus.parentNode.classList.remove('is-busy');
          aiStatus.textContent = 'propuesta lista';
          return wait(3600);
        })
        .then(function () { i = (i + 1) % prompts.length; return loop(); });
    }

    wait(2400).then(function () { i = 1; loop(); });
  }

})();
