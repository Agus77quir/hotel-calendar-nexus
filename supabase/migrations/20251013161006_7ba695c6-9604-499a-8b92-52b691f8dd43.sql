-- Agregar habitación 31 faltante
INSERT INTO rooms (number, type, price, capacity, amenities, status)
VALUES ('31', 'matrimonial', 67800, 2, ARRAY['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'], 'available');