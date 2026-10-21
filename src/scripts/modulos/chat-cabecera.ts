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
  if (!campo) return;

  const temas = Object.keys(EJEMPLOS) as Tema[];
  // Primero el primer ejemplo de cada tema y luego el segundo
  let cola: string[] = [...temas.map((k) => EJEMPLOS[k][0]), ...temas.map((k) => EJEMPLOS[k][1])];
  let indice = 0, timer = 0, pausado = false;

  const ponerTexto = (texto: string) => campo.setAttribute('placeholder', texto);

  // Escribe la frase letra a letra, espera, la borra y pasa a la siguiente
  const escribir = (texto: string) => {
    clearTimeout(timer);
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
        if (n <= 0) { indice = (indice + 1) % cola.length; timer = window.setTimeout(() => escribir(cola[indice]), 350); return; }
        timer = window.setTimeout(paso, 16);
      }
    };
    paso();
  };

  const empezar = () => (reduceMotion ? ponerTexto(cola[0]) : escribir(cola[0]));
  empezar();

  // Se detiene mientras el visitante escribe o tiene el foco en el campo
  campo.addEventListener('focus', () => { pausado = true; });
  campo.addEventListener('blur', () => { pausado = campo.value.length > 0; });
  campo.addEventListener('input', () => { pausado = true; });

  // Las píldoras cambian el tema de los ejemplos
  const pildoras = document.querySelectorAll<HTMLElement>('.hc-chip');
  pildoras.forEach((pildora) => {
    pildora.addEventListener('click', () => {
      const tema = pildora.getAttribute('data-topic') as Tema;
      pildoras.forEach((p) => p.setAttribute('aria-pressed', String(p === pildora)));
      cola = EJEMPLOS[tema].slice();
      indice = 0;
      if (!campo.value) { pausado = false; empezar(); }
    });
  });
}
