-- Add missing RLS policy to allow audit inserts triggered by reservations changes
-- This fixes "new row violates row-level security policy for table reservations_audit"

-- Ensure RLS is enabled (already true per introspection) and add INSERT policy if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'reservations_audit' 
      AND policyname = 'Allow inserts into reservations_audit'
  ) THEN
    CREATE POLICY "Allow inserts into reservations_audit"
    ON public.reservations_audit
    FOR INSERT
    TO public
    WITH CHECK (true);
  END IF;
END $$;
