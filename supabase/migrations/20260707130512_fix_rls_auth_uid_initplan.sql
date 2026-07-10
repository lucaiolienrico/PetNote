
-- Fix auth_rls_initplan WARN su 10 tabelle
-- Sostituisce auth.uid() con (SELECT auth.uid()) per evitare re-evaluation per ogni riga

-- profiles
DROP POLICY IF EXISTS "profile_own" ON profiles;
CREATE POLICY "profile_own" ON profiles
  FOR ALL USING (id = (SELECT auth.uid()));

-- pets
DROP POLICY IF EXISTS "pets_own" ON pets;
CREATE POLICY "pets_own" ON pets
  FOR ALL USING (owner_id = (SELECT auth.uid()));

-- vaccinations
DROP POLICY IF EXISTS "vaccinations_own" ON vaccinations;
CREATE POLICY "vaccinations_own" ON vaccinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = vaccinations.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

-- vet_visits
DROP POLICY IF EXISTS "vet_visits_own" ON vet_visits;
CREATE POLICY "vet_visits_own" ON vet_visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = vet_visits.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

-- antiparasitics
DROP POLICY IF EXISTS "antiparasitics_own" ON antiparasitics;
CREATE POLICY "antiparasitics_own" ON antiparasitics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = antiparasitics.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

-- medications
DROP POLICY IF EXISTS "medications_own" ON medications;
CREATE POLICY "medications_own" ON medications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = medications.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

-- weight_logs
DROP POLICY IF EXISTS "weight_logs_own" ON weight_logs;
CREATE POLICY "weight_logs_own" ON weight_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = weight_logs.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

-- health_events
DROP POLICY IF EXISTS "health_events_own" ON health_events;
CREATE POLICY "health_events_own" ON health_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = health_events.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

-- documents
DROP POLICY IF EXISTS "documents_own" ON documents;
CREATE POLICY "documents_own" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = documents.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );

-- share_links
DROP POLICY IF EXISTS "share_links_own" ON share_links;
CREATE POLICY "share_links_own" ON share_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = share_links.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );
