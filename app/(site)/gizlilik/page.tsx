import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni",
  description:
    "Fotoğraf ve video stüdyosu hizmetleri kapsamında KVKK aydınlatma ve gizlilik metni.",
};

export const dynamic = "force-dynamic";

export default async function GizlilikPage() {
  const s = await getSiteSettings();
  const updated = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <p className="text-xs tracking-[0.2em] text-accent uppercase">
          Yasal
        </p>
        <h1 className="mt-2 font-serif text-4xl text-foreground">
          Gizlilik Politikası ve KVKK Aydınlatma Metni
        </h1>
        <p className="mt-3 text-xs text-muted">Son güncelleme: {updated}</p>

        <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            İşbu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)
            kapsamında veri sorumlusu sıfatıyla{" "}
            <strong className="text-foreground">{s.siteName}</strong>
            {s.address ? ` (${s.address}${s.city ? `, ${s.city}` : ""})` : ""}{" "}
            tarafından hazırlanmıştır. Web sitemizi ziyaret etmeniz, randevu /
            teklif formu doldurmanız, WhatsApp veya e-posta ile iletişime
            geçmeniz ve fotoğraf–video çekim hizmeti almanız halinde kişisel
            verileriniz aşağıda belirtilen amaç ve hukuki sebeplerle
            işlenebilir.
          </p>
          <p className="rounded-xl border border-border bg-card px-4 py-3 text-xs">
            Bu metin genel bilgilendirme niteliğindedir; ticari faaliyetinize
            özel avukatlık onayı ile güncellenmesi önerilir.
          </p>
        </div>

        <Section title="1. Veri sorumlusu ve iletişim">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Unvan / marka:{" "}
              <span className="text-foreground">{s.siteName}</span>
            </li>
            {s.email && (
              <li>
                E-posta:{" "}
                <a href={`mailto:${s.email}`} className="text-accent">
                  {s.email}
                </a>
              </li>
            )}
            {s.phone && <li>Telefon: {s.phone}</li>}
            {s.whatsapp && <li>WhatsApp: {s.whatsapp}</li>}
            {(s.address || s.city) && (
              <li>
                Adres: {[s.address, s.city].filter(Boolean).join(", ")}
              </li>
            )}
          </ul>
        </Section>

        <Section title="2. İşlenen kişisel veri kategorileri">
          <p className="mb-3">
            Hizmetin niteliğine göre aşağıdaki veriler işlenebilir:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Kimlik / iletişim:</strong> ad
              soyad, telefon, e-posta, sosyal medya hesap bağlantıları
            </li>
            <li>
              <strong className="text-foreground">Randevu ve organizasyon:</strong>{" "}
              çekim / etkinlik tarihi ve saati, lokasyon, plato / mekân bilgisi,
              bütçe aralığı, mesaj içeriği, hizmet tipi (düğün, ürün, drone vb.)
            </li>
            <li>
              <strong className="text-foreground">Görsel ve işitsel kayıtlar:</strong>{" "}
              fotoğraf, video, drone görüntüleri, ses kayıtları; portföyde
              yayımlanacak seçkiler (ayrıca izin alınır)
            </li>
            <li>
              <strong className="text-foreground">Sözleşme / fatura:</strong>{" "}
              fatura unvanı, vergi no, adres (hizmet sözleşmesi kurulduğunda)
            </li>
            <li>
              <strong className="text-foreground">İşlem güvenliği:</strong> IP
              adresi, tarayıcı / cihaz bilgisi, çerez kayıtları, admin oturum
              verileri
            </li>
          </ul>
        </Section>

        <Section title="3. İşleme amaçları">
          <ul className="list-disc space-y-2 pl-5">
            <li>Randevu taleplerinin alınması, müsaitlik planlaması ve onay süreçleri</li>
            <li>Teklif hazırlama, sözleşme ve hizmet sunumu</li>
            <li>
              Fotoğraf–video çekimi, düzenleme, teslimat ve arşiv (sözleşmede
              belirtilen süreyle)
            </li>
            <li>
              Portföy, web sitesi ve sosyal medyada tanıtım (yalnızca açık rıza /
              sözleşme hükmü varsa)
            </li>
            <li>Müşteri ilişkileri, bilgilendirme ve destek</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, muhasebe vb.)</li>
            <li>Bilgi güvenliği, spam ve kötüye kullanımın önlenmesi</li>
          </ul>
        </Section>

        <Section title="4. Hukuki sebepler (KVKK m.5 ve m.6)">
          <ul className="list-disc space-y-2 pl-5">
            <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
            <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi</li>
            <li>Meşru menfaatler (güvenlik, iş geliştirme — temel haklara zarar vermemek kaydıyla)</li>
            <li>
              Açık rıza (ör. pazarlama iletişimi, portföy yayını, özel nitelikli
              veri içeren çekimler)
            </li>
          </ul>
        </Section>

        <Section title="5. Aktarım">
          <p>
            Kişisel verileriniz, yurt içinde hizmet alınan altyapı
            sağlayıcılarına (hosting, e-posta/SMTP, bulut depolama, isteğe bağlı
            Google Takvim) teknik gereklilik ölçüsünde aktarılabilir. Yurt dışı
            aktarım söz konusuysa KVKK’nın öngördüğü güvenceler aranır.
            Verileriniz, yasal zorunluluk dışında üçüncü kişilere satılmaz.
          </p>
        </Section>

        <Section title="6. Saklama süreleri">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Randevu / iletişim form kayıtları: talep süreci ve olası uyuşmazlık
              süreleri boyunca (genelde en az 2 yıl)
            </li>
            <li>
              Sözleşme ve fatura kayıtları: ilgili mevzuattaki zamanaşımı
              süreleri (ör. 10 yıl)
            </li>
            <li>
              Çekim arşivi: sözleşme / paket kapsamında belirtilen süre; aksi
              halde makul iş süresi
            </li>
            <li>Admin oturum çerezleri: en fazla 7 gün (oturum ayarına bağlı)</li>
          </ul>
        </Section>

        <Section title="7. Çerezler">
          <p>
            Sitemizde zorunlu çerezler kullanılır: admin paneli oturumu ve
            güvenlik. Analitik veya pazarlama çerezleri eklendiğinde bu metin
            güncellenir ve gerektiğinde rıza alınır.
          </p>
        </Section>

        <Section title="8. Portföy ve görsel kullanım">
          <p>
            Müşteri çekimlerinin web sitesi, sosyal medya veya basılı materyalde
            yayımlanması kural olarak{" "}
            <strong className="text-foreground">yazılı veya açık rıza</strong>{" "}
            ile yapılır. Rıza vermemeniz hizmet alımını engellemez; yalnızca
            tanıtım kullanımını sınırlar. Drone çekimlerinde SHT-İHA ve yerel
            kısıtlamalara uyulur; üçüncü kişilerin görüntülenmesi halinde
            meşru menfaat ve orantılılık ilkeleri gözetilir.
          </p>
        </Section>

        <Section title="9. KVKK m.11 kapsamındaki haklarınız">
          <p className="mb-3">Kişisel verilerinizle ilgili olarak:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>İşlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde / yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>KVKK’da öngörülen şartlarda silinmesini / yok edilmesini isteme</li>
            <li>Otomatik sistemlerle analiz sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz</li>
            <li>Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme</li>
          </ul>
          <p className="mt-4">
            Başvurularınızı{" "}
            <a href={`mailto:${s.email}`} className="text-accent">
              {s.email || "iletişim e-postamıza"}
            </a>{" "}
            üzerinden iletebilirsiniz. KVKK ve ilgili mevzuat çerçevesinde en
            geç 30 gün içinde yanıtlanır.
          </p>
        </Section>

        <Section title="10. Güvenlik">
          <p>
            Verileriniz; erişim yetkilendirmesi, güvenli oturum (admin),
            sunucu/veritabanı izolasyonu ve gerekli teknik tedbirlerle
            korunmaya çalışılır. İnternet üzerinden iletimin tamamen risksiz
            olduğu garanti edilemez; olağanüstü durumlarda yasal mercilere
            bildirim yükümlülükleri saklıdır.
          </p>
        </Section>

        <Section title="11. Değişiklikler">
          <p>
            {s.siteName}, bu metni yasal veya operasyonel değişikliklere göre
            güncelleyebilir. Güncel sürüm bu sayfada yayımlanır.
          </p>
        </Section>
      </Container>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}
