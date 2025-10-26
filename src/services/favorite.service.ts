import { supabase } from "@/integrations/supabase/client";
import type { Favorite, CreateFavoriteDTO, FavoriteWithExperience } from "@/types/favorite";

/**
 * Servicio para gestionar favoritos de historias
 */
export class FavoriteService {
  /**
   * Marcar una historia como favorita
   */
  static async addFavorite(dto: CreateFavoriteDTO): Promise<Favorite> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        experience_id: dto.experience_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al agregar favorito:", error);
      throw error;
    }

    return data;
  }

  /**
   * Quitar una historia de favoritos
   */
  static async removeFavorite(experienceId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("experience_id", experienceId);

    if (error) {
      console.error("Error al quitar favorito:", error);
      throw error;
    }
  }

  /**
   * Verificar si una historia es favorita del usuario actual
   */
  static async isFavorite(experienceId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("experience_id", experienceId)
      .maybeSingle();

    if (error) {
      console.error("Error al verificar favorito:", error);
      return false;
    }

    return !!data;
  }

  /**
   * Alternar favorito (agregar si no existe, quitar si existe)
   */
  static async toggleFavorite(experienceId: string): Promise<boolean> {
    const isFav = await this.isFavorite(experienceId);

    if (isFav) {
      await this.removeFavorite(experienceId);
      return false; // Ya no es favorito
    } else {
      await this.addFavorite({ experience_id: experienceId });
      return true; // Ahora es favorito
    }
  }

  /**
   * Obtener todos los favoritos del usuario actual
   */
  static async getMyFavorites(): Promise<FavoriteWithExperience[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    // Primero obtenemos los favoritos
    const { data: favorites, error: favError } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (favError) {
      console.error("Error al obtener favoritos:", favError);
      throw favError;
    }

    if (!favorites || favorites.length === 0) {
      return [];
    }

    // Luego obtenemos los detalles de cada experiencia
    const favoritesWithExperience = await Promise.all(
      favorites.map(async (fav) => {
        const { data: exp, error: expError } = await supabase
          .from("experiences_with_author")
          .select("id, title, excerpt, image_url, author_name, author_avatar, created_at")
          .eq("id", fav.experience_id)
          .single();

        if (expError) {
          console.error("Error al obtener experiencia:", expError);
          // Si la experiencia no existe (fue eliminada), retornamos null
          return null;
        }

        return {
          ...fav,
          experience: exp,
        } as FavoriteWithExperience;
      })
    );

    // Filtrar favoritos cuyas experiencias fueron eliminadas
    return favoritesWithExperience.filter((fav) => fav !== null) as FavoriteWithExperience[];
  }

  /**
   * Contar favoritos de una experiencia específica
   */
  static async countFavorites(experienceId: string): Promise<number> {
    const { count, error } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("experience_id", experienceId);

    if (error) {
      console.error("Error al contar favoritos:", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Obtener IDs de todas las experiencias favoritas del usuario actual
   * Útil para marcar como favoritas en listados
   */
  static async getMyFavoriteIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("experience_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error al obtener IDs de favoritos:", error);
      return [];
    }

    return data.map((fav) => fav.experience_id);
  }
}
