// ────────────────────────────────────────────────────────────────
// Roger Avellana — Busto de puntos (cabecera de Sobre mí)
// Una cabeza con hombros hecha con ~5.000 puntos en 3D, generada aquí mismo (sin modelos ni
// librerías). La cabeza gira hacia el cursor y el torso la acompaña un poco; los puntos cercanos
// al cursor se apartan. Al entrar en pantalla, los puntos se juntan desde dispersos.
// Uso: <div class="busto-art"><canvas class="busto-field"></canvas></div> (color: var(--indigo)).
// Con «reducir movimiento», se dibuja quieto y no sigue al cursor.
// ────────────────────────────────────────────────────────────────
import { reduceMotion, finePointer, alRedimensionar, ajustarCanvas, animarEnPantalla } from './utilidades';

// Generador aleatorio con semilla: el busto sale siempre igual
function aleatorio(semilla: number) {
  return () => {
    semilla |= 0; semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Partes del cuerpo: cuánto siguen el giro de la cabeza
const CABEZA = 0, CUELLO = 1, TORSO = 2;
const SIGUE = [1, 0.5, 0.18];

interface Nube {
  n: number;
  x: Float32Array; y: Float32Array; z: Float32Array;     // posición (y hacia abajo, z hacia el espectador)
  nx: Float32Array; ny: Float32Array; nz: Float32Array;  // normal aproximada (luz y cara oculta)
  parte: Uint8Array;
  brillo: Float32Array;                                  // variación propia de cada punto
}

function crearNube(): Nube {
  const r = aleatorio(20261118);
  const pts: number[][] = [];
  const add = (x: number, y: number, z: number, nx: number, ny: number, nz: number, parte: number, brillo = 1) => {
    const l = Math.hypot(nx, ny, nz) || 1;
    pts.push([x, y, z, nx / l, ny / l, nz / l, parte, brillo * (0.8 + r() * 0.4)]);
  };
  const esfera = () => {
    let a = 0, b = 0, c = 0, l = 0;
    do { a = r() * 2 - 1; b = r() * 2 - 1; c = r() * 2 - 1; l = a * a + b * b + c * c; } while (l > 1 || l < 1e-4);
    l = Math.sqrt(l);
    return [a / l, b / l, c / l];
  };
  // Cabeza: elipsoide con barbilla estrecha y cara algo plana
  const CY = -0.62, RX = 0.4, RY = 0.54, RZ = 0.46;
  const cabeza = (d: number[], extra = 1) => {
    let [dx, dy, dz] = d;
    const barbilla = dy > 0.25 ? 1 - 0.3 * suave(0.25, 1, dy) : 1;
    const x = dx * RX * barbilla * extra;
    const y = CY + dy * RY * extra;
    const z = dz * RZ * barbilla * (dz > 0 ? 0.94 : 1) * extra;
    return [x, y, z];
  };
  // Piel de la cabeza, con huecos para ojos y boca
  for (let i = 0; i < 3600; i++) {
    const d = esfera();
    const [x, y, z] = cabeza(d);
    if (z > 0.28) {
      const ojo = Math.min(Math.hypot(x - 0.15, y + 0.67), Math.hypot(x + 0.15, y + 0.67));
      if (ojo < 0.07 && r() < 0.75) continue;
      if (Math.abs(y + 0.36) < 0.022 && Math.abs(x) < 0.11 && r() < 0.6) continue;
    }
    add(x, y, z, d[0] / RX, d[1] / RY, d[2] / RZ, CABEZA);
  }
  // Cejas (arqueadas: más altas en el centro de cada una)
  for (let i = 0; i < 100; i++) {
    const lado = r() < 0.5 ? -1 : 1;
    const t = r();
    const x = lado * (0.07 + t * 0.15);
    const y = -0.75 - 0.028 * (1 - Math.pow((t - 0.5) * 2, 2)) + (r() - 0.5) * 0.014;
    const z = RZ * 0.94 * Math.sqrt(Math.max(0, 1 - (x / RX) ** 2 - ((y - CY) / RY) ** 2)) + 0.012;
    add(x, y, z, x, y - CY, z, CABEZA);
  }
  // Nariz y orejas
  for (let i = 0; i < 110; i++) {
    const d = esfera();
    if (d[2] < 0) continue;
    const yN = d[1] * 0.1;
    add(d[0] * 0.035 * (1 + yN * 4), -0.58 + yN, 0.41 + d[2] * 0.05 + (d[1] + 1) * 0.025, d[0], d[1] * 0.4, d[2] + 0.6, CABEZA, 0.85);
  }
  for (let i = 0; i < 180; i++) {
    const d = esfera();
    const lado = r() < 0.5 ? -1 : 1;
    add(lado * (0.4 + Math.abs(d[0]) * 0.05), -0.6 + d[1] * 0.11, -0.03 + d[2] * 0.055, lado, d[1] * 0.3, d[2] * 0.3, CABEZA);
  }
  // Pelo: casquete algo más grande, con textura irregular
  for (let i = 0; i < 3400; i++) {
    const d = esfera();
    const frente = d[2] > 0.15 && d[1] > -0.42;
    if (d[1] > 0.12 || frente) continue;
    const extra = 1.05 + r() * 0.07 * (0.6 + 0.4 * Math.sin(d[0] * 23) * Math.cos(d[2] * 19));
    const [x, y, z] = cabeza(d, extra);
    add(x, y, z, d[0], d[1], d[2], CABEZA, 1.25);
  }
  // Cuello
  for (let i = 0; i < 520; i++) {
    const a = r() * Math.PI * 2;
    const y = -0.16 + r() * 0.28;
    const rad = 0.165 + 0.05 * suave(-0.02, 0.12, y);
    add(Math.cos(a) * rad, y, Math.sin(a) * rad * 0.9 - 0.03, Math.cos(a), 0, Math.sin(a), CUELLO);
  }
  // Hombros y pecho: secciones superelípticas que se ensanchan; más puntos en la caída del hombro
  const ancho = (y: number) => 0.21 + 0.8 * suave(0.03, 0.44, y) + 0.07 * suave(0.44, 1.1, y);
  const fondo = (y: number) => 0.21 + 0.17 * suave(0.04, 0.4, y);
  for (let i = 0; i < 4000; i++) {
    const y = r() < 0.45 ? 0.03 + r() * 0.42 : 0.03 + r() * 1.03;
    const a = r() * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const w = ancho(y), f = fondo(y);
    const x = w * Math.sign(c) * Math.pow(Math.abs(c), 0.72);
    const z = f * Math.sign(s) * Math.pow(Math.abs(s), 0.72) - 0.02;
    const pendiente = (ancho(y + 0.01) - w) / 0.01;
    add(x, y, z, c / w, -pendiente * 0.35, s / f, TORSO);
  }

  const n = pts.length;
  const nube: Nube = {
    n,
    x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n),
    nx: new Float32Array(n), ny: new Float32Array(n), nz: new Float32Array(n),
    parte: new Uint8Array(n), brillo: new Float32Array(n),
  };
  pts.forEach((p, i) => {
    nube.x[i] = p[0]; nube.y[i] = p[1]; nube.z[i] = p[2];
    nube.nx[i] = p[3]; nube.ny[i] = p[4]; nube.nz[i] = p[5];
    nube.parte[i] = p[6]; nube.brillo[i] = p[7];
  });
  return nube;
}

const NIVELES = 7;                       // niveles de opacidad (se pinta por grupos)
const LUZ = (() => { const l = Math.hypot(-0.45, -0.55, 0.7); return [-0.45 / l, -0.55 / l, 0.7 / l]; })();
const PIVOTE_Y = -0.12;                  // la cabeza gira sobre la base del cuello

function iniciarBusto(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const nube = crearNube();
  const n = nube.n;
  const sx = new Float32Array(n), sy = new Float32Array(n), op = new Uint8Array(n);
  // Posiciones de partida dispersas y retrasos de la entrada
  const r = aleatorio(7);
  const ox = new Float32Array(n), oy = new Float32Array(n), retraso = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = 0.6 + r() * 1.4;
    ox[i] = Math.cos(a) * d; oy[i] = Math.sin(a) * d * 0.8;
    retraso[i] = r() * 500 + (nube.y[i] + 1.2) * 140;
  }

  let w = 0, h = 0, escala = 1, cx = 0, cy = 0;
  let color = '#5850ec';
  const leerColor = () => { color = getComputedStyle(canvas).color || color; };
  const redimensionar = () => {
    ({ w, h } = ajustarCanvas(canvas, ctx));
    escala = Math.min(w / 2.3, h / 2.05);
    cx = w / 2;
    cy = Math.max(h * 0.06, 0) + 1.22 * escala;
    leerColor();
  };

  // Cursor: posición en la ventana y última vez que se movió
  let mx = -9999, my = -9999, ultimoMov = -1e9;
  if (finePointer && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY; ultimoMov = performance.now();
    }, { passive: true });
  }
  // El color cambia con el modo claro u oscuro
  new MutationObserver(leerColor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let giro = -0.18, cabeceo = 0.02;      // posición actual de la cabeza (radianes)
  let inicio = -1;

  const dibujar = (t: number) => {
    if (inicio < 0) inicio = t;
    const rect = canvas.getBoundingClientRect();
    // Objetivo: hacia el cursor si se ha movido hace poco; si no, un vaivén lento
    let objGiro = Math.sin(t * 0.00035) * 0.28 - 0.08;
    let objCabeceo = Math.sin(t * 0.00027) * 0.06;
    const lx = mx - rect.left, ly = my - rect.top;
    if (t - ultimoMov < 4000) {
      const hx = cx, hy = cy - 0.62 * escala;
      objGiro = Math.max(-1, Math.min(1, (lx - hx) / (innerWidth * 0.45))) * 0.8;
      objCabeceo = Math.max(-1, Math.min(1, (ly - hy) / (innerHeight * 0.5))) * 0.38;
    }
    if (reduceMotion) { objGiro = -0.18; objCabeceo = 0.02; }
    giro += (objGiro - giro) * 0.07;
    cabeceo += (objCabeceo - cabeceo) * 0.07;

    // Matrices de giro de cada parte (la cabeza entera, el cuello a medias, el torso un poco)
    const m = SIGUE.map((k) => {
      const a = giro * k, b = cabeceo * Math.min(1, k * 1.4);
      return [Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b)];
    });
    const entrada = reduceMotion ? 1 : 0;
    const cerca = finePointer && !reduceMotion && t - ultimoMov < 4000;
    const RADIO = 56;

    for (let i = 0; i < n; i++) {
      const [ca, sa, cb, sb] = m[nube.parte[i]];
      // Giro horizontal (eje vertical) y cabeceo (eje horizontal) sobre la base del cuello
      let x = nube.x[i], y = nube.y[i] - PIVOTE_Y, z = nube.z[i];
      let x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
      let y1 = y * cb + z1 * sb, z2 = -y * sb + z1 * cb;
      y1 += PIVOTE_Y;
      // Normal girada igual (para la luz y la cara oculta)
      const nx = nube.nx[i], ny = nube.ny[i], nz = nube.nz[i];
      const nx1 = nx * ca + nz * sa, nz1 = -nx * sa + nz * ca;
      const ny1 = ny * cb + nz1 * sb, nz2 = -ny * sb + nz1 * cb;
      const luz = Math.max(0, nx1 * LUZ[0] + ny1 * LUZ[1] + nz2 * LUZ[2]);
      let a = (0.3 + 0.7 * luz) * nube.brillo[i];
      if (nz2 < 0) a *= 0.25;                         // cara oculta: muy tenue
      // Perspectiva
      const f = 3.4 / (3.4 - z2);
      let px = cx + x1 * escala * f, py = cy + y1 * escala * f;
      // Entrada: de disperso a su sitio
      let p = 1;
      if (!entrada) {
        p = Math.min(1, Math.max(0, (t - inicio - retraso[i]) / 900));
        p = 1 - Math.pow(1 - p, 3);
        if (p < 1) { px += ox[i] * escala * (1 - p); py += oy[i] * escala * (1 - p); a *= 0.35 + 0.65 * p; }
      }
      // Los puntos cercanos al cursor se apartan
      if (cerca) {
        const dx = px - lx, dy = py - ly, d = Math.hypot(dx, dy);
        if (d < RADIO && d > 0.01) {
          const empuje = Math.pow(1 - d / RADIO, 2) * 16;
          px += (dx / d) * empuje; py += (dy / d) * empuje;
        }
      }
      sx[i] = px; sy[i] = py;
      op[i] = Math.min(NIVELES - 1, Math.max(0, Math.round(a * (NIVELES - 1))));
    }

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    for (let nivel = 1; nivel < NIVELES; nivel++) {
      ctx.globalAlpha = 0.2 + (nivel / (NIVELES - 1)) * 0.8;
      const lado = nivel > 3 ? 1.7 : 1.4;
      for (let i = 0; i < n; i++) if (op[i] === nivel) ctx.fillRect(sx[i], sy[i], lado, lado);
    }
    ctx.globalAlpha = 1;
  };

  redimensionar();
  alRedimensionar(() => { redimensionar(); if (reduceMotion) dibujar(performance.now()); });
  // Con «reducir movimiento», un único dibujo ya montado y quieto
  if (reduceMotion) { dibujar(performance.now()); return; }
  animarEnPantalla(canvas, dibujar);
}

document.querySelectorAll<HTMLCanvasElement>('.busto-field').forEach(iniciarBusto);
