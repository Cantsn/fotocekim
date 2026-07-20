import Link from "next/link";
import { guardAdminPage } from "@/lib/admin-guard";
import { categoryLabel, getAllProjects } from "@/lib/data";
import { deleteProjectAction } from "@/lib/actions/admin";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { MediaThumb } from "@/components/media/MediaThumb";

export const dynamic = "force-dynamic";

export default async function AdminPortfolyoPage() {
  await guardAdminPage("portfolio");
  const projects = await getAllProjects();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Portföy</h1>
          <p className="mt-2 text-sm text-muted">
            Proje ekle, fotoğraf yükle, düzenle veya sil.
          </p>
        </div>
        <Link
          href="/admin/portfolyo/yeni"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background"
        >
          + Yeni proje
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            {p.coverUrl ? (
              <MediaThumb
                src={p.coverUrl}
                alt={p.title}
                className="aspect-video w-full"
                autoPlay
                controls={false}
              />
            ) : (
              <MediaPlaceholder label={p.title} aspect="video" />
            )}
            <div className="p-4">
              <p className="text-xs text-accent uppercase">{categoryLabel(p.category)}</p>
              <h2 className="mt-1 font-serif text-lg text-foreground">{p.title}</h2>
              <p className="mt-1 text-xs text-muted">
                {[p.clientName, p.location, p.plato].filter(Boolean).join(" · ") || "—"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {p.published ? "Yayında" : "Taslak"}
                {p.featured ? " · Öne çıkan" : ""} · {p.images.length} medya
              </p>
              <div className="mt-3 flex gap-3">
                <Link
                  href={`/admin/portfolyo/${p.id}`}
                  className="text-xs text-accent hover:underline"
                >
                  Düzenle
                </Link>
                <form action={deleteProjectAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-xs text-danger hover:underline">
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
