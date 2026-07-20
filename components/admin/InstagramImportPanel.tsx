"use client";

import { useMemo, useState, useTransition } from "react";
import {
  importInstagramMediaAction,
  loadInstagramFeedAction,
} from "@/lib/actions/admin";
import type { IgAttemptLog, IgMediaItem } from "@/lib/instagram";
import { normalizeInstagramUsername } from "@/lib/instagram";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Camera,
  ChevronDown,
  Film,
  Images,
  Loader2,
  RefreshCw,
} from "lucide-react";

type DebugInfo = {
  summary: string;
  attempts: IgAttemptLog[];
  usedSession: boolean;
  tips: string[];
};

const SESSION_KEY = "ig_sessionid_v1";

export function InstagramImportPanel({
  defaultUsername = "",
}: {
  defaultUsername?: string;
}) {
  const [username, setUsername] = useState(
    normalizeInstagramUsername(defaultUsername) ||
      defaultUsername.replace(/^@/, ""),
  );
  const [sessionCookie, setSessionCookie] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return sessionStorage.getItem(SESSION_KEY) || "";
    } catch {
      return "";
    }
  });
  const [showSession, setShowSession] = useState(true);
  const [loadedUser, setLoadedUser] = useState("");
  const [items, setItems] = useState<IgMediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  /** Varsayılan: tüm gönderiler — kullanıcı seçer */
  const [onlyWedding, setOnlyWedding] = useState(false);
  const [category, setCategory] = useState("auto");
  const [published, setPublished] = useState(false);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    if (!onlyWedding) return items;
    return items.filter((i) => i.looksLikeWedding);
  }, [items, onlyWedding]);

  const selectedItems = useMemo(
    () => items.filter((i) => selected[i.id]),
    [items, selected],
  );

  const persistSession = (value: string) => {
    setSessionCookie(value);
    try {
      if (value.trim()) sessionStorage.setItem(SESSION_KEY, value.trim());
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  };

  const load = () => {
    setError(null);
    setMessage(null);
    setDebug(null);
    const u = normalizeInstagramUsername(username);
    if (!u) {
      setError("Instagram kullanıcı adı girin (ör. dugunoncesikareler).");
      return;
    }
    if (!sessionCookie.trim()) {
      setError(
        "Tüm gönderileri (foto + video + açıklama) çekmek için sessionid gerekli. Aşağıdaki alana yapıştırın.",
      );
      setShowSession(true);
      // yine de dene — HTML ile kısmi sonuç gelebilir
    }
    const fd = new FormData();
    fd.set("username", u);
    if (sessionCookie.trim()) fd.set("sessionCookie", sessionCookie.trim());
    startTransition(async () => {
      const res = await loadInstagramFeedAction(fd);
      if (res.debug) {
        setDebug(res.debug as DebugInfo);
        setDebugOpen(Boolean(res.error));
      }
      if (res.error && !(res.items && res.items.length)) {
        setError(res.error);
        setItems([]);
        setLoadedUser("");
        return;
      }
      if (res.error && res.items?.length) {
        setMessage(res.error);
      }
      setItems(res.items || []);
      setLoadedUser(res.username || u);
      setSelected({});
      setMessage(
        `@${res.username || u} — ${res.items?.length ?? 0} gönderi yüklendi. İstediğinizi seçip portföye aktarın.`,
      );
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

  const clearSelection = () => setSelected({});

  const importSelected = () => {
    if (selectedItems.length === 0) {
      setError("En az bir gönderi seçin.");
      return;
    }
    setError(null);
    setMessage(null);
    const fd = new FormData();
    // Tam veri — Instagram’a ikinci kez gitmiyoruz
    fd.set("itemsJson", JSON.stringify(selectedItems));
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <p className="mb-3 text-sm text-muted">
          Hesaptaki gönderileri çeker: <strong className="text-foreground">fotoğraf, video, carousel, açıklama</strong>.
          Listeden hangisini istersen seçip portföye aktarırsın.
        </p>

        <label className="block text-xs text-muted">
          Instagram kullanıcı adı
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
                @
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    load();
                  }
                }}
                className="w-full rounded-xl border border-border bg-muted-bg py-2.5 pr-4 pl-8 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
                placeholder="dugunoncesikareler"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={load}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Tüm gönderileri getir
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={() => setShowSession((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-border bg-muted-bg/50 px-3 py-2 text-left text-xs text-muted hover:border-accent/40"
        >
          <span>
            sessionid (tüm feed için önerilir)
            {sessionCookie.trim() ? " · kayıtlı ✓" : " · eklenmedi"}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition",
              showSession && "rotate-180",
            )}
          />
        </button>

        {showSession && (
          <div className="mt-2 space-y-2 rounded-xl border border-border bg-muted-bg/30 p-3">
            <p className="text-[11px] leading-relaxed text-muted">
              Tüm sayfaları (yüzlerce gönderi) çekmek için tarayıcı oturumu
              gerekir:
              <br />
              Chrome → instagram.com giriş → F12 → Application → Cookies →{" "}
              <code className="text-foreground">sessionid</code> değeri
            </p>
            <input
              value={sessionCookie}
              onChange={(e) => persistSession(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
              placeholder="sessionid değeri"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={onlyWedding}
              onChange={(e) => setOnlyWedding(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Sadece düğün/nişan etiketli olanları listele
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          <p className="font-medium">Hata</p>
          <p className="mt-1 whitespace-pre-wrap">{error}</p>
        </div>
      )}
      {message && (
        <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </p>
      )}

      {debug && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setDebugOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm"
          >
            <span className="font-medium text-foreground">
              Teknik detay · {debug.summary}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted transition",
                debugOpen && "rotate-180",
              )}
            />
          </button>
          {debugOpen && (
            <div className="space-y-2 border-t border-border px-4 py-3 text-xs">
              {debug.tips.map((t) => (
                <p key={t} className="text-muted">
                  • {t}
                </p>
              ))}
              {debug.attempts.map((a, i) => (
                <div
                  key={`${a.step}-${i}`}
                  className={cn(
                    "rounded-lg border px-2 py-1.5",
                    a.ok
                      ? "border-success/30 bg-success/5"
                      : "border-border bg-muted-bg/40",
                  )}
                >
                  <span className={a.ok ? "text-success" : "text-danger"}>
                    {a.ok ? "OK" : "FAIL"}
                  </span>{" "}
                  <strong>{a.step}</strong>
                  {a.status != null ? ` · HTTP ${a.status}` : ""} — {a.detail}
                  {a.bodyPreview && (
                    <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] text-muted">
                      {a.bodyPreview}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
          <p className="w-full text-sm text-muted">
            @{loadedUser} · Toplam {items.length} gönderi · Listede{" "}
            {visible.length} · Seçili{" "}
            <strong className="text-foreground">{selectedItems.length}</strong>
          </p>
          <button
            type="button"
            onClick={selectAllVisible}
            className="rounded-full border border-border px-4 py-2 text-xs hover:border-accent"
          >
            Listedekilerin tümünü seç
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-full border border-border px-4 py-2 text-xs text-muted hover:text-foreground"
          >
            Seçimi temizle
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
            disabled={pending || selectedItems.length === 0}
            onClick={importSelected}
            className="ml-auto inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending
              ? "Aktarılıyor…"
              : `Seçilenleri portföye aktar (${selectedItems.length})`}
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((item) => {
          const thumb = item.thumbnailUrl || item.mediaUrl || "";
          const checked = Boolean(selected[item.id]);
          const mediaCount = item.mediaUrls?.length || 1;
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
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    <Camera className="mr-1 h-4 w-4" />
                    Medya
                  </div>
                )}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {item.mediaType === "VIDEO" && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-black/75 px-2 py-0.5 text-[10px] text-white">
                      <Film className="h-3 w-3" />
                      Video
                    </span>
                  )}
                  {item.mediaType === "CAROUSEL_ALBUM" && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-black/75 px-2 py-0.5 text-[10px] text-white">
                      <Images className="h-3 w-3" />
                      {mediaCount}
                    </span>
                  )}
                  {item.looksLikeWedding && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white">
                      Düğün?
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full border text-sm",
                    checked
                      ? "border-accent bg-accent text-white"
                      : "border-white/80 bg-black/45 text-white",
                  )}
                >
                  {checked ? "✓" : ""}
                </span>
              </div>
              <div className="space-y-1 p-3">
                <p className="line-clamp-3 text-xs leading-relaxed text-muted">
                  {item.caption?.trim() || "(Açıklama yok)"}
                </p>
                <p className="text-[10px] text-muted">
                  {item.categoryGuess}
                  {item.timestamp
                    ? ` · ${new Date(item.timestamp).toLocaleDateString("tr-TR")}`
                    : ""}
                  {mediaCount > 1 ? ` · ${mediaCount} medya` : ""}
                  {item.mediaType === "VIDEO" ? " · video" : ""}
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
