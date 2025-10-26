import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes";

/**
 * CTA (Call To Action) Section Component
 * Encourages users to sign up and join the platform
 */
export const CTASection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-primary to-accent">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
          ¿Listo para compartir tu historia?
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Únete a una comunidad que valora la autenticidad y las conexiones
          genuinas.
        </p>
        <Link to={ROUTES.REGISTER}>
          <Button
            size="lg"
            variant="secondary"
            className="shadow-[var(--shadow-elevated)] hover:scale-105 transition-[var(--transition-bounce)]"
          >
            Crear mi cuenta
          </Button>
        </Link>
      </div>
    </section>
  );
};
