-- ============================================
-- AGREGAR CAMPO shared_with A experiences
-- ============================================
-- Permite especificar con qué usuarios compartir
-- una historia privada específicamente
-- ============================================

-- 1. Agregar campo shared_with (array de UUIDs)
ALTER TABLE public.experiences
ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT NULL;

-- Comentario explicativo
COMMENT ON COLUMN public.experiences.shared_with IS
'Array de user_ids con los que se comparte específicamente esta historia privada.
NULL = compartir con todos los compartidos aceptados.
Array vacío [] = no compartir con nadie (solo autor).
Array con UUIDs = compartir solo con esos usuarios específicos.';

-- 2. Crear índice para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_experiences_shared_with
ON public.experiences USING GIN(shared_with);

-- 3. ACTUALIZAR VISTA experiences_with_tags
-- ============================================

DROP VIEW IF EXISTS public.experiences_with_tags CASCADE;

CREATE VIEW public.experiences_with_tags AS
SELECT
  e.id,
  e.user_id,
  e.title,
  e.content,
  e.excerpt,
  e.image_url,
  e.is_public,
  e.shared_with,  -- ✨ Nuevo campo
  e.created_at,
  e.updated_at,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  (SELECT COUNT(*) FROM public.reactions WHERE experience_id = e.id) AS reactions_count,
  (SELECT COUNT(*) FROM public.comments WHERE experience_id = e.id) AS comments_count,
  (SELECT COUNT(*) FROM public.favorites WHERE experience_id = e.id) AS favorites_count,
  (
    SELECT json_agg(
      json_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug,
        'emoji', t.emoji
      )
    )
    FROM public.tags t
    INNER JOIN public.experience_tags et ON et.tag_id = t.id
    WHERE et.experience_id = e.id
  ) AS tags
FROM public.experiences e
LEFT JOIN public.profiles p ON e.user_id = p.id;

-- 4. ACTUALIZAR POLÍTICAS RLS
-- ============================================

-- Eliminar la política de compartidos anterior
DROP POLICY IF EXISTS "Users can view private experiences from connections" ON public.experiences;

-- Nueva política: Ver historias privadas compartidas específicamente
CREATE POLICY "Users can view shared private experiences"
ON public.experiences FOR SELECT
USING (
  is_public = false
  AND (
    -- Si shared_with es NULL: compartir con todos los compartidos aceptados (comportamiento anterior)
    (
      shared_with IS NULL
      AND EXISTS (
        SELECT 1 FROM public.shared_connections
        WHERE status = 'accepted'
        AND (
          (user_id = auth.uid() AND shared_user_id = experiences.user_id)
          OR
          (shared_user_id = auth.uid() AND user_id = experiences.user_id)
        )
      )
    )
    OR
    -- Si shared_with tiene valores: compartir solo con esos usuarios específicos
    (
      shared_with IS NOT NULL
      AND auth.uid() = ANY(shared_with)
    )
  )
);

-- 5. FUNCIÓN HELPER: Obtener compartidos del usuario
-- ============================================

CREATE OR REPLACE FUNCTION get_user_connections(target_user_id UUID)
RETURNS TABLE (
  connection_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    CASE
      WHEN sc.user_id = target_user_id THEN sc.shared_user_id
      ELSE sc.user_id
    END as connection_id,
    p.full_name,
    p.avatar_url,
    u.email
  FROM public.shared_connections sc
  LEFT JOIN public.profiles p ON (
    CASE
      WHEN sc.user_id = target_user_id THEN sc.shared_user_id
      ELSE sc.user_id
    END = p.id
  )
  LEFT JOIN auth.users u ON p.id = u.id
  WHERE sc.status = 'accepted'
  AND (sc.user_id = target_user_id OR sc.shared_user_id = target_user_id);
$$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que el campo existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'experiences'
AND column_name = 'shared_with';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
