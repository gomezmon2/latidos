/**
 * Tipos TypeScript para el Sistema de Favoritos
 */

/**
 * Modelo base de Favorito (tabla favorites)
 */
export interface Favorite {
  id: string;
  user_id: string;
  experience_id: string;
  created_at: string;
}

/**
 * DTO para crear un favorito
 */
export interface CreateFavoriteDTO {
  experience_id: string;
  // user_id se obtiene del usuario autenticado
}

/**
 * Favorito con información de la experiencia asociada
 */
export interface FavoriteWithExperience extends Favorite {
  experience: {
    id: string;
    title: string;
    excerpt: string | null;
    image_url: string | null;
    author_name: string | null;
    author_avatar: string | null;
    created_at: string;
  };
}
