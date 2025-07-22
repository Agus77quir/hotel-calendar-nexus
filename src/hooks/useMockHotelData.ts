
import { Room, Guest, Reservation, HotelStats } from '@/types/hotel';

const mockGuests: Guest[] = [
  {
    id: '1',
    first_name: 'Juan',
    last_name: 'Pérez',
    email: 'juan@email.com',
    phone: '+1234567890',
    document: '12345678',
    created_at: '2024-01-01'
  },
  {
    id: '2', 
    first_name: 'María',
    last_name: 'González',
    email: 'maria@email.com',
    phone: '+0987654321',
    document: '87654321',
    created_at: '2024-01-02'
  }
];

const mockRooms: Room[] = [
  {
    id: '101',
    number: '101',
    type: 'doble-individual',
    status: 'available',
    price: 50,
    capacity: 1,
    amenities: ['wifi', 'tv'],
    created_at: '2024-01-01'
  },
  {
    id: '102',
    number: '102',
    type: 'matrimonial',
    status: 'occupied',
    price: 100,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac'],
    created_at: '2024-01-01'
  },
  {
    id: '103',
    number: '103',
    type: 'suite-presidencial-doble',
    status: 'maintenance',
    price: 150,
    capacity: 4,
    amenities: ['wifi', 'tv', 'ac', 'breakfast'],
    created_at: '2024-01-01'
  }
];

const mockReservations: Reservation[] = [
  {
    id: '1',
    room_id: '102',
    guest_id: '1',
    check_in: '2024-01-15',
    check_out: '2024-01-20',
    guests_count: 2,
    total_amount: 500,
    status: 'checked-in',
    confirmation_number: 'RES001',
    created_at: '2024-01-10',
    created_by: 'admin@email.com',
    updated_at: '2024-01-10'
  },
  {
    id: '2',
    room_id: '101',
    guest_id: '2',
    check_in: '2024-02-01',
    check_out: '2024-02-05',
    guests_count: 1,
    total_amount: 200,
    status: 'confirmed',
    confirmation_number: 'RES002',
    created_at: '2024-01-25',
    created_by: 'admin@email.com',
    updated_at: '2024-01-25'
  }
];

export const useMockHotelData = () => {
  const stats: HotelStats = {
    totalRooms: mockRooms.length,
    occupiedRooms: mockRooms.filter(r => r.status === 'occupied').length,
    availableRooms: mockRooms.filter(r => r.status === 'available').length,
    maintenanceRooms: mockRooms.filter(r => r.status === 'maintenance').length,
    totalReservations: mockReservations.length,
    todayCheckIns: mockReservations.filter(r => r.check_in === new Date().toISOString().slice(0, 10)).length,
    todayCheckOuts: mockReservations.filter(r => r.check_out === new Date().toISOString().slice(0, 10)).length,
    revenue: mockReservations.reduce((sum, r) => sum + r.total_amount, 0)
  };

  return {
    guests: mockGuests,
    rooms: mockRooms,
    reservations: mockReservations,
    stats,
    isLoading: false,
    addGuest: () => Promise.resolve(null),
    updateGuest: () => Promise.resolve(null),
    deleteGuest: () => Promise.resolve(null),
    addRoom: () => Promise.resolve(null),
    updateRoom: () => Promise.resolve(null),
    deleteRoom: () => Promise.resolve(null),
    addReservation: () => Promise.resolve(null),
    updateReservation: () => Promise.resolve(null),
    deleteReservation: () => Promise.resolve(null),
  };
};
