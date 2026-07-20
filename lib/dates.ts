import "server-only";

const TIME_ZONE = "Europe/Madrid";

export const HORA_INICIO = 11;
export const HORA_FIN = 21; // exclusiva: la ultima franja empieza a las 20
export const DIAS_VENTANA = 3; // hoy, +1, +2

export function horasDisponibles(): number[] {
  const horas: number[] = [];
  for (let h = HORA_INICIO; h < HORA_FIN; h++) horas.push(h);
  return horas;
}

/** Fecha de "hoy" en Europe/Madrid, como "YYYY-MM-DD". */
export function hoyMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function sumarDias(fechaISO: string, dias: number): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  // Mediodia UTC evita saltos de dia por horario de verano al sumar dias.
  const base = new Date(Date.UTC(y, m - 1, d, 12));
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

/** Ventana de fechas reservables: hoy, hoy+1, hoy+2. */
export function ventanaReservable(): string[] {
  const hoy = hoyMadrid();
  return Array.from({ length: DIAS_VENTANA }, (_, i) => sumarDias(hoy, i));
}

export function esFechaReservable(fechaISO: string): boolean {
  return ventanaReservable().includes(fechaISO);
}

const FORMATO_ETIQUETA = new Intl.DateTimeFormat("es-ES", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Ej: "lunes, 20 de julio" a partir de una fecha "YYYY-MM-DD". */
export function etiquetaFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d, 12));
  const etiqueta = FORMATO_ETIQUETA.format(fecha);
  return etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
}
