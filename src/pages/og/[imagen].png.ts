// ────────────────────────────────────────────────────────────────
// Imágenes de vista previa al compartir (1200×630), generadas al compilar con satori + resvg.
// URL: /og/<imagen>.png (p. ej. /og/trabajo-es.png, /og/caso-intera-en.png).
// Los textos de las páginas están en src/datos/og.ts; los de los casos, en sus datos.
// ────────────────────────────────────────────────────────────────
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { imagenesPaginas, type ImagenOG } from '../../datos/og';

const raiz = process.cwd();
const leer = (ruta: string) => readFileSync(join(raiz, ruta));
const fuentes = [
  { name: 'Jakarta', data: leer('node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff'), weight: 600 as const },
  { name: 'Jakarta', data: leer('node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff'), weight: 800 as const },
  { name: 'Mono', data: leer('node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'), weight: 500 as const },
  { name: 'Pixel', data: leer('node_modules/@fontsource/silkscreen/files/silkscreen-latin-400-normal.woff'), weight: 400 as const },
];
const mano = `data:image/svg+xml;base64,${leer('public/img/brand-hand.svg').toString('base64')}`;

export const getStaticPaths = (async () => {
  const casos = await getCollection('proyectos');
  const deCasos = casos.map((c) => {
    const [clave, lang] = c.id.split('/') as [string, 'es' | 'en'];
    const d = c.data;
    const imagen: ImagenOG = {
      lang,
      etiqueta: `${lang === 'es' ? 'Caso de estudio' : 'Case study'} · ${d.categoria}`,
      titulo: d.h1,
      destacado: d.h1Destacado,
      texto: d.ficha.map((f) => f.dd).slice(0, 2).join(' · '),
      color: d.color,
      num: d.num,
      cliente: d.ficha[0]?.dd,
    };
    return { params: { imagen: `caso-${clave}-${lang}` }, props: { imagen } };
  });
  const dePaginas = Object.entries(imagenesPaginas).map(([clave, imagen]) => ({ params: { imagen: clave }, props: { imagen } }));
  return [...dePaginas, ...deCasos];
}) satisfies GetStaticPaths;

// Pequeño ayudante para describir nodos como satori los espera
type Nodo = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Nodo | string | null)[]): Nodo =>
  ({ type, props: { style, children: children.filter((c) => c !== null) } });

function plantilla(i: ImagenOG): Nodo {
  const INK = '#15121f', INDIGO = '#5850ec';
  const pixeles = h('div', { position: 'absolute', right: 72, bottom: 72, display: 'flex', gap: 8 },
    h('div', { width: 16, height: 16, background: INDIGO }),
    h('div', { width: 16, height: 16, background: '#c9c4f9' }),
    h('div', { width: 16, height: 16, background: '#fbe2c6' }),
  );
  // Bloque del proyecto (casos): sin relleno, con los textos colocados en posición absoluta
  const proyecto = i.color
    ? h('div', { position: 'absolute', right: 0, top: 0, width: 400, height: 630, background: i.color, display: 'flex' },
      h('div', { position: 'absolute', left: 48, top: 56, fontFamily: 'Mono', fontSize: 22, color: 'rgba(255,255,255,0.85)', letterSpacing: 2 },
        i.lang === 'es' ? 'PROYECTO' : 'PROJECT'),
      h('div', { position: 'absolute', left: 48, bottom: 56, display: 'flex', flexDirection: 'column' },
        h('div', { fontFamily: 'Pixel', fontSize: 140, lineHeight: 1, color: 'rgba(255,255,255,0.92)' }, String(i.num ?? 1).padStart(2, '0')),
        h('div', { fontFamily: 'Jakarta', fontWeight: 800, fontSize: 38, color: '#fff', marginTop: 14, letterSpacing: -1 }, i.cliente ?? ''),
      ))
    : null;

  // Contenedor sin relleno (satori suma el relleno al tamaño) y caja interior de medidas fijas
  return h('div', {
      width: 1200, height: 630, display: 'flex', position: 'relative', fontFamily: 'Jakarta', color: INK,
      backgroundImage: 'linear-gradient(180deg, #e8e5fb 0%, #ffffff 78%)',
    },
    h('div', {
        position: 'absolute', left: 72, top: 64, width: i.color ? 640 : 1056, height: 502,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      },
      h('div', { display: 'flex', alignItems: 'center', gap: 16 },
        { type: 'img', props: { src: mano, width: 46, height: 57, style: {} } },
        h('div', { fontWeight: 800, fontSize: 30, letterSpacing: -1 }, 'Roger Avellana'),
      ),
      h('div', { display: 'flex', flexDirection: 'column' },
        h('div', { fontFamily: 'Mono', fontSize: 22, color: INDIGO, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }, i.etiqueta),
        h('div', { display: 'flex', flexDirection: 'column', fontWeight: 800, fontSize: i.color ? 58 : 76, lineHeight: 1.05, letterSpacing: -3 },
          h('div', {}, i.titulo),
          h('div', { color: INDIGO }, i.destacado),
        ),
      ),
      h('div', { fontWeight: 600, fontSize: 26, color: '#56536b' }, i.texto),
    ),
    i.color ? null : pixeles,
    proyecto,
  );
}

export const GET: APIRoute = async ({ props }) => {
  const svg = await satori(plantilla((props as { imagen: ImagenOG }).imagen) as never, { width: 1200, height: 630, fonts: fuentes });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
