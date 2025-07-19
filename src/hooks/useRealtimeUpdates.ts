
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🚀 CRITICAL REALTIME: Setting up guaranteed real-time updates');
    
    const channelId = `updates-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const channel = supabase
      .channel(`hotel-updates-${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async (payload) => {
          console.log('🔄 REALTIME RESERVATIONS:', payload);
          
          // Immediate cache invalidation and refetch
          await queryClient.invalidateQueries({ queryKey: ['reservations'] });
          await queryClient.refetchQueries({ queryKey: ['reservations'] });
          
          // Also update rooms since reservation status affects room status
          await queryClient.invalidateQueries({ queryKey: ['rooms'] });
          await queryClient.refetchQueries({ queryKey: ['rooms'] });
          
          // Force a complete refresh after a short delay
          setTimeout(async () => {
            await queryClient.invalidateQueries();
            await queryClient.refetchQueries();
            console.log('✅ REALTIME: Secondary refresh completed');
          }, 500);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        async (payload) => {
          console.log('🔄 REALTIME ROOMS:', payload);
          
          await queryClient.invalidateQueries({ queryKey: ['rooms'] });
          await queryClient.refetchQueries({ queryKey: ['rooms'] });
          
          setTimeout(async () => {
            await queryClient.invalidateQueries();
            await queryClient.refetchQueries();
          }, 300);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests' },
        async (payload) => {
          console.log('🔄 REALTIME GUESTS:', payload);
          
          await queryClient.invalidateQueries({ queryKey: ['guests'] });
          await queryClient.refetchQueries({ queryKey: ['guests'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 REALTIME STATUS:', status);
      });

    return () => {
      console.log('🔄 REALTIME: Cleaning up subscriptions');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
