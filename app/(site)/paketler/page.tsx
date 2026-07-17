import type { Metadata } from "next";
import { getPublishedPackages, getSiteSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageCard } from "@/components/packages/PackageCard";

export const metadata: Metadata = {
  title: "Paketler / Packages",
};

export const dynamic = "force-dynamic";

export default async function PaketlerPage() {
  const [list, settings, t] = await Promise.all([
    getPublishedPackages(),
    getSiteSettings(),
    getDictionary(),
  ]);

  return (
    <div className="py-12 sm:py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow={t.packages.eyebrow}
          title={t.packages.title}
          description={
            settings.showPrices ? t.packages.priceNote : t.packages.quoteOnly
          }
          align="center"
        />
        <div className="mx-auto grid max-w-5xl gap-5 sm:gap-6 lg:grid-cols-3">
          {list.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              showPrices={settings.showPrices}
              recommendedLabel={t.packages.recommended}
              ctaLabel={t.packages.request}
              size="large"
            />
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted">
          Listelenen tutarlar &ldquo;başlayan&rdquo; fiyatlardır; nihai teklif
          değişken olabilir. Drone uçuşları SHT-İHA kuralları ve hava koşullarına
          tabidir.
        </p>
      </Container>
    </div>
  );
}
