// Portada: la terminal de IOI "teclea" al entrar en pantalla
import { reduceMotion, alAparecer } from '../utilidades';

export function iniciarTerminalIoi(): void {
  const terminal = document.getElementById('ioi-term');
  if (!terminal || reduceMotion || !('IntersectionObserver' in window)) return;
  terminal.classList.add('is-ready');
  alAparecer(terminal, () => terminal.classList.add('is-typed'), 0.45);
}
