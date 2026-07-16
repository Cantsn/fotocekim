import type { Metadata } from "next";
import Link from "next/link";
import {
  categoryLabel,
  getPublishedProjects,
  getPublishedServices,
} from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portföy",
  description: "Düğün, ürün, drone ve kurumsal çekim portföyü.",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ kategori?: string }> };

export default async function PortfolyoPage({ searchParams }: Props) {
  const { kategori } = await searchParams;
  const [projects, categories] = await Promise.all([
    getPublishedProjects(kategori),
    getPublishedServices(),
  ]);

  return (
    <div className="py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow="Portföy"
          title="Seçili projeler"
          description="Fotoğraflar yüklendiğinde burada görünecek. Şimdilik gri yer tutucular."
        />

        <div className="mb-10 flex flex-wrap gap-2">
          <FilterChip href="/portfolyo" active={!kategori} label="Tümü" />
          {categories.map((c) => (
            <FilterChip
              key={c.slug}
              href={`/portfolyo?kategori=${c.slug}`}
              active={kategori === c.slug}
              label={c.title}
            />
          ))}
        </div>

        {projects.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-10 text-center text-muted">
            Bu kategoride henüz proje yok.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/portfolyo/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card"
              >
                <MediaPlaceholder label={p.title} aspect="video" />
                <div className="p-5">
                  <p className="text-xs tracking-wide text-accent uppercase">
                    {categoryLabel(p.category)}
                  </p>
                  <h2 className="mt-1 font-serif text-xl text-foreground group-hover:text-accent">
                    {p.title}
                  </h2>
                  {p.location && (
                    <p className="mt-1 text-xs text-muted">{p.location}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-2 text-xs transition",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-border text-muted hover:border-accent/50 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
