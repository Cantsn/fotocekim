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
      sub: "Düğünden ürüne, gökyüzünden detaya — tek stüdyo. Anılarınızı filmik bir dilde belgeleriz.",
      portfolio: "Portföyü incele",
      book: "Randevu / teklif",
    },
    services: {
      eyebrow: "Hizmetler",
      title: "Her çekim için net bir dil",
      desc: "Düğün, dış çekim, ürün, dükkan ve drone — ihtiyacınıza göre ekip ve ekipman planlanır.",
      all: "Tüm hizmetler",
    },
    featured: {
      eyebrow: "Seçili çalışmalar",
      title: "Portföyden kareler",
      all: "Tüm portföy",
    },
    process: {
      eyebrow: "Süreç",
      title: "Dört net adım",
      desc: "İlk mesajdan teslimata kadar şeffaf ve sakin bir süreç.",
      steps: [
        { n: "01", title: "İletişim", desc: "Form veya WhatsApp ile ulaşın." },
        { n: "02", title: "Keşif", desc: "Tarih, lokasyon ve konsepti netleştirelim." },
        { n: "03", title: "Çekim", desc: "Foto, video ve isteğe bağlı drone." },
        { n: "04", title: "Teslimat", desc: "Seçki, düzenleme ve online galeri." },
      ],
    },
    packages: {
      eyebrow: "Paketler",
      title: "Başlangıç seçenekleri",
      request: "Teklif iste",
    },
    testimonials: {
      eyebrow: "Referanslar",
      title: "Müşterilerimizden",
    },
    cta: {
      title: "Birlikte unutulmaz kareler üretelim",
      desc: "Düğün, marka veya özel bir an — size özel planlayalım.",
      primary: "Randevu al",
      secondary: "İletişim",
    },
    footer: {
      rights: "Tüm hakları saklıdır.",
      privacy: "Gizlilik & KVKK",
      terms: "Kullanım Koşulları",
    },
    booking: {
      available: "Müsait",
      busy: "Dolu / kapalı",
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
      sub: "From weddings to products, ground to sky — one studio. Cinematic storytelling.",
      portfolio: "View portfolio",
      book: "Book / inquire",
    },
    services: {
      eyebrow: "Services",
      title: "A clear visual language",
      desc: "Weddings, outdoor, product, venue and drone — tailored crew and gear.",
      all: "All services",
    },
    featured: {
      eyebrow: "Selected work",
      title: "Frames from the portfolio",
      all: "Full portfolio",
    },
    process: {
      eyebrow: "Process",
      title: "Four clear steps",
      desc: "Calm and transparent from first message to delivery.",
      steps: [
        { n: "01", title: "Contact", desc: "Reach us via form or WhatsApp." },
        { n: "02", title: "Discovery", desc: "Date, location and concept." },
        { n: "03", title: "Shoot", desc: "Photo, video and optional drone." },
        { n: "04", title: "Delivery", desc: "Selects, grade and online gallery." },
      ],
    },
    packages: {
      eyebrow: "Packages",
      title: "Starting options",
      request: "Request quote",
    },
    testimonials: {
      eyebrow: "Testimonials",
      title: "From our clients",
    },
    cta: {
      title: "Let’s craft unforgettable frames",
      desc: "Wedding, brand or a personal moment — planned around you.",
      primary: "Book now",
      secondary: "Contact",
    },
    footer: {
      rights: "All rights reserved.",
      privacy: "Privacy & KVKK",
      terms: "Terms of use",
    },
    booking: {
      available: "Available",
      busy: "Busy / closed",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)["tr"];
