-- Habilitar RLS (por si no está)
ALTER TABLE public.guests_audit ENABLE ROW LEVEL SECURITY;

-- Crear política de INSERT para permitir que el trigger de auditoría inserte filas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'guests_audit' 
      AND policyname = 'Allow inserts into guests_audit'
  ) THEN
    CREATE POLICY "Allow inserts into guests_audit"
    ON public.guests_audit
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;