(function () {
  'use strict';

  // Idioma de la página (las versiones en inglés viven en /en/ con lang="en")
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'es';
  function tr(es, en) { return LANG === 'en' ? en : es; }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // ─── Cabecera: retícula de puntos que reacciona al cursor ────
  var dotsCanvas = document.querySelector('.hero-dots');

  if (dotsCanvas && dotsCanvas.getContext) {
    var dctx = dotsCanvas.getContext('2d');
    var dHero = dotsCanvas.parentElement;
    var GAP = 22, RADIUS = 120;
    var DW = 0, DH = 0, dRunning = false, dInView = true;
    var dMouse = { x: -9999, y: -9999, s: 0, target: 0 }; // s: intensidad suavizada (0–1)
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function dResize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      DW = dotsCanvas.clientWidth; DH = dotsCanvas.clientHeight;
      dotsCanvas.width = DW * dpr; dotsCanvas.height = DH * dpr;
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Misma máscara que el CSS original: elipse centrada al 50% / 40% que se desvanece hacia los bordes
    function maskAt(x, y) {
      var nx = (x - DW * 0.5) / (DW * 0.5), ny = (y - DH * 0.4) / (DH * 0.6);
      var r = Math.sqrt(nx * nx + ny * ny);
      if (r <= 0.35) return 1;
      if (r >= 0.8) return 0;
      return 1 - (r - 0.35) / 0.45;
    }

    function dDraw() {
      dctx.clearRect(0, 0, DW, DH);
      var s = dMouse.s;
      for (var y = GAP / 2; y < DH; y += GAP) {
        for (var x = GAP / 2; x < DW; x += GAP) {
          var m = maskAt(x, y);
          var dx = x - dMouse.x, dy = y - dMouse.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          var t = d < RADIUS ? (1 - d / RADIUS) * s : 0;
          t = t * t * (3 - 2 * t); // suavizado
          var alpha = Math.max(0.16 * m, (0.16 + t * 0.34) * Math.max(m, t));
          if (alpha < 0.01) continue;
          var px = x, py = y;
          if (t > 0 && d > 0.1) { px += dx / d * t * 3; py += dy / d * t * 3; } // se aparta levemente del cursor
          dctx.fillStyle = 'rgba(88, 80, 236,' + alpha.toFixed(3) + ')';
          if (t > 0.4) {
            // Cerca del cursor el punto se convierte en un píxel cuadrado
            var size = Math.round(2 + t * 1.6);
            dctx.fillRect(Math.round(px - size / 2), Math.round(py - size / 2), size, size);
          } else {
            dctx.beginPath(); dctx.arc(px, py, 1, 0, 6.283); dctx.fill();
          }
        }
      }
    }

    function dFrame() {
      dMouse.s += (dMouse.target - dMouse.s) * 0.12;
      dDraw();
      // Sigue animando hasta que la intensidad se estabiliza
      if (Math.abs(dMouse.target - dMouse.s) > 0.005) requestAnimationFrame(dFrame);
      else { dMouse.s = dMouse.target; dDraw(); dRunning = false; }
    }
    function dWake() { if (!dRunning && dInView) { dRunning = true; requestAnimationFrame(dFrame); } }

    dResize();
    dDraw();
    dHero.classList.add('dots-live');

    var dTimer;
    window.addEventListener('resize', function () {
      clearTimeout(dTimer);
      dTimer = setTimeout(function () { dResize(); dDraw(); }, 150);
    });

    if (canHover && !reduceMotion) {
      dHero.addEventListener('pointermove', function (e) {
        var r = dotsCanvas.getBoundingClientRect();
        dMouse.x = e.clientX - r.left; dMouse.y = e.clientY - r.top;
        dMouse.target = 1;
        if (dRunning) return;
        dDraw();          // redibuja al instante con la nueva posición
        dWake();
      });
      dHero.addEventListener('pointerleave', function () { dMouse.target = 0; dWake(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) { dInView = entries[0].isIntersecting; }).observe(dotsCanvas);
      }
    }
  }

  // ─── Cabecera: chat con texto de ejemplo que se escribe solo ─
  var chatInput = document.getElementById('hero-chat-input');

  if (chatInput) {
    var EXAMPLES = LANG === 'en' ? {
      branding: ['I need a visual identity for my coffee brand', 'I want to refresh the logo and brand guidelines of my studio'],
      uiux: ['I want to redesign my company’s website', 'I need a clear dashboard for my business data'],
      marketing: ['I’m looking for a social media campaign for a launch', 'I need a monthly content calendar for Instagram'],
      ia: ['I’d like to automate my monthly reports with AI', 'I want an AI agent to help with customer replies'],
      design: ['I need posters and banners for an event', 'I want a stand design for a trade fair']
    } : {
      branding: ['Necesito una identidad visual para mi marca de café', 'Quiero renovar el logo y la guía de marca de mi estudio'],
      uiux: ['Quiero rediseñar la web de mi empresa', 'Necesito un dashboard claro para los datos de mi negocio'],
      marketing: ['Busco una campaña de redes sociales para un lanzamiento', 'Necesito un calendario de contenidos mensual para Instagram'],
      ia: ['Me gustaría automatizar los informes mensuales con IA', 'Quiero un agente de IA que ayude a responder a clientes'],
      design: ['Necesito carteles y banners para un evento', 'Quiero el diseño de un stand para una feria']
    };
    var topics = Object.keys(EXAMPLES);
    var queue = [];
    topics.forEach(function (k) { queue.push(EXAMPLES[k][0]); });
    topics.forEach(function (k) { queue.push(EXAMPLES[k][1]); });
    var qi = 0, typingTimer = 0, paused = false;

    function setPh(text) { chatInput.setAttribute('placeholder', text); }

    // Escribe la frase letra a letra, espera, la borra y pasa a la siguiente
    function typeLoop(text) {
      clearTimeout(typingTimer);
      var n = 0, phase = 'type';
      (function tick() {
        if (paused) { typingTimer = setTimeout(tick, 400); return; }
        if (phase === 'type') {
          setPh(text.slice(0, ++n));
          if (n >= text.length) { phase = 'hold'; typingTimer = setTimeout(tick, 2200); return; }
          typingTimer = setTimeout(tick, 38 + Math.random() * 45);
        } else if (phase === 'hold') {
          phase = 'erase'; typingTimer = setTimeout(tick, 20);
        } else {
          setPh(text.slice(0, --n));
          if (n <= 0) { qi = (qi + 1) % queue.length; typingTimer = setTimeout(function () { typeLoop(queue[qi]); }, 350); return; }
          typingTimer = setTimeout(tick, 16);
        }
      })();
    }

    if (reduceMotion) {
      setPh(queue[0]);
    } else {
      typeLoop(queue[0]);
    }

    // Se detiene mientras el visitante escribe o tiene el foco en el campo
    chatInput.addEventListener('focus', function () { paused = true; });
    chatInput.addEventListener('blur', function () { paused = chatInput.value.length > 0; });
    chatInput.addEventListener('input', function () { paused = true; });

    // Las píldoras cambian el tema de los ejemplos
    document.querySelectorAll('.hc-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var topic = chip.getAttribute('data-topic');
        document.querySelectorAll('.hc-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        queue = EXAMPLES[topic].slice();
        qi = 0;
        if (!chatInput.value) { paused = false; reduceMotion ? setPh(queue[0]) : typeLoop(queue[0]); }
      });
    });
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

  // ─── Mano pixelada saludando (Sobre mí y portada) ───────────
  // Cada <canvas class="hand-field"> dibuja su propia mano; data-cell fija el tamaño del píxel
  document.querySelectorAll('.hand-field').forEach(initHand);

  function initHand(handCanvas) {
    if (!handCanvas.getContext) return;
    var hctx = handCanvas.getContext('2d');
    var HCELL = Number(handCanvas.getAttribute('data-cell')) || 7, HDOT = HCELL - 2;
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

  // ─── Portada: índice lateral de secciones ───────────────────
  var pageIndex = document.querySelector('.page-index');
  if (pageIndex) {
    var indexLinks = pageIndex.querySelectorAll('a');
    var indexTargets = [];
    indexLinks.forEach(function (link) {
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) indexTargets.push({ link: link, el: target });
    });
    // Marca como activa la última sección (en orden) que cruza el centro de la pantalla;
    // así funciona también con secciones anidadas (p. ej. Automatización dentro de Herramientas)
    var indexTicking = false;
    var updateIndex = function () {
      indexTicking = false;
      var mid = window.innerHeight * 0.5, active = null;
      indexTargets.forEach(function (item) {
        var r = item.el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) active = item;
      });
      if (window.scrollY < 80 && indexTargets.length) active = indexTargets[0]; // arriba del todo: siempre 01
      if (!active) return;
      indexTargets.forEach(function (item) { item.link.setAttribute('aria-current', String(item === active)); });
      // Sobre fondos oscuros el índice pasa a blanco
      pageIndex.classList.toggle('on-dark', pageIndex.hasAttribute('data-dark') || active.el.classList.contains('ia-teaser'));
    };
    window.addEventListener('scroll', function () {
      if (!indexTicking) { indexTicking = true; requestAnimationFrame(updateIndex); }
    }, { passive: true });
    window.addEventListener('resize', updateIndex);
    updateIndex();
  }

  // ─── Portada: botón volver arriba ───────────────────────────
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    var updateToTop = function () { toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight); };
    updateToTop();
    window.addEventListener('scroll', updateToTop, { passive: true });
  }

  // ─── Carruseles deslizables (flechas) ───────────────────────
  document.querySelectorAll('[data-carousel-prev], [data-carousel-next]').forEach(function (btn) {
    var track = document.getElementById(btn.getAttribute('data-carousel-prev') || btn.getAttribute('data-carousel-next'));
    if (!track) return;
    var dir = btn.hasAttribute('data-carousel-next') ? 1 : -1;
    btn.addEventListener('click', function () {
      var card = track.firstElementChild;
      var step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
      track.scrollBy({ left: dir * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    // Desactiva la flecha al llegar a cada extremo
    var sync = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      btn.disabled = dir < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max;
    };
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  // ─── Home: la terminal de IOI "teclea" al entrar en pantalla ─
  var ioiTerm = document.getElementById('ioi-term');
  if (ioiTerm && !reduceMotion && 'IntersectionObserver' in window) {
    ioiTerm.classList.add('is-ready');
    var termObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { ioiTerm.classList.add('is-typed'); termObs.disconnect(); }
    }, { threshold: 0.45 });
    termObs.observe(ioiTerm);
  }

  // ─── Servicios: demo de automatización con pestañas ─────────
  var autoDemo = document.getElementById('auto-demo');
  if (autoDemo) {
    var ICON = function (slug) { return 'url(https://cdn.jsdelivr.net/npm/simple-icons@16.35.0/icons/' + slug + '.svg)'; };
    var FLOWS = LANG === 'en' ? [
      { n: [['googleforms', 'Google Forms', '1 · a brief comes in'], ['n8n', 'n8n + Claude', '2 · summarizes and sorts it'], ['notion', 'Notion', '3 · creates the project card']],
        cap: 'Every incoming brief is summarized with AI and turned into a project card in Notion, with tasks and deadlines.' },
      { n: [['googlesheets', 'Google Sheets', '1 · campaign metrics'], ['n8n', 'n8n + ChatGPT', '2 · analyzes and writes'], ['gmail', 'Gmail', '3 · sends the report']],
        cap: 'Every Monday the campaign data is analyzed with AI and the client receives a clear report by email.' },
      { n: [['figma', 'Figma', '1 · design approved'], ['n8n', 'n8n + Gemini', '2 · writes the copy'], ['instagram', 'Instagram', '3 · schedules the post']],
        cap: 'When a design is approved, AI writes the copy for each channel and the post is left scheduled for review.' }
    ] : [
      { n: [['googleforms', 'Google Forms', '1 · llega un brief'], ['n8n', 'n8n + Claude', '2 · lo resume y clasifica'], ['notion', 'Notion', '3 · crea la ficha del proyecto']],
        cap: 'Cada brief que llega se resume con IA y se convierte en una ficha de proyecto en Notion, con tareas y plazos.' },
      { n: [['googlesheets', 'Google Sheets', '1 · métricas de la campaña'], ['n8n', 'n8n + ChatGPT', '2 · analiza y redacta'], ['gmail', 'Gmail', '3 · envía el informe']],
        cap: 'Cada lunes los datos de la campaña se analizan con IA y el cliente recibe un informe claro por email.' },
      { n: [['figma', 'Figma', '1 · diseño aprobado'], ['n8n', 'n8n + Gemini', '2 · escribe los copys'], ['instagram', 'Instagram', '3 · programa la publicación']],
        cap: 'Cuando se aprueba un diseño, la IA redacta los copys por canal y la publicación queda programada para revisar.' }
    ];
    var adNodes = autoDemo.querySelectorAll('.ad-node');
    var adFlow = autoDemo.querySelector('.ad-flow');
    var adCap = autoDemo.querySelector('.ad-caption');
    var adTabs = autoDemo.querySelectorAll('.ad-tab');

    adTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var f = FLOWS[Number(tab.getAttribute('data-flow'))];
        adTabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === tab)); });
        adFlow.classList.add('is-switching'); adCap.classList.add('is-switching');
        setTimeout(function () {
          adNodes.forEach(function (node, k) {
            node.querySelector('.ad-ico').style.setProperty('--logo', ICON(f.n[k][0]));
            node.querySelector('strong').textContent = f.n[k][1];
            node.querySelector('small').textContent = f.n[k][2];
          });
          adCap.querySelector('.ad-caption-text').textContent = f.cap;
          adFlow.classList.remove('is-switching'); adCap.classList.remove('is-switching');
        }, reduceMotion ? 0 : 200);
      });
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
        '<div class="deck-progress"><i></i>' + pixelSegments(16) + '</div></div>');
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

    // Barra de progreso por bloques: cada segmento se enciende en su turno
    function pixelSegments(n) {
      var html = '';
      for (var s = 0; s < n; s++) html += '<b style="--s:' + s + '"></b>';
      return html;
    }

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
