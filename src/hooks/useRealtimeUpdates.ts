
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Estado global para evitar múltiples suscripciones
let isRealtimeActive = false;

const INVALIDATION_DELAY_MS = 150;

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const initialized = useRef(false);
  const pendingInvalidationsRef = useRef<Map<string, number>>(new Map());

  const scheduleInvalidate = (queryKey: string[]) => {
    const cacheKey = queryKey.join(':');
    const currentTimeout = pendingInvalidationsRef.current.get(cacheKey);

    if (currentTimeout) {
      window.clearTimeout(currentTimeout);
    }

    const timeoutId = window.setTimeout(() => {
      queryClient.invalidateQueries({ queryKey });
      pendingInvalidationsRef.current.delete(cacheKey);
    }, INVALIDATION_DELAY_MS);

    pendingInvalidationsRef.current.set(cacheKey, timeoutId);
  };

  useEffect(() => {
    if (isRealtimeActive || initialized.current) {
      return;
    }

    initialized.current = true;
    isRealtimeActive = true;

    const channel = supabase
      .channel('hotel-updates-optimized')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          scheduleInvalidate(['reservations']);

          if (payload.eventType === 'UPDATE') {
            scheduleInvalidate(['rooms']);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        () => {
          scheduleInvalidate(['rooms']);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests' },
        () => {
          scheduleInvalidate(['guests']);
        }
      )
      .subscribe();

    return () => {
      pendingInvalidationsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      pendingInvalidationsRef.current.clear();
      supabase.removeChannel(channel);
      isRealtimeActive = false;
      initialized.current = false;
    };
  }, [queryClient]);
};
