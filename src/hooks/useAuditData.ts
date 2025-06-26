
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GuestAudit, RoomAudit, ReservationAudit, AuditType } from '@/types/audit';

export const useAuditData = (auditType?: AuditType, limit = 50) => {
  const { data: guestsAudit = [], isLoading: guestsLoading, error: guestsError } = useQuery({
    queryKey: ['guests-audit', limit],
    queryFn: async () => {
      try {
        console.log('Fetching guests audit data...');
        const { data, error } = await supabase
          .from('guests_audit')
          .select('*')
          .order('changed_at', { ascending: false })
          .limit(limit);
        
        if (error) {
          console.log('Error fetching guests audit:', error);
          return [];
        }
        console.log('Guests audit data:', data);
        return (data || []) as GuestAudit[];
      } catch (error) {
        console.log('Exception in guests audit fetch:', error);
        return [];
      }
    },
    enabled: !auditType || auditType === 'guests',
  });

  const { data: roomsAudit = [], isLoading: roomsLoading, error: roomsError } = useQuery({
    queryKey: ['rooms-audit', limit],
    queryFn: async () => {
      try {
        console.log('Fetching rooms audit data...');
        const { data, error } = await supabase
          .from('rooms_audit')
          .select('*')
          .order('changed_at', { ascending: false })
          .limit(limit);
        
        if (error) {
          console.log('Error fetching rooms audit:', error);
          return [];
        }
        console.log('Rooms audit data:', data);
        return (data || []) as RoomAudit[];
      } catch (error) {
        console.log('Exception in rooms audit fetch:', error);
        return [];
      }
    },
    enabled: !auditType || auditType === 'rooms',
  });

  const { data: reservationsAudit = [], isLoading: reservationsLoading, error: reservationsError } = useQuery({
    queryKey: ['reservations-audit', limit],
    queryFn: async () => {
      try {
        console.log('Fetching reservations audit data...');
        const { data, error } = await supabase
          .from('reservations_audit')
          .select('*')
          .order('changed_at', { ascending: false })
          .limit(limit);
        
        if (error) {
          console.log('Error fetching reservations audit:', error);
          return [];
        }
        console.log('Reservations audit data:', data);
        return (data || []) as ReservationAudit[];
      } catch (error) {
        console.log('Exception in reservations audit fetch:', error);
        return [];
      }
    },
    enabled: !auditType || auditType === 'reservations',
  });

  console.log('useAuditData state:', {
    guestsAudit: guestsAudit.length,
    roomsAudit: roomsAudit.length,
    reservationsAudit: reservationsAudit.length,
    isLoading: guestsLoading || roomsLoading || reservationsLoading,
    errors: { guestsError, roomsError, reservationsError }
  });

  return {
    guestsAudit: guestsAudit || [],
    roomsAudit: roomsAudit || [],
    reservationsAudit: reservationsAudit || [],
    isLoading: guestsLoading || roomsLoading || reservationsLoading,
  };
};
