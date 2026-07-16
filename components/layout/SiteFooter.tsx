import Link from "next/link";
import { getSiteSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { Container } from "@/components/ui/Container";
import { whatsappUrl } from "@/lib/utils";

export async function SiteFooter() {
  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getDictionary(),
  ]);

  const links = [
    { href: "/hizmetler", label: t.nav.services },
    { href: "/portfolyo", label: t.nav.portfolio },
    { href: "/paketler", label: t.nav.packages },
    { href: "/hakkimizda", label: t.nav.about },
    { href: "/sss", label: t.nav.faq },
    { href: "/iletisim", label: t.nav.contact },
    { href: "/randevu", label: t.nav.cta },
  ];

  const legal = [
    { href: "/gizlilik", label: t.footer.privacy },
    { href: "/kullanim-kosullari", label: t.footer.terms },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-muted-bg">
      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-2xl text-foreground">
              {settings.siteName}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {settings.tagline}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.15em] text-accent uppercase">
              {t.footer.explore}
            </p>
            <ul className="mt-4 space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.15em] text-accent uppercase">
              {t.footer.contact}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>{settings.city}</li>
              <li>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="hover:text-foreground"
                >
                  {settings.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-foreground"
                >
                  {settings.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl(
                    settings.whatsapp,
                    "Merhaba, çekim hakkında bilgi almak istiyorum.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {t.footer.whatsapp}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. {t.footer.rights}
          </p>
          <div className="flex gap-4">
            {legal.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
