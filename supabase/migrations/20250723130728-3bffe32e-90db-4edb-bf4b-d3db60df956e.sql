
-- Limpiar completamente todas las tablas de auditoría
DELETE FROM public.guests_audit;
DELETE FROM public.rooms_audit;
DELETE FROM public.reservations_audit;

-- Resetear las secuencias de auditoría si existen
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'guests_audit_id_seq') THEN
        ALTER SEQUENCE guests_audit_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'rooms_audit_id_seq') THEN
        ALTER SEQUENCE rooms_audit_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'reservations_audit_id_seq') THEN
        ALTER SEQUENCE reservations_audit_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Verificar que las tablas de auditoría estén vacías
SELECT 
    'guests_audit' as table_name, 
    COUNT(*) as record_count 
FROM public.guests_audit
UNION ALL
SELECT 
    'rooms_audit' as table_name, 
    COUNT(*) as record_count 
FROM public.rooms_audit
UNION ALL
SELECT 
    'reservations_audit' as table_name, 
    COUNT(*) as record_count 
FROM public.reservations_audit;
