// Colores para texto sobre el color de un proyecto (etiquetas de cursor en Trabajo, tarjeta
// «Siguiente proyecto» de los casos). Texto oscuro sobre colores claros (p. ej. ámbar) y blanco
// sobre los oscuros; con texto blanco, el fondo se oscurece un 10 % para llegar a contraste 4,5:1
// (el verde de Sensing se quedaba en 4,37).
export function sobreColor(fondo: string): { texto: string; fondo: string } {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(fondo.slice(i, i + 2), 16) / 255);
  const claro = 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55;
  return claro
    ? { texto: '#15121f', fondo }
    : { texto: '#fff', fondo: `color-mix(in srgb, ${fondo} 90%, #000)` };
}
