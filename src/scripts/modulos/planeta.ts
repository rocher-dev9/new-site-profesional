// Portada ("Lo que hago"): planeta de píxeles con anillo
import { alRedimensionar, ajustarCanvas, animarEnPantalla } from '../utilidades';

const CELDA = 7, PUNTO = 5;
// Niveles de la paleta de la web (de claro a intenso)
const NIVELES = ['#e8e5fb', '#c9c4f9', '#8f88ff', '#5850ec', '#3f37d6'];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const INCLINACION = -0.42;
const COS = Math.cos(INCLINACION), SIN = Math.sin(INCLINACION);
const LUZ = [0.55, -0.35, 0.76]; // luz desde arriba a la derecha: el borde izquierdo queda denso

const suave = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

export function iniciarPlaneta(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('.pixel-field');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  let W = 0, H = 0, cols = 0, filas = 0;
  const redimensionar = () => {
    ({ w: W, h: H } = ajustarCanvas(canvas, ctx));
    cols = Math.ceil(W / CELDA);
    filas = Math.ceil(H / CELDA);
  };

  const dibujar = (tiempo: number) => {
    const t = tiempo / 1000;
    const movil = W < 700;
    const cx = W * (movil ? 0.56 : 0.73);
    const cy = movil ? H - 175 : H * 0.5;
    const R = movil ? Math.min(135, W * 0.37) : Math.min(H * 0.38, W * 0.2);
    const ra = R * 2.3, rb = R * 0.55;
    ctx.clearRect(0, 0, W, H);

    for (let y = 0; y < filas; y++) {
      const py = y * CELDA + CELDA / 2;
      for (let x = 0; x < cols; x++) {
        const px = x * CELDA + CELDA / 2;
        const nx = px / W;
        const dx = (px - cx) / R, dy = (py - cy) / R;
        const r2 = dx * dx + dy * dy;
        let v = 0;

        // Planeta: sombreado + bandas que giran lentamente
        if (r2 < 1) {
          const z = Math.sqrt(1 - r2);
          const luz = dx * LUZ[0] + dy * LUZ[1] + z * LUZ[2];
          const sombra = Math.pow(1 - Math.max(0, luz), 2.2);
          const lon = Math.atan2(dx, z) + t * 0.18;
          const lat = Math.asin(Math.max(-1, Math.min(1, dy)));
          const bandas = 0.13 * Math.sin(lat * 9 + Math.sin(lon * 3) * 1.6) + 0.09 * Math.sin(lon * 5 + lat * 4);
          v = 0.12 + sombra * 0.95 + bandas;
        }

        // Anillo inclinado: la parte delantera tapa el planeta, la trasera queda oculta
        const u = (px - cx) * COS + (py - cy) * SIN;
        const w = -(px - cx) * SIN + (py - cy) * COS;
        const e = Math.sqrt((u / ra) * (u / ra) + (w / rb) * (w / rb));
        const delante = w > 0;
        if (e > 0.72 && e < 1.04 && (delante || r2 >= 1)) {
          const ang = Math.atan2(w / rb, u / ra);
          let banda = 0.44 + 0.16 * Math.sin(e * 60) + 0.1 * Math.sin(ang * 3 - t * 0.4);
          if (Math.sin(ang * 46 - t * 1.4 + e * 10) > 0.93) banda = 1; // partículas que recorren el anillo
          banda *= 0.35 + 0.65 * suave(0.12, 0.5, nx);
          if (r2 < 1 && delante) {
            // Delante del planeta: el anillo lo tapa, con una fina separación a cada lado
            v = (e < 0.75 || e > 1.01) ? 0 : banda;
          } else {
            v = Math.max(v, banda);
          }
        }

        // Retícula de puntos muy suave en el fondo
        if (v === 0 && x % 3 === 0 && y % 3 === 0) {
          v = 0.2 * suave(0.35, 1, nx) + 0.04 * Math.sin(t * 0.8 + x * 0.3 + y * 0.2);
        }

        if (v <= 0) continue;
        // Tramado ordenado (Bayer 4×4) entre niveles de color
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
  animarEnPantalla(canvas, dibujar, 50); // ~20 fps, suficiente y ligero
}
