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

## Estructura

```
public/                 CSS, JS, imágenes y favicon (se copian tal cual)
  css/styles.css        estilos comunes de toda la web
  css/ia.css            página IOI
  css/caso.css          casos de estudio
src/
  layouts/Base.astro    <head>, menú, pie y scripts de todas las páginas
  layouts/Caso.astro    plantilla de caso de estudio
  components/           menú, selector ES/EN, pie, iconos…
  i18n/rutas.ts         equivalencias de páginas ES ↔ EN (menú, selector y hreflang)
  i18n/ui.ts            textos cortos de la interfaz en los dos idiomas
  pages/                páginas en español (raíz) y en inglés (en/)
  proyectos/<clave>/    un caso de estudio: es.json / en.json + Portada.astro + Galeria.astro
```

## Añadir un caso de estudio

1. Copia una carpeta de `src/proyectos/` y renómbrala (p. ej. `nvision-ferias`).
2. Edita `es.json` (textos, cifras, color, `url`, `num`) y las ilustraciones.
3. Para la versión inglesa, añade `en.json` en la misma carpeta.
4. Enlaza la tarjeta de Trabajo a `proyecto-<url>.html`.

## Publicación

Cada `push` a `main` publica la web automáticamente (`.github/workflows/deploy.yml`).
Requisito único: en GitHub, *Settings → Pages → Source: GitHub Actions*.
