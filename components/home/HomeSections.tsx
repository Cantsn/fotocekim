import Link from "next/link";
import {
  Camera,
  Clapperboard,
  Package,
  Plane,
  Sparkles,
  Star,
} from "lucide-react";
import {
  categoryLabel,
  formatPrice,
  getFeaturedProjects,
  getPublishedPackages,
  getPublishedServices,
  getPublishedTestimonials,
  getSiteSettings,
} from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { HomeInteractive } from "@/components/home/HomeInteractive";
import { cn } from "@/lib/utils";

export async function HeroSection() {
  const [settings, t] = await Promise.all([getSiteSettings(), getDictionary()]);
  return (
    <section className="relative overflow-hidden">
      <MediaPlaceholder
        label="Hero"
        aspect="wide"
        className="min-h-[70vh] sm:min-h-[72vh] md:min-h-[78vh]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
      <Container className="absolute inset-x-0 bottom-0 pb-12 pt-28 sm:pb-16 sm:pt-32">
        <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-accent uppercase sm:mb-4">
          <Camera className="h-3.5 w-3.5" />
          {t.hero.kicker}
        </p>
        <h1 className="max-w-2xl font-serif text-3xl leading-[1.15] text-foreground sm:text-5xl md:text-6xl">
          {settings.tagline}
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted sm:mt-5 sm:text-lg">
          {t.hero.sub}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
          <ButtonLink href="/portfolyo" size="lg" className="w-full sm:w-auto">
            {t.hero.portfolio}
          </ButtonLink>
          <ButtonLink
            href="/randevu"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            {t.hero.book}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

const serviceIcons = [
  Camera,
  Sparkles,
  Clapperboard,
  Package,
  Package,
  Plane,
  Star,
  Camera,
];

export async function ServicesSection() {
  const [list, t] = await Promise.all([
    getPublishedServices(),
    getDictionary(),
  ]);
  const items = list.slice(0, 8);
  return (
    <section className="py-14 sm:py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          description={t.services.desc}
        />
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {items.map((s, i) => {
            const Icon = serviceIcons[i % serviceIcons.length];
            return (
              <Link
                key={s.id}
                href={`/hizmetler/${s.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-accent/50"
              >
                <MediaPlaceholder label={s.title} aspect="video" icon={false} />
                <div className="p-4 sm:p-5">
                  <div className="mb-2 flex items-center gap-2 text-accent">
                    <Icon className="h-4 w-4 shrink-0" />
                    <h3 className="font-serif text-lg text-foreground group-hover:text-accent sm:text-xl">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">{s.shortDesc}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 sm:mt-10">
          <ButtonLink href="/hizmetler" variant="secondary">
            {t.services.all}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export async function FeaturedWorkSection() {
  const [list, t] = await Promise.all([
    getFeaturedProjects(),
    getDictionary(),
  ]);
  return (
    <section className="border-y border-border bg-muted-bg py-14 sm:py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow={t.featured.eyebrow}
          title={t.featured.title}
        />
        <HomeInteractive
          mode="portfolio"
          items={list.slice(0, 8).map((p) => ({
            id: p.id,
            href: `/portfolyo/${p.slug}`,
            title: p.title,
            subtitle: categoryLabel(p.category),
            meta: p.location,
            coverUrl: p.coverUrl,
          }))}
        />
        <div className="mt-8 sm:mt-10">
          <ButtonLink href="/portfolyo">{t.featured.all}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export async function ProcessSection() {
  const t = await getDictionary();
  return (
    <section className="py-14 sm:py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow={t.process.eyebrow}
          title={t.process.title}
          description={t.process.desc}
        />
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {t.process.steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <p className="font-serif text-2xl text-accent/80 sm:text-3xl">{s.n}</p>
              <h3 className="mt-2 font-serif text-lg text-foreground sm:mt-3 sm:text-xl">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export async function PackagesPreviewSection() {
  const [list, settings, t] = await Promise.all([
    getPublishedPackages(),
    getSiteSettings(),
    getDictionary(),
  ]);
  return (
    <section className="border-y border-border bg-muted-bg py-14 sm:py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow={t.packages.eyebrow}
          title={t.packages.title}
          description={
            settings.showPrices ? t.packages.priceNote : t.packages.quoteOnly
          }
          align="center"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {list.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-card p-5 sm:p-7",
                pkg.highlight
                  ? "border-accent shadow-[0_0_0_1px_var(--accent)]"
                  : "border-border",
              )}
            >
              {pkg.highlight && (
                <span className="mb-3 w-fit rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                  {t.packages.recommended}
                </span>
              )}
              <h3 className="font-serif text-xl text-foreground sm:text-2xl">
                {pkg.name}
              </h3>
              {settings.showPrices && (
                <p className="mt-2 text-lg text-accent sm:mt-3">
                  {formatPrice(pkg.priceFrom, pkg.currency)}
                </p>
              )}
              <ul className="mt-5 flex-1 space-y-2 sm:mt-6">
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
                className="mt-6 w-full sm:mt-8"
              >
                {t.packages.request}
              </ButtonLink>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export async function TestimonialsSection() {
  const [list, t] = await Promise.all([
    getPublishedTestimonials(),
    getDictionary(),
  ]);
  return (
    <section className="py-14 sm:py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow={t.testimonials.eyebrow}
          title={t.testimonials.title}
          align="center"
        />
        <HomeInteractive
          mode="testimonials"
          items={list.map((item) => ({
            id: item.id,
            title: item.name,
            subtitle: item.role,
            content: item.content,
            rating: item.rating,
          }))}
        />
      </Container>
    </section>
  );
}

export async function DroneBand() {
  const t = await getDictionary();
  return (
    <section className="border-y border-border">
      <div className="grid md:grid-cols-2">
        <MediaPlaceholder
          label="Drone"
          aspect="video"
          className="min-h-[220px] md:min-h-[280px]"
        />
        <div className="flex flex-col justify-center bg-card px-5 py-10 sm:px-8 md:px-12">
          <p className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-accent uppercase">
            <Plane className="h-3.5 w-3.5" />
            {t.drone.kicker}
          </p>
          <h2 className="mt-3 font-serif text-2xl text-foreground sm:text-3xl">
            {t.drone.title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            {t.drone.desc}
          </p>
          <div className="mt-5 sm:mt-6">
            <ButtonLink href="/hizmetler/drone" variant="secondary">
              {t.drone.cta}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function CtaBand() {
  const t = await getDictionary();
  return (
    <section className="py-14 sm:py-20 md:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#1c1917] via-[#2a241c] to-[#3d3224] px-5 py-12 text-center text-[#faf7f2] sm:px-10 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #c4a57455, transparent 45%), radial-gradient(circle at 80% 70%, #c4a57433, transparent 40%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] tracking-wide text-[#e8dcc8] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              {t.cta.badge}
            </span>
            <h2 className="mt-5 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
              {t.cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#d6cbb8] sm:text-base">
              {t.cta.desc}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink
                href="/randevu"
                size="lg"
                className="w-full border-0 bg-[#c4a574] text-[#1c1917] hover:bg-[#d4b88a] sm:w-auto"
              >
                {t.cta.primary}
              </ButtonLink>
              <ButtonLink
                href="/iletisim"
                variant="secondary"
                size="lg"
                className="w-full border-white/25 bg-transparent text-[#faf7f2] hover:border-[#c4a574] hover:text-[#c4a574] sm:w-auto"
              >
                {t.cta.secondary}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
