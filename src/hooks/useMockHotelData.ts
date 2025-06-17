
import { useState } from 'react';
import { Room, Reservation, Guest, HotelStats } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockRooms: Room[] = [
  {
    id: '1',
    number: '101',
    type: 'single',
    price: 80,
    capacity: 1,
    amenities: ['wifi', 'tv', 'ac'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    number: '102',
    type: 'single',
    price: 80,
    capacity: 1,
    amenities: ['wifi', 'tv', 'ac'],
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    number: '201',
    type: 'double',
    price: 120,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    number: '202',
    type: 'double',
    price: 120,
    capacity: 2,
    amenities: ['wifi', 'tv', 'ac', 'minibar'],
    status: 'maintenance',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    number: '301',
    type: 'suite',
    price: 200,
    capacity: 4,
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'kitchenette'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    number: '302',
    type: 'deluxe',
    price: 300,
    capacity: 6,
    amenities: ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'kitchenette', 'jacuzzi'],
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
  },
];

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
    room_id: '2',
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
    room_id: '3',
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
