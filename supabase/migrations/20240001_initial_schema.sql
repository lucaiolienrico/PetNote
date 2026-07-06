-- ============================================================
-- PetNote — Initial Schema
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name               TEXT,
  avatar_url              TEXT,
  plan                    TEXT NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free','premium')),
  paypal_subscription_id  TEXT UNIQUE,
  subscription_status     TEXT
                            CHECK (subscription_status IN ('active','cancelled','expired')),
  subscription_expires_at TIMESTAMPTZ,
  is_admin                BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PETS
-- ============================================================
CREATE TABLE pets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  species     TEXT NOT NULL
                CHECK (species IN ('cane','gatto','coniglio','uccello','rettile','altro')),
  breed       TEXT,
  sex         TEXT NOT NULL DEFAULT 'non_specificato'
                CHECK (sex IN ('maschio','femmina','non_specificato')),
  birth_date  DATE CHECK (birth_date <= CURRENT_DATE),
  microchip   TEXT,
  photo_url   TEXT,
  notes       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pets_microchip_unique UNIQUE NULLS NOT DISTINCT (microchip)
);

-- ============================================================
-- VACCINATIONS
-- ============================================================
CREATE TABLE vaccinations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name    TEXT NOT NULL,
  administered_at DATE NOT NULL,
  veterinarian    TEXT,
  batch_number    TEXT,
  next_due_at     DATE,
  notes           TEXT,
  attachment_url  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT vaccinations_dates_check
    CHECK (next_due_at IS NULL OR next_due_at > administered_at)
);

-- ============================================================
-- VET_VISITS
-- ============================================================
CREATE TABLE vet_visits (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  visited_at     DATE NOT NULL,
  clinic         TEXT,
  veterinarian   TEXT,
  reason         TEXT NOT NULL,
  diagnosis      TEXT,
  cost           NUMERIC(8,2) CHECK (cost >= 0),
  notes          TEXT,
  attachment_url TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ANTIPARASITICS
-- ============================================================
CREATE TABLE antiparasitics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  product_name    TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('interno','esterno','entrambi')),
  administered_at DATE NOT NULL,
  next_due_at     DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT antipar_dates_check
    CHECK (next_due_at IS NULL OR next_due_at > administered_at)
);

-- ============================================================
-- MEDICATIONS (V2)
-- ============================================================
CREATE TABLE medications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  drug_name  TEXT NOT NULL,
  dosage     TEXT,
  frequency  TEXT,
  start_date DATE NOT NULL,
  end_date   DATE,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT med_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ============================================================
-- WEIGHT_LOGS
-- ============================================================
CREATE TABLE weight_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id      UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight_kg   NUMERIC(5,3) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
  measured_at DATE NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- HEALTH_EVENTS
-- ============================================================
CREATE TABLE health_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  event_type     TEXT NOT NULL,
  occurred_at    DATE NOT NULL,
  description    TEXT,
  attachment_url TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DOCUMENTS (V2)
-- ============================================================
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  document_type TEXT NOT NULL
                  CHECK (document_type IN
                    ('passaporto','cartella_clinica','ricetta','esame','altro')),
  file_url      TEXT NOT NULL,
  file_size     INTEGER,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SHARE_LINKS (V2)
-- ============================================================
CREATE TABLE share_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PAYPAL IDEMPOTENCY
-- ============================================================
CREATE TABLE processed_paypal_events (
  event_id     TEXT PRIMARY KEY,
  event_type   TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ADMIN AUDIT LOG
-- ============================================================
CREATE TABLE admin_audit_log (
  id          BIGSERIAL PRIMARY KEY,
  admin_id    UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  payload     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDICI
-- ============================================================
CREATE INDEX idx_pets_owner        ON pets(owner_id) WHERE is_active = true;
CREATE INDEX idx_vaccinations_pet  ON vaccinations(pet_id);
CREATE INDEX idx_vaccinations_due  ON vaccinations(next_due_at) WHERE next_due_at IS NOT NULL;
CREATE INDEX idx_antipar_due       ON antiparasitics(next_due_at) WHERE next_due_at IS NOT NULL;
CREATE INDEX idx_weight_pet_date   ON weight_logs(pet_id, measured_at DESC);

-- ============================================================
-- TRIGGER updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE su signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_visits             ENABLE ROW LEVEL SECURITY;
ALTER TABLE antiparasitics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications            ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links            ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_paypal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log        ENABLE ROW LEVEL SECURITY;

-- profiles — accesso diretto
CREATE POLICY "profile_own" ON profiles
  FOR ALL USING (id = auth.uid());

-- pets — ownership diretta
CREATE POLICY "pets_own" ON pets
  FOR ALL USING (owner_id = auth.uid());

-- tabelle figlie — ownership transitiva via pets
CREATE POLICY "vaccinations_own" ON vaccinations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = vaccinations.pet_id AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "vet_visits_own" ON vet_visits
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = vet_visits.pet_id AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "antiparasitics_own" ON antiparasitics
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = antiparasitics.pet_id AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "medications_own" ON medications
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = medications.pet_id AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "weight_logs_own" ON weight_logs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = weight_logs.pet_id AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "health_events_own" ON health_events
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = health_events.pet_id AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "documents_own" ON documents
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = documents.pet_id AND pets.owner_id = auth.uid()
  ));

CREATE POLICY "share_links_own" ON share_links
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = share_links.pet_id AND pets.owner_id = auth.uid()
  ));

-- processed_paypal_events + admin_audit_log → solo service_role (nessuna policy pubblica)
