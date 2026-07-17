import Link from "next/link";
import { guardAdminPage } from "@/lib/admin-guard";
import { getAllServices } from "@/lib/data";
import { deleteServiceAction } from "@/lib/actions/admin";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";

export const dynamic = "force-dynamic";

export default async function AdminHizmetlerPage() {
  await guardAdminPage("services");
  const list = await getAllServices();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Hizmetler</h1>
          <p className="mt-2 text-sm text-muted">
            Ekle, düzenle, sil — her hizmette kapak ve galeri görselleri.
          </p>
        </div>
        <Link
          href="/admin/hizmetler/yeni"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background"
        >
          + Yeni hizmet
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.length === 0 && (
          <p className="col-span-full rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
            Henüz hizmet yok.
          </p>
        )}
        {list.map((s) => (
          <div
            key={s.id}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {s.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.coverUrl}
                alt={s.title}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <MediaPlaceholder label="Görsel yok" aspect="video" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-medium text-foreground">{s.title}</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    /{s.slug} · {s.images.length} galeri
                    {s.published ? " · Yayında" : " · Taslak"}
                  </p>
                </div>
                <span className="text-[11px] text-muted">#{s.order}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={`/admin/hizmetler/${s.id}`}
                  className="text-xs text-accent hover:underline"
                >
                  Düzenle / görseller
                </Link>
                <form action={deleteServiceAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="text-xs text-danger hover:underline"
                  >
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
