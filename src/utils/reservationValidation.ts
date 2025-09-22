
import { Reservation } from '@/types/hotel';
import { getTodayInBuenosAires } from '@/utils/dateUtils';

export const hasDateOverlap = (
  roomId: string, 
  checkIn: string, 
  checkOut: string,
  reservations: Reservation[],
  currentReservationId?: string
) => {
  if (!checkIn || !checkOut || !roomId) return false;
  
  console.log('Checking overlap for room:', roomId, 'dates:', checkIn, 'to', checkOut);
  
  return reservations.some(existingReservation => {
    // Skip cancelled reservations
    if (existingReservation.status === 'cancelled') return false;
    
    // Skip the current reservation being edited
    if (currentReservationId && existingReservation.id === currentReservationId) return false;
    
    // Only check same room
    if (existingReservation.room_id !== roomId) return false;
    
    const existingCheckIn = existingReservation.check_in;
    const existingCheckOut = existingReservation.check_out;
    
    // Check for overlap: new reservation overlaps with existing if:
    // - new check-in is before existing check-out AND
    // - new check-out is after existing check-in
    const overlap = checkIn < existingCheckOut && checkOut > existingCheckIn;
    
    console.log('Comparing with existing reservation:', existingReservation.id, 
      'dates:', existingCheckIn, 'to', existingCheckOut, 'overlap:', overlap);
    
    return overlap;
  });
};

export const validateReservationDates = (checkIn: string, checkOut: string, today?: string) => {
  if (!checkIn || !checkOut) return true;
  
  const todayDate = today || getTodayInBuenosAires();
  
  // Validate that check-in is not before today (allow same day)
  if (checkIn < todayDate) return false;
  
  return checkOut > checkIn;
};
