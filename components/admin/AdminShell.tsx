"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Images,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, type Permission } from "@/lib/permissions";
import { ThemeToggleButton } from "@/components/admin/AdminThemeProvider";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/admin": LayoutDashboard,
  "/admin/takvim": CalendarDays,
  "/admin/randevular": ClipboardList,
  "/admin/portfolyo": FolderOpen,
  "/admin/hizmetler": Images,
  "/admin/paketler": Package,
  "/admin/medya": Images,
  "/admin/ekip": Users,
  "/admin/ayarlar": Settings,
  "/admin/profil": UserCircle,
};

export function AdminShell({
  children,
  userName,
  permissions,
  isOwner,
}: {
  children: React.ReactNode;
  userName: string;
  permissions: Permission[];
  isOwner: boolean;
}) {
  const pathname = usePathname();

  const links = ADMIN_NAV.filter(
    (l) => isOwner || permissions.includes(l.permission),
  );

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-muted-bg md:flex md:flex-col">
        <div className="border-b border-border px-5 py-5">
          <p className="font-serif text-lg text-foreground">FotoCekim</p>
          <p className="text-xs text-muted">Admin · {userName || "Panel"}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map((l) => {
            const active = l.exact
              ? pathname === l.href
              : pathname.startsWith(l.href);
            const Icon = ICONS[l.href] ?? LayoutDashboard;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "inline-flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-card hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="border-t border-border p-3">
          <button
            type="submit"
            className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-muted hover:bg-card hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Çıkış yap
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-2 border-b border-border px-3 py-3 sm:px-4 md:flex-row md:items-center md:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((l) => {
              const Icon = ICONS[l.href] ?? LayoutDashboard;
              const active = l.exact
                ? pathname === l.href
                : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-muted",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {l.label}
                </Link>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeToggleButton />
            <Link
              href="/admin/profil"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
            >
              <UserCircle className="h-3.5 w-3.5" />
              Profil
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Site
            </Link>
          </div>
        </header>
        <div className="flex-1 px-3 py-6 sm:px-4 sm:py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
