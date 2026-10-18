// ────────────────────────────────────────────────────────────────
// Roger Avellana — Cursor con estela de píxeles
// Punto que sigue al ratón, anillo cuadrado con retardo suave y una estela
// de 8 píxeles alineados a una cuadrícula de 4 px. Se usa en todas las páginas.
// Solo con ratón (pointer: fine) y sin "reducir movimiento". En campos de texto
// se mantiene el cursor nativo, y el bucle se detiene cuando el ratón está quieto.
// ────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduceMotion) return;

  var root = document.documentElement;
  var HOVER_SEL = 'a, button, [role="button"], label, summary, .project-card, .deck-card, .feature-card, .ai-tool, .ai-agent-type, .ioi-bot, [tabindex]:not([tabindex="-1"])';
  var TEXT_SEL = 'input, textarea, select, [contenteditable="true"]';
  // Zonas oscuras donde el cursor pasa a ser claro
  var DARK_SEL = '.theme-ai, .ia-teaser, .project-cover, .btn-primary, .ai-btn, .to-top';

  function make(cls) {
    var el = document.createElement('div');
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  }

  var dot = make('cursor-dot');
  var ring = make('cursor-ring');
  var TRAIL = 8;
  var trail = [];
  for (var i = 0; i < TRAIL; i++) {
    var t = make('cursor-trail');
    t.style.setProperty('--trail-o', String(0.45 * (1 - i / TRAIL)));
    trail.push({ el: t, x: -100, y: -100 });
  }
  root.classList.add('has-cursor');

  var pointer = { x: -100, y: -100 };
  var ringPos = { x: -100, y: -100 };
  var running = false;

  function loop() {
    dot.style.transform = 'translate3d(' + pointer.x + 'px,' + pointer.y + 'px,0)';
    ringPos.x += (pointer.x - ringPos.x) * 0.2;
    ringPos.y += (pointer.y - ringPos.y) * 0.2;
    ring.style.transform = 'translate3d(' + ringPos.x + 'px,' + ringPos.y + 'px,0)';

    var lx = pointer.x, ly = pointer.y, moving = Math.abs(pointer.x - ringPos.x) + Math.abs(pointer.y - ringPos.y) > 0.3;
    trail.forEach(function (p) {
      p.x += (lx - p.x) * 0.35;
      p.y += (ly - p.y) * 0.35;
      // Encaja cada píxel de la estela en una cuadrícula de 4 px
      p.el.style.transform = 'translate3d(' + Math.round(p.x / 4) * 4 + 'px,' + Math.round(p.y / 4) * 4 + 'px,0)';
      if (Math.abs(lx - p.x) + Math.abs(ly - p.y) > 0.3) moving = true;
      lx = p.x; ly = p.y;
    });

    // Se detiene cuando todo ha alcanzado al ratón; se reanuda al moverlo
    if (moving) requestAnimationFrame(loop);
    else running = false;
  }

  function wake() {
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    pointer.x = e.clientX; pointer.y = e.clientY;
    var target = e.target instanceof Element ? e.target : null;
    root.classList.add('cursor-visible');
    root.classList.toggle('cursor-text', !!(target && target.closest(TEXT_SEL)));
    root.classList.toggle('cursor-light', !!(target && target.closest(DARK_SEL)));
    ring.classList.toggle('is-hover', !!(target && target.closest(HOVER_SEL)));
    wake();
  }, { passive: true });

  document.addEventListener('mouseleave', function () { root.classList.remove('cursor-visible'); });
  document.addEventListener('pointerdown', function () { ring.classList.add('is-down'); });
  document.addEventListener('pointerup', function () { ring.classList.remove('is-down'); });
  // Al cambiar de pestaña o perder el foco de la ventana se oculta
  window.addEventListener('blur', function () { root.classList.remove('cursor-visible'); });
})();
