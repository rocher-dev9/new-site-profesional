// Desplegable de Trabajo: se abre al pasar el ratón o con la flecha (teclado y táctil)
function iniciarDesplegable(): void {
  const grupo = document.getElementById('nv-trabajo');
  const flecha = grupo?.querySelector('.nv-caret');
  if (!grupo || !flecha) return;

  const poner = (abrir: boolean) => {
    grupo.classList.toggle('open', abrir);
    flecha.setAttribute('aria-expanded', String(abrir));
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
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') poner(false); });
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

  const cerrar = () => {
    menuMovil.classList.remove('open');
    document.body.classList.remove('nav-open');
    burger?.setAttribute('aria-expanded', 'false');
  };
  const alternar = () => {
    const abrir = !menuMovil.classList.contains('open');
    menuMovil.classList.toggle('open', abrir);
    document.body.classList.toggle('nav-open', abrir);
    burger?.setAttribute('aria-expanded', String(abrir));
  };

  burger?.addEventListener('click', alternar);
  menuMovil.querySelectorAll('[data-close]').forEach((enlace) => enlace.addEventListener('click', cerrar));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
}
