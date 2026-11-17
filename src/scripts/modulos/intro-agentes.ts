// ────────────────────────────────────────────────────────────────
// Portada: intro con un enjambre de agentes de IA (cursores multiplayer) que «montan» la cabecera.
// La página real está debajo desde el primer momento: el enjambre se dibuja en un <canvas> fijo
// por encima que no captura clics, así que no afecta al LCP ni al SEO.
//   1. Entrada: los cursores llegan en bandadas desde los bordes (boids).
//   2. Montaje: unos trazan el contorno de los bloques, «Copy» selecciona el nombre letra a letra
//      y «Agente 07» arrastra la ventana del chat hasta su sitio.
//   3. Salida: los contornos se funden con la página y el enjambre sale de pantalla. Solo se
//      queda IOI, justo donde empieza su recorrido por la cabecera (agente-cabecera.ts).
// Solo la primera vez en la sesión, con ratón, en pantallas anchas y sin «reducir movimiento».
// Se salta con el botón o con Esc. Para verla otra vez: añadir ?intro a la URL.
// ────────────────────────────────────────────────────────────────
import { reduceMotion, finePointer, tr } from '../utilidades';

/** Ajustes de la intro. Los colores son tokens de global.css (cambian solos en modo oscuro). */
export const INTRO = {
  activa: true,                 // false: la portada se muestra siempre sin intro
  agentes: 34,                  // total de cursores: los que tienen papel y el resto, sin etiqueta
  fases: { entrada: 650, montaje: 1150, salida: 500 }, // ms de cada fase
  velocidad: 1,                 // multiplica la velocidad de vuelo del enjambre
  anchoMin: 961,                // por debajo (y en pantallas táctiles) no hay intro
  claveSesion: 'intro-agentes', // marca en sessionStorage: ya vista en esta sesión
  colorEnjambre: '--indigo',    // cursores sin etiqueta (con opacidad variable)
  etiquetas: {
    layout:   { es: 'Layout',    en: 'Layout',   color: '--indigo' },
    copy:     { es: 'Copy',      en: 'Copy',     color: '--orange' },
    research: { es: 'Research',  en: 'Research', color: '--green' },
    arrastre: { es: 'Agente 07', en: 'Agent 07', color: '--ink-solid' },
    ioi:      { es: 'IOI',       en: 'IOI',      color: '--indigo' },
  },
};

// Qué hace cada cursor con papel, sobre qué elemento y en qué tramo del montaje (0–1)
type Papel = 'libre' | 'trazo' | 'texto' | 'arrastre' | 'ioi';
const TAREAS: { papel: Papel; sel: string; etiqueta?: keyof typeof INTRO.etiquetas; desde: number; hasta: number }[] = [
  { papel: 'trazo', sel: '.hero-title', etiqueta: 'layout', desde: 0, hasta: 0.75 },
  { papel: 'texto', sel: '.hero-hola em', etiqueta: 'copy', desde: 0.1, hasta: 0.8 },
  { papel: 'trazo', sel: '.hero-sub', etiqueta: 'research', desde: 0.15, hasta: 0.9 },
  { papel: 'arrastre', sel: '.hero-win', etiqueta: 'arrastre', desde: 0, hasta: 0.85 },
  { papel: 'ioi', sel: '.hero-actions', etiqueta: 'ioi', desde: 0.25, hasta: 1 },
  { papel: 'trazo', sel: '.hero-oficio', desde: 0.1, hasta: 0.7 },
  { papel: 'trazo', sel: '.hc-chips', desde: 0.2, hasta: 0.95 },
];

const MARGEN = 6;                       // separación del contorno alrededor de cada bloque
const DESPLAZA_VENTANA = { x: 110, y: 150 }; // de dónde arrastra «Agente 07» la ventana
const FLECHA = 'M12 10 L90 36 L55 52 L40 90 Z'; // la misma flecha que el cursor de IOI (viewBox 100)

interface Agente {
  x: number; y: number; vx: number; vy: number;
  papel: Papel; el?: HTMLElement; desde: number; hasta: number;
  etiqueta?: string; color: string; alfa: number; escala: number;
}
interface Caja { x: number; y: number; w: number; h: number }

const caja = (el: Element, m = 0): Caja => {
  const r = el.getBoundingClientRect();
  return { x: r.left - m, y: r.top - m, w: r.width + m * 2, h: r.height + m * 2 };
};
const suave = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const limita = (t: number) => Math.min(1, Math.max(0, t));
const escalones = (a: number) => Math.ceil(a * 4) / 4; // fundidos en 4 pasos, como el resto de la web

/** Punto a una fracción p del contorno (desde la esquina superior izquierda, en el sentido del reloj). */
function puntoContorno(c: Caja, p: number): { x: number; y: number } {
  let d = limita(p) * 2 * (c.w + c.h);
  if (d <= c.w) return { x: c.x + d, y: c.y };
  d -= c.w;
  if (d <= c.h) return { x: c.x + c.w, y: c.y + d };
  d -= c.h;
  if (d <= c.w) return { x: c.x + c.w - d, y: c.y + c.h };
  d -= c.w;
  return { x: c.x, y: c.y + c.h - d };
}

function yaVista(): boolean {
  if (/[?&]intro\b/.test(location.search)) return false;
  try { return sessionStorage.getItem(INTRO.claveSesion) === '1'; }
  catch { return true; } // sin almacenamiento no se puede recordar: mejor no repetirla en cada visita
}

/**
 * Lanza la intro si toca y llama a alTerminar al acabar (o enseguida, si no se muestra).
 * alTerminar arranca el cursor de IOI de la cabecera, que toma el relevo.
 */
export function iniciarIntroAgentes(alTerminar: () => void): void {
  const cabecera = document.querySelector<HTMLElement>('.hero');
  if (!INTRO.activa || !cabecera || reduceMotion || !finePointer || window.innerWidth < INTRO.anchoMin
    || window.scrollY > 80 || document.hidden || yaVista()) { alTerminar(); return; }
  const titulo = cabecera.querySelector<HTMLElement>('.hero-title');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx || !titulo) { alTerminar(); return; }
  try { sessionStorage.setItem(INTRO.claveSesion, '1'); } catch { /* sin almacenamiento */ }

  // Colores y tipografía de los tokens actuales (modo claro u oscuro)
  const css = getComputedStyle(document.documentElement);
  const token = (n: string) => css.getPropertyValue(n).trim() || '#5850ec';
  const superficie = token('--surface');
  const indigo = token('--indigo');
  const mono = css.getPropertyValue('--mono').trim() || 'monospace';

  canvas.className = 'intro-agentes';
  canvas.setAttribute('aria-hidden', 'true');
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn intro-saltar';
  boton.innerHTML = `${tr('Saltar intro', 'Skip intro')} <kbd>Esc</kbd>`;
  document.body.append(canvas, boton);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const { entrada, montaje, salida } = INTRO.fases;
  const total = entrada + montaje + salida;
  const vMax = 620 * INTRO.velocidad;     // px/s
  const fMax = 1900 * INTRO.velocidad;    // px/s²
  const flecha = new Path2D(FLECHA);

  // ── Enjambre: cursores con papel primero y el resto sin etiqueta ──
  const centro = { x: W / 2, y: H / 2 };
  const bordeCercano = (x: number, y: number) => {
    const d = [x, y, W - x, H - y];
    return d.indexOf(Math.min(...d)); // 0 izquierda, 1 arriba, 2 derecha, 3 abajo
  };
  // Cada bandada entra por un borde, en un punto al azar de ese borde
  const bandadas = [0, 1, 2, 3].map((borde) => {
    const a = 0.2 + Math.random() * 0.6;
    const p = [{ x: -40, y: H * a }, { x: W * a, y: -40 }, { x: W + 40, y: H * a }, { x: W * a, y: H + 40 }][borde];
    return { ...p, borde };
  });
  const nacer = (borde: number): Pick<Agente, 'x' | 'y' | 'vx' | 'vy'> => {
    const b = bandadas[borde];
    const x = b.x + (Math.random() - 0.5) * 90, y = b.y + (Math.random() - 0.5) * 90;
    const dx = centro.x - x, dy = centro.y - y, d = Math.hypot(dx, dy) || 1;
    return { x, y, vx: (dx / d) * vMax * 0.7, vy: (dy / d) * vMax * 0.7 };
  };

  const agentes: Agente[] = [];
  for (const t of TAREAS) {
    const el = cabecera.querySelector<HTMLElement>(t.sel);
    if (!el) continue;
    const c = caja(el);
    const etq = t.etiqueta ? INTRO.etiquetas[t.etiqueta] : undefined;
    agentes.push({
      ...nacer(bordeCercano(c.x + c.w / 2, c.y + c.h / 2)),
      papel: t.papel, el, desde: t.desde, hasta: t.hasta,
      etiqueta: etq ? tr(etq.es, etq.en) : undefined,
      color: token(etq?.color ?? INTRO.colorEnjambre), alfa: etq ? 1 : 0.75, escala: 1,
    });
  }
  const colorLibre = token(INTRO.colorEnjambre);
  while (agentes.length < INTRO.agentes) {
    agentes.push({
      ...nacer(agentes.length % 4), papel: 'libre', desde: 0, hasta: 1,
      color: colorLibre, alfa: 0.3 + Math.random() * 0.5, escala: 0.75 + Math.random() * 0.25,
    });
  }

  // Punto donde aparece el cursor de IOI de la cabecera (mismo cálculo que agente-cabecera.ts)
  const relevo = () => {
    const t = caja(titulo), c = caja(cabecera);
    return { x: t.x + t.w * 0.8, y: c.y + Math.max(90, t.y - c.y - 70) };
  };
  // Zona que ronda el enjambre libre: va pasando por los bloques de la cabecera
  const bloques = agentes.filter((a) => a.el).map((a) => a.el as HTMLElement);
  const atractor = (t: number) => {
    const c = caja(bloques[Math.floor(t / 420) % bloques.length]);
    return { x: c.x + c.w / 2, y: c.y + c.h / 2 };
  };

  // Rectángulos de cada letra del nombre (para la selección de «Copy»)
  const letras = (el: HTMLElement): DOMRect[] => {
    const nodo = el.firstChild;
    if (!nodo || nodo.nodeType !== Node.TEXT_NODE) return [];
    const r = document.createRange(), out: DOMRect[] = [];
    for (let i = 0; i < (nodo.textContent?.length ?? 0); i++) {
      r.setStart(nodo, i); r.setEnd(nodo, i + 1);
      out.push(r.getBoundingClientRect());
    }
    return out;
  };

  // Posición de la ventana fantasma que arrastra «Agente 07» (p: 0–1 de su tramo)
  const ventana = (el: HTMLElement, p: number): Caja => {
    const c = caja(el), k = 1 - suave(p);
    return { x: c.x + DESPLAZA_VENTANA.x * k, y: c.y + DESPLAZA_VENTANA.y * k, w: c.w, h: c.h };
  };

  // Hacia dónde debe ir cada cursor con papel y si ya sigue su trayectoria al pie de la letra
  const objetivo = (a: Agente, t: number): { x: number; y: number; fijo: boolean } | null => {
    if (!a.el) return null;
    const pm = limita((t - entrada) / montaje);
    const p = limita((pm - a.desde) / (a.hasta - a.desde));
    const enTramo = t >= entrada && pm >= a.desde;
    if (a.papel === 'trazo' || a.papel === 'ioi') {
      const pt = puntoContorno(caja(a.el, MARGEN), suave(p));
      return { ...pt, fijo: enTramo && p < 1 };
    }
    if (a.papel === 'texto') {
      const ls = letras(a.el);
      if (!ls.length) return null;
      const r = ls[Math.min(ls.length - 1, Math.floor(p * ls.length))];
      return { x: (p > 0 ? r.right : r.left) + 2, y: r.bottom - 6, fijo: enTramo && p < 1 };
    }
    if (a.papel === 'arrastre') {
      const v = ventana(a.el, p);
      return { x: v.x + 26, y: v.y + 12, fijo: enTramo };
    }
    return null;
  };

  // ── Física: boids (separación, alineación, cohesión) más la atracción hacia su objetivo ──
  const fuerza = (fx: number, fy: number, max: number) => {
    const m = Math.hypot(fx, fy);
    return m > max ? { x: (fx / m) * max, y: (fy / m) * max } : { x: fx, y: fy };
  };
  const buscar = (a: Agente, tx: number, ty: number, v: number) => {
    const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy) || 1;
    const vel = d < 90 ? v * (d / 90) : v; // frena al llegar
    return { x: (dx / d) * vel - a.vx, y: (dy / d) * vel - a.vy };
  };

  const mover = (t: number, dt: number) => {
    const saliendo = t >= entrada + montaje;
    const at = atractor(t);
    for (const a of agentes) {
      const obj = !saliendo ? objetivo(a, t) : null;
      // Siguiendo su trayectoria: va pegado a ella (sin esperar a que la física lo lleve)
      if (obj?.fijo) {
        const k = Math.min(1, dt * 16);
        const nx = a.x + (obj.x - a.x) * k, ny = a.y + (obj.y - a.y) * k;
        a.vx = (nx - a.x) / dt; a.vy = (ny - a.y) / dt;
        a.x = nx; a.y = ny;
        continue;
      }
      let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, ns = 0, nv = 0;
      for (const b of agentes) {
        if (b === a) continue;
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 42 * 42 && d2 > 0) { const d = Math.sqrt(d2); sx += dx / d / d; sy += dy / d / d; ns++; }
        if (d2 < 85 * 85) { ax += b.vx; ay += b.vy; cx += b.x; cy += b.y; nv++; }
      }
      let fx = 0, fy = 0;
      if (ns) { const s = fuerza(sx * 14000, sy * 14000, fMax); fx += s.x * 2; fy += s.y * 2; }
      if (nv) {
        const al = fuerza(ax / nv - a.vx, ay / nv - a.vy, fMax);
        const co = buscar(a, cx / nv, cy / nv, vMax);
        fx += al.x * 0.7 + co.x * 0.5; fy += al.y * 0.7 + co.y * 0.5;
      }
      // Destino: su objetivo, el atractor, la salida o (IOI) el punto de relevo
      let dest: { x: number; y: number }, peso = 1.4, v = vMax;
      if (saliendo && a.papel === 'ioi') { dest = relevo(); peso = 3; }
      else if (saliendo) {
        const dx = a.x - centro.x, dy = a.y - centro.y, d = Math.hypot(dx, dy) || 1;
        dest = { x: a.x + (dx / d) * W, y: a.y + (dy / d) * W }; v = vMax * 1.6; peso = 2;
      } else if (obj) { dest = obj; peso = 2.4; v = vMax * 1.5; }
      else dest = at;
      const s = buscar(a, dest.x, dest.y, v);
      fx += s.x * peso; fy += s.y * peso;

      const f = fuerza(fx, fy, fMax * 2);
      a.vx += f.x * dt; a.vy += f.y * dt;
      const vel = Math.hypot(a.vx, a.vy), tope = v * 1.1;
      if (vel > tope) { a.vx = (a.vx / vel) * tope; a.vy = (a.vy / vel) * tope; }
      a.x += a.vx * dt; a.y += a.vy * dt;
    }
  };

  // ── Dibujo ──
  const rectRedondo = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  };
  const contorno = (c: Caja, p: number, color: string, alfa: number) => {
    if (p <= 0 || alfa <= 0) return;
    const x = Math.round(c.x) + 0.5, y = Math.round(c.y) + 0.5, w = Math.round(c.w), h = Math.round(c.h);
    const r: Caja = { x, y, w, h };
    ctx.globalAlpha = alfa;
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const esquinas = [[x + w, y], [x + w, y + h], [x, y + h], [x, y]];
    const largo = 2 * (w + h);
    let hecho = 0;
    for (let i = 0; i < 4; i++) {
      const tramo = i % 2 === 0 ? w : h;
      if ((hecho + tramo) / largo <= p) { ctx.lineTo(esquinas[i][0], esquinas[i][1]); hecho += tramo; }
      else { const pt = puntoContorno(r, p); ctx.lineTo(pt.x, pt.y); break; }
    }
    ctx.stroke();
    // Marcas pixel en las esquinas ya trazadas (como el marco del cursor de IOI)
    ctx.fillStyle = color;
    const marcas = [[x, y], ...esquinas.slice(0, 3)];
    marcas.forEach(([mx, my], i) => {
      const umbral = [0, w, w + h, 2 * w + h][i] / largo;
      if (p >= umbral) ctx.fillRect(Math.round(mx) - 3, Math.round(my) - 3, 5, 5);
    });
  };
  const cursor = (a: Agente) => {
    const x = Math.round(a.x), y = Math.round(a.y);
    ctx.globalAlpha = a.alfa;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.2 * a.escala, 0.2 * a.escala);
    ctx.lineWidth = 8; ctx.lineJoin = 'round';
    ctx.strokeStyle = superficie; ctx.stroke(flecha);
    ctx.fillStyle = a.color; ctx.fill(flecha);
    ctx.restore();
    if (!a.etiqueta) return;
    ctx.font = `500 10.5px ${mono}`;
    const tw = ctx.measureText(a.etiqueta).width;
    rectRedondo(x + 15, y + 15, Math.ceil(tw) + 14, 17, 2);
    ctx.fillStyle = a.color; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
    ctx.fillText(a.etiqueta, x + 22, y + 24);
  };

  const dibujar = (t: number) => {
    ctx.clearRect(0, 0, W, H);
    const pm = limita((t - entrada) / montaje);
    const fundido = escalones(1 - limita((t - entrada - montaje) / salida));
    for (const a of agentes) {
      if (!a.el) continue;
      const p = limita((pm - a.desde) / (a.hasta - a.desde));
      if (p <= 0) continue;
      if (a.papel === 'trazo' || a.papel === 'ioi') {
        contorno(caja(a.el, MARGEN), suave(p), a.papel === 'ioi' ? indigo : a.color, fundido * (a.etiqueta ? 1 : 0.6));
      } else if (a.papel === 'texto') {
        // Selección del nombre letra a letra, con el caret de «Copy» al final
        const ls = letras(a.el);
        const n = Math.ceil(p * ls.length);
        if (!n) continue;
        const ini = ls[0], fin = ls[n - 1];
        ctx.globalAlpha = 0.22 * fundido; ctx.fillStyle = a.color;
        ctx.fillRect(Math.round(ini.left), Math.round(ini.top), Math.round(fin.right - ini.left), Math.round(ini.height));
        ctx.globalAlpha = fundido;
        ctx.fillRect(Math.round(fin.right), Math.round(ini.top), 2, Math.round(ini.height));
      } else if (a.papel === 'arrastre') {
        // Ventana fantasma que se posa sobre la ventana real del chat
        const v = ventana(a.el, p);
        ctx.globalAlpha = Math.min(1, p * 4) * fundido;
        rectRedondo(Math.round(v.x) + 0.5, Math.round(v.y) + 0.5, Math.round(v.w), Math.round(v.h), 4);
        ctx.fillStyle = superficie; ctx.globalAlpha *= 0.55; ctx.fill();
        ctx.globalAlpha = Math.min(1, p * 4) * fundido;
        ctx.strokeStyle = indigo; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(Math.round(v.x) + 0.5, Math.round(v.y) + 34.5);
        ctx.lineTo(Math.round(v.x + v.w) + 0.5, Math.round(v.y) + 34.5);
        ctx.stroke();
      }
    }
    // Primero el enjambre y encima los que llevan etiqueta
    for (const a of agentes) if (!a.etiqueta) cursor(a);
    for (const a of agentes) if (a.etiqueta) cursor(a);
    ctx.globalAlpha = 1;
  };

  // ── Bucle y limpieza ──
  let raf = 0, inicio = 0, ultimo = 0, terminado = false;
  // Por si el navegador deja de dar fotogramas (pestaña en segundo plano, ventana tapada…)
  const seguro = window.setTimeout(() => terminar(), total + 1500);
  const terminar = () => {
    if (terminado) return;
    terminado = true;
    cancelAnimationFrame(raf);
    clearTimeout(seguro);
    document.removeEventListener('keydown', alTeclear);
    document.removeEventListener('visibilitychange', alOcultar);
    window.removeEventListener('resize', terminar);
    canvas.remove();
    boton.remove();
    alTerminar();
  };
  const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') terminar(); };
  const alOcultar = () => { if (document.hidden) terminar(); };
  document.addEventListener('keydown', alTeclear);
  document.addEventListener('visibilitychange', alOcultar);
  window.addEventListener('resize', terminar);
  boton.addEventListener('click', terminar);

  const frame = (ahora: number) => {
    if (!inicio) { inicio = ultimo = ahora; }
    const t = ahora - inicio;
    if (t >= total) { terminar(); return; }
    const dt = Math.min(0.05, (ahora - ultimo) / 1000) || 1 / 60;
    ultimo = ahora;
    if (t >= entrada + montaje) boton.classList.add('saliendo');
    mover(t, dt);
    dibujar(t);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}
