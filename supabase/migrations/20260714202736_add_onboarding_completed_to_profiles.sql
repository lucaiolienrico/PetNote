-- Migration: add_onboarding_completed_to_profiles
-- Applicata al DB live il 2026-07-14 (version 20260714202736).
-- File ricostruito ex post dallo schema live per riallineare il versioning git:
-- la colonna esiste già in produzione — questo file documenta la migration,
-- NON va riapplicata (già presente in supabase_migrations.schema_migrations).

-- Flag onboarding: OnboardingWelcome.tsx viene mostrato una sola volta
-- al primo accesso, poi il flag passa a true.
ALTER TABLE public.profiles
  ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Backfill: gli utenti esistenti prima della feature non devono
-- rivedere il welcome screen.
UPDATE public.profiles
SET onboarding_completed = true;
