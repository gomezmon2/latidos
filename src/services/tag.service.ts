import { supabase } from "@/integrations/supabase/client";
import type { Tag } from "@/types/experience";

/**
 * Tag Service
 * Handles all tag-related operations with Supabase
 */
export class TagService {
  /**
   * Get all available tags
   */
  static async getAllTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching tags:", error);
      throw new Error("No se pudieron cargar las etiquetas");
    }

    return data || [];
  }

  /**
   * Get a single tag by slug
   */
  static async getTagBySlug(slug: string): Promise<Tag | null> {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching tag:", error);
      return null;
    }

    return data;
  }

  /**
   * Get tags for a specific experience
   */
  static async getTagsForExperience(experienceId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from("experience_tags")
      .select(`
        tag_id,
        tags (*)
      `)
      .eq("experience_id", experienceId);

    if (error) {
      console.error("Error fetching experience tags:", error);
      throw new Error("No se pudieron cargar las etiquetas de la historia");
    }

    // Extract tags from the nested structure
    return data?.map((item: any) => item.tags).filter(Boolean) || [];
  }

  /**
   * Add tags to an experience
   */
  static async addTagsToExperience(
    experienceId: string,
    tagIds: string[]
  ): Promise<void> {
    // Create an array of experience_tags records
    const experienceTags = tagIds.map((tagId) => ({
      experience_id: experienceId,
      tag_id: tagId,
    }));

    const { error } = await supabase
      .from("experience_tags")
      .insert(experienceTags);

    if (error) {
      console.error("Error adding tags to experience:", error);
      throw new Error("No se pudieron agregar las etiquetas a la historia");
    }
  }

  /**
   * Remove all tags from an experience
   */
  static async removeAllTagsFromExperience(experienceId: string): Promise<void> {
    const { error } = await supabase
      .from("experience_tags")
      .delete()
      .eq("experience_id", experienceId);

    if (error) {
      console.error("Error removing tags from experience:", error);
      throw new Error("No se pudieron eliminar las etiquetas de la historia");
    }
  }

  /**
   * Update tags for an experience
   * This removes all existing tags and adds the new ones
   */
  static async updateTagsForExperience(
    experienceId: string,
    tagIds: string[]
  ): Promise<void> {
    // Remove all existing tags
    await this.removeAllTagsFromExperience(experienceId);

    // Add new tags if any
    if (tagIds.length > 0) {
      await this.addTagsToExperience(experienceId, tagIds);
    }
  }

  /**
   * Get experiences by tag slug (uses the function created in SQL)
   */
  static async getExperiencesByTag(tagSlug: string) {
    const { data, error } = await supabase.rpc("get_experiences_by_tag", {
      tag_slug: tagSlug,
    });

    if (error) {
      console.error("Error fetching experiences by tag:", error);
      throw new Error("No se pudieron cargar las historias con esta etiqueta");
    }

    return data || [];
  }

  /**
   * Get experiences by multiple tag slugs (uses the function created in SQL)
   */
  static async getExperiencesByTags(tagSlugs: string[]) {
    const { data, error } = await supabase.rpc("get_experiences_by_tags", {
      tag_slugs: tagSlugs,
    });

    if (error) {
      console.error("Error fetching experiences by tags:", error);
      throw new Error("No se pudieron cargar las historias con estas etiquetas");
    }

    return data || [];
  }

  /**
   * Create a new tag
   */
  static async createTag(name: string, emoji?: string): Promise<Tag> {
    // Generar slug desde el nombre
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, "") // Eliminar caracteres especiales
      .trim()
      .replace(/\s+/g, "-"); // Reemplazar espacios con guiones

    const { data, error } = await supabase
      .from("tags")
      .insert({
        name: name.trim(),
        slug,
        emoji: emoji || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating tag:", error);
      if (error.code === "23505") {
        // Duplicate key error
        throw new Error("Ya existe una etiqueta con ese nombre");
      }
      throw new Error("No se pudo crear la etiqueta");
    }

    return data;
  }
}
