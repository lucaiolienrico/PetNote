-- Sposta handle_new_user fuori dall'API schema (extensions non esposto via REST)
-- Approccio alternativo: revoca su public, ricrea nello schema extensions

-- 1. Drop trigger temporaneamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop funzione pubblica
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Ricrea in schema extensions (non esposto via PostgREST)
CREATE OR REPLACE FUNCTION extensions.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 4. Ricrea trigger che punta alla nuova location
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION extensions.handle_new_user();
