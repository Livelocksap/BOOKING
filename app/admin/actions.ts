"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
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
