
-- Actualizar las funciones de auditoría para capturar más información contextual

-- Función mejorada para auditar cambios en huéspedes
CREATE OR REPLACE FUNCTION public.audit_guests_changes()
RETURNS TRIGGER AS $$
DECLARE
  context_info JSONB;
BEGIN
  -- Crear información contextual adicional
  context_info := jsonb_build_object(
    'table_name', 'guests',
    'entity_type', 'guest'
  );
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, old_data, new_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD)::jsonb, context_info, coalesce(current_setting('app.current_user', true), current_user));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb || context_info, coalesce(current_setting('app.current_user', true), current_user));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', null, row_to_json(NEW)::jsonb || context_info, coalesce(current_setting('app.current_user', true), current_user));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Función mejorada para auditar cambios en habitaciones
CREATE OR REPLACE FUNCTION public.audit_rooms_changes()
RETURNS TRIGGER AS $$
DECLARE
  context_info JSONB;
BEGIN
  -- Crear información contextual adicional
  context_info := jsonb_build_object(
    'table_name', 'rooms',
    'entity_type', 'room'
  );
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.rooms_audit (room_id, operation_type, old_data, new_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD)::jsonb, context_info, coalesce(current_setting('app.current_user', true), current_user));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.rooms_audit (room_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb || context_info, coalesce(current_setting('app.current_user', true), current_user));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.rooms_audit (room_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', null, row_to_json(NEW)::jsonb || context_info, coalesce(current_setting('app.current_user', true), current_user));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Función mejorada para auditar cambios en reservas
CREATE OR REPLACE FUNCTION public.audit_reservations_changes()
RETURNS TRIGGER AS $$
DECLARE
  context_info JSONB;
  guest_name TEXT;
  room_number TEXT;
BEGIN
  -- Obtener información adicional
  IF TG_OP != 'DELETE' THEN
    SELECT CONCAT(g.first_name, ' ', g.last_name), r.number
    INTO guest_name, room_number
    FROM guests g, rooms r
    WHERE g.id = NEW.guest_id AND r.id = NEW.room_id;
  ELSE
    SELECT CONCAT(g.first_name, ' ', g.last_name), r.number
    INTO guest_name, room_number
    FROM guests g, rooms r
    WHERE g.id = OLD.guest_id AND r.id = OLD.room_id;
  END IF;
  
  -- Crear información contextual adicional
  context_info := jsonb_build_object(
    'table_name', 'reservations',
    'entity_type', 'reservation',
    'guest_name', coalesce(guest_name, 'N/A'),
    'room_number', coalesce(room_number, 'N/A')
  );
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.reservations_audit (reservation_id, operation_type, old_data, new_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD)::jsonb || context_info, context_info, coalesce(current_setting('app.current_user', true), current_user));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.reservations_audit (reservation_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD)::jsonb || context_info, row_to_json(NEW)::jsonb || context_info, coalesce(current_setting('app.current_user', true), current_user));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.reservations_audit (reservation_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', null, row_to_json(NEW)::jsonb || context_info, coalesce(current_setting('app.current_user', true), current_user));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Insertar algunos datos de prueba para verificar que funciona
DO $$
BEGIN
  -- Solo insertar si no existen datos de prueba
  IF NOT EXISTS (SELECT 1 FROM public.guests_audit LIMIT 1) THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, new_data, changed_by) 
    VALUES (gen_random_uuid(), 'INSERT', '{"first_name": "Juan", "last_name": "Pérez", "entity_type": "guest"}', 'Admin');
    
    INSERT INTO public.rooms_audit (room_id, operation_type, new_data, changed_by) 
    VALUES (gen_random_uuid(), 'UPDATE', '{"number": "101", "type": "Individual", "entity_type": "room"}', 'Rec 1');
    
    INSERT INTO public.reservations_audit (reservation_id, operation_type, new_data, changed_by) 
    VALUES (gen_random_uuid(), 'INSERT', '{"guest_name": "María García", "room_number": "102", "check_in": "2024-01-15", "check_out": "2024-01-17", "entity_type": "reservation"}', 'Rec 2');
  END IF;
END $$;
