import { getGoogleCalSettings, googleAddEventUrl } from "@/lib/google-calendar";
import { saveGoogleCalendarSettingsAction } from "@/lib/actions/availability";
import { prisma } from "@/lib/prisma";

export async function GoogleCalendarPanel({
  siteUrl,
}: {
  siteUrl: string;
}) {
  const cfg = await getGoogleCalSettings();
  let feedToken = cfg.feedToken;
  if (!feedToken) {
    // ensure token exists for display
    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        siteName: "FotoCekim",
        calendarFeedToken: cryptoRandom(),
      },
      update: {},
    });
    if (!updated.calendarFeedToken) {
      const token = cryptoRandom();
      await prisma.siteSettings.update({
        where: { id: "default" },
        data: { calendarFeedToken: token },
      });
      feedToken = token;
    } else {
      feedToken = updated.calendarFeedToken;
    }
  }

  const icsUrl = `${siteUrl.replace(/\/$/, "")}/api/calendar/ics?token=${feedToken}`;
  const webcalUrl = icsUrl.replace(/^https:/, "webcal:").replace(/^http:/, "webcal:");

  const confirmed = await prisma.inquiry.findMany({
    where: { status: "CONFIRMED", eventDate: { not: null } },
    orderBy: { eventDate: "asc" },
    take: 8,
  });

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">Google Takvim entegrasyonu</h2>
        <p className="mt-2 text-sm text-muted">
          Onaylı randevuları Google Takvim’e abone olarak senkronize edebilirsiniz.
          İsteğe bağlı FreeBusy API ile Google’daki meşguliyet sitede de dolu görünür.
        </p>

        <div className="mt-5 space-y-3 rounded-xl border border-border bg-muted-bg/50 p-4 text-sm">
          <p className="font-medium text-foreground">1) ICS aboneliği (önerilen)</p>
          <ol className="list-decimal space-y-1 pl-5 text-muted">
            <li>Google Takvim → Diğer takvimler → URL ile ekle</li>
            <li>Aşağıdaki adresi yapıştırın</li>
            <li>Onayladığınız randevular otomatik görünür (Google periyodik çeker)</li>
          </ol>
          <code className="mt-2 block break-all rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground">
            {icsUrl}
          </code>
          <a
            href={webcalUrl}
            className="inline-block text-xs text-accent hover:underline"
          >
            webcal:// ile dene
          </a>
        </div>

        <form action={saveGoogleCalendarSettingsAction} className="mt-6 space-y-3">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="googleCalEnabled"
              defaultChecked={cfg.enabled}
              className="accent-[var(--accent)]"
            />
            FreeBusy / embed özelliklerini aktif et
          </label>
          <label className="block text-xs text-muted">
            Takvim ID (ör. primary veya e-posta)
            <input
              name="googleCalId"
              defaultValue={cfg.calendarId}
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
              placeholder="ornek@gmail.com"
            />
          </label>
          <label className="block text-xs text-muted">
            Google API Key (FreeBusy — takvim erişilebilir olmalı)
            <input
              name="googleCalApiKey"
              type="password"
              placeholder={cfg.apiKey ? "•••••••• (değiştirmek için yazın)" : "AIza..."}
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
              autoComplete="off"
            />
          </label>
          <label className="block text-xs text-muted">
            Embed URL (Google Takvim → Ayarlar → Takvimi entegre et)
            <input
              name="googleCalEmbedUrl"
              defaultValue={cfg.embedUrl}
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
              placeholder="https://calendar.google.com/calendar/embed?src=..."
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="regenToken" value="1" />
            ICS gizli token’ı yenile (eski abonelik bozulur)
          </label>
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white"
          >
            Google ayarlarını kaydet
          </button>
        </form>
      </div>

      {cfg.embedUrl && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <p className="border-b border-border px-4 py-3 text-sm text-muted">
            Google Takvim önizleme
          </p>
          <iframe
            src={cfg.embedUrl}
            title="Google Calendar"
            className="h-[420px] w-full border-0"
            loading="lazy"
          />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-serif text-lg text-foreground">
          Onaylı randevuyu Google’a ekle
        </h3>
        <p className="mt-1 text-xs text-muted">
          Tek tıkla Google Calendar “etkinlik oluştur” ekranı açılır (OAuth gerekmez).
        </p>
        <ul className="mt-4 space-y-2">
          {confirmed.length === 0 && (
            <li className="text-sm text-muted">Henüz onaylı randevu yok.</li>
          )}
          {confirmed.map((i) => {
            const href = googleAddEventUrl({
              title: `Çekim: ${i.name}`,
              date: i.eventDate!,
              time: i.eventTime || undefined,
              details: `${i.phone}\n${i.message}`,
              location: i.location || undefined,
            });
            return (
              <li
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <span>
                  {i.eventDate}
                  {i.eventTime ? ` ${i.eventTime}` : ""} — {i.name}
                </span>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Google’a ekle ↗
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function cryptoRandom() {
  // Server component — yeterli entropi
  const a = globalThis.crypto?.randomUUID?.() ?? "";
  return (
    a.replace(/-/g, "") +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}
