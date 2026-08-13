import "server-only";
import {
  HORA_INICIO,
  HORA_FIN,
  PASO_MINUTOS,
  DURACIONES_MINUTOS,
  esInicioPasado,
  type DuracionMinutos,
} from "@/lib/dates";

type ReservaBase = { startMinute: number; durationMinutes: number };

export type SegmentoOcupado<T> = {
  tipo: "ocupado";
  inicioMinuto: number;
  finMinuto: number;
  reserva: T;
};

export type SegmentoLibre = {
  tipo: "libre";
  inicioMinuto: number;
  duracionesDisponibles: DuracionMinutos[];
  pasado: boolean;
};

export type SegmentoHueco = {
  tipo: "hueco";
  inicioMinuto: number;
  finMinuto: number;
};

export type Segmento<T> = SegmentoOcupado<T> | SegmentoLibre | SegmentoHueco;

/**
 * Construye la linea de tiempo de un dia para una pista: reservas existentes
 * (fusionadas en un solo segmento por su duracion completa), huecos libres
 * donde cabe alguna duracion reservable, y huecos demasiado cortos para
 * cualquier duracion.
 */
export function construirLinea<T extends ReservaBase>(
  fechaISO: string,
  reservas: T[]
): Segmento<T>[] {
  const apertura = HORA_INICIO * 60;
  const cierre = HORA_FIN * 60;
  const duracionMinima = Math.min(...DURACIONES_MINUTOS);
  const ordenadas = [...reservas].sort((a, b) => a.startMinute - b.startMinute);

  const segmentos: Segmento<T>[] = [];
  let cursor = apertura;

  while (cursor < cierre) {
    const reservaAqui = ordenadas.find((r) => r.startMinute === cursor);
    if (reservaAqui) {
      segmentos.push({
        tipo: "ocupado",
        inicioMinuto: cursor,
        finMinuto: cursor + reservaAqui.durationMinutes,
        reserva: reservaAqui,
      });
      cursor += reservaAqui.durationMinutes;
      continue;
    }

    const siguiente = ordenadas.find((r) => r.startMinute > cursor);
    const limite = siguiente ? Math.min(siguiente.startMinute, cierre) : cierre;
    const hueco = limite - cursor;

    if (hueco >= duracionMinima) {
      const duracionesDisponibles = DURACIONES_MINUTOS.filter(
        (d) => cursor + d <= limite
      );
      segmentos.push({
        tipo: "libre",
        inicioMinuto: cursor,
        duracionesDisponibles,
        pasado: esInicioPasado(fechaISO, cursor),
      });
    } else {
      segmentos.push({ tipo: "hueco", inicioMinuto: cursor, finMinuto: limite });
    }

    cursor += PASO_MINUTOS;
  }

  return segmentos;
}
