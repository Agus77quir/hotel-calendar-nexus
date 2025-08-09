
-- Eliminar todos los registros de reservas
DELETE FROM reservations;

-- Eliminar todos los registros de huéspedes
DELETE FROM guests;

-- Reiniciar los contadores de secuencia a 1
ALTER SEQUENCE guests_id_seq RESTART WITH 1;
ALTER SEQUENCE reservations_id_seq RESTART WITH 1;

-- También limpiar las tablas de auditoría si deseas empezar completamente limpio
DELETE FROM guests_audit;
DELETE FROM rooms_audit;
DELETE FROM reservations_audit;
