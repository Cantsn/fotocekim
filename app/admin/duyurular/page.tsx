import Link from "next/link";
import { Megaphone, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { guardAdminPage } from "@/lib/admin-guard";
import { getAllAnnouncements } from "@/lib/data";
import {
  deleteAnnouncementAction,
  toggleAnnouncementAction,
} from "@/lib/actions/admin";
import { formatDateDot } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDuyurularPage() {
  await guardAdminPage("settings");
  const list = await getAllAnnouncements();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl text-foreground sm:text-3xl">
            <Megaphone className="h-7 w-7 text-accent" />
            Duyurular / Kampanyalar
          </h1>
          <p className="mt-2 text-sm text-muted">
            Aktif duyuru ana sayfanın en üstünde bant olarak görünür. Aynı anda
            birden fazla aktifse en düşük sıradaki (veya en yeni) gösterilir.
          </p>
        </div>
        <Link
          href="/admin/duyurular/yeni"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni duyuru
        </Link>
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
            Henüz duyuru yok. Kampanya bandı eklemek için “Yeni duyuru”ya tıklayın.
          </p>
        )}
        {list.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium text-foreground">{a.title}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      a.active
                        ? "bg-success/15 text-success"
                        : "bg-muted-bg text-muted"
                    }`}
                  >
                    {a.active ? "Yayında" : "Kapalı"}
                  </span>
                  <span className="rounded-full bg-muted-bg px-2 py-0.5 text-[10px] text-muted">
                    {a.style}
                  </span>
                </div>
                {a.message && (
                  <p className="mt-1 text-sm text-muted line-clamp-2">
                    {a.message}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-muted">
                  Sıra: {a.order}
                  {a.startsAt || a.endsAt
                    ? ` · ${formatDateDot(a.startsAt)} – ${formatDateDot(a.endsAt)}`
                    : " · tarih sınırı yok"}
                  {a.linkUrl ? ` · link: ${a.linkUrl}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={toggleAnnouncementAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {a.active ? "Kapat" : "Aç"}
                  </button>
                </form>
                <Link
                  href={`/admin/duyurular/${a.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-accent"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Düzenle
                </Link>
                <form action={deleteAnnouncementAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Sil
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
