import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CommentService } from "@/services/comment.service";
import { Edit2, Trash2, Check, X } from "lucide-react";
import type { CommentWithAuthor } from "@/types/comment";

interface CommentListProps {
  comments: CommentWithAuthor[];
  onCommentsChange: () => void;
}

/**
 * Comment List Component
 * Displays list of comments with edit/delete options
 */
export const CommentList = ({ comments, onCommentsChange }: CommentListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const handleEdit = (comment: CommentWithAuthor) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      toast({
        title: "Comentario vacío",
        description: "El comentario no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      await CommentService.updateComment(commentId, {
        content: editContent.trim(),
      });

      toast({
        title: "¡Comentario actualizado!",
        description: "Los cambios han sido guardados",
      });

      setEditingId(null);
      setEditContent("");
      onCommentsChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el comentario",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      return;
    }

    setIsDeleting(commentId);

    try {
      await CommentService.deleteComment(commentId);

      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado exitosamente",
      });

      onCommentsChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el comentario",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No hay comentarios aún. ¡Sé el primero en comentar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => {
        const isAuthor = user && comment.user_id === user.id;
        const isEditing = editingId === comment.id;

        return (
          <div key={comment.id} className="flex gap-4">
            {/* Avatar */}
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage
                src={comment.author_avatar || ""}
                alt={comment.author_name || "Usuario"}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(comment.author_name)}
              </AvatarFallback>
            </Avatar>

            {/* Comment Content */}
            <div className="flex-1 space-y-2">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {comment.author_name || "Usuario anónimo"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                  {comment.updated_at !== comment.created_at && " (editado)"}
                </span>
              </div>

              {/* Content or Edit Form */}
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="resize-none"
                    disabled={isUpdating}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={isUpdating || !editContent.trim()}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  {/* Actions */}
                  {isAuthor && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(comment)}
                        className="gap-2 h-8 px-2"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span className="text-xs">Editar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(comment.id)}
                        disabled={isDeleting === comment.id}
                        className="gap-2 h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="text-xs">
                          {isDeleting === comment.id ? "Eliminando..." : "Eliminar"}
                        </span>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
