
import { useState, useMemo } from 'react';
import { Reservation, Room, Guest } from '@/types/hotel';

export const useDailyReservationsFilter = (
  reservations: Reservation[],
  rooms: Room[],
  guests: Guest[],
  selectedDateStr: string
) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const dayReservations = reservations.filter(reservation => {
    const checkIn = reservation.check_in;
    const checkOut = reservation.check_out;
    return checkIn <= selectedDateStr && checkOut >= selectedDateStr;
  });

  const filteredReservations = useMemo(() => {
    if (!searchTerm.trim()) return dayReservations;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return dayReservations.filter(reservation => {
      const guest = guests.find(g => g.id === reservation.guest_id);
      const room = rooms.find(r => r.id === reservation.room_id);
      
      if (!guest) return false;
      
      const guestFullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
      const guestEmail = guest.email.toLowerCase();
      const roomNumber = room?.number || '';
      const reservationId = reservation.id.toLowerCase();
      
      return (
        guest.first_name.toLowerCase().includes(searchLower) ||
        guest.last_name.toLowerCase().includes(searchLower) ||
        guestFullName.includes(searchLower) ||
        guestEmail.includes(searchLower) ||
        roomNumber.includes(searchLower) ||
        reservationId.includes(searchLower)
      );
    });
  }, [dayReservations, searchTerm, guests, rooms]);

  const checkInsToday = reservations.filter(r => r.check_in === selectedDateStr);
  const checkOutsToday = reservations.filter(r => r.check_out === selectedDateStr);

  return {
    searchTerm,
    setSearchTerm,
    dayReservations,
    filteredReservations,
    checkInsToday,
    checkOutsToday
  };
};
