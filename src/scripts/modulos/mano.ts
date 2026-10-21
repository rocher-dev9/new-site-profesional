// Mano pixelada saludando (Sobre mí y portada).
// Cada <canvas class="hand-field"> dibuja su propia mano; data-cell fija el tamaño del píxel.
import { reduceMotion, alRedimensionar, ajustarCanvas, animarEnPantalla } from '../utilidades';

const NIVELES = ['#e8e5fb', '#c9c4f9', '#8f88ff', '#5850ec', '#3f37d6'];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function capsula(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, r: number) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  c.beginPath();
  c.arc(x1, y1, r, a + Math.PI / 2, a - Math.PI / 2);
  c.arc(x2, y2, r, a - Math.PI / 2, a + Math.PI / 2);
  c.closePath();
}

// Ángulo del saludo: tres balanceos que se van apagando y una pausa (ciclo de 2,4 s)
function anguloSaludo(t: number) {
  const p = (t % 2.4) / 2.4;
  if (p > 0.6) return 0;
  const caida = 1 - p / 0.6;
  return Math.sin(p / 0.6 * Math.PI * 5) * 0.32 * caida;
}

function iniciarMano(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  // Lienzo auxiliar a la resolución de la retícula: cada píxel es una celda
  const aux = document.createElement('canvas');
  const actx = aux.getContext('2d', { willReadFrequently: true });
  if (!ctx || !actx) return;

  const CELDA = Number(canvas.getAttribute('data-cell')) || 7, PUNTO = CELDA - 2;
  let W = 0, H = 0, cols = 0, filas = 0;

  const redimensionar = () => {
    ({ w: W, h: H } = ajustarCanvas(canvas, ctx));
    cols = Math.ceil(W / CELDA); filas = Math.ceil(H / CELDA);
    aux.width = cols; aux.height = filas;
  };

  const dibujarMano = (c: CanvasRenderingContext2D, angulo: number, unidad: number) => {
    // Coordenadas locales: mano de ~100 unidades de alto, pivote en la muñeca (50, 100)
    c.save();
    c.translate(cols * 0.5, filas * 0.9);
    c.rotate(angulo);
    c.scale(unidad, unidad);
    c.translate(-50, -100);
    const g = c.createLinearGradient(10, 0, 90, 0);
    g.addColorStop(0, '#000');      // borde izquierdo: denso
    g.addColorStop(0.55, '#9a9a9a');
    g.addColorStop(1, '#d8d8d8');   // borde derecho: claro
    c.fillStyle = g;
    // Dedos (separados para que se lean los huecos)
    capsula(c, 31, 60, 28, 20, 5.2); c.fill();
    capsula(c, 45, 58, 45, 10, 5.4); c.fill();
    capsula(c, 59, 59, 62, 16, 5.2); c.fill();
    capsula(c, 72, 63, 77, 32, 4.6); c.fill();
    // Pulgar
    capsula(c, 29, 80, 10, 56, 5.8); c.fill();
    // Palma
    c.beginPath();
    c.moveTo(26, 56); c.lineTo(78, 56);
    c.quadraticCurveTo(80, 82, 70, 96);
    c.lineTo(32, 96);
    c.quadraticCurveTo(22, 82, 26, 56);
    c.fill();
    c.restore();
  };

  const dibujar = (tiempo: number) => {
    const angulo = reduceMotion ? 0.12 : anguloSaludo(tiempo / 1000);
    const unidad = Math.min(filas * 0.88 / 100, cols * 0.95 / 100);

    actx.clearRect(0, 0, cols, filas);
    dibujarMano(actx, angulo, unidad);
    const datos = actx.getImageData(0, 0, cols, filas).data;

    ctx.clearRect(0, 0, W, H);
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        let v = 0;
        if (datos[i + 3] > 110) {
          v = 0.2 + (1 - datos[i] / 255) * 0.85; // cuanto más oscuro, más denso
          // Contorno: las celdas del borde de la silueta se dibujan más intensas
          const borde = (x === 0 || datos[i - 1] < 110) || (x === cols - 1 || datos[i + 7] < 110) ||
            (y === 0 || datos[i - cols * 4 + 3] < 110) || (y === filas - 1 || datos[i + cols * 4 + 3] < 110);
          if (borde) v += 0.35;
        }
        if (v <= 0) continue;
        const nivel = Math.floor(v * 4 + BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.35);
        if (nivel < 0) continue;
        ctx.fillStyle = NIVELES[Math.min(nivel, 4)];
        ctx.fillRect(x * CELDA + 1, y * CELDA + 1, PUNTO, PUNTO);
      }
    }
  };

  redimensionar();
  dibujar(0);
  alRedimensionar(() => { redimensionar(); dibujar(performance.now()); });
  animarEnPantalla(canvas, dibujar, 40);
}

export function iniciarManos(): void {
  document.querySelectorAll<HTMLCanvasElement>('.hand-field').forEach(iniciarMano);
}
