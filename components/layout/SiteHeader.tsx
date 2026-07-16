"use client";

import Link from "next/link";
import { useState } from "react";
import { siteSettings } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

const nav = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/portfolyo", label: "Portföy" },
  { href: "/paketler", label: "Paketler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 shadow-sm shadow-stone-900/5 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-xl tracking-wide text-foreground">
          {siteSettings.siteName}
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Ana menü">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink href="/randevu" size="sm">
            Teklif Al
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menü</span>
          <div className="flex w-4 flex-col gap-1.5">
            <span
              className={cn(
                "h-px w-full bg-foreground transition",
                open && "translate-y-[3.5px] rotate-45",
              )}
            />
            <span
              className={cn(
                "h-px w-full bg-foreground transition",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "h-px w-full bg-foreground transition",
                open && "-translate-y-[3.5px] -rotate-45",
              )}
            />
          </div>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border bg-background md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Mobil menü">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-3 text-sm text-muted hover:bg-muted-bg hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div onClick={() => setOpen(false)}>
            <ButtonLink href="/randevu" className="mt-2 w-full">
              Teklif Al
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
