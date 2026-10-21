// IOI: el proceso se ilumina al entrar en pantalla y las tarjetas de herramientas brillan con el cursor
import { reduceMotion, alAparecer } from '../utilidades';

export function iniciarProceso(): void {
  const proceso = document.querySelector('.ai-pipeline');
  if (proceso) {
    if ('IntersectionObserver' in window && !reduceMotion) alAparecer(proceso, () => proceso.classList.add('is-visible'), 0.3);
    else proceso.classList.add('is-visible');
  }

  document.querySelectorAll<HTMLElement>('.ai-tool').forEach((tarjeta) => {
    tarjeta.addEventListener('pointermove', (e) => {
      const r = tarjeta.getBoundingClientRect();
      tarjeta.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      tarjeta.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}
