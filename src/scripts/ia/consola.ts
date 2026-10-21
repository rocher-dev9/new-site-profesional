// IOI: consola que escribe instrucciones y "genera" respuestas
import { LANG, reduceMotion, tr } from '../utilidades';

interface Dialogo { model: string; q: string; a: string }

const DIALOGOS: Dialogo[] = LANG === 'en' ? [
  { model: 'claude', q: 'Suggest three concepts for a specialty coffee brand',
    a: '1. "Origin": serif type and earthy tones. 2. "Ritual": warm minimalism. 3. "Roast": contrast and texture.' },
  { model: 'chatgpt', q: 'Give me five headlines to launch a booking app',
    a: '"Book in 3 taps" · "Your table is waiting" · "No calls, no waiting" · "Plans, sorted" · "Tonight you eat out".' },
  { model: 'gemini', q: 'Summarize the September campaign metrics',
    a: 'Reach grew steadily; carousels outperform every other format in saves. Recommendation: more educational carousels.' },
  { model: 'claude', q: 'Review the tone of this copy so it sounds warmer',
    a: 'I would change "We offer end-to-end solutions" to "We help you from start to finish". More direct, more human.' },
] : [
  { model: 'claude', q: 'Propón tres conceptos para una marca de café de especialidad',
    a: '1. «Origen»: tipografía serif y tonos tierra. 2. «Ritual»: minimalismo cálido. 3. «Tueste»: contraste y textura.' },
  { model: 'chatgpt', q: 'Dame cinco titulares para lanzar una app de reservas',
    a: '«Reserva en 3 toques» · «Tu mesa te espera» · «Sin llamadas, sin esperas» · «El plan, resuelto» · «Hoy cenas fuera».' },
  { model: 'gemini', q: 'Resume las métricas de la campaña de septiembre',
    a: 'El alcance creció de forma sostenida; los carruseles superan al resto de formatos en guardados. Recomendación: más carruseles educativos.' },
  { model: 'claude', q: 'Revisa el tono de este copy para que suene más cercano',
    a: 'Cambiaría «Ofrecemos soluciones integrales» por «Te ayudamos de principio a fin». Más directo, más humano.' },
];

const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function iniciarConsola(): void {
  const instruccion = document.getElementById('console-prompt');
  const respuesta = document.getElementById('console-answer');
  const estado = document.getElementById('console-status');
  const tokens = document.getElementById('console-tokens');
  const modelo = document.getElementById('console-model');
  const caja = instruccion?.closest('.ai-console');
  if (!instruccion || !respuesta || !estado || !tokens || !modelo || !caja || reduceMotion) return;

  let indice = 0;

  // Escribe letra a letra
  const teclear = (el: HTMLElement, texto: string, velocidad: number) => new Promise<void>((resolve) => {
    let n = 0;
    const paso = () => {
      el.textContent = texto.slice(0, ++n);
      if (n < texto.length) setTimeout(paso, velocidad + Math.random() * velocidad);
      else resolve();
    };
    paso();
  });

  // Muestra la respuesta palabra a palabra, como un modelo generando
  const generar = (texto: string) => new Promise<void>((resolve) => {
    const palabras = texto.split(' ');
    let n = 0;
    const paso = () => {
      n++;
      respuesta.textContent = palabras.slice(0, n).join(' ');
      tokens.textContent = Math.round(n * 1.4) + ' tokens';
      if (n < palabras.length) setTimeout(paso, 70 + Math.random() * 90);
      else resolve();
    };
    paso();
  });

  const bucle = async (): Promise<void> => {
    const d = DIALOGOS[indice];
    respuesta.textContent = '';
    instruccion.textContent = '';
    tokens.textContent = '0 tokens';
    modelo.textContent = d.model;
    estado.textContent = tr('esperando instrucción', 'waiting for instructions');
    await teclear(instruccion, d.q, 28);
    caja.classList.add('is-thinking');
    estado.textContent = tr('pensando…', 'thinking…');
    await esperar(900);
    estado.textContent = tr('generando', 'generating');
    await generar(d.a);
    caja.classList.remove('is-thinking');
    estado.textContent = tr('respuesta lista', 'response ready');
    await esperar(3200);
    indice = (indice + 1) % DIALOGOS.length;
    return bucle();
  };

  // El primer diálogo ya viene escrito en el HTML; la animación empieza por el segundo
  esperar(2200).then(() => { indice = 1; bucle(); });
}
