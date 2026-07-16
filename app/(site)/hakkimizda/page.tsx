import type { Metadata } from "next";
import { siteSettings } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${siteSettings.siteName} hikâyesi, yaklaşım ve ekipman.`,
};

export default function HakkimizdaPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Hakkımızda"
              title="Işık, an ve hikâye"
              description="Düğün gününden ürün vitrinine, stüdyo portreden drone’a — her projede sakin, filmik ve dürüst bir görsel dil ararız."
              className="mb-6"
            />
            <div className="space-y-4 text-sm leading-relaxed text-muted">
              <p>
                {siteSettings.siteName}, {siteSettings.city} merkezli bir fotoğraf ve video
                stüdyosudur. Amacımız sadece &ldquo;güzel kareler&rdquo; üretmek değil; günün
                ritmini ve markanızın karakterini doğru yansıtmak.
              </p>
              <p>
                Müşteri fotoğraflarını yayınlamadan önce izin alırız. Teslimat süreçlerini
                net konuşur, beklentiyi abartmadan yönetiriz.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/portfolyo">Portföy</ButtonLink>
              <ButtonLink href="/randevu" variant="secondary">
                Tanışalım
              </ButtonLink>
            </div>
          </div>
          <MediaPlaceholder label="Stüdyo / ekip fotoğrafı" aspect="square" className="rounded-2xl" />
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {[
            {
              t: "Filmik dil",
              d: "Doğal ışık, sakin yönlendirme, sinematik renk.",
            },
            {
              t: "Çok disiplin",
              d: "Foto, video ve drone aynı hikâyede bir arada.",
            },
            {
              t: "Şeffaf süreç",
              d: "Paket, teslimat ve fiyat netliği ön planda.",
            },
          ].map((item) => (
            <div key={item.t} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-serif text-xl text-foreground">{item.t}</h3>
              <p className="mt-2 text-sm text-muted">{item.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl border border-border bg-card p-8 md:p-10">
          <h2 className="font-serif text-2xl text-foreground">Ekipman (özet)</h2>
          <ul className="mt-5 grid gap-2 text-sm text-muted sm:grid-cols-2">
            <li>• Full-frame gövdeler</li>
            <li>• Prime & sinema lens seti</li>
            <li>• Profesyonel ışık / reflector</li>
            <li>• Stabilize video rig</li>
            <li>• Drone (izinli operasyon)</li>
            <li>• Yedek batarya & medya</li>
          </ul>
          <p className="mt-6 text-xs text-muted">
            Liste proje tipine göre değişir; marka adları teklifte detaylandırılır.
          </p>
        </div>
      </Container>
    </div>
  );
}
