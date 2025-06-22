
export interface AuditRecord {
  id: string;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
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

export type AuditType = 'guests' | 'rooms' | 'reservations';
