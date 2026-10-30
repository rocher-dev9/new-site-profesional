// Enlace al caso de estudio de un proyecto, si ya existe en ese idioma; si no, «#».
import { getCollection } from 'astro:content';
import { rel, rutaCaso, type Lang } from '../i18n/rutas';

export async function enlaceCaso(clave: string, lang: Lang, pagina: string): Promise<string> {
  const ruta = await rutaDelCaso(clave, lang);
  return ruta ? rel(pagina, ruta) : '#';
}

/** Ruta del caso de un proyecto en ese idioma (las URL pueden estar traducidas), si existe. */
export async function rutaDelCaso(clave: string, lang: Lang): Promise<string | undefined> {
  const caso = (await getCollection('proyectos')).find((e) => e.id === `${clave}/${lang}`);
  return caso && rutaCaso(lang, caso.data.url);
}
