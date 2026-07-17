"use client";

import { useActionState } from "react";
import {
  saveTestimonialAction,
  type ActionState,
} from "@/lib/actions/admin";
import type { Testimonial } from "@/lib/types";
import { CheckField, Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ActionState = {};

export function TestimonialForm({ item }: { item?: Testimonial }) {
  const [state, action, pending] = useActionState(
    saveTestimonialAction,
    initial,
  );

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="İsim *">
          <input
            name="name"
            required
            defaultValue={item?.name}
            className={fieldClass}
            placeholder="Ayşe & Mehmet"
          />
        </Field>
        <Field label="Rol / bağlam">
          <input
            name="role"
            defaultValue={item?.role}
            className={fieldClass}
            placeholder="Düğün çekimi · İstanbul"
          />
        </Field>
      </div>
      <Field label="Yorum *">
        <textarea
          name="content"
          required
          rows={5}
          defaultValue={item?.content}
          className={fieldClass}
          placeholder="Çekim günü ve teslimat hakkında müşteri yorumu…"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Puan (1–5)">
          <select
            name="rating"
            defaultValue={item?.rating ?? 5}
            className={fieldClass}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} yıldız
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sıra">
          <input
            name="order"
            type="number"
            defaultValue={item?.order ?? 0}
            className={fieldClass}
          />
        </Field>
        <div className="flex items-end pb-2">
          <CheckField
            name="published"
            label="Yayında (ana sayfada göster)"
            defaultChecked={item?.published ?? true}
          />
        </div>
      </div>
      {state.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      <SubmitBar pending={pending} hrefCancel="/admin/referanslar" />
    </form>
  );
}
