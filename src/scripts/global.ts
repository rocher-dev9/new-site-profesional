// ────────────────────────────────────────────────────────────────
// Roger Avellana — Script común de todas las páginas
// Cada módulo comprueba si su elemento existe en la página; si no, no hace nada.
// Astro lo compila, lo minifica y le pone una huella en el nombre (caché automática).
// ────────────────────────────────────────────────────────────────
import { iniciarMenu } from './modulos/menu';
import { iniciarPuntosCabecera } from './modulos/puntos-cabecera';
import { iniciarChatCabecera } from './modulos/chat-cabecera';
import { iniciarPlaneta } from './modulos/planeta';
import { iniciarManos } from './modulos/mano';
import { iniciarIndiceLateral } from './modulos/indice-lateral';
import { iniciarCarruseles } from './modulos/carruseles';
import { iniciarTerminalIoi } from './modulos/terminal-ioi';
import { iniciarDemoAutomatizacion } from './modulos/demo-automatizacion';
import { iniciarBrilloIa } from './modulos/brillo-ia';
import { iniciarBarajaTrabajo } from './modulos/baraja-trabajo';
import { iniciarCursor } from './modulos/cursor';

iniciarMenu();                 // todas las páginas
iniciarPuntosCabecera();       // portada: retícula de puntos de la cabecera
iniciarChatCabecera();         // portada: chat con ejemplos que se escriben solos
iniciarPlaneta();              // portada: planeta de píxeles ("Lo que hago")
iniciarManos();                // portada y Sobre mí: mano pixelada saludando
iniciarIndiceLateral();        // índice numerado, volver arriba y volver a Trabajo
iniciarCarruseles();           // portada: testimonios
iniciarTerminalIoi();          // portada: terminal del bloque IOI
iniciarDemoAutomatizacion();   // Entorno: demo de automatización
iniciarBrilloIa();             // portada: brillo del bloque IOI
iniciarBarajaTrabajo();        // Trabajo: baraja de proyectos
iniciarCursor();               // todas las páginas (solo con ratón)
