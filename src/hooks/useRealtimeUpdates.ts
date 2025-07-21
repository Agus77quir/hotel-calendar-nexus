
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

    console.log('🚀 INICIANDO TIEMPO REAL MEJORADO');

    const channel = supabase
      .channel('hotel-updates-optimized')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async (payload) => {
          console.log('📝 RESERVA ACTUALIZADA VIA TIEMPO REAL:', payload);
          
          // Invalidar TODAS las queries para asegurar sincronización
          await queryClient.invalidateQueries();
          
          // Refrescar específicamente las queries críticas
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ['reservations'] }),
            queryClient.refetchQueries({ queryKey: ['rooms'] }),
          ]);
          
          console.log('✅ DATOS SINCRONIZADOS VIA TIEMPO REAL');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        async (payload) => {
          console.log('🏠 HABITACIÓN ACTUALIZADA VIA TIEMPO REAL:', payload);
          
          await queryClient.invalidateQueries({ queryKey: ['rooms'] });
          await queryClient.refetchQueries({ queryKey: ['rooms'] });
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
