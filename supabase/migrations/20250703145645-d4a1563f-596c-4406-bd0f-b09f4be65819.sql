
-- Delete all reservations first (due to foreign key constraints)
DELETE FROM public.reservations;

-- Delete all guests
DELETE FROM public.guests;

-- Reset the sequence counters for guests and reservations to start from 1
ALTER SEQUENCE guests_id_seq RESTART WITH 1;
ALTER SEQUENCE reservations_id_seq RESTART WITH 1;

-- Optional: Clear audit tables as well
DELETE FROM public.guests_audit;
DELETE FROM public.reservations_audit;
