// Portada: retícula de puntos de la cabecera que reacciona al cursor
import { reduceMotion, finePointer, alRedimensionar, ajustarCanvas } from '../utilidades';

export function iniciarPuntosCabecera(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('.hero-dots');
  const ctx = canvas?.getContext('2d');
  const cabecera = canvas?.parentElement;
  if (!canvas || !ctx || !cabecera) return;

  const GAP = 22, RADIO = 120;
  let W = 0, H = 0, enMarcha = false, visible = true;
  const raton = { x: -9999, y: -9999, s: 0, objetivo: 0 }; // s: intensidad suavizada (0–1)

  const redimensionar = () => ({ w: W, h: H } = ajustarCanvas(canvas, ctx));

  // Máscara: elipse centrada al 50% / 40% que se desvanece hacia los bordes
  const mascara = (x: number, y: number) => {
    const nx = (x - W * 0.5) / (W * 0.5), ny = (y - H * 0.4) / (H * 0.6);
    const r = Math.sqrt(nx * nx + ny * ny);
    if (r <= 0.35) return 1;
    if (r >= 0.8) return 0;
    return 1 - (r - 0.35) / 0.45;
  };

  const dibujar = () => {
    ctx.clearRect(0, 0, W, H);
    const s = raton.s;
    for (let y = GAP / 2; y < H; y += GAP) {
      for (let x = GAP / 2; x < W; x += GAP) {
        const m = mascara(x, y);
        const dx = x - raton.x, dy = y - raton.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        let t = d < RADIO ? (1 - d / RADIO) * s : 0;
        t = t * t * (3 - 2 * t); // suavizado
        const alfa = Math.max(0.16 * m, (0.16 + t * 0.34) * Math.max(m, t));
        if (alfa < 0.01) continue;
        let px = x, py = y;
        if (t > 0 && d > 0.1) { px += dx / d * t * 3; py += dy / d * t * 3; } // se aparta levemente del cursor
        ctx.fillStyle = 'rgba(88, 80, 236,' + alfa.toFixed(3) + ')';
        if (t > 0.4) {
          // Cerca del cursor el punto se convierte en un píxel cuadrado
          const lado = Math.round(2 + t * 1.6);
          ctx.fillRect(Math.round(px - lado / 2), Math.round(py - lado / 2), lado, lado);
        } else {
          ctx.beginPath(); ctx.arc(px, py, 1, 0, 6.283); ctx.fill();
        }
      }
    }
  };

  const frame = () => {
    raton.s += (raton.objetivo - raton.s) * 0.12;
    dibujar();
    // Sigue animando hasta que la intensidad se estabiliza
    if (Math.abs(raton.objetivo - raton.s) > 0.005) requestAnimationFrame(frame);
    else { raton.s = raton.objetivo; dibujar(); enMarcha = false; }
  };
  const despertar = () => { if (!enMarcha && visible) { enMarcha = true; requestAnimationFrame(frame); } };

  redimensionar();
  dibujar();
  cabecera.classList.add('dots-live');
  alRedimensionar(() => { redimensionar(); dibujar(); });

  if (finePointer && !reduceMotion) {
    cabecera.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      raton.x = e.clientX - r.left; raton.y = e.clientY - r.top;
      raton.objetivo = 1;
      if (enMarcha) return;
      dibujar(); // redibuja al instante con la nueva posición
      despertar();
    });
    cabecera.addEventListener('pointerleave', () => { raton.objetivo = 0; despertar(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(canvas);
    }
  }
}
