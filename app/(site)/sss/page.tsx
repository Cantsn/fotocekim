import type { Metadata } from "next";
import { getPublishedFaqs } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description: "Rezervasyon, teslimat, drone ve fiyat hakkında SSS.",
};

export const dynamic = "force-dynamic";

export default async function SssPage() {
  const faqs = await getPublishedFaqs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <div className="py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container>
        <SectionHeading
          eyebrow="SSS"
          title="Merak edilenler"
          description="Aklınıza takılan başka bir şey varsa formu veya WhatsApp’ı kullanın."
        />
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
              Henüz yayınlanmış soru yok. Bizimle iletişime geçebilirsiniz.
            </p>
          ) : (
            faqs.map((f) => (
              <details
                key={f.id}
                className="group rounded-2xl border border-border bg-card px-5 py-4 open:border-accent/40"
              >
                <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-start justify-between gap-4">
                    <span>{f.question}</span>
                    <span className="text-accent transition group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {f.answer}
                </p>
              </details>
            ))
          )}
        </div>
        <div className="mt-12 text-center">
          <ButtonLink href="/iletisim">Hâlâ sorunuz mu var?</ButtonLink>
        </div>
      </Container>
    </div>
  );
}
