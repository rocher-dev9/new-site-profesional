# Roger Avellana — web profesional

Web estática bilingüe (ES/EN) hecha con [Astro](https://astro.build) y publicada en
GitHub Pages: https://rocher-dev9.github.io/new-site-profesional/

## Comandos

Necesita Node 24 (instalado en `~/.local/node`). En la terminal, antes de los comandos:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

| Comando           | Qué hace                                                  |
| ----------------- | --------------------------------------------------------- |
| `npm install`     | Instala las dependencias (solo la primera vez)            |
| `npm run dev`     | Web en local: http://localhost:4321/new-site-profesional/ |
| `npm run check`   | Comprueba los tipos (TypeScript) y avisa de errores       |
| `npm run build`   | Genera la web final en `dist/`                            |
| `npm run preview` | Sirve `dist/` para revisarla antes de publicar            |

## URL

| Página   | Español                      | Inglés                          |
| -------- | ---------------------------- | ------------------------------- |
| Inicio   | `/`                          | `/en/`                          |
| Entorno  | `/entorno/`                  | `/en/services.html`             |
| Trabajo  | `/trabajo/`                  | `/en/work.html`                 |
| Caso     | `/trabajo/intera/`           | `/en/project-<url>.html`        |
| IOI      | `/ioi/`                      | `/en/ai.html`                   |
| Sobre mí | `/sobre-mi/`                 | `/en/about.html`                |
| Ficha del manual | `/trabajo/manual-vercel/` | `/en/project-vercel-manual.html` |
| Manual de Vercel | `/manual-vercel/` (solo en español) | |

Las URL antiguas en español (`servicios.html`, `trabajo.html`, `ia.html`, `about.html`,
`proyecto-*.html`, `contacto.html`) siguen funcionando: son páginas en `public/` que
redirigen a las nuevas conservando el ancla.

## Estructura

```
public/                 imágenes, logos de herramientas (img/iconos, Simple Icons CC0),
                        favicon y redirecciones (se copian tal cual)
src/
  scripts/global.ts     JavaScript común (TypeScript): carga un módulo por funcionalidad
  scripts/modulos/      menú, cabecera, planeta, mano, índice, carruseles, baraja, cursor…
  scripts/ia.ts + ia/   página IOI: red neuronal, consola, flujo, agente
  scripts/ioi.ts        robot IOI (portada y página IOI)
  scripts/utilidades.ts idioma, tr(), reducir movimiento, animaciones que se pausan solas
                        → Astro los compila en _astro/global.js, ia.js, ioi.js y utilidades.js
  styles/global.css     estilos comunes de toda la web
  styles/ia.css         página IOI (solo clases .theme-ai, .ai-…)
  styles/caso.css       casos de estudio (solo clases .case, .cs-, .cg-…)
                        → Astro los combina en un único CSS minificado (_astro/estilos.<huella>.css)
  layouts/Base.astro    <head>, menú, pie y scripts de todas las páginas
  layouts/Caso.astro    plantilla de caso de estudio
  components/           bloques reutilizables: menú, selector ES/EN, pie, iconos,
                        ContactCards (contacto), PageIndex (índice lateral),
                        ProjectCard (tarjeta de proyecto), Testimonials, PixelArrow
  datos/                datos comunes: email y LinkedIn (sitio.ts), testimonios.ts
  i18n/rutas.ts         equivalencias de páginas ES ↔ EN (menú, selector y hreflang)
  i18n/ui.ts            textos cortos de la interfaz en los dos idiomas
  pages/                páginas en español (por carpetas) y en inglés (en/)
  proyectos/tarjetas.ts proyectos de Trabajo (filas con panel y comentarios), tarjetas de la
                        portada y baraja de la cabecera: orden, textos ES/EN y color
  proyectos/<clave>/    Tarjeta.astro (ilustración de la tarjeta) y, si tiene caso de estudio,
                        es.json / en.json + Portada.astro + Galeria.astro
```

## Añadir un caso de estudio

1. Añade el proyecto a `src/proyectos/tarjetas.ts` y copia una carpeta de `src/proyectos/`
   con el mismo nombre que su `clave` (p. ej. `nvision-ferias`).
2. Edita `es.json` (textos, cifras, color, `url`, `num`) y las ilustraciones.
3. Para la versión inglesa, añade `en.json` en la misma carpeta.
4. Su fila en Trabajo, su tarjeta en la portada y el «Ver caso» se crean y se enlazan solos.

## Manual de Vercel

Es una página estática en `public/manual-vercel/`, con el mismo aspecto que la web y fuentes propias.
Como la web se publica en dos sitios con distinta base, el manual solo usa rutas relativas.
Para cambiar su contenido, edita el `.docx` de `_manual-vercel-fuente/` y regenera el HTML
(`styles.css` y `app.js` se editan directamente):

```bash
python3 _manual-vercel-fuente/scripts/build_manual.py
```

## Vista previa al compartir

Cada página tiene etiquetas Open Graph y Twitter y su imagen de 1200×630, que se genera sola
al compilar (`src/pages/og/[imagen].png.ts`, con satori + resvg). Los textos de las páginas
están en `src/datos/og.ts`; los de los casos de estudio salen de sus datos.

## Privacidad

La web no usa cookies, formularios ni analítica, y no carga nada de terceros: las fuentes
(paquetes @fontsource) y los logos se sirven desde la propia web. Si se añaden estadísticas,
un formulario o el envío del chat, hay que actualizar `src/components/Legal.astro`.

## Publicación

Cada `push` a `main` publica la web automáticamente (`.github/workflows/deploy.yml`).
Antes de publicar se ejecuta `npm run check`: si hay errores de tipos, no se publica.
Requisito único: en GitHub, *Settings → Pages → Source: GitHub Actions*.
