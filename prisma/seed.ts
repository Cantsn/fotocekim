import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_PERMISSIONS, stringifyPermissions } from "../lib/permissions";

const prisma = new PrismaClient();

async function ensureOwner() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@fotocekim.com")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const existing = await prisma.user.findFirst({ where: { isOwner: true } });
  if (existing) {
    console.log("Owner zaten var:", existing.email);
    return;
  }
  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    await prisma.user.update({
      where: { id: byEmail.id },
      data: {
        isOwner: true,
        active: true,
        permissions: stringifyPermissions(ALL_PERMISSIONS),
      },
    });
    console.log("Mevcut kullanıcı owner yapıldı:", email);
    return;
  }
  await prisma.user.create({
    data: {
      email,
      name: "Yönetici",
      passwordHash: await bcrypt.hash(password, 12),
      isOwner: true,
      active: true,
      permissions: stringifyPermissions(ALL_PERMISSIONS),
    },
  });
  console.log("Owner oluşturuldu:", email);
}

async function main() {
  await ensureOwner();

  const serviceCount = await prisma.service.count();
  if (serviceCount > 0) {
    console.log("İçerik seed atlandı (veri mevcut).");
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

Teslimat süreleri ve albüm seçenekleri paketlere göre değişir.`,
      order: 1,
    },
    {
      slug: "nisan",
      title: "Nişan & Söz",
      shortDesc: "Lokasyon veya stüdyoda samimi, şık nişan hikâyesi.",
      content: `Nişan ve söz törenlerinizi hem duygusal hem de estetik bir anlatıyla belgeleriz.`,
      order: 2,
    },
    {
      slug: "dis-cekim",
      title: "Dış Çekim",
      shortDesc: "Çift, aile ve moda için planlı lokasyon çekimleri.",
      content: `Gün batımı, sahil, şehir veya doğa — konseptinize uygun lokasyonlarda dış çekim.`,
      order: 3,
    },
    {
      slug: "urun",
      title: "Ürün & Katalog",
      shortDesc: "E-ticaret ve marka katalogları için net, satan görseller.",
      content: `Ürünlerinizi vitrinde ve online’da öne çıkaracak temiz katalog çekimleri.`,
      order: 4,
    },
    {
      slug: "dukkan",
      title: "Dükkan & Mekân",
      shortDesc: "Restoran, butik, otel ve showroom için mekân fotoğrafı.",
      content: `İşletmenizin atmosferini yansıtan mekân ve vitrin çekimleri.`,
      order: 5,
    },
    {
      slug: "drone",
      title: "Drone Çekimi",
      shortDesc: "Hava görüntüleri ile düğün, mülk ve etkinliklere güç katın.",
      content: `Drone ile sinematik hava sahneleri.\n\n**Not:** Uçuşlar SHT-İHA kurallarına tabidir.`,
      order: 6,
    },
    {
      slug: "kurumsal",
      title: "Kurumsal & Etkinlik",
      shortDesc: "Lansman, kongre ve marka etkinliklerinde profesyonel belgeleme.",
      content: `Marka etkinliklerinizi hızlı teslimat ve tutarlı görsel dil ile belgeleriz.`,
      order: 7,
    },
    {
      slug: "portre",
      title: "Portre & Stüdyo",
      shortDesc: "CV, influencer ve aile portreleri — stüdyo veya doğal ışık.",
      content: `Bireysel ve aile portrelerinde sakin, özgüvenli bir dil.`,
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
        description: "Kısa kapsamlı çekimler için.",
        priceFrom: 15000,
        features: JSON.stringify([
          "4 saat çekim",
          "1 fotoğrafçı",
          "150+ düzenlenmiş fotoğraf",
          "Online galeri",
        ]),
        order: 1,
      },
      {
        slug: "premium",
        name: "Premium",
        description: "En çok tercih edilen paket.",
        priceFrom: 28000,
        features: JSON.stringify([
          "8 saat çekim",
          "Fotoğraf + 2. kamera",
          "300+ düzenlenmiş fotoğraf",
          "Highlight video",
        ]),
        highlight: true,
        order: 2,
      },
      {
        slug: "ultimate",
        name: "Ultimate",
        description: "Tam gün foto + video + drone.",
        priceFrom: 45000,
        features: JSON.stringify([
          "Tam gün kapsam",
          "Foto + video ekibi",
          "Drone sahneleri*",
          "Aftermovie",
        ]),
        order: 3,
      },
    ],
  });

  await prisma.project.createMany({
    data: [
      {
        slug: "elif-can-dugun",
        title: "Elif & Can — Bahçe Düğünü",
        clientFirstName: "Elif",
        clientLastName: "Can",
        clientName: "Elif & Can",
        location: "İstanbul",
        plato: "Bahçe seti",
        date: new Date("2025-06-14"),
        category: "dugun",
        description: "Altın saat ışığında bahçe töreni.",
        featured: true,
        order: 1,
      },
      {
        slug: "ayse-mert-nisan",
        title: "Ayşe & Mert Nişan",
        clientFirstName: "Ayşe",
        clientLastName: "Mert",
        location: "İzmir",
        category: "nisan",
        description: "Minimal dekor nişan belgelemesi.",
        featured: true,
        order: 2,
      },
      {
        slug: "sahil-dis-cekim",
        title: "Sahil Dış Çekim",
        location: "Antalya",
        plato: "Açık hava",
        category: "dis-cekim",
        description: "Gün batımı sahil portreleri.",
        featured: true,
        order: 3,
      },
      {
        slug: "butik-katalog",
        title: "Butik Yaz Kataloğu",
        category: "urun",
        description: "Lifestyle + clean product set.",
        featured: true,
        order: 4,
      },
      {
        slug: "villa-drone",
        title: "Villa Drone Turu",
        category: "drone",
        description: "Mülk tanıtımı hava çekimi.",
        featured: true,
        order: 5,
      },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      {
        name: "Elif & Can",
        role: "Gelin & Damat",
        content: "Düğün günümüzü hiç stres etmeden yaşadık.",
        rating: 5,
        order: 1,
      },
      {
        name: "Deniz K.",
        role: "Butik sahibi",
        content: "Ürün çekimleri satışlarımızı doğrudan etkiledi.",
        rating: 5,
        order: 2,
      },
      {
        name: "Arda M.",
        role: "Organizasyon",
        content: "Drone ve yer ekibi senkron çalıştı.",
        rating: 5,
        order: 3,
      },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        question: "Ne kadar önceden rezervasyon yapmalıyım?",
        answer: "Düğün için 3–6 ay, ürün çekiminde 1–2 hafta idealdir.",
        order: 1,
      },
      {
        question: "Fotoğraflar ne kadar sürede teslim edilir?",
        answer: "Genelde 2–4 hafta içinde seçki ve düzenleme tamamlanır.",
        order: 2,
      },
      {
        question: "Drone her lokasyonda uçabiliyor mu?",
        answer: "SHT-İHA kuralları ve yerel yasaklar geçerlidir.",
        order: 3,
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
