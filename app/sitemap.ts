import type { MetadataRoute } from "next";
import { getPublishedProjects, getPublishedServices } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes = [
    "",
    "/hizmetler",
    "/portfolyo",
    "/paketler",
    "/hakkimizda",
    "/sss",
    "/iletisim",
    "/randevu",
    "/gizlilik",
    "/kullanim-kosullari",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let services: { slug: string }[] = [];
  let projects: { slug: string }[] = [];
  try {
    [services, projects] = await Promise.all([
      getPublishedServices(),
      getPublishedProjects(),
    ]);
  } catch {
    // DB henüz hazır değilse sadece statik rotalar
  }

  return [
    ...staticRoutes,
    ...services.map((s) => ({
      url: `${base}/hizmetler/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...projects.map((p) => ({
      url: `${base}/portfolyo/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
