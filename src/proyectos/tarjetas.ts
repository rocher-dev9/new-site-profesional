// ────────────────────────────────────────────────────────────────
// Tarjetas de proyecto de Trabajo (y las 3 primeras en la portada), en orden.
// La ilustración de cada una está en src/proyectos/<clave>/Tarjeta.astro.
// El enlace «Ver caso» se activa solo cuando existe el caso de estudio
// (src/proyectos/<clave>/es.json o en.json); si no, queda en «#».
// ────────────────────────────────────────────────────────────────
import type { Lang } from '../i18n/rutas';

type Textos = Record<Lang, string>;
export interface Tarjeta {
  clave: string;      // carpeta del proyecto en src/proyectos/
  num: number;        // número que se ve en la portada de la tarjeta (01–06)
  fondo: string;      // color (o degradado) de la portada
  anio: string;
  etiqueta: Textos;
  titulo: Textos;
  texto: Textos;
}

export const tarjetas: Tarjeta[] = [
  {
    clave: "intera-identidad",
    num: 1,
    fondo: "#504FED",
    anio: "2024",
    etiqueta: {
      es: "branding",
      en: "branding",
    },
    titulo: {
      es: "Intera — identidad corporativa",
      en: "Intera — corporate identity",
    },
    texto: {
      es: "Rediseño completo de la identidad visual: logotipo, paleta, tipografía y sistema de marca aplicado a todos los materiales corporativos.",
      en: "Complete redesign of the visual identity: logo, palette, typography and brand system applied to all corporate materials.",
    },
  },
  {
    clave: "igualada-campanas",
    num: 2,
    fondo: "#D9482C",
    anio: "2018–2019",
    etiqueta: {
      es: "marketing",
      en: "marketing",
    },
    titulo: {
      es: "Ayuntamiento de Igualada — campañas",
      en: "Igualada City Council — campaigns",
    },
    texto: {
      es: "Diseño y ejecución de materiales gráficos para campañas municipales: cartelería, banners digitales y publicaciones en redes.",
      en: "Design and production of graphic materials for municipal campaigns: posters, digital banners and social media posts.",
    },
  },
  {
    clave: "sensing-dashboard",
    num: 3,
    fondo: "#0E8A5A",
    anio: "2019–2021",
    etiqueta: {
      es: "ui/ux",
      en: "ui/ux",
    },
    titulo: {
      es: "Sensing & Control — dashboard IoT",
      en: "Sensing & Control — IoT dashboard",
    },
    texto: {
      es: "Diseño de interfaz para plataforma de monitorización IoT. Visualización de datos en tiempo real con foco en usabilidad operativa.",
      en: "Interface design for an IoT monitoring platform. Real-time data visualization focused on operational usability.",
    },
  },
  {
    clave: "nvision-ferias",
    num: 4,
    fondo: "#E0A82E",
    anio: "2021–2023",
    etiqueta: {
      es: "diseño",
      en: "design",
    },
    titulo: {
      es: "nVision — ferias internacionales",
      en: "nVision — international trade fairs",
    },
    texto: {
      es: "Producción de materiales para ferias de I+D: stands, roll-ups, folletos técnicos y presentaciones corporativas.",
      en: "Production of materials for R&D trade fairs: stands, roll-ups, technical brochures and corporate presentations.",
    },
  },
  {
    clave: "intera-estrategia",
    num: 5,
    fondo: "#7A5BD8",
    anio: "2023–2026",
    etiqueta: {
      es: "marketing",
      en: "marketing",
    },
    titulo: {
      es: "Intera — estrategia digital",
      en: "Intera — digital strategy",
    },
    texto: {
      es: "Planificación de contenido para redes sociales: calendario editorial, packs de posts y análisis de métricas mensuales.",
      en: "Social media content planning: content calendar, post packs and monthly metrics analysis.",
    },
  },
  {
    clave: "ia-proceso-creativo",
    num: 6,
    fondo: "linear-gradient(135deg, #5850EC 0%, #9B5BD8 55%, #E8834A 100%)",
    anio: "2024–2026",
    etiqueta: {
      es: "ia",
      en: "ai",
    },
    titulo: {
      es: "IA aplicada al proceso creativo",
      en: "AI applied to the creative process",
    },
    texto: {
      es: "Claude, ChatGPT y Gemini integrados en el flujo de trabajo: exploración de conceptos, variantes de diseño, copys para campañas y análisis de métricas, siempre con criterio humano en la decisión final.",
      en: "Claude, ChatGPT and Gemini built into the workflow: concept exploration, design variants, campaign copy and metrics analysis, always with human judgment in the final decision.",
    },
  },
];
