// ────────────────────────────────────────────────────────────────
// Colecciones de contenido.
// proyectos: un archivo por proyecto y por idioma en src/proyectos/<clave>/<idioma>.json
// (p. ej. src/proyectos/intera-identidad/es.json). La estructura se valida al compilar:
// si falta un campo o tiene un tipo incorrecto, el build avisa y no se publica.
// ────────────────────────────────────────────────────────────────
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const texto = z.string().min(1);

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/proyectos' }),
  schema: z.object({
    url: texto,                     // URL: proyecto-<url>.html · en/project-<url>.html (no usar "slug": Astro lo toma como id)
    num: z.number().int().min(1),   // posición en Trabajo (01–06)
    color: texto,                   // color del proyecto: solo portada e ilustraciones
    titulo: texto,                  // <title> de la pestaña
    descripcion: texto,             // meta description
    categoria: texto,
    h1: texto,
    h1Destacado: texto,             // parte del titular en color
    entradilla: texto,
    etiquetas: z.array(texto),
    ficha: z.array(z.object({ dt: texto, dd: texto })),
    portadaAlt: texto,
    resumen: z.object({ reto: texto, solucion: texto, resultado: texto }),
    proceso: z.object({
      titulo: texto,
      intro: texto,
      pasos: z.array(z.object({ titulo: texto, texto: texto, entregable: texto })).min(1),
    }),
    entregables: z.object({ titulo: texto, intro: texto }),
    resultados: z.object({
      cifras: z.array(z.object({ cifra: texto, texto: texto })),
      testimonio: z.object({ texto: texto, autor: texto, cargo: texto }),
    }),
    siguiente: z.object({ num: z.number().int(), titulo: texto, color: texto }),
    contacto: z.object({ titulo: texto, texto: texto }),
    pendienteRevisar: z.string().optional(), // nota interna: qué está inventado y falta confirmar
  }),
});

export const collections = { proyectos };
