-- pg_net non supporta ALTER EXTENSION ... SET SCHEMA (errore 0A000).
-- Nessuna dipendenza catalogata su questa extension (verificato via
-- pg_depend) — il cron job referenzia net.http_post come testo SQL puro
-- eseguito a runtime, non una FK di catalogo, quindi drop+recreate e'
-- sicuro e non richiede di ri-creare il job.
DROP EXTENSION pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;
