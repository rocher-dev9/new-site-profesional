// Portada: línea «Diseño …» de la cabecera, que va cambiando de oficio
import { reduceMotion } from '../utilidades';

export function iniciarOficioCabecera(): void {
  const rotulo = document.querySelector<HTMLElement>('.hero-oficio-rot');
  const palabras = rotulo?.dataset.palabras?.split('|') ?? [];
  if (!rotulo || palabras.length < 2 || reduceMotion) return;

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
}
