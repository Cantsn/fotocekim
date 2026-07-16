export type ServiceCategory =
  | "dugun"
  | "nisan"
  | "dis-cekim"
  | "urun"
  | "dukkan"
  | "drone"
  | "kurumsal"
  | "portre";

export type InquiryType =
  | "WEDDING"
  | "PRODUCT"
  | "DRONE"
  | "CORPORATE"
  | "OTHER";

export type InquiryStatus =
  | "NEW"
  | "READ"
  | "QUOTED"
  | "CONFIRMED"
  | "CANCELLED";

export interface Service {
  id: string;
  slug: ServiceCategory | string;
  title: string;
  shortDesc: string;
  content: string;
  order: number;
  published: boolean;
}

export interface Package {
  id: string;
  slug: string;
  name: string;
  priceFrom: number | null;
  currency: string;
  features: string[];
  highlight: boolean;
  order: number;
  published: boolean;
  serviceSlug?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  clientName?: string;
  location?: string;
  date?: string;
  category: string;
  description: string;
  published: boolean;
  featured: boolean;
  order: number;
  /** Placeholder count for gallery (no real photos yet) */
  galleryCount: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  published: boolean;
  order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  showPrices: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: InquiryType;
  eventDate?: string;
  location?: string;
  message: string;
  budget?: string;
  status: InquiryStatus;
  source?: string;
  createdAt: string;
}
