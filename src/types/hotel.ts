
export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email?: string; // Ahora es opcional
  phone: string;
  document: string;
  nationality?: string; // Opcional por compatibilidad
  is_associated: boolean;
  discount_percentage: number;
  created_at: string;
}

export interface Room {
  id: string;
  number: string;
  type: 'matrimonial' | 'triple-individual' | 'triple-matrimonial' | 'doble-individual' | 'suite-presidencial-doble';
  price: number;
  single_occupancy_price?: number; // Nuevo campo para precio de ocupación individual
  capacity: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  created_at: string;
}

export interface Reservation {
  id: string;
  guest_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_amount: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  special_requests?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  group_id?: string | null;
}

export interface ReservationGroup {
  id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  rooms_count: number;
  total_amount: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'receptionist' | 'guest';
  createdAt: Date;
}

export interface HotelStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalReservations: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  revenue: number;
}
