
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

    console.log('🚀 INICIANDO TIEMPO REAL');

    const channel = supabase
      .channel('hotel-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async () => {
          console.log('📝 RESERVA ACTUALIZADA VIA TIEMPO REAL');
          await queryClient.refetchQueries({ queryKey: ['reservations'] });
          await queryClient.refetchQueries({ queryKey: ['rooms'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        async () => {
          console.log('🏠 HABITACIÓN ACTUALIZADA VIA TIEMPO REAL');
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
