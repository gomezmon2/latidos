-- ============================================
-- Script: Agregar Comentarios Anidados
-- Descripción: Agrega soporte para respuestas a comentarios
-- Fecha: 22 Octubre 2025
-- ============================================

-- 1. Agregar columna parent_comment_id a la tabla comments
ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- 2. Crear índice para mejorar performance en queries de comentarios anidados
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id
ON public.comments(parent_comment_id);

-- 3. Crear índice compuesto para queries comunes
CREATE INDEX IF NOT EXISTS idx_comments_experience_parent
ON public.comments(experience_id, parent_comment_id);

-- 4. Agregar comentario a la columna
COMMENT ON COLUMN public.comments.parent_comment_id IS
'ID del comentario padre (NULL para comentarios principales)';

-- 5. Función recursiva para obtener todos los comentarios hijos
CREATE OR REPLACE FUNCTION get_comment_replies(comment_id UUID)
RETURNS TABLE (
  id UUID,
  experience_id UUID,
  user_id UUID,
  parent_comment_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  depth INTEGER
)
LANGUAGE SQL
STABLE
AS $$
  WITH RECURSIVE comment_tree AS (
    -- Comentario base
    SELECT
      c.id,
      c.experience_id,
      c.user_id,
      c.parent_comment_id,
      c.content,
      c.created_at,
      c.updated_at,
      0 as depth
    FROM public.comments c
    WHERE c.id = comment_id

    UNION ALL

    -- Respuestas recursivas
    SELECT
      c.id,
      c.experience_id,
      c.user_id,
      c.parent_comment_id,
      c.content,
      c.created_at,
      c.updated_at,
      ct.depth + 1
    FROM public.comments c
    INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
  )
  SELECT * FROM comment_tree ORDER BY created_at ASC;
$$;

-- 6. Función para contar respuestas directas de un comentario
CREATE OR REPLACE FUNCTION count_comment_replies(comment_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.comments
  WHERE parent_comment_id = comment_id;
$$;

-- 7. Actualizar la política RLS de eliminación para manejar cascada correctamente
-- (Ya existe pero la reforzamos)
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 8. Notificar a PostgREST para refrescar el schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================
-- Verificación
-- ============================================

-- Para verificar que todo se creó correctamente, ejecuta:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
-- AND table_name = 'comments'
-- AND column_name = 'parent_comment_id';

-- Para ver los índices:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'comments'
-- AND schemaname = 'public';
