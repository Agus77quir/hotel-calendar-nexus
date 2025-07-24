
-- Actualizar la función de auditoría para guests
CREATE OR REPLACE FUNCTION public.audit_guests_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  context_info JSONB;
  current_user_name TEXT;
BEGIN
  -- Obtener el usuario actual del contexto, mapear según el formato esperado
  current_user_name := coalesce(current_setting('app.current_user', true), 'Sistema');
  
  -- Mapear los nombres de usuario según el formato esperado en la UI
  CASE current_user_name
    WHEN 'Administrador Sistema' THEN current_user_name := 'Admin';
    WHEN 'Recepcionista Uno' THEN current_user_name := 'Rec 1';
    WHEN 'Recepcionista Dos' THEN current_user_name := 'Rec 2';
    ELSE current_user_name := current_user_name;
  END CASE;
  
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
$function$;

-- Actualizar la función de auditoría para rooms
CREATE OR REPLACE FUNCTION public.audit_rooms_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  context_info JSONB;
  current_user_name TEXT;
BEGIN
  -- Obtener el usuario actual del contexto, mapear según el formato esperado
  current_user_name := coalesce(current_setting('app.current_user', true), 'Sistema');
  
  -- Mapear los nombres de usuario según el formato esperado en la UI
  CASE current_user_name
    WHEN 'Administrador Sistema' THEN current_user_name := 'Admin';
    WHEN 'Recepcionista Uno' THEN current_user_name := 'Rec 1';
    WHEN 'Recepcionista Dos' THEN current_user_name := 'Rec 2';
    ELSE current_user_name := current_user_name;
  END CASE;
  
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
$function$;

-- Actualizar la función de auditoría para reservations
CREATE OR REPLACE FUNCTION public.audit_reservations_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  context_info JSONB;
  guest_name TEXT;
  room_number TEXT;
  current_user_name TEXT;
BEGIN
  -- Obtener el usuario actual del contexto, mapear según el formato esperado
  current_user_name := coalesce(current_setting('app.current_user', true), 'Sistema');
  
  -- Mapear los nombres de usuario según el formato esperado en la UI
  CASE current_user_name
    WHEN 'Administrador Sistema' THEN current_user_name := 'Admin';
    WHEN 'Recepcionista Uno' THEN current_user_name := 'Rec 1';
    WHEN 'Recepcionista Dos' THEN current_user_name := 'Rec 2';
    ELSE current_user_name := current_user_name;
  END CASE;
  
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
$function$;
