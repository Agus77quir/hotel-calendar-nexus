
-- Crear tabla de auditoría para huéspedes
CREATE TABLE public.guests_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de auditoría para habitaciones
CREATE TABLE public.rooms_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de auditoría para reservas
CREATE TABLE public.reservations_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Función para auditar cambios en huéspedes
CREATE OR REPLACE FUNCTION public.audit_guests_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, old_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD), current_user);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', row_to_json(NEW), current_user);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Función para auditar cambios en habitaciones
CREATE OR REPLACE FUNCTION public.audit_rooms_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.rooms_audit (room_id, operation_type, old_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD), current_user);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.rooms_audit (room_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.rooms_audit (room_id, operation_type, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', row_to_json(NEW), current_user);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Función para auditar cambios en reservas
CREATE OR REPLACE FUNCTION public.audit_reservations_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.reservations_audit (reservation_id, operation_type, old_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD), current_user);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.reservations_audit (reservation_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.reservations_audit (reservation_id, operation_type, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', row_to_json(NEW), current_user);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para huéspedes
CREATE TRIGGER guests_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION public.audit_guests_changes();

-- Crear triggers para habitaciones
CREATE TRIGGER rooms_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.audit_rooms_changes();

-- Crear triggers para reservas
CREATE TRIGGER reservations_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.audit_reservations_changes();

-- Crear índices para mejorar el rendimiento de las consultas de auditoría
CREATE INDEX idx_guests_audit_guest_id ON public.guests_audit(guest_id);
CREATE INDEX idx_guests_audit_changed_at ON public.guests_audit(changed_at);
CREATE INDEX idx_rooms_audit_room_id ON public.rooms_audit(room_id);
CREATE INDEX idx_rooms_audit_changed_at ON public.rooms_audit(changed_at);
CREATE INDEX idx_reservations_audit_reservation_id ON public.reservations_audit(reservation_id);
CREATE INDEX idx_reservations_audit_changed_at ON public.reservations_audit(changed_at);
