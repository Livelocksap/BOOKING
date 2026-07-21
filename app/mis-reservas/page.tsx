import { requireSocio } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { etiquetaFecha, esReservaCancelable } from "@/lib/dates";
import { cancelar, guardarResultado } from "@/app/reservas/actions";

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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-black/60 dark:border-white/10 dark:text-white/60">
                <th className="py-2 pr-4 font-medium">Fecha</th>
                <th className="py-2 pr-4 font-medium">Pista</th>
                <th className="py-2 pr-4 font-medium">Hora</th>
                <th className="py-2 pr-2 font-medium">Jugador 1</th>
                <th className="py-2 pr-2 font-medium">Jugador 2</th>
                <th className="py-2 pr-2 font-medium">Resultado</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => {
                const cancelable = esReservaCancelable(reserva.date, reserva.hour);
                const formId = `resultado-${reserva.id}`;

                return (
                  <tr
                    key={reserva.id}
                    className="border-b border-black/5 dark:border-white/5"
                  >
                    <td className="py-2 pr-4">{etiquetaFecha(reserva.date)}</td>
                    <td className="py-2 pr-4">{reserva.court.name}</td>
                    <td className="py-2 pr-4">
                      {reserva.hour}:00 - {reserva.hour + 1}:00
                    </td>

                    {cancelable ? (
                      <>
                        <td
                          className="py-2 text-black/40 dark:text-white/40"
                          colSpan={3}
                        >
                          Pendiente de jugar
                        </td>
                        <td className="py-2">
                          <form action={cancelar}>
                            <input
                              type="hidden"
                              name="reservationId"
                              value={reserva.id}
                            />
                            <input
                              type="hidden"
                              name="volverA"
                              value="/mis-reservas"
                            />
                            <button
                              type="submit"
                              className="rounded border border-red-600/40 px-3 py-1.5 text-sm whitespace-nowrap text-red-700 hover:bg-red-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-950"
                            >
                              Cancelar
                            </button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-2">
                          <input
                            form={formId}
                            name="jugador1"
                            defaultValue={reserva.jugador1 ?? ""}
                            placeholder="Jugador 1"
                            className="w-full rounded border border-black/10 bg-transparent px-2 py-1 dark:border-white/10"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            form={formId}
                            name="jugador2"
                            defaultValue={reserva.jugador2 ?? ""}
                            placeholder="Jugador 2"
                            className="w-full rounded border border-black/10 bg-transparent px-2 py-1 dark:border-white/10"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            form={formId}
                            name="resultado"
                            defaultValue={reserva.resultado ?? ""}
                            placeholder="Ej. 6-3, 6-4"
                            className="w-full rounded border border-black/10 bg-transparent px-2 py-1 dark:border-white/10"
                          />
                        </td>
                        <td className="py-2">
                          <form id={formId} action={guardarResultado}>
                            <input
                              type="hidden"
                              name="reservationId"
                              value={reserva.id}
                            />
                            <input
                              type="hidden"
                              name="volverA"
                              value="/mis-reservas"
                            />
                            <button
                              type="submit"
                              className="rounded border border-blue-600/40 px-3 py-1.5 text-sm whitespace-nowrap text-blue-700 hover:bg-blue-50 dark:border-blue-400/30 dark:text-blue-300 dark:hover:bg-blue-950"
                            >
                              Guardar
                            </button>
                          </form>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
