
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GuestAudit, RoomAudit, ReservationAudit, AuditType } from '@/types/audit';

export const useAuditData = (auditType?: AuditType, limit = 50) => {
  const { data: guestsAudit = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests-audit', limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('guests_audit')
          .select('*')
          .order('changed_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data as GuestAudit[];
      } catch (error) {
        console.log('Error fetching guests audit:', error);
        return [];
      }
    },
    enabled: !auditType || auditType === 'guests',
  });

  const { data: roomsAudit = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms-audit', limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('rooms_audit')
          .select('*')
          .order('changed_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data as RoomAudit[];
      } catch (error) {
        console.log('Error fetching rooms audit:', error);
        return [];
      }
    },
    enabled: !auditType || auditType === 'rooms',
  });

  const { data: reservationsAudit = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations-audit', limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reservations_audit')
          .select('*')
          .order('changed_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data as ReservationAudit[];
      } catch (error) {
        console.log('Error fetching reservations audit:', error);
        return [];
      }
    },
    enabled: !auditType || auditType === 'reservations',
  });

  return {
    guestsAudit,
    roomsAudit,
    reservationsAudit,
    isLoading: guestsLoading || roomsLoading || reservationsLoading,
  };
};
