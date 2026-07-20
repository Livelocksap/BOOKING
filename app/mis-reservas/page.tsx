import { requireSocio } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { etiquetaFecha } from "@/lib/dates";
import { cancelar } from "@/app/reservas/actions";

export default async function MisReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireSocio();
  const { error } = await searchParams;

  const reservas = await prisma.reservation.findMany({
    where: { memberId: session.memberId, status: "ACTIVA" },
    include: { court: true },
    orderBy: [{ date: "asc" }, { hour: "asc" }],
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Mis reservas</h1>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {reservas.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No tienes reservas activas.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reservas.map((reserva) => (
            <li
              key={reserva.id}
              className="flex items-center justify-between rounded border border-black/10 px-4 py-3 dark:border-white/10"
            >
              <div>
                <p className="font-medium capitalize">
                  {etiquetaFecha(reserva.date)}
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {reserva.court.name} · {reserva.hour}:00 - {reserva.hour + 1}:00
                </p>
              </div>
              <form action={cancelar}>
                <input type="hidden" name="reservationId" value={reserva.id} />
                <input type="hidden" name="volverA" value="/mis-reservas" />
                <button
                  type="submit"
                  className="rounded border border-red-600/40 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Cancelar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
