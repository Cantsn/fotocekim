import Link from "next/link";
import { guardAdminPage } from "@/lib/admin-guard";
import { getAllProjects } from "@/lib/data";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";

export const dynamic = "force-dynamic";

export default async function AdminMedyaPage() {
  await guardAdminPage("media");
  const projects = await getAllProjects();
  const images = projects.flatMap((p) =>
    [
      p.coverUrl
        ? { url: p.coverUrl, label: `${p.title} kapak`, id: `c-${p.id}` }
        : null,
      ...p.images.map((i) => ({
        url: i.url,
        label: p.title,
        id: i.id,
      })),
    ].filter(Boolean),
  ) as { url: string; label: string; id: string }[];

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Medya</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Yüklenen fotoğraflar portföy projelerine bağlıdır. Yeni fotoğraf eklemek için
        portföy düzenleme sayfasını kullanın.
      </p>
      <Link
        href="/admin/portfolyo"
        className="mt-4 inline-block text-sm text-accent hover:underline"
      >
        Portföye git →
      </Link>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {images.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <MediaPlaceholder key={i} label="Henüz medya yok" aspect="square" />
            ))
          : images.map((img) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-xl border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.label}
                  className="aspect-square w-full object-cover"
                />
                <p className="truncate px-2 py-2 text-xs text-muted">{img.label}</p>
              </div>
            ))}
      </div>
    </div>
  );
}
