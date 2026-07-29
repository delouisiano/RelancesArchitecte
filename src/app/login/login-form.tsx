"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/modules/auth/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="panel form-panel narrow">
      {state.error ? (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      ) : null}
      <label>
        Identifiant
        <input name="username" required autoComplete="username" aria-invalid={Boolean(state.error)} />
      </label>
      <label>
        Mot de passe
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={Boolean(state.error)}
        />
      </label>
      <button className="button primary" type="submit" disabled={isPending}>
        {isPending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
