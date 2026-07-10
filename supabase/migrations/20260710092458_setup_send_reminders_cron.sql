-- Abilita pg_cron (scheduler) e pg_net (HTTP async da Postgres).
-- Entrambe richieste per chiamare l'Edge Function send-reminders da un
-- cron job invece che da un utente/scheduler esterno.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Rimuove un job omonimo pre-esistente prima di ri-crearlo, cosi' questa
-- migrazione e' idempotente (rieseguibile senza errore "job already exists").
SELECT cron.unschedule('petnote-send-reminders-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'petnote-send-reminders-daily'
);

-- Ogni giorno alle 08:00 UTC (~10:00 CEST / ~09:00 CET in Italia).
-- x-cron-secret deve corrispondere al secret CRON_SECRET configurato come
-- Edge Function secret — send-reminders rifiuta (403) senza match esatto.
--
-- NOTA STORICA (redazione pre-commit): questa versione originale conteneva
-- il valore del secret in chiaro come letterale SQL — vulnerabilita' reale,
-- corretta nella migration 20260710191537_move_cron_secret_to_vault.sql,
-- che sostituisce il letterale con una lookup su Supabase Vault. Il valore
-- reale non viene mai scritto in questo repository (pubblico).
SELECT cron.schedule(
  'petnote-send-reminders-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sspezhjfgkskdbojngjs.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<REDACTED-see-vault-secret-send_reminders_cron_secret>'
    ),
    body := '{}'::jsonb
  );
  $$
);
