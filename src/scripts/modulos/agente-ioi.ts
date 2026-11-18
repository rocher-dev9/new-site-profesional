// ────────────────────────────────────────────────────────────────
// Cursor de IOI en todas las páginas: un colaborador al estilo multiplayer de Figma.
// Mientras el visitante mueve el ratón, IOI va detrás de su cursor con un poco de retraso.
// Si el ratón se queda quieto (o sale de la ventana), IOI recorre la sección donde está:
// va de un elemento a otro (titulares, etiquetas, botones, tarjetas…), se detiene y lo enmarca
// con una línea fina y cuatro marcas en las esquinas. No hace clic en nada.
// En la portada empieza en la cabecera, donde lo deja la intro del enjambre (intro-agentes.ts).
// Solo con ratón, en pantallas anchas (el CSS lo oculta por debajo) y sin «reducir movimiento».
// ────────────────────────────────────────────────────────────────
import { reduceMotion, finePointer, alRedimensionar } from '../utilidades';

const REPOSO = 2500;       // ms con el ratón quieto para empezar a recorrer la sección
const PARADA = 2300;       // ms que se queda mirando cada elemento
const DESFASE = { x: 22, y: 26 }; // dónde se coloca respecto al cursor del visitante
const SIGUE = 4.5;         // rapidez al seguir al ratón (más alto, menos retraso)
const VIAJA = 3.2;         // rapidez al ir de un elemento a otro
const MAX_OBJETIVOS = 6;   // elementos que revisa por sección antes de volver a mirar dónde está
// En la cabecera de la portada, un recorrido elegido a mano
const OBJETIVOS_CABECERA = ['.hero-title', '.hero-oficio', '.hero-actions .btn-primary', '.hc-area', '.hc-chips'];
// En el resto de secciones, cualquiera de estos (y las tarjetas: clases que acaban en «card»)
const SEL_OBJETIVOS = 'h1, h2, h3, .section-label, .eyebrow, .btn, .btn-link, figure, [class*="card"]';
const ES_TARJETA = /(^|-)card$/;
const ALTO_MENU = 76;      // franja superior que tapa el menú fijo

/** Punto donde aparece IOI en la cabecera de la portada (la intro del enjambre lo deja ahí). */
export function puntoInicioCabecera(): { x: number; y: number } | null {
  const cabecera = document.querySelector<HTMLElement>('.hero');
  const titulo = cabecera?.querySelector<HTMLElement>('.hero-title');
  if (!cabecera || !titulo) return null;
  const t = titulo.getBoundingClientRect(), c = cabecera.getBoundingClientRect();
  return { x: t.left + t.width * 0.8, y: c.top + Math.max(90, t.top - c.top - 70) };
}

type Estado = 'oculto' | 'sigue' | 'viaja' | 'mira';

export function iniciarAgenteIoi(): void {
  if (reduceMotion || !finePointer) return;

  const agente = document.createElement('div');
  agente.className = 'agente';
  agente.setAttribute('aria-hidden', 'true');
  agente.innerHTML =
    '<svg viewBox="0 0 100 100"><path d="M12 10 L90 36 L55 52 L40 90 Z" /></svg><span class="agente-tag">IOI</span>';
  const marco = document.createElement('div');
  marco.className = 'agente-marco';
  marco.setAttribute('aria-hidden', 'true');
  marco.innerHTML = '<i></i><i></i><i></i><i></i>';
  document.body.append(marco, agente);

  let estado: Estado = 'oculto';
  const pos = { x: 0, y: 0 };
  const raton = { x: -1, y: -1, dentro: false };
  let objetivos: HTMLElement[] = [];
  let actual: HTMLElement | null = null;
  let i = 0, timerReposo = 0, timerParada = 0, raf = 0, ultimo = 0;

  const colocar = () => { agente.style.transform = `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px)`; };
  const ocultarMarco = () => marco.classList.remove('visible');
  const enmarcar = (el: HTMLElement) => {
    const r = el.getBoundingClientRect(), M = 6; // margen del marco alrededor del elemento
    marco.style.transform = `translate(${Math.round(r.left - M)}px, ${Math.round(r.top - M)}px)`;
    marco.style.width = `${Math.round(r.width + M * 2)}px`;
    marco.style.height = `${Math.round(r.height + M * 2)}px`;
  };

  // ── Qué revisar: los elementos visibles de la sección bajo el ratón (o en el centro de la pantalla) ──
  const seccionActual = (): HTMLElement | null => {
    const x = raton.dentro ? raton.x : window.innerWidth / 2;
    const y = raton.dentro ? raton.y : window.innerHeight / 2;
    const el = document.elementFromPoint(x, y);
    const s = el?.closest<HTMLElement>('section, header, footer');
    if (s && !s.closest('.nav')) return s;
    return document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
      ?.closest<HTMLElement>('main section, main header, footer') ?? null;
  };
  const visible = (el: HTMLElement) => {
    const r = el.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    return r.width >= 20 && r.height >= 12 && r.width <= W * 0.7 && r.height <= H * 0.7
      && r.top >= ALTO_MENU && r.bottom <= H - 8 && r.left >= 0 && r.right <= W
      && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[aria-hidden="true"], .page-index, .nav');
  };
  const buscarObjetivos = (): HTMLElement[] => {
    const s = seccionActual();
    if (!s) return [];
    const lista = s.matches('.hero')
      ? OBJETIVOS_CABECERA.map((q) => s.querySelector<HTMLElement>(q)).filter((e): e is HTMLElement => !!e)
      : Array.from(s.querySelectorAll<HTMLElement>(SEL_OBJETIVOS))
        .filter((e) => !e.matches('[class*="card"]') || Array.from(e.classList).some((c) => ES_TARJETA.test(c)));
    return lista.filter(visible).slice(0, MAX_OBJETIVOS);
  };

  // Punto al que va IOI dentro de un elemento (hacia el centro, sin taparlo del todo)
  const puntoEn = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + Math.min(r.width * 0.55, 190), y: r.top + r.height * 0.6 };
  };
  const puntoTrasRaton = () => ({
    x: Math.min(Math.max(raton.x + DESFASE.x, 8), window.innerWidth - 80),
    y: Math.min(Math.max(raton.y + DESFASE.y, 8), window.innerHeight - 40),
  });

  // ── Bucle: solo corre mientras IOI se mueve; se despierta con el ratón y con el scroll ──
  const bucle = (ahora: number) => {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000) || 1 / 60;
    ultimo = ahora;
    let destino: { x: number; y: number } | null = null, rapidez = VIAJA;
    if (estado === 'sigue') { destino = puntoTrasRaton(); rapidez = SIGUE; }
    else if ((estado === 'viaja' || estado === 'mira') && actual) destino = puntoEn(actual);
    if (!destino) { raf = 0; return; }

    const k = 1 - Math.exp(-dt * rapidez);
    pos.x += (destino.x - pos.x) * k;
    pos.y += (destino.y - pos.y) * k;
    colocar();
    if (estado === 'mira' && actual) enmarcar(actual);

    const lejos = Math.hypot(destino.x - pos.x, destino.y - pos.y);
    if (estado === 'viaja' && lejos < 2 && actual) {
      // Ha llegado: enmarca el elemento, espera y pasa al siguiente
      estado = 'mira';
      enmarcar(actual);
      marco.classList.add('visible');
      timerParada = window.setTimeout(siguiente, PARADA);
    }
    if (lejos > 0.4) raf = requestAnimationFrame(bucle);
    else raf = 0;
  };
  const despertar = () => {
    if (raf) return;
    ultimo = performance.now();
    raf = requestAnimationFrame(bucle);
  };

  // ── Recorrido de la sección ──
  const siguiente = () => {
    clearTimeout(timerParada);
    if (estado === 'sigue' || estado === 'oculto') return;
    ocultarMarco();
    i++;
    if (i >= objetivos.length || !actual || !visible(objetivos[i])) { objetivos = buscarObjetivos(); i = 0; }
    actual = objetivos[i] ?? null;
    if (!actual) { estado = 'viaja'; timerParada = window.setTimeout(siguiente, PARADA); return; }
    estado = 'viaja';
    despertar();
  };
  const empezarRecorrido = () => {
    if (estado === 'oculto') return;
    objetivos = buscarObjetivos();
    i = -1;
    actual = null;
    estado = 'viaja';
    siguiente();
  };
  const esperarReposo = (ms = REPOSO) => {
    clearTimeout(timerReposo);
    timerReposo = window.setTimeout(empezarRecorrido, ms);
  };

  // ── El visitante manda: al mover el ratón, IOI deja lo que hace y le sigue ──
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    raton.x = e.clientX; raton.y = e.clientY; raton.dentro = true;
    if (estado === 'oculto') {
      // Primera aparición: entra desde un poco más lejos y se acerca
      pos.x = raton.x + DESFASE.x * 3; pos.y = raton.y + DESFASE.y * 3;
      colocar();
      agente.classList.add('visible');
    }
    if (estado !== 'sigue') {
      clearTimeout(timerParada);
      ocultarMarco();
      agente.classList.remove('espera');
      estado = 'sigue';
      actual = null;
    }
    esperarReposo();
    despertar();
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => {
    raton.dentro = false;
    if (estado === 'sigue') { agente.classList.add('espera'); esperarReposo(1200); }
  });
  window.addEventListener('scroll', () => { if (estado === 'mira' || estado === 'viaja') despertar(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) ocultarMarco(); else if (estado === 'mira') marco.classList.add('visible'); });
  alRedimensionar(() => { if (estado === 'mira' && actual) enmarcar(actual); });

  // En la portada, arriba del todo, aparece ya en la cabecera y empieza a revisarla
  const inicio = window.scrollY < 80 ? puntoInicioCabecera() : null;
  if (inicio) {
    pos.x = inicio.x; pos.y = inicio.y;
    colocar();
    agente.classList.add('visible');
    estado = 'sigue'; // hasta que empiece el recorrido, se queda quieto donde está
    raton.x = inicio.x - DESFASE.x; raton.y = inicio.y - DESFASE.y;
    esperarReposo(1200);
  }
}
