import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CommentItem } from "@/components/CommentItem";
import { CommentService } from "@/services/comment.service";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes";
import { toast } from "sonner";
import type { CommentWithReplies } from "@/types/comment";

interface CommentThreadProps {
  experienceId: string;
}

export function CommentThread({ experienceId }: CommentThreadProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [experienceId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const commentsTree = await CommentService.getCommentsTree(experienceId);
      setComments(commentsTree);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("No se pudieron cargar los comentarios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para comentar");
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!newComment.trim()) {
      toast.error("El comentario no puede estar vacío");
      return;
    }

    setIsSubmitting(true);
    try {
      await CommentService.createComment({
        experience_id: experienceId,
        content: newComment.trim(),
      });

      setNewComment("");
      toast.success("Comentario publicado");
      await loadComments(); // Reload comments to show the new one
    } catch (error: any) {
      console.error("Error creating comment:", error);
      toast.error(error.message || "No se pudo publicar el comentario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión para responder");
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      await CommentService.createComment({
        experience_id: experienceId,
        content: content.trim(),
        parent_comment_id: parentId,
      });

      toast.success("Respuesta publicada");
      await loadComments(); // Reload comments to show the new reply
    } catch (error: any) {
      console.error("Error replying to comment:", error);
      toast.error(error.message || "No se pudo publicar la respuesta");
      throw error; // Re-throw to let CommentItem handle it
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      await CommentService.updateComment(commentId, {
        content: content.trim(),
      });

      toast.success("Comentario actualizado");
      await loadComments(); // Reload comments to show the update
    } catch (error: any) {
      console.error("Error editing comment:", error);
      toast.error(error.message || "No se pudo editar el comentario");
      throw error; // Re-throw to let CommentItem handle it
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await CommentService.deleteComment(commentId);
      toast.success("Comentario eliminado");
      await loadComments(); // Reload comments to reflect the deletion
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error(error.message || "No se pudo eliminar el comentario");
      throw error; // Re-throw to let CommentItem handle it
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando comentarios...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Comentarios ({comments.length})
      </h3>

      {/* New comment form */}
      <div className="mb-6">
        {user ? (
          <>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="min-h-[100px] mb-2"
              disabled={isSubmitting}
            />
            <Button
              onClick={handleCreateComment}
              disabled={isSubmitting || !newComment.trim()}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                "Publicar comentario"
              )}
            </Button>
          </>
        ) : (
          <div className="bg-muted/30 border rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-3">
              Inicia sesión para comentar en esta historia
            </p>
            <Button onClick={() => navigate(ROUTES.LOGIN)} size="sm">
              Iniciar sesión
            </Button>
          </div>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aún no hay comentarios.</p>
            <p className="text-sm mt-1">¡Sé el primero en comentar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </Card>
  );
}
