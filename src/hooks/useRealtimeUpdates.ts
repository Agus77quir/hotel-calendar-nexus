
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Estado global para evitar múltiples suscripciones
let isRealtimeActive = false;

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (isRealtimeActive || initialized.current) {
      return;
    }

    initialized.current = true;
    isRealtimeActive = true;

    console.log('🚀 INICIANDO TIEMPO REAL OPTIMIZADO');

    const channel = supabase
      .channel('hotel-updates-optimized')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async (payload) => {
          console.log('📝 RESERVA ACTUALIZADA VIA TIEMPO REAL:', payload.eventType);
          
          // Invalidar solo las queries necesarias de manera eficiente
          await queryClient.invalidateQueries({ queryKey: ['reservations'] });
          
          // Si es un cambio de estado, también actualizar habitaciones
          if (payload.eventType === 'UPDATE') {
            await queryClient.invalidateQueries({ queryKey: ['rooms'] });
          }
          
          console.log('✅ DATOS SINCRONIZADOS VIA TIEMPO REAL');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        async (payload) => {
          console.log('🏠 HABITACIÓN ACTUALIZADA VIA TIEMPO REAL:', payload.eventType);
          
          await queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests' },
        async (payload) => {
          console.log('👤 HUÉSPED ACTUALIZADO VIA TIEMPO REAL:', payload.eventType);
          
          await queryClient.invalidateQueries({ queryKey: ['guests'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 LIMPIANDO TIEMPO REAL');
      supabase.removeChannel(channel);
      isRealtimeActive = false;
      initialized.current = false;
    };
  }, [queryClient]);
};
