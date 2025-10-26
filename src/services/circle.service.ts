import { supabase } from "@/integrations/supabase/client";
import type {
  Circle,
  CircleWithMemberCount,
  CircleMember,
  CircleMemberWithProfile,
  CreateCircleDTO,
  UpdateCircleDTO,
  AddMemberDTO,
} from "@/types/circle";

/**
 * CircleService
 * Service for managing user circles (groups)
 */
export class CircleService {
  /**
   * Get all circles owned by the current user
   */
  static async getMyCircles(): Promise<CircleWithMemberCount[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const { data, error } = await supabase
      .from("circles_with_member_count")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []) as CircleWithMemberCount[];
  }

  /**
   * Get a specific circle by ID
   */
  static async getCircleById(circleId: string): Promise<Circle | null> {
    const { data, error } = await supabase
      .from("circles")
      .select("*")
      .eq("id", circleId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return data as Circle;
  }

  /**
   * Create a new circle
   */
  static async createCircle(circleData: CreateCircleDTO): Promise<Circle> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const { data, error } = await supabase
      .from("circles")
      .insert([
        {
          owner_id: user.id,
          name: circleData.name,
          description: circleData.description || null,
          color: circleData.color || "#8B5CF6",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Circle;
  }

  /**
   * Update a circle
   */
  static async updateCircle(
    circleId: string,
    circleData: UpdateCircleDTO
  ): Promise<Circle> {
    const { data, error } = await supabase
      .from("circles")
      .update(circleData)
      .eq("id", circleId)
      .select()
      .single();

    if (error) throw error;

    return data as Circle;
  }

  /**
   * Delete a circle
   */
  static async deleteCircle(circleId: string): Promise<void> {
    const { error } = await supabase
      .from("circles")
      .delete()
      .eq("id", circleId);

    if (error) throw error;
  }

  /**
   * Get members of a circle
   */
  static async getCircleMembers(
    circleId: string
  ): Promise<CircleMemberWithProfile[]> {
    const { data, error } = await supabase
      .from("circle_members")
      .select("*")
      .eq("circle_id", circleId);

    if (error) throw error;

    // Fetch profile info for each member
    const membersWithProfile = await Promise.all(
      (data || []).map(async (member: any) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", member.user_id)
          .single();

        return {
          ...member,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
        };
      })
    );

    return membersWithProfile as CircleMemberWithProfile[];
  }

  /**
   * Add a member to a circle
   */
  static async addMemberToCircle(
    circleId: string,
    userId: string
  ): Promise<CircleMember> {
    const { data, error } = await supabase
      .from("circle_members")
      .insert([
        {
          circle_id: circleId,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      // Check for duplicate
      if (error.code === "23505") {
        throw new Error("Este usuario ya está en el círculo");
      }
      throw error;
    }

    return data as CircleMember;
  }

  /**
   * Remove a member from a circle
   */
  static async removeMemberFromCircle(
    circleId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("circle_members")
      .delete()
      .eq("circle_id", circleId)
      .eq("user_id", userId);

    if (error) throw error;
  }

  /**
   * Check if a user is in a circle
   */
  static async isUserInCircle(
    circleId: string,
    userId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("circle_members")
      .select("id")
      .eq("circle_id", circleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    return data !== null;
  }

  /**
   * Count members in a circle
   */
  static async countCircleMembers(circleId: string): Promise<number> {
    const { count, error } = await supabase
      .from("circle_members")
      .select("*", { count: "exact", head: true })
      .eq("circle_id", circleId);

    if (error) throw error;

    return count || 0;
  }
}
