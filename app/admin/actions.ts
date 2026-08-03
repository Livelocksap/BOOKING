"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, hashPassword, generarPasswordTemporal } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function eliminarSocio(formData: FormData) {
  const session = await requireAdmin();
  const memberId = String(formData.get("memberId") ?? "");

  if (memberId === session.memberId) {
    redirect(
      `/admin?error=${encodeURIComponent("No puedes eliminar tu propia cuenta.")}`
    );
  }

  await prisma.member.delete({ where: { id: memberId } });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function resetearPassword(formData: FormData) {
  await requireAdmin();
  const memberId = String(formData.get("memberId") ?? "");

  const socio = await prisma.member.findUnique({ where: { id: memberId } });
  if (!socio) {
    redirect(`/admin?error=${encodeURIComponent("Ese socio no existe.")}`);
  }

  const passwordTemporal = generarPasswordTemporal();
  const passwordHash = await hashPassword(passwordTemporal);
  await prisma.member.update({
    where: { id: memberId },
    data: { passwordHash },
  });

  revalidatePath("/admin");
  redirect(
    `/admin?nuevaPassword=${encodeURIComponent(passwordTemporal)}&nuevaPasswordPara=${encodeURIComponent(socio.nombre)}`
  );
}
