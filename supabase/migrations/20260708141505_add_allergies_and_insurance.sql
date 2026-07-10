-- ALLERGIES
CREATE TABLE allergies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  allergen      TEXT NOT NULL,
  severity      TEXT NOT NULL CHECK (severity IN ('lieve','moderata','grave')),
  reaction      TEXT,
  diagnosed_at  DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INSURANCE_POLICIES (Assicurazioni) — cadenza mensile/annuale, storico polizze nel tempo
CREATE TABLE insurance_policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id            UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL,
  policy_number     TEXT,
  billing_frequency TEXT NOT NULL CHECK (billing_frequency IN ('mensile','annuale')),
  premium_amount    NUMERIC(8,2) NOT NULL CHECK (premium_amount >= 0),
  start_date        DATE NOT NULL,
  end_date          DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT insurance_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

-- RLS: stesso pattern ownership transitiva via pets, (SELECT auth.uid()) per evitare auth_rls_initplan
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allergies_own" ON allergies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = allergies.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insurance_own" ON insurance_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = insurance_policies.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

-- Indici: lookup per pet (pattern lista-per-animale) + scadenza polizza (per futuro reminder, come antiparassitici)
CREATE INDEX idx_allergies_pet ON allergies(pet_id);
CREATE INDEX idx_insurance_pet ON insurance_policies(pet_id);
CREATE INDEX idx_insurance_end_date ON insurance_policies(end_date) WHERE end_date IS NOT NULL;
