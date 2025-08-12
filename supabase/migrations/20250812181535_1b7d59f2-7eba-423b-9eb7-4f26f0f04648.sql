
-- Deshabilitar temporalmente los triggers de auditoría para evitar que se regeneren registros
ALTER TABLE public.guests DISABLE TRIGGER ALL;
ALTER TABLE public.rooms DISABLE TRIGGER ALL;
ALTER TABLE public.reservations DISABLE TRIGGER ALL;

-- Truncar las tablas de auditoría para asegurar eliminación completa
TRUNCATE TABLE public.guests_audit CASCADE;
TRUNCATE TABLE public.rooms_audit CASCADE;
TRUNCATE TABLE public.reservations_audit CASCADE;

-- Truncar las tablas principales para asegurar eliminación completa
TRUNCATE TABLE public.reservations CASCADE;
TRUNCATE TABLE public.guests CASCADE;

-- Reiniciar las secuencias
ALTER SEQUENCE guests_id_seq RESTART WITH 1;
ALTER SEQUENCE reservations_id_seq RESTART WITH 1;

-- Reactivar los triggers de auditoría
ALTER TABLE public.guests ENABLE TRIGGER ALL;
ALTER TABLE public.rooms ENABLE TRIGGER ALL;
ALTER TABLE public.reservations ENABLE TRIGGER ALL;
