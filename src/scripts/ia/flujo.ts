// IOI (Automatización): pestañas del flujo disparador → IA → revisión → resultado
import { LANG, reduceMotion } from '../utilidades';

const FLUJOS: string[][] = LANG === 'en' ? [
  ['New idea in the content calendar', 'Drafts copy and variants for each channel',
    'I refine tone, message and design', 'Post scheduled on social media'],
  ['Campaign month-end', 'Gathers the data and summarizes key metrics',
    'I interpret results and add recommendations', 'Report sent to the client'],
  ['A brief arrives by email or form', 'Extracts goals, audience, deadlines and deliverables',
    'I validate the scope and clear up questions', 'Tasks created in the project manager'],
] : [
  ['Nueva idea en el calendario editorial', 'Redacta borradores de copy y variantes por canal',
    'Ajusto tono, mensaje y diseño', 'Publicación programada en redes'],
  ['Cierre de mes de la campaña', 'Recopila los datos y resume las métricas clave',
    'Interpreto resultados y añado recomendaciones', 'Informe enviado al cliente'],
  ['Llega un brief por email o formulario', 'Extrae objetivos, público, plazos y entregables',
    'Valido el alcance y resuelvo dudas', 'Tareas creadas en el gestor de proyectos'],
];

export function iniciarFlujo(): void {
  const flujo = document.getElementById('ai-flow');
  if (!flujo) return;
  const textos = flujo.querySelectorAll('.ai-node-text');
  const pestanas = document.querySelectorAll<HTMLElement>('.ai-flow-tab');

  pestanas.forEach((pestana) => {
    pestana.addEventListener('click', () => {
      const k = Number(pestana.getAttribute('data-flow'));
      pestanas.forEach((x) => x.setAttribute('aria-selected', String(x === pestana)));
      flujo.classList.add('is-switching');
      setTimeout(() => {
        textos.forEach((el, n) => { el.textContent = FLUJOS[k][n]; });
        flujo.classList.remove('is-switching');
      }, reduceMotion ? 0 : 250);
    });
  });
}
