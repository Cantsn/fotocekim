export type Locale = "tr" | "en";

export const dictionaries = {
  tr: {
    nav: {
      services: "Hizmetler",
      portfolio: "Portföy",
      packages: "Paketler",
      about: "Hakkımızda",
      faq: "SSS",
      contact: "İletişim",
      cta: "Teklif Al",
      skip: "İçeriğe atla",
    },
    hero: {
      kicker: "Fotoğraf · Video · Drone",
      sub: "Düğün, nişan, ürün ve mekân çekimlerinde profesyonel fotoğraf ve video. Planlamadan teslimata net süreç, düzenli iletişim.",
      portfolio: "Portföyü incele",
      book: "Randevu / teklif",
    },
    services: {
      eyebrow: "Hizmetler",
      title: "Hangi çekim ihtiyacınız var?",
      desc: "Düğün ve dış çekimden ürün, dükkan ve drone’a kadar; kapsamı netleştirip ekip ve ekipmanı ona göre planlıyoruz.",
      all: "Tüm hizmetler",
      detail: "Detay",
    },
    featured: {
      eyebrow: "Seçili çalışmalar",
      title: "Son projelerden örnekler",
      all: "Tüm portföy",
    },
    process: {
      eyebrow: "Süreç",
      title: "Nasıl çalışıyoruz?",
      desc: "İlk mesajdan teslimata kadar adımlar net; sürpriz yok, abartısız plan.",
      steps: [
        {
          n: "01",
          title: "İletişim",
          desc: "Form veya WhatsApp ile tarih ve ihtiyacınızı yazın.",
        },
        {
          n: "02",
          title: "Planlama",
          desc: "Lokasyon, paket ve zaman çizelgesini birlikte netleştiririz.",
        },
        {
          n: "03",
          title: "Çekim",
          desc: "Fotoğraf, video ve istenirse drone ile sahada çalışırız.",
        },
        {
          n: "04",
          title: "Teslimat",
          desc: "Seçki, düzenleme ve online galeri ile teslim ederiz.",
        },
      ],
    },
    packages: {
      eyebrow: "Paketler",
      title: "Başlangıç paketleri",
      request: "Teklif iste",
      priceNote:
        "Listedeki tutarlar başlangıç fiyatıdır; nihai teklif süre, lokasyon ve ekipman kapsamına göre belirlenir.",
      quoteOnly: "Güncel fiyat için iletişime geçin; size özel teklif hazırlarız.",
      recommended: "En çok tercih",
    },
    testimonials: {
      eyebrow: "Referanslar",
      title: "Birlikte çalıştığımız müşteriler",
    },
    drone: {
      kicker: "Drone & ekipman",
      title: "Yerden ve havadan kapsama",
      desc: "Profesyonel gövde ve lenslerle sahada; uygun projelerde mevzuata uygun drone çekimi ekleriz.",
      cta: "Drone hizmeti",
    },
    cta: {
      badge: "Randevu",
      title: "Çekim tarihinizi konuşalım",
      desc: "Düğün, marka veya özel gün — müsaitliği kontrol edip size uygun paketi netleştirelim.",
      primary: "Randevu al",
      secondary: "İletişim",
    },
    about: {
      eyebrow: "Hakkımızda",
      title: "Profesyonel fotoğraf ve video stüdyosu",
      lead:
        "Düğün, nişan, ürün ve mekân çekimlerinde net plan, sakin yönlendirme ve teslimatta tutarlı kalite.",
      p1: "merkezli bir fotoğraf ve video stüdyosudur. Amacımız abartılı vaatler değil; günün gerçek akışını ve markanızın ihtiyacını doğru belgelemek.",
      p2: "Portföy yayını için izin isteriz. Teslimat sürelerini baştan konuşur, kapsamı yazılı netleştiririz.",
      portfolio: "Portföy",
      meet: "Tanışalım",
      valuesTitle: "Çalışma prensiplerimiz",
      values: [
        {
          t: "Net plan",
          d: "Tarih, süre, ekip ve teslimat baştan konuşulur.",
        },
        {
          t: "Foto + video",
          d: "Aynı gün içinde uyumlu bir görsel dil.",
        },
        {
          t: "Şeffaf teklif",
          d: "Paket içeriği ve fiyat belirsizliği olmadan.",
        },
        {
          t: "İzin & KVKK",
          d: "Yayın izni ve kişisel verilerde dikkat.",
        },
      ],
      storyTitle: "Stüdyo hakkında",
      story:
        "Hazırlıktan teslimata yanınızdayız. Gereksiz süsleme yok; sahada ve montajda işe odaklanırız.",
      gearTitle: "Ekipman özeti",
      gear: [
        "Full-frame gövdeler",
        "Prime & sinema lens seti",
        "Profesyonel ışık",
        "Stabilize video rig",
        "Drone (izinli operasyon)",
        "Yedek batarya & medya",
      ],
      gearNote: "Kullanılan set proje tipine göre değişir.",
      stats: [
        { n: "8+", l: "Hizmet alanı" },
        { n: "4K", l: "Video kalitesi" },
        { n: "7/24", l: "Ön görüşme" },
      ],
    },
    contact: {
      eyebrow: "İletişim",
      title: "Bize ulaşın",
      desc: "Formu doldurun veya WhatsApp’tan yazın; en kısa sürede dönüş yaparız.",
    },
    booking: {
      eyebrow: "Randevu",
      title: "Ücretsiz ön görüşme",
      desc: "Müsait tarih ve saati seçin. Onay sonrası slot takvimde kilitlenir.",
      available: "Müsait",
      busy: "Dolu / kapalı",
    },
    faq: {
      eyebrow: "SSS",
      title: "Sık sorulan sorular",
      more: "Cevabını bulamadınız mı?",
    },
    footer: {
      explore: "Keşfet",
      support: "Destek",
      contact: "İletişim",
      rights: "Tüm hakları saklıdır.",
      privacy: "Gizlilik & KVKK",
      terms: "Kullanım Koşulları",
      whatsapp: "WhatsApp yaz",
      ctaKicker: "Hemen başlayın",
      ctaTitle: "Çekim için teklif veya randevu alın",
      brandBlurb:
        "Düğün, ürün ve mekân çekimlerinde profesyonel fotoğraf, video ve drone.",
      tag: "Fotoğraf · Video · Drone",
    },
    common: {
      all: "Tümü",
      send: "Gönder",
      name: "Ad Soyad",
      phone: "Telefon",
      email: "E-posta",
      location: "Lokasyon",
      message: "Mesaj",
    },
  },
  en: {
    nav: {
      services: "Services",
      portfolio: "Portfolio",
      packages: "Packages",
      about: "About",
      faq: "FAQ",
      contact: "Contact",
      cta: "Get a quote",
      skip: "Skip to content",
    },
    hero: {
      kicker: "Photo · Video · Drone",
      sub: "Professional photo and video for weddings, products and venues. Clear planning, regular updates, reliable delivery.",
      portfolio: "View portfolio",
      book: "Book / inquire",
    },
    services: {
      eyebrow: "Services",
      title: "What do you need shot?",
      desc: "From weddings and outdoor sessions to product, venue and drone — we scope the job and plan crew and gear accordingly.",
      all: "All services",
      detail: "Details",
    },
    featured: {
      eyebrow: "Selected work",
      title: "Recent project samples",
      all: "Full portfolio",
    },
    process: {
      eyebrow: "Process",
      title: "How we work",
      desc: "Clear steps from first message to delivery — no fluff, no surprises.",
      steps: [
        {
          n: "01",
          title: "Contact",
          desc: "Send the date and what you need via form or WhatsApp.",
        },
        {
          n: "02",
          title: "Planning",
          desc: "We lock location, package and schedule together.",
        },
        {
          n: "03",
          title: "Shoot",
          desc: "Photo, video and optional drone on site.",
        },
        {
          n: "04",
          title: "Delivery",
          desc: "Selects, edits and an online gallery.",
        },
      ],
    },
    packages: {
      eyebrow: "Packages",
      title: "Starting packages",
      request: "Request quote",
      priceNote:
        "Listed amounts are starting prices; final quotes depend on duration, location and gear scope.",
      quoteOnly: "Contact us for current pricing — we’ll prepare a tailored quote.",
      recommended: "Most popular",
    },
    testimonials: {
      eyebrow: "Testimonials",
      title: "Clients we’ve worked with",
    },
    drone: {
      kicker: "Drone & gear",
      title: "Coverage from ground and air",
      desc: "Pro bodies and lenses on site; compliant drone when the project needs it.",
      cta: "Drone service",
    },
    cta: {
      badge: "Booking",
      title: "Let’s talk about your shoot date",
      desc: "Wedding, brand or a special day — we’ll check availability and clarify the right package.",
      primary: "Book now",
      secondary: "Contact",
    },
    about: {
      eyebrow: "About",
      title: "A professional photo & video studio",
      lead:
        "Clear planning, calm direction and consistent delivery for weddings, products and venues.",
      p1: "is a photo and video studio. We don’t sell empty promises — we document the real flow of your day and what your brand needs.",
      p2: "We ask permission before publishing client work. Delivery timelines and scope are set up front.",
      portfolio: "Portfolio",
      meet: "Let’s meet",
      valuesTitle: "How we work",
      values: [
        {
          t: "Clear plan",
          d: "Date, duration, crew and delivery agreed early.",
        },
        {
          t: "Photo + video",
          d: "A coherent look across stills and motion.",
        },
        {
          t: "Transparent quote",
          d: "Package contents and price without ambiguity.",
        },
        {
          t: "Consent & privacy",
          d: "Publication consent and careful data handling.",
        },
      ],
      storyTitle: "About the studio",
      story:
        "We stay with you from prep to delivery. No unnecessary polish — focus on the work on set and in post.",
      gearTitle: "Gear overview",
      gear: [
        "Full-frame bodies",
        "Prime & cinema lenses",
        "Pro lighting",
        "Stabilized video rig",
        "Drone (licensed ops)",
        "Backup batteries & media",
      ],
      gearNote: "Kit varies by project type.",
      stats: [
        { n: "8+", l: "Service areas" },
        { n: "4K", l: "Video quality" },
        { n: "24/7", l: "First chat" },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Get in touch",
      desc: "Fill the form or message us on WhatsApp — we’ll reply as soon as we can.",
    },
    booking: {
      eyebrow: "Booking",
      title: "Free intro call",
      desc: "Pick an available date and time. Confirmed slots lock on the calendar.",
      available: "Available",
      busy: "Busy / closed",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Common questions",
      more: "Still have a question?",
    },
    footer: {
      explore: "Explore",
      support: "Support",
      contact: "Contact",
      rights: "All rights reserved.",
      privacy: "Privacy & KVKK",
      terms: "Terms of use",
      whatsapp: "WhatsApp",
      ctaKicker: "Get started",
      ctaTitle: "Request a quote or book a shoot",
      brandBlurb:
        "Professional photo, video and drone for weddings, products and venues.",
      tag: "Photo · Video · Drone",
    },
    common: {
      all: "All",
      send: "Send",
      name: "Full name",
      phone: "Phone",
      email: "Email",
      location: "Location",
      message: "Message",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)["tr"];
