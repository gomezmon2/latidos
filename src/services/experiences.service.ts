import { supabase } from "@/integrations/supabase/client";
import type { Experience } from "@/types/experience";

/**
 * Experience Service
 * Handles all data operations related to experiences/stories
 */
export class ExperienceService {
  /**
   * Fetch all experiences from Supabase
   * @returns Promise with array of experiences
   */
  static async getAll(): Promise<Experience[]> {
    try {
      const { data, error } = await supabase
        .from("experiences")
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
   * Fetch a single experience by ID
   * @param id - Experience ID
   * @returns Promise with experience data
   */
  static async getById(id: number): Promise<Experience | null> {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`Error fetching experience ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new experience
   * @param experience - Experience data without ID
   * @returns Promise with created experience
   */
  static async create(experience: Omit<Experience, "id">): Promise<Experience> {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .insert([experience])
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
   * @param id - Experience ID
   * @param updates - Partial experience data to update
   * @returns Promise with updated experience
   */
  static async update(
    id: number,
    updates: Partial<Experience>
  ): Promise<Experience> {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`Error updating experience ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an experience
   * @param id - Experience ID
   * @returns Promise with boolean indicating success
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(`Error deleting experience ${id}:`, error);
      throw error;
    }
  }

  /**
   * Increment reactions count for an experience
   * @param id - Experience ID
   * @returns Promise with updated experience
   */
  static async addReaction(id: number): Promise<Experience> {
    try {
      const { data: current } = await supabase
        .from("experiences")
        .select("reactions")
        .eq("id", id)
        .single();

      if (!current) throw new Error("Experience not found");

      const { data, error } = await supabase
        .from("experiences")
        .update({ reactions: (current.reactions || 0) + 1 })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`Error adding reaction to experience ${id}:`, error);
      throw error;
    }
  }
}
