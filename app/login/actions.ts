"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession, verifyPassword } from "@/lib/auth";

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Introduce usuario y contrasena." };
  }

  const member = await prisma.member.findUnique({ where: { username } });
  if (!member || !(await verifyPassword(password, member.passwordHash))) {
    return { error: "Usuario o contrasena incorrectos." };
  }

  const session = await getSession();
  session.memberId = member.id;
  session.username = member.username;
  session.nombre = member.nombre;
  session.role = member.role;
  await session.save();

  redirect("/reservas");
}
