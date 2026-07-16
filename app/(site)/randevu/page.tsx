import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InquiryForm } from "@/components/forms/InquiryForm";

export const metadata: Metadata = {
  title: "Randevu / Booking",
};

export const dynamic = "force-dynamic";

export default async function RandevuPage() {
  const t = await getDictionary();
  return (
    <div className="py-12 sm:py-16 md:py-24">
      <Container className="max-w-2xl">
        <SectionHeading
          eyebrow={t.booking.eyebrow}
          title={t.booking.title}
          description={t.booking.desc}
          align="center"
        />
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-8">
          <InquiryForm source="randevu" />
        </div>
      </Container>
    </div>
  );
}
