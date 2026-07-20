"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrar } from "./actions";

function Campo(props: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  const { id, label, type = "text", autoComplete } = props;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        className="rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />
    </div>
  );
}

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(registrar, undefined);

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-2xl font-semibold">Alta de socio</h1>
      <p className="mb-6 text-sm text-black/60 dark:text-white/60">
        Identifícate con los datos de tu vivienda para darte de alta.
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <Campo id="nombre" label="Nombre y apellidos" autoComplete="name" />
        <div className="grid grid-cols-3 gap-3">
          <Campo id="portal" label="Portal" />
          <Campo id="planta" label="Planta" />
          <Campo id="puerta" label="Puerta" />
        </div>
        <Campo id="username" label="Usuario" autoComplete="username" />
        <Campo
          id="password"
          label="Contrasena"
          type="password"
          autoComplete="new-password"
        />
        <Campo
          id="password2"
          label="Repite la contrasena"
          type="password"
          autoComplete="new-password"
        />
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded bg-foreground px-4 py-2 text-background disabled:opacity-60"
        >
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
