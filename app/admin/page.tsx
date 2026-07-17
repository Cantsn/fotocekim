import Link from "next/link";
import {
  CalendarClock,
  Mail,
  Phone,
  User,
  ClipboardList,
} from "lucide-react";
import { guardAdminPage } from "@/lib/admin-guard";
import {
  getInquiries,
  getAllPackages,
  getAllProjects,
  getAllServices,
} from "@/lib/data";
import { can } from "@/lib/auth";
import { formatDateDot, formatDateTimeDot } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  NEW: "Yeni",
  READ: "Okundu",
  QUOTED: "Teklif",
  CONFIRMED: "Onay",
  CANCELLED: "İptal",
};

const statusStyle: Record<string, string> = {
  NEW: "bg-accent/15 text-accent",
  READ: "bg-muted-bg text-muted",
  QUOTED: "bg-amber-500/15 text-amber-700",
  CONFIRMED: "bg-success/15 text-success",
  CANCELLED: "bg-danger/10 text-danger",
};

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

  const recent = inquiries.slice(0, 6);

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
            <p className="text-xs tracking-wide text-muted uppercase">
              {s.label}
            </p>
            <p className="mt-2 font-serif text-3xl text-foreground">
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      {can(user, "inquiries") && (
        <div className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
                <ClipboardList className="h-5 w-5 text-accent" />
                Son randevular
              </h2>
              <p className="mt-1 text-xs text-muted">
                En son gelen talepler — detay için randevular sayfası
              </p>
            </div>
            <Link
              href="/admin/randevular"
              className="text-sm text-accent hover:underline"
            >
              Tümünü gör →
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
              Henüz talep yok.
            </p>
          ) : (
            <div className="space-y-3">
              {recent.map((i) => (
                <Link
                  key={i.id}
                  href="/admin/randevular"
                  className="block rounded-2xl border border-border bg-card p-4 transition hover:border-accent/40 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="flex items-center gap-1.5 font-medium text-foreground">
                          <User className="h-4 w-4 shrink-0 text-accent" />
                          {i.name}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            statusStyle[i.status] ?? statusStyle.READ
                          }`}
                        >
                          {statusLabel[i.status] ?? i.status}
                        </span>
                      </div>

                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-muted-bg/80 px-3 py-2">
                          <dt className="flex items-center gap-1 text-[10px] tracking-wide text-muted uppercase">
                            <CalendarClock className="h-3 w-3" />
                            Çekim tarihi
                          </dt>
                          <dd className="mt-0.5 font-medium text-foreground">
                            {i.eventDate
                              ? formatDateTimeDot(i.eventDate, i.eventTime)
                              : "—"}
                          </dd>
                        </div>
                        <div className="rounded-xl bg-muted-bg/80 px-3 py-2">
                          <dt className="flex items-center gap-1 text-[10px] tracking-wide text-muted uppercase">
                            <Phone className="h-3 w-3" />
                            Telefon
                          </dt>
                          <dd className="mt-0.5 font-medium text-foreground">
                            {i.phone || "—"}
                          </dd>
                        </div>
                        <div className="rounded-xl bg-muted-bg/80 px-3 py-2">
                          <dt className="flex items-center gap-1 text-[10px] tracking-wide text-muted uppercase">
                            <Mail className="h-3 w-3" />
                            E-posta
                          </dt>
                          <dd className="mt-0.5 truncate font-medium text-foreground">
                            {i.email || "—"}
                          </dd>
                        </div>
                        <div className="rounded-xl bg-muted-bg/80 px-3 py-2">
                          <dt className="text-[10px] tracking-wide text-muted uppercase">
                            Talep zamanı
                          </dt>
                          <dd className="mt-0.5 font-medium text-foreground">
                            {formatDateDot(i.createdAt)}
                          </dd>
                        </div>
                      </dl>

                      {i.message && (
                        <p className="mt-2 line-clamp-2 text-xs text-muted">
                          {i.message}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
