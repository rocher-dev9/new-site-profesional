// ────────────────────────────────────────────────────────────────
// Roger Avellana — Página IOI (inteligencia artificial)
// Se carga solo en ioi/ y en/ai.html, después del script común.
// ────────────────────────────────────────────────────────────────
import { iniciarRedNeuronal } from './ia/red-neuronal';
import { iniciarConsola } from './ia/consola';
import { iniciarProceso } from './ia/proceso';
import { iniciarFlujo } from './ia/flujo';
import { iniciarAgente } from './ia/agente';

iniciarRedNeuronal();   // cabecera: red neuronal animada
iniciarConsola();       // cabecera: consola que escribe y genera respuestas
iniciarProceso();       // proceso + brillo de las herramientas
iniciarFlujo();         // automatización: pestañas del flujo
iniciarAgente();        // agentes: ejecución paso a paso
