-- Sposta il secret condiviso con send-reminders (header x-cron-secret) fuori
-- da cron.job.command, dove era leggibile in chiaro da chiunque avesse
-- accesso SQL al progetto. Il valore in se' resta invariato (nessuna azione
-- richiesta lato Edge Function secrets) — cambia solo dove/come e' salvato:
-- ora vive cifrato in Supabase Vault (supabase_vault), referenziato via
-- lookup a runtime invece che come letterale SQL.
--
-- Il secret va creato UNA TANTUM fuori da questa migration (execute_sql, non
-- tracciato in history per non lasciare il valore in chiaro nemmeno li'):
--   SELECT vault.create_secret('<valore>', 'send_reminders_cron_secret', '...');

SELECT cron.unschedule('petnote-send-reminders-daily');

SELECT cron.schedule(
  'petnote-send-reminders-daily',
  '0 8 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://sspezhjfgkskdbojngjs.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'send_reminders_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $cron$
);
