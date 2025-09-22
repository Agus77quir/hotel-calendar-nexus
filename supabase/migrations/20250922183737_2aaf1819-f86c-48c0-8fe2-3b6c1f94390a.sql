-- Ensure inserts never reuse an existing primary key on reservations
-- 1) Create function to assign a fresh sequential ID on insert
CREATE OR REPLACE FUNCTION public.reservations_assign_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If the incoming row has no id OR the id already exists, assign a new one
  IF NEW.id IS NULL OR EXISTS (SELECT 1 FROM public.reservations WHERE id = NEW.id) THEN
    NEW.id := lpad(nextval('reservations_id_seq')::text, 2, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- 2) Drop and recreate trigger to attach the function
DROP TRIGGER IF EXISTS trg_reservations_assign_id ON public.reservations;
CREATE TRIGGER trg_reservations_assign_id
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.reservations_assign_id();

-- 3) As a safety, re-sync the sequence to the current max numeric id
SELECT setval('public.reservations_id_seq', COALESCE((SELECT MAX(id::int) FROM public.reservations), 0), true);
