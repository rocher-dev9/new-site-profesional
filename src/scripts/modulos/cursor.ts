// ────────────────────────────────────────────────────────────────
// Cursor con estela de píxeles
// Punto que sigue al ratón, anillo cuadrado con retardo suave y una estela
// de 8 píxeles alineados a una cuadrícula de 4 px. Se usa en todas las páginas.
// Solo con ratón (pointer: fine) y sin "reducir movimiento". En campos de texto
// se mantiene el cursor nativo, y el bucle se detiene cuando el ratón está quieto.
// ────────────────────────────────────────────────────────────────
import { reduceMotion, finePointer } from '../utilidades';

const SEL_HOVER = 'a, button, [role="button"], label, summary, .project-card, .deck-card, .feature-card, .ai-tool, .ai-agent-type, .ioi-bot, [tabindex]:not([tabindex="-1"])';
const SEL_TEXTO = 'input, textarea, select, [contenteditable="true"]';
// Zonas oscuras donde el cursor pasa a ser claro
const SEL_OSCURO = '.theme-ai, .ia-teaser, .project-cover, .btn-primary, .ai-btn, .to-top, .case-back-float, .case-quote, .cg-type';
const ESTELA = 8;

export function iniciarCursor(): void {
  if (!finePointer || reduceMotion) return;
  const root = document.documentElement;

  const crear = (clase: string) => {
    const el = document.createElement('div');
    el.className = clase;
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  };

  const punto = crear('cursor-dot');
  const anillo = crear('cursor-ring');
  const estela = Array.from({ length: ESTELA }, (_, i) => {
    const el = crear('cursor-trail');
    el.style.setProperty('--trail-o', String(0.45 * (1 - i / ESTELA)));
    return { el, x: -100, y: -100 };
  });
  root.classList.add('has-cursor');

  const puntero = { x: -100, y: -100 };
  const posAnillo = { x: -100, y: -100 };
  let enMarcha = false;

  const bucle = () => {
    punto.style.transform = `translate3d(${puntero.x}px,${puntero.y}px,0)`;
    posAnillo.x += (puntero.x - posAnillo.x) * 0.2;
    posAnillo.y += (puntero.y - posAnillo.y) * 0.2;
    anillo.style.transform = `translate3d(${posAnillo.x}px,${posAnillo.y}px,0)`;

    let lx = puntero.x, ly = puntero.y;
    let moviendo = Math.abs(puntero.x - posAnillo.x) + Math.abs(puntero.y - posAnillo.y) > 0.3;
    for (const p of estela) {
      p.x += (lx - p.x) * 0.35;
      p.y += (ly - p.y) * 0.35;
      // Encaja cada píxel de la estela en una cuadrícula de 4 px
      p.el.style.transform = `translate3d(${Math.round(p.x / 4) * 4}px,${Math.round(p.y / 4) * 4}px,0)`;
      if (Math.abs(lx - p.x) + Math.abs(ly - p.y) > 0.3) moviendo = true;
      lx = p.x; ly = p.y;
    }

    // Se detiene cuando todo ha alcanzado al ratón; se reanuda al moverlo
    if (moviendo) requestAnimationFrame(bucle);
    else enMarcha = false;
  };
  const despertar = () => { if (!enMarcha) { enMarcha = true; requestAnimationFrame(bucle); } };

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    puntero.x = e.clientX; puntero.y = e.clientY;
    const objetivo = e.target instanceof Element ? e.target : null;
    root.classList.add('cursor-visible');
    root.classList.toggle('cursor-text', !!objetivo?.closest(SEL_TEXTO));
    root.classList.toggle('cursor-light', !!objetivo?.closest(SEL_OSCURO));
    anillo.classList.toggle('is-hover', !!objetivo?.closest(SEL_HOVER));
    despertar();
  }, { passive: true });

  document.addEventListener('mouseleave', () => root.classList.remove('cursor-visible'));
  document.addEventListener('pointerdown', () => anillo.classList.add('is-down'));
  document.addEventListener('pointerup', () => anillo.classList.remove('is-down'));
  // Al cambiar de pestaña o perder el foco de la ventana se oculta
  window.addEventListener('blur', () => root.classList.remove('cursor-visible'));
}
