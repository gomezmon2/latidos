import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { ExperienceCard } from "@/components/ExperienceCard";
import { TagFilterBar } from "@/components/TagFilterBar";
import { EmptyState } from "@/components/EmptyState";
import { ExperienceService } from "@/services/experience.service";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Filter, BookOpen, Plus } from "lucide-react";
import { ROUTES } from "@/routes";
import type { ExperienceWithAuthor } from "@/types/experience";

/**
 * Explore Page / Dashboard
 * Browse and search through all experiences
 * Acts as main dashboard for authenticated users
 */
const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<ExperienceWithAuthor[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<ExperienceWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExperiences();
  }, []);

  useEffect(() => {
    filterExperiences();
  }, [searchQuery, selectedTagIds, experiences]);

  const filterExperiences = () => {
    let filtered = experiences;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(query) ||
          exp.content.toLowerCase().includes(query) ||
          exp.excerpt?.toLowerCase().includes(query) ||
          exp.author_name?.toLowerCase().includes(query)
      );
    }

    // Filter by selected tags (OR logic - show if experience has ANY of the selected tags)
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter((exp) => {
        if (!exp.tags || exp.tags.length === 0) return false;
        return exp.tags.some((tag) => selectedTagIds.includes(tag.id));
      });
    }

    setFilteredExperiences(filtered);
  };

  const loadExperiences = async () => {
    setIsLoading(true);
    try {
      const data = await ExperienceService.getPublicExperiences();
      setExperiences(data);
      setFilteredExperiences(data);
    } catch (error) {
      console.error("Error loading experiences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Tag Filter Bar */}
      <TagFilterBar
        selectedTagIds={selectedTagIds}
        onChange={setSelectedTagIds}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {user ? "Tu Feed" : "Explora historias auténticas"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {user
                ? "Descubre historias de la comunidad y tus compartidos"
                : "Descubre experiencias reales compartidas por nuestra comunidad"}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar experiencias, autores..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Results Count */}
          {!isLoading && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                {filteredExperiences.length}{" "}
                {filteredExperiences.length === 1
                  ? "experiencia encontrada"
                  : "experiencias encontradas"}
                {(searchQuery || selectedTagIds.length > 0) && (
                  <span className="ml-1">
                    {searchQuery && selectedTagIds.length > 0
                      ? " (con búsqueda y filtros activos)"
                      : searchQuery
                      ? " (con búsqueda activa)"
                      : " (con filtros activos)"}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Experiences Grid */}
          {!isLoading && filteredExperiences.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredExperiences.length === 0 && (
            <EmptyState
              icon={searchQuery || selectedTagIds.length > 0 ? Search : BookOpen}
              title={
                searchQuery || selectedTagIds.length > 0
                  ? "No se encontraron historias"
                  : "Aún no hay historias"
              }
              description={
                searchQuery || selectedTagIds.length > 0
                  ? "Intenta ajustar los filtros o términos de búsqueda para encontrar más resultados"
                  : user
                  ? "Sé el primero en compartir una experiencia auténtica con la comunidad"
                  : "Regístrate para comenzar a explorar y compartir experiencias auténticas"
              }
              actionLabel={
                searchQuery || selectedTagIds.length > 0
                  ? "Limpiar filtros"
                  : user
                  ? "Compartir mi historia"
                  : "Registrarse"
              }
              onAction={() => {
                if (searchQuery || selectedTagIds.length > 0) {
                  setSearchQuery("");
                  setSelectedTagIds([]);
                } else if (user) {
                  navigate(ROUTES.CREATE);
                } else {
                  navigate(ROUTES.REGISTER);
                }
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Explore;
