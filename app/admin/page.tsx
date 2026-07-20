import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { etiquetaFecha } from "@/lib/dates";
import { cancelar } from "@/app/reservas/actions";
import { eliminarSocio } from "./actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  const [reservas, socios] = await Promise.all([
    prisma.reservation.findMany({
      where: { status: "ACTIVA" },
      include: { court: true, member: { select: { nombre: true, portal: true, planta: true, puerta: true } } },
      orderBy: [{ date: "asc" }, { hour: "asc" }],
    }),
    prisma.member.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-6 text-2xl font-semibold">Administracion</h1>
        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium">Reservas activas</h2>
        {reservas.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">
            No hay reservas activas.
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
                    {etiquetaFecha(reserva.date)} · {reserva.court.name} ·{" "}
                    {reserva.hour}:00
                  </p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {reserva.member.nombre} (portal {reserva.member.portal}, planta{" "}
                    {reserva.member.planta}, puerta {reserva.member.puerta})
                  </p>
                </div>
                <form action={cancelar}>
                  <input type="hidden" name="reservationId" value={reserva.id} />
                  <input type="hidden" name="volverA" value="/admin" />
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
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Socios ({socios.length})</h2>
        <ul className="flex flex-col gap-3">
          {socios.map((socio) => (
            <li
              key={socio.id}
              className="flex items-center justify-between rounded border border-black/10 px-4 py-3 dark:border-white/10"
            >
              <div>
                <p className="font-medium">
                  {socio.nombre}{" "}
                  {socio.role === "ADMIN" && (
                    <span className="ml-1 rounded bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/10">
                      admin
                    </span>
                  )}
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  @{socio.username} · portal {socio.portal}, planta{" "}
                  {socio.planta}, puerta {socio.puerta}
                </p>
              </div>
              <form action={eliminarSocio}>
                <input type="hidden" name="memberId" value={socio.id} />
                <button
                  type="submit"
                  className="rounded border border-red-600/40 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Eliminar
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
