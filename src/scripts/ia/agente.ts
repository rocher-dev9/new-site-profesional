// IOI (Agentes): ejecución paso a paso del agente de ejemplo
import { reduceMotion, tr, alAparecer } from '../utilidades';

export function iniciarAgente(): void {
  const agente = document.getElementById('ai-agent');
  const boton = document.querySelector<HTMLButtonElement>('#ai-agent-run');
  const estado = document.getElementById('ai-agent-status');
  const contador = document.getElementById('ai-agent-steps');
  if (!agente || !boton || !estado || !contador) return;
  const pasos = agente.querySelectorAll('.ai-agent-log li');
  let ocupado = false;

  const contar = (n: number) => { contador.textContent = n + ' / ' + pasos.length + tr(' pasos', ' steps'); };
  const marcarHechos = (n: number) => {
    pasos.forEach((li, k) => {
      li.classList.toggle('is-done', k < n);
      li.classList.remove('is-running');
    });
    contar(n);
  };
  const terminar = () => {
    estado.textContent = tr('esperando revisión humana', 'awaiting human review');
    boton.textContent = tr('↻ Repetir', '↻ Run again');
  };

  const ejecutar = () => {
    if (ocupado) return;
    ocupado = true;
    boton.disabled = true;
    marcarHechos(0);
    estado.textContent = tr('ejecutando…', 'running…');
    let k = 0;
    const siguiente = () => {
      if (k > 0) { pasos[k - 1].classList.remove('is-running'); pasos[k - 1].classList.add('is-done'); }
      contar(k);
      if (k === pasos.length) {
        terminar();
        boton.disabled = false;
        ocupado = false;
        return;
      }
      pasos[k].classList.add('is-running');
      k++;
      setTimeout(siguiente, 750 + Math.random() * 500);
    };
    siguiente();
  };

  boton.addEventListener('click', ejecutar);

  if (reduceMotion) {
    marcarHechos(pasos.length);
    terminar();
  } else if ('IntersectionObserver' in window) {
    // Se ejecuta solo la primera vez que el agente entra en pantalla
    alAparecer(agente, ejecutar, 0.4);
  }
}
