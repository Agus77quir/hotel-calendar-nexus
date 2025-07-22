
import { Guest, Room, Reservation, HotelStats } from '@/types/hotel';

const mockGuests: Guest[] = [
  {
    id: '1',
    first_name: 'Juan',
    last_name: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+1234567890',
    document: '12345678',
    nationality: 'Mexicana',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    first_name: 'María',
    last_name: 'García',
    email: 'maria.garcia@email.com',
    phone: '+0987654321',
    document: '87654321',
    nationality: 'Española',
    created_at: '2024-01-16',
  },
];

const mockRooms: Room[] = [
  {
    id: '101',
    number: '101',
    type: 'matrimonial',
    price: 100,
    capacity: 2,
    amenities: ['WiFi', 'TV', 'AC'],
    status: 'available',
    created_at: '2024-01-01',
  },
  {
    id: '102',
    number: '102',
    type: 'doble-individual',
    price: 120,
    capacity: 2,
    amenities: ['WiFi', 'TV', 'AC'],
    status: 'occupied',
    created_at: '2024-01-01',
  },
];

const mockReservations: Reservation[] = [
  {
    id: '1',
    guest_id: '1',
    room_id: '102',
    check_in: '2024-02-01',
    check_out: '2024-02-05',
    guests_count: 2,
    status: 'confirmed',
    special_requests: 'None',
    total_amount: 400,
    confirmation_number: '123456',
    created_at: '2024-01-20',
    updated_at: '2024-01-20',
  },
];

const mockStats: HotelStats = {
  totalRooms: 10,
  occupiedRooms: 5,
  availableRooms: 5,
  maintenanceRooms: 0,
  totalReservations: 20,
  todayCheckIns: 3,
  todayCheckOuts: 2,
  revenue: 5000,
};

export const useMockHotelData = () => {
  return {
    guests: mockGuests,
    rooms: mockRooms,
    reservations: mockReservations,
    stats: mockStats,
    loading: false,
    isLoading: false,
    addGuest: async (guest: Omit<Guest, 'id' | 'created_at'>) => {
      console.log('Adding guest:', guest);
    },
    updateGuest: async (id: string, guest: Partial<Guest>) => {
      console.log('Updating guest:', id, guest);
    },
    deleteGuest: async (id: string) => {
      console.log('Deleting guest:', id);
    },
    addRoom: async (room: Omit<Room, 'id' | 'created_at'>) => {
      console.log('Adding room:', room);
    },
    updateRoom: async (id: string, room: Partial<Room>) => {
      console.log('Updating room:', id, room);
    },
    deleteRoom: async (id: string) => {
      console.log('Deleting room:', id);
    },
    addReservation: async (reservation: any) => {
      console.log('Adding reservation:', reservation);
    },
    updateReservation: async (id: string, reservation: any) => {
      console.log('Updating reservation:', id, reservation);
    },
    deleteReservation: async (id: string) => {
      console.log('Deleting reservation:', id);
    },
  };
};
