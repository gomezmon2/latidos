import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Heart, MessageCircle } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { TagBadge } from "@/components/TagBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ROUTES } from "@/routes";
import type { ExperienceWithAuthor } from "@/types/experience";

interface ExperienceCardProps {
  experience: ExperienceWithAuthor;
}

export const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  const navigate = useNavigate();

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

  const handleClick = () => {
    navigate(`${ROUTES.EXPERIENCE}/${experience.id}`);
  };

  return (
    <Card
      className="overflow-hidden group hover:shadow-[var(--shadow-elevated)] transition-[var(--transition-smooth)] cursor-pointer border-border/50"
      onClick={handleClick}
    >
      {/* Image */}
      {experience.image_url ? (
        <div className="relative h-64 overflow-hidden bg-muted">
          <ImageWithFallback
            src={experience.image_url}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackMessage="Imagen no disponible"

          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Botón de favorito sobre la imagen */}
          <div className="absolute top-3 right-3">
            <FavoriteButton
              experienceId={experience.id}
              experienceTitle={experience.title}
              variant="default"
              className="bg-white/90 hover:bg-white shadow-lg"
            />
          </div>
        </div>
      ) : (
        <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Sin imagen</p>

          {/* Botón de favorito cuando no hay imagen */}
          <div className="absolute top-3 right-3">
            <FavoriteButton
              experienceId={experience.id}
              experienceTitle={experience.title}
              variant="default"
              className="bg-white/90 hover:bg-white shadow-lg"
            />
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage
              src={experience.author_avatar || ""}
              alt={experience.author_name || "Usuario"}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(experience.author_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {experience.author_name || "Usuario anónimo"}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(experience.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Title & Excerpt */}
        <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {experience.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
          {experience.excerpt || experience.content.substring(0, 150) + "..."}
        </p>

        {/* Tags */}
        {experience.tags && experience.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {experience.tags.slice(0, 3).map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                variant="secondary"
                size="sm"
              />
            ))}
            {experience.tags.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{experience.tags.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border/50 pt-4">
          <div className="flex items-center gap-1 hover:text-primary transition-colors">
            <Heart className="h-4 w-4" />
            <span>{experience.reactions_count || 0}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-primary transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span>{experience.comments_count || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
