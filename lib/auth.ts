import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";
import bcrypt from "bcryptjs";

export interface SessionData {
  memberId?: string;
  username?: string;
  nombre?: string;
  role?: "SOCIO" | "ADMIN";
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "pistas_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireSocio() {
  const session = await getSession();
  if (!session.memberId) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSocio();
  if (session.role !== "ADMIN") {
    redirect("/reservas");
  }
  return session;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
