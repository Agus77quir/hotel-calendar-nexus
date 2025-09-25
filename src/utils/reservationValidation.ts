
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
  
  // VALIDACIÓN ALINEADA CON BACKEND (intervalos mitad-abiertos [check_in, check_out))
  // Se considera solapado SOLO cuando los rangos se intersectan estrictamente.
  // Las fechas adyacentes (nuevo.check_in === existente.check_out o nuevo.check_out === existente.check_in) son válidas y NO solapan.
  return reservations.some(existingReservation => {
    // Ignorar reservas canceladas
    if (existingReservation.status === 'cancelled') return false;
    
    // Ignorar la reserva actual si estamos editando
    if (currentReservationId && existingReservation.id === currentReservationId) return false;
    
    // Comparar solo misma habitación
    if (existingReservation.room_id !== roomId) return false;
    
    const existingCheckIn = existingReservation.check_in;
    const existingCheckOut = existingReservation.check_out;

    const noOverlap = (checkOut <= existingCheckIn) || (checkIn >= existingCheckOut);
    const overlap = !noOverlap;

    console.log('Comparando contra reserva:', existingReservation.id,
      'existente:', existingCheckIn, 'a', existingCheckOut,
      'nuevo:', checkIn, 'a', checkOut,
      'solapa:', overlap);

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
