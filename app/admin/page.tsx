import Link from "next/link";
import { guardAdminPage } from "@/lib/admin-guard";
import {
  getInquiries,
  getAllPackages,
  getAllProjects,
  getAllServices,
} from "@/lib/data";
import { can } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await guardAdminPage("dashboard");
  const [services, projects, packages, inquiries] = await Promise.all([
    can(user, "services") ? getAllServices() : Promise.resolve([]),
    can(user, "portfolio") ? getAllProjects() : Promise.resolve([]),
    can(user, "packages") ? getAllPackages() : Promise.resolve([]),
    can(user, "inquiries") ? getInquiries() : Promise.resolve([]),
  ]);

  const stats = [
    can(user, "services") && {
      label: "Hizmet",
      value: services.length,
      href: "/admin/hizmetler",
    },
    can(user, "portfolio") && {
      label: "Proje",
      value: projects.length,
      href: "/admin/portfolyo",
    },
    can(user, "packages") && {
      label: "Paket",
      value: packages.length,
      href: "/admin/paketler",
    },
    can(user, "inquiries") && {
      label: "Yeni randevu",
      value: inquiries.filter((i) => i.status === "NEW").length,
      href: "/admin/randevular",
    },
  ].filter(Boolean) as { label: string; value: number; href: string }[];

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        Merhaba {user.name || user.email}. Yetkilerinize göre özet aşağıda.
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

      {can(user, "inquiries") && (
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Son randevular</h2>
          {inquiries.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Henüz talep yok.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {inquiries.slice(0, 5).map((i) => (
                <li
                  key={i.id}
                  className="border-b border-border pb-3 text-sm last:border-0"
                >
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
      )}
    </div>
  );
}
