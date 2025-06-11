
import { useState, useEffect } from 'react';
import { Room, Reservation, Guest, HotelStats } from '@/types/hotel';

// Demo data
const demoRooms: Room[] = [
  { id: '101', number: '101', type: 'single', price: 80, capacity: 1, amenities: ['WiFi', 'TV'], status: 'available' },
  { id: '102', number: '102', type: 'double', price: 120, capacity: 2, amenities: ['WiFi', 'TV', 'Mini Bar'], status: 'occupied' },
  { id: '103', number: '103', type: 'suite', price: 200, capacity: 4, amenities: ['WiFi', 'TV', 'Mini Bar', 'Jacuzzi'], status: 'available' },
  { id: '201', number: '201', type: 'double', price: 120, capacity: 2, amenities: ['WiFi', 'TV'], status: 'maintenance' },
  { id: '202', number: '202', type: 'deluxe', price: 180, capacity: 3, amenities: ['WiFi', 'TV', 'Mini Bar', 'Balcón'], status: 'available' },
  { id: '301', number: '301', type: 'suite', price: 250, capacity: 4, amenities: ['WiFi', 'TV', 'Mini Bar', 'Jacuzzi', 'Vista al mar'], status: 'cleaning' },
];

const demoGuests: Guest[] = [
  { id: '1', firstName: 'Juan', lastName: 'Pérez', email: 'juan@email.com', phone: '+54911234567', document: '12345678', nationality: 'Argentina', createdAt: new Date() },
  { id: '2', firstName: 'María', lastName: 'García', email: 'maria@email.com', phone: '+54911234568', document: '87654321', nationality: 'España', createdAt: new Date() },
];

const demoReservations: Reservation[] = [
  {
    id: '1',
    guestId: '1',
    roomId: '102',
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    guests: 2,
    totalAmount: 360,
    status: 'checked-in',
    createdAt: new Date(),
    createdBy: '1',
  },
  {
    id: '2',
    guestId: '2',
    roomId: '103',
    checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
    checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    guests: 2,
    totalAmount: 800,
    status: 'confirmed',
    createdAt: new Date(),
    createdBy: '1',
  },
];

export const useHotelData = () => {
  const [rooms, setRooms] = useState<Room[]>(demoRooms);
  const [guests, setGuests] = useState<Guest[]>(demoGuests);
  const [reservations, setReservations] = useState<Reservation[]>(demoReservations);

  const stats: HotelStats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
    totalReservations: reservations.length,
    todayCheckIns: reservations.filter(r => 
      r.checkIn.toDateString() === new Date().toDateString() && r.status === 'confirmed'
    ).length,
    todayCheckOuts: reservations.filter(r => 
      r.checkOut.toDateString() === new Date().toDateString() && r.status === 'checked-in'
    ).length,
    revenue: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
  };

  const addReservation = (reservation: Omit<Reservation, 'id'>) => {
    const newReservation = {
      ...reservation,
      id: Date.now().toString(),
    };
    setReservations(prev => [...prev, newReservation]);
    
    // Update room status if needed
    if (reservation.status === 'checked-in') {
      setRooms(prev => prev.map(room => 
        room.id === reservation.roomId 
          ? { ...room, status: 'occupied' as const }
          : room
      ));
    }
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (reservation) {
      setReservations(prev => prev.filter(r => r.id !== id));
      // Update room status
      setRooms(prev => prev.map(room => 
        room.id === reservation.roomId 
          ? { ...room, status: 'available' as const }
          : room
      ));
    }
  };

  const addGuest = (guest: Omit<Guest, 'id'>) => {
    const newGuest = {
      ...guest,
      id: Date.now().toString(),
    };
    setGuests(prev => [...prev, newGuest]);
    return newGuest;
  };

  return {
    rooms,
    guests,
    reservations,
    stats,
    addReservation,
    updateReservation,
    deleteReservation,
    addGuest,
  };
};
