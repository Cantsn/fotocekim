"use client";

import {
  useCallback,
  useRef,
  useState,
  useTransition,
  type DragEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  clearProjectCoverAction,
  clearServiceCoverAction,
  deleteProjectImageAction,
  deleteServiceImageAction,
  moveProjectImageAction,
  moveServiceImageAction,
  setProjectCoverFromImageAction,
  setServiceCoverFromImageAction,
  updateProjectImageAltAction,
  updateServiceImageAltAction,
  uploadProjectCoverAction,
  uploadProjectImagesAction,
  uploadServiceCoverAction,
  uploadServiceImagesAction,
} from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

export type ManagedImage = {
  id: string;
  url: string;
  alt: string;
  order: number;
};

type Kind = "service" | "project";

const actions = {
  service: {
    uploadGallery: uploadServiceImagesAction,
    uploadCover: uploadServiceCoverAction,
    setCover: setServiceCoverFromImageAction,
    clearCover: clearServiceCoverAction,
    remove: deleteServiceImageAction,
    move: moveServiceImageAction,
    updateAlt: updateServiceImageAltAction,
  },
  project: {
    uploadGallery: uploadProjectImagesAction,
    uploadCover: uploadProjectCoverAction,
    setCover: setProjectCoverFromImageAction,
    clearCover: clearProjectCoverAction,
    remove: deleteProjectImageAction,
    move: moveProjectImageAction,
    updateAlt: updateProjectImageAltAction,
  },
} as const;

export function ImageManager({
  kind,
  entityId,
  coverUrl,
  images,
  title,
}: {
  kind: Kind;
  entityId: string;
  coverUrl?: string;
  images: ManagedImage[];
  title?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const api = actions[kind];

  const run = useCallback(
    (fn: () => Promise<{ error?: string; message?: string; ok?: boolean } | void>) => {
      setError(null);
      setMessage(null);
      startTransition(async () => {
        try {
          const res = await fn();
          if (res && "error" in res && res.error) {
            setError(res.error);
            return;
          }
          if (res && "message" in res && res.message) {
            setMessage(res.message);
          }
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Bir hata oluştu");
        }
      });
    },
    [router],
  );

  const uploadFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.size > 0);
    if (list.length === 0) return;
    const fd = new FormData();
    fd.set("entityId", entityId);
    for (const f of list) fd.append("files", f);
    run(() => api.uploadGallery(fd));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const onCoverChange = (files: FileList | null) => {
    if (!files?.[0]) return;
    const fd = new FormData();
    fd.set("entityId", entityId);
    fd.set("file", files[0]);
    run(() => api.uploadCover(fd));
  };

  const sorted = [...images].sort((a, b) => a.order - b.order);

  return (
    <section className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
            <ImagePlus className="h-5 w-5 text-accent" />
            Görseller
          </h2>
          <p className="mt-1 text-sm text-muted">
            Kapak ve galeri fotoğraflarını buradan yükleyin, sıralayın veya silin.
            {title ? ` · ${title}` : ""}
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
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </p>
      )}

      {/* Cover */}
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
          Kapak görseli
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border border-border bg-muted-bg">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt="Kapak"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[140px] items-center justify-center text-sm text-muted">
                Kapak seçilmedi
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:justify-center">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                onCoverChange(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={pending}
              onClick={() => coverInputRef.current?.click()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-white disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Kapak yükle
            </button>
            {coverUrl && (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  const fd = new FormData();
                  fd.set("entityId", entityId);
                  run(async () => {
                    await api.clearCover(fd);
                  });
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm text-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Kapağı kaldır
              </button>
            )}
            <p className="max-w-xs text-xs text-muted">
              JPG, PNG, WebP veya GIF · en fazla 12MB. Galeriden de kapak
              seçebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
          Galeri
        </p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition",
            dragOver
              ? "border-accent bg-accent-soft/40"
              : "border-border bg-muted-bg/50 hover:border-accent/50",
          )}
        >
          <Upload className="mb-2 h-8 w-8 text-accent" />
          <p className="text-sm font-medium text-foreground">
            Fotoğrafları buraya sürükleyin
          </p>
          <p className="mt-1 text-xs text-muted">veya çoklu seçim yapın</p>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => galleryInputRef.current?.click()}
            className="mt-4 inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground hover:border-accent disabled:opacity-50"
          >
            Dosya seç
          </button>
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted-bg px-4 py-6 text-center text-sm text-muted">
          Henüz galeri görseli yok. Yukarıdan yükleyin.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((img, index) => {
            const isCover = coverUrl === img.url;
            return (
              <div
                key={img.id}
                className={cn(
                  "group overflow-hidden rounded-xl border bg-muted-bg",
                  isCover ? "border-accent ring-1 ring-accent/40" : "border-border",
                )}
              >
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || "Galeri"}
                    className="h-full w-full object-cover"
                  />
                  {isCover && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white">
                      <Star className="h-3 w-3 fill-current" />
                      Kapak
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                    <div className="flex gap-1">
                      <IconBtn
                        disabled={pending || index === 0}
                        label="Sola"
                        onClick={() => {
                          const fd = new FormData();
                          fd.set("imageId", img.id);
                          fd.set("direction", "left");
                          run(async () => {
                            await api.move(fd);
                          });
                        }}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn
                        disabled={pending || index === sorted.length - 1}
                        label="Sağa"
                        onClick={() => {
                          const fd = new FormData();
                          fd.set("imageId", img.id);
                          fd.set("direction", "right");
                          run(async () => {
                            await api.move(fd);
                          });
                        }}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </IconBtn>
                    </div>
                    <div className="flex gap-1">
                      {!isCover && (
                        <IconBtn
                          disabled={pending}
                          label="Kapak yap"
                          onClick={() => {
                            const fd = new FormData();
                            fd.set("entityId", entityId);
                            fd.set("imageId", img.id);
                            run(async () => {
                              await api.setCover(fd);
                            });
                          }}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </IconBtn>
                      )}
                      <IconBtn
                        disabled={pending}
                        label="Sil"
                        danger
                        onClick={() => {
                          if (!confirm("Bu görseli silmek istiyor musunuz?")) return;
                          const fd = new FormData();
                          fd.set("imageId", img.id);
                          run(async () => {
                            await api.remove(fd);
                          });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconBtn>
                    </div>
                  </div>
                </div>
                <form
                  className="p-2"
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    fd.set("imageId", img.id);
                    run(async () => {
                      await api.updateAlt(fd);
                    });
                  }}
                >
                  <input
                    name="alt"
                    defaultValue={img.alt}
                    placeholder="Alt metin"
                    className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
                    onBlur={(e) => {
                      if (e.target.value === img.alt) return;
                      const fd = new FormData();
                      fd.set("imageId", img.id);
                      fd.set("alt", e.target.value);
                      run(async () => {
                        await api.updateAlt(fd);
                      });
                    }}
                  />
                </form>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow disabled:opacity-40",
        danger && "text-red-600",
      )}
    >
      {children}
    </button>
  );
}
