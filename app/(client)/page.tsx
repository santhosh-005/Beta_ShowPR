import { HeroSection } from "@/components/landing/hero-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { DemoSection } from "@/components/landing/demo-section";
import { CTASection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <FeatureSection />
      <DemoSection />
      <CTASection />
    </div>
  );
}