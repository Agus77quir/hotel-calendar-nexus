import { useState } from 'react';
import { Room, Reservation, Guest, HotelStats } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';

// Mock data with the specific rooms requested
const mockRooms: Room[] = [
  {
    id: '9',
    number: '09',
    type: 'matrimonial',
    price: 120,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10',
    number: '10',
    type: 'matrimonial',
    price: 120,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '11',
    number: '11',
    type: 'triple-individual',
    price: 150,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '12',
    number: '12',
    type: 'triple-individual',
    price: 150,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '13',
    number: '13',
    type: 'triple-matrimonial',
    price: 180,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '14',
    number: '14',
    type: 'triple-matrimonial',
    price: 180,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '15',
    number: '15',
    type: 'triple-matrimonial',
    price: 180,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '16',
    number: '16',
    type: 'triple-matrimonial',
    price: 180,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '17',
    number: '17',
    type: 'doble-individual',
    price: 100,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '18',
    number: '18',
    type: 'doble-individual',
    price: 100,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '19',
    number: '19',
    type: 'triple-individual',
    price: 150,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '20',
    number: '20',
    type: 'triple-individual',
    price: 150,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '21',
    number: '21',
    type: 'triple-matrimonial',
    price: 180,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '22',
    number: '22',
    type: 'triple-matrimonial',
    price: 180,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '23',
    number: '23',
    type: 'triple-matrimonial',
    price: 180,
    capacity: 3,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '24',
    number: '24',
    type: 'doble-individual',
    price: 100,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '25',
    number: '25',
    type: 'matrimonial',
    price: 120,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '26',
    number: '26',
    type: 'matrimonial',
    price: 120,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '28',
    number: '28',
    type: 'suite-presidencial-doble',
    price: 300,
    capacity: 4,
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'kitchenette', 'jacuzzi'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '30',
    number: '30',
    type: 'suite-presidencial-doble',
    price: 300,
    capacity: 4,
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'kitchenette', 'jacuzzi'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '31',
    number: '31',
    type: 'matrimonial',
    price: 120,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '32',
    number: '32',
    type: 'matrimonial',
    price: 120,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock data
const mockGuests: Guest[] = [
  {
    id: '1',
    first_name: 'Juan',
    last_name: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+34 600 123 456',
    document: '12345678A',
    nationality: 'España',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    first_name: 'María',
    last_name: 'García',
    email: 'maria.garcia@email.com',
    phone: '+34 600 234 567',
    document: '23456789B',
    nationality: 'España',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1 555 123 4567',
    document: 'US123456789',
    nationality: 'Estados Unidos',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockReservations: Reservation[] = [
  {
    id: '1',
    guest_id: '1',
    room_id: '9',
    check_in: '2024-01-15',
    check_out: '2024-01-18',
    guests_count: 1,
    total_amount: 240,
    status: 'checked-in',
    special_requests: 'Vista al mar',
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'admin',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    guest_id: '2',
    room_id: '10',
    check_in: '2024-01-20',
    check_out: '2024-01-25',
    guests_count: 2,
    total_amount: 600,
    status: 'confirmed',
    special_requests: 'Cama extra',
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'admin',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const useMockHotelData = () => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);

  const stats: HotelStats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
    totalReservations: reservations.length,
    todayCheckIns: reservations.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.check_in === today && r.status === 'confirmed';
    }).length,
    todayCheckOuts: reservations.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.check_out === today && r.status === 'checked-in';
    }).length,
    revenue: reservations.reduce((sum, r) => sum + Number(r.total_amount), 0),
  };

  const addGuest = (guestData: Omit<Guest, 'id' | 'created_at'>) => {
    const newGuest: Guest = {
      ...guestData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setGuests(prev => [newGuest, ...prev]);
    toast({
      title: "Éxito",
      description: "Huésped agregado correctamente",
    });
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(guest => 
      guest.id === id ? { ...guest, ...updates } : guest
    ));
    toast({
      title: "Éxito",
      description: "Huésped actualizado correctamente",
    });
  };

  const deleteGuest = (id: string) => {
    setGuests(prev => prev.filter(guest => guest.id !== id));
    toast({
      title: "Éxito",
      description: "Huésped eliminado correctamente",
    });
  };

  const addRoom = (roomData: Omit<Room, 'id' | 'created_at'>) => {
    const newRoom: Room = {
      ...roomData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setRooms(prev => [newRoom, ...prev]);
    toast({
      title: "Éxito",
      description: "Habitación agregada correctamente",
    });
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(room => 
      room.id === id ? { ...room, ...updates } : room
    ));
    toast({
      title: "Éxito",
      description: "Habitación actualizada correctamente",
    });
  };

  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(room => room.id !== id));
    toast({
      title: "Éxito",
      description: "Habitación eliminada correctamente",
    });
  };

  const addReservation = (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setReservations(prev => [newReservation, ...prev]);
    
    // Update room status if reservation is checked-in
    if (reservationData.status === 'checked-in') {
      setRooms(prev => prev.map(room =>
        room.id === reservationData.room_id ? { ...room, status: 'occupied' } : room
      ));
    }
    
    toast({
      title: "Éxito",
      description: "Reserva creada correctamente",
    });
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(reservation => 
      reservation.id === id ? { ...reservation, ...updates, updated_at: new Date().toISOString() } : reservation
    ));
    toast({
      title: "Éxito",
      description: "Reserva actualizada correctamente",
    });
  };

  const deleteReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    setReservations(prev => prev.filter(reservation => reservation.id !== id));
    
    // Update room status if needed
    if (reservation && reservation.status === 'checked-in') {
      setRooms(prev => prev.map(room =>
        room.id === reservation.room_id ? { ...room, status: 'available' } : room
      ));
    }
    
    toast({
      title: "Éxito",
      description: "Reserva eliminada correctamente",
    });
  };

  return {
    rooms,
    guests,
    reservations,
    stats,
    isLoading: false,
    addGuest,
    updateGuest,
    deleteGuest,
    addRoom,
    updateRoom,
    deleteRoom,
    addReservation,
    updateReservation,
    deleteReservation,
  };
};
