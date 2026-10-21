// Menú: estado "scrolled" de la barra superior y menú móvil
export function iniciarMenu(): void {
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
