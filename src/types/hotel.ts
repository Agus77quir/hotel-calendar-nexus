
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: string;
  nationality: string;
  createdAt: Date;
}

export interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  price: number;
  capacity: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
}

export interface Reservation {
  id: string;
  guestId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  specialRequests?: string;
  createdAt: Date;
  createdBy: string;
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
