"use client";

import { useActionState } from "react";
import {
  saveAnnouncementAction,
  type ActionState,
} from "@/lib/actions/admin";
import type { Announcement } from "@/lib/types";
import { CheckField, Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ActionState = {};

export function AnnouncementForm({ item }: { item?: Announcement }) {
  const [state, action, pending] = useActionState(
    saveAnnouncementAction,
    initial,
  );

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Başlık *">
        <input
          name="title"
          required
          defaultValue={item?.title}
          className={fieldClass}
          placeholder="Yaz kampanyası"
        />
      </Field>
      <Field label="Mesaj">
        <textarea
          name="message"
          rows={3}
          defaultValue={item?.message}
          className={fieldClass}
          placeholder="Seçili paketlerde %15 indirim — sınırlı süre"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Link URL">
          <input
            name="linkUrl"
            defaultValue={item?.linkUrl}
            className={fieldClass}
            placeholder="/randevu veya https://..."
          />
        </Field>
        <Field label="Link yazısı">
          <input
            name="linkLabel"
            defaultValue={item?.linkLabel}
            className={fieldClass}
            placeholder="Hemen bak"
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Stil">
          <select
            name="style"
            defaultValue={item?.style ?? "accent"}
            className={fieldClass}
          >
            <option value="accent">Altın vurgu</option>
            <option value="dark">Koyu</option>
            <option value="soft">Yumuşak</option>
          </select>
        </Field>
        <Field label="Başlangıç (opsiyonel)">
          <input
            name="startsAt"
            type="date"
            defaultValue={item?.startsAt}
            className={fieldClass}
          />
        </Field>
        <Field label="Bitiş (opsiyonel)">
          <input
            name="endsAt"
            type="date"
            defaultValue={item?.endsAt}
            className={fieldClass}
          />
        </Field>
      </div>
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
            name="active"
            label="Yayında (ana sayfada göster)"
            defaultChecked={item?.active ?? true}
          />
        </div>
      </div>
      {state.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      <SubmitBar pending={pending} hrefCancel="/admin/duyurular" />
    </form>
  );
}
