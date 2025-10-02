-- Fix out-of-sync guests_id_seq causing duplicate primary key on insert
SELECT setval('public.guests_id_seq', COALESCE((SELECT MAX(id::int) FROM public.guests), 0), true);
