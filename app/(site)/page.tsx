import {
  CtaBand,
  DroneBand,
  FeaturedWorkSection,
  HeroSection,
  PackagesPreviewSection,
  ProcessSection,
  ServicesSection,
  TestimonialsSection,
} from "@/components/home/HomeSections";
import { AnnouncementBanner } from "@/components/home/AnnouncementBanner";
import { getActiveAnnouncement } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const announcement = await getActiveAnnouncement();

  return (
    <>
      {announcement && <AnnouncementBanner announcement={announcement} />}
      <HeroSection />
      <ServicesSection />
      <FeaturedWorkSection />
      <ProcessSection />
      <PackagesPreviewSection />
      <TestimonialsSection />
      <DroneBand />
      <CtaBand />
    </>
  );
}
