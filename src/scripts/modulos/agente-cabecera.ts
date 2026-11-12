// Portada: cursor de IOI que recorre la cabecera como un agente de IA revisando la página.
// Va de un elemento a otro (titular, línea de oficio, botón principal, chat y temas), se detiene
// y lo enmarca con una línea fina y cuatro marcas en las esquinas. No hace clic en nada.
// Solo con ratón, en pantallas anchas y sin «reducir movimiento». Se queda quieto mientras el
// visitante mueve su ratón por la cabecera, y cuando la cabecera sale de pantalla.
import { reduceMotion, finePointer, alRedimensionar } from '../utilidades';

const OBJETIVOS = ['.hero-title', '.hero-oficio', '.hero-actions .btn-primary', '.hc-area', '.hc-chips'];
const VIAJE = 1400;     // ms que tarda en llegar (igual que la transición del CSS)
const PARADA = 2300;    // ms que se queda mirando
const REANUDAR = 2500;  // ms sin mover el ratón para volver a moverse
const ANCHO_MIN = 961;  // por debajo, la cabecera pasa a una columna y el agente no sale

export function iniciarAgenteCabecera(): void {
  const cabecera = document.querySelector<HTMLElement>('.hero');
  if (!cabecera || reduceMotion || !finePointer) return;
  const objetivos = OBJETIVOS
    .map((s) => cabecera.querySelector<HTMLElement>(s))
    .filter((el): el is HTMLElement => !!el);
  if (objetivos.length < 2) return;

  const agente = document.createElement('div');
  agente.className = 'agente';
  agente.setAttribute('aria-hidden', 'true');
  agente.innerHTML =
    '<svg viewBox="0 0 100 100"><path d="M12 10 L90 36 L55 52 L40 90 Z" /></svg><span class="agente-tag">IOI</span>';
  const marco = document.createElement('div');
  marco.className = 'agente-marco';
  marco.setAttribute('aria-hidden', 'true');
  marco.innerHTML = '<i></i><i></i><i></i><i></i>';
  cabecera.append(marco, agente);

  let i = 0, timer = 0, reanudar = 0;
  let visible = true, pausado = false;
  const ancho = () => window.innerWidth >= ANCHO_MIN;

  // Posición de un elemento dentro de la cabecera
  const caja = (el: HTMLElement) => {
    const r = el.getBoundingClientRect(), c = cabecera.getBoundingClientRect();
    return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
  };
  const mover = (x: number, y: number) => { agente.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; };
  const enmarcar = (el: HTMLElement) => {
    const b = caja(el), M = 6; // margen del marco alrededor del elemento
    marco.style.transform = `translate(${Math.round(b.x - M)}px, ${Math.round(b.y - M)}px)`;
    marco.style.width = `${Math.round(b.w + M * 2)}px`;
    marco.style.height = `${Math.round(b.h + M * 2)}px`;
    marco.classList.add('visible');
  };

  const paso = () => {
    clearTimeout(timer);
    if (!visible || pausado || !ancho()) { timer = window.setTimeout(paso, 600); return; }
    const el = objetivos[i];
    const b = caja(el);
    marco.classList.remove('visible');
    mover(b.x + Math.min(b.w * 0.55, 190), b.y + b.h * 0.6);
    timer = window.setTimeout(() => {
      if (pausado || !visible) { paso(); return; }
      enmarcar(el);
      timer = window.setTimeout(() => { i = (i + 1) % objetivos.length; paso(); }, PARADA);
    }, VIAJE + 60);
  };

  // Aparece ya colocado junto a la esquina superior del texto (sin animar ese primer salto)
  const inicio = caja(objetivos[0]);
  agente.style.transition = 'none';
  mover(inicio.x + inicio.w * 0.8, Math.max(90, inicio.y - 70));
  void agente.offsetWidth; // aplica la posición antes de devolver la transición
  agente.style.transition = '';
  agente.classList.add('visible');
  timer = window.setTimeout(paso, 1200);

  // El visitante manda: mientras mueve su ratón por la cabecera, IOI espera
  cabecera.addEventListener('pointermove', () => {
    pausado = true;
    marco.classList.remove('visible');
    agente.classList.add('espera');
    clearTimeout(reanudar);
    reanudar = window.setTimeout(() => { pausado = false; agente.classList.remove('espera'); }, REANUDAR);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.3 }).observe(cabecera);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) marco.classList.remove('visible'); });
  alRedimensionar(() => { marco.classList.remove('visible'); });
}
