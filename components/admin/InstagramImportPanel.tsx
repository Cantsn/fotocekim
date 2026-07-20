"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  importInstagramMediaAction,
  loadInstagramFeedAction,
} from "@/lib/actions/admin";
import type { IgMediaItem } from "@/lib/instagram";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Camera, Film, Loader2, RefreshCw } from "lucide-react";

export function InstagramImportPanel({
  hasCredentials,
}: {
  hasCredentials: boolean;
}) {
  const [items, setItems] = useState<IgMediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [onlyWedding, setOnlyWedding] = useState(true);
  const [category, setCategory] = useState("auto");
  const [published, setPublished] = useState(false);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    if (!onlyWedding) return items;
    return items.filter((i) => i.looksLikeWedding);
  }, [items, onlyWedding]);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected],
  );

  const load = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await loadInstagramFeedAction();
      if (res.error) {
        setError(res.error);
        setItems([]);
        return;
      }
      setItems(res.items || []);
      setSelected({});
      setMessage(`${res.items?.length ?? 0} gönderi yüklendi.`);
    });
  };

  const toggle = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const selectAllVisible = () => {
    const next: Record<string, boolean> = { ...selected };
    for (const i of visible) next[i.id] = true;
    setSelected(next);
  };

  const importSelected = () => {
    if (selectedIds.length === 0) {
      setError("En az bir gönderi seçin.");
      return;
    }
    setError(null);
    setMessage(null);
    const fd = new FormData();
    for (const id of selectedIds) fd.append("mediaId", id);
    fd.set("category", category);
    if (published) fd.set("published", "on");
    startTransition(async () => {
      const res = await importInstagramMediaAction(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setMessage(res.message || "Aktarım tamam.");
      setSelected({});
    });
  };

  if (!hasCredentials) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
          <Camera className="h-5 w-5 text-accent" />
          Instagram bağlantısı gerekli
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Portföye aktarmak için Instagram Business veya Creator hesabınızın{" "}
          <strong className="text-foreground">User ID</strong> ve{" "}
          <strong className="text-foreground">uzun ömürlü Access Token</strong>{" "}
          bilgisini site ayarlarına girin (Meta Graph API).
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Meta for Developers’da uygulama oluşturun</li>
          <li>Instagram Graph API izinlerini ekleyin (instagram_basic vb.)</li>
          <li>Sayfa → Instagram hesabı bağlayın, User ID alın</li>
          <li>Uzun ömürlü token üretip kaydedin</li>
        </ol>
        <Link
          href="/admin/ayarlar"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white"
        >
          Site ayarlarına git
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={load}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Instagram’dan getir
        </button>
        <label className="inline-flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={onlyWedding}
            onChange={(e) => setOnlyWedding(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Sadece düğün / nişan sinyali olanlar
        </label>
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

      {items.length > 0 && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="w-full text-sm text-muted">
            Görünen: {visible.length} · Seçili: {selectedIds.length}
          </p>
          <button
            type="button"
            onClick={selectAllVisible}
            className="rounded-full border border-border px-4 py-2 text-xs text-foreground hover:border-accent"
          >
            Görünenleri seç
          </button>
          <label className="text-xs text-muted">
            Kategori
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-foreground"
            >
              <option value="auto">Otomatik (açıklamadan)</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 pb-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Direkt yayına al
          </label>
          <button
            type="button"
            disabled={pending || selectedIds.length === 0}
            onClick={importSelected}
            className="ml-auto inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Aktarılıyor…" : `Portföye aktar (${selectedIds.length})`}
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const thumb =
            item.thumbnailUrl ||
            item.mediaUrl ||
            item.children[0]?.mediaUrl ||
            "";
          const isVideo = item.mediaType === "VIDEO";
          const checked = Boolean(selected[item.id]);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "overflow-hidden rounded-2xl border bg-card text-left transition",
                checked
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-border hover:border-accent/40",
              )}
            >
              <div className="relative aspect-square bg-muted-bg">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    Önizleme yok
                  </div>
                )}
                {isVideo && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white">
                    <Film className="h-3 w-3" />
                    Video
                  </span>
                )}
                {item.looksLikeWedding && (
                  <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white">
                    Düğün?
                  </span>
                )}
                <span
                  className={cn(
                    "absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                    checked
                      ? "border-accent bg-accent text-white"
                      : "border-white/80 bg-black/40 text-white",
                  )}
                >
                  {checked ? "✓" : ""}
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-xs text-muted">
                  {item.caption || "(Açıklama yok)"}
                </p>
                <p className="mt-1 text-[10px] text-muted">
                  {item.categoryGuess}
                  {item.timestamp
                    ? ` · ${new Date(item.timestamp).toLocaleDateString("tr-TR")}`
                    : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {items.length > 0 && visible.length === 0 && (
        <p className="text-center text-sm text-muted">
          Filtreye uyan gönderi yok. “Sadece düğün” filtresini kapatın.
        </p>
      )}
    </div>
  );
}
