import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/routes";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-community.jpg";

export const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Comunidad compartiendo momentos auténticos"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
          Comparte tus momentos auténticos
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Un espacio libre de likes y algoritmos. Solo historias reales, experiencias genuinas
          y conexiones humanas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {user ? (
            <Link to={ROUTES.CREATE}>
              <Button variant="hero" size="lg" className="group">
                Comenzar a compartir
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to={ROUTES.REGISTER}>
                <Button variant="hero" size="lg" className="group">
                  Comenzar a compartir
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to={ROUTES.EXPLORE}>
                <Button variant="outline" size="lg">
                  Explorar como invitado
                </Button>
              </Link>
            </>
          )}
          {user && (
            <Link to={ROUTES.EXPLORE}>
              <Button variant="outline" size="lg">
                Explorar historias
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl -z-10" />
    </section>
  );
};
