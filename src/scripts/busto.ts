// ────────────────────────────────────────────────────────────────
// Roger Avellana — Busto de puntos (cabecera de Sobre mí)
// Una figura humana genérica (cabeza, cuello, hombros y pecho) modelada con campos de distancia
// en 3D: cráneo, mandíbula, pómulos, cuencas, nariz, labios, orejas, músculos del cuello,
// clavículas, trapecios, hombros y pecho, con pelo de textura irregular. Se muestrean ~20.000
// puntos sobre su superficie, con la luz y el contorno marcados, sin modelos ni librerías.
// La cabeza gira hacia el cursor (el cuello se tuerce y el torso acompaña un poco) y los puntos
// cercanos al cursor se apartan. Los puntos se generan poco a poco y entran desde dispersos.
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

// ─── Formas básicas (distancia con signo; y hacia arriba, z hacia el espectador) ─────────────
function elipsoide(x: number, y: number, z: number, rx: number, ry: number, rz: number) {
  const k0 = Math.hypot(x / rx, y / ry, z / rz);
  const k1 = Math.hypot(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return k1 < 1e-9 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}
function capsula(x: number, y: number, z: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r: number) {
  const px = x - ax, py = y - ay, pz = z - az;
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  const h = Math.min(1, Math.max(0, (px * dx + py * dy + pz * dz) / (dx * dx + dy * dy + dz * dz)));
  return Math.hypot(px - dx * h, py - dy * h, pz - dz * h) - r;
}
const esfera = (x: number, y: number, z: number, r: number) => Math.hypot(x, y, z) - r;
// Unión y resta suaves (las piezas se funden como tejido)
function unir(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
const restar = (a: number, b: number, k: number) => -unir(-a, b, k);

// ─── La figura ─────────────────────────────────────────────────
function cabeza(x: number, y: number, z: number) {
  const ax = Math.abs(x);                                   // simetría
  let d = elipsoide(x, y - 0.56, z + 0.05, 0.35, 0.4, 0.41); // cráneo
  d = unir(d, elipsoide(x, y - 0.3, z - 0.07, 0.27, 0.33, 0.31), 0.14);       // cara
  d = unir(d, elipsoide(x, y - 0.1, z - 0.1, 0.215, 0.13, 0.2), 0.1);         // mandíbula
  d = unir(d, esfera(x, y - 0.02, z - 0.22, 0.075), 0.08);                     // barbilla
  d = unir(d, esfera(ax - 0.19, y - 0.35, z - 0.2, 0.075), 0.08);             // pómulos
  d = unir(d, capsula(ax, y, z, 0.03, 0.5, 0.29, 0.2, 0.5, 0.25, 0.045), 0.06); // arco de las cejas
  d = restar(d, esfera(ax - 0.115, y - 0.42, z - 0.35, 0.068), 0.04);         // cuencas
  d = unir(d, esfera(ax - 0.115, y - 0.42, z - 0.28, 0.052), 0.015);          // ojos
  // Nariz: puente, punta y aletas
  d = unir(d, capsula(x, y, z, 0, 0.47, 0.33, 0, 0.29, 0.42, 0.032), 0.04);
  d = unir(d, esfera(x, y - 0.27, z - 0.41, 0.045), 0.03);
  d = unir(d, esfera(ax - 0.042, y - 0.255, z - 0.365, 0.036), 0.03);
  // Labios y comisura
  d = unir(d, capsula(ax, y, z, 0, 0.175, 0.335, 0.075, 0.165, 0.3, 0.028), 0.03);
  d = unir(d, capsula(ax, y, z, 0, 0.12, 0.325, 0.065, 0.128, 0.29, 0.03), 0.03);
  d = restar(d, capsula(ax, y, z, 0, 0.148, 0.36, 0.08, 0.15, 0.31, 0.009), 0.012);
  // Orejas
  d = unir(d, elipsoide(ax - 0.355, y - 0.38, z + 0.03, 0.045, 0.1, 0.07), 0.035);
  return d;
}
function torso(x: number, y: number, z: number) {
  const ax = Math.abs(x);
  let d = capsula(x, y, z * 1.1, 0, 0.02, -0.04, 0, -0.5, -0.02, 0.15);           // cuello
  d = unir(d, capsula(ax, y, z, 0.2, 0.18, -0.02, 0.04, -0.43, 0.12, 0.045), 0.08); // músculos del cuello
  d = unir(d, esfera(x, y + 0.2, z - 0.1, 0.045), 0.06);                           // nuez
  d = unir(d, capsula(ax, y, z, 0.1, -0.2, -0.1, 0.6, -0.43, -0.06, 0.1), 0.16);   // trapecios
  d = unir(d, esfera(ax - 0.76, y + 0.57, z + 0.02, 0.2), 0.16);                   // hombros
  d = unir(d, capsula(ax, y, z, 0.78, -0.62, 0, 0.86, -1.8, 0.02, 0.17), 0.12);     // brazos
  d = unir(d, elipsoide(x, y + 1.0, z, 0.69, 0.62, 0.31), 0.22);                    // pecho
  d = unir(d, elipsoide(ax - 0.3, y + 0.78, z - 0.17, 0.27, 0.16, 0.12), 0.1);     // pectorales
  d = unir(d, capsula(ax, y, z, 0.05, -0.45, 0.17, 0.55, -0.42, 0.07, 0.026), 0.05); // clavículas
  return d;
}
// Pelo: casquete algo mayor que el cráneo, con rizos (relieve irregular) y nacimiento del pelo
function cascoPelo(x: number, y: number, z: number) {
  const rizo = Math.sin(x * 21 + 1.3) * Math.sin(y * 19 + 0.4) * Math.sin(z * 23 + 2.1)
    + 0.55 * Math.sin(x * 37 + z * 11) * Math.sin(y * 33 + 1.7);
  return elipsoide(x, y - 0.6, z + 0.07, 0.395, 0.43, 0.45) - 0.03 * rizo;
}
const limitePelo = (x: number, z: number) =>
  0.22 + 0.44 * suave(-0.32, 0.22, z) - 0.1 * suave(0.3, 0.42, Math.abs(x)) * suave(-0.1, 0.2, z);
function pelo(x: number, y: number, z: number) {
  return Math.max(cascoPelo(x, y, z), limitePelo(x, z) - y);
}
function figura(x: number, y: number, z: number) {
  let d = 1e9;
  if (y > -0.12) d = Math.min(d, pelo(x, y, z), cabeza(x, y, z));
  if (y < 0.3) d = d === 1e9 ? torso(x, y, z) : unir(d, torso(x, y, z), 0.1);
  return d;
}

// ─── Puntos sobre la superficie ────────────────────────────────
interface Region { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; meta: number }
const REGIONES: Region[] = [
  { x0: -0.52, x1: 0.52, y0: -0.12, y1: 1.12, z0: -0.56, z1: 0.52, meta: 10000 },  // cabeza
  { x0: -1.08, x1: 1.08, y0: -1.55, y1: 0.05, z0: -0.48, z1: 0.42, meta: 14000 },  // cuello, hombros y pecho
];
const TOTAL = REGIONES.reduce((s, r) => s + r.meta, 0);
const E = 0.0025;

function generador(sx: Float32Array, sy: Float32Array, sz: Float32Array, nx: Float32Array, ny: Float32Array, nz: Float32Array, brillo: Float32Array) {
  const r = aleatorio(20261118);
  let n = 0, region = 0, enRegion = 0;
  const grad = (x: number, y: number, z: number) => {
    const gx = figura(x + E, y, z) - figura(x - E, y, z);
    const gy = figura(x, y + E, z) - figura(x, y - E, z);
    const gz = figura(x, y, z + E) - figura(x, y, z - E);
    const l = Math.hypot(gx, gy, gz) || 1;
    return [gx / l, gy / l, gz / l];
  };
  // Devuelve cuántos puntos hay hechos; trabaja hasta agotar el tiempo dado (ms)
  return (presupuesto: number) => {
    const fin = performance.now() + presupuesto;
    while (n < TOTAL && performance.now() < fin) {
      for (let k = 0; k < 200 && n < TOTAL; k++) {
        const R = REGIONES[region];
        let x = R.x0 + r() * (R.x1 - R.x0), y = R.y0 + r() * (R.y1 - R.y0), z = R.z0 + r() * (R.z1 - R.z0);
        let d = figura(x, y, z);
        if (Math.abs(d) > 0.035) continue;                   // solo cerca de la superficie
        let g = grad(x, y, z);
        for (let it = 0; it < 2; it++) {                     // acercar a la superficie
          x -= d * g[0]; y -= d * g[1]; z -= d * g[2];
          d = figura(x, y, z);
          g = grad(x, y, z);
        }
        if (Math.abs(d) > 0.004 || y < -1.5) continue;
        if (region === 0 && y < -0.1) continue;              // cada región, su parte
        if (region === 1 && y >= -0.1) continue;
        sx[n] = x; sy[n] = y; sz[n] = z; nx[n] = g[0]; ny[n] = g[1]; nz[n] = g[2];
        const esPelo = pelo(x, y, z) < 0.006;
        // Sin puntos en el corte plano del pelo (dibujaría una línea en la frente)
        if (esPelo && cascoPelo(x, y, z) < -0.006) continue;
        brillo[n] = esPelo ? 0.7 + r() * 0.7 : 0.82 + r() * 0.36;
        n++;
        if (++enRegion >= R.meta && region < REGIONES.length - 1) { region++; enRegion = 0; }
      }
    }
    return n;
  };
}

const NIVELES = 8;
const LUZ = (() => { const l = Math.hypot(-0.5, 0.55, 0.65); return [-0.5 / l, 0.55 / l, 0.65 / l]; })();
const PASOS = 16;                         // niveles de torsión del cuello (matrices precalculadas)

function iniciarBusto(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const px = new Float32Array(TOTAL), py = new Float32Array(TOTAL), pz = new Float32Array(TOTAL);
  const nx = new Float32Array(TOTAL), ny = new Float32Array(TOTAL), nz = new Float32Array(TOTAL);
  const brillo = new Float32Array(TOTAL);
  const torsion = new Uint8Array(TOTAL), nace = new Float32Array(TOTAL);
  const ox = new Float32Array(TOTAL), oy = new Float32Array(TOTAL);
  const sx = new Float32Array(TOTAL), sy = new Float32Array(TOTAL), op = new Uint8Array(TOTAL);
  const generar = generador(px, py, pz, nx, ny, nz, brillo);
  const azar = aleatorio(7);
  let hechos = 0;
  const preparar = (desde: number, hasta: number, t: number) => {
    for (let i = desde; i < hasta; i++) {
      // Cuánto sigue el giro: cabeza entera, cuello cada vez menos, torso un poco
      const k = 0.14 + 0.86 * suave(-0.62, -0.02, py[i]);
      torsion[i] = Math.round(k * (PASOS - 1));
      const a = azar() * Math.PI * 2, dd = 0.5 + azar() * 1.3;
      ox[i] = Math.cos(a) * dd; oy[i] = Math.sin(a) * dd * 0.8;
      nace[i] = t + azar() * 350;
    }
  };

  let w = 0, h = 0, escala = 1, cx = 0, arriba = 0;
  let color = '#5850ec';
  const leerColor = () => { color = getComputedStyle(canvas).color || color; };
  const redimensionar = () => {
    ({ w, h } = ajustarCanvas(canvas, ctx));
    escala = Math.min(w / 2.2, h / 2.2);      // el pecho se corta abajo (el lienzo lo funde)
    cx = w / 2;
    arriba = h * 0.04;
    leerColor();
  };

  let mx = -9999, my = -9999, ultimoMov = -1e9;
  if (finePointer && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY; ultimoMov = performance.now();
    }, { passive: true });
  }
  new MutationObserver(leerColor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let giro = -0.22, cabeceo = 0.03;
  const PIVOTE_Y = -0.08, PIVOTE_Z = -0.04;

  const dibujar = (t: number) => {
    // Generar más puntos (poco a poco para no bloquear la página)
    if (hechos < TOTAL) {
      const antes = hechos;
      hechos = generar(reduceMotion ? 1e5 : 7);
      preparar(antes, hechos, reduceMotion ? -1e6 : t);
    }
    const rect = canvas.getBoundingClientRect();
    let objGiro = Math.sin(t * 0.00033) * 0.3 - 0.1;
    let objCabeceo = Math.sin(t * 0.00025) * 0.07;
    const lx = mx - rect.left, ly = my - rect.top;
    const sigue = t - ultimoMov < 4000;
    if (sigue) {
      const hx = cx, hy = arriba + (1.12 - 0.4) * escala;
      objGiro = Math.max(-1, Math.min(1, (lx - hx) / (innerWidth * 0.45))) * 0.75;
      objCabeceo = Math.max(-1, Math.min(1, (ly - hy) / (innerHeight * 0.5))) * 0.32;
    }
    if (reduceMotion) { objGiro = -0.22; objCabeceo = 0.03; }
    giro += (objGiro - giro) * 0.07;
    cabeceo += (objCabeceo - cabeceo) * 0.07;

    // Matrices por nivel de torsión
    const ca = new Float32Array(PASOS), sa = new Float32Array(PASOS), cb = new Float32Array(PASOS), sb = new Float32Array(PASOS);
    for (let s = 0; s < PASOS; s++) {
      const k = s / (PASOS - 1);
      ca[s] = Math.cos(giro * k); sa[s] = Math.sin(giro * k);
      const kc = suave(0.45, 1, k);
      cb[s] = Math.cos(cabeceo * kc); sb[s] = Math.sin(cabeceo * kc);
    }
    const RADIO = 52, D = 4;
    for (let i = 0; i < hechos; i++) {
      const s = torsion[i];
      // Giro sobre el eje del cuello y cabeceo sobre su base
      const x = px[i], y = py[i] - PIVOTE_Y, z = pz[i] - PIVOTE_Z;
      const x1 = x * ca[s] + z * sa[s], z1 = -x * sa[s] + z * ca[s];
      const y1 = y * cb[s] - z1 * sb[s], z2 = y * sb[s] + z1 * cb[s];
      const n0 = nx[i], n1 = ny[i], n2 = nz[i];
      const m0 = n0 * ca[s] + n2 * sa[s], m2a = -n0 * sa[s] + n2 * ca[s];
      const m1 = n1 * cb[s] - m2a * sb[s], m2 = n1 * sb[s] + m2a * cb[s];
      // Luz difusa + contorno (los bordes de la silueta se iluminan)
      const difusa = Math.max(0, m0 * LUZ[0] + m1 * LUZ[1] + m2 * LUZ[2]);
      const contorno = Math.pow(1 - Math.min(1, Math.abs(m2)), 2);
      let a = (0.22 + 0.58 * difusa + 0.5 * contorno) * brillo[i];
      if (m2 < -0.05) a *= 0.14;                              // cara oculta
      const f = D / (D - (z2 + PIVOTE_Z));
      let qx = cx + x1 * escala * f;
      let qy = arriba + (1.12 - (y1 + PIVOTE_Y)) * escala * f;
      if (!reduceMotion) {
        let p = Math.min(1, Math.max(0, (t - nace[i]) / 900));
        if (p < 1) {
          p = 1 - Math.pow(1 - p, 3);
          qx += ox[i] * escala * (1 - p); qy += oy[i] * escala * (1 - p); a *= 0.3 + 0.7 * p;
        }
      }
      if (sigue && !reduceMotion) {
        const dx = qx - lx, dy = qy - ly, d = Math.hypot(dx, dy);
        if (d < RADIO && d > 0.01) {
          const empuje = Math.pow(1 - d / RADIO, 2) * 14;
          qx += (dx / d) * empuje; qy += (dy / d) * empuje;
        }
      }
      sx[i] = qx; sy[i] = qy;
      op[i] = Math.min(NIVELES - 1, Math.max(0, Math.round(a * (NIVELES - 1))));
    }

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    for (let nivel = 1; nivel < NIVELES; nivel++) {
      ctx.globalAlpha = 0.14 + (nivel / (NIVELES - 1)) * 0.86;
      const lado = nivel > 4 ? 1.5 : 1.2;
      for (let i = 0; i < hechos; i++) if (op[i] === nivel) ctx.fillRect(sx[i], sy[i], lado, lado);
    }
    ctx.globalAlpha = 1;
  };

  redimensionar();
  alRedimensionar(() => { redimensionar(); if (reduceMotion) dibujar(performance.now()); });
  if (reduceMotion) { dibujar(performance.now()); return; }
  animarEnPantalla(canvas, dibujar);
}

document.querySelectorAll<HTMLCanvasElement>('.busto-field').forEach(iniciarBusto);
