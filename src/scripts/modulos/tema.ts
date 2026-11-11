// Modo claro / oscuro: los interruptores del menú (.tema-switch) ponen data-theme="dark" en <html>
// y recuerdan la elección en este navegador. El tema guardado se aplica antes de pintar
// con un script en línea en Base.astro, para que no parpadee al cargar.
const CLAVE = 'tema';

export function iniciarTema(): void {
  const interruptores = Array.from(document.querySelectorAll<HTMLInputElement>('.tema-switch input'));
  if (!interruptores.length) return;

  const raiz = document.documentElement;
  const marcar = (oscuro: boolean) => interruptores.forEach((i) => { i.checked = oscuro; });
  marcar(raiz.dataset.theme === 'dark');
  // Sin animación al cargar: el interruptor aparece ya en su posición
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.tema-switch.sin-anim').forEach((l) => l.classList.remove('sin-anim'));
  }));

  interruptores.forEach((i) => i.addEventListener('change', () => {
    const oscuro = i.checked;
    if (oscuro) raiz.dataset.theme = 'dark'; else delete raiz.dataset.theme;
    marcar(oscuro);
    try { localStorage.setItem(CLAVE, oscuro ? 'dark' : 'light'); } catch { /* sin almacenamiento: solo dura esta visita */ }
  }));
}
