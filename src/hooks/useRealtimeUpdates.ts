
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🚀 SETTING UP REAL-TIME UPDATES');
    
    // Crear un canal único con timestamp para evitar conflictos
    const channelName = `hotel-updates-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async (payload) => {
          console.log('🔄 RESERVATION CHANGE DETECTED:', payload);
          
          // Invalidar y refrescar inmediatamente
          await queryClient.invalidateQueries({ queryKey: ['reservations'] });
          await queryClient.invalidateQueries({ queryKey: ['rooms'] });
          await queryClient.refetchQueries({ queryKey: ['reservations'] });
          await queryClient.refetchQueries({ queryKey: ['rooms'] });
          
          console.log('✅ RESERVATION DATA REFRESHED');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        async (payload) => {
          console.log('🔄 ROOM CHANGE DETECTED:', payload);
          
          await queryClient.invalidateQueries({ queryKey: ['rooms'] });
          await queryClient.invalidateQueries({ queryKey: ['reservations'] });
          await queryClient.refetchQueries({ queryKey: ['rooms'] });
          await queryClient.refetchQueries({ queryKey: ['reservations'] });
          
          console.log('✅ ROOM DATA REFRESHED');
        }
      )
      .subscribe((status) => {
        console.log('📡 REAL-TIME STATUS:', status);
      });

    return () => {
      console.log('🔄 CLEANING UP REAL-TIME SUBSCRIPTIONS');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
