-- Ensure triggers exist on reservations to fix ID assignment and validations
DO $$
BEGIN
  -- Trigger: assign sequential id before insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'reservations_assign_id_trigger'
  ) THEN
    CREATE TRIGGER reservations_assign_id_trigger
    BEFORE INSERT ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.reservations_assign_id();
  END IF;

  -- Trigger: validate no overlapping reservations on insert/update
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'reservations_overlap_trigger'
  ) THEN
    CREATE TRIGGER reservations_overlap_trigger
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.check_no_overlapping_reservations();
  END IF;

  -- Trigger: keep updated_at in sync on update
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_reservations_updated_at'
  ) THEN
    CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Trigger: audit trail for reservations changes
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_reservations_trigger'
  ) THEN
    CREATE TRIGGER audit_reservations_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_reservations_changes();
  END IF;
END$$;