import { supabase } from "@/integrations/supabase/client";
import type {
  Experience,
  ExperienceWithAuthor,
  CreateExperienceDTO,
  UpdateExperienceDTO,
} from "@/types/experience";

/**
 * Experience Service
 * Handles all operations related to experiences/stories
 */
export class ExperienceService {
  /**
   * Get all experiences with author information and tags
   */
  static async getAllExperiences(): Promise<ExperienceWithAuthor[]> {
    try {
      const { data, error } = await supabase
        .from("experiences_with_tags")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching experiences:", error);
      throw error;
    }
  }

  /**
   * Get only public experiences with author information and tags
   * Used for the Explore page
   */
  static async getPublicExperiences(): Promise<ExperienceWithAuthor[]> {
    try {
      const { data, error } = await supabase
        .from("experiences_with_tags")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching public experiences:", error);
      throw error;
    }
  }

  /**
   * Get a single experience by ID with author information and tags
   */
  static async getExperienceById(id: string): Promise<ExperienceWithAuthor | null> {
    try {
      const { data, error } = await supabase
        .from("experiences_with_tags")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching experience:", error);
      throw error;
    }
  }

  /**
   * Get experiences by user ID
   */
  static async getExperiencesByUserId(userId: string): Promise<ExperienceWithAuthor[]> {
    try {
      const { data, error } = await supabase
        .from("experiences_with_author")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching user experiences:", error);
      throw error;
    }
  }

  /**
   * Get current user's own stories (all of them: public and private)
   */
  static async getMyStories(): Promise<ExperienceWithAuthor[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("experiences_with_tags")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching my stories:", error);
      throw error;
    }
  }

  /**
   * Get stories shared with current user by their connections
   */
  static async getSharedStories(): Promise<ExperienceWithAuthor[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // IMPORTANT: Query the BASE TABLE (experiences) not the view
      // because RLS policies are applied to tables, not views
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("is_public", false) // Only private stories
        .neq("user_id", user.id) // Not from current user
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Manually fetch author info for each experience
      const experiencesWithAuthor = await Promise.all(
        (data || []).map(async (exp: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", exp.user_id)
            .single();

          return {
            ...exp,
            author_name: profile?.full_name || null,
            author_avatar: profile?.avatar_url || null,
            reactions_count: 0,
            comments_count: 0,
            tags: null,
          };
        })
      );

      return experiencesWithAuthor;
    } catch (error) {
      console.error("Error fetching shared stories:", error);
      throw error;
    }
  }

  /**
   * Create a new experience
   */
  static async createExperience(experienceData: CreateExperienceDTO): Promise<Experience> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User must be authenticated to create experiences");
      }

      // Remove tag_ids from experienceData as it's not a column in experiences table
      // Tags are managed separately in experience_tags table
      const { tag_ids, ...dataToInsert } = experienceData;

      const { data, error } = await supabase
        .from("experiences")
        .insert([
          {
            user_id: user.id,
            ...dataToInsert,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error creating experience:", error);
      throw error;
    }
  }

  /**
   * Update an existing experience
   */
  static async updateExperience(
    id: string,
    experienceData: UpdateExperienceDTO
  ): Promise<Experience> {
    try {
      // Remove tag_ids from experienceData as it's not a column in experiences table
      // Tags are managed separately in experience_tags table
      const { tag_ids, ...dataToUpdate } = experienceData;

      const { data, error } = await supabase
        .from("experiences")
        .update(dataToUpdate)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error updating experience:", error);
      throw error;
    }
  }

  /**
   * Delete an experience
   */
  static async deleteExperience(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("experiences").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting experience:", error);
      throw error;
    }
  }

  /**
   * Search experiences by title or content
   */
  static async searchExperiences(query: string): Promise<ExperienceWithAuthor[]> {
    try {
      const { data, error} = await supabase
        .from("experiences_with_author")
        .select("*")
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error searching experiences:", error);
      throw error;
    }
  }

  /**
   * Get experiences count for a user
   */
  static async getUserExperiencesCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("experiences")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error("Error counting user experiences:", error);
      return 0;
    }
  }
}
