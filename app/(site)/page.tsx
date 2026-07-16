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

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
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
