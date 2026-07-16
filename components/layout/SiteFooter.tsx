import Link from "next/link";
import { siteSettings } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { whatsappUrl } from "@/lib/utils";

const links = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/portfolyo", label: "Portföy" },
  { href: "/paketler", label: "Paketler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/randevu", label: "Randevu / Teklif" },
];

const legal = [
  { href: "/gizlilik", label: "Gizlilik & KVKK" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted-bg">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-2xl text-foreground">{siteSettings.siteName}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {siteSettings.tagline} Düğün, dış çekim, ürün ve drone.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.15em] text-accent uppercase">
              Keşfet
            </p>
            <ul className="mt-4 space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.15em] text-accent uppercase">
              İletişim
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>{siteSettings.city}</li>
              <li>
                <a href={`tel:${siteSettings.phone.replace(/\s/g, "")}`} className="hover:text-foreground">
                  {siteSettings.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteSettings.email}`} className="hover:text-foreground">
                  {siteSettings.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl(siteSettings.whatsapp, "Merhaba, çekim hakkında bilgi almak istiyorum.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  WhatsApp yaz
                </a>
              </li>
            </ul>
            <div className="mt-5 flex gap-4 text-sm text-muted">
              <a href={siteSettings.instagram} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href={siteSettings.youtube} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteSettings.siteName}. Tüm hakları saklıdır.</p>
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
