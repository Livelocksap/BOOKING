"use client";

import { useActionState, useEffect, useRef } from "react";
import { cambiarPassword } from "./actions";

export function CambiarPasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(cambiarPassword, undefined);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="actual" className="text-sm font-medium">
          Contraseña actual
        </label>
        <input
          id="actual"
          name="actual"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="nueva" className="text-sm font-medium">
          Nueva contraseña
        </label>
        <input
          id="nueva"
          name="nueva"
          type="password"
          autoComplete="new-password"
          required
          className="rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="nueva2" className="text-sm font-medium">
          Repite la nueva contraseña
        </label>
        <input
          id="nueva2"
          name="nueva2"
          type="password"
          autoComplete="new-password"
          required
          className="rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && (
        <p className="text-sm text-green-700 dark:text-green-400">
          Contraseña actualizada.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded bg-foreground px-4 py-2 text-background disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
