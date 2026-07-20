import type { Metadata } from "next";
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
                <li>
                  {settings.address}
                  {settings.city ? `, ${settings.city}` : ""}
                </li>
              </ul>
            </div>
            <MediaPlaceholder
              label="Map"
              aspect="video"
              className="rounded-2xl"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
