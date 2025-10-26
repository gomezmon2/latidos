import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ExperienceService } from "@/services/experience.service";
import { ROUTES } from "@/routes";
import type { ExperienceWithAuthor } from "@/types/experience";

/**
 * Experiences Section Component
 * Displays a grid of 4 most recent public experiences
 * TODO: Refine criteria for featured stories (e.g., most liked, trending, etc.)
 */
export const ExperiencesSection = () => {
  const [experiences, setExperiences] = useState<ExperienceWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentExperiences();
  }, []);

  const loadRecentExperiences = async () => {
    try {
      setIsLoading(true);
      const allPublic = await ExperienceService.getPublicExperiences();
      // Get only the 4 most recent
      setExperiences(allPublic.slice(0, 4));
    } catch (error) {
      console.error("Error loading recent experiences:", error);
      setExperiences([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Experiencias recientes
            </h2>
            <p className="text-muted-foreground">
              Historias compartidas por nuestra comunidad
            </p>
          </div>
          <Link to={ROUTES.EXPLORE}>
            <Button variant="outline">Ver todas</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No hay historias públicas aún</p>
            <p className="text-sm mt-2">Sé el primero en compartir una experiencia</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
