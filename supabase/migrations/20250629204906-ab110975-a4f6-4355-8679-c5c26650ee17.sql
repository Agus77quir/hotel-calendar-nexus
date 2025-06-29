
-- Primero, vamos a cambiar la estructura para usar IDs secuenciales
-- Crear secuencias para cada tabla
CREATE SEQUENCE IF NOT EXISTS public.guests_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.rooms_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.reservations_id_seq START 1;

-- Alterar las tablas para usar IDs secuenciales como texto con formato
-- Backup de datos existentes y recrear tablas con IDs correctos

-- Crear tablas temporales para migrar datos
CREATE TABLE IF NOT EXISTS public.guests_new (
  id TEXT NOT NULL DEFAULT LPAD(nextval('guests_id_seq')::text, 2, '0') PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  document TEXT NOT NULL,
  nationality TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rooms_new (
  id TEXT NOT NULL DEFAULT LPAD(nextval('rooms_id_seq')::text, 2, '0') PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reservations_new (
  id TEXT NOT NULL DEFAULT LPAD(nextval('reservations_id_seq')::text, 2, '0') PRIMARY KEY,
  guest_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  special_requests TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migrar datos existentes (si los hay)
INSERT INTO public.guests_new (first_name, last_name, email, phone, document, nationality, created_at)
SELECT first_name, last_name, email, phone, document, nationality, created_at
FROM public.guests
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.rooms_new (number, type, capacity, price, status, amenities, created_at)
SELECT number, type, capacity, price, status, amenities, created_at
FROM public.rooms
ON CONFLICT (number) DO NOTHING;

-- Eliminar tablas antiguas y renombrar las nuevas
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;

ALTER TABLE public.guests_new RENAME TO guests;
ALTER TABLE public.rooms_new RENAME TO rooms;
ALTER TABLE public.reservations_new RENAME TO reservations;

-- Agregar foreign keys
ALTER TABLE public.reservations ADD CONSTRAINT fk_reservations_guest_id 
  FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;
ALTER TABLE public.reservations ADD CONSTRAINT fk_reservations_room_id 
  FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;

-- Recrear tablas de auditoría con IDs de texto
DROP TABLE IF EXISTS public.guests_audit CASCADE;
DROP TABLE IF EXISTS public.rooms_audit CASCADE;
DROP TABLE IF EXISTS public.reservations_audit CASCADE;

CREATE TABLE public.guests_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by TEXT
);

CREATE TABLE public.rooms_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by TEXT
);

CREATE TABLE public.reservations_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by TEXT
);

-- Recrear triggers de auditoría
DROP TRIGGER IF EXISTS guests_audit_trigger ON public.guests;
DROP TRIGGER IF EXISTS rooms_audit_trigger ON public.rooms;
DROP TRIGGER IF EXISTS reservations_audit_trigger ON public.reservations;

CREATE TRIGGER guests_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION public.audit_guests_changes();

CREATE TRIGGER rooms_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.audit_rooms_changes();

CREATE TRIGGER reservations_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.audit_reservations_changes();

-- Insertar datos de ejemplo para testing
INSERT INTO public.guests (first_name, last_name, email, phone, document, nationality) VALUES
('Juan', 'Pérez', 'juan.perez@email.com', '+1234567890', '12345678', 'México'),
('María', 'González', 'maria.gonzalez@email.com', '+1234567891', '12345679', 'España'),
('Carlos', 'López', 'carlos.lopez@email.com', '+1234567892', '12345680', 'Argentina');

INSERT INTO public.rooms (number, type, capacity, price, status) VALUES
('101', 'matrimonial', 2, 100.00, 'available'),
('102', 'doble-individual', 2, 80.00, 'available'),
('103', 'triple-individual', 3, 120.00, 'available'),
('104', 'suite-presidencial-doble', 4, 200.00, 'available');

-- Crear función para obtener el próximo ID secuencial
CREATE OR REPLACE FUNCTION get_next_sequential_id(table_name TEXT)
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
BEGIN
  CASE table_name
    WHEN 'guests' THEN
      SELECT nextval('guests_id_seq') INTO next_id;
    WHEN 'rooms' THEN
      SELECT nextval('rooms_id_seq') INTO next_id;
    WHEN 'reservations' THEN
      SELECT nextval('reservations_id_seq') INTO next_id;
    ELSE
      RAISE EXCEPTION 'Tabla no reconocida: %', table_name;
  END CASE;
  
  RETURN LPAD(next_id::text, 2, '0');
END;
$$ LANGUAGE plpgsql;

-- Constraint para prevenir reservas superpuestas
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_overlapping_reservations 
ON public.reservations (room_id, daterange(check_in, check_out, '[)'))
WHERE status NOT IN ('cancelled');
