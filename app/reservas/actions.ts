"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSocio } from "@/lib/auth";
import {
  crearReserva,
  cancelarReserva,
  informarResultado,
  ReservaError,
} from "@/lib/reservations";

export async function reservar(formData: FormData) {
  const session = await requireSocio();

  const courtId = String(formData.get("courtId") ?? "");
  const date = String(formData.get("date") ?? "");
  const hour = Number(formData.get("hour"));
  const volverA = String(formData.get("volverA") ?? "/reservas");

  try {
    await crearReserva({ memberId: session.memberId!, courtId, date, hour });
  } catch (err) {
    const mensaje =
      err instanceof ReservaError ? err.message : "No se pudo crear la reserva.";
    redirect(`${volverA}?error=${encodeURIComponent(mensaje)}`);
  }

  revalidatePath("/reservas");
  revalidatePath("/mis-reservas");
  redirect(volverA);
}

export async function cancelar(formData: FormData) {
  const session = await requireSocio();

  const reservationId = String(formData.get("reservationId") ?? "");
  const volverA = String(formData.get("volverA") ?? "/mis-reservas");

  try {
    await cancelarReserva({
      reservationId,
      memberId: session.memberId!,
      isAdmin: session.role === "ADMIN",
    });
  } catch (err) {
    const mensaje =
      err instanceof ReservaError ? err.message : "No se pudo cancelar la reserva.";
    redirect(`${volverA}?error=${encodeURIComponent(mensaje)}`);
  }

  revalidatePath("/reservas");
  revalidatePath("/mis-reservas");
  revalidatePath("/admin");
  redirect(volverA);
}

export async function guardarResultado(formData: FormData) {
  const session = await requireSocio();

  const reservationId = String(formData.get("reservationId") ?? "");
  const jugador1 = String(formData.get("jugador1") ?? "");
  const jugador2 = String(formData.get("jugador2") ?? "");
  const resultado = String(formData.get("resultado") ?? "");
  const volverA = String(formData.get("volverA") ?? "/mis-reservas");

  try {
    await informarResultado({
      reservationId,
      memberId: session.memberId!,
      jugador1,
      jugador2,
      resultado,
    });
  } catch (err) {
    const mensaje =
      err instanceof ReservaError ? err.message : "No se pudo guardar el resultado.";
    redirect(`${volverA}?error=${encodeURIComponent(mensaje)}`);
  }

  revalidatePath("/mis-reservas");
  redirect(volverA);
}
