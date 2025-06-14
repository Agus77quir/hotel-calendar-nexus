
-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('single', 'double', 'suite', 'deluxe')),
  price DECIMAL(10,2) NOT NULL,
  capacity INTEGER NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guests table
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  document TEXT NOT NULL,
  nationality TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked-in', 'checked-out', 'cancelled')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraints
ALTER TABLE public.reservations ADD CONSTRAINT check_dates CHECK (check_out > check_in);
ALTER TABLE public.reservations ADD CONSTRAINT check_guests_count CHECK (guests_count > 0);
ALTER TABLE public.rooms ADD CONSTRAINT check_price CHECK (price > 0);
ALTER TABLE public.rooms ADD CONSTRAINT check_capacity CHECK (capacity > 0);

-- Create indexes for better performance
CREATE INDEX idx_reservations_guest_id ON public.reservations(guest_id);
CREATE INDEX idx_reservations_room_id ON public.reservations(room_id);
CREATE INDEX idx_reservations_dates ON public.reservations(check_in, check_out);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_rooms_status ON public.rooms(status);

-- Insert some sample data
INSERT INTO public.rooms (number, type, price, capacity, amenities) VALUES
('101', 'single', 80.00, 1, '{"wifi", "tv", "ac"}'),
('102', 'single', 80.00, 1, '{"wifi", "tv", "ac"}'),
('201', 'double', 120.00, 2, '{"wifi", "tv", "ac", "minibar"}'),
('202', 'double', 120.00, 2, '{"wifi", "tv", "ac", "minibar"}'),
('301', 'suite', 200.00, 4, '{"wifi", "tv", "ac", "minibar", "balcony", "kitchenette"}'),
('302', 'deluxe', 300.00, 6, '{"wifi", "tv", "ac", "minibar", "balcony", "kitchenette", "jacuzzi"}');

INSERT INTO public.guests (first_name, last_name, email, phone, document, nationality) VALUES
('Juan', 'Pérez', 'juan.perez@email.com', '+34 600 123 456', '12345678A', 'España'),
('María', 'García', 'maria.garcia@email.com', '+34 600 234 567', '23456789B', 'España'),
('John', 'Smith', 'john.smith@email.com', '+1 555 123 4567', 'US123456789', 'Estados Unidos');
