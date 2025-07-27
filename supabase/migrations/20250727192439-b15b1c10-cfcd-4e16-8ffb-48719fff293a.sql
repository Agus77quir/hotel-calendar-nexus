
-- Phase 1: Enable Row Level Security and create user profiles system

-- 1. Create user profiles table linked to Supabase auth
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'receptionist')) DEFAULT 'receptionist',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create secure function to check user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- 3. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nuevo'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'receptionist')
  );
  RETURN NEW;
END;
$$;

-- 4. Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable RLS on all main tables
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations_audit ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

-- 7. Create RLS policies for guests
CREATE POLICY "Staff can view all guests"
  ON public.guests FOR SELECT
  USING (public.get_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Staff can insert guests"
  ON public.guests FOR INSERT
  WITH CHECK (public.get_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Staff can update guests"
  ON public.guests FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Admins can delete guests"
  ON public.guests FOR DELETE
  USING (public.get_user_role() = 'admin');

-- 8. Create RLS policies for rooms
CREATE POLICY "Staff can view all rooms"
  ON public.rooms FOR SELECT
  USING (public.get_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Admins can insert rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update rooms"
  ON public.rooms FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete rooms"
  ON public.rooms FOR DELETE
  USING (public.get_user_role() = 'admin');

-- 9. Create RLS policies for reservations
CREATE POLICY "Staff can view all reservations"
  ON public.reservations FOR SELECT
  USING (public.get_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Staff can insert reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (public.get_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Staff can update reservations"
  ON public.reservations FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Admins can delete reservations"
  ON public.reservations FOR DELETE
  USING (public.get_user_role() = 'admin');

-- 10. Create RLS policies for audit tables (read-only for staff)
CREATE POLICY "Staff can view guests audit"
  ON public.guests_audit FOR SELECT
  USING (public.get_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Staff can view rooms audit"
  ON public.rooms_audit FOR SELECT
  USING (public.get_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Staff can view reservations audit"
  ON public.reservations_audit FOR SELECT
  USING (public.get_user_role() IN ('admin', 'receptionist'));

-- 11. Fix existing database functions security
CREATE OR REPLACE FUNCTION public.set_current_user(user_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.current_user', user_name, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_next_sequential_id(table_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 12. Update audit functions to use secure search path
CREATE OR REPLACE FUNCTION public.audit_guests_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  context_info JSONB;
  current_user_name TEXT;
BEGIN
  -- Get current user from context or profile
  current_user_name := coalesce(current_setting('app.current_user', true), 'Sistema');
  
  -- Map user names according to expected format in UI
  CASE current_user_name
    WHEN 'Administrador Sistema' THEN current_user_name := 'Admin';
    WHEN 'Recepcionista Uno' THEN current_user_name := 'Rec 1';
    WHEN 'Recepcionista Dos' THEN current_user_name := 'Rec 2';
    WHEN 'rec1' THEN current_user_name := 'Rec 1';
    WHEN 'rec2' THEN current_user_name := 'Rec 2';
    WHEN 'admin' THEN current_user_name := 'Admin';
    ELSE current_user_name := current_user_name;
  END CASE;
  
  -- Create additional contextual information
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
$$;

CREATE OR REPLACE FUNCTION public.audit_rooms_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  context_info JSONB;
  current_user_name TEXT;
BEGIN
  -- Get current user from context or profile
  current_user_name := coalesce(current_setting('app.current_user', true), 'Sistema');
  
  -- Map user names according to expected format in UI
  CASE current_user_name
    WHEN 'Administrador Sistema' THEN current_user_name := 'Admin';
    WHEN 'Recepcionista Uno' THEN current_user_name := 'Rec 1';
    WHEN 'Recepcionista Dos' THEN current_user_name := 'Rec 2';
    WHEN 'rec1' THEN current_user_name := 'Rec 1';
    WHEN 'rec2' THEN current_user_name := 'Rec 2';
    WHEN 'admin' THEN current_user_name := 'Admin';
    ELSE current_user_name := current_user_name;
  END CASE;
  
  -- Create additional contextual information
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
$$;

CREATE OR REPLACE FUNCTION public.audit_reservations_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  context_info JSONB;
  guest_name TEXT;
  room_number TEXT;
  current_user_name TEXT;
BEGIN
  -- Get current user from context or profile
  current_user_name := coalesce(current_setting('app.current_user', true), 'Sistema');
  
  -- Map user names according to expected format in UI
  CASE current_user_name
    WHEN 'Administrador Sistema' THEN current_user_name := 'Admin';
    WHEN 'Recepcionista Uno' THEN current_user_name := 'Rec 1';
    WHEN 'Recepcionista Dos' THEN current_user_name := 'Rec 2';
    WHEN 'rec1' THEN current_user_name := 'Rec 1';
    WHEN 'rec2' THEN current_user_name := 'Rec 2';
    WHEN 'admin' THEN current_user_name := 'Admin';
    ELSE current_user_name := current_user_name;
  END CASE;
  
  -- Get additional information
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
  
  -- Create additional contextual information
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
$$;

-- 13. Insert default admin user (temporary for migration)
-- This will be replaced with proper Supabase auth registration
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@nardini.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "Administrador", "last_name": "Sistema", "role": "admin"}'::jsonb
) ON CONFLICT (email) DO NOTHING;
