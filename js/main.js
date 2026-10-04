(function () {
  'use strict';

  // Idioma de la página (las versiones en inglés viven en /en/ con lang="en")
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'es';
  function tr(es, en) { return LANG === 'en' ? en : es; }

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
      { text: tr('Diseña una identidad para una marca de café', 'Design an identity for a coffee brand'), font: tr('Serif editorial', 'Editorial serif'),
        colors: ['#2d1e17', '#b86b3c', '#f2dfc7', '#7a8b5a'] },
      { text: tr('Crea un pack de posts para el lanzamiento', 'Create a post pack for the launch'), font: tr('Sans geométrica', 'Geometric sans'),
        colors: ['#5850ec', '#e8834a', '#fbe2c6', '#15121f'] },
      { text: tr('Prototipa un dashboard IoT accesible', 'Prototype an accessible IoT dashboard'), font: tr('Sans técnica', 'Technical sans'),
        colors: ['#0e8a5a', '#dcf3e8', '#15121f', '#e0a82e'] },
      { text: tr('Plantea una campaña para redes sociales', 'Plan a social media campaign'), font: tr('Display rotunda', 'Bold display'),
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
          aiStatus.textContent = tr('generando propuesta…', 'generating proposal…');
          return wait(1300);
        })
        .then(function () {
          apply(p);
          aiOutput.classList.remove('is-loading');
          aiStatus.parentNode.classList.remove('is-busy');
          aiStatus.textContent = tr('propuesta lista', 'proposal ready');
          return wait(3600);
        })
        .then(function () { i = (i + 1) % prompts.length; return loop(); });
    }

    wait(2400).then(function () { i = 1; loop(); });
  }

  // ─── Home: planeta de píxeles animado ───────────────────────
  var pixelCanvas = document.querySelector('.pixel-field');

  if (pixelCanvas && pixelCanvas.getContext) {
    var ctx = pixelCanvas.getContext('2d');
    var CELL = 7, DOT = 5;
    var W = 0, H = 0, cols = 0, rows = 0, running = false, rafId = 0, lastDraw = 0, inView = true;
    // Niveles de la paleta de la web (de claro a intenso)
    var levels = ['#e8e5fb', '#c9c4f9', '#8f88ff', '#5850ec', '#3f37d6'];
    var bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    var RING_TILT = -0.42;
    var cosT = Math.cos(RING_TILT), sinT = Math.sin(RING_TILT);
    var L = [0.55, -0.35, 0.76]; // luz desde arriba a la derecha: el borde izquierdo queda denso

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = pixelCanvas.clientWidth; H = pixelCanvas.clientHeight;
      pixelCanvas.width = W * dpr;
      pixelCanvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL);
      rows = Math.ceil(H / CELL);
    }

    function smooth(a, b, x) {
      var k = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return k * k * (3 - 2 * k);
    }

    function draw(time) {
      var t = time / 1000;
      var mobile = W < 700;
      var cx = W * (mobile ? 0.56 : 0.73);
      var cy = mobile ? H - 175 : H * 0.5;
      var R = mobile ? Math.min(135, W * 0.37) : Math.min(H * 0.38, W * 0.2);
      var ra = R * 2.3, rb = R * 0.55;
      ctx.clearRect(0, 0, W, H);

      for (var y = 0; y < rows; y++) {
        var py = y * CELL + CELL / 2;
        for (var x = 0; x < cols; x++) {
          var px = x * CELL + CELL / 2;
          var nx = px / W;
          var dx = (px - cx) / R, dy = (py - cy) / R;
          var r2 = dx * dx + dy * dy;
          var v = 0;

          // Planeta: sombreado + bandas que giran lentamente
          if (r2 < 1) {
            var z = Math.sqrt(1 - r2);
            var lit = dx * L[0] + dy * L[1] + z * L[2];
            var shade = Math.pow(1 - Math.max(0, lit), 2.2);
            var lon = Math.atan2(dx, z) + t * 0.18;
            var lat = Math.asin(Math.max(-1, Math.min(1, dy)));
            var bands = 0.13 * Math.sin(lat * 9 + Math.sin(lon * 3) * 1.6) +
              0.09 * Math.sin(lon * 5 + lat * 4);
            v = 0.12 + shade * 0.95 + bands;
          }

          // Anillo inclinado: la parte delantera tapa el planeta, la trasera queda oculta
          var u = (px - cx) * cosT + (py - cy) * sinT;
          var w = -(px - cx) * sinT + (py - cy) * cosT;
          var e = Math.sqrt((u / ra) * (u / ra) + (w / rb) * (w / rb));
          var front = w > 0;
          if (e > 0.72 && e < 1.04 && (front || r2 >= 1)) {
            var ang = Math.atan2(w / rb, u / ra);
            var band = 0.44 + 0.16 * Math.sin(e * 60) + 0.1 * Math.sin(ang * 3 - t * 0.4);
            if (Math.sin(ang * 46 - t * 1.4 + e * 10) > 0.93) band = 1; // partículas que recorren el anillo
            band *= 0.35 + 0.65 * smooth(0.12, 0.5, nx);
            if (r2 < 1 && front) {
              // Delante del planeta: el anillo lo tapa, con una fina separación a cada lado
              v = (e < 0.75 || e > 1.01) ? 0 : band;
            } else {
              v = Math.max(v, band);
            }
          }

          // Retícula de puntos muy suave en el fondo
          if (v === 0 && x % 3 === 0 && y % 3 === 0) {
            v = 0.2 * smooth(0.35, 1, nx) + 0.04 * Math.sin(t * 0.8 + x * 0.3 + y * 0.2);
          }

          if (v <= 0) continue;
          // Tramado ordenado (Bayer 4×4) entre niveles de color
          var level = Math.floor(v * 4 + bayer[(y & 3) * 4 + (x & 3)] / 16 - 0.35);
          if (level < 0) continue;
          ctx.fillStyle = levels[Math.min(level, 4)];
          ctx.fillRect(x * CELL + 1, y * CELL + 1, DOT, DOT);
        }
      }
    }

    function frame(time) {
      if (!running) return;
      if (time - lastDraw > 50) { draw(time); lastDraw = time; } // ~20 fps, suficiente y ligero
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(rafId); }

    resize();
    draw(0);
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); draw(performance.now()); }, 150);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        inView ? start() : stop();
      }).observe(pixelCanvas);
    } else {
      start();
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden || !inView ? stop() : start();
    });
  }

  // ─── Sobre mí: mano pixelada saludando ──────────────────────
  var handCanvas = document.getElementById('hand-field');

  if (handCanvas && handCanvas.getContext) {
    var hctx = handCanvas.getContext('2d');
    var HCELL = 7, HDOT = 5;
    var HW = 0, HH = 0, hcols = 0, hrows = 0, hRunning = false, hRaf = 0, hLast = 0, hInView = true;
    var hLevels = ['#e8e5fb', '#c9c4f9', '#8f88ff', '#5850ec', '#3f37d6'];
    var hBayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    // Lienzo auxiliar a la resolución de la retícula: cada píxel es una celda
    var off = document.createElement('canvas');
    var octx = off.getContext('2d', { willReadFrequently: true });

    function hResize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      HW = handCanvas.clientWidth; HH = handCanvas.clientHeight;
      handCanvas.width = HW * dpr; handCanvas.height = HH * dpr;
      hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hcols = Math.ceil(HW / HCELL); hrows = Math.ceil(HH / HCELL);
      off.width = hcols; off.height = hrows;
    }

    function capsule(c, x1, y1, x2, y2, r) {
      var a = Math.atan2(y2 - y1, x2 - x1);
      c.beginPath();
      c.arc(x1, y1, r, a + Math.PI / 2, a - Math.PI / 2);
      c.arc(x2, y2, r, a - Math.PI / 2, a + Math.PI / 2);
      c.closePath();
    }

    // Ángulo del saludo: tres balanceos que se van apagando y una pausa (ciclo de 2,4 s)
    function waveAngle(t) {
      var p = (t % 2.4) / 2.4;
      if (p > 0.6) return 0;
      var decay = 1 - p / 0.6;
      return Math.sin(p / 0.6 * Math.PI * 5) * 0.32 * decay;
    }

    function drawHand(c, angle, unit) {
      // Coordenadas locales: mano de ~100 unidades de alto, pivote en la muñeca (50, 100)
      c.save();
      c.translate(hcols * 0.5, hrows * 0.9);
      c.rotate(angle);
      c.scale(unit, unit);
      c.translate(-50, -100);
      var g = c.createLinearGradient(10, 0, 90, 0);
      g.addColorStop(0, '#000');      // borde izquierdo: denso
      g.addColorStop(0.55, '#9a9a9a');
      g.addColorStop(1, '#d8d8d8');   // borde derecho: claro
      c.fillStyle = g;
      // Dedos (separados para que se lean los huecos)
      capsule(c, 31, 60, 28, 20, 5.2); c.fill();
      capsule(c, 45, 58, 45, 10, 5.4); c.fill();
      capsule(c, 59, 59, 62, 16, 5.2); c.fill();
      capsule(c, 72, 63, 77, 32, 4.6); c.fill();
      // Pulgar
      capsule(c, 29, 80, 10, 56, 5.8); c.fill();
      // Palma
      c.beginPath();
      c.moveTo(26, 56); c.lineTo(78, 56);
      c.quadraticCurveTo(80, 82, 70, 96);
      c.lineTo(32, 96);
      c.quadraticCurveTo(22, 82, 26, 56);
      c.fill();
      c.restore();
    }

    function hDraw(time) {
      var t = time / 1000;
      var angle = reduceMotion ? 0.12 : waveAngle(t);
      var unit = Math.min(hrows * 0.88 / 100, hcols * 0.95 / 100);

      octx.clearRect(0, 0, hcols, hrows);
      drawHand(octx, angle, unit);
      var data = octx.getImageData(0, 0, hcols, hrows).data;

      hctx.clearRect(0, 0, HW, HH);
      for (var y = 0; y < hrows; y++) {
        for (var x = 0; x < hcols; x++) {
          var i = (y * hcols + x) * 4;
          var v = 0;
          if (data[i + 3] > 110) {
            v = 0.2 + (1 - data[i] / 255) * 0.85;   // cuanto más oscuro, más denso
            // Contorno: las celdas del borde de la silueta se dibujan más intensas
            var edge = (x === 0 || data[i - 1] < 110) || (x === hcols - 1 || data[i + 7] < 110) ||
              (y === 0 || data[i - hcols * 4 + 3] < 110) || (y === hrows - 1 || data[i + hcols * 4 + 3] < 110);
            if (edge) v += 0.35;
          }
          if (v <= 0) continue;
          var level = Math.floor(v * 4 + hBayer[(y & 3) * 4 + (x & 3)] / 16 - 0.35);
          if (level < 0) continue;
          hctx.fillStyle = hLevels[Math.min(level, 4)];
          hctx.fillRect(x * HCELL + 1, y * HCELL + 1, HDOT, HDOT);
        }
      }
    }

    function hFrame(time) {
      if (!hRunning) return;
      if (time - hLast > 40) { hDraw(time); hLast = time; }
      hRaf = requestAnimationFrame(hFrame);
    }
    function hStart() { if (hRunning || reduceMotion) return; hRunning = true; hRaf = requestAnimationFrame(hFrame); }
    function hStop() { hRunning = false; cancelAnimationFrame(hRaf); }

    hResize();
    hDraw(0);
    var hTimer;
    window.addEventListener('resize', function () {
      clearTimeout(hTimer);
      hTimer = setTimeout(function () { hResize(); hDraw(performance.now()); }, 150);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        hInView = entries[0].isIntersecting;
        hInView ? hStart() : hStop();
      }).observe(handCanvas);
    } else {
      hStart();
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden || !hInView ? hStop() : hStart();
    });
  }

  // ─── Home: brillo del bloque IA que sigue al cursor ─────────
  var iaTeaser = document.querySelector('.ia-teaser');
  if (iaTeaser && !reduceMotion) {
    iaTeaser.addEventListener('pointermove', function (e) {
      var r = iaTeaser.getBoundingClientRect();
      iaTeaser.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      iaTeaser.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      iaTeaser.classList.add('is-pointer');
    });
    iaTeaser.addEventListener('pointerleave', function () { iaTeaser.classList.remove('is-pointer'); });
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
        '<div class="deck-steps">' + tr('<span>brief</span><span>concepto</span><span>diseño</span><span>entrega</span>',
          '<span>brief</span><span>concept</span><span>design</span><span>delivery</span>') + '</div>' +
        '<div class="deck-progress"><i></i></div></div>');
      card.querySelector('strong').textContent = project.querySelector('h3').textContent;
      card.addEventListener('click', function () { focusProject(k); });
      deckStage.appendChild(card);
      cards.push(card);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.style.setProperty('--dot-color', solid);
      dot.setAttribute('aria-label', tr('Ver proyecto ', 'View project ') + (k + 1) + ': ' + card.querySelector('strong').textContent);
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
