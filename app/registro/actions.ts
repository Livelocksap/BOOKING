"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

export type RegistroState = { error?: string } | undefined;

export async function registrar(
  _prevState: RegistroState,
  formData: FormData
): Promise<RegistroState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const portal = String(formData.get("portal") ?? "").trim();
  const planta = String(formData.get("planta") ?? "").trim();
  const puerta = String(formData.get("puerta") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");

  if (!nombre || !portal || !planta || !puerta || !username || !password) {
    return { error: "Rellena todos los campos." };
  }
  if (password.length < 6) {
    return { error: "La contrasena debe tener al menos 6 caracteres." };
  }
  if (password !== password2) {
    return { error: "Las contrasenas no coinciden." };
  }

  const existente = await prisma.member.findUnique({ where: { username } });
  if (existente) {
    return { error: "Ese usuario ya existe, elige otro." };
  }

  const passwordHash = await hashPassword(password);
  const member = await prisma.member.create({
    data: { nombre, portal, planta, puerta, username, passwordHash },
  });

  const session = await getSession();
  session.memberId = member.id;
  session.username = member.username;
  session.nombre = member.nombre;
  session.role = member.role;
  await session.save();

  redirect("/reservas");
}
