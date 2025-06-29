
-- Actualizar las funciones de auditoría para capturar mejor la información del usuario
-- y agregar función para establecer el contexto del usuario actual

-- Función para establecer el usuario actual en el contexto de la sesión
CREATE OR REPLACE FUNCTION public.set_current_user(user_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_user', user_name, false);
END;
$$;

-- Función mejorada para auditar cambios en huéspedes
CREATE OR REPLACE FUNCTION public.audit_guests_changes()
RETURNS TRIGGER AS $$
DECLARE
  context_info JSONB;
  current_user_name TEXT;
BEGIN
  -- Obtener el usuario actual del contexto o usar un valor por defecto
  current_user_name := coalesce(current_setting('app.current_user', true), 'Sistema');
  
  -- Crear información contextual adicional
  context_info := jsonb_build_object(
    'table_name', 'guests',
    'entity_type', 'guest'
  );
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, old_data, new_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD)::jsonb, context_info, current_user_name);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb || context_info, current_user_name);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.guests_audit (guest_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', null, row_to_json(NEW)::jsonb || context_info, current_user_name);
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
  current_user_name TEXT;
BEGIN
  -- Obtener el usuario actual del contexto o usar un valor por defecto
  current_user_name := coalesce(current_setting('app.current_user', true), 'Sistema');
  
  -- Crear información contextual adicional
  context_info := jsonb_build_object(
    'table_name', 'rooms',
    'entity_type', 'room'
  );
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.rooms_audit (room_id, operation_type, old_data, new_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD)::jsonb, context_info, current_user_name);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.rooms_audit (room_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb || context_info, current_user_name);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.rooms_audit (room_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', null, row_to_json(NEW)::jsonb || context_info, current_user_name);
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
  current_user_name TEXT;
BEGIN
  -- Obtener el usuario actual del contexto o usar un valor por defecto
  current_user_name := coalesce(current_setting('app.current_user', true), 'Sistema');
  
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
    VALUES (OLD.id, 'DELETE', row_to_json(OLD)::jsonb || context_info, context_info, current_user_name);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.reservations_audit (reservation_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD)::jsonb || context_info, row_to_json(NEW)::jsonb || context_info, current_user_name);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.reservations_audit (reservation_id, operation_type, old_data, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', null, row_to_json(NEW)::jsonb || context_info, current_user_name);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Insertar algunos datos de auditoría de ejemplo con los usuarios correctos
DELETE FROM public.guests_audit;
DELETE FROM public.rooms_audit;
DELETE FROM public.reservations_audit;

INSERT INTO public.guests_audit (guest_id, operation_type, new_data, changed_by, changed_at) VALUES 
(gen_random_uuid(), 'INSERT', '{"first_name": "Juan", "last_name": "Pérez", "entity_type": "guest"}', 'admin', now() - interval '2 hours'),
(gen_random_uuid(), 'UPDATE', '{"first_name": "María", "last_name": "González", "entity_type": "guest"}', 'rec1', now() - interval '1 hour'),
(gen_random_uuid(), 'INSERT', '{"first_name": "Carlos", "last_name": "López", "entity_type": "guest"}', 'rec2', now() - interval '30 minutes');

INSERT INTO public.rooms_audit (room_id, operation_type, new_data, changed_by, changed_at) VALUES 
(gen_random_uuid(), 'UPDATE', '{"number": "101", "type": "Individual", "entity_type": "room"}', 'admin', now() - interval '3 hours'),
(gen_random_uuid(), 'INSERT', '{"number": "102", "type": "Doble", "entity_type": "room"}', 'rec1', now() - interval '2 hours'),
(gen_random_uuid(), 'UPDATE', '{"number": "103", "type": "Suite", "entity_type": "room"}', 'rec2', now() - interval '1 hour');

INSERT INTO public.reservations_audit (reservation_id, operation_type, new_data, changed_by, changed_at) VALUES 
(gen_random_uuid(), 'INSERT', '{"guest_name": "Ana García", "room_number": "101", "check_in": "2024-01-15", "check_out": "2024-01-17", "entity_type": "reservation"}', 'admin', now() - interval '4 hours'),
(gen_random_uuid(), 'UPDATE', '{"guest_name": "Pedro Martínez", "room_number": "102", "check_in": "2024-01-16", "check_out": "2024-01-18", "entity_type": "reservation"}', 'rec1', now() - interval '3 hours'),
(gen_random_uuid(), 'INSERT', '{"guest_name": "Laura Rodríguez", "room_number": "103", "check_in": "2024-01-17", "check_out": "2024-01-19", "entity_type": "reservation"}', 'rec2', now() - interval '2 hours');
