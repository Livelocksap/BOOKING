import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/auth";

const PROTEGIDAS = ["/reservas", "/mis-reservas", "/admin"];
const PUBLICAS_AUTH = ["/login", "/registro"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const session = await getIronSession<SessionData>(request, response, {
    password: process.env.SESSION_PASSWORD!,
    cookieName: "pistas_session",
  });

  const autenticado = Boolean(session.memberId);
  const esProtegida = PROTEGIDAS.some((ruta) => pathname.startsWith(ruta));
  const esAuthPublica = PUBLICAS_AUTH.some((ruta) => pathname.startsWith(ruta));

  if (esProtegida && !autenticado) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (esAuthPublica && autenticado) {
    return NextResponse.redirect(new URL("/reservas", request.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/reservas", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/reservas/:path*", "/mis-reservas/:path*", "/admin/:path*", "/login", "/registro"],
};
