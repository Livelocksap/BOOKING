import "server-only";
import { prisma } from "@/lib/db";
import { esFechaReservable, HORA_INICIO, HORA_FIN } from "@/lib/dates";

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

  return prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELADA", cancelledAt: new Date() },
  });
}
