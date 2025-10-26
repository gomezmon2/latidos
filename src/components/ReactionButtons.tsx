import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ReactionService } from "@/services/reaction.service";
import { REACTION_TYPES, type ReactionType, type ReactionCounts } from "@/types/reaction";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes";

interface ReactionButtonsProps {
  experienceId: string;
}

/**
 * Reaction Buttons Component
 * Displays reaction buttons and handles user reactions
 */
export const ReactionButtons = ({ experienceId }: ReactionButtonsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<ReactionCounts>({ total: 0, byType: {} });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para validar si el ID es un UUID válido
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Load reactions on mount
  useEffect(() => {
    // Solo cargar reacciones si el ID es un UUID válido (no datos mock)
    if (isValidUUID(experienceId)) {
      loadReactions();
    }
  }, [experienceId, user]);

  const loadReactions = async () => {
    try {
      const reactionCounts = await ReactionService.getReactionCounts(experienceId);
      setCounts(reactionCounts);

      if (user) {
        const reaction = await ReactionService.getUserReaction(experienceId, user.id);
        setUserReaction(reaction?.reaction_type || null);
      }
    } catch (error: any) {
      console.error("Error loading reactions:", error);
    }
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para reaccionar",
        variant: "destructive",
      });
      navigate(ROUTES.LOGIN);
      return;
    }

    // Si el ID no es un UUID válido (datos mock), mostrar mensaje informativo
    if (!isValidUUID(experienceId)) {
      toast({
        title: "Esta es una historia de ejemplo",
        description: "Las reacciones solo funcionan con historias reales",
      });
      return;
    }

    setIsLoading(true);

    try {
      await ReactionService.toggleReaction(experienceId, reactionType);

      // Reload reactions to update counts
      await loadReactions();

      toast({
        title: "¡Reacción actualizada!",
        description: userReaction === reactionType
          ? "Reacción eliminada"
          : "Tu reacción ha sido guardada",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar tu reacción",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Reaction Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {REACTION_TYPES.map(({ type, emoji, label }) => {
          const count = counts.byType[type] || 0;
          const isActive = userReaction === type;

          return (
            <Button
              key={type}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleReaction(type)}
              disabled={isLoading}
              className="gap-2 hover:scale-105 transition-transform"
              title={label}
            >
              <span className="text-lg">{emoji}</span>
              {count > 0 && <span className="font-semibold">{count}</span>}
            </Button>
          );
        })}
      </div>

      {/* Total Count */}
      {counts.total > 0 && (
        <p className="text-sm text-muted-foreground">
          {counts.total} {counts.total === 1 ? "reacción" : "reacciones"}
        </p>
      )}
    </div>
  );
};
