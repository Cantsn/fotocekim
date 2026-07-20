import type { Metadata } from "next";
import { ExternalLink, MapPin } from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { whatsappUrl } from "@/lib/utils";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";

export const metadata: Metadata = {
  title: "İletişim / Contact",
};

export const dynamic = "force-dynamic";

export default async function IletisimPage() {
  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getDictionary(),
  ]);

  const mapEmbed = settings.mapEmbedUrl?.trim() || "";
  const mapLink =
    settings.mapLinkUrl?.trim() ||
    (settings.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [settings.address, settings.city].filter(Boolean).join(", "),
        )}`
      : "");

  return (
    <div className="py-12 sm:py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow={t.contact.eyebrow}
          title={t.contact.title}
          description={t.contact.desc}
        />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0 overflow-x-hidden rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8">
            <InquiryForm source="contact" />
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl text-foreground">
                {t.footer.contact}
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li>
                  <span className="text-foreground">Tel: </span>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="hover:text-accent"
                  >
                    {settings.phone}
                  </a>
                </li>
                <li>
                  <span className="text-foreground">E-mail: </span>
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-accent"
                  >
                    {settings.email}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappUrl(settings.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {t.footer.whatsapp}
                  </a>
                </li>
                {(settings.address || settings.city) && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>
                      {settings.address}
                      {settings.city
                        ? `${settings.address ? ", " : ""}${settings.city}`
                        : ""}
                    </span>
                  </li>
                )}
              </ul>
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Haritada aç / yol tarifi
                </a>
              )}
            </div>

            {mapEmbed ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <iframe
                  title="Konum haritası"
                  src={mapEmbed}
                  className="aspect-video min-h-[240px] w-full border-0 sm:min-h-[280px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <MediaPlaceholder
                label="Harita — Admin → Site ayarları’ndan ekleyin"
                aspect="video"
                className="rounded-2xl"
              />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
