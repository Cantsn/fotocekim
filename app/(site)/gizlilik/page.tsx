import type { Metadata } from "next";
import { siteSettings } from "@/lib/data";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK",
};

export default function GizlilikPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="prose-invert max-w-3xl">
        <h1 className="font-serif text-4xl text-foreground">Gizlilik ve KVKK</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Bu metin bilgilendirme amaçlı bir taslaktır. Canlıya almadan önce avukatınızla
          güncelleyin. {siteSettings.siteName} olarak 6698 sayılı KVKK kapsamında kişisel
          verilerinizi yalnızca iletişim, teklif ve sözleşme süreçleri için işleriz.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-foreground">Toplanan veriler</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>Ad soyad, telefon, e-posta</li>
          <li>Çekim tarihi, lokasyon ve mesaj içeriği</li>
          <li>Teknik loglar (IP, tarayıcı — sunucu güvenliği için)</li>
        </ul>
        <h2 className="mt-10 font-serif text-2xl text-foreground">Haklarınız</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Verilerinize erişim, düzeltme, silme ve işlemenin kısıtlanması talepleriniz için{" "}
          <a href={`mailto:${siteSettings.email}`} className="text-accent">
            {siteSettings.email}
          </a>{" "}
          adresine yazabilirsiniz.
        </p>
        <h2 className="mt-10 font-serif text-2xl text-foreground">Çerezler</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Oturum (admin paneli) ve temel işlevsellik için zorunlu çerezler kullanılır.
          Analitik araçları eklendiğinde bu bölüm güncellenecektir.
        </p>
      </Container>
    </div>
  );
}
