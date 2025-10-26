-- ============================================
-- Sistema de Chat (Mensajería en tiempo real)
-- ============================================
-- Descripción: Chat privado 1-a-1 entre usuarios compartidos
-- Fecha: 26 Octubre 2025
-- Versión: 1.0

-- ============================================
-- 1. TABLA: conversations
-- ============================================
-- Almacena las conversaciones entre dos usuarios

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Asegurar que no haya conversaciones duplicadas (orden no importa)
  CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id),
  -- Asegurar que user1_id < user2_id para evitar duplicados
  CONSTRAINT check_user_order CHECK (user1_id < user2_id)
);

-- Comentarios
COMMENT ON TABLE public.conversations IS 'Conversaciones 1-a-1 entre usuarios';
COMMENT ON COLUMN public.conversations.user1_id IS 'ID del primer usuario (menor UUID)';
COMMENT ON COLUMN public.conversations.user2_id IS 'ID del segundo usuario (mayor UUID)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON public.conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON public.conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- ============================================
-- 2. TABLA: messages
-- ============================================
-- Almacena los mensajes de cada conversación

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE public.messages IS 'Mensajes de las conversaciones';
COMMENT ON COLUMN public.messages.conversation_id IS 'ID de la conversación';
COMMENT ON COLUMN public.messages.sender_id IS 'ID del usuario que envió el mensaje';
COMMENT ON COLUMN public.messages.content IS 'Contenido del mensaje';
COMMENT ON COLUMN public.messages.is_read IS 'Si el mensaje ha sido leído por el receptor';

-- Índices
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(is_read) WHERE is_read = FALSE;

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- POLICIES para conversations
-- ----------------------

-- 1. Ver conversaciones donde el usuario es participante
CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
USING (
  auth.uid() = user1_id
  OR auth.uid() = user2_id
);

-- 2. Crear conversación solo si ambos usuarios son compartidos aceptados
CREATE POLICY "Users can create conversations with accepted shared connections"
ON public.conversations FOR INSERT
WITH CHECK (
  auth.uid() IN (user1_id, user2_id)
  AND EXISTS (
    SELECT 1 FROM public.shared_connections sc
    WHERE sc.status = 'accepted'
    AND (
      (sc.user_id = user1_id AND sc.shared_user_id = user2_id)
      OR (sc.user_id = user2_id AND sc.shared_user_id = user1_id)
    )
  )
);

-- 3. Actualizar conversación (para updated_at cuando llega un mensaje)
CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
USING (
  auth.uid() = user1_id
  OR auth.uid() = user2_id
);

-- POLICIES para messages
-- ----------------------

-- 1. Ver mensajes de conversaciones donde el usuario participa
CREATE POLICY "Users can view messages from their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  )
);

-- 2. Crear mensajes en conversaciones donde el usuario participa
CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  )
);

-- 3. Actualizar mensajes (solo para marcar como leído)
CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    AND auth.uid() != sender_id  -- Solo el receptor puede marcar como leído
  )
);

-- ============================================
-- 4. FUNCIONES HELPER
-- ============================================

-- Función: Obtener o crear conversación entre dos usuarios
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  current_user_id UUID,
  other_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  user1 UUID;
  user2 UUID;
BEGIN
  -- Ordenar los IDs (menor primero)
  IF current_user_id < other_user_id THEN
    user1 := current_user_id;
    user2 := other_user_id;
  ELSE
    user1 := other_user_id;
    user2 := current_user_id;
  END IF;

  -- Buscar conversación existente
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE user1_id = user1 AND user2_id = user2;

  -- Si no existe, crearla
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (user1_id, user2_id)
    VALUES (user1, user2)
    RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_or_create_conversation IS 'Obtiene una conversación existente o crea una nueva entre dos usuarios';

-- Función: Contar mensajes no leídos en una conversación
CREATE OR REPLACE FUNCTION count_unread_messages(
  conversation_uuid UUID,
  user_uuid UUID
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.messages
    WHERE conversation_id = conversation_uuid
    AND sender_id != user_uuid
    AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION count_unread_messages IS 'Cuenta mensajes no leídos en una conversación para un usuario';

-- Función: Obtener último mensaje de una conversación
CREATE OR REPLACE FUNCTION get_last_message(conversation_uuid UUID)
RETURNS TABLE(
  message_id UUID,
  message_content TEXT,
  message_sender_id UUID,
  message_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, content, sender_id, created_at
  FROM public.messages
  WHERE conversation_id = conversation_uuid
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_last_message IS 'Obtiene el último mensaje de una conversación';

-- ============================================
-- 5. TRIGGER: Actualizar conversation.updated_at cuando llega un mensaje
-- ============================================

CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();

-- ============================================
-- 6. VISTA: conversations_with_details
-- ============================================
-- Vista con información completa de conversaciones

CREATE OR REPLACE VIEW public.conversations_with_details AS
SELECT
  c.id,
  c.user1_id,
  c.user2_id,
  c.created_at,
  c.updated_at,
  p1.full_name as user1_name,
  p1.avatar_url as user1_avatar,
  p2.full_name as user2_name,
  p2.avatar_url as user2_avatar
FROM public.conversations c
LEFT JOIN public.profiles p1 ON c.user1_id = p1.id
LEFT JOIN public.profiles p2 ON c.user2_id = p2.id;

COMMENT ON VIEW public.conversations_with_details IS 'Vista de conversaciones con información de perfiles de usuarios';

-- ============================================
-- 7. HABILITAR REALTIME
-- ============================================

-- Habilitar realtime para mensajes (para recibir mensajes en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================
-- 8. VERIFICACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Verificando tablas...';

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    RAISE NOTICE '  ✓ Tabla conversations creada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    RAISE NOTICE '  ✓ Tabla messages creada';
  END IF;

  RAISE NOTICE '✅ Sistema de Chat instalado correctamente';
END $$;

-- ============================================
-- QUERIES ÚTILES PARA TESTING
-- ============================================

-- Ver todas las conversaciones con detalles
-- SELECT * FROM public.conversations_with_details;

-- Ver mensajes de una conversación
-- SELECT m.*, p.full_name as sender_name
-- FROM public.messages m
-- JOIN public.profiles p ON m.sender_id = p.id
-- WHERE m.conversation_id = 'UUID_DE_CONVERSACION'
-- ORDER BY m.created_at ASC;

-- Contar mensajes no leídos por conversación
-- SELECT conversation_id, COUNT(*) as unread_count
-- FROM public.messages
-- WHERE is_read = FALSE
-- AND sender_id != 'UUID_USUARIO_ACTUAL'
-- GROUP BY conversation_id;
