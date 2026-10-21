// ────────────────────────────────────────────────────────────────
// Roger Avellana — IOI, la criatura pixelada interactiva
// Se usa en la página IOI (sobre la consola) y en la portada (sobre la terminal
// del bloque IOI). Cada robot se declara en el HTML:
//   <div class="ioi-perch" data-ioi="lab|home">
//     <button class="ioi-bot"><canvas class="ioi-canvas" width="16" height="16"></canvas></button>
//     <p class="ioi-bubble" role="status" aria-live="polite"></p>
//     …contenido sobre el que se sienta…
//   </div>
// ────────────────────────────────────────────────────────────────
import { LANG, reduceMotion, tr } from './utilidades';

// Frases según dónde esté IOI
const FRASES: Record<'lab' | 'home', string[]> = {
  lab: LANG === 'en' ? [
    "Hi! I'm IOI, Roger's AI copilot.",
    'AI proposes; you decide.',
    'Shall we automate something today?',
    'Thinking in pixels…',
    'Psst… try moving your cursor.',
    'I never skip the human review step.',
  ] : [
    '¡Hola! Soy IOI, el copiloto de IA de Roger.',
    'La IA propone; tú decides.',
    '¿Automatizamos algo hoy?',
    'Pensando en píxeles…',
    'Psst… prueba a mover el cursor.',
    'Nunca me salto la revisión humana.',
  ],
  home: LANG === 'en' ? [
    "Hi! I'm IOI, Roger's AI copilot.",
    'Come to my section: I’ll show you how Roger works with AI.',
    'I’ve got workflows, agents and a console that writes by itself.',
    'Psst… click “Discover how I use AI”.',
    'AI proposes; Roger decides.',
  ] : [
    '¡Hola! Soy IOI, el copiloto de IA de Roger.',
    'Pasa a mi sección: te enseño cómo trabaja Roger con IA.',
    'Tengo flujos, agentes y una consola que escribe sola.',
    'Psst… haz clic en «Descubre cómo uso la IA».',
    'La IA propone; Roger decide.',
  ],
};

// Sprite 16×16. O contorno · H cuerpo claro · B cuerpo sombra · A brazos · F pantalla · S antena · L luz
const CUERPO = [
  '.......LL.......',
  '.......SS.......',
  '...OOOOOOOOOO...',
  '..OHHHHHHHHHHO..',
  '..OHFFFFFFFFHO..',
  '..OHFFFFFFFFHO..',
  '..OHFFFFFFFFHO..',
  '..OHFFFFFFFFHO..',
  '..OBHHHHHHHHBO..',
  '...OOOOOOOOOO...',
  '....OBBHHBBO....',
  '..AAOBHHHHBOAA..',
  '..A.OBBHHBBO.A..',
  '....OOOOOOOO....',
  '.....OO..OO.....',
  '....OOO..OOO....',
];
// Brazo derecho levantado (saludo)
const SALUDO: Record<number, string> = { 10: '....OBBHHBBO.A..', 11: '..AAOBHHHHBOA...', 12: '..A.OBBHHBBO....' };
const COLORES: Record<string, string> = { O: '#2a2466', H: '#c6a8ff', B: '#8f88ff', A: '#8f88ff', F: '#15132a', S: '#8f88ff' };
const OJO = '#8ff5d2';
const LED = { idle: '#f7b98a', ready: '#3fbf8a', off: '#4a3a66' };

function crearIOI(percha: HTMLElement): void {
  const bot = percha.querySelector<HTMLButtonElement>('.ioi-bot');
  const canvas = percha.querySelector<HTMLCanvasElement>('.ioi-canvas');
  const burbuja = percha.querySelector<HTMLElement>('.ioi-bubble');
  const ctx = canvas?.getContext('2d');
  if (!bot || !canvas || !ctx) return;
  const lugar = percha.getAttribute('data-ioi') === 'home' ? 'home' : 'lab';
  const frases = FRASES[lugar];
  const consola = percha.querySelector('.ai-console'); // solo en la página IOI

  const mirada = { x: 0, y: 0 };
  let parpadeando = false, contento = false, saludando = false, brazoArriba = false;
  let estadoLed: 'idle' | 'ready' = 'idle', ledApagado = false;

  const px = (x: number, y: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };

  const dibujar = () => {
    ctx.clearRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y++) {
      const fila = (saludando && brazoArriba && SALUDO[y]) ? SALUDO[y] : CUERPO[y];
      for (let x = 0; x < 16; x++) {
        const ch = fila[x];
        if (ch === 'L') px(x, y, ledApagado ? LED.off : LED[estadoLed]);
        else if (COLORES[ch]) px(x, y, COLORES[ch]);
      }
    }
    // Brillo en la cabeza
    px(4, 3, '#ece9ff'); px(5, 3, '#ece9ff');
    // Ojos (2×2) que miran hacia el cursor dentro de la pantalla
    const ex = mirada.x, ey = mirada.y;
    [5, 9].forEach((bx) => {
      const x0 = bx + ex, y0 = 5 + ey;
      if (contento) {            // ojos contentos: ^ ^
        px(x0, y0 + 1, OJO); px(x0 + 1, y0, OJO);
      } else if (parpadeando) {  // parpadeo: una línea
        px(x0, y0 + 1, OJO); px(x0 + 1, y0 + 1, OJO);
      } else {
        px(x0, y0, OJO); px(x0 + 1, y0, OJO); px(x0, y0 + 1, OJO); px(x0 + 1, y0 + 1, OJO);
      }
    });
    if (contento) { px(7, 7 + Math.max(0, ey), '#f7b98a'); px(8, 7 + Math.max(0, ey), '#f7b98a'); } // sonrisa
  };

  // Los ojos siguen al cursor por toda la página
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.35);
    const nx = Math.abs(dx) < 50 ? 0 : (dx > 0 ? 1 : -1);
    const ny = Math.abs(dy) < 50 ? 0 : (dy > 0 ? 1 : -1);
    if (nx !== mirada.x || ny !== mirada.y) { mirada.x = nx; mirada.y = ny; dibujar(); }
  }, { passive: true });

  // Parpadeo aleatorio
  const programarParpadeo = () => {
    setTimeout(() => {
      parpadeando = true; dibujar();
      setTimeout(() => { parpadeando = false; dibujar(); programarParpadeo(); }, 140);
    }, 2200 + Math.random() * 3000);
  };
  programarParpadeo();

  // Saludo con el brazo al pasar el ratón o con el foco del teclado
  let timerSaludo = 0;
  const empezarSaludo = () => {
    if (saludando) return;
    saludando = true;
    timerSaludo = window.setInterval(() => { brazoArriba = !brazoArriba; dibujar(); }, reduceMotion ? 600 : 260);
  };
  const pararSaludo = () => { saludando = false; brazoArriba = false; clearInterval(timerSaludo); dibujar(); };
  bot.addEventListener('pointerenter', empezarSaludo);
  bot.addEventListener('pointerleave', pararSaludo);
  bot.addEventListener('focus', empezarSaludo);
  bot.addEventListener('blur', pararSaludo);

  // Clic: salta, se pone contento y dice algo
  let indiceFrase = 0, timerBurbuja = 0, timerContento = 0;
  const decir = (texto: string) => {
    if (!burbuja) return;
    burbuja.textContent = texto;
    burbuja.classList.add('is-visible');
    clearTimeout(timerBurbuja);
    timerBurbuja = window.setTimeout(() => burbuja.classList.remove('is-visible'), 3000);
  };
  const decirSiguiente = () => {
    decir(frases[indiceFrase]);
    indiceFrase = (indiceFrase + 1) % frases.length;
  };

  bot.addEventListener('click', () => {
    decirSiguiente();
    contento = true; dibujar();
    clearTimeout(timerContento);
    timerContento = window.setTimeout(() => { contento = false; dibujar(); }, 1400);
    if (!reduceMotion) {
      bot.classList.remove('is-jumping');
      void bot.offsetWidth; // reinicia la animación
      bot.classList.add('is-jumping');
    }
  });
  bot.addEventListener('animationend', (e) => {
    if (e.animationName === 'ioi-jump') bot.classList.remove('is-jumping');
  });

  // En la página IOI, la antena refleja lo que hace la consola
  if (consola && 'MutationObserver' in window) {
    let timerLed = 0, ultimo = '';
    const sincronizarLed = () => {
      const pensando = consola.classList.contains('is-thinking');
      const estado = consola.querySelector('#console-status');
      const lista = estado?.textContent === tr('respuesta lista', 'response ready');
      const ahora = pensando ? 'thinking' : (lista ? 'ready' : 'idle');
      if (ahora === ultimo) return;   // solo reacciona a cambios de estado
      ultimo = ahora;
      clearInterval(timerLed); ledApagado = false;
      if (pensando) {
        estadoLed = 'idle';
        if (!reduceMotion) timerLed = window.setInterval(() => { ledApagado = !ledApagado; dibujar(); }, 180);
      } else {
        estadoLed = lista ? 'ready' : 'idle';
      }
      dibujar();
    };
    new MutationObserver(sincronizarLed).observe(consola, { attributes: true, attributeFilter: ['class'], subtree: true, childList: true, characterData: true });
    sincronizarLed();
  } else {
    estadoLed = 'ready';
  }

  dibujar();

  // Saludo inicial: al cargar en la página IOI; al llegar con el scroll en la portada
  if (reduceMotion) return;
  if (lugar === 'home' && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setTimeout(decirSiguiente, 400); obs.disconnect(); }
    }, { threshold: 0.6 });
    obs.observe(bot);
  } else {
    setTimeout(decirSiguiente, 1200);
  }
}

document.querySelectorAll<HTMLElement>('.ioi-perch').forEach(crearIOI);
