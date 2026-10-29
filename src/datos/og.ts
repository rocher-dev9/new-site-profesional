// ────────────────────────────────────────────────────────────────
// Imágenes de vista previa al compartir (Open Graph, 1200×630).
// Se generan solas al compilar (src/pages/og/[imagen].png.ts): una por página y idioma,
// y una por caso de estudio a partir de sus datos (src/proyectos/<clave>/es.json / en.json).
// ────────────────────────────────────────────────────────────────
import type { Lang } from '../i18n/rutas';

export interface ImagenOG {
  lang: Lang;
  etiqueta: string;     // texto pequeño sobre el título
  titulo: string;       // primera parte del titular
  destacado: string;    // parte del titular en índigo
  texto: string;        // línea final
  color?: string;       // color del proyecto (casos de estudio)
  num?: number;         // número del proyecto (casos de estudio)
  cliente?: string;
}

const PIE = { es: 'Diseño visual, branding, UI/UX e IA · Barcelona', en: 'Visual design, branding, UI/UX and AI · Barcelona' };

/** Páginas: clave = <sección>-<idioma> */
export const imagenesPaginas: Record<string, ImagenOG> = {
  'inicio-es': { lang: 'es', etiqueta: 'Diseño y estrategia', titulo: 'Diseño que comunica,', destacado: 'estrategia que conecta.', texto: PIE.es },
  'inicio-en': { lang: 'en', etiqueta: 'Design & strategy', titulo: 'Design that communicates,', destacado: 'strategy that connects.', texto: PIE.en },
  'entorno-es': { lang: 'es', etiqueta: 'Entorno', titulo: 'Lo que', destacado: 'hago.', texto: 'Servicios, herramientas, vibe coding y automatización con IA.' },
  'entorno-en': { lang: 'en', etiqueta: 'Workspace', titulo: 'What I', destacado: 'do.', texto: 'Services, tools, vibe coding and AI automation.' },
  'trabajo-es': { lang: 'es', etiqueta: 'Trabajo', titulo: 'Proyectos', destacado: 'seleccionados.', texto: 'Intera · Sensing & Control · nVision' },
  'trabajo-en': { lang: 'en', etiqueta: 'Work', titulo: 'Selected', destacado: 'projects.', texto: 'Intera · Sensing & Control · nVision' },
  'ioi-es': { lang: 'es', etiqueta: 'IOI · inteligencia artificial', titulo: 'Diseño con criterio.', destacado: 'Acelerado por IA.', texto: 'Proceso, herramientas, automatización y agentes.' },
  'ioi-en': { lang: 'en', etiqueta: 'IOI · artificial intelligence', titulo: 'Design with judgment.', destacado: 'Accelerated by AI.', texto: 'Process, tools, automation and agents.' },
  'sobreMi-es': { lang: 'es', etiqueta: 'Sobre mí', titulo: 'Hola, soy', destacado: 'Roger.', texto: PIE.es },
  'sobreMi-en': { lang: 'en', etiqueta: 'About', titulo: "Hi, I'm", destacado: 'Roger.', texto: PIE.en },
  'privacidad-es': { lang: 'es', etiqueta: 'Legal', titulo: 'Aviso legal y', destacado: 'privacidad.', texto: 'Sin cookies ni formularios.' },
  'privacidad-en': { lang: 'en', etiqueta: 'Legal', titulo: 'Legal notice &', destacado: 'privacy.', texto: 'No cookies, no forms.' },
};
