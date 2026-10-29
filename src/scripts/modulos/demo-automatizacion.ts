// Entorno: demo de automatización (origen → n8n + IA → destino) con pestañas
import { LANG, reduceMotion } from '../utilidades';

type Nodo = [logo: string, nombre: string, paso: string];
interface Flujo { n: [Nodo, Nodo, Nodo]; cap: string }

// Logos de Simple Icons (CC0) guardados en public/img/iconos/
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const ICONO = (slug: string) => `url(${BASE}img/iconos/${slug}.svg)`;

const FLUJOS: Flujo[] = LANG === 'en' ? [
  { n: [['googleforms', 'Google Forms', '1 · a brief comes in'], ['n8n', 'n8n + Claude', '2 · summarizes and sorts it'], ['notion', 'Notion', '3 · creates the project card']],
    cap: 'Every incoming brief is summarized with AI and turned into a project card in Notion, with tasks and deadlines.' },
  { n: [['googlesheets', 'Google Sheets', '1 · campaign metrics'], ['n8n', 'n8n + ChatGPT', '2 · analyzes and writes'], ['gmail', 'Gmail', '3 · sends the report']],
    cap: 'Every Monday the campaign data is analyzed with AI and the client receives a clear report by email.' },
  { n: [['figma', 'Figma', '1 · design approved'], ['n8n', 'n8n + Gemini', '2 · writes the copy'], ['instagram', 'Instagram', '3 · schedules the post']],
    cap: 'When a design is approved, AI writes the copy for each channel and the post is left scheduled for review.' },
] : [
  { n: [['googleforms', 'Google Forms', '1 · llega un brief'], ['n8n', 'n8n + Claude', '2 · lo resume y clasifica'], ['notion', 'Notion', '3 · crea la ficha del proyecto']],
    cap: 'Cada brief que llega se resume con IA y se convierte en una ficha de proyecto en Notion, con tareas y plazos.' },
  { n: [['googlesheets', 'Google Sheets', '1 · métricas de la campaña'], ['n8n', 'n8n + ChatGPT', '2 · analiza y redacta'], ['gmail', 'Gmail', '3 · envía el informe']],
    cap: 'Cada lunes los datos de la campaña se analizan con IA y el cliente recibe un informe claro por email.' },
  { n: [['figma', 'Figma', '1 · diseño aprobado'], ['n8n', 'n8n + Gemini', '2 · escribe los copys'], ['instagram', 'Instagram', '3 · programa la publicación']],
    cap: 'Cuando se aprueba un diseño, la IA redacta los copys por canal y la publicación queda programada para revisar.' },
];

export function iniciarDemoAutomatizacion(): void {
  const demo = document.getElementById('auto-demo');
  const flujo = demo?.querySelector('.ad-flow');
  const pie = demo?.querySelector('.ad-caption');
  if (!demo || !flujo || !pie) return;
  const nodos = demo.querySelectorAll<HTMLElement>('.ad-node');
  const pestanas = demo.querySelectorAll<HTMLElement>('.ad-tab');

  pestanas.forEach((pestana) => {
    pestana.addEventListener('click', () => {
      const f = FLUJOS[Number(pestana.getAttribute('data-flow'))];
      pestanas.forEach((x) => x.setAttribute('aria-selected', String(x === pestana)));
      flujo.classList.add('is-switching'); pie.classList.add('is-switching');
      setTimeout(() => {
        nodos.forEach((nodo, k) => {
          nodo.querySelector<HTMLElement>('.ad-ico')?.style.setProperty('--logo', ICONO(f.n[k][0]));
          const nombre = nodo.querySelector('strong'); if (nombre) nombre.textContent = f.n[k][1];
          const paso = nodo.querySelector('small'); if (paso) paso.textContent = f.n[k][2];
        });
        const texto = pie.querySelector('.ad-caption-text'); if (texto) texto.textContent = f.cap;
        flujo.classList.remove('is-switching'); pie.classList.remove('is-switching');
      }, reduceMotion ? 0 : 200);
    });
  });
}
