
-- Eliminar todos los registros de auditoría
DELETE FROM public.guests_audit;
DELETE FROM public.rooms_audit;
DELETE FROM public.reservations_audit;

-- Eliminar todas las reservas
DELETE FROM public.reservations;

-- Eliminar todos los huéspedes
DELETE FROM public.guests;

-- Reiniciar las secuencias a 1 para que el próximo ID sea 01
ALTER SEQUENCE guests_id_seq RESTART WITH 1;
ALTER SEQUENCE reservations_id_seq RESTART WITH 1;

-- Note: No reiniciamos rooms_id_seq porque las habitaciones son datos maestros que deben mantenerse
