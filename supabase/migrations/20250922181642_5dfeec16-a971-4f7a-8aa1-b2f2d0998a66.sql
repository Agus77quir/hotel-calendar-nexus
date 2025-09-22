-- Fix sequence desync causing duplicate key on inserts
-- Sync sequences to current max IDs (ids stored as text with LPAD)
SELECT setval('public.guests_id_seq', COALESCE((SELECT MAX(id::int) FROM public.guests), 0), true);
SELECT setval('public.rooms_id_seq', COALESCE((SELECT MAX(id::int) FROM public.rooms), 0), true);
SELECT setval('public.reservations_id_seq', COALESCE((SELECT MAX(id::int) FROM public.reservations), 0), true);

-- Optional safety: ensure sequences exist (no-op if already present)
-- CREATE SEQUENCE IF NOT EXISTS public.guests_id_seq;
-- CREATE SEQUENCE IF NOT EXISTS public.rooms_id_seq;
-- CREATE SEQUENCE IF NOT EXISTS public.reservations_id_seq;
