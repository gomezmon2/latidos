import { supabase } from "@/integrations/supabase/client";
import type { Reaction, CreateReactionDTO, ReactionCounts } from "@/types/reaction";

export class ReactionService {
  /**
   * Get all reactions for an experience
   */
  static async getReactionsByExperience(experienceId: string): Promise<Reaction[]> {
    const { data, error } = await supabase
      .from("reactions")
      .select("*")
      .eq("experience_id", experienceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reactions:", error);
      throw new Error("No se pudieron cargar las reacciones");
    }

    return data || [];
  }

  /**
   * Get reaction counts for an experience
   */
  static async getReactionCounts(experienceId: string): Promise<ReactionCounts> {
    const reactions = await this.getReactionsByExperience(experienceId);

    const counts: ReactionCounts = {
      total: reactions.length,
      byType: {},
    };

    reactions.forEach((reaction) => {
      if (!counts.byType[reaction.reaction_type]) {
        counts.byType[reaction.reaction_type] = 0;
      }
      counts.byType[reaction.reaction_type]++;
    });

    return counts;
  }

  /**
   * Get user's reaction for an experience (if any)
   */
  static async getUserReaction(
    experienceId: string,
    userId: string
  ): Promise<Reaction | null> {
    const { data, error } = await supabase
      .from("reactions")
      .select("*")
      .eq("experience_id", experienceId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user reaction:", error);
      return null;
    }

    return data;
  }

  /**
   * Add or update a reaction
   * If user already reacted with same type, remove it (toggle)
   * If user reacted with different type, update it
   */
  static async toggleReaction(
    experienceId: string,
    reactionType: string
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión para reaccionar");
    }

    // Check if user already reacted
    const existingReaction = await this.getUserReaction(experienceId, user.id);

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Same reaction - remove it (toggle off)
        await this.removeReaction(experienceId);
      } else {
        // Different reaction - update it
        const { error } = await supabase
          .from("reactions")
          .update({ reaction_type: reactionType })
          .eq("id", existingReaction.id);

        if (error) {
          console.error("Error updating reaction:", error);
          throw new Error("No se pudo actualizar la reacción");
        }
      }
    } else {
      // No existing reaction - create new one
      const { error } = await supabase.from("reactions").insert({
        experience_id: experienceId,
        user_id: user.id,
        reaction_type: reactionType,
      });

      if (error) {
        console.error("Error creating reaction:", error);
        throw new Error("No se pudo agregar la reacción");
      }
    }
  }

  /**
   * Remove user's reaction from an experience
   */
  static async removeReaction(experienceId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión");
    }

    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("experience_id", experienceId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error removing reaction:", error);
      throw new Error("No se pudo eliminar la reacción");
    }
  }
}
