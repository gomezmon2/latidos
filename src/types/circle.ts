/**
 * Circle Types
 * TypeScript definitions for Circles (user groups)
 */

export interface Circle {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  color: string; // Hex color code
  created_at: string;
  updated_at: string;
}

export interface CircleWithMemberCount extends Circle {
  member_count: number;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  added_at: string;
}

export interface CircleMemberWithProfile extends CircleMember {
  full_name: string | null;
  avatar_url: string | null;
}

export interface CreateCircleDTO {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCircleDTO {
  name?: string;
  description?: string;
  color?: string;
}

export interface AddMemberDTO {
  circle_id: string;
  user_id: string;
}
