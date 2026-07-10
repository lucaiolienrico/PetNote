DROP POLICY IF EXISTS "weight_logs_own" ON public.weight_logs;

CREATE POLICY "weight_logs_own" ON public.weight_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = weight_logs.pet_id
        AND pets.owner_id = (SELECT auth.uid())
    )
  );
