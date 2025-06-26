
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GuestAudit, RoomAudit, ReservationAudit, AuditType } from '@/types/audit';

export const useAuditData = (auditType?: AuditType, limit = 50) => {
  const { data: guestsAudit = [], isLoading: guestsLoading, error: guestsError } = useQuery({
    queryKey: ['guests-audit', limit],
    queryFn: async () => {
      console.log('Fetching guests audit data...');
      const { data, error } = await supabase
        .from('guests_audit')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching guests audit:', error);
        throw error;
      }
      
      console.log('Guests audit data fetched:', data?.length || 0, 'records');
      return (data || []) as GuestAudit[];
    },
    enabled: !auditType || auditType === 'guests',
    retry: 1,
    staleTime: 30000,
  });

  const { data: roomsAudit = [], isLoading: roomsLoading, error: roomsError } = useQuery({
    queryKey: ['rooms-audit', limit],
    queryFn: async () => {
      console.log('Fetching rooms audit data...');
      const { data, error } = await supabase
        .from('rooms_audit')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching rooms audit:', error);
        throw error;
      }
      
      console.log('Rooms audit data fetched:', data?.length || 0, 'records');
      return (data || []) as RoomAudit[];
    },
    enabled: !auditType || auditType === 'rooms',
    retry: 1,
    staleTime: 30000,
  });

  const { data: reservationsAudit = [], isLoading: reservationsLoading, error: reservationsError } = useQuery({
    queryKey: ['reservations-audit', limit],
    queryFn: async () => {
      console.log('Fetching reservations audit data...');
      const { data, error } = await supabase
        .from('reservations_audit')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching reservations audit:', error);
        throw error;
      }
      
      console.log('Reservations audit data fetched:', data?.length || 0, 'records');
      return (data || []) as ReservationAudit[];
    },
    enabled: !auditType || auditType === 'reservations',
    retry: 1,
    staleTime: 30000,
  });

  const isLoading = guestsLoading || roomsLoading || reservationsLoading;
  const hasErrors = guestsError || roomsError || reservationsError;

  console.log('useAuditData summary:', {
    guestsCount: guestsAudit?.length || 0,
    roomsCount: roomsAudit?.length || 0,
    reservationsCount: reservationsAudit?.length || 0,
    isLoading,
    hasErrors: !!hasErrors,
    errors: { guestsError, roomsError, reservationsError }
  });

  return {
    guestsAudit: guestsAudit || [],
    roomsAudit: roomsAudit || [],
    reservationsAudit: reservationsAudit || [],
    isLoading,
    error: hasErrors,
  };
};
