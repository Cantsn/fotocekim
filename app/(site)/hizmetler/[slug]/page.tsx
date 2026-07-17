import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedServices, getServiceBySlug } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { InquiryForm } from "@/components/forms/InquiryForm";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const services = await getPublishedServices();
    return services.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Hizmet bulunamadı" };
  return {
    title: service.title,
    description: service.shortDesc,
  };
}

export default async function HizmetDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const paragraphs = service.content.split("\n\n");
  const gallery = service.images;

  return (
    <div>
      <div className="relative">
        {service.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.coverUrl}
            alt={service.title}
            className="min-h-[36vh] w-full object-cover aspect-[21/9] sm:min-h-[42vh]"
          />
        ) : (
          <MediaPlaceholder
            label={`${service.title} kapak görseli`}
            aspect="wide"
            className="min-h-[36vh] sm:min-h-[42vh]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Container className="absolute inset-x-0 bottom-0 pb-8 sm:pb-10">
          <p className="text-xs tracking-[0.2em] text-accent uppercase">
            Hizmet
          </p>
          <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl md:text-5xl">
            {service.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted sm:mt-3 sm:text-base">
            {service.shortDesc}
          </p>
        </Container>
      </div>

      <Container className="py-10 sm:py-14 md:py-20">
        <div className="grid min-w-0 gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,22rem)] xl:items-start xl:gap-12">
          <article className="min-w-0 space-y-5">
            {paragraphs.map((block, i) => {
              if (block.startsWith("- ")) {
                const items = block
                  .split("\n")
                  .filter((l) => l.startsWith("- "));
                return (
                  <ul key={i} className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-muted">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item.replace(/^- /, "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.startsWith("**")) {
                return (
                  <p
                    key={i}
                    className="rounded-xl border border-border bg-card p-4 text-sm text-muted"
                  >
                    {block.replace(/\*\*/g, "")}
                  </p>
                );
              }
              return (
                <p key={i} className="text-base leading-relaxed text-muted">
                  {block}
                </p>
              );
            })}

            {(gallery.length > 0 || !service.coverUrl) && (
              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                {gallery.length > 0
                  ? gallery.map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img.id}
                        src={img.url}
                        alt={img.alt || service.title}
                        className="aspect-video w-full rounded-xl object-cover"
                      />
                    ))
                  : [1, 2, 3, 4].map((n) => (
                      <MediaPlaceholder
                        key={n}
                        label={`${service.title} örnek ${n}`}
                        aspect="video"
                      />
                    ))}
              </div>
            )}
          </article>

          <aside className="min-w-0 w-full max-w-full rounded-2xl border border-border bg-card p-4 sm:p-5 xl:sticky xl:top-24 xl:max-w-[22rem]">
            <h2 className="font-serif text-xl text-foreground sm:text-2xl">
              Bu hizmet için teklif al
            </h2>
            <p className="mt-2 mb-4 text-sm text-muted">
              Tarih ve beklentilerinizi yazın; size dönüş yapalım.
            </p>
            <div className="min-w-0 overflow-x-hidden">
              <InquiryForm source={`service:${service.slug}`} compact />
            </div>
            <div className="mt-5 border-t border-border pt-5">
              <ButtonLink
                href="/paketler"
                variant="secondary"
                className="w-full"
              >
                Paketleri gör
              </ButtonLink>
              <p className="mt-4 text-center text-xs text-muted">
                <Link href="/hizmetler" className="hover:text-foreground">
                  ← Tüm hizmetler
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
