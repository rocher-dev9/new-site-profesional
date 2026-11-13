// Tipo de las tarjetas de experiencia y formación de Sobre mí (componente Trayectoria)
export interface Entrada {
  categoria: string;
  titulo: string;
  texto: string;
  org: string;
  mono: string;     // iniciales del monograma (2–3 letras)
  fechas: string;
  caso?: string;    // clave del proyecto en src/proyectos/; si existe, la tarjeta enlaza a su caso
}
