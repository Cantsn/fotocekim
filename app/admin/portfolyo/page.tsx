import Link from "next/link";
import { categoryLabel, getPublishedProjects } from "@/lib/data";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";

export const dynamic = "force-dynamic";

export default async function AdminPortfolyoPage() {
  const projects = await getPublishedProjects();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Portföy</h1>
          <p className="mt-2 text-sm text-muted">
            Veritabanındaki projeler. CRUD + foto yükleme sonraki adım.
          </p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          {projects.length} proje
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <MediaPlaceholder label={p.title} aspect="video" />
            <div className="p-4">
              <p className="text-xs text-accent uppercase">{categoryLabel(p.category)}</p>
              <h2 className="mt-1 font-serif text-lg text-foreground">{p.title}</h2>
              <p className="mt-1 text-xs text-muted">
                {p.published ? "Yayında" : "Taslak"}
                {p.featured ? " · Öne çıkan" : ""}
              </p>
              <Link
                href={`/portfolyo/${p.slug}`}
                className="mt-3 inline-block text-xs text-accent hover:underline"
              >
                Sitede gör →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
