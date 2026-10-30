# Web profesional de Roger Avellana

Web personal bilingüe (ES/EN) de Roger Avellana, diseñador visual y de marketing en Barcelona. Su objetivo es
mostrar su trabajo (branding, marketing, UI/UX, IA) y conseguir contactos por email o LinkedIn.

Roger escribe en español: respóndele en español. Comandos, URL y estructura detallada: `README.md`.

## Stack

- Astro 7, salida estática, TypeScript. Sin framework de UI ni CSS externo.
- Node 24 en `~/.local/node`. Una shell no interactiva necesita antes de `npm`:
  `export PATH="$HOME/.local/node/bin:$PATH"`.
- Web en local, desde una pestaña de la Terminal: `npm run dev -- --ignore-lock` →
  http://localhost:4321/new-site-profesional/. El panel de vista previa no puede arrancar servidores en esta carpeta
  (permisos de macOS).
- Imágenes de vista previa al compartir: satori + resvg, al compilar (`src/pages/og/[imagen].png.ts`).

## Estructura

```
src/pages/          ES por carpetas (trabajo/), EN como archivos (en/work.html)
src/layouts/        Base (head, menú, pie), Caso (casos de estudio), FichaManual
src/components/     bloques reutilizables (Nav, Footer, ContactCards, WorkRow, ToolCards, Legal…)
src/proyectos/      tarjetas.ts (lista de proyectos) y una carpeta por proyecto: Tarjeta, Portada, Galeria, es.json, en.json
src/datos/          sitio.ts (email, redes), testimonios, herramientas, og, manual
src/i18n/           rutas.ts (equivalencias ES↔EN, rel()), ui.ts (textos cortos, useT())
src/styles/         global.css, ia.css (solo .theme-ai, .ai-…), caso.css (.case, .cs-, .cg-, .mv-)
src/scripts/        global.ts + modulos/ (un módulo por función); ia.ts e ioi.ts solo donde se usan
public/             estáticos y redirecciones de URL antiguas; manual-vercel/ es el manual ya generado
_manual-vercel-fuente/  .docx y generador del manual (no se publica)
```

## Convenciones de código

- Código, comentarios y nombres en español, con el estilo del archivo que se toca.
- Enlaces internos siempre con `rel(pagina, destino)`: la web se publica con dos `base` distintas. Nunca rutas con `/`
  inicial. El manual estático usa solo rutas relativas.
- Toda página o texto nuevo va en ES y EN. Al añadir una página: `alternas`, y su imagen en `src/datos/og.ts`.
- Textos cortos de interfaz en `ui.ts`; las claves que faltan dan error en `npm run check`.
- Colección `proyectos`: no usar un campo llamado `slug` (Astro lo toma como id); el campo es `url`.
- Los tres CSS se importan en `Base.astro`, en ese orden, y salen en un solo archivo. No crear CSS por idioma.
- Escribir `-webkit-backdrop-filter` antes de `backdrop-filter`.
- JS: usar lo que ya hay en `utilidades.ts` (`tr`, `reduceMotion`, `alAparecer`…).
- Sin peticiones a terceros: fuentes con `@fontsource`, logos en `public/img/iconos/`. Si se añaden analítica,
  formularios o envío del chat, actualizar `src/components/Legal.astro`.

## Diseño

- **Colores (tokens de `global.css`):** `--lavender #e8e5fb`, `--lavender-deep #dbd6f9`, `--peach #fbe2c6`,
  `--peach-deep #f7d3aa`, `--indigo #5850ec`, `--indigo-dark #423bd1`, `--orange #e8834a`, `--green #1f8a5f`,
  `--ink #15121f`, `--ink-soft #56536b`, `--muted #837f99`, `--bg #fff`, `--bg-soft #f8f7fd`.
- **Fondos:** solo degradado lavanda en cabeceras, `--bg` y `--bg-soft`. El color de un proyecto solo va en su portada
  e ilustraciones. Única excepción: el tema oscuro de IOI. Cualquier otro fondo requiere orden expresa de Roger.
- **Tipografías:** Plus Jakarta Sans (texto y titulares), JetBrains Mono (etiquetas y metadatos), Silkscreen (números y
  detalles pixel).
- **Componentes:** botones `.btn` cuadrados con curva de 6px; tarjetas con `--radius-*` y borde `--line`; sombras pixel
  sólidas (`6px 6px 0`) al pasar el ratón y transiciones con `steps()`; flecha `PixelArrow`; mano pixel `BrandHand`.
- **Encabezados:** etiqueta `.eyebrow` o `/ sección`, y h1 con la parte final en índigo dentro de `<em>`, con punto final.
- **Interacción:** sutil y siempre respetando `prefers-reduced-motion`. Sin indicador cuadrado bajo el menú.
- Todo lo nuevo debe seguir este aspecto y no destacar sobre el resto. Reutilizar clases antes de crear otras.

## Tono de los textos

- Primera persona, directo y concreto, frases cortas, sin relleno comercial.
- Inglés natural, no traducción literal. En testimonios en inglés, sin pronombres de género para Roger.
- No inventar datos sin avisar. El contenido inventado se marca como provisional y se le dice a Roger.

## Despliegue

- Repositorio `rocher-dev9/new-site-profesional`. **`main` despliega a producción en los dos sitios con cada push:**
  - Vercel: https://rocher-ai.vercel.app/ (`base` `/`, detectado por la variable `VERCEL`).
  - GitHub Pages: https://rocher-dev9.github.io/new-site-profesional/ (`.github/workflows/deploy.yml`, `base`
    `/new-site-profesional`).
- Ambos ejecutan `npm run check && npm run build`; si hay errores de tipos, no se publica.
- Flujo con Roger: propone un cambio, lo revisa y pide «haz un git y súbelo». No subir nada sin esa orden.
  1. Trabajar en una rama, con `npm run check` y `npm run build`.
  2. Para cambios de rutas o estáticos, compilar también con `VERCEL=1`.
  3. Commit, `git merge --ff-only` a `main`, borrar la rama, `git push`.
  4. Vigilar con `gh run watch` y comprobar las páginas publicadas en los dos sitios.

## Decisiones cerradas

- Astro con salida estática, y `build.format: 'preserve'` para mantener las URL.
- URL en español por carpetas y en inglés como `.html`, traducidas. Las URL antiguas se mantienen con redirecciones.
- Un solo CSS y un solo JS común por funciones; nada de hojas separadas por idioma.
- Trabajo: una página por proyecto con plantilla común. Igualada eliminado. Agentic AI en pausa.
- Proyectos actuales: Intera → Sensing & Control → nVision (y vuelta a Intera).
- GitHub en el menú con el Octocat, en el pie y en Sobre mí. Aviso legal solo enlazado desde el pie; solo se tratan nombre y
  email.
- Manual de Vercel: va como «recurso», fuera de `tarjetas.ts` para no alterar contador ni baraja; solo en español.
- No proponer temas de dominio ni de Vercel hasta terminar el contenido, salvo que Roger los saque.

## Pendiente

1. **Contenido real:** sustituir lo provisional (textos, cifras, fechas y herramientas de los casos; comentarios de
   Trabajo; cifras de Intera; frases de las herramientas de IA) e incorporar imágenes y logos reales de Roger
   (ChatGPT, Midjourney, Firefly y Higgsfield van con monograma; los logos irían en `public/img/herramientas/`).
2. **Botón de enviar del chat de la portada:** no hace nada por orden de Roger. Propuesta: abrir el correo del visitante con
   el texto escrito. Preguntar antes.
3. **Node en Vercel:** `engines` es `>=22.22.0` y Vercel avisa de que usa 26.x. Propuesta: fijar `"24.x"` en
   `package.json`. Falta su confirmación.
4. **Confirmar con Roger** la frase de la ficha del manual «Es un manual propio… no es un documento de Vercel».
5. **Auditoría de calidad** con Lighthouse.
6. **Cuarto proyecto:** el que hace con un compañero (falta tema, nombre, permiso y si puede ser público), o Agentic AI.
7. **Cuando compre el dominio:** añadirlo en Vercel; cambiar `site`, `SITE_URL` (`src/i18n/rutas.ts`) y los canonical de
   `public/*.html`; quitar `base`; retirar GitHub Pages. Ofrecer entonces analítica y cabeceras de seguridad.
