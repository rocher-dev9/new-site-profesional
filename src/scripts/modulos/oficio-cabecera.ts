// Rótulos que van cambiando de palabra: la línea «Diseño …» de la portada y el «Creative …»
// de la cabecera de Sobre mí. Cada uno lleva sus palabras en data-palabras="una|otra|…".
import { reduceMotion } from '../utilidades';

export function iniciarOficioCabecera(): void {
  if (reduceMotion) return;
  document.querySelectorAll<HTMLElement>('[data-palabras]').forEach((rotulo) => {
    const palabras = rotulo.dataset.palabras?.split('|') ?? [];
    if (palabras.length < 2) return;
    let i = 0;
    window.setInterval(() => {
      // Se apaga en dos saltos, cambia la palabra y vuelve a aparecer
      rotulo.classList.add('fuera');
      window.setTimeout(() => {
        i = (i + 1) % palabras.length;
        rotulo.textContent = palabras[i];
        rotulo.classList.remove('fuera');
      }, 200);
    }, 2800);
  });
}
