// Trabajo: baraja de proyectos de la cabecera (se construye a partir de las tarjetas)
import { reduceMotion, tr } from '../utilidades';

// Barra de progreso por bloques: cada segmento se enciende en su turno
const segmentosPixel = (n: number) => Array.from({ length: n }, (_, s) => `<b style="--s:${s}"></b>`).join('');

export function iniciarBarajaTrabajo(): void {
  const escenario = document.getElementById('deck-stage');
  const puntos = document.getElementById('deck-dots');
  const proyectos = document.querySelectorAll<HTMLElement>('.work-grid .project-card');
  if (!escenario || !puntos || !proyectos.length) return;

  const cartas: HTMLDivElement[] = [];
  const botones: HTMLButtonElement[] = [];
  const total = proyectos.length;
  let actual = 0;

  const mostrar = (siguiente: number) => {
    const anterior = actual;
    actual = (siguiente + total) % total;
    cartas.forEach((carta, k) => {
      const pos = (k - actual + total) % total;
      carta.className = 'deck-card' + (pos < 3 ? ' pos-' + pos : '') +
        (k === anterior && k !== actual && pos > 2 ? ' is-leaving' : '');
      carta.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
    });
    botones.forEach((boton, k) => boton.setAttribute('aria-current', String(k === actual)));
  };

  const enfocarProyecto = (k: number) => {
    const destino = proyectos[k];
    destino.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    destino.classList.add('is-highlight');
    setTimeout(() => destino.classList.remove('is-highlight'), 1800);
  };

  proyectos.forEach((proyecto, k) => {
    const portada = proyecto.querySelector<HTMLElement>('.project-cover');
    if (!portada) return;
    const color = portada.style.background;
    const solido = /^#|^rgb/.test(color) ? color : '#5850EC';
    const titulo = proyecto.querySelector('h3')?.textContent ?? '';

    const carta = document.createElement('div');
    carta.className = 'deck-card';
    carta.style.setProperty('--deck-color', solido);
    carta.appendChild(portada.cloneNode(true));
    carta.insertAdjacentHTML('beforeend',
      '<div class="deck-body"><strong></strong>' +
      '<div class="deck-steps">' + tr('<span>brief</span><span>concepto</span><span>diseño</span><span>entrega</span>',
        '<span>brief</span><span>concept</span><span>design</span><span>delivery</span>') + '</div>' +
      '<div class="deck-progress"><i></i>' + segmentosPixel(16) + '</div></div>');
    const fuerte = carta.querySelector('strong');
    if (fuerte) fuerte.textContent = titulo;
    carta.addEventListener('click', () => enfocarProyecto(k));
    escenario.appendChild(carta);
    cartas.push(carta);

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.style.setProperty('--dot-color', solido);
    boton.setAttribute('aria-label', tr('Ver proyecto ', 'View project ') + (k + 1) + ': ' + titulo);
    boton.addEventListener('click', () => mostrar(k));
    puntos.appendChild(boton);
    botones.push(boton);
  });

  document.getElementById('deck-prev')?.addEventListener('click', () => mostrar(actual - 1));
  document.getElementById('deck-next')?.addEventListener('click', () => mostrar(actual + 1));

  // Avance automático al terminar la barra de progreso (se pausa con hover/foco)
  if (!reduceMotion) {
    escenario.addEventListener('animationend', (e) => {
      if (e.animationName === 'deck-progress') mostrar(actual + 1);
    });
  }

  mostrar(0);
}
