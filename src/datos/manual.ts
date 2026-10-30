// ────────────────────────────────────────────────────────────────
// Manual de usuario de Vercel: textos de su ficha y de su fila en Trabajo.
// El manual en sí es estático (public/manual-vercel/, solo en español) y se genera
// con _manual-vercel-fuente/scripts/build_manual.py a partir del .docx de esa carpeta.
// ────────────────────────────────────────────────────────────────
import type { Lang } from '../i18n/rutas';

type Textos = Record<Lang, string>;

/** Ruta del manual dentro de la web */
export const MANUAL = 'manual-vercel/';

/** Ruta de la ficha según el idioma */
export const fichaManual: Record<Lang, string> = {
  es: 'trabajo/manual-vercel/',
  en: 'en/project-vercel-manual.html',
};

export const COLOR_MANUAL = '#5850ec';

export const cifrasManual: { cifra: string; texto: Textos }[] = [
  { cifra: '24', texto: { es: 'capítulos repartidos en nueve partes', en: 'chapters across nine parts' } },
  { cifra: '11', texto: { es: 'anexos de consulta: CLI, límites, precios, errores…', en: 'reference appendices: CLI, limits, pricing, errors…' } },
  { cifra: '64', texto: { es: 'páginas oficiales de Vercel enlazadas como fuente', en: 'official Vercel pages linked as sources' } },
];

export const partesManual: { num: string; ancla: string; alcance: Textos; titulo: Textos; texto: Textos }[] = [
  { num: 'I', ancla: 'cap-1', alcance: { es: 'Cap. 1–2', en: 'Ch. 1–2' }, titulo: { es: 'Fundamentos', en: 'Fundamentals' }, texto: { es: 'Qué es Vercel y cómo procesa las peticiones y los builds.', en: 'What Vercel is and how it handles requests and builds.' } },
  { num: 'II', ancla: 'cap-3', alcance: { es: 'Cap. 3–5', en: 'Ch. 3–5' }, titulo: { es: 'Primeros pasos', en: 'Getting started' }, texto: { es: 'Cuenta, equipos, planes, CLI y primer despliegue.', en: 'Account, teams, plans, CLI and first deployment.' } },
  { num: 'III', ancla: 'cap-6', alcance: { es: 'Cap. 6–10', en: 'Ch. 6–10' }, titulo: { es: 'Desarrollo y despliegue', en: 'Development and deployment' }, texto: { es: 'Proyectos, builds, Git, entornos, variables, despliegues y monorepos.', en: 'Projects, builds, Git, environments, variables, deployments and monorepos.' } },
  { num: 'IV', ancla: 'cap-11', alcance: { es: 'Cap. 11–16', en: 'Ch. 11–16' }, titulo: { es: 'Red, rendimiento y cómputo', en: 'Network, performance and compute' }, texto: { es: 'Dominios, CDN, caché, ISR, funciones, enrutamiento, imágenes y Cron Jobs.', en: 'Domains, CDN, caching, ISR, functions, routing, images and Cron Jobs.' } },
  { num: 'V', ancla: 'cap-17', alcance: { es: 'Cap. 17', en: 'Ch. 17' }, titulo: { es: 'Datos', en: 'Data' }, texto: { es: 'Vercel Blob, Global Config y almacenamiento del Marketplace.', en: 'Vercel Blob, Global Config and Marketplace storage.' } },
  { num: 'VI', ancla: 'cap-18', alcance: { es: 'Cap. 18–20', en: 'Ch. 18–20' }, titulo: { es: 'Seguridad y gobierno', en: 'Security and governance' }, texto: { es: 'Deployment Protection, Firewall, WAF y roles.', en: 'Deployment Protection, Firewall, WAF and roles.' } },
  { num: 'VII', ancla: 'cap-21', alcance: { es: 'Cap. 21', en: 'Ch. 21' }, titulo: { es: 'Observabilidad', en: 'Observability' }, texto: { es: 'Logs, Observability, Web Analytics y Speed Insights.', en: 'Logs, Observability, Web Analytics and Speed Insights.' } },
  { num: 'VIII', ancla: 'cap-22', alcance: { es: 'Cap. 22', en: 'Ch. 22' }, titulo: { es: 'Costes', en: 'Costs' }, texto: { es: 'Modelo de precios, uso y Spend Management.', en: 'Pricing model, usage and Spend Management.' } },
  { num: 'IX', ancla: 'cap-23', alcance: { es: 'Cap. 23–24', en: 'Ch. 23–24' }, titulo: { es: 'Automatización y buenas prácticas', en: 'Automation and best practices' }, texto: { es: 'REST API, SDK, AI Gateway y recomendaciones.', en: 'REST API, SDK, AI Gateway and recommendations.' } },
];

export const anexosManual = {
  num: 'A–K',
  ancla: 'anexos',
  alcance: { es: '11 anexos', en: '11 appendices' },
  titulo: { es: 'Anexos', en: 'Appendices' },
  texto: {
    es: 'Referencias de consulta: CLI, vercel.json, variables, límites, regiones, precios, errores, glosario y fuentes.',
    en: 'Reference material: CLI, vercel.json, variables, limits, regions, pricing, errors, glossary and sources.',
  },
};
