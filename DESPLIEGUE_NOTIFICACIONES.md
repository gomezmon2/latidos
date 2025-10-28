# Despliegue del Sistema de Notificaciones Push

Este documento explica cómo desplegar y configurar el sistema completo de notificaciones push en Latidos.

**⚠️ IMPORTANTE**: Este documento incluye correcciones de problemas encontrados durante la implementación. Ver sección **Problemas Conocidos y Soluciones** al final.

## 📋 Requisitos Previos

- Cuenta de Supabase con un proyecto creado
- CLI de Supabase instalado: `npm install -g supabase`
- Node.js y npm instalados
- Variables VAPID generadas (ya incluidas en `.env`)

## 🔧 Paso 1: Configurar Variables de Entorno

### 1.1 Variables Locales (.env)

**CLAVES ACTUALIZADAS** (27 Octubre 2025):

```env
VITE_VAPID_PUBLIC_KEY=BJ5LPwlTfwzeR_eE4YCKSYJmzWCZdgxAl_QWMJgxFHFf1CaG5LquRze2ZwYdG6vS3uoN6Hu29e6derZECp_F0r4
VAPID_PRIVATE_KEY=Mto8yghDemueGn4g9YBotL60uiuy8B_SOPq0nip9BX4
VAPID_SUBJECT=mailto:admin@latidos.app
```

**Nota**: Las claves anteriores fueron reemplazadas. Si tienes suscripciones antiguas, los usuarios tendrán que volver a autorizar las notificaciones.

### 1.2 Variables en Supabase Dashboard

Ve a tu proyecto en Supabase Dashboard y configura las siguientes variables de entorno para las Edge Functions:

1. **Settings** → **Edge Functions** → **Environment Variables**
2. Añade las siguientes variables **ACTUALIZADAS**:

```
VAPID_PUBLIC_KEY=BJ5LPwlTfwzeR_eE4YCKSYJmzWCZdgxAl_QWMJgxFHFf1CaG5LquRze2ZwYdG6vS3uoN6Hu29e6derZECp_F0r4
VAPID_PRIVATE_KEY=Mto8yghDemueGn4g9YBotL60uiuy8B_SOPq0nip9BX4
VAPID_SUBJECT=mailto:admin@latidos.app
```

### 1.3 Variables en Vercel (Frontend)

En tu proyecto de Vercel, añade:

```
VITE_VAPID_PUBLIC_KEY=BJ5LPwlTfwzeR_eE4YCKSYJmzWCZdgxAl_QWMJgxFHFf1CaG5LquRze2ZwYdG6vS3uoN6Hu29e6derZECp_F0r4
```

## 🗄️ Paso 2: Aplicar Migraciones de Base de Datos

### 2.1 Autenticarse con Supabase CLI

```bash
supabase login
```

### 2.2 Vincular el proyecto

```bash
supabase link --project-ref jljeegojtkblsdhzuisu
```

### 2.3 Aplicar la migración

```bash
supabase db push
```

Esto creará:
- Tabla `push_subscriptions` (suscripciones de usuarios)
- Tabla `notification_queue` (cola de notificaciones)
- Función `notify_new_message()` (trigger para nuevos mensajes)
- Políticas RLS para ambas tablas

### 2.4 Verificar las tablas (Opcional)

En Supabase Dashboard → **Database** → **Tables**, deberías ver:
- `push_subscriptions`
- `notification_queue`

## ☁️ Paso 3: Desplegar Edge Functions

### 3.1 Desplegar la función de procesamiento

```bash
supabase functions deploy process-notification-queue
```

Esta función:
- Se ejecutará periódicamente (via cron)
- Procesará la cola de notificaciones pendientes
- Enviará notificaciones push a los usuarios suscritos

### 3.2 Configurar Cron Job

En Supabase Dashboard → **Database** → **Extensions**:

1. Habilita la extensión `pg_cron` si no está habilitada
2. Ve a **SQL Editor** y ejecuta:

```sql
-- Ejecutar la función cada minuto
SELECT cron.schedule(
  'process-notification-queue',
  '* * * * *', -- Cada minuto
  $$
  SELECT net.http_post(
    url := 'https://jljeegojtkblsdhzuisu.supabase.co/functions/v1/process-notification-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

**Nota**: Reemplaza la URL con la de tu proyecto si es diferente.

### 3.3 Verificar Cron Job

```sql
-- Ver trabajos cron configurados
SELECT * FROM cron.job;

-- Ver ejecuciones del cron
SELECT * FROM cron.job_run_details
WHERE jobname = 'process-notification-queue'
ORDER BY start_time DESC
LIMIT 10;
```

## 🧪 Paso 4: Probar el Sistema

### 4.1 Desarrollo Local

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre la aplicación en **dos navegadores diferentes** o **dos ventanas de incógnito**

3. Inicia sesión con dos usuarios diferentes

4. Acepta los permisos de notificación en ambos navegadores

5. Envía un mensaje desde el Usuario A al Usuario B

6. El Usuario B debería recibir:
   - **Toast notification** si la pestaña está visible
   - **Push notification** si la pestaña está oculta o el navegador minimizado

### 4.2 Verificar Suscripciones

En Supabase Dashboard → **Table Editor** → `push_subscriptions`:

Deberías ver las suscripciones de tus usuarios con:
- `user_id`
- `subscription` (objeto JSON con endpoint y keys)
- `user_agent`
- `created_at`

### 4.3 Verificar Cola de Notificaciones

En **Table Editor** → `notification_queue`:

Deberías ver las notificaciones pendientes:
- `user_id`: Destinatario
- `type`: Tipo de notificación (new_message, etc.)
- `title` y `body`: Contenido
- `sent`: false (pendiente) o true (enviada)

## 🔍 Paso 5: Monitoreo y Debugging

### 5.1 Logs de Edge Functions

```bash
# Ver logs en tiempo real
supabase functions serve process-notification-queue --debug
```

En producción, ve a:
**Supabase Dashboard** → **Edge Functions** → **process-notification-queue** → **Logs**

### 5.2 Verificar Notificaciones Enviadas

```sql
-- Ver notificaciones enviadas en las últimas 24 horas
SELECT
  nq.id,
  nq.user_id,
  p.full_name,
  nq.type,
  nq.title,
  nq.sent,
  nq.created_at
FROM notification_queue nq
LEFT JOIN profiles p ON p.id = nq.user_id
WHERE nq.created_at > NOW() - INTERVAL '24 hours'
ORDER BY nq.created_at DESC;
```

### 5.3 Debugging de Suscripciones

```sql
-- Ver suscripciones activas por usuario
SELECT
  ps.user_id,
  p.full_name,
  ps.subscription->>'endpoint' as endpoint,
  ps.created_at,
  ps.updated_at
FROM push_subscriptions ps
LEFT JOIN profiles p ON p.id = ps.user_id
ORDER BY ps.created_at DESC;
```

## 🚨 Troubleshooting

### Problema: No se reciben notificaciones

**Posibles causas**:

1. **Permisos del navegador denegados**
   - Solución: Ir a configuración del navegador y permitir notificaciones para localhost o tu dominio

2. **VAPID keys no configuradas**
   - Verificar que las variables de entorno estén en Supabase y Vercel
   - Comprobar que `VITE_VAPID_PUBLIC_KEY` esté en el frontend

3. **Service Worker no registrado**
   - Abrir DevTools → Application → Service Workers
   - Verificar que `sw.js` esté activo

4. **Cron job no ejecutándose**
   - Ejecutar manualmente: `SELECT * FROM cron.job_run_details;`
   - Verificar que pg_cron esté habilitado

### Problema: Notificaciones duplicadas

**Causa**: El trigger `notify_new_message()` se está ejecutando múltiples veces

**Solución**: Verificar que solo hay un trigger en la tabla `messages`:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_new_message_notify';
```

### Problema: Edge Function falla

**Debugging**:

```bash
# Ver logs de la función
supabase functions logs process-notification-queue --limit 50
```

Verificar que las variables de entorno estén configuradas correctamente.

## 📊 Métricas y Rendimiento

### Consulta de Estadísticas

```sql
-- Notificaciones enviadas por día (últimos 7 días)
SELECT
  DATE(created_at) as fecha,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE sent = true) as enviadas,
  COUNT(*) FILTER (WHERE sent = false) as pendientes
FROM notification_queue
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- Usuarios con suscripciones activas
SELECT COUNT(DISTINCT user_id) as usuarios_suscritos
FROM push_subscriptions;
```

## 🔄 Actualizar VAPID Keys (Opcional)

Si necesitas regenerar las VAPID keys:

```bash
# Generar nuevas keys
npx web-push generate-vapid-keys --json

# Actualizar en:
# 1. .env (local)
# 2. Supabase Dashboard → Edge Functions → Environment Variables
# 3. Vercel → Settings → Environment Variables
```

**⚠️ IMPORTANTE**: Cambiar las VAPID keys invalidará todas las suscripciones existentes. Los usuarios tendrán que volver a dar permisos.

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas en `.env`
- [ ] Variables de entorno configuradas en Supabase Dashboard
- [ ] Variables de entorno configuradas en Vercel
- [ ] Migraciones aplicadas con `supabase db push`
- [ ] Edge Function desplegada con `supabase functions deploy`
- [ ] Cron job configurado en pg_cron
- [ ] Probado en desarrollo local
- [ ] Probado en producción con dos usuarios reales
- [ ] Verificadas las suscripciones en la base de datos
- [ ] Verificada la cola de notificaciones
- [ ] Logs revisados sin errores

## 📚 Recursos Adicionales

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Protocol](https://tools.ietf.org/html/rfc8292)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## 🐛 Problemas Conocidos y Soluciones (v3.9.0)

### Problema 1: Error 400 en savePushSubscription

**Síntoma**: Error al guardar suscripciones push con mensaje sobre `onConflict`.

**Causa**: El parámetro `onConflict: 'user_id,subscription->endpoint'` no es válido en Supabase cliente.

**Solución**: Ya implementada en `src/services/notification.service.ts` (líneas 226-257). Se realiza un SELECT primero para verificar si existe, luego UPDATE o INSERT según corresponda.

### Problema 2: Tabla conversation_members no existe

**Síntoma**: Error 404/400 al enviar mensajes con código `42P01`.

**Causa**: El trigger `notify_new_message()` asume una estructura de BD diferente.

**Solución**: Ejecutar en SQL Editor:
```sql
DROP TRIGGER IF EXISTS on_new_message_notify ON messages;
DROP FUNCTION IF EXISTS notify_new_message();
```

**Pendiente**: Crear trigger correcto que use `conversations` con `user1_id` y `user2_id`.

### Problema 3: Navegación cierra sesión al hacer clic en notificación

**Síntoma**: Al hacer clic en una notificación push, se cierra la sesión.

**Causa**: Service worker abre nueva ventana o usa `client.navigate()` no soportado.

**Solución**: Ya implementada:
- Service worker envía mensaje con `postMessage()` ([public/sw.js](public/sw.js) líneas 56-82)
- AppWrapper escucha y navega con React Router ([src/components/AppWrapper.tsx](src/components/AppWrapper.tsx) líneas 15-31)

### Problema 4: VAPID keys no funcionan

**Síntoma**: Notificaciones no se envían o fallan silenciosamente.

**Solución**: Regenerar claves:
```bash
npx web-push generate-vapid-keys
```

Actualizar en `.env`, Supabase Dashboard y Vercel.

### Problema 5: Índice único en push_subscriptions

**Síntoma**: Error al crear tabla con `UNIQUE(user_id, subscription->>'endpoint')`.

**Solución**: Ya implementada en migración `20250127000000_create_push_subscriptions.sql`:
```sql
CREATE UNIQUE INDEX idx_push_subscriptions_user_endpoint
  ON push_subscriptions(user_id, ((subscription->>'endpoint')));
```

### Recomendaciones Generales

1. **Siempre ejecutar desde el directorio del proyecto**: Los comandos `supabase` y `npm` deben ejecutarse desde `C:\Desarrollos\latidos`, no desde `C:\Users\gomez`.

2. **Desregistrar service worker al hacer cambios**: F12 → Application → Service Workers → Unregister, luego refrescar.

3. **Verificar estructura de BD antes de crear triggers**: Usar `SELECT table_name FROM information_schema.tables` para confirmar.

4. **Network tab es tu amigo**: Los errores 404 pueden ser 400 u otros. Siempre verificar la pestaña Network en DevTools.

---

**Última actualización**: 27 de octubre de 2025
**Versión del sistema**: v3.9.0
