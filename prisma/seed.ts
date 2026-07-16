import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.service.count();
  if (existing > 0) {
    console.log("Seed atlandı: veritabanında zaten veri var.");
    return;
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "FotoCekim",
      tagline: "Anılarınız, sinema kalitesinde.",
      phone: "+90 5XX XXX XX XX",
      whatsapp: "905000000000",
      email: "info@fotocekim.com",
      address: "Örnek Mah. Stüdyo Sk. No:1",
      city: "İstanbul",
      instagram: "https://instagram.com/",
      youtube: "https://youtube.com/",
      tiktok: "https://tiktok.com/",
      showPrices: true,
      seoTitle: "FotoCekim | Düğün, Dış Çekim, Ürün & Drone Fotoğrafçılığı",
      seoDescription:
        "Düğün, nişan, dış çekim, ürün/dükkan ve drone çekimleri. Premium fotoğraf ve video stüdyosu.",
    },
  });

  const services = [
    {
      slug: "dugun",
      title: "Düğün Çekimi",
      shortDesc:
        "Tören, gelin alma ve aftermovie ile gün boyu sinematik belgeleme.",
      content: `Düğün gününüz bir kez yaşanır. Ekibimiz hazırlıktan son dansa kadar tüm anları doğal ve filmik bir dilde yakalar.

- Hazırlık & detay çekimleri
- Nikâh / düğün töreni
- Aile ve grup portreleri
- Aftermovie & highlight video
- İsteğe bağlı drone sahneleri

Teslimat süreleri ve albüm seçenekleri paketlere göre değişir. Tarih müsaitliği için erken iletişim önerilir.`,
      order: 1,
    },
    {
      slug: "nisan",
      title: "Nişan & Söz",
      shortDesc: "Lokasyon veya stüdyoda samimi, şık nişan hikâyesi.",
      content: `Nişan ve söz törenlerinizi hem duygusal hem de estetik bir anlatıyla belgeleriz.

- Çift portreleri
- Aile kareleri
- Mekân detayları
- Kısa highlight video seçeneği

İç mekân veya dış mekân fark etmeksizin ışık ve kompozisyona öncelik veririz.`,
      order: 2,
    },
    {
      slug: "dis-cekim",
      title: "Dış Çekim",
      shortDesc: "Çift, aile ve moda için planlı lokasyon çekimleri.",
      content: `Gün batımı, sahil, şehir veya doğa — konseptinize uygun lokasyonlarda dış çekim.

- Ön keşif / lokasyon önerisi
- Stil & poz yönlendirmesi
- Renk düzenleme ve seçki
- Sosyal medya için dikey kareler

Hava durumu planı ve yedek tarih seçenekleri görüşmede netleştirilir.`,
      order: 3,
    },
    {
      slug: "urun",
      title: "Ürün & Katalog",
      shortDesc: "E-ticaret ve marka katalogları için net, satan görseller.",
      content: `Ürünlerinizi vitrinde ve online’da öne çıkaracak temiz katalog çekimleri.

- Beyaz fon / lifestyle set
- Detay ve texture close-up
- Renk tutarlılığı
- Hızlı teslimat seçenekleri

Marka rehberinize (brand guideline) uygun ışık ve arka plan tercih edilebilir.`,
      order: 4,
    },
    {
      slug: "dukkan",
      title: "Dükkan & Mekân",
      shortDesc: "Restoran, butik, otel ve showroom için mekân fotoğrafı.",
      content: `İşletmenizin atmosferini yansıtan mekân ve vitrin çekimleri.

- Geniş açı mekân
- Detay & ambiyans
- Menü / ürün entegrasyonu
- Sosyal ve Google İşletme için optimize kareler

Yoğun saat dışında planlama önerilir.`,
      order: 5,
    },
    {
      slug: "drone",
      title: "Drone Çekimi",
      shortDesc: "Hava görüntüleri ile düğün, mülk ve etkinliklere güç katın.",
      content: `Drone ile sinematik hava sahneleri.

- Düğün & etkinlik aerial
- Mülk / arsa tanıtımı
- Kurumsal lokasyon
- Foto + video seçenekleri

**Not:** Uçuşlar SHT-İHA kuralları ve yerel kısıtlamalara tabidir. İzin gerektiren alanlarda planlama önceden yapılır.`,
      order: 6,
    },
    {
      slug: "kurumsal",
      title: "Kurumsal & Etkinlik",
      shortDesc: "Lansman, kongre ve marka etkinliklerinde profesyonel belgeleme.",
      content: `Marka etkinliklerinizi hızlı teslimat ve tutarlı görsel dil ile belgeleriz.

- Konuşmacı & sahne
- Networking anları
- Basın / PR setleri
- Same-day seçki (opsiyonel)

Brief ve zaman çizelgesi etkinlik öncesi paylaşılmalıdır.`,
      order: 7,
    },
    {
      slug: "portre",
      title: "Portre & Stüdyo",
      shortDesc: "CV, influencer ve aile portreleri — stüdyo veya doğal ışık.",
      content: `Bireysel ve aile portrelerinde sakin, özgüvenli bir dil.

- LinkedIn / CV portre
- Influencer içerik seti
- Aile & çocuk
- Makeup / styling yönlendirme (opsiyonel)

Kıyafet önerileri randevu öncesi iletilir.`,
      order: 8,
    },
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }

  await prisma.package.createMany({
    data: [
      {
        slug: "essential",
        name: "Essential",
        priceFrom: 15000,
        features: JSON.stringify([
          "4 saat çekim",
          "1 fotoğrafçı",
          "150+ düzenlenmiş fotoğraf",
          "Online galeri",
          "Temel renk düzenleme",
        ]),
        highlight: false,
        order: 1,
      },
      {
        slug: "premium",
        name: "Premium",
        priceFrom: 28000,
        features: JSON.stringify([
          "8 saat çekim",
          "Fotoğraf + 2. kamera",
          "300+ düzenlenmiş fotoğraf",
          "Highlight video (2–3 dk)",
          "Online galeri + USB",
          "Ön görüşme & planlama",
        ]),
        highlight: true,
        order: 2,
      },
      {
        slug: "ultimate",
        name: "Ultimate",
        priceFrom: 45000,
        features: JSON.stringify([
          "Tam gün kapsam",
          "Foto + video ekibi",
          "Drone sahneleri*",
          "Aftermovie",
          "Sınırsız seçki (makul kullanım)",
          "Premium albüm seçeneği",
          "Aynı gün teaser",
        ]),
        highlight: false,
        order: 3,
      },
    ],
  });

  await prisma.project.createMany({
    data: [
      {
        slug: "elif-can-dugun",
        title: "Elif & Can — Bahçe Düğünü",
        clientName: "Elif & Can",
        location: "İstanbul",
        date: new Date("2025-06-14"),
        category: "dugun",
        description:
          "Altın saat ışığında bahçe töreni, samimi aile anları ve sinematik aftermovie.",
        featured: true,
        order: 1,
        galleryCount: 8,
      },
      {
        slug: "ayse-mert-nisan",
        title: "Ayşe & Mert Nişan",
        location: "İzmir",
        date: new Date("2025-04-20"),
        category: "nisan",
        description: "Minimal dekor ve sıcak tonlarda nişan belgelemesi.",
        featured: true,
        order: 2,
        galleryCount: 6,
      },
      {
        slug: "sahil-dis-cekim",
        title: "Sahil Dış Çekim",
        location: "Antalya",
        category: "dis-cekim",
        description: "Gün batımı sahil portreleri.",
        featured: true,
        order: 3,
        galleryCount: 6,
      },
      {
        slug: "butik-katalog",
        title: "Butik Yaz Kataloğu",
        category: "urun",
        description: "Lifestyle + clean product set.",
        featured: true,
        order: 4,
        galleryCount: 9,
      },
      {
        slug: "restoran-mekan",
        title: "Restoran Mekân Seti",
        category: "dukkan",
        description: "Ambiyans, detay ve menü görselleri.",
        featured: false,
        order: 5,
        galleryCount: 6,
      },
      {
        slug: "villa-drone",
        title: "Villa Drone Turu",
        category: "drone",
        description: "Mülk tanıtımı için hava fotoğraf ve video.",
        featured: true,
        order: 6,
        galleryCount: 5,
      },
      {
        slug: "lansman-2025",
        title: "Marka Lansmanı 2025",
        category: "kurumsal",
        description: "Sahne, networking ve basın seti.",
        featured: false,
        order: 7,
        galleryCount: 7,
      },
      {
        slug: "studiyo-portre",
        title: "Stüdyo Portre Serisi",
        category: "portre",
        description: "Temiz ışık, sade arka plan portreler.",
        featured: false,
        order: 8,
        galleryCount: 4,
      },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      {
        name: "Elif & Can",
        role: "Gelin & Damat",
        content:
          "Düğün günümüzü hiç stres etmeden yaşadık. Kareler sinema gibi, ailemiz bayıldı.",
        rating: 5,
        order: 1,
      },
      {
        name: "Deniz K.",
        role: "Butik sahibi",
        content:
          "Ürün çekimleri satışlarımızı doğrudan etkiledi. Süreç hızlı ve profesyoneldi.",
        rating: 5,
        order: 2,
      },
      {
        name: "Arda M.",
        role: "Etkinlik organizatörü",
        content:
          "Drone ve yer ekibi senkron çalıştı. Teslimat söz verildiği gibi geldi.",
        rating: 5,
        order: 3,
      },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        question: "Ne kadar önceden rezervasyon yapmalıyım?",
        answer:
          "Düğün ve yoğun sezon için 3–6 ay öncesi idealdir. Ürün ve stüdyo çekimlerinde genelde 1–2 hafta yeterlidir.",
        order: 1,
      },
      {
        question: "Fotoğraflar ne kadar sürede teslim edilir?",
        answer:
          "Pakete göre değişmekle birlikte seçki ve düzenleme genelde 2–4 hafta içinde tamamlanır. Acil teaser seçenekleri mevcuttur.",
        order: 2,
      },
      {
        question: "Drone her lokasyonda uçabiliyor mu?",
        answer:
          "Hayır. SHT-İHA kuralları ve yerel yasaklar geçerlidir. Uygun olmayan alanlarda alternatif plan sunulur.",
        order: 3,
      },
      {
        question: "Fiyatlara KDV ve seyahat dâhil mi?",
        answer:
          "Listelenen tutarlar başlangıç fiyatıdır. Mesafe, süre, ekipman ve ekip büyüklüğüne göre teklif netleşir.",
        order: 4,
      },
      {
        question: "Ham dosyaları alabilir miyim?",
        answer:
          "Standart teslimat düzenlenmiş seçkidir. Ham dosya talepleri sözleşmede ayrıca belirtilir.",
        order: 5,
      },
    ],
  });

  console.log("Seed tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
