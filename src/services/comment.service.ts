import { supabase } from "@/integrations/supabase/client";
import type { Comment, CommentWithAuthor, CommentWithReplies, CreateCommentDTO, UpdateCommentDTO } from "@/types/comment";

export class CommentService {
  /**
   * Get all comments for an experience with author information
   * Using manual JOIN to avoid schema cache issues
   */
  static async getCommentsByExperience(experienceId: string): Promise<CommentWithAuthor[]> {
    // First, get all comments for this experience
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("experience_id", experienceId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      throw new Error("No se pudieron cargar los comentarios");
    }

    if (!comments || comments.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(comments.map((c) => c.user_id))];

    // Fetch all profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      // Don't throw error, just return comments without author info
    }

    // Create a map of profiles by user_id
    const profilesMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    // Combine comments with author information
    return comments.map((comment) => {
      const profile = profilesMap.get(comment.user_id);
      return {
        ...comment,
        author_name: profile?.full_name || null,
        author_avatar: profile?.avatar_url || null,
      };
    });
  }

  /**
   * Get comments organized in a tree structure (nested replies)
   */
  static async getCommentsTree(experienceId: string): Promise<CommentWithReplies[]> {
    // Get all comments with author info
    const allComments = await this.getCommentsByExperience(experienceId);

    // Separate top-level comments and replies
    const topLevelComments: CommentWithReplies[] = [];
    const repliesMap = new Map<string, CommentWithReplies[]>();

    // First pass: organize comments
    allComments.forEach((comment) => {
      const commentWithReplies: CommentWithReplies = {
        ...comment,
        replies: [],
        replies_count: 0,
      };

      if (!comment.parent_comment_id) {
        // Top-level comment
        topLevelComments.push(commentWithReplies);
      } else {
        // Reply to another comment
        if (!repliesMap.has(comment.parent_comment_id)) {
          repliesMap.set(comment.parent_comment_id, []);
        }
        repliesMap.get(comment.parent_comment_id)!.push(commentWithReplies);
      }
    });

    // Recursive function to build the tree
    const buildTree = (comment: CommentWithReplies): CommentWithReplies => {
      const replies = repliesMap.get(comment.id) || [];

      // Recursively build trees for all replies
      comment.replies = replies.map(buildTree);
      comment.replies_count = comment.replies.length;

      return comment;
    };

    // Build trees for all top-level comments
    return topLevelComments.map(buildTree);
  }

  /**
   * Get replies for a specific comment
   */
  static async getReplies(parentCommentId: string): Promise<CommentWithAuthor[]> {
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("parent_comment_id", parentCommentId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching replies:", commentsError);
      throw new Error("No se pudieron cargar las respuestas");
    }

    if (!comments || comments.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(comments.map((c) => c.user_id))];

    // Fetch all profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create a map of profiles by user_id
    const profilesMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    // Combine comments with author information
    return comments.map((comment) => {
      const profile = profilesMap.get(comment.user_id);
      return {
        ...comment,
        author_name: profile?.full_name || null,
        author_avatar: profile?.avatar_url || null,
      };
    });
  }

  /**
   * Create a new comment (can be top-level or a reply)
   */
  static async createComment(commentData: CreateCommentDTO): Promise<Comment> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión para comentar");
    }

    console.log("Creating comment with data:", {
      experience_id: commentData.experience_id,
      user_id: user.id,
      content: commentData.content,
      parent_comment_id: commentData.parent_comment_id || null,
    });

    const { data, error } = await supabase
      .from("comments")
      .insert({
        experience_id: commentData.experience_id,
        user_id: user.id,
        content: commentData.content,
        parent_comment_id: commentData.parent_comment_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(`No se pudo crear el comentario: ${error.message}`);
    }

    console.log("Comment created successfully:", data);
    return data;
  }

  /**
   * Update a comment
   */
  static async updateComment(
    commentId: string,
    updateData: UpdateCommentDTO
  ): Promise<Comment> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión");
    }

    // Verify ownership
    const { data: existingComment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (!existingComment || existingComment.user_id !== user.id) {
      throw new Error("No puedes editar comentarios de otros usuarios");
    }

    const { data, error } = await supabase
      .from("comments")
      .update({
        content: updateData.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating comment:", error);
      throw new Error("No se pudo actualizar el comentario");
    }

    return data;
  }

  /**
   * Delete a comment (will cascade delete all replies due to ON DELETE CASCADE)
   */
  static async deleteComment(commentId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión");
    }

    // Verify ownership
    const { data: existingComment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (!existingComment || existingComment.user_id !== user.id) {
      throw new Error("No puedes eliminar comentarios de otros usuarios");
    }

    const { error } = await supabase.from("comments").delete().eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      throw new Error("No se pudo eliminar el comentario");
    }
  }

  /**
   * Get comment count for an experience (all comments including replies)
   */
  static async getCommentCount(experienceId: string): Promise<number> {
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("experience_id", experienceId);

    if (error) {
      console.error("Error counting comments:", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get count of direct replies to a comment
   */
  static async getReplyCount(commentId: string): Promise<number> {
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("parent_comment_id", commentId);

    if (error) {
      console.error("Error counting replies:", error);
      return 0;
    }

    return count || 0;
  }
}
