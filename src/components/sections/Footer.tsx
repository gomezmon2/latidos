import { Link } from "react-router-dom";
import { ROUTES } from "@/routes";

/**
 * Footer Component
 * Main footer with navigation links and site information
 */
export const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border/50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to={ROUTES.HOME}>
              <h3 className="font-bold text-2xl mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer">
                Momentos Auténticos
              </h3>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Una plataforma dedicada a preservar y compartir experiencias
              reales, lejos del ruido de las redes sociales tradicionales.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Comunidad</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to={ROUTES.EXPLORE} className="hover:text-primary transition-colors">
                  Explorar
                </Link>
              </li>
              <li>
                <Link to={ROUTES.GUIDES} className="hover:text-primary transition-colors">
                  Guías
                </Link>
              </li>
              <li>
                <Link to={ROUTES.EXPLORE} className="hover:text-primary transition-colors">
                  Historias destacadas
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Acerca de</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to={ROUTES.MISSION} className="hover:text-primary transition-colors">
                  Nuestra misión
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRIVACY} className="hover:text-primary transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border/50 text-center text-muted-foreground">
          <p>
            © 2025 Momentos Auténticos. Hecho con ❤️ por GOMEZMON & Claude para personas reales.
          </p>
        </div>
      </div>
    </footer>
  );
};
