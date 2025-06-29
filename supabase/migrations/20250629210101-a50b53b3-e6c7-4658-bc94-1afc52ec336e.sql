
-- Restaurar las habitaciones originales con sus datos correctos
DELETE FROM public.rooms;

-- Reiniciar la secuencia de rooms para que comience desde 1
ALTER SEQUENCE rooms_id_seq RESTART WITH 1;

-- Insertar las habitaciones originales con sus datos completos
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

-- Asegurar que las secuencias estén configuradas correctamente para IDs numéricos secuenciales
-- Ajustar las secuencias para que generen IDs como '01', '02', etc.
SELECT setval('guests_id_seq', (SELECT COALESCE(MAX(id::integer), 0) FROM guests) + 1, false);
SELECT setval('rooms_id_seq', (SELECT COALESCE(MAX(id::integer), 0) FROM rooms) + 1, false);
SELECT setval('reservations_id_seq', (SELECT COALESCE(MAX(id::integer), 0) FROM reservations) + 1, false);
