import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ExperienceCard } from "@/components/ExperienceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteService } from "@/services/favorite.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ROUTES } from "@/routes";
import type { FavoriteWithExperience } from "@/types/favorite";
import type { ExperienceWithAuthor } from "@/types/experience";

/**
 * Favorites Page
 * Shows all experiences marked as favorite by the current user
 */
const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteWithExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await FavoriteService.getMyFavorites();
      setFavorites(data);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      toast.error("Error al cargar tus favoritos");
    } finally {
      setIsLoading(false);
    }
  };

  // Convertir FavoriteWithExperience a ExperienceWithAuthor para el ExperienceCard
  const mapToExperience = (fav: FavoriteWithExperience): ExperienceWithAuthor => ({
    id: fav.experience.id,
    title: fav.experience.title,
    content: "",
    excerpt: fav.experience.excerpt,
    image_url: fav.experience.image_url,
    user_id: "", // No necesario para la visualización
    created_at: fav.experience.created_at,
    updated_at: fav.experience.created_at,
    author_name: fav.experience.author_name,
    author_avatar: fav.experience.author_avatar,
    reactions_count: 0,
    comments_count: 0,
    tags: [],
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      {/* Header */}
      <div className="bg-card border-b border-border/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-yellow-500/10">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mis Favoritos</h1>
              <p className="text-muted-foreground mt-1">
                Historias que has guardado para leer más tarde
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-6 rounded-full bg-muted/50 mb-6">
              <Heart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Aún no tienes favoritos
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Comienza a explorar historias y marca como favoritas las que más te gusten.
              Aparecerán aquí para que puedas encontrarlas fácilmente.
            </p>
            <button
              onClick={() => navigate(ROUTES.EXPLORE)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Explorar historias
            </button>
          </div>
        ) : (
          // Favorites grid
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? "historia" : "historias"} guardada
                {favorites.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <ExperienceCard
                  key={fav.id}
                  experience={mapToExperience(fav)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Favorites;
