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
  const [showSession, setShowSession] = useState(false);
  const [loadedUser, setLoadedUser] = useState("");
  const [items, setItems] = useState<IgMediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [debugOpen, setDebugOpen] = useState(true);
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
      setError("Instagram kullanıcı adı girin (ör. studionuz).");
      return;
    }
    const fd = new FormData();
    fd.set("username", u);
    if (sessionCookie.trim()) fd.set("sessionCookie", sessionCookie.trim());
    startTransition(async () => {
      const res = await loadInstagramFeedAction(fd);
      if (res.debug) {
        setDebug(res.debug as DebugInfo);
        setDebugOpen(true);
      }
      if (res.error) {
        setError(res.error);
        setItems([]);
        setLoadedUser("");
        return;
      }
      setItems(res.items || []);
      setLoadedUser(res.username || u);
      setSelected({});
      setMessage(
        `@${res.username || u} — ${res.items?.length ?? 0} gönderi yüklendi.`,
      );
      // Başarıda da debug özeti (hangi yol çalıştı)
      if (res.debug) setDebugOpen(false);
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
    if (!loadedUser) {
      setError("Önce gönderileri getirin.");
      return;
    }
    if (selectedIds.length === 0) {
      setError("En az bir gönderi seçin.");
      return;
    }
    setError(null);
    setMessage(null);
    const fd = new FormData();
    fd.set("username", loadedUser);
    if (sessionCookie.trim()) fd.set("sessionCookie", sessionCookie.trim());
    for (const id of selectedIds) fd.append("mediaId", id);
    fd.set("category", category);
    if (published) fd.set("published", "on");
    startTransition(async () => {
      const res = await importInstagramMediaAction(fd);
      if (res.debug) {
        setDebug(res.debug as DebugInfo);
        setDebugOpen(true);
      }
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
                placeholder="studionuz"
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
              Gönderileri getir
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={() => setShowSession((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-border bg-muted-bg/50 px-3 py-2 text-left text-xs text-muted hover:border-accent/40"
        >
          <span>
            Bot engelini aşmak için (önerilir): tarayıcı{" "}
            <strong className="text-foreground">sessionid</strong> çerezi
            {sessionCookie.trim() ? " · kayıtlı" : ""}
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
              1) Chrome’da{" "}
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                instagram.com
              </a>{" "}
              hesabınıza giriş yapın
              <br />
              2) F12 → Application → Cookies → https://www.instagram.com
              <br />
              3) <code className="text-foreground">sessionid</code> satırının
              Value değerini kopyalayıp aşağı yapıştırın
              <br />
              4) Bu değer yalnızca bu tarayıcı oturumunda saklanır (sunucuya
              kalıcı yazılmaz)
            </p>
            <input
              value={sessionCookie}
              onChange={(e) => persistSession(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
              placeholder="sessionid değeri veya sessionid=..."
              autoComplete="off"
              spellCheck={false}
            />
            {sessionCookie.trim() && (
              <button
                type="button"
                onClick={() => persistSession("")}
                className="text-[11px] text-danger hover:underline"
              >
                sessionid’yi temizle
              </button>
            )}
          </div>
        )}

        <label className="mt-3 inline-flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={onlyWedding}
            onChange={(e) => setOnlyWedding(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Sadece düğün / nişan sinyali olanlar (açıklamadan)
        </label>
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
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setDebugOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm"
          >
            <span className="font-medium text-foreground">
              Teknik detay / Instagram yanıtı
            </span>
            <span className="text-xs text-muted">
              {debug.usedSession ? "sessionid kullanıldı" : "sessionid yok"} ·{" "}
              {debug.attempts.length} adım
            </span>
          </button>
          {debugOpen && (
            <div className="space-y-3 border-t border-border px-4 py-3 text-xs">
              <p className="text-muted">
                <strong className="text-foreground">Özet:</strong>{" "}
                {debug.summary}
              </p>
              {debug.tips.length > 0 && (
                <ul className="list-disc space-y-1 pl-4 text-muted">
                  {debug.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              <div className="space-y-2">
                {debug.attempts.map((a, i) => (
                  <div
                    key={`${a.step}-${i}`}
                    className={cn(
                      "rounded-xl border px-3 py-2",
                      a.ok
                        ? "border-success/30 bg-success/5"
                        : "border-border bg-muted-bg/50",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          a.ok
                            ? "bg-success/20 text-success"
                            : "bg-danger/15 text-danger",
                        )}
                      >
                        {a.ok ? "OK" : "FAIL"}
                      </span>
                      <span className="font-medium text-foreground">
                        {a.step}
                      </span>
                      {a.status != null && (
                        <span className="text-muted">HTTP {a.status}</span>
                      )}
                    </div>
                    <p className="mt-1 text-muted">{a.detail}</p>
                    {a.bodyPreview && (
                      <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-background/80 p-2 font-mono text-[10px] leading-relaxed text-muted">
                        {a.bodyPreview}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="w-full text-sm text-muted">
            @{loadedUser} · Görünen: {visible.length} · Seçili:{" "}
            {selectedIds.length}
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
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    <Camera className="mr-1 h-4 w-4" />
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
