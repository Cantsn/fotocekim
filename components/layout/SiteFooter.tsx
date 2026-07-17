import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { Container } from "@/components/ui/Container";
import { whatsappUrl } from "@/lib/utils";

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 12s0-3.2-.4-4.6c-.2-.8-.9-1.4-1.7-1.6C18.5 5.4 12 5.4 12 5.4s-6.5 0-7.9.4c-.8.2-1.5.8-1.7 1.6C2 8.8 2 12 2 12s0 3.2.4 4.6c.2.8.9 1.4 1.7 1.6 1.4.4 7.9.4 7.9.4s6.5 0 7.9-.4c.8-.2 1.5-.8 1.7-1.6.4-1.4.4-4.6.4-4.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M10 9.5v5l4.5-2.5L10 9.5Z" fill="currentColor" />
    </svg>
  );
}

export async function SiteFooter() {
  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getDictionary(),
  ]);

  const explore = [
    { href: "/hizmetler", label: t.nav.services },
    { href: "/portfolyo", label: t.nav.portfolio },
    { href: "/paketler", label: t.nav.packages },
    { href: "/hakkimizda", label: t.nav.about },
  ];

  const support = [
    { href: "/sss", label: t.nav.faq },
    { href: "/iletisim", label: t.nav.contact },
    { href: "/randevu", label: t.nav.cta },
    { href: "/gizlilik", label: t.footer.privacy },
    { href: "/kullanim-kosullari", label: t.footer.terms },
  ];

  const socials = [
    settings.instagram
      ? {
          href: settings.instagram.startsWith("http")
            ? settings.instagram
            : `https://instagram.com/${settings.instagram.replace(/^@/, "")}`,
          label: "Instagram",
          Icon: IconInstagram,
        }
      : null,
    settings.youtube
      ? {
          href: settings.youtube.startsWith("http")
            ? settings.youtube
            : `https://youtube.com/${settings.youtube}`,
          label: "YouTube",
          Icon: IconYoutube,
        }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    Icon: typeof IconInstagram;
  }[];

  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-b from-muted-bg to-[#ebe4d8]">
      {/* Top CTA strip */}
      <div className="border-b border-border/70 bg-card/60">
        <Container className="flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center sm:py-7">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
              {t.footer.ctaKicker}
            </p>
            <p className="mt-1 font-serif text-xl text-foreground sm:text-2xl">
              {t.footer.ctaTitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/randevu"
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white transition hover:opacity-90"
            >
              {t.nav.cta}
            </Link>
            <a
              href={whatsappUrl(
                settings.whatsapp,
                "Merhaba, çekim hakkında bilgi almak istiyorum.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:border-accent"
            >
              {t.footer.whatsapp}
            </a>
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5 lg:col-span-4">
            <p className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
              {settings.siteName}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {settings.tagline || t.footer.brandBlurb}
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted transition hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore */}
          <div className="md:col-span-2 lg:col-span-2">
            <p className="text-xs font-medium tracking-[0.15em] text-accent uppercase">
              {t.footer.explore}
            </p>
            <ul className="mt-4 space-y-2.5">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support / legal */}
          <div className="md:col-span-2 lg:col-span-2">
            <p className="text-xs font-medium tracking-[0.15em] text-accent uppercase">
              {t.footer.support}
            </p>
            <ul className="mt-4 space-y-2.5">
              {support.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 lg:col-span-4">
            <p className="text-xs font-medium tracking-[0.15em] text-accent uppercase">
              {t.footer.contact}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {(settings.city || settings.address) && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    {settings.address
                      ? `${settings.address}${settings.city ? `, ${settings.city}` : ""}`
                      : settings.city}
                  </span>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2.5 transition hover:text-foreground"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-accent" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex items-center gap-2.5 transition hover:text-foreground"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-accent" />
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/80 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. {t.footer.rights}
          </p>
          <p className="text-muted/80">{t.footer.tag}</p>
        </div>
      </Container>
    </footer>
  );
}
