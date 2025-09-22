
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
    
    // Only check same room - CRITICAL FIX: ensure room IDs match exactly
    if (existingReservation.room_id !== roomId) return false;
    
    const existingCheckIn = existingReservation.check_in;
    const existingCheckOut = existingReservation.check_out;
    
    // ENHANCED overlap check: new reservation overlaps with existing if dates intersect
    // Case 1: New reservation starts during existing reservation
    // Case 2: New reservation ends during existing reservation  
    // Case 3: New reservation completely contains existing reservation
    // Case 4: Existing reservation completely contains new reservation
    const overlap = (
      (checkIn >= existingCheckIn && checkIn < existingCheckOut) ||  // New starts during existing
      (checkOut > existingCheckIn && checkOut <= existingCheckOut) || // New ends during existing
      (checkIn <= existingCheckIn && checkOut >= existingCheckOut) || // New contains existing
      (existingCheckIn <= checkIn && existingCheckOut >= checkOut)    // Existing contains new
    );
    
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
