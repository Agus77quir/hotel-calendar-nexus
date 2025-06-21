
-- First, delete all existing reservations to avoid foreign key conflicts
DELETE FROM public.reservations;

-- Then delete all existing rooms
DELETE FROM public.rooms;

-- Drop the existing check constraint
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_type_check;

-- Add a new check constraint with all the room types you specified
ALTER TABLE public.rooms ADD CONSTRAINT rooms_type_check 
CHECK (type IN ('matrimonial', 'triple-individual', 'triple-matrimonial', 'doble-individual', 'suite-presidencial-doble'));

-- Now insert all the specified rooms into the database
INSERT INTO public.rooms (number, type, price, capacity, amenities, status) VALUES
-- Matrimonial rooms
('09', 'matrimonial', 120, 2, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('10', 'matrimonial', 120, 2, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('25', 'matrimonial', 120, 2, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('26', 'matrimonial', 120, 2, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('31', 'matrimonial', 120, 2, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('32', 'matrimonial', 120, 2, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),

-- Triple Individual rooms  
('11', 'triple-individual', 150, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('12', 'triple-individual', 150, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('19', 'triple-individual', 150, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('20', 'triple-individual', 150, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),

-- Triple Matrimonial rooms
('13', 'triple-matrimonial', 160, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('14', 'triple-matrimonial', 160, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('15', 'triple-matrimonial', 160, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('16', 'triple-matrimonial', 160, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('21', 'triple-matrimonial', 160, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('22', 'triple-matrimonial', 160, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('23', 'triple-matrimonial', 160, 3, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),

-- Doble Individual rooms
('17', 'doble-individual', 140, 2, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('18', 'doble-individual', 140, 2, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),
('24', 'doble-individual', 140, 2, '{"WiFi","TV","Aire acondicionado","Baño privado"}', 'available'),

-- Suite Presidencial Doble rooms
('28', 'suite-presidencial-doble', 250, 2, '{"WiFi","TV","Aire acondicionado","Baño privado","Jacuzzi","Sala de estar"}', 'available'),
('30', 'suite-presidencial-doble', 250, 2, '{"WiFi","TV","Aire acondicionado","Baño privado","Jacuzzi","Sala de estar"}', 'available');
