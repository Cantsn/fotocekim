import type { Metadata } from "next";
import {
  Aperture,
  Camera,
  HeartHandshake,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { Container } from "@/components/ui/Container";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Hakkımızda / About",
};

export const dynamic = "force-dynamic";

const valueIcons = [Aperture, Camera, ShieldCheck, HeartHandshake];

export default async function HakkimizdaPage() {
  const [s, t] = await Promise.all([getSiteSettings(), getDictionary()]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-muted-bg via-background to-[#f3ebe0]" />
        <Container className="relative grid items-end gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
              {t.about.eyebrow}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
              {t.about.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {t.about.lead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/portfolyo">{t.about.portfolio}</ButtonLink>
              <ButtonLink href="/randevu" variant="secondary">
                {t.about.meet}
              </ButtonLink>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border shadow-xl shadow-stone-900/10">
              <MediaPlaceholder
                label="Studio"
                aspect="video"
                className="min-h-[240px]"
              />
            </div>
            <div className="absolute -bottom-4 -left-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:-left-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                {s.city || "Studio"}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <Container className="grid grid-cols-3 divide-x divide-border py-8 sm:py-10">
          {t.about.stats.map((st) => (
            <div key={st.l} className="px-2 text-center sm:px-6">
              <p className="font-serif text-2xl text-accent sm:text-4xl">{st.n}</p>
              <p className="mt-1 text-[11px] text-muted sm:text-sm">{st.l}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
              {t.about.storyTitle}
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
              <p>
                <strong className="text-foreground">{s.siteName}</strong>{" "}
                {t.about.p1}
              </p>
              <p>{t.about.p2}</p>
              <p>{t.about.story}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MediaPlaceholder
              label="1"
              aspect="portrait"
              className="rounded-2xl"
            />
            <div className="mt-8 space-y-3">
              <MediaPlaceholder
                label="2"
                aspect="square"
                className="rounded-2xl"
              />
              <MediaPlaceholder
                label="3"
                aspect="video"
                className="rounded-2xl"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-muted-bg py-16 sm:py-24">
        <Container>
          <h2 className="text-center font-serif text-3xl text-foreground sm:text-4xl">
            {t.about.valuesTitle}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.about.values.map((v, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <div
                  key={v.t}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl text-foreground">
                    {v.t}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{v.d}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Gear */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="grid lg:grid-cols-2">
              <div className="p-6 sm:p-10">
                <p className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-accent uppercase">
                  <Plane className="h-3.5 w-3.5" />
                  Kit
                </p>
                <h2 className="mt-3 font-serif text-3xl text-foreground">
                  {t.about.gearTitle}
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {t.about.gear.map((g) => (
                    <li
                      key={g}
                      className="flex items-center gap-2 text-sm text-muted"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {g}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-muted">{t.about.gearNote}</p>
              </div>
              <MediaPlaceholder
                label="Gear"
                aspect="video"
                className="min-h-[240px] lg:min-h-full"
              />
            </div>
          </div>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/randevu" size="lg">
              {t.cta.primary}
            </ButtonLink>
            <ButtonLink href="/portfolyo" variant="secondary" size="lg">
              {t.about.portfolio}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </div>
  );
}
