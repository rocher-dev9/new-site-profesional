// Etiquetas de sección (.section-label): añade el total al número, «01 / 06».
// El total sale del índice lateral (la cabecera es 00, así que es su último número);
// en páginas sin índice, del número de etiquetas. Con una sola sección no se añade.
export function iniciarEtiquetasSeccion(): void {
  const numeros = document.querySelectorAll<HTMLElement>('.section-label b');
  const enlacesIndice = document.querySelectorAll('.page-index a').length;
  const total = enlacesIndice ? enlacesIndice - 1 : numeros.length;
  if (!numeros.length || total < 2) return;

  const texto = '/' + String(total).padStart(2, '0');
  numeros.forEach((b) => {
    const t = document.createElement('i');
    t.className = 'sl-total';
    t.setAttribute('aria-hidden', 'true');
    t.textContent = texto;
    b.append(t);
  });
}
