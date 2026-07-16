"use client";

import { useActionState } from "react";
import {
  saveTeamMemberAction,
  type ActionState,
} from "@/lib/actions/admin";
import type { TeamUser } from "@/lib/types";
import {
  PERMISSION_LABELS,
  PERMISSIONS,
  type Permission,
} from "@/lib/permissions";
import { CheckField, Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ActionState = {};

export function TeamForm({ member }: { member?: TeamUser }) {
  const [state, action, pending] = useActionState(saveTeamMemberAction, initial);
  const isOwner = member?.isOwner;

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-4">
      {member && <input type="hidden" name="id" value={member.id} />}
      <Field label="Ad soyad *">
        <input name="name" required defaultValue={member?.name} className={fieldClass} />
      </Field>
      <Field label="E-posta *">
        <input
          name="email"
          type="email"
          required
          defaultValue={member?.email}
          className={fieldClass}
        />
      </Field>
      <Field
        label={
          member
            ? "Yeni şifre (boş bırakırsanız değişmez)"
            : "Şifre * (min 8 karakter)"
        }
      >
        <input
          name="password"
          type="password"
          minLength={member ? undefined : 8}
          required={!member}
          className={fieldClass}
          autoComplete="new-password"
        />
      </Field>

      {!isOwner && (
        <>
          <CheckField
            name="active"
            label="Aktif hesap"
            defaultChecked={member?.active ?? true}
          />
          <div>
            <p className="mb-2 text-xs text-muted">Yetkiler</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PERMISSIONS.map((p: Permission) => (
                <CheckField
                  key={p}
                  name={`perm_${p}`}
                  label={PERMISSION_LABELS[p]}
                  defaultChecked={
                    member
                      ? member.permissions.includes(p)
                      : p === "dashboard"
                  }
                />
              ))}
            </div>
          </div>
        </>
      )}

      {isOwner && (
        <p className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted">
          Bu hesap sahip (owner). Tüm yetkilere sahiptir; yetki kutuları kilitlidir.
        </p>
      )}

      {state.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      <SubmitBar pending={pending} hrefCancel="/admin/ekip" />
    </form>
  );
}
