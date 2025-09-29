-- Create sequence for reservation_groups IDs
CREATE SEQUENCE IF NOT EXISTS public.reservation_groups_id_seq;

-- Create reservation_groups table to represent a multi-room booking
CREATE TABLE IF NOT EXISTS public.reservation_groups (
  id TEXT NOT NULL DEFAULT lpad(nextval('reservation_groups_id_seq')::text, 2, '0') PRIMARY KEY,
  guest_id TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  rooms_count INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed',
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS following existing pattern (public access)
ALTER TABLE public.reservation_groups ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reservation_groups' AND policyname = 'Public access'
  ) THEN
    CREATE POLICY "Public access"
    ON public.reservation_groups
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Trigger to maintain updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_reservation_groups_updated_at'
  ) THEN
    CREATE TRIGGER update_reservation_groups_updated_at
    BEFORE UPDATE ON public.reservation_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Add group_id column to reservations to link to reservation_groups
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS group_id TEXT;

-- FK constraint and index
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservations_group_id_fkey'
  ) THEN
    ALTER TABLE public.reservations
    ADD CONSTRAINT reservations_group_id_fkey
    FOREIGN KEY (group_id)
    REFERENCES public.reservation_groups (id)
    ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reservations_group_id ON public.reservations(group_id);
