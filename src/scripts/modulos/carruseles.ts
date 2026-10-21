// Carruseles deslizables con flechas (testimonios de la portada)
import { reduceMotion } from '../utilidades';

export function iniciarCarruseles(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-carousel-prev], [data-carousel-next]').forEach((boton) => {
    const pista = document.getElementById(boton.getAttribute('data-carousel-prev') || boton.getAttribute('data-carousel-next') || '');
    if (!pista) return;
    const dir = boton.hasAttribute('data-carousel-next') ? 1 : -1;
    boton.addEventListener('click', () => {
      const tarjeta = pista.firstElementChild;
      const paso = tarjeta
        ? tarjeta.getBoundingClientRect().width + parseFloat(getComputedStyle(pista).columnGap || '0')
        : pista.clientWidth;
      pista.scrollBy({ left: dir * paso, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    // Desactiva la flecha al llegar a cada extremo
    const sincronizar = () => {
      const max = pista.scrollWidth - pista.clientWidth - 2;
      boton.disabled = dir < 0 ? pista.scrollLeft <= 2 : pista.scrollLeft >= max;
    };
    pista.addEventListener('scroll', sincronizar, { passive: true });
    window.addEventListener('resize', sincronizar);
    sincronizar();
  });
}
