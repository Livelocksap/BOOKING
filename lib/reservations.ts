import "server-only";
import { prisma } from "@/lib/db";
import {
  esFechaReservable,
  esHoraPasada,
  esReservaCancelable,
  HORA_INICIO,
  HORA_FIN,
} from "@/lib/dates";

export class ReservaError extends Error {}

export async function crearReserva(opts: {
  memberId: string;
  courtId: string;
  date: string;
  hour: number;
}) {
  const { memberId, courtId, date, hour } = opts;

  if (!esFechaReservable(date)) {
    throw new ReservaError(
      "Esa fecha esta fuera de la ventana de reserva (hoy hasta dentro de 2 dias)."
    );
  }
  if (hour < HORA_INICIO || hour >= HORA_FIN) {
    throw new ReservaError("Esa franja horaria no existe.");
  }
  if (esHoraPasada(date, hour)) {
    throw new ReservaError("Esa franja ya ha pasado.");
  }

  return prisma.$transaction(async (tx) => {
    const pistaOcupada = await tx.reservation.findFirst({
      where: { courtId, date, hour, status: "ACTIVA" },
    });
    if (pistaOcupada) {
      throw new ReservaError("Esa pista ya esta reservada en esa franja.");
    }

    const socioYaReservo = await tx.reservation.findFirst({
      where: { memberId, date, status: "ACTIVA" },
    });
    if (socioYaReservo) {
      throw new ReservaError("Ya tienes una reserva ese dia.");
    }

    return tx.reservation.create({
      data: { memberId, courtId, date, hour, status: "ACTIVA" },
    });
  });
}

export async function cancelarReserva(opts: {
  reservationId: string;
  memberId: string;
  isAdmin: boolean;
}) {
  const { reservationId, memberId, isAdmin } = opts;

  const reserva = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reserva || reserva.status !== "ACTIVA") {
    throw new ReservaError("La reserva no existe o ya esta cancelada.");
  }
  if (!isAdmin && reserva.memberId !== memberId) {
    throw new ReservaError("No puedes cancelar la reserva de otro socio.");
  }
  if (!esReservaCancelable(reserva.date, reserva.hour)) {
    throw new ReservaError("No se pueden cancelar reservas en el pasado.");
  }

  return prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELADA", cancelledAt: new Date() },
  });
}

export async function informarResultado(opts: {
  reservationId: string;
  memberId: string;
  jugador1: string;
  jugador2: string;
  resultado: string;
}) {
  const { reservationId, memberId, jugador1, jugador2, resultado } = opts;

  const reserva = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reserva || reserva.status !== "ACTIVA") {
    throw new ReservaError("La reserva no existe o esta cancelada.");
  }
  if (reserva.memberId !== memberId) {
    throw new ReservaError("No puedes editar el resultado de otro socio.");
  }
  if (esReservaCancelable(reserva.date, reserva.hour)) {
    throw new ReservaError(
      "Solo se puede informar el resultado de una reserva ya jugada."
    );
  }

  return prisma.reservation.update({
    where: { id: reservationId },
    data: {
      jugador1: jugador1.trim() || null,
      jugador2: jugador2.trim() || null,
      resultado: resultado.trim() || null,
    },
  });
}
