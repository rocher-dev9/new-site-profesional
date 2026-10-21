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
| `npm run build`   | Genera la web final en `dist/`                            |
| `npm run preview` | Sirve `dist/` para revisarla antes de publicar            |

## URL

| Página   | Español                      | Inglés                          |
| -------- | ---------------------------- | ------------------------------- |
| Inicio   | `/`                          | `/en/`                          |
| Entorno  | `/entorno/`                  | `/en/services.html`             |
| Trabajo  | `/trabajo/`                  | `/en/work.html`                 |
| Caso     | `/trabajo/intera-identidad/` | `/en/project-<url>.html`        |
| IOI      | `/ioi/`                      | `/en/ai.html`                   |
| Sobre mí | `/sobre-mi/`                 | `/en/about.html`                |

Las URL antiguas en español (`servicios.html`, `trabajo.html`, `ia.html`, `about.html`,
`proyecto-*.html`, `contacto.html`) siguen funcionando: son páginas en `public/` que
redirigen a las nuevas conservando el ancla.

## Estructura

```
public/                 CSS, JS, imágenes y favicon (se copian tal cual)
  css/styles.css        estilos comunes de toda la web
  css/ia.css            página IOI
  css/caso.css          casos de estudio
src/
  layouts/Base.astro    <head>, menú, pie y scripts de todas las páginas
  layouts/Caso.astro    plantilla de caso de estudio
  components/           bloques reutilizables: menú, selector ES/EN, pie, iconos,
                        ContactCards (contacto), PageIndex (índice lateral),
                        ProjectCard (tarjeta de proyecto), Testimonials, PixelArrow
  datos/                datos comunes: email y LinkedIn (sitio.ts), testimonios.ts
  i18n/rutas.ts         equivalencias de páginas ES ↔ EN (menú, selector y hreflang)
  i18n/ui.ts            textos cortos de la interfaz en los dos idiomas
  pages/                páginas en español (por carpetas) y en inglés (en/)
  proyectos/tarjetas.ts tarjetas de Trabajo y de la portada (orden, textos ES/EN, color)
  proyectos/<clave>/    Tarjeta.astro (ilustración de la tarjeta) y, si tiene caso de estudio,
                        es.json / en.json + Portada.astro + Galeria.astro
```

## Añadir un caso de estudio

1. Copia una carpeta de `src/proyectos/` y renómbrala (p. ej. `nvision-ferias`).
2. Edita `es.json` (textos, cifras, color, `url`, `num`) y las ilustraciones.
3. Para la versión inglesa, añade `en.json` en la misma carpeta.
4. El «Ver caso» de su tarjeta (en Trabajo y en la portada) se enlaza solo.

## Publicación

Cada `push` a `main` publica la web automáticamente (`.github/workflows/deploy.yml`).
Requisito único: en GitHub, *Settings → Pages → Source: GitHub Actions*.
