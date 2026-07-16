import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categoryLabel,
  getProjectBySlug,
  getPublishedProjects,
} from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Proje bulunamadı" };
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div>
      <div className="relative">
        <MediaPlaceholder
          label={`${project.title} kapak`}
          aspect="wide"
          className="min-h-[48vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <Container className="absolute inset-x-0 bottom-0 pb-10">
          <p className="text-xs tracking-[0.2em] text-accent uppercase">
            {categoryLabel(project.category)}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">
            {project.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
            {project.location && <span>{project.location}</span>}
            {project.date && (
              <span>
                {new Date(project.date).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            )}
            {project.clientName && <span>{project.clientName}</span>}
          </div>
        </Container>
      </div>

      <Container className="py-14">
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          {project.description}
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: project.galleryCount }).map((_, i) => (
            <MediaPlaceholder
              key={i}
              label={`Galeri ${i + 1} — yüklenecek`}
              aspect={i % 5 === 0 ? "portrait" : "video"}
            />
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-10">
          <Link href="/portfolyo" className="text-sm text-muted hover:text-foreground">
            ← Portföye dön
          </Link>
          <ButtonLink href="/randevu">Benzer bir çekim planla</ButtonLink>
        </div>
      </Container>
    </div>
  );
}
