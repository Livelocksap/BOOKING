import "server-only";

const TIME_ZONE = "Europe/Madrid";

export const HORA_INICIO = 9;
export const HORA_FIN = 22; // exclusiva: cierre a las 22:00
export const DIAS_VENTANA = 3; // hoy, +1, +2

export const PASO_MINUTOS = 30; // resolucion de las horas de inicio
export const DURACIONES_MINUTOS = [60, 90] as const;
export type DuracionMinutos = (typeof DURACIONES_MINUTOS)[number];

export function esDuracionValida(valor: number): valor is DuracionMinutos {
  return (DURACIONES_MINUTOS as readonly number[]).includes(valor);
}

/** Horas de inicio posibles (en minutos desde medianoche), cada PASO_MINUTOS,
 * desde la apertura hasta que ya no quepa ni la duracion mas corta. */
export function iniciosDisponibles(): number[] {
  const apertura = HORA_INICIO * 60;
  const cierre = HORA_FIN * 60;
  const duracionMinima = Math.min(...DURACIONES_MINUTOS);
  const inicios: number[] = [];
  for (let m = apertura; m + duracionMinima <= cierre; m += PASO_MINUTOS) {
    inicios.push(m);
  }
  return inicios;
}

/** Ej: 570 -> "9:30". */
export function etiquetaHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}:00` : `${h}:${String(m).padStart(2, "0")}`;
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
  // Mediodía UTC evita saltos de día por horario de verano al sumar días.
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

/** Minuto actual del dia en Europe/Madrid, 0..1439. */
export function minutoActualMadrid(): number {
  const horaTexto = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  const [h, m] = horaTexto.split(":").map(Number);
  return h * 60 + m;
}

/** Una hora de inicio ya ha pasado si es hoy y ese minuto ya quedo atras. */
export function esInicioPasado(fechaISO: string, inicioMinuto: number): boolean {
  return fechaISO === hoyMadrid() && inicioMinuto < minutoActualMadrid();
}

/**
 * Una reserva solo se puede cancelar antes de que empiece su franja.
 * Si la fecha es anterior a hoy, o es hoy y su hora de inicio ya ha
 * llegado o pasado, la reserva ya no es cancelable.
 */
export function esReservaCancelable(fechaISO: string, inicioMinuto: number): boolean {
  const hoy = hoyMadrid();
  if (fechaISO < hoy) return false;
  if (fechaISO > hoy) return true;
  return minutoActualMadrid() < inicioMinuto;
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
