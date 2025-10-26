import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhatIsLatidos } from "@/components/WhatIsLatidos";
import {
  FeaturesSection,
  ExperiencesSection,
  CTASection,
  Footer,
} from "@/components/sections";

/**
 * Index Page - Homepage
 * Main landing page displaying hero, features, experiences, and CTA
 */
const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <WhatIsLatidos />
      <FeaturesSection />
      <ExperiencesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
