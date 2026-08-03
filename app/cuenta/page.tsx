import { requireSocio } from "@/lib/auth";
import { CambiarPasswordForm } from "./form";

export default async function CuentaPage() {
  await requireSocio();

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Cambiar contraseña</h1>
      <CambiarPasswordForm />
    </div>
  );
}
