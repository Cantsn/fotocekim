export type IgMediaItem = {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  timestamp?: string;
  permalink?: string;
  /** Galeri / carousel tüm medya URL’leri (sıralı) */
  mediaUrls: string[];
  children: { id: string; mediaType: string; mediaUrl?: string }[];
  looksLikeWedding: boolean;
  categoryGuess: string;
  likeCount?: number;
  commentCount?: number;
};

export type IgAttemptLog = {
  step: string;
  ok: boolean;
  status?: number;
  detail: string;
  bodyPreview?: string;
};

export type IgFetchResult = {
  items: IgMediaItem[];
  username?: string;
  error?: string;
  debug?: {
    summary: string;
    attempts: IgAttemptLog[];
    usedSession: boolean;
    tips: string[];
  };
};

const WEDDING_RE =
  /düğün|dugun|wedding|gelin|damat|nişan|nisan|kına|kina|söz|soz|after\s*party|gelinlik|davet|kına\s*gecesi/i;
const NISAN_RE = /nişan|nisan|engagement|söz|soz/i;
const DRONE_RE = /drone|hava|aerial/i;
const PRODUCT_RE = /ürün|urun|product|katalog|dükkan|dukkan|magaza|mağaza/i;

const WEB_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
/** sessionid ile private web API için Instagram app UA */
const IG_APP_UA =
  "Instagram 269.0.0.18.75 Android (33/13; 420dpi; 1080x2400; Xiaomi; M2101K6G; alioth; qcom; tr_TR; 443006021)";

export function normalizeInstagramUsername(input: string): string {
  let s = (input || "").trim();
  if (!s) return "";
  s = s.replace(/^@+/, "");
  try {
    if (s.includes("instagram.com")) {
      const u = new URL(s.startsWith("http") ? s : `https://${s}`);
      const part = u.pathname.split("/").filter(Boolean)[0] || "";
      s = part;
    }
  } catch {
    // ignore
  }
  s = s.replace(/[^a-zA-Z0-9._]/g, "");
  return s.slice(0, 30);
}

export function normalizeSessionCookie(raw: string): string {
  let s = (raw || "").trim();
  if (!s) return "";
  if (s.includes("sessionid=")) {
    const m = s.match(/sessionid=([^;\s]+)/i);
    if (m) s = m[1];
  }
  s = s.replace(/^["']|["']$/g, "").trim();
  if (!s || s.length < 8) return "";
  return `sessionid=${s}`;
}

export function analyzeCaption(caption: string): {
  looksLikeWedding: boolean;
  categoryGuess: string;
  title: string;
} {
  const text = (caption || "").trim();
  const looksLikeWedding = WEDDING_RE.test(text);
  let categoryGuess = "dis-cekim";
  if (WEDDING_RE.test(text) && !NISAN_RE.test(text)) categoryGuess = "dugun";
  else if (NISAN_RE.test(text)) categoryGuess = "nisan";
  else if (DRONE_RE.test(text)) categoryGuess = "drone";
  else if (PRODUCT_RE.test(text)) categoryGuess = "urun";
  else if (looksLikeWedding) categoryGuess = "dugun";

  const firstLine = text.split(/\n/)[0]?.trim() || "";
  const cleaned = firstLine
    .replace(/#[\wğüşıöçĞÜŞİÖÇ]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const title =
    cleaned.slice(0, 80) ||
    (looksLikeWedding ? "Düğün çekimi" : "Instagram paylaşımı");

  return { looksLikeWedding, categoryGuess, title };
}

function previewBody(text: string, max = 480): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function unescapeIgUrl(u: string): string {
  return u
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\u003d/g, "=")
    .replace(/\\u0025/g, "%");
}

function getSetCookies(res: Response): string[] {
  const anyHeaders = res.headers as Headers & {
    getSetCookie?: () => string[];
  };
  if (typeof anyHeaders.getSetCookie === "function") {
    return anyHeaders.getSetCookie();
  }
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

function mergeCookieHeader(existing: string, setCookies: string[]): string {
  const map = new Map<string, string>();
  for (const part of existing.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  for (const sc of setCookies) {
    const pair = sc.split(";")[0];
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    const k = pair.slice(0, eq).trim();
    const v = pair.slice(eq + 1).trim();
    if (k) map.set(k, v);
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function bestImageUrl(obj: Record<string, unknown>): string | undefined {
  const iv2 = obj.image_versions2 as
    | { candidates?: { url?: string; width?: number }[] }
    | undefined;
  const cands = iv2?.candidates;
  if (cands?.length) {
    const sorted = [...cands].sort(
      (a, b) => (b.width || 0) - (a.width || 0),
    );
    if (sorted[0]?.url) return unescapeIgUrl(sorted[0].url);
  }
  if (typeof obj.display_url === "string") return unescapeIgUrl(obj.display_url);
  if (typeof obj.thumbnail_url === "string")
    return unescapeIgUrl(obj.thumbnail_url);
  if (typeof obj.thumbnail_src === "string")
    return unescapeIgUrl(obj.thumbnail_src);
  return undefined;
}

function bestVideoUrl(obj: Record<string, unknown>): string | undefined {
  const vv = obj.video_versions as
    | { url?: string; width?: number }[]
    | undefined;
  if (vv?.length) {
    const sorted = [...vv].sort((a, b) => (b.width || 0) - (a.width || 0));
    if (sorted[0]?.url) return unescapeIgUrl(sorted[0].url);
  }
  if (typeof obj.video_url === "string") return unescapeIgUrl(obj.video_url);
  return undefined;
}

function captionFrom(obj: Record<string, unknown>): string {
  if (typeof obj.caption === "string") return obj.caption;
  if (obj.caption && typeof obj.caption === "object") {
    return String((obj.caption as { text?: string }).text || "");
  }
  const edges = (
    obj.edge_media_to_caption as {
      edges?: { node?: { text?: string } }[];
    }
  )?.edges;
  return edges?.[0]?.node?.text || "";
}

/** API / HTML post objesini tam IgMediaItem’a çevir */
export function postObjectToItem(obj: Record<string, unknown>): IgMediaItem | null {
  const code =
    (typeof obj.code === "string" && obj.code) ||
    (typeof obj.shortcode === "string" && obj.shortcode) ||
    "";
  const idRaw = obj.id ?? obj.pk ?? code;
  if (idRaw == null || idRaw === "") return null;
  const id = String(idRaw);

  const caption = captionFrom(obj);
  const analysis = analyzeCaption(caption);

  const mediaTypeNum = obj.media_type;
  const isVideo =
    mediaTypeNum === 2 ||
    mediaTypeNum === "2" ||
    Boolean(obj.is_video) ||
    Boolean(bestVideoUrl(obj) && !bestImageUrl(obj));

  const carousel = obj.carousel_media as Record<string, unknown>[] | undefined;
  const isCarousel =
    mediaTypeNum === 8 ||
    mediaTypeNum === "8" ||
    Boolean(carousel?.length) ||
    Boolean(
      (obj.edge_sidecar_to_children as { edges?: unknown[] })?.edges?.length,
    );

  const mediaUrls: string[] = [];
  const children: IgMediaItem["children"] = [];

  if (isCarousel && carousel?.length) {
    for (let i = 0; i < carousel.length; i++) {
      const m = carousel[i];
      const v = bestVideoUrl(m);
      const img = bestImageUrl(m);
      const url = v || img;
      if (!url) continue;
      mediaUrls.push(url);
      children.push({
        id: String(m.id || m.pk || `${id}-${i}`),
        mediaType: v ? "VIDEO" : "IMAGE",
        mediaUrl: url,
      });
    }
  } else if (
    (obj.edge_sidecar_to_children as { edges?: { node?: Record<string, unknown> }[] })
      ?.edges?.length
  ) {
    const edges = (
      obj.edge_sidecar_to_children as {
        edges: { node?: Record<string, unknown> }[];
      }
    ).edges;
    edges.forEach((e, i) => {
      const n = e.node;
      if (!n) return;
      const v = bestVideoUrl(n);
      const img = bestImageUrl(n) || (typeof n.display_url === "string" ? n.display_url : undefined);
      const url = v || img;
      if (!url) return;
      mediaUrls.push(unescapeIgUrl(url));
      children.push({
        id: String(n.id || `${id}-${i}`),
        mediaType: v || n.is_video ? "VIDEO" : "IMAGE",
        mediaUrl: unescapeIgUrl(url),
      });
    });
  } else {
    const v = bestVideoUrl(obj);
    const img = bestImageUrl(obj);
    if (v) mediaUrls.push(v);
    if (img && img !== v) {
      // video için poster olarak image da ekle (kapak)
      if (v) {
        // cover first for import
        mediaUrls.unshift(img);
      } else {
        mediaUrls.push(img);
      }
    } else if (img) {
      mediaUrls.push(img);
    }
  }

  if (mediaUrls.length === 0) return null;

  // Video-only: tek video URL
  if (isVideo && !isCarousel && bestVideoUrl(obj)) {
    const v = bestVideoUrl(obj)!;
    const img = bestImageUrl(obj);
    mediaUrls.length = 0;
    if (img) mediaUrls.push(img); // thumbnail/cover
    mediaUrls.push(v);
  }

  const taken =
    typeof obj.taken_at === "number"
      ? obj.taken_at
      : typeof obj.taken_at_timestamp === "number"
        ? obj.taken_at_timestamp
        : undefined;

  let mediaType: string = "IMAGE";
  if (isCarousel) mediaType = "CAROUSEL_ALBUM";
  else if (isVideo) mediaType = "VIDEO";

  const thumb = bestImageUrl(obj) || mediaUrls[0];
  const primary =
    mediaType === "VIDEO"
      ? bestVideoUrl(obj) || mediaUrls[mediaUrls.length - 1]
      : mediaUrls[0];

  return {
    id,
    caption,
    mediaType,
    mediaUrl: primary,
    thumbnailUrl: thumb,
    mediaUrls: [...new Set(mediaUrls)],
    timestamp: taken ? new Date(taken * 1000).toISOString() : undefined,
    permalink: code ? `https://www.instagram.com/p/${code}/` : undefined,
    children,
    looksLikeWedding: analysis.looksLikeWedding,
    categoryGuess: analysis.categoryGuess,
    likeCount:
      typeof obj.like_count === "number"
        ? obj.like_count
        : typeof obj.edge_liked_by === "object" &&
            obj.edge_liked_by &&
            typeof (obj.edge_liked_by as { count?: number }).count === "number"
          ? (obj.edge_liked_by as { count: number }).count
          : undefined,
    commentCount:
      typeof obj.comment_count === "number" ? obj.comment_count : undefined,
  };
}

function walkCollectPosts(
  value: unknown,
  out: Map<string, IgMediaItem>,
  depth = 0,
): void {
  if (depth > 45 || value == null) return;
  if (Array.isArray(value)) {
    for (const v of value) walkCollectPosts(v, out, depth + 1);
    return;
  }
  if (typeof value !== "object") return;
  const obj = value as Record<string, unknown>;

  // Feed items array
  if (Array.isArray(obj.items)) {
    for (const it of obj.items) {
      if (it && typeof it === "object") {
        const item = postObjectToItem(it as Record<string, unknown>);
        if (item) out.set(item.id, item);
      }
    }
  }

  // GraphQL timeline edges
  const edges = (
    obj.edge_owner_to_timeline_media as {
      edges?: { node?: Record<string, unknown> }[];
    }
  )?.edges;
  if (edges?.length) {
    for (const e of edges) {
      if (e.node) {
        const item = postObjectToItem(e.node);
        if (item) out.set(item.id, item);
      }
    }
  }

  // Modern connection
  const conn = (obj.xdt_api__v1__feed__user_timeline_graphql_connection ||
    obj.user_timeline_graphql_connection) as
    | { edges?: { node?: Record<string, unknown> }[] }
    | undefined;
  if (conn?.edges) {
    for (const e of conn.edges) {
      if (e.node) {
        const item = postObjectToItem(e.node);
        if (item) out.set(item.id, item);
      }
    }
  }

  // Looks like a post
  if (
    (typeof obj.code === "string" ||
      typeof obj.shortcode === "string" ||
      obj.pk != null ||
      obj.id != null) &&
    (obj.image_versions2 ||
      obj.display_url ||
      obj.carousel_media ||
      obj.video_versions ||
      obj.media_type != null)
  ) {
    const item = postObjectToItem(obj);
    if (item) out.set(item.id, item);
  }

  for (const v of Object.values(obj)) {
    if (typeof v === "object" && v !== null) {
      walkCollectPosts(v, out, depth + 1);
    }
  }
}

function appHeaders(cookie: string): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": IG_APP_UA,
    Accept: "*/*",
    "Accept-Language": "tr-TR, en-US",
    "X-IG-App-ID": "936619743392459",
    "X-IG-Capabilities": "3brTvw==",
    "X-IG-Connection-Type": "WIFI",
    "X-FB-HTTP-Engine": "Liger",
    Referer: "https://www.instagram.com/",
  };
  if (cookie) h.Cookie = cookie;
  const csrf = cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1];
  if (csrf) h["X-CSRFToken"] = csrf;
  return h;
}

function webHeaders(cookie: string, json: boolean): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": WEB_UA,
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    "X-IG-App-ID": "936619743392459",
    "X-ASBD-ID": "129477",
    "X-Requested-With": "XMLHttpRequest",
    Referer: "https://www.instagram.com/",
    Origin: "https://www.instagram.com",
    Accept: json
      ? "*/*"
      : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };
  if (cookie) h.Cookie = cookie;
  const csrf = cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1];
  if (csrf) {
    h["X-CSRFToken"] = csrf;
    h["X-Instagram-AJAX"] = "1";
  }
  return h;
}

/** Ham feed JSON → gönderi listesi (birçok Instagram formatı) */
function parseFeedPayload(data: unknown): {
  items: IgMediaItem[];
  more: boolean;
  nextMaxId?: string;
  meta: string;
} {
  const map = new Map<string, IgMediaItem>();
  const root = (data && typeof data === "object" ? data : {}) as Record<
    string,
    unknown
  >;

  const pushRaw = (raw: unknown) => {
    if (!raw || typeof raw !== "object") return;
    const o = raw as Record<string, unknown>;
    // Sarmalayıcılar
    const media =
      (o.media as Record<string, unknown>) ||
      (o.media_or_ad as Record<string, unknown>) ||
      (o.item as Record<string, unknown>) ||
      o;
    let item = postObjectToItem(media);
    if (!item) {
      // Gevşek: içinden URL topla
      const blob = JSON.stringify(media);
      const urls = [
        ...blob.matchAll(
          /https:\\\/\\\/[^"\\]+(?:cdninstagram|fbcdn)[^"\\]*/g,
        ),
      ]
        .map((m) => unescapeIgUrl(m[0].replace(/\\/g, "")))
        .filter((u) => !u.includes("rsrc.php"));
      const unique = [...new Set(urls)].slice(0, 12);
      if (unique.length) {
        const id = String(
          media.id || media.pk || media.code || media.shortcode || unique[0],
        );
        const analysis = analyzeCaption(captionFrom(media));
        item = {
          id,
          caption: captionFrom(media),
          mediaType: unique.some((u) => /\.mp4|video/.test(u))
            ? "VIDEO"
            : "IMAGE",
          mediaUrl: unique[0],
          thumbnailUrl: unique[0],
          mediaUrls: unique,
          children: [],
          looksLikeWedding: analysis.looksLikeWedding,
          categoryGuess: analysis.categoryGuess,
          permalink:
            typeof media.code === "string"
              ? `https://www.instagram.com/p/${media.code}/`
              : undefined,
        };
      }
    }
    if (item && !map.has(item.id)) map.set(item.id, item);
  };

  if (Array.isArray(root.items)) {
    for (const it of root.items) pushRaw(it);
  }
  if (Array.isArray(root.feed_items)) {
    for (const it of root.feed_items) pushRaw(it);
  }
  if (Array.isArray(root.num_results as unknown)) {
    // ignore
  }
  // nested user.edge...
  walkCollectPosts(data, map);

  const more = Boolean(root.more_available);
  const nextMaxId =
    typeof root.next_max_id === "string"
      ? root.next_max_id
      : typeof root.next_max_id === "number"
        ? String(root.next_max_id)
        : undefined;

  const keys = Object.keys(root).slice(0, 20).join(", ");
  return {
    items: [...map.values()],
    more,
    nextMaxId,
    meta: `keys=[${keys}] rawItems=${Array.isArray(root.items) ? root.items.length : 0} parsed=${map.size}`,
  };
}

async function verifyUserId(
  userId: string,
  expectUsername: string,
  cookie: string,
  logs: IgAttemptLog[],
): Promise<{ ok: boolean; cookie: string }> {
  try {
    const res = await fetch(
      `https://i.instagram.com/api/v1/users/${encodeURIComponent(userId)}/info/`,
      {
        headers: appHeaders(cookie),
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      },
    );
    const text = await res.text();
    cookie = mergeCookieHeader(cookie, getSetCookies(res));
    if (!res.ok) {
      logs.push({
        step: "User ID doğrula",
        ok: false,
        status: res.status,
        detail: `info HTTP ${res.status}`,
        bodyPreview: previewBody(text),
      });
      // 404 vb. — yine de feed dene
      return { ok: res.status !== 404, cookie };
    }
    try {
      const data = JSON.parse(text) as {
        user?: { username?: string; pk?: number | string };
      };
      const uname = (data.user?.username || "").toLowerCase();
      const match = uname === expectUsername.toLowerCase();
      logs.push({
        step: "User ID doğrula",
        ok: match,
        status: res.status,
        detail: match
          ? `@${uname} eşleşti`
          : `Beklenen @${expectUsername}, gelen @${uname || "?"}`,
        bodyPreview: previewBody(text),
      });
      return { ok: match || !uname, cookie };
    } catch {
      logs.push({
        step: "User ID doğrula",
        ok: false,
        status: res.status,
        detail: "JSON parse",
        bodyPreview: previewBody(text),
      });
      return { ok: true, cookie };
    }
  } catch (e) {
    logs.push({
      step: "User ID doğrula",
      ok: false,
      detail: e instanceof Error ? e.message : "Hata",
    });
    return { ok: true, cookie };
  }
}

async function resolveUserId(
  username: string,
  cookie: string,
  logs: IgAttemptLog[],
): Promise<{ userId?: string; cookie: string }> {
  const candidates: string[] = [];

  // 1) web_profile_info (app + web host)
  for (const host of ["i.instagram.com", "www.instagram.com"] as const) {
    try {
      const url = `https://${host}/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
      const res = await fetch(url, {
        headers: host.startsWith("i.") ? appHeaders(cookie) : webHeaders(cookie, true),
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      });
      const text = await res.text();
      cookie = mergeCookieHeader(cookie, getSetCookies(res));
      if (res.status === 429) {
        logs.push({
          step: `Kullanıcı ID (${host})`,
          ok: false,
          status: 429,
          detail: "Rate limit",
          bodyPreview: previewBody(text),
        });
        continue;
      }
      if (res.ok) {
        try {
          const data = JSON.parse(text) as {
            data?: {
              user?: { id?: string; pk?: string | number; username?: string };
            };
          };
          const u = data.data?.user;
          const id =
            u?.id || (u?.pk != null ? String(u.pk) : undefined);
          if (id) {
            logs.push({
              step: `Kullanıcı ID (${host})`,
              ok: true,
              status: res.status,
              detail: `id=${id} @${u?.username || username}`,
            });
            return { userId: id, cookie };
          }
        } catch {
          // fallthrough
        }
      }
      logs.push({
        step: `Kullanıcı ID (${host})`,
        ok: false,
        status: res.status,
        detail: "ID yok",
        bodyPreview: previewBody(text),
      });
    } catch (e) {
      logs.push({
        step: `Kullanıcı ID (${host})`,
        ok: false,
        detail: e instanceof Error ? e.message : "Hata",
      });
    }
  }

  // 2) HTML — sadece güvenilir pattern'ler
  try {
    const res = await fetch(
      `https://www.instagram.com/${encodeURIComponent(username)}/`,
      {
        headers: webHeaders(cookie, false),
        signal: AbortSignal.timeout(25_000),
        cache: "no-store",
      },
    );
    const html = await res.text();
    cookie = mergeCookieHeader(cookie, getSetCookies(res));

    const patterns = [
      /"profilePage_(\d+)"/,
      /"logging_page_id"\s*:\s*"profilePage_(\d+)"/,
      /"props"\s*:\s*\{\s*"id"\s*:\s*"(\d+)"/,
      new RegExp(
        `"username"\\s*:\\s*"${username}"[\\s\\S]{0,200}?"id"\\s*:\\s*"(\\d+)"`,
        "i",
      ),
      new RegExp(
        `"id"\\s*:\\s*"(\\d+)"[\\s\\S]{0,200}?"username"\\s*:\\s*"${username}"`,
        "i",
      ),
      /"user_id"\s*:\s*"(\d+)"/,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) candidates.push(m[1]);
    }
    // unique preserve order
    const uniq = [...new Set(candidates)];
    for (const id of uniq) {
      const v = await verifyUserId(id, username, cookie, logs);
      cookie = v.cookie;
      if (v.ok) {
        logs.push({
          step: "Kullanıcı ID (HTML+doğrulama)",
          ok: true,
          status: res.status,
          detail: `user id = ${id}`,
        });
        return { userId: id, cookie };
      }
    }
    if (uniq[0]) {
      // doğrulama başarısız olsa da dene
      logs.push({
        step: "Kullanıcı ID (HTML aday)",
        ok: true,
        status: res.status,
        detail: `doğrulanamadı ama denenecek: ${uniq[0]} (adaylar: ${uniq.slice(0, 5).join(",")})`,
      });
      return { userId: uniq[0], cookie };
    }
    logs.push({
      step: "Kullanıcı ID (HTML)",
      ok: false,
      status: res.status,
      detail: "HTML içinde güvenilir user id yok",
      bodyPreview: previewBody(
        html.match(/<title>([^<]+)<\/title>/i)?.[1] || html.slice(0, 300),
      ),
    });
  } catch (e) {
    logs.push({
      step: "Kullanıcı ID (HTML)",
      ok: false,
      detail: e instanceof Error ? e.message : "Hata",
    });
  }

  return { cookie };
}

/** sessionid ile tüm feed sayfalarını çek */
async function fetchAllViaUserFeed(
  userId: string,
  cookie: string,
  maxPosts: number,
  logs: IgAttemptLog[],
): Promise<{ items: IgMediaItem[]; cookie: string }> {
  const items: IgMediaItem[] = [];
  const seen = new Set<string>();
  let maxId: string | undefined;
  let page = 0;
  const maxPages = Math.ceil(maxPosts / 12) + 3;

  const endpointBuilders = [
    (id: string, mid?: string) => {
      const u = new URL(
        `https://i.instagram.com/api/v1/feed/user/${encodeURIComponent(id)}/`,
      );
      u.searchParams.set("count", "50");
      if (mid) u.searchParams.set("max_id", mid);
      return u.toString();
    },
    (id: string, mid?: string) => {
      const u = new URL(
        `https://www.instagram.com/api/v1/feed/user/${encodeURIComponent(id)}/`,
      );
      u.searchParams.set("count", "50");
      if (mid) u.searchParams.set("max_id", mid);
      return u.toString();
    },
  ];

  let endpointIndex = 0;

  while (page < maxPages && items.length < maxPosts) {
    page += 1;
    const build = endpointBuilders[endpointIndex] || endpointBuilders[0];
    const url = build(userId, maxId);

    try {
      if (page > 1) await sleep(900 + Math.random() * 500);
      const useApp = url.includes("i.instagram.com");
      const res = await fetch(url, {
        headers: useApp ? appHeaders(cookie) : webHeaders(cookie, true),
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
      });
      const text = await res.text();
      cookie = mergeCookieHeader(cookie, getSetCookies(res));

      if (res.status === 429) {
        logs.push({
          step: `Feed sayfa ${page}`,
          ok: false,
          status: 429,
          detail: "Rate limit — durduruldu",
          bodyPreview: previewBody(text),
        });
        break;
      }
      if (!res.ok) {
        logs.push({
          step: `Feed sayfa ${page}`,
          ok: false,
          status: res.status,
          detail: `HTTP ${res.status} · ${url.slice(0, 80)}`,
          bodyPreview: previewBody(text),
        });
        // diğer endpoint'e geç
        if (endpointIndex < endpointBuilders.length - 1 && page === 1) {
          endpointIndex += 1;
          page = 0;
          continue;
        }
        break;
      }

      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        logs.push({
          step: `Feed sayfa ${page}`,
          ok: false,
          status: res.status,
          detail: "JSON parse hatası",
          bodyPreview: previewBody(text),
        });
        break;
      }

      // challenge / login mesajı
      const root = data as Record<string, unknown>;
      if (
        root.message === "checkpoint_required" ||
        root.message === "login_required" ||
        root.require_login
      ) {
        logs.push({
          step: `Feed sayfa ${page}`,
          ok: false,
          status: res.status,
          detail: String(root.message || "login_required"),
          bodyPreview: previewBody(text),
        });
        break;
      }

      const parsed = parseFeedPayload(data);
      let added = 0;
      for (const item of parsed.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
        added += 1;
        if (items.length >= maxPosts) break;
      }

      logs.push({
        step: `Feed sayfa ${page}`,
        ok: added > 0,
        status: res.status,
        detail: `+${added} gönderi (toplam ${items.length}) · ${parsed.meta}${
          parsed.more ? " · devam var" : " · son"
        }`,
        bodyPreview:
          added === 0
            ? previewBody(text, 900)
            : undefined,
      });

      // İlk sayfa boşsa alternatif endpoint dene
      if (added === 0 && page === 1 && endpointIndex < endpointBuilders.length - 1) {
        endpointIndex += 1;
        page = 0;
        maxId = undefined;
        continue;
      }

      if (!parsed.more || !parsed.nextMaxId || added === 0) break;
      maxId = parsed.nextMaxId;
    } catch (e) {
      logs.push({
        step: `Feed sayfa ${page}`,
        ok: false,
        detail: e instanceof Error ? e.message : "İstek hatası",
      });
      break;
    }
  }

  return { items, cookie };
}

function extractFromHtml(
  html: string,
  username: string,
): { items: IgMediaItem[]; note: string } {
  const map = new Map<string, IgMediaItem>();

  const jsonScripts = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  for (const m of jsonScripts) {
    try {
      walkCollectPosts(JSON.parse(m[1]), map);
    } catch {
      // ignore
    }
  }

  const shared = html.match(
    /window\._sharedData\s*=\s*(\{[\s\S]+?\});<\/script>/,
  );
  if (shared?.[1]) {
    try {
      walkCollectPosts(JSON.parse(shared[1]), map);
    } catch {
      // ignore
    }
  }

  // Loose walk entire HTML as quasi-json fragments with media_type
  if (map.size === 0) {
    const chunks = html.match(/\{"code":"[A-Za-z0-9_-]+"[\s\S]{0,8000}?\}/g);
    if (chunks) {
      for (const ch of chunks.slice(0, 40)) {
        try {
          // try to close incomplete json softly — skip if fails
          const item = postObjectToItem(JSON.parse(ch) as Record<string, unknown>);
          if (item) map.set(item.id, item);
        } catch {
          // ignore
        }
      }
    }
  }

  // Regex image/video fallback
  if (map.size === 0) {
    const codes = [
      ...html.matchAll(/"(?:shortcode|code)"\s*:\s*"([A-Za-z0-9_-]{5,})"/g),
    ].map((m) => m[1]);
    const urls = [
      ...html.matchAll(
        /https:\\\/\\\/[^"'\s]+(?:cdninstagram|fbcdn)[^"'\s]+/g,
      ),
    ].map((m) => unescapeIgUrl(m[0].replace(/\\/g, "")));
    const uniqueCodes = [...new Set(codes)].slice(0, 40);
    const uniqueUrls = [...new Set(urls)].filter(
      (u) => !u.includes("rsrc.php") && !u.includes("static.cdn"),
    );
    uniqueCodes.forEach((code, i) => {
      const url = uniqueUrls[i] || uniqueUrls[0];
      if (!url) return;
      const analysis = analyzeCaption("");
      map.set(code, {
        id: code,
        caption: "",
        mediaType: "IMAGE",
        mediaUrl: url,
        thumbnailUrl: url,
        mediaUrls: [url],
        permalink: `https://www.instagram.com/p/${code}/`,
        children: [],
        looksLikeWedding: analysis.looksLikeWedding,
        categoryGuess: analysis.categoryGuess,
      });
    });
  }

  const isProfile =
    html.includes(`@${username}`) || html.includes(`"username":"${username}"`);

  return {
    items: [...map.values()],
    note: isProfile
      ? `HTML profil · ${map.size} gönderi`
      : `HTML · ${map.size} gönderi`,
  };
}

/**
 * Tüm (veya çok sayıda) gönderiyi çeker: foto, video, carousel, açıklama.
 * sessionid ile feed pagination en iyi sonucu verir.
 */
export async function fetchInstagramByUsername(
  rawUsername: string,
  limit = 200,
  options?: { sessionCookie?: string },
): Promise<IgFetchResult> {
  const username = normalizeInstagramUsername(rawUsername);
  const logs: IgAttemptLog[] = [];
  let cookie = normalizeSessionCookie(options?.sessionCookie || "");
  const usedSession = Boolean(cookie);
  const maxPosts = Math.min(300, Math.max(12, limit));

  if (!username) {
    return {
      items: [],
      error: "Geçerli bir Instagram kullanıcı adı girin.",
      debug: {
        summary: "Kullanıcı adı boş",
        attempts: [],
        usedSession,
        tips: [],
      },
    };
  }

  try {
    // Warm-up
    try {
      const res = await fetch("https://www.instagram.com/", {
        headers: webHeaders(cookie, false),
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      });
      cookie = mergeCookieHeader(cookie, getSetCookies(res));
      logs.push({
        step: "1) Isınma",
        ok: res.ok,
        status: res.status,
        detail: `cookie parçası: ${cookie.split(";").filter(Boolean).length}`,
      });
    } catch (e) {
      logs.push({
        step: "1) Isınma",
        ok: false,
        detail: e instanceof Error ? e.message : "Hata",
      });
    }

    await sleep(400);

    let items: IgMediaItem[] = [];

    // A) sessionid varsa: user id + tam feed pagination
    if (usedSession) {
      const resolved = await resolveUserId(username, cookie, logs);
      cookie = resolved.cookie;
      if (resolved.userId) {
        const feed = await fetchAllViaUserFeed(
          resolved.userId,
          cookie,
          maxPosts,
          logs,
        );
        cookie = feed.cookie;
        items = feed.items;

        // Bazen numeric id boş döner; username path dene
        if (items.length === 0) {
          logs.push({
            step: "Feed yedek",
            ok: false,
            detail: `id=${resolved.userId} ile 0 sonuç — username path denenecek`,
          });
          const alt = await fetchAllViaUserFeed(
            username,
            cookie,
            maxPosts,
            logs,
          );
          // username path yanlış olabilir; sadece sonuç varsa al
          if (alt.items.length > items.length) {
            items = alt.items;
            cookie = alt.cookie;
          }
        }
      } else {
        logs.push({
          step: "Feed",
          ok: false,
          detail:
            "user id bulunamadı — sessionid geçersiz/eksik olabilir veya Instagram engelliyor",
        });
      }
    }

    // B) HTML parse (pagination yok ama caption/media dolu olabilir)
    if (items.length < 6) {
      await sleep(500);
      try {
        const res = await fetch(
          `https://www.instagram.com/${encodeURIComponent(username)}/`,
          {
            headers: webHeaders(cookie, false),
            signal: AbortSignal.timeout(30_000),
            cache: "no-store",
          },
        );
        const html = await res.text();
        cookie = mergeCookieHeader(cookie, getSetCookies(res));
        const extracted = extractFromHtml(html, username);
        logs.push({
          step: "Profil HTML",
          ok: extracted.items.length > 0,
          status: res.status,
          detail: extracted.note,
          bodyPreview: previewBody(
            html.match(/<title>([^<]+)<\/title>/i)?.[1] || html.slice(0, 200),
          ),
        });
        // Merge unique
        const map = new Map(items.map((i) => [i.id, i]));
        for (const it of extracted.items) {
          if (!map.has(it.id)) map.set(it.id, it);
        }
        items = [...map.values()];
      } catch (e) {
        logs.push({
          step: "Profil HTML",
          ok: false,
          detail: e instanceof Error ? e.message : "Hata",
        });
      }
    }

    // C) web_profile_info edges (ilk ~12)
    if (items.length < 6) {
      await sleep(600);
      try {
        const res = await fetch(
          `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
          {
            headers: webHeaders(cookie, true),
            signal: AbortSignal.timeout(20_000),
            cache: "no-store",
          },
        );
        const text = await res.text();
        if (res.ok) {
          try {
            const data = JSON.parse(text) as unknown;
            const map = new Map(items.map((i) => [i.id, i]));
            walkCollectPosts(data, map);
            items = [...map.values()];
            logs.push({
              step: "web_profile_info",
              ok: items.length > 0,
              status: res.status,
              detail: `toplam ${items.length} gönderi`,
            });
          } catch {
            logs.push({
              step: "web_profile_info",
              ok: false,
              status: res.status,
              detail: "JSON hatası",
              bodyPreview: previewBody(text),
            });
          }
        } else {
          logs.push({
            step: "web_profile_info",
            ok: false,
            status: res.status,
            detail: res.status === 429 ? "Rate limit" : `HTTP ${res.status}`,
            bodyPreview: previewBody(text),
          });
        }
      } catch (e) {
        logs.push({
          step: "web_profile_info",
          ok: false,
          detail: e instanceof Error ? e.message : "Hata",
        });
      }
    }

    items = items.slice(0, maxPosts);

    if (items.length === 0) {
      return {
        items: [],
        username,
        error:
          "Hiç gönderi çekilemedi. sessionid ekleyip tekrar deneyin (tüm feed için gerekli).",
        debug: {
          summary: "0 gönderi",
          attempts: logs,
          usedSession,
          tips: [
            "Chrome’da Instagram’a giriş → F12 → Cookies → sessionid kopyala.",
            "sessionid ile sistem tüm sayfaları (foto+video+açıklama) çeker.",
            "429 görürsen 1–2 saat bekle.",
            "Hesap public olmalı veya sessionid o hesaba erişebilmeli.",
          ],
        },
      };
    }

    return {
      items,
      username,
      debug: {
        summary: `${items.length} gönderi yüklendi (foto/video/açıklama)`,
        attempts: logs,
        usedSession,
        tips: usedSession
          ? []
          : [
              "Daha fazla / tüm gönderiler için sessionid ekleyin — sayfalama ancak o zaman çalışır.",
            ],
      },
    };
  } catch (e) {
    return {
      items: [],
      username,
      error: e instanceof Error ? e.message : "Instagram isteği başarısız",
      debug: {
        summary: "Beklenmeyen hata",
        attempts: logs,
        usedSession,
        tips: [],
      },
    };
  }
}

/** Seçilen gönderiden indirilecek tüm medya URL’leri */
export function collectMediaUrls(item: IgMediaItem): string[] {
  if (item.mediaUrls?.length) return item.mediaUrls;
  if (item.children?.length) {
    return item.children
      .map((c) => c.mediaUrl)
      .filter((u): u is string => Boolean(u));
  }
  const urls: string[] = [];
  if (item.thumbnailUrl) urls.push(item.thumbnailUrl);
  if (item.mediaUrl && item.mediaUrl !== item.thumbnailUrl) {
    urls.push(item.mediaUrl);
  }
  return urls;
}
