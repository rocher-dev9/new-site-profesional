// Portada: código tenue de fondo de la cabecera (HeroCodigo).
// 1. Al cargar, las líneas se escriben solas, una tras otra, con un cursor de bloque.
// 2. Después, cada pocos segundos «edita» una línea: la borra y la vuelve a escribir.
// 3. Las líneas cercanas al cursor del visitante se avivan (más color), como al leerlas.
// Con «reducir movimiento» el código se queda escrito y quieto. Se pausa fuera de pantalla.
import { reduceMotion, finePointer } from '../utilidades';

const ESCRIBIR = 22;   // ms por carácter
const BORRAR = 12;     // ms por carácter al borrar
const PAUSA_LINEA = 90;
const CADA_EDICION = 5200;

export function iniciarCodigoCabecera(): void {
  const pre = document.querySelector<HTMLElement>('.hero-code');
  const cabecera = pre?.closest<HTMLElement>('.hero');
  if (!pre || !cabecera) return;
  const lineas = Array.from(pre.querySelectorAll<HTMLElement>('.hc-l'));
  if (!lineas.length) return;
  const textos = lineas.map((l) => l.dataset.l ?? '');

  // Cercanía al cursor: se avivan la línea bajo el ratón y sus vecinas
  if (finePointer) {
    let pendiente = false, y = -1;
    const avivar = () => {
      pendiente = false;
      lineas.forEach((l) => {
        const r = l.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - y) / r.height; // distancia en líneas
        l.classList.toggle('cerca', d < 1.2);
        l.classList.toggle('cerca-2', d >= 1.2 && d < 2.6);
      });
    };
    cabecera.addEventListener('pointermove', (e) => {
      const r = pre.getBoundingClientRect();
      // Solo cuenta si el cursor está a la altura del código y no muy lejos en horizontal
      y = (e.clientX > r.left - 160 && e.clientY > r.top - 30 && e.clientY < r.bottom + 30) ? e.clientY : -9999;
      if (!pendiente) { pendiente = true; requestAnimationFrame(avivar); }
    });
    cabecera.addEventListener('pointerleave', () => { y = -9999; avivar(); });
  }

  if (reduceMotion) return;

  // Cursor de bloque que va con la escritura
  const cursor = document.createElement('i');
  cursor.className = 'hc-cursor-cod';
  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(cabecera);
  }
  const esperar = (ms: number) => new Promise<void>((ok) => window.setTimeout(ok, ms));
  const mientrasOculto = async () => { while (!visible || document.hidden) await esperar(400); };
  // Escribe el texto de la línea con el cursor justo detrás (antes del salto de línea)
  const poner = (i: number, texto: string) => {
    lineas[i].replaceChildren(document.createTextNode(texto), cursor, document.createTextNode('\n'));
  };

  const escribir = async (i: number, desde = 0) => {
    const t = textos[i];
    for (let n = desde; n <= t.length; n++) {
      await mientrasOculto();
      poner(i, t.slice(0, n));
      await esperar(t[n - 1] === ' ' ? ESCRIBIR / 2 : ESCRIBIR);
    }
  };
  const borrar = async (i: number, hasta: number) => {
    const t = textos[i];
    for (let n = t.length; n >= hasta; n--) {
      await mientrasOculto();
      poner(i, t.slice(0, n));
      await esperar(BORRAR);
    }
  };

  const arrancar = async () => {
    lineas.forEach((l) => { l.textContent = '\n'; });
    pre.classList.add('vivo');
    for (let i = 0; i < textos.length; i++) {
      await escribir(i);
      await esperar(PAUSA_LINEA);
    }
    // Ediciones: borra el final de una línea con contenido y lo reescribe
    const editables = textos.map((t, i) => (t.trim().length > 6 ? i : -1)).filter((i) => i >= 0);
    let ultima = -1;
    for (;;) {
      await esperar(CADA_EDICION);
      await mientrasOculto();
      let i = editables[Math.floor(Math.random() * editables.length)];
      if (i === ultima) i = editables[(editables.indexOf(i) + 1) % editables.length];
      ultima = i;
      const corte = Math.max(textos[i].search(/\S/), Math.floor(textos[i].length * 0.45));
      await borrar(i, corte);
      await esperar(260);
      await escribir(i, corte);
    }
  };
  void arrancar();
}
