// IOI: red neuronal animada de la cabecera
import { reduceMotion, alRedimensionar, ajustarCanvas, animarEnPantalla } from '../utilidades';

interface Nodo { x: number; y: number; vx: number; vy: number; r: number; tono: 'peach' | 'lav'; fase: number }
const ENLACE = 140;

export function iniciarRedNeuronal(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#neural-field');
  const ctx = canvas?.getContext('2d');
  const cabecera = canvas?.parentElement;
  if (!canvas || !ctx || !cabecera) return;

  let nodos: Nodo[] = [], W = 0, H = 0;
  const raton = { x: -9999, y: -9999 };

  const redimensionar = () => {
    ({ w: W, h: H } = ajustarCanvas(canvas, ctx));
    const cantidad = Math.min(110, Math.round(W * H / 11000));
    nodos = Array.from({ length: cantidad }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: 1 + Math.random() * 1.8, tono: Math.random() < 0.18 ? 'peach' : 'lav',
      fase: Math.random() * 6.28,
    }));
  };

  const dibujar = (tiempo: number) => {
    const t = tiempo / 1000;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < nodos.length; i++) {
      const a = nodos[i];
      if (!reduceMotion) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        // El cursor atrae ligeramente a los nodos cercanos
        const mdx = raton.x - a.x, mdy = raton.y - a.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 180 && md > 1) { a.x += mdx / md * 0.35; a.y += mdy / md * 0.35; }
      }
      for (let j = i + 1; j < nodos.length; j++) {
        const b = nodos[j];
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < ENLACE) {
          ctx.strokeStyle = 'rgba(143, 136, 255,' + ((1 - d / ENLACE) * 0.35).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dist = Math.sqrt((raton.x - a.x) * (raton.x - a.x) + (raton.y - a.y) * (raton.y - a.y));
      if (dist < 180) {
        ctx.strokeStyle = 'rgba(247, 185, 138,' + ((1 - dist / 180) * 0.55).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(raton.x, raton.y); ctx.stroke();
      }
      const brillo = 0.55 + 0.45 * Math.sin(t * 1.6 + a.fase);
      ctx.fillStyle = a.tono === 'peach'
        ? 'rgba(247, 185, 138,' + brillo.toFixed(2) + ')'
        : 'rgba(198, 168, 255,' + brillo.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r + (dist < 120 ? 1.2 : 0), 0, 6.283); ctx.fill();
    }
  };

  redimensionar();
  dibujar(0);
  alRedimensionar(() => { redimensionar(); dibujar(performance.now()); });
  cabecera.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    raton.x = e.clientX - r.left; raton.y = e.clientY - r.top;
  });
  cabecera.addEventListener('pointerleave', () => { raton.x = raton.y = -9999; });
  animarEnPantalla(canvas, dibujar);
}
