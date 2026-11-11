// Entorno: arte pixel tenue detrás del titular de la cabecera (.rt-pixel), dentro de la retícula.
// Cuadraditos índigo a los lados del texto; una franja de luz los recorre despacio, a saltos.
// Con movimiento reducido se queda quieto.
import { alRedimensionar, ajustarCanvas, animarEnPantalla } from '../utilidades';

export function iniciarReticulaPixel(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('.rt-pixel');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const LADO = 6; // celda de 6px con un hueco de 2px
  let W = 0, H = 0, paso = 0;

  const dibujar = () => {
    ctx.clearRect(0, 0, W, H);
    if (!W || !H) return;
    const ciclo = W * 1.4;
    for (let y = 0; y < H; y += LADO) {
      for (let x = 0; x < W; x += LADO) {
        // Manchas irregulares: suma de ondas
        const n = Math.sin(x * 0.045) + Math.sin(y * 0.07 + x * 0.02) + Math.sin((x + y) * 0.03);
        if (n < 0.9) continue;
        // Solo a los lados: se apaga hacia el centro, donde va el texto
        const lado = Math.min(1, Math.abs(x - W / 2) / (W * 0.32));
        if (lado < 0.35) continue;
        // Franja de luz en diagonal que avanza con cada paso
        const franja = Math.max(0, 1 - Math.abs(((x * 0.6 + paso) % ciclo) - W * 0.7 + y * 0.3) / 90);
        const alfa = (0.07 + franja * 0.2) * lado;
        ctx.fillStyle = 'rgba(88, 80, 236,' + alfa.toFixed(3) + ')';
        ctx.fillRect(x, y, LADO - 2, LADO - 2);
      }
    }
  };

  const redimensionar = () => { ({ w: W, h: H } = ajustarCanvas(canvas, ctx)); dibujar(); };
  redimensionar();
  alRedimensionar(redimensionar);
  animarEnPantalla(canvas, () => { paso += 6; dibujar(); }, 90);
}
