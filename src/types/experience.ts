/**
 * Tag Type
 * Matches Supabase tags table
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  description: string | null;
  created_at: string;
}

/**
 * Experience Database Type
 * Matches Supabase experiences table
 */
export interface Experience {
  id: string;
  user_id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  is_public: boolean; // ✨ true = pública, false = privada
  shared_with: string[] | null; // ✨ Array de user_ids para compartir (null = todos los compartidos)
  shared_circle_id: string | null; // ✨ ID del círculo con el que se comparte (null = según shared_with)
  created_at: string;
  updated_at: string;
}

/**
 * Experience with Author Info
 * Matches Supabase experiences_with_author view
 */
export interface ExperienceWithAuthor extends Experience {
  author_name: string | null;
  author_avatar: string | null;
  reactions_count: number;
  comments_count: number;
  tags?: Tag[] | null;
}

/**
 * Create Experience DTO
 * Data Transfer Object for creating new experiences
 */
export interface CreateExperienceDTO {
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  is_public?: boolean; // ✨ default true si no se especifica
  shared_with?: string[] | null; // ✨ Array de user_ids para compartir (null = todos)
  shared_circle_id?: string | null; // ✨ ID del círculo con el que se comparte
  tag_ids?: string[];
}

/**
 * Update Experience DTO
 * Data Transfer Object for updating experiences
 */
export interface UpdateExperienceDTO {
  title?: string;
  content?: string;
  excerpt?: string;
  image_url?: string;
  is_public?: boolean; // ✨ puede cambiar entre pública/privada
  shared_with?: string[] | null; // ✨ Array de user_ids para compartir (null = todos)
  shared_circle_id?: string | null; // ✨ ID del círculo con el que se comparte
  tag_ids?: string[];
}

/**
 * Profile Type
 * Matches Supabase profiles table
 */
export interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Reaction Type
 * Matches Supabase reactions table
 */
export interface Reaction {
  id: string;
  experience_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'celebrate';
  created_at: string;
}

/**
 * Comment Type
 * Matches Supabase comments table
 */
export interface Comment {
  id: string;
  experience_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Comment with Author Info
 */
export interface CommentWithAuthor extends Comment {
  author_name: string | null;
  author_avatar: string | null;
}
