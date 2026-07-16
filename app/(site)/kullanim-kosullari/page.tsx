import type { Metadata } from "next";
import { siteSettings } from "@/lib/data";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
};

export default function KullanimKosullariPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl text-foreground">Kullanım Koşulları</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Bu web sitesini kullanarak {siteSettings.siteName} tarafından sunulan içeriğe
            erişirsiniz. Site içeriği bilgilendirme amaçlıdır; fiyatlar teklife tabidir.
          </p>
          <p>
            Portföy görselleri ve metinler izin alınmadan kopyalanamaz, ticari amaçla
            kullanılamaz. Müşteri çekimlerinin yayını yazılı izne bağlıdır.
          </p>
          <p>
            Form üzerinden ilettiğiniz bilgiler doğru ve güncel olmalıdır. Spam veya kötüye
            kullanım tespitinde talepler işleme alınmayabilir.
          </p>
          <p>
            Uyuşmazlıklarda {siteSettings.city} mahkemeleri ve icra daireleri yetkilidir
            (taslak madde — hukuki danışmanlık ile netleştirin).
          </p>
        </div>
      </Container>
    </div>
  );
}
