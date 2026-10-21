// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Se publica en GitHub Pages: https://rocher-dev9.github.io/new-site-profesional/
  site: 'https://rocher-dev9.github.io',
  base: '/new-site-profesional',
  // Genera archivos .html con el mismo nombre que la página (trabajo.html, en/work.html…),
  // así se mantienen las URL de la web anterior
  build: {
    format: 'preserve',
    // CSS siempre en archivos aparte (con huella en el nombre), no incrustado en el HTML
    inlineStylesheets: 'never',
  },
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
  // El CSS combinado se llama estilos.<huella>.css
  vite: {
    build: {
      // Navegadores para los que se prepara el CSS al minificarlo. Sin esto, el minificador
      // eliminaba propiedades estándar como backdrop-filter y dejaba solo la versión -webkit-.
      cssTarget: ['chrome111', 'edge111', 'firefox115', 'safari15', 'ios15'],
      rollupOptions: {
        output: {
          assetFileNames: (asset) =>
            (asset.names?.[0] ?? asset.name ?? '').endsWith('.css')
              ? '_astro/estilos.[hash][extname]'
              : '_astro/[name].[hash][extname]',
        },
      },
    },
  },
});
