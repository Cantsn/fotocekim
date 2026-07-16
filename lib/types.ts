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
  slug: string;
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
  description?: string;
  priceFrom: number | null;
  currency: string;
  features: string[];
  highlight: boolean;
  order: number;
  published: boolean;
}

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  clientFirstName?: string;
  clientLastName?: string;
  clientName?: string;
  location?: string;
  plato?: string;
  date?: string;
  category: string;
  description: string;
  coverUrl?: string;
  published: boolean;
  featured: boolean;
  order: number;
  images: ProjectImage[];
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
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpFrom: string;
  smtpSecure: boolean;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: InquiryType;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  message: string;
  budget?: string;
  status: InquiryStatus;
  source?: string;
  createdAt: string;
}

export interface TeamUser {
  id: string;
  email: string;
  name: string;
  isOwner: boolean;
  active: boolean;
  permissions: string[];
  createdAt: string;
}
