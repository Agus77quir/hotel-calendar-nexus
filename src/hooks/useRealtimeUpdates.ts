
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
    
    console.log('🚀 REAL-TIME: Setting up unique instance');
    
    // Create unique channel name with timestamp and random ID
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const reservationsChannel = supabase
      .channel(`reservations-realtime-${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async (payload) => {
          console.log('🔄 RESERVATION CHANGE:', payload);
          
          // Single, immediate refresh
          await queryClient.invalidateQueries({ queryKey: ['reservations'] });
          await queryClient.invalidateQueries({ queryKey: ['rooms'] });
          
          console.log('✅ RESERVATION DATA REFRESHED');
        }
      )
      .subscribe((status) => {
        console.log('📡 RESERVATIONS CHANNEL STATUS:', status);
      });

    const roomsChannel = supabase
      .channel(`rooms-realtime-${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        async (payload) => {
          console.log('🔄 ROOM CHANGE:', payload);
          
          // Single, immediate refresh
          await queryClient.invalidateQueries({ queryKey: ['rooms'] });
          await queryClient.invalidateQueries({ queryKey: ['reservations'] });
          
          console.log('✅ ROOM DATA REFRESHED');
        }
      )
      .subscribe((status) => {
        console.log('📡 ROOMS CHANNEL STATUS:', status);
      });

    // Store channels globally
    globalChannels = [reservationsChannel, roomsChannel];

    return () => {
      console.log('🔄 CLEANING UP REAL-TIME SUBSCRIPTIONS');
      
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
