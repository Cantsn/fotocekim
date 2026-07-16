import Link from "next/link";
import {
  categoryLabel,
  formatPrice,
  getFeaturedProjects,
  getPublishedPackages,
  getPublishedServices,
  getPublishedTestimonials,
  getSiteSettings,
} from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { cn } from "@/lib/utils";

const steps = [
  {
    n: "01",
    title: "İletişim",
    desc: "Form veya WhatsApp ile ulaşın; ihtiyacınızı dinleyelim.",
  },
  {
    n: "02",
    title: "Keşif",
    desc: "Tarih, lokasyon ve konsepti netleştirelim.",
  },
  {
    n: "03",
    title: "Çekim",
    desc: "Foto, video ve isteğe bağlı drone ile çekim günü.",
  },
  {
    n: "04",
    title: "Teslimat",
    desc: "Seçki, renk düzenleme ve online galeri teslimi.",
  },
];

export async function HeroSection() {
  const settings = await getSiteSettings();
  return (
    <section className="relative overflow-hidden">
      <MediaPlaceholder
        label="Hero görsel / video eklenecek"
        aspect="wide"
        className="min-h-[72vh] md:min-h-[78vh]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
      <Container className="absolute inset-x-0 bottom-0 pb-16 pt-32">
        <p className="mb-4 text-xs font-medium tracking-[0.25em] text-accent uppercase">
          Fotoğraf · Video · Drone
        </p>
        <h1 className="max-w-2xl font-serif text-4xl leading-[1.15] text-foreground sm:text-5xl md:text-6xl">
          {settings.tagline}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
          Düğünden ürüne, gökyüzünden detaya — tek stüdyo. Anılarınızı filmik bir dilde
          belgeleriz.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/portfolyo" size="lg">
            Portföyü incele
          </ButtonLink>
          <ButtonLink href="/randevu" variant="secondary" size="lg">
            Randevu / teklif
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export async function ServicesSection() {
  const list = (await getPublishedServices()).slice(0, 8);
  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Hizmetler"
          title="Her çekim için net bir dil"
          description="Düğün, dış çekim, ürün, dükkan ve drone — ihtiyacınıza göre ekip ve ekipman planlanır."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s) => (
            <Link
              key={s.id}
              href={`/hizmetler/${s.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-accent/50"
            >
              <MediaPlaceholder label={`${s.title} kapak`} aspect="video" icon={false} />
              <div className="p-5">
                <h3 className="font-serif text-xl text-foreground group-hover:text-accent">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.shortDesc}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href="/hizmetler" variant="secondary">
            Tüm hizmetler
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export async function FeaturedWorkSection() {
  const list = (await getFeaturedProjects()).slice(0, 6);
  return (
    <section className="border-y border-border bg-muted-bg py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Seçili çalışmalar"
          title="Portföyden kareler"
          description="Gerçek fotoğraflar yüklendiğinde burada görünecek. Şimdilik gri yer tutucular kullanılıyor."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <Link
              key={p.id}
              href={`/portfolyo/${p.slug}`}
              className={cn(
                "group overflow-hidden rounded-2xl border border-border bg-card",
                i === 0 && "sm:col-span-2 lg:col-span-2",
              )}
            >
              {p.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.coverUrl}
                  alt={p.title}
                  className={
                    i === 0
                      ? "aspect-[21/9] min-h-[240px] w-full object-cover"
                      : "aspect-video w-full object-cover"
                  }
                />
              ) : (
                <MediaPlaceholder
                  label={p.title}
                  aspect={i === 0 ? "wide" : "video"}
                  className={i === 0 ? "min-h-[240px]" : undefined}
                />
              )}
              <div className="flex items-end justify-between gap-3 p-5">
                <div>
                  <p className="text-xs tracking-wide text-accent uppercase">
                    {categoryLabel(p.category)}
                  </p>
                  <h3 className="mt-1 font-serif text-xl text-foreground group-hover:text-accent">
                    {p.title}
                  </h3>
                </div>
                {p.location && (
                  <span className="text-xs text-muted whitespace-nowrap">{p.location}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href="/portfolyo">Tüm portföy</ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Süreç"
          title="Dört net adım"
          description="İlk mesajdan teslimata kadar şeffaf ve sakin bir süreç."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <p className="font-serif text-3xl text-accent/80">{s.n}</p>
              <h3 className="mt-3 font-serif text-xl text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export async function PackagesPreviewSection() {
  const [list, settings] = await Promise.all([
    getPublishedPackages(),
    getSiteSettings(),
  ]);
  return (
    <section className="border-y border-border bg-muted-bg py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Paketler"
          title="Başlangıç seçenekleri"
          description={
            settings.showPrices
              ? "Fiyatlar başlangıç tutarıdır; nihai teklif kapsam ve lokasyona göre değişir."
              : "Detaylı teklif için iletişime geçin."
          }
          align="center"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {list.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-card p-7",
                pkg.highlight
                  ? "border-accent shadow-[0_0_0_1px_var(--accent)]"
                  : "border-border",
              )}
            >
              {pkg.highlight && (
                <span className="mb-3 w-fit rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                  En çok tercih
                </span>
              )}
              <h3 className="font-serif text-2xl text-foreground">{pkg.name}</h3>
              {settings.showPrices && (
                <p className="mt-3 text-lg text-accent">
                  {formatPrice(pkg.priceFrom, pkg.currency)}
                </p>
              )}
              <ul className="mt-6 flex-1 space-y-2.5">
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
                className="mt-8 w-full"
              >
                Teklif iste
              </ButtonLink>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted">
          * Drone uçuşları mevzuat ve hava koşullarına bağlıdır.
        </p>
      </Container>
    </section>
  );
}

export async function TestimonialsSection() {
  const list = await getPublishedTestimonials();
  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow="Referanslar" title="Müşterilerimizden" align="center" />
        <div className="grid gap-5 md:grid-cols-3">
          {list.map((t) => (
            <blockquote key={t.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-3 flex gap-0.5 text-accent" aria-label={`${t.rating} yıldız`}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted">&ldquo;{t.content}&rdquo;</p>
              <footer className="mt-5">
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                {t.role && <p className="text-xs text-muted">{t.role}</p>}
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function DroneBand() {
  return (
    <section className="border-y border-border">
      <div className="grid md:grid-cols-2">
        <MediaPlaceholder label="Drone görseli eklenecek" aspect="video" className="min-h-[280px]" />
        <div className="flex flex-col justify-center bg-card px-8 py-12 md:px-12">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
            Drone & ekipman
          </p>
          <h2 className="mt-3 font-serif text-3xl text-foreground">
            Yerden ve havadan tam kapsama
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Profesyonel gövde, sinematik lensler ve mevzuata uygun drone operasyonu ile
            düğün, mülk ve etkinliklerinize derinlik katın.
          </p>
          <div className="mt-6">
            <ButtonLink href="/hizmetler/drone" variant="secondary">
              Drone hizmeti
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="py-20 md:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-14 text-center sm:px-12">
          <MediaPlaceholder
            label="CTA arka plan"
            aspect="auto"
            className="absolute inset-0 opacity-30"
            icon={false}
          />
          <div className="relative z-10">
            <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
              Düğününüzü — veya markanızı — ölümsüzleştirelim
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-muted">
              Ücretsiz ön görüşme için yazın. Müsaitlik ve paket detaylarını birlikte netleştirelim.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/randevu" size="lg">
                Ücretsiz ön görüşme
              </ButtonLink>
              <ButtonLink href="/iletisim" variant="secondary" size="lg">
                İletişim
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
