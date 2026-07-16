import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InquiryForm } from "@/components/forms/InquiryForm";

export const metadata: Metadata = {
  title: "Randevu / Teklif",
  description: "Çekim randevusu ve ücretsiz ön görüşme formu.",
};

export default function RandevuPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-2xl">
        <SectionHeading
          eyebrow="Randevu"
          title="Ücretsiz ön görüşme"
          description="Müsait tarih ve saati seçin. Admin onayından sonra slot kilitlenir; dolu saatler seçilemez."
          align="center"
        />
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <InquiryForm source="randevu" />
        </div>
      </Container>
    </div>
  );
}
