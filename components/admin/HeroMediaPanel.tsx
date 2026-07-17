"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import {
  clearHeroMediaAction,
  clearHeroPosterAction,
  saveHeroMediaUrlAction,
  uploadHeroMediaAction,
  uploadHeroPosterAction,
} from "@/lib/actions/admin";
import type { SiteSettings } from "@/lib/types";
import { Field, fieldClass } from "./FormFields";

export function HeroMediaPanel({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const mediaInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);

  const hasMedia =
    settings.heroMediaType !== "NONE" && Boolean(settings.heroMediaUrl);

  const run = (
    fn: () => Promise<{ error?: string; message?: string; ok?: boolean } | void>,
  ) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fn();
        if (res && "error" in res && res.error) {
          setError(res.error);
          return;
        }
        if (res && "message" in res && res.message) setMessage(res.message);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Bir hata oluştu");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
            <Film className="h-5 w-5 text-accent" />
            Ana sayfa hero medyası
          </h2>
          <p className="mt-1 text-sm text-muted">
            Girişteki büyük alan için fotoğraf veya video. Video ise sessiz
            otomatik oynatılır (mobilde poster görünür).
          </p>
        </div>
        {pending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            İşleniyor…
          </span>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </p>
      )}

      {/* Preview */}
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-muted-bg">
        <div className="relative aspect-[21/9] min-h-[160px] w-full">
          {hasMedia && settings.heroMediaType === "VIDEO" ? (
            <video
              key={settings.heroMediaUrl}
              src={settings.heroMediaUrl}
              poster={settings.heroPosterUrl || undefined}
              className="h-full w-full object-cover"
              muted
              playsInline
              loop
              autoPlay
              controls
            />
          ) : hasMedia && settings.heroMediaType === "IMAGE" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.heroMediaUrl}
              alt="Hero önizleme"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 text-sm text-muted">
              <ImageIcon className="h-8 w-8 opacity-40" />
              Henüz medya yok — placeholder gösterilir
            </div>
          )}
        </div>
        {hasMedia && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted">
            <span>
              Tür:{" "}
              <strong className="text-foreground">
                {settings.heroMediaType === "VIDEO" ? "Video" : "Fotoğraf"}
              </strong>
            </span>
            <span className="max-w-[60%] truncate">{settings.heroMediaUrl}</span>
          </div>
        )}
      </div>

      {/* Upload */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <input
            ref={mediaInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const fd = new FormData();
              fd.set("file", file);
              run(() => uploadHeroMediaAction(fd));
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => mediaInput.current?.click()}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            Fotoğraf veya video yükle
          </button>
          <p className="mt-1.5 text-[11px] text-muted">
            Foto: JPG/PNG/WebP/GIF · max 12MB · Video: MP4/WebM/MOV · max 80MB
          </p>
        </div>

        {hasMedia && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Hero medyasını kaldırmak istiyor musunuz?")) return;
              run(() => clearHeroMediaAction());
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm text-danger hover:bg-danger/5 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Medyayı kaldır
          </button>
        )}
      </div>

      {/* External URL */}
      <form
        className="mt-6 space-y-3 border-t border-border pt-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          run(() => saveHeroMediaUrlAction(fd));
        }}
      >
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          veya harici URL
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Field label="Medya URL">
            <input
              name="url"
              defaultValue={
                settings.heroMediaUrl.startsWith("http")
                  ? settings.heroMediaUrl
                  : ""
              }
              placeholder="https://cdn.ornek.com/hero.mp4"
              className={fieldClass}
            />
          </Field>
          <Field label="Tür">
            <select name="type" defaultValue="IMAGE" className={fieldClass}>
              <option value="IMAGE">Fotoğraf</option>
              <option value="VIDEO">Video</option>
            </select>
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:border-accent disabled:opacity-50 sm:w-auto"
            >
              URL kaydet
            </button>
          </div>
        </div>
      </form>

      {/* Poster for video */}
      {(settings.heroMediaType === "VIDEO" || hasMedia) && (
        <div className="mt-6 space-y-3 border-t border-border pt-5">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            Video poster (opsiyonel)
          </p>
          <p className="text-xs text-muted">
            Video yüklenene veya oynatılamayana kadar gösterilecek kapak
            görseli. Özellikle mobilde önerilir.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {settings.heroPosterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.heroPosterUrl}
                alt="Poster"
                className="h-20 w-32 rounded-lg border border-border object-cover"
              />
            ) : null}
            <input
              ref={posterInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const fd = new FormData();
                fd.set("file", file);
                run(() => uploadHeroPosterAction(fd));
              }}
            />
            <button
              type="button"
              disabled={pending}
              onClick={() => posterInput.current?.click()}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-foreground hover:border-accent disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Poster yükle
            </button>
            {settings.heroPosterUrl && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => clearHeroPosterAction())}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted hover:text-danger disabled:opacity-50"
              >
                Poster kaldır
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
