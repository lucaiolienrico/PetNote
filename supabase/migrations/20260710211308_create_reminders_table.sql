-- Tabella promemoria custom per pet.
-- Consente all'utente Premium di creare scadenze manuali
-- (es. visita annuale, assicurazione in scadenza) indipendenti
-- dai campi next_due_at automatici di vaccinations/antiparasitics.
-- send-reminders Edge Function legge anche questa tabella.

CREATE TABLE IF NOT EXISTS reminders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     UUID        NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 120),
  due_date   DATE        NOT NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Ownership transitiva via pets: pattern canonico del progetto.
-- (SELECT auth.uid()) obbligatorio — evita auth_rls_initplan warning.
CREATE POLICY "reminders_own" ON reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = reminders.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_reminders_pet ON reminders (pet_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders (due_date);
