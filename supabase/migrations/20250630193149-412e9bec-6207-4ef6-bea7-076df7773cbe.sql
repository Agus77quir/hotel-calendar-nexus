
-- Limpiar completamente todos los datos excepto habitaciones
DELETE FROM public.reservations_audit;
DELETE FROM public.guests_audit;
DELETE FROM public.rooms_audit;
DELETE FROM public.reservations;
DELETE FROM public.guests;

-- Resetear secuencias a 0 para que el próximo ID sea 01
ALTER SEQUENCE guests_id_seq RESTART WITH 1;
ALTER SEQUENCE reservations_id_seq RESTART WITH 1;

-- Limpiar contadores de auditoría si existen
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'guests_audit_id_seq') THEN
        ALTER SEQUENCE guests_audit_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'reservations_audit_id_seq') THEN
        ALTER SEQUENCE reservations_audit_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'rooms_audit_id_seq') THEN
        ALTER SEQUENCE rooms_audit_id_seq RESTART WITH 1;
    END IF;
END $$;
