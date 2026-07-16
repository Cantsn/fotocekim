import type { Metadata } from "next";
import { siteSettings } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { whatsappUrl } from "@/lib/utils";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Teklif ve randevu için bize ulaşın.",
};

export default function IletisimPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow="İletişim"
          title="Konuşalım"
          description="Formu doldurun veya doğrudan WhatsApp’tan yazın. Genelde aynı gün dönüş yapıyoruz."
        />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <InquiryForm source="contact" />
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl text-foreground">İletişim bilgileri</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li>
                  <span className="text-foreground">Telefon: </span>
                  <a href={`tel:${siteSettings.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                    {siteSettings.phone}
                  </a>
                </li>
                <li>
                  <span className="text-foreground">E-posta: </span>
                  <a href={`mailto:${siteSettings.email}`} className="hover:text-accent">
                    {siteSettings.email}
                  </a>
                </li>
                <li>
                  <span className="text-foreground">WhatsApp: </span>
                  <a
                    href={whatsappUrl(siteSettings.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Mesaj gönder
                  </a>
                </li>
                <li>
                  <span className="text-foreground">Adres: </span>
                  {siteSettings.address}, {siteSettings.city}
                </li>
              </ul>
            </div>
            <MediaPlaceholder
              label="Harita / stüdyo görseli eklenecek"
              aspect="video"
              className="rounded-2xl"
            />
            <p className="text-xs text-muted">
              Randevu talepleriniz admin panelindeki &ldquo;Randevular&rdquo; listesine düşer
              (demo ortamında bellek içi saklanır).
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
