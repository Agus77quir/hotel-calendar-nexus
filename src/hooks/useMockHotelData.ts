import { useState } from 'react';
import { Room, Guest, Reservation, HotelStats } from '@/types/hotel';

const mockGuests: Guest[] = [
  {
    id: '01',
    first_name: 'Juan',
    last_name: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+1234567890',
    document: '12345678',
    nationality: 'Mexicano',
    is_associated: false,
    discount_percentage: 0,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '02',
    first_name: 'María',
    last_name: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+1234567891',
    document: '87654321',
    nationality: 'Española',
    is_associated: true,
    discount_percentage: 15,
    created_at: '2024-01-16T11:00:00Z',
  },
];

export const useMockHotelData = () => {
  const [rooms] = useState<Room[]>([
    {
      id: 'room-09',
      number: '09',
      type: 'matrimonial',
      price: 120,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-10',
      number: '10',
      type: 'matrimonial',
      price: 120,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-11',
      number: '11',
      type: 'triple-individual',
      price: 150,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-12',
      number: '12',
      type: 'triple-individual',
      price: 150,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-13',
      number: '13',
      type: 'triple-matrimonial',
      price: 160,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-14',
      number: '14',
      type: 'triple-matrimonial',
      price: 160,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-15',
      number: '15',
      type: 'triple-matrimonial',
      price: 160,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-16',
      number: '16',
      type: 'triple-matrimonial',
      price: 160,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-17',
      number: '17',
      type: 'doble-individual',
      price: 140,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-18',
      number: '18',
      type: 'doble-individual',
      price: 140,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-19',
      number: '19',
      type: 'triple-individual',
      price: 150,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-20',
      number: '20',
      type: 'triple-individual',
      price: 150,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-21',
      number: '21',
      type: 'triple-matrimonial',
      price: 160,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-22',
      number: '22',
      type: 'triple-matrimonial',
      price: 160,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-23',
      number: '23',
      type: 'triple-matrimonial',
      price: 160,
      capacity: 3,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-24',
      number: '24',
      type: 'doble-individual',
      price: 140,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-25',
      number: '25',
      type: 'matrimonial',
      price: 120,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-26',
      number: '26',
      type: 'matrimonial',
      price: 120,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-28',
      number: '28',
      type: 'suite-presidencial-doble',
      price: 250,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado', 'Jacuzzi', 'Sala de estar'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-30',
      number: '30',
      type: 'suite-presidencial-doble',
      price: 250,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado', 'Jacuzzi', 'Sala de estar'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-31',
      number: '31',
      type: 'matrimonial',
      price: 120,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-32',
      number: '32',
      type: 'matrimonial',
      price: 120,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado'],
      status: 'available',
      created_at: new Date().toISOString(),
    },
  ]);

  const [guests, setGuests] = useState<Guest[]>(mockGuests);

  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'res-1',
      guest_id: 'guest-1',
      room_id: 'room-09',
      check_in: new Date().toISOString().split('T')[0],
      check_out: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      guests_count: 2,
      total_amount: 240,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'res-2',
      guest_id: 'guest-2',
      room_id: 'room-11',
      check_in: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      check_out: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      guests_count: 3,
      total_amount: 450,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const addGuest = (guestData: Omit<Guest, 'id' | 'created_at'>) => {
    const newGuest: Guest = {
      ...guestData,
      id: `guest-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setGuests(prev => [newGuest, ...prev]);
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(guest => 
      guest.id === id ? { ...guest, ...updates } : guest
    ));
  };

  const deleteGuest = (id: string) => {
    setGuests(prev => prev.filter(guest => guest.id !== id));
    setReservations(prev => prev.filter(res => res.guest_id !== id));
  };

  const addRoom = (roomData: Omit<Room, 'id' | 'created_at'>) => {
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    // Note: rooms are now static, but keeping this for consistency
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    // Note: rooms are now static, but keeping this for consistency
  };

  const deleteRoom = (id: string) => {
    // Note: rooms are now static, but keeping this for consistency
  };

  const addReservation = (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: `res-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setReservations(prev => [newReservation, ...prev]);
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(res => 
      res.id === id ? { ...res, ...updates, updated_at: new Date().toISOString() } : res
    ));
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(res => res.id !== id));
  };

  return {
    rooms,
    guests,
    reservations,
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
