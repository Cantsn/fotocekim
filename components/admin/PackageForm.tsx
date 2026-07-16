"use client";

import { useActionState } from "react";
import {
  savePackageAction,
  type ActionState,
} from "@/lib/actions/admin";
import type { Package } from "@/lib/types";
import { CheckField, Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ActionState = {};

export function PackageForm({ pkg }: { pkg?: Package }) {
  const [state, action, pending] = useActionState(savePackageAction, initial);

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-4">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}
      <Field label="Paket adı *">
        <input name="name" required defaultValue={pkg?.name} className={fieldClass} />
      </Field>
      <Field label="Slug">
        <input
          name="slug"
          defaultValue={pkg?.slug}
          placeholder="otomatik"
          className={fieldClass}
        />
      </Field>
      <Field label="Açıklama">
        <textarea
          name="description"
          rows={2}
          defaultValue={pkg?.description}
          className={fieldClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Başlangıç fiyatı (TL, boş = gizli)">
          <input
            name="priceFrom"
            type="number"
            defaultValue={pkg?.priceFrom ?? ""}
            className={fieldClass}
          />
        </Field>
        <Field label="Para birimi">
          <input
            name="currency"
            defaultValue={pkg?.currency ?? "TRY"}
            className={fieldClass}
          />
        </Field>
      </div>
      <Field label="Özellikler (her satır bir madde)">
        <textarea
          name="features"
          rows={8}
          defaultValue={pkg?.features.join("\n")}
          className={fieldClass}
          placeholder={"4 saat çekim\n1 fotoğrafçı"}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Sıra">
          <input
            name="order"
            type="number"
            defaultValue={pkg?.order ?? 0}
            className={fieldClass}
          />
        </Field>
        <div className="flex items-end pb-2">
          <CheckField
            name="highlight"
            label="Öne çıkan paket"
            defaultChecked={pkg?.highlight}
          />
        </div>
        <div className="flex items-end pb-2">
          <CheckField
            name="published"
            label="Yayında"
            defaultChecked={pkg?.published ?? true}
          />
        </div>
      </div>
      {state.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      <SubmitBar pending={pending} hrefCancel="/admin/paketler" />
    </form>
  );
}
