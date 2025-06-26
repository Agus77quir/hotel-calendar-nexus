
-- Identificar reservas superpuestas existentes
SELECT 
  r1.id as reservation1_id,
  r2.id as reservation2_id,
  r1.room_id,
  r1.check_in as r1_check_in,
  r1.check_out as r1_check_out,
  r2.check_in as r2_check_in,
  r2.check_out as r2_check_out,
  r1.status as r1_status,
  r2.status as r2_status
FROM reservations r1
JOIN reservations r2 ON r1.room_id = r2.room_id 
WHERE r1.id < r2.id
  AND r1.status != 'cancelled'
  AND r2.status != 'cancelled'
  AND daterange(r1.check_in, r1.check_out, '[]') && daterange(r2.check_in, r2.check_out, '[]');

-- Cancelar las reservas más recientes que se superponen (manteniendo las más antiguas)
UPDATE reservations 
SET status = 'cancelled'
WHERE id IN (
  SELECT r2.id
  FROM reservations r1
  JOIN reservations r2 ON r1.room_id = r2.room_id 
  WHERE r1.id < r2.id
    AND r1.status != 'cancelled'
    AND r2.status != 'cancelled'
    AND daterange(r1.check_in, r1.check_out, '[]') && daterange(r2.check_in, r2.check_out, '[]')
);

-- Ahora crear la restricción de exclusión
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.reservations 
ADD CONSTRAINT no_overlapping_reservations 
EXCLUDE USING gist (
  room_id WITH =, 
  daterange(check_in, check_out, '[]') WITH &&
)
WHERE (status != 'cancelled');

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_reservations_room_dates 
ON public.reservations (room_id, check_in, check_out) 
WHERE status != 'cancelled';
