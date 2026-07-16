"use client";

import { useActionState } from "react";
import {
  saveServiceAction,
  type ActionState,
} from "@/lib/actions/admin";
import type { Service } from "@/lib/types";
import { CheckField, Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ActionState = {};

export function ServiceForm({ service }: { service?: Service }) {
  const [state, action, pending] = useActionState(saveServiceAction, initial);

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-4">
      {service && <input type="hidden" name="id" value={service.id} />}
      <Field label="Başlık *">
        <input
          name="title"
          required
          defaultValue={service?.title}
          className={fieldClass}
        />
      </Field>
      <Field label="Slug (URL)">
        <input
          name="slug"
          defaultValue={service?.slug}
          placeholder="otomatik üretilir"
          className={fieldClass}
        />
      </Field>
      <Field label="Kısa açıklama">
        <textarea
          name="shortDesc"
          rows={2}
          defaultValue={service?.shortDesc}
          className={fieldClass}
        />
      </Field>
      <Field label="Detay içerik">
        <textarea
          name="content"
          rows={10}
          defaultValue={service?.content}
          className={fieldClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sıra">
          <input
            name="order"
            type="number"
            defaultValue={service?.order ?? 0}
            className={fieldClass}
          />
        </Field>
        <div className="flex items-end pb-2">
          <CheckField
            name="published"
            label="Yayında"
            defaultChecked={service?.published ?? true}
          />
        </div>
      </div>
      {state.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      <SubmitBar pending={pending} hrefCancel="/admin/hizmetler" />
    </form>
  );
}
