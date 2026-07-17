"use client";

import { useActionState, useState } from "react";
import {
  savePackageAction,
  type ActionState,
} from "@/lib/actions/admin";
import type { Package } from "@/lib/types";
import { CheckField, Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ActionState = {};

export function PackageForm({ pkg }: { pkg?: Package }) {
  const [state, action, pending] = useActionState(savePackageAction, initial);
  const [discountType, setDiscountType] = useState(
    pkg?.discountType && pkg.discountType !== "NONE"
      ? pkg.discountType
      : "NONE",
  );

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
        <Field label="Liste fiyatı / başlangıç (TL)">
          <input
            name="priceFrom"
            type="number"
            min={0}
            defaultValue={pkg?.priceFrom ?? ""}
            className={fieldClass}
            placeholder="28000"
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

      <div className="rounded-2xl border border-border bg-muted-bg/40 p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">İndirim</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="İndirim tipi">
            <select
              name="discountType"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as typeof discountType)}
              className={fieldClass}
            >
              <option value="NONE">Yok</option>
              <option value="PERCENT">Oran (%)</option>
              <option value="AMOUNT">Tutar (TL)</option>
            </select>
          </Field>
          <Field
            label={
              discountType === "PERCENT"
                ? "İndirim oranı (%)"
                : discountType === "AMOUNT"
                  ? "İndirim tutarı (TL)"
                  : "Değer"
            }
          >
            <input
              name="discountValue"
              type="number"
              min={0}
              max={discountType === "PERCENT" ? 100 : undefined}
              disabled={discountType === "NONE"}
              defaultValue={
                pkg?.discountType !== "NONE" ? (pkg?.discountValue ?? "") : ""
              }
              className={fieldClass}
              placeholder={discountType === "PERCENT" ? "15" : "5000"}
            />
          </Field>
        </div>
        <p className="text-xs text-muted">
          Sitede eski fiyat üstü çizili, indirimli fiyat vurgulu görünür.
        </p>
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
