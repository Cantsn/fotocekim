import Link from "next/link";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { guardAdminPage } from "@/lib/admin-guard";
import { getInquiries } from "@/lib/data";
import { updateInquiryStatusAction } from "@/lib/actions/admin";
import {
  createManualAppointmentAction,
  deleteInquiryAction,
} from "@/lib/actions/availability";
import { formatDateDot, formatDateTimeDot } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  NEW: "Yeni",
  READ: "Okundu",
  QUOTED: "Teklif",
  CONFIRMED: "Onay",
  CANCELLED: "İptal",
};

export default async function AdminRandevularPage() {
  await guardAdminPage("inquiries");
  const inquiries = await getInquiries();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl">
            Randevular
          </h1>
          <p className="mt-2 text-sm text-muted">
            Onay = slot kilitlenir. Telefon / bireysel talepleri manuel ekleyin.
          </p>
        </div>
        <Link
          href="/admin/takvim"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-accent"
        >
          <CalendarDays className="h-4 w-4" />
          Takvim
        </Link>
      </div>

      {/* Manuel randevu */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg text-foreground sm:text-xl">
          <Plus className="h-5 w-5 text-accent" />
          Manuel randevu ekle
        </h2>
        <form
          action={createManualAppointmentAction}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <label className="block text-xs text-muted">
            Ad soyad *
            <input
              name="name"
              required
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-muted">
            Telefon *
            <input
              name="phone"
              required
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-muted">
            E-posta
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-muted">
            Tarih *
            <input
              name="eventDate"
              type="date"
              required
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-muted">
            Saat *
            <input
              name="eventTime"
              type="time"
              required
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-muted">
            Durum
            <select
              name="status"
              defaultValue="CONFIRMED"
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
            >
              <option value="CONFIRMED">Onay (slot kilitler)</option>
              <option value="NEW">Yeni / bekleyen</option>
              <option value="QUOTED">Teklif</option>
            </select>
          </label>
          <label className="block text-xs text-muted">
            Tip
            <select
              name="type"
              defaultValue="OTHER"
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
            >
              <option value="WEDDING">Düğün</option>
              <option value="PRODUCT">Ürün</option>
              <option value="DRONE">Drone</option>
              <option value="CORPORATE">Kurumsal</option>
              <option value="OTHER">Diğer</option>
            </select>
          </label>
          <label className="block text-xs text-muted sm:col-span-2">
            Lokasyon
            <input
              name="location"
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-muted sm:col-span-2 lg:col-span-3">
            Not
            <input
              name="message"
              placeholder="Telefon ile alındı..."
              className="mt-1 w-full rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm"
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* Liste — mobil kart + desktop tablo */}
      <div className="space-y-3 md:hidden">
        {inquiries.length === 0 && (
          <p className="rounded-2xl border border-border p-6 text-center text-sm text-muted">
            Kayıt yok
          </p>
        )}
        {inquiries.map((i) => (
          <div
            key={i.id}
            className="rounded-2xl border border-border bg-card p-4 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{i.name}</p>
                <p className="text-xs text-muted">{i.phone}</p>
              </div>
              <form action={deleteInquiryAction}>
                <input type="hidden" name="id" value={i.id} />
                <button
                  type="submit"
                  className="rounded-full border border-border p-2 text-danger"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
            <p className="mt-2 text-foreground">
              {formatDateTimeDot(i.eventDate, i.eventTime)}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-muted">{i.message}</p>
            <form
              action={updateInquiryStatusAction}
              className="mt-3 flex items-center gap-2"
            >
              <input type="hidden" name="id" value={i.id} />
              <select
                name="status"
                defaultValue={i.status}
                className="flex-1 rounded-lg border border-border bg-muted-bg px-2 py-1.5 text-xs"
              >
                {Object.entries(statusLabel).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <button type="submit" className="text-xs text-accent">
                Kaydet
              </button>
            </form>
            <p className="mt-2 text-[10px] text-muted">
              Talep: {formatDateDot(i.createdAt)}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted-bg text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Müşteri</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Talep</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {inquiries.map((i) => (
              <tr key={i.id} className="border-t border-border align-top">
                <td className="px-4 py-3">
                  <p className="text-foreground">{i.name}</p>
                  <p className="text-xs text-muted">{i.phone}</p>
                  <p className="mt-1 max-w-xs text-xs text-muted line-clamp-2">
                    {i.message}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDateTimeDot(i.eventDate, i.eventTime)}
                  {i.status === "CONFIRMED" && (
                    <span className="mt-1 block text-[10px] text-success">
                      Kilitli
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <form
                    action={updateInquiryStatusAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={i.id} />
                    <select
                      name="status"
                      defaultValue={i.status}
                      className="rounded-lg border border-border bg-muted-bg px-2 py-1 text-xs"
                    >
                      {Object.entries(statusLabel).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="text-xs text-accent">
                      Kaydet
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">
                  {formatDateDot(i.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <form action={deleteInquiryAction}>
                    <input type="hidden" name="id" value={i.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 text-xs text-danger hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Sil
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
