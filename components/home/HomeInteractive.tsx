"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { HorizontalSlider } from "@/components/ui/Slider";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";

type PortfolioItem = {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  meta?: string;
  coverUrl?: string;
};

type TestimonialItem = {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  rating?: number;
};

export function HomeInteractive({
  mode,
  items,
}: {
  mode: "portfolio" | "testimonials";
  items: PortfolioItem[] | TestimonialItem[];
}) {
  if (mode === "portfolio") {
    const list = items as PortfolioItem[];
    return (
      <HorizontalSlider>
        {list.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            className="group block overflow-hidden rounded-2xl border border-border bg-card"
          >
            {p.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.coverUrl}
                alt={p.title}
                className="aspect-[4/3] w-full object-cover transition group-hover:opacity-90"
              />
            ) : (
              <MediaPlaceholder label={p.title} aspect="video" />
            )}
            <div className="p-4">
              <p className="text-[11px] tracking-wide text-accent uppercase">
                {p.subtitle}
              </p>
              <h3 className="mt-1 font-serif text-lg text-foreground group-hover:text-accent">
                {p.title}
              </h3>
              {p.meta && (
                <p className="mt-1 text-xs text-muted">{p.meta}</p>
              )}
            </div>
          </Link>
        ))}
      </HorizontalSlider>
    );
  }

  const list = items as TestimonialItem[];
  return (
    <HorizontalSlider>
      {list.map((t) => (
        <blockquote
          key={t.id}
          className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <div
            className="mb-3 flex gap-0.5 text-accent"
            aria-label={`${t.rating ?? 5} yıldız`}
          >
            {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="flex-1 text-sm leading-relaxed text-muted">
            &ldquo;{t.content}&rdquo;
          </p>
          <footer className="mt-5">
            <p className="text-sm font-medium text-foreground">{t.title}</p>
            {t.subtitle && (
              <p className="text-xs text-muted">{t.subtitle}</p>
            )}
          </footer>
        </blockquote>
      ))}
    </HorizontalSlider>
  );
}
