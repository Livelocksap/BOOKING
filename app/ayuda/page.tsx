import Link from "next/link";
import { HORA_INICIO, HORA_FIN, DIAS_VENTANA } from "@/lib/dates";
import { PORTALES, PLANTAS, PUERTAS } from "@/lib/vivienda";

export default function AyudaPage() {
  const diasExtra = DIAS_VENTANA - 1;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Ayuda</h1>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-medium">¿Qué es esta aplicación?</h2>
        <p className="text-sm text-black/70 dark:text-white/70">
          Permite a los socios de la comunidad reservar la Pista 1 o la
          Pista 2 de pádel para jugar en una franja horaria concreta.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-medium">Cómo darte de alta</h2>
        <p className="mb-2 text-sm text-black/70 dark:text-white/70">
          Entra en{" "}
          <Link href="/registro" className="underline">
            Registrarse
          </Link>{" "}
          y rellena:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-black/70 dark:text-white/70">
          <li>Nombre y apellidos.</li>
          <li>
            Portal (del {PORTALES[0]} al {PORTALES[PORTALES.length - 1]}),
            planta ({PLANTAS.join(", ")}) y puerta ({PUERTAS.join(", ")}) de
            tu vivienda, para identificarte como socio.
          </li>
          <li>
            Un usuario y una contraseña (mínimo 6 caracteres) para poder
            iniciar sesión más adelante.
          </li>
        </ul>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">
          Solo se permite una cuenta por vivienda (por combinación de
          portal, planta y puerta). Tras darte de alta entras
          automáticamente con tu nueva cuenta.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-medium">Cómo funcionan las reservas</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-black/70 dark:text-white/70">
          <li>
            Puedes reservar para hoy y para los {diasExtra} días siguientes.
            Cada medianoche la ventana avanza un día, así que cada día se
            libera automáticamente un nuevo día para reservar.
          </li>
          <li>
            Las franjas horarias son de una hora, de {HORA_INICIO}:00 a{" "}
            {HORA_FIN}:00.
          </li>
          <li>
            Cada socio puede tener como máximo una reserva activa por día,
            en cualquiera de las dos pistas.
          </li>
          <li>
            En{" "}
            <Link href="/reservas" className="underline">
              Reservas
            </Link>{" "}
            verás cada franja en verde (libre), en azul (tuya) o en gris
            (ocupada por otro socio). Para reservar, pulsa sobre una franja
            libre.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-medium">Cómo cancelar una reserva</h2>
        <p className="text-sm text-black/70 dark:text-white/70">
          Puedes cancelar tu reserva en cualquier momento, sin límite de
          antelación, desde{" "}
          <Link href="/mis-reservas" className="underline">
            Mis reservas
          </Link>{" "}
          o directamente desde la propia franja en{" "}
          <Link href="/reservas" className="underline">
            Reservas
          </Link>
          . En cuanto la canceles, la franja queda libre para otro socio.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">¿Algún problema?</h2>
        <p className="text-sm text-black/70 dark:text-white/70">
          Si tienes dudas sobre tu cuenta o una reserva, contacta con la
          administración de la comunidad.
        </p>
      </section>
    </div>
  );
}
