"use client";

import { useActionState } from "react";
import { saveProjectAction, type ActionState } from "@/lib/actions/admin";
import type { Project } from "@/lib/types";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import { CheckField, Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ActionState = {};

export function ProjectForm({ project }: { project?: Project }) {
  const [state, action, pending] = useActionState(saveProjectAction, initial);

  return (
    <form
      action={action}
      className="mx-auto max-w-3xl space-y-4"
      encType="multipart/form-data"
    >
      {project && <input type="hidden" name="id" value={project.id} />}

      <Field label="Başlık *">
        <input
          name="title"
          required
          defaultValue={project?.title}
          className={fieldClass}
        />
      </Field>
      <Field label="Slug (URL)">
        <input
          name="slug"
          defaultValue={project?.slug}
          placeholder="otomatik"
          className={fieldClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Müşteri adı">
          <input
            name="clientFirstName"
            defaultValue={project?.clientFirstName}
            className={fieldClass}
          />
        </Field>
        <Field label="Müşteri soyadı">
          <input
            name="clientLastName"
            defaultValue={project?.clientLastName}
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tarih">
          <input
            name="date"
            type="date"
            defaultValue={project?.date}
            className={fieldClass}
          />
        </Field>
        <Field label="Kategori">
          <select
            name="category"
            defaultValue={project?.category ?? "dugun"}
            className={fieldClass}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lokasyon">
          <input
            name="location"
            defaultValue={project?.location}
            className={fieldClass}
            placeholder="İstanbul"
          />
        </Field>
        <Field label="Plato / set bilgisi">
          <input
            name="plato"
            defaultValue={project?.plato}
            className={fieldClass}
            placeholder="Bahçe seti, stüdyo A..."
          />
        </Field>
      </div>

      <Field label="Açıklama">
        <textarea
          name="description"
          rows={4}
          defaultValue={project?.description}
          className={fieldClass}
        />
      </Field>

      {!project && (
        <div className="rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm text-muted">
          Kaydettikten sonra düzenleme sayfasında kapak ve galeri fotoğraflarını
          yükleyebilir, sıralayabilir ve silebilirsiniz.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Sıra">
          <input
            name="order"
            type="number"
            defaultValue={project?.order ?? 0}
            className={fieldClass}
          />
        </Field>
        <div className="flex items-end pb-2">
          <CheckField
            name="featured"
            label="Öne çıkan"
            defaultChecked={project?.featured}
          />
        </div>
        <div className="flex items-end pb-2">
          <CheckField
            name="published"
            label="Yayında"
            defaultChecked={project?.published ?? true}
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      <SubmitBar pending={pending} hrefCancel="/admin/portfolyo" />
    </form>
  );
}
