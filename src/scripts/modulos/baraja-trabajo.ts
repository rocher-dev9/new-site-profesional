// Trabajo: baraja de proyectos de la cabecera.
// Las cartas y los puntos vienen ya en el HTML (src/components/WorkDeck.astro);
// aquí solo se gestiona el avance y el salto a la fila de cada proyecto.
import { reduceMotion } from '../utilidades';

export function iniciarBarajaTrabajo(): void {
  const escenario = document.getElementById('deck-stage');
  if (!escenario) return;
  const cartas = Array.from(escenario.querySelectorAll<HTMLElement>('.deck-card'));
  const botones = Array.from(document.querySelectorAll<HTMLButtonElement>('#deck-dots button'));
  if (!cartas.length) return;

  const total = cartas.length;
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

  // Al pulsar una carta, baja a la fila de su proyecto y la resalta un momento
  const enfocarProyecto = (carta: HTMLElement) => {
    const destino = document.getElementById(carta.dataset.proyecto ?? '');
    if (!destino) return;
    destino.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    destino.classList.add('is-highlight');
    setTimeout(() => destino.classList.remove('is-highlight'), 1800);
  };

  cartas.forEach((carta) => carta.addEventListener('click', () => enfocarProyecto(carta)));
  botones.forEach((boton, k) => boton.addEventListener('click', () => mostrar(k)));
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
