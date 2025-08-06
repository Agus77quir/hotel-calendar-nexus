
-- Make email field nullable in guests table
ALTER TABLE public.guests 
ALTER COLUMN email DROP NOT NULL;

-- Make nationality field nullable in guests table  
ALTER TABLE public.guests 
ALTER COLUMN nationality DROP NOT NULL;

-- Set default value for nationality to avoid issues with existing data
UPDATE public.guests 
SET nationality = 'No especificado' 
WHERE nationality IS NULL;

-- Set empty string for email where it's currently required but we want it optional
UPDATE public.guests 
SET email = '' 
WHERE email IS NULL;
