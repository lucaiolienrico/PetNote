-- ============================================================
-- Fix 1: search_path immutabile su set_updated_at e handle_new_user
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

-- ============================================================
-- Fix 2: revoca EXECUTE su handle_new_user ad anon/authenticated
-- (è un trigger interno, non deve essere chiamabile via REST)
-- ============================================================
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;

-- ============================================================
-- Fix 3: admin_audit_log e processed_paypal_events
-- nessuna policy pubblica — comportamento intenzionale (solo service_role)
-- aggiungiamo un commento per documentarlo
-- ============================================================
COMMENT ON TABLE admin_audit_log IS 'Solo service_role. Nessuna policy pubblica intenzionale.';
COMMENT ON TABLE processed_paypal_events IS 'Solo service_role. Nessuna policy pubblica intenzionale.';
