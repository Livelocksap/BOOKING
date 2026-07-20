"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Iniciar sesion</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-sm font-medium">
            Usuario
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            required
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Contrasena
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded bg-foreground px-4 py-2 text-background disabled:opacity-60"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        ¿Aun no tienes cuenta?{" "}
        <Link href="/registro" className="underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
