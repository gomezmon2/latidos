-- ============================================
-- SISTEMA DE PRIVACIDAD PARA HISTORIAS
-- ============================================
-- Fecha: 23 Octubre 2025
-- Descripción: Agrega sistema de historias públicas/privadas
-- ============================================

-- 1. AGREGAR CAMPO is_public A experiences
-- ============================================
ALTER TABLE public.experiences
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true NOT NULL;

-- Comentario explicativo
COMMENT ON COLUMN public.experiences.is_public IS
'Determina si la historia es pública (true) o privada (false). Las historias privadas solo son visibles para el autor y sus compartidos.';

-- 2. CREAR ÍNDICE PARA OPTIMIZACIÓN
-- ============================================
CREATE INDEX IF NOT EXISTS idx_experiences_is_public
ON public.experiences(is_public);

-- Índice compuesto para queries comunes (público + fecha)
CREATE INDEX IF NOT EXISTS idx_experiences_public_created
ON public.experiences(is_public, created_at DESC);

-- 3. ACTUALIZAR RLS POLICIES
-- ============================================

-- Primero, eliminar la política de lectura pública actual
DROP POLICY IF EXISTS "Anyone can view experiences" ON public.experiences;

-- Nueva política: Ver historias públicas (todos)
CREATE POLICY "Anyone can view public experiences"
ON public.experiences FOR SELECT
USING (is_public = true);

-- Nueva política: Ver historias privadas propias
CREATE POLICY "Users can view their own private experiences"
ON public.experiences FOR SELECT
USING (
  auth.uid() = user_id
  AND is_public = false
);

-- Nueva política: Ver historias privadas de compartidos
CREATE POLICY "Users can view private experiences from connections"
ON public.experiences FOR SELECT
USING (
  is_public = false
  AND (
    -- Verificar si están conectados (accepted)
    EXISTS (
      SELECT 1 FROM public.shared_connections
      WHERE status = 'accepted'
      AND (
        (user_id = auth.uid() AND shared_user_id = experiences.user_id)
        OR
        (shared_user_id = auth.uid() AND user_id = experiences.user_id)
      )
    )
  )
);

-- 4. FUNCIÓN HELPER: Verificar si usuario puede ver una experiencia
-- ============================================
CREATE OR REPLACE FUNCTION can_view_experience(
  target_experience_id UUID,
  viewer_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = target_experience_id
    AND (
      -- Es pública
      e.is_public = true
      OR
      -- Es el autor
      e.user_id = viewer_user_id
      OR
      -- Están conectados
      (
        e.is_public = false
        AND EXISTS (
          SELECT 1 FROM public.shared_connections sc
          WHERE sc.status = 'accepted'
          AND (
            (sc.user_id = viewer_user_id AND sc.shared_user_id = e.user_id)
            OR
            (sc.shared_user_id = viewer_user_id AND sc.user_id = e.user_id)
          )
        )
      )
    )
  );
$$;

-- 5. FUNCIÓN HELPER: Contar historias públicas de un usuario
-- ============================================
CREATE OR REPLACE FUNCTION count_public_experiences(target_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.experiences
  WHERE user_id = target_user_id
  AND is_public = true;
$$;

-- 6. FUNCIÓN HELPER: Contar historias privadas de un usuario
-- ============================================
CREATE OR REPLACE FUNCTION count_private_experiences(target_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.experiences
  WHERE user_id = target_user_id
  AND is_public = false;
$$;

-- 7. ACTUALIZAR VISTA experiences_with_author (agregar is_public)
-- ============================================

-- IMPORTANTE: Primero eliminar la vista existente para evitar conflictos de columnas
DROP VIEW IF EXISTS public.experiences_with_author;

-- Recrear la vista con el nuevo campo is_public
CREATE VIEW public.experiences_with_author AS
SELECT
  e.*,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  (SELECT COUNT(*) FROM public.reactions WHERE experience_id = e.id) AS reactions_count,
  (SELECT COUNT(*) FROM public.comments WHERE experience_id = e.id) AS comments_count,
  (SELECT COUNT(*) FROM public.favorites WHERE experience_id = e.id) AS favorites_count
FROM public.experiences e
LEFT JOIN public.profiles p ON e.user_id = p.id;

-- NOTA: La vista ahora incluye automáticamente el campo is_public de la tabla experiences

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- INSTRUCCIONES DE USO:
-- 1. Copia todo este contenido
-- 2. Ve a Supabase Dashboard → SQL Editor
-- 3. Pega el script y ejecuta "Run"
-- 4. Verifica que se aplicaron los cambios:
--    - Campo is_public agregado a experiences
--    - 2 índices creados
--    - 3 nuevas políticas RLS (reemplazan la anterior)
--    - 3 funciones helper creadas

-- VERIFICACIÓN:
-- Ver estructura de la tabla
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'experiences' AND column_name = 'is_public';

-- Probar función de verificación de acceso
-- SELECT can_view_experience('uuid-de-prueba', auth.uid());
