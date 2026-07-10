
-- Fix 7 FK senza indice → query performance su JOIN/DELETE cascade

CREATE INDEX IF NOT EXISTS idx_vet_visits_pet       ON vet_visits(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_events_pet     ON health_events(pet_id);
CREATE INDEX IF NOT EXISTS idx_medications_pet       ON medications(pet_id);
CREATE INDEX IF NOT EXISTS idx_documents_pet         ON documents(pet_id);
CREATE INDEX IF NOT EXISTS idx_share_links_pet       ON share_links(pet_id);
CREATE INDEX IF NOT EXISTS idx_antiparasitics_pet    ON antiparasitics(pet_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id);
