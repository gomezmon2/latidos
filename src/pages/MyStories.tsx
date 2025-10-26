import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ExperienceService } from "@/services/experience.service";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes";
import { BookOpen, Users, Plus } from "lucide-react";
import type { ExperienceWithAuthor } from "@/types/experience";

/**
 * MyStories Page
 * View user's own stories and stories shared with them
 */
const MyStories = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myStories, setMyStories] = useState<ExperienceWithAuthor[]>([]);
  const [sharedStories, setSharedStories] = useState<ExperienceWithAuthor[]>([]);
  const [isLoadingMy, setIsLoadingMy] = useState(true);
  const [isLoadingShared, setIsLoadingShared] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadMyStories();
    loadSharedStories();
  }, [user, navigate]);

  const loadMyStories = async () => {
    setIsLoadingMy(true);
    try {
      const data = await ExperienceService.getMyStories();
      setMyStories(data);
    } catch (error) {
      console.error("Error loading my stories:", error);
    } finally {
      setIsLoadingMy(false);
    }
  };

  const loadSharedStories = async () => {
    setIsLoadingShared(true);
    try {
      const data = await ExperienceService.getSharedStories();
      setSharedStories(data);
    } catch (error) {
      console.error("Error loading shared stories:", error);
    } finally {
      setIsLoadingShared(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mis Historias</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona tus historias y descubre las que han compartido contigo
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.CREATE_EXPERIENCE)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva historia
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-stories" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-stories" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Mis historias ({myStories.length})
            </TabsTrigger>
            <TabsTrigger value="shared" className="gap-2">
              <Users className="h-4 w-4" />
              Compartidas ({sharedStories.length})
            </TabsTrigger>
          </TabsList>

          {/* My Stories Tab */}
          <TabsContent value="my-stories" className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Tus historias (públicas y privadas)</span>
              </div>
            </div>

            {isLoadingMy ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-lg" />
                ))}
              </div>
            ) : myStories.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Aún no tienes historias
                </h3>
                <p className="text-muted-foreground mb-6">
                  Comparte tu primera experiencia auténtica con la comunidad
                </p>
                <Button onClick={() => navigate(ROUTES.CREATE_EXPERIENCE)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear mi primera historia
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myStories.map((experience) => (
                  <div
                    key={experience.id}
                    className="relative border-2 border-green-500 rounded-lg p-1 bg-gradient-to-br from-green-50 to-transparent"
                  >
                    <ExperienceCard experience={experience} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Shared Stories Tab */}
          <TabsContent value="shared" className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Historias compartidas contigo por tus conexiones</span>
              </div>
            </div>

            {isLoadingShared ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-lg" />
                ))}
              </div>
            ) : sharedStories.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No hay historias compartidas
                </h3>
                <p className="text-muted-foreground mb-6">
                  Conecta con otros usuarios para ver sus historias privadas
                </p>
                <Button onClick={() => navigate(ROUTES.COMPARTIDOS)} variant="outline">
                  Ver mis conexiones
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedStories.map((experience) => (
                  <div
                    key={experience.id}
                    className="relative border-2 border-purple-500 rounded-lg p-1 bg-gradient-to-br from-purple-50 to-transparent"
                  >
                    <ExperienceCard experience={experience} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyStories;
