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

const WEDDING_RE =
  /düğün|dugun|wedding|gelin|damat|nişan|nisan|kına|kina|söz|soz|after\s*party|gelinlik|davet|kına\s*gecesi/i;
const NISAN_RE = /nişan|nisan|engagement|söz|soz/i;
const DRONE_RE = /drone|hava|aerial/i;
const PRODUCT_RE = /ürün|urun|product|katalog|dükkan|dukkan|magaza|mağaza/i;

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

const IG_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  "X-IG-App-ID": "936619743392459",
  "X-Requested-With": "XMLHttpRequest",
  Referer: "https://www.instagram.com/",
  Origin: "https://www.instagram.com",
};

/** 1) Resmi web profil endpoint (token gerektirmez, public hesap) */
async function fetchViaWebProfileInfo(
  username: string,
): Promise<TimelineNode[] | null> {
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
  const res = await fetch(url, {
    headers: IG_HEADERS,
    signal: AbortSignal.timeout(25_000),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    data?: {
      user?: {
        edge_owner_to_timeline_media?: { edges?: { node?: TimelineNode }[] };
      };
    };
  };
  const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges || [];
  return edges.map((e) => e.node).filter(Boolean) as TimelineNode[];
}

/** 2) Profil HTML içinden JSON parçası (yedek) */
async function fetchViaProfileHtml(
  username: string,
): Promise<TimelineNode[] | null> {
  const res = await fetch(`https://www.instagram.com/${username}/`, {
    headers: {
      ...IG_HEADERS,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(25_000),
    cache: "no-store",
    redirect: "follow",
  });
  if (!res.ok) return null;
  const html = await res.text();

  // sharedData (eski)
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
      if (edges.length) {
        return edges.map((e) => e.node).filter(Boolean) as TimelineNode[];
      }
    } catch {
      // continue
    }
  }

  // additionalData / require("ScheduledServerJS") gömülü media kısa kodları
  const shortcodes = [
    ...html.matchAll(/"shortcode"\s*:\s*"([A-Za-z0-9_-]+)"/g),
  ].map((m) => m[1]);
  const unique = [...new Set(shortcodes)].slice(0, 24);
  if (unique.length === 0) return null;

  // shortcode'lardan oembed ile görsel dene (sınırlı)
  const nodes: TimelineNode[] = [];
  for (const code of unique.slice(0, 12)) {
    try {
      const o = await fetch(
        `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(`https://www.instagram.com/p/${code}/`)}`,
        {
          headers: IG_HEADERS,
          signal: AbortSignal.timeout(10_000),
          cache: "no-store",
        },
      );
      if (!o.ok) continue;
      const od = (await o.json()) as {
        thumbnail_url?: string;
        title?: string;
        author_name?: string;
      };
      if (!od.thumbnail_url) continue;
      nodes.push({
        id: code,
        shortcode: code,
        display_url: od.thumbnail_url,
        thumbnail_src: od.thumbnail_url,
        edge_media_to_caption: {
          edges: [{ node: { text: od.title || "" } }],
        },
      });
    } catch {
      // skip
    }
  }
  return nodes.length ? nodes : null;
}

/**
 * Kullanıcı adıyla public gönderileri çeker (Meta API token yok).
 * Instagram engellerse hata döner — public hesap gerekir.
 */
export async function fetchInstagramByUsername(
  rawUsername: string,
  _limit = 30,
): Promise<{ items: IgMediaItem[]; username?: string; error?: string }> {
  const username = normalizeInstagramUsername(rawUsername);
  if (!username) {
    return { items: [], error: "Geçerli bir Instagram kullanıcı adı girin." };
  }
  if (username.length < 2) {
    return { items: [], error: "Kullanıcı adı çok kısa." };
  }

  try {
    let nodes = await fetchViaWebProfileInfo(username);
    if (!nodes || nodes.length === 0) {
      nodes = await fetchViaProfileHtml(username);
    }
    if (!nodes || nodes.length === 0) {
      return {
        items: [],
        username,
        error:
          "Gönderiler alınamadı. Hesap gizli olabilir, kullanıcı adı yanlış olabilir veya Instagram sunucudan erişimi engellemiş olabilir. Birkaç dakika sonra tekrar deneyin.",
      };
    }

    const items = nodes
      .map(nodeToItem)
      .filter((x): x is IgMediaItem => Boolean(x))
      .slice(0, Math.min(40, Math.max(1, _limit)));

    if (items.length === 0) {
      return {
        items: [],
        username,
        error: "Profil bulundu ama medya listesi boş.",
      };
    }

    return { items, username };
  } catch (e) {
    return {
      items: [],
      username,
      error: e instanceof Error ? e.message : "Instagram isteği başarısız",
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
