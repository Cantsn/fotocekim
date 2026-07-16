"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-muted">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm"
          placeholder="admin@fotocekim.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs text-muted">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm"
        />
      </div>
      {state.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Giriş yapılıyor..." : "Giriş yap"}
      </Button>
    </form>
  );
}
