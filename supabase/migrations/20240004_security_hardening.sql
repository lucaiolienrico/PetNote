-- ============================================================
-- Security hardening
-- Già applicato su Supabase via MCP
-- ============================================================

-- search_path immutabile
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- handle_new_user spostato in extensions schema (non esposto via PostgREST)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION extensions.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION extensions.handle_new_user();

COMMENT ON TABLE admin_audit_log IS 'Solo service_role. Nessuna policy pubblica intenzionale.';
COMMENT ON TABLE processed_paypal_events IS 'Solo service_role. Nessuna policy pubblica intenzionale.';
