import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FavoriteService } from "@/services/favorite.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  experienceId: string;
  experienceTitle?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export const FavoriteButton = ({
  experienceId,
  experienceTitle = "esta historia",
  variant = "ghost",
  size = "icon",
  showLabel = false,
  className,
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Función para validar si el ID es un UUID válido
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Verificar si es favorito al montar el componente
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Si el ID no es un UUID válido (datos mock), no hacer nada
      if (!isValidUUID(experienceId)) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await FavoriteService.isFavorite(experienceId);
        setIsFavorite(result);
      } catch (error) {
        console.error("Error al verificar favorito:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavorite();
  }, [experienceId, user]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    // Prevenir propagación para que no active el click de la card
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para agregar favoritos");
      return;
    }

    // Si el ID no es un UUID válido (datos mock), mostrar mensaje informativo
    if (!isValidUUID(experienceId)) {
      toast.info("Esta es una historia de ejemplo", {
        description: "Los favoritos solo funcionan con historias reales",
      });
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const newState = await FavoriteService.toggleFavorite(experienceId);
      setIsFavorite(newState);

      if (newState) {
        toast.success(`Agregado a favoritos`, {
          description: experienceTitle,
        });
      } else {
        toast.info(`Quitado de favoritos`, {
          description: experienceTitle,
        });
      }
    } catch (error) {
      console.error("Error al alternar favorito:", error);
      toast.error("Error al actualizar favorito");
    } finally {
      setIsProcessing(false);
    }
  };

  // No mostrar nada mientras carga
  if (isLoading) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isProcessing || !user}
      className={cn(
        "transition-all",
        isFavorite && "text-yellow-500 hover:text-yellow-600",
        className
      )}
      title={
        !user
          ? "Inicia sesión para agregar favoritos"
          : isFavorite
          ? "Quitar de favoritos"
          : "Agregar a favoritos"
      }
    >
      <Star
        className={cn(
          "h-5 w-5 transition-all",
          isFavorite && "fill-yellow-500"
        )}
      />
      {showLabel && (
        <span className="ml-2">
          {isFavorite ? "Favorito" : "Agregar a favoritos"}
        </span>
      )}
    </Button>
  );
};
