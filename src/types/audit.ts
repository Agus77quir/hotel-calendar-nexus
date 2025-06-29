
export interface AuditRecord {
  id: string;
  operation_type: string; // Changed from union type to string to match Supabase
  old_data?: any;
  new_data?: any;
  changed_by?: string;
  changed_at: string;
}

export interface GuestAudit extends AuditRecord {
  guest_id: string;
}

export interface RoomAudit extends AuditRecord {
  room_id: string;
}

export interface ReservationAudit extends AuditRecord {
  reservation_id: string;
}

export interface AuditRecordWithEntity extends AuditRecord {
  entityType: 'guests' | 'rooms' | 'reservations';
  guest_id?: string;
  room_id?: string;
  reservation_id?: string;
}

export type AuditType = 'guests' | 'rooms' | 'reservations';
