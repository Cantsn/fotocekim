import Link from "next/link";
import {
  CalendarDays,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { guardAdminPage } from "@/lib/admin-guard";
import { getInquiries } from "@/lib/data";
import {
  createManualAppointmentAction,
  deleteInquiryAction,
} from "@/lib/actions/availability";
import { InquiryStatusForm } from "@/components/admin/InquiryStatusForm";
import { formatDateDot, formatDateTimeDot } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  NEW: "Yeni",
  READ: "Okundu",
  QUOTED: "Teklif",
  CONFIRMED: "Onay",
  CANCELLED: "İptal",
};

const statusStyle: Record<string, string> = {
  NEW: "bg-accent/15 text-accent",
  READ: "bg-muted-bg text-muted",
  QUOTED: "bg-amber-500/15 text-amber-700",
  CONFIRMED: "bg-success/15 text-success",
  CANCELLED: "bg-danger/10 text-danger",
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

      {/* Liste — kart düzeni (mobil + masaüstü tutarlı) */}
      <div className="space-y-3">
        {inquiries.length === 0 && (
          <p className="rounded-2xl border border-border p-6 text-center text-sm text-muted">
            Kayıt yok
          </p>
        )}
        {inquiries.map((i) => (
          <div
            key={i.id}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <User className="h-4 w-4 shrink-0 text-accent" />
                  {i.name}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    statusStyle[i.status] ?? statusStyle.READ
                  }`}
                >
                  {statusLabel[i.status] ?? i.status}
                </span>
                {i.status === "CONFIRMED" && (
                  <span className="text-[10px] text-success">Slot kilitli</span>
                )}
              </div>
              <form action={deleteInquiryAction}>
                <input type="hidden" name="id" value={i.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-danger hover:bg-danger/5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Sil
                </button>
              </form>
            </div>

            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-muted-bg/80 px-3 py-2">
                <dt className="text-[10px] tracking-wide text-muted uppercase">
                  Çekim tarihi
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {i.eventDate
                    ? formatDateTimeDot(i.eventDate, i.eventTime)
                    : "—"}
                </dd>
              </div>
              <div className="rounded-xl bg-muted-bg/80 px-3 py-2">
                <dt className="flex items-center gap-1 text-[10px] tracking-wide text-muted uppercase">
                  <Phone className="h-3 w-3" />
                  Telefon
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {i.phone ? (
                    <a
                      href={`tel:${i.phone.replace(/\s/g, "")}`}
                      className="hover:text-accent"
                    >
                      {i.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="rounded-xl bg-muted-bg/80 px-3 py-2">
                <dt className="flex items-center gap-1 text-[10px] tracking-wide text-muted uppercase">
                  <Mail className="h-3 w-3" />
                  E-posta
                </dt>
                <dd className="mt-0.5 truncate font-medium text-foreground">
                  {i.email ? (
                    <a
                      href={`mailto:${i.email}`}
                      className="hover:text-accent"
                    >
                      {i.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="rounded-xl bg-muted-bg/80 px-3 py-2">
                <dt className="text-[10px] tracking-wide text-muted uppercase">
                  Talep zamanı
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {formatDateDot(i.createdAt)}
                </dd>
              </div>
            </dl>

            {(i.location || i.message) && (
              <div className="mt-2 space-y-1 text-xs text-muted">
                {i.location && <p>Lokasyon: {i.location}</p>}
                {i.message && (
                  <p className="line-clamp-3 text-muted">{i.message}</p>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <p className="text-[11px] text-muted">
                Tip: {i.type}
                {i.source ? ` · ${i.source}` : ""}
              </p>
              <InquiryStatusForm id={i.id} status={i.status} compact />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
