
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Global state para evitar múltiples suscripciones
let isRealtimeActive = false;
let activeChannels: any[] = [];

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    // Prevenir múltiples inicializaciones
    if (isRealtimeActive || initialized.current) {
      return;
    }

    initialized.current = true;
    isRealtimeActive = true;

    console.log('🚀 INICIANDO SISTEMA DE TIEMPO REAL');

    // Canal único para todas las actualizaciones
    const mainChannel = supabase
      .channel(`hotel-realtime-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async (payload) => {
          console.log('📝 REALTIME - RESERVA ACTUALIZADA:', payload.eventType, payload.new, payload.old);
          
          // Invalidar todas las consultas relacionadas
          console.log('🔄 INVALIDANDO QUERIES DE RESERVAS Y HABITACIONES');
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['reservations'] }),
            queryClient.invalidateQueries({ queryKey: ['rooms'] }),
          ]);
          console.log('✅ QUERIES INVALIDADAS - UI DEBE ACTUALIZARSE');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        async (payload) => {
          console.log('🏠 REALTIME - HABITACIÓN ACTUALIZADA:', payload.eventType, payload.new, payload.old);
          
          console.log('🔄 INVALIDANDO QUERIES DE HABITACIONES Y RESERVAS');
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['rooms'] }),
            queryClient.invalidateQueries({ queryKey: ['reservations'] }),
          ]);
          console.log('✅ QUERIES INVALIDADAS - UI DEBE ACTUALIZARSE');
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado del canal:', status);
      });

    activeChannels = [mainChannel];

    // Cleanup function
    return () => {
      console.log('🔄 LIMPIANDO TIEMPO REAL');
      
      activeChannels.forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
      
      activeChannels = [];
      isRealtimeActive = false;
      initialized.current = false;
    };
  }, [queryClient]);
};
