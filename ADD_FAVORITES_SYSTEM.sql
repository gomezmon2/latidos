-- ============================================
-- SISTEMA DE FAVORITOS PARA LATIDOS
-- ============================================
-- Fecha: 23 Octubre 2025
-- Descripción: Sistema para marcar historias como favoritas
-- ============================================

-- 1. CREAR TABLA favorites
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un usuario solo puede marcar una historia como favorita una vez
  UNIQUE(user_id, experience_id)
);

-- 2. CREAR ÍNDICES PARA PERFORMANCE
-- ============================================
-- Índice para buscar favoritos de un usuario
CREATE INDEX IF NOT EXISTS idx_favorites_user_id
ON public.favorites(user_id);

-- Índice para contar favoritos de una experiencia
CREATE INDEX IF NOT EXISTS idx_favorites_experience_id
ON public.favorites(experience_id);

-- Índice compuesto para verificar si existe favorito
CREATE INDEX IF NOT EXISTS idx_favorites_user_experience
ON public.favorites(user_id, experience_id);

-- 3. HABILITAR RLS (Row Level Security)
-- ============================================
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS RLS
-- ============================================

-- Política: Lectura pública (cualquiera puede ver qué historias son favoritas)
CREATE POLICY "Anyone can view favorites"
ON public.favorites FOR SELECT
USING (true);

-- Política: Solo usuarios autenticados pueden crear favoritos
CREATE POLICY "Authenticated users can create favorites"
ON public.favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Solo puedes eliminar tus propios favoritos
CREATE POLICY "Users can delete their own favorites"
ON public.favorites FOR DELETE
USING (auth.uid() = user_id);

-- 5. FUNCIÓN HELPER: Contar favoritos de una experiencia
-- ============================================
CREATE OR REPLACE FUNCTION count_experience_favorites(target_experience_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.favorites
  WHERE experience_id = target_experience_id;
$$;

-- 6. FUNCIÓN HELPER: Verificar si un usuario tiene una historia como favorita
-- ============================================
CREATE OR REPLACE FUNCTION is_favorite(target_user_id UUID, target_experience_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.favorites
    WHERE user_id = target_user_id
    AND experience_id = target_experience_id
  );
$$;

-- 7. FUNCIÓN HELPER: Obtener IDs de favoritos de un usuario
-- ============================================
CREATE OR REPLACE FUNCTION get_user_favorite_ids(target_user_id UUID)
RETURNS TABLE(experience_id UUID)
LANGUAGE SQL
STABLE
AS $$
  SELECT experience_id
  FROM public.favorites
  WHERE user_id = target_user_id
  ORDER BY created_at DESC;
$$;

-- 8. ACTUALIZAR VISTA experiences_with_author (agregar favorites_count)
-- ============================================
CREATE OR REPLACE VIEW public.experiences_with_author AS
SELECT
  e.*,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  (SELECT COUNT(*) FROM public.reactions WHERE experience_id = e.id) AS reactions_count,
  (SELECT COUNT(*) FROM public.comments WHERE experience_id = e.id) AS comments_count,
  (SELECT COUNT(*) FROM public.favorites WHERE experience_id = e.id) AS favorites_count
FROM public.experiences e
LEFT JOIN public.profiles p ON e.user_id = p.id;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- INSTRUCCIONES DE USO:
-- 1. Copia todo este contenido
-- 2. Ve a Supabase Dashboard → SQL Editor
-- 3. Pega el script y ejecuta "Run"
-- 4. Verifica que se crearon:
--    - Tabla: favorites
--    - 3 índices
--    - 3 políticas RLS
--    - 3 funciones helper
--    - Vista actualizada: experiences_with_author

-- VERIFICACIÓN:
-- SELECT * FROM public.favorites; -- debe estar vacía
-- SELECT count_experience_favorites('uuid-de-prueba'); -- debe retornar 0
