"use server";

import { requireSocio, verifyPassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type CambiarPasswordState = { error?: string; ok?: boolean } | undefined;

export async function cambiarPassword(
  _prevState: CambiarPasswordState,
  formData: FormData
): Promise<CambiarPasswordState> {
  const session = await requireSocio();
  const actual = String(formData.get("actual") ?? "");
  const nueva = String(formData.get("nueva") ?? "");
  const nueva2 = String(formData.get("nueva2") ?? "");

  if (!actual || !nueva || !nueva2) {
    return { error: "Rellena todos los campos." };
  }
  if (nueva.length < 6) {
    return { error: "La contrasena nueva debe tener al menos 6 caracteres." };
  }
  if (nueva !== nueva2) {
    return { error: "Las contrasenas nuevas no coinciden." };
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId! },
  });
  if (!member || !(await verifyPassword(actual, member.passwordHash))) {
    return { error: "La contrasena actual no es correcta." };
  }

  const passwordHash = await hashPassword(nueva);
  await prisma.member.update({
    where: { id: member.id },
    data: { passwordHash },
  });

  return { ok: true };
}
