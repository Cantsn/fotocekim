"use client";

import { useActionState, useState, useTransition } from "react";
import {
  saveSettingsAction,
  testSmtpAction,
  type ActionState,
} from "@/lib/actions/admin";
import type { SiteSettings } from "@/lib/types";
import { CheckField, Field, SubmitBar, fieldClass } from "./FormFields";

const initial: ActionState = {};

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, initial);
  const [testing, startTest] = useTransition();
  const [testState, setTestState] = useState<ActionState>({});

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <form action={action} className="space-y-4">
        <h2 className="font-serif text-xl text-foreground">Genel</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Site adı">
            <input name="siteName" defaultValue={settings.siteName} className={fieldClass} />
          </Field>
          <Field label="Slogan">
            <input name="tagline" defaultValue={settings.tagline} className={fieldClass} />
          </Field>
        </div>

        <h2 className="pt-4 font-serif text-xl text-foreground">İletişim</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefon">
            <input name="phone" defaultValue={settings.phone} className={fieldClass} />
          </Field>
          <Field label="WhatsApp (90...)">
            <input name="whatsapp" defaultValue={settings.whatsapp} className={fieldClass} />
          </Field>
          <Field label="E-posta">
            <input name="email" type="email" defaultValue={settings.email} className={fieldClass} />
          </Field>
          <Field label="Şehir">
            <input name="city" defaultValue={settings.city} className={fieldClass} />
          </Field>
        </div>
        <Field label="Adres">
          <input name="address" defaultValue={settings.address} className={fieldClass} />
        </Field>

        <h2 className="pt-4 font-serif text-xl text-foreground">Sosyal</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Instagram (profil linki)">
            <input name="instagram" defaultValue={settings.instagram} className={fieldClass} />
          </Field>
          <Field label="YouTube">
            <input name="youtube" defaultValue={settings.youtube} className={fieldClass} />
          </Field>
          <Field label="TikTok">
            <input name="tiktok" defaultValue={settings.tiktok} className={fieldClass} />
          </Field>
        </div>

        <h2 className="pt-4 font-serif text-xl text-foreground">
          Instagram API (portföy aktarma)
        </h2>
        <p className="text-xs text-muted">
          Business/Creator hesap + Meta Graph API gerekir. Token’ı boş
          bırakırsanız mevcut kayıt korunur.{" "}
          <a href="/admin/instagram" className="text-accent hover:underline">
            Instagram → Portföy
          </a>{" "}
          sayfasından gönderi seçip aktarın.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram User ID">
            <input
              name="instagramUserId"
              defaultValue={settings.instagramUserId}
              className={fieldClass}
              placeholder="17841..."
              autoComplete="off"
            />
          </Field>
          <Field label="Access Token (uzun ömürlü)">
            <input
              name="instagramAccessToken"
              type="password"
              className={fieldClass}
              placeholder={
                settings.instagramAccessToken ? "•••••••• (kayıtlı)" : "EAAG..."
              }
              autoComplete="new-password"
            />
          </Field>
        </div>

        <h2 className="pt-4 font-serif text-xl text-foreground">SEO & vitrin</h2>
        <Field label="SEO başlık">
          <input name="seoTitle" defaultValue={settings.seoTitle} className={fieldClass} />
        </Field>
        <Field label="SEO açıklama">
          <textarea
            name="seoDescription"
            rows={3}
            defaultValue={settings.seoDescription}
            className={fieldClass}
          />
        </Field>
        <CheckField
          name="showPrices"
          label="Paket fiyatlarını sitede göster"
          defaultChecked={settings.showPrices}
        />

        <h2 className="pt-4 font-serif text-xl text-foreground">SMTP e-posta</h2>
        <p className="text-xs text-muted">
          Form bildirimleri için. Şifreyi boş bırakırsanız mevcut kayıt korunur.
        </p>
        <CheckField
          name="smtpEnabled"
          label="SMTP aktif"
          defaultChecked={settings.smtpEnabled}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SMTP host">
            <input
              name="smtpHost"
              defaultValue={settings.smtpHost}
              placeholder="smtp.gmail.com"
              className={fieldClass}
            />
          </Field>
          <Field label="Port">
            <input
              name="smtpPort"
              type="number"
              defaultValue={settings.smtpPort}
              className={fieldClass}
            />
          </Field>
          <Field label="Kullanıcı">
            <input name="smtpUser" defaultValue={settings.smtpUser} className={fieldClass} />
          </Field>
          <Field label="Şifre">
            <input
              name="smtpPassword"
              type="password"
              placeholder={settings.smtpPassword ? "••••••••" : ""}
              className={fieldClass}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Gönderen (From)">
            <input
              name="smtpFrom"
              defaultValue={settings.smtpFrom}
              placeholder="info@ornek.com"
              className={fieldClass}
            />
          </Field>
          <div className="flex items-end pb-2">
            <CheckField
              name="smtpSecure"
              label="Güvenli (TLS/SSL, 465 için)"
              defaultChecked={settings.smtpSecure}
            />
          </div>
        </div>

        {state.error && (
          <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm">
            {state.message || "Kaydedildi."}
          </p>
        )}
        <SubmitBar pending={pending} label="Ayarları kaydet" />
      </form>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-serif text-lg text-foreground">SMTP bağlantı testi</h3>
        <p className="mt-1 text-xs text-muted">Önce ayarları kaydedin, sonra test edin.</p>
        <button
          type="button"
          disabled={testing}
          className="mt-4 rounded-full border border-border px-5 py-2 text-sm hover:border-accent"
          onClick={() => {
            startTest(async () => {
              const r = await testSmtpAction();
              setTestState(r);
            });
          }}
        >
          {testing ? "Test ediliyor..." : "SMTP test et"}
        </button>
        {testState.error && (
          <p className="mt-3 text-sm text-danger">{testState.error}</p>
        )}
        {testState.ok && (
          <p className="mt-3 text-sm text-success">{testState.message}</p>
        )}
      </div>
    </div>
  );
}
