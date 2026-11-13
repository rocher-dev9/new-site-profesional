// ────────────────────────────────────────────────────────────────
// Roger Avellana — Script común de todas las páginas
// Cada módulo comprueba si su elemento existe en la página; si no, no hace nada.
// Astro lo compila, lo minifica y le pone una huella en el nombre (caché automática).
// ────────────────────────────────────────────────────────────────
import { iniciarMenu } from './modulos/menu';
import { iniciarTema } from './modulos/tema';
import { iniciarPuntosCabecera } from './modulos/puntos-cabecera';
import { iniciarChatCabecera } from './modulos/chat-cabecera';
import { iniciarOficioCabecera } from './modulos/oficio-cabecera';
import { iniciarAgenteCabecera } from './modulos/agente-cabecera';
import { iniciarCodigoCabecera } from './modulos/codigo-cabecera';
import { iniciarPlaneta } from './modulos/planeta';
import { iniciarManos } from './modulos/mano';
import { iniciarIndiceLateral } from './modulos/indice-lateral';
import { iniciarCarruseles } from './modulos/carruseles';
import { iniciarTerminalIoi } from './modulos/terminal-ioi';
import { iniciarDemoAutomatizacion } from './modulos/demo-automatizacion';
import { iniciarBrilloIa } from './modulos/brillo-ia';
import { iniciarBarajaTrabajo } from './modulos/baraja-trabajo';
import { iniciarCursor } from './modulos/cursor';
import { iniciarEtiquetasSeccion } from './modulos/etiquetas-seccion';
import { iniciarReticulaPixel } from './modulos/reticula-pixel';

iniciarMenu();                 // todas las páginas
iniciarTema();                 // todas las páginas: interruptor de modo claro / oscuro
iniciarEtiquetasSeccion();     // etiquetas de sección con el total («01 / 06»)
iniciarPuntosCabecera();       // portada: retícula de puntos de la cabecera
iniciarChatCabecera();         // portada: chat con ejemplos que se escriben solos
iniciarOficioCabecera();       // portada: línea «Diseño …» que va cambiando de oficio
iniciarAgenteCabecera();       // portada: cursor de IOI que recorre la cabecera
iniciarCodigoCabecera();       // portada: código de fondo que se escribe, se edita y reacciona al cursor
iniciarPlaneta();              // portada: planeta de píxeles ("Lo que hago")
iniciarManos();                // portada y Sobre mí: mano pixelada saludando
iniciarIndiceLateral();        // índice numerado, volver arriba y volver a Trabajo
iniciarCarruseles();           // portada: testimonios
iniciarTerminalIoi();          // portada: terminal del bloque IOI
iniciarDemoAutomatizacion();   // Entorno: demo de automatización
iniciarReticulaPixel();        // Entorno: arte pixel tras el titular de la cabecera
iniciarBrilloIa();             // portada: brillo del bloque IOI
iniciarBarajaTrabajo();        // Trabajo: baraja de proyectos
iniciarCursor();               // todas las páginas (solo con ratón)
