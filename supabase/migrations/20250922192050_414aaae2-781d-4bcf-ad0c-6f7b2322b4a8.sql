-- 1) Asegurar IDs únicos secuenciales en reservas
CREATE OR REPLACE FUNCTION public.reservations_assign_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si llega sin id o el id ya existe, asignar uno nuevo de la secuencia
  IF NEW.id IS NULL OR EXISTS (SELECT 1 FROM public.reservations WHERE id = NEW.id) THEN
    NEW.id := lpad(nextval('reservations_id_seq')::text, 2, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservations_assign_id ON public.reservations;
CREATE TRIGGER trg_reservations_assign_id
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.reservations_assign_id();

-- Sincronizar la secuencia con el máximo actual
SELECT setval('public.reservations_id_seq', COALESCE((SELECT MAX(id::int) FROM public.reservations), 0), true);

-- 2) Evitar solapamientos de reservas por habitación (lado servidor)
CREATE OR REPLACE FUNCTION public.check_no_overlapping_reservations()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar fechas (checkout > checkin)
  IF NEW.check_out <= NEW.check_in THEN
    RAISE EXCEPTION 'invalid_dates: check_out must be after check_in';
  END IF;

  -- Si existe otra reserva para la misma habitación con intersección de rangos, lanzar error
  IF EXISTS (
    SELECT 1
    FROM public.reservations r
    WHERE r.room_id = NEW.room_id
      AND r.status <> 'cancelled'
      AND (TG_OP = 'INSERT' OR r.id <> NEW.id)
      AND daterange(r.check_in, r.check_out, '[)') && daterange(NEW.check_in, NEW.check_out, '[)')
  ) THEN
    RAISE EXCEPTION 'no_overlapping_reservations';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_no_overlap_reservations ON public.reservations;
CREATE TRIGGER trg_no_overlap_reservations
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.check_no_overlapping_reservations();

-- 3) Check adicional de fechas a nivel de tabla (defensivo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reservations_check_valid_dates'
  ) THEN
    ALTER TABLE public.reservations
    ADD CONSTRAINT reservations_check_valid_dates CHECK (check_out > check_in);
  END IF;
END $$;