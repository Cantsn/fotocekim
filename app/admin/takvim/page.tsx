import { guardAdminPage } from "@/lib/admin-guard";
import { AppointmentCalendar } from "@/components/admin/AppointmentCalendar";
import {
  blockSlotAction,
  unblockSlotAction,
} from "@/lib/actions/availability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTakvimPage() {
  await guardAdminPage("inquiries");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Tüm tarihli talepler — takvim ay değiştirince de doğru dolsun
  const [rawInquiries, rawBlocked, recentBlocks] = await Promise.all([
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

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Randevu takvimi</h1>
        <p className="mt-2 text-sm text-muted">
          Onaylı randevular sitede ilgili tarih/saati kapatır. Bekleyen talepler
          sarı, onaylılar yeşil görünür.
        </p>
      </div>

      <AppointmentCalendar
        inquiries={inquiries}
        blocked={blocked}
        initialYear={year}
        initialMonth={month}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Gün / saat kapat</h2>
          <p className="mt-1 text-xs text-muted">
            Tatil veya özel çekim için. Saat boş bırakılırsa tüm gün kapanır.
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
                placeholder="Tatil, özel etkinlik..."
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
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Kapalı slotlar</h2>
          <ul className="mt-4 space-y-2">
            {recentBlocks.length === 0 && (
              <li className="text-sm text-muted">Kayıt yok.</li>
            )}
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
      </div>
    </div>
  );
}
