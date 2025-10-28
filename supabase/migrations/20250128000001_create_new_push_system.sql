-- Sistema de notificaciones push v2.0
-- Usando @block65/webcrypto-web-push compatible con Deno

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Tabla de suscripciones push (estructura simplificada para @block65/webcrypto-web-push)
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Índices para optimizar consultas
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Tabla de cola de notificaciones
CREATE TABLE notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX idx_notification_queue_sent ON notification_queue(sent) WHERE sent = false;
CREATE INDEX idx_notification_queue_created_at ON notification_queue(created_at);

-- RLS policies
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all notifications"
  ON notification_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Función para notificar nuevos mensajes
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
  message_preview TEXT;
BEGIN
  -- Obtener nombre del remitente
  SELECT full_name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Crear preview del mensaje
  message_preview := CASE
    WHEN LENGTH(NEW.content) > 100 THEN SUBSTRING(NEW.content, 1, 100) || '...'
    ELSE NEW.content
  END;

  -- Obtener ID del receptor (adaptado al modelo user1_id/user2_id)
  SELECT
    CASE
      WHEN user1_id = NEW.sender_id THEN user2_id
      ELSE user1_id
    END INTO recipient_id
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Insertar en cola de notificaciones
  IF recipient_id IS NOT NULL AND recipient_id != NEW.sender_id THEN
    INSERT INTO notification_queue (user_id, type, title, body, data)
    VALUES (
      recipient_id,
      'new_message',
      COALESCE(sender_name, 'Alguien'),
      message_preview,
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'message_id', NEW.id,
        'sender_id', NEW.sender_id,
        'url', '/chats/' || NEW.conversation_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para mensajes nuevos
DROP TRIGGER IF EXISTS on_new_message_notify ON messages;
CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- 5. Configurar service_role_key
-- NOTA: El service_role_key debe configurarse manualmente ejecutando este SQL como superusuario:
-- ALTER DATABASE postgres SET app.settings.service_role_key TO 'tu_service_role_key_aqui';

-- Confirmar creación
SELECT 'Sistema de notificaciones push v2.0 creado correctamente' AS status;
