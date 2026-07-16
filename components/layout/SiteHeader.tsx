"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarPlus, Menu, X } from "lucide-react";
import { siteSettings } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import {
  LanguageToggle,
  useLocale,
} from "@/components/i18n/LocaleProvider";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  const nav = [
    { href: "/hizmetler", label: t.nav.services },
    { href: "/portfolyo", label: t.nav.portfolio },
    { href: "/paketler", label: t.nav.packages },
    { href: "/hakkimizda", label: t.nav.about },
    { href: "/sss", label: t.nav.faq },
    { href: "/iletisim", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 shadow-sm shadow-stone-900/5 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 font-serif text-lg tracking-wide text-foreground sm:text-xl"
        >
          {siteSettings.siteName}
        </Link>

        <nav
          className="hidden items-center gap-5 lg:flex xl:gap-7"
          aria-label="Ana menü"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <ButtonLink href="/randevu" size="sm" className="hidden sm:inline-flex">
            <CalendarPlus className="h-4 w-4" />
            {t.nav.cta}
          </ButtonLink>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border bg-background lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3"
          aria-label="Mobil menü"
        >
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
          <div onClick={() => setOpen(false)} className="pt-1 pb-2">
            <ButtonLink href="/randevu" className="w-full">
              <CalendarPlus className="h-4 w-4" />
              {t.nav.cta}
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
