// Enlace al caso de estudio de un proyecto, si ya existe en ese idioma; si no, «#».
import { getCollection } from 'astro:content';
import { rel, rutaCaso, type Lang } from '../i18n/rutas';

export async function enlaceCaso(clave: string, lang: Lang, pagina: string): Promise<string> {
  const caso = (await getCollection('proyectos')).find((e) => e.id === `${clave}/${lang}`);
  return caso ? rel(pagina, rutaCaso(lang, caso.data.url)) : '#';
}
