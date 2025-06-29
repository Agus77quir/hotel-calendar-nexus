
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GuestAudit, RoomAudit, ReservationAudit, AuditRecordWithEntity, AuditType } from '@/types/audit';

export const useAuditData = () => {
  // Fetch all audit records from all tables
  const { data: auditRecords = [], isLoading } = useQuery({
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

        // Check for errors
        if (guestsAudit.error) throw guestsAudit.error;
        if (roomsAudit.error) throw roomsAudit.error;
        if (reservationsAudit.error) throw reservationsAudit.error;

        // Combine and format all records
        const allRecords: AuditRecordWithEntity[] = [
          ...(guestsAudit.data || []).map((record: GuestAudit) => ({
            ...record,
            entityType: 'guests' as const,
          })),
          ...(roomsAudit.data || []).map((record: RoomAudit) => ({
            ...record,
            entityType: 'rooms' as const,
          })),
          ...(reservationsAudit.data || []).map((record: ReservationAudit) => ({
            ...record,
            entityType: 'reservations' as const,
          }))
        ];

        // Sort by changed_at descending
        allRecords.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

        console.log('Audit records fetched:', allRecords.length);
        return allRecords;
      } catch (error) {
        console.error('Error fetching audit records:', error);
        throw error;
      }
    },
  });

  // Filter function for audit records
  const getFilteredRecords = (filters: {
    type?: AuditType;
    operation?: string;
    user?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return auditRecords.filter(record => {
      // Type filter
      if (filters.type && record.entityType !== filters.type) {
        return false;
      }
      
      // Operation filter
      if (filters.operation && record.operation_type !== filters.operation) {
        return false;
      }
      
      // User filter
      if (filters.user && record.changed_by !== filters.user) {
        return false;
      }
      
      // Date filters
      if (filters.dateFrom) {
        const recordDate = new Date(record.changed_at);
        const fromDate = new Date(filters.dateFrom);
        if (recordDate < fromDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const recordDate = new Date(record.changed_at);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        if (recordDate > toDate) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Get unique users for filtering
  const getUniqueUsers = () => {
    const users = new Set<string>();
    auditRecords.forEach(record => {
      if (record.changed_by) {
        users.add(record.changed_by);
      }
    });
    return Array.from(users).sort();
  };

  return {
    auditRecords,
    isLoading,
    getFilteredRecords,
    getUniqueUsers,
  };
};
