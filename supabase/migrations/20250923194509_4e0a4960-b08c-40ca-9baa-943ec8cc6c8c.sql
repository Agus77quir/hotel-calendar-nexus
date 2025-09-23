-- Fix desincronización de secuencias para evitar errores de clave duplicada
-- Alinea las secuencias al valor máximo actual en cada tabla

-- Huéspedes
SELECT setval('public.guests_id_seq', COALESCE((SELECT MAX((id)::int) FROM public.guests), 0), true);

-- Habitaciones
SELECT setval('public.rooms_id_seq', COALESCE((SELECT MAX((id)::int) FROM public.rooms), 0), true);

-- Reservas
SELECT setval('public.reservations_id_seq', COALESCE((SELECT MAX((id)::int) FROM public.reservations), 0), true);
