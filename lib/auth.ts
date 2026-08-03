import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

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

const SIN_AMBIGUOS = "abcdefghjkmnpqrstuvwxyz23456789"; // sin 0/O, 1/l/I

export function generarPasswordTemporal(longitud = 10) {
  let password = "";
  for (let i = 0; i < longitud; i++) {
    password += SIN_AMBIGUOS[crypto.randomInt(SIN_AMBIGUOS.length)];
  }
  return password;
}
