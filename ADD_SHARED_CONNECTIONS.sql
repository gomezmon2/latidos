-- ============================================
-- Script: Sistema de "Compartidos"
-- Descripción: Conexiones bidireccionales entre usuarios
-- Fecha: 22 Octubre 2025
-- ============================================

-- 1. Crear tabla shared_connections
CREATE TABLE IF NOT EXISTS public.shared_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint para evitar conexiones duplicadas
  UNIQUE(user_id, shared_user_id),

  -- Constraint para evitar que alguien se conecte consigo mismo
  CHECK (user_id != shared_user_id),

  -- Constraint para validar estados permitidos
  CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- 2. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_shared_connections_user_id ON public.shared_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_connections_shared_user_id ON public.shared_connections(shared_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_connections_status ON public.shared_connections(status);
CREATE INDEX IF NOT EXISTS idx_shared_connections_user_status ON public.shared_connections(user_id, status);

-- 3. Comentarios en tabla y columnas
COMMENT ON TABLE public.shared_connections IS
'Conexiones bidireccionales entre usuarios (reemplaza concepto de "amigos")';

COMMENT ON COLUMN public.shared_connections.user_id IS
'Usuario que envía la solicitud';

COMMENT ON COLUMN public.shared_connections.shared_user_id IS
'Usuario que recibe la solicitud';

COMMENT ON COLUMN public.shared_connections.status IS
'Estado: pending (pendiente), accepted (aceptada), rejected (rechazada)';

-- 4. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_shared_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shared_connections_updated_at
  BEFORE UPDATE ON public.shared_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_shared_connections_updated_at();

-- 5. Row Level Security (RLS)
ALTER TABLE public.shared_connections ENABLE ROW LEVEL SECURITY;

-- Política: Ver conexiones donde eres parte (enviadas o recibidas)
CREATE POLICY "Users can view their own connections"
ON public.shared_connections
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR auth.uid() = shared_user_id
);

-- Política: Solo puedes crear conexiones como remitente
CREATE POLICY "Users can send connection requests"
ON public.shared_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política: Solo puedes actualizar conexiones que recibiste (para aceptar/rechazar)
CREATE POLICY "Users can update received requests"
ON public.shared_connections
FOR UPDATE
TO authenticated
USING (auth.uid() = shared_user_id)
WITH CHECK (auth.uid() = shared_user_id);

-- Política: Puedes eliminar conexiones donde eres parte
CREATE POLICY "Users can delete their own connections"
ON public.shared_connections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = shared_user_id);

-- 6. Función: Verificar si dos usuarios están conectados (aceptados)
CREATE OR REPLACE FUNCTION are_users_connected(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.shared_connections
    WHERE status = 'accepted'
    AND (
      (user_id = user1_id AND shared_user_id = user2_id)
      OR
      (user_id = user2_id AND shared_user_id = user1_id)
    )
  );
$$;

-- 7. Función: Obtener estado de conexión entre dos usuarios
CREATE OR REPLACE FUNCTION get_connection_status(user1_id UUID, user2_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT status
  FROM public.shared_connections
  WHERE (
    (user_id = user1_id AND shared_user_id = user2_id)
    OR
    (user_id = user2_id AND shared_user_id = user1_id)
  )
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- 8. Función: Contar conexiones aceptadas de un usuario
CREATE OR REPLACE FUNCTION count_user_connections(target_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.shared_connections
  WHERE status = 'accepted'
  AND (user_id = target_user_id OR shared_user_id = target_user_id);
$$;

-- 9. Función: Contar solicitudes pendientes de un usuario
CREATE OR REPLACE FUNCTION count_pending_requests(target_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.shared_connections
  WHERE status = 'pending'
  AND shared_user_id = target_user_id;
$$;

-- 10. Vista: Conexiones con información de usuarios
CREATE OR REPLACE VIEW shared_connections_with_users AS
SELECT
  sc.id,
  sc.user_id,
  sc.shared_user_id,
  sc.status,
  sc.created_at,
  sc.updated_at,
  -- Info del usuario que envió la solicitud
  p1.full_name AS sender_name,
  p1.avatar_url AS sender_avatar,
  -- Info del usuario que recibió la solicitud
  p2.full_name AS receiver_name,
  p2.avatar_url AS receiver_avatar
FROM public.shared_connections sc
LEFT JOIN public.profiles p1 ON sc.user_id = p1.id
LEFT JOIN public.profiles p2 ON sc.shared_user_id = p2.id;

-- 11. Notificar a PostgREST para refrescar el schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================
-- Verificación
-- ============================================

-- Para verificar que todo se creó correctamente:

-- Ver estructura de la tabla:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
-- AND table_name = 'shared_connections';

-- Ver índices:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'shared_connections'
-- AND schemaname = 'public';

-- Ver políticas RLS:
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename = 'shared_connections';

-- Probar funciones:
-- SELECT are_users_connected('user-id-1', 'user-id-2');
-- SELECT get_connection_status('user-id-1', 'user-id-2');
-- SELECT count_user_connections('user-id-1');
-- SELECT count_pending_requests('user-id-1');
