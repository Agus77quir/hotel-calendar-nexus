
import { format } from 'date-fns';
import { AuditRecordWithEntity } from '@/types/audit';

export const getOperationText = (operation: string) => {
  switch (operation) {
    case 'INSERT':
      return 'Creación';
    case 'UPDATE':
      return 'Actualización';
    case 'DELETE':
      return 'Eliminación';
    default:
      return operation;
  }
};

export const getOperationColor = (operation: string) => {
  switch (operation) {
    case 'INSERT':
      return 'bg-green-100 text-green-800';
    case 'UPDATE':
      return 'bg-blue-100 text-blue-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getEntityName = (record: AuditRecordWithEntity) => {
  try {
    const data = record.new_data || record.old_data;
    if (!data || typeof data !== 'object') return 'N/A';

    if (record.entityType === 'guests') {
      if (data.first_name && data.last_name) {
        return `${data.first_name} ${data.last_name}`;
      }
    } else if (record.entityType === 'reservations') {
      if (data.guest_name) {
        return data.guest_name;
      }
    } else if (record.entityType === 'rooms') {
      if (data.number) {
        return `Habitación ${data.number}`;
      }
    }
    return 'N/A';
  } catch (error) {
    console.error('Error getting entity name:', error);
    return 'N/A';
  }
};

export const getEntityDetails = (record: AuditRecordWithEntity) => {
  try {
    const data = record.new_data || record.old_data;
    if (!data || typeof data !== 'object') return { room: 'N/A', checkIn: 'N/A', checkOut: 'N/A' };

    if (record.entityType === 'reservations') {
      return {
        room: data.room_number || 'N/A',
        checkIn: data.check_in ? format(new Date(data.check_in), 'dd/MM/yyyy') : 'N/A',
        checkOut: data.check_out ? format(new Date(data.check_out), 'dd/MM/yyyy') : 'N/A'
      };
    } else if (record.entityType === 'rooms') {
      return {
        room: data.number || 'N/A',
        checkIn: 'N/A',
        checkOut: 'N/A'
      };
    }
    return { room: 'N/A', checkIn: 'N/A', checkOut: 'N/A' };
  } catch (error) {
    console.error('Error getting entity details:', error);
    return { room: 'N/A', checkIn: 'N/A', checkOut: 'N/A' };
  }
};

export const filterRecords = (
  records: AuditRecordWithEntity[],
  searchTerm: string,
  filterOperation: 'all' | 'INSERT' | 'UPDATE' | 'DELETE',
  filterUser: 'all' | 'Admin' | 'Rec 1' | 'Rec 2',
  dateFilter: string
) => {
  return records.filter(record => {
    const entityName = getEntityName(record);
    const matchesSearch = searchTerm === '' || 
      (record.changed_by && record.changed_by.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entityName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperation = filterOperation === 'all' || record.operation_type === filterOperation;
    const matchesUser = filterUser === 'all' || record.changed_by === filterUser;
    
    const matchesDate = dateFilter === '' || 
      format(new Date(record.changed_at), 'yyyy-MM-dd') === dateFilter;
    
    return matchesSearch && matchesOperation && matchesUser && matchesDate;
  });
};
