"use client";

import { useActionState } from "react";
import { saveFaqAction, type ActionState } from "@/lib/actions/admin";
import type { Faq } from "@/lib/types";
import { CheckField, Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ActionState = {};

export function FaqForm({ item }: { item?: Faq }) {
  const [state, action, pending] = useActionState(saveFaqAction, initial);

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Soru *">
        <input
          name="question"
          required
          defaultValue={item?.question}
          className={fieldClass}
          placeholder="Teslimat ne kadar sürer?"
        />
      </Field>
      <Field label="Cevap *">
        <textarea
          name="answer"
          required
          rows={6}
          defaultValue={item?.answer}
          className={fieldClass}
          placeholder="Kısa ve net bir cevap yazın…"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
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
            label="Yayında (/sss sayfasında göster)"
            defaultChecked={item?.published ?? true}
          />
        </div>
      </div>
      {state.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      <SubmitBar pending={pending} hrefCancel="/admin/sss" />
    </form>
  );
}
