import type { Metadata } from "next";
import {
  formatPrice,
  getPublishedPackages,
  getSiteSettings,
} from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Paketler",
  description: "Essential, Premium ve Ultimate çekim paketleri.",
};

export const dynamic = "force-dynamic";

export default async function PaketlerPage() {
  const [list, settings] = await Promise.all([
    getPublishedPackages(),
    getSiteSettings(),
  ]);

  return (
    <div className="py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow="Paketler"
          title="Size uygun kapsam"
          description="Başlangıç fiyatlarıdır. Mesafe, süre, ekip ve drone kapsamına göre teklif netleşir."
          align="center"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {list.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-card p-8",
                pkg.highlight ? "border-accent" : "border-border",
              )}
            >
              {pkg.highlight && (
                <span className="mb-3 w-fit rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                  Önerilen
                </span>
              )}
              <h2 className="font-serif text-3xl text-foreground">{pkg.name}</h2>
              {settings.showPrices ? (
                <p className="mt-4 text-xl text-accent">
                  {formatPrice(pkg.priceFrom, pkg.currency)}
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted">Teklif üzerine</p>
              )}
              <ul className="mt-8 flex-1 space-y-3">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href="/randevu"
                variant={pkg.highlight ? "primary" : "secondary"}
                className="mt-10 w-full"
              >
                Bu paket için yaz
              </ButtonLink>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted">
          Listelenen tutarlar &ldquo;başlayan&rdquo; fiyatlardır; nihai teklif değişken olabilir.
          Drone uçuşları SHT-İHA kuralları ve hava koşullarına tabidir.
        </p>
      </Container>
    </div>
  );
}
