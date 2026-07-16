"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, type Permission } from "@/lib/permissions";
import { ThemeToggleButton } from "@/components/admin/AdminThemeProvider";

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
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-card hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="border-t border-border p-3">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-muted hover:bg-card hover:text-foreground"
          >
            Çıkış yap
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 md:px-8">
          <div className="flex flex-wrap gap-2 md:hidden">
            {links.slice(0, 5).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggleButton />
            <Link href="/admin/profil" className="text-xs text-muted hover:text-accent">
              Profil
            </Link>
            <Link href="/" className="text-xs text-muted hover:text-accent">
              Siteyi gör →
            </Link>
          </div>
        </header>
        <div className="flex-1 px-4 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
