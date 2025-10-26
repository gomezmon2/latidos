import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Heart, Calendar, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ExperienceService } from "@/services/experience.service";
import { ROUTES } from "@/routes";
import { Navbar } from "@/components/Navbar";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ReactionButtons } from "@/components/ReactionButtons";
import { CommentThread } from "@/components/CommentThread";
import { TagBadge } from "@/components/TagBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ConnectionButton } from "@/components/ConnectionButton";
import type { ExperienceWithAuthor } from "@/types/experience";

/**
 * Experience Detail Page
 * View a single experience/story with full content
 */
const ExperienceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<ExperienceWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate(ROUTES.HOME);
      return;
    }

    loadExperience();
  }, [id]);

  const loadExperience = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await ExperienceService.getExperienceById(id);
      if (!data) {
        toast({
          title: "Historia no encontrada",
          description: "Esta historia no existe o fue eliminada",
          variant: "destructive",
        });
        navigate(ROUTES.EXPLORE);
        return;
      }
      setExperience(data);
    } catch (error: any) {
      toast({
        title: "Error al cargar",
        description: error.message || "No se pudo cargar la historia",
        variant: "destructive",
      });
      navigate(ROUTES.EXPLORE);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async () => {
    if (!experience || !id) return;

    const confirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar esta historia? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await ExperienceService.deleteExperience(id);
      toast({
        title: "Historia eliminada",
        description: "Tu historia ha sido eliminada exitosamente",
      });
      navigate(ROUTES.PROFILE);
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar la historia",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAuthor = user && experience && user.id === experience.user_id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card>
            <Skeleton className="h-96 w-full rounded-t-lg" />
            <CardContent className="p-8 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!experience) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.EXPLORE)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a explorar
        </Button>

        {/* Experience Card */}
        <Card className="overflow-hidden">
          {/* Featured Image */}
          {experience.image_url && (
            <div className="relative w-full h-96">
              <ImageWithFallback
                src={experience.image_url}
                alt={experience.title}
                className="w-full h-full object-cover"
                fallbackMessage="La imagen no se pudo cargar"
                
              />
            </div>
          )}

          <CardContent className="p-8">
            {/* Title */}
            <h1 className="text-4xl font-bold mb-4">{experience.title}</h1>

            {/* Tags */}
            {experience.tags && experience.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {experience.tags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    variant="secondary"
                    size="md"
                  />
                ))}
              </div>
            )}

            {/* Author & Date */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={experience.author_avatar || ""}
                  alt={experience.author_name || "Usuario"}
                />
                <AvatarFallback>
                  {getInitials(experience.author_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">
                  {experience.author_name || "Usuario anónimo"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(experience.created_at)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-8">
                {/* Favorite Button */}
                <FavoriteButton
                  experienceId={experience.id}
                  experienceTitle={experience.title}
                  variant="outline"
                  showLabel={true}
                />

                {/* Connection Button - Solo si NO es el autor */}
                {!isAuthor && user && (
                  <ConnectionButton
                    userId={experience.user_id}
                    userName={experience.author_name || undefined}
                  />
                )}

                {/* Author Actions */}
                {isAuthor && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`${ROUTES.EXPERIENCE}/${id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {experience.content}
              </p>
            </div>

            <Separator className="mb-6" />

            {/* Reactions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Reacciones</h3>
              {user ? (
                <ReactionButtons experienceId={experience.id} />
              ) : (
                <div className="bg-muted/30 border rounded-lg p-6 text-center">
                  <p className="text-muted-foreground mb-3">
                    Inicia sesión para reaccionar a esta historia
                  </p>
                  <Button onClick={() => navigate(ROUTES.LOGIN)} size="sm">
                    Iniciar sesión
                  </Button>
                </div>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Comments Section */}
            <div>
              <CommentThread experienceId={experience.id} />
            </div>

            {/* Placeholder for future actions */}
            <div className="hidden">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      title: "Próximamente",
                      description: "El sistema de reacciones estará disponible pronto",
                    })
                  }
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Reaccionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default ExperienceDetail;
