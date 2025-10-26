-- ============================================
-- Sistema de Círculos (Grupos de Usuarios)
-- ============================================
-- Descripción: Permite crear grupos/círculos de usuarios para compartir historias
-- Fecha: 24 Octubre 2025
-- Versión: 1.0

-- ============================================
-- 1. TABLA: circles
-- ============================================
-- Almacena los círculos/grupos creados por usuarios

CREATE TABLE IF NOT EXISTS public.circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  color VARCHAR(7) DEFAULT '#8B5CF6', -- Color en formato hex para UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE public.circles IS 'Círculos/grupos de usuarios para compartir historias';
COMMENT ON COLUMN public.circles.name IS 'Nombre del círculo (ej: "Familia", "Amigos cercanos")';
COMMENT ON COLUMN public.circles.description IS 'Descripción opcional del círculo';
COMMENT ON COLUMN public.circles.owner_id IS 'ID del usuario que creó el círculo';
COMMENT ON COLUMN public.circles.color IS 'Color para identificar el círculo en la UI';

-- Índices
CREATE INDEX IF NOT EXISTS idx_circles_owner_id ON public.circles(owner_id);
CREATE INDEX IF NOT EXISTS idx_circles_name ON public.circles(name);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_circles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_circles_updated_at
  BEFORE UPDATE ON public.circles
  FOR EACH ROW
  EXECUTE FUNCTION update_circles_updated_at();

-- ============================================
-- 2. TABLA: circle_members
-- ============================================
-- Relación muchos a muchos entre círculos y usuarios

CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(circle_id, user_id) -- Un usuario solo puede estar una vez en un círculo
);

-- Comentarios
COMMENT ON TABLE public.circle_members IS 'Miembros de cada círculo';
COMMENT ON COLUMN public.circle_members.circle_id IS 'ID del círculo';
COMMENT ON COLUMN public.circle_members.user_id IS 'ID del usuario miembro';

-- Índices
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON public.circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_both ON public.circle_members(circle_id, user_id);

-- ============================================
-- 3. ACTUALIZAR TABLA: experiences
-- ============================================
-- Añadir campo para compartir con un círculo específico

ALTER TABLE public.experiences
ADD COLUMN IF NOT EXISTS shared_circle_id UUID REFERENCES public.circles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.experiences.shared_circle_id IS
'ID del círculo con el que se comparte la historia privada. NULL = compartir con todos los compartidos o según shared_with';

-- Índice
CREATE INDEX IF NOT EXISTS idx_experiences_shared_circle_id ON public.experiences(shared_circle_id);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

-- POLICIES para circles
-- ----------------------

-- 1. Ver círculos propios
CREATE POLICY "Users can view their own circles"
ON public.circles FOR SELECT
USING (auth.uid() = owner_id);

-- 2. Crear círculos (solo el owner)
CREATE POLICY "Users can create their own circles"
ON public.circles FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- 3. Actualizar círculos propios
CREATE POLICY "Users can update their own circles"
ON public.circles FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- 4. Eliminar círculos propios
CREATE POLICY "Users can delete their own circles"
ON public.circles FOR DELETE
USING (auth.uid() = owner_id);

-- POLICIES para circle_members
-- -----------------------------

-- 1. Ver miembros de tus círculos
CREATE POLICY "Users can view members of their circles"
ON public.circle_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.circles
    WHERE circles.id = circle_members.circle_id
    AND circles.owner_id = auth.uid()
  )
);

-- 2. Añadir miembros a tus círculos
CREATE POLICY "Users can add members to their circles"
ON public.circle_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.circles
    WHERE circles.id = circle_members.circle_id
    AND circles.owner_id = auth.uid()
  )
);

-- 3. Eliminar miembros de tus círculos
CREATE POLICY "Users can remove members from their circles"
ON public.circle_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.circles
    WHERE circles.id = circle_members.circle_id
    AND circles.owner_id = auth.uid()
  )
);

-- ACTUALIZAR POLICY de experiences para círculos
-- -----------------------------------------------

-- Eliminar política antigua de historias privadas compartidas si existe
DROP POLICY IF EXISTS "Users can view shared private experiences" ON public.experiences;

-- Nueva política que incluye círculos
CREATE POLICY "Users can view shared private experiences"
ON public.experiences FOR SELECT
USING (
  is_public = false
  AND auth.uid() IS NOT NULL
  AND auth.uid() != user_id
  AND (
    -- Case A: Compartido con un círculo específico
    (
      shared_circle_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.circle_members
        WHERE circle_members.circle_id = experiences.shared_circle_id
        AND circle_members.user_id = auth.uid()
      )
    )
    OR
    -- Case B: Compartido con todos los compartidos aceptados (shared_with NULL)
    (
      shared_circle_id IS NULL
      AND shared_with IS NULL
      AND EXISTS (
        SELECT 1 FROM public.shared_connections sc
        WHERE sc.status = 'accepted'
        AND ((sc.user_id = auth.uid() AND sc.shared_user_id = experiences.user_id)
          OR (sc.shared_user_id = auth.uid() AND sc.user_id = experiences.user_id))
      )
    )
    OR
    -- Case C: Compartido con usuarios específicos (shared_with array)
    (
      shared_circle_id IS NULL
      AND shared_with IS NOT NULL
      AND auth.uid() = ANY(shared_with)
      AND EXISTS (
        SELECT 1 FROM public.shared_connections sc
        WHERE sc.status = 'accepted'
        AND ((sc.user_id = auth.uid() AND sc.shared_user_id = experiences.user_id)
          OR (sc.shared_user_id = auth.uid() AND sc.user_id = experiences.user_id))
      )
    )
  )
);

-- ============================================
-- 5. FUNCIONES HELPER
-- ============================================

-- Función: Contar miembros de un círculo
CREATE OR REPLACE FUNCTION count_circle_members(target_circle_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.circle_members
    WHERE circle_id = target_circle_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION count_circle_members IS 'Cuenta cuántos miembros tiene un círculo';

-- Función: Verificar si un usuario pertenece a un círculo
CREATE OR REPLACE FUNCTION is_user_in_circle(target_user_id UUID, target_circle_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.circle_members
    WHERE circle_id = target_circle_id
    AND user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION is_user_in_circle IS 'Verifica si un usuario pertenece a un círculo';

-- Función: Obtener círculos de un usuario
CREATE OR REPLACE FUNCTION get_user_circles(target_user_id UUID)
RETURNS TABLE(
  circle_id UUID,
  circle_name VARCHAR,
  circle_description TEXT,
  circle_color VARCHAR,
  member_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.description,
    c.color,
    count_circle_members(c.id)
  FROM public.circles c
  WHERE c.owner_id = target_user_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_user_circles IS 'Obtiene todos los círculos de un usuario con conteo de miembros';

-- ============================================
-- 6. VISTA: circles_with_member_count
-- ============================================

CREATE OR REPLACE VIEW public.circles_with_member_count AS
SELECT
  c.*,
  COUNT(cm.id) AS member_count
FROM public.circles c
LEFT JOIN public.circle_members cm ON c.id = cm.circle_id
GROUP BY c.id;

COMMENT ON VIEW public.circles_with_member_count IS 'Vista de círculos con conteo de miembros';

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ Verificando tablas...';

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'circles') THEN
    RAISE NOTICE '  ✓ Tabla circles creada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'circle_members') THEN
    RAISE NOTICE '  ✓ Tabla circle_members creada';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'experiences' AND column_name = 'shared_circle_id'
  ) THEN
    RAISE NOTICE '  ✓ Campo shared_circle_id añadido a experiences';
  END IF;

  RAISE NOTICE '✅ Sistema de Círculos instalado correctamente';
END $$;

-- ============================================
-- QUERIES ÚTILES PARA TESTING
-- ============================================

-- Ver todos los círculos con sus miembros
-- SELECT * FROM public.circles_with_member_count;

-- Ver miembros de un círculo específico
-- SELECT cm.*, p.full_name, p.avatar_url
-- FROM public.circle_members cm
-- JOIN public.profiles p ON cm.user_id = p.id
-- WHERE cm.circle_id = 'UUID_DEL_CIRCULO';

-- Ver historias compartidas con un círculo específico
-- SELECT e.*, c.name as circle_name
-- FROM public.experiences e
-- JOIN public.circles c ON e.shared_circle_id = c.id
-- WHERE e.shared_circle_id = 'UUID_DEL_CIRCULO';
