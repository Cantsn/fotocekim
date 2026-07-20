export type IgMediaItem = {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  timestamp?: string;
  permalink?: string;
  children: { id: string; mediaType: string; mediaUrl?: string }[];
  looksLikeWedding: boolean;
  categoryGuess: string;
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

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

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

type TimelineNode = {
  id?: string;
  shortcode?: string;
  is_video?: boolean;
  display_url?: string;
  thumbnail_src?: string;
  video_url?: string;
  taken_at_timestamp?: number;
  edge_media_to_caption?: {
    edges?: { node?: { text?: string } }[];
  };
  edge_sidecar_to_children?: {
    edges?: {
      node?: {
        id?: string;
        is_video?: boolean;
        display_url?: string;
        video_url?: string;
      };
    }[];
  };
};

function nodeToItem(node: TimelineNode): IgMediaItem | null {
  if (!node?.id && !node?.shortcode) return null;
  if (!node.display_url && !node.video_url && !node.thumbnail_src) {
    // carousel only
    const kids = node.edge_sidecar_to_children?.edges || [];
    if (!kids.length) return null;
  }
  const caption =
    node.edge_media_to_caption?.edges?.[0]?.node?.text?.trim() || "";
  const analysis = analyzeCaption(caption);
  const isVideo = Boolean(node.is_video);
  const sidecar = node.edge_sidecar_to_children?.edges || [];
  const isCarousel = sidecar.length > 0;

  let mediaType = "IMAGE";
  if (isCarousel) mediaType = "CAROUSEL_ALBUM";
  else if (isVideo) mediaType = "VIDEO";

  const children = sidecar
    .map((e) => e.node)
    .filter(Boolean)
    .map((c) => ({
      id: String(c!.id || ""),
      mediaType: c!.is_video ? "VIDEO" : "IMAGE",
      mediaUrl: c!.is_video
        ? c!.video_url || c!.display_url
        : c!.display_url,
    }))
    .filter((c) => c.mediaUrl);

  const mediaUrl =
    (isVideo ? node.video_url || node.display_url : node.display_url) ||
    node.thumbnail_src ||
    children[0]?.mediaUrl;
  const id = String(node.id || node.shortcode);
  const shortcode = node.shortcode || id;

  return {
    id,
    caption,
    mediaType,
    mediaUrl,
    thumbnailUrl: node.thumbnail_src || node.display_url || mediaUrl,
    timestamp: node.taken_at_timestamp
      ? new Date(node.taken_at_timestamp * 1000).toISOString()
      : undefined,
    permalink:
      shortcode && !String(shortcode).startsWith("html-")
        ? `https://www.instagram.com/p/${shortcode}/`
        : undefined,
    children,
    looksLikeWedding: analysis.looksLikeWedding,
    categoryGuess: analysis.categoryGuess,
  };
}

function previewBody(text: string, max = 500): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
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

function buildHeaders(cookie: string, json = true): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": UA,
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Sec-Ch-Ua":
      '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": json ? "empty" : "document",
    "Sec-Fetch-Mode": json ? "cors" : "navigate",
    "Sec-Fetch-Site": "same-origin",
    Referer: "https://www.instagram.com/",
    Origin: "https://www.instagram.com",
    "X-IG-App-ID": "936619743392459",
    "X-ASBD-ID": "129477",
    "X-Requested-With": "XMLHttpRequest",
  };
  h.Accept = json
    ? "*/*"
    : "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
  if (cookie) h.Cookie = cookie;
  const csrf = cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1];
  if (csrf) {
    h["X-CSRFToken"] = csrf;
    h["X-Instagram-AJAX"] = "1";
  }
  return h;
}

type AttemptResult = {
  nodes: TimelineNode[] | null;
  log: IgAttemptLog;
  cookie?: string;
  rateLimited?: boolean;
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

/** Modern GraphQL / timeline post objesini TimelineNode'a çevir */
function modernPostToNode(obj: Record<string, unknown>): TimelineNode | null {
  const code =
    (typeof obj.code === "string" && obj.code) ||
    (typeof obj.shortcode === "string" && obj.shortcode) ||
    "";
  const id =
    (typeof obj.id === "string" && obj.id) ||
    (typeof obj.pk === "string" && obj.pk) ||
    (typeof obj.pk === "number" && String(obj.pk)) ||
    code;
  if (!id && !code) return null;

  // caption
  let caption = "";
  if (typeof obj.caption === "string") caption = obj.caption;
  else if (obj.caption && typeof obj.caption === "object") {
    const c = obj.caption as { text?: string };
    caption = c.text || "";
  } else if (obj.edge_media_to_caption) {
    // already graphql style
  }

  // image
  let display_url =
    typeof obj.display_url === "string" ? obj.display_url : undefined;
  let thumbnail_src =
    typeof obj.thumbnail_src === "string" ? obj.thumbnail_src : undefined;
  let video_url =
    typeof obj.video_url === "string" ? obj.video_url : undefined;

  const iv2 = obj.image_versions2 as
    | { candidates?: { url?: string }[] }
    | undefined;
  if (!display_url && iv2?.candidates?.[0]?.url) {
    display_url = iv2.candidates[0].url;
  }
  if (!thumbnail_src && display_url) thumbnail_src = display_url;

  const vv = obj.video_versions as { url?: string }[] | undefined;
  if (!video_url && vv?.[0]?.url) video_url = vv[0].url;

  const is_video =
    Boolean(obj.is_video) ||
    obj.media_type === 2 ||
    obj.media_type === "2" ||
    Boolean(video_url && !display_url);

  // carousel
  const carousel = obj.carousel_media as Record<string, unknown>[] | undefined;
  const sidecarEdges =
    carousel?.map((m, i) => {
      const childIv = m.image_versions2 as
        | { candidates?: { url?: string }[] }
        | undefined;
      const childVv = m.video_versions as { url?: string }[] | undefined;
      const childUrl =
        childIv?.candidates?.[0]?.url ||
        (typeof m.display_url === "string" ? m.display_url : undefined) ||
        childVv?.[0]?.url;
      return {
        node: {
          id: String(m.id || m.pk || `${id}-${i}`),
          is_video: m.media_type === 2 || Boolean(childVv?.[0]?.url),
          display_url: childUrl,
          video_url: childVv?.[0]?.url,
        },
      };
    }) || [];

  const taken =
    typeof obj.taken_at === "number"
      ? obj.taken_at
      : typeof obj.taken_at_timestamp === "number"
        ? obj.taken_at_timestamp
        : undefined;

  if (!display_url && !video_url && sidecarEdges.length === 0) {
    // edge_media style already?
    if (typeof obj.display_url !== "string") return null;
  }

  const node: TimelineNode = {
    id: String(id),
    shortcode: code || String(id),
    is_video,
    display_url: display_url ? unescapeIgUrl(display_url) : undefined,
    thumbnail_src: thumbnail_src ? unescapeIgUrl(thumbnail_src) : undefined,
    video_url: video_url ? unescapeIgUrl(video_url) : undefined,
    taken_at_timestamp: taken,
    edge_media_to_caption: caption
      ? { edges: [{ node: { text: caption } }] }
      : (obj.edge_media_to_caption as TimelineNode["edge_media_to_caption"]),
    edge_sidecar_to_children: sidecarEdges.length
      ? { edges: sidecarEdges }
      : (obj.edge_sidecar_to_children as TimelineNode["edge_sidecar_to_children"]),
  };

  return node;
}

/** JSON ağacında medya objelerini topla */
function walkCollectMedia(
  value: unknown,
  out: Map<string, TimelineNode>,
  depth = 0,
): void {
  if (depth > 40 || value == null) return;
  if (Array.isArray(value)) {
    for (const v of value) walkCollectMedia(v, out, depth + 1);
    return;
  }
  if (typeof value !== "object") return;
  const obj = value as Record<string, unknown>;

  // GraphQL edge_owner style
  const edges = obj.edge_owner_to_timeline_media as
    | { edges?: { node?: TimelineNode }[] }
    | undefined;
  if (edges?.edges?.length) {
    for (const e of edges.edges) {
      if (e.node) {
        const item = nodeToItem(e.node);
        if (item) {
          const n = e.node;
          out.set(String(n.id || n.shortcode), n);
        }
      }
    }
  }

  // Modern timeline connection
  if (
    obj.xdt_api__v1__feed__user_timeline_graphql_connection ||
    obj.user_timeline_graphql_connection
  ) {
    const conn = (obj.xdt_api__v1__feed__user_timeline_graphql_connection ||
      obj.user_timeline_graphql_connection) as {
      edges?: { node?: Record<string, unknown> }[];
    };
    for (const e of conn.edges || []) {
      if (e.node) {
        const n = modernPostToNode(e.node);
        if (n) out.set(String(n.id || n.shortcode), n);
      }
    }
  }

  // Single modern post-like object
  const looksLikePost =
    (typeof obj.code === "string" || typeof obj.shortcode === "string") &&
    (obj.image_versions2 ||
      obj.display_url ||
      obj.carousel_media ||
      obj.video_versions ||
      obj.media_type != null);
  if (looksLikePost) {
    const n = modernPostToNode(obj);
    if (n) out.set(String(n.id || n.shortcode), n);
  }

  for (const v of Object.values(obj)) {
    if (typeof v === "object" && v !== null) {
      walkCollectMedia(v, out, depth + 1);
    }
  }
}

function extractNodesFromHtml(html: string, username: string): {
  nodes: TimelineNode[];
  note: string;
  isProfilePage: boolean;
} {
  const isProfilePage =
    html.includes(`@${username}`) ||
    html.includes(`(@${username})`) ||
    html.includes(`/${username}/`) ||
    new RegExp(`content=["'][^"']*@${username}`, "i").test(html) ||
    html.includes(`"username":"${username}"`);

  const isLoginOnly =
    !isProfilePage &&
    (html.includes('name="username"') ||
      html.includes("loginForm") ||
      html.includes("/accounts/login"));

  if (isLoginOnly) {
    return { nodes: [], note: "Login sayfası", isProfilePage: false };
  }

  const found = new Map<string, TimelineNode>();

  // 1) application/json script blobs (Instagram Relay)
  const jsonScripts = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  for (const m of jsonScripts) {
    const raw = m[1]?.trim();
    if (!raw || raw.length < 20) continue;
    try {
      const json = JSON.parse(raw) as unknown;
      walkCollectMedia(json, found);
    } catch {
      // ignore bad json chunks
    }
  }

  // 2) _sharedData
  const shared = html.match(
    /window\._sharedData\s*=\s*(\{[\s\S]+?\});<\/script>/,
  );
  if (shared?.[1]) {
    try {
      walkCollectMedia(JSON.parse(shared[1]), found);
    } catch {
      // ignore
    }
  }

  // 3) AdditionalDataLoaded / require preloads
  const additional = [
    ...html.matchAll(
      /window\.__additionalDataLoaded\s*\(\s*['"][^'"]+['"]\s*,\s*(\{[\s\S]+?\})\s*\)/g,
    ),
  ];
  for (const m of additional) {
    try {
      walkCollectMedia(JSON.parse(m[1]), found);
    } catch {
      // ignore
    }
  }

  // 4) Regex fallback: code + display_url / image url pairs
  if (found.size === 0) {
    const codes = [
      ...html.matchAll(/"(?:shortcode|code)"\s*:\s*"([A-Za-z0-9_-]{5,})"/g),
    ].map((m) => m[1]);
    const urls = [
      ...html.matchAll(
        /"(?:display_url|thumbnail_src|src)"\s*:\s*"(https:[^"]+cdninstagram[^"]+)"/g,
      ),
    ].map((m) => unescapeIgUrl(m[1]));
    const moreUrls = [
      ...html.matchAll(
        /"(?:display_url|thumbnail_src)"\s*:\s*"(https:\\\/\\\/[^"]+)"/g,
      ),
    ].map((m) => unescapeIgUrl(m[1]));
    const allUrls = [...urls, ...moreUrls];
    const uniqueCodes = [...new Set(codes)].slice(0, 30);
    const uniqueUrls = [...new Set(allUrls)].slice(0, 30);

    if (uniqueCodes.length) {
      uniqueCodes.forEach((code, i) => {
        found.set(code, {
          id: code,
          shortcode: code,
          display_url: uniqueUrls[i] || uniqueUrls[0],
          thumbnail_src: uniqueUrls[i] || uniqueUrls[0],
        });
      });
    } else if (uniqueUrls.length) {
      uniqueUrls.forEach((url, i) => {
        found.set(`u-${i}`, {
          id: `u-${i}`,
          shortcode: `u-${i}`,
          display_url: url,
          thumbnail_src: url,
        });
      });
    }
  }

  // 5) og:image as last resort (often only profile pic)
  if (found.size === 0) {
    const og = html.match(
      /property=["']og:image["']\s+content=["']([^"']+)["']/i,
    ) || html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
    if (og?.[1] && !og[1].includes("rsrc.php")) {
      found.set("og", {
        id: "og",
        shortcode: "og",
        display_url: og[1],
        thumbnail_src: og[1],
        edge_media_to_caption: {
          edges: [
            {
              node: {
                text: `Instagram @${username}`,
              },
            },
          ],
        },
      });
    }
  }

  return {
    nodes: [...found.values()],
    note: isProfilePage
      ? `Profil HTML algılandı, ${found.size} medya adayı`
      : `HTML parse, ${found.size} medya adayı`,
    isProfilePage,
  };
}

async function warmUp(
  sessionCookie: string,
  logs: IgAttemptLog[],
): Promise<string> {
  try {
    const res = await fetch("https://www.instagram.com/", {
      headers: buildHeaders(sessionCookie, false),
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
      redirect: "follow",
    });
    const cookie = mergeCookieHeader(sessionCookie, getSetCookies(res));
    logs.push({
      step: "1) Ana sayfa ısınma",
      ok: res.ok,
      status: res.status,
      detail: `Cookie parçası: ${cookie.split(";").filter(Boolean).length}`,
    });
    return cookie || sessionCookie;
  } catch (e) {
    logs.push({
      step: "1) Ana sayfa ısınma",
      ok: false,
      detail: e instanceof Error ? e.message : "Bağlantı hatası",
    });
    return sessionCookie;
  }
}

async function fetchViaWebProfileInfo(
  username: string,
  cookie: string,
): Promise<AttemptResult> {
  // Hem www hem i. alt alan adı dene
  const urls = [
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
  ];
  let lastLog: IgAttemptLog = {
    step: "2) web_profile_info API",
    ok: false,
    detail: "Deneme yok",
  };
  let lastCookie = cookie;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: buildHeaders(lastCookie, true),
        signal: AbortSignal.timeout(25_000),
        cache: "no-store",
      });
      const text = await res.text();
      lastCookie = mergeCookieHeader(lastCookie, getSetCookies(res));

      if (res.status === 429) {
        lastLog = {
          step: "2) web_profile_info API",
          ok: false,
          status: 429,
          detail:
            "HTTP 429 Rate limit — Instagram bu IP’yi geçici kısıtladı. HTML yoluna geçilecek.",
          bodyPreview: previewBody(text),
        };
        return { nodes: null, cookie: lastCookie, log: lastLog, rateLimited: true };
      }
      if (!res.ok) {
        lastLog = {
          step: "2) web_profile_info API",
          ok: false,
          status: res.status,
          detail: `HTTP ${res.status} (${new URL(url).host})`,
          bodyPreview: previewBody(text),
        };
        continue;
      }
      try {
        const data = JSON.parse(text) as {
          data?: {
            user?: {
              edge_owner_to_timeline_media?: {
                edges?: { node?: TimelineNode }[];
              };
              is_private?: boolean;
            };
          };
          message?: string;
          require_login?: boolean;
          status?: string;
        };
        if (data.require_login || data.status === "fail") {
          lastLog = {
            step: "2) web_profile_info API",
            ok: false,
            status: res.status,
            detail: data.message || "require_login",
            bodyPreview: previewBody(text),
          };
          continue;
        }
        if (data.data?.user?.is_private) {
          return {
            nodes: null,
            cookie: lastCookie,
            log: {
              step: "2) web_profile_info API",
              ok: false,
              status: res.status,
              detail: "Hesap gizli (private).",
            },
          };
        }
        const edges =
          data.data?.user?.edge_owner_to_timeline_media?.edges || [];
        const nodes = edges
          .map((e) => e.node)
          .filter(Boolean) as TimelineNode[];
        if (nodes.length) {
          return {
            nodes,
            cookie: lastCookie,
            log: {
              step: "2) web_profile_info API",
              ok: true,
              status: res.status,
              detail: `${nodes.length} gönderi (${new URL(url).host})`,
            },
          };
        }
        lastLog = {
          step: "2) web_profile_info API",
          ok: false,
          status: res.status,
          detail: "Profil JSON ama gönderi listesi boş",
          bodyPreview: previewBody(text),
        };
      } catch {
        lastLog = {
          step: "2) web_profile_info API",
          ok: false,
          status: res.status,
          detail: "JSON değil",
          bodyPreview: previewBody(text),
        };
      }
    } catch (e) {
      lastLog = {
        step: "2) web_profile_info API",
        ok: false,
        detail: e instanceof Error ? e.message : "İstek hatası",
      };
    }
  }
  return { nodes: null, cookie: lastCookie, log: lastLog };
}

async function fetchViaProfileHtml(
  username: string,
  cookie: string,
): Promise<AttemptResult> {
  try {
    const res = await fetch(
      `https://www.instagram.com/${encodeURIComponent(username)}/`,
      {
        headers: {
          ...buildHeaders(cookie, false),
          "Sec-Fetch-Site": "none",
          "Upgrade-Insecure-Requests": "1",
        },
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
        redirect: "follow",
      },
    );
    const html = await res.text();
    const newCookie = mergeCookieHeader(cookie, getSetCookies(res));

    if (!res.ok) {
      return {
        nodes: null,
        cookie: newCookie,
        log: {
          step: "3) Profil HTML (gelişmiş parse)",
          ok: false,
          status: res.status,
          detail: `HTTP ${res.status}`,
          bodyPreview: previewBody(html),
        },
        rateLimited: res.status === 429,
      };
    }

    const extracted = extractNodesFromHtml(html, username);
    return {
      nodes: extracted.nodes.length ? extracted.nodes : null,
      cookie: newCookie,
      log: {
        step: "3) Profil HTML (gelişmiş parse)",
        ok: extracted.nodes.length > 0,
        status: res.status,
        detail: extracted.note,
        bodyPreview: previewBody(
          `title-ish: ${html.match(/<title>([^<]+)<\/title>/i)?.[1] || "?"} | ${extracted.note}`,
        ),
      },
    };
  } catch (e) {
    return {
      nodes: null,
      log: {
        step: "3) Profil HTML (gelişmiş parse)",
        ok: false,
        detail: e instanceof Error ? e.message : "İstek hatası",
      },
    };
  }
}

/** Embed sayfası bazen daha az engelli */
async function fetchViaEmbed(
  username: string,
  cookie: string,
): Promise<AttemptResult> {
  try {
    const res = await fetch(
      `https://www.instagram.com/${encodeURIComponent(username)}/embed/`,
      {
        headers: buildHeaders(cookie, false),
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      },
    );
    const html = await res.text();
    if (!res.ok) {
      return {
        nodes: null,
        log: {
          step: "4) Embed sayfası",
          ok: false,
          status: res.status,
          detail: `HTTP ${res.status}`,
          bodyPreview: previewBody(html),
        },
        rateLimited: res.status === 429,
      };
    }
    const extracted = extractNodesFromHtml(html, username);
    // embed often has images as img src
    if (extracted.nodes.length === 0) {
      const imgs = [
        ...html.matchAll(
          /src="(https:\/\/[^"]+(?:cdninstagram|fbcdn)[^"]+)"/g,
        ),
      ]
        .map((m) => unescapeIgUrl(m[1]))
        .filter((u) => !u.includes("rsrc.php") && !u.includes("static.cdn"));
      const unique = [...new Set(imgs)].slice(0, 20);
      if (unique.length) {
        return {
          nodes: unique.map((url, i) => ({
            id: `embed-${i}`,
            shortcode: `embed-${i}`,
            display_url: url,
            thumbnail_src: url,
          })),
          log: {
            step: "4) Embed sayfası",
            ok: true,
            status: res.status,
            detail: `${unique.length} görsel (img src)`,
          },
        };
      }
    }
    return {
      nodes: extracted.nodes.length ? extracted.nodes : null,
      log: {
        step: "4) Embed sayfası",
        ok: extracted.nodes.length > 0,
        status: res.status,
        detail: extracted.note,
        bodyPreview: previewBody(html),
      },
    };
  } catch (e) {
    return {
      nodes: null,
      log: {
        step: "4) Embed sayfası",
        ok: false,
        detail: e instanceof Error ? e.message : "İstek hatası",
      },
    };
  }
}

export async function fetchInstagramByUsername(
  rawUsername: string,
  limit = 30,
  options?: { sessionCookie?: string },
): Promise<IgFetchResult> {
  const username = normalizeInstagramUsername(rawUsername);
  const logs: IgAttemptLog[] = [];
  const sessionPart = normalizeSessionCookie(options?.sessionCookie || "");
  const usedSession = Boolean(sessionPart);

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
    let cookie = await warmUp(sessionPart, logs);
    await sleep(500);

    // ÖNCE HTML — 429’dan en az etkilenen ve sizin testinizde 200 dönen yol
    let nodes: TimelineNode[] | null = null;

    const htmlTry = await fetchViaProfileHtml(username, cookie);
    logs.push(htmlTry.log);
    if (htmlTry.cookie) cookie = htmlTry.cookie;
    if (htmlTry.nodes?.length) nodes = htmlTry.nodes;

    if (!nodes?.length) {
      await sleep(600);
      const embedTry = await fetchViaEmbed(username, cookie);
      logs.push(embedTry.log);
      if (embedTry.nodes?.length) nodes = embedTry.nodes;
    }

    // API sadece HTML yetmezse (429 riski)
    if (!nodes?.length) {
      await sleep(1200);
      const apiTry = await fetchViaWebProfileInfo(username, cookie);
      logs.push(apiTry.log);
      if (apiTry.nodes?.length) nodes = apiTry.nodes;
    }

    if (!nodes?.length) {
      return {
        items: [],
        username,
        error:
          "Gönderiler parse edilemedi. Aşağıdaki teknik detaya bakın. 429 görüyorsanız birkaç saat bekleyin veya sessionid’yi yenileyin.",
        debug: {
          summary: usedSession
            ? "sessionid var; HTML/embed/API medya çıkaramadı"
            : "sessionid yok veya yetersiz",
          attempts: logs,
          usedSession,
          tips: [
            "HTTP 429 = Instagram sunucu IP’sini geçici kilitledi; 1–6 saat bekleyin.",
            "sessionid’yi Instagram’dan çıkış-giriş yapıp yeniden kopyalayın.",
            "Profil HTML 200 ve @kullanıcıadı title’da ise parse güncellemesi gerekir — hata detayını paylaşın.",
            "Gizli hesapta sessionid, o hesaba erişebilen oturuma ait olmalı.",
          ],
        },
      };
    }

    const items = nodes
      .map(nodeToItem)
      .filter((x): x is IgMediaItem => Boolean(x))
      .slice(0, Math.min(40, Math.max(1, limit)));

    // Tekrarlayan URL’leri ele
    const seen = new Set<string>();
    const unique = items.filter((it) => {
      const key = it.mediaUrl || it.thumbnailUrl || it.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      items: unique,
      username,
      debug: {
        summary: `${unique.length} gönderi/medya yüklendi`,
        attempts: logs,
        usedSession,
        tips: [],
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

export function collectMediaUrls(item: IgMediaItem): string[] {
  if (item.mediaType === "CAROUSEL_ALBUM" && item.children.length > 0) {
    return item.children
      .map((c) => c.mediaUrl)
      .filter((u): u is string => Boolean(u));
  }
  if (item.mediaUrl) return [item.mediaUrl];
  if (item.thumbnailUrl) return [item.thumbnailUrl];
  return [];
}
