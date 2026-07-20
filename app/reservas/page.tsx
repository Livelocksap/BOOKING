import { requireSocio } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  ventanaReservable,
  horasDisponibles,
  etiquetaFecha,
  esHoraPasada,
} from "@/lib/dates";
import { reservar, cancelar } from "./actions";

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireSocio();
  const { error } = await searchParams;

  const dias = ventanaReservable();
  const horas = horasDisponibles();

  const [courts, reservas] = await Promise.all([
    prisma.court.findMany({ orderBy: { name: "asc" } }),
    prisma.reservation.findMany({
      where: { status: "ACTIVA", date: { in: dias } },
      include: { member: { select: { nombre: true } } },
    }),
  ]);

  const porSlot = new Map(
    reservas.map((r) => [`${r.courtId}|${r.date}|${r.hour}`, r])
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Reservas</h1>
      <p className="mb-6 text-sm text-black/60 dark:text-white/60">
        Puedes reservar desde hoy hasta dentro de 2 dias. Una pista por dia.
      </p>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-8">
        {dias.map((fecha) => (
          <section key={fecha}>
            <h2 className="mb-3 font-medium">
              {etiquetaFecha(fecha)}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {courts.map((court) => (
                <div key={court.id}>
                  <h3 className="mb-2 text-sm font-semibold text-black/70 dark:text-white/70">
                    {court.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {horas.map((hora) => {
                      const reserva = porSlot.get(
                        `${court.id}|${fecha}|${hora}`
                      );
                      const esMia = reserva?.memberId === session.memberId;
                      const etiquetaHora = `${hora}:00`;
                      const pasada = esHoraPasada(fecha, hora);

                      if (!reserva && pasada) {
                        return (
                          <div
                            key={hora}
                            className="w-full rounded border border-black/10 bg-black/5 px-2 py-1.5 text-center text-sm text-black/40 dark:border-white/10 dark:bg-white/5 dark:text-white/40"
                          >
                            {etiquetaHora}
                          </div>
                        );
                      }

                      if (!reserva) {
                        return (
                          <form key={hora} action={reservar}>
                            <input type="hidden" name="courtId" value={court.id} />
                            <input type="hidden" name="date" value={fecha} />
                            <input type="hidden" name="hour" value={hora} />
                            <input type="hidden" name="volverA" value="/reservas" />
                            <button
                              type="submit"
                              className="w-full rounded border border-green-600/40 bg-green-50 px-2 py-1.5 text-sm text-green-800 hover:bg-green-100 dark:border-green-400/30 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
                            >
                              {etiquetaHora}
                            </button>
                          </form>
                        );
                      }

                      if (esMia) {
                        return (
                          <form key={hora} action={cancelar}>
                            <input
                              type="hidden"
                              name="reservationId"
                              value={reserva.id}
                            />
                            <input type="hidden" name="volverA" value="/reservas" />
                            <button
                              type="submit"
                              title="Cancelar reserva"
                              className="w-full rounded border border-blue-600/40 bg-blue-50 px-2 py-1.5 text-sm text-blue-800 hover:bg-blue-100 dark:border-blue-400/30 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                            >
                              {etiquetaHora} (tuya)
                            </button>
                          </form>
                        );
                      }

                      return (
                        <div
                          key={hora}
                          className="w-full rounded border border-black/10 bg-black/5 px-2 py-1.5 text-center text-sm text-black/40 dark:border-white/10 dark:bg-white/5 dark:text-white/40"
                        >
                          {etiquetaHora}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
