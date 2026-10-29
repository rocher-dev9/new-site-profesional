// ────────────────────────────────────────────────────────────────
// Equivalencias de páginas entre idiomas (las URL están traducidas).
// A partir de esta tabla se generan el menú, el selector ES/EN y las
// etiquetas hreflang. Las rutas son relativas a la raíz de la web:
// en español, URL limpias por carpetas ("trabajo/"); en inglés, archivos .html.
// ────────────────────────────────────────────────────────────────
export type Lang = 'es' | 'en';
export type Alternas = Partial<Record<Lang, string>>;

// Dirección pública de la web según dónde se compile: en Vercel, su dominio de producción;
// en GitHub Pages, la de github.io (hreflang, vista previa al compartir…)
const vercel = typeof process !== 'undefined' ? process.env.VERCEL_PROJECT_PRODUCTION_URL : undefined;
export const SITE_URL = vercel ? `https://${vercel}/` : 'https://rocher-dev9.github.io/new-site-profesional/';

export const rutas = {
  inicio:  { es: '',          en: 'en/index.html' },
  entorno: { es: 'entorno/',  en: 'en/services.html' },
  trabajo: { es: 'trabajo/',  en: 'en/work.html' },
  ioi:     { es: 'ioi/',      en: 'en/ai.html' },
  sobreMi: { es: 'sobre-mi/', en: 'en/about.html' },
  privacidad: { es: 'privacidad/', en: 'en/privacy.html' }, // solo en el pie, no en el menú
} as const;

export type Seccion = keyof typeof rutas;

/** Enlace relativo desde la página actual (p. ej. "trabajo/" o "en/work.html") hasta otra ruta de la web. */
export function rel(desde: string, hasta: string): string {
  const origen = desde.slice(0, desde.lastIndexOf('/') + 1).split('/').filter(Boolean);
  const partes = hasta.split('/');
  const destino = partes.slice(0, -1);
  const archivo = partes[partes.length - 1];
  let comun = 0;
  while (comun < origen.length && comun < destino.length && origen[comun] === destino[comun]) comun++;
  const ruta = '../'.repeat(origen.length - comun) + [...destino.slice(comun), archivo].join('/');
  return ruta || './';
}

/** Ruta de un caso de estudio según el idioma. */
export function rutaCaso(lang: Lang, url: string): string {
  return lang === 'es' ? `trabajo/${url}/` : `en/project-${url}.html`;
}

/** URL absoluta para hreflang; las portadas se enlazan como carpeta ("…/", "…/en/"). */
export function urlAbsoluta(ruta: string): string {
  return SITE_URL + ruta.replace(/(^|\/)index\.html$/, '$1');
}
