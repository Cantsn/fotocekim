import type {
  Faq,
  Inquiry,
  Package,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from "./types";
import { prisma } from "./prisma";

/** Client bileşenler ve fallback için sabit ayarlar */
export const defaultSiteSettings: SiteSettings = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "FotoCekim",
  tagline: "Anılarınız, sinema kalitesinde.",
  phone: "+90 5XX XXX XX XX",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "905000000000",
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
};

/** @deprecated use getSiteSettings() — client bileşen uyumu için alias */
export const siteSettings = defaultSiteSettings;

function mapPackage(p: {
  id: string;
  slug: string;
  name: string;
  priceFrom: number | null;
  currency: string;
  features: string;
  highlight: boolean;
  order: number;
  published: boolean;
}): Package {
  let features: string[] = [];
  try {
    features = JSON.parse(p.features) as string[];
  } catch {
    features = [];
  }
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    priceFrom: p.priceFrom,
    currency: p.currency,
    features,
    highlight: p.highlight,
    order: p.order,
    published: p.published,
  };
}

function mapProject(p: {
  id: string;
  slug: string;
  title: string;
  clientName: string | null;
  location: string | null;
  date: Date | null;
  category: string;
  description: string;
  published: boolean;
  featured: boolean;
  order: number;
  galleryCount: number;
}): Project {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    clientName: p.clientName ?? undefined,
    location: p.location ?? undefined,
    date: p.date ? p.date.toISOString().slice(0, 10) : undefined,
    category: p.category,
    description: p.description,
    published: p.published,
    featured: p.featured,
    order: p.order,
    galleryCount: p.galleryCount,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!row) return defaultSiteSettings;
    return {
      siteName: row.siteName,
      tagline: row.tagline,
      phone: row.phone,
      whatsapp: row.whatsapp,
      email: row.email,
      address: row.address,
      city: row.city,
      instagram: row.instagram,
      youtube: row.youtube,
      tiktok: row.tiktok,
      showPrices: row.showPrices,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
    };
  } catch {
    return defaultSiteSettings;
  }
}

function mapService(s: {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  content: string;
  order: number;
  published: boolean;
}): Service {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    shortDesc: s.shortDesc,
    content: s.content,
    order: s.order,
    published: s.published,
  };
}

export async function getPublishedServices(): Promise<Service[]> {
  const rows = await prisma.service.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map(mapService);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const row = await prisma.service.findFirst({
    where: { slug, published: true },
  });
  return row ? mapService(row) : null;
}

export async function getPublishedPackages(): Promise<Package[]> {
  const rows = await prisma.package.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map(mapPackage);
}

export async function getPublishedProjects(category?: string): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
    },
    orderBy: { order: "asc" },
  });
  return rows.map(mapProject);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { published: true, featured: true },
    orderBy: { order: "asc" },
  });
  return rows.map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const row = await prisma.project.findFirst({
    where: { slug, published: true },
  });
  return row ? mapProject(row) : null;
}

export async function getPublishedFaqs(): Promise<Faq[]> {
  const rows = await prisma.faq.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    order: f.order,
    published: f.published,
  }));
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const rows = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role ?? undefined,
    content: t.content,
    rating: t.rating,
    published: t.published,
    order: t.order,
  }));
}

export async function getInquiries(): Promise<Inquiry[]> {
  const rows = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email ?? undefined,
    type: r.type as Inquiry["type"],
    eventDate: r.eventDate ?? undefined,
    location: r.location ?? undefined,
    message: r.message,
    budget: r.budget ?? undefined,
    status: r.status as Inquiry["status"],
    source: r.source ?? undefined,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function addInquiry(
  data: Omit<Inquiry, "id" | "status" | "createdAt">,
): Promise<Inquiry> {
  const row = await prisma.inquiry.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      type: data.type,
      eventDate: data.eventDate,
      location: data.location,
      message: data.message,
      budget: data.budget,
      source: data.source,
      status: "NEW",
    },
  });
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    type: row.type as Inquiry["type"],
    eventDate: row.eventDate ?? undefined,
    location: row.location ?? undefined,
    message: row.message,
    budget: row.budget ?? undefined,
    status: row.status as Inquiry["status"],
    source: row.source ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function categoryLabel(slug: string): string {
  const map: Record<string, string> = {
    dugun: "Düğün",
    nisan: "Nişan",
    "dis-cekim": "Dış Çekim",
    urun: "Ürün",
    dukkan: "Dükkan",
    drone: "Drone",
    kurumsal: "Kurumsal",
    portre: "Portre",
  };
  return map[slug] ?? slug;
}

export function formatPrice(amount: number | null, currency = "TRY"): string {
  if (amount == null) return "Teklif üzerine";
  return (
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount) + "’den"
  );
}
