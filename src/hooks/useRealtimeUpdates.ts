
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Global flag to ensure only one real-time connection
let globalRealtimeActive = false;
let globalChannels: any[] = [];

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple instances
    if (globalRealtimeActive || hasInitialized.current) {
      console.log('🚫 REAL-TIME: Already active, skipping initialization');
      return;
    }

    hasInitialized.current = true;
    globalRealtimeActive = true;
    
    console.log('🚀 REAL-TIME: Setting up connection for automatic updates');
    
    // Create unique channel name with timestamp
    const uniqueId = `hotel-updates-${Date.now()}`;
    
    const reservationsChannel = supabase
      .channel(`reservations-${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async (payload) => {
          console.log('🔄 RESERVATION UPDATE DETECTED:', payload);
          
          // Immediate data refresh for all related queries
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['reservations'] }),
            queryClient.invalidateQueries({ queryKey: ['rooms'] }),
            queryClient.refetchQueries({ queryKey: ['reservations'] }),
            queryClient.refetchQueries({ queryKey: ['rooms'] })
          ]);
          
          console.log('✅ DATA REFRESHED AUTOMATICALLY');
        }
      )
      .subscribe();

    const roomsChannel = supabase
      .channel(`rooms-${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        async (payload) => {
          console.log('🔄 ROOM UPDATE DETECTED:', payload);
          
          // Immediate data refresh
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['rooms'] }),
            queryClient.invalidateQueries({ queryKey: ['reservations'] }),
            queryClient.refetchQueries({ queryKey: ['rooms'] }),
            queryClient.refetchQueries({ queryKey: ['reservations'] })
          ]);
          
          console.log('✅ ROOM DATA REFRESHED AUTOMATICALLY');
        }
      )
      .subscribe();

    // Store channels globally for cleanup
    globalChannels = [reservationsChannel, roomsChannel];

    return () => {
      console.log('🔄 CLEANING UP REAL-TIME CONNECTIONS');
      
      // Cleanup channels
      globalChannels.forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
      
      // Reset global state
      globalRealtimeActive = false;
      globalChannels = [];
      hasInitialized.current = false;
    };
  }, [queryClient]);
};
