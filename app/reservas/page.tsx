import { requireSocio } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ventanaReservable, etiquetaFecha, etiquetaHora, esReservaCancelable } from "@/lib/dates";
import { construirLinea, type Segmento, type SegmentoHueco } from "@/lib/timeline";
import { reservar, cancelar } from "./actions";

type ReservaSlot = {
  id: string;
  startMinute: number;
  durationMinutes: number;
  memberId: string;
};

function CeldaSegmento({
  segmento,
  fecha,
  courtId,
  memberIdActual,
}: {
  segmento: Exclude<Segmento<ReservaSlot>, SegmentoHueco>;
  fecha: string;
  courtId: string;
  memberIdActual: string;
}) {
  if (segmento.tipo === "ocupado") {
    const { reserva } = segmento;
    const esMia = reserva.memberId === memberIdActual;
    const etiqueta = `${etiquetaHora(segmento.inicioMinuto)}-${etiquetaHora(segmento.finMinuto)}`;

    if (esMia && esReservaCancelable(fecha, segmento.inicioMinuto)) {
      return (
        <form action={cancelar}>
          <input type="hidden" name="reservationId" value={reserva.id} />
          <input type="hidden" name="volverA" value="/reservas" />
          <button
            type="submit"
            title="Cancelar reserva"
            className="w-full rounded border border-blue-600/40 bg-blue-50 px-2 py-1.5 text-sm text-blue-800 hover:bg-blue-100 dark:border-blue-400/30 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            {etiqueta} (tuya)
          </button>
        </form>
      );
    }
    if (esMia) {
      return (
        <div
          title="Ya no se puede cancelar"
          className="w-full rounded border border-blue-600/40 bg-blue-50 px-2 py-1.5 text-center text-sm text-blue-800 dark:border-blue-400/30 dark:bg-blue-950 dark:text-blue-300"
        >
          {etiqueta} (tuya)
        </div>
      );
    }
    return (
      <div className="w-full rounded border border-black/10 bg-black/5 px-2 py-1.5 text-center text-sm text-black/40 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
        {etiqueta}
      </div>
    );
  }

  // libre
  if (segmento.pasado) {
    return (
      <div className="w-full rounded border border-black/10 bg-black/5 px-2 py-1.5 text-center text-sm text-black/40 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
        {etiquetaHora(segmento.inicioMinuto)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {segmento.duracionesDisponibles.map((duracion) => (
        <form key={duracion} action={reservar}>
          <input type="hidden" name="courtId" value={courtId} />
          <input type="hidden" name="date" value={fecha} />
          <input type="hidden" name="startMinute" value={segmento.inicioMinuto} />
          <input type="hidden" name="durationMinutes" value={duracion} />
          <input type="hidden" name="volverA" value="/reservas" />
          <button
            type="submit"
            className="w-full rounded border border-green-600/40 bg-green-50 px-2 py-1.5 text-sm text-green-800 hover:bg-green-100 dark:border-green-400/30 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900"
          >
            {etiquetaHora(segmento.inicioMinuto)} ({duracion} min)
          </button>
        </form>
      ))}
    </div>
  );
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireSocio();
  const { error } = await searchParams;

  const dias = ventanaReservable();

  const [courts, reservas] = await Promise.all([
    prisma.court.findMany({ orderBy: { name: "asc" } }),
    prisma.reservation.findMany({
      where: { status: "ACTIVA", date: { in: dias } },
      select: {
        id: true,
        date: true,
        courtId: true,
        startMinute: true,
        durationMinutes: true,
        memberId: true,
      },
    }),
  ]);

  const porPistaDia = new Map<string, ReservaSlot[]>();
  for (const r of reservas) {
    const clave = `${r.courtId}|${r.date}`;
    const lista = porPistaDia.get(clave) ?? [];
    lista.push(r);
    porPistaDia.set(clave, lista);
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Reservas</h1>
      <p className="mb-6 text-sm text-black/60 dark:text-white/60">
        Puedes reservar desde hoy hasta dentro de 2 días. Una pista por día,
        de 1 hora o de 1 hora y media.
      </p>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-8">
        {dias.map((fecha) => (
          <section key={fecha}>
            <h2 className="mb-3 font-medium">{etiquetaFecha(fecha)}</h2>
            <div className="grid grid-cols-2 gap-4">
              {courts.map((court) => {
                const reservasDia = porPistaDia.get(`${court.id}|${fecha}`) ?? [];
                const segmentos = construirLinea(fecha, reservasDia).filter(
                  (s): s is Exclude<Segmento<ReservaSlot>, SegmentoHueco> => s.tipo !== "hueco"
                );

                return (
                  <div key={court.id}>
                    <h3 className="mb-2 text-sm font-semibold text-black/70 dark:text-white/70">
                      {court.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {segmentos.map((segmento) => (
                        <CeldaSegmento
                          key={segmento.inicioMinuto}
                          segmento={segmento}
                          fecha={fecha}
                          courtId={court.id}
                          memberIdActual={session.memberId!}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
