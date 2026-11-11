// Entorno: arte pixel tenue detrás del titular de la cabecera (.rt-pixel), dentro de la retícula.
// Ocupa todo el ancho de la pantalla. Cuadraditos índigo a los lados del texto; una franja de luz los recorre despacio, a saltos.
// Con movimiento reducido se queda quieto.
import { alRedimensionar, ajustarCanvas, animarEnPantalla } from '../utilidades';

export function iniciarReticulaPixel(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('.rt-pixel');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const LADO = 6; // celda de 6px con un hueco de 2px
  let W = 0, H = 0, paso = 0;
  // Mitad del ancho que ocupa el texto (el bloque más ancho), para dejarlo limpio
  const texto = canvas.parentElement?.querySelector<HTMLElement>('.rt-hero-txt');
  let mitadTexto = 0;
  const medirTexto = () => {
    // Ancho real del contenido (el h1 es un bloque de todo el ancho; su texto, no)
    const anchos = texto ? Array.from(texto.children).map((h) => {
      const r = document.createRange();
      r.selectNodeContents(h);
      return r.getBoundingClientRect().width;
    }) : [];
    mitadTexto = anchos.length ? Math.max(...anchos) / 2 + 32 : W * 0.2;
  };

  const dibujar = () => {
    ctx.clearRect(0, 0, W, H);
    if (!W || !H) return;
    const ciclo = W * 1.4;
    for (let y = 0; y < H; y += LADO) {
      for (let x = 0; x < W; x += LADO) {
        // Manchas irregulares: suma de ondas
        const n = Math.sin(x * 0.045) + Math.sin(y * 0.07 + x * 0.02) + Math.sin((x + y) * 0.03);
        if (n < 0.9) continue;
        // Solo a los lados del texto: aparece fuera de él y se intensifica hacia los bordes
        const lado = Math.min(1, (Math.abs(x - W / 2) - mitadTexto) / 220);
        if (lado <= 0) continue;
        // Franja de luz en diagonal que avanza con cada paso
        const franja = Math.max(0, 1 - Math.abs(((x * 0.6 + paso) % ciclo) - W * 0.7 + y * 0.3) / 90);
        const alfa = (0.07 + franja * 0.2) * lado;
        ctx.fillStyle = 'rgba(88, 80, 236,' + alfa.toFixed(3) + ')';
        ctx.fillRect(x, y, LADO - 2, LADO - 2);
      }
    }
  };

  const redimensionar = () => { ({ w: W, h: H } = ajustarCanvas(canvas, ctx)); medirTexto(); dibujar(); };
  redimensionar();
  alRedimensionar(redimensionar);
  animarEnPantalla(canvas, () => { paso += 6; dibujar(); }, 90);
}
