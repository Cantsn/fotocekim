import Link from "next/link";
import { getPublishedServices } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminHizmetlerPage() {
  const list = await getPublishedServices();

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Hizmetler</h1>
      <p className="mt-2 text-sm text-muted">İçerik SQLite üzerinden okunuyor.</p>
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
                  <span className="text-xs text-success">Yayında</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/hizmetler/${s.slug}`}
                    className="text-xs text-accent hover:underline"
                  >
                    Görüntüle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
