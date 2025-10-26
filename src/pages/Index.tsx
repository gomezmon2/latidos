import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhatIsLatidos } from "@/components/WhatIsLatidos";
import {
  FeaturesSection,
  ExperiencesSection,
  CTASection,
  Footer,
} from "@/components/sections";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ROUTES } from "@/routes";

/**
 * Index Page - Homepage
 * Landing page for non-authenticated users
 * Redirects to Explore (dashboard) for authenticated users
 */
const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si el usuario está autenticado, redirigir a Explore (que actuará como dashboard)
  useEffect(() => {
    if (user) {
      navigate(ROUTES.EXPLORE);
    }
  }, [user, navigate]);

  // Mostrar landing page solo para usuarios no autenticados
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
