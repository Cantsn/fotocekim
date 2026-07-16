import Link from "next/link";
import { guardAdminPage } from "@/lib/admin-guard";
import { getAllServices } from "@/lib/data";
import { deleteServiceAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminHizmetlerPage() {
  await guardAdminPage("services");
  const list = await getAllServices();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Hizmetler</h1>
          <p className="mt-2 text-sm text-muted">Ekle, düzenle, sil, yayınla.</p>
        </div>
        <Link
          href="/admin/hizmetler/yeni"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background"
        >
          + Yeni hizmet
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted-bg text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted">{s.order}</td>
                <td className="px-4 py-3 text-foreground">{s.title}</td>
                <td className="px-4 py-3 text-muted">{s.slug}</td>
                <td className="px-4 py-3">
                  <span className={s.published ? "text-success" : "text-muted"}>
                    {s.published ? "Yayında" : "Taslak"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/hizmetler/${s.id}`}
                      className="text-xs text-accent hover:underline"
                    >
                      Düzenle
                    </Link>
                    <form action={deleteServiceAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="text-xs text-danger hover:underline">
                        Sil
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
