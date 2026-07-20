import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedServices } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { MediaThumb } from "@/components/media/MediaThumb";

export const metadata: Metadata = {
  title: "Hizmetler / Services",
};

export const dynamic = "force-dynamic";

export default async function HizmetlerPage() {
  const [list, t] = await Promise.all([
    getPublishedServices(),
    getDictionary(),
  ]);

  return (
    <div className="py-12 sm:py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          description={t.services.desc}
        />
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {list.map((s) => (
            <Link
              key={s.id}
              href={`/hizmetler/${s.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-accent/40"
            >
              {s.coverUrl ? (
                <MediaThumb
                  src={s.coverUrl}
                  alt={s.title}
                  className="aspect-video w-full transition group-hover:opacity-95"
                  autoPlay
                  controls={false}
                />
              ) : (
                <MediaPlaceholder label={s.title} aspect="video" />
              )}
              <div className="p-5 sm:p-6">
                <h2 className="font-serif text-xl text-foreground group-hover:text-accent sm:text-2xl">
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {s.shortDesc}
                </p>
                <span className="mt-4 inline-block text-sm text-accent">
                  {t.services.detail} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
