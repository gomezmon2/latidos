import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Pencil, Trash2, Check, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { CommentWithReplies } from "@/types/comment";

interface CommentItemProps {
  comment: CommentWithReplies;
  depth?: number;
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onToggleReplies?: (commentId: string) => void;
}

export function CommentItem({
  comment,
  depth = 0,
  onReply,
  onEdit,
  onDelete,
  onToggleReplies,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 5; // Límite de anidación para evitar problemas de UI

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error("El comentario no puede estar vacío");
      return;
    }

    // Verificar límite de profundidad antes de enviar
    if (depth >= maxDepth) {
      toast.error(`No se pueden crear respuestas más allá del nivel ${maxDepth}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setIsReplying(false);
      setShowReplies(true); // Auto-expand replies after posting
    } catch (error) {
      console.error("Error replying to comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReply = () => {
    if (depth >= maxDepth) {
      toast.warning(
        `Has alcanzado el límite de ${maxDepth} niveles de respuestas. Responde a un comentario de nivel superior.`,
        {
          duration: 4000,
        }
      );
      return;
    }
    setIsReplying(!isReplying);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de eliminar este comentario? Se eliminarán también todas las respuestas.")) {
      return;
    }
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
    if (onToggleReplies) {
      onToggleReplies(comment.id);
    }
  };

  // Calculate indentation based on depth
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)}` : "";

  return (
    <div className={`${indentClass} ${depth > 0 ? "border-l-2 border-gray-200 dark:border-gray-700 pl-4" : ""}`}>
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author_avatar || undefined} />
          <AvatarFallback>
            {comment.author_name?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author and timestamp */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {comment.author_name || "Usuario desconocido"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-muted-foreground italic">(editado)</span>
            )}
          </div>

          {/* Comment content */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                placeholder="Edita tu comentario..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isSubmitting || !editContent.trim()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Action buttons */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-2">
              {/* Reply button */}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleReply}
                  className="h-7 px-2 text-xs"
                  disabled={depth >= maxDepth}
                  title={
                    depth >= maxDepth
                      ? `Límite de ${maxDepth} niveles alcanzado`
                      : "Responder a este comentario"
                  }
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Responder
                  {depth >= maxDepth && (
                    <AlertCircle className="h-3 w-3 ml-1 text-amber-500" />
                  )}
                </Button>
              )}

              {/* Show/hide replies button */}
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleReplies}
                  className="h-7 px-2 text-xs"
                >
                  {showReplies ? "Ocultar" : "Ver"} {comment.replies_count}{" "}
                  {comment.replies_count === 1 ? "respuesta" : "respuestas"}
                </Button>
              )}

              {/* Edit button (only for owner) */}
              {isOwner && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-7 px-2 text-xs"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Reply form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              {depth >= maxDepth - 1 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-200">
                    Estás en el nivel {depth + 1} de anidación. Este será uno de los últimos niveles permitidos.
                  </p>
                </div>
              )}
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
                placeholder="Escribe tu respuesta..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Responder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {showReplies && hasReplies && (
            <div className="mt-3 space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleReplies={onToggleReplies}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
