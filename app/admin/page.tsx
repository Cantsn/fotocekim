import Link from "next/link";
import {
  getInquiries,
  getPublishedPackages,
  getPublishedProjects,
  getPublishedServices,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [services, projects, packages, inquiries] = await Promise.all([
    getPublishedServices(),
    getPublishedProjects(),
    getPublishedPackages(),
    getInquiries(),
  ]);

  const stats = [
    { label: "Hizmet", value: services.length, href: "/admin/hizmetler" },
    { label: "Proje", value: projects.length, href: "/admin/portfolyo" },
    { label: "Paket", value: packages.length, href: "/admin/paketler" },
    {
      label: "Yeni randevu",
      value: inquiries.filter((i) => i.status === "NEW").length,
      href: "/admin/randevular",
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        Veriler SQLite veritabanından geliyor. Fotoğraflar gri yer tutucu.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-border bg-card p-5 transition hover:border-accent/40"
          >
            <p className="text-xs tracking-wide text-muted uppercase">{s.label}</p>
            <p className="mt-2 font-serif text-3xl text-foreground">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Hızlı işlemler</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/admin/medya" className="text-accent hover:underline">
                Medya alanına git (placeholder)
              </Link>
            </li>
            <li>
              <Link href="/admin/randevular" className="text-accent hover:underline">
                Randevu taleplerini gör
              </Link>
            </li>
            <li>
              <Link href="/admin/ayarlar" className="text-accent hover:underline">
                Site ayarlarını incele
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Son randevular</h2>
          {inquiries.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Henüz talep yok. Public formdan test gönderisi yapın.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {inquiries.slice(0, 5).map((i) => (
                <li key={i.id} className="border-b border-border pb-3 text-sm last:border-0">
                  <p className="text-foreground">{i.name}</p>
                  <p className="text-xs text-muted">
                    {i.phone} · {i.status} ·{" "}
                    {new Date(i.createdAt).toLocaleString("tr-TR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
