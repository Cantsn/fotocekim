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

/** Her deneme yolunun teşhis kaydı (panelde gösterilir) */
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
  /** İnsan dilinde özet + ham detay */
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

/** Instagram kullanıcı adını temizle (@, URL, boşluk) */
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

/** sessionid=xxx veya ham sessionid değerini cookie string'e çevir */
export function normalizeSessionCookie(raw: string): string {
  let s = (raw || "").trim();
  if (!s) return "";
  // Kullanıcı tüm cookie satırını yapıştırmış olabilir
  if (s.includes("sessionid=")) {
    const m = s.match(/sessionid=([^;\s]+)/i);
    if (m) s = m[1];
  }
  // Sadece değer
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
  __typename?: string;
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
  const caption =
    node.edge_media_to_caption?.edges?.[0]?.node?.text?.trim() || "";
  const analysis = analyzeCaption(caption);
  const isVideo = Boolean(node.is_video);
  const sidecar = node.edge_sidecar_to_children?.edges || [];
  const isCarousel = sidecar.length > 0;

  let mediaType: string = "IMAGE";
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

  const mediaUrl = isVideo
    ? node.video_url || node.display_url
    : node.display_url;
  const id = String(node.id || node.shortcode);
  const shortcode = node.shortcode || id;

  return {
    id,
    caption,
    mediaType,
    mediaUrl,
    thumbnailUrl: node.thumbnail_src || node.display_url,
    timestamp: node.taken_at_timestamp
      ? new Date(node.taken_at_timestamp * 1000).toISOString()
      : undefined,
    permalink: shortcode
      ? `https://www.instagram.com/p/${shortcode}/`
      : undefined,
    children,
    looksLikeWedding: analysis.looksLikeWedding,
    categoryGuess: analysis.categoryGuess,
  };
}

function previewBody(text: string, max = 480): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function getSetCookies(res: Response): string[] {
  // Node 18+ / undici
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
    "Sec-Fetch-Site": json ? "same-origin" : "none",
    "Sec-Fetch-User": "?1",
    Referer: "https://www.instagram.com/",
    Origin: "https://www.instagram.com",
    "X-IG-App-ID": "936619743392459",
    "X-ASBD-ID": "129477",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (json) {
    h.Accept = "*/*";
  } else {
    h.Accept =
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
  }
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
};

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
    const set = getSetCookies(res);
    const cookie = mergeCookieHeader(sessionCookie, set);
    const body = await res.text();
    const isLoginWall =
      /login|Log in|Giriş yap/i.test(body.slice(0, 2000)) &&
      body.includes("password");
    logs.push({
      step: "1) Ana sayfa ısınma (cookie/csrf)",
      ok: res.ok && !isLoginWall,
      status: res.status,
      detail: isLoginWall
        ? "Instagram login duvarı / bot engeli döndü"
        : `Cookie sayısı: ${cookie.split(";").filter(Boolean).length}`,
      bodyPreview: previewBody(body.slice(0, 600)),
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
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
  try {
    const res = await fetch(url, {
      headers: buildHeaders(cookie, true),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
    const text = await res.text();
    const newCookie = mergeCookieHeader(cookie, getSetCookies(res));
    if (!res.ok) {
      return {
        nodes: null,
        cookie: newCookie,
        log: {
          step: "2) web_profile_info API",
          ok: false,
          status: res.status,
          detail: `HTTP ${res.status} — Instagram engeli veya login gereksinimi`,
          bodyPreview: previewBody(text),
        },
      };
    }
    let data: {
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
    try {
      data = JSON.parse(text);
    } catch {
      return {
        nodes: null,
        cookie: newCookie,
        log: {
          step: "2) web_profile_info API",
          ok: false,
          status: res.status,
          detail: "JSON parse edilemedi (muhtemelen HTML login sayfası)",
          bodyPreview: previewBody(text),
        },
      };
    }
    if (data.require_login || data.status === "fail") {
      return {
        nodes: null,
        cookie: newCookie,
        log: {
          step: "2) web_profile_info API",
          ok: false,
          status: res.status,
          detail: data.message || "require_login / status=fail",
          bodyPreview: previewBody(text),
        },
      };
    }
    if (data.data?.user?.is_private) {
      return {
        nodes: null,
        cookie: newCookie,
        log: {
          step: "2) web_profile_info API",
          ok: false,
          status: res.status,
          detail: "Hesap gizli (private). sessionid ile giriş yapılmış olmalı.",
          bodyPreview: previewBody(text),
        },
      };
    }
    const edges =
      data.data?.user?.edge_owner_to_timeline_media?.edges || [];
    const nodes = edges.map((e) => e.node).filter(Boolean) as TimelineNode[];
    return {
      nodes: nodes.length ? nodes : null,
      cookie: newCookie,
      log: {
        step: "2) web_profile_info API",
        ok: nodes.length > 0,
        status: res.status,
        detail:
          nodes.length > 0
            ? `${nodes.length} gönderi bulundu`
            : "Profil okundu ama gönderi listesi boş",
        bodyPreview: previewBody(text),
      },
    };
  } catch (e) {
    return {
      nodes: null,
      log: {
        step: "2) web_profile_info API",
        ok: false,
        detail: e instanceof Error ? e.message : "İstek hatası",
      },
    };
  }
}

async function fetchViaQueryA1(
  username: string,
  cookie: string,
): Promise<AttemptResult> {
  const url = `https://www.instagram.com/${encodeURIComponent(username)}/?__a=1&__d=dis`;
  try {
    const res = await fetch(url, {
      headers: buildHeaders(cookie, true),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
    const text = await res.text();
    const newCookie = mergeCookieHeader(cookie, getSetCookies(res));
    if (!res.ok) {
      return {
        nodes: null,
        cookie: newCookie,
        log: {
          step: "3) Profil ?__a=1",
          ok: false,
          status: res.status,
          detail: `HTTP ${res.status}`,
          bodyPreview: previewBody(text),
        },
      };
    }
    try {
      const data = JSON.parse(text) as {
        graphql?: {
          user?: {
            edge_owner_to_timeline_media?: {
              edges?: { node?: TimelineNode }[];
            };
          };
        };
        items?: unknown[];
      };
      const edges =
        data.graphql?.user?.edge_owner_to_timeline_media?.edges || [];
      const nodes = edges.map((e) => e.node).filter(Boolean) as TimelineNode[];
      return {
        nodes: nodes.length ? nodes : null,
        cookie: newCookie,
        log: {
          step: "3) Profil ?__a=1",
          ok: nodes.length > 0,
          status: res.status,
          detail:
            nodes.length > 0
              ? `${nodes.length} gönderi`
              : "JSON geldi ama medya yok",
          bodyPreview: previewBody(text),
        },
      };
    } catch {
      return {
        nodes: null,
        cookie: newCookie,
        log: {
          step: "3) Profil ?__a=1",
          ok: false,
          status: res.status,
          detail: "Yanıt JSON değil",
          bodyPreview: previewBody(text),
        },
      };
    }
  } catch (e) {
    return {
      nodes: null,
      log: {
        step: "3) Profil ?__a=1",
        ok: false,
        detail: e instanceof Error ? e.message : "İstek hatası",
      },
    };
  }
}

async function fetchViaProfileHtml(
  username: string,
  cookie: string,
): Promise<AttemptResult> {
  try {
    const res = await fetch(
      `https://www.instagram.com/${encodeURIComponent(username)}/`,
      {
        headers: buildHeaders(cookie, false),
        signal: AbortSignal.timeout(25_000),
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
          step: "4) Profil HTML",
          ok: false,
          status: res.status,
          detail: `HTTP ${res.status}`,
          bodyPreview: previewBody(html),
        },
      };
    }

    // sharedData
    const shared = html.match(
      /window\._sharedData\s*=\s*(\{[\s\S]+?\});<\/script>/,
    );
    if (shared?.[1]) {
      try {
        const json = JSON.parse(shared[1]) as {
          entry_data?: {
            ProfilePage?: {
              graphql?: {
                user?: {
                  edge_owner_to_timeline_media?: {
                    edges?: { node?: TimelineNode }[];
                  };
                };
              };
            }[];
          };
        };
        const edges =
          json.entry_data?.ProfilePage?.[0]?.graphql?.user
            ?.edge_owner_to_timeline_media?.edges || [];
        const nodes = edges
          .map((e) => e.node)
          .filter(Boolean) as TimelineNode[];
        if (nodes.length) {
          return {
            nodes,
            cookie: newCookie,
            log: {
              step: "4) Profil HTML (_sharedData)",
              ok: true,
              status: res.status,
              detail: `${nodes.length} gönderi (_sharedData)`,
            },
          };
        }
      } catch {
        // continue
      }
    }

    // display_url + shortcode eşleştirme (kısmi)
    const shortcodes = [
      ...html.matchAll(/"shortcode"\s*:\s*"([A-Za-z0-9_-]+)"/g),
    ].map((m) => m[1]);
    const displayUrls = [
      ...html.matchAll(/"display_url"\s*:\s*"([^"]+)"/g),
    ].map((m) => m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/"));
    const captions = [
      ...html.matchAll(/"text"\s*:\s*"((?:\\.|[^"\\])*)"/g),
    ].map((m) => {
      try {
        return JSON.parse(`"${m[1]}"`) as string;
      } catch {
        return m[1];
      }
    });

    const uniqueCodes = [...new Set(shortcodes)].slice(0, 24);
    if (uniqueCodes.length === 0 && displayUrls.length === 0) {
      const loginish =
        html.includes("loginForm") ||
        html.includes("Login") ||
        html.includes('"require_login"');
      return {
        nodes: null,
        cookie: newCookie,
        log: {
          step: "4) Profil HTML",
          ok: false,
          status: res.status,
          detail: loginish
            ? "HTML login/bot sayfası gibi görünüyor — sessionid ekleyin"
            : "HTML içinde shortcode/display_url bulunamadı",
          bodyPreview: previewBody(html),
        },
      };
    }

    const nodes: TimelineNode[] = uniqueCodes.map((code, i) => ({
      id: code,
      shortcode: code,
      display_url: displayUrls[i] || displayUrls[0],
      thumbnail_src: displayUrls[i] || displayUrls[0],
      edge_media_to_caption: {
        edges: [{ node: { text: captions[i] || "" } }],
      },
    }));

    // display_url var shortcode yoksa
    if (nodes.length === 0 && displayUrls.length) {
      displayUrls.slice(0, 12).forEach((url, i) => {
        nodes.push({
          id: `html-${i}`,
          shortcode: `html-${i}`,
          display_url: url,
          thumbnail_src: url,
        });
      });
    }

    return {
      nodes: nodes.length ? nodes : null,
      cookie: newCookie,
      log: {
        step: "4) Profil HTML (regex)",
        ok: nodes.length > 0,
        status: res.status,
        detail: nodes.length
          ? `${nodes.length} medya adayı çıkarıldı`
          : "Parse boş",
        bodyPreview: previewBody(html),
      },
    };
  } catch (e) {
    return {
      nodes: null,
      log: {
        step: "4) Profil HTML",
        ok: false,
        detail: e instanceof Error ? e.message : "İstek hatası",
      },
    };
  }
}

/**
 * Kullanıcı adıyla gönderi çeker.
 * sessionCookie: tarayıcıdan kopyalanan sessionid (bot engelini aşmak için önerilir)
 */
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
        summary: "Kullanıcı adı boş/geçersiz",
        attempts: [],
        usedSession,
        tips: ["Örn: studionuz veya @studionuz"],
      },
    };
  }

  try {
    let cookie = await warmUp(sessionPart, logs);

    // Kısa bekleme — bot skorunu biraz düşürür
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));

    let nodes: TimelineNode[] | null = null;

    const a2 = await fetchViaWebProfileInfo(username, cookie);
    logs.push(a2.log);
    if (a2.cookie) cookie = a2.cookie;
    if (a2.nodes?.length) nodes = a2.nodes;

    if (!nodes?.length) {
      await new Promise((r) => setTimeout(r, 300));
      const a3 = await fetchViaQueryA1(username, cookie);
      logs.push(a3.log);
      if (a3.cookie) cookie = a3.cookie;
      if (a3.nodes?.length) nodes = a3.nodes;
    }

    if (!nodes?.length) {
      await new Promise((r) => setTimeout(r, 300));
      const a4 = await fetchViaProfileHtml(username, cookie);
      logs.push(a4.log);
      if (a4.nodes?.length) nodes = a4.nodes;
    }

    if (!nodes?.length) {
      const tips = [
        "Hesabın herkese açık (public) olduğundan emin olun.",
        "Sunucu IP’si Instagram tarafından bot sanılıyor olabilir.",
        "Chrome’da Instagram’a giriş yapın → F12 → Application → Cookies → sessionid değerini kopyalayıp aşağıdaki alana yapıştırın.",
        "VPN/farklı ağ deneyin veya birkaç dakika sonra tekrar deneyin.",
      ];
      return {
        items: [],
        username,
        error:
          "Gönderiler alınamadı. Aşağıdaki teknik detaylara bakın; genelde bot engeli veya login gereksinimi olur.",
        debug: {
          summary: usedSession
            ? "sessionid ile denendi ama yine de medya gelmedi"
            : "sessionid olmadan denendi — Instagram bot engeli çok olası",
          attempts: logs,
          usedSession,
          tips,
        },
      };
    }

    const items = nodes
      .map(nodeToItem)
      .filter((x): x is IgMediaItem => Boolean(x))
      .slice(0, Math.min(40, Math.max(1, limit)));

    if (items.length === 0) {
      return {
        items: [],
        username,
        error: "Profil bulundu ama medya listesi dönüştürülemedi.",
        debug: {
          summary: "node → item map boş",
          attempts: logs,
          usedSession,
          tips: [],
        },
      };
    }

    return {
      items,
      username,
      debug: {
        summary: `${items.length} gönderi yüklendi`,
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
        tips: ["Sunucu internet çıkışını ve firewall’u kontrol edin."],
      },
    };
  }
}

/** Bir IG postundan indirilecek medya URL listesi */
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
