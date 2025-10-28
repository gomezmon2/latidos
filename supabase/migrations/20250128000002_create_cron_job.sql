-- Cron job para procesar cola de notificaciones
-- Se ejecuta cada minuto

SELECT cron.schedule(
  'process-push-notifications',
  '* * * * *', -- Cada minuto
  $$
  SELECT net.http_post(
    url := 'https://jljeegojtkblsdhzuisu.supabase.co/functions/v1/send-push-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- Verificar que el cron job fue creado
SELECT jobid, jobname, schedule, command
FROM cron.job
WHERE jobname = 'process-push-notifications';
