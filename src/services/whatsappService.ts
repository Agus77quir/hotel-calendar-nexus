
import { Reservation, Guest, Room } from '@/types/hotel';

export const sendReservationConfirmation = async (
  reservation: Reservation,
  guest: Guest,
  room: Room
) => {
  try {
    const message = `¡Hola ${guest.first_name}! Tu reserva ha sido confirmada:
    
Confirmación: ${reservation.confirmation_number}
Habitación: ${room.number}
Check-in: ${reservation.check_in}
Check-out: ${reservation.check_out}
Total: $${reservation.total_amount}

¡Te esperamos!`;

    // En un entorno real, aquí se enviaría el mensaje de WhatsApp
    console.log('Enviando WhatsApp a:', guest.phone);
    console.log('Mensaje:', message);
    
    return { success: true, message: 'WhatsApp enviado correctamente' };
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return { success: false, error: 'Error al enviar WhatsApp' };
  }
};

export const sendCheckInReminder = async (
  reservation: Reservation,
  guest: Guest,
  room: Room
) => {
  try {
    const message = `¡Hola ${guest.first_name}! Tu check-in es hoy:
    
Confirmación: ${reservation.confirmation_number}
Habitación: ${room.number}
Hora sugerida: 15:00

¡Te esperamos!`;

    console.log('Enviando recordatorio WhatsApp a:', guest.phone);
    console.log('Mensaje:', message);
    
    return { success: true, message: 'Recordatorio enviado correctamente' };
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    return { success: false, error: 'Error al enviar recordatorio' };
  }
};
