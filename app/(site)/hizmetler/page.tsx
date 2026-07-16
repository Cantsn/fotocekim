import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedServices } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";

export const metadata: Metadata = {
  title: "Hizmetler",
  description:
    "Düğün, nişan, dış çekim, ürün, dükkan, drone, kurumsal ve portre çekim hizmetleri.",
};

export const dynamic = "force-dynamic";

export default async function HizmetlerPage() {
  const list = await getPublishedServices();

  return (
    <div className="py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow="Hizmetler"
          title="Neler yapıyoruz?"
          description="Her kategori için ayrı ekip planı, teslimat süreci ve paket seçenekleri sunuyoruz."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {list.map((s) => (
            <Link
              key={s.id}
              href={`/hizmetler/${s.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-accent/40"
            >
              <MediaPlaceholder label={`${s.title} görseli`} aspect="video" />
              <div className="p-6">
                <h2 className="font-serif text-2xl text-foreground group-hover:text-accent">
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.shortDesc}</p>
                <span className="mt-4 inline-block text-sm text-accent">Detay →</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
