import type {
  Announcement,
  Faq,
  Inquiry,
  Package,
  Project,
  ProjectImage,
  Service,
  SiteSettings,
  TeamUser,
  Testimonial,
} from "./types";
import { prisma } from "./prisma";
import { parsePermissions } from "./permissions";

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
  smtpEnabled: false,
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
  smtpFrom: "",
  smtpSecure: true,
};

export const siteSettings = defaultSiteSettings;

function computePackagePrice(
  priceFrom: number | null,
  discountType: string,
  discountValue: number | null,
): { finalPrice: number | null; hasDiscount: boolean; discountType: Package["discountType"]; discountValue: number | null } {
  const type =
    discountType === "PERCENT" || discountType === "AMOUNT"
      ? discountType
      : "NONE";
  const value =
    discountValue != null && Number.isFinite(discountValue)
      ? Math.max(0, Math.floor(discountValue))
      : null;

  if (priceFrom == null || type === "NONE" || value == null || value <= 0) {
    return {
      finalPrice: priceFrom,
      hasDiscount: false,
      discountType: "NONE",
      discountValue: null,
    };
  }

  if (type === "PERCENT") {
    const pct = Math.min(100, value);
    const final = Math.round(priceFrom * (1 - pct / 100));
    return {
      finalPrice: Math.max(0, final),
      hasDiscount: pct > 0 && final < priceFrom,
      discountType: "PERCENT",
      discountValue: pct,
    };
  }

  // AMOUNT
  const final = Math.max(0, priceFrom - value);
  return {
    finalPrice: final,
    hasDiscount: value > 0 && final < priceFrom,
    discountType: "AMOUNT",
    discountValue: value,
  };
}

function mapPackage(p: {
  id: string;
  slug: string;
  name: string;
  description?: string;
  priceFrom: number | null;
  currency: string;
  discountType?: string;
  discountValue?: number | null;
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
  const pricing = computePackagePrice(
    p.priceFrom,
    p.discountType ?? "NONE",
    p.discountValue ?? null,
  );
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    priceFrom: p.priceFrom,
    currency: p.currency,
    discountType: pricing.discountType,
    discountValue: pricing.discountValue,
    finalPrice: pricing.finalPrice,
    hasDiscount: pricing.hasDiscount,
    features,
    highlight: p.highlight,
    order: p.order,
    published: p.published,
  };
}

function mapImages(
  images: { id: string; url: string; alt: string; order: number }[],
): ProjectImage[] {
  return images
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((i) => ({ id: i.id, url: i.url, alt: i.alt, order: i.order }));
}

function mapProject(p: {
  id: string;
  slug: string;
  title: string;
  clientFirstName: string | null;
  clientLastName: string | null;
  clientName: string | null;
  location: string | null;
  plato: string | null;
  date: Date | null;
  category: string;
  description: string;
  coverUrl: string | null;
  published: boolean;
  featured: boolean;
  order: number;
  images?: { id: string; url: string; alt: string; order: number }[];
}): Project {
  const images = mapImages(p.images ?? []);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    clientFirstName: p.clientFirstName ?? undefined,
    clientLastName: p.clientLastName ?? undefined,
    clientName:
      p.clientName ??
      ([p.clientFirstName, p.clientLastName].filter(Boolean).join(" ") ||
        undefined),
    location: p.location ?? undefined,
    plato: p.plato ?? undefined,
    date: p.date ? p.date.toISOString().slice(0, 10) : undefined,
    category: p.category,
    description: p.description,
    coverUrl: p.coverUrl ?? images[0]?.url,
    published: p.published,
    featured: p.featured,
    order: p.order,
    images,
  };
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
      smtpEnabled: row.smtpEnabled,
      smtpHost: row.smtpHost,
      smtpPort: row.smtpPort,
      smtpUser: row.smtpUser,
      smtpPassword: row.smtpPassword,
      smtpFrom: row.smtpFrom,
      smtpSecure: row.smtpSecure,
    };
  } catch {
    return defaultSiteSettings;
  }
}

export async function getPublishedServices(): Promise<Service[]> {
  const rows = await prisma.service.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map(mapService);
}

export async function getAllServices(): Promise<Service[]> {
  const rows = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return rows.map(mapService);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const row = await prisma.service.findFirst({
    where: { slug, published: true },
  });
  return row ? mapService(row) : null;
}

export async function getServiceById(id: string): Promise<Service | null> {
  const row = await prisma.service.findUnique({ where: { id } });
  return row ? mapService(row) : null;
}

export async function getPublishedPackages(): Promise<Package[]> {
  const rows = await prisma.package.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map(mapPackage);
}

export async function getAllPackages(): Promise<Package[]> {
  const rows = await prisma.package.findMany({ orderBy: { order: "asc" } });
  return rows.map(mapPackage);
}

export async function getPackageById(id: string): Promise<Package | null> {
  const row = await prisma.package.findUnique({ where: { id } });
  return row ? mapPackage(row) : null;
}

export async function getPublishedProjects(category?: string): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
    },
    include: { images: true },
    orderBy: { order: "asc" },
  });
  return rows.map(mapProject);
}

export async function getAllProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    include: { images: true },
    orderBy: { order: "asc" },
  });
  return rows.map(mapProject);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { published: true, featured: true },
    include: { images: true },
    orderBy: { order: "asc" },
  });
  return rows.map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const row = await prisma.project.findFirst({
    where: { slug, published: true },
    include: { images: true },
  });
  return row ? mapProject(row) : null;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const row = await prisma.project.findUnique({
    where: { id },
    include: { images: true },
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

function mapTestimonial(t: {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  published: boolean;
  order: number;
}): Testimonial {
  return {
    id: t.id,
    name: t.name,
    role: t.role ?? undefined,
    content: t.content,
    rating: t.rating,
    published: t.published,
    order: t.order,
  };
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const rows = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return rows.map(mapTestimonial);
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const rows = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapTestimonial);
}

export async function getTestimonialById(
  id: string,
): Promise<Testimonial | null> {
  const row = await prisma.testimonial.findUnique({ where: { id } });
  return row ? mapTestimonial(row) : null;
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
    eventTime: r.eventTime ?? undefined,
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
      eventTime: data.eventTime,
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
    eventTime: row.eventTime ?? undefined,
    location: row.location ?? undefined,
    message: row.message,
    budget: row.budget ?? undefined,
    status: row.status as Inquiry["status"],
    source: row.source ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapAnnouncement(a: {
  id: string;
  title: string;
  message: string;
  linkUrl: string;
  linkLabel: string;
  style: string;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  order: number;
}): Announcement {
  return {
    id: a.id,
    title: a.title,
    message: a.message,
    linkUrl: a.linkUrl,
    linkLabel: a.linkLabel,
    style: a.style,
    active: a.active,
    startsAt: a.startsAt ?? undefined,
    endsAt: a.endsAt ?? undefined,
    order: a.order,
  };
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const rows = await prisma.announcement.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapAnnouncement);
}

/** Ana sayfada gösterilecek aktif duyuru (varsa) */
export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await prisma.announcement.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  for (const a of rows) {
    if (a.startsAt && a.startsAt > today) continue;
    if (a.endsAt && a.endsAt < today) continue;
    return mapAnnouncement(a);
  }
  return null;
}

export async function getAnnouncementById(
  id: string,
): Promise<Announcement | null> {
  const row = await prisma.announcement.findUnique({ where: { id } });
  return row ? mapAnnouncement(row) : null;
}

export async function getTeamUsers(): Promise<TeamUser[]> {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    isOwner: u.isOwner,
    active: u.active,
    permissions: parsePermissions(u.permissions),
    createdAt: u.createdAt.toISOString(),
  }));
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

export function formatPriceAmount(
  amount: number | null,
  currency = "TRY",
): string {
  if (amount == null) return "Teklif üzerine";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(amount: number | null, currency = "TRY"): string {
  if (amount == null) return "Teklif üzerine";
  return formatPriceAmount(amount, currency) + "’den";
}

export function formatDiscountBadge(pkg: Package): string | null {
  if (!pkg.hasDiscount || pkg.discountValue == null) return null;
  if (pkg.discountType === "PERCENT") return `%${pkg.discountValue}`;
  if (pkg.discountType === "AMOUNT") {
    return `-${formatPriceAmount(pkg.discountValue, pkg.currency)}`;
  }
  return null;
}

export { CATEGORY_OPTIONS } from "./constants";
