-- Limpiar sistema antiguo de notificaciones
-- Esta migración elimina todas las tablas, triggers y cron jobs del sistema anterior

-- NOTA: Los cron jobs deben eliminarse manualmente desde el Dashboard de Supabase
-- Dashboard > Database > Cron Jobs > Eliminar jobs relacionados con notificaciones

-- 1. Eliminar triggers antiguos
DROP TRIGGER IF EXISTS on_new_message_notify ON messages;
DROP FUNCTION IF EXISTS notify_new_message();

-- 3. Eliminar tablas antiguas
DROP TABLE IF EXISTS notification_queue CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- 4. Confirmar limpieza
SELECT 'Sistema antiguo de notificaciones eliminado correctamente' AS status;
