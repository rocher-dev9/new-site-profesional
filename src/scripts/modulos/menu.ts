// Desplegable de Trabajo: se abre al pasar el ratón o con la flecha (teclado y táctil)
function iniciarDesplegable(): void {
  const grupo = document.getElementById('nv-trabajo');
  const flecha = grupo?.querySelector('.nv-caret');
  if (!grupo || !flecha) return;

  // Megamenú: el proyecto señalado (ratón o foco) muestra su portada en la vista previa;
  // al cerrar vuelve al inicial (el de la página actual, o el primero)
  const items = Array.from(grupo.querySelectorAll<HTMLElement>('.nvm-item'));
  const vistas = Array.from(grupo.querySelectorAll<HTMLElement>('.nvm-prev'));
  const inicial = Math.max(0, items.findIndex((i) => i.classList.contains('is-on')));
  const senalar = (n: number) => {
    items.forEach((el, i) => el.classList.toggle('is-on', i === n));
    vistas.forEach((el, i) => el.classList.toggle('is-on', i === n));
  };
  items.forEach((el, i) => {
    el.addEventListener('pointerenter', () => senalar(i));
    el.addEventListener('focus', () => senalar(i));
  });

  const poner = (abrir: boolean) => {
    grupo.classList.toggle('open', abrir);
    flecha.setAttribute('aria-expanded', String(abrir));
    if (!abrir) senalar(inicial);
  };

  grupo.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') poner(true); });
  grupo.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') poner(false); });
  flecha.addEventListener('click', () => poner(!grupo.classList.contains('open')));
  grupo.addEventListener('focusout', (e) => {
    const destino = e.relatedTarget;
    if (destino instanceof Node && !grupo.contains(destino)) poner(false);
  });
  document.addEventListener('click', (e) => {
    if (e.target instanceof Node && !grupo.contains(e.target)) poner(false);
  });
  // Escape cierra; si el foco estaba dentro del panel, vuelve a la flecha para no perderse
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !grupo.classList.contains('open')) return;
    const dentro = grupo.contains(document.activeElement);
    poner(false);
    if (dentro) (flecha as HTMLElement).focus();
  });
}

// Menú: estado "scrolled" de la barra superior y menú móvil
export function iniciarMenu(): void {
  iniciarDesplegable();

  const nav = document.getElementById('nav');
  const actualizarNav = () => nav?.classList.toggle('scrolled', window.scrollY > 24);
  actualizarNav();
  window.addEventListener('scroll', actualizarNav, { passive: true });

  const burger = document.getElementById('burger');
  const menuMovil = document.getElementById('mobile-menu');
  if (!menuMovil) return;

  // Con el menú abierto, todo lo que hay detrás (contenido, pie…) queda inerte:
  // el teclado y los lectores de pantalla no pueden ir a enlaces tapados por el menú.
  const ponerEstado = (abierto: boolean) => {
    document.body.classList.toggle('nav-open', abierto);
    burger?.setAttribute('aria-expanded', String(abierto));
    for (const el of Array.from(document.body.children)) {
      if (el === menuMovil || el.id === 'nav' || el.tagName === 'SCRIPT') continue;
      (el as HTMLElement).inert = abierto;
    }
  };

  // Popover nativo (popovertarget en el botón): el navegador abre, cierra con Escape y al
  // tocar fuera; aquí solo se sincroniza el estado.
  if (Object.hasOwn(HTMLElement.prototype, 'popover')) {
    menuMovil.addEventListener('toggle', (e) => ponerEstado((e as ToggleEvent).newState === 'open'));
    menuMovil.querySelectorAll('[data-close]').forEach((enlace) => enlace.addEventListener('click', () => menuMovil.hidePopover()));
    return;
  }

  // Navegadores sin popover: el menú se abre y cierra con la clase .open
  const poner = (abrir: boolean) => {
    menuMovil.classList.toggle('open', abrir);
    ponerEstado(abrir);
  };
  burger?.addEventListener('click', () => poner(!menuMovil.classList.contains('open')));
  menuMovil.querySelectorAll('[data-close]').forEach((enlace) => enlace.addEventListener('click', () => poner(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuMovil.classList.contains('open')) poner(false); });
}
