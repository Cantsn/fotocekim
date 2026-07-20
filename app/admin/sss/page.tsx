import Link from "next/link";
import { CircleHelp, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { guardAdminPage } from "@/lib/admin-guard";
import { getAllFaqs } from "@/lib/data";
import { deleteFaqAction, toggleFaqAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminSssPage() {
  await guardAdminPage("settings");
  const list = await getAllFaqs();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl text-foreground sm:text-3xl">
            <CircleHelp className="h-7 w-7 text-accent" />
            SSS
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sık sorulan sorular. Yayındakiler sitedeki /sss sayfasında görünür.
          </p>
        </div>
        <Link
          href="/admin/sss/yeni"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni soru
        </Link>
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
            Henüz SSS yok. İlk soruyu eklemek için “Yeni soru”ya tıklayın.
          </p>
        )}
        {list.map((f) => (
          <div
            key={f.id}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium text-foreground">{f.question}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      f.published
                        ? "bg-success/15 text-success"
                        : "bg-muted-bg text-muted"
                    }`}
                  >
                    {f.published ? "Yayında" : "Taslak"}
                  </span>
                  <span className="rounded-full bg-muted-bg px-2 py-0.5 text-[10px] text-muted">
                    Sıra: {f.order}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
                  {f.answer}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={toggleFaqAction}>
                  <input type="hidden" name="id" value={f.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {f.published ? "Gizle" : "Yayınla"}
                  </button>
                </form>
                <Link
                  href={`/admin/sss/${f.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-accent"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Düzenle
                </Link>
                <form action={deleteFaqAction}>
                  <input type="hidden" name="id" value={f.id} />
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
