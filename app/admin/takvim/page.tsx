import { guardAdminPage } from "@/lib/admin-guard";
import { AppointmentCalendar } from "@/components/admin/AppointmentCalendar";
import { GoogleCalendarPanel } from "@/components/admin/GoogleCalendarPanel";
import {
  blockSlotAction,
  unblockSlotAction,
  saveSpecialDayAction,
  deleteSpecialDayAction,
} from "@/lib/actions/availability";
import { prisma } from "@/lib/prisma";
import { getHolidaysInRange } from "@/lib/holidays-tr";

export const dynamic = "force-dynamic";

export default async function AdminTakvimPage() {
  await guardAdminPage("inquiries");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [rawInquiries, rawBlocked, recentBlocks, specialDays] =
    await Promise.all([
      prisma.inquiry.findMany({
        where: {
          eventDate: { not: null },
          NOT: { status: "CANCELLED" },
        },
        orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
      }),
      prisma.blockedSlot.findMany(),
      prisma.blockedSlot.findMany({
        orderBy: { date: "desc" },
        take: 30,
      }),
      prisma.specialDay.findMany({ orderBy: { date: "asc" } }),
    ]);

  const inquiries = rawInquiries.map((i) => ({
    id: i.id,
    name: i.name,
    phone: i.phone,
    type: i.type,
    status: i.status,
    eventDate: i.eventDate,
    eventTime: i.eventTime,
    message: i.message,
  }));

  const blocked = rawBlocked.map((b) => ({
    id: b.id,
    date: b.date,
    time: b.time,
    reason: b.reason,
  }));

  const upcomingHolidays = getHolidaysInRange(year, year + 1)
    .filter((h) => h.date >= now.toISOString().slice(0, 10))
    .slice(0, 12);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Randevu takvimi</h1>
        <p className="mt-2 text-sm text-muted">
          Onaylı randevular sitede slot kapatır. Tatil / özel günler ve Google
          Takvim entegrasyonu aşağıda.
        </p>
      </div>

      <AppointmentCalendar
        inquiries={inquiries}
        blocked={blocked}
        initialYear={year}
        initialMonth={month}
      />

      <GoogleCalendarPanel siteUrl={siteUrl} />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Gün / saat kapat</h2>
          <p className="mt-1 text-xs text-muted">
            Manuel blok. Saat boş = tüm gün.
          </p>
          <form action={blockSlotAction} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                Tarih
                <input
                  name="date"
                  type="date"
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs text-muted">
                Saat (opsiyonel)
                <input
                  name="time"
                  type="time"
                  className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block text-xs text-muted">
              Açıklama
              <input
                name="reason"
                placeholder="Özel çekim, bakım..."
                className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white"
            >
              Kapat
            </button>
          </form>

          <ul className="mt-6 space-y-2">
            {recentBlocks.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <span>
                  {b.date}
                  {b.time ? ` ${b.time}` : " (tüm gün)"}
                  {b.reason ? ` — ${b.reason}` : ""}
                </span>
                <form action={unblockSlotAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="text-xs text-danger hover:underline">
                    Aç
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Özel gün / tatil ekle</h2>
          <p className="mt-1 text-xs text-muted">
            Sitede renkle gösterilir. “Randevuyu engelle” işaretliyse o gün slot
            seçilemez. TR resmi tatilleri sistemde varsayılan yüklüdür.
          </p>
          <form action={saveSpecialDayAction} className="mt-4 space-y-3">
            <label className="block text-xs text-muted">
              Tarih
              <input
                name="date"
                type="date"
                required
                className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-muted">
              Başlık
              <input
                name="title"
                required
                placeholder="Stüdyo tatili, lansman..."
                className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-muted">
              Tip
              <select
                name="type"
                className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
                defaultValue="SPECIAL"
              >
                <option value="HOLIDAY">Tatil</option>
                <option value="SPECIAL">Özel gün</option>
                <option value="CLOSED">Kapalı</option>
              </select>
            </label>
            <label className="block text-xs text-muted">
              Not
              <input
                name="note"
                className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                name="blockBooking"
                defaultChecked
                className="accent-[var(--accent)]"
              />
              Randevu almayı engelle
            </label>
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white"
            >
              Özel gün ekle
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs font-medium text-muted uppercase">
              Sizin ekledikleriniz
            </p>
            <ul className="mt-2 space-y-2">
              {specialDays.length === 0 && (
                <li className="text-sm text-muted">Henüz yok.</li>
              )}
              {specialDays.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {s.date} · {s.title}{" "}
                    <span className="text-xs text-muted">({s.type})</span>
                  </span>
                  <form action={deleteSpecialDayAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-xs text-danger hover:underline">
                      Sil
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium text-muted uppercase">
              Yaklaşan TR tatil / özel günler (otomatik)
            </p>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-muted">
              {upcomingHolidays.map((h) => (
                <li key={h.date + h.title}>
                  {h.date} — {h.title}
                  {h.blockBooking ? " · randevu kapalı" : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
