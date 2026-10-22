// ────────────────────────────────────────────────────────────────
// Proyectos de Trabajo, en orden. Se usan en:
//   · Trabajo: una fila por proyecto (nombre, descripción, panel con comentarios y pie)
//   · Portada: tarjetas de proyecto
//   · Cabecera de Trabajo: baraja animada
// La ilustración de cada proyecto está en src/proyectos/<clave>/Tarjeta.astro.
// «Ver caso» se enlaza solo cuando existe el caso (src/proyectos/<clave>/es.json o en.json).
// CONTENIDO PROVISIONAL: textos de los comentarios y pies inventados; revisar.
// ────────────────────────────────────────────────────────────────
import type { Lang } from '../i18n/rutas';

type Textos = Record<Lang, string>;

/** Comentario flotante del panel (estilo revisión de diseño) */
export interface Comentario {
  autor: string;      // nombre que aparece en la burbuja y en la etiqueta del cursor
  texto: Textos;
}

export interface Tarjeta {
  clave: string;      // carpeta del proyecto en src/proyectos/
  num: number;        // número del proyecto (01, 02…)
  fondo: string;      // color del proyecto (portada de la tarjeta e ilustraciones)
  anio: string;
  cliente: string;
  etiqueta: Textos;   // disciplina corta (branding, ui/ux…)
  subtitulo: Textos;  // qué se hizo, p. ej. «identidad y estrategia digital»
  texto: Textos;      // descripción del proyecto
  pie: Record<Lang, { titulo: string; texto: string }>; // línea bajo el panel en Trabajo
  comentarios: [Comentario, Comentario];
}

export const tarjetas: Tarjeta[] = [
  {
    clave: 'intera',
    num: 1,
    fondo: '#504FED',
    anio: '2023–2026',
    cliente: 'Intera',
    etiqueta: { es: 'branding', en: 'branding' },
    subtitulo: { es: 'identidad y estrategia digital', en: 'identity and digital strategy' },
    texto: {
      es: 'Rediseño de la identidad visual y estrategia de contenido para redes: un sistema de marca aplicado a todos los materiales y un calendario editorial con métricas mensuales.',
      en: 'Visual identity redesign and social media content strategy: a brand system applied to every material and an editorial calendar with monthly metrics.',
    },
    pie: {
      es: { titulo: 'Marca como sistema.', texto: 'Del logotipo al último post, todo sale de las mismas reglas y plantillas.' },
      en: { titulo: 'Brand as a system.', texto: 'From the logo to the last post, everything comes from the same rules and templates.' },
    },
    comentarios: [
      { autor: 'Marta', texto: { es: '¿Podemos usar el logo también en las plantillas de redes?', en: 'Can we use the logo in the social media templates too?' } },
      { autor: 'Roger', texto: { es: 'Sí, ya está en el kit: 4 formatos y la paleta reducida.', en: 'Yes, it’s already in the kit: 4 formats and the reduced palette.' } },
    ],
  },
  {
    clave: 'sensing-dashboard',
    num: 2,
    fondo: '#0E8A5A',
    anio: '2019–2021',
    cliente: 'Sensing & Control',
    etiqueta: { es: 'ui/ux', en: 'ui/ux' },
    subtitulo: { es: 'dashboard IoT', en: 'IoT dashboard' },
    texto: {
      es: 'Diseño de interfaz para plataforma de monitorización IoT. Visualización de datos en tiempo real con foco en usabilidad operativa.',
      en: 'Interface design for an IoT monitoring platform. Real-time data visualization focused on operational usability.',
    },
    pie: {
      es: { titulo: 'Datos que se leen de un vistazo.', texto: 'Tres niveles de navegación y alarmas que saltan a la vista.' },
      en: { titulo: 'Data you can read at a glance.', texto: 'Three navigation levels and alarms that stand out instantly.' },
    },
    comentarios: [
      { autor: 'Jordi', texto: { es: 'La alarma de la línea 3 no se ve bien en la tablet de planta.', en: 'The line 3 alarm is hard to see on the plant-floor tablet.' } },
      { autor: 'Roger', texto: { es: 'La he pasado arriba del todo y con el rojo de alarma.', en: 'I’ve moved it to the top, in the alarm red.' } },
    ],
  },
  {
    clave: 'nvision-ferias',
    num: 3,
    fondo: '#E0A82E',
    anio: '2021–2023',
    cliente: 'nVision',
    etiqueta: { es: 'diseño', en: 'design' },
    subtitulo: { es: 'ferias internacionales', en: 'international trade fairs' },
    texto: {
      es: 'Producción de materiales para ferias de I+D: stands, roll-ups, folletos técnicos y presentaciones corporativas.',
      en: 'Production of materials for R&D trade fairs: stands, roll-ups, technical brochures and corporate presentations.',
    },
    pie: {
      es: { titulo: 'Tecnología en tres segundos.', texto: 'Un kit de feria con un mensaje por pieza, de lejos a cerca.' },
      en: { titulo: 'Technology in three seconds.', texto: 'A trade fair kit with one message per piece, from far to near.' },
    },
    comentarios: [
      { autor: 'Laura', texto: { es: '¿Se entiende qué hacemos desde el pasillo?', en: 'Can people tell what we do from the aisle?' } },
      { autor: 'Roger', texto: { es: 'Sí: un mensaje por roll-up y el dato técnico en el folleto.', en: 'Yes: one message per roll-up and the technical detail in the brochure.' } },
    ],
  },
];

/** Nombre completo del proyecto: «Intera — identidad y estrategia digital» */
export const nombreProyecto = (t: Tarjeta, lang: Lang) => `${t.cliente} — ${t.subtitulo[lang]}`;
