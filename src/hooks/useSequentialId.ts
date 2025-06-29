
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSequentialId = () => {
  const [nextId, setNextId] = useState<string>('01');

  useEffect(() => {
    const getNextSequentialId = async () => {
      try {
        // Obtener todas las reservas para encontrar el ID más alto
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('id')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reservations for ID:', error);
          return;
        }

        // Buscar el ID numérico más alto
        let maxNumber = 0;
        reservations?.forEach(reservation => {
          // Extraer números del ID
          const matches = reservation.id.match(/\d+/g);
          if (matches) {
            const numbers = matches.map(Number);
            const maxInId = Math.max(...numbers);
            if (maxInId > maxNumber) {
              maxNumber = maxInId;
            }
          }
        });

        // El siguiente ID será el número más alto + 1, formateado con ceros a la izquierda
        const nextNumber = maxNumber + 1;
        setNextId(nextNumber.toString().padStart(2, '0'));
      } catch (error) {
        console.error('Error generating sequential ID:', error);
        setNextId('01');
      }
    };

    getNextSequentialId();
  }, []);

  const generateSequentialId = () => {
    const currentId = nextId;
    const nextNumber = parseInt(nextId) + 1;
    setNextId(nextNumber.toString().padStart(2, '0'));
    return currentId;
  };

  return { nextId, generateSequentialId };
};
