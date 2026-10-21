// ────────────────────────────────────────────────────────────────
// Equivalencias de páginas entre idiomas (las URL están traducidas).
// A partir de esta tabla se generan el menú, el selector ES/EN y las
// etiquetas hreflang. Las rutas son relativas a la raíz de la web.
// ────────────────────────────────────────────────────────────────
export type Lang = 'es' | 'en';
export type Alternas = Partial<Record<Lang, string>>;

export const SITE_URL = 'https://rocher-dev9.github.io/new-site-profesional/';

export const rutas = {
  inicio:  { es: 'index.html',     en: 'en/index.html' },
  entorno: { es: 'servicios.html', en: 'en/services.html' },
  trabajo: { es: 'trabajo.html',   en: 'en/work.html' },
  ioi:     { es: 'ia.html',        en: 'en/ai.html' },
  sobreMi: { es: 'about.html',     en: 'en/about.html' },
} as const;

export type Seccion = keyof typeof rutas;

/** Enlace relativo desde la página actual (p. ej. "en/work.html") hasta otra ruta de la web. */
export function rel(desde: string, hasta: string): string {
  const dir = desde.includes('/') ? desde.slice(0, desde.lastIndexOf('/') + 1) : '';
  if (dir && hasta.startsWith(dir)) return hasta.slice(dir.length);
  return '../'.repeat(dir.split('/').filter(Boolean).length) + hasta;
}

/** URL absoluta para hreflang; las portadas se enlazan como carpeta ("…/", "…/en/"). */
export function urlAbsoluta(ruta: string): string {
  return SITE_URL + ruta.replace(/(^|\/)index\.html$/, '$1');
}
