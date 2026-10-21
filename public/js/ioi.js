// ────────────────────────────────────────────────────────────────
// Roger Avellana — IOI, la criatura pixelada interactiva
// Módulo compartido: se usa en la página IOI (sobre la consola) y en la
// portada (sobre el panel del bloque IOI). Cada robot se declara en el HTML:
//   <div class="ioi-perch" data-ioi="lab|home">
//     <button class="ioi-bot"><canvas class="ioi-canvas" width="16" height="16"></canvas></button>
//     <p class="ioi-bubble" role="status" aria-live="polite"></p>
//     …contenido sobre el que se sienta…
//   </div>
// ────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'es';
  function tr(es, en) { return LANG === 'en' ? en : es; }

  // Frases según dónde esté IOI
  var PHRASES = {
    lab: LANG === 'en' ? [
      "Hi! I'm IOI, Roger's AI copilot.",
      'AI proposes; you decide.',
      'Shall we automate something today?',
      'Thinking in pixels…',
      'Psst… try moving your cursor.',
      'I never skip the human review step.'
    ] : [
      '¡Hola! Soy IOI, el copiloto de IA de Roger.',
      'La IA propone; tú decides.',
      '¿Automatizamos algo hoy?',
      'Pensando en píxeles…',
      'Psst… prueba a mover el cursor.',
      'Nunca me salto la revisión humana.'
    ],
    home: LANG === 'en' ? [
      "Hi! I'm IOI, Roger's AI copilot.",
      'Come to my section: I’ll show you how Roger works with AI.',
      'I’ve got workflows, agents and a console that writes by itself.',
      'Psst… click “Discover how I use AI”.',
      'AI proposes; Roger decides.'
    ] : [
      '¡Hola! Soy IOI, el copiloto de IA de Roger.',
      'Pasa a mi sección: te enseño cómo trabaja Roger con IA.',
      'Tengo flujos, agentes y una consola que escribe sola.',
      'Psst… haz clic en «Descubre cómo uso la IA».',
      'La IA propone; Roger decide.'
    ]
  };

  // Sprite 16×16. O contorno · H cuerpo claro · B cuerpo sombra · A brazos · F pantalla · S antena · L luz
  var BODY = [
    '.......LL.......',
    '.......SS.......',
    '...OOOOOOOOOO...',
    '..OHHHHHHHHHHO..',
    '..OHFFFFFFFFHO..',
    '..OHFFFFFFFFHO..',
    '..OHFFFFFFFFHO..',
    '..OHFFFFFFFFHO..',
    '..OBHHHHHHHHBO..',
    '...OOOOOOOOOO...',
    '....OBBHHBBO....',
    '..AAOBHHHHBOAA..',
    '..A.OBBHHBBO.A..',
    '....OOOOOOOO....',
    '.....OO..OO.....',
    '....OOO..OOO....'
  ];
  // Brazo derecho levantado (saludo)
  var WAVE = { 10: '....OBBHHBBO.A..', 11: '..AAOBHHHHBOA...', 12: '..A.OBBHHBBO....' };
  var COLORS = { O: '#2a2466', H: '#c6a8ff', B: '#8f88ff', A: '#8f88ff', F: '#15132a', S: '#8f88ff' };
  var EYE = '#8ff5d2';
  var LED = { idle: '#f7b98a', ready: '#3fbf8a', off: '#4a3a66' };

  function createIOI(perch) {
    var bot = perch.querySelector('.ioi-bot');
    var canvas = perch.querySelector('.ioi-canvas');
    var bubble = perch.querySelector('.ioi-bubble');
    if (!bot || !canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var phrases = PHRASES[perch.getAttribute('data-ioi')] || PHRASES.lab;
    var consoleBox = perch.querySelector('.ai-console'); // solo en la página IOI

    var look = { x: 0, y: 0 };
    var blinking = false, happy = false, waving = false, waveUp = false;
    var ledState = 'idle', ledBlink = false;

    function px(x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }

    function draw() {
      ctx.clearRect(0, 0, 16, 16);
      for (var y = 0; y < 16; y++) {
        var row = (waving && waveUp && WAVE[y]) ? WAVE[y] : BODY[y];
        for (var x = 0; x < 16; x++) {
          var ch = row[x];
          if (ch === 'L') px(x, y, ledBlink ? LED.off : LED[ledState]);
          else if (COLORS[ch]) px(x, y, COLORS[ch]);
        }
      }
      // Brillo en la cabeza
      px(4, 3, '#ece9ff'); px(5, 3, '#ece9ff');
      // Ojos (2×2) que miran hacia el cursor dentro de la pantalla
      var ex = look.x, ey = look.y;
      [5, 9].forEach(function (bx) {
        var x0 = bx + ex, y0 = 5 + ey;
        if (happy) {               // ojos contentos: ^ ^
          px(x0, y0 + 1, EYE); px(x0 + 1, y0, EYE);
        } else if (blinking) {     // parpadeo: una línea
          px(x0, y0 + 1, EYE); px(x0 + 1, y0 + 1, EYE);
        } else {
          px(x0, y0, EYE); px(x0 + 1, y0, EYE); px(x0, y0 + 1, EYE); px(x0 + 1, y0 + 1, EYE);
        }
      });
      if (happy) { px(7, 7 + Math.max(0, ey), '#f7b98a'); px(8, 7 + Math.max(0, ey), '#f7b98a'); } // sonrisa
    }

    // Los ojos siguen al cursor por toda la página
    window.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.35);
      var nx = Math.abs(dx) < 50 ? 0 : (dx > 0 ? 1 : -1);
      var ny = Math.abs(dy) < 50 ? 0 : (dy > 0 ? 1 : -1);
      if (nx !== look.x || ny !== look.y) { look.x = nx; look.y = ny; draw(); }
    }, { passive: true });

    // Parpadeo aleatorio
    (function scheduleBlink() {
      setTimeout(function () {
        blinking = true; draw();
        setTimeout(function () { blinking = false; draw(); scheduleBlink(); }, 140);
      }, 2200 + Math.random() * 3000);
    })();

    // Saludo con el brazo al pasar el ratón o con el foco del teclado
    var waveTimer = 0;
    function startWave() {
      if (waving) return;
      waving = true;
      waveTimer = setInterval(function () { waveUp = !waveUp; draw(); }, reduceMotion ? 600 : 260);
    }
    function stopWave() { waving = false; waveUp = false; clearInterval(waveTimer); draw(); }
    bot.addEventListener('pointerenter', startWave);
    bot.addEventListener('pointerleave', stopWave);
    bot.addEventListener('focus', startWave);
    bot.addEventListener('blur', stopWave);

    // Clic: salta, se pone contento y dice algo
    var phraseIndex = 0, bubbleTimer = 0, happyTimer = 0;
    function say(text) {
      if (!bubble) return;
      bubble.textContent = text;
      bubble.classList.add('is-visible');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(function () { bubble.classList.remove('is-visible'); }, 3000);
    }
    function sayNext() {
      say(phrases[phraseIndex]);
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }

    bot.addEventListener('click', function () {
      sayNext();
      happy = true; draw();
      clearTimeout(happyTimer);
      happyTimer = setTimeout(function () { happy = false; draw(); }, 1400);
      if (!reduceMotion) {
        bot.classList.remove('is-jumping');
        void bot.offsetWidth; // reinicia la animación
        bot.classList.add('is-jumping');
      }
    });
    bot.addEventListener('animationend', function (e) {
      if (e.animationName === 'ioi-jump') bot.classList.remove('is-jumping');
    });

    // En la página IOI, la antena refleja lo que hace la consola
    if (consoleBox && 'MutationObserver' in window) {
      var ledTimer = 0, lastLed = '';
      var syncLed = function () {
        var thinking = consoleBox.classList.contains('is-thinking');
        var status = consoleBox.querySelector('#console-status');
        var ready = status && status.textContent === tr('respuesta lista', 'response ready');
        var state = thinking ? 'thinking' : (ready ? 'ready' : 'idle');
        if (state === lastLed) return;   // solo reacciona a cambios de estado
        lastLed = state;
        clearInterval(ledTimer); ledBlink = false;
        if (thinking) {
          ledState = 'idle';
          if (!reduceMotion) ledTimer = setInterval(function () { ledBlink = !ledBlink; draw(); }, 180);
        } else {
          ledState = ready ? 'ready' : 'idle';
        }
        draw();
      };
      new MutationObserver(syncLed).observe(consoleBox, { attributes: true, attributeFilter: ['class'], subtree: true, childList: true, characterData: true });
      syncLed();
    } else {
      ledState = 'ready';
    }

    draw();

    // Saludo inicial: al cargar en la página IOI; al llegar con el scroll en la portada
    if (reduceMotion) return;
    if (perch.getAttribute('data-ioi') === 'home' && 'IntersectionObserver' in window) {
      var greeted = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { setTimeout(sayNext, 400); greeted.disconnect(); }
      }, { threshold: 0.6 });
      greeted.observe(bot);
    } else {
      setTimeout(sayNext, 1200);
    }
  }

  document.querySelectorAll('.ioi-perch').forEach(createIOI);
})();
