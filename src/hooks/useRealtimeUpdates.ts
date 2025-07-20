
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    console.log('🚀 CONFIGURANDO TIEMPO REAL');

    // Crear canal único con reconexión automática
    const channel = supabase
      .channel('hotel-updates', {
        config: {
          presence: { key: 'hotel-presence' },
          broadcast: { self: true }
        }
      })
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'reservations' 
        },
        async (payload) => {
          console.log('📝 REALTIME - RESERVA ACTUALIZADA:', {
            event: payload.eventType,
            id: (payload.new as any)?.id || (payload.old as any)?.id,
            new: payload.new,
            old: payload.old
          });
          
          // Invalidar queries inmediatamente
          console.log('🔄 INVALIDANDO QUERIES - RESERVAS');
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
          console.log('✅ QUERIES INVALIDADAS');
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'rooms' 
        },
        async (payload) => {
          console.log('🏠 REALTIME - HABITACIÓN ACTUALIZADA:', {
            event: payload.eventType,
            id: (payload.new as any)?.id || (payload.old as any)?.id,
            new: payload.new,
            old: payload.old
          });
          
          // Invalidar queries inmediatamente
          console.log('🔄 INVALIDANDO QUERIES - HABITACIONES');
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
          console.log('✅ QUERIES INVALIDADAS');
        }
      )
      .subscribe((status, err) => {
        console.log('📡 ESTADO CANAL TIEMPO REAL:', status);
        if (err) {
          console.error('❌ ERROR EN CANAL:', err);
        }
        
        // Reconectar automáticamente si se desconecta
        if (status === 'TIMED_OUT' || status === 'CLOSED') {
          console.log('🔄 RECONECTANDO CANAL...');
          setTimeout(() => {
            if (channelRef.current) {
              channelRef.current.subscribe();
            }
          }, 1000);
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      console.log('🔄 DESCONECTANDO TIEMPO REAL');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  return { isConnected: channelRef.current?.state === 'joined' };
};
