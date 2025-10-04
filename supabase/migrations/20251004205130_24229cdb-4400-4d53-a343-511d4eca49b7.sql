-- Corregir el nombre del constraint de clave primaria en reservations
-- El constraint actual se llama "reservations_new_pkey" cuando debería ser "reservations_pkey"

-- Primero eliminar el constraint con nombre incorrecto si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reservations_new_pkey' 
    AND conrelid = 'public.reservations'::regclass
  ) THEN
    ALTER TABLE public.reservations DROP CONSTRAINT reservations_new_pkey;
  END IF;
END $$;

-- Crear el constraint de clave primaria con el nombre correcto
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reservations_pkey' 
    AND conrelid = 'public.reservations'::regclass
  ) THEN
    ALTER TABLE public.reservations ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- Reiniciar la secuencia para evitar conflictos
SELECT setval('reservations_id_seq', 
  COALESCE((SELECT MAX(id::integer) FROM public.reservations WHERE id ~ '^[0-9]+$'), 0) + 1, 
  false);