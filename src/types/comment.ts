/**
 * Types for comments system with nested replies support
 */

export interface Comment {
  id: string;
  experience_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null; // NULL for top-level comments
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends Comment {
  author_name: string | null;
  author_avatar: string | null;
}

/**
 * Comment with nested replies for tree structure
 */
export interface CommentWithReplies extends CommentWithAuthor {
  replies: CommentWithReplies[];
  replies_count: number;
}

export interface CreateCommentDTO {
  experience_id: string;
  content: string;
  parent_comment_id?: string | null; // Optional: ID of parent comment for replies
}

export interface UpdateCommentDTO {
  content: string;
}
