// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Se publica en GitHub Pages: https://rocher-dev9.github.io/new-site-profesional/
  site: 'https://rocher-dev9.github.io',
  base: '/new-site-profesional',
  // Genera archivos .html con el mismo nombre que la página (trabajo.html, en/work.html…),
  // así se mantienen las URL de la web anterior
  build: { format: 'preserve' },
  trailingSlash: 'ignore',
  // Español en la raíz y la versión inglesa en /en/
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  // HTML legible, igual que el original
  compressHTML: false,
  devToolbar: { enabled: false },
});
