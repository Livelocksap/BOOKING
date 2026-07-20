import Link from "next/link";
import { getSession } from "@/lib/auth";
import { cerrarSesion } from "@/app/actions";

export default async function NavBar() {
  const session = await getSession();
  const autenticado = Boolean(session.memberId);

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
        <span className="font-semibold">Pistas de Padel</span>
        {autenticado && (
          <>
            <Link href="/reservas" className="hover:underline">
              Reservas
            </Link>
            <Link href="/mis-reservas" className="hover:underline">
              Mis reservas
            </Link>
            {session.role === "ADMIN" && (
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>
            )}
          </>
        )}
        <Link href="/ayuda" className="hover:underline">
          Ayuda
        </Link>
        {autenticado ? (
          <span className="ml-auto flex items-center gap-3 text-black/60 dark:text-white/60">
            {session.nombre}
            <form action={cerrarSesion}>
              <button type="submit" className="hover:underline">
                Cerrar sesion
              </button>
            </form>
          </span>
        ) : (
          <span className="ml-auto flex items-center gap-3">
            <Link href="/login" className="hover:underline">
              Iniciar sesion
            </Link>
            <Link href="/registro" className="hover:underline">
              Registrarse
            </Link>
          </span>
        )}
      </nav>
    </header>
  );
}
