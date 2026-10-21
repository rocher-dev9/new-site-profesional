// ────────────────────────────────────────────────────────────────
// Utilidades comunes a todos los scripts de la web
// ────────────────────────────────────────────────────────────────

export type Lang = 'es' | 'en';

/** Idioma de la página (las versiones en inglés tienen lang="en"). */
export const LANG: Lang = document.documentElement.lang === 'en' ? 'en' : 'es';

/** Devuelve el texto en el idioma de la página. */
export function tr(es: string, en: string): string {
  return LANG === 'en' ? en : es;
}

/** El visitante ha pedido "reducir movimiento" en su sistema. */
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Ratón u otro puntero preciso con hover (no pantallas táctiles). */
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Ejecuta fn cuando la ventana termina de cambiar de tamaño (con un pequeño retardo). */
export function alRedimensionar(fn: () => void, retardo = 150): void {
  let timer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = window.setTimeout(fn, retardo);
  });
}

/** Ajusta un canvas a su tamaño en pantalla y a la densidad de píxeles (máx. 2×). */
export function ajustarCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): { w: number; h: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

/**
 * Animación con requestAnimationFrame que se pausa sola cuando el elemento sale de
 * pantalla o la pestaña se oculta. dibujar recibe el tiempo en ms; intervalo limita los fps.
 */
export function animarEnPantalla(elemento: Element, dibujar: (tiempo: number) => void, intervalo = 0): void {
  let enMarcha = false;
  let raf = 0;
  let ultimo = 0;
  let visible = true;

  const frame = (tiempo: number) => {
    if (!enMarcha) return;
    if (tiempo - ultimo > intervalo) { dibujar(tiempo); ultimo = tiempo; }
    raf = requestAnimationFrame(frame);
  };
  const iniciar = () => {
    if (enMarcha || reduceMotion) return;
    enMarcha = true;
    raf = requestAnimationFrame(frame);
  };
  const parar = () => { enMarcha = false; cancelAnimationFrame(raf); };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) iniciar(); else parar();
    }).observe(elemento);
  } else {
    iniciar();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !visible) parar(); else iniciar();
  });
}

/** Ejecuta fn una sola vez cuando el elemento entra en pantalla. */
export function alAparecer(elemento: Element, fn: () => void, umbral = 0): void {
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { fn(); obs.disconnect(); }
  }, { threshold: umbral });
  obs.observe(elemento);
}
