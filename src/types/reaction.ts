/**
 * Types for reactions system
 */

export interface Reaction {
  id: string;
  experience_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface CreateReactionDTO {
  experience_id: string;
  reaction_type: string;
}

export interface ReactionCounts {
  total: number;
  byType: {
    [key: string]: number;
  };
}

export type ReactionType = 'heart' | 'clap' | 'fire' | 'sparkles';

export const REACTION_TYPES: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'heart', emoji: '❤️', label: 'Me encanta' },
  { type: 'clap', emoji: '👏', label: 'Aplauso' },
  { type: 'fire', emoji: '🔥', label: 'Fuego' },
  { type: 'sparkles', emoji: '✨', label: 'Brillante' },
];
