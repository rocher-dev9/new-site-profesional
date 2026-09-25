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

  // ─── Trabajo: baraja de proyectos ───────────────────────────
  var deckStage = document.getElementById('deck-stage');
  var projects = document.querySelectorAll('.work-grid .project-card');

  if (deckStage && projects.length) {
    var deckDots = document.getElementById('deck-dots');
    var cards = [];
    var dots = [];
    var current = 0;
    var total = projects.length;

    projects.forEach(function (project, k) {
      var cover = project.querySelector('.project-cover');
      var color = cover.style.background;
      var solid = /^#|^rgb/.test(color) ? color : '#5850EC';

      var card = document.createElement('div');
      card.className = 'deck-card';
      card.style.setProperty('--deck-color', solid);
      card.appendChild(cover.cloneNode(true));
      card.insertAdjacentHTML('beforeend',
        '<div class="deck-body"><strong></strong>' +
        '<div class="deck-steps"><span>brief</span><span>concepto</span><span>diseño</span><span>entrega</span></div>' +
        '<div class="deck-progress"><i></i></div></div>');
      card.querySelector('strong').textContent = project.querySelector('h3').textContent;
      card.addEventListener('click', function () { focusProject(k); });
      deckStage.appendChild(card);
      cards.push(card);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.style.setProperty('--dot-color', solid);
      dot.setAttribute('aria-label', 'Ver proyecto ' + (k + 1) + ': ' + card.querySelector('strong').textContent);
      dot.addEventListener('click', function () { show(k); });
      deckDots.appendChild(dot);
      dots.push(dot);
    });

    function show(next) {
      var prev = current;
      current = (next + total) % total;
      cards.forEach(function (card, k) {
        var pos = (k - current + total) % total;
        card.className = 'deck-card' + (pos < 3 ? ' pos-' + pos : '') +
          (k === prev && k !== current && pos > 2 ? ' is-leaving' : '');
        card.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
      });
      dots.forEach(function (dot, k) { dot.setAttribute('aria-current', String(k === current)); });
    }

    function focusProject(k) {
      var target = projects[k];
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      target.classList.add('is-highlight');
      setTimeout(function () { target.classList.remove('is-highlight'); }, 1800);
    }

    document.getElementById('deck-prev').addEventListener('click', function () { show(current - 1); });
    document.getElementById('deck-next').addEventListener('click', function () { show(current + 1); });

    // Avance automático al terminar la barra de progreso (se pausa con hover/foco)
    if (!reduceMotion) {
      deckStage.addEventListener('animationend', function (e) {
        if (e.animationName === 'deck-progress') show(current + 1);
      });
    }

    show(0);
  }

})();
