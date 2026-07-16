"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateProfileAction,
  type ProfileState,
} from "@/lib/actions/auth";
import { Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ProfileState = {};

export function ProfileInfoForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <form action={action} className="space-y-4">
      <h2 className="font-serif text-xl text-foreground">Profil bilgileri</h2>
      <Field label="Ad soyad">
        <input name="name" required defaultValue={name} className={fieldClass} />
      </Field>
      <Field label="E-posta">
        <input
          name="email"
          type="email"
          required
          defaultValue={email}
          className={fieldClass}
        />
      </Field>
      {state.error && (
        <p className="text-sm text-danger">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-success">Profil güncellendi.</p>
      )}
      <SubmitBar pending={pending} label="Profili kaydet" />
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);

  return (
    <form action={action} className="space-y-4">
      <h2 className="font-serif text-xl text-foreground">Şifre değiştir</h2>
      <Field label="Mevcut şifre">
        <input
          name="currentPassword"
          type="password"
          required
          className={fieldClass}
          autoComplete="current-password"
        />
      </Field>
      <Field label="Yeni şifre (min 8)">
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          className={fieldClass}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Yeni şifre tekrar">
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className={fieldClass}
          autoComplete="new-password"
        />
      </Field>
      {state.error && (
        <p className="text-sm text-danger">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-success">Şifre güncellendi.</p>
      )}
      <SubmitBar pending={pending} label="Şifreyi güncelle" />
    </form>
  );
}
