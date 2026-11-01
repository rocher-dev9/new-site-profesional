// Índice lateral numerado, botón de volver arriba y botón flotante de los casos de estudio
export function iniciarIndiceLateral(): void {
  const indice = document.querySelector<HTMLElement>('.page-index');
  if (indice) {
    const objetivos: { enlace: HTMLAnchorElement; seccion: HTMLElement }[] = [];
    indice.querySelectorAll<HTMLAnchorElement>('a').forEach((enlace) => {
      const seccion = document.getElementById((enlace.getAttribute('href') ?? '').slice(1));
      if (seccion) objetivos.push({ enlace, seccion });
    });

    // Marca como activa la última sección (en orden) que cruza el centro de la pantalla;
    // así funciona también con secciones anidadas (p. ej. Automatización dentro de Herramientas)
    let pendiente = false;
    const actualizar = () => {
      pendiente = false;
      const medio = window.innerHeight * 0.5;
      let activa: (typeof objetivos)[number] | undefined;
      for (const item of objetivos) {
        const r = item.seccion.getBoundingClientRect();
        if (r.top <= medio && r.bottom > medio) activa = item;
      }
      if (window.scrollY < 80 && objetivos.length) activa = objetivos[0]; // arriba del todo: siempre la cabecera
      if (!activa) return;
      for (const item of objetivos) item.enlace.setAttribute('aria-current', String(item === activa));
      // Sobre fondos oscuros el índice pasa a blanco
      indice.classList.toggle('on-dark', indice.hasAttribute('data-dark') || activa.seccion.classList.contains('ia-teaser'));
    };
    window.addEventListener('scroll', () => {
      if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); }
    }, { passive: true });
    window.addEventListener('resize', actualizar);
    actualizar();
  }

  // Botones que aparecen al bajar: volver arriba y (en los casos) volver a Trabajo
  mostrarAlBajar(document.querySelector('.to-top'), () => window.innerHeight);
  mostrarAlBajar(document.querySelector('.case-back-float'), () => 420);
}

function mostrarAlBajar(boton: Element | null, umbral: () => number): void {
  if (!boton) return;
  const actualizar = () => boton.classList.toggle('is-visible', window.scrollY > umbral());
  actualizar();
  window.addEventListener('scroll', actualizar, { passive: true });
}
