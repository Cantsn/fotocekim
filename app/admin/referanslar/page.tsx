import Link from "next/link";
import { MessageSquareQuote, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { guardAdminPage } from "@/lib/admin-guard";
import { getAllTestimonials } from "@/lib/data";
import {
  deleteTestimonialAction,
  toggleTestimonialAction,
} from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminReferanslarPage() {
  await guardAdminPage("settings");
  const list = await getAllTestimonials();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl text-foreground sm:text-3xl">
            <MessageSquareQuote className="h-7 w-7 text-accent" />
            Referanslar
          </h1>
          <p className="mt-2 text-sm text-muted">
            Ana sayfadaki müşteri yorumları. Yayındakiler sürekli kayan
            referans bandında görünür.
          </p>
        </div>
        <Link
          href="/admin/referanslar/yeni"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni referans
        </Link>
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
            Henüz referans yok. İlk yorumu eklemek için “Yeni referans”a
            tıklayın.
          </p>
        )}
        {list.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium text-foreground">{t.name}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      t.published
                        ? "bg-success/15 text-success"
                        : "bg-muted-bg text-muted"
                    }`}
                  >
                    {t.published ? "Yayında" : "Taslak"}
                  </span>
                  <span className="rounded-full bg-muted-bg px-2 py-0.5 text-[10px] text-muted">
                    {"★".repeat(t.rating)}
                    {"☆".repeat(Math.max(0, 5 - t.rating))}
                  </span>
                </div>
                {t.role && (
                  <p className="mt-0.5 text-xs text-muted">{t.role}</p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
                  {t.content}
                </p>
                <p className="mt-2 text-[11px] text-muted">Sıra: {t.order}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={toggleTestimonialAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {t.published ? "Gizle" : "Yayınla"}
                  </button>
                </form>
                <Link
                  href={`/admin/referanslar/${t.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-accent"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Düzenle
                </Link>
                <form action={deleteTestimonialAction}>
                  <input type="hidden" name="id" value={t.id} />
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
