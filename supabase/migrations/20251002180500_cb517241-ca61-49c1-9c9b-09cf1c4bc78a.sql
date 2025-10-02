-- Resync guests_id_seq to prevent PK collisions on inserts
SELECT setval('public.guests_id_seq', COALESCE((SELECT MAX(id::int) FROM public.guests), 0), true);