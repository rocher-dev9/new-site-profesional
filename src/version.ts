// Versión para evitar la caché del navegador en CSS y JS (?v=…).
// Se genera sola en cada build con la fecha y hora (AAAAMMDDHHmm).
export const VERSION = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
