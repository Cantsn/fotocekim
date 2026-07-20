import { prisma } from "@/lib/prisma";

export type IgMediaItem = {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  timestamp?: string;
  permalink?: string;
  /** Carousel alt öğeleri */
  children: { id: string; mediaType: string; mediaUrl?: string }[];
  /** Açıklamadan düğün/nişan sinyali */
  looksLikeWedding: boolean;
  categoryGuess: string;
};

const WEDDING_RE =
  /düğün|dugun|wedding|gelin|damat|nişan|nisan|kına|kina|söz|soz|after\s*party|gelinlik|davet|kına\s*gecesi/i;
const NISAN_RE = /nişan|nisan|engagement|söz|soz/i;
const DRONE_RE = /drone|hava|aerial/i;
const PRODUCT_RE = /ürün|urun|product|katalog|dükkan|dukkan|magaza|mağaza/i;

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

  // Başlık: ilk satır veya ilk 60 karakter
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

export async function getInstagramCredentials(): Promise<{
  userId: string;
  accessToken: string;
} | null> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const userId = row?.instagramUserId?.trim() || "";
  const accessToken = row?.instagramAccessToken?.trim() || "";
  if (!userId || !accessToken) return null;
  return { userId, accessToken };
}

type GraphMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp?: string;
  permalink?: string;
  children?: {
    data?: { id: string; media_type?: string; media_url?: string }[];
  };
};

export async function fetchInstagramMedia(limit = 30): Promise<{
  items: IgMediaItem[];
  error?: string;
}> {
  const creds = await getInstagramCredentials();
  if (!creds) {
    return {
      items: [],
      error:
        "Instagram bağlantısı yok. Site ayarlarına Instagram User ID ve Access Token girin.",
    };
  }

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "timestamp",
    "permalink",
    "children{id,media_type,media_url}",
  ].join(",");

  const url = new URL(
    `https://graph.facebook.com/v21.0/${encodeURIComponent(creds.userId)}/media`,
  );
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", String(Math.min(50, Math.max(1, limit))));
  url.searchParams.set("access_token", creds.accessToken);

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(30_000),
      next: { revalidate: 0 },
    });
    const data = (await res.json()) as {
      data?: GraphMedia[];
      error?: { message?: string };
    };
    if (!res.ok || data.error) {
      return {
        items: [],
        error:
          data.error?.message ||
          `Instagram API hatası (${res.status}). Token ve User ID’yi kontrol edin.`,
      };
    }

    const items: IgMediaItem[] = (data.data || []).map((m) => {
      const caption = m.caption || "";
      const analysis = analyzeCaption(caption);
      return {
        id: m.id,
        caption,
        mediaType: m.media_type || "IMAGE",
        mediaUrl: m.media_url,
        thumbnailUrl: m.thumbnail_url,
        timestamp: m.timestamp,
        permalink: m.permalink,
        children: (m.children?.data || []).map((c) => ({
          id: c.id,
          mediaType: c.media_type || "IMAGE",
          mediaUrl: c.media_url,
        })),
        looksLikeWedding: analysis.looksLikeWedding,
        categoryGuess: analysis.categoryGuess,
      };
    });

    return { items };
  } catch (e) {
    return {
      items: [],
      error: e instanceof Error ? e.message : "Instagram isteği başarısız",
    };
  }
}

/** Bir IG postundan indirilecek medya URL listesi (carousel + tekli) */
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
