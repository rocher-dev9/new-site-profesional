// ────────────────────────────────────────────────────────────────
// Herramientas de IA generativa (Entorno → Mi caja de herramientas).
// logo: nombre del icono de Simple Icons guardado en public/img/iconos/; si no hay, se muestra el monograma.
// Para usar un logo propio, guárdalo en public/img/herramientas/ y pon su ruta en «imagen».
// CONTENIDO PROVISIONAL: las frases de uso son una propuesta; revisarlas.
// ────────────────────────────────────────────────────────────────
import type { Lang } from '../i18n/rutas';

export interface Herramienta {
  nombre: string;
  empresa?: string;
  color: string;        // color de marca: placa y sombra al pasar el ratón
  logo?: string;        // icono de Simple Icons
  imagen?: string;      // logo propio (ruta dentro de public/)
  monograma: string;
  uso: Record<Lang, string>;
}

export const herramientasIA: Herramienta[] = [
  { nombre: 'ChatGPT', empresa: 'OpenAI', color: '#10a37f', monograma: 'CH',
    uso: { es: 'Lluvia de ideas, primeros borradores de copy e imágenes rápidas para explorar.', en: 'Brainstorming, first copy drafts and quick images to explore ideas.' } },
  { nombre: 'Claude', empresa: 'Anthropic', color: '#D97757', logo: 'claude', monograma: 'CL',
    uso: { es: 'Estrategia, textos largos, análisis de documentos y revisión de código.', en: 'Strategy, long-form writing, document analysis and code review.' } },
  { nombre: 'Gemini', empresa: 'Google', color: '#8E75B2', logo: 'googlegemini', monograma: 'GE',
    uso: { es: 'Investigación con fuentes, resúmenes y trabajo dentro de Google Workspace.', en: 'Source-based research, summaries and work inside Google Workspace.' } },
  { nombre: 'Midjourney', color: '#15121f', monograma: 'MJ',
    uso: { es: 'Moodboards, direcciones de arte y exploración visual de conceptos.', en: 'Moodboards, art directions and visual concept exploration.' } },
  { nombre: 'Adobe Firefly', empresa: 'Adobe', color: '#e8834a', monograma: 'FF',
    uso: { es: 'Relleno generativo y retoque dentro de Photoshop e Illustrator.', en: 'Generative fill and retouching inside Photoshop and Illustrator.' } },
  { nombre: 'Higgsfield', color: '#7a5bd8', monograma: 'HI',
    uso: { es: 'Vídeo corto con IA para redes y piezas animadas de campaña.', en: 'Short AI video for social media and animated campaign pieces.' } },
];
