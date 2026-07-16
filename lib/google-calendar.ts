import { prisma } from "@/lib/prisma";

export type GoogleCalSettings = {
  enabled: boolean;
  calendarId: string;
  apiKey: string;
  embedUrl: string;
  feedToken: string;
};

export async function getGoogleCalSettings(): Promise<GoogleCalSettings> {
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    return {
      enabled: s?.googleCalEnabled ?? false,
      calendarId: s?.googleCalId ?? "",
      apiKey: s?.googleCalApiKey ?? "",
      embedUrl: s?.googleCalEmbedUrl ?? "",
      feedToken: s?.calendarFeedToken ?? "",
    };
  } catch {
    return {
      enabled: false,
      calendarId: "",
      apiKey: "",
      embedUrl: "",
      feedToken: "",
    };
  }
}

/** Google FreeBusy — takvim herkese açık veya API key yetkili olmalı */
export async function fetchGoogleBusySlots(
  dateStr: string,
): Promise<string[]> {
  const cfg = await getGoogleCalSettings();
  if (!cfg.enabled || !cfg.calendarId || !cfg.apiKey) return [];

  const timeMin = new Date(`${dateStr}T00:00:00+03:00`).toISOString();
  const timeMax = new Date(`${dateStr}T23:59:59+03:00`).toISOString();

  try {
    const url = `https://www.googleapis.com/calendar/v3/freeBusy?key=${encodeURIComponent(cfg.apiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeMin,
        timeMax,
        timeZone: "Europe/Istanbul",
        items: [{ id: cfg.calendarId }],
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Google freeBusy failed", await res.text());
      return [];
    }
    const data = (await res.json()) as {
      calendars?: Record<
        string,
        { busy?: { start: string; end: string }[] }
      >;
    };
    const busy = data.calendars?.[cfg.calendarId]?.busy ?? [];
    // Map busy ranges to HH:mm hours roughly
    const busyHours = new Set<string>();
    for (const b of busy) {
      const start = new Date(b.start);
      const end = new Date(b.end);
      for (
        let t = new Date(start);
        t < end;
        t.setMinutes(t.getMinutes() + 30)
      ) {
        const h = String(t.getHours()).padStart(2, "0");
        const m = String(t.getMinutes()).padStart(2, "0");
        // floor to hour for matching our slots
        busyHours.add(`${h}:${m}`);
        busyHours.add(`${h}:00`);
      }
    }
    return [...busyHours];
  } catch (e) {
    console.error("Google freeBusy error", e);
    return [];
  }
}

/** Google Calendar “etkinlik ekle” deep link (OAuth gerekmez) */
export function googleAddEventUrl(opts: {
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  durationMinutes?: number;
  details?: string;
  location?: string;
}) {
  const duration = opts.durationMinutes ?? 60;
  const [y, mo, d] = opts.date.split("-").map(Number);
  let start = new Date(y, mo - 1, d, 10, 0, 0);
  if (opts.time) {
    const [hh, mm] = opts.time.split(":").map(Number);
    start = new Date(y, mo - 1, d, hh, mm, 0);
  }
  const end = new Date(start.getTime() + duration * 60_000);

  const fmt = (dt: Date) => {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}${p(dt.getMonth() + 1)}${p(dt.getDate())}T${p(dt.getHours())}${p(dt.getMinutes())}00`;
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: opts.details ?? "",
    location: opts.location ?? "",
    ctz: "Europe/Istanbul",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function ensureFeedToken(): string {
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}
