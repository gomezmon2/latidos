-- ============================================
-- Sistema de Etiquetas para Latidos
-- ============================================
-- Este script crea las tablas necesarias para
-- el sistema de etiquetas y las puebla con
-- etiquetas predefinidas
-- ============================================

-- 1. Crear tabla de etiquetas
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de relación experiencias-etiquetas
CREATE TABLE IF NOT EXISTS public.experience_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experience_id, tag_id)
);

-- 3. Habilitar RLS en ambas tablas
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_tags ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para tags (lectura pública)
CREATE POLICY "Tags son visibles para todos"
  ON public.tags
  FOR SELECT
  USING (true);

-- Solo admins pueden crear/modificar tags (esto previene spam)
-- Por ahora, nadie puede crear tags desde la app (solo desde SQL)

-- 5. Políticas RLS para experience_tags
CREATE POLICY "Experience tags son visibles para todos"
  ON public.experience_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden agregar tags a sus experiencias"
  ON public.experience_tags
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.experiences WHERE id = experience_id
    )
  );

CREATE POLICY "Usuarios pueden eliminar tags de sus propias experiencias"
  ON public.experience_tags
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.experiences WHERE id = experience_id
    )
  );

-- 6. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_experience_tags_experience_id
  ON public.experience_tags(experience_id);

CREATE INDEX IF NOT EXISTS idx_experience_tags_tag_id
  ON public.experience_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_tags_slug
  ON public.tags(slug);

-- ============================================
-- SEED: Etiquetas Predefinidas
-- ============================================

INSERT INTO public.tags (name, slug, emoji, description) VALUES
  ('Arte y Creatividad', 'arte-creatividad', '🎨', 'Historias sobre expresión artística, creatividad y procesos creativos'),
  ('Viajes y Aventuras', 'viajes-aventuras', '🌍', 'Experiencias de viaje, exploraciones y aventuras por el mundo'),
  ('Aprendizajes', 'aprendizajes', '📚', 'Lecciones aprendidas, descubrimientos y momentos de aprendizaje'),
  ('Reflexiones', 'reflexiones', '💭', 'Pensamientos profundos, reflexiones personales y filosóficas'),
  ('Experiencias Personales', 'experiencias-personales', '🎭', 'Momentos significativos de la vida cotidiana'),
  ('Gastronomía', 'gastronomia', '🍳', 'Historias sobre comida, cocina y experiencias culinarias'),
  ('Deportes y Movimiento', 'deportes-movimiento', '🏃', 'Actividades físicas, deportes y vida activa'),
  ('Música', 'musica', '🎵', 'Experiencias relacionadas con la música y el sonido'),
  ('Trabajo y Profesión', 'trabajo-profesion', '💼', 'Historias sobre carrera profesional, trabajo y proyectos laborales'),
  ('Familia', 'familia', '👨‍👩‍👧‍👦', 'Momentos y experiencias familiares'),
  ('Relaciones', 'relaciones', '💕', 'Historias sobre conexiones humanas y relaciones interpersonales'),
  ('Crecimiento Personal', 'crecimiento-personal', '🌱', 'Desarrollo personal, autoconocimiento y transformación'),
  ('Proyectos', 'proyectos', '🔧', 'Proyectos personales, emprendimientos y creaciones'),
  ('Mascotas', 'mascotas', '🐾', 'Historias con animales y mascotas'),
  ('Lectura', 'lectura', '📖', 'Experiencias relacionadas con libros y literatura'),
  ('Cine y Series', 'cine-series', '🎬', 'Reflexiones sobre películas, series y contenido audiovisual'),
  ('Videojuegos', 'videojuegos', '🎮', 'Experiencias relacionadas con videojuegos'),
  ('Bienestar', 'bienestar', '🧘', 'Salud mental, física y bienestar general'),
  ('Naturaleza', 'naturaleza', '🌿', 'Conexión con la naturaleza y experiencias al aire libre'),
  ('Hogar', 'hogar', '🏠', 'Vida en casa, espacio personal y hogar')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Vista optimizada: experiences con tags
-- ============================================

CREATE OR REPLACE VIEW public.experiences_with_tags AS
SELECT
  e.*,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  (SELECT COUNT(*) FROM public.reactions WHERE experience_id = e.id) AS reactions_count,
  (SELECT COUNT(*) FROM public.comments WHERE experience_id = e.id) AS comments_count,
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

-- ============================================
-- Funciones útiles
-- ============================================

-- Función para obtener experiencias por etiqueta
CREATE OR REPLACE FUNCTION get_experiences_by_tag(tag_slug TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_avatar TEXT,
  tags JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.user_id,
    e.title,
    e.content,
    e.excerpt,
    e.image_url,
    e.created_at,
    e.author_name,
    e.author_avatar,
    e.tags
  FROM public.experiences_with_tags e
  WHERE e.id IN (
    SELECT et.experience_id
    FROM public.experience_tags et
    INNER JOIN public.tags t ON t.id = et.tag_id
    WHERE t.slug = tag_slug
  )
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener experiencias por múltiples etiquetas (OR)
CREATE OR REPLACE FUNCTION get_experiences_by_tags(tag_slugs TEXT[])
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_avatar TEXT,
  tags JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    e.id,
    e.user_id,
    e.title,
    e.content,
    e.excerpt,
    e.image_url,
    e.created_at,
    e.author_name,
    e.author_avatar,
    e.tags
  FROM public.experiences_with_tags e
  WHERE e.id IN (
    SELECT et.experience_id
    FROM public.experience_tags et
    INNER JOIN public.tags t ON t.id = et.tag_id
    WHERE t.slug = ANY(tag_slugs)
  )
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ¡Listo! Sistema de etiquetas creado
-- ============================================

-- Verificar que se crearon correctamente:
-- SELECT * FROM public.tags;
-- SELECT * FROM public.experiences_with_tags LIMIT 5;
