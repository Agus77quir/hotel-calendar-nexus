
-- Resetear el estado de todas las habitaciones a 'available'
UPDATE public.rooms SET status = 'available' WHERE status != 'available';

-- Verificar que todas las habitaciones estén disponibles
-- (Esta consulta es solo informativa y no afecta los datos)
SELECT 
    COUNT(*) as total_rooms,
    COUNT(CASE WHEN status = 'available' THEN 1 END) as available_rooms,
    COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_rooms,
    COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_rooms,
    COUNT(CASE WHEN status = 'cleaning' THEN 1 END) as cleaning_rooms
FROM public.rooms;
