// Portada: chat de la cabecera con ejemplos que se escriben solos
import { LANG, reduceMotion } from '../utilidades';

type Tema = 'branding' | 'uiux' | 'marketing' | 'ia' | 'design';

const EJEMPLOS: Record<Tema, [string, string]> = LANG === 'en' ? {
  branding: ['I need a visual identity for my coffee brand', 'I want to refresh the logo and brand guidelines of my studio'],
  uiux: ['I want to redesign my company’s website', 'I need a clear dashboard for my business data'],
  marketing: ['I’m looking for a social media campaign for a launch', 'I need a monthly content calendar for Instagram'],
  ia: ['I’d like to automate my monthly reports with AI', 'I want an AI agent to help with customer replies'],
  design: ['I need posters and banners for an event', 'I want a stand design for a trade fair'],
} : {
  branding: ['Necesito una identidad visual para mi marca de café', 'Quiero renovar el logo y la guía de marca de mi estudio'],
  uiux: ['Quiero rediseñar la web de mi empresa', 'Necesito un dashboard claro para los datos de mi negocio'],
  marketing: ['Busco una campaña de redes sociales para un lanzamiento', 'Necesito un calendario de contenidos mensual para Instagram'],
  ia: ['Me gustaría automatizar los informes mensuales con IA', 'Quiero un agente de IA que ayude a responder a clientes'],
  design: ['Necesito carteles y banners para un evento', 'Quiero el diseño de un stand para una feria'],
};

export function iniciarChatCabecera(): void {
  const campo = document.querySelector<HTMLTextAreaElement>('#hero-chat-input');
  const fantasma = document.querySelector<HTMLElement>('.hc-ghost-txt');
  if (!campo || !fantasma) return;

  const temas = Object.keys(EJEMPLOS) as Tema[];
  const pildoras = document.querySelectorAll<HTMLElement>('.hc-chip');
  // Tema a tema: los dos ejemplos de cada uno y pasa al siguiente
  let tema = 0, ejemplo = 0, timer = 0, pausado = false;

  const ponerTexto = (texto: string) => { fantasma.textContent = texto; };
  const marcarTema = () => pildoras.forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.topic === temas[tema])));

  // Escribe la frase letra a letra, espera, la borra y pasa a la siguiente
  const escribir = () => {
    clearTimeout(timer);
    marcarTema();
    const texto = EJEMPLOS[temas[tema]][ejemplo];
    let n = 0;
    let fase: 'escribir' | 'esperar' | 'borrar' = 'escribir';
    const paso = () => {
      if (pausado) { timer = window.setTimeout(paso, 400); return; }
      if (fase === 'escribir') {
        ponerTexto(texto.slice(0, ++n));
        if (n >= texto.length) { fase = 'esperar'; timer = window.setTimeout(paso, 2200); return; }
        timer = window.setTimeout(paso, 38 + Math.random() * 45);
      } else if (fase === 'esperar') {
        fase = 'borrar'; timer = window.setTimeout(paso, 20);
      } else {
        ponerTexto(texto.slice(0, --n));
        if (n <= 0) {
          if (++ejemplo > 1) { ejemplo = 0; tema = (tema + 1) % temas.length; }
          timer = window.setTimeout(escribir, 350);
          return;
        }
        timer = window.setTimeout(paso, 16);
      }
    };
    paso();
  };

  const empezar = () => {
    if (reduceMotion) { marcarTema(); ponerTexto(EJEMPLOS[temas[tema]][ejemplo]); }
    else escribir();
  };
  empezar();

  // Se detiene mientras el visitante escribe o tiene el foco en el campo
  campo.addEventListener('focus', () => { pausado = true; });
  campo.addEventListener('blur', () => { pausado = campo.value.length > 0; });
  campo.addEventListener('input', () => { pausado = true; });

  // Las píldoras saltan a su tema y desde ahí sigue el recorrido
  pildoras.forEach((pildora) => {
    pildora.addEventListener('click', () => {
      tema = Math.max(0, temas.indexOf(pildora.dataset.topic as Tema));
      ejemplo = 0;
      if (!campo.value) pausado = false;
      empezar();
    });
  });
}
