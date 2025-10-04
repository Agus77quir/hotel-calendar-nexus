-- Fix guest creation: avoid duplicate IDs caused by LPAD length truncation
-- 1) Ensure guests.id default generates sufficiently long, non-truncated values
ALTER TABLE public.guests
  ALTER COLUMN id SET DEFAULT lpad(nextval('guests_id_seq')::text, 6, '0');

-- 2) Reset sequence to the current maximum numeric id to prevent collisions
-- Safely cast text IDs like '000012' -> 12
SELECT setval('guests_id_seq', COALESCE((SELECT MAX(id::int) FROM public.guests), 0));