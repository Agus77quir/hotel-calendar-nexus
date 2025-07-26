
-- Eliminar todos los datos de auditoría
DELETE FROM public.guests_audit;
DELETE FROM public.rooms_audit;
DELETE FROM public.reservations_audit;

-- Eliminar todas las reservas
DELETE FROM public.reservations;

-- Eliminar todos los huéspedes
DELETE FROM public.guests;

-- Reiniciar las secuencias para que empiecen desde 01
ALTER SEQUENCE guests_id_seq RESTART WITH 1;
ALTER SEQUENCE reservations_id_seq RESTART WITH 1;

-- Nota: No reiniciamos rooms_id_seq porque queremos mantener las habitaciones existentes
