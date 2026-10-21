// Portada: brillo del bloque IOI que sigue al cursor
import { reduceMotion } from '../utilidades';

export function iniciarBrilloIa(): void {
  const bloque = document.querySelector<HTMLElement>('.ia-teaser');
  if (!bloque || reduceMotion) return;
  bloque.addEventListener('pointermove', (e) => {
    const r = bloque.getBoundingClientRect();
    bloque.style.setProperty('--gx', (e.clientX - r.left) + 'px');
    bloque.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    bloque.classList.add('is-pointer');
  });
  bloque.addEventListener('pointerleave', () => bloque.classList.remove('is-pointer'));
}
