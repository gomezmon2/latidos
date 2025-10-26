import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CommentService } from "@/services/comment.service";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes";

interface CommentFormProps {
  experienceId: string;
  onCommentAdded: () => void;
}

/**
 * Comment Form Component
 * Form to add new comments to an experience
 */
export const CommentForm = ({ experienceId, onCommentAdded }: CommentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para comentar",
        variant: "destructive",
      });
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Comentario vacío",
        description: "Escribe algo antes de enviar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await CommentService.createComment({
        experience_id: experienceId,
        content: content.trim(),
      });

      toast({
        title: "¡Comentario publicado!",
        description: "Tu comentario ha sido añadido",
      });

      setContent("");
      onCommentAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar el comentario",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Inicia sesión para dejar un comentario
        </p>
        <Button onClick={() => navigate(ROUTES.LOGIN)}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu comentario..."
        rows={3}
        maxLength={500}
        className="resize-none"
        disabled={isSubmitting}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {content.length}/500 caracteres
        </p>
        <Button type="submit" disabled={isSubmitting || !content.trim()} className="gap-2">
          {isSubmitting ? (
            "Enviando..."
          ) : (
            <>
              <Send className="h-4 w-4" />
              Comentar
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
