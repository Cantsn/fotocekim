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

  return (
    <div>
      <div className="relative">
        <MediaPlaceholder
          label={`${service.title} kapak görseli`}
          aspect="wide"
          className="min-h-[42vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Container className="absolute inset-x-0 bottom-0 pb-10">
          <p className="text-xs tracking-[0.2em] text-accent uppercase">Hizmet</p>
          <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">
            {service.title}
          </h1>
          <p className="mt-3 max-w-xl text-muted">{service.shortDesc}</p>
        </Container>
      </div>

      <Container className="py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="space-y-5">
            {paragraphs.map((block, i) => {
              if (block.startsWith("- ")) {
                const items = block.split("\n").filter((l) => l.startsWith("- "));
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

            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <MediaPlaceholder
                  key={n}
                  label={`${service.title} örnek ${n}`}
                  aspect="video"
                />
              ))}
            </div>
          </article>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-serif text-2xl text-foreground">Bu hizmet için teklif al</h2>
            <p className="mt-2 mb-6 text-sm text-muted">
              Tarih ve beklentilerinizi yazın; size dönüş yapalım.
            </p>
            <InquiryForm source={`service:${service.slug}`} compact />
            <div className="mt-6 border-t border-border pt-6">
              <ButtonLink href="/paketler" variant="secondary" className="w-full">
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
