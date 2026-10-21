// Testimonios de la portada (carrusel), en el mismo orden en los dos idiomas
import type { Lang } from '../i18n/rutas';

export interface Testimonio { texto: string; autor: string; cargo: string }

export const testimonios: Record<Lang, Testimonio[]> = {
  es: [
    {
      texto: "Roger combina criterio visual y estratégico de una forma poco habitual. Entiende la marca como sistema, no como una colección de piezas sueltas.",
      autor: "Cliente · INTERA",
      cargo: "Marketing Manager",
    },
    {
      texto: "Trabajar con Roger en las ferias internacionales fue clave. Capaz de traducir tecnología compleja en materiales que cualquiera entendía.",
      autor: "Equipo · nVision Systems",
      cargo: "R&D Lead",
    },
    {
      texto: "Atento al detalle, ordenado y proactivo. Aporta soluciones cuando los demás solo ven problemas, y siempre con calma.",
      autor: "Compañero · Sensing & Control",
      cargo: "Project Manager",
    },
    {
      texto: "Las campañas que diseñó para el ayuntamiento funcionaron porque no eran solo bonitas: eran legibles, claras y respetaban el tono institucional.",
      autor: "Colaboración · Ayuntamiento",
      cargo: "Comunicación",
    },
    {
      texto: "Honesto, curioso y con muchas ganas. La combinación de diseño + marketing + IA lo convierte en un perfil muy completo para equipos pequeños.",
      autor: "Mentor",
      cargo: "Senior Designer",
    },
    {
      texto: "Lo que más me sorprendió fue cómo integró IA en la estrategia de marketing sin perder el tono de marca. Las campañas ganaron en velocidad y en coherencia.",
      autor: "Colaboración · Agencia Digital",
      cargo: "Digital Marketing Lead",
    },
  ],
  en: [
    {
      texto: "Roger combines visual and strategic judgment in an unusual way, understanding the brand as a system rather than a collection of loose pieces.",
      autor: "Client · INTERA",
      cargo: "Marketing Manager",
    },
    {
      texto: "Working with Roger on international trade fairs was key: complex technology turned into materials anyone could understand.",
      autor: "Team · nVision Systems",
      cargo: "R&D Lead",
    },
    {
      texto: "Detail-oriented, organized and proactive. Brings solutions when others only see problems, and always calmly.",
      autor: "Colleague · Sensing & Control",
      cargo: "Project Manager",
    },
    {
      texto: "The campaigns designed for the city council worked because they weren't just pretty: they were legible, clear and respected the institutional tone.",
      autor: "Collaboration · City Council",
      cargo: "Communications",
    },
    {
      texto: "Honest, curious and highly motivated. The mix of design + marketing + AI makes for a very complete profile for small teams.",
      autor: "Mentor",
      cargo: "Senior Designer",
    },
    {
      texto: "What surprised me most was how AI was brought into the marketing strategy without losing the brand's tone. The campaigns gained in both speed and consistency.",
      autor: "Collaboration · Digital Agency",
      cargo: "Digital Marketing Lead",
    },
  ],
};
