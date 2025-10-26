import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export class UserService {
  /**
   * Buscar usuarios por nombre o email
   * @param query Término de búsqueda
   * @param limit Límite de resultados (default: 20)
   * @returns Lista de usuarios que coinciden con la búsqueda
   */
  static async searchUsers(
    query: string,
    limit: number = 20
  ): Promise<UserProfile[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    try {
      // Buscar por nombre
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, created_at")
        .ilike("full_name", `%${query}%`)
        .neq("id", user.id) // Excluir usuario actual
        .limit(limit);

      if (error) throw error;

      return (data || []) as UserProfile[];
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  /**
   * Obtener perfil de un usuario por ID
   * @param userId ID del usuario
   * @returns Perfil del usuario
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, created_at")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return data as UserProfile;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  /**
   * Obtener múltiples perfiles de usuarios
   * @param userIds Array de IDs de usuarios
   * @returns Array de perfiles
   */
  static async getUserProfiles(userIds: string[]): Promise<UserProfile[]> {
    if (!userIds || userIds.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, created_at")
        .in("id", userIds);

      if (error) throw error;

      return (data || []) as UserProfile[];
    } catch (error) {
      console.error("Error getting user profiles:", error);
      return [];
    }
  }
}
