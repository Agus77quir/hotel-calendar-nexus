
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuditRecordWithEntity } from '@/types/audit';

export const useAuditData = () => {
  // Fetch all audit records from all tables
  const { data: auditRecords = [], isLoading, error } = useQuery({
    queryKey: ['audit-records'],
    queryFn: async () => {
      console.log('Fetching audit records...');
      
      try {
        // Fetch from all audit tables
        const [guestsAudit, roomsAudit, reservationsAudit] = await Promise.all([
          supabase.from('guests_audit').select('*').order('changed_at', { ascending: false }),
          supabase.from('rooms_audit').select('*').order('changed_at', { ascending: false }),
          supabase.from('reservations_audit').select('*').order('changed_at', { ascending: false })
        ]);

        console.log('Guests audit raw data:', guestsAudit.data);
        console.log('Rooms audit raw data:', roomsAudit.data);
        console.log('Reservations audit raw data:', reservationsAudit.data);

        // Check for errors
        if (guestsAudit.error) {
          console.error('Guests audit error:', guestsAudit.error);
          throw guestsAudit.error;
        }
        if (roomsAudit.error) {
          console.error('Rooms audit error:', roomsAudit.error);
          throw roomsAudit.error;
        }
        if (reservationsAudit.error) {
          console.error('Reservations audit error:', reservationsAudit.error);
          throw reservationsAudit.error;
        }

        // Combine and format all records
        const allRecords: AuditRecordWithEntity[] = [
          ...(guestsAudit.data || []).map((record: any) => ({
            ...record,
            entityType: 'guests' as const,
          })),
          ...(roomsAudit.data || []).map((record: any) => ({
            ...record,
            entityType: 'rooms' as const,
          })),
          ...(reservationsAudit.data || []).map((record: any) => ({
            ...record,
            entityType: 'reservations' as const,
          }))
        ];

        // Sort by changed_at descending
        allRecords.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

        console.log('Final audit records processed:', allRecords.length);
        console.log('Sample records:', allRecords.slice(0, 3));
        
        return allRecords;
      } catch (error) {
        console.error('Error fetching audit records:', error);
        throw error;
      }
    },
  });

  return {
    auditRecords,
    isLoading,
    error,
  };
};
