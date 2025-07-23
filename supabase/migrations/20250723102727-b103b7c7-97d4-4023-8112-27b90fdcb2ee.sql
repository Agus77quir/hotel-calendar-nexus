
-- Eliminar todos los datos de auditoría
DELETE FROM public.guests_audit;
DELETE FROM public.rooms_audit;
DELETE FROM public.reservations_audit;

-- Eliminar todas las reservas (primero por las claves foráneas)
DELETE FROM public.reservations;

-- Eliminar todos los huéspedes
DELETE FROM public.guests;

-- Resetear las secuencias para que los próximos IDs empiecen desde 01
ALTER SEQUENCE guests_id_seq RESTART WITH 1;
ALTER SEQUENCE reservations_id_seq RESTART WITH 1;

-- Resetear las secuencias de auditoría si existen
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
