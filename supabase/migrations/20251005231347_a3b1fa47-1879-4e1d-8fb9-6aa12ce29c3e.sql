-- Fix reservation creation: prevent PK duplicates and keep existing alphanumeric IDs

-- 1) Ensure default ID uses 6 digits (safe for growth)
ALTER TABLE public.reservations
  ALTER COLUMN id SET DEFAULT lpad(nextval('reservations_id_seq')::text, 6, '0');

-- 2) Safely reset sequence using only numeric IDs (ignore 'R-...' etc.) and never move backwards
SELECT setval(
  'reservations_id_seq',
  GREATEST(
    COALESCE((SELECT MAX(id::int) FROM public.reservations WHERE id ~ '^[0-9]+$'), 0),
    (SELECT last_value FROM public.reservations_id_seq)
  )
);